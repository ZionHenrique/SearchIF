const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const regras = require('../utils/regrasNegocio');
const { criarErroHttp } = require('../utils/validacoes');
const { respostaSucesso } = require('../utils/respostas');

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, tipo_usuario: usuario.tipo_usuario },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function cadastrar(req, res) {
  await regras.validarCadastroUsuario(req.body);

  const usuario = await Usuario.criar({
    nome: req.body.nome.trim(),
    email: req.body.email.trim(),
    senha: req.body.senha,
    telefone: req.body.telefone || null,
    tipo_usuario: req.body.tipo_usuario,
    matricula: req.body.matricula.trim(),
    turma: req.body.turma,
    materias: req.body.materias,
    funcao: req.body.funcao,
  });

  const token = gerarToken(usuario);

  return respostaSucesso(res, 201, {
    mensagem: 'Usuário cadastrado com sucesso.',
    usuario,
    token,
  });
}

async function login(req, res) {
  await regras.validarLogin(req.body);

  const usuario = await Usuario.buscarPorEmail(req.body.email);
  if (!usuario) {
    throw criarErroHttp(401, 'Credenciais inválidas.');
  }

  const senhaValida = await Usuario.compararSenha(req.body.senha, usuario.senha);
  if (!senhaValida) {
    throw criarErroHttp(401, 'Credenciais inválidas.');
  }

  const perfil = await Usuario.buscarPorId(usuario.id);
  const token = gerarToken(perfil);

  return respostaSucesso(res, 200, {
    mensagem: 'Login realizado com sucesso.',
    usuario: perfil,
    token,
  });
}

async function obterPerfil(req, res) {
  const usuario = await Usuario.buscarPorId(req.usuario.id);
  if (!usuario) {
    throw criarErroHttp(404, 'Usuário não encontrado.');
  }
  return respostaSucesso(res, 200, usuario);
}

async function atualizarPerfil(req, res) {
  await regras.validarAtualizacaoPerfil(req.usuario.id, req.body);

  const dados = {};
  if (req.body.nome !== undefined) dados.nome = req.body.nome.trim();
  if (req.body.email !== undefined) dados.email = req.body.email.trim();
  if (req.body.telefone !== undefined) dados.telefone = req.body.telefone;
  if (req.body.senha !== undefined) dados.senha = req.body.senha;

  const usuario = await Usuario.atualizar(req.usuario.id, dados);

  return respostaSucesso(res, 200, {
    mensagem: 'Perfil atualizado com sucesso.',
    usuario,
  });
}

module.exports = { cadastrar, login, obterPerfil, atualizarPerfil };
