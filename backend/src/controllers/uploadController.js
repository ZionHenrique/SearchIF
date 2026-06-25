const path = require('path');
const Tag = require('../models/Tag');
const { criarErroHttp } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function enviarImagem(req, res) {
  if (!req.file) {
    throw criarErroHttp(400, 'Nenhuma imagem enviada.');
  }

  const url = `/uploads/${req.file.filename}`;

  return respostaSucesso(res, 201, {
    mensagem: 'Imagem enviada com sucesso.',
    url,
    caminho: path.join('uploads', req.file.filename),
  });
}

async function listarTags(_req, res) {
  const tags = await Tag.listar();
  return respostaSucesso(res, 200, tags);
}

module.exports = { enviarImagem, listarTags };
