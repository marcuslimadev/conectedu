USE conectedu;

-- Adicionar campo created_by_teacher_id na tabela students se não existir
ALTER TABLE `students` ADD COLUMN IF NOT EXISTS `created_by_teacher_id` int(11) DEFAULT NULL;
ALTER TABLE `students` ADD INDEX IF NOT EXISTS `idx_students_created_by_teacher_id` (`created_by_teacher_id`);

-- Tentar adicionar constraint (pode falhar se já existir)
SET @sql = CONCAT('ALTER TABLE `students` ADD CONSTRAINT `fk_students_created_by_teacher_id` FOREIGN KEY (`created_by_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Criar tabela atendimentos
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

-- Criar tabela legislacoes
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