-- ================================================================
-- SCRIPT 5: CRIAR USUÁRIO ADMIN DIRETO NO SQL
-- Cole no phpMyAdmin se o endpoint /create-admin não funcionar
-- ================================================================

USE conectedu;

-- Verificar se admin já existe
SELECT id, name, email, role FROM users WHERE email = 'admin@teste.com';

-- Se não existir, criar (cole apenas se SELECT acima retornou vazio)
INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) 
VALUES (
  'Administrador',
  'admin@teste.com',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'admin',
  'ativo',
  NOW(),
  NOW()
);

-- Verificar se foi criado
SELECT id, name, email, role, status FROM users WHERE email = 'admin@teste.com';

-- CREDENCIAIS:
-- Email: admin@teste.com
-- Senha: password
