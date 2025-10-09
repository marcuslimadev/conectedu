-- Script para remover sistema de aprovação de usuários
-- ConectAEE v5.0

-- 1. Atualizar todos os usuários pendentes para ativo
UPDATE users SET status = 'ativo' WHERE status = 'pendente';

-- 2. Remover notificações de aprovação pendente
DELETE FROM notifications WHERE type = 'user_pending_approval';

-- 3. Verificar se há outras referências em dados JSON
UPDATE notifications SET data = JSON_REMOVE(data, '$.pending_approval') WHERE JSON_CONTAINS_PATH(data, 'one', '$.pending_approval');

-- 4. Limpar sessões antigas de usuários que eram pendentes (opcional)
-- DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE status = 'pendente');

-- 5. Verificar status final
SELECT 'Status dos usuários:' as info;
SELECT status, COUNT(*) as total FROM users GROUP BY status;

SELECT 'Notificações restantes:' as info;
SELECT type, COUNT(*) as total FROM notifications GROUP BY type;

SELECT 'Limpeza concluída com sucesso!' as resultado;