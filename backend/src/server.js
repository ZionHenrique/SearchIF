require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const { testarConexao } = require('./database/conexao');
const { iniciarJobLimpeza } = require('./jobs/limpezaPostagens');
const usuariosRoutes = require('./routes/usuarios');
const itensRoutes = require('./routes/itens');
const categoriasRoutes = require('./routes/categorias');
const postagensRoutes = require('./routes/postagens');
const comentariosRoutes = require('./routes/comentarios');
const notificacoesRoutes = require('./routes/notificacoes');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', async (_req, res) => {
  try {
    await testarConexao();
    return res.json({ status: 'ok', banco: 'conectado' });
  } catch {
    return res.status(503).json({ status: 'erro', banco: 'desconectado' });
  }
});

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/itens', itensRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/postagens', postagensRoutes);
app.use('/api/comentarios', comentariosRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/upload', uploadRoutes);

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, _req, res, _next) => {
  if (erro instanceof Error && erro.message.includes('Formato de imagem')) {
    return res.status(400).json({ erro: erro.message });
  }
  if (erro.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ erro: 'Imagem excede o limite de 5 MB.' });
  }
  console.error('Erro não tratado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function iniciar() {
  try {
    await testarConexao();
    console.log('Conexão com o banco de dados estabelecida.');
    iniciarJobLimpeza();
  } catch (erro) {
    console.warn('Aviso: não foi possível conectar ao banco de dados.', erro.message);
    console.warn('O servidor irá iniciar, mas as rotas que dependem do banco falharão.');
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

iniciar();
