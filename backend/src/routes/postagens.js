const express = require('express');
const postagemController = require('../controllers/postagemController');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(postagemController.listar));
router.get('/:id/comentarios', asyncHandler(postagemController.listarComentarios));
router.post('/:id/comentarios', verificarToken, asyncHandler(postagemController.criarComentario));
router.get('/:id', asyncHandler(postagemController.buscarPorId));
router.post('/', verificarToken, asyncHandler(postagemController.criar));
router.put('/:id', verificarToken, asyncHandler(postagemController.atualizar));
router.delete('/:id', verificarToken, asyncHandler(postagemController.excluir));

module.exports = router;
