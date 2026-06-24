# Relatório — Backend SearchIF

## O que foi implementado

**Stack:** Node.js + Express + MySQL (`mysql2`) + JWT + bcrypt

### Estrutura

```
backend/
├── .env / .env.example
├── package.json
└── src/
    ├── server.js
    ├── database/conexao.js
    ├── middlewares/verificarToken.js
    ├── models/Usuario.js, Item.js
    ├── routes/usuarios.js, itens.js
    └── utils/validacoes.js
```

### Endpoints disponíveis

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/health` | Verifica se API e banco estão ok |
| `POST` | `/api/usuarios/cadastro` | Cadastro (RF1, RF3–RF5) |
| `POST` | `/api/usuarios/login` | Login (RF2) |
| `GET` | `/api/usuarios/perfil` | Perfil do usuário logado |
| `PUT` | `/api/usuarios/perfil` | Editar perfil (RF20) |
| `GET` | `/api/itens` | Listar com filtros (RF12, RF15) |
| `GET` | `/api/itens/:id` | Detalhe do item (RF18) |
| `POST` | `/api/itens` | Criar item (RF11, RF13, RF14) |
| `PUT` | `/api/itens/:id` | Atualizar item |
| `DELETE` | `/api/itens/:id` | Excluir item recuperado (RF16) |

**Filtros em `GET /api/itens`:** `?categoria=`, `?nome=`, `?status=`, `?data_inicio=`, `?data_fim=`, `?id_usuario=`

### Requisitos já cobertos no backend

- **RNF1** — E-mail único + senha com 8+ caracteres, maiúscula, minúscula, número e caractere especial
- **RNF4** — Código de usuário por tipo: `D-000001` (discente), `T-000001` (docente), `S-000001` (servidor), `A-000001` (admin)
- **RF1–RF5** — Cadastro por tipo com matrícula; docente exige turma
- **RF11–RF16** — CRUD de `item` com categoria, imagem (URL/caminho), data de perda e exclusão
- **RF20** — Edição de nome, e-mail, senha e telefone
- Regra de negócio — Só o autor pode editar/excluir seus itens

### Como subir o projeto

```bash
cd backend
cp .env.example .env   # ajuste DB_PASSWORD e JWT_SECRET
npm install
npm run dev
```

Depois rode o `bd.sql` no MySQL.

---

## Revisão do `bd.sql` vs requisitos

O schema está bem estruturado (herança por tipo de usuário, fórum separado em `postagem`, etc.). Alguns pontos para ajustar quando for evoluir:

| Ponto | Situação |
|-------|----------|
| **UC19 – Tags** | Não há tabela de tags no banco. Sugestão: `tag` + `item_tag` |
| **UC27 – Período de perda** | Só existe `data_perda DATE`. Para período, adicionar `data_perda_inicio` e `data_perda_fim` |
| **UC27 duplicado** | O mesmo UC27 aparece para período e para imagem — renumerar no documento |
| **RF7–RF10 – Fórum** | Tabelas `postagem` e `comentario` existem, mas ainda sem rotas no backend |
| **RF19 – Notificações** | Tabela `notificacao` existe, sem API ainda |
| **RNF5 – Limpeza automática** | Precisa de job/cron para apagar postagens inativas há 2+ meses |
| **RF14 – Imagem** | Campo `imagem VARCHAR(255)` guarda caminho; upload real virá depois (ex.: multer + storage) |
| **`categoria`** | Tabela ok, mas sem seed — cadastre categorias iniciais no script |

---

## Próximos passos sugeridos

1. Rotas de **postagem** (fórum achados/pedidos) e **comentário**
2. Rotas de **notificação**
3. CRUD de **categoria**
4. Upload de imagem
5. Job para **RNF5** (limpeza de postagens antigas)

---

## Status do teste do servidor

A API sobe em `http://localhost:3000`. O aviso de banco desconectado é esperado enquanto o MySQL não estiver configurado com o `bd.sql` e o `.env`.

Após executar o script do banco e ajustar as credenciais no `.env`, o endpoint `GET /health` deve retornar:

```json
{ "status": "ok", "banco": "conectado" }
```
