# 🚀 Guia de Publicação - ConectEDU

## Preparação para Produção

### ✅ Sistema de Migração Automática

O ConectEDU possui um sistema de migração automática do banco de dados que:

- **Executa automaticamente** no primeiro acesso ao sistema
- **Verifica e aplica** todas as correções necessárias
- **Não reexecuta** migrações já aplicadas (usa controle de versão)
- **É seguro** para bancos de dados existentes

### 📋 Passos para Publicação

#### 1. Preparar o Servidor

**Requisitos Mínimos:**
- PHP 7.4+ (recomendado 8.0+)
- MySQL 5.7+ ou MariaDB 10.3+
- Apache ou Nginx
- Extensões PHP: PDO, PDO_MySQL, mbstring, json, openssl

#### 2. Upload dos Arquivos

**Opção A: Deploy Automático via cPanel (Git)**

O projeto inclui `.cpanel.yml` configurado para deploy automático:

```yaml
# Arquivo .cpanel.yml já está pronto
# Ao fazer push, o cPanel irá automaticamente:
# - Copiar frontend/* para /frontend
# - Copiar backend/* para /backend
```

**Opção B: Upload Manual via FTP**

Estrutura de diretórios no servidor:

```bash
/public_html/ (ou /home/usuario/dominio/)
├── backend/
│   ├── api.php
│   ├── functions.php
│   ├── migrations.php
│   ├── .htaccess
│   ├── .env (criar manualmente)
│   └── uploads/
└── frontend/
    ├── index.html
    ├── spa-tailwind.js
    ├── config.js (copiar de config.example.js)
    └── tailwind-local.css
```

**IMPORTANTE**: 
- Não fazer upload de `node_modules/`, `.git/`, `logs/`
- Criar `backend/.env` manualmente no servidor
- Criar `frontend/config.js` a partir do `config.example.js`

#### 3. Configurar Banco de Dados

**Opção A: Banco de Dados Novo**
```sql
-- Criar banco e usuário
CREATE DATABASE conectedu CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'conectedu_user'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON conectedu.* TO 'conectedu_user'@'localhost';
FLUSH PRIVILEGES;

-- Importar schema básico
mysql -u conectedu_user -p conectedu < backend/schema.sql
```

**Opção B: Banco de Dados Existente**
- As migrações serão aplicadas automaticamente no primeiro acesso
- O sistema detecta e corrige automaticamente a estrutura

#### 4. Configurar arquivo .env

Edite `backend/.env`:

```env
DB_HOST=localhost
DB_NAME=conectedu
DB_USER=conectedu_user
DB_PASS=senha_segura

# OpenAI API (opcional)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

#### 5. Configurar URLs no Frontend

Copie e edite `frontend/config.example.js` para `frontend/config.js`:

```bash
# Copiar o arquivo de exemplo
cp frontend/config.example.js frontend/config.js
```

Edite `frontend/config.js`:

```javascript
// Para PRODUÇÃO (arquivos na raiz do domínio)
window.CONFIG = {
  API_BASE: '/backend/api.php',
  VERSION: '5.0.1'
};

// Para DESENVOLVIMENTO LOCAL (XAMPP com subpasta)
// window.CONFIG = {
//   API_BASE: '/conectedu/backend/api.php',
//   VERSION: '5.0.1'
// };
```

**IMPORTANTE**: O arquivo `config.js` não é versionado (está no .gitignore) para permitir configurações diferentes por ambiente.

#### 6. Configurar Permissões

```bash
# Permissões de diretórios
chmod 755 backend/
chmod 755 backend/uploads/
chmod 755 frontend/

# Permissões de arquivos
chmod 644 backend/api.php
chmod 644 backend/functions.php
chmod 600 backend/.env

# Permitir escrita no diretório de uploads
chmod 755 backend/uploads/legislacoes/
```

#### 7. Primeiro Acesso

1. Acesse: `https://seudominio.com.br/frontend/`
2. As migrações serão executadas automaticamente
3. Faça login ou crie o primeiro usuário admin

### 🔧 Migrações Aplicadas Automaticamente

O sistema aplica automaticamente:

1. ✅ Adiciona campos modernos na tabela `students` (birth_date, cpf, rg, grade, class_name, address, school_id)
2. ✅ Corrige foreign key `support_teacher_id` para apontar para `users` ao invés de `support_teachers`
3. ✅ Cria tabela `schools` se não existir
4. ✅ Cria tabela `entrevistas_responsavel` se não existir
5. ✅ Cria tabela `student_notes` se não existir
6. ✅ Cria tabela `atendimentos` se não existir
7. ✅ Garante que campo `modalidade` não seja NULL

### 🔍 Verificar Migrações

**Via API (somente admin):**
```
GET https://seudominio.com.br/backend/api.php/migrations/run
Authorization: Bearer {seu_token}
```

**Via Logs:**
```bash
# Verificar logs do Apache
tail -f /var/log/apache2/error.log | grep MIGRATION
```

### 📊 Verificação de Saúde

```bash
# Health check
curl https://seudominio.com.br/backend/api.php/health
```

Resposta esperada:
```json
{
  "ok": true,
  "data": {
    "time": "2025-10-13T..."
  }
}
```

### 🔒 Segurança em Produção

**Checklist de Segurança:**

- [ ] Arquivo `.env` não está acessível via web
- [ ] Senhas de banco de dados são fortes
- [ ] Backup automático configurado
- [ ] SSL/HTTPS habilitado
- [ ] Logs de erro desabilitados para o público
- [ ] Diretório `uploads/` protegido contra execução de scripts
- [ ] Rate limiting configurado (se disponível)

### 🆘 Solução de Problemas

**Problema: Migrações não executam**

```bash
# Deletar arquivo de lock e tentar novamente
rm backend/.migrations_completed
```

**Problema: Erro 500 ao acessar API**

```bash
# Verificar logs
tail -100 /var/log/apache2/error.log

# Verificar permissões
ls -la backend/
```

**Problema: Banco de dados não conecta**

- Verificar credenciais em `.env`
- Verificar se MySQL está rodando
- Testar conexão manualmente:

```bash
mysql -u conectedu_user -p -h localhost conectedu
```

### 📈 Otimizações Recomendadas

**PHP (php.ini):**
```ini
memory_limit = 256M
upload_max_filesize = 10M
post_max_size = 10M
max_execution_time = 300
```

**MySQL:**
```ini
max_connections = 100
innodb_buffer_pool_size = 256M
```

### 🔄 Atualizações Futuras

Para aplicar novas migrações:

1. Adicione a nova migração em `backend/migrations.php`
2. Delete o arquivo `.migrations_completed`
3. Acesse o sistema (migrações serão reexecutadas)

OU

Execute manualmente via API:
```bash
curl -X GET "https://seudominio.com.br/backend/api.php/migrations/run" \
     -H "Authorization: Bearer {admin_token}"
```

### ✅ Checklist Final

Antes de publicar:

- [ ] Backup do banco de dados existente
- [ ] Arquivo `.env` configurado
- [ ] URLs do frontend atualizadas
- [ ] Permissões de arquivos corretas
- [ ] SSL/HTTPS habilitado
- [ ] Teste de login funcionando
- [ ] Teste de CRUD de alunos
- [ ] Teste de relatórios
- [ ] Logs verificados
- [ ] Health check OK

---

## 🎉 Sistema Pronto para Produção!

O ConectEDU está preparado para ser publicado com migração automática do banco de dados. O sistema cuidará de todas as atualizações necessárias automaticamente.

Para suporte: consulte o arquivo `DESENVOLVIMENTO.md` ou os logs do sistema.
