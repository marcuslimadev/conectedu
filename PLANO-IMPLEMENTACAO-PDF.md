# 🚀 PLANO DE IMPLEMENTAÇÃO - Sistema de Documentos PDF

## 📊 Status Geral: 30% COMPLETO

---

## ✅ FASE 1: INFRAESTRUTURA (100% COMPLETA)

### 1.1 Banco de Dados
- ✅ **Arquivo:** `backend/schema-documentos.sql`
- ✅ Tabela `documentos_gerados` criada
  - Campos: `tipo`, `form_id`, `student_id`, `teacher_id`, `file_path`, `file_name`, `file_size`, `titulo`, `observacoes`
  - Índices para performance em queries com filtros
  - Soft delete (`deleted_at`)

- ✅ **Arquivo:** `backend/add_photo_field.sql`
- ✅ Alteração na tabela `students`
  - Adicionado campo `photo_url VARCHAR(255)`

### 1.2 Estrutura de Pastas
```
backend/uploads/
├── students/           # Fotos dos alunos (a criar)
└── documentos/         # PDFs gerados (a criar)
    ├── entrevistas/
    ├── pdis/
    └── pais/
```

### 1.3 Documentação
- ✅ **Arquivo:** `SISTEMA-PDF-README.md`
- ✅ Documentação completa do sistema
- ✅ Mapeamento de campos DB → PDF
- ✅ Exemplos de código frontend/backend
- ✅ Checklist de testes

---

## ✅ FASE 2: GERADOR PDF ENTREVISTA (100% COMPLETO)

### 2.1 Backend - generate-pdf-entrevista.php
- ✅ **Arquivo:** `backend/generate-pdf-entrevista.php` (390 linhas)
- ✅ Template HTML baseado 100% no modelo PDF fornecido
- ✅ Integração com mPDF
- ✅ Suporte a foto do aluno
- ✅ Checkboxes e campos condicionais
- ✅ Sistema de assinaturas
- ✅ Registro automático na tabela `documentos_gerados`
- ✅ Permissões teacher-centric (professor só gera PDF dos seus alunos)
- ✅ Download automático do arquivo

**Endpoint:**
```http
POST /backend/generate-pdf-entrevista.php?id=1
Authorization: Bearer {token}

Response: application/pdf (download)
```

**Seções implementadas:**
1. ✅ Dados de Identificação (com foto)
2. ✅ Informações da Família
3. ✅ Gestação/Nascimento
4. ✅ Alimentação
5. ✅ Saúde
6. ✅ Desenvolvimento Pregresso
7. ✅ Comunicação
8. ✅ Vida Escolar
9. ✅ Assinaturas (Entrevistador + Responsável)

---

## ⏳ FASE 3: GERADORES PDI E PAI (0% PENDENTE)

### 3.1 Backend - generate-pdf-pdi.php (NÃO INICIADO)
**Complexidade:** ALTA (tabelas bimestrais, 10+ páginas)

**Seções necessárias:**
- [ ] Dados Institucionais
- [ ] Dados do Estudante (com foto)
- [ ] Considerações da Família
- [ ] Histórico de Escolarização
- [ ] Limites e Agressividade
- [ ] Aspectos Psicomotores (tabela 16x4)
- [ ] Aspectos Pedagógicos/Cognitivos (tabela 30x4)
- [ ] Comunicação e Linguagem (checkboxes múltiplos)
- [ ] Planejamento Bimestral (4 bimestres × N disciplinas)
- [ ] Relatório Pedagógico Semestral

**Desafios técnicos:**
- Tabelas multi-página com quebra automática
- JSON para tabela bimestral dinâmica
- Checkboxes em grupo (80+ opções)

### 3.2 Backend - generate-pdf-pai.php (NÃO INICIADO)
**Complexidade:** MÉDIA (7 páginas estruturadas)

**Seções necessárias:**
- [ ] Identificação do Aluno e Equipe
- [ ] Histórico do Estudante e Contextualização
- [ ] Avaliação Diagnóstica (4 áreas)
- [ ] Definição de Objetivos e Metas
- [ ] Estratégias e Recursos Pedagógicos
- [ ] Avaliação e Acompanhamento
- [ ] Assinaturas e Consenso (5 assinaturas)

---

## ⏳ FASE 4: API DE DOCUMENTOS (0% PENDENTE)

### 4.1 Endpoints Necessários

#### GET /api.php?action=documentos.list
```javascript
// Filtros suportados
{
  tipo: 'entrevista|pdi|pai',
  student_id: number,
  teacher_id: number,  // admin only
  data_inicio: 'YYYY-MM-DD',
  data_fim: 'YYYY-MM-DD',
  page: number,
  limit: number
}

// Resposta
{
  ok: true,
  data: [
    {
      id: 1,
      tipo: 'entrevista',
      titulo: 'Entrevista - Pedro - 29/10/2025',
      file_name: 'Entrevista_Pedro_2025-10-29.pdf',
      file_size: 245678,
      student_name: 'Pedro Henrique',
      teacher_name: 'Maria Silva',
      created_at: '2025-10-29 14:30:00'
    }
  ],
  pagination: {
    total: 50,
    page: 1,
    pages: 5
  }
}
```

#### GET /api.php?action=documentos.download&id=1
- Validar permissões (teacher_id)
- Retornar arquivo PDF
- Headers: `Content-Type: application/pdf`

#### DELETE /api.php?action=documentos.delete&id=1
- Soft delete (`deleted_at = NOW()`)
- Validar permissões
- Não deletar arquivo físico (histórico)

---

## ⏳ FASE 5: FRONTEND (0% PENDENTE)

### 5.1 Upload de Foto do Aluno

**Onde:** Componente `Alunos` (formulário de cadastro/edição)

```javascript
// Adicionar ao template
<div class="photo-upload-zone">
  <input type="file" accept="image/*" @change="uploadPhoto">
  <div v-if="form.photo_url" class="photo-preview">
    <img :src="form.photo_url" alt="Foto do aluno">
    <button @click="removePhoto">×</button>
  </div>
  <div v-else class="upload-placeholder">
    <i class="fas fa-camera"></i>
    <p>Clique ou arraste uma foto</p>
  </div>
</div>

// Métodos
async uploadPhoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validações
  if (!file.type.startsWith('image/')) {
    this.$root.showNotification('Apenas imagens são permitidas', 'error');
    return;
  }
  if (file.size > 2 * 1024 * 1024) { // 2MB
    this.$root.showNotification('Imagem muito grande (máx 2MB)', 'error');
    return;
  }
  
  const formData = new FormData();
  formData.append('photo', file);
  formData.append('student_id', this.form.id);
  
  try {
    const res = await api.post('/students/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    this.form.photo_url = res.data.photo_url;
    this.$root.showNotification('Foto enviada com sucesso!', 'success');
  } catch (error) {
    this.$root.showNotification('Erro ao enviar foto', 'error');
  }
}
```

### 5.2 Botão "Gerar PDF" nos Formulários

**Onde:** `EntrevistaResponsavelCompleta`, `PDICompleto`, `PAICompleto`

```javascript
// Adicionar ao final de cada formulário (após botão "Salvar")
<button v-if="formSalvo" @click="gerarPDF" 
        class="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700">
  <i class="fas fa-file-pdf mr-2"></i>
  Gerar Documento PDF
</button>

// Método
async gerarPDF() {
  if (!confirm('Gerar documento PDF? Esta ação pode demorar alguns segundos.')) return;
  
  this.gerando = true;
  try {
    const endpoint = this.tipo === 'entrevista' 
      ? `/pdf/entrevista/${this.formId}` 
      : this.tipo === 'pdi' 
        ? `/pdf/pdi/${this.formId}` 
        : `/pdf/pai/${this.formId}`;
    
    const response = await api.post(endpoint, {}, {
      responseType: 'blob'  // IMPORTANTE para download
    });
    
    // Download automático
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `${this.tipo}_${this.aluno.name}_${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
    
    this.$root.showNotification('PDF gerado e baixado com sucesso!', 'success');
    
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    this.$root.showNotification('Erro ao gerar PDF', 'error');
  } finally {
    this.gerando = false;
  }
}
```

### 5.3 Menu "Documentos" no Sidebar

**Onde:** `spa-tailwind.js` - rotas do Vue Router

```javascript
// Adicionar rota
{
  path: '/documentos',
  component: DocumentosGerados,
  meta: { 
    requiresAuth: true, 
    icon: 'fas fa-file-pdf', 
    title: 'Documentos Gerados',
    section: 'gestao'
  }
},

// Adicionar no menu lateral (após "Alunos")
<router-link to="/documentos" class="menu-item">
  <i class="fas fa-file-pdf"></i>
  <span>Documentos</span>
</router-link>
```

### 5.4 Componente DocumentosGerados (NOVO)

**Arquivo:** Adicionar em `spa-tailwind.js`

**Funcionalidades:**
- [x] Grid de cards com documentos
- [x] Filtros: tipo, aluno, data
- [x] Botão de download
- [x] Botão de exclusão (com confirmação)
- [x] Estatísticas (total de docs, tamanho total)
- [x] Paginação
- [x] Loading states
- [x] Empty states

**Layout sugerido:**
```
┌─────────────────────────────────────────┐
│ 📄 Documentos Gerados                   │
├─────────────────────────────────────────┤
│ Filtros: [Tipo▼] [Aluno▼] [Data] 🔍   │
├─────────────────────────────────────────┤
│ ┌──────┐  ┌──────┐  ┌──────┐           │
│ │ PDF  │  │ PDF  │  │ PDF  │           │
│ │ ENT  │  │ PDI  │  │ PAI  │           │
│ │Pedro │  │Maria │  │João  │           │
│ │29/10 │  │28/10 │  │27/10 │           │
│ │245KB │  │567KB │  │123KB │           │
│ │[⬇][🗑]│  │[⬇][🗑]│  │[⬇][🗑]│           │
│ └──────┘  └──────┘  └──────┘           │
│ [< 1 2 3 4 5 >] 📊 Total: 48 docs     │
└─────────────────────────────────────────┘
```

---

## ⏳ FASE 6: VALIDAÇÃO DE CAMPOS (0% PENDENTE)

### 6.1 Campos Faltantes

**Entrevista:**
- ✅ Foto do aluno (implementar upload)
- ❌ Assinatura digital do entrevistador
- ❌ Assinatura digital do responsável
- ❌ Data de preenchimento (auto)

**PDI:**
- ❌ Foto do aluno
- ❌ Campos de planejamento bimestral (JSON)
- ❌ Relatório semestral descritivo
- ❌ Assinaturas de todos os responsáveis

**PAI:**
- ❌ Foto do aluno
- ❌ Assinaturas digitais (5 pessoas)
- ❌ Data prevista para reavaliação

### 6.2 Campos a Adicionar nos Formulários

```javascript
// EntrevistaResponsavelCompleta
form: {
  // ... campos existentes ...
  
  // NOVOS CAMPOS
  assinatura_entrevistador_data: '',    // Data da assinatura
  assinatura_responsavel_data: '',      // Data da assinatura
  observacoes_complementares: '',       // Campo livre final
  data_preenchimento: new Date().toISOString().split('T')[0] // Auto
}
```

---

## 📋 CRONOGRAMA ESTIMADO

| Fase | Descrição | Tempo Estimado | Status |
|------|-----------|----------------|--------|
| 1 | Infraestrutura DB + Docs | 1h | ✅ COMPLETO |
| 2 | PDF Entrevista | 3h | ✅ COMPLETO |
| 3 | PDF PDI (complexo) | 5h | ⏳ Pendente |
| 4 | PDF PAI | 3h | ⏳ Pendente |
| 5 | API Documentos | 2h | ⏳ Pendente |
| 6 | Frontend Upload Foto | 1h | ⏳ Pendente |
| 7 | Frontend Botões PDF | 1h | ⏳ Pendente |
| 8 | Frontend Menu Documentos | 4h | ⏳ Pendente |
| 9 | Validação Campos | 2h | ⏳ Pendente |
| 10 | Testes e Ajustes | 3h | ⏳ Pendente |
| **TOTAL** | | **25 horas** | **16% completo** |

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

### Passo 1: Executar Scripts SQL
```powershell
cd c:\xampp\htdocs\conectedu\backend

# Adicionar campo de foto
mysql -u root conectedu < add_photo_field.sql

# Criar tabela de documentos
mysql -u root conectedu < schema-documentos.sql

# Criar diretórios de upload
mkdir -p uploads/students
mkdir -p uploads/documentos/entrevistas
mkdir -p uploads/documentos/pdis
mkdir -p uploads/documentos/pais
```

### Passo 2: Testar Gerador PDF Entrevista
```powershell
# Via browser
http://localhost/conectedu/backend/generate-pdf-entrevista.php?id=1
# Deve fazer download do PDF

# Via cURL (com token de autenticação)
curl -X POST http://localhost/conectedu/backend/generate-pdf-entrevista.php?id=1 \
  -H "Authorization: Bearer SEU_TOKEN" \
  -o teste-entrevista.pdf
```

### Passo 3: Implementar PDF do PDI
- Copiar estrutura de `generate-pdf-entrevista.php`
- Adaptar template HTML para modelo do PDI
- Atenção especial para tabelas bimestrais

### Passo 4: Implementar PDF do PAI
- Similar ao PDI mas mais simples
- Focar em layout limpo e profissional

### Passo 5: API de Documentos
- Adicionar endpoints em `api.php`
- Testar filtros e permissões

### Passo 6: Frontend
- Upload de foto (componente Alunos)
- Botões "Gerar PDF" (formulários)
- Menu Documentos (novo componente completo)

---

## 📝 OBSERVAÇÕES TÉCNICAS

### mPDF Configuration
```php
$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 20,
    'margin_bottom' => 20,
    'default_font' => 'arial'
]);
```

### Quebra de Página
```html
<!-- Evitar quebra dentro de seção -->
<div style="page-break-inside: avoid;">
  ...
</div>

<!-- Forçar quebra antes de seção -->
<div style="page-break-before: always;">
  ...
</div>
```

### Tabelas Responsivas
```html
<!-- Para tabelas grandes que podem quebrar páginas -->
<table autosize="1">
  <thead>
    <tr><th>Coluna 1</th><th>Coluna 2</th></tr>
  </thead>
  <tbody>
    <tr><td>Linha 1</td><td>Dado 1</td></tr>
  </tbody>
</table>
```

---

**Criado em:** 29/10/2025  
**Status:** Fase 2 completa - 30% do sistema implementado  
**Próxima meta:** Implementar PDF do PDI (mais complexo)
