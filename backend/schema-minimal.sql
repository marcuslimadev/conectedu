-- --------------------------------------------------------
-- ConectEDU - Schema Mínimo para Deployment
-- Compatível com MySQL 5.x / MariaDB / cPanel
-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE='NO_AUTO_VALUE_ON_ZERO';

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS `conectedu` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `conectedu`;

-- ========================================
-- TABELAS ESSENCIAIS
-- ========================================

-- 1. USERS (BASE)
DROP TABLE IF EXISTS `users`;
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
  UNIQUE KEY `email` (`email`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Inserir usuário admin padrão
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Administrador', 'admin@conectedu.local', '$2y$10$2Y26dQkYFZg0U0U2b9yJ8eUjXbO1pYz3y0GYoFzV8v7g2YQv2rLxC', 'admin', 'ativo', NOW(), NOW());

-- 2. SESSIONS
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(64) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. SUPPORT TEACHERS
DROP TABLE IF EXISTS `support_teachers`;
CREATE TABLE `support_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `support_teachers` (`name`, `capacity`, `status`) VALUES
('Prof. Apoio 1', 3, 'ativo'),
('Prof. Apoio 2', 3, 'ativo'),
('Prof. Apoio 3', 3, 'ativo');

-- 4. SRM ROOMS
DROP TABLE IF EXISTS `srm_rooms`;
CREATE TABLE `srm_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 12,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO `srm_rooms` (`name`, `capacity`, `status`) VALUES
('Sala SRM 1', 12, 'ativo'),
('Sala SRM 2', 12, 'ativo');

-- 5. SCHOOLS
DROP TABLE IF EXISTS `schools`;
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
  KEY `idx_schools_name` (`name`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. STUDENTS
DROP TABLE IF EXISTS `students`;
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
  CONSTRAINT `fk_students_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_school` FOREIGN KEY (`school_id`) REFERENCES `schools` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_support_teacher` FOREIGN KEY (`support_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_srm_room` FOREIGN KEY (`srm_room_id`) REFERENCES `srm_rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_students_created_by` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. ENTREVISTAS RESPONSAVEL
DROP TABLE IF EXISTS `entrevistas_responsavel`;
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
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_entrevistas_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 8. ATENDIMENTOS
DROP TABLE IF EXISTS `atendimentos`;
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
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `fk_atendimentos_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_atendimentos_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 9. STUDENT NOTES
DROP TABLE IF EXISTS `student_notes`;
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
  KEY `student_id` (`student_id`),
  KEY `teacher_id` (`teacher_id`),
  CONSTRAINT `fk_notes_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notes_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 10. LEGISLAÇÕES
DROP TABLE IF EXISTS `legislacoes`;
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
  KEY `idx_legislacoes_titulo` (`titulo`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 11. MIGRATIONS
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `migration_name` varchar(255) NOT NULL,
  `executed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `migration_name` (`migration_name`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS=1;

-- FIM
