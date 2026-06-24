const { pool } = require('../database/conexao');

const COLUNAS = `
  c.id,
  c.texto,
  c.data_comentario,
  c.id_usuario,
  c.id_postagem,
  u.nome AS autor_nome
`;

async function listarPorPostagem(idPostagem) {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS}
     FROM comentario c
     JOIN usuario u ON u.id = c.id_usuario
     WHERE c.id_postagem = ?
     ORDER BY c.data_comentario ASC`,
    [idPostagem]
  );
  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS}
     FROM comentario c
     JOIN usuario u ON u.id = c.id_usuario
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    'INSERT INTO comentario (texto, id_usuario, id_postagem) VALUES (?, ?, ?)',
    [dados.texto, dados.id_usuario, dados.id_postagem]
  );
  return buscarPorId(resultado.insertId);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM comentario WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function dataUltimaAtividade(idPostagem) {
  const [rows] = await pool.query(
    `SELECT COALESCE(MAX(c.data_comentario), p.data_postagem) AS ultima_atividade
     FROM postagem p
     LEFT JOIN comentario c ON c.id_postagem = p.id
     WHERE p.id = ?
     GROUP BY p.data_postagem`,
    [idPostagem]
  );
  return rows[0]?.ultima_atividade || null;
}

module.exports = {
  listarPorPostagem,
  buscarPorId,
  criar,
  excluir,
  dataUltimaAtividade,
};
