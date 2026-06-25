const { pool } = require('../database/conexao');
const Tag = require('./Tag');

const COLUNAS_ITEM = `
  i.id,
  i.nome,
  i.descricao,
  i.local_encontrado,
  i.data_perda,
  i.data_perda_inicio,
  i.data_perda_fim,
  i.imagem,
  i.status_item,
  i.id_categoria,
  i.id_usuario,
  i.criado_em,
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
    condicoes.push('COALESCE(i.data_perda_inicio, i.data_perda) >= ?');
    valores.push(filtros.data_inicio);
  }

  if (filtros.data_fim) {
    condicoes.push('COALESCE(i.data_perda_fim, i.data_perda) <= ?');
    valores.push(filtros.data_fim);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(' AND ')}` : '';
  return { where, valores };
}

async function enriquecerComTags(item) {
  if (!item) return null;
  const tags = await Tag.buscarPorItem(item.id);
  return { ...item, tags };
}

async function listar(filtros = {}) {
  const { where, valores } = montarFiltros(filtros);

  const [rows] = await pool.query(
    `SELECT ${COLUNAS_ITEM} ${FROM_ITEM} ${where} ORDER BY i.id DESC`,
    valores
  );

  return Promise.all(rows.map(enriquecerComTags));
}

async function buscarPorId(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUNAS_ITEM} ${FROM_ITEM} WHERE i.id = ?`,
    [id]
  );
  return enriquecerComTags(rows[0] || null);
}

async function criar(dados) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const [resultado] = await conexao.query(
      `INSERT INTO item
        (nome, descricao, local_encontrado, data_perda, data_perda_inicio, data_perda_fim,
         imagem, status_item, id_categoria, id_usuario)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dados.nome.trim(),
        dados.descricao || null,
        dados.local_encontrado || null,
        dados.data_perda || null,
        dados.data_perda_inicio || null,
        dados.data_perda_fim || null,
        dados.imagem || null,
        dados.status_item || 'perdido',
        dados.id_categoria || null,
        dados.id_usuario,
      ]
    );

    const idItem = resultado.insertId;

    if (dados.tags) {
      await Tag.vincularAoItem(idItem, dados.tags, conexao);
    }

    await conexao.commit();
    return buscarPorId(idItem);
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
}

async function atualizar(id, dados) {
  const conexao = await pool.getConnection();

  try {
    await conexao.beginTransaction();

    const campos = [];
    const valores = [];

    const camposPermitidos = [
      'nome',
      'descricao',
      'local_encontrado',
      'data_perda',
      'data_perda_inicio',
      'data_perda_fim',
      'imagem',
      'status_item',
      'id_categoria',
    ];

    for (const campo of camposPermitidos) {
      if (dados[campo] !== undefined) {
        campos.push(`${campo} = ?`);
        valores.push(campo === 'nome' && dados[campo] ? dados[campo].trim() : dados[campo]);
      }
    }

    if (campos.length > 0) {
      valores.push(id);
      await conexao.query(`UPDATE item SET ${campos.join(', ')} WHERE id = ?`, valores);
    }

    if (dados.tags !== undefined) {
      await Tag.vincularAoItem(id, dados.tags, conexao);
    }

    await conexao.commit();
    return buscarPorId(id);
  } catch (erro) {
    await conexao.rollback();
    throw erro;
  } finally {
    conexao.release();
  }
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
