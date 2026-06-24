const express = require('express');
const Categoria = require('../models/Categoria');
const verificarToken = require('../middlewares/verificarToken');
const verificarAdmin = require('../middlewares/verificarAdmin');

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const categorias = await Categoria.listar();
    return res.json(categorias);
  } catch (erro) {
    console.error('Erro ao listar categorias:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar categorias.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const categoria = await Categoria.buscarPorId(req.params.id);
    if (!categoria) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }
    return res.json(categoria);
  } catch (erro) {
    console.error('Erro ao buscar categoria:', erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar categoria.' });
  }
});

router.post('/', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    }

    const categoria = await Categoria.criar(nome);
    return res.status(201).json({ mensagem: 'Categoria criada com sucesso.', categoria });
  } catch (erro) {
    console.error('Erro ao criar categoria:', erro);
    return res.status(500).json({ erro: 'Erro interno ao criar categoria.' });
  }
});

router.put('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const categoriaExistente = await Categoria.buscarPorId(req.params.id);
    if (!categoriaExistente) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    const { nome } = req.body;
    if (!nome) {
      return res.status(400).json({ erro: 'O nome da categoria é obrigatório.' });
    }

    const categoria = await Categoria.atualizar(req.params.id, nome);
    return res.json({ mensagem: 'Categoria atualizada com sucesso.', categoria });
  } catch (erro) {
    console.error('Erro ao atualizar categoria:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar categoria.' });
  }
});

router.delete('/:id', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const categoriaExistente = await Categoria.buscarPorId(req.params.id);
    if (!categoriaExistente) {
      return res.status(404).json({ erro: 'Categoria não encontrada.' });
    }

    await Categoria.excluir(req.params.id);
    return res.json({ mensagem: 'Categoria excluída com sucesso.' });
  } catch (erro) {
    if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ erro: 'Categoria em uso por itens e não pode ser excluída.' });
    }
    console.error('Erro ao excluir categoria:', erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir categoria.' });
  }
});

module.exports = router;
