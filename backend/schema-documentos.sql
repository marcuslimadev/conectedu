-- ==============================================
-- SCHEMA: Sistema de Documentos Gerados (PDFs)
-- ==============================================
-- Autor: ConectEDU Team
-- Data: 2025-10-29
-- Descrição: Gerenciamento de PDFs gerados dos formulários AEE
-- ==============================================

CREATE TABLE IF NOT EXISTS documentos_gerados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  
  -- Tipo do documento
  tipo ENUM('entrevista', 'pdi', 'pai') NOT NULL,
  
  -- Relacionamentos
  form_id INT NOT NULL COMMENT 'ID do formulário original (entrevista/pdi/pai)',
  student_id INT NOT NULL COMMENT 'Aluno relacionado',
  teacher_id INT NOT NULL COMMENT 'Professor que gerou o documento',
  
  -- Metadados do arquivo
  file_path VARCHAR(500) NOT NULL COMMENT 'Caminho do PDF no servidor',
  file_name VARCHAR(255) NOT NULL COMMENT 'Nome original do arquivo',
  file_size INT UNSIGNED DEFAULT 0 COMMENT 'Tamanho em bytes',
  
  -- Informações adicionais
  titulo VARCHAR(255) DEFAULT NULL COMMENT 'Título personalizado do documento',
  observacoes TEXT DEFAULT NULL COMMENT 'Observações sobre o documento',
  
  -- Controle
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Soft delete',
  
  -- Índices para performance
  INDEX idx_tipo (tipo),
  INDEX idx_student (student_id),
  INDEX idx_teacher (teacher_id),
  INDEX idx_created (created_at),
  INDEX idx_tipo_student (tipo, student_id),
  INDEX idx_tipo_teacher (tipo, teacher_id)
  
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- Inserir documentos de exemplo (desenvolvimento)
-- ==============================================

-- INSERT INTO documentos_gerados (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
-- VALUES 
-- ('entrevista', 1, 18, 3, 'backend/uploads/documentos/entrevistas/entrevista_18_20251029.pdf', 'Entrevista - Pedro Henrique - 29-10-2025.pdf', 245678, 'Entrevista Inicial - Pedro Henrique'),
-- ('pdi', 1, 18, 3, 'backend/uploads/documentos/pdis/pdi_18_20251029.pdf', 'PDI - Pedro Henrique - 29-10-2025.pdf', 567890, 'PDI 2025 - Pedro Henrique'),
-- ('pai', 1, 18, 3, 'backend/uploads/documentos/pais/pai_18_20251029.pdf', 'PAI - Pedro Henrique - 29-10-2025.pdf', 123456, 'PAI Semestre 1 - Pedro Henrique');

-- ==============================================
-- Consultas úteis
-- ==============================================

-- Listar todos documentos de um aluno
-- SELECT * FROM documentos_gerados WHERE student_id = 18 AND deleted_at IS NULL ORDER BY created_at DESC;

-- Listar documentos por tipo e professor
-- SELECT * FROM documentos_gerados WHERE tipo = 'entrevista' AND teacher_id = 3 AND deleted_at IS NULL;

-- Estatísticas de documentos gerados
-- SELECT tipo, COUNT(*) as total, SUM(file_size) as tamanho_total 
-- FROM documentos_gerados 
-- WHERE deleted_at IS NULL 
-- GROUP BY tipo;
