-- =========================================================
-- FIX COMPLETO PARA PRODUÇÃO - ConectEDU
-- Copie e cole TODO este arquivo no phpMyAdmin
-- =========================================================

-- Selecionar o banco de dados correto
USE conectedu;

-- =========================================================
-- PARTE 1: Criar tabela de migrations (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
);

-- =========================================================
-- PARTE 2: Criar tabela de logs de atividade
-- =========================================================

CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_action` (`action`),
  KEY `idx_created_at` (`created_at`)
);

-- =========================================================
-- PARTE 3: Criar tabela de schools (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `schools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `type` enum('municipal','estadual','federal','particular') DEFAULT 'municipal',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schools_name` (`name`),
  KEY `idx_schools_code` (`code`)
);

-- =========================================================
-- PARTE 4: Adicionar campos em students (se não existirem)
-- =========================================================

-- Verificar e adicionar birth_date
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'birth_date';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN birth_date date DEFAULT NULL AFTER birthdate',
  'SELECT "Campo birth_date já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar cpf
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'cpf';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN cpf varchar(14) DEFAULT NULL AFTER birth_date',
  'SELECT "Campo cpf já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar rg
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'rg';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN rg varchar(20) DEFAULT NULL AFTER cpf',
  'SELECT "Campo rg já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar school_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'school_id';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN school_id int(11) DEFAULT NULL AFTER school',
  'SELECT "Campo school_id já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar grade
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'grade';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN grade varchar(50) DEFAULT NULL AFTER school_id',
  'SELECT "Campo grade já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar class_name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'class_name';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN class_name varchar(100) DEFAULT NULL AFTER class',
  'SELECT "Campo class_name já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e adicionar address
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'conectedu' 
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'address';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN address text DEFAULT NULL AFTER class_name',
  'SELECT "Campo address já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =========================================================
-- PARTE 5: Criar tabela entrevistas_responsavel (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `entrevistas_responsavel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `nome_responsavel` varchar(200) DEFAULT NULL,
  `parentesco` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `profissao` varchar(150) DEFAULT NULL,
  `diagnostico` text DEFAULT NULL,
  `laudos_disponiveis` varchar(255) DEFAULT NULL,
  `tratamentos` text DEFAULT NULL,
  `medicamentos` text DEFAULT NULL,
  `desenvolvimento_motor` text DEFAULT NULL,
  `desenvolvimento_cognitivo` text DEFAULT NULL,
  `desenvolvimento_social` text DEFAULT NULL,
  `comunicacao` text DEFAULT NULL,
  `expectativas_familia` text DEFAULT NULL,
  `observacoes_gerais` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
);

-- =========================================================
-- PARTE 6: Criar tabela student_notes (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `student_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`)
);

-- =========================================================
-- PARTE 7: Criar tabela atendimentos (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `atendimentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `data_atendimento` date NOT NULL,
  `descricao` longtext NOT NULL,
  `objetivos` text DEFAULT NULL,
  `recursos` text DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `data_atendimento` (`data_atendimento`)
);

-- =========================================================
-- PARTE 8: Criar tabela legislacoes (se não existir)
-- =========================================================

CREATE TABLE IF NOT EXISTS `legislacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `tamanho_arquivo` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_legislacoes_titulo` (`titulo`),
  KEY `idx_legislacoes_created_at` (`created_at`)
);

-- =========================================================
-- PARTE 9: Registrar migrations executadas
-- =========================================================

INSERT IGNORE INTO `migrations` (`migration_name`, `executed_at`) VALUES
('add_student_modern_fields', NOW()),
('fix_support_teacher_foreign_key', NOW()),
('create_schools_table', NOW()),
('create_entrevistas_table', NOW()),
('create_student_notes_table', NOW()),
('create_atendimentos_table', NOW()),
('ensure_modalidade_not_null', NOW());

-- =========================================================
-- FIM - Todas as tabelas e campos criados!
-- =========================================================

SELECT 'FIX COMPLETO EXECUTADO COM SUCESSO!' AS status;
