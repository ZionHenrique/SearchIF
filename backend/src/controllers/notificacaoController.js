const Notificacao = require('../models/Notificacao');
const { criarErroHttp, validarIdNumerico } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function listar(req, res) {
  const apenasNaoVisualizadas = req.query.nao_visualizadas === 'true';
  const notificacoes = await Notificacao.listarPorUsuario(
    req.usuario.id,
    apenasNaoVisualizadas
  );
  return respostaSucesso(res, 200, notificacoes);
}

async function marcarTodasVisualizadas(req, res) {
  const quantidade = await Notificacao.marcarTodasComoVisualizadas(req.usuario.id);
  return respostaSucesso(res, 200, {
    mensagem: 'Notificações marcadas como visualizadas.',
    quantidade,
  });
}

async function marcarVisualizada(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const notificacao = await Notificacao.buscarPorId(req.params.id);
  if (!notificacao) throw criarErroHttp(404, 'Notificação não encontrada.');

  if (notificacao.id_usuario !== req.usuario.id) {
    throw criarErroHttp(403, 'Notificação não pertence a este usuário.');
  }

  await Notificacao.marcarComoVisualizada(req.params.id, req.usuario.id);

  return respostaSucesso(res, 200, { mensagem: 'Notificação marcada como visualizada.' });
}

module.exports = { listar, marcarTodasVisualizadas, marcarVisualizada };
