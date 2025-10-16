-- =========================================================
-- CONECTEDU - FIX PONTUAL: Tabela SCHOOLS
-- Correção rápida para executar direto no phpMyAdmin
-- 
-- Problema: Campo 'city' não existe na tabela schools
-- Solução: Garantir estrutura correta da tabela
-- 
-- INSTRUÇÕES:
-- 1. Acesse phpMyAdmin
-- 2. Selecione banco 'conectedu'
-- 3. Aba SQL
-- 4. Cole TODO este script
-- 5. Clique Executar
-- =========================================================

USE conectedu;

-- =========================================================
-- OPÇÃO 1: Se a tabela JÁ EXISTE (ajustar campos)
-- =========================================================

-- Verificar e remover campo 'city' se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'city';

SET @sql = IF(@col_exists > 0, 
  'ALTER TABLE schools DROP COLUMN city',
  'SELECT "✓ Campo city não existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar e remover campo 'created_by_teacher_id' se existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'created_by_teacher_id';

SET @sql = IF(@col_exists > 0, 
  'ALTER TABLE schools DROP COLUMN created_by_teacher_id',
  'SELECT "✓ Campo created_by_teacher_id não existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo 'code' se não existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'code';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE schools ADD COLUMN code varchar(50) DEFAULT NULL AFTER name, ADD KEY idx_schools_code (code)',
  'SELECT "✓ Campo code já existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo 'type' se não existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'type';

SET @sql = IF(@col_exists = 0, 
  "ALTER TABLE schools ADD COLUMN type enum('municipal','estadual','federal','particular') DEFAULT 'municipal' AFTER email",
  'SELECT "✓ Campo type já existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Adicionar campo 'status' se não existir
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'status';

SET @sql = IF(@col_exists = 0, 
  "ALTER TABLE schools ADD COLUMN status enum('ativo','inativo') DEFAULT 'ativo' AFTER type, ADD KEY idx_schools_status (status)",
  'SELECT "✓ Campo status já existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Garantir campo 'updated_at' existe
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'schools' 
  AND COLUMN_NAME = 'updated_at';

SET @sql = IF(@col_exists = 0, 
  'ALTER TABLE schools ADD COLUMN updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
  'SELECT "✓ Campo updated_at já existe (OK)" AS info');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Converter para MyISAM (se ainda não for)
ALTER TABLE schools ENGINE=MyISAM;

-- Otimizar tabela
OPTIMIZE TABLE schools;

-- =========================================================
-- OPÇÃO 2: Se a tabela NÃO EXISTE (criar do zero)
-- =========================================================

CREATE TABLE IF NOT EXISTS `schools` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `type` enum('municipal','estadual','federal','particular') DEFAULT 'municipal',
  `status` enum('ativo','inativo') DEFAULT 'ativo',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_schools_name` (`name`),
  KEY `idx_schools_code` (`code`),
  KEY `idx_schools_status` (`status`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- VERIFICAÇÃO FINAL
-- =========================================================

SELECT '✅ TABELA SCHOOLS CORRIGIDA!' AS status;

-- Mostrar estrutura atual
DESCRIBE schools;

-- Mostrar dados existentes (se houver)
SELECT 
  COUNT(*) AS total_escolas,
  COUNT(CASE WHEN status = 'ativo' THEN 1 END) AS ativas,
  COUNT(CASE WHEN status = 'inativo' THEN 1 END) AS inativas
FROM schools;

SELECT '📊 Estrutura esperada da tabela schools:' AS info;
SELECT 'id, name, code, address, phone, email, type, status, created_at, updated_at' AS campos_corretos;
