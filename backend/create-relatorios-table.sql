-- ========================================
-- TABELA: RELATÓRIOS DE ATENDIMENTO
-- Data: 31/10/2025
-- Descrição: Armazena relatórios de atendimento com suporte a áudio e transcrição IA
-- ========================================

CREATE TABLE IF NOT EXISTS relatorios_atendimento (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  
  -- Data e hora do atendimento
  data_atendimento DATETIME NOT NULL,
  duracao_minutos INT DEFAULT NULL COMMENT 'Duração em minutos',
  
  -- Tipo de atendimento
  tipo ENUM('individual', 'grupo', 'familia', 'outros') DEFAULT 'individual',
  local VARCHAR(100) DEFAULT NULL COMMENT 'Local do atendimento (sala, online, etc)',
  
  -- Conteúdo
  descricao TEXT NOT NULL COMMENT 'Descrição textual do atendimento',
  objetivos TEXT DEFAULT NULL COMMENT 'Objetivos trabalhados',
  atividades TEXT DEFAULT NULL COMMENT 'Atividades realizadas',
  recursos TEXT DEFAULT NULL COMMENT 'Recursos utilizados',
  observacoes TEXT DEFAULT NULL COMMENT 'Observações adicionais',
  
  -- Áudio e transcrição
  audio_path VARCHAR(255) DEFAULT NULL COMMENT 'Caminho do arquivo de áudio',
  audio_duration_seconds INT DEFAULT NULL COMMENT 'Duração do áudio em segundos',
  transcricao TEXT DEFAULT NULL COMMENT 'Transcrição automática do áudio (OpenAI Whisper)',
  transcricao_status ENUM('pendente', 'processando', 'concluida', 'erro') DEFAULT NULL,
  
  -- Avaliação
  progresso ENUM('excelente', 'bom', 'regular', 'dificuldade') DEFAULT NULL,
  proximos_passos TEXT DEFAULT NULL COMMENT 'Próximos passos e recomendações',
  
  -- Metadados
  status ENUM('rascunho', 'finalizado') DEFAULT 'rascunho',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Índices
  INDEX idx_relatorio_student (student_id),
  INDEX idx_relatorio_teacher (teacher_id),
  INDEX idx_relatorio_data (data_atendimento),
  INDEX idx_relatorio_tipo (tipo),
  INDEX idx_relatorio_status (status),
  INDEX idx_relatorio_created (created_at),
  
  -- Foreign Keys
  CONSTRAINT fk_relatorio_student
    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT fk_relatorio_teacher
    FOREIGN KEY (teacher_id) REFERENCES users(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Relatórios de atendimento AEE com suporte a áudio e transcrição IA';

-- Verificar tabela criada
DESCRIBE relatorios_atendimento;

-- Contar registros (deve ser 0)
SELECT COUNT(*) as total FROM relatorios_atendimento;
