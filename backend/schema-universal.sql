-- =========================================================
-- ConectEDU - Schema Universal
-- Compatível com MySQL 5.x/8.x e MariaDB (qualquer engine)
-- =========================================================

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

CREATE DATABASE IF NOT EXISTS `conectedu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `conectedu`;

-- USERS
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `email` varchar(120) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','professor','coordenador') DEFAULT 'professor',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@conectedu.local', '$2y$10$2Y26dQkYFZg0U0U2b9yJ8eUjXbO1pYz3y0GYoFzV8v7g2YQv2rLxC', 'admin', 'ativo', NOW(), NOW());

-- SESSIONS
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`)
);

-- SUPPORT_TEACHERS
CREATE TABLE IF NOT EXISTS `support_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT IGNORE INTO `support_teachers` VALUES
(1, 'Prof. Apoio 1', 3, 'ativo', NOW(), NOW()),
(2, 'Prof. Apoio 2', 3, 'ativo', NOW(), NOW()),
(3, 'Prof. Apoio 3', 3, 'ativo', NOW(), NOW());

-- SRM_ROOMS
CREATE TABLE IF NOT EXISTS `srm_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 12,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT IGNORE INTO `srm_rooms` VALUES
(1, 'Sala SRM 1', 12, 'ativo', NOW(), NOW()),
(2, 'Sala SRM 2', 12, 'ativo', NOW(), NOW());

-- SCHOOLS
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
  PRIMARY KEY (`id`)
);

-- STUDENTS
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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `school_id` (`school_id`),
  KEY `support_teacher_id` (`support_teacher_id`),
  KEY `srm_room_id` (`srm_room_id`),
  KEY `created_by_teacher_id` (`created_by_teacher_id`)
);

-- ENTREVISTAS_RESPONSAVEL
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

-- ATENDIMENTOS
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
  KEY `teacher_id` (`teacher_id`)
);

-- STUDENT_NOTES
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

-- PDIS
CREATE TABLE IF NOT EXISTS `pdis` (
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
  KEY `student_id` (`student_id`)
);

-- PAIS
CREATE TABLE IF NOT EXISTS `pais` (
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
  KEY `student_id` (`student_id`)
);

-- ANAMNESES
CREATE TABLE IF NOT EXISTS `anamneses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `answers` longtext NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `period` enum('manha','tarde','noite') DEFAULT 'manha',
  `present` tinyint(1) DEFAULT 1,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attendance` (`student_id`,`date`,`period`)
);

-- COURSES
CREATE TABLE IF NOT EXISTS `courses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `code` varchar(40) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `workload` int(11) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

INSERT IGNORE INTO `courses` VALUES
(1, 'Matemática Básica', 'MATBAS', 'Curso introdutório de matemática', 60, 'ativo', NOW(), NOW()),
(2, 'Português Aplicado', 'PORAPL', 'Leitura e produção de texto', 60, 'ativo', NOW(), NOW()),
(3, 'Tecnologias Assistivas', 'TECASS', 'Ferramentas e práticas inclusivas', 40, 'ativo', NOW(), NOW());

-- COURSE_ENROLLMENTS
CREATE TABLE IF NOT EXISTS `course_enrollments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `course_id` int(11) NOT NULL,
  `enrolled_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `course_id` (`course_id`)
);

-- WEEKLY_PLANS
CREATE TABLE IF NOT EXISTS `weekly_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `support_teacher_id` int(11) DEFAULT NULL,
  `week_start` date NOT NULL,
  `objectives` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`)
);

-- WEEKLY_PLAN_ITEMS
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
  KEY `weekly_plan_id` (`weekly_plan_id`)
);

-- AGENDA_EVENTS
CREATE TABLE IF NOT EXISTS `agenda_events` (
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
  KEY `user_id` (`user_id`)
);

-- EVENTS
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
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  KEY `user_id` (`user_id`)
);

-- LEGISLACOES
CREATE TABLE IF NOT EXISTS `legislacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `arquivo_pdf` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `tamanho_arquivo` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

-- MIGRATIONS
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
);

SET FOREIGN_KEY_CHECKS=1;
