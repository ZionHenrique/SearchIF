const Comentario = require('../models/Comentario');
const regras = require('../utils/regrasNegocio');
const { criarErroHttp, validarIdNumerico } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

async function excluir(req, res) {
  const erroId = validarIdNumerico(req.params.id, 'id');
  if (erroId) throw criarErroHttp(400, erroId);

  const comentario = await Comentario.buscarPorId(req.params.id);
  if (!comentario) throw criarErroHttp(404, 'Comentário não encontrado.');

  regras.verificarProprietario(
    comentario,
    req.usuario.id,
    'Você só pode excluir seus próprios comentários.'
  );

  await Comentario.excluir(req.params.id);

  return respostaSucesso(res, 200, { mensagem: 'Comentário excluído com sucesso.' });
}

module.exports = { excluir };
