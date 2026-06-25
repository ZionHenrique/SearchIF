const { pool } = require('../database/conexao');

async function listar() {
  const [rows] = await pool.query('SELECT id, nome FROM categoria ORDER BY nome ASC');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query('SELECT id, nome FROM categoria WHERE id = ?', [id]);
  return rows[0] || null;
}

async function buscarPorNome(nome) {
  const [rows] = await pool.query('SELECT id, nome FROM categoria WHERE nome = ?', [nome.trim()]);
  return rows[0] || null;
}

async function criar(nome) {
  const [resultado] = await pool.query('INSERT INTO categoria (nome) VALUES (?)', [nome.trim()]);
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, nome) {
  await pool.query('UPDATE categoria SET nome = ? WHERE id = ?', [nome.trim(), id]);
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM categoria WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = { listar, buscarPorId, buscarPorNome, criar, atualizar, excluir };
