// ConectEdu v5.0 - Sistema de Gestão Educacional com Tailwind CSS
// Configuração da API
const api = axios.create({
  baseURL: CONFIG.API_BASE, 
  timeout: 15000
});

// Interceptadores para autenticação
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers['Authorization'] = 'Bearer ' + token;
  }
  return cfg;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      if (location.hash !== '#/login') {
        location.hash = '#/login';
      }
    }
    return Promise.reject(error);
  }
);

// Guard de autenticação
const AuthGuard = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path !== '/login' && to.path !== '/register') {
    next('/login');
  } else {
    next();
  }
};

// Alunos - CRUD completo
const AlunosTW = {
  template: `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Alunos</h1>
      <button @click="newAluno" class="px-3 py-2 bg-brand-primary text-white rounded">Novo Aluno</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label class="sr-only" for="alunos-busca">Buscar por nome</label>
        <input id="alunos-busca" v-model="filters.q" @keyup.enter="load" class="border rounded px-3 py-2 w-full" placeholder="Buscar por nome">
      </div>
      <div>
        <label class="sr-only" for="alunos-status">Status</label>
        <select id="alunos-status" v-model="filters.status" class="border rounded px-3 py-2 w-full">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      </div>
      <div>
        <label class="sr-only" for="alunos-modalidade">Modalidade</label>
        <select id="alunos-modalidade" v-model="filters.modalidade" class="border rounded px-3 py-2 w-full">
        <option value="">Todas as modalidades</option>
        <option value="apoio">Apoio</option>
        <option value="srm">SRM</option>
      </select>
      </div>
      <button @click="load" class="px-3 py-2 bg-gray-800 text-white rounded">Filtrar</button>
    </div>

    <div class="bg-white shadow rounded overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="text-left">
            <th class="px-3 py-2">Nome</th>
            <th class="px-3 py-2">Modalidade</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2">Vínculo</th>
            <th class="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in rows" :key="s.id" class="border-t">
            <td class="px-3 py-2">{{ s.name }}</td>
            <td class="px-3 py-2 text-uppercase">{{ s.modalidade }}</td>
            <td class="px-3 py-2">
              <span :class="['px-2 py-1 rounded text-xs', s.status==='ativo'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600']">{{ s.status }}</span>
            </td>
            <td class="px-3 py-2">
              <span v-if="s.modalidade==='apoio'">Prof #{{ s.support_teacher_id || '-' }}</span>
              <span v-else>SRM #{{ s.srm_room_id || '-' }}</span>
            </td>
            <td class="px-3 py-2 text-right space-x-2">
              <button class="px-2 py-1 text-sm border rounded" @click="edit(s)">Editar</button>
              <button class="px-2 py-1 text-sm border rounded text-red-600" @click="del(s)">Excluir</button>
            </td>
          </tr>
          <tr v-if="rows.length===0"><td colspan="5" class="px-3 py-6 text-center text-gray-500">Sem registros</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="editing" class="bg-white shadow rounded p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ form.id ? 'Editar Aluno' : 'Novo Aluno' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-nome">Nome</label>
          <input id="aluno-nome" v-model="form.name" class="border rounded px-3 py-2 w-full" placeholder="Nome">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-modalidade">Modalidade</label>
          <select id="aluno-modalidade" v-model="form.modalidade" class="border rounded px-3 py-2 w-full">
          <option disabled value="">Modalidade</option>
          <option value="apoio">Apoio</option>
          <option value="srm">SRM</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-status">Status</label>
          <select id="aluno-status" v-model="form.status" class="border rounded px-3 py-2 w-full">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-if="form.modalidade==='apoio'">
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-apoiador">Professor de Apoio</label>
          <input id="aluno-apoiador" v-model="form._st_name" list="dl-teachers" class="border rounded px-3 py-2 w-full" placeholder="Professor de Apoio (nome ou #id)" @input="mapTeacher">
          <datalist id="dl-teachers">
            <option v-for="t in teachers" :key="'t'+t.id" :value="t.name + ' (#'+t.id+')'" />
          </datalist>
        </div>
        <div v-if="form.modalidade==='srm'">
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-srm">Sala de Recursos</label>
          <input id="aluno-srm" v-model="form._room_name" list="dl-rooms" class="border rounded px-3 py-2 w-full" placeholder="Sala de Recursos (nome ou #id)" @input="mapRoom">
          <datalist id="dl-rooms">
            <option v-for="r in rooms" :key="'r'+r.id" :value="r.name + ' (#'+r.id+')'" />
          </datalist>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-resp">Responsável</label>
          <input id="aluno-resp" v-model="form.responsible_name" class="border rounded px-3 py-2 w-full" placeholder="Responsável">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-fone">Telefone</label>
          <input id="aluno-fone" v-model="form.responsible_phone" class="border rounded px-3 py-2 w-full" placeholder="Telefone">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="aluno-cid">CID (opcional)</label>
          <input id="aluno-cid" v-model="form.cid_code" class="border rounded px-3 py-2 w-full" placeholder="CID (opcional)">
        </div>
      </div>

      <div class="flex gap-2">
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="save">Salvar</button>
        <button class="px-3 py-2 border rounded" @click="cancel">Cancelar</button>
      </div>
    </div>
  </div>
  `,
  data(){return{ rows:[], filters:{ q:'', status:'', modalidade:'' }, editing:false, form:{ id:null, name:'', modalidade:'', status:'ativo', _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'' }, teachers:[], rooms:[] }},
  methods:{
    display(s){ return `${s.name} (#${s.id})`; },
    parseId(v){ const m=String(v||'').match(/#(\d+)/); return m?Number(m[1]):null; },
    mapTeacher(){ this.form.support_teacher_id = this.parseId(this.form._st_name); },
    mapRoom(){ this.form.srm_room_id = this.parseId(this.form._room_name); },
    newAluno(){ this.editing=true; this.form={ id:null, name:'', modalidade:'', status:'ativo', _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'' }; },
    edit(s){ this.editing=true; this.form=Object.assign({_st_name:'', _room_name:''}, s); },
    cancel(){ this.editing=false; this.form={ id:null, name:'', modalidade:'', status:'ativo', _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'' }; },
    async load(){ const params={}; if(this.filters.q) params.q=this.filters.q; if(this.filters.status) params.status=this.filters.status; if(this.filters.modalidade) params.modalidade=this.filters.modalidade; const r=await api.get('/students',{params}); this.rows = r.data?.data?.rows || []; },
    async loadLists(){ const t=await api.get('/support-teachers'); this.teachers=t.data?.data||[]; const r=await api.get('/srm-rooms'); this.rooms=r.data?.data||[]; },
    async save(){ if(!this.form.name || !this.form.modalidade){ alert('Preencha nome e modalidade'); return; } const payload=Object.assign({}, this.form); delete payload._st_name; delete payload._room_name; if(!this.form.id){ const r=await api.post('/students/create', payload); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao criar'); } else { const r=await api.put('/students/update', payload, { params:{ id:this.form.id } }); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao atualizar'); } },
    async del(s){ if(!confirm('Excluir aluno?')) return; const r=await api.post('/students/delete', {}, { params:{ id:s.id } }); if(r.data?.ok){ this.load(); } else alert(r.data?.error||'Erro ao excluir'); }
  },
  async mounted(){ await this.loadLists(); await this.load(); }
};

// Tela de Registro
const RegisterTW = {
  template: `
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <h2 class="text-3xl font-bold text-gray-900">Criar Conta</h2>
        <p class="mt-2 text-sm text-gray-600">Registre-se para acessar o ConectEdu</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form @submit.prevent="register" class="space-y-6">
          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block" for="reg-name">Nome Completo</label>
            <input id="reg-name" v-model="form.name" type="text" required class="border rounded px-3 py-2 w-full" placeholder="Seu nome completo">
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block" for="reg-email">Email</label>
            <input id="reg-email" v-model="form.email" type="email" required class="border rounded px-3 py-2 w-full" placeholder="seu@email.com">
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block" for="reg-password">Senha</label>
            <input id="reg-password" v-model="form.password" type="password" required class="border rounded px-3 py-2 w-full" placeholder="Sua senha">
            <div class="mt-1 text-xs text-gray-500">
              <p>A senha deve conter:</p>
              <ul class="list-disc list-inside space-y-1">
                <li :class="passwordChecks.length ? 'text-green-600' : 'text-gray-500'">Pelo menos 8 caracteres</li>
                <li :class="passwordChecks.uppercase ? 'text-green-600' : 'text-gray-500'">Uma letra maiúscula</li>
                <li :class="passwordChecks.lowercase ? 'text-green-600' : 'text-gray-500'">Uma letra minúscula</li>
                <li :class="passwordChecks.number ? 'text-green-600' : 'text-gray-500'">Um número</li>
                <li :class="passwordChecks.special ? 'text-green-600' : 'text-gray-500'">Um caractere especial (!@#$%^&*)</li>
              </ul>
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-gray-700 mb-1 block" for="reg-confirm">Confirmar Senha</label>
            <input id="reg-confirm" v-model="form.confirm_password" type="password" required class="border rounded px-3 py-2 w-full" placeholder="Confirme sua senha">
            <div v-if="form.password && form.confirm_password && form.password !== form.confirm_password" class="mt-1 text-xs text-red-600">
              As senhas não coincidem
            </div>
          </div>

          <div v-if="error" class="bg-red-50 border border-red-200 rounded p-3">
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <div v-if="success" class="bg-green-50 border border-green-200 rounded p-3">
            <p class="text-sm text-green-600">{{ success }}</p>
          </div>

          <div>
            <button type="submit" :disabled="loading || !isFormValid" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="loading" class="inline-flex items-center">
                <span class="spinner mr-2"></span>
                Criando conta...
              </span>
              <span v-else>Criar Conta</span>
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Já tem uma conta? 
              <router-link to="/login" class="font-medium text-brand-primary hover:text-brand-primary-dark">
                Faça login
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      form: {
        name: '',
        email: '',
        password: '',
        confirm_password: ''
      },
      loading: false,
      error: '',
      success: ''
    }
  },
  computed: {
    passwordChecks() {
      const pass = this.form.password;
      return {
        length: pass.length >= 8,
        uppercase: /[A-Z]/.test(pass),
        lowercase: /[a-z]/.test(pass),
        number: /[0-9]/.test(pass),
        special: /[^A-Za-z0-9]/.test(pass)
      };
    },
    isFormValid() {
      return this.form.name && 
             this.form.email && 
             this.form.password && 
             this.form.confirm_password &&
             this.form.password === this.form.confirm_password &&
             Object.values(this.passwordChecks).every(check => check);
    }
  },
  methods: {
    async register() {
      this.loading = true;
      this.error = '';
      this.success = '';

      try {
        const response = await api.post('/register', this.form);
        if (response.data?.ok) {
          this.success = response.data.message || 'Conta criada com sucesso! Aguarde aprovação.';
          this.form = { name: '', email: '', password: '', confirm_password: '' };
        } else {
          this.error = response.data?.error || 'Erro ao criar conta';
        }
      } catch (err) {
        this.error = err.response?.data?.error || 'Erro de conexão';
      } finally {
        this.loading = false;
      }
    }
  }
};

// Usuários (Professores/Admins)
const UsuariosTW = {
  template: `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Usuários</h1>
        <div v-if="pendingCount > 0" class="mt-1">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            {{ pendingCount }} usuário(s) aguardando aprovação
          </span>
        </div>
      </div>
      <div class="space-x-2">
        <button @click="loadNotifications" class="px-3 py-2 bg-blue-600 text-white rounded">
          <span v-if="notifications.length > 0" class="inline-flex items-center">
            <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            Notificações ({{ notifications.length }})
          </span>
          <span v-else>Notificações</span>
        </button>
        <button @click="novo" class="px-3 py-2 bg-brand-primary text-white rounded">Novo Usuário</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label class="sr-only" for="u-busca">Buscar</label>
        <input id="u-busca" v-model="filters.q" @keyup.enter="load" class="border rounded px-3 py-2 w-full" placeholder="Buscar por nome ou email">
      </div>
      <div>
        <label class="sr-only" for="u-role">Perfil</label>
        <select id="u-role" v-model="filters.role" class="border rounded px-3 py-2 w-full">
          <option value="">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="professor">Professor</option>
          <option value="coordenador">Coordenador</option>
        </select>
      </div>
      <div>
        <label class="sr-only" for="u-status">Status</label>
        <select id="u-status" v-model="filters.status" class="border rounded px-3 py-2 w-full">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <button @click="load" class="px-3 py-2 bg-gray-800 text-white rounded">Filtrar</button>
    </div>

    <!-- Notificações -->
    <div v-if="showNotifications" class="bg-white shadow rounded p-4 space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold">Notificações</h2>
        <button @click="showNotifications = false" class="text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div v-if="notifications.length === 0" class="text-center text-gray-500 py-4">
        Nenhuma notificação
      </div>
      <div v-else class="space-y-2">
        <div v-for="n in notifications" :key="n.id" class="border rounded p-3" :class="n.read_at ? 'bg-gray-50' : 'bg-yellow-50 border-yellow-200'">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-medium text-sm">{{ n.title }}</h3>
              <p class="text-sm text-gray-600 mt-1">{{ n.message }}</p>
              <p class="text-xs text-gray-400 mt-1">{{ formatDate(n.created_at) }}</p>
            </div>
            <div class="ml-4 space-x-2">
              <button v-if="n.type === 'user_pending_approval'" @click="approveUser(n.data.user_id)" class="px-2 py-1 text-xs bg-green-600 text-white rounded">Aprovar</button>
              <button @click="markAsRead(n.id)" class="px-2 py-1 text-xs border rounded">Marcar como lida</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white shadow rounded overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="text-left">
            <th class="px-3 py-2">Nome</th>
            <th class="px-3 py-2">Email</th>
            <th class="px-3 py-2">Perfil</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in rows" :key="u.id" class="border-t" :class="u.status === 'pendente' ? 'bg-yellow-50' : ''">
            <td class="px-3 py-2">{{ u.name }}</td>
            <td class="px-3 py-2">{{ u.email }}</td>
            <td class="px-3 py-2">{{ u.role }}</td>
            <td class="px-3 py-2">
              <span :class="[
                'px-2 py-1 rounded text-xs',
                u.status === 'ativo' ? 'bg-green-100 text-green-700' :
                u.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              ]">{{ u.status }}</span>
            </td>
            <td class="px-3 py-2 text-right space-x-2">
              <button v-if="u.status === 'pendente'" @click="approveUser(u.id)" class="px-2 py-1 text-sm bg-green-600 text-white rounded">Aprovar</button>
              <button class="px-2 py-1 text-sm border rounded" @click="edit(u)">Editar</button>
              <button class="px-2 py-1 text-sm border rounded text-red-600" @click="del(u)">Excluir</button>
            </td>
          </tr>
          <tr v-if="rows.length===0"><td colspan="5" class="px-3 py-6 text-center text-gray-500">Sem usuários</td></tr>
        </tbody>
      </table>
    </div>

    <div v-if="editing" class="bg-white shadow rounded p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ form.id ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="u-nome">Nome</label>
          <input id="u-nome" v-model="form.name" class="border rounded px-3 py-2 w-full" placeholder="Nome">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="u-email">Email</label>
          <input id="u-email" v-model="form.email" type="email" class="border rounded px-3 py-2 w-full" placeholder="email@dominio.com">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="u-role2">Perfil</label>
          <select id="u-role2" v-model="form.role" class="border rounded px-3 py-2 w-full">
            <option value="professor">Professor</option>
            <option value="admin">Administrador</option>
            <option value="coordenador">Coordenador</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="u-status2">Status</label>
          <select id="u-status2" v-model="form.status" class="border rounded px-3 py-2 w-full">
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block" for="u-pass">Senha {{ form.id ? '(deixe vazio para manter)' : '' }}</label>
          <input id="u-pass" v-model="form.password" type="password" class="border rounded px-3 py-2 w-full" :placeholder="form.id ? '••••••' : 'Defina uma senha'">
        </div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="save">Salvar</button>
        <button class="px-3 py-2 border rounded" @click="cancel">Cancelar</button>
      </div>
    </div>
  </div>
  `,
  data(){return{ 
    rows:[], 
    filters:{ q:'', role:'', status:'' }, 
    editing:false, 
    form:{ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' },
    notifications: [],
    showNotifications: false
  }},
  methods:{
    async load(){ const p={}; if(this.filters.q) p.q=this.filters.q; if(this.filters.role) p.role=this.filters.role; if(this.filters.status) p.status=this.filters.status; const r=await api.get('/users',{params:p}); this.rows=r.data?.data?.rows||[]; },
    novo(){ this.editing=true; this.form={ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' }; },
    edit(u){ this.editing=true; this.form=Object.assign({ password:'' }, u); },
    cancel(){ this.editing=false; this.form={ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' }; },
    async save(){ if(!this.form.name||!this.form.email){ alert('Informe nome e email'); return; }
      if(!this.form.id){ const payload=Object.assign({}, this.form); if(!payload.password){ alert('Defina uma senha'); return; } const r=await api.post('/users/create', payload); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao criar'); }
      else { const payload=Object.assign({}, this.form); if(!payload.password) delete payload.password; const r=await api.post('/users/update', payload, { params:{ id:this.form.id } }); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao atualizar'); }
    },
    async del(u){ if(!confirm('Excluir usuário?')) return; const r=await api.post('/users/delete', {}, { params:{ id:u.id } }); if(r.data?.ok){ this.load(); } else alert(r.data?.error||'Erro ao excluir'); },
    async loadNotifications(){ 
      try {
        const r = await api.get('/notifications'); 
        this.notifications = r.data?.data || []; 
        this.showNotifications = true; 
      } catch(e) { 
        alert('Erro ao carregar notificações'); 
      } 
    },
    async approveUser(userId) {
      if(!confirm('Aprovar este usuário?')) return;
      try {
        const r = await api.post('/register/approve', { user_id: userId, role: 'aluno', status: 'ativo' });
        if(r.data?.ok) {
          alert('Usuário aprovado com sucesso!');
          this.load();
          this.loadNotifications();
        } else {
          alert(r.data?.error || 'Erro ao aprovar usuário');
        }
      } catch(e) {
        alert('Erro ao aprovar usuário');
      }
    },
    async markAsRead(notificationId) {
      try {
        await api.post('/notifications/read', { notification_id: notificationId });
        this.loadNotifications();
      } catch(e) {
        alert('Erro ao marcar notificação como lida');
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('pt-BR');
    }
  },
  computed: {
    pendingCount() {
      return this.rows.filter(u => u.status === 'pendente').length;
    }
  },
  async mounted(){ this.load(); this.loadNotifications(); }
};

const CursosTW = {
  template: `
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Cursos</h1>
      <div class="flex gap-2">
        <button @click="newCurso" class="px-3 py-2 bg-brand-primary text-white rounded">Novo Curso</button>
        <button @click="openAssign" class="px-3 py-2 border rounded">Atribuir Professor</button>
        <button @click="openTurma" class="px-3 py-2 border rounded">Criar Turma</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <input v-model="filters.q" @keyup.enter="load" class="border rounded px-3 py-2" placeholder="Buscar por nome">
      <select v-model="filters.status" class="border rounded px-3 py-2">
        <option value="">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="inativo">Inativo</option>
      </select>
      <button @click="load" class="px-3 py-2 bg-gray-800 text-white rounded">Filtrar</button>
    </div>

    <div v-if="editing" class="bg-white shadow rounded p-4 space-y-3">
      <h2 class="text-lg font-semibold">{{ form.id ? 'Editar Curso' : 'Novo Curso' }}</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input v-model="form.name" class="border rounded px-3 py-2" placeholder="Nome do curso">
        <select v-model="form.status" class="border rounded px-3 py-2">
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <textarea v-model="form.description" class="border rounded px-3 py-2 w-full" placeholder="Descrição (opcional)"></textarea>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="save">Salvar</button>
        <button class="px-3 py-2 border rounded" @click="cancel">Cancelar</button>
      </div>
    </div>

    <div class="bg-white shadow rounded overflow-x-auto">
      <table class="min-w-full">
        <thead>
          <tr class="text-left">
            <th class="px-3 py-2">Nome</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in list" :key="c.id" class="border-t">
            <td class="px-3 py-2">{{ c.name }}</td>
            <td class="px-3 py-2">
              <span :class="['px-2 py-1 rounded text-xs', c.status==='ativo'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600']">{{ c.status }}</span>
            </td>
            <td class="px-3 py-2 text-right space-x-2">
              <button class="px-2 py-1 text-sm border rounded" @click="edit(c)">Editar</button>
              <button class="px-2 py-1 text-sm border rounded text-red-600" @click="del(c)">Excluir</button>
            </td>
          </tr>
          <tr v-if="list.length===0"><td colspan="3" class="px-3 py-6 text-center text-gray-500">Sem cursos</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Atribuir professor ao curso -->
    <div v-if="assigning" class="bg-white shadow rounded p-4 space-y-3">
      <h2 class="text-lg font-semibold">Atribuir Professor ao Curso</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Curso (id)</label>
          <input v-model.number="assign.course_id" class="border rounded px-3 py-2 w-full" placeholder="ID do curso">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Professor (id do usuário)</label>
          <input v-model.number="assign.teacher_id" class="border rounded px-3 py-2 w-full" placeholder="ID do professor (usuários)">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Papel</label>
          <select v-model="assign.role" class="border rounded px-3 py-2 w-full">
            <option value="principal">Principal</option>
            <option value="assistente">Assistente</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="saveAssign">Salvar</button>
        <button class="px-3 py-2 border rounded" @click="assigning=false">Cancelar</button>
      </div>
    </div>

    <!-- Criar Turma -->
    <div v-if="turmando" class="bg-white shadow rounded p-4 space-y-3">
      <h2 class="text-lg font-semibold">Criar Turma</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Curso (id)</label>
          <input v-model.number="turma.course_id" class="border rounded px-3 py-2 w-full" placeholder="ID do curso">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Nome da Turma</label>
          <input v-model="turma.name" class="border rounded px-3 py-2 w-full" placeholder="Ex.: Turma A">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Professor responsável (id)</label>
          <input v-model.number="turma.teacher_id" class="border rounded px-3 py-2 w-full" placeholder="ID do professor">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Ano</label>
          <input v-model.number="turma.year" type="number" class="border rounded px-3 py-2 w-full">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Semestre</label>
          <input v-model.number="turma.semestre" type="number" class="border rounded px-3 py-2 w-full">
        </div>
        <div>
          <label class="text-sm font-medium text-gray-700 mb-1 block">Horário</label>
          <input v-model="turma.schedule" class="border rounded px-3 py-2 w-full" placeholder="Ex.: 2a/4a 14:00-15:00">
        </div>
      </div>
      <div class="flex gap-2">
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="saveTurma">Salvar</button>
        <button class="px-3 py-2 border rounded" @click="turmando=false">Cancelar</button>
      </div>
    </div>
  </div>
  `,
  data(){return{ list:[], filters:{ q:'', status:'' }, editing:false, form:{ id:null, name:'', description:'', status:'ativo' }, assigning:false, assign:{ course_id:null, teacher_id:null, role:'principal' }, turmando:false, turma:{ course_id:null, name:'', teacher_id:null, year:new Date().getFullYear(), semestre:1, schedule:'' } }},
  methods:{
    async load(){ const params={}; if(this.filters.q) params.q=this.filters.q; if(this.filters.status) params.status=this.filters.status; const r=await api.get('/courses',{params}); this.list = r.data?.data || []; },
    newCurso(){ this.editing=true; this.form={ id:null, name:'', description:'', status:'ativo' }; },
    edit(c){ this.editing=true; this.form=Object.assign({},c); },
    cancel(){ this.editing=false; this.form={ id:null, name:'', description:'', status:'ativo' }; },
    async save(){ if(!this.form.name){ alert('Informe o nome'); return; } if(!this.form.id){ const r=await api.post('/courses/create', this.form); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao criar'); } else { const r=await api.post('/courses/update', this.form); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao atualizar'); } },
    async del(c){ if(!confirm('Excluir curso?')) return; const r=await api.post('/courses/delete', { id:c.id }); if(r.data?.ok){ this.load(); } else alert(r.data?.error||'Erro ao excluir'); },
    openAssign(){ this.assigning=true; },
    async saveAssign(){ if(!this.assign.course_id||!this.assign.teacher_id){ alert('Informe curso e professor'); return; } const r=await api.post('/courses/teachers/assign', this.assign); if(r.data?.ok){ alert('Professor atribuído'); this.assigning=false; } else alert(r.data?.error||'Erro'); },
    openTurma(){ this.turmando=true; },
    async saveTurma(){ const t=this.turma; if(!t.course_id||!t.name){ alert('Informe curso e nome'); return; } const r=await api.post('/classes/create', t); if(r.data?.ok){ alert('Turma criada'); this.turmando=false; } else alert(r.data?.error||'Erro ao criar turma'); }
  },
  async mounted(){ this.load(); }
};

const AgendaTW = {
  template: `
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Agenda</h1>
        <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="newEvent">Novo Evento</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input v-model="filters.q" class="border rounded px-3 py-2" placeholder="Buscar">
        <input v-model="filters.start" type="date" class="border rounded px-3 py-2">
        <input v-model="filters.end" type="date" class="border rounded px-3 py-2">
        <button class="px-3 py-2 bg-gray-800 text-white rounded" @click="load">Filtrar</button>
      </div>

      <div v-if="editing" class="bg-white shadow rounded p-4 space-y-3">
        <h2 class="text-lg font-semibold">{{ form.id ? 'Editar Evento' : 'Novo Evento' }}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input v-model="form.title" class="border rounded px-3 py-2" placeholder="Título">
          <input v-model="form.location" class="border rounded px-3 py-2" placeholder="Local (opcional)">
          <input v-model="form.date_start" type="datetime-local" class="border rounded px-3 py-2" placeholder="Início">
          <input v-model="form.date_end" type="datetime-local" class="border rounded px-3 py-2" placeholder="Fim">
        </div>
        <textarea v-model="form.notes" class="border rounded px-3 py-2 w-full" placeholder="Notas"></textarea>
        <div class="flex gap-2">
          <button class="px-3 py-2 bg-brand-primary text-white rounded" @click="save">Salvar</button>
          <button class="px-3 py-2 border rounded" @click="cancel">Cancelar</button>
        </div>
      </div>

      <div class="bg-white shadow rounded">
        <table class="min-w-full">
          <thead>
            <tr class="text-left">
              <th class="px-3 py-2">Título</th>
              <th class="px-3 py-2">Início</th>
              <th class="px-3 py-2">Fim</th>
              <th class="px-3 py-2">Local</th>
              <th class="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in list" :key="e.id" class="border-t">
              <td class="px-3 py-2">{{e.title}}</td>
              <td class="px-3 py-2">{{fmt(e.date_start)}}</td>
              <td class="px-3 py-2">{{fmt(e.date_end)}}</td>
              <td class="px-3 py-2">{{e.location||'-'}} </td>
              <td class="px-3 py-2 text-right space-x-2">
                <button class="px-2 py-1 text-sm border rounded" @click="edit(e)">Editar</button>
                <button class="px-2 py-1 text-sm border rounded text-red-600" @click="del(e)">Excluir</button>
              </td>
            </tr>
            <tr v-if="list.length===0"><td colspan="5" class="px-3 py-6 text-center text-gray-500">Sem eventos</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  data(){return{ list:[], filters:{ q:'', start:'', end:'' }, editing:false, form:{ id:null, title:'', date_start:'', date_end:'', location:'', notes:'' } }},
  methods:{
    fmt(v){ if(!v) return '-'; try{ return new Date(v).toLocaleString('pt-BR'); }catch(e){ return v; } },
    async load(){ const params={}; if(this.filters.q) params.q=this.filters.q; if(this.filters.start) params.start=this.filters.start; if(this.filters.end) params.end=this.filters.end; const r=await api.get('/agenda',{params}); this.list = r.data?.data || []; },
    newEvent(){ this.editing=true; this.form={ id:null, title:'', date_start:'', date_end:'', location:'', notes:'' }; },
    edit(e){ this.editing=true; this.form=Object.assign({},e); },
    cancel(){ this.editing=false; this.form={ id:null, title:'', date_start:'', date_end:'', location:'', notes:'' }; },
    async save(){ if(!this.form.title){ alert('Informe o título'); return; } if(!this.form.id){ const r=await api.post('/agenda/create', this.form); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao criar'); } else { const r=await api.post('/agenda/update', this.form); if(r.data?.ok){ await this.load(); this.cancel(); } else alert(r.data?.error||'Erro ao atualizar'); } },
    async del(e){ if(!confirm('Excluir evento?')) return; const r=await api.post('/agenda/delete', { id:e.id }); if(r.data?.ok){ this.load(); } else alert(r.data?.error||'Erro ao excluir'); }
  },
  async mounted(){ const d0=new Date(); d0.setDate(1); this.filters.start=d0.toISOString().slice(0,10); const d1=new Date(); d1.setMonth(d1.getMonth()+1); d1.setDate(0); this.filters.end=d1.toISOString().slice(0,10); this.load(); }
};

// Layout principal com sidebar moderna usando Tailwind
const Layout = {
  template: `
    <div class="flex min-h-screen">
      <!-- Overlay para mobile -->
      <div 
        v-if="sidebarOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="sidebarOpen = false">
      </div>
      
      <!-- Sidebar -->
      <aside 
        :class="['fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white bg-opacity-95 backdrop-blur-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
        
        <div class="p-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h5 class="text-lg font-semibold text-gray-900">Menu Principal</h5>
            <button 
              class="lg:hidden p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100" 
              @click="sidebarOpen = false">
              ✕
            </button>
          </div>
        </div>
        
        <nav class="p-3 space-y-6">
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Dashboard
            </h6>
            <router-link to="/" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Visão Geral
            </router-link>
          </div>
          
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Gestão
            </h6>
            <router-link to="/alunos" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Alunos
            </router-link>
            <router-link to="/cursos" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Cursos
            </router-link>
            <router-link to="/usuarios" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Usuários
            </router-link>
            <router-link to="/agenda" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Agenda
            </router-link>
          </div>
          
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Formulários AEE
            </h6>
            <router-link to="/entrevista-responsavel" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Entrevista com Responsável
            </router-link>
            <router-link to="/pdi" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              PDI - ConectAEE
            </router-link>
            <router-link to="/plano-atendimento" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              Plano de Atendimento Individual
            </router-link>
          </div>
          
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Relatórios
            </h6>
            <router-link to="/relatorios" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Relatórios
            </router-link>
          </div>
        </nav>
      </aside>
      
      <!-- Conteúdo principal -->
      <main class="flex-1 lg:ml-0">
        <!-- Header com botão do menu mobile -->
        <header class="bg-white border-b border-gray-200 px-4 py-3 lg:px-6">
          <div class="flex items-center justify-between">
            <button 
              class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
              @click="sidebarOpen = !sidebarOpen">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-600">Bem-vindo, {{ user?.name || 'Usuário' }}</span>
              <button 
                @click="logout" 
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">
                Sair
              </button>
            </div>
          </div>
        </header>
        
        <!-- Área de conteúdo -->
        <div class="p-4 lg:p-6">
          <router-view></router-view>
        </div>
      </main>
    </div>
  `,
  data() {
    return {
      sidebarOpen: false,
      user: null
    }
  },
  methods: {
    closeMobileSidebar() {
      if (window.innerWidth < 1024) {
        this.sidebarOpen = false;
      }
    },
    async logout() {
      try {
        await api.post('/logout');
      } catch (error) {
        console.error('Erro no logout:', error);
      } finally {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }
  },
  async mounted() {
    try {
      const response = await api.get('/user');
      this.user = (response.data && response.data.data) ? response.data.data : response.data;
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }
};

// Página de Login
const Login = {
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <div class="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
            </svg>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ConectEdu v5.0
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600">
            Sistema de Gestão Educacional
          </p>
        </div>
        
        <form class="mt-8 space-y-6" @submit.prevent="login">
          <div class="rounded-md shadow-sm -space-y-px">
            <div>
              <label for="email" class="sr-only">Email</label>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                required 
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" 
                placeholder="Email">
            </div>
            <div>
              <label for="password" class="sr-only">Senha</label>
              <input 
                id="password" 
                v-model="password" 
                type="password" 
                required 
                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm" 
                placeholder="Senha">
            </div>
          </div>

          <div v-if="error" class="rounded-md bg-red-50 p-4">
            <div class="text-sm text-red-700">{{ error }}</div>
          </div>

          <div>
            <button 
              type="submit" 
              :disabled="loading"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
              <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              </span>
              Entrar
            </button>
          </div>

          <div class="text-center">
            <p class="text-sm text-gray-600">
              Não tem uma conta? 
              <router-link to="/register" class="font-medium text-brand-primary hover:text-brand-primary-dark">
                Registre-se
              </router-link>
            </p>
          </div>
        </form>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });
        
        const token = response.data?.data?.token || response.data?.token;
        if (!token) throw new Error('TOKEN_MISSING');
        localStorage.setItem('token', token);
        this.$router.push('/');
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao fazer login';
      } finally {
        this.loading = false;
      }
    }
  }
};

// Dashboard principal
const Dashboard = {
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-600">Visão geral do sistema educacional</p>
      </div>
      
      <!-- Cards de estatísticas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total de Alunos</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.alunos }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Cursos Ativos</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.cursos }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm6-6V7a4 4 0 10-8 0v4h8z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Eventos Hoje</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.eventos_hoje }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Formulários AEE</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.formularios }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gráfico de atividades recentes -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Atividades Recentes
          </h3>
          <div id="chart-container" style="height: 300px;"></div>
        </div>
      </div>
      
      <!-- Lista de atividades recentes -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
            Últimas Atividades
          </h3>
          <div class="flow-root">
            <ul class="-mb-8">
              <li v-for="(atividade, index) in atividades" :key="index">
                <div class="relative pb-8" v-if="index < atividades.length - 1">
                  <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                  <div class="relative flex space-x-3">
                    <div>
                      <span class="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center ring-8 ring-white">
                        <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">{{ atividade.descricao }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ atividade.data }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="relative flex space-x-3" v-else>
                  <div>
                    <span class="h-8 w-8 rounded-full bg-brand-primary flex items-center justify-center ring-8 ring-white">
                      <svg class="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                      </svg>
                    </span>
                  </div>
                  <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                    <div>
                      <p class="text-sm text-gray-500">{{ atividade.descricao }}</p>
                    </div>
                    <div class="text-right text-sm whitespace-nowrap text-gray-500">
                      {{ atividade.data }}
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      stats: {
        alunos: 0,
        cursos: 0,
        eventos_hoje: 0,
        formularios: 0
      },
      atividades: []
    }
  },
  async mounted() {
    await this.loadStats();
    await this.loadAtividades();
    this.renderChart();
  },
  methods: {
    async loadStats() {
      try {
        const response = await api.get('/stats');
        const d = response.data?.data || {};
        const cards = d.cards || {};
        this.stats = {
          alunos: Number(cards.total_students || 0),
          cursos: Number(cards.active_students || 0),
          eventos_hoje: Array.isArray(d.recent) ? Math.min(d.recent.length, 99) : 0,
          formularios: Number(cards.formularios_pendentes || 0)
        };
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      }
    },
    async loadAtividades() {
      try {
        const response = await api.get('/stats');
        const recent = response.data?.data?.recent || [];
        this.atividades = recent.map(r => ({ descricao: r.message, data: new Date(r.created_at).toLocaleString('pt-BR') }));
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
      }
    },
    renderChart() {
      // Implementação do gráfico com Highcharts
      Highcharts.chart('chart-container', {
        chart: {
          type: 'line'
        },
        title: {
          text: 'Atividades por Dia'
        },
        xAxis: {
          categories: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
        },
        yAxis: {
          title: {
            text: 'Número de Atividades'
          }
        },
        series: [{
          name: 'Esta Semana',
          data: [7, 12, 16, 8, 15, 3, 1]
        }, {
          name: 'Semana Anterior',
          data: [5, 8, 12, 6, 10, 2, 0]
        }]
      });
    }
  }
};


// Relatórios e IA (análise do aluno)
const Relatorios = {
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Relatórios</h1>
          <p class="mt-1 text-sm text-gray-600">Selecione um aluno para ver relatórios e gerar análise com IA</p>
        </div>
      </div>

      <div class="bg-white shadow rounded p-4 space-y-3">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input v-model="query" @keyup.enter="buscar" class="border rounded px-3 py-2" placeholder="Buscar aluno por nome" />
          <button @click="buscar" class="px-3 py-2 bg-gray-800 text-white rounded">Buscar</button>
          <select v-model="alunoId" class="border rounded px-3 py-2">
            <option value="">Selecione um aluno</option>
            <option v-for="s in alunos" :key="s.id" :value="s.id">{{ s.name }} (#{{ s.id }})</option>
          </select>
        </div>

        <div class="flex flex-wrap gap-2" v-if="alunoId">
          <button @click="carregarRelatorio" class="px-3 py-2 bg-brand-primary text-white rounded">Carregar dados</button>
          <a :href="pdfUrl('student')" target="_blank" class="px-3 py-2 border rounded">PDF Geral</a>
          <a :href="pdfUrl('anamnese')" target="_blank" class="px-3 py-2 border rounded">PDF Anamneses</a>
          <a :href="pdfUrl('pdi')" target="_blank" class="px-3 py-2 border rounded">PDF PDI</a>
          <a :href="pdfUrl('pai')" target="_blank" class="px-3 py-2 border rounded">PDF PAI</a>
          <button @click="analiseIA" class="px-3 py-2 bg-purple-600 text-white rounded" :disabled="loadingIA">
            <span v-if="loadingIA" class="inline-flex items-center"><span class="spinner mr-2"></span>Gerando...</span>
            <span v-else>Análise com IA</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6" v-if="alunoId">
        <div class="bg-white shadow rounded p-4">
          <h2 class="text-lg font-semibold mb-3">Dados consolidados</h2>
          <pre class="text-xs bg-gray-50 border rounded p-3 overflow-auto" style="max-height:360px">{{ pretty(relatorio) }}</pre>
        </div>
        <div class="bg-white shadow rounded p-4">
          <h2 class="text-lg font-semibold mb-3">Análise com IA</h2>
          <div v-if="erroIA" class="text-sm text-red-600 mb-2">{{ erroIA }}</div>
          <pre class="text-xs bg-gray-50 border rounded p-3 overflow-auto" style="max-height:360px">{{ pretty(analise) }}</pre>
        </div>
      </div>
    </div>
  `,
  data(){
    return {
      query: '',
      alunos: [],
      alunoId: '',
      relatorio: null,
      analise: null,
      loadingIA: false,
      erroIA: null
    };
  },
  methods: {
    async buscar(){
      const params = { q: this.query, per_page: 30 };
      try { const r = await api.get('/students', { params }); this.alunos = (r.data?.data?.rows)||[]; }
      catch(e){ alert('Erro ao buscar alunos'); }
    },
    async carregarRelatorio(){
      if(!this.alunoId) return;
      try { const r = await api.get('/reports/student', { params:{ student_id: this.alunoId }}); this.relatorio = r.data?.data||r.data; }
      catch(e){ alert('Erro ao carregar relatório'); }
    },
    pdfUrl(tipo){
      if(!this.alunoId) return '#';
      const base = CONFIG.API_BASE;
      if(tipo==='student') return `${base}/reports/student/pdf?student_id=${this.alunoId}`;
      if(tipo==='anamnese') return `${base}/forms/anamnese/pdf?student_id=${this.alunoId}`;
      if(tipo==='pdi') return `${base}/pdi/pdf?student_id=${this.alunoId}`;
      if(tipo==='pai') return `${base}/pai/pdf?student_id=${this.alunoId}`;
      return '#';
    },
    async analiseIA(){
      this.loadingIA = true; this.erroIA=null; this.analise=null;
      try {
        const r = await api.get('/ai/evaluate-student', { params:{ student_id: this.alunoId }});
        this.analise = r.data?.data || r.data;
      } catch(err){
        this.erroIA = err?.response?.data?.error || err.message || 'Erro na análise com IA';
      } finally { this.loadingIA = false; }
    },
    pretty(o){ try{ return JSON.stringify(o, null, 2); }catch(e){ return String(o); } }
  }
};


// Componente para Entrevista com Responsável
const EntrevistaResponsavel = {
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Entrevista com Responsável</h1>
        <p class="mt-1 text-sm text-gray-600">Formulário de entrevista inicial com o responsável pelo aluno</p>
      </div>
      
      <form @submit.prevent="salvarEntrevista" class="space-y-8">
        <!-- Dados do Aluno -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Dados do Aluno</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome completo do aluno</label>
              <input v-model="form.nome_aluno" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data de nascimento</label>
              <input v-model="form.data_nascimento" type="date" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Idade</label>
              <input v-model="form.idade" type="number" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Escola</label>
              <input v-model="form.escola" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Série/Ano</label>
              <input v-model="form.serie" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Turno</label>
              <select v-model="form.turno" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Dados do Responsável -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Dados do Responsável</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome completo</label>
              <input v-model="form.nome_responsavel" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Parentesco</label>
              <select v-model="form.parentesco" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="pai">Pai</option>
                <option value="mae">Mãe</option>
                <option value="avo">Avô/Avó</option>
                <option value="tio">Tio/Tia</option>
                <option value="responsavel_legal">Responsável Legal</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input v-model="form.telefone" type="tel" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input v-model="form.email" type="email" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Histórico Médico -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Histórico Médico</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Diagnóstico médico</label>
              <textarea v-model="form.diagnostico" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Medicamentos em uso</label>
              <textarea v-model="form.medicamentos" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Profissionais que acompanham</label>
              <textarea v-model="form.profissionais" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Desenvolvimento e Comportamento -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Desenvolvimento e Comportamento</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Como é o comportamento do aluno em casa?</label>
              <textarea v-model="form.comportamento_casa" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Principais dificuldades observadas</label>
              <textarea v-model="form.dificuldades" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Habilidades e potencialidades</label>
              <textarea v-model="form.habilidades" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Expectativas -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Expectativas</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">O que espera do atendimento educacional especializado?</label>
              <textarea v-model="form.expectativas" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Informações adicionais</label>
              <textarea v-model="form.informacoes_adicionais" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-4">
          <button type="button" @click="$router.push('/')" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
            <span v-if="loading" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Salvando...
            </span>
            <span v-else>Salvar Entrevista</span>
          </button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      loading: false,
      form: {
        nome_aluno: '',
        data_nascimento: '',
        idade: '',
        escola: '',
        serie: '',
        turno: '',
        nome_responsavel: '',
        parentesco: '',
        telefone: '',
        email: '',
        diagnostico: '',
        medicamentos: '',
        profissionais: '',
        comportamento_casa: '',
        dificuldades: '',
        habilidades: '',
        expectativas: '',
        informacoes_adicionais: ''
      }
    }
  },
  methods: {
    async salvarEntrevista() {
      this.loading = true;
      try {
        await api.post('/entrevistas-responsavel', this.form);
        alert('Entrevista salva com sucesso!');
        this.$router.push('/');
      } catch (error) {
        alert('Erro ao salvar entrevista: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  }
};

// Componente para PDI - ConectAEE
const PDI = {
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">PDI - Plano de Desenvolvimento Individual</h1>
        <p class="mt-1 text-sm text-gray-600">ConectAEE - Atendimento Educacional Especializado</p>
      </div>
      
      <form @submit.prevent="salvarPDI" class="space-y-8">
        <!-- Identificação -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Identificação</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Aluno</label>
              <input v-model="form.nome_aluno" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
              <input v-model="form.data_nascimento" type="date" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Escola</label>
              <input v-model="form.escola" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Ano/Série</label>
              <input v-model="form.ano_serie" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Professor AEE</label>
              <input v-model="form.professor_aee" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Período</label>
              <input v-model="form.periodo" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Diagnóstico -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Diagnóstico e Caracterização</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
              <textarea v-model="form.diagnostico" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Características observadas</label>
              <textarea v-model="form.caracteristicas" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Habilidades e Dificuldades -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Habilidades e Dificuldades</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Habilidades Identificadas</label>
              <textarea v-model="form.habilidades" rows="6" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Dificuldades Identificadas</label>
              <textarea v-model="form.dificuldades" rows="6" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Objetivos -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Objetivos do PDI</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Objetivo Geral</label>
              <textarea v-model="form.objetivo_geral" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Objetivos Específicos</label>
              <textarea v-model="form.objetivos_especificos" rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Estratégias e Recursos -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Estratégias e Recursos</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Estratégias Pedagógicas</label>
              <textarea v-model="form.estrategias" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Recursos Necessários</label>
              <textarea v-model="form.recursos" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tecnologia Assistiva</label>
              <textarea v-model="form.tecnologia_assistiva" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Avaliação -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Avaliação e Acompanhamento</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Critérios de Avaliação</label>
              <textarea v-model="form.criterios_avaliacao" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Periodicidade de Revisão</label>
              <select v-model="form.periodicidade_revisao" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-4">
          <button type="button" @click="$router.push('/')" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
            <span v-if="loading" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Salvando...
            </span>
            <span v-else>Salvar PDI</span>
          </button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      loading: false,
      form: {
        nome_aluno: '',
        data_nascimento: '',
        escola: '',
        ano_serie: '',
        professor_aee: '',
        periodo: '',
        diagnostico: '',
        caracteristicas: '',
        habilidades: '',
        dificuldades: '',
        objetivo_geral: '',
        objetivos_especificos: '',
        estrategias: '',
        recursos: '',
        tecnologia_assistiva: '',
        criterios_avaliacao: '',
        periodicidade_revisao: ''
      }
    }
  },
  methods: {
    async salvarPDI() {
      this.loading = true;
      try {
        await api.post('/pdi', this.form);
        alert('PDI salvo com sucesso!');
        this.$router.push('/');
      } catch (error) {
        alert('Erro ao salvar PDI: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  }
};

// Componente para Plano de Atendimento Individual
const PlanoAtendimento = {
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Plano de Atendimento Individual</h1>
        <p class="mt-1 text-sm text-gray-600">Planejamento detalhado do atendimento educacional especializado</p>
      </div>
      
      <form @submit.prevent="salvarPlano" class="space-y-8">
        <!-- Identificação -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Identificação do Aluno</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome Completo</label>
              <input v-model="form.nome_aluno" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
              <input v-model="form.data_nascimento" type="date" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matrícula</label>
              <input v-model="form.matricula" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Escola de Origem</label>
              <input v-model="form.escola_origem" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Necessidades Educacionais -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Necessidades Educacionais Especiais</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Deficiência/Transtorno</label>
              <select v-model="form.tipo_necessidade" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="deficiencia_intelectual">Deficiência Intelectual</option>
                <option value="deficiencia_fisica">Deficiência Física</option>
                <option value="deficiencia_visual">Deficiência Visual</option>
                <option value="deficiencia_auditiva">Deficiência Auditiva</option>
                <option value="deficiencia_multipla">Deficiência Múltipla</option>
                <option value="tea">Transtorno do Espectro Autista</option>
                <option value="altas_habilidades">Altas Habilidades/Superdotação</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descrição das Necessidades</label>
              <textarea v-model="form.descricao_necessidades" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Objetivos do Atendimento -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Objetivos do Atendimento</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Objetivo Geral</label>
              <textarea v-model="form.objetivo_geral" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Objetivos Específicos</label>
              <textarea v-model="form.objetivos_especificos" rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                placeholder="Liste os objetivos específicos, um por linha"></textarea>
            </div>
          </div>
        </div>

        <!-- Atividades e Metodologia -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Atividades e Metodologia</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Atividades Propostas</label>
              <textarea v-model="form.atividades" rows="5" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Metodologia de Ensino</label>
              <textarea v-model="form.metodologia" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Recursos Didáticos</label>
              <textarea v-model="form.recursos_didaticos" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Cronograma -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Cronograma de Atendimento</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Frequência Semanal</label>
              <select v-model="form.frequencia_semanal" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="1">1 vez por semana</option>
                <option value="2">2 vezes por semana</option>
                <option value="3">3 vezes por semana</option>
                <option value="4">4 vezes por semana</option>
                <option value="5">5 vezes por semana</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Duração da Sessão</label>
              <select v-model="form.duracao_sessao" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Período de Atendimento</label>
              <select v-model="form.periodo_atendimento" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="matutino">Matutino</option>
                <option value="vespertino">Vespertino</option>
                <option value="noturno">Noturno</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Horários Específicos</label>
            <textarea v-model="form.horarios_especificos" rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              placeholder="Ex: Segunda-feira: 14h às 15h, Quarta-feira: 14h às 15h"></textarea>
          </div>
        </div>

        <!-- Avaliação e Acompanhamento -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Avaliação e Acompanhamento</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Instrumentos de Avaliação</label>
              <textarea v-model="form.instrumentos_avaliacao" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Critérios de Avaliação</label>
              <textarea v-model="form.criterios_avaliacao" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Periodicidade de Revisão do Plano</label>
              <select v-model="form.periodicidade_revisao" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="mensal">Mensal</option>
                <option value="bimestral">Bimestral</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Observações Gerais</h3>
          <textarea v-model="form.observacoes" rows="4" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            placeholder="Informações adicionais relevantes para o atendimento"></textarea>
        </div>

        <!-- Botões de ação -->
        <div class="flex justify-end space-x-4">
          <button type="button" @click="$router.push('/')" 
            class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-2 bg-brand-primary border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary disabled:opacity-50">
            <span v-if="loading" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Salvando...
            </span>
            <span v-else>Salvar Plano</span>
          </button>
        </div>
      </form>
    </div>
  `,
  data() {
    return {
      loading: false,
      form: {
        nome_aluno: '',
        data_nascimento: '',
        matricula: '',
        escola_origem: '',
        tipo_necessidade: '',
        descricao_necessidades: '',
        objetivo_geral: '',
        objetivos_especificos: '',
        atividades: '',
        metodologia: '',
        recursos_didaticos: '',
        frequencia_semanal: '',
        duracao_sessao: '',
        periodo_atendimento: '',
        horarios_especificos: '',
        instrumentos_avaliacao: '',
        criterios_avaliacao: '',
        periodicidade_revisao: '',
        observacoes: ''
      }
    }
  },
  methods: {
    async salvarPlano() {
      this.loading = true;
      try {
        await api.post('/planos-atendimento', this.form);
        alert('Plano de Atendimento salvo com sucesso!');
        this.$router.push('/');
      } catch (error) {
        alert('Erro ao salvar plano: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  }
};


// Configuração das rotas
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: RegisterTW },
  { 
    path: '/', 
    component: Layout,
    beforeEnter: AuthGuard,
    children: [
      { path: '', component: Dashboard },
      { path: 'alunos', component: AlunosTW },
      { path: 'cursos', component: CursosTW },
      { path: 'agenda', component: AgendaTW },
      { path: 'usuarios', component: UsuariosTW },
      { path: 'entrevista-responsavel', component: EntrevistaResponsavel },
      { path: 'pdi', component: PDI },
      { path: 'plano-atendimento', component: PlanoAtendimento },
      { path: 'relatorios', component: Relatorios }
    ]
  }
];

// Configuração do router
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

// Normaliza rotas com letras maiúsculas para evitar páginas em branco (#/Alunos -> #/alunos)
router.beforeEach((to, from, next) => {
  const lower = to.path.toLowerCase();
  if (to.path !== lower) {
    return next(lower);
  }
  next();
});

// Configuração da aplicação Vue
const { createApp } = Vue;

const app = createApp({
  data() {
    return {
      loading: true
    }
  },
  async mounted() {
    // Verificar se há token válido
    const token = localStorage.getItem('token');
    if (token && this.$route.path !== '/login') {
      try {
        await api.get('/user');
      } catch (error) {
        localStorage.removeItem('token');
        this.$router.push('/login');
      }
    }
    this.loading = false;
  }
});

// Adicionar estilos customizados para navegação
const style = document.createElement('style');
style.textContent = `
  .nav-link-tw {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: #374151;
    text-decoration: none;
    border-radius: 0.5rem;
    transition: all 0.2s ease;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }
  
  .nav-link-tw:hover {
    background-color: #f3f4f6;
    color: #111827;
    transform: translateX(4px);
  }
  
  .nav-link-tw.router-link-active {
    background-color: #dbeafe;
    color: #1d4ed8;
    font-weight: 600;
  }
  
  .fade-in {
    animation: fadeIn 0.5s ease-in-out;
  }
  
  .slide-up {
    animation: slideUp 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  /* Modal styles */
  .modal {
    display: none;
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgba(0,0,0,0.5);
  }
  
  .modal.tw-open {
    display: flex !important;
    align-items: center;
    justify-content: center;
  }
  
  .modal-dialog {
    position: relative;
    width: auto;
    margin: 1.75rem;
    pointer-events: none;
  }
  
  .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid rgba(0,0,0,0.2);
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
  }
  
  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1rem 1rem;
    border-bottom: 1px solid #dee2e6;
    border-top-left-radius: 0.5rem;
    border-top-right-radius: 0.5rem;
  }
  
  .modal-body {
    position: relative;
    flex: 1 1 auto;
    padding: 1rem;
  }
  
  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0.75rem;
    border-top: 1px solid #dee2e6;
    border-bottom-right-radius: 0.5rem;
    border-bottom-left-radius: 0.5rem;
  }
  
  /* Responsividade */
  @media (max-width: 768px) {
    .modal-dialog {
      margin: 0.5rem;
      max-width: calc(100% - 1rem);
    }
  }
  
  /* Loading spinner */
  .spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid #f3f3f3;
    border-radius: 50%;
    border-top-color: #1d4ed8;
    animation: spin 1s ease-in-out infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  /* Estados de loading */
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  /* Melhorias de acessibilidade */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  
  /* Focus visível */
  *:focus {
    outline: 2px solid #1d4ed8;
    outline-offset: 2px;
  }
  
  /* Estilos para impressão */
  @media print {
    .sidebar,
    .brand-header,
    .btn,
    .modal {
      display: none !important;
    }
    
    .main-content {
      margin-left: 0 !important;
    }
    
    .card {
      border: 1px solid #000;
      box-shadow: none;
    }
  }
`;
document.head.appendChild(style);

// Usar router e montar aplicação
app.use(router);
app.mount('#app');

// Inicialização completa
console.log('ConectEdu v5.0 - Sistema inicializado com Tailwind CSS');

