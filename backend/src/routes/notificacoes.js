const express = require('express');
const notificacaoController = require('../controllers/notificacaoController');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', verificarToken, asyncHandler(notificacaoController.listar));
router.put(
  '/visualizar-todas',
  verificarToken,
  asyncHandler(notificacaoController.marcarTodasVisualizadas)
);
router.put(
  '/:id/visualizar',
  verificarToken,
  asyncHandler(notificacaoController.marcarVisualizada)
);

module.exports = router;
