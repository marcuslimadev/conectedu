# 🚀 Deploy SSH - cPanel ConectAEE

## 📋 Passo a Passo Completo

### 1️⃣ Conectar via SSH

```bash
ssh conectaee@conectaee.com.br
# Digite a senha quando solicitado
```

### 2️⃣ Navegar para o diretório do repositório

```bash
cd /home/conectaee/repositories/conectedu
```

### 3️⃣ Atualizar o código do GitHub

```bash
git fetch origin
git checkout frontvue
git pull origin frontvue
```

### 4️⃣ Copiar arquivos para public_html

```bash
# Copiar backend
cp -r backend/* /home/conectaee/public_html/backend/

# Copiar frontend
cp -r frontend/* /home/conectaee/public_html/frontend/

# Copiar arquivo de configuração (se houver)
cp frontend/config.js /home/conectaee/public_html/frontend/config.js
```

### 5️⃣ Ajustar permissões

```bash
# Permissões corretas para arquivos PHP
chmod 644 /home/conectaee/public_html/backend/*.php

# Permissões para diretório de uploads
chmod 755 /home/conectaee/public_html/backend/uploads
chmod 755 /home/conectaee/public_html/backend/uploads/legislacoes

# Permissões para vendor (se usar Composer)
chmod -R 755 /home/conectaee/public_html/backend/vendor
```

### 6️⃣ Executar SQL (se necessário)

Acesse phpMyAdmin e execute um dos scripts:
- **FIX-PRODUCAO-MYISAM.sql** - Se já tem dados
- **SCHEMA-COMPLETO-MYISAM.sql** - Para instalação limpa

---

## 🔄 Deploy Rápido (Uma linha)

Se você já configurou tudo antes, use este comando único:

```bash
cd /home/conectaee/repositories/conectedu && \
git pull origin frontvue && \
cp -r backend/* /home/conectaee/public_html/backend/ && \
cp -r frontend/* /home/conectaee/public_html/frontend/ && \
chmod 644 /home/conectaee/public_html/backend/*.php && \
echo "✅ Deploy completo!"
```

---

## 📂 Estrutura de Diretórios

```
/home/conectaee/
├── repositories/
│   └── conectedu/          ← Git clone aqui
│       ├── backend/
│       └── frontend/
│
└── public_html/            ← Site em produção
    ├── backend/
    │   ├── api.php
    │   ├── functions.php
    │   ├── migrations.php
    │   ├── uploads/
    │   └── vendor/
    └── frontend/
        ├── index.html
        ├── spa-tailwind.js
        └── config.js
```

---

## ⚠️ Checklist Antes de Fazer Deploy

- [ ] Código testado localmente
- [ ] Commit e push para GitHub
- [ ] Backup do banco (se tiver dados importantes)
- [ ] Verificar `config.js` com URL correta
- [ ] Verificar credenciais de banco em `api.php` ou `.env`

---

## 🔧 Comandos Úteis

### Verificar versão atual em produção
```bash
cd /home/conectaee/public_html/backend
head -20 api.php | grep -i "version\|atualizado"
```

### Ver últimas alterações no repositório
```bash
cd /home/conectaee/repositories/conectedu
git log --oneline -5
```

### Backup rápido antes do deploy
```bash
cd /home/conectaee
tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz public_html/
```

### Restaurar backup (se algo der errado)
```bash
cd /home/conectaee
tar -xzf backup-YYYYMMDD-HHMMSS.tar.gz
```

---

## 🐛 Troubleshooting

### Erro: Permission denied ao copiar
```bash
# Verificar proprietário dos arquivos
ls -la /home/conectaee/public_html/backend/

# Se necessário, ajustar dono
chown -R conectaee:conectaee /home/conectaee/public_html/
```

### Erro: git pull conflitos
```bash
# Descartar alterações locais e forçar atualização
cd /home/conectaee/repositories/conectedu
git reset --hard origin/frontvue
git pull origin frontvue
```

### Erro 500 após deploy
```bash
# Verificar logs de erro PHP
tail -50 /home/conectaee/public_html/error_log
```

### Verificar se arquivos foram copiados
```bash
ls -lh /home/conectaee/public_html/backend/api.php
ls -lh /home/conectaee/public_html/frontend/spa-tailwind.js
```

---

## 🎯 Deploy Automático (Opcional)

Para automatizar, crie um script `deploy.sh`:

```bash
#!/bin/bash
# /home/conectaee/deploy.sh

echo "🚀 Iniciando deploy..."

# Entrar no repositório
cd /home/conectaee/repositories/conectedu || exit

# Atualizar código
git fetch origin
git checkout frontvue
git pull origin frontvue

# Copiar arquivos
echo "📦 Copiando backend..."
cp -r backend/* /home/conectaee/public_html/backend/

echo "📦 Copiando frontend..."
cp -r frontend/* /home/conectaee/public_html/frontend/

# Ajustar permissões
echo "🔒 Ajustando permissões..."
chmod 644 /home/conectaee/public_html/backend/*.php
chmod 755 /home/conectaee/public_html/backend/uploads
chmod 755 /home/conectaee/public_html/backend/uploads/legislacoes

echo "✅ Deploy completo!"
echo "🌐 Acesse: https://conectaee.com.br"
```

**Tornar executável:**
```bash
chmod +x /home/conectaee/deploy.sh
```

**Executar:**
```bash
bash /home/conectaee/deploy.sh
```

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique logs: `tail -50 /home/conectaee/public_html/error_log`
2. Teste conexão banco: phpMyAdmin
3. Verifique permissões: `ls -la /home/conectaee/public_html/backend/`
4. Consulte: `backend/STATUS-PRODUCAO.md`

---

**Última atualização:** 16/10/2025  
**Branch:** frontvue  
**Commits recentes:** 77ed8fc, 19dadfb, 1bd49b6
