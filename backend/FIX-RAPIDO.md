# 🚨 FIX RÁPIDO - Erro 500 em Produção

## ✅ Solução em 3 Passos

### Passo 1: Acessar phpMyAdmin
1. Entre no **cPanel** da sua hospedagem
2. Clique em **phpMyAdmin**
3. Selecione o banco de dados `conectedu` (ou o nome que você configurou)

### Passo 2: Executar o Script de Correção
1. Clique na aba **SQL** (no topo)
2. Abra o arquivo `backend/FIX-PRODUCAO.sql`
3. **Copie TODO o conteúdo** do arquivo
4. **Cole** na área de texto do phpMyAdmin
5. Clique em **Executar** (botão no canto inferior direito)

### Passo 3: Verificar Sucesso
Você deve ver no final:
```
status: FIX COMPLETO EXECUTADO COM SUCESSO!
```

## ✅ O que este script faz?

- ✅ Cria tabela `migrations` (controle de versões)
- ✅ Cria tabela `activity_log` (logs do sistema)
- ✅ Cria tabela `schools` (escolas)
- ✅ Adiciona campos modernos em `students` (birth_date, cpf, rg, etc)
- ✅ Cria tabela `entrevistas_responsavel`
- ✅ Cria tabela `student_notes`
- ✅ Cria tabela `atendimentos`
- ✅ Cria tabela `legislacoes`
- ✅ Registra migrations como executadas

## ⚠️ Importante

- **Não precisa apagar nada** - O script só cria o que não existe
- **Não perde dados** - Todas as tabelas existentes são mantidas
- **Seguro para executar múltiplas vezes** - Usa `IF NOT EXISTS`
- **Compatível com qualquer MySQL/MariaDB** - Sem ENGINE=InnoDB

## 🔍 Se der erro

### Erro: "Table doesn't exist"
**Solução**: Normal! Significa que a tabela não existia e foi criada.

### Erro: "Column already exists"
**Solução**: Normal! Significa que o campo já existia e foi ignorado.

### Erro: "Database not found"
**Solução**: Edite a primeira linha do script:
```sql
USE seu_nome_do_banco;
```

### Erro: "Access denied"
**Solução**: Verifique se seu usuário MySQL tem permissão CREATE/ALTER.

## 📞 Depois de Executar

Teste o sistema:
1. Acesse: https://conectaee.com.br
2. Faça login
3. O dashboard deve carregar sem erros 500

## 🎯 Verificação Final

Execute no phpMyAdmin:
```sql
SHOW TABLES;
```

Você deve ver pelo menos estas tabelas:
- ✅ users
- ✅ students
- ✅ sessions
- ✅ migrations
- ✅ activity_log
- ✅ schools
- ✅ entrevistas_responsavel
- ✅ student_notes
- ✅ atendimentos
- ✅ legislacoes

**Tudo pronto!** 🚀
