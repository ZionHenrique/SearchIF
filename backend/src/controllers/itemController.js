const Item = require('../models/Item');
const Notificacao = require('../models/Notificacao');
const regras = require('../utils/regrasNegocio');
const { STATUS_ENCONTRADO, criarErroHttp, validarIdNumerico } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function listar(req, res) {
  const filtros = {
    categoria: req.query.categoria,
    nome: req.query.nome,
    status: req.query.status,
    id_usuario: req.query.id_usuario,
    data_inicio: req.query.data_inicio,
    data_fim: req.query.data_fim,
  };

  const itens = await Item.listar(filtros);
  return respostaSucesso(res, 200, itens);
}

async function buscarPorId(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const item = await Item.buscarPorId(req.params.id);
  if (!item) throw criarErroHttp(404, 'Item não encontrado.');

  return respostaSucesso(res, 200, item);
}

async function criar(req, res) {
  await regras.validarCriacaoItem(req.body);

  const item = await Item.criar({
    ...req.body,
    id_usuario: req.usuario.id,
  });

  return respostaSucesso(res, 201, {
    mensagem: 'Item cadastrado com sucesso.',
    item,
  });
}

async function atualizar(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const itemExistente = await Item.buscarPorId(req.params.id);
  if (!itemExistente) throw criarErroHttp(404, 'Item não encontrado.');

  regras.verificarProprietario(
    itemExistente,
    req.usuario.id,
    'Você só pode editar itens que você publicou.'
  );

  await regras.validarAtualizacaoItem(req.body);

  const item = await Item.atualizar(req.params.id, req.body);

  if (
    req.body.status_item &&
    STATUS_ENCONTRADO.includes(req.body.status_item) &&
    !STATUS_ENCONTRADO.includes(itemExistente.status_item)
  ) {
    await Notificacao.criar({
      mensagem: `Seu item "${item.nome}" foi marcado como ${req.body.status_item}.`,
      id_usuario: itemExistente.id_usuario,
    });
  }

  return respostaSucesso(res, 200, {
    mensagem: 'Item atualizado com sucesso.',
    item,
  });
}

async function excluir(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const itemExistente = await Item.buscarPorId(req.params.id);
  if (!itemExistente) throw criarErroHttp(404, 'Item não encontrado.');

  regras.verificarProprietario(
    itemExistente,
    req.usuario.id,
    'Você só pode excluir itens que você publicou.'
  );

  await Item.excluir(req.params.id);

  return respostaSucesso(res, 200, { mensagem: 'Item excluído com sucesso.' });
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
