-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para conectedu
CREATE DATABASE IF NOT EXISTS `conectedu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `conectedu`;

-- Copiando estrutura para tabela conectedu.agenda_events
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.agenda_events: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.anamneses
CREATE TABLE IF NOT EXISTS `anamneses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `created_at` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_anamneses_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.anamneses: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.attendance
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.attendance: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.courses
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.courses: ~0 rows (aproximadamente)
INSERT INTO `courses` (`id`, `name`, `code`, `description`, `workload`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Matemática Básica', 'MATBAS', 'Curso introdutório de matemática', 60, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(2, 'Português Aplicado', 'PORAPL', 'Leitura e produção de texto', 60, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(3, 'Tecnologias Assistivas', 'TECASS', 'Ferramentas e práticas inclusivas', 40, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(4, 'Matemática Básica', 'MATBAS', 'Curso introdutório de matemática', 60, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17'),
	(5, 'Português Aplicado', 'PORAPL', 'Leitura e produção de texto', 60, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17'),
	(6, 'Tecnologias Assistivas', 'TECASS', 'Ferramentas e práticas inclusivas', 40, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17');

-- Copiando estrutura para tabela conectedu.course_enrollments
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.course_enrollments: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.events
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
  KEY `start_datetime` (`start_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.events: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.pais
CREATE TABLE IF NOT EXISTS `pais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `goals` text DEFAULT NULL,
  `services` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_pais_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.pais: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.pdis
CREATE TABLE IF NOT EXISTS `pdis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `objectives` text DEFAULT NULL,
  `strategies` text DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('ativo','concluido','cancelado') DEFAULT 'ativo',
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `fk_pdis_student_id` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.pdis: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.sessions
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.sessions: ~0 rows (aproximadamente)
INSERT INTO `sessions` (`id`, `token`, `user_id`, `created_at`, `expires_at`) VALUES
	(1, 'e8f846a0604277332c75d10a383a22b118a8c43695aec9bcc1a0dd80f576f070', 3, '2025-09-23 18:19:13', '2025-09-26 18:19:13');

-- Copiando estrutura para tabela conectedu.srm_rooms
CREATE TABLE IF NOT EXISTS `srm_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 12,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.srm_rooms: ~0 rows (aproximadamente)
INSERT INTO `srm_rooms` (`id`, `name`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Sala SRM 1', 12, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(2, 'Sala SRM 2', 12, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(3, 'Sala SRM 1', 12, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17'),
	(4, 'Sala SRM 2', 12, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17');

-- Copiando estrutura para tabela conectedu.students
CREATE TABLE IF NOT EXISTS `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `responsible_name` varchar(120) DEFAULT NULL,
  `responsible_phone` varchar(20) DEFAULT NULL,
  `responsible_email` varchar(120) DEFAULT NULL,
  `school` varchar(120) DEFAULT NULL,
  `class` varchar(50) DEFAULT NULL,
  `shift` enum('manha','tarde','noite') DEFAULT NULL,
  `disability_type` varchar(120) DEFAULT NULL,
  `cid_code` varchar(20) DEFAULT NULL,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `modalidade` enum('apoio','srm') NOT NULL,
  `support_teacher_id` int(11) DEFAULT NULL,
  `srm_room_id` int(11) DEFAULT NULL,
  `created_by_teacher_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `support_teacher_id` (`support_teacher_id`),
  KEY `srm_room_id` (`srm_room_id`),
  KEY `modalidade` (`modalidade`),
  KEY `status` (`status`),
  KEY `idx_students_name` (`name`),
  KEY `idx_students_modalidade` (`modalidade`),
  KEY `idx_students_support_teacher_id` (`support_teacher_id`),
  KEY `idx_students_created_by_teacher_id` (`created_by_teacher_id`),
  CONSTRAINT `fk_students_srm_room_id` FOREIGN KEY (`srm_room_id`) REFERENCES `srm_rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_support_teacher_id` FOREIGN KEY (`support_teacher_id`) REFERENCES `support_teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_students_created_by_teacher_id` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.students: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.support_teachers
CREATE TABLE IF NOT EXISTS `support_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(120) NOT NULL,
  `capacity` int(11) DEFAULT 3,
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.support_teachers: ~0 rows (aproximadamente)
INSERT INTO `support_teachers` (`id`, `name`, `capacity`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Prof. Apoio 1', 3, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(2, 'Prof. Apoio 2', 3, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(3, 'Prof. Apoio 3', 3, 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(4, 'Prof. Apoio 1', 3, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17'),
	(5, 'Prof. Apoio 2', 3, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17'),
	(6, 'Prof. Apoio 3', 3, 'ativo', '2025-09-23 20:53:17', '2025-09-23 20:53:17');

-- Copiando estrutura para tabela conectedu.users
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.users: ~1 rows (aproximadamente)
INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
	(1, 'Administrador', 'admin@conectedu.local', '$2y$10$2Y26dQkYFZg0U0U2b9yJ8eUjXbO1pYz3y0GYoFzV8v7g2YQv2rLxC', 'admin', 'ativo', '2025-09-23 20:53:08', '2025-09-23 20:53:08'),
	(3, 'Marcus André Lima de Lima', 'marcus.lima@hotmail.com.br', '$2y$10$vc0E38d42JpJHci/e2ROfeqi3.3T4HJeIzZy1G.Wvv4aUfaZ5ePrW', 'professor', 'ativo', '2025-09-23 18:19:13', '2025-09-23 18:19:13');

-- Copiando estrutura para tabela conectedu.weekly_plans
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.weekly_plans: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.weekly_plan_items
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.weekly_plan_items: ~0 rows (aproximadamente)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
-- Copiando estrutura para tabela conectedu.atendimentos
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.atendimentos: ~0 rows (aproximadamente)

-- Copiando estrutura para tabela conectedu.legislacoes
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela conectedu.legislacoes: ~0 rows (aproximadamente)

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
