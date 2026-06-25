const express = require('express');
const usuarioController = require('../controllers/usuarioController');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/cadastro', asyncHandler(usuarioController.cadastrar));
router.post('/login', asyncHandler(usuarioController.login));
router.get('/perfil', verificarToken, asyncHandler(usuarioController.obterPerfil));
router.put('/perfil', verificarToken, asyncHandler(usuarioController.atualizarPerfil));

module.exports = router;
