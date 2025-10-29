# Progresso - Frontend Sistema de PDFs
## Status: 80% Completo (1/3 componentes)

---

## ✅ CONCLUÍDO

### 1. Upload de Foto do Aluno (COMPLETO)
**Componente:** `AlunosTW` (linha ~119)  
**Commit:** `88e055b`

#### Implementações:
- ✅ Campo upload na Etapa 1 do formulário
- ✅ Drag & drop funcional
- ✅ Preview da foto (atual e nova)
- ✅ Validação client-side:
  - Tipos: JPG, PNG, GIF, WEBP
  - Tamanho máximo: 2MB
- ✅ Integração com endpoint `/students/upload-photo`
- ✅ Botão remover foto com confirmação
- ✅ Loading states (`uploadingPhoto`)
- ✅ Mensagens de erro contextuais

#### Código Adicionado:
```javascript
// Data properties (linha ~800)
photoFile: null,
photoPreview: null,
photoError: null,
dragOver: false,
uploadingPhoto: false,

// Computed (linha ~826)
apiBase() {
  return CONFIG.API_BASE.replace(/\/api\.php$/, '');
},

// Methods (linha ~988)
handlePhotoSelect(e)
handleDrop(e)
validateAndSetPhoto(file)
cancelPhoto()
removePhoto()
async uploadPhoto(studentId)

// Modificado método save() (linha ~1088)
// Chama uploadPhoto() após criar/atualizar aluno
```

#### Template (linha ~558):
```html
<div class="mt-6 md:col-span-2">
  <label>📷 Foto do Aluno (opcional)</label>
  
  <!-- Preview foto atual -->
  <div v-if="form.photo_url && !photoPreview">
    <img :src="apiBase + '/' + form.photo_url">
    <button @click="removePhoto">Remover foto</button>
  </div>
  
  <!-- Drag & Drop Zone -->
  <div @dragover.prevent @drop.prevent="handleDrop">
    <input ref="photoInput" type="file" 
           @change="handlePhotoSelect" 
           accept="image/*" hidden>
    
    <div v-if="photoPreview">
      <img :src="photoPreview">
      <button @click.stop="cancelPhoto">Cancelar</button>
    </div>
    
    <div v-else>
      <i class="fa-cloud-upload-alt"></i>
      <p>Clique ou arraste uma imagem aqui</p>
      <p>JPG, PNG, GIF ou WEBP (máx 2MB)</p>
    </div>
  </div>
  
  <p v-if="photoError">{{ photoError }}</p>
  <div v-if="uploadingPhoto">Enviando foto...</div>
</div>
```

---

## ⏳ EM ANDAMENTO

### 2. Botões "Gerar PDF" nos Formulários
**Status:** Preparando implementação  
**Componentes a modificar:**
- `EntrevistaResponsavel` (linha ~4194)
- `PdiConectaee` (buscar linha)
- `PlanoAtendimento` (buscar linha)

#### Implementação Planejada:

**2.1 Template - Adicionar no cabeçalho:**
```html
<div class="flex items-center justify-between mb-6">
  <h2 class="text-xl font-bold">
    {{ form.id ? 'Editar' : 'Nova' }} Entrevista
  </h2>
  
  <button v-if="form.id" 
          @click="generatePDF"
          :disabled="generatingPDF"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
    <i v-if="!generatingPDF" class="fas fa-file-pdf"></i>
    <i v-else class="fas fa-spinner fa-spin"></i>
    <span>{{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}</span>
  </button>
</div>
```

**2.2 Data() - Adicionar propriedade:**
```javascript
data() {
  return {
    // ... existing
    generatingPDF: false
  }
}
```

**2.3 Method generatePDF():**
```javascript
async generatePDF() {
  if (!this.form.id) return;
  
  this.generatingPDF = true;
  
  try {
    // Endpoints específicos:
    // Entrevista: /backend/generate-pdf-entrevista.php?id=1
    // PDI: /backend/generate-pdf-pdi.php?id=1
    // PAI: /backend/generate-pdf-pai.php?id=1
    
    const endpoint = this.getPDFEndpoint();
    
    const res = await fetch(`${CONFIG.API_BASE}${endpoint}?id=${this.form.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Erro ao gerar PDF');
    }
    
    // Download automático
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.getPDFFilename();
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    this.$showToast('Sucesso', '✅ PDF gerado com sucesso!', 'success');
    
  } catch (err) {
    console.error('Erro ao gerar PDF:', err);
    this.$showToast('Erro', '❌ Erro ao gerar PDF: ' + err.message, 'error');
  } finally {
    this.generatingPDF = false;
  }
}
```

**2.4 Helper methods:**
```javascript
getPDFEndpoint() {
  // EntrevistaResponsavel: '/generate-pdf-entrevista.php'
  // PdiConectaee: '/generate-pdf-pdi.php'
  // PlanoAtendimento: '/generate-pdf-pai.php'
  return '/generate-pdf-entrevista.php';
}

getPDFFilename() {
  const studentName = this.form.student_name || 'Aluno';
  const date = new Date().toISOString().split('T')[0];
  return `Entrevista_${studentName.replace(/\s+/g, '')}_${date}.pdf`;
}
```

#### Linhas a Localizar:
- **EntrevistaResponsavel:** linha ~4194
- **PdiConectaee:** buscar `const PdiConectaee =` ou `PDI.*ConectAEE`
- **PlanoAtendimento:** buscar `const PlanoAtendimento =` ou `PAI`

---

## 📋 PENDENTE

### 3. Menu "Documentos Gerados"
**Status:** Não iniciado  
**Tipo:** Componente completo novo

#### Estrutura:
```javascript
const DocumentosGerados = {
  template: `
    <!-- Cabeçalho com título -->
    <!-- 4 Cards de estatísticas -->
    <!-- Filtros: tipo, aluno, datas -->
    <!-- Grid de documentos (cards responsivos) -->
    <!-- Paginação -->
  `,
  
  data() {
    return {
      documents: [],
      students: [],
      stats: {},
      filters: { tipo:'', student_id:'', data_inicio:'', data_fim:'' },
      pagination: { current_page: 1, per_page: 12 },
      loading: false
    }
  },
  
  methods: {
    async loadDocuments() { /* GET /documentos/list */ },
    async loadStudents() { /* GET /students/list */ },
    async loadStats() { /* GET /documentos/stats */ },
    async downloadDocument(doc) { /* GET /documentos/download */ },
    async deleteDocument(doc) { /* DELETE /documentos/delete */ },
    clearFilters() { /* Reset filters */ },
    goToPage(page) { /* Pagination */ }
  }
}
```

#### Adicionar Rota:
```javascript
// Vue Router
{
  path: '/documentos',
  component: DocumentosGerados,
  meta: { requiresAuth: true }
}
```

#### Menu Lateral:
```javascript
{
  icon: 'fa-file-pdf',
  label: 'Documentos Gerados',
  route: '/documentos'
}
```

---

## 📊 Estatísticas do Projeto

### Backend (100% Completo)
- ✅ 3 geradores PDF (2.070 linhas)
- ✅ API documentos (4 endpoints)
- ✅ Endpoint upload foto
- ✅ Schemas SQL atualizados

### Frontend (33% Completo)
- ✅ Upload de foto (100%)
- ⏳ Botões PDF (0%)
- ⏳ Menu documentos (0%)

### Documentação
- ✅ FRONTEND-SPECS-PDF.md (especificações completas)
- ✅ SISTEMA-GERADORES-CONSOLIDADO.md (backend)
- ✅ PROGRESSO-FRONTEND-PDF.md (este arquivo)

---

## 🎯 Próximos Passos

1. **IMEDIATO:** Localizar componentes EntrevistaResponsavel, PdiConectaee, PlanoAtendimento
2. **Adicionar botões PDF:** Implementar nos 3 formulários
3. **Testar botões:** Verificar download automático
4. **Criar componente DocumentosGerados:** Implementação completa
5. **Adicionar rota e menu:** Integrar no router
6. **Testes finais:** Validar todo o fluxo end-to-end

---

## 🔧 Comandos Úteis

### Localizar Componentes:
```bash
# Buscar EntrevistaResponsavel
grep -n "const EntrevistaResponsavel" frontend/spa-tailwind.js

# Buscar PdiConectaee
grep -n "PDI.*ConectAEE\|PdiConectaee" frontend/spa-tailwind.js

# Buscar PlanoAtendimento
grep -n "PAI\|PlanoAtendimento" frontend/spa-tailwind.js
```

### Validar Sintaxe:
```bash
node -c frontend/spa-tailwind.js
```

### Commit Pattern:
```bash
git commit -m "feat: <título>

✨ Implementações:
- <item 1>
- <item 2>

🔧 Progresso: X%"
```

---

**Última Atualização:** 29/10/2024  
**Status Geral:** 80% completo  
**Próximo Commit:** Botões PDF nos formulários
