function tratarErros(erro, _req, res, _next) {
  if (erro instanceof Error && erro.message.includes('Formato de imagem')) {
    return res.status(400).json({ erro: erro.message });
  }

  if (erro.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ erro: 'Imagem excede o limite de 5 MB.' });
  }

  if (erro.code === 'ER_DUP_ENTRY') {
    const msg = erro.message || '';
    if (msg.includes('email') || msg.includes('uq_usuario_email')) {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }
    if (msg.includes('matricula')) {
      return res.status(409).json({ erro: 'Matrícula já cadastrada.' });
    }
    if (msg.includes('categoria') || msg.includes('uq_categoria_nome')) {
      return res.status(409).json({ erro: 'Categoria já cadastrada.' });
    }
    if (msg.includes('postagem') || msg.includes('uq_postagem_item_forum')) {
      return res.status(409).json({
        erro: 'Este item já possui postagem neste fórum.',
      });
    }
    return res.status(409).json({ erro: 'Registro duplicado.' });
  }

  if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'Relacionamento inválido. Verifique os IDs informados.' });
  }

  if (erro.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(409).json({ erro: 'Registro em uso e não pode ser excluído.' });
  }

  if (erro.status) {
    return res.status(erro.status).json({ erro: erro.message });
  }

  console.error('Erro não tratado:', erro);
  return res.status(500).json({ erro: 'Erro interno do servidor.' });
}

module.exports = tratarErros;
