# ConectEDU - Sistema de Gestão Educacional AEE

## Arquitetura e Contexto

Este é um sistema **SPA (Single Page Application)** especializado em **Atendimento Educacional Especializado (AEE)** com arquitetura teacher-centric. Cada professor só acessa seus próprios alunos e dados.

### Stack Principal
- **Frontend**: Vue.js 3 puro (sem build tools) + Tailwind CSS via CDN
- **Backend**: PHP puro com PDO + MySQL
- **API**: REST endpoints com bearer token auth
- **PDF**: mPDF para relatórios
- **IA**: OpenAI Whisper para transcrição de áudio

## Estrutura de Arquivos Crítica

```
frontend/
├── spa-tailwind.js     # SPA completa Vue.js (5600+ linhas)
├── config.js           # API base URL config
└── index.html          # Shell da aplicação

backend/
├── api.php             # Router REST + todos endpoints
├── functions.php       # Helpers, auth, OpenAI
└── schema*.sql         # Database structure
```

## Padrões de Desenvolvimento

### Frontend (Vue.js sem Build)
- **Componentes**: Definidos como objetos Vue dentro de `spa-tailwind.js`
- **Estado**: Cada componente usa `data()` function pattern
- **API**: Axios instance com interceptors para auth
- **Routing**: Vue Router com hash mode

Exemplo de componente típico:
```javascript
const AlunosTW = {
  template: `<div class="p-6">...</div>`,
  data() {
    return { alunos: [], loading: false }
  },
  methods: {
    async loadData() {
      const res = await api.get('/students')
      this.alunos = res.data.data
    }
  }
}
```

### Backend (PHP REST API)
- **Autenticação**: Bearer tokens em tabela `sessions`
- **Autorização**: `require_auth()` e `require_admin()` helpers
- **Isolamento**: Professores só veem dados próprios via `created_by_teacher_id`
- **Erros**: Format `res(false, null, 'ERROR_CODE', statusCode)`

Endpoint típico:
```php
case 'students.list':
  $user = require_auth();
  $where = $user['role'] === 'admin' ? '' : 'WHERE created_by_teacher_id = :user_id';
  $stmt = $pdo->prepare("SELECT * FROM students $where");
  if ($user['role'] !== 'admin') $stmt->bindValue(':user_id', $user['id']);
```

### Database Schema
- **users**: `role` field determines access (`admin`/`professor`)
- **students**: `created_by_teacher_id` for isolation
- **sessions**: Bearer token storage with expiry
- **AEE forms**: `entrevista_forms`, `pdi_forms`, `plano_atendimento_forms`

## Funcionalidades Específicas

### Sistema Teacher-Centric
- Professores só cadastram/veem seus próprios alunos
- Dropdowns automáticos filtram por professor logado
- Admins têm acesso global

### Formulários AEE
- Três formulários principais: Entrevista, PDI, Planos de Atendimento  
- JSON storage para flexibilidade de campos
- Auto-populate de alunos do professor

### Relatórios com Áudio
- Gravação via `navigator.mediaDevices.getUserMedia()`
- Upload de blob para OpenAI Whisper
- Conversão áudio → texto automática

## Comandos de Desenvolvimento

### CSS (Tailwind)
```powershell
# Desenvolvimento (watch mode)
npm run dev

# Produção (minified)  
npm run build
```

### Database Setup
```powershell
# Schema principal
mysql -u root conectedu < backend/schema.sql

# Formulários AEE
mysql -u root conectedu < backend/schema-aee.sql
```

### Servidor Local
```powershell
# Via XAMPP (recomendado)
# http://localhost/conectedu/frontend/

# Via PHP built-in
cd backend && php -S 127.0.0.1:8000 api.php
cd frontend && php -S 127.0.0.1:8001
```

## Convenções Críticas

### Nomenclatura
- Endpoints em inglês (`/students`, `/users`)
- UI labels em português brasileiro
- Campos de tabela em inglês (`created_by_teacher_id`)

### Segurança
- CORS headers em `functions.php`
- SQL injection protection via prepared statements
- File upload validation (PDFs apenas)
- Teacher data isolation via WHERE clauses

### Debugging
- Frontend: Console logs com emojis `🔧`
- Backend: Error responses com codes (`INVALID_TOKEN`)
- SQL errors logged via PDO exception mode

## Integração OpenAI

Configuração via `.env`:
```
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Usage pattern:
```php
$transcription = openai_transcribe($audioFilePath);
$analysis = openai_chat([
  ['role' => 'system', 'content' => 'Analyze this report...'],
  ['role' => 'user', 'content' => $transcription]
]);
```

## Modificação de Funcionalidades

Para **novos formulários AEE**: Adicione tabela + endpoints + componente Vue
Para **novos campos**: Modify JSON schema nas tabelas existentes  
Para **novos roles**: Extend `require_auth()` logic e UI conditionals
Para **nova IA**: Add functions to `functions.php` + frontend integration