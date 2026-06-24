const express = require('express');
const path = require('path');
const upload = require('../middlewares/upload');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

router.post('/imagem', verificarToken, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhuma imagem enviada.' });
  }

  const url = `/uploads/${req.file.filename}`;

  return res.status(201).json({
    mensagem: 'Imagem enviada com sucesso.',
    url,
    caminho: path.join('uploads', req.file.filename),
  });
});

module.exports = router;
