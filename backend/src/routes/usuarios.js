const express = require('express');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { validarSenha, validarEmail, TIPOS_USUARIO } = require('../utils/validacoes');
const verificarToken = require('../middlewares/verificarToken');

const router = express.Router();

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, tipo_usuario: usuario.tipo_usuario },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/cadastro', async (req, res) => {
  try {
    const { nome, email, senha, telefone, tipo_usuario, matricula, turma, materias, funcao } =
      req.body;

    if (!nome || !email || !senha || !tipo_usuario || !matricula) {
      return res.status(400).json({
        erro: 'Campos obrigatórios: nome, email, senha, tipo_usuario e matrícula.',
      });
    }

    if (!TIPOS_USUARIO.includes(tipo_usuario)) {
      return res.status(400).json({
        erro: `tipo_usuario deve ser um dos seguintes: ${TIPOS_USUARIO.join(', ')}.`,
      });
    }

    if (!validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }

    const erroSenha = validarSenha(senha);
    if (erroSenha) {
      return res.status(400).json({ erro: erroSenha });
    }

    if (tipo_usuario === 'docente' && !turma) {
      return res.status(400).json({ erro: 'Docentes devem informar a turma.' });
    }

    const emailExistente = await Usuario.buscarPorEmail(email);
    if (emailExistente) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }

    const usuario = await Usuario.criar({
      nome,
      email,
      senha,
      telefone,
      tipo_usuario,
      matricula,
      turma,
      materias,
      funcao,
    });

    const token = gerarToken(usuario);

    return res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso.', usuario, token });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'E-mail ou matrícula já cadastrados.' });
    }
    console.error('Erro no cadastro:', erro);
    return res.status(500).json({ erro: 'Erro interno ao cadastrar usuário.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
    }

    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await Usuario.compararSenha(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const perfil = await Usuario.buscarPorId(usuario.id);
    const token = gerarToken(perfil);

    return res.json({ mensagem: 'Login realizado com sucesso.', usuario: perfil, token });
  } catch (erro) {
    console.error('Erro no login:', erro);
    return res.status(500).json({ erro: 'Erro interno ao realizar login.' });
  }
});

router.get('/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }
    return res.json(usuario);
  } catch (erro) {
    console.error('Erro ao buscar perfil:', erro);
    return res.status(500).json({ erro: 'Erro interno ao buscar perfil.' });
  }
});

router.put('/perfil', verificarToken, async (req, res) => {
  try {
    const { nome, email, senha, telefone } = req.body;

    if (email && !validarEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido.' });
    }

    if (senha) {
      const erroSenha = validarSenha(senha);
      if (erroSenha) {
        return res.status(400).json({ erro: erroSenha });
      }
    }

    if (email) {
      const emailExistente = await Usuario.buscarPorEmail(email);
      if (emailExistente && emailExistente.id !== req.usuario.id) {
        return res.status(409).json({ erro: 'E-mail já cadastrado por outro usuário.' });
      }
    }

    const usuario = await Usuario.atualizar(req.usuario.id, { nome, email, senha, telefone });

    return res.json({ mensagem: 'Perfil atualizado com sucesso.', usuario });
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }
    console.error('Erro ao atualizar perfil:', erro);
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
});

module.exports = router;
