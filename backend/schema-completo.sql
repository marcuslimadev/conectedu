-- --------------------------------------------------------
-- ConectEDU - Schema Completo em Ordem Correta
-- Versão: 5.0.1 (Ultra-Compatível)
-- Data: 2025-10-16
-- --------------------------------------------------------

-- Configurações básicas
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS `conectedu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `conectedu`;

-- ========================================
-- NÍVEL 1: Tabelas sem dependências
-- ========================================

-- Tabela: users (base de tudo)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','professor','coordenador') DEFAULT 'professor',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais users
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Administrador', 'admin@conectedu.local', '$2y$10$2Y26dQkYFZg0U0U2b9yJ8eUjXbO1pYz3y0GYoFzV8v7g2YQv2rLxC', 'admin', 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08');

-- Tabela: support_teachers (independente)
CREATE TABLE IF NOT EXISTS `support_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais support_teachers
INSERT INTO `support_teachers` (`name`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
	('Prof. Apoio 1', 3, 'ativo', NOW(), NOW()),
	('Prof. Apoio 2', 3, 'ativo', NOW(), NOW()),
	('Prof. Apoio 3', 3, 'ativo', NOW(), NOW());

-- Tabela: srm_rooms (independente)
CREATE TABLE IF NOT EXISTS `srm_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 12,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais srm_rooms
INSERT INTO `srm_rooms` (`name`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
	('Sala SRM 1', 12, 'ativo', NOW(), NOW()),
	('Sala SRM 2', 12, 'ativo', NOW(), NOW());

-- Tabela: courses (independente)
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `code` varchar(40) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `workload` int(11) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dados iniciais courses
INSERT INTO `courses` (`name`, `code`, `description`, `workload`, `status`, `created_at`, `updated_at`) VALUES
	('Matemática Básica', 'MATBAS', 'Curso introdutório de matemática', 60, 'ativo', NOW(), NOW()),
	('Português Aplicado', 'PORAPL', 'Leitura e produção de texto', 60, 'ativo', NOW(), NOW()),
	('Tecnologias Assistivas', 'TECASS', 'Ferramentas e práticas inclusivas', 40, 'ativo', NOW(), NOW());

-- Tabela: schools (independente)
CREATE TABLE IF NOT EXISTS `schools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `type` enum('municipal','estadual','federal','particular') DEFAULT 'municipal',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_schools_name` (`name`),
  KEY `idx_schools_code` (`code`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- NÍVEL 2: Tabelas que dependem de NÍVEL 1
-- ========================================

-- Tabela: sessions (depende de users)
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  KEY `token_2` (`token`),
  CONSTRAINT `fk_sessions_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: agenda_events (depende de users)
CREATE TABLE IF NOT EXISTS `agenda_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `date_start` datetime NOT NULL,
  `date_end` datetime DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `date_start` (`date_start`),
  KEY `date_end` (`date_end`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_agenda_events_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: students (depende de users, support_teachers, srm_rooms, schools)
CREATE TABLE IF NOT EXISTS `students` (
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
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `support_teacher_id` (`support_teacher_id`),
  KEY `srm_room_id` (`srm_room_id`),
  KEY `school_id` (`school_id`),
  KEY `modalidade` (`modalidade`),
  KEY `status` (`status`),
  KEY `idx_students_name` (`name`),
  KEY `idx_students_modalidade` (`modalidade`),
  KEY `idx_students_support_teacher_id` (`support_teacher_id`),
  KEY `idx_students_created_by_teacher_id` (`created_by_teacher_id`),
  CONSTRAINT `fk_students_srm_room_id` FOREIGN KEY (`srm_room_id`) REFERENCES `srm_rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_support_teacher_id` FOREIGN KEY (`support_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_created_by_teacher_id` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_school_id` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: legislacoes (independente, mas aqui por organização)
CREATE TABLE IF NOT EXISTS `legislacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `tamanho_arquivo` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_legislacoes_titulo` (`titulo`),
  KEY `idx_legislacoes_created_at` (`created_at`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ========================================
-- NÍVEL 3: Tabelas que dependem de students
-- ========================================

-- Tabela: anamneses (depende de students)
CREATE TABLE IF NOT EXISTS `anamneses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_anamneses_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: entrevistas_responsavel (depende de students)
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
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_entrevistas_responsavel_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: pdis (depende de students)
CREATE TABLE IF NOT EXISTS `pdis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `objectives` text DEFAULT NULL,
  `strategies` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_pdis_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: pais (depende de students)
CREATE TABLE IF NOT EXISTS `pais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `goals` text DEFAULT NULL,
  `services` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_pais_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: attendance (depende de students)
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `period` enum('manha','tarde','noite') DEFAULT 'manha',
  `present` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`date`,`period`),
  KEY `student_id` (`student_id`),
  KEY `date` (`date`),
  KEY `idx_attendance_student` (`student_id`),
  KEY `idx_attendance_date` (`date`),
  CONSTRAINT `fk_attendance_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: atendimentos (depende de students e users)
CREATE TABLE IF NOT EXISTS `atendimentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `data_atendimento` date NOT NULL,
  `descricao` longtext NOT NULL,
  `objetivos` text DEFAULT NULL,
  `recursos` text DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  KEY `data_atendimento` (`data_atendimento`),
  CONSTRAINT `fk_atendimentos_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_atendimentos_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: student_notes (depende de students e users)
CREATE TABLE IF NOT EXISTS `student_notes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `source` varchar(50) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `fk_student_notes_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_student_notes_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: weekly_plans (depende de students)
CREATE TABLE IF NOT EXISTS `weekly_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `support_teacher_id` int(11) DEFAULT NULL,
  `week_start` date NOT NULL,
  `objectives` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `week_start` (`week_start`),
  KEY `idx_weekly_plans_support_teacher_id` (`support_teacher_id`),
  CONSTRAINT `fk_weekly_plans_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: weekly_plan_items (depende de weekly_plans)
CREATE TABLE IF NOT EXISTS `weekly_plan_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `weekly_plan_id` int(11) NOT NULL,
  `day` enum('seg','ter','qua','qui','sex') NOT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `description` text DEFAULT NULL,
  `materials` text DEFAULT NULL,
  `interventions` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `weekly_plan_id` (`weekly_plan_id`),
  CONSTRAINT `fk_weekly_plan_items_weekly_plan_id` FOREIGN KEY (`weekly_plan_id`) REFERENCES `weekly_plans` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: course_enrollments (depende de students e courses)
CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrolled_at` datetime DEFAULT current_timestamp(),
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`),
  CONSTRAINT `fk_course_enrollments_course_id` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_course_enrollments_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: events (depende de students e users)
CREATE TABLE IF NOT EXISTS `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `type` enum('atendimento','reuniao','avaliacao','outros') DEFAULT 'atendimento',
  `status` enum('agendado','realizado','cancelado') DEFAULT 'agendado',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `user_id` (`user_id`),
  KEY `start_datetime` (`start_datetime`),
  CONSTRAINT `fk_events_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_events_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Tabela: migrations (controle de versão do schema)
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL UNIQUE,
  `executed_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_migration_name` (`migration_name`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Restaurar configurações
SET FOREIGN_KEY_CHECKS = 1;

-- FIM DO SCHEMA
-- Schema criado com sucesso! 🎉
