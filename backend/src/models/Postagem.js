const { pool } = require('../database/conexao');

const COLUNAS_POSTAGEM = `
  p.id,
  p.titulo,
  p.tipo_forum,
  p.data_postagem,
  p.id_item,
  p.id_usuario,
  u.nome AS autor_nome,
  i.nome AS item_nome,
  i.descricao AS item_descricao,
  i.local_encontrado,
  i.data_perda,
  i.data_perda_inicio,
  i.data_perda_fim,
  i.imagem AS item_imagem,
  i.status_item,
  i.id_categoria,
  c.nome AS categoria_nome
`;

const FROM_POSTAGEM = `
  FROM postagem p
  JOIN usuario u ON u.id = p.id_usuario
  LEFT JOIN item i ON i.id = p.id_item
  LEFT JOIN categoria c ON c.id = i.id_categoria
`;

function montarFiltros(filtros) {
  const condicoes = [];
  const valores = [];

  if (filtros.tipo_forum) {
    condicoes.push('p.tipo_forum = ?');
    valores.push(filtros.tipo_forum);
  }

  if (filtros.categoria) {
    condicoes.push('(c.nome = ? OR i.id_categoria = ?)');
    valores.push(filtros.categoria, filtros.categoria);
  }

  if (filtros.data_inicio) {
    condicoes.push('DATE(p.data_postagem) >= ?');
    valores.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    condicoes.push('DATE(p.data_postagem) <= ?');
    valores.push(filtros.data_fim);
  }

  if (filtros.id_usuario) {
    condicoes.push('p.id_usuario = ?');
    valores.push(filtros.id_usuario);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, valores };
}

async function listar(filtros = {}) {
  const { where, valores } = montarFiltros(filtros);

  const [rows] = await pool.query(
    `SELECT ${COLUNAS_POSTAGEM} ${FROM_POSTAGEM} ${where} ORDER BY p.data_postagem DESC`,
    valores
  );

  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS_POSTAGEM} ${FROM_POSTAGEM} WHERE p.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function buscarPorItemETipo(idItem, tipoForum) {
  const [rows] = await pool.query(
    'SELECT id FROM postagem WHERE id_item = ? AND tipo_forum = ?',
    [idItem, tipoForum]
  );
  return rows[0] || null;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    'INSERT INTO postagem (titulo, tipo_forum, id_item, id_usuario) VALUES (?, ?, ?, ?)',
    [dados.titulo.trim(), dados.tipo_forum, dados.id_item, dados.id_usuario]
  );
  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];

  if (dados.titulo !== undefined) {
    campos.push('titulo = ?');
    valores.push(dados.titulo.trim());
  }
  if (dados.tipo_forum !== undefined) {
    campos.push('tipo_forum = ?');
    valores.push(dados.tipo_forum);
  }
  if (dados.id_item !== undefined) {
    campos.push('id_item = ?');
    valores.push(dados.id_item);
  }

  if (campos.length === 0) {
    return buscarPorId(id);
  }

  valores.push(id);
  await pool.query(`UPDATE postagem SET ${campos.join(', ')} WHERE id = ?`, valores);
  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM postagem WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

async function limparPostagensInativas(mesesInatividade = 2) {
  const [resultado] = await pool.query(
    `DELETE p FROM postagem p
     INNER JOIN item i ON i.id = p.id_item
     WHERE i.status_item IN ('recuperado', 'encontrado')
     AND (
       SELECT COALESCE(MAX(c.data_comentario), p.data_postagem)
       FROM comentario c
       WHERE c.id_postagem = p.id
     ) < DATE_SUB(NOW(), INTERVAL ? MONTH)`,
    [mesesInatividade]
  );
  return resultado.affectedRows;
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorItemETipo,
  criar,
  atualizar,
  excluir,
  limparPostagensInativas,
};
