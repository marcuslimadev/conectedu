-- ==========================================
-- Migração: Atualizar tabela students
-- Adiciona campos modernos necessários
-- ==========================================

-- Adicionar campos complementares (ignora se já existirem)
ALTER TABLE students 
ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER responsible_phone,
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14) NULL AFTER birth_date,
ADD COLUMN IF NOT EXISTS rg VARCHAR(20) NULL AFTER cpf,
ADD COLUMN IF NOT EXISTS grade VARCHAR(50) NULL AFTER rg,
ADD COLUMN IF NOT EXISTS class_name VARCHAR(50) NULL AFTER grade,
ADD COLUMN IF NOT EXISTS address TEXT NULL AFTER class_name,
ADD COLUMN IF NOT EXISTS school_id INT DEFAULT NULL AFTER address;

-- Adicionar índice e chave estrangeira para school_id (se não existir)
-- Nota: MySQL não tem "IF NOT EXISTS" para foreign keys, então use com cuidado
-- Se a FK já existir, você verá um erro (pode ignorar)
ALTER TABLE students ADD INDEX IF NOT EXISTS idx_school_id (school_id);

-- Tente adicionar a foreign key (comente se já existir)
-- ALTER TABLE students ADD CONSTRAINT fk_students_school_id FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL;

-- Fim da migração
