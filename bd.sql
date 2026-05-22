
CREATE DATABASE achados_perdidos;
USE achados_perdidos;

-- TABELA USUARIO (PAI)

CREATE TABLE usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    nome VARCHAR(100) NOT NULL,
    
    email VARCHAR(100) NOT NULL UNIQUE,
    
    senha VARCHAR(255) NOT NULL,
    
    telefone VARCHAR(20),

    tipo_usuario ENUM(
        'discente',
        'docente',
        'administrador',
        'servidor'
    ) NOT NULL
);

-- TABELA DISCENTE
-- FILHA DE USUARIO

CREATE TABLE discente (
    id_usuario INT PRIMARY KEY,

    matricula VARCHAR(30) NOT NULL UNIQUE,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- TABELA DOCENTE
-- FILHA DE USUARIO

CREATE TABLE docente (
    id_usuario INT PRIMARY KEY,

    matricula VARCHAR(30) NOT NULL UNIQUE,

    turma VARCHAR(50),

    materias VARCHAR(100),

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- TABELA SERVIDOR
-- FILHA DE USUARIO

CREATE TABLE servidor (
    id_usuario INT PRIMARY KEY,

    matricula VARCHAR(30) NOT NULL UNIQUE,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- TABELA ADMINISTRADOR
-- FILHA DE USUARIO

CREATE TABLE administrador (
    id_usuario INT PRIMARY KEY,

    matricula VARCHAR(30) NOT NULL UNIQUE,

    funcao VARCHAR(100),

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- TABELA CATEGORIA

CREATE TABLE categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(50) NOT NULL
);

-- TABELA ITEM

CREATE TABLE item (
    id INT AUTO_INCREMENT PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    descricao TEXT,

    local_encontrado VARCHAR(100),

    data_perda DATE,

    imagem VARCHAR(255),

    status_item ENUM(
        'perdido',
        'encontrado',
        'recuperado'
    ) DEFAULT 'perdido',

    id_categoria INT,

    id_usuario INT,

    FOREIGN KEY (id_categoria)
    REFERENCES categoria(id),

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
);

-- TABELA POSTAGEM

CREATE TABLE postagem (
    id INT AUTO_INCREMENT PRIMARY KEY,

    titulo VARCHAR(100),

    tipo_forum ENUM(
        'achados',
        'pedidos'
    ),

    data_postagem DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_item INT,

    id_usuario INT,

    FOREIGN KEY (id_item)
    REFERENCES item(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);

-- TABELA COMENTARIO

CREATE TABLE comentario (
    id INT AUTO_INCREMENT PRIMARY KEY,

    texto TEXT NOT NULL,

    data_comentario DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT,

    id_postagem INT,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE,

    FOREIGN KEY (id_postagem)
    REFERENCES postagem(id)
    ON DELETE CASCADE
);

-- TABELA NOTIFICACAO

CREATE TABLE notificacao (
    id INT AUTO_INCREMENT PRIMARY KEY,

    mensagem TEXT NOT NULL,

    visualizada BOOLEAN DEFAULT FALSE,

    data_notificacao DATETIME DEFAULT CURRENT_TIMESTAMP,

    id_usuario INT,

    FOREIGN KEY (id_usuario)
    REFERENCES usuario(id)
    ON DELETE CASCADE
);
