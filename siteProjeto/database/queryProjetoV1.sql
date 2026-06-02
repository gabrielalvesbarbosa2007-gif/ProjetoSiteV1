create database siteUsuario;
use siteUsuario;
create table usuario(
    nome varchar(50),
    idUsuario int not null AUTO_INCREMENT PRIMARY KEY,
    email varchar(50) unique not null,
    senha varchar(32) not null,
    dataCadastro timestamp DEFAULT CURRENT_TIMESTAMP,
    statusConta varchar(50) DEFAULT 'ativo',
    perfilAcesso VARCHAR(20) DEFAULT 'estudante'
);
CREATE TABLE materia (
    idMateria INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE 
);

CREATE TABLE vestibular (
    idVestibular INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,       
    ano INT NOT NULL,                
    instituicao VARCHAR(100),       
    UNIQUE KEY uq_vestibular_ano (nome, ano)
);


CREATE TABLE questao (
    idQuestao INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idMateria INT NOT NULL,
    idVestibular INT NOT NULL,      
    dificuldade INT NOT NULL,        
    enunciado TEXT NOT NULL,
    resolucaoComentada TEXT,      
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    constraint idMateriaFK FOREIGN KEY (idMateria) REFERENCES materia(idMateria),
    CONSTRAINT idVestibularFK FOREIGN KEY (idVestibular) REFERENCES vestibular(idVestibular),
    INDEX idx_busca_questoes (idMateria, idVestibular, dificuldade)
);

CREATE TABLE alternativa (
    idAlternativa INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    idQuestao INT NOT NULL,
    textoAlternativa TEXT NOT NULL,
    isCorreta BOOLEAN NOT NULL DEFAULT FALSE, 
    
    constraint idQuestaoFK FOREIGN KEY (idQuestao) REFERENCES questao(idQuestao)
);