const express = require('express');
const itemController = require('../controllers/itemController');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(itemController.listar));
router.get('/:id', asyncHandler(itemController.buscarPorId));
router.post('/', verificarToken, asyncHandler(itemController.criar));
router.put('/:id', verificarToken, asyncHandler(itemController.atualizar));
router.delete('/:id', verificarToken, asyncHandler(itemController.excluir));

module.exports = router;
