const express = require('express');
const Postagem = require('../models/Postagem');
const Comentario = require('../models/Comentario');
const Item = require('../models/Item');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();
const TIPOS_FORUM = ['achados', 'pedidos'];

router.get('/', async (req, res) => {
  try {
    const filtros = {
      tipo_forum: req.query.tipo_forum,
      categoria: req.query.categoria,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
      id_usuario: req.query.id_usuario,
    };

    const postagens = await Postagem.listar(filtros);
    return res.json(postagens);
  } catch (erro) {
    console.error('Erro ao listar postagens:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar postagens.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const postagem = await Postagem.buscarPorId(req.params.id);
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    const comentarios = await Comentario.listarPorPostagem(req.params.id);

    return res.json({
      ...postagem,
      comentarios,
    });
  } catch (erro) {
    console.error('Erro ao buscar postagem:', erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar postagem.' });
  }
});

router.post('/', verificarToken, async (req, res) => {
  try {
    const { titulo, tipo_forum, id_item } = req.body;

    if (!titulo || !tipo_forum || !id_item) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: titulo, tipo_forum e id_item.',
      });
    }

    if (!TIPOS_FORUM.includes(tipo_forum)) {
      return res.status(400).json({
        erro: `tipo_forum deve ser: ${TIPOS_FORUM.join(' ou ')}.`,
      });
    }

    const item = await Item.buscarPorId(id_item);
    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }

    if (item.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode publicar itens que você cadastrou.' });
    }

    const postagem = await Postagem.criar({
      titulo,
      tipo_forum,
      id_item,
      id_usuario: req.usuario.id,
    });

    return res.status(201).json({ mensagem: 'Postagem criada com sucesso.', postagem });
  } catch (erro) {
    console.error('Erro ao criar postagem:', erro);
    return res.status(500).json({ erro: 'Erro interno ao criar postagem.' });
  }
});

router.put('/:id', verificarToken, async (req, res) => {
  try {
    const postagemExistente = await Postagem.buscarPorId(req.params.id);
    if (!postagemExistente) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    if (postagemExistente.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode editar suas próprias postagens.' });
    }

    if (req.body.tipo_forum && !TIPOS_FORUM.includes(req.body.tipo_forum)) {
      return res.status(400).json({
        erro: `tipo_forum deve ser: ${TIPOS_FORUM.join(' ou ')}.`,
      });
    }

    const postagem = await Postagem.atualizar(req.params.id, req.body);
    return res.json({ mensagem: 'Postagem atualizada com sucesso.', postagem });
  } catch (erro) {
    console.error('Erro ao atualizar postagem:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar postagem.' });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const postagemExistente = await Postagem.buscarPorId(req.params.id);
    if (!postagemExistente) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    if (postagemExistente.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode excluir suas próprias postagens.' });
    }

    await Postagem.excluir(req.params.id);
    return res.json({ mensagem: 'Postagem excluída com sucesso.' });
  } catch (erro) {
    console.error('Erro ao excluir postagem:', erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir postagem.' });
  }
});

router.get('/:id/comentarios', async (req, res) => {
  try {
    const postagem = await Postagem.buscarPorId(req.params.id);
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    const comentarios = await Comentario.listarPorPostagem(req.params.id);
    return res.json(comentarios);
  } catch (erro) {
    console.error('Erro ao listar comentários:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar comentários.' });
  }
});

router.post('/:id/comentarios', verificarToken, async (req, res) => {
  try {
    const postagem = await Postagem.buscarPorId(req.params.id);
    if (!postagem) {
      return res.status(404).json({ erro: 'Postagem não encontrada.' });
    }

    const { texto } = req.body;
    if (!texto) {
      return res.status(400).json({ erro: 'O texto do comentário é obrigatório.' });
    }

    const comentario = await Comentario.criar({
      texto,
      id_usuario: req.usuario.id,
      id_postagem: req.params.id,
    });

    return res.status(201).json({ mensagem: 'Comentário adicionado com sucesso.', comentario });
  } catch (erro) {
    console.error('Erro ao criar comentário:', erro);
    return res.status(500).json({ erro: 'Erro interno ao criar comentário.' });
  }
});

module.exports = router;
