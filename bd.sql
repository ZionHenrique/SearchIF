-- ============================================================
-- SearchIF — Script completo do banco de dados
-- Execute: mysql -u root -p < bd.sql
-- ============================================================

DROP DATABASE IF EXISTS achados_perdidos;
CREATE DATABASE achados_perdidos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE achados_perdidos;

-- ------------------------------------------------------------
-- USUÁRIO (tabela pai)
-- ------------------------------------------------------------

CREATE TABLE usuario (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    nome          VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL,
    senha         VARCHAR(255) NOT NULL,
    telefone      VARCHAR(20) NULL,
    tipo_usuario  ENUM('discente', 'docente', 'administrador', 'servidor') NOT NULL,
    criado_em     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_usuario_email UNIQUE (email),
    INDEX idx_usuario_tipo (tipo_usuario)
);

-- ------------------------------------------------------------
-- TABELAS FILHAS DE USUÁRIO (herança por tipo)
-- ------------------------------------------------------------

CREATE TABLE discente (
    id_usuario INT PRIMARY KEY,
    matricula  VARCHAR(30) NOT NULL,

    CONSTRAINT uq_discente_matricula UNIQUE (matricula),
    CONSTRAINT fk_discente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE docente (
    id_usuario INT PRIMARY KEY,
    matricula  VARCHAR(30) NOT NULL,
    turma      VARCHAR(50) NOT NULL,
    materias   VARCHAR(100) NULL,

    CONSTRAINT uq_docente_matricula UNIQUE (matricula),
    CONSTRAINT fk_docente_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE servidor (
    id_usuario INT PRIMARY KEY,
    matricula  VARCHAR(30) NOT NULL,

    CONSTRAINT uq_servidor_matricula UNIQUE (matricula),
    CONSTRAINT fk_servidor_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE administrador (
    id_usuario INT PRIMARY KEY,
    matricula  VARCHAR(30) NOT NULL,
    funcao     VARCHAR(100) NULL,

    CONSTRAINT uq_admin_matricula UNIQUE (matricula),
    CONSTRAINT fk_admin_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- CATEGORIA
-- ------------------------------------------------------------

CREATE TABLE categoria (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,

    CONSTRAINT uq_categoria_nome UNIQUE (nome)
);

-- ------------------------------------------------------------
-- TAG (UC19)
-- ------------------------------------------------------------

CREATE TABLE tag (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(30) NOT NULL,

    CONSTRAINT uq_tag_nome UNIQUE (nome)
);

-- ------------------------------------------------------------
-- ITEM
-- ------------------------------------------------------------

CREATE TABLE item (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nome              VARCHAR(100) NOT NULL,
    descricao         TEXT NULL,
    local_encontrado  VARCHAR(100) NULL,
    data_perda        DATE NULL,
    data_perda_inicio DATE NULL,
    data_perda_fim    DATE NULL,
    imagem            VARCHAR(255) NULL,
    status_item       ENUM('perdido', 'encontrado', 'recuperado') NOT NULL DEFAULT 'perdido',
    id_categoria      INT NULL,
    id_usuario        INT NOT NULL,
    criado_em         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_item_categoria
        FOREIGN KEY (id_categoria) REFERENCES categoria(id) ON DELETE SET NULL,
    CONSTRAINT fk_item_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX idx_item_status (status_item),
    INDEX idx_item_categoria (id_categoria),
    INDEX idx_item_usuario (id_usuario),
    INDEX idx_item_nome (nome)
);

-- Relacionamento N:N item ↔ tag
CREATE TABLE item_tag (
    id_item INT NOT NULL,
    id_tag  INT NOT NULL,

    PRIMARY KEY (id_item, id_tag),
    CONSTRAINT fk_item_tag_item
        FOREIGN KEY (id_item) REFERENCES item(id) ON DELETE CASCADE,
    CONSTRAINT fk_item_tag_tag
        FOREIGN KEY (id_tag) REFERENCES tag(id) ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- POSTAGEM (fórum achados / pedidos)
-- ------------------------------------------------------------

CREATE TABLE postagem (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    titulo         VARCHAR(100) NOT NULL,
    tipo_forum     ENUM('achados', 'pedidos') NOT NULL,
    data_postagem  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_item        INT NOT NULL,
    id_usuario     INT NOT NULL,

    CONSTRAINT fk_postagem_item
        FOREIGN KEY (id_item) REFERENCES item(id) ON DELETE CASCADE,
    CONSTRAINT fk_postagem_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT uq_postagem_item_forum UNIQUE (id_item, tipo_forum),
    INDEX idx_postagem_forum (tipo_forum),
    INDEX idx_postagem_data (data_postagem)
);

-- ------------------------------------------------------------
-- COMENTÁRIO
-- ------------------------------------------------------------

CREATE TABLE comentario (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    texto            TEXT NOT NULL,
    data_comentario  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario       INT NOT NULL,
    id_postagem      INT NOT NULL,

    CONSTRAINT fk_comentario_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_postagem
        FOREIGN KEY (id_postagem) REFERENCES postagem(id) ON DELETE CASCADE,
    INDEX idx_comentario_postagem (id_postagem)
);

-- ------------------------------------------------------------
-- NOTIFICAÇÃO
-- ------------------------------------------------------------

CREATE TABLE notificacao (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    mensagem           TEXT NOT NULL,
    visualizada        BOOLEAN NOT NULL DEFAULT FALSE,
    data_notificacao   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario         INT NOT NULL,

    CONSTRAINT fk_notificacao_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuario(id) ON DELETE CASCADE,
    INDEX idx_notificacao_usuario (id_usuario, visualizada)
);

-- ============================================================
-- DADOS INICIAIS (SEED)
-- ============================================================

INSERT INTO categoria (nome) VALUES
    ('Eletrônicos'),
    ('Documentos'),
    ('Roupas'),
    ('Acessórios'),
    ('Chaves'),
    ('Outros');

INSERT INTO tag (nome) VALUES
    ('urgente'),
    ('campus-central'),
    ('biblioteca'),
    ('auditório'),
    ('laboratório');
