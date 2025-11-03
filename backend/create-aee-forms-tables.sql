-- ========================================
-- SCHEMA: FORMULÁRIOS AEE COMPLETOS
-- Data: 31/10/2025
-- Descrição: Tabelas para Entrevista, PDI e Plano de Atendimento Individual
-- ========================================

-- Tabela de Entrevistas com Responsável
CREATE TABLE IF NOT EXISTS entrevista_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  created_by_teacher_id INT NOT NULL,
  
  -- Dados JSON do formulário (180+ campos)
  form_data JSON NOT NULL,
  
  -- Metadados
  status ENUM('rascunho', 'finalizado', 'aprovado') DEFAULT 'rascunho',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_entrevista_student (student_id),
  INDEX idx_entrevista_teacher (created_by_teacher_id),
  INDEX idx_entrevista_status (status),
  INDEX idx_entrevista_created (created_at),
  
  -- Foreign Keys
  CONSTRAINT fk_entrevista_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT fk_entrevista_teacher
    FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de PDI (Plano de Desenvolvimento Individual)
CREATE TABLE IF NOT EXISTS pdi_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  created_by_teacher_id INT NOT NULL,
  
  -- Dados JSON do formulário (250+ campos)
  form_data JSON NOT NULL,
  
  -- Período de vigência
  data_inicio DATE,
  data_fim DATE,
  
  -- Metadados
  status ENUM('rascunho', 'vigente', 'concluido', 'cancelado') DEFAULT 'rascunho',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_pdi_student (student_id),
  INDEX idx_pdi_teacher (created_by_teacher_id),
  INDEX idx_pdi_status (status),
  INDEX idx_pdi_vigencia (data_inicio, data_fim),
  INDEX idx_pdi_created (created_at),
  
  -- Foreign Keys
  CONSTRAINT fk_pdi_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT fk_pdi_teacher
    FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Planos de Atendimento Individual (PAI)
CREATE TABLE IF NOT EXISTS plano_atendimento_forms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  created_by_teacher_id INT NOT NULL,
  
  -- Referência opcional ao PDI
  pdi_id INT DEFAULT NULL,
  
  -- Dados JSON do formulário (80+ campos)
  form_data JSON NOT NULL,
  
  -- Período
  data_inicio DATE,
  data_fim DATE,
  
  -- Metadados
  status ENUM('rascunho', 'ativo', 'concluido', 'cancelado') DEFAULT 'rascunho',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_pai_student (student_id),
  INDEX idx_pai_teacher (created_by_teacher_id),
  INDEX idx_pai_pdi (pdi_id),
  INDEX idx_pai_status (status),
  INDEX idx_pai_periodo (data_inicio, data_fim),
  INDEX idx_pai_created (created_at),
  
  -- Foreign Keys
  CONSTRAINT fk_pai_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT fk_pai_teacher
    FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
    
  CONSTRAINT fk_pai_pdi
    FOREIGN KEY (pdi_id) REFERENCES pdi_forms(id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificar tabelas criadas
SHOW TABLES LIKE '%forms';

-- Ver estrutura das tabelas
DESCRIBE entrevista_forms;
DESCRIBE pdi_forms;
DESCRIBE plano_atendimento_forms;
