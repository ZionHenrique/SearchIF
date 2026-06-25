const Categoria = require('../models/Categoria');
const regras = require('../utils/regrasNegocio');
const { criarErroHttp, validarIdNumerico } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function listar(_req, res) {
  const categorias = await Categoria.listar();
  return respostaSucesso(res, 200, categorias);
}

async function buscarPorId(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const categoria = await Categoria.buscarPorId(req.params.id);
  if (!categoria) throw criarErroHttp(404, 'Categoria não encontrada.');

  return respostaSucesso(res, 200, categoria);
}

async function criar(req, res) {
  await regras.validarNomeCategoria(req.body.nome);

  const existente = await Categoria.buscarPorNome(req.body.nome);
  if (existente) throw criarErroHttp(409, 'Categoria já cadastrada.');

  const categoria = await Categoria.criar(req.body.nome);

  return respostaSucesso(res, 201, {
    mensagem: 'Categoria criada com sucesso.',
    categoria,
  });
}

async function atualizar(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const categoriaExistente = await Categoria.buscarPorId(req.params.id);
  if (!categoriaExistente) throw criarErroHttp(404, 'Categoria não encontrada.');

  await regras.validarNomeCategoria(req.body.nome);

  const duplicada = await Categoria.buscarPorNome(req.body.nome);
  if (duplicada && duplicada.id !== Number(req.params.id)) {
    throw criarErroHttp(409, 'Categoria já cadastrada.');
  }

  const categoria = await Categoria.atualizar(req.params.id, req.body.nome);

  return respostaSucesso(res, 200, {
    mensagem: 'Categoria atualizada com sucesso.',
    categoria,
  });
}

async function excluir(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const categoriaExistente = await Categoria.buscarPorId(req.params.id);
  if (!categoriaExistente) throw criarErroHttp(404, 'Categoria não encontrada.');

  await Categoria.excluir(req.params.id);

  return respostaSucesso(res, 200, { mensagem: 'Categoria excluída com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
