CREATE DATABASE IF NOT EXISTS site_usuario;
USE site_usuario;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS noticia;
DROP TABLE IF EXISTS favoritos;
DROP TABLE IF EXISTS progresso_usuario;
DROP TABLE IF EXISTS simulado_questao;
DROP TABLE IF EXISTS simulado;
DROP TABLE IF EXISTS questao_tag;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS alternativa;
DROP TABLE IF EXISTS questao;
DROP TABLE IF EXISTS vestibular;
DROP TABLE IF EXISTS materia;
DROP TABLE IF EXISTS usuario;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    senha VARCHAR(60) NOT NULL, 
    data_nascimento date not null,
    data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_conta ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo', -- Otimizado
    perfil_acesso ENUM('estudante', 'admin') DEFAULT 'estudante'       -- Otimizado
);

CREATE TABLE materia (
    id_materia INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE 
);

CREATE TABLE vestibular (
    id_vestibular INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,       
    ano INT NOT NULL,                
    instituicao VARCHAR(100),       
    CONSTRAINT uq_vestibular_ano UNIQUE (nome, ano)
);

CREATE TABLE questao (
    id_questao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_materia INT NOT NULL,
    id_vestibular INT NOT NULL,      
    dificuldade TINYINT NOT NULL,     
    enunciado TEXT NOT NULL,
    url_imagem VARCHAR(255) NULL,   
    resolucao_comentada TEXT,      
    
    CONSTRAINT fk_materia FOREIGN KEY (id_materia) REFERENCES materia(id_materia) ON DELETE CASCADE,
    CONSTRAINT fk_vestibular FOREIGN KEY (id_vestibular) REFERENCES vestibular(id_vestibular) ON DELETE CASCADE
);

CREATE INDEX idx_busca_questoes ON questao (id_materia, id_vestibular, dificuldade);

CREATE TABLE alternativa (
    id_alternativa INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_questao INT NOT NULL,
    texto_alternativa TEXT NOT NULL,
    is_correta BOOLEAN NOT NULL DEFAULT FALSE, 
    
    CONSTRAINT fk_questao FOREIGN KEY (id_questao) REFERENCES questao(id_questao) ON DELETE CASCADE
);

CREATE TABLE progresso_usuario (
    id_progresso INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_questao INT NOT NULL,
    id_alternativa_escolhida INT NULL, 
    data_resposta TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Removido coluna 'acertou' redundante
    
    CONSTRAINT fk_progresso_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_progresso_questao FOREIGN KEY (id_questao) REFERENCES questao(id_questao) ON DELETE CASCADE,
    CONSTRAINT fk_progresso_alternativa FOREIGN KEY (id_alternativa_escolhida) REFERENCES alternativa(id_alternativa) ON DELETE SET NULL
);

CREATE TABLE favoritos (
    id_usuario INT NOT NULL,
    id_questao INT NOT NULL,
    data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (id_usuario, id_questao),
    CONSTRAINT fk_favoritos_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_favoritos_questao FOREIGN KEY (id_questao) REFERENCES questao(id_questao) ON DELETE CASCADE
);

CREATE TABLE simulado (
    id_simulado INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    id_vestibular INT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_temporario BOOLEAN DEFAULT FALSE, -- Permite rotinas de limpeza para cadernos velhos
    
    CONSTRAINT fk_simulado_vestibular FOREIGN KEY (id_vestibular) REFERENCES vestibular(id_vestibular) ON DELETE CASCADE
);

CREATE TABLE simulado_questao (
    id_simulado INT NOT NULL,
    id_questao INT NOT NULL,
    
    PRIMARY KEY (id_simulado, id_questao),
    CONSTRAINT fk_simulado_assoc FOREIGN KEY (id_simulado) REFERENCES simulado(id_simulado) ON DELETE CASCADE,
    CONSTRAINT fk_questao_assoc FOREIGN KEY (id_questao) REFERENCES questao(id_questao) ON DELETE CASCADE
);

CREATE TABLE tag (
    id_tag INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE questao_tag (
    id_questao INT NOT NULL,
    id_tag INT NOT NULL,
    
    PRIMARY KEY (id_questao, id_tag),
    CONSTRAINT fk_tag_questao FOREIGN KEY (id_questao) REFERENCES questao(id_questao) ON DELETE CASCADE,
    CONSTRAINT fk_tag_lista FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE
);

CREATE TABLE noticia (
    id_noticia INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,           
    url_imagem VARCHAR(255),          
    data_publicacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NULL,    
    destaque BOOLEAN DEFAULT FALSE    
);

INSERT INTO usuario (nome, email, data_nascimento, senha, status_conta, perfil_acesso, data_cadastro) 
VALUES ('Estudante Teste', 'teste@email.com', '2002-05-10', 'senha123', 'ativo', 'estudante', NOW());