const bcrypt = require('bcryptjs');
const { pool } = require('../database/conexao');
const { gerarCodigoUsuario } = require('../utils/validacoes');

const TABELAS_TIPO = {
  discente: 'discente',
  docente: 'docente',
  servidor: 'servidor',
  administrador: 'administrador',
};

async function buscarPorEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, nome, email, senha, telefone, tipo_usuario FROM usuario WHERE email = ?',
    [email.trim()]
  );
  return rows[0] || null;
}

async function buscarPorMatricula(tipoUsuario, matricula) {
  const tabela = TABELAS_TIPO[tipoUsuario];
  if (!tabela) return null;

  const [rows] = await pool.query(`SELECT id_usuario FROM ${tabela} WHERE matricula = ?`, [
    matricula.trim(),
  ]);
  return rows[0] || null;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    'SELECT id, nome, email, telefone, tipo_usuario FROM usuario WHERE id = ?',
    [id]
  );

  const usuario = rows[0];
  if (!usuario) return null;

  const detalhes = await buscarDetalhesTipo(usuario.id, usuario.tipo_usuario);
  return {
    ...usuario,
    codigo_usuario: gerarCodigoUsuario(usuario.tipo_usuario, usuario.id),
    detalhes,
  };
}

async function buscarDetalhesTipo(idUsuario, tipoUsuario) {
  const tabela = TABELAS_TIPO[tipoUsuario];
  if (!tabela) return null;

  const [rows] = await pool.query(`SELECT * FROM ${tabela} WHERE id_usuario = ?`, [idUsuario]);
  return rows[0] || null;
}

async function criar(dados) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const senhaHash = await bcrypt.hash(dados.senha, 10);

    const [resultadoUsuario] = await conexao.query(
      'INSERT INTO usuario (nome, email, senha, telefone, tipo_usuario) VALUES (?, ?, ?, ?, ?)',
      [dados.nome, dados.email, senhaHash, dados.telefone || null, dados.tipo_usuario]
    );

    const idUsuario = resultadoUsuario.insertId;

    await inserirDetalhesTipo(conexao, idUsuario, dados);

    await conexao.commit();

    return buscarPorId(idUsuario);
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function inserirDetalhesTipo(conexao, idUsuario, dados) {
  switch (dados.tipo_usuario) {
    case 'discente':
      await conexao.query(
        'INSERT INTO discente (id_usuario, matricula) VALUES (?, ?)',
        [idUsuario, dados.matricula]
      );
      break;
    case 'docente':
      await conexao.query(
        'INSERT INTO docente (id_usuario, matricula, turma, materias) VALUES (?, ?, ?, ?)',
        [idUsuario, dados.matricula, dados.turma || null, dados.materias || null]
      );
      break;
    case 'servidor':
      await conexao.query(
        'INSERT INTO servidor (id_usuario, matricula) VALUES (?, ?)',
        [idUsuario, dados.matricula]
      );
      break;
    case 'administrador':
      await conexao.query(
        'INSERT INTO administrador (id_usuario, matricula, funcao) VALUES (?, ?, ?)',
        [idUsuario, dados.matricula, dados.funcao || null]
      );
      break;
    default:
      throw new Error('Tipo de usuário inválido.');
  }
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];

  if (dados.nome !== undefined) {
    campos.push('nome = ?');
    valores.push(dados.nome);
  }
  if (dados.email !== undefined) {
    campos.push('email = ?');
    valores.push(dados.email);
  }
  if (dados.telefone !== undefined) {
    campos.push('telefone = ?');
    valores.push(dados.telefone);
  }
  if (dados.senha !== undefined) {
    campos.push('senha = ?');
    valores.push(await bcrypt.hash(dados.senha, 10));
  }

  if (campos.length === 0) {
    return buscarPorId(id);
  }

  valores.push(id);
  await pool.query(`UPDATE usuario SET ${campos.join(', ')} WHERE id = ?`, valores);

  return buscarPorId(id);
}

async function compararSenha(senhaInformada, senhaHash) {
  return bcrypt.compare(senhaInformada, senhaHash);
}

module.exports = {
  buscarPorEmail,
  buscarPorMatricula,
  buscarPorId,
  criar,
  atualizar,
  compararSenha,
};
