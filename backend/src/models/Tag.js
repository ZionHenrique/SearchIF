const { pool } = require('../database/conexao');

async function listar() {
  const [rows] = await pool.query('SELECT id, nome FROM tag ORDER BY nome ASC');
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query('SELECT id, nome FROM tag WHERE id = ?', [id]);
  return rows[0] || null;
}

async function buscarPorItem(idItem) {
  const [rows] = await pool.query(
    `SELECT t.id, t.nome
     FROM tag t
     JOIN item_tag it ON it.id_tag = t.id
     WHERE it.id_item = ?
     ORDER BY t.nome ASC`,
    [idItem]
  );
  return rows;
}

async function vincularAoItem(idItem, idsTags, conexao = pool) {
  await conexao.query('DELETE FROM item_tag WHERE id_item = ?', [idItem]);

  if (!idsTags || idsTags.length === 0) return;

  const valores = idsTags.map((idTag) => [idItem, idTag]);
  await conexao.query('INSERT INTO item_tag (id_item, id_tag) VALUES ?', [valores]);
}

module.exports = { listar, buscarPorId, buscarPorItem, vincularAoItem };
