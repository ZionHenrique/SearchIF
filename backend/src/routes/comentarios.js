const express = require('express');
const comentarioController = require('../controllers/comentarioController');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.delete('/:id', verificarToken, asyncHandler(comentarioController.excluir));

module.exports = router;
