-- ================================================================
-- SCRIPT 8: FIX COMPLETO - EXECUTAR EM ORDEM
-- Execute os scripts nesta ordem para resolver o erro 500
-- ================================================================

-- PASSO 1: Verificar engines disponíveis
-- Cole: sql-diagnostico-01-engines.sql

-- PASSO 2: Criar tabela activity_log
-- Cole: sql-fix-01-activity-log.sql

-- PASSO 3: Verificar se todas as tabelas existem
-- Cole: sql-diagnostico-02-tabelas.sql

-- PASSO 4 (OPCIONAL): Se InnoDB não estiver disponível
-- Cole: sql-fix-02-converter-myisam.sql

-- PASSO 5: Criar usuário admin
-- Cole: sql-fix-03-criar-admin.sql

-- PASSO 6: Verificar erros
-- Cole: sql-diagnostico-03-erros.sql

-- ================================================================
-- TESTE RÁPIDO: Cole isto para testar se o sistema está OK
-- ================================================================

USE conectedu;

-- 1. Verificar se tabelas essenciais existem
SELECT 
  'users' AS tabela,
  COUNT(*) AS existe 
FROM information_schema.tables 
WHERE table_schema = 'conectedu' AND table_name = 'users'

UNION ALL

SELECT 
  'students' AS tabela,
  COUNT(*) AS existe
FROM information_schema.tables 
WHERE table_schema = 'conectedu' AND table_name = 'students'

UNION ALL

SELECT 
  'activity_log' AS tabela,
  COUNT(*) AS existe
FROM information_schema.tables 
WHERE table_schema = 'conectedu' AND table_name = 'activity_log'

UNION ALL

SELECT 
  'sessions' AS tabela,
  COUNT(*) AS existe
FROM information_schema.tables 
WHERE table_schema = 'conectedu' AND table_name = 'sessions';

-- 2. Verificar se admin existe
SELECT 
  'Admin existe?' AS verificacao,
  COUNT(*) AS resultado
FROM users 
WHERE email LIKE '%admin%' OR role = 'admin';

-- 3. Contar registros
SELECT 'Total de usuários' AS info, COUNT(*) AS total FROM users
UNION ALL
SELECT 'Total de alunos' AS info, COUNT(*) AS total FROM students
UNION ALL
SELECT 'Total de atividades' AS info, COUNT(*) AS total FROM activity_log;

-- Se todos os SELECT acima funcionarem, seu banco está OK!
