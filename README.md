# SearchIF — Achados e Perdidos

Sistema de achados e perdidos com API REST em Node.js + MySQL.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [MySQL](https://dev.mysql.com/downloads/) 8+
- [Git](https://git-scm.com/)

## Configuração do ambiente

### 1. Clonar o repositório

```bash
git clone <url-do-repositorio>
cd SearchIF
```

### 2. Criar o banco de dados

```bash
mysql -u root -p < bd.sql
```

No Windows (PowerShell):

```powershell
Get-Content bd.sql | mysql -u root -p
```

O script `bd.sql` recria o banco `achados_perdidos` com todas as tabelas, constraints, índices e dados iniciais (categorias e tags).

### 3. Configurar variáveis de ambiente

```bash
cd backend
copy .env.example .env   # Windows
# cp .env.example .env   # Linux/Mac
```

Edite o `.env`:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=achados_perdidos
JWT_SECRET=uma_chave_secreta_forte
```

### 4. Instalar dependências e iniciar

```bash
npm install
npm run dev
```

API disponível em `http://localhost:3000`.

Verifique a conexão: `GET http://localhost:3000/health`

## Estrutura do projeto

```
SearchIF/
├── bd.sql                 # Script completo do banco
├── relatorio.md           # Documentação técnica das entregas
├── backend/
│   ├── src/
│   │   ├── controllers/   # ENTREGA02 — lógica do sistema
│   │   ├── models/        # ENTREGA02 — consultas ao banco
│   │   ├── routes/        # ENTREGA03 — rotas HTTP
│   │   ├── middlewares/   # Auth, upload, erros
│   │   ├── utils/         # ENTREGA04 — validações e regras
│   │   └── jobs/          # Limpeza automática (RNF5)
│   └── uploads/           # Imagens enviadas
```

## Sincronização com GitHub

```bash
git add .
git commit -m "feat: backend completo com API REST"
git push origin main
```

> O arquivo `.env` **não** deve ser commitado. Use `.env.example` como referência.

## Endpoints principais

| Recurso | Base URL |
|---------|----------|
| Usuários | `/api/usuarios` |
| Itens | `/api/itens` |
| Categorias | `/api/categorias` |
| Tags | `/api/tags` |
| Postagens | `/api/postagens` |
| Comentários | `/api/comentarios` |
| Notificações | `/api/notificacoes` |
| Upload | `/api/upload/imagem` |

Autenticação via header: `Authorization: Bearer <token>`

Consulte [`relatorio.md`](relatorio.md) para a lista completa de endpoints e regras de negócio.
