const express = require('express');
const Comentario = require('../models/Comentario');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

router.delete('/:id', verificarToken, async (req, res) => {
  try {
    const comentario = await Comentario.buscarPorId(req.params.id);
    if (!comentario) {
      return res.status(404).json({ erro: 'Comentário não encontrado.' });
    }

    if (comentario.id_usuario !== req.usuario.id) {
      return res.status(403).json({ erro: 'Você só pode excluir seus próprios comentários.' });
    }

    await Comentario.excluir(req.params.id);
    return res.json({ mensagem: 'Comentário excluído com sucesso.' });
  } catch (erro) {
    console.error('Erro ao excluir comentário:', erro);
    return res.status(500).json({ erro: 'Erro interno ao excluir comentário.' });
  }
});

module.exports = router;
