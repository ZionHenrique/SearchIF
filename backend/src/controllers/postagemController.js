const Postagem = require('../models/Postagem');
const Comentario = require('../models/Comentario');
const Tag = require('../models/Tag');
const regras = require('../utils/regrasNegocio');
const { criarErroHttp, validarIdNumerico } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function listar(req, res) {
  const filtros = {
    tipo_forum: req.query.tipo_forum,
    categoria: req.query.categoria,
    data_inicio: req.query.data_inicio,
    data_fim: req.query.data_fim,
    id_usuario: req.query.id_usuario,
  };

  const postagens = await Postagem.listar(filtros);
  return respostaSucesso(res, 200, postagens);
}

async function buscarPorId(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const postagem = await Postagem.buscarPorId(req.params.id);
  if (!postagem) throw criarErroHttp(404, 'Postagem não encontrada.');

  const [comentarios, tags] = await Promise.all([
    Comentario.listarPorPostagem(req.params.id),
    Tag.buscarPorItem(postagem.id_item),
  ]);

  return respostaSucesso(res, 200, { ...postagem, comentarios, tags });
}

async function criar(req, res) {
  await regras.validarCriacaoPostagem(req.body, req.usuario.id);

  const postagem = await Postagem.criar({
    titulo: req.body.titulo,
    tipo_forum: req.body.tipo_forum,
    id_item: req.body.id_item,
    id_usuario: req.usuario.id,
  });

  return respostaSucesso(res, 201, {
    mensagem: 'Postagem criada com sucesso.',
    postagem,
  });
}

async function atualizar(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const postagemExistente = await Postagem.buscarPorId(req.params.id);
  if (!postagemExistente) throw criarErroHttp(404, 'Postagem não encontrada.');

  await regras.validarAtualizacaoPostagem(req.body, postagemExistente, req.usuario.id);

  const postagem = await Postagem.atualizar(req.params.id, req.body);

  return respostaSucesso(res, 200, {
    mensagem: 'Postagem atualizada com sucesso.',
    postagem,
  });
}

async function excluir(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const postagemExistente = await Postagem.buscarPorId(req.params.id);
  if (!postagemExistente) throw criarErroHttp(404, 'Postagem não encontrada.');

  regras.verificarProprietario(
    postagemExistente,
    req.usuario.id,
    'Você só pode excluir suas próprias postagens.'
  );

  await Postagem.excluir(req.params.id);

  return respostaSucesso(res, 200, { mensagem: 'Postagem excluída com sucesso.' });
}

async function listarComentarios(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const postagem = await Postagem.buscarPorId(req.params.id);
  if (!postagem) throw criarErroHttp(404, 'Postagem não encontrada.');

  const comentarios = await Comentario.listarPorPostagem(req.params.id);
  return respostaSucesso(res, 200, comentarios);
}

async function criarComentario(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const postagem = await Postagem.buscarPorId(req.params.id);
  if (!postagem) throw criarErroHttp(404, 'Postagem não encontrada.');

  await regras.validarComentario(req.body.texto);

  const comentario = await Comentario.criar({
    texto: req.body.texto.trim(),
    id_usuario: req.usuario.id,
    id_postagem: req.params.id,
  });

  return respostaSucesso(res, 201, {
    mensagem: 'Comentário adicionado com sucesso.',
    comentario,
  });
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
  listarComentarios,
  criarComentario,
};
