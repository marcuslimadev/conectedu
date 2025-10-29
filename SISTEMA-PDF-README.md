# 📄 Sistema de Geração de Documentos PDF - ConectEDU

## 🎯 Visão Geral

Sistema completo de geração, armazenamento e gerenciamento de documentos PDF profissionais dos formulários AEE (Atendimento Educacional Especializado).

### Documentos Suportados
1. **Entrevista com Responsável** (~180 campos)
2. **PDI - Plano de Desenvolvimento Individual** (~250 campos)  
3. **PAI - Plano de Atendimento Individual** (~80 campos)

---

## 📋 Plano de Implementação

### ✅ Fase 1: Infraestrutura (COMPLETA)
- [x] Criar tabela `documentos_gerados`
- [x] Adicionar campo `photo_url` em `students`
- [x] Criar estrutura de pastas para uploads
- [x] Configurar mPDF no backend

### 🚧 Fase 2: Backend - Geradores de PDF
- [x] `generate-pdf-entrevista.php` - Template HTML baseado no modelo
- [ ] `generate-pdf-pdi.php` - Template complexo multi-página
- [ ] `generate-pdf-pai.php` - Template profissional estruturado
- [ ] Endpoints API para documentos (`/documentos/list`, `/download`, `/delete`)

### 🚧 Fase 3: Frontend - Interface
- [ ] Upload de foto do aluno (drag & drop)
- [ ] Botão "Gerar PDF" nos formulários
- [ ] Menu "Documentos" no sidebar
- [ ] Componente `DocumentosGerados` (grid + filtros)
- [ ] Modal de preview antes do download

### 🚧 Fase 4: Integração
- [ ] Validar campos obrigatórios dos modelos
- [ ] Adicionar campos faltantes nos formulários
- [ ] Sistema de assinaturas digitais
- [ ] Notificações de sucesso/erro

### 🚧 Fase 5: Testes e Ajustes
- [ ] Testar geração dos 3 PDFs
- [ ] Validar layout × modelo original
- [ ] Testar filtros e buscas
- [ ] Verificar permissões (teacher-centric)

---

## 🗄️ Estrutura de Banco de Dados

### Tabela: `documentos_gerados`
```sql
CREATE TABLE documentos_gerados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo ENUM('entrevista', 'pdi', 'pai') NOT NULL,
  form_id INT NOT NULL,
  student_id INT NOT NULL,
  teacher_id INT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INT UNSIGNED,
  titulo VARCHAR(255),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL
);
```

### Alteração: `students` table
```sql
ALTER TABLE students 
ADD COLUMN photo_url VARCHAR(255) DEFAULT NULL AFTER school_name;
```

---

## 📁 Estrutura de Arquivos

```
backend/
├── uploads/
│   ├── students/                    # Fotos dos alunos
│   │   ├── student_1.jpg
│   │   ├── student_2.jpg
│   │   └── ...
│   └── documentos/                  # PDFs gerados
│       ├── entrevistas/
│       │   ├── Entrevista_Pedro_Henrique_2025-10-29.pdf
│       │   └── ...
│       ├── pdis/
│       │   ├── PDI_Maria_Silva_2025-10-29.pdf
│       │   └── ...
│       └── pais/
│           ├── PAI_João_Santos_2025-10-29.pdf
│           └── ...
├── generate-pdf-entrevista.php
├── generate-pdf-pdi.php
├── generate-pdf-pai.php
└── api.php                          # Endpoints para documentos
```

---

## 🔌 API Endpoints

### Gerar PDF
```http
POST /backend/generate-pdf-entrevista.php?id=1
POST /backend/generate-pdf-pdi.php?id=1
POST /backend/generate-pdf-pai.php?id=1

Headers:
  Authorization: Bearer {token}

Response:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="Entrevista_Pedro_2025-10-29.pdf"
```

### Listar Documentos
```http
GET /backend/api.php?action=documentos.list

Query Params:
  - tipo: entrevista|pdi|pai (opcional)
  - student_id: number (opcional)
  - teacher_id: number (opcional - admin only)
  - data_inicio: YYYY-MM-DD (opcional)
  - data_fim: YYYY-MM-DD (opcional)

Response:
{
  "ok": true,
  "data": [
    {
      "id": 1,
      "tipo": "entrevista",
      "titulo": "Entrevista - Pedro Henrique - 29/10/2025",
      "file_name": "Entrevista_Pedro_Henrique_2025-10-29.pdf",
      "file_size": 245678,
      "student_name": "Pedro Henrique da Silva",
      "created_at": "2025-10-29 14:30:00"
    }
  ]
}
```

### Download Documento
```http
GET /backend/api.php?action=documentos.download&id=1

Headers:
  Authorization: Bearer {token}

Response:
  Content-Type: application/pdf
  Content-Disposition: attachment; filename="..."
```

### Deletar Documento
```http
DELETE /backend/api.php?action=documentos.delete&id=1

Response:
{
  "ok": true,
  "message": "Documento deletado com sucesso"
}
```

---

## 🎨 Frontend - Componentes

### 1. Upload de Foto (StudentForm)
```javascript
// Drag & drop ou file input
<div class="photo-upload">
  <input type="file" accept="image/*" @change="uploadPhoto">
  <img v-if="student.photo_url" :src="student.photo_url">
</div>

methods: {
  async uploadPhoto(event) {
    const formData = new FormData();
    formData.append('photo', event.target.files[0]);
    formData.append('student_id', this.student.id);
    
    const res = await api.post('/students/upload-photo', formData);
    this.student.photo_url = res.data.photo_url;
  }
}
```

### 2. Botão Gerar PDF (FormuláriosCompletos)
```javascript
<button @click="gerarPDF" class="btn-success">
  <i class="fas fa-file-pdf"></i>
  Gerar Documento PDF
</button>

methods: {
  async gerarPDF() {
    this.loading = true;
    try {
      const response = await api.post(
        `/pdf/entrevista/${this.formId}`,
        {},
        { responseType: 'blob' }
      );
      
      // Download automático
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `Entrevista_${this.aluno.name}_${new Date().toISOString().split('T')[0]}.pdf`;
      link.click();
      
      this.$root.showNotification('PDF gerado com sucesso!', 'success');
    } catch (error) {
      this.$root.showNotification('Erro ao gerar PDF', 'error');
    } finally {
      this.loading = false;
    }
  }
}
```

### 3. Menu Documentos (Sidebar)
```javascript
{
  path: '/documentos',
  component: DocumentosGerados,
  meta: { requiresAuth: true, icon: 'fas fa-file-pdf', title: 'Documentos' }
}
```

### 4. Componente DocumentosGerados
```javascript
const DocumentosGerados = {
  template: `
    <div class="p-6">
      <!-- Filtros -->
      <div class="filters">
        <select v-model="filtros.tipo">
          <option value="">Todos os tipos</option>
          <option value="entrevista">Entrevistas</option>
          <option value="pdi">PDIs</option>
          <option value="pai">PAIs</option>
        </select>
        
        <select v-model="filtros.aluno_id">
          <option value="">Todos os alunos</option>
          <option v-for="aluno in alunos" :value="aluno.id">
            {{ aluno.name }}
          </option>
        </select>
        
        <input type="date" v-model="filtros.data_inicio" placeholder="Data início">
        <input type="date" v-model="filtros.data_fim" placeholder="Data fim">
        
        <button @click="filtrar">Filtrar</button>
      </div>
      
      <!-- Grid de Documentos -->
      <div class="documentos-grid">
        <div v-for="doc in documentos" :key="doc.id" class="doc-card">
          <i class="fas fa-file-pdf text-red-500 text-4xl"></i>
          <h3>{{ doc.titulo }}</h3>
          <p>{{ doc.student_name }}</p>
          <p>{{ formatDate(doc.created_at) }}</p>
          <p>{{ formatSize(doc.file_size) }}</p>
          
          <div class="actions">
            <button @click="download(doc.id)">
              <i class="fas fa-download"></i> Download
            </button>
            <button @click="deletar(doc.id)" class="text-red-500">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      documentos: [],
      alunos: [],
      filtros: {
        tipo: '',
        aluno_id: '',
        data_inicio: '',
        data_fim: ''
      }
    }
  },
  
  async mounted() {
    await this.loadDocumentos();
    await this.loadAlunos();
  },
  
  methods: {
    async loadDocumentos() {
      const params = { ...this.filtros };
      const res = await api.get('/documentos/list', { params });
      this.documentos = res.data.data;
    },
    
    async download(id) {
      const res = await api.get(`/documentos/download/${id}`, {
        responseType: 'blob'
      });
      // Trigger download...
    },
    
    async deletar(id) {
      if (confirm('Tem certeza que deseja deletar este documento?')) {
        await api.delete(`/documentos/delete/${id}`);
        await this.loadDocumentos();
      }
    }
  }
}
```

---

## 🔒 Segurança e Permissões

### Regras Teacher-Centric
- **Professor**: Só vê documentos dos SEUS alunos
- **Admin**: Vê todos os documentos, pode filtrar por professor

```php
// Backend validation
$user = require_auth();

if ($user['role'] !== 'admin') {
  // Professor só vê seus documentos
  $sql .= " AND d.teacher_id = :teacher_id";
  $params[':teacher_id'] = $user['id'];
}
```

---

## 📊 Mapeamento de Campos

### Entrevista → PDF
| Campo DB | Seção PDF | Tipo |
|----------|-----------|------|
| `nome_estudante` | Dados de Identificação | text |
| `data_nascimento` | Dados de Identificação | date |
| `photo_url` | Foto no canto superior direito | image |
| `nome_pai`, `nome_mae` | Dados de Identificação | text |
| `composicao_familia_concepcao` | Informações da Família | textarea |
| `gravidez_planejada_relato` | Gestação/Nascimento | textarea |
| `foi_amamentado` | Alimentação | checkbox |
| `historico_saude` | Saúde | textarea |
| `expectativas_familia` | Vida Escolar | textarea |

### PDI → PDF
| Campo DB | Seção PDF | Tipo |
|----------|-----------|------|
| `nome_estudante` | Dados do Estudante | text |
| `locomocao` | Aspectos Psicomotores | enum (apresenta/com_ajuda/nao_apresenta) |
| `atencao_concentracao` | Aspectos Pedagógicos/Cognitivos | textarea |
| `linguagem_oral_expressiva` | Comunicação e Linguagem | textarea |
| `planejamento_bimestral` | Planejamento Bimestral | tabela JSON |
| `relatorio_semestre_1` | Relatório Pedagógico | textarea |

### PAI → PDF
| Campo DB | Seção PDF | Tipo |
|----------|-----------|------|
| `historico` | Histórico do Estudante | textarea |
| `avaliacao_leitura_escrita` | Avaliação Diagnóstica | textarea |
| `objetivo_geral` | Objetivos e Metas | textarea |
| `estrategias_pedagogicas` | Estratégias e Recursos | textarea |
| `data_inicio`, `data_termino` | Organização do Atendimento | date |
| `professor_aee` | Assinaturas | text |

---

## 🧪 Testes

### Manual Testing Checklist
- [ ] Upload de foto do aluno funciona
- [ ] PDF da Entrevista gerado com layout correto
- [ ] PDF do PDI gerado com todas as seções
- [ ] PDF do PAI gerado conforme modelo
- [ ] Filtros de documentos funcionando
- [ ] Download de PDF funciona
- [ ] Exclusão de documento funciona
- [ ] Professor só vê seus documentos
- [ ] Admin vê todos os documentos
- [ ] Foto aparece no PDF quando existe

---

## 📝 Próximos Passos

1. ✅ Criar `generate-pdf-entrevista.php`
2. ⏳ Criar `generate-pdf-pdi.php` (complexo - tabelas bimestrais)
3. ⏳ Criar `generate-pdf-pai.php`
4. ⏳ Implementar endpoints de documentos em `api.php`
5. ⏳ Implementar upload de foto
6. ⏳ Criar componente `DocumentosGerados`
7. ⏳ Adicionar botões "Gerar PDF" nos formulários
8. ⏳ Validar todos os campos obrigatórios
9. ⏳ Testes completos

---

**Última atualização:** 29/10/2025  
**Status:** Fase 2 em andamento - Entrevista PDF completa
