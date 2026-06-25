const express = require('express');
const categoriaController = require('../controllers/categoriaController');
const verificarToken = require('../middlewares/verificarToken');
const verificarAdmin = require('../middlewares/verificarAdmin');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(categoriaController.listar));
router.get('/:id', asyncHandler(categoriaController.buscarPorId));
router.post('/', verificarToken, verificarAdmin, asyncHandler(categoriaController.criar));
router.put('/:id', verificarToken, verificarAdmin, asyncHandler(categoriaController.atualizar));
router.delete('/:id', verificarToken, verificarAdmin, asyncHandler(categoriaController.excluir));

module.exports = router;
