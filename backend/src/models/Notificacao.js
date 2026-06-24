const { pool } = require('../database/conexao');

async function listarPorUsuario(idUsuario, apenasNaoVisualizadas = false) {
  let sql = `SELECT id, mensagem, visualizada, data_notificacao, id_usuario
             FROM notificacao WHERE id_usuario = ?`;
  const valores = [idUsuario];

  if (apenasNaoVisualizadas) {
    sql += ' AND visualizada = FALSE';
  }

  sql += ' ORDER BY data_notificacao DESC';

  const [rows] = await pool.query(sql, valores);
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    'SELECT id, mensagem, visualizada, data_notificacao, id_usuario FROM notificacao WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    'INSERT INTO notificacao (mensagem, id_usuario) VALUES (?, ?)',
    [dados.mensagem, dados.id_usuario]
  );
  return buscarPorId(resultado.insertId);
}

async function marcarComoVisualizada(id, idUsuario) {
  const [resultado] = await pool.query(
    'UPDATE notificacao SET visualizada = TRUE WHERE id = ? AND id_usuario = ?',
    [id, idUsuario]
  );
  return resultado.affectedRows > 0;
}

async function marcarTodasComoVisualizadas(idUsuario) {
  const [resultado] = await pool.query(
    'UPDATE notificacao SET visualizada = TRUE WHERE id_usuario = ? AND visualizada = FALSE',
    [idUsuario]
  );
  return resultado.affectedRows;
}

module.exports = {
  listarPorUsuario,
  buscarPorId,
  criar,
  marcarComoVisualizada,
  marcarTodasComoVisualizadas,
};
