-- =========================================================
-- CONECTEDU - FIX PRODUÇÃO DEFINITIVO (MyISAM)
-- Versão: 1.0.0 - Otimizada para máxima compatibilidade
-- 
-- INSTRUÇÕES:
-- 1. Acesse phpMyAdmin no cPanel
-- 2. Selecione o banco 'conectedu'
-- 3. Vá na aba SQL
-- 4. Cole TODO este arquivo
-- 5. Clique em Executar
-- =========================================================

USE conectedu;

SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- =========================================================
-- BLOCO 1: TABELAS DE CONTROLE
-- =========================================================

-- Tabela de migrations (controle de versão)
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_namhttps://conectaee.com.br/backend/api.php/statse` varchar(255) NOT NULL,
  `executed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela de logs de atividade
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
  KEY `idx_entity` (`entity_type`, `entity_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- BLOCO 2: TABELA DE ESCOLAS
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
  KEY `idx_schools_code` (`code`),
  KEY `idx_schools_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- BLOCO 3: ADICIONAR CAMPOS EM STUDENTS
-- =========================================================

-- Campo: birth_date
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'birth_date';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN birth_date date DEFAULT NULL AFTER birthdate',
  'SELECT "✓ Campo birth_date já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: cpf
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'cpf';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN cpf varchar(14) DEFAULT NULL AFTER birth_date',
  'SELECT "✓ Campo cpf já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: rg
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'rg';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN rg varchar(20) DEFAULT NULL AFTER cpf',
  'SELECT "✓ Campo rg já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: school_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'school_id';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN school_id int(11) DEFAULT NULL AFTER school, ADD KEY idx_school_id (school_id)',
  'SELECT "✓ Campo school_id já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: grade
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'grade';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN grade varchar(50) DEFAULT NULL AFTER school_id',
  'SELECT "✓ Campo grade já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: class_name
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'class_name';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN class_name varchar(100) DEFAULT NULL AFTER class',
  'SELECT "✓ Campo class_name já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Campo: address
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'students' 
  AND COLUMN_NAME = 'address';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE students ADD COLUMN address text DEFAULT NULL AFTER class_name',
  'SELECT "✓ Campo address já existe" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =========================================================
-- BLOCO 4: TABELAS AEE
-- =========================================================

-- Tabela: entrevistas_responsavel
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
  KEY `idx_student_id` (`student_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: student_notes
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
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: atendimentos
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
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_data_atendimento` (`data_atendimento`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: legislacoes
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- BLOCO 5: CONVERTER TABELAS EXISTENTES PARA MyISAM
-- =========================================================

-- Converter users
ALTER TABLE `users` ENGINE=MyISAM;

-- Converter sessions  
ALTER TABLE `sessions` ENGINE=MyISAM;

-- Converter students
ALTER TABLE `students` ENGINE=MyISAM;

-- Converter support_teachers (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'support_teachers';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE support_teachers ENGINE=MyISAM', 'SELECT "Tabela support_teachers não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter srm_rooms (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'srm_rooms';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE srm_rooms ENGINE=MyISAM', 'SELECT "Tabela srm_rooms não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter pdis (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pdis';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE pdis ENGINE=MyISAM', 'SELECT "Tabela pdis não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter pais (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pais';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE pais ENGINE=MyISAM', 'SELECT "Tabela pais não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter anamneses (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'anamneses';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE anamneses ENGINE=MyISAM', 'SELECT "Tabela anamneses não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter attendance (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attendance';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE attendance ENGINE=MyISAM', 'SELECT "Tabela attendance não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter courses (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'courses';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE courses ENGINE=MyISAM', 'SELECT "Tabela courses não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter course_enrollments (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'course_enrollments';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE course_enrollments ENGINE=MyISAM', 'SELECT "Tabela course_enrollments não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter weekly_plans (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'weekly_plans';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE weekly_plans ENGINE=MyISAM', 'SELECT "Tabela weekly_plans não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter weekly_plan_items (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'weekly_plan_items';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE weekly_plan_items ENGINE=MyISAM', 'SELECT "Tabela weekly_plan_items não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter agenda_events (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'agenda_events';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE agenda_events ENGINE=MyISAM', 'SELECT "Tabela agenda_events não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Converter events (se existir)
SET @table_exists = 0;
SELECT COUNT(*) INTO @table_exists 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'events';
SET @sql = IF(@table_exists > 0, 'ALTER TABLE events ENGINE=MyISAM', 'SELECT "Tabela events não existe" AS info');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- =========================================================
-- BLOCO 6: OTIMIZAR TABELAS MyISAM
-- =========================================================

OPTIMIZE TABLE `users`;
OPTIMIZE TABLE `sessions`;
OPTIMIZE TABLE `students`;
OPTIMIZE TABLE `migrations`;
OPTIMIZE TABLE `activity_log`;
OPTIMIZE TABLE `schools`;
OPTIMIZE TABLE `entrevistas_responsavel`;
OPTIMIZE TABLE `student_notes`;
OPTIMIZE TABLE `atendimentos`;
OPTIMIZE TABLE `legislacoes`;

-- =========================================================
-- BLOCO 7: REGISTRAR MIGRATIONS
-- =========================================================

INSERT IGNORE INTO `migrations` (`migration_name`, `executed_at`) VALUES
('add_student_modern_fields', NOW()),
('fix_support_teacher_foreign_key', NOW()),
('create_schools_table', NOW()),
('create_entrevistas_table', NOW()),
('create_student_notes_table', NOW()),
('create_atendimentos_table', NOW()),
('ensure_modalidade_not_null', NOW()),
('convert_to_myisam', NOW());

-- =========================================================
-- BLOCO 8: VERIFICAÇÃO FINAL
-- =========================================================

SELECT 
  '✅ FIX MYISAM COMPLETO!' AS status,
  COUNT(*) AS total_tabelas_convertidas
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND ENGINE = 'MyISAM';

SELECT 
  TABLE_NAME,
  ENGINE,
  TABLE_ROWS AS linhas,
  ROUND(DATA_LENGTH/1024/1024, 2) AS tamanho_mb
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
