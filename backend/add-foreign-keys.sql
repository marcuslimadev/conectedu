-- ========================================
-- SCRIPT DE INTEGRIDADE: FOREIGN KEYS
-- Data: 31/10/2025
-- Descrição: Adiciona foreign keys com ON DELETE CASCADE para integridade referencial
-- ========================================

-- ATENÇÃO: Este script pode falhar se houver dados órfãos no banco
-- Execute primeiro: SELECT * FROM students WHERE created_by_teacher_id NOT IN (SELECT id FROM users);

-- Desabilitar verificações temporariamente
SET FOREIGN_KEY_CHECKS=0;

-- ========== TABELA STUDENTS ==========

-- Remover índices antigos se existirem (para recriar como FK)
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_teacher;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_school;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_support_teacher;
ALTER TABLE students DROP FOREIGN KEY IF EXISTS fk_students_srm_room;

-- Adicionar Foreign Keys
ALTER TABLE students
  ADD CONSTRAINT fk_students_teacher
  FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE students
  ADD CONSTRAINT fk_students_school
  FOREIGN KEY (school_id) REFERENCES schools(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

ALTER TABLE students
  ADD CONSTRAINT fk_students_support_teacher
  FOREIGN KEY (support_teacher_id) REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- SRM room será adicionado quando tabela for criada
-- ALTER TABLE students
--   ADD CONSTRAINT fk_students_srm_room
--   FOREIGN KEY (srm_room_id) REFERENCES srm_rooms(id)
--   ON DELETE SET NULL;

-- ========== TABELA SCHOOLS ==========

ALTER TABLE schools DROP FOREIGN KEY IF EXISTS fk_schools_teacher;

ALTER TABLE schools
  ADD CONSTRAINT fk_schools_teacher
  FOREIGN KEY (created_by_teacher_id) REFERENCES users(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- ========== TABELA SESSIONS ==========

ALTER TABLE sessions DROP FOREIGN KEY IF EXISTS fk_sessions_user;

ALTER TABLE sessions
  ADD CONSTRAINT fk_sessions_user
  FOREIGN KEY (user_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- ========== TABELA COURSE_TEACHERS ==========

ALTER TABLE course_teachers DROP FOREIGN KEY IF EXISTS fk_ct_course;
ALTER TABLE course_teachers DROP FOREIGN KEY IF EXISTS fk_ct_teacher;

ALTER TABLE course_teachers
  ADD CONSTRAINT fk_ct_course
  FOREIGN KEY (course_id) REFERENCES courses(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE course_teachers
  ADD CONSTRAINT fk_ct_teacher
  FOREIGN KEY (teacher_id) REFERENCES users(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Reabilitar verificações
SET FOREIGN_KEY_CHECKS=1;

-- Verificar Foreign Keys criadas
SELECT 
  kcu.TABLE_NAME,
  kcu.CONSTRAINT_NAME,
  kcu.COLUMN_NAME,
  kcu.REFERENCED_TABLE_NAME,
  kcu.REFERENCED_COLUMN_NAME,
  rc.DELETE_RULE,
  rc.UPDATE_RULE
FROM information_schema.KEY_COLUMN_USAGE kcu
LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc 
  ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME 
  AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
WHERE kcu.TABLE_SCHEMA = 'conectedu'
  AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
ORDER BY kcu.TABLE_NAME, kcu.CONSTRAINT_NAME;
