# 🚀 PLANO DE DESENVOLVIMENTO - FORMULÁRIOS AEE COMPLETOS

## 📋 Status: Desenvolvimento Local

### Fase Atual: Planejamento e Estruturação

---

## 🎯 Objetivos

1. ✅ Mapear TODOS os campos dos 3 formulários
2. ⏳ Criar schema de banco de dados local
3. ⏳ Desenvolver endpoints API
4. ⏳ Criar componentes Vue.js
5. ⏳ Testar localmente (XAMPP)
6. ⏳ Deploy em produção

---

## 📊 Progresso

### ✅ Concluído

- [x] Análise dos documentos originais:
  - Entrevista com Responsável
  - PDI (Plano de Desenvolvimento Individual)
  - PAI (Plano de Atendimento Individual)
- [x] Mapeamento de 500+ campos
- [x] Criação do schema SQL completo
- [x] Commit inicial no GitHub

### ⏳ Em Desenvolvimento

Nenhum item em desenvolvimento no momento.

### 📝 Próximos Passos

#### 1. Testar Schema Localmente
```bash
# Executar no MySQL local (XAMPP)
mysql -u root conectedu < backend/SCHEMA-FORMULARIOS-AEE-COMPLETO.sql
```

#### 2. Criar Endpoints API (backend/api.php)
- [ ] `POST /entrevistas/create` - Criar entrevista
- [ ] `GET /entrevistas/:id` - Buscar entrevista
- [ ] `PUT /entrevistas/:id` - Atualizar entrevista
- [ ] `GET /entrevistas/student/:student_id` - Listar por aluno
- [ ] `POST /pdis/create` - Criar PDI
- [ ] `GET /pdis/:id` - Buscar PDI
- [ ] `PUT /pdis/:id` - Atualizar PDI
- [ ] `GET /pdis/student/:student_id` - Listar PDIs do aluno
- [ ] `POST /pais/create` - Criar PAI
- [ ] `GET /pais/:id` - Buscar PAI
- [ ] `PUT /pais/:id` - Atualizar PAI
- [ ] `GET /pais/student/:student_id` - Listar PAIs do aluno

#### 3. Criar Componentes Vue.js (frontend/spa-tailwind.js)
- [ ] `EntrevistaForm` - Formulário de entrevista (multi-step)
- [ ] `PdiForm` - Formulário PDI (wizard com abas)
- [ ] `PaiForm` - Formulário PAI (wizard)
- [ ] `FormulariosList` - Listagem de formulários por aluno
- [ ] `FormularioView` - Visualização completa
- [ ] `FormularioPrint` - Versão para impressão

#### 4. Componentes Auxiliares
- [ ] `MultiStepWizard` - Wizard reutilizável
- [ ] `CheckboxGroup` - Grupo de checkboxes
- [ ] `RadioGroup` - Grupo de radio buttons
- [ ] `DatePicker` - Seletor de data
- [ ] `JsonEditor` - Editor para campos JSON (planejamento/avaliações)

#### 5. Testes Locais
- [ ] Teste de criação de entrevista
- [ ] Teste de criação de PDI
- [ ] Teste de criação de PAI
- [ ] Teste de edição
- [ ] Teste de visualização
- [ ] Teste de impressão/PDF
- [ ] Teste de validações
- [ ] Teste com dados reais

#### 6. Melhorias de UX
- [ ] Salvamento automático (draft)
- [ ] Validação em tempo real
- [ ] Indicador de progresso
- [ ] Preenchimento automático de dados do aluno
- [ ] Histórico de versões
- [ ] Exportação para PDF

---

## 🗂️ Estrutura de Arquivos

```
backend/
├── api.php (endpoints dos formulários)
├── SCHEMA-FORMULARIOS-AEE-COMPLETO.sql (schema completo)
└── functions.php (helpers)

frontend/
├── spa-tailwind.js (componentes Vue)
└── index.html (aplicação)
```

---

## 🔧 Ambiente de Desenvolvimento

### Requisitos
- ✅ XAMPP (Apache + MySQL + PHP 8.2)
- ✅ Node.js (para Tailwind CSS)
- ✅ Git
- ✅ VS Code

### Configuração Atual
```
Database: conectedu
User: root
Password: (vazio)
Port: 3306
API: http://localhost/conectedu/backend/api.php
Frontend: http://localhost/conectedu/frontend/
```

---

## 📐 Padrão de Desenvolvimento

### 1. Desenvolvimento Incremental
- Um formulário por vez
- Testar cada funcionalidade antes de avançar
- Commits frequentes com mensagens descritivas

### 2. Prioridades
1. **Entrevista com Responsável** (mais simples, menos campos)
2. **PAI** (campos de texto livre, mais fácil)
3. **PDI** (mais complexo, com JSON e avaliações)

### 3. Metodologia
- Criar schema → Testar no MySQL → Criar endpoint → Testar com Postman → Criar componente Vue → Testar no navegador

---

## 🧪 Checklist de Testes

### Por Formulário

#### Entrevista
- [ ] Criação com dados mínimos
- [ ] Criação com todos os campos
- [ ] Edição de entrevista existente
- [ ] Visualização
- [ ] Listagem por aluno
- [ ] Validações (campos obrigatórios)

#### PDI
- [ ] Criação com dados mínimos
- [ ] Avaliações psicomotoras (16 itens)
- [ ] Avaliações cognitivas (27 itens)
- [ ] Comunicação e linguagem (90+ campos)
- [ ] Planejamento bimestral (JSON)
- [ ] Relatórios semestrais
- [ ] Edição e atualização

#### PAI
- [ ] Criação completa
- [ ] Objetivos e metas (JSON)
- [ ] Estratégias pedagógicas
- [ ] Assinaturas
- [ ] Impressão/PDF

---

## 📝 Notas de Desenvolvimento

### Decisões Técnicas

1. **Campos JSON para flexibilidade:**
   - `planejamento_bimestral` (PDI)
   - `avaliacoes_bimestrais` (PDI)
   - `objetivos_especificos` (PAI)

2. **Enum para padronização:**
   - Status, tipos, categorias fixas

3. **Text/Longtext para campos livres:**
   - Observações, descrições, relatórios

4. **MyISAM para compatibilidade:**
   - Servidor de produção não suporta InnoDB

### Próxima Sessão de Desenvolvimento

**Iniciar com:** Teste do schema no MySQL local

```bash
# 1. Verificar se banco existe
mysql -u root -e "SHOW DATABASES LIKE 'conectedu';"

# 2. Executar schema
mysql -u root conectedu < backend/SCHEMA-FORMULARIOS-AEE-COMPLETO.sql

# 3. Verificar tabelas criadas
mysql -u root conectedu -e "SHOW TABLES;"

# 4. Ver estrutura da tabela entrevistas_responsavel
mysql -u root conectedu -e "DESCRIBE entrevistas_responsavel;"
```

---

## 🎯 Meta Final

Sistema completo de formulários AEE com:
- ✅ 100% dos campos dos documentos originais
- ⏳ Interface intuitiva multi-step
- ⏳ Salvamento automático
- ⏳ Exportação para PDF
- ⏳ Histórico de versões
- ⏳ Validações completas
- ⏳ Testado e funcional localmente
- ⏳ Deploy em produção

---

**Última atualização:** 16/10/2025  
**Commit atual:** 6057183  
**Próximo passo:** Testar schema no MySQL local
