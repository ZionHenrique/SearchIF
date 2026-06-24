const PREFIXOS_TIPO = {
  discente: 'D',
  docente: 'T',
  servidor: 'S',
  administrador: 'A',
};

const TIPOS_USUARIO = Object.keys(PREFIXOS_TIPO);

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
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

function gerarCodigoUsuario(tipoUsuario, id) {
  const prefixo = PREFIXOS_TIPO[tipoUsuario];
  return `${prefixo}-${String(id).padStart(6, '0')}`;
}

module.exports = {
  PREFIXOS_TIPO,
  TIPOS_USUARIO,
  validarSenha,
  validarEmail,
  gerarCodigoUsuario,
};
