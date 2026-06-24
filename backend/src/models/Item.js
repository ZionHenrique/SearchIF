const { pool } = require('../database/conexao');

const COLUNAS_ITEM = `
  i.id,
  i.nome,
  i.descricao,
  i.local_encontrado,
  i.data_perda,
  i.imagem,
  i.status_item,
  i.id_categoria,
  i.id_usuario,
  c.nome AS categoria_nome,
  u.nome AS autor_nome
`;

const FROM_ITEM = `
  FROM item i
  LEFT JOIN categoria c ON c.id = i.id_categoria
  LEFT JOIN usuario u ON u.id = i.id_usuario
`;

function montarFiltros(filtros) {
  const condicoes = [];
  const valores = [];

  if (filtros.categoria) {
    condicoes.push('(c.nome = ? OR i.id_categoria = ?)');
    valores.push(filtros.categoria, filtros.categoria);
  }

  if (filtros.nome) {
    condicoes.push('i.nome LIKE ?');
    valores.push(`%${filtros.nome}%`);
  }

  if (filtros.status) {
    condicoes.push('i.status_item = ?');
    valores.push(filtros.status);
  }

  if (filtros.id_usuario) {
    condicoes.push('i.id_usuario = ?');
    valores.push(filtros.id_usuario);
  }

  if (filtros.data_inicio) {
    condicoes.push('i.data_perda >= ?');
    valores.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    condicoes.push('i.data_perda <= ?');
    valores.push(filtros.data_fim);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, valores };
}

async function listar(filtros = {}) {
  const { where, valores } = montarFiltros(filtros);

  const [rows] = await pool.query(
    `SELECT ${COLUNAS_ITEM} ${FROM_ITEM} ${where} ORDER BY i.id DESC`,
    valores
  );

  return rows;
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS_ITEM} ${FROM_ITEM} WHERE i.id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function criar(dados) {
  const [resultado] = await pool.query(
    `INSERT INTO item
      (nome, descricao, local_encontrado, data_perda, imagem, status_item, id_categoria, id_usuario)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      dados.nome,
      dados.descricao || null,
      dados.local_encontrado || null,
      dados.data_perda || null,
      dados.imagem || null,
      dados.status_item || 'perdido',
      dados.id_categoria || null,
      dados.id_usuario,
    ]
  );

  return buscarPorId(resultado.insertId);
}

async function atualizar(id, dados) {
  const campos = [];
  const valores = [];

  const camposPermitidos = [
    'nome',
    'descricao',
    'local_encontrado',
    'data_perda',
    'imagem',
    'status_item',
    'id_categoria',
  ];

  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      campos.push(`${campo} = ?`);
      valores.push(dados[campo]);
    }
  }

  if (campos.length === 0) {
    return buscarPorId(id);
  }

  valores.push(id);
  await pool.query(`UPDATE item SET ${campos.join(', ')} WHERE id = ?`, valores);

  return buscarPorId(id);
}

async function excluir(id) {
  const [resultado] = await pool.query('DELETE FROM item WHERE id = ?', [id]);
  return resultado.affectedRows > 0;
}

module.exports = {
  listar,
  buscarPorId,
  criar,
  atualizar,
  excluir,
};
