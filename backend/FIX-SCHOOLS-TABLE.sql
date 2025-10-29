-- =========================================================
-- CONECTEDU - FIX PONTUAL: Tabela SCHOOLS
-- Versão SIMPLIFICADA (sem PREPARE - funciona em hospedagem compartilhada)
-- 
-- Problema: Campo 'city' não existe na tabela schools
-- Solução: Recriar tabela com estrutura correta
-- 
-- ⚠️ ATENÇÃO: Execute os comandos UM POR VEZ se der erro!
-- 
-- INSTRUÇÕES:
-- 1. Acesse phpMyAdmin
-- 2. Selecione banco 'conectedu'
-- 3. Aba SQL
-- 4. Cole os comandos abaixo
-- 5. Clique Executar
-- =========================================================

-- =========================================================
-- MÉTODO 1: RECRIAR TABELA (SE PUDER PERDER DADOS)
-- =========================================================

-- Apagar tabela antiga (CUIDADO: perde dados!)
-- DROP TABLE IF EXISTS schools;

-- =========================================================
-- MÉTODO 2: AJUSTAR TABELA EXISTENTE (PRESERVA DADOS)
-- =========================================================

-- Remover campos incorretos (execute um por vez se der erro)
-- ALTER TABLE schools DROP COLUMN IF EXISTS city;
-- ALTER TABLE schools DROP COLUMN IF EXISTS created_by_teacher_id;

-- =========================================================
-- MÉTODO 3: CRIAR/RECRIAR COM ESTRUTURA CORRETA
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

-- Converter para MyISAM
ALTER TABLE schools ENGINE=MyISAM;

-- Otimizar
OPTIMIZE TABLE schools;

-- Converter para MyISAM
ALTER TABLE schools ENGINE=MyISAM;

-- Otimizar
OPTIMIZE TABLE schools;

-- =========================================================
-- VERIFICAÇÃO FINAL
-- =========================================================

-- Mostrar estrutura atual
SHOW CREATE TABLE schools;

-- Contar registros
SELECT 
  COUNT(*) AS total_escolas
FROM schools;

-- ✅ Estrutura correta: id, name, code, address, phone, email, type, status, created_at, updated_at

