require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { testarConexao } = require('./database/conexao');
const usuariosRoutes = require('./routes/usuarios');
const itensRoutes = require('./routes/itens');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

app.use((_req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

app.use((erro, _req, res, _next) => {
  console.error('Erro não tratado:', erro);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

async function iniciar() {
  try {
    await testarConexao();
    console.log('Conexão com o banco de dados estabelecida.');
  } catch (erro) {
    console.warn('Aviso: não foi possível conectar ao banco de dados.', erro.message);
    console.warn('O servidor irá iniciar, mas as rotas que dependem do banco falharão.');
  }

  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

iniciar();
