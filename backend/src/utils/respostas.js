function respostaErro(res, status, mensagem) {
  return res.status(status).json({ erro: mensagem });
}

function respostaSucesso(res, status, dados) {
  return res.status(status).json(dados);
}

module.exports = { respostaErro, respostaSucesso };
