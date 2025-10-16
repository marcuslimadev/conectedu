-- ================================================================
-- SCRIPT 2: CRIAR TABELA ACTIVITY_LOG (SEM ENGINE)
-- Cole no phpMyAdmin se a tabela não existir ou deu erro 500
-- ================================================================

USE conectedu;

-- Apagar tabela antiga se existir
DROP TABLE IF EXISTS `activity_log`;

-- Criar tabela nova SEM especificar ENGINE
CREATE TABLE `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `action` (`action`),
  KEY `created_at` (`created_at`)
);

-- Verificar se foi criada
SELECT 'Tabela activity_log criada com sucesso!' AS resultado;
SHOW TABLES LIKE 'activity_log';
