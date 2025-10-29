# 🧪 Testes de API - Entrevistas com Responsável

## Pré-requisitos

1. XAMPP rodando (Apache + MySQL)
2. Banco de dados criado com SCHEMA-FORMULARIOS-AEE-COMPLETO.sql
3. Ter um token de autenticação válido

---

## 1️⃣ Fazer Login e Pegar Token

```powershell
curl -X POST http://localhost/conectedu/backend/api.php?endpoint=auth.login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@admin.com\",\"password\":\"admin123\"}'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "token": "ABC123...",
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@admin.com",
      "role": "admin"
    }
  }
}
```

💡 **COPIE O TOKEN** para usar nos próximos comandos!

---

## 2️⃣ Criar uma Entrevista (Mínimo)

```powershell
# Substitua SEU_TOKEN_AQUI pelo token recebido no login
$token = "SEU_TOKEN_AQUI"

curl -X POST "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.create" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    \"student_id\": 1,
    \"nome_aluno\": \"João da Silva\",
    \"data_entrevista\": \"2025-10-16\",
    \"entrevistador\": \"Prof. Maria\",
    \"nome_responsavel\": \"Ana Silva\",
    \"parentesco\": \"Mãe\"
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "message": "Entrevista criada com sucesso"
  }
}
```

---

## 3️⃣ Criar uma Entrevista Completa

```powershell
curl -X POST "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.create" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    \"student_id\": 1,
    \"data_entrevista\": \"2025-10-16\",
    \"entrevistador\": \"Maria José Santos\",
    \"nome_aluno\": \"Pedro Henrique Costa\",
    \"data_nascimento\": \"2015-03-15\",
    \"idade\": 10,
    \"sexo\": \"M\",
    \"deficiencia\": \"Transtorno do Espectro Autista (TEA)\",
    \"codigo_aluno\": \"ALU2015001\",
    \"endereco\": \"Rua das Flores, 123\",
    \"bairro\": \"Centro\",
    \"cidade\": \"São Paulo\",
    \"estado\": \"SP\",
    \"cep\": \"01234-567\",
    \"telefone_residencial\": \"(11) 3333-4444\",
    \"telefone_celular\": \"(11) 98765-4321\",
    \"nome_escola\": \"EMEF José de Alencar\",
    \"ano_escolar\": \"5º ano\",
    \"turma\": \"5A\",
    \"turno\": \"Manhã\",
    \"nome_professor\": \"João Silva\",
    \"nome_responsavel\": \"Maria Costa\",
    \"parentesco\": \"Mãe\",
    \"idade_responsavel\": 38,
    \"escolaridade_responsavel\": \"Ensino Médio Completo\",
    \"profissao_responsavel\": \"Auxiliar Administrativa\",
    \"renda_familiar\": \"3 salários mínimos\",
    \"qtd_pessoas_familia\": 4,
    \"tipo_moradia\": \"Casa própria\",
    \"condicoes_moradia\": \"Boa\",
    \"gravidez_planejada\": 1,
    \"tipo_parto\": \"Cesárea\",
    \"peso_nascimento\": \"3.2kg\",
    \"chorou_ao_nascer\": 1,
    \"mamou_bem\": 1,
    \"tipo_alimentacao\": \"Come de tudo\",
    \"doencas_cronicas\": \"Nenhuma\",
    \"vacinacao_em_dia\": 1,
    \"idade_andou\": \"14 meses\",
    \"idade_primeiras_palavras\": \"18 meses\",
    \"como_comunica\": \"Fala, mas com dificuldade em manter diálogo\",
    \"compreende_ordens_simples\": 1,
    \"alimenta_sozinho\": 1,
    \"controla_esfincters\": 1,
    \"brinca_com_outras_criancas\": 1,
    \"tem_amigos\": 1,
    \"comportamento_agitado\": 0,
    \"comportamento_colaborativo\": 1,
    \"idade_ingresso_escolar\": \"4 anos\",
    \"adaptacao_escolar\": \"Dificuldade inicial, melhorou com o tempo\",
    \"frequenta_sala_recursos\": 1,
    \"frequencia_atendimentos\": \"2 vezes por semana\",
    \"responsavel_preenchimento\": \"Maria José Santos\",
    \"data_preenchimento\": \"2025-10-16\"
  }'
```

---

## 4️⃣ Listar Todas as Entrevistas

```powershell
curl -X GET "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.list" `
  -H "Authorization: Bearer $token"
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "student_id": 1,
      "student_name": "João da Silva",
      "nome_aluno": "João da Silva",
      "data_entrevista": "2025-10-16",
      "created_at": "2025-10-16 14:30:00",
      ...
    }
  ]
}
```

---

## 5️⃣ Buscar Entrevista por ID

```powershell
curl -X GET "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.get&id=1" `
  -H "Authorization: Bearer $token"
```

---

## 6️⃣ Buscar Entrevistas de um Aluno Específico

```powershell
curl -X GET "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.student&student_id=1" `
  -H "Authorization: Bearer $token"
```

---

## 7️⃣ Atualizar uma Entrevista

```powershell
curl -X PUT "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.update&id=1" `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d '{
    \"observacoes_familia\": \"Família muito participativa e presente\",
    \"observacoes_saude\": \"Sem restrições médicas\",
    \"observacoes_comportamento\": \"Criança colaborativa, gosta de rotina\"
  }'
```

---

## 8️⃣ Deletar uma Entrevista

```powershell
curl -X DELETE "http://localhost/conectedu/backend/api.php?endpoint=entrevistas.delete&id=1" `
  -H "Authorization: Bearer $token"
```

---

## 📊 Verificar no Banco de Dados

```powershell
# Ver todas as entrevistas
mysql -u root conectedu -e "SELECT id, student_id, nome_aluno, data_entrevista, created_at FROM entrevistas_responsavel;"

# Ver detalhes de uma entrevista específica
mysql -u root conectedu -e "SELECT * FROM entrevistas_responsavel WHERE id = 1\G"

# Contar entrevistas
mysql -u root conectedu -e "SELECT COUNT(*) as total FROM entrevistas_responsavel;"
```

---

## ✅ Checklist de Testes

- [ ] Login bem-sucedido
- [ ] Criar entrevista mínima (só campos obrigatórios)
- [ ] Criar entrevista completa (todos os campos)
- [ ] Listar todas as entrevistas
- [ ] Buscar entrevista por ID
- [ ] Buscar entrevistas por student_id
- [ ] Atualizar campos da entrevista
- [ ] Deletar entrevista
- [ ] Testar permissões (professor só vê as suas)
- [ ] Verificar no banco de dados

---

## 🐛 Erros Comuns

### Token Inválido
```json
{"success": false, "error": "INVALID_TOKEN"}
```
**Solução:** Fazer login novamente e pegar novo token

### Student ID não encontrado
```json
{"success": false, "error": "STUDENT_ID_REQUIRED"}
```
**Solução:** Verificar se student_id está sendo enviado

### Sem permissão
```json
{"success": false, "error": "FORBIDDEN"}
```
**Solução:** Usuário não tem permissão para acessar essa entrevista

---

## 💡 Dicas

1. **Token expira:** Faça login novamente se necessário
2. **Campos opcionais:** Só campos obrigatórios são student_id e teacher_id (automático)
3. **Data format:** Usar formato `YYYY-MM-DD` para datas
4. **Boolean values:** Usar `1` para true, `0` para false
5. **Escape characters:** No PowerShell, usar `\"` para aspas dentro de strings

---

## 🎯 Próximos Passos

Após validar endpoints de Entrevistas:
1. [ ] Implementar endpoints de PDI
2. [ ] Implementar endpoints de PAI
3. [ ] Criar componentes Vue.js
4. [ ] Integrar com frontend
