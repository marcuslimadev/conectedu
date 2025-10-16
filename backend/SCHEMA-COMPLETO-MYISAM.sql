-- =========================================================
-- CONECTEDU - SCHEMA COMPLETO MyISAM
-- Versão: 1.0.0 - Recria banco de dados do zero
-- 
-- ⚠️ ATENÇÃO: Este script APAGA e RECRIA todas as tabelas!
-- Use apenas para instalação limpa ou reset completo
-- 
-- INSTRUÇÕES:
-- 1. Faça BACKUP do banco atual (se tiver dados importantes)
-- 2. Acesse phpMyAdmin no cPanel
-- 3. Selecione o banco 'conectedu'
-- 4. Aba SQL
-- 5. Cole TODO este arquivo
-- 6. Clique em Executar
-- =========================================================



SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

-- =========================================================
-- APAGAR TABELAS EXISTENTES (ordem correta)
-- =========================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `activity_log`;
DROP TABLE IF EXISTS `weekly_plan_items`;
DROP TABLE IF EXISTS `weekly_plans`;
DROP TABLE IF EXISTS `course_enrollments`;
DROP TABLE IF EXISTS `events`;
DROP TABLE IF EXISTS `agenda_events`;
DROP TABLE IF EXISTS `atendimentos`;
DROP TABLE IF EXISTS `student_notes`;
DROP TABLE IF EXISTS `entrevistas_responsavel`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `anamneses`;
DROP TABLE IF EXISTS `pais`;
DROP TABLE IF EXISTS `pdis`;
DROP TABLE IF EXISTS `legislacoes`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `courses`;
DROP TABLE IF EXISTS `srm_rooms`;
DROP TABLE IF EXISTS `support_teachers`;
DROP TABLE IF EXISTS `schools`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `migrations`;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- TABELAS BASE (sem dependências)
-- =========================================================

-- Tabela: users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','professor','coordenador') DEFAULT 'professor',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir usuário admin padrão
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@conectedu.local', '$2y$10$2Y26dQkYFZg0U0U2b9yJ8eUjXbO1pYz3y0GYoFzV8v7g2YQv2rLxC', 'admin', 'ativo', NOW(), NOW());

-- Tabela: support_teachers
CREATE TABLE `support_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_teachers_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais support_teachers
INSERT INTO `support_teachers` (`name`, `capacity`, `status`) VALUES
('Prof. Apoio 1', 3, 'ativo'),
('Prof. Apoio 2', 3, 'ativo'),
('Prof. Apoio 3', 3, 'ativo');

-- Tabela: srm_rooms
CREATE TABLE `srm_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 12,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_srm_rooms_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais srm_rooms
INSERT INTO `srm_rooms` (`name`, `capacity`, `status`) VALUES
('Sala SRM 1', 12, 'ativo'),
('Sala SRM 2', 12, 'ativo');

-- Tabela: courses
CREATE TABLE `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `code` varchar(40) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `workload` int(11) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_courses_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais courses
INSERT INTO `courses` (`name`, `code`, `description`, `workload`, `status`) VALUES
('Matemática Básica', 'MATBAS', 'Curso introdutório de matemática', 60, 'ativo'),
('Português Aplicado', 'PORAPL', 'Leitura e produção de texto', 60, 'ativo'),
('Tecnologias Assistivas', 'TECASS', 'Ferramentas e práticas inclusivas', 40, 'ativo');

-- Tabela: schools
CREATE TABLE `schools` (
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
-- TABELAS DE CONTROLE
-- =========================================================

-- Tabela: sessions
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: migrations
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: activity_log
CREATE TABLE `activity_log` (
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
-- TABELA PRINCIPAL: STUDENTS
-- =========================================================

CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `rg` varchar(20) DEFAULT NULL,
  `responsible_name` varchar(120) DEFAULT NULL,
  `responsible_phone` varchar(20) DEFAULT NULL,
  `responsible_email` varchar(120) DEFAULT NULL,
  `school` varchar(120) DEFAULT NULL,
  `school_id` int(11) DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `class_name` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `shift` enum('manha','tarde','noite') DEFAULT NULL,
  `disability_type` varchar(120) DEFAULT NULL,
  `cid_code` varchar(20) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `modalidade` enum('apoio','srm') NOT NULL DEFAULT 'srm',
  `support_teacher_id` int(11) DEFAULT NULL,
  `srm_room_id` int(11) DEFAULT NULL,
  `created_by_teacher_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `school_id` (`school_id`),
  KEY `support_teacher_id` (`support_teacher_id`),
  KEY `srm_room_id` (`srm_room_id`),
  KEY `created_by_teacher_id` (`created_by_teacher_id`),
  KEY `idx_students_name` (`name`),
  KEY `idx_students_modalidade` (`modalidade`),
  KEY `idx_students_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABELAS DEPENDENTES DE STUDENTS
-- =========================================================

-- Tabela: anamneses
CREATE TABLE `anamneses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `answers` longtext NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: entrevistas_responsavel
CREATE TABLE `entrevistas_responsavel` (
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

-- Tabela: pdis
CREATE TABLE `pdis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `objectives` text DEFAULT NULL,
  `strategies` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `idx_pdis_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: pais
CREATE TABLE `pais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `goals` text DEFAULT NULL,
  `services` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `idx_pais_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: attendance
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `period` enum('manha','tarde','noite') DEFAULT 'manha',
  `present` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`date`,`period`),
  KEY `student_id` (`student_id`),
  KEY `date` (`date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: atendimentos
CREATE TABLE `atendimentos` (
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
  KEY `idx_data_atendimento` (`data_atendimento`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: student_notes
CREATE TABLE `student_notes` (
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

-- Tabela: weekly_plans
CREATE TABLE `weekly_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `support_teacher_id` int(11) DEFAULT NULL,
  `week_start` date NOT NULL,
  `objectives` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `week_start` (`week_start`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: weekly_plan_items
CREATE TABLE `weekly_plan_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `weekly_plan_id` int(11) NOT NULL,
  `day` enum('seg','ter','qua','qui','sex') NOT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `description` text DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `interventions` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `weekly_plan_id` (`weekly_plan_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: course_enrollments
CREATE TABLE `course_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABELAS DE EVENTOS
-- =========================================================

-- Tabela: agenda_events
CREATE TABLE `agenda_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `date_start` datetime NOT NULL,
  `date_end` datetime DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `date_start` (`date_start`),
  KEY `date_end` (`date_end`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: events
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('atendimento','reuniao','avaliacao','outros') DEFAULT 'atendimento',
  `status` enum('agendado','realizado','cancelado') DEFAULT 'agendado',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `user_id` (`user_id`),
  KEY `start_datetime` (`start_datetime`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABELA DE LEGISLAÇÕES
-- =========================================================

CREATE TABLE `legislacoes` (
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
-- REGISTRAR MIGRATIONS INICIAIS
-- =========================================================

INSERT INTO `migrations` (`migration_name`, `executed_at`) VALUES
('initial_schema', NOW()),
('add_student_modern_fields', NOW()),
('fix_support_teacher_foreign_key', NOW()),
('create_schools_table', NOW()),
('create_entrevistas_table', NOW()),
('create_student_notes_table', NOW()),
('create_atendimentos_table', NOW()),
('ensure_modalidade_not_null', NOW()),
('convert_to_myisam', NOW());

-- =========================================================
-- OTIMIZAR TODAS AS TABELAS
-- =========================================================

OPTIMIZE TABLE `users`;
OPTIMIZE TABLE `support_teachers`;
OPTIMIZE TABLE `srm_rooms`;
OPTIMIZE TABLE `courses`;
OPTIMIZE TABLE `schools`;
OPTIMIZE TABLE `sessions`;
OPTIMIZE TABLE `migrations`;
OPTIMIZE TABLE `activity_log`;
OPTIMIZE TABLE `students`;
OPTIMIZE TABLE `anamneses`;
OPTIMIZE TABLE `entrevistas_responsavel`;
OPTIMIZE TABLE `pdis`;
OPTIMIZE TABLE `pais`;
OPTIMIZE TABLE `attendance`;
OPTIMIZE TABLE `atendimentos`;
OPTIMIZE TABLE `student_notes`;
OPTIMIZE TABLE `weekly_plans`;
OPTIMIZE TABLE `weekly_plan_items`;
OPTIMIZE TABLE `course_enrollments`;
OPTIMIZE TABLE `agenda_events`;
OPTIMIZE TABLE `events`;
OPTIMIZE TABLE `legislacoes`;

-- =========================================================
-- VERIFICAÇÃO FINAL
-- =========================================================

SELECT '✅ SCHEMA COMPLETO CRIADO COM SUCESSO!' AS status;

SELECT 
  TABLE_NAME,
  ENGINE,
  TABLE_ROWS AS linhas,
  ROUND(DATA_LENGTH/1024/1024, 2) AS tamanho_mb,
  ROUND(INDEX_LENGTH/1024/1024, 2) AS indices_mb
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;

SELECT 
  '✅ Total de Tabelas Criadas' AS info,
  COUNT(*) AS total
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE();
