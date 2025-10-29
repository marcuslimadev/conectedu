-- Adicionar campo de foto na tabela students
ALTER TABLE students 
ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL AFTER school_name;

-- Criar diretório de uploads para fotos
-- Executar no terminal: mkdir -p backend/uploads/students
