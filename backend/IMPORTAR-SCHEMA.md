# 🗃️ Como Importar o Schema do ConectEDU

## 📋 Opção 1: Via phpMyAdmin (Recomendado para Produção)

### Passo a Passo:

1. **Acesse phpMyAdmin**
   - URL: `https://seudominio.com/phpmyadmin` ou através do cPanel

2. **Crie o banco de dados** (se ainda não existir)
   ```sql
   CREATE DATABASE conectedu CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   ```

3. **Selecione o banco `conectedu`** no menu lateral esquerdo

4. **Vá na aba "Importar"**

5. **Escolha o arquivo**
   - Clique em "Escolher arquivo"
   - Selecione: `backend/schema-completo.sql`

6. **Configurações de Importação**
   - ✅ Formato: SQL
   - ✅ Codificação: utf8mb4
   - ✅ Deixe as outras opções padrão

7. **Execute**
   - Clique em "Executar" no final da página
   - ⏱️ Aguarde a conclusão (pode demorar 10-30 segundos)

8. **Verifique**
   - Você deve ver: ✅ "Importação concluída com sucesso"
   - Número de tabelas criadas: **21 tabelas**
   - Dados inseridos: Usuário admin, cursos, salas, professores

---

## 💻 Opção 2: Via MySQL CLI (Desenvolvimento Local)

### Para Windows (XAMPP):

```powershell
# Navegue até a pasta do projeto
cd C:\xampp\htdocs\conectedu

# Importe o schema
mysql -u root -p conectedu < backend/schema-completo.sql
```

### Para Linux/Mac:

```bash
# Navegue até a pasta do projeto
cd /caminho/para/conectedu

# Importe o schema
mysql -u root -p conectedu < backend/schema-completo.sql
```

**Senha**: Geralmente vazia no XAMPP local, ou a senha que você configurou.

---

## 🔍 Verificar se deu certo

### Via phpMyAdmin:
1. Selecione o banco `conectedu`
2. Você deve ver **21 tabelas**:
   - ✅ users
   - ✅ students
   - ✅ sessions
   - ✅ anamneses
   - ✅ entrevistas_responsavel
   - ✅ pdis, pais, attendance
   - ✅ atendimentos, student_notes
   - ✅ E mais...

### Via MySQL CLI:

```sql
USE conectedu;
SHOW TABLES;
SELECT COUNT(*) FROM users; -- Deve retornar 1 (admin)
```

---

## 👤 Credenciais do Usuário Admin Padrão

Após importar o schema, você terá um usuário admin:

- **Email**: `admin@conectedu.local`
- **Senha**: `Admin@123` (hash já incluído no schema)
- **Role**: `admin`

### ⚠️ IMPORTANTE - Produção:
Após o primeiro login em produção, **altere imediatamente** a senha do admin!

---

## 🆘 Solução de Problemas

### ❌ Erro: "Table already exists"
**Solução**: O schema já foi importado. Se quiser reimportar:

```sql
-- Via phpMyAdmin ou MySQL CLI
DROP DATABASE conectedu;
CREATE DATABASE conectedu CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
-- Depois importe novamente
```

### ❌ Erro: "Unknown storage engine 'InnoDB'"
**Solução**: Seu MySQL não suporta InnoDB (raro). Use `schema-universal.sql`:

```powershell
mysql -u root -p conectedu < backend/schema-universal.sql
```

### ❌ Erro: "Cannot add foreign key constraint"
**Causa**: Foreign keys sendo criadas fora de ordem.

**Solução**: O `schema-completo.sql` já está na ordem correta. Se persistir:
1. Desative foreign key checks temporariamente (já feito no schema)
2. Verifique se todas as tabelas pai existem antes das filhas

### ❌ Erro: "Access denied for user"
**Solução**: Verifique credenciais do MySQL:

```sql
-- Criar usuário se necessário
CREATE USER 'conectedu_user'@'localhost' IDENTIFIED BY 'sua_senha_forte';
GRANT ALL PRIVILEGES ON conectedu.* TO 'conectedu_user'@'localhost';
FLUSH PRIVILEGES;
```

### ❌ Erro de charset/collation
**Solução**: Force UTF-8 no import:

```powershell
mysql -u root -p --default-character-set=utf8mb4 conectedu < backend/schema-completo.sql
```

---

## 📦 Estrutura do Schema

### Nível 1 - Tabelas Base (sem dependências):
1. `users` - Usuários do sistema
2. `support_teachers` - Professores de apoio
3. `srm_rooms` - Salas de recursos
4. `courses` - Cursos disponíveis
5. `schools` - Escolas

### Nível 2 - Dependem do Nível 1:
6. `sessions` - Tokens de autenticação
7. `agenda_events` - Eventos da agenda
8. `students` - Alunos (principal)
9. `legislacoes` - Documentos legais

### Nível 3 - Dependem de students:
10. `anamneses` - Anamneses dos alunos
11. `entrevistas_responsavel` - Entrevistas AEE
12. `pdis` - Planos de Desenvolvimento Individual
13. `pais` - Planos de Atendimento Individual
14. `attendance` - Frequência
15. `atendimentos` - Registros de atendimento
16. `student_notes` - Anotações sobre alunos
17. `weekly_plans` - Planejamentos semanais
18. `weekly_plan_items` - Itens dos planejamentos
19. `course_enrollments` - Matrículas em cursos
20. `events` - Eventos relacionados a alunos
21. `migrations` - Controle de versão do schema

---

## 🚀 Próximos Passos Após Importar

1. ✅ **Verifique a conexão do backend**
   - Edite `backend/.env` com as credenciais corretas
   - Teste: `curl http://seudominio.com/backend/api.php?r=diagnose`

2. ✅ **Configure o frontend**
   - Copie `frontend/config.example.js` → `frontend/config.js`
   - Ajuste a URL da API

3. ✅ **Teste o login**
   - Acesse o sistema
   - Login: `admin@conectedu.local` / `Admin@123`
   - Altere a senha imediatamente em produção

4. ✅ **Cadastre professores e alunos**
   - O sistema já está pronto para uso!

---

## 📝 Notas Importantes

- **Charset**: Todo o schema usa `utf8mb4` para suportar emojis e caracteres especiais
- **Foreign Keys**: São criadas para garantir integridade referencial
- **Dados Seed**: Inclui usuário admin, 3 professores de apoio, 2 salas SRM, 3 cursos
- **Migrations**: Tabela `migrations` registra alterações futuras no schema
- **Compatibilidade**: Testado em MariaDB 10.4+ e MySQL 5.7+

---

## 🔗 Arquivos Relacionados

- **Schema Completo**: `backend/schema-completo.sql` (RECOMENDADO)
- **Schema Universal**: `backend/schema-universal.sql` (compatibilidade máxima)
- **Schema Mínimo**: `backend/schema-minimal.sql` (apenas essencial)
- **Guia de Schemas**: `backend/SCHEMAS-GUIDE.md`

---

**Dúvidas?** Verifique a documentação completa em `PUBLICACAO.md`
