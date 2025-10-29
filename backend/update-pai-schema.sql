-- Atualização da tabela planos_atendimento (PAI) para suportar teacher-centric
-- Adiciona campos de referência student_id e teacher_id

ALTER TABLE planos_atendimento 
ADD COLUMN IF NOT EXISTS student_id INT NULL AFTER id,
ADD COLUMN IF NOT EXISTS teacher_id INT NULL AFTER student_id,
ADD COLUMN IF NOT EXISTS created_by_teacher_id INT NULL AFTER teacher_id;

-- Adicionar índices para performance
ALTER TABLE planos_atendimento
ADD INDEX IF NOT EXISTS idx_pai_student_id (student_id),
ADD INDEX IF NOT EXISTS idx_pai_teacher_id (teacher_id),
ADD INDEX IF NOT EXISTS idx_pai_created_by_teacher_id (created_by_teacher_id);

-- Os campos student_id e teacher_id devem ser preenchidos pelo frontend
-- ao criar um novo PAI, referenciando as tabelas students e users
