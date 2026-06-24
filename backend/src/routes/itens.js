const express = require('express');
const Item = require('../models/Item');
const Notificacao = require('../models/Notificacao');
const verificarToken = require('../middlewares/verificarToken');

const STATUS_ENCONTRADO = ['encontrado', 'recuperado'];

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const filtros = {
      categoria: req.query.categoria,
      nome: req.query.nome,
      status: req.query.status,
      id_usuario: req.query.id_usuario,
      data_inicio: req.query.data_inicio,
      data_fim: req.query.data_fim,
    };

    const itens = await Item.listar(filtros);
    return res.json(itens);
  } catch (erro) {
    console.error('Erro ao listar itens:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar itens.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const item = await Item.buscarPorId(req.params.id);
    if (!item) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }
    return res.json(item);
  } catch (erro) {
    console.error('Erro ao buscar item:', erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar item.' });
  }
});

router.post('/', verificarToken, async (req, res) => {
  try {
    const { nome, descricao, local_encontrado, data_perda, imagem, id_categoria } = req.body;

    if (!nome) {
      return res.status(400).json({ erro: 'O nome do item é obrigatório.' });
    }

    const item = await Item.criar({
      nome,
      descricao,
      local_encontrado,
      data_perda,
      imagem,
      id_categoria,
      id_usuario: req.usuario.id,
    });

    return res.status(201).json({ mensagem: 'Item cadastrado com sucesso.', item });
  } catch (erro) {
    console.error('Erro ao criar item:', erro);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar item.' });
  }
});

router.put('/:id', verificarToken, async (req, res) => {
  try {
    const itemExistente = await Item.buscarPorId(req.params.id);
    if (!itemExistente) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }

    if (itemExistente.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode editar itens que você publicou.' });
    }

    const item = await Item.atualizar(req.params.id, req.body);

    if (
      req.body.status_item &&
      STATUS_ENCONTRADO.includes(req.body.status_item) &&
      !STATUS_ENCONTRADO.includes(itemExistente.status_item)
    ) {
      await Notificacao.criar({
        mensagem: `Seu item "${item.nome}" foi marcado como ${req.body.status_item}.`,
        id_usuario: itemExistente.id_usuario,
      });
    }

    return res.json({ mensagem: 'Item atualizado com sucesso.', item });
  } catch (erro) {
    console.error('Erro ao atualizar item:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar item.' });
  }
});

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const itemExistente = await Item.buscarPorId(req.params.id);
    if (!itemExistente) {
      return res.status(404).json({ erro: 'Item não encontrado.' });
    }

    if (itemExistente.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode excluir itens que você publicou.' });
    }

    await Item.excluir(req.params.id);
    return res.json({ mensagem: 'Item excluído com sucesso.' });
  } catch (erro) {
    console.error('Erro ao excluir item:', erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir item.' });
  }
});

module.exports = router;
