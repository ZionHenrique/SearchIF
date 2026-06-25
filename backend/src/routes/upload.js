const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../middlewares/upload');
const verificarToken = require('../middlewares/verificarToken');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.post(
  '/imagem',
  verificarToken,
  upload.single('imagem'),
  asyncHandler(uploadController.enviarImagem)
);

module.exports = router;
