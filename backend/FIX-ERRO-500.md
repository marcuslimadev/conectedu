# 🚨 GUIA DE CORREÇÃO - Erro 500 em Produção

## 📋 Problema Identificado

Erro: `GET /backend/api.php/stats 500 (Internal Server Error)`

**Causa**: Tabela `activity_log` não existe ou foi criada com `ENGINE=InnoDB` em servidor que não suporta.

---

## 🎯 Solução Rápida (3 minutos)

### Passo 1: Acessar phpMyAdmin
1. Faça login no **cPanel** da sua hospedagem
2. Procure por **phpMyAdmin** e clique
3. Selecione o banco de dados `conectedu` (ou nome que você usou)

### Passo 2: Executar Script de Diagnóstico
No phpMyAdmin, clique em **SQL** e cole:

```sql
SHOW ENGINES;
```

**O que procurar**:
- ✅ Se `InnoDB` aparecer com `YES` ou `DEFAULT` → Seu servidor suporta
- ❌ Se `InnoDB` aparecer com `NO` ou `DISABLED` → Precisa converter
- ❌ Se `InnoDB` não aparecer → MyISAM será usado

### Passo 3: Criar Tabela activity_log

Cole este código no SQL do phpMyAdmin:

```sql
USE conectedu;

DROP TABLE IF EXISTS `activity_log`;

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
```

**Resultado esperado**: `✅ Query executada com sucesso`

### Passo 4: Testar se Funcionou

Cole este código:

```sql
SELECT 'OK' AS status FROM activity_log LIMIT 1;
```

Se retornar uma linha (mesmo vazia), está funcionando!

---

## 🔧 Solução Completa (Se a rápida não resolver)

### Cenário A: InnoDB Não Disponível

Se no Passo 2 você viu que InnoDB não está disponível, execute:

```sql
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE users ENGINE=MyISAM;
ALTER TABLE sessions ENGINE=MyISAM;
ALTER TABLE students ENGINE=MyISAM;
ALTER TABLE support_teachers ENGINE=MyISAM;
ALTER TABLE srm_rooms ENGINE=MyISAM;
ALTER TABLE schools ENGINE=MyISAM;
ALTER TABLE activity_log ENGINE=MyISAM;

SET FOREIGN_KEY_CHECKS=1;
```

### Cenário B: Verificar Tabelas Faltando

```sql
SHOW TABLES;
```

**Tabelas obrigatórias**:
- `users`
- `sessions`
- `students`
- `activity_log`
- `migrations`

Se alguma estiver faltando, importe o arquivo: **`backend/schema-universal.sql`**

### Cenário C: Criar Admin se Não Existir

```sql
SELECT id, email FROM users WHERE role = 'admin';
```

Se retornar vazio, execute:

```sql
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
```

**Login**: admin@teste.com / password

---

## 📁 Scripts SQL Prontos

Todos os scripts estão na pasta `backend/`:

| Arquivo | Descrição |
|---------|-----------|
| `sql-diagnostico-01-engines.sql` | Ver engines disponíveis |
| `sql-diagnostico-02-tabelas.sql` | Listar tabelas existentes |
| `sql-diagnostico-03-erros.sql` | Ver erros do MySQL |
| `sql-fix-01-activity-log.sql` | ✅ Criar tabela activity_log |
| `sql-fix-02-converter-myisam.sql` | Converter todas para MyISAM |
| `sql-fix-03-criar-admin.sql` | Criar usuário admin |
| `sql-fix-04-remover-foreign-keys.sql` | Remover constraints |
| `sql-fix-MASTER.sql` | 🎯 Script mestre com tudo |

---

## 🧪 Como Testar

Após executar os scripts, teste no navegador:

1. **Teste de API**: 
   ```
   https://conectaee.com.br/backend/api.php/diagnose
   ```
   
   Deve retornar JSON com informações do sistema.

2. **Teste de Stats**:
   ```
   https://conectaee.com.br/backend/api.php/stats
   ```
   
   Deve retornar JSON com estatísticas (não mais erro 500).

3. **Teste de Login**:
   - Acesse: https://conectaee.com.br
   - Login: admin@teste.com
   - Senha: password

---

## 🆘 Troubleshooting Avançado

### Erro Persiste Após Scripts?

**1. Verificar Logs do PHP**

No cPanel → **Error Log** ou **Metrics → Errors**

Procure por:
- `Table 'conectedu.activity_log' doesn't exist`
- `Unknown storage engine 'InnoDB'`
- `SQLSTATE[42S02]`

**2. Verificar Permissões do Banco**

```sql
SHOW GRANTS FOR CURRENT_USER;
```

Precisa ter: `SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP`

**3. Verificar Conexão do PHP**

No cPanel, crie arquivo `test-db.php`:

```php
<?php
require 'backend/functions.php';
try {
    $pdo = db();
    echo "✅ Conexão OK\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM users");
    echo "✅ Tabela users acessível\n";
    $stmt = $pdo->query("SELECT COUNT(*) FROM activity_log");
    echo "✅ Tabela activity_log acessível\n";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage();
}
```

Acesse: `https://conectaee.com.br/test-db.php`

**4. Limpar Cache**

No navegador:
- Ctrl + Shift + Delete
- Limpar cache e cookies
- Hard Reload: Ctrl + F5

---

## 📞 Checklist Final

- [ ] Executei `sql-fix-01-activity-log.sql`
- [ ] Tabela `activity_log` existe (verificado com `SHOW TABLES`)
- [ ] `/stats` não retorna mais 500
- [ ] `/diagnose` retorna JSON válido
- [ ] Consigo fazer login
- [ ] Dashboard carrega sem erros

---

## 🎯 Comandos Copy-Paste

### Teste Completo em 1 Comando

Cole isto no phpMyAdmin SQL:

```sql
USE conectedu;

-- Criar activity_log se não existir
CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
);

-- Verificar
SELECT 
  'activity_log existe?' AS teste,
  COUNT(*) AS resultado
FROM information_schema.tables 
WHERE table_schema = 'conectedu' 
AND table_name = 'activity_log';

-- Se resultado = 1, está OK!
```

---

**Última atualização**: 16/10/2025  
**Versão do sistema**: 5.0.1
