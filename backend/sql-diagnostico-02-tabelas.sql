-- ================================================================
-- SCRIPT 3: VERIFICAR TABELAS EXISTENTES
-- Cole no phpMyAdmin para ver quais tabelas já existem
-- ================================================================

USE conectedu;

-- Ver todas as tabelas
SHOW TABLES;

-- Contar quantas tabelas existem
SELECT COUNT(*) AS total_tabelas FROM information_schema.tables 
WHERE table_schema = 'conectedu';

-- Ver tabelas que podem estar faltando
SELECT 'users' AS tabela_necessaria
UNION SELECT 'students'
UNION SELECT 'sessions'
UNION SELECT 'activity_log'
UNION SELECT 'migrations'
UNION SELECT 'entrevistas_responsavel'
UNION SELECT 'atendimentos'
UNION SELECT 'student_notes'
UNION SELECT 'schools';
