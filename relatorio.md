# Relatório — Backend SearchIF

## Entregas do projeto

| Entrega | Descrição | Status |
|---------|-----------|--------|
| **ENTREGA01** | Scripts SQL + Configuração do Ambiente | Concluída |
| **ENTREGA02** | Models + Controllers (Lógica do Sistema) | Concluída |
| **ENTREGA03** | Rotas + Integração Completa da API | Concluída |
| **ENTREGA04** | Regras de Negócio + Validações | Concluída |

---

## ENTREGA01 — Scripts SQL + Configuração do Ambiente

### Script `bd.sql`

Script idempotente que recria o banco completo:

- Charset `utf8mb4`
- Tabelas: `usuario`, `discente`, `docente`, `servidor`, `administrador`, `categoria`, `tag`, `item`, `item_tag`, `postagem`, `comentario`, `notificacao`
- Constraints `UNIQUE` (e-mail, matrícula, categoria, postagem por item+fórum)
- Foreign keys com `ON DELETE CASCADE` / `SET NULL`
- Índices para buscas por status, categoria, fórum e data
- Campos de período de perda: `data_perda_inicio`, `data_perda_fim`
- Tags vinculadas a itens (UC19)
- Seed de 6 categorias e 5 tags

### Configuração

```bash
mysql -u root -p < bd.sql
cd backend && copy .env.example .env
npm install && npm run dev
```

Arquivos de ambiente:

- `backend/.env.example` — template versionado no GitHub
- `backend/.env` — credenciais locais (ignorado pelo `.gitignore`)
- `.gitignore` na raiz — protege `.env` e `node_modules`

---

## ENTREGA02 — Models + Controllers

### Models (consultas ao banco)

| Model | Responsabilidade |
|-------|------------------|
| `Usuario.js` | CRUD usuário + tabelas filhas por tipo |
| `Item.js` | CRUD item + tags + filtros |
| `Categoria.js` | CRUD categoria |
| `Tag.js` | Listagem e vínculo item↔tag |
| `Postagem.js` | CRUD postagem + limpeza RNF5 |
| `Comentario.js` | CRUD comentário |
| `Notificacao.js` | Listagem e marcação de leitura |

### Controllers (lógica + retorno JSON)

| Controller | Métodos |
|------------|---------|
| `usuarioController` | cadastrar, login, obterPerfil, atualizarPerfil |
| `itemController` | listar, buscarPorId, criar, atualizar, excluir |
| `categoriaController` | listar, buscarPorId, criar, atualizar, excluir |
| `postagemController` | listar, buscarPorId, criar, atualizar, excluir, comentários |
| `comentarioController` | excluir |
| `notificacaoController` | listar, marcarVisualizada, marcarTodasVisualizadas |
| `uploadController` | enviarImagem, listarTags |

Todos os retornos são JSON padronizados via `utils/respostas.js`.

---

## ENTREGA03 — Rotas + Integração Completa da API

### Stack

Node.js + Express + MySQL (`mysql2`) + JWT + bcrypt + multer + node-cron

### Estrutura

```
backend/src/
├── server.js
├── database/conexao.js
├── controllers/
├── models/
├── routes/
├── middlewares/
│   ├── verificarToken.js
│   ├── verificarAdmin.js
│   ├── upload.js
│   ├── asyncHandler.js
│   └── tratarErros.js
├── utils/
│   ├── validacoes.js
│   ├── regrasNegocio.js
│   └── respostas.js
└── jobs/limpezaPostagens.js
```

### Endpoints — GET, POST, PUT, DELETE

#### Saúde

| Método | Rota | Auth |
|--------|------|------|
| GET | `/health` | — |

#### Usuários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/usuarios/cadastro` | — | Cadastro |
| POST | `/api/usuarios/login` | — | Login |
| GET | `/api/usuarios/perfil` | Token | Perfil |
| PUT | `/api/usuarios/perfil` | Token | Editar perfil |

#### Itens

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/itens` | — | Listar (filtros) |
| GET | `/api/itens/:id` | — | Detalhe + tags |
| POST | `/api/itens` | Token | Criar |
| PUT | `/api/itens/:id` | Token | Atualizar |
| DELETE | `/api/itens/:id` | Token | Excluir |

**Filtros:** `?categoria=`, `?nome=`, `?status=`, `?data_inicio=`, `?data_fim=`, `?id_usuario=`

#### Categorias

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/categorias` | — | Listar |
| GET | `/api/categorias/:id` | — | Buscar |
| POST | `/api/categorias` | Admin | Criar |
| PUT | `/api/categorias/:id` | Admin | Atualizar |
| DELETE | `/api/categorias/:id` | Admin | Excluir |

#### Tags

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/tags` | — | Listar tags disponíveis |

#### Postagens (fórum)

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/postagens` | — | Listar fórum |
| GET | `/api/postagens/:id` | — | Detalhe + comentários + tags |
| POST | `/api/postagens` | Token | Criar |
| PUT | `/api/postagens/:id` | Token | Atualizar |
| DELETE | `/api/postagens/:id` | Token | Excluir |
| GET | `/api/postagens/:id/comentarios` | — | Listar comentários |
| POST | `/api/postagens/:id/comentarios` | Token | Criar comentário |

**Filtros:** `?tipo_forum=achados|pedidos`, `?categoria=`, `?data_inicio=`, `?data_fim=`

#### Comentários

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| DELETE | `/api/comentarios/:id` | Token | Excluir próprio |

#### Notificações

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| GET | `/api/notificacoes` | Token | Listar |
| PUT | `/api/notificacoes/visualizar-todas` | Token | Marcar todas |
| PUT | `/api/notificacoes/:id/visualizar` | Token | Marcar uma |

#### Upload

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/upload/imagem` | Token | Enviar imagem (multipart) |

---

## ENTREGA04 — Regras de Negócio + Validações

Implementadas em `utils/regrasNegocio.js` e `utils/validacoes.js`, com tratamento centralizado em `middlewares/tratarErros.js`.

### Duplicidade

| Regra | Validação |
|-------|-----------|
| E-mail único | Verificação na aplicação + `UNIQUE` no banco |
| Matrícula única por tipo | Verificação na aplicação + `UNIQUE` no banco |
| Categoria única | Verificação na aplicação + `UNIQUE` no banco |
| Postagem duplicada | Um item só pode ter 1 postagem por fórum (`UNIQUE id_item + tipo_forum`) |

### Campos obrigatórios

| Contexto | Campos |
|----------|--------|
| Cadastro | nome, email, senha, tipo_usuario, matricula |
| Docente | turma obrigatória |
| Item | nome |
| Postagem | titulo, tipo_forum, id_item |
| Comentário | texto |
| Categoria | nome |

### Validações de formato

- **Senha (RNF1):** mínimo 8 caracteres, maiúscula, minúscula, número e caractere especial
- **E-mail:** formato válido
- **Datas:** formato `AAAA-MM-DD`
- **Período de perda:** `data_perda_inicio` ≤ `data_perda_fim`
- **IDs:** numéricos e positivos
- **status_item / tipo_forum:** valores permitidos no ENUM

### Relacionamentos verificados

- `id_categoria` deve existir antes de criar/editar item
- `tags[]` — cada ID deve existir na tabela `tag`
- `id_item` deve existir e pertencer ao usuário logado para criar postagem
- Postagem/comentário/item — só o autor pode editar ou excluir
- Categorias — CRUD restrito a administrador
- Notificação — só o destinatário pode marcar como lida

### Código de usuário (RNF4)

Gerado automaticamente: `D-000001`, `T-000001`, `S-000001`, `A-000001`

### Job RNF5

Remove postagens de itens `encontrado`/`recuperado` sem atividade há 2+ meses.

Configuração no `.env`:

```env
LIMPEZA_MESES_INATIVIDADE=2
LIMPEZA_CRON=0 3 * * *
```

### Notificação automática (RF19)

Quando item muda para `encontrado` ou `recuperado`, notificação é criada para o dono.

---

## Requisitos funcionais cobertos

| RF | Descrição | Backend |
|----|-----------|---------|
| RF1–RF5 | Cadastro/login por tipo | Sim |
| RF7–RF10 | Fórum achados/pedidos + detalhe | Sim |
| RF11–RF16 | Itens, categorias, busca, exclusão | Sim |
| RF14 | Upload de imagem | Sim |
| RF19 | Notificações | Sim |
| RF20 | Editar perfil | Sim |

---

## Pendências (frontend / evolução)

- UC27 duplicado no documento de requisitos — renumerar
- Interface web (fora do escopo atual)
- Testes automatizados

---

## Como testar

```bash
# 1. Banco
mysql -u root -p < bd.sql

# 2. Backend
cd backend
npm install
npm run dev

# 3. Health check
curl http://localhost:3000/health
```

Resposta esperada:

```json
{ "status": "ok", "banco": "conectado" }
```
