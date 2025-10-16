# 🗄️ InnoDB vs MyISAM - Qual Usar?

## 📊 Comparação Rápida

| Característica | InnoDB | MyISAM |
|---------------|--------|--------|
| **Transações ACID** | ✅ Sim | ❌ Não |
| **Foreign Keys** | ✅ Sim | ❌ Não |
| **Travamento** | Por linha | Por tabela |
| **Performance Leitura** | Boa | Melhor |
| **Performance Escrita** | Melhor | Boa |
| **Crash Recovery** | ✅ Excelente | ⚠️ Limitado |
| **Espaço em disco** | Maior | Menor |
| **Disponibilidade** | MySQL 5.5+ | Todos |

---

## 🎯 Qual Script Usar?

### Opção 1: `FIX-PRODUCAO.sql` ✅ RECOMENDADO
**Use quando:**
- ✅ InnoDB está disponível (maioria dos servidores modernos)
- ✅ Quer melhor integridade de dados
- ✅ Quer suporte a transações
- ✅ Precisa de foreign keys (opcional no sistema)

**Características:**
- Não especifica ENGINE (usa padrão do servidor)
- Funciona em 99% dos casos
- Melhor para produção moderna

### Opção 2: `FIX-PRODUCAO-MYISAM.sql` ⚠️ ALTERNATIVA
**Use quando:**
- ❌ InnoDB NÃO está disponível
- ⚠️ Servidor antigo/restrito
- ⚠️ Recebe erro "Unknown storage engine 'InnoDB'"

**Características:**
- Força MyISAM em todas as tabelas
- Converte tabelas existentes para MyISAM
- **Funciona em qualquer servidor MySQL**
- Sem foreign keys (sistema não usa de forma crítica)

---

## 🧪 Como Testar qual ENGINE seu servidor suporta?

Execute no phpMyAdmin:

```sql
SHOW ENGINES;
```

### Resultado - InnoDB Disponível
Se você ver algo como:
```
InnoDB | DEFAULT | Supports transactions...
```
**Use:** `FIX-PRODUCAO.sql` ✅

### Resultado - InnoDB Indisponível
Se InnoDB não aparecer ou mostrar "NO" ou "DISABLED":
```
InnoDB | NO | InnoDB is disabled
```
**Use:** `FIX-PRODUCAO-MYISAM.sql` ⚠️

---

## 🔄 Diferenças Práticas no ConectEDU

### Com InnoDB (Recomendado)
```sql
-- Tabela com integridade referencial
CREATE TABLE students (
  ...
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;
```
✅ Se deletar um usuário, registros relacionados são tratados  
✅ Operações simultâneas mais eficientes  
✅ Rollback automático em caso de erro  

### Com MyISAM (Funcional)
```sql
-- Mesma tabela, sem foreign keys
CREATE TABLE students (
  ...
  -- Foreign key ignorada
) ENGINE=MyISAM;
```
✅ Funciona perfeitamente para o sistema  
⚠️ Integridade referencial controlada pelo PHP  
⚠️ Precisa de cuidado manual ao deletar registros  

---

## 🚨 Impacto no ConectEDU

### O que CONTINUA funcionando com MyISAM?
✅ **TUDO!** O sistema foi projetado para funcionar com ambos:
- ✅ Login e autenticação
- ✅ CRUD de alunos, professores, etc
- ✅ Formulários AEE (Entrevistas, PDIs, Planos)
- ✅ Relatórios PDF
- ✅ Upload de arquivos
- ✅ Transcrição de áudio
- ✅ Dashboard e estatísticas

### O que muda internamente?
⚠️ **Integridade referencial:**
- InnoDB: Automática via foreign keys
- MyISAM: Controlada pelo código PHP (já implementado)

**Exemplo prático:**
```php
// backend/api.php já faz validação manual
if ($action === 'students.delete') {
  $user = require_auth();
  
  // Deleta relacionamentos manualmente
  $pdo->exec("DELETE FROM attendance WHERE student_id = $id");
  $pdo->exec("DELETE FROM pdis WHERE student_id = $id");
  $pdo->exec("DELETE FROM students WHERE id = $id");
  
  // Funciona igual em InnoDB e MyISAM!
}
```

---

## 📋 Guia de Migração InnoDB → MyISAM

Se você já tem banco em InnoDB e quer converter:

### Passo 1: Backup Completo
```sql
-- Via phpMyAdmin: Exportar → Gerar SQL completo
```

### Passo 2: Remover Foreign Keys
```sql
-- Ver foreign keys existentes
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME
FROM information_schema.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'conectedu'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Remover cada uma (exemplo)
ALTER TABLE students DROP FOREIGN KEY fk_students_user_id;
ALTER TABLE sessions DROP FOREIGN KEY fk_sessions_user_id;
-- ... repetir para todas
```

### Passo 3: Converter Tabelas
```sql
-- Executar FIX-PRODUCAO-MYISAM.sql
-- Ele já converte automaticamente
```

---

## 🎯 Recomendação Final

### Para Produção Nova (cPanel/hospedagem compartilhada):
1. **Tente primeiro:** `FIX-PRODUCAO.sql`
2. **Se der erro InnoDB:** `FIX-PRODUCAO-MYISAM.sql`

### Para Produção Existente:
- **Já funciona?** Não mude!
- **Deu erro 500?** Execute `FIX-PRODUCAO.sql`
- **Continua erro InnoDB?** Execute `FIX-PRODUCAO-MYISAM.sql`

### Para Servidor VPS/Dedicado:
- **Use InnoDB** - Melhor performance e confiabilidade
- Configure: `innodb_buffer_pool_size` adequado

---

## 🔧 Comandos Úteis

### Ver ENGINE de uma tabela
```sql
SHOW CREATE TABLE students;
```

### Ver ENGINE de todas as tabelas
```sql
SELECT 
  TABLE_NAME,
  ENGINE,
  TABLE_ROWS,
  DATA_LENGTH/1024/1024 AS 'Size_MB'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'conectedu';
```

### Converter UMA tabela específica
```sql
ALTER TABLE nome_da_tabela ENGINE=MyISAM;
-- ou
ALTER TABLE nome_da_tabela ENGINE=InnoDB;
```

---

## ✅ Checklist de Validação

Após executar qualquer script, teste:

- [ ] Login funciona
- [ ] Dashboard carrega sem erro 500
- [ ] Consegue criar/editar aluno
- [ ] Formulários AEE abrem
- [ ] Relatórios PDF geram
- [ ] Endpoint `/diagnose` responde

Se **TODOS** acima funcionam = **Sucesso!** 🎉

---

## 📞 Troubleshooting

### Erro: "Table doesn't exist"
**Solução:** Execute o script novamente (ele cria tabelas faltantes)

### Erro: "Column already exists"  
**Solução:** Normal! Significa que já existe, script continua

### Erro: "Cannot convert to MyISAM"
**Solução:** 
1. Remova foreign keys primeiro
2. Execute conversão novamente

### Sistema lento após converter para MyISAM
**Solução:**
```sql
-- Otimizar tabelas MyISAM
OPTIMIZE TABLE students, users, sessions, entrevistas_responsavel;
```

---

**Resumo:** Use InnoDB se disponível, MyISAM como alternativa. Ambos funcionam perfeitamente! ✨
