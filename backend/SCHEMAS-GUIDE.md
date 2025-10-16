# 🗄️ Guia de Schemas do ConectEDU

## 📋 Arquivos Disponíveis

### 1️⃣ `schema-universal.sql` ⭐ **RECOMENDADO**
- ✅ Compatível com **qualquer versão** MySQL/MariaDB
- ✅ Sem especificação de ENGINE (usa padrão do servidor)
- ✅ Sem constraints CHECK (compatibilidade total)
- ✅ `INSERT IGNORE` (não dá erro se já existir)
- ✅ Foreign keys removidas (criadas via migrations)
- 🎯 **Use este para produção via cPanel**

### 2️⃣ `schema-completo.sql`
- ⚠️ Versão completa com todas as tabelas
- ⚠️ Pode ter problemas em alguns servidores
- 📦 Contém: 21 tabelas + foreign keys + seed data
- 🔧 Requer ENGINE=InnoDB (removido por script)

### 3️⃣ `schema-minimal.sql`
- 🎯 Apenas 11 tabelas essenciais
- 🚀 Para testes rápidos
- ✅ DROP TABLE antes de criar (recria do zero)
- ⚠️ **Apaga dados existentes!**

### 4️⃣ `schema.sql` (original)
- 📜 Schema antigo mantido para referência
- ❌ Não usar para deploy novo

### 5️⃣ `schema-aee.sql` (original)
- 📜 Apenas tabelas AEE
- ❌ Não usar sozinho (faltam dependências)

---

## 🚀 Como Usar

### Via MySQL CLI (Local - XAMPP)
```bash
# Criar banco novo
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS conectedu"

# Importar schema universal
mysql -u root -p conectedu < backend/schema-universal.sql
```

### Via cPanel (Produção)
1. Acesse **phpMyAdmin** no cPanel
2. Crie o database `conectedu` (ou nome configurado)
3. Selecione o database
4. Vá em **Importar**
5. Escolha: `backend/schema-universal.sql`
6. Clique em **Executar**

### Via PHP (Automático)
O sistema já tem **migrations automáticas**:
```php
// No primeiro acesso à API, executa automaticamente:
require_once 'migrations.php';
run_migrations($pdo);
```

---

## 🔧 Troubleshooting

### ❌ Erro: "Unknown storage engine 'InnoDB'"
**Solução**: Use `schema-universal.sql` (não especifica engine)

### ❌ Erro: "Syntax error near 'CHECK'"
**Solução**: `schema-universal.sql` já remove constraints CHECK

### ❌ Erro: "Cannot add foreign key constraint"
**Causas possíveis**:
1. Tabela pai não existe → Verifique ordem de criação
2. Tipos de dados diferentes → Use `schema-universal.sql`
3. ENGINE diferente entre tabelas → Use `schema-universal.sql`

**Solução**: O `schema-universal.sql` **não cria foreign keys**! Elas são criadas via migrations depois que todas as tabelas existem.

### ❌ Erro: "Duplicate entry '1' for key 'PRIMARY'"
**Solução**: Use `INSERT IGNORE` (já incluído no schema-universal)

---

## 🎯 Estrutura de Tabelas

### Nível 1 - Base (sem dependências)
- `users` - Usuários do sistema
- `support_teachers` - Professores de apoio
- `srm_rooms` - Salas de recursos
- `schools` - Escolas
- `courses` - Cursos

### Nível 2 - Depende de Nível 1
- `sessions` → users
- `students` → users, support_teachers, srm_rooms, schools
- `agenda_events` → users

### Nível 3 - Depende de students
- `entrevistas_responsavel`
- `atendimentos`
- `student_notes`
- `pdis`
- `pais`
- `anamneses`
- `attendance`
- `weekly_plans`
- `course_enrollments`
- `events`

### Independentes
- `legislacoes`
- `migrations`

---

## 📊 Dados Seed (Pré-cadastrados)

### Usuário Admin
- **Email**: admin@conectedu.local
- **Senha**: Admin@123 (hash pré-calculado)
- **Role**: admin

### Professores de Apoio
- Prof. Apoio 1, 2, 3 (capacidade: 3 alunos cada)

### Salas SRM
- Sala SRM 1 e 2 (capacidade: 12 alunos cada)

### Cursos
- Matemática Básica (60h)
- Português Aplicado (60h)
- Tecnologias Assistivas (40h)

---

## 🔄 Migrations vs Schema

### Quando usar Schema SQL direto?
- ✅ **Primeira instalação** (banco vazio)
- ✅ **Reset completo** do database
- ✅ **Servidor novo** (staging/produção)

### Quando usar Migrations?
- ✅ **Atualizar banco existente** (já tem dados)
- ✅ **Adicionar novas tabelas/campos**
- ✅ **Deploy incremental** (preserva dados)

---

## 📝 Comandos Úteis

### Verificar versão do MySQL
```bash
mysql --version
```

### Ver storage engines disponíveis
```sql
SHOW ENGINES;
```

### Ver tabelas criadas
```sql
USE conectedu;
SHOW TABLES;
```

### Ver estrutura de uma tabela
```sql
DESCRIBE users;
```

### Ver foreign keys
```sql
SELECT * FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'conectedu' 
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## 🎁 Dica Final

Para **produção limpa**:
1. Use `schema-universal.sql` (cria estrutura base)
2. Deixe migrations executarem automaticamente (via `api.php`)
3. Verifique endpoint `/diagnose` para confirmar sucesso
4. Crie admin via `/create-admin` ou script PHP

**Schema pronto para qualquer servidor!** 🚀
