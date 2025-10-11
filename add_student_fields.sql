-- Adicionar campos complementares na tabela students
ALTER TABLE students 
ADD COLUMN birth_date DATE NULL AFTER responsible_phone,
ADD COLUMN cpf VARCHAR(14) NULL AFTER birth_date,
ADD COLUMN rg VARCHAR(20) NULL AFTER cpf,
ADD COLUMN grade VARCHAR(50) NULL AFTER rg,
ADD COLUMN class_name VARCHAR(50) NULL AFTER grade,
ADD COLUMN address TEXT NULL AFTER class_name;