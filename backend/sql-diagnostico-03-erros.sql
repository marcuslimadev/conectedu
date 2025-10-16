-- ================================================================
-- SCRIPT 6: VERIFICAR ERROS NO LOG DO MySQL
-- Cole no phpMyAdmin para ver últimos erros
-- ================================================================

-- Ver variáveis do servidor
SHOW VARIABLES LIKE '%version%';
SHOW VARIABLES LIKE '%engine%';
SHOW VARIABLES LIKE '%foreign_key%';

-- Ver status do servidor
SHOW STATUS LIKE '%error%';

-- Ver warnings da última query
SHOW WARNINGS;

-- Ver engines suportadas com detalhes
SELECT 
  ENGINE,
  SUPPORT,
  COMMENT,
  TRANSACTIONS,
  XA,
  SAVEPOINTS
FROM information_schema.ENGINES
ORDER BY SUPPORT DESC, ENGINE;
