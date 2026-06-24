const express = require('express');
const Notificacao = require('../models/Notificacao');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

router.get('/', verificarToken, async (req, res) => {
  try {
    const apenasNaoVisualizadas = req.query.nao_visualizadas === 'true';
    const notificacoes = await Notificacao.listarPorUsuario(
      req.usuario.id,
      apenasNaoVisualizadas
    );
    return res.json(notificacoes);
  } catch (erro) {
    console.error('Erro ao listar notificações:', erro);
    return res.status(500).json({ erro: 'Erro interno ao listar notificações.' });
  }
});

router.put('/visualizar-todas', verificarToken, async (req, res) => {
  try {
    const quantidade = await Notificacao.marcarTodasComoVisualizadas(req.usuario.id);
    return res.json({
      mensagem: 'Notificações marcadas como visualizadas.',
      quantidade,
    });
  } catch (erro) {
    console.error('Erro ao marcar notificações:', erro);
    return res.status(500).json({ erro: 'Erro interno ao marcar notificações.' });
  }
});

router.put('/:id/visualizar', verificarToken, async (req, res) => {
  try {
    const notificacao = await Notificacao.buscarPorId(req.params.id);
    if (!notificacao) {
      return res.status(404).json({ erro: 'Notificação não encontrada.' });
    }

    if (notificacao.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Notificação não pertence a este usuário.' });
    }

    await Notificacao.marcarComoVisualizada(req.params.id, req.usuario.id);
    return res.json({ mensagem: 'Notificação marcada como visualizada.' });
  } catch (erro) {
    console.error('Erro ao marcar notificação:', erro);
    return res.status(500).json({ erro: 'Erro interno ao marcar notificação.' });
  }
});

module.exports = router;
