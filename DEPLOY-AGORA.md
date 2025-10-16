# 🚀 DEPLOY EM PRODUÇÃO - AÇÃO IMEDIATA

## ⚡ EXECUTAR AGORA

### 1. Deploy do Código via SSH
⚠️ **O cPanel NÃO faz auto-deploy. Use SSH:**

📖 **Ver guia completo:** `DEPLOY-SSH-CPANEL.md`

**Comando rápido:**
```bash
ssh conectaee@conectaee.com.br
cd /home/conectaee/repositories/conectedu && \
git pull origin frontvue && \
cp -r backend/* /home/conectaee/public_html/backend/ && \
cp -r frontend/* /home/conectaee/public_html/frontend/ && \
chmod 644 /home/conectaee/public_html/backend/*.php && \
echo "✅ Deploy completo!"
```

### 2. Acesse phpMyAdmin no cPanel
- Login no cPanel
- Clique em **phpMyAdmin**
- Selecione banco **conectedu**

### 3. Execute o Script SQL
1. Clique na aba **SQL**
2. Abra: **`backend/FIX-PRODUCAO-MYISAM.sql`**
3. **Copie TODO o conteúdo**
4. **Cole** no phpMyAdmin
5. Clique **Executar**

### 4. Aguarde (~60 segundos)
Você verá:
```
✅ FIX MYISAM COMPLETO!
total_tabelas_convertidas: 15+
```

### 5. Teste
- Acesse: https://conectaee.com.br
- Login: admin@teste.com / Teste@123
- Dashboard deve carregar **sem erro 500**

---

## 📚 Documentação Completa

- **`DEPLOY-SSH-CPANEL.md`** - Guia completo de deploy via SSH ⭐
- **`backend/STATUS-PRODUCAO.md`** - Status detalhado e troubleshooting
- **`backend/GUIA-MYISAM.md`** - Guia passo a passo SQL
- **`backend/FIX-PRODUCAO-MYISAM.sql`** - Script SQL para executar

---

## ✅ O Que Foi Corrigido

🐛 **Problema:** Código tentava criar tabelas com `ENGINE=InnoDB` mas servidor não suporta

✅ **Solução:**
- 20+ ocorrências de InnoDB substituídas por MyISAM
- Endpoint /stats não tenta mais criar tabelas
- Migrations todas convertidas para MyISAM
- Script SQL cria/converte todas as tabelas

---

## 🎯 Status Atual

| Item | Status |
|------|--------|
| Código Backend | ✅ Corrigido |
| Deploy via SSH | ⚠️ **COPIAR ARQUIVOS** |
| Tabelas MyISAM | ⚠️ **EXECUTAR SQL** |

---

**Após deploy SSH + SQL → Sistema 100% operacional** 🚀
