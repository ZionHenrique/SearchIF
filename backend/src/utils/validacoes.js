const PREFIXOS_TIPO = {
  discente: 'D',
  docente: 'T',
  servidor: 'S',
  administrador: 'A',
};

const TIPOS_USUARIO = Object.keys(PREFIXOS_TIPO);
const TIPOS_FORUM = ['achados', 'pedidos'];
const STATUS_ITEM = ['perdido', 'encontrado', 'recuperado'];
const STATUS_ENCONTRADO = ['encontrado', 'recuperado'];

function validarSenha(senha) {
  if (!senha || senha.length < 8) {
    return 'A senha deve ter pelo menos 8 caracteres.';
  }
  if (!/[a-z]/.test(senha)) {
    return 'A senha deve conter pelo menos uma letra minúscula.';
  }
  if (!/[A-Z]/.test(senha)) {
    return 'A senha deve conter pelo menos uma letra maiúscula.';
  }
  if (!/[0-9]/.test(senha)) {
    return 'A senha deve conter pelo menos um número.';
  }
  if (!/[^a-zA-Z0-9]/.test(senha)) {
    return 'A senha deve conter pelo menos um caractere especial.';
  }
  return null;
}

function validarEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validarIdNumerico(valor, nomeCampo = 'id') {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    return `${nomeCampo} inválido.`;
  }
  return null;
}

function validarData(data, nomeCampo = 'data') {
  if (!data) return null;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) {
    return `${nomeCampo} deve estar no formato AAAA-MM-DD.`;
  }
  const parsed = new Date(`${data}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${nomeCampo} inválida.`;
  }
  return null;
}

function validarPeriodoPerda(inicio, fim) {
  const erroInicio = validarData(inicio, 'data_perda_inicio');
  if (erroInicio) return erroInicio;

  const erroFim = validarData(fim, 'data_perda_fim');
  if (erroFim) return erroFim;

  if (inicio && fim && inicio > fim) {
    return 'data_perda_inicio não pode ser posterior a data_perda_fim.';
  }
  return null;
}

function gerarCodigoUsuario(tipoUsuario, id) {
  const prefixo = PREFIXOS_TIPO[tipoUsuario];
  return `${prefixo}-${String(id).padStart(6, '0')}`;
}

function criarErroHttp(status, message) {
  const erro = new Error(message);
  erro.status = status;
  return erro;
}

module.exports = {
  PREFIXOS_TIPO,
  TIPOS_USUARIO,
  TIPOS_FORUM,
  STATUS_ITEM,
  STATUS_ENCONTRADO,
  validarSenha,
  validarEmail,
  validarIdNumerico,
  validarData,
  validarPeriodoPerda,
  gerarCodigoUsuario,
  criarErroHttp,
};
