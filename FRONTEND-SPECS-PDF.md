# Especificação Frontend - Sistema de PDFs
## Componentes a Implementar

### Status Atual
- ✅ Backend 100% completo (3 geradores + API + upload)
- ⏳ Frontend 0% implementado
- Arquivo: `frontend/spa-tailwind.js` (7.028 linhas)

---

## 1. Upload de Foto do Aluno

### Localização
Componente: `AlunosTW` (linha ~119)

### Implementação

**1.1 Adicionar campo no formulário de aluno:**
```javascript
// No template do modal de edição/criação de aluno
<div class="mb-4">
  <label class="block text-sm font-medium text-gray-700 mb-2">
    📷 Foto do Aluno (opcional)
  </label>
  
  <!-- Preview da foto atual -->
  <div v-if="form.photo_url" class="mb-3">
    <img :src="apiBase + '/' + form.photo_url" 
         alt="Foto atual"
         class="w-32 h-40 object-cover border-2 border-gray-300 rounded">
    <button @click="removePhoto" 
            class="mt-2 text-sm text-red-600 hover:text-red-800">
      🗑️ Remover foto
    </button>
  </div>
  
  <!-- Upload / Drag & Drop -->
  <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
       @dragover.prevent="dragOver = true"
       @dragleave.prevent="dragOver = false"
       @drop.prevent="handleDrop"
       @click="$refs.photoInput.click()"
       :class="{'border-blue-500 bg-blue-50': dragOver}">
    
    <input type="file" 
           ref="photoInput"
           @change="handlePhotoSelect"
           accept="image/*"
           class="hidden">
    
    <div v-if="photoPreview">
      <img :src="photoPreview" 
           alt="Preview"
           class="w-32 h-40 object-cover mx-auto mb-2 border rounded">
      <button @click.stop="cancelPhoto" class="text-sm text-red-600">
        ❌ Cancelar
      </button>
    </div>
    
    <div v-else>
      <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
      <p class="text-sm text-gray-600">
        Clique ou arraste uma imagem aqui
      </p>
      <p class="text-xs text-gray-500 mt-1">
        JPG, PNG, GIF ou WEBP (máx 2MB)
      </p>
    </div>
  </div>
  
  <!-- Mensagem de erro -->
  <p v-if="photoError" class="mt-2 text-sm text-red-600">
    {{ photoError }}
  </p>
</div>
```

**1.2 Adicionar no data():**
```javascript
data() {
  return {
    // ... existing
    photoFile: null,
    photoPreview: null,
    photoError: null,
    dragOver: false
  }
}
```

**1.3 Adicionar métodos:**
```javascript
methods: {
  // ... existing methods
  
  handlePhotoSelect(e) {
    const file = e.target.files[0];
    this.validateAndSetPhoto(file);
  },
  
  handleDrop(e) {
    this.dragOver = false;
    const file = e.dataTransfer.files[0];
    this.validateAndSetPhoto(file);
  },
  
  validateAndSetPhoto(file) {
    this.photoError = null;
    
    if (!file) return;
    
    // Validar tipo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      this.photoError = 'Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)';
      return;
    }
    
    // Validar tamanho (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      this.photoError = 'Arquivo muito grande. Máximo: 2MB';
      return;
    }
    
    this.photoFile = file;
    
    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.photoPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  },
  
  cancelPhoto() {
    this.photoFile = null;
    this.photoPreview = null;
    this.photoError = null;
    if (this.$refs.photoInput) {
      this.$refs.photoInput.value = '';
    }
  },
  
  removePhoto() {
    if (confirm('Deseja remover a foto atual?')) {
      this.form.photo_url = null;
      this.cancelPhoto();
    }
  },
  
  async uploadPhoto(studentId) {
    if (!this.photoFile) return;
    
    const formData = new FormData();
    formData.append('student_id', studentId);
    formData.append('photo', this.photoFile);
    
    try {
      const res = await api.post('/students/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (res.data.ok) {
        this.form.photo_url = res.data.data.photo_url;
        this.cancelPhoto();
        return true;
      } else {
        this.photoError = res.data.error || 'Erro ao enviar foto';
        return false;
      }
    } catch (err) {
      this.photoError = 'Erro de conexão ao enviar foto';
      return false;
    }
  }
}
```

**1.4 Modificar método save():**
```javascript
async save() {
  // ... validações existentes
  
  try {
    let studentId = this.form.id;
    
    // Criar ou atualizar aluno
    if (this.form.id) {
      await api.post(`/students/update?id=${this.form.id}`, this.form);
    } else {
      const res = await api.post('/students/create', this.form);
      studentId = res.data.data.id;
    }
    
    // Upload de foto (se houver)
    if (this.photoFile) {
      await this.uploadPhoto(studentId);
    }
    
    this.showModal = false;
    this.load();
    
  } catch (err) {
    alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
  }
}
```

---

## 2. Botões "Gerar PDF" nos Formulários

### Localização
Componentes:
- `EntrevistaTW` (Entrevista com Responsável)
- `PdiTW` (PDI)
- `PaiTW` (PAI)

### Implementação

**2.1 Adicionar botão no cabeçalho do formulário:**
```javascript
// No template, após o título do formulário
<div class="flex items-center justify-between mb-6">
  <h2 class="text-xl font-bold">
    {{ form.id ? 'Editar' : 'Nova' }} Entrevista
  </h2>
  
  <!-- Botão Gerar PDF (só aparece em edição) -->
  <button v-if="form.id" 
          @click="generatePDF"
          :disabled="generatingPDF"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
    <i v-if="!generatingPDF" class="fas fa-file-pdf"></i>
    <i v-else class="fas fa-spinner fa-spin"></i>
    <span>{{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}</span>
  </button>
</div>
```

**2.2 Adicionar no data():**
```javascript
data() {
  return {
    // ... existing
    generatingPDF: false
  }
}
```

**2.3 Adicionar método generatePDF:**
```javascript
methods: {
  // ... existing methods
  
  async generatePDF() {
    if (!this.form.id) return;
    
    this.generatingPDF = true;
    
    try {
      // Endpoint específico para cada tipo
      // Entrevista: /backend/generate-pdf-entrevista.php?id=1
      // PDI: /backend/generate-pdf-pdi.php?id=1
      // PAI: /backend/generate-pdf-pai.php?id=1
      
      const endpoint = this.getPDFEndpoint(); // Método auxiliar
      
      const res = await fetch(`${apiBase}${endpoint}?id=${this.form.id}`, {
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
      a.download = this.getPDFFilename(); // Nome do arquivo
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Notificação de sucesso
      this.showNotification('✅ PDF gerado com sucesso!', 'success');
      
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      this.showNotification('❌ Erro ao gerar PDF: ' + err.message, 'error');
    } finally {
      this.generatingPDF = false;
    }
  },
  
  getPDFEndpoint() {
    // Retorna endpoint específico do componente
    // EntrevistaTW: '/backend/generate-pdf-entrevista.php'
    // PdiTW: '/backend/generate-pdf-pdi.php'
    // PaiTW: '/backend/generate-pdf-pai.php'
    return '/backend/generate-pdf-entrevista.php'; // Exemplo
  },
  
  getPDFFilename() {
    const studentName = this.form.student_name || 'Aluno';
    const date = new Date().toISOString().split('T')[0];
    // Retorna: 'Entrevista_JoaoSilva_2024-10-29.pdf'
    return `Entrevista_${studentName.replace(/\s+/g, '')}_${date}.pdf`;
  },
  
  showNotification(message, type = 'info') {
    // Implementar sistema de notificações toast
    // Ou usar alert temporariamente
    if (type === 'success') {
      alert(message);
    } else {
      alert(message);
    }
  }
}
```

---

## 3. Menu "Documentos Gerados"

### Localização
Novo componente: `DocumentosGeradosTW`

### Implementação Completa

```javascript
const DocumentosGeradosTW = {
  template: `
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        📄 Documentos Gerados
      </h1>
      <button @click="refreshStats" 
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
        <i class="fas fa-sync-alt" :class="{'fa-spin': loading}"></i>
        Atualizar
      </button>
    </div>
    
    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="text-sm text-gray-600">Total de Documentos</div>
        <div class="text-2xl font-bold text-gray-900">{{ stats.total || 0 }}</div>
      </div>
      <div class="bg-blue-50 p-4 rounded-lg shadow">
        <div class="text-sm text-blue-600">Entrevistas</div>
        <div class="text-2xl font-bold text-blue-900">
          {{ getCountByType('entrevista') }}
        </div>
      </div>
      <div class="bg-green-50 p-4 rounded-lg shadow">
        <div class="text-sm text-green-600">PDIs</div>
        <div class="text-2xl font-bold text-green-900">
          {{ getCountByType('pdi') }}
        </div>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg shadow">
        <div class="text-sm text-purple-600">PAIs</div>
        <div class="text-2xl font-bold text-purple-900">
          {{ getCountByType('pai') }}
        </div>
      </div>
    </div>
    
    <!-- Filtros -->
    <div class="bg-white p-4 rounded-lg shadow">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Documento
          </label>
          <select v-model="filters.tipo" 
                  class="w-full border rounded-lg px-3 py-2">
            <option value="">Todos</option>
            <option value="entrevista">📋 Entrevista</option>
            <option value="pdi">📊 PDI</option>
            <option value="pai">📝 PAI</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Aluno
          </label>
          <select v-model="filters.student_id" 
                  class="w-full border rounded-lg px-3 py-2">
            <option value="">Todos os alunos</option>
            <option v-for="s in students" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Início
          </label>
          <input type="date" 
                 v-model="filters.data_inicio"
                 class="w-full border rounded-lg px-3 py-2">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <input type="date" 
                 v-model="filters.data_fim"
                 class="w-full border rounded-lg px-3 py-2">
        </div>
      </div>
      
      <div class="mt-4 flex space-x-2">
        <button @click="loadDocuments" 
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
          🔍 Filtrar
        </button>
        <button @click="clearFilters" 
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg">
          🗑️ Limpar
        </button>
      </div>
    </div>
    
    <!-- Grid de Documentos -->
    <div v-if="loading" class="text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-400"></i>
      <p class="mt-4 text-gray-600">Carregando documentos...</p>
    </div>
    
    <div v-else-if="documents.length === 0" class="text-center py-12">
      <i class="fas fa-file-alt text-6xl text-gray-300"></i>
      <p class="mt-4 text-gray-600">Nenhum documento encontrado</p>
      <p class="text-sm text-gray-500">
        {{ hasFilters ? 'Tente ajustar os filtros' : 'Gere documentos nos formulários de Entrevista, PDI ou PAI' }}
      </p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="doc in documents" 
           :key="doc.id"
           class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
        
        <!-- Ícone do tipo -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-3">
            <div class="text-3xl">
              <i v-if="doc.tipo === 'entrevista'" class="fas fa-file-alt text-blue-500"></i>
              <i v-else-if="doc.tipo === 'pdi'" class="fas fa-file-chart-line text-green-500"></i>
              <i v-else class="fas fa-file-contract text-purple-500"></i>
            </div>
            <div>
              <span class="px-2 py-1 rounded text-xs font-medium uppercase"
                    :class="getTipoBadgeClass(doc.tipo)">
                {{ getTipoLabel(doc.tipo) }}
              </span>
            </div>
          </div>
          
          <button @click="deleteDocument(doc)" 
                  class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        
        <!-- Informações -->
        <h3 class="font-bold text-gray-900 mb-2">
          {{ doc.titulo || 'Sem título' }}
        </h3>
        
        <div class="space-y-1 text-sm text-gray-600 mb-4">
          <div class="flex items-center">
            <i class="fas fa-user w-5"></i>
            <span>{{ doc.student_name || 'N/A' }}</span>
          </div>
          <div class="flex items-center">
            <i class="fas fa-user-tie w-5"></i>
            <span>{{ doc.teacher_name || 'N/A' }}</span>
          </div>
          <div class="flex items-center">
            <i class="fas fa-calendar w-5"></i>
            <span>{{ formatDate(doc.created_at) }}</span>
          </div>
          <div class="flex items-center">
            <i class="fas fa-file w-5"></i>
            <span>{{ doc.file_size_formatted }}</span>
          </div>
        </div>
        
        <!-- Ações -->
        <button @click="downloadDocument(doc)" 
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2">
          <i class="fas fa-download"></i>
          <span>Baixar PDF</span>
        </button>
      </div>
    </div>
    
    <!-- Paginação -->
    <div v-if="pagination.total_pages > 1" 
         class="flex items-center justify-center space-x-2">
      <button @click="goToPage(pagination.current_page - 1)"
              :disabled="!pagination.has_prev"
              class="px-3 py-2 border rounded disabled:opacity-50">
        ← Anterior
      </button>
      
      <span class="text-sm text-gray-600">
        Página {{ pagination.current_page }} de {{ pagination.total_pages }}
      </span>
      
      <button @click="goToPage(pagination.current_page + 1)"
              :disabled="!pagination.has_next"
              class="px-3 py-2 border rounded disabled:opacity-50">
        Próxima →
      </button>
    </div>
  </div>
  `,
  
  data() {
    return {
      documents: [],
      students: [],
      stats: {},
      filters: {
        tipo: '',
        student_id: '',
        data_inicio: '',
        data_fim: ''
      },
      pagination: {
        current_page: 1,
        per_page: 12,
        total: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      },
      loading: false
    }
  },
  
  computed: {
    hasFilters() {
      return this.filters.tipo || this.filters.student_id || 
             this.filters.data_inicio || this.filters.data_fim;
    }
  },
  
  mounted() {
    this.loadDocuments();
    this.loadStudents();
    this.loadStats();
  },
  
  methods: {
    async loadDocuments() {
      this.loading = true;
      
      try {
        const params = new URLSearchParams({
          page: this.pagination.current_page,
          per_page: this.pagination.per_page
        });
        
        if (this.filters.tipo) params.append('tipo', this.filters.tipo);
        if (this.filters.student_id) params.append('student_id', this.filters.student_id);
        if (this.filters.data_inicio) params.append('data_inicio', this.filters.data_inicio);
        if (this.filters.data_fim) params.append('data_fim', this.filters.data_fim);
        
        const res = await api.get(`/documentos/list?${params}`);
        
        if (res.data.ok) {
          this.documents = res.data.data.documentos;
          this.pagination = res.data.data.pagination;
        }
      } catch (err) {
        console.error('Erro ao carregar documentos:', err);
        alert('Erro ao carregar documentos');
      } finally {
        this.loading = false;
      }
    },
    
    async loadStudents() {
      try {
        const res = await api.get('/students/list');
        if (res.data.ok) {
          this.students = res.data.data;
        }
      } catch (err) {
        console.error('Erro ao carregar alunos:', err);
      }
    },
    
    async loadStats() {
      try {
        const res = await api.get('/documentos/stats');
        if (res.data.ok) {
          this.stats = res.data.data;
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      }
    },
    
    async downloadDocument(doc) {
      try {
        const res = await fetch(`${apiBase}/documentos/download?id=${doc.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) throw new Error('Erro ao baixar documento');
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
      } catch (err) {
        console.error('Erro ao baixar:', err);
        alert('Erro ao baixar documento');
      }
    },
    
    async deleteDocument(doc) {
      if (!confirm(`Deseja deletar o documento "${doc.titulo}"?`)) return;
      
      try {
        const res = await api.delete(`/documentos/delete?id=${doc.id}`);
        
        if (res.data.ok) {
          alert('Documento deletado com sucesso');
          this.loadDocuments();
          this.loadStats();
        }
      } catch (err) {
        console.error('Erro ao deletar:', err);
        alert('Erro ao deletar documento');
      }
    },
    
    clearFilters() {
      this.filters = {
        tipo: '',
        student_id: '',
        data_inicio: '',
        data_fim: ''
      };
      this.pagination.current_page = 1;
      this.loadDocuments();
    },
    
    goToPage(page) {
      this.pagination.current_page = page;
      this.loadDocuments();
    },
    
    refreshStats() {
      this.loadStats();
      this.loadDocuments();
    },
    
    getCountByType(tipo) {
      const item = this.stats.por_tipo?.find(t => t.tipo === tipo);
      return item ? item.count : 0;
    },
    
    getTipoLabel(tipo) {
      const labels = {
        entrevista: 'Entrevista',
        pdi: 'PDI',
        pai: 'PAI'
      };
      return labels[tipo] || tipo;
    },
    
    getTipoBadgeClass(tipo) {
      const classes = {
        entrevista: 'bg-blue-100 text-blue-800',
        pdi: 'bg-green-100 text-green-800',
        pai: 'bg-purple-100 text-purple-800'
      };
      return classes[tipo] || 'bg-gray-100 text-gray-800';
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    }
  }
};
```

### Adicionar rota no Vue Router:
```javascript
// No arquivo spa-tailwind.js, adicionar na configuração de rotas
{
  path: '/documentos',
  component: DocumentosGeradosTW,
  meta: { requiresAuth: true }
}
```

### Adicionar no menu lateral:
```javascript
// No menu principal, adicionar item
{
  icon: 'fa-file-pdf',
  label: 'Documentos Gerados',
  route: '/documentos'
}
```

---

## Resumo de Implementação

### Tempo Estimado
- Upload de Foto: 1h
- Botões Gerar PDF: 1h (3 componentes)
- Menu Documentos: 4h
- **Total: 6 horas**

### Ordem de Implementação
1. ✅ Backend upload foto (COMPLETO)
2. ⏳ Frontend upload foto
3. ⏳ Botões gerar PDF
4. ⏳ Menu documentos completo

### Testes Necessários
- [ ] Upload de foto JPG, PNG, GIF, WEBP
- [ ] Validação de tamanho (2MB)
- [ ] Drag & drop funcional
- [ ] Preview de imagem antes do upload
- [ ] Botão gerar PDF funciona nos 3 formulários
- [ ] Download automático do PDF
- [ ] Filtros de documentos funcionando
- [ ] Paginação funcionando
- [ ] Estatísticas corretas
- [ ] Exclusão de documentos (soft delete)

---

## Notas Técnicas

### API Base URL
```javascript
// Certifique-se de que apiBase está definido
const apiBase = window.API_BASE || 'http://localhost/conectedu/backend';
```

### Axios Instance
```javascript
// Instância configurada com interceptors
const api = axios.create({
  baseURL: apiBase,
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

### FormData para Upload
```javascript
// Multipart form-data
const formData = new FormData();
formData.append('student_id', studentId);
formData.append('photo', photoFile); // File object

// Enviar com headers corretos
await api.post('/students/upload-photo', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});
```

### Download de PDFs
```javascript
// Usar fetch() nativo para responseType blob
const res = await fetch(`${apiBase}/documentos/download?id=${id}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
window.URL.revokeObjectURL(url);
```

---

**Autor:** Sistema ConectEDU  
**Data:** 29 de outubro de 2024  
**Status:** ✅ Backend completo | ⏳ Frontend pendente
