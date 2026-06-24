# Relatório — Backend SearchIF

## O que foi implementado

**Stack:** Node.js + Express + MySQL (`mysql2`) + JWT + bcrypt + multer + node-cron

### Estrutura

```
backend/
├── .env / .env.example
├── package.json
├── uploads/                  # imagens enviadas
└── src/
    ├── server.js
    ├── database/conexao.js
    ├── jobs/limpezaPostagens.js
    ├── middlewares/
    │   ├── verificarToken.js
    │   ├── verificarAdmin.js
    │   └── upload.js
    ├── models/
    │   ├── Usuario.js
    │   ├── Item.js
    │   ├── Categoria.js
    │   ├── Postagem.js
    │   ├── Comentario.js
    │   └── Notificacao.js
    ├── routes/
    │   ├── usuarios.js
    │   ├── itens.js
    │   ├── categorias.js
    │   ├── postagens.js
    │   ├── comentarios.js
    │   ├── notificacoes.js
    │   └── upload.js
    └── utils/validacoes.js
```

---

## Endpoints disponíveis

### Saúde e autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/health` | — | Verifica API e banco |
| `POST` | `/api/usuarios/cadastro` | — | Cadastro (RF1, RF3–RF5) |
| `POST` | `/api/usuarios/login` | — | Login (RF2) |
| `GET` | `/api/usuarios/perfil` | Token | Perfil do usuário |
| `PUT` | `/api/usuarios/perfil` | Token | Editar perfil (RF20) |

### Itens

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/itens` | — | Listar com filtros (RF12, RF15) |
| `GET` | `/api/itens/:id` | — | Detalhe do item (RF18) |
| `POST` | `/api/itens` | Token | Criar item (RF11, RF13) |
| `PUT` | `/api/itens/:id` | Token | Atualizar item + notificação se encontrado (RF19) |
| `DELETE` | `/api/itens/:id` | Token | Excluir item recuperado (RF16) |

**Filtros em `GET /api/itens`:** `?categoria=`, `?nome=`, `?status=`, `?data_inicio=`, `?data_fim=`, `?id_usuario=`

### Categorias

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/categorias` | — | Listar categorias |
| `GET` | `/api/categorias/:id` | — | Buscar categoria |
| `POST` | `/api/categorias` | Admin | Criar categoria (RF11) |
| `PUT` | `/api/categorias/:id` | Admin | Atualizar categoria |
| `DELETE` | `/api/categorias/:id` | Admin | Excluir categoria |

### Fórum — Postagens (RF7–RF10)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/postagens` | — | Listar fórum achados/pedidos |
| `GET` | `/api/postagens/:id` | — | Detalhe + comentários (RF10) |
| `POST` | `/api/postagens` | Token | Criar postagem |
| `PUT` | `/api/postagens/:id` | Token | Editar postagem |
| `DELETE` | `/api/postagens/:id` | Token | Excluir postagem |
| `GET` | `/api/postagens/:id/comentarios` | — | Listar comentários (UC17) |
| `POST` | `/api/postagens/:id/comentarios` | Token | Adicionar comentário |

**Filtros em `GET /api/postagens`:** `?tipo_forum=achados|pedidos`, `?categoria=`, `?data_inicio=`, `?data_fim=`, `?id_usuario=`

**Detalhe da postagem retorna:** título, tipo do fórum, data, nome do autor, descrição do item, categoria, local encontrado, data de perda, imagem e lista de comentários.

### Comentários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `DELETE` | `/api/comentarios/:id` | Token | Excluir próprio comentário |

### Notificações (RF19)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `GET` | `/api/notificacoes` | Token | Listar notificações do usuário |
| `GET` | `/api/notificacoes?nao_visualizadas=true` | Token | Apenas não visualizadas |
| `PUT` | `/api/notificacoes/visualizar-todas` | Token | Marcar todas como lidas |
| `PUT` | `/api/notificacoes/:id/visualizar` | Token | Marcar uma como lida |

Notificação é criada automaticamente quando um item muda para `encontrado` ou `recuperado`.

### Upload de imagem (RF14)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/api/upload/imagem` | Token | Enviar imagem (campo `imagem`, multipart) |

Retorna `{ url: "/uploads/nome-arquivo.jpg" }`. Use essa URL no campo `imagem` ao criar/editar um item.

Formatos aceitos: JPEG, PNG, WEBP, GIF (máx. 5 MB). Arquivos servidos em `/uploads/`.

---

## Requisitos cobertos

| Requisito | Status |
|-----------|--------|
| **RNF1** — E-mail único e senha forte | Implementado |
| **RNF4** — Código de usuário por tipo (`D-`, `T-`, `S-`, `A-`) | Implementado |
| **RNF5** — Limpeza de postagens inativas (2+ meses) | Job cron diário às 03:00 |
| **RF1–RF5** — Cadastro e login por tipo de usuário | Implementado |
| **RF7–RF10** — Fórum achados/pedidos, filtros e detalhe | Implementado |
| **RF11–RF16** — CRUD de itens com categoria e filtros | Implementado |
| **RF14** — Upload de imagem | Implementado (multer) |
| **RF19** — Notificação de item encontrado | Implementado |
| **RF20** — Edição de perfil | Implementado |

### Job RNF5 — Limpeza automática

- Remove postagens cujo item está `encontrado` ou `recuperado` **e** sem atividade (comentários ou data da postagem) há **2+ meses**.
- Configurável via `.env`:
  - `LIMPEZA_MESES_INATIVIDADE=2`
  - `LIMPEZA_CRON=0 3 * * *` (padrão: todo dia às 03:00)

---

## Como subir o projeto

```bash
cd backend
cp .env.example .env   # ajuste DB_PASSWORD e JWT_SECRET
npm install
npm run dev
```

Depois rode o `bd.sql` no MySQL.

### Exemplo — upload + criar item

```bash
# 1. Enviar imagem
curl -X POST http://localhost:3000/api/upload/imagem \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "imagem=@foto.jpg"

# 2. Criar item com a URL retornada
curl -X POST http://localhost:3000/api/itens \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carteira","descricao":"Preta","imagem":"/uploads/123.jpg","id_categoria":1}'
```

---

## Revisão do `bd.sql` — pendências restantes

| Ponto | Situação |
|-------|----------|
| **UC19 – Tags** | Ainda sem tabela `tag` / `item_tag` no banco |
| **UC27 – Período de perda** | Só `data_perda DATE`; falta `data_perda_inicio` / `data_perda_fim` |
| **UC27 duplicado** | Renumerar no documento de requisitos |
| **`categoria`** | Tabela ok; cadastrar categorias iniciais no script SQL |

---

## Status do servidor

A API sobe em `http://localhost:3000`. O aviso de banco desconectado é esperado enquanto o MySQL não estiver configurado.

Após executar o `bd.sql` e ajustar o `.env`, `GET /health` retorna:

```json
{ "status": "ok", "banco": "conectado" }
```
