// ConectAEE v5.0 - Sistema de Gestão Educacional com Tailwind CSS

// Debug inicial

// Configuração da API
const api = axios.create({
  baseURL: CONFIG.API_BASE, 
  timeout: 15000
});


// Roteamento da API: detecção automática de PATH_INFO vs query (?action=)
window.__API_ROUTING = window.__API_ROUTING || { mode: 'path', detected: false };

async function ensureApiRouting() {
  if (window.__API_ROUTING.detected) return window.__API_ROUTING.mode;
  const base = CONFIG.API_BASE;
  const tryFetch = async (url) => {
    try {
      const r = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
      if (r.ok) {
        // não precisamos validar payload; basta HTTP 200/2xx
        return true;
      }
    } catch (e) { /* ignore */ }
    return false;
  };
  // Primeiro tenta modo PATH
  const okPath = await tryFetch(base.replace(/\/$/, '') + '/health');
  if (okPath) {
    window.__API_ROUTING.mode = 'path';
    window.__API_ROUTING.detected = true;
    return 'path';
  }
  // Fallback para modo QUERY
  const okQuery = await tryFetch(base + (base.includes('?') ? '&' : '?') + 'action=health');
  if (okQuery) {
    window.__API_ROUTING.mode = 'query';
    window.__API_ROUTING.detected = true;
    return 'query';
  }
  // Se ambos falharem, mantém path por padrão (pode ser CORS ou offline)
  window.__API_ROUTING.detected = true;
  console.warn('⚠️ Não foi possível detectar o modo de roteamento da API. Mantendo PATH como padrão.');
  return window.__API_ROUTING.mode;
}

// Helper para montar URLs absolutas respeitando o modo detectado
function buildApiUrl(route, query) {
  const r = route.startsWith('/') ? route : '/' + route;
  const mode = window.__API_ROUTING?.mode || 'path';
  if (mode === 'query') {
    let url = CONFIG.API_BASE + (CONFIG.API_BASE.includes('?') ? '&' : '?') + 'action=' + r.slice(1);
    if (query && String(query).length) {
      const q = String(query).startsWith('?') ? String(query).slice(1) : String(query);
      url += '&' + q;
    }
    return url;
  } else {
    let url = CONFIG.API_BASE.replace(/\/$/, '') + r;
    if (query && String(query).length) {
      url += (String(query).startsWith('?') ? String(query) : '?' + String(query));
    }
    return url;
  }
}

// Interceptadores para autenticação
api.interceptors.request.use(cfg => {
  // Reescrita de URL para ambientes sem PATH_INFO
  // - Só aplica para URLs relativas (não absolutas) e quando modo=query
  const isAbsolute = /^(https?:)?\/\//i.test(cfg.url || '');
  const mode = window.__API_ROUTING?.mode || 'path';
  if (!isAbsolute && mode === 'query' && typeof cfg.url === 'string') {
    let route = cfg.url.startsWith('/') ? cfg.url.slice(1) : cfg.url;
    // Evita dupla aplicação caso já esteja em formato ?action=
    if (!route.startsWith('?')) {
      cfg.url = '?action=' + route;
    }
  }
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
  <div class="space-y-4" role="main">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900" id="alunos-heading">Alunos</h1>
      <button @click="newAluno" 
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
              aria-label="Adicionar novo aluno">Novo Aluno</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <!-- Filtros Desktop -->
      <div class="hidden md:block">
        <div>
          <label class="sr-only" for="alunos-busca">Buscar por nome</label>
          <input id="alunos-busca" v-model="filters.q" @keyup.enter="load" 
                 class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                 placeholder="Buscar por nome">
        </div>
      </div>
      <div class="hidden md:block">
        <label class="sr-only" for="alunos-status">Status</label>
        <select id="alunos-status" v-model="filters.status" 
                class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <div class="hidden md:block">
        <label class="sr-only" for="alunos-modalidade">Modalidade</label>
        <select id="alunos-modalidade" v-model="filters.modalidade" 
                class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
          <option value="">Todas modalidades</option>
          <option value="apoio">Apoio</option>
          <option value="srm">SRM</option>
        </select>
      </div>
      <button @click="load" 
              class="hidden md:block px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
              aria-label="Aplicar filtros de busca">
        <i class="fas fa-search mr-2" aria-hidden="true"></i>Filtrar
      </button>

      <!-- Filtros Mobile -->
      <div class="md:hidden bg-white shadow rounded-lg p-4 mb-4">
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">🔍 Buscar Aluno</label>
            <input v-model="filters.q" @keyup.enter="load" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                   placeholder="Digite o nome do aluno...">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select v-model="filters.status" 
                      class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Todos</option>
                <option value="ativo">✅ Ativo</option>
                <option value="inativo">❌ Inativo</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Modalidade</label>
              <select v-model="filters.modalidade" 
                      class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Todas</option>
                <option value="apoio">👨‍🏫 Apoio</option>
                <option value="srm">🏫 SRM</option>
              </select>
            </div>
          </div>
          <button @click="load" class="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            🔍 Buscar Alunos
          </button>
        </div>
      </div>
    </div>

    <!-- Visualização Desktop -->
    <div class="bg-white shadow rounded-lg overflow-hidden hidden md:block" role="region" aria-labelledby="alunos-heading">
      <table class="min-w-full" role="table" aria-label="Lista de alunos">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                @click="sortBy('name')" @keydown.enter="sortBy('name')" @keydown.space="sortBy('name')" tabindex="0"
                role="columnheader" :aria-sort="sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <div class="flex items-center justify-between">
                <span>Nome</span>
                <svg v-if="sortField === 'name'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </th>
      <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                @click="sortBy('status')" @keydown.enter="sortBy('status')" @keydown.space="sortBy('status')" tabindex="0"
                role="columnheader" :aria-sort="sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <div class="flex items-center justify-between">
                <span>Status</span>
                <svg v-if="sortField === 'status'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-gray-700" role="columnheader">Escola</th>
            <th class="px-6 py-3 text-right text-gray-700" role="columnheader">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in rows" :key="s.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ s.name || '—' }}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 rounded text-xs font-medium uppercase bg-blue-100 text-blue-800">{{ s.modalidade || '—' }}</span>
            </td>
            <td class="px-6 py-4">
              <span :class="['px-2 py-1 rounded text-xs font-medium', s.status==='ativo'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600']">{{ s.status || '—' }}</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              <span class="flex items-center">
                <i class="fas fa-school text-blue-500 mr-2" aria-hidden="true"></i>
                {{ s.school_name || 'Sem escola' }}
              </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
              <button class="inline-flex items-center text-blue-800 hover:text-blue-900 mr-1 px-2 py-1 border border-blue-200 rounded transition-colors" 
                      @click="edit(s)" :aria-label="'Editar aluno ' + s.name">
                <i class="fas fa-edit mr-1" aria-hidden="true"></i>
                <span>Editar</span>
              </button>
              <button class="inline-flex items-center text-red-800 hover:text-red-900 px-2 py-1 border border-red-200 rounded transition-colors" 
                      @click="del(s)" :aria-label="'Excluir aluno ' + s.name">
                <i class="fas fa-trash mr-1" aria-hidden="true"></i>
                <span>Excluir</span>
              </button>
            </td>
          </tr>
          <tr v-if="!rows || rows.length===0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-700">
              {{ (filters.q || filters.status || filters.modalidade) ? 'Nenhum resultado para os filtros aplicados' : 'Sem registros' }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginação -->
      <nav v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-4 py-3 border-t" role="navigation" aria-label="Navegação por páginas">
        <div class="text-sm text-gray-700" aria-live="polite">
          Mostrando {{ (currentPage - 1) * perPage + 1 }} a {{ Math.min(currentPage * perPage, totalItems) }} de {{ totalItems }} alunos
        </div>
        <div class="flex items-center space-x-2">
          <button @click="previousPage" :disabled="currentPage === 1" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  :aria-label="'Ir para página anterior'"
                  :aria-disabled="currentPage === 1">
            <i class="fas fa-chevron-left mr-1" aria-hidden="true"></i>Anterior
          </button>
          <button v-for="page in visiblePages" :key="page" 
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 text-sm cursor-pointer rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 focus:bg-gray-50'
                ]"
                :aria-label="'Ir para página ' + page"
                :aria-current="page === currentPage ? 'page' : false">
            {{ page }}
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  :aria-label="'Ir para próxima página'"
                  :aria-disabled="currentPage === totalPages">
            Próxima<i class="fas fa-chevron-right ml-1" aria-hidden="true"></i>
          </button>
        </div>
      </nav>
    </div>

    <!-- Visualização Mobile -->
    <div class="md:hidden space-y-3">
      <div v-for="s in rows" :key="s.id" class="bg-white shadow rounded-lg p-4 border-l-4 border-brand-primary">
        <div class="flex items-start justify-between mb-3">
          <h3 class="font-medium text-gray-900 text-lg">{{ s.name }}</h3>
          <div class="flex space-x-1">
            <span :class="['px-2 py-1 rounded text-xs font-medium', s.status==='ativo'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-600']">{{ s.status }}</span>
          </div>
        </div>
        
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-700">Modalidade:</span>
            <span class="px-2 py-1 rounded text-xs font-medium uppercase bg-blue-100 text-blue-800">{{ s.modalidade }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-700">Escola:</span>
            <span class="text-gray-900 flex items-center">
              <i class="fas fa-school text-blue-500 mr-1"></i>
              {{ s.school_name || 'Sem escola' }}
            </span>
          </div>
        </div>
        
        <div class="flex space-x-2 mt-4 pt-3 border-t">
          <button class="flex-1 px-3 py-2 text-sm border rounded hover:bg-gray-50 transition-colors" @click="edit(s)">
            📝 Editar
          </button>
          <button class="flex-1 px-3 py-2 text-sm border rounded text-red-600 hover:bg-red-50 transition-colors" @click="del(s)">
            🗑️ Excluir
          </button>
        </div>
      </div>
      
      <div v-if="!rows || rows.length===0" class="bg-white shadow rounded-lg p-8 text-center text-gray-700">
        Nenhum aluno encontrado
      </div>
      
      <!-- Paginação Mobile -->
      <div v-if="totalPages > 1" class="bg-white shadow rounded-lg p-4">
        <div class="text-sm text-gray-700 text-center mb-3">
          {{ (currentPage - 1) * perPage + 1 }} - {{ Math.min(currentPage * perPage, totalItems) }} de {{ totalItems }} alunos
        </div>
        <div class="flex justify-center space-x-2">
          <button @click="previousPage" :disabled="currentPage === 1" 
                  class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            ← Anterior
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" 
                  class="px-4 py-2 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
            Próxima →
          </button>
        </div>
      </div>
    </div>
      
      <!-- Paginação -->
      <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-4 py-3 border-t">
        <div class="text-sm text-gray-700">
          Mostrando {{ (currentPage - 1) * perPage + 1 }} a {{ Math.min(currentPage * perPage, totalItems) }} de {{ totalItems }} alunos
        </div>
        <div class="flex items-center space-x-2">
          <button @click="previousPage" :disabled="currentPage === 1" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  :aria-label="'Ir para página anterior'"
                  :aria-disabled="currentPage === 1">
            Anterior
          </button>
          <span v-for="page in visiblePages" :key="page" 
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 text-sm cursor-pointer rounded',
                  page === currentPage ? 'bg-brand-primary text-white' : 'border hover:bg-gray-50 focus:bg-gray-50'
                ]"
                :aria-label="'Ir para página ' + page"
                :aria-current="page === currentPage ? 'page' : false">
            {{ page }}
          </span>
          <button @click="nextPage" :disabled="currentPage === totalPages" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  :aria-label="'Ir para próxima página'"
                  :aria-disabled="currentPage === totalPages">
            Próxima
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Criar/Editar Aluno -->
    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto" style="background-color: rgba(0, 0, 0, 0.85);" role="dialog" aria-labelledby="form-heading" aria-modal="true" @click.self="cancel">
      <div class="bg-gray-50 rounded-lg w-full max-w-4xl overflow-y-auto shadow-xl p-6 space-y-6 border border-gray-200 m-4" style="max-height: calc(100vh - 2rem);">
        <div class="flex items-center justify-between sticky top-0 bg-gray-50 pb-4 border-b border-gray-200 -mx-6 px-6 -mt-6 pt-6 z-10">
          <h1 id="form-heading" class="text-2xl font-bold text-gray-900">{{ form.id ? 'Editar Aluno' : 'Novo Aluno' }}</h1>
          <button @click="cancel" class="text-gray-500 hover:text-gray-700" aria-label="Fechar">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
      
      <!-- Barra de Progresso -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-2">
          <div class="text-sm font-medium text-gray-600">Progresso</div>
          <div class="text-sm font-medium text-blue-600">{{ Math.round((currentStepAluno / (totalStepsAluno || 1)) * 100) }}%</div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300" 
               :style="{ width: (currentStepAluno / (totalStepsAluno || 1)) * 100 + '%' }"></div>
        </div>
      </div>

      <!-- Indicadores de Etapas -->
      <div class="flex justify-between mb-8">
        <div v-for="(step, index) in stepsAluno" :key="index" 
             class="flex flex-col items-center cursor-pointer transition-all duration-200"
             @click="goToStepAluno(index)">
          <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200"
               :class="index < currentStepAluno ? 'bg-blue-500 border-blue-500 text-white' : 
                       index === currentStepAluno ? 'bg-blue-100 border-blue-500 text-blue-700' : 
                       'bg-gray-100 border-gray-300 text-gray-600'">
            <i :class="step.icon"></i>
          </div>
          <span class="text-xs mt-2 text-center max-w-20"
                :class="index <= currentStepAluno ? 'text-blue-600 font-medium' : 'text-gray-700'">
            {{ step.title }}
          </span>
        </div>
      </div>

      <!-- Etapa 1: Dados Básicos -->
      <div v-if="currentStepAluno === 0" class="space-y-6">
        <div class="border-l-4 border-blue-500 pl-4 mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Dados Básicos do Aluno</h2>
          <p class="text-sm text-gray-600">Informe os dados principais do aluno</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user text-blue-500 mr-1"></i>
              Nome Completo *
            </label>
            <input v-model="form.name" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                   placeholder="Digite o nome completo do aluno"
                   required>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-school text-blue-500 mr-1"></i>
              Escola *
            </label>
            <select v-model="form.school_id" 
                    class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required>
              <option disabled value="">Selecione a escola</option>
              <option v-for="escola in schools" :key="escola.id" :value="escola.id">
                {{ escola.name }}
              </option>
            </select>
            <div class="text-xs text-gray-700 mt-1">Escola onde o aluno estuda</div>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-graduation-cap text-blue-500 mr-1"></i>
              Modalidade AEE *
            </label>
            <select v-model="form.modalidade" 
                    class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required>
              <option disabled value="">Selecione a modalidade</option>
              <option value="apoio">👨‍🏫 Apoio Pedagógico</option>
              <option value="srm">🏫 Sala de Recursos Multifuncionais</option>
            </select>
            <div class="text-xs text-gray-700 mt-1">Escolha o tipo de atendimento AEE</div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select v-model="form.status" 
                    class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="ativo">✅ Ativo</option>
              <option value="inativo">❌ Inativo</option>
            </select>
          </div>
          <!-- Professor responsável (somente admin escolhe) -->
          <div class="md:col-span-2" v-if="$root.user && $root.user.role === 'admin'">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user-tie text-blue-500 mr-1"></i>
              Professor Responsável (obrigatório)
            </label>
            <select v-model="form.created_by_teacher_id" class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
              <option disabled value="">Selecione o professor responsável</option>
              <option v-for="p in professores" :key="'p'+p.id" :value="p.id">{{ p.name }} (#{{ p.id }})</option>
            </select>
            <div class="text-xs text-gray-700 mt-1">O professor que ficará responsável por este aluno no sistema.</div>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            <i class="fas fa-id-card text-blue-500 mr-2"></i>Dados Pessoais Complementares
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="!$isFieldFilledInInterview(form.id, 'data_nascimento')">
              <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
              <input v-model="form.birth_date" type="date"
                     class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            </div>
            
            <div v-if="!$isFieldFilledInInterview(form.id, 'cpf')">
              <label class="block text-sm font-medium text-gray-700 mb-2">CPF</label>
              <input v-model="form.cpf" type="text" 
                     class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="000.000.000-00">
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div v-if="!$isFieldFilledInInterview(form.id, 'serie')">
              <label class="block text-sm font-medium text-gray-700 mb-2">Série/Ano</label>
              <input v-model="form.grade" type="text"
                     class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Ex: 5º Ano, 8ª Série">
            </div>
            
            <div v-if="!$isFieldFilledInInterview(form.id, 'turma')">
              <label class="block text-sm font-medium text-gray-700 mb-2">Turma</label>
              <input v-model="form.class_name" type="text"
                     class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="Ex: Turma A, B">
            </div>
          </div>
          
          <div class="mt-4" v-if="!$isFieldFilledInInterview(form.id, 'endereco')">
            <label class="block text-sm font-medium text-gray-700 mb-2">Endereço Completo</label>
            <textarea v-model="form.address" rows="2"
                      class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Rua, número, bairro, cidade, CEP"></textarea>
          </div>
          
          <!-- Upload de Foto do Aluno -->
          <div class="mt-6 md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-camera text-blue-500 mr-1"></i>
              Foto do Aluno (opcional)
            </label>
            
            <!-- Preview da foto atual -->
            <div v-if="form.photo_url && !photoPreview" class="mb-3 flex items-center space-x-3">
              <img :src="apiBase + '/' + form.photo_url" 
                   alt="Foto atual"
                   class="w-24 h-32 object-cover border-2 border-gray-300 rounded-lg shadow-sm">
              <button @click="removePhoto" 
                      type="button"
                      class="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors">
                <i class="fas fa-trash mr-1"></i>
                Remover foto
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
                     accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                     class="hidden">
              
              <div v-if="photoPreview">
                <img :src="photoPreview" 
                     alt="Preview"
                     class="w-32 h-40 object-cover mx-auto mb-3 border-2 border-blue-500 rounded-lg shadow">
                <button @click.stop="cancelPhoto" 
                        type="button"
                        class="text-sm text-red-600 hover:text-red-800">
                  <i class="fas fa-times mr-1"></i>
                  Cancelar
                </button>
              </div>
              
              <div v-else>
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                <p class="text-sm text-gray-600 font-medium">
                  Clique ou arraste uma imagem aqui
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  JPG, PNG, GIF ou WEBP (máx 2MB)
                </p>
              </div>
            </div>
            
            <!-- Mensagem de erro -->
            <p v-if="photoError" class="mt-2 text-sm text-red-600 flex items-center">
              <i class="fas fa-exclamation-circle mr-1"></i>
              {{ photoError }}
            </p>
            
            <!-- Loading durante upload -->
            <div v-if="uploadingPhoto" class="mt-2 text-sm text-blue-600 flex items-center">
              <i class="fas fa-spinner fa-spin mr-2"></i>
              Enviando foto...
            </div>
          </div>
        </div>
      </div>

      <!-- Etapa 2: Atribuições -->
      <div v-if="currentStepAluno === 1" class="space-y-6">
        <div class="border-l-4 border-blue-500 pl-4 mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Atribuições de Atendimento</h2>
          <p class="text-sm text-gray-600">Configure o professor ou sala responsável pelo atendimento</p>
        </div>

        <div v-if="form.modalidade === 'apoio'" class="space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <i class="fas fa-chalkboard-teacher text-blue-600 mr-2"></i>
              <h3 class="font-medium text-blue-800">Apoio Pedagógico</h3>
            </div>
            <p class="text-sm text-blue-700">O aluno receberá atendimento de apoio pedagógico especializado.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user-tie text-blue-500 mr-1"></i>
              Professor de Apoio
            </label>
            <input v-model="form._st_name" 
                   list="dl-teachers" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                   placeholder="Digite o nome do professor ou selecione da lista"
                   @input="mapTeacher">
            <datalist id="dl-teachers">
              <option v-for="prof in professores" :key="'prof'+prof.id" :value="prof.name + ' (#'+prof.id+')'" />
            </datalist>
          </div>
        </div>

        <div v-if="form.modalidade === 'srm'" class="space-y-4">
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-center mb-2">
              <i class="fas fa-door-open text-green-600 mr-2"></i>
              <h3 class="font-medium text-green-800">Sala de Recursos Multifuncionais</h3>
            </div>
            <p class="text-sm text-green-700">O aluno frequentará uma Sala de Recursos Multifuncionais.</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-school text-blue-500 mr-1"></i>
              Sala de Recursos
            </label>
            <input v-model="form._room_name" 
                   list="dl-rooms" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                   placeholder="Digite o nome da sala ou selecione da lista"
                   @input="mapRoom">
            <datalist id="dl-rooms">
              <option v-for="r in rooms" :key="'r'+r.id" :value="r.name + ' (#'+r.id+')'" />
            </datalist>
          </div>
        </div>

        <div v-if="!form.modalidade" class="text-center py-8 text-gray-700">
          <i class="fas fa-arrow-left text-2xl mb-2"></i>
          <p>Primeiro selecione a modalidade na etapa anterior</p>
        </div>
      </div>

      <!-- Etapa 3: Informações de Contato -->
      <div v-if="currentStepAluno === 2" class="space-y-6">
        <div class="border-l-4 border-blue-500 pl-4 mb-6">
          <h2 class="text-lg font-semibold text-gray-900">Informações de Contato</h2>
          <p class="text-sm text-gray-600">Dados do responsável e informações complementares</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-if="!$isFieldFilledInInterview(form.id, 'nome_responsavel')">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-user-friends text-blue-500 mr-1"></i>
              Nome do Responsável
            </label>
            <input v-model="form.responsible_name" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                   placeholder="Nome do pai, mãe ou responsável">
          </div>
          
          <div v-if="!$isFieldFilledInInterview(form.id, 'telefone')">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-phone text-blue-500 mr-1"></i>
              Telefone de Contato
            </label>
            <input v-model="form.responsible_phone" 
                   class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                   placeholder="(11) 99999-9999">
          </div>
        </div>
        
        <!-- Alerta informativo sobre campos já preenchidos -->
        <div v-if="$isFieldFilledInInterview(form.id, 'nome_responsavel') || $isFieldFilledInInterview(form.id, 'telefone')" 
             class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div class="flex items-center">
            <i class="fas fa-info-circle text-blue-600 mr-2"></i>
            <div>
              <h3 class="font-medium text-blue-800">Informações já coletadas</h3>
              <p class="text-sm text-blue-700">Alguns campos não são exibidos pois já foram preenchidos na entrevista com o responsável.</p>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <i class="fas fa-notes-medical text-blue-500 mr-1"></i>
            Código CID (Opcional)
          </label>
          <input v-model="form.cid_code" 
                 class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                 placeholder="Código CID, se disponível">
          <div class="text-xs text-gray-700 mt-1">Classificação Internacional de Doenças (opcional)</div>
        </div>

        <!-- Resumo dos dados -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-medium text-blue-800 mb-3">
            <i class="fas fa-clipboard-check mr-1"></i>
            Resumo do Cadastro
          </h3>
          <div class="space-y-2 text-sm">
            <div><strong>Nome:</strong> {{ form.name || 'Não informado' }}</div>
            <div><strong>Modalidade:</strong> {{ form.modalidade === 'apoio' ? '👨‍🏫 Apoio Pedagógico' : form.modalidade === 'srm' ? '🏫 Sala de Recursos' : 'Não selecionada' }}</div>
            <div><strong>Status:</strong> {{ form.status === 'ativo' ? '✅ Ativo' : '❌ Inativo' }}</div>
            <div v-if="form.modalidade === 'apoio'"><strong>Professor:</strong> {{ form._st_name || 'Não atribuído' }}</div>
            <div v-if="form.modalidade === 'srm'"><strong>Sala:</strong> {{ form._room_name || 'Não atribuída' }}</div>
            <div><strong>Responsável:</strong> {{ form.responsible_name || 'Não informado' }}</div>
          </div>
        </div>
      </div>

      <!-- Navegação -->
      <div class="flex justify-between pt-6 border-t">
        <button type="button" 
                @click="previousStepAluno" 
                :disabled="currentStepAluno === 0"
                class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
          <i class="fas fa-arrow-left mr-1"></i>
          Anterior
        </button>
        
        <div class="flex space-x-3">
          <button type="button" 
                  @click="cancel" 
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <i class="fas fa-times mr-1"></i>
            Cancelar
          </button>
          
          <button v-if="currentStepAluno < totalStepsAluno - 1" 
                  type="button" 
                  @click="nextStepAluno"
                  :disabled="!canProceedAluno"
                  class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">
            Próximo
            <i class="fas fa-arrow-right ml-1"></i>
          </button>
          
          <button v-else 
                  type="button"
                  @click="save" 
                  :disabled="!canProceedAluno"
                  class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
            <i class="fas fa-save mr-1"></i>
            {{ form.id ? 'Salvar Alterações' : 'Cadastrar Aluno' }}
          </button>
        </div>
      </div>
      </div>
    </div>
  </div>
  `,
  data(){return{ 
    rows:[], 
    filters:{ q:'', status:'', modalidade:'' }, 
    editing:false,
    // Wizard properties
    currentStepAluno: 0,
    totalStepsAluno: 3,
    stepsAluno: [
      { title: 'Dados Básicos', icon: 'fas fa-user' },
      { title: 'Atribuições', icon: 'fas fa-chalkboard-teacher' },
      { title: 'Contato', icon: 'fas fa-phone' }
    ],
  form:{ id:null, name:'', modalidade:'', status:'ativo', school_id:null, _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'', birth_date:'', cpf:'', rg:'', grade:'', class_name:'', address:'', created_by_teacher_id:null, photo_url:null }, 
  teachers:[], 
    rooms:[],
    schools:[],
  professores:[],
    // Upload de foto
    photoFile: null,
    photoPreview: null,
    photoError: null,
    dragOver: false,
    uploadingPhoto: false,
    // Paginação
    currentPage: 1,
    perPage: 10,
    totalItems: 0,
    totalPages: 0,
    // Ordenação
    sortField: 'name',
    sortDirection: 'asc'
  }},
  computed: {
    apiBase() {
      return CONFIG.API_BASE.replace(/\/api\.php$/, '');
    },
    visiblePages() {
      const range = 2;
      const start = Math.max(1, this.currentPage - range);
      const end = Math.min(this.totalPages, this.currentPage + range);
      const pages = [];
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    canProceedAluno() {
      switch (this.currentStepAluno) {
        case 0:
          // Admin precisa selecionar professor responsável
          const adminNeedsProfessor = (this.$root?.user?.role === 'admin');
          const hasProfessor = adminNeedsProfessor ? !!this.form.created_by_teacher_id : true;
          return this.form.name && this.form.name.trim().length > 0 && this.form.modalidade && this.form.school_id && hasProfessor;
        case 1:
          return true; // Atribuições são opcionais
        case 2:
          return true; // Dados de contato são opcionais
        default:
          return false;
      }
    }
  },
  methods:{
    // Métodos do wizard
    nextStepAluno() {
      if (this.canProceedAluno && this.currentStepAluno < this.totalStepsAluno - 1) {
        this.currentStepAluno++;
      }
    },
    
    previousStepAluno() {
      if (this.currentStepAluno > 0) {
        this.currentStepAluno--;
      }
    },
    
    goToStepAluno(stepIndex) {
      if (stepIndex >= 0 && stepIndex < this.totalStepsAluno) {
        this.currentStepAluno = stepIndex;
      }
    },
    
    display(s){ return `${s.name} (#${s.id})`; },
    parseId(v){ const m=String(v||'').match(/#(\d+)/); return m?Number(m[1]):null; },
    mapTeacher(){ this.form.support_teacher_id = this.parseId(this.form._st_name); },
    mapRoom(){ this.form.srm_room_id = this.parseId(this.form._room_name); },
    newAluno(){ 
      this.editing=true; 
      this.currentStepAluno = 0;
      this.form={ id:null, name:'', modalidade:'', status:'ativo', school_id:null, _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'', birth_date:'', cpf:'', rg:'', grade:'', class_name:'', address:'', created_by_teacher_id:null }; 
      // Preencher automaticamente para professor não-admin
      if (this.$root?.user && this.$root.user.role !== 'admin') {
        this.form.created_by_teacher_id = this.$root.user.id;
      }
      this.loadLists();
    },
    edit(s){ 
      this.editing=true; 
      this.currentStepAluno = 0;
      this.form=Object.assign({_st_name:'', _room_name:'', birth_date:'', cpf:'', rg:'', grade:'', class_name:'', address:'', created_by_teacher_id: s.created_by_teacher_id || null}, s); 
      this.loadLists();
    },
    cancel(){ 
      this.editing=false; 
      this.currentStepAluno = 0;
      this.form={ id:null, name:'', modalidade:'', status:'ativo', school_id:null, _st_name:'', _room_name:'', support_teacher_id:null, srm_room_id:null, responsible_name:'', responsible_phone:'', cid_code:'', birth_date:'', cpf:'', rg:'', grade:'', class_name:'', address:'', created_by_teacher_id:null }; 
    },
    async load(){ 
      const params={ 
        page: this.currentPage, 
        per_page: this.perPage,
        sort_by: this.sortField,
        sort_direction: this.sortDirection
      }; 
      if(this.filters.q) params.q=this.filters.q; 
      if(this.filters.status) params.status=this.filters.status; 
      if(this.filters.modalidade) params.modalidade=this.filters.modalidade;
      const r=await api.get('/students',{params}); 
      this.rows = r.data?.data?.rows || []; 
      this.totalItems = r.data?.data?.total || 0;
      this.totalPages = Math.ceil(this.totalItems / this.perPage);
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.load();
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        this.load();
      }
    },
    goToPage(page) {
      this.currentPage = page;
      this.load();
    },
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
      this.currentPage = 1; // Resetar para primeira página
      this.load();
    },
    async loadLists(){ 
      try {
        const results = await Promise.allSettled([
          api.get('/support-teachers'),
          api.get('/srm-rooms'),
          api.get('?action=schools.options'),
          api.get('/professores')
        ]);
        // support-teachers
        if (results[0].status === 'fulfilled') {
          const t = results[0].value;
          this.teachers = (t.data?.data) || [];
        } else {
          this.teachers = [];
          console.error('Falha ao carregar professores de apoio:', results[0].reason);
        }
        // srm-rooms
        if (results[1].status === 'fulfilled') {
          const r = results[1].value;
          this.rooms = (r.data?.data) || [];
        } else {
          this.rooms = [];
          console.error('Falha ao carregar salas SRM:', results[1].reason);
        }
        // schools.options - endpoint já filtra por teacher automaticamente
        if (results[2].status === 'fulfilled') {
          const s = results[2].value;
          // Endpoint schools.options retorna {ok: true, data: {options: [{id, text, cidade, endereco}]}}
          const options = s.data?.data?.options || [];
          this.schools = options.map(opt => ({
            id: opt.id,
            name: opt.text.split(' - ')[0], // Remove cidade do texto
            city: opt.cidade,
            address: opt.endereco
          }));
        } else {
          this.schools = [];
          console.error('Falha ao carregar escolas:', results[2].reason);
          this.$showToast && this.$showToast('Atenção', 'Não foi possível carregar a lista de escolas agora. Tente novamente mais tarde.', 'info');
        }
        // professores (usuarios role=professor)
        if (results[3].status === 'fulfilled') {
          const p = results[3].value;
          // endpoint retorna array direto
          this.professores = (p.data?.data) || (Array.isArray(p.data) ? p.data : []);
        } else {
          this.professores = [];
          console.error('Falha ao carregar professores:', results[3].reason);
        }
      } catch (err) {
        console.error('Erro inesperado ao carregar listas:', err);
        this.$showToast && this.$showToast('Erro', 'Erro ao carregar listas iniciais (escolas, professores, salas).', 'error');
        this.teachers = []; this.rooms = []; this.schools = []; this.professores = [];
      }
    },
    
    // ==================== MÉTODOS DE UPLOAD DE FOTO ====================
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
      if (!this.photoFile) return true;
      
      this.uploadingPhoto = true;
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
          this.$showToast && this.$showToast('Sucesso', 'Foto enviada com sucesso!', 'success');
          return true;
        } else {
          this.photoError = res.data.error || 'Erro ao enviar foto';
          this.$showToast && this.$showToast('Erro', this.photoError, 'error');
          return false;
        }
      } catch (err) {
        console.error('Erro ao enviar foto:', err);
        this.photoError = 'Erro de conexão ao enviar foto';
        this.$showToast && this.$showToast('Erro', this.photoError, 'error');
        return false;
      } finally {
        this.uploadingPhoto = false;
      }
    },
    
    async save(){ 
      if(!this.form.name || !this.form.modalidade || !this.form.school_id){ 
        this.$showToast('Atenção', 'Preencha nome, modalidade e escola', 'warning'); 
        return; 
      } 
      const payload=Object.assign({}, this.form); 
      delete payload._st_name; 
      delete payload._room_name; 
      // Associar aluno ao professor atual (se não-admin) ou manter seleção do admin
      if(!this.form.id && this.$parent.user && this.$parent.user.role !== 'admin') {
        payload.created_by_teacher_id = this.$parent.user.id;
      }
      
      let studentId = this.form.id;
      
      if(!this.form.id){ 
        const r=await api.post('/students/create', payload); 
        if(r.data?.ok){ 
          studentId = r.data.data.id;
          // Upload de foto (se houver)
          if (this.photoFile) {
            await this.uploadPhoto(studentId);
          }
          await this.load(); 
          this.cancel(); 
        } else {
          this.$showToast('Erro', r.data?.error||'Erro ao criar', 'error'); 
        }
      } else { 
        const r=await api.put('/students/update', payload, { params:{ id:this.form.id } }); 
        if(r.data?.ok){ 
          // Upload de foto (se houver)
          if (this.photoFile) {
            await this.uploadPhoto(studentId);
          }
          await this.load(); 
          this.cancel(); 
        } else {
          this.$showToast('Erro', r.data?.error||'Erro ao atualizar', 'error'); 
        }
      } 
    },
    async del(s){
      const confirmed = await this.$confirmToast(
        'Confirmar exclusão',
        `Deseja realmente excluir o aluno "${s.name}"? Esta ação não pode ser desfeita.`,
        { confirmText: 'Excluir', cancelText: 'Cancelar', type: 'warning', timeoutMs: 15000 }
      );
      if (!confirmed) return;
      this.deletingStudentId = s.id;
      try {
        const r=await api.post('/students/delete', {}, { params:{ id:s.id } });
        if(r.data?.ok){
          this.$showToast('Sucesso', 'Aluno excluído', 'success');
          // Remove localmente
          this.rows = (this.rows || []).filter(x => x.id !== s.id);
          await this.load();
        } else {
          this.$showToast('Erro', r.data?.error||'Erro ao excluir', 'error');
        }
      } catch (e) {
        const status = e.response?.status;
        if (status === 403) this.$showToast('Sem permissão', 'Você não tem permissão para excluir este aluno.', 'warning');
        else if (status === 404) this.$showToast('Não encontrado', 'O aluno já não existe mais.', 'info');
        else this.$showToast('Erro', 'Erro ao excluir', 'error');
      } finally {
        this.deletingStudentId = null;
      }
    }
  },
  async mounted(){ await this.loadLists(); await this.load(); }
};

// Tela de Registro
const RegisterTW = {
  template: `
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="mx-auto h-40 w-40 flex items-center justify-center mb-4">
          <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-36 w-36">
        </div>
        <h2 class="text-3xl font-bold text-gray-900">Cadastro de Professor</h2>
        <p class="mt-2 text-sm text-gray-600">Cadastre-se como professor no ConectAEE</p>
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
            <div class="mt-1 text-xs text-gray-700">
              <p>A senha deve conter:</p>
              <ul class="list-disc list-inside space-y-1">
                <li :class="passwordChecks.length ? 'text-green-600' : 'text-gray-700'">Pelo menos 8 caracteres</li>
                <li :class="passwordChecks.uppercase ? 'text-green-600' : 'text-gray-700'">Uma letra maiúscula</li>
                <li :class="passwordChecks.lowercase ? 'text-green-600' : 'text-gray-700'">Uma letra minúscula</li>
                <li :class="passwordChecks.number ? 'text-green-600' : 'text-gray-700'">Um número</li>
                <li :class="passwordChecks.special ? 'text-green-600' : 'text-gray-700'">Um caractere especial (!@#$%^&*)</li>
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
      const pass = this.form.password || '';
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
        // Definir role como teacher para auto-registro apenas de professores
        const payload = {
          ...this.form,
          role: 'teacher'
        };
        const response = await api.post('/register', payload);
        if (response.data?.ok) {
          this.success = response.data.message || 'Cadastro de professor criado com sucesso! Você já pode fazer login.';
          this.form = { name: '', email: '', password: '', confirm_password: '' };
        } else {
          this.error = response.data?.error || 'Erro ao criar cadastro';
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
  <div class="space-y-4" role="main">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900" id="usuarios-heading">Usuários</h1>
      <button @click="novo" 
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
              aria-label="Adicionar novo usuário">Novo Usuário</button>
    </div>

    <!-- Mensagens de Feedback -->
    <div v-if="successMessage" class="bg-green-50 border border-green-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        </div>
      </div>
    </div>
    
    <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4">
      <div class="flex">
        <svg class="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
        </svg>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <div>
        <label class="sr-only" for="u-busca">Buscar por nome ou email</label>
        <input id="u-busca" v-model="filters.q" @keyup.enter="load" 
               class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
               placeholder="Buscar por nome ou email">
      </div>
      <div>
        <label class="sr-only" for="u-role">Perfil</label>
        <select id="u-role" v-model="filters.role" 
                class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
          <option value="">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="professor">Professor</option>
          <option value="coordenador">Coordenador</option>
        </select>
      </div>
      <div>
        <label class="sr-only" for="u-status">Status</label>
        <select id="u-status" v-model="filters.status" 
                class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>
      <button @click="load" 
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
              aria-label="Aplicar filtros de busca">
        <i class="fas fa-search mr-2" aria-hidden="true"></i>Filtrar
      </button>
    </div>

    

    <div class="bg-white shadow rounded-lg overflow-hidden" role="region" aria-labelledby="usuarios-heading">
      <table class="min-w-full" role="table" aria-label="Lista de usuários">
        <thead class="bg-gray-50">
          <tr class="text-left">
            <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                @click="sortBy('name')" @keydown.enter="sortBy('name')" @keydown.space="sortBy('name')" tabindex="0"
                role="columnheader" :aria-sort="sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <div class="flex items-center justify-between">
                <span>Nome</span>
                <svg v-if="sortField === 'name'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-gray-700" role="columnheader">Email</th>
            <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                @click="sortBy('role')" @keydown.enter="sortBy('role')" @keydown.space="sortBy('role')" tabindex="0"
                role="columnheader" :aria-sort="sortField === 'role' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <div class="flex items-center justify-between">
                <span>Perfil</span>
                <svg v-if="sortField === 'role'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                @click="sortBy('status')" @keydown.enter="sortBy('status')" @keydown.space="sortBy('status')" tabindex="0"
                role="columnheader" :aria-sort="sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
              <div class="flex items-center justify-between">
                <span>Status</span>
                <svg v-if="sortField === 'status'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                </svg>
              </div>
            </th>
            <th class="px-6 py-3 text-right text-gray-700" role="columnheader">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in paginatedRows" :key="u.id" class="border-t hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ u.name || '—' }}</td>
            <td class="px-6 py-4">{{ u.email || '—' }}</td>
            <td class="px-6 py-4">
              <span :class="[
                'px-2 py-1 rounded text-xs font-medium uppercase',
                u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                u.role === 'professor' ? 'bg-blue-100 text-blue-800' :
                u.role === 'coordenador' ? 'bg-indigo-100 text-indigo-800' :
                'bg-gray-100 text-gray-600'
              ]">{{ getRoleLabel(u.role) }}</span>
            </td>
            <td class="px-6 py-4">
              <span :class="[
                'px-2 py-1 rounded text-xs font-medium',
                u.status === 'ativo' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-600'
              ]">{{ u.status || '—' }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <button class="inline-flex items-center text-blue-800 hover:text-blue-900 px-2 py-1 border border-blue-200 rounded transition-colors" 
                        @click="edit(u)" :aria-label="'Editar usuário ' + u.name">
                  <i class="fas fa-edit mr-1" aria-hidden="true"></i>
                  <span>Editar</span>
                </button>
                <button class="inline-flex items-center text-red-800 hover:text-red-900 px-2 py-1 border border-red-200 rounded transition-colors" 
                        @click="del(u)" :aria-label="'Excluir usuário ' + u.name"
                        :disabled="deletingUserId === u.id">
                  <span v-if="deletingUserId === u.id">
                    <div class="animate-spin -ml-1 mr-1 h-3 w-3 border border-red-600 border-t-transparent rounded-full inline-block"></div>
                    Excluindo...
                  </span>
                  <span v-else>
                    <i class="fas fa-trash mr-1" aria-hidden="true"></i>
                    Excluir
                  </span>
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!rows || rows.length===0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-700">
              {{ (filters.q || filters.role || filters.status) ? 'Nenhum resultado para os filtros aplicados' : 'Sem registros' }}
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Paginação -->
      <nav v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-4 py-3 border-t" role="navigation" aria-label="Navegação por páginas">
        <div class="text-sm text-gray-700" aria-live="polite">
          Mostrando {{ (currentPage - 1) * perPage + 1 }} a {{ Math.min(currentPage * perPage, totalItems) }} de {{ totalItems }} usuários
        </div>
        <div class="flex items-center space-x-2">
          <button @click="previousPage" :disabled="currentPage === 1" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  :aria-label="'Ir para página anterior'"
                  :aria-disabled="currentPage === 1">
            <i class="fas fa-chevron-left mr-1" aria-hidden="true"></i>Anterior
          </button>
          <button v-for="page in visiblePages" :key="page" 
                @click="goToPage(page)"
                :class="[
                  'px-3 py-1 text-sm cursor-pointer rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                  page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 focus:bg-gray-50'
                ]"
                :aria-label="'Ir para página ' + page"
                :aria-current="page === currentPage ? 'page' : false">
            {{ page }}
          </button>
          <button @click="nextPage" :disabled="currentPage === totalPages" 
                  class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  :aria-label="'Ir para próxima página'"
                  :aria-disabled="currentPage === totalPages">
            Próxima<i class="fas fa-chevron-right ml-1" aria-hidden="true"></i>
          </button>
        </div>
      </nav>
    </div>

    <!-- Modal de Criar/Editar Usuário -->
    <div v-if="editing" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto" style="background-color: rgba(0, 0, 0, 0.85);" @click.self="cancel">
      <div class="bg-gray-50 rounded-lg w-full max-w-4xl shadow-xl overflow-hidden flex flex-col border border-gray-200 m-4" style="max-height: calc(100vh - 2rem);">
        <div class="flex items-center justify-between p-4 border-b bg-gray-50 sticky top-0 z-10">
          <h2 class="text-lg font-semibold">{{ form.id ? 'Editar Usuário' : 'Novo Usuário' }}</h2>
          <button @click="cancel" class="text-gray-500 hover:text-gray-700" aria-label="Fechar"><i class="fas fa-times text-xl"></i></button>
        </div>
      <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-3">
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
      <div class="flex gap-2 justify-end p-4 border-t bg-gray-50 sticky bottom-0">
        <button class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors" 
                @click="cancel" 
                :disabled="savingForm">
          Cancelar
        </button>
        <button class="px-4 py-2 bg-brand-primary text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center" 
                @click="save" 
                :disabled="savingForm">
          <i v-if="savingForm" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else :class="form.id ? 'fas fa-save' : 'fas fa-plus'" class="mr-2"></i>
          {{ form.id ? (savingForm ? 'Atualizando...' : 'Atualizar Usuário') : (savingForm ? 'Criando...' : 'Criar Usuário') }}
        </button>
      </div>
      </div>
    </div>
  </div>
  `,
  data(){return{ 
    rows:[], 
    filters:{ q:'', role:'', status:'' }, 
    editing:false, 
    loading: false,
    savingForm: false,
    deletingUserId: null,
    form:{ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' },
    successMessage: '',
    errorMessage: '',
    // Datatable state
    currentPage: 1,
    perPage: 10,
    sortField: 'name',
    sortDirection: 'asc'
  }},
  computed:{
    totalItems(){ return this.rows?.length || 0; },
    totalPages(){ return Math.max(1, Math.ceil(this.totalItems / this.perPage)); },
    visiblePages(){
      const range=2; const start=Math.max(1,this.currentPage-range); const end=Math.min(this.totalPages,this.currentPage+range); const out=[]; for(let i=start;i<=end;i++) out.push(i); return out;
    },
    sortedRows(){
      const arr=[...(this.rows||[])];
      const dir = this.sortDirection==='asc'?1:-1; const f=this.sortField;
      return arr.sort((a,b)=>{
        const av=(a?.[f]??'').toString().toLowerCase();
        const bv=(b?.[f]??'').toString().toLowerCase();
        if(av<bv) return -1*dir; if(av>bv) return 1*dir; return 0;
      });
    },
    paginatedRows(){
      const start=(this.currentPage-1)*this.perPage; return this.sortedRows.slice(start,start+this.perPage);
    }
  },
  methods:{
    async load(){ 
      try{ 
        this.loading=true; 
        const p={}; if(this.filters.q) p.q=this.filters.q; if(this.filters.role) p.role=this.filters.role; if(this.filters.status) p.status=this.filters.status; 
        const r=await api.get('/users',{params:p}); 
        this.rows=r.data?.data?.rows||r.data?.data||[]; 
        this.currentPage=1;
      } finally { this.loading=false; }
    },
    sortBy(field){ if(this.sortField===field){ this.sortDirection=this.sortDirection==='asc'?'desc':'asc'; } else { this.sortField=field; this.sortDirection='asc'; } },
    previousPage(){ if(this.currentPage>1){ this.currentPage--; } },
    nextPage(){ if(this.currentPage<this.totalPages){ this.currentPage++; } },
    goToPage(page){ this.currentPage=page; },
    novo(){ this.editing=true; this.form={ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' }; },
    edit(u){ this.editing=true; this.form=Object.assign({ password:'' }, u); },
    cancel(){ this.editing=false; this.form={ id:null, name:'', email:'', role:'professor', status:'ativo', password:'' }; },
    async save(){ 
      if(!this.form.name||!this.form.email){ 
        this.showErrorMessage('Por favor, informe nome e email'); 
        return; 
      }
      
      this.savingForm = true;
      try {
        if(!this.form.id){ 
          const payload=Object.assign({}, this.form); 
          if(!payload.password){ 
            this.showErrorMessage('Por favor, defina uma senha para o novo usuário'); 
            return; 
          } 
          const r=await api.post('/users/create', payload); 
          if(r.data?.ok){ 
            this.showSuccessMessage(`Usuário "${payload.name}" criado com sucesso!`);
            await this.load(); 
            this.cancel(); 
          } else {
            this.showErrorMessage(r.data?.error||'Erro ao criar usuário');
          }
        } else { 
          const payload=Object.assign({}, this.form); 
          if(!payload.password) delete payload.password; 
          const r=await api.post('/users/update', payload, { params:{ id:this.form.id } }); 
          if(r.data?.ok){ 
            this.showSuccessMessage(`Usuário "${payload.name || this.form.name}" atualizado com sucesso!`);
            await this.load(); 
            this.cancel(); 
          } else {
            this.showErrorMessage(r.data?.error||'Erro ao atualizar usuário');
          }
        }
      } catch(error) {
        this.showErrorMessage('Erro na operação: ' + (error.response?.data?.message || error.message));
      } finally {
        this.savingForm = false;
      }
    },
    async del(u){ 
      if (!this._confirmDeleteUser || this._confirmDeleteUser !== u.id) {
        this._confirmDeleteUser = u.id;
        this.$showToast && this.$showToast('Confirme', `Clique novamente para excluir o usuário "${u.name}"`, 'warning');
        setTimeout(()=>{ if(this._confirmDeleteUser===u.id) this._confirmDeleteUser=null; }, 3000);
        return;
      }
      this._confirmDeleteUser = null;
      this.deletingUserId = u.id;
      try {
        const r = await api.post('/users/delete', {}, { params:{ id:u.id } }); 
        if(r.data?.ok){ 
          this.showSuccessMessage(`Usuário "${u.name}" excluído com sucesso!`);
          this.load(); 
        } else {
          this.showErrorMessage(r.data?.error||'Erro ao excluir');
        }
      } catch(error) {
        this.showErrorMessage('Erro ao excluir usuário: ' + (error.response?.data?.message || error.message));
      } finally {
        this.deletingUserId = null;
      }
    },
    getRoleLabel(role) {
      const roles = {
        'admin': 'Administrador',
        'professor': 'Professor AEE',
        'coordenador': 'Coordenador'
      };
      return roles[role] || 'Indefinido';
    },
    getStatusLabel(status) {
      const statuses = {
        'ativo': 'Ativo',
        'inativo': 'Inativo'
      };
      return statuses[status] || 'Indefinido';
    },
    showSuccessMessage(message) {
      this.successMessage = message;
      this.errorMessage = '';
      setTimeout(() => {
        this.successMessage = '';
      }, 5000);
    },
    showErrorMessage(message) {
      this.errorMessage = message;
      this.successMessage = '';
      setTimeout(() => {
        this.errorMessage = '';
      }, 8000);
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('pt-BR');
    }
  },

  async mounted(){ this.load(); }
};

// Componente de Escolas - Recriado seguindo padrão dos outros componentes
const EscolasTW = {
  template: `
    <div class="space-y-4" role="main">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900" id="escolas-heading">Escolas</h1>
        <button @click="newEscola" 
                class="px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
                aria-label="Adicionar nova escola">
          <i class="fas fa-plus mr-2"></i>Nova Escola
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label class="sr-only" for="escolas-busca">Buscar por nome</label>
          <input id="escolas-busca" v-model="searchTerm" @keyup.enter="goToPage(1)" 
                 class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                 placeholder="Buscar por nome">
        </div>
        <div>
          <label class="sr-only" for="escolas-cidade">Cidade</label>
          <input id="escolas-cidade" v-model="cityFilter" @keyup.enter="goToPage(1)" 
                 class="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-brand-primary focus:border-transparent" 
                 placeholder="Filtrar por cidade">
        </div>
        <div></div>
        <button @click="goToPage(1)" 
                class="px-3 py-2 bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white rounded transition-colors"
                aria-label="Aplicar filtros de busca">
          <i class="fas fa-search mr-2" aria-hidden="true"></i>Filtrar
        </button>
      </div>

      <!-- Visualização Desktop -->
      <div class="bg-white shadow rounded-lg overflow-hidden" role="region" aria-labelledby="escolas-heading">
        <table class="min-w-full" role="table" aria-label="Lista de escolas">
          <thead class="bg-gray-50">
            <tr class="text-left">
              <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                  @click="sortBy('name')" @keydown.enter="sortBy('name')" @keydown.space="sortBy('name')" tabindex="0"
                  role="columnheader" :aria-sort="sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
                <div class="flex items-center justify-between">
                  <span>Nome</span>
                  <svg v-if="sortField === 'name'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-gray-700" role="columnheader">Endereço</th>
              <th class="px-6 py-3 text-gray-700 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset select-none" 
                  @click="sortBy('city')" @keydown.enter="sortBy('city')" @keydown.space="sortBy('city')" tabindex="0"
                  role="columnheader" :aria-sort="sortField === 'city' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'">
                <div class="flex items-center justify-between">
                  <span>Cidade</span>
                  <svg v-if="sortField === 'city'" class="w-4 h-4" :class="sortDirection === 'asc' ? 'rotate-0' : 'rotate-180'" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                </div>
              </th>
              <th class="px-6 py-3 text-gray-700" role="columnheader">Telefone</th>
              <th class="px-6 py-3 text-right text-gray-700" role="columnheader">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="escola in paginatedRows" :key="escola.id" class="border-t hover:bg-gray-50">
              <td class="px-6 py-4 font-medium">{{ escola.name || '—' }}</td>
              <td class="px-6 py-4">{{ escola.address || '—' }}</td>
              <td class="px-6 py-4">{{ escola.city || '—' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ escola.phone || '—' }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <button class="inline-flex items-center text-blue-800 hover:text-blue-900 px-2 py-1 border border-blue-200 rounded transition-colors" 
                          @click="edit(escola)" :aria-label="'Editar escola ' + escola.name">
                    <i class="fas fa-edit mr-1" aria-hidden="true"></i>
                    <span>Editar</span>
                  </button>
                  <button class="inline-flex items-center text-red-800 hover:text-red-900 px-2 py-1 border border-red-200 rounded transition-colors" 
                          @click="deleteEscola(escola)" :aria-label="'Excluir escola ' + escola.name"
                          :disabled="deletingId === escola.id">
                    <span v-if="deletingId === escola.id">
                      <div class="animate-spin -ml-1 mr-1 h-3 w-3 border border-red-600 border-t-transparent rounded-full inline-block"></div>
                      Excluindo...
                    </span>
                    <span v-else>
                      <i class="fas fa-trash mr-1" aria-hidden="true"></i>
                      Excluir
                    </span>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="!rows || rows.length===0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-700">
                {{ (searchTerm || cityFilter) ? 'Nenhum resultado para os filtros aplicados' : 'Sem registros' }}
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Paginação -->
        <nav v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-4 py-3 border-t" role="navigation" aria-label="Navegação por páginas">
          <div class="text-sm text-gray-700" aria-live="polite">
            Mostrando {{ (currentPage - 1) * perPage + 1 }} a {{ Math.min(currentPage * perPage, totalItems) }} de {{ totalItems }} escolas
          </div>
          <div class="flex items-center space-x-2">
            <button @click="previousPage" :disabled="currentPage === 1" 
                    class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    :aria-label="'Ir para página anterior'"
                    :aria-disabled="currentPage === 1">
              <i class="fas fa-chevron-left mr-1" aria-hidden="true"></i>Anterior
            </button>
            <button v-for="page in visiblePages" :key="page" 
                  @click="goToPage(page)"
                  :class="[
                    'px-3 py-1 text-sm cursor-pointer rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
                    page === currentPage ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50 focus:bg-gray-50'
                  ]"
                  :aria-label="'Ir para página ' + page"
                  :aria-current="page === currentPage ? 'page' : false">
              {{ page }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" 
                    class="px-3 py-1 text-sm border rounded hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    :aria-label="'Ir para próxima página'"
                    :aria-disabled="currentPage === totalPages">
              Próxima<i class="fas fa-chevron-right ml-1" aria-hidden="true"></i>
            </button>
          </div>
        </nav>
      </div>

      <!-- Modal de Edição (padrão unificado) -->
      <div v-if="showModal" class="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto" style="background-color: rgba(0, 0, 0, 0.85);" @click.self="closeModal">
        <div class="bg-gray-50 rounded-lg w-full max-w-4xl shadow-xl overflow-hidden flex flex-col border border-gray-200 m-4" style="max-height: calc(100vh - 2rem);">
          <div class="flex items-center justify-between p-4 border-b bg-gray-50 sticky top-0 z-10">
            <h2 class="text-lg font-semibold">{{ editingId ? 'Editar Escola' : 'Nova Escola' }}</h2>
            <button @click="closeModal" class="text-gray-500 hover:text-gray-700" aria-label="Fechar"><i class="fas fa-times text-xl"></i></button>
          </div>
          
          <div class="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
              <input 
                v-model="form.name" 
                type="text" 
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
              <textarea 
                v-model="form.address" 
                rows="2"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
              <input 
                v-model="form.city" 
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input 
                v-model="form.phone" 
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            </div>
          </div>
          
          <div class="flex justify-end space-x-3 p-4 border-t">
            <button @click="closeModal" class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button @click="save" :disabled="!form.name" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {{ editingId ? 'Atualizar' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      rows: [],
      searchTerm: '',
      showModal: false,
      editingId: null,
      form: {
        name: '',
        address: '',
        city: '',
        phone: ''
      },
      user: null,
      deletingId: null,
      saving: false,
      sortField: 'name',
      sortDirection: 'asc',
      // datatable
      currentPage: 1,
      perPage: 10
    };
  },
  
  computed: {
    filteredRows() {
      // Filtra
      const base = !this.searchTerm ? this.rows : this.rows.filter(escola => {
        const term = this.searchTerm.toLowerCase();
        return (
          (escola.name || '').toLowerCase().includes(term) ||
          (escola.city || '').toLowerCase().includes(term) ||
          (escola.address || '').toLowerCase().includes(term)
        );
      });
      // Ordena
      const dir = this.sortDirection === 'asc' ? 1 : -1;
      const field = this.sortField;
      return [...base].sort((a,b)=>{
        const av = (a?.[field] ?? '').toString().toLowerCase();
        const bv = (b?.[field] ?? '').toString().toLowerCase();
        if (av < bv) return -1 * dir;
        if (av > bv) return 1 * dir;
        return 0;
      });
    },
    totalItems(){ return this.filteredRows.length; },
    totalPages(){ return Math.max(1, Math.ceil(this.totalItems / this.perPage)); },
    visiblePages(){ const range=2; const start=Math.max(1,this.currentPage-range); const end=Math.min(this.totalPages,this.currentPage+range); const out=[]; for(let i=start;i<=end;i++) out.push(i); return out; },
    paginatedRows(){ const start=(this.currentPage-1)*this.perPage; return this.filteredRows.slice(start,start+this.perPage); },
    canManage(){
      return this.user && this.user.role === 'admin';
    }
  },
  
  methods: {
    sortBy(field) {
      if (this.sortField === field) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortField = field;
        this.sortDirection = 'asc';
      }
    },
    async loadEscolas() {
      try {
        const response = await api.get('/schools');
  this.rows = response.data?.data?.rows || response.data?.data || [];
  this.currentPage = 1;
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        this.$showToast && this.$showToast('Erro', 'Erro ao carregar escolas', 'error');
      }
    },
    
    newEscola() {
      this.editingId = null;
      this.form = { name: '', address: '', city: '', phone: '' };
      this.showModal = true;
    },
    
    edit(escola) {
      this.editingId = escola.id;
      this.form = { ...escola };
      this.showModal = true;
    },
    
    closeModal() {
      this.showModal = false;
      this.editingId = null;
      this.form = { name: '', address: '', city: '', phone: '' };
    },
    
    async save() {
      if (!this.form.name) {
        this.$showToast && this.$showToast('Atenção', 'Nome é obrigatório', 'warning');
        return;
      }
      this.saving = true;
      try {
        if (this.editingId) {
          const payload = { ...this.form, id: this.editingId };
          const response = await api.post('/schools/update', payload);
          if (response.data?.ok) {
            this.$showToast && this.$showToast('Sucesso', `Escola "${this.form.name}" atualizada com sucesso!`, 'success');
            this.closeModal();
            await this.loadEscolas();
          } else {
            this.$showToast && this.$showToast('Erro', response.data?.error || 'Erro ao atualizar escola', 'error');
          }
        } else {
          const response = await api.post('/schools/create', this.form);
          if (response.data?.ok) {
            this.$showToast && this.$showToast('Sucesso', `Escola "${this.form.name}" criada com sucesso!`, 'success');
            this.closeModal();
            await this.loadEscolas();
          } else {
            this.$showToast && this.$showToast('Erro', response.data?.error || 'Erro ao criar escola', 'error');
          }
        }
      } catch (error) {
        console.error('Erro ao salvar escola:', error);
        const errorMsg = error.response?.data?.error || error.message || 'Erro ao salvar escola';
        this.$showToast && this.$showToast('Erro', errorMsg, 'error');
      } finally {
        this.saving = false;
      }
    },
    
    async deleteEscola(escola) {
      const confirmed = await this.$confirmToast(
        'Confirmar exclusão',
        `Deseja realmente excluir a escola "${escola.name}"? Esta ação não pode ser desfeita.`,
        { confirmText: 'Excluir', cancelText: 'Cancelar', type: 'warning', timeoutMs: 15000 }
      );
      if (!confirmed) return;
      this.deletingId = escola.id;
      try {
        const response = await api.delete(`/schools/delete?id=${escola.id}`);
        if (response.data?.ok) {
          this.$showToast && this.$showToast('Sucesso', `Escola "${escola.name}" excluída com sucesso!`, 'success');
          await this.loadEscolas();
        } else {
          this.$showToast && this.$showToast('Erro', response.data?.error || 'Erro ao excluir escola', 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir escola:', error);
        const status = error.response?.status;
        const errorMsg = error.response?.data?.error || error.message;
        if (status === 403) this.$showToast && this.$showToast('Sem permissão', 'Apenas administradores podem excluir escolas.', 'warning');
        else if (status === 404) this.$showToast && this.$showToast('Não encontrada', 'Escola não existe mais.', 'info');
        else this.$showToast && this.$showToast('Erro', errorMsg || 'Erro ao excluir escola', 'error');
      } finally {
        this.deletingId = null;
      }
    },
    previousPage(){ if(this.currentPage>1){ this.currentPage--; } },
    nextPage(){ if(this.currentPage<this.totalPages){ this.currentPage++; } },
    goToPage(page){ this.currentPage = page; }
  },
  
  async mounted() {
    // Carregar usuário para habilitar ações
    try {
      const response = await api.get('/user');
      this.user = (response.data && response.data.data) ? response.data.data : response.data;
    } catch (e) {
      // se falhar, mantém ações invisíveis
      console.warn('Não foi possível obter o usuário atual.');
    }
    await this.loadEscolas();
  }
};

// Componente de Supervisão de Professores (Admin apenas)
const SupervisaoTW = {
  template: `
    <div class="space-y-6" role="main">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Supervisão de Professores</h1>
        <p class="mt-1 text-sm text-gray-600">Acompanhe as atividades e formulários dos professores</p>
      </div>

      <!-- Seletor de Professor -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="max-w-md">
          <label for="professor-select" class="block text-sm font-medium text-gray-700 mb-2">
            Selecionar Professor
          </label>
          <select 
            id="professor-select" 
            v-model="selectedProfessorId" 
            @change="loadProfessorData"
            class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="">-- Selecione um professor --</option>
            <option v-for="prof in professores" :key="prof.id" :value="prof.id">
              {{ prof.name }} {{ prof.email ? '(' + prof.email + ')' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Dados do Professor -->
      <div v-if="selectedProfessorId && professorInfo" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-center space-x-4">
          <div class="flex-shrink-0">
            <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{{ professorInfo.name }}</h3>
            <p class="text-sm text-gray-600">{{ professorInfo.email }}</p>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {{ professorInfo.role === 'admin' ? 'Administrador' : 'Professor' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Lista de Alunos do Professor -->
      <div v-if="selectedProfessorId" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">
            Alunos do Professor ({{ alunos.length }})
          </h2>
        </div>

        <div v-if="loading" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Carregando...</p>
        </div>

        <div v-else-if="alunos.length === 0" class="p-6 text-center text-gray-500">
          Este professor ainda não possui alunos cadastrados.
        </div>

        <div v-else class="divide-y divide-gray-200">
          <div v-for="aluno in alunos" :key="aluno.id" 
               class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <h3 class="text-lg font-medium text-gray-900">{{ aluno.name }}</h3>
                <div class="mt-1 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span v-if="aluno.school_name">
                    <i class="fas fa-school mr-1"></i>{{ aluno.school_name }}
                  </span>
                  <span v-if="aluno.date_of_birth">
                    <i class="fas fa-birthday-cake mr-1"></i>{{ formatDate(aluno.date_of_birth) }}
                  </span>
                  <span v-if="aluno.grade">
                    <i class="fas fa-graduation-cap mr-1"></i>{{ aluno.grade }}
                  </span>
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="viewFormularios(aluno)" 
                        class="inline-flex items-center px-3 py-2 border border-blue-300 rounded-lg text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <i class="fas fa-file-alt mr-2"></i>
                  Ver Formulários
                </button>
              </div>
            </div>

            <!-- Formulários do Aluno (expandível) -->
            <div v-if="expandedAlunoId === aluno.id" class="mt-4 pt-4 border-t border-gray-200">
              <h4 class="text-sm font-semibold text-gray-700 mb-3">Formulários AEE</h4>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <!-- Entrevista com Responsável -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900 text-sm">Entrevista</h5>
                    <span class="px-2 py-1 text-xs rounded-full" 
                          :class="aluno.has_entrevista ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ aluno.has_entrevista ? 'Preenchido' : 'Pendente' }}
                    </span>
                  </div>
                  <button v-if="aluno.has_entrevista" 
                          @click="viewEntrevista(aluno.id)" 
                          class="w-full text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    Ver Entrevista →
                  </button>
                </div>

                <!-- PDI -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900 text-sm">PDI</h5>
                    <span class="px-2 py-1 text-xs rounded-full" 
                          :class="aluno.has_pdi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ aluno.has_pdi ? 'Preenchido' : 'Pendente' }}
                    </span>
                  </div>
                  <button v-if="aluno.has_pdi" 
                          @click="viewPDI(aluno.id)" 
                          class="w-full text-sm text-emerald-600 hover:text-emerald-800 font-medium">
                    Ver PDI →
                  </button>
                </div>

                <!-- PAI -->
                <div class="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div class="flex items-center justify-between mb-2">
                    <h5 class="font-medium text-gray-900 text-sm">PAI</h5>
                    <span class="px-2 py-1 text-xs rounded-full" 
                          :class="aluno.has_pai ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                      {{ aluno.has_pai ? 'Preenchido' : 'Pendente' }}
                    </span>
                  </div>
                  <button v-if="aluno.has_pai" 
                          @click="viewPAI(aluno.id)" 
                          class="w-full text-sm text-purple-600 hover:text-purple-800 font-medium">
                    Ver PAI →
                  </button>
                </div>
              </div>

              <!-- Relatórios de Atendimento -->
              <div v-if="aluno.relatorios && aluno.relatorios.length > 0" class="mt-4">
                <h5 class="text-sm font-semibold text-gray-700 mb-2">
                  Relatórios de Atendimento ({{ aluno.relatorios.length }})
                </h5>
                <div class="space-y-2">
                  <div v-for="rel in aluno.relatorios" :key="rel.id" 
                       class="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                    <div>
                      <span class="text-sm font-medium text-gray-900">{{ formatDate(rel.date) }}</span>
                      <p class="text-xs text-gray-600 mt-1">{{ rel.activities || 'Sem descrição' }}</p>
                    </div>
                    <button @click="viewRelatorio(rel.id)" 
                            class="text-sm text-blue-600 hover:text-blue-800">
                      Ver →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      professores: [],
      selectedProfessorId: '',
      professorInfo: null,
      alunos: [],
      expandedAlunoId: null,
      loading: false
    };
  },
  
  methods: {
    async loadProfessores() {
      try {
        const response = await api.get('/users?role=professor');
        if (response.data?.ok) {
          // res() encapsula em data: {rows: [...]}
          this.professores = response.data.data?.rows || [];
        }
      } catch (error) {
        console.error('Erro ao carregar professores:', error);
        this.$showToast && this.$showToast('Erro', 'Não foi possível carregar a lista de professores', 'error');
      }
    },
    
    async loadProfessorData() {
      if (!this.selectedProfessorId) {
        this.professorInfo = null;
        this.alunos = [];
        this.expandedAlunoId = null;
        return;
      }
      
      this.loading = true;
      this.expandedAlunoId = null;
      
      try {
        // Buscar info do professor
        const profResponse = await api.get(`/users/${this.selectedProfessorId}`);
        if (profResponse.data?.ok) {
          this.professorInfo = profResponse.data.data;
        }
        
        // Buscar alunos do professor
        const alunosResponse = await api.get(`?action=students.list&teacher_id=${this.selectedProfessorId}`);
        if (alunosResponse.data?.ok) {
          // Backend retorna res(true, {rows: [...], total: ...})
          const data = alunosResponse.data.data;
          this.alunos = data?.rows || [];
          
          // Buscar status dos formulários para cada aluno
          await this.loadFormulariosStatus();
        }
      } catch (error) {
        console.error('Erro ao carregar dados do professor:', error);
        this.$showToast && this.$showToast('Erro', 'Não foi possível carregar os dados', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async loadFormulariosStatus() {
      // Buscar status de formulários para todos os alunos
      // TODO: Implementar endpoints de formulários
      for (const aluno of this.alunos) {
        // Por enquanto, definir valores padrão
        aluno.has_entrevista = false;
        aluno.has_pdi = false;
        aluno.has_pai = false;
        aluno.relatorios = [];
        
        /* TEMPORARIAMENTE DESABILITADO - endpoints não implementados
        try {
          const entrevistaResp = await api.get(`/entrevista-completa/student/${aluno.id}`);
          aluno.has_entrevista = entrevistaResp.data?.ok && entrevistaResp.data.data?.length > 0;
          
          const pdiResp = await api.get(`/pdi-completo/student/${aluno.id}`);
          aluno.has_pdi = pdiResp.data?.ok && pdiResp.data.data?.length > 0;
          
          const paiResp = await api.get(`/pai-completo/student/${aluno.id}`);
          aluno.has_pai = paiResp.data?.ok && paiResp.data.data?.length > 0;
          
          const relatoriosResp = await api.get(`/relatorios-atendimento?student_id=${aluno.id}`);
          aluno.relatorios = (relatoriosResp.data?.ok ? relatoriosResp.data.data : []) || [];
        } catch (error) {
          console.error(`Erro ao carregar formulários do aluno ${aluno.id}:`, error);
          aluno.has_entrevista = false;
          aluno.has_pdi = false;
          aluno.has_pai = false;
          aluno.relatorios = [];
        }
        */
      }
    },
    
    viewFormularios(aluno) {
      if (this.expandedAlunoId === aluno.id) {
        this.expandedAlunoId = null;
      } else {
        this.expandedAlunoId = aluno.id;
      }
    },
    
    viewEntrevista(studentId) {
      this.$router.push(`/entrevista-completa?student_id=${studentId}&readonly=1`);
    },
    
    viewPDI(studentId) {
      this.$router.push(`/pdi-completo?student_id=${studentId}&readonly=1`);
    },
    
    viewPAI(studentId) {
      this.$router.push(`/pai-completo?student_id=${studentId}&readonly=1`);
    },
    
    viewRelatorio(relatorioId) {
      this.$router.push(`/relatorio-atendimento?id=${relatorioId}&readonly=1`);
    },
    
    formatDate(dateStr) {
      if (!dateStr) return '';
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return dateStr;
      }
    }
  },
  
  async mounted() {
    await this.loadProfessores();
  }
};

// Componente de Legislações
const LegislacoesTW = {
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Diretório de Legislações</h1>
          <p class="mt-1 text-sm text-gray-600">Documentos legislativos relacionados ao AEE</p>
        </div>
        <button 
          v-if="user && user.role === 'admin'"
          @click="showUploadForm = true" 
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          <span>Adicionar Legislação</span>
        </button>
      </div>

      <!-- Modal de Upload (apenas admin) -->
      <div v-if="showUploadForm && user && user.role === 'admin'" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto" style="background-color: rgba(0, 0, 0, 0.85);" @click.self="cancelUpload">
  <form @submit.prevent="uploadLegislacao" class="bg-gray-50 rounded-lg w-full max-w-4xl shadow-xl overflow-hidden flex flex-col border border-gray-200 m-4" style="max-height: calc(100vh - 2rem);">
          <div class="flex items-center justify-between p-4 border-b bg-gray-50 sticky top-0 z-10">
            <h2 class="text-lg font-semibold text-gray-900">Nova Legislação</h2>
            <button type="button" @click="cancelUpload" class="text-gray-500 hover:text-gray-700" aria-label="Fechar"><i class="fas fa-times text-xl"></i></button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Título *</label>
            <input 
              v-model="form.titulo" 
              type="text" 
              required 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Lei Brasileira de Inclusão da Pessoa com Deficiência">
          </div>
          
          <div class="px-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea 
              v-model="form.descricao" 
              rows="3" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Breve descrição sobre a legislação..."></textarea>
          </div>
          
          <div class="px-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Arquivo PDF *</label>
            <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div class="space-y-1 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Selecionar arquivo</span>
                    <input @change="handleFileSelect" type="file" accept=".pdf" required class="sr-only">
                  </label>
                  <p class="pl-1">ou arraste e solte</p>
                </div>
                <p class="text-xs text-gray-500">Apenas arquivos PDF até 50MB</p>
                <div v-if="selectedFile" class="mt-2 text-sm text-green-600">
                  <p>📄 {{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
                </div>
              </div>
            </div>
          </div>
          
          <div v-if="uploadError" class="mx-6 bg-red-50 border border-red-200 rounded p-3">
            <p class="text-sm text-red-600">{{ uploadError }}</p>
          </div>
          
          <div class="flex justify-end space-x-3 p-4 border-t">
            <button type="button" @click="cancelUpload" class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button 
              type="submit" 
              :disabled="uploading || !form.titulo || !selectedFile" 
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="uploading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </span>
              <span v-else>Salvar Legislação</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros de Busca -->
      <div class="bg-white shadow rounded-lg p-4">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div class="flex-1 max-w-md">
            <div class="relative">
              <input 
                v-model="searchQuery" 
                @keyup.enter="search"
                type="text" 
                placeholder="Buscar por título ou descrição..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>
          </div>
          <button 
            @click="search" 
            class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Buscar</span>
          </button>
        </div>
      </div>

      <!-- Lista de Legislações -->
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Carregando legislações...
          </div>
        </div>
        
        <div v-else-if="!legislacoes || legislacoes.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <p class="text-lg font-medium mb-2">Nenhuma legislação encontrada</p>
          <p class="text-sm">{{ searchQuery ? 'Tente buscar por outros termos.' : 'Não há documentos cadastrados ainda.' }}</p>
        </div>
        
        <div v-else class="divide-y divide-gray-200">
          <div v-for="legislacao in legislacoes" :key="legislacao.id" class="p-6 hover:bg-gray-50 transition-colors">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <svg class="h-6 w-6 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900">{{ legislacao.titulo }}</h3>
                </div>
                
                <p v-if="legislacao.descricao" class="text-gray-600 mb-3 line-clamp-2">{{ legislacao.descricao }}</p>
                
                <div class="flex items-center space-x-4 text-sm text-gray-500">
                  <span class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    {{ legislacao.data_formatada }}
                  </span>
                  <span class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    {{ legislacao.tamanho_formatado }}
                  </span>
                  <span class="text-blue-600">{{ legislacao.nome_original }}</span>
                </div>
              </div>
              
              <div class="flex items-center space-x-2 ml-4">
                <a 
                  :href="getPdfUrl(legislacao.id)" 
                  target="_blank"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  Visualizar
                </a>
                
                <button 
                  v-if="user && user.role === 'admin'"
                  @click="deleteLegislacao(legislacao)"
                  :disabled="deletingId === legislacao.id"
                  class="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed">
                  <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span v-if="deletingId === legislacao.id" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-red-700" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Excluindo...
                  </span>
                  <span v-else>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Paginação -->
        <div v-if="pagination && pagination.total_pages > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Mostrando {{ ((pagination.page - 1) * pagination.per_page) + 1 }} a {{ Math.min(pagination.page * pagination.per_page, pagination.total || 0) }} de {{ pagination.total || 0 }} resultados
            </div>
            <div class="flex space-x-1">
              <button 
                @click="changePage(pagination.page - 1)"
                :disabled="!pagination || pagination.page <= 1"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Anterior
              </button>
              
              <button 
                v-for="page in getVisiblePages()" 
                :key="page"
                @click="changePage(page)"
                :class="['px-3 py-2 text-sm font-medium border rounded-md', page === pagination.page ? 'text-blue-600 bg-blue-50 border-blue-300' : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50']">
                {{ page }}
              </button>
              
              <button 
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination || pagination.page >= pagination.total_pages"
                class="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Próxima
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      legislacoes: [],
      loading: false,
      showUploadForm: false,
      uploading: false,
      uploadError: null,
      searchQuery: '',
      selectedFile: null,
      form: {
        titulo: '',
        descricao: ''
      },
      pagination: {
        page: 1,
        per_page: 10,
        total: 0,
        total_pages: 0
      },
      user: null,
      deletingId: null
    }
  },
  async mounted() {
    // Carregar dados do usuário
    try {
      const response = await api.get('/user');
      this.user = (response.data && response.data.data) ? response.data.data : response.data;
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
    
    await this.loadLegislacoes();
  },
  methods: {
    async loadLegislacoes() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          per_page: this.pagination.per_page,
          _ts: Date.now()
        };
        
        if (this.searchQuery) {
          params.q = this.searchQuery;
        }
        
        const response = await api.get('/legislacoes', { params });
        const data = response.data?.data || response.data;
        
        this.legislacoes = data.rows || [];
        this.pagination = {
          page: data.page || 1,
          per_page: data.per_page || 10,
          total: data.total || 0,
          total_pages: data.total_pages || 0
        };
      } catch (error) {
        console.error('Erro ao carregar legislações:', error);
        this.$showToast('Erro', 'Erro ao carregar legislações', 'error');
      } finally {
        this.loading = false;
      }
    },

    async search() {
      this.pagination.page = 1;
      await this.loadLegislacoes();
    },
    
    async changePage(page) {
      if (!this.pagination) return;
      if (page >= 1 && page <= (this.pagination.total_pages || 1)) {
        this.pagination.page = page;
        await this.loadLegislacoes();
      }
    },

    getVisiblePages() {
      if (!this.pagination) return [];
      const current = this.pagination.page || 1;
      const total = this.pagination.total_pages || 1;
      const pages = [];
      const start = Math.max(1, current - 2);
      const end = Math.min(total, current + 2);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    },
    
    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.type !== 'application/pdf') {
          this.$showToast('Atenção', 'Por favor, selecione apenas arquivos PDF.', 'warning');
          event.target.value = '';
          return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
          this.$showToast('Atenção', 'O arquivo deve ter no máximo 50MB.', 'warning');
          event.target.value = '';
          return;
        }
        
        this.selectedFile = file;
        this.uploadError = null;
      }
    },
    
    async uploadLegislacao() {
      if (!this.form.titulo || !this.selectedFile) {
        this.uploadError = 'Título e arquivo PDF são obrigatórios.';
        return;
      }
      
      this.uploading = true;
      this.uploadError = null;
      
      const formData = new FormData();
      formData.append('titulo', this.form.titulo);
      formData.append('descricao', this.form.descricao);
      formData.append('arquivo', this.selectedFile);
      
      try {
        const response = await api.post('/legislacoes/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        if (response.data?.ok) {
          this.$showToast('Sucesso', 'Legislação adicionada com sucesso!', 'success');
          this.cancelUpload();
          await this.loadLegislacoes();
        } else {
          this.uploadError = response.data?.error || 'Erro ao enviar arquivo';
        }
      } catch (error) {
        console.error('Erro no upload:', error);
        this.uploadError = error.response?.data?.error || 'Erro ao enviar arquivo';
      } finally {
        this.uploading = false;
      }
    },
    
    cancelUpload() {
      this.showUploadForm = false;
      this.form = { titulo: '', descricao: '' };
      this.selectedFile = null;
      this.uploadError = null;
    },
    
    async deleteLegislacao(legislacao) {
      // Confirmação via toast à direita, com botões
      const confirmed = await this.$confirmToast(
        'Confirmar exclusão',
        `Deseja realmente excluir a legislação "${legislacao.titulo}"? Esta ação não pode ser desfeita.`,
        { confirmText: 'Excluir', cancelText: 'Cancelar', type: 'warning', timeoutMs: 15000 }
      );
      if (!confirmed) return;

      this.deletingId = legislacao.id;
      try {
        const response = await api.delete(`/legislacoes/${legislacao.id}`);
        if (response.data?.ok) {
          // Detalhes de deleção do backend
          const info = response.data?.data || {};
          const hadFile = !!info.had_file;
          const fileDeleted = !!info.file_deleted;
          const filename = info.filename || '';

          // Log de diagnóstico no console para ambiente de desenvolvimento
          try { console.debug('🔧 legislações.delete resp:', { hadFile, fileDeleted, filename }); } catch (e) {}

          // Feedback ao usuário considerando o status do arquivo físico
          if (hadFile && !fileDeleted) {
            this.$showToast('Aviso', 'Registro removido, mas o arquivo físico não pôde ser excluído do servidor.', 'warning');
          } else {
            this.$showToast('Sucesso', 'Legislação excluída com sucesso!', 'success');
          }
          // Remove localmente para resposta imediata
          this.legislacoes = (this.legislacoes || []).filter(l => l.id !== legislacao.id);
          // Recarrega do servidor para garantir sincronização
          await this.loadLegislacoes();
        } else {
          const code = response.data?.error || 'Erro ao excluir legislação';
          if (code === 'NOT_DELETED') this.$showToast('Aviso', 'Não foi possível remover este documento agora. Tente novamente.', 'warning');
          else this.$showToast('Erro', code, 'error');
        }
      } catch (error) {
        console.error('Erro ao excluir:', error);
        const status = error.response?.status;
        if (status === 403) this.$showToast('Sem permissão', 'Apenas administradores podem excluir legislações.', 'warning');
        else if (status === 404) this.$showToast('Não encontrado', 'Documento não existe mais.', 'info');
        else if (status === 409) this.$showToast('Aviso', 'Não foi possível remover este documento agora. Tente novamente.', 'warning');
        else this.$showToast('Erro', 'Erro ao excluir legislação', 'error');
      } finally {
        this.deletingId = null;
      }
    },
    
    getPdfUrl(id) {
      // Inclui token na query e usa buildApiUrl para suportar hosts sem PATH_INFO
      const token = localStorage.getItem('token') || '';
      return buildApiUrl(`/legislacoes/${id}/download`, `token=${encodeURIComponent(token)}`);
    },
    
    formatFileSize(bytes) {
      if (bytes >= 1048576) {
        return (bytes / 1048576).toFixed(1) + ' MB';
      } else if (bytes >= 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
      } else {
        return bytes + ' bytes';
      }
    }
  }
};

// Componente de Microfone Flutuante Global para Input por Voz
const FloatingMicrophone = {
  template: `
    <teleport to="body">
    <div style="position: fixed; bottom: 24px; right: 24px; z-index: 9999;">
      <div v-if="isRecording" 
           style="position: absolute; bottom: 88px; right: 0; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); padding: 16px; width: 320px; border: 2px solid #ef4444;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 14px; font-weight: 600; color: #374151;">
            🎤 Ouvindo... Clique para parar
          </span>
        </div>
        <p v-if="displayTranscript" style="font-size: 14px; color: #4b5563; margin-bottom: 8px; max-height: 120px; overflow-y: auto;">{{ displayTranscript }}</p>
        <p v-else style="font-size: 12px; color: #6b7280; font-style: italic;">Fale agora...</p>
      </div>
      
      <button @click="toggleRecording" 
              :disabled="!isSupported"
              :title="getTooltip"
              style="width: 64px; height: 64px; border-radius: 50%; box-shadow: 0 10px 25px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; border: none; cursor: pointer; transition: all 0.3s;"
              :style="{ 
                background: isRecording ? '#dc2626' : 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                opacity: isSupported ? 1 : 0.5,
                cursor: isSupported ? 'pointer' : 'not-allowed'
              }">
        <span style="font-size: 24px; color: white;">
          {{ isRecording ? '⏹' : '🎤' }}
        </span>
      </button>
      
      <div v-if="!isSupported" 
           style="position: absolute; bottom: 88px; right: 0; background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; width: 256px; font-size: 12px;">
        <p style="color: #92400e; font-weight: 600; margin-bottom: 4px;">⚠️ Navegador não suportado</p>
        <p style="color: #b45309;">Web Speech API não disponível. Use Chrome, Edge ou Safari.</p>
      </div>
    </div>
    </teleport>
  `,
  
  data() {
    return {
      isRecording: false,
      isSupported: false,
      recognition: null,
      transcript: '',
      lastActiveElement: null,
      lastFocusedElement: null,
      interimTranscript: '',
      manualStopRequested: false,
      handleFocusIn: null,
      targetInfo: null,
      highlightClass: 'voice-input-highlight',
      highlightTimer: null
    };
  },
  
  computed: {
    getTooltip() {
      if (!this.isSupported) return 'Navegador não suportado';
      return this.isRecording ? 'Parar gravação' : 'Gravar áudio para preencher campo';
    },
    displayTranscript() {
      return `${this.transcript} ${this.interimTranscript}`.trim();
    }
  },
  
  methods: {
    isTextInput(el) {
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || el.isContentEditable;
    },

    resolveTargetElement() {
      if (!this.targetInfo) return null;
      const { element, voiceId } = this.targetInfo;
      if (element && document.contains(element)) return element;
      if (voiceId) {
        const replacement = document.querySelector(`[data-voice-target-id="${voiceId}"]`);
        if (replacement) {
          this.targetInfo.element = replacement;
          return replacement;
        }
      }
      return null;
    },

    ensureTarget() {
      const target = this.resolveTargetElement();
      if (!target) {
        console.warn('⚠️ Campo de voz não encontrado durante a transcrição');
      }
      return target;
    },

    setElementValue(target, value) {
      if (!target) return;
      if (target.isContentEditable) {
        target.innerText = value;
      } else {
        target.value = value;
      }
      const event = new Event('input', { bubbles: true });
      target.dispatchEvent(event);
    },

    getElementValue(el) {
      if (!el) return '';
      if (el.isContentEditable) return el.innerText || '';
      return el.value || '';
    },

    addHighlight(target) {
      if (!target) return;
      target.classList.add(this.highlightClass);
      if (this.highlightTimer) {
        clearTimeout(this.highlightTimer);
        this.highlightTimer = null;
      }
    },

    removeHighlight(delay = 0) {
      if (!this.targetInfo || !this.targetInfo.element) {
        this.targetInfo = null;
        return;
      }
      const target = this.targetInfo.element;
      const clear = () => {
        target.classList.remove(this.highlightClass);
        this.highlightTimer = null;
        this.targetInfo = null;
      };
      if (delay > 0) {
        this.highlightTimer = setTimeout(clear, delay);
      } else {
        clear();
      }
    },

    captureTarget(candidate) {
      const target = this.isTextInput(candidate) ? candidate : null;
      if (!target) return null;

      const voiceId = target.dataset.voiceTargetId || `voice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      target.dataset.voiceTargetId = voiceId;

      const value = this.getElementValue(target);
      const hasSelection = typeof target.selectionStart === 'number' && typeof target.selectionEnd === 'number';
      const selectionStart = hasSelection ? target.selectionStart : value.length;
      const selectionEnd = hasSelection ? target.selectionEnd : value.length;

      return {
        element: target,
        voiceId,
        beforeText: value.slice(0, selectionStart),
        afterText: value.slice(selectionEnd),
        lastApplied: '',
        isContentEditable: target.isContentEditable
      };
    },

    applyTranscriptToTarget(force = false) {
      if (!this.targetInfo) return;
      const target = this.ensureTarget();
      if (!target) return;

      const transcriptText = this.displayTranscript;
      if (!force && transcriptText === this.targetInfo.lastApplied) return;

      const before = this.targetInfo.beforeText || '';
      const after = this.targetInfo.afterText || '';
      const newValue = transcriptText ? `${before}${transcriptText}${after}` : `${before}${after}`;
      this.setElementValue(target, newValue);

      const cursorPos = (before + transcriptText).length;
      if (typeof target.setSelectionRange === 'function') {
        try {
          target.setSelectionRange(cursorPos, cursorPos);
        } catch (_) {}
      }

      this.targetInfo.lastApplied = transcriptText;
    },

    clearTargetInfo() {
      if (this.highlightTimer) {
        clearTimeout(this.highlightTimer);
        this.highlightTimer = null;
      }
      if (this.targetInfo && this.targetInfo.element) {
        this.targetInfo.element.classList.remove(this.highlightClass);
      }
      this.targetInfo = null;
    },

    initSpeechRecognition() {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        console.warn('🎤 Web Speech API não suportada');
        this.isSupported = false;
        return;
      }
      
      this.isSupported = true;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pt-BR';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;
      
      this.recognition.onstart = () => {
        this.isRecording = true;
      };
      
      this.recognition.onresult = (event) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript.trim();
          if (!text) continue;
          if (result.isFinal) {
            this.transcript = (this.transcript ? `${this.transcript} ` : '') + text;
          } else {
            interim = `${interim} ${text}`.trim();
          }
        }
        this.interimTranscript = interim.trim();
        
        // Inserir em tempo real no campo ativo
        this.updateFieldInRealTime();
      };
      
      this.recognition.onerror = (event) => {
        console.error('❌ Erro no reconhecimento de voz:', event.error);
        
        if (event.error === 'no-speech') {
          // Silenciosamente reinicia sem mostrar toast (normal em pausas longas)
          return; // Deixa o onend fazer o restart
        } else if (event.error === 'not-allowed') {
          this.isRecording = false;
          this.manualStopRequested = true;
          this.$showToast && this.$showToast('Erro', 'Permissão de microfone negada. Permita o acesso nas configurações do navegador.', 'error');
        } else if (event.error === 'aborted') {
          this.isRecording = false;
        } else {
          this.isRecording = false;
          console.warn('⚠️ Erro inesperado:', event.error);
        }
      };
      
      this.recognition.onend = () => {
        if (this.manualStopRequested) {
          this.manualStopRequested = false;
          this.isRecording = false;
          this.applyTranscriptToTarget(true);
          this.removeHighlight(500);
          return;
        }
        if (this.isRecording) {
          setTimeout(() => {
            try {
              this.recognition?.start();
            } catch (err) {
              console.warn('⚠️ Falha ao reiniciar reconhecimento:', err);
              this.isRecording = false;
              this.removeHighlight(500);
            }
          }, 400);
        }
      };
    },
    
    updateFieldInRealTime() {
      if (!this.targetInfo) return;
      const target = this.ensureTarget();
      if (!target) return;

      this.applyTranscriptToTarget();
    },

    toggleRecording() {
      if (!this.isSupported) return;

      if (this.isRecording) {
        this.manualStopRequested = true;
        this.recognition.stop();
      } else {
        // Guardar último campo de texto focado antes de gravar
        const candidate = this.lastFocusedElement || document.activeElement;
        const info = this.captureTarget(candidate);
        if (!info) {
          this.$showToast && this.$showToast('Atenção', 'Clique em um campo de texto antes de gravar.', 'warning');
          return;
        }

        this.lastActiveElement = info.element;
        this.targetInfo = info;
        this.addHighlight(info.element);
        this.$nextTick(() => {
          try { info.element.focus(); } catch (_) {}
        });

        this.transcript = '';
        this.interimTranscript = '';
        this.manualStopRequested = false;
        this.recognition.start();
        this.isRecording = true;
      }
    },

    closeTranscript() {
      if (this.isRecording) {
        this.manualStopRequested = true;
        this.recognition.stop();
        this.isRecording = false;
      }
      this.transcript = '';
      this.interimTranscript = '';
      this.lastActiveElement = null;
      this.clearTargetInfo();
    }
  },
  
  mounted() {
    this.initSpeechRecognition();
    this.handleFocusIn = (event) => {
      if (this.isTextInput(event.target)) {
        this.lastFocusedElement = event.target;
      }
    };
    document.addEventListener('focusin', this.handleFocusIn, true);

    // Estilo para campo destacado pela voz (adicionado apenas uma vez)
    if (!document.getElementById('voice-input-highlight-style')) {
      const styleEl = document.createElement('style');
      styleEl.id = 'voice-input-highlight-style';
      styleEl.textContent = `
        .voice-input-highlight {
          outline: 2px solid #f97316 !important;
          box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.25) !important;
          border-color: #fb923c !important;
          transition: box-shadow 0.2s ease, outline 0.2s ease;
        }
      `;
      document.head.appendChild(styleEl);
    }
  },
  
  beforeUnmount() {
    if (this.recognition) {
      this.recognition.stop();
    }
    document.removeEventListener('focusin', this.handleFocusIn, true);
    this.clearTargetInfo();
  }
};

// Layout principal com sidebar moderna usando Tailwind
const Layout = {
  template: `
    <div class="flex h-screen overflow-hidden">
      <!-- Overlay para mobile -->
      <div 
        v-if="sidebarOpen" 
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        @click="sidebarOpen = false">
      </div>
      
      <!-- Sidebar -->
      <aside 
        :class="['fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
        
        <!-- Header da Sidebar -->
        <div class="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-12 w-12 lg:h-16 lg:w-16">
              <div class="hidden sm:block">
                <h5 class="text-lg lg:text-xl font-bold text-gray-900">ConectAEE</h5>
                <p class="text-xs lg:text-sm text-gray-600">Sistema AEE</p>
              </div>
            </div>
            <button 
              class="lg:hidden p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-100" 
              @click="sidebarOpen = false">
              ✕
            </button>
          </div>
        </div>
        
        <!-- Navegação Scrollable -->
        <nav class="flex-1 overflow-y-auto p-3 space-y-4">
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Gestão
            </h6>
            <!-- Alunos - Oculto para admin -->
            <router-link v-if="user && user.role !== 'admin'" to="alunos" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Alunos
            </router-link>
            <!-- Usuários - Apenas para admin -->
            <router-link v-if="user && user.role === 'admin'" to="usuarios" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-3-3.87M7 21v-2a4 4 0 0 1 3-3.87"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Usuários
            </router-link>
            <!-- Escolas - Oculto para admin -->
            <router-link v-if="user && user.role !== 'admin'" to="escolas" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
              Escolas
            </router-link>
            <router-link v-if="user && user.role === 'admin'" to="supervisao" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              Supervisão de Professores
            </router-link>
          </div>
          
          <!-- Formulários AEE - Oculto apenas de admin -->
          <div v-if="user && user.role !== 'admin'">
            <h6 class="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Formulários AEE
            </h6>
            <router-link to="entrevista-completa" class="nav-link-tw bg-indigo-50 border-l-4 border-indigo-600" @click="closeMobileSidebar" title="Formulário completo com 180+ campos">
              <i class="fas fa-comments w-5 text-indigo-600"></i>
              Entrevista com Responsável
            </router-link>
            <router-link to="pdi-completo" class="nav-link-tw bg-emerald-50 border-l-4 border-emerald-600" @click="closeMobileSidebar" title="Formulário completo com 250+ campos">
              <i class="fas fa-file-medical w-5 text-emerald-600"></i>
              PDI - Plano de Desenvolvimento Individual
            </router-link>
            <router-link to="pai-completo" class="nav-link-tw bg-purple-50 border-l-4 border-purple-600" @click="closeMobileSidebar" title="Formulário completo com 80+ campos">
              <i class="fas fa-tasks w-5 text-purple-600"></i>
              PAI - Plano de Atendimento Individual
            </router-link>
            <router-link to="relatorio-atendimento" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              Relatório de Atendimento
            </router-link>
          </div>
          
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Relatórios
            </h6>
            <router-link to="relatorios" class="nav-link-tw" @click="closeMobileSidebar">
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
          
          <div>
            <h6 class="mb-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Recursos
            </h6>
            <router-link to="legislacoes" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Legislações
            </router-link>
            <router-link to="documentos" class="nav-link-tw" @click="closeMobileSidebar">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <circle cx="12" cy="15" r="3"/>
              </svg>
              Documentos Gerados
            </router-link>
            <button type="button" class="nav-link-tw logout-link w-full text-left" @click.prevent="$logout()">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7"/>
                <path d="M7 4h6a2 2 0 012 2v2"/>
                <path d="M15 16v2a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2"/>
              </svg>
              Sair
            </button>
          </div>
        </nav>
      </aside>
      
      <!-- Conteúdo principal -->
      <main class="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <!-- Header melhorado com gradiente e informações úteis -->
        <header style="display:none" class="flex-shrink-0 bg-blue-600   shadow-lg">
          <div class="px-4 py-3 lg:px-6">
            <div class="flex items-center justify-between">
              <!-- Lado esquerdo: Menu mobile + Info do sistema -->
              <div class="flex items-center gap-3">
                <button 
                  class="lg:hidden p-2 rounded-md text-white hover:bg-white/10 transition-colors"
                  @click="sidebarOpen = !sidebarOpen">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>
                
                <!-- Logo e info do sistema -->
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div class="hidden sm:block">
                    <h1 class="text-lg font-semibold">ConectAEE</h1>
                    <p class="text-xs text-white/90">Sistema de Gestão Educacional AEE</p>
                  </div>
                </div>
              </div>

              <!-- Centro: Informações contextuais -->
              <div class="hidden md:flex items-center gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6"/>
                  </svg>
                  <span class="text-white/90">{{ currentPageTitle }}</span>
                </div>
                <div class="w-px h-4 bg-white/30"></div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-white/90">{{ currentTimeDisplay }}</span>
                </div>
              </div>
              
              <!-- Lado direito: Info do usuário + ações -->
              <div class="flex items-center gap-2 lg:gap-4">
                <!-- Info do usuário -->
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div class="hidden sm:block">
                    <p class="text-sm font-medium">{{ user?.name || 'Usuário' }}</p>
                    <p class="text-xs text-white/90 capitalize">{{ user?.role || 'Professor' }}</p>
                  </div>
                </div>
                <!-- Botão Sair -->
                <button 
                  class="px-3 py-1.5 rounded border border-red-200 text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300"
                  @click="$logout()" :disabled="loggingOut"
                  :class="loggingOut ? 'opacity-60 cursor-not-allowed' : ''">
                  <span v-if="!loggingOut">Sair</span>
                  <span v-else>Saindo...</span>
                </button>
              </div>
            </div>
          </div>
        </header>
        
        <!-- Área de conteúdo scrollable -->
        <div class="flex-1 overflow-y-auto p-4 lg:p-6">
          <router-view></router-view>
        </div>
      </main>
    </div>
  `,
  data() {
    return {
      sidebarOpen: window.innerWidth >= 1024, // Aberto em desktop, fechado em mobile
      user: null,
      loggingOut: false,
      timeInterval: null,
      currentTimeDisplay: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false }),
      currentPageTitle: 'ConectAEE',
      modal: {
        visible: false,
        title: '',
        message: '',
        type: 'info' // 'success', 'error', 'info'
      }
    }
  },
  computed: {
    modalIcon() {
      const icons = {
        success: 'fas fa-check-circle text-green-600',
        error: 'fas fa-times-circle text-red-600',
        info: 'fas fa-info-circle text-blue-600'
      };
      return icons[this.modal.type] || icons.info;
    },
    modalIconBg() {
      const colors = {
        success: 'bg-green-100',
        error: 'bg-red-100',
        info: 'bg-blue-100'
      };
      return colors[this.modal.type] || colors.info;
    }
  },
  methods: {
    showModal(title, message, type = 'info') {
      this.modal.title = title;
      this.modal.message = message;
      this.modal.type = type;
      this.modal.visible = true;
    },
    closeModal() {
      this.modal.visible = false;
    },
    closeMobileSidebar() {
      const width = window.innerWidth;
      
      // Só fecha o sidebar em telas pequenas (mobile/tablet)
      if (width < 1024) {
        this.sidebarOpen = false;
      } else {
        // Garantir que está aberto no desktop
        if (!this.sidebarOpen) {
          this.sidebarOpen = true;
        }
      }
    },
    async logout() {
      if (this.loggingOut) return;
      this.loggingOut = true;
      try {
        // Tenta informar o backend (se o endpoint existir)
        await api.post('/logout').catch(() => {});
      } catch (error) {
        console.error('Erro no logout:', error);
      } finally {
        try {
          // Fecha a sidebar em mobile para evitar estado inconsistente
          if (window.innerWidth < 1024) this.sidebarOpen = false;
          // Limpa token e header Authorization
          localStorage.removeItem('token');
          if (api?.defaults?.headers?.common?.Authorization) delete api.defaults.headers.common['Authorization'];
          this.user = null;
          // Feedback visual
          if (this.$showToast) this.$showToast('Sessão encerrada', 'Você saiu da conta com segurança.', 'success', 3000);
          // Redireciona via router (suave)
          if (this.$route.path !== '/login') {
            await this.$router.push('/login').catch(() => {});
          }
          // Fallback hard caso algo impeça a navegação
          setTimeout(() => {
            if (location.hash !== '#/login') location.hash = '#/login';
            this.loggingOut = false;
          }, 50);
        } catch (e) {
          this.loggingOut = false;
        }
      }
    }
  },
  async mounted() {
    try {
      const response = await api.get('/user');
      this.user = (response.data && response.data.data) ? response.data.data : response.data;
      
      // CRÍTICO: Atualizar $root.user para todos os componentes filhos acessarem
      if (this.$root) {
        this.$root.user = this.user;
      }
      
    } catch (error) {
      console.error('❌ [Layout] Erro ao carregar dados do usuário:', error);
      console.error('❌ [Layout] Response:', error.response);
    }
    
    // Atualizar o relógio a cada minuto
    this.timeInterval = setInterval(() => {
      this.currentTimeDisplay = new Date().toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      });
    }, 60000);
    
    // Atualizar título inicial
    this.updatePageTitle();
    
    // Listener para redimensionamento da janela
    window.addEventListener('resize', this.handleResize);
  },
  watch: {
    $route() {
      this.updatePageTitle();
      // Garantir estado correto do sidebar após navegação
      this.ensureCorrectSidebarState();
    }
  },
  methods: {
    // ... outros métodos já existem acima
    updatePageTitle() {
      const titles = {
        '/': 'Dashboard',
        '/alunos': 'Gestão de Alunos',
        '/usuarios': 'Gestão de Usuários',
        '/escolas': 'Gestão de Escolas', // compat: caso navegue diretamente
        '/escolas/': 'Gestão de Escolas',
        '/supervisao': 'Supervisão de Professores',
        '/entrevista-responsavel': 'Entrevista com Responsável',
        '/pdi-conectaee': 'PDI ConectAEE',
        '/planos-atendimento': 'Planos de Atendimento',
        '/legislacoes': 'Diretório de Legislações',
        '/relatorios-atendimento': 'Relatórios de Atendimento'
      };
      this.currentPageTitle = titles[this.$route?.path] || 'ConectAEE';
    },
    handleResize() {
      const width = window.innerWidth;
      if (width >= 1024) {
        // Em desktop, sempre manter sidebar aberto
        if (!this.sidebarOpen) {
          this.sidebarOpen = true;
        }
      }
      // Em mobile, não forçar estado - deixar o usuário controlar
    },
    ensureCorrectSidebarState() {
      const width = window.innerWidth;
      
      if (width >= 1024 && !this.sidebarOpen) {
        this.sidebarOpen = true;
      }
    }
  },
  beforeUnmount() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
    // Remover listener de resize
    window.removeEventListener('resize', this.handleResize);
  }
};

// Página de Login
const Login = {
  template: `
    <div class="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <!-- Painel visual à esquerda (desktop) -->
      <div class="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div class="absolute inset-0 opacity-20" aria-hidden="true" style="background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 40%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0, transparent 45%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.25) 0, transparent 40%);"></div>
        <div class="relative z-10 w-full flex flex-col items-center justify-center p-12 text-center">
          <div class="mb-8 w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg ring-1 ring-white/20">
            <img src="./icons/logo-icon.png" alt="ConectAEE" class="w-16 h-16">
          </div>
          <h1 class="text-3xl font-bold tracking-tight">ConectAEE</h1>
          <p class="mt-2 text-white/90">Sistema de Gestão Educacional AEE</p>
          <div class="mt-8 grid grid-cols-3 gap-4 w-full max-w-xl">
            <div class="bg-white/10 rounded-xl p-4 text-left ring-1 ring-white/20">
              <p class="text-sm text-white/90">Segurança</p>
              <p class="text-xl font-semibold">Token JWT</p>
            </div>
            <div class="bg-white/10 rounded-xl p-4 text-left ring-1 ring-white/20">
              <p class="text-sm text-white/90">Relatórios</p>
              <p class="text-xl font-semibold">PDFs nativos</p>
            </div>
            <div class="bg-white/10 rounded-xl p-4 text-left ring-1 ring-white/20">
              <p class="text-sm text-white/90">AEE</p>
              <p class="text-xl font-semibold">Formulários</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Painel de login à direita -->
      <div class="relative bg-gray-50 flex items-center justify-center p-6 sm:p-10">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(99,102,241,0.08),transparent_40%),radial-gradient(circle_at_90%_20%,rgba(59,130,246,0.06),transparent_35%)]"></div>
        <div class="relative w-full max-w-md">
          <div class="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-6 sm:p-8">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <img src="./icons/logo-icon.png" alt="ConectAEE" class="w-7 h-7">
              </div>
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Bem-vindo(a)</h2>
                <p class="text-sm text-gray-600">Entre com suas credenciais</p>
              </div>
            </div>

            <form @submit.prevent="login" class="space-y-5">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div class="relative">
                  <input
                    id="email"
                    v-model.trim="email"
                    type="email"
                    autocomplete="username"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2.5 placeholder-gray-400"
                    placeholder="seu@email.com"
                  />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
                    <i class="fas fa-envelope"></i>
                  </span>
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                <div class="relative">
                  <input
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    v-model="password"
                    autocomplete="current-password"
                    required
                    class="w-full rounded-xl border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 px-3 py-2.5 pr-10 placeholder-gray-400"
                    @keydown="checkCapsLock($event)" @keyup="checkCapsLock($event)" @focus="checkCapsLock($event)" @blur="capsOn=false"
                    placeholder="••••••••"
                  />
                  <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300" @click="showPassword = !showPassword" :aria-pressed="showPassword.toString()" :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'">
                    <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                </div>
                <p v-if="capsOn" class="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 inline-flex items-center gap-2" role="status" aria-live="polite">
                  <i class="fas fa-keyboard"></i>
                  CAPS LOCK está ativo
                </p>
              </div>

              <div class="flex items-center justify-between">
                <label class="inline-flex items-center gap-2 text-sm text-gray-700 select-none">
                  <input type="checkbox" v-model="remember" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  Lembrar meu e-mail
                </label>
                <a class="text-sm text-blue-700 hover:text-blue-900" href="#" @click.prevent="$showToast && $showToast('Disponível em breve', 'Recuperação de senha em desenvolvimento.', 'info')">Esqueci minha senha</a>
              </div>

              <div v-if="error" class="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-3">
                <i class="fas fa-circle-exclamation text-red-600 mt-0.5"></i>
                <div class="text-sm text-red-700">{{ error }}</div>
              </div>

              <button
                type="submit"
                :disabled="loading"
                class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">
                <span v-if="loading" class="inline-flex items-center gap-2">
                  <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Entrando...
                </span>
                <span v-else>
                  Entrar
                </span>
              </button>

              <p class="text-center text-sm text-gray-600">
                Não tem uma conta?
                <router-link to="/register" class="font-medium text-blue-700 hover:text-blue-900">Registre-se</router-link>
              </p>
              <p class="text-center text-xs text-gray-500 mt-2">
                <a href="#" @click.prevent="openPrivacy" class="hover:text-gray-700 underline">Políticas de Privacidade</a>
              </p>
            </form>
            
            <!-- Modal de Privacidade -->
            <div v-if="privacyOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div class="absolute inset-0" style="background-color: rgba(0, 0, 0, 0.85);" @click="closePrivacy" aria-hidden="true"></div>
              <div class="relative bg-white rounded-xl shadow-2xl w-[90%] max-w-xl overflow-y-auto p-6 border border-gray-200" role="dialog" aria-modal="true" aria-labelledby="privacy-title" style="max-height: 90vh;">
                <div class="flex items-center justify-between mb-4">
                  <h3 id="privacy-title" class="text-lg font-semibold text-gray-900">Políticas de Privacidade</h3>
                  <button class="text-gray-500 hover:text-gray-700" @click="closePrivacy" aria-label="Fechar">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="prose prose-sm max-w-none text-gray-700">
                  <p>Respeitamos sua privacidade. Seus dados são utilizados apenas para autenticação e funcionalidades do sistema AEE.</p>
                  <ul class="list-disc pl-5">
                    <li>Armazenamos seu token de sessão localmente.</li>
                    <li>Suas credenciais são processadas em ambiente seguro.</li>
                    <li>Você pode solicitar remoção de dados conforme a LGPD.</li>
                  </ul>
                </div>
                <div class="mt-6 text-right">
                  <button class="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-50" @click="closePrivacy">Fechar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: '',
      password: '',
      remember: false,
      showPassword: false,
      capsOn: false,
      privacyOpen: false,
      loading: false,
      error: null
    }
  },
  methods: {
    checkCapsLock(e) {
      try {
        this.capsOn = e.getModifierState && e.getModifierState('CapsLock');
      } catch (_) { this.capsOn = false; }
    },
    openPrivacy() { this.privacyOpen = true; },
    closePrivacy() { this.privacyOpen = false; },
    async login() {
      this.loading = true;
      this.error = null;
      
      try {
        // Detecta e configura o modo de roteamento da API antes da primeira chamada
        await ensureApiRouting();
        const response = await api.post('/login', {
          email: this.email,
          password: this.password
        });
        
        const token = response.data?.data?.token || response.data?.token;
        const user = response.data?.data?.user || response.data?.user;
        
        if (!token) throw new Error('TOKEN_MISSING');
        
        // Bloquear login de estudantes
        if (user && user.role === 'student') {
          this.error = 'Acesso negado. Apenas professores e administradores podem fazer login.';
          return;
        }
        
        localStorage.setItem('token', token);
        // Lembrar e-mail opcionalmente
        if (this.remember && this.email) localStorage.setItem('remember_email', this.email);
        else localStorage.removeItem('remember_email');
        this.$router.push('/');
      } catch (error) {
        this.error = error.response?.data?.message || 'Erro ao fazer login';
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    // Pré-popula e-mail se lembrado
    const remembered = localStorage.getItem('remember_email');
    if (remembered) { this.email = remembered; this.remember = true; }
  }
};

// Dashboard principal
const Dashboard = {
  template: `
    <div class="p-6 space-y-6">
      <!-- Resumos -->
      <section v-if="!isAdmin" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm text-gray-500">Olá{{ $root?.user?.name ? ', ' + $root.user.name.split(' ')[0] : '' }}!</p>
            <h1 class="text-3xl font-bold text-gray-900">Visão rápida dos seus alunos</h1>
            <p class="text-sm text-gray-600 mt-1">Use os atalhos para atualizar formulários e acompanhar pendências.</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <input
              v-model="filtros.busca"
              type="text"
              placeholder="Buscar aluno ou escola..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              v-if="filtros.busca"
              type="button"
              @click="limparBusca"
              class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Limpar
            </button>
            <button
              type="button"
              @click="debugDashboard"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              🔧 Debug
            </button>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Alunos ativos</p>
            <p class="mt-2 text-3xl font-semibold text-blue-900">{{ (professorResumo && professorResumo.total) || 0 }}</p>
            <p class="text-xs text-blue-700 mt-1">Somente alunos vinculados a você</p>
          </div>
          <div class="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <p class="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Média geral</p>
            <p class="mt-2 text-3xl font-semibold text-emerald-900">{{ (professorResumo && professorResumo.mediaGeral) || 0 }}%</p>
            <p class="text-xs text-emerald-700 mt-1">Progresso médio dos formulários</p>
          </div>
          <div class="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
            <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Formulários completos</p>
            <p class="mt-2 text-3xl font-semibold text-purple-900">{{ (professorResumo && professorResumo.concluidos) || 0 }}</p>
            <p class="text-xs text-purple-700 mt-1">Alunos com finalização acima de 90%</p>
          </div>
          <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pendências</p>
            <p class="mt-2 text-3xl font-semibold text-amber-900">{{ (professorResumo && professorResumo.pendentes) || 0 }}</p>
            <p class="text-xs text-amber-700 mt-1">Alunos que ainda precisam de atenção</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button type="button" @click="irPara('alunos')" class="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <i class="fas fa-users"></i>
            Gerenciar alunos
          </button>
          <button type="button" @click="abrirFormulario('entrevista')" class="flex items-center justify-center gap-2 rounded-xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm font-medium text-sky-700 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-500">
            <i class="fas fa-comments"></i>
            Registrar entrevista
          </button>
          <button type="button" @click="abrirFormulario('pdi')" class="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <i class="fas fa-clipboard-check"></i>
            Atualizar PDI
          </button>
          <button type="button" @click="abrirFormulario('pai')" class="flex items-center justify-center gap-2 rounded-xl border border-purple-100 bg-purple-50/80 px-4 py-3 text-sm font-medium text-purple-700 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <i class="fas fa-bullseye"></i>
            Revisar PAI
          </button>
        </div>
      </section>
      <section v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Painel administrativo</h1>
            <p class="text-sm text-gray-600 mt-1">Resumo do engajamento das equipes e dos formulários AEE.</p>
          </div>
          <div class="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
            <input
              v-model="filtros.busca"
              type="text"
              placeholder="Buscar aluno, escola ou professor..."
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
            <select
              v-model="filtros.professorId"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
            >
              <option value="">Todos os professores</option>
              <option v-for="prof in professores" :key="prof.id" :value="prof.id">{{ prof.name }}</option>
            </select>
            <button
              v-if="filtros.busca || filtros.professorId"
              type="button"
              @click="resetarFiltros"
              class="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              Limpar filtros
            </button>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-xl border border-purple-100 bg-purple-50/60 p-4">
            <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Alunos cadastrados</p>
            <p class="mt-2 text-3xl font-semibold text-purple-900">{{ (adminResumo && adminResumo.totalAlunos) || 0 }}</p>
            <p class="text-xs text-purple-700 mt-1">Distribuídos por toda a rede</p>
          </div>
          <div class="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
            <p class="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Professores ativos</p>
            <p class="mt-2 text-3xl font-semibold text-indigo-900">{{ (adminResumo && adminResumo.totalProfessores) || 0 }}</p>
            <p class="text-xs text-indigo-700 mt-1">Usuários com perfil professor</p>
          </div>
          <div class="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Escolas atendidas</p>
            <p class="mt-2 text-3xl font-semibold text-blue-900">{{ (adminResumo && adminResumo.totalEscolas) || 0 }}</p>
            <p class="text-xs text-blue-700 mt-1">Com alunos cadastrados</p>
          </div>
          <div class="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p class="text-xs font-semibold text-amber-600 uppercase tracking-wide">Pendências críticas</p>
            <p class="mt-2 text-3xl font-semibold text-amber-900">{{ (adminResumo && adminResumo.pendentes) || 0 }}</p>
            <p class="text-xs text-amber-700 mt-1">Alunos com média abaixo de 80%</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button type="button" @click="irPara('usuarios')" class="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 text-sm font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <span><i class="fas fa-user-shield mr-2"></i>Gerenciar usuários</span>
            <i class="fas fa-arrow-right"></i>
          </button>
          <button type="button" @click="irPara('supervisao')" class="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <span><i class="fas fa-chalkboard-teacher mr-2"></i>Supervisão de professores</span>
            <i class="fas fa-arrow-right"></i>
          </button>
          <button type="button" @click="irPara('relatorios')" class="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm font-medium text-emerald-700 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <span><i class="fas fa-chart-bar mr-2"></i>Relatórios consolidados</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </section>

      <!-- Gráfico de Estatísticas -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ isAdmin ? 'Andamento dos formulários (rede)' : 'Progresso dos meus formulários' }}</h2>
            <p class="text-sm text-gray-500">{{ isAdmin ? 'Média considerando o filtro atual' : 'Média dos alunos vinculados a você' }}</p>
          </div>
          <span class="text-sm text-gray-400">Atualizado automaticamente</span>
        </div>
        <div :id="chartContainerId" class="w-full h-[320px]"></div>
      </div>

      <div v-if="!isAdmin" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Pendências prioritárias</h2>
          <button type="button" @click="irPara('alunos')" class="text-sm text-blue-600 hover:text-blue-700">Ver todos</button>
        </div>
        <div v-if="professorPendencias && professorPendencias.length" class="space-y-4">
          <div v-for="aluno in professorPendencias" :key="'pendencia-'+aluno.id" class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ aluno.name || 'Aluno sem nome' }}</p>
                <p class="text-xs text-gray-500">{{ aluno.school_name || 'Escola não informada' }}</p>
              </div>
              <span class="text-sm font-semibold" :class="getPercentColor(aluno.__mediaCalculada)">{{ aluno.__mediaCalculada }}%</span>
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
              <span>Entrevista: {{ aluno.entrevista_percent || 0 }}%</span>
              <span>PDI: {{ aluno.pdi_percent || 0 }}%</span>
              <span>PAI: {{ aluno.pai_percent || 0 }}%</span>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button type="button" @click="abrirFormulario('entrevista', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Atualizar entrevista
              </button>
              <button type="button" @click="abrirFormulario('pdi', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                Revisar PDI
              </button>
              <button type="button" @click="abrirFormulario('pai', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
                Ajustar PAI
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
          Nenhuma pendência crítica encontrada. Continue acompanhando os formulários!
        </div>
      </div>

      <div v-if="isAdmin" class="grid gap-6 lg:grid-cols-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Professores e engajamento</h2>
            <span class="text-sm text-gray-500">Ordenado por número de alunos</span>
          </div>
          <div v-if="professoresResumo && professoresResumo.length" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 text-sm">
              <thead class="bg-gray-50">
                <tr class="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th class="px-4 py-3">Professor</th>
                  <th class="px-4 py-3">Alunos</th>
                  <th class="px-4 py-3">Média</th>
                  <th class="px-4 py-3">Completos</th>
                  <th class="px-4 py-3">Pendências críticas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="prof in professoresResumo" :key="'prof-resumo-'+prof.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">{{ prof.nome }}</div>
                    <div class="text-xs text-gray-500">{{ prof.email || 'Sem e-mail' }}</div>
                  </td>
                  <td class="px-4 py-3 text-gray-700 font-semibold">{{ prof.totalAlunos }}</td>
                  <td class="px-4 py-3 font-semibold" :class="getPercentColor(prof.media)">{{ prof.media }}%</td>
                  <td class="px-4 py-3 text-emerald-600 font-semibold">{{ prof.concluidos }}</td>
                  <td class="px-4 py-3 text-amber-600 font-semibold">{{ prof.criticos }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
            Nenhum professor encontrado para o filtro atual.
          </div>
        </div>
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold text-gray-900">Alunos com menor avanço</h2>
            <button type="button" @click="irPara('alunos')" class="text-sm text-purple-600 hover:text-purple-700">Ir para alunos</button>
          </div>
          <div v-if="alunosPendentesAdmin && alunosPendentesAdmin.length" class="space-y-4">
            <div v-for="aluno in alunosPendentesAdmin" :key="'admin-pendencia-'+aluno.id" class="border border-gray-200 rounded-xl p-4">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold text-gray-900">{{ aluno.name || 'Aluno sem nome' }}</p>
                  <p class="text-xs text-gray-500">
                    {{ aluno.school_name || 'Escola não informada' }}
                    <span v-if="aluno.professor_nome"> - {{ aluno.professor_nome }}</span>
                  </p>
                </div>
                <span class="text-sm font-semibold" :class="getPercentColor(aluno.__mediaCalculada)">{{ aluno.__mediaCalculada }}%</span>
              </div>
              <div class="mt-3 grid grid-cols-3 gap-2 text-xs text-gray-600">
                <span>Entrevista: {{ aluno.entrevista_percent || 0 }}%</span>
                <span>PDI: {{ aluno.pdi_percent || 0 }}%</span>
                <span>PAI: {{ aluno.pai_percent || 0 }}%</span>
              </div>
              <div class="mt-4 flex flex-wrap gap-2">
                <button type="button" @click="abrirFormulario('entrevista', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Acompanhar entrevista
                </button>
                <button type="button" @click="abrirFormulario('pdi', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  Revisar PDI
                </button>
                <button type="button" @click="abrirFormulario('pai', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
                  Ajustar PAI
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-sm text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 text-center">
            Nenhuma pendência crítica encontrada para o filtro atual.
          </div>
        </div>
      </div>

      </div>

      <!-- Grid de Cards de Alunos -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 class="text-xl font-bold mb-6 text-gray-800">
          {{ isAdmin ? 'Alunos (visão completa)' : 'Meus alunos' }}
          <span
            v-if="isAdmin && alunosFiltrados && alunosFiltrados.length"
            class="text-sm font-normal text-gray-500"
          >
            ({{ alunosFiltrados.length }} registro{{ alunosFiltrados.length === 1 ? '' : 's' }})
          </span>
          <span
            v-else-if="!isAdmin && alunosVisiveis && alunosVisiveis.length"
            class="text-sm font-normal text-gray-500"
          >
            ({{ alunosVisiveis.length }} exibindo{{ alunos && alunos.length > alunosVisiveis.length ? ' de ' + alunos.length : '' }})
          </span>
        </h2>

        <div v-if="loading" class="text-center py-12">
          <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Carregando alunos...</p>
        </div>

        <div
          v-else-if="isAdmin ? (!alunosFiltrados || !alunosFiltrados.length) : (!alunosVisiveis || !alunosVisiveis.length)"
          class="text-center py-12 text-gray-500"
        >
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <p class="text-lg font-medium">Nenhum aluno encontrado</p>
          <p class="text-sm mt-1">{{ filtros.busca ? 'Tente ajustar sua busca' : 'Comece cadastrando novos alunos' }}</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="aluno in (isAdmin ? alunosFiltrados : alunosVisiveis)"
            :key="aluno.id"
            class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div :class="['w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md', isAdmin ? 'bg-gradient-to-br from-purple-400 to-purple-600' : 'bg-gradient-to-br from-blue-400 to-blue-600']">
                {{ getInitials(aluno.name || '') }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 truncate text-base">{{ aluno.name || 'Sem nome' }}</h3>
                <p class="text-xs text-gray-500 truncate">{{ aluno.school_name || 'Escola não informada' }}</p>
                <p v-if="isAdmin && aluno.professor_nome" class="text-xs text-purple-600 truncate mt-0.5">Prof: {{ aluno.professor_nome }}</p>
              </div>
            </div>
            <div class="space-y-3">
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">Entrevista</span>
                  <span class="font-bold" :class="getPercentColor(aluno.entrevista_percent)">{{ aluno.entrevista_percent || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-500" :class="isAdmin ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gradient-to-r from-indigo-400 to-indigo-600'" :style="{width: (aluno.entrevista_percent || 0) + '%'}"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">PDI</span>
                  <span class="font-bold" :class="getPercentColor(aluno.pdi_percent)">{{ aluno.pdi_percent || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-500" :class="isAdmin ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'" :style="{width: (aluno.pdi_percent || 0) + '%'}"></div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">PAI</span>
                  <span class="font-bold" :class="getPercentColor(aluno.pai_percent)">{{ aluno.pai_percent || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-400 to-purple-600" :style="{width: (aluno.pai_percent || 0) + '%'}"></div>
                </div>
              </div>
            </div>
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Média Geral</span>
                <span class="text-lg font-bold" :class="getPercentColor(aluno.media_percent)">{{ aluno.media_percent || 0 }}%</span>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <button type="button" @click="abrirFormulario('entrevista', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Entrevista
              </button>
              <button type="button" @click="abrirFormulario('pdi', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                PDI
              </button>
              <button type="button" @click="abrirFormulario('pai', aluno.id)" class="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500">
                PAI
              </button>
            </div>
          </div>
        </div>
        <div v-if="!isAdmin && alunos && alunosVisiveis && alunos.length > alunosVisiveis.length" class="mt-6 text-center text-sm text-gray-500">
          Refine sua busca ou acesse a listagem completa para ver todos os alunos.
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      alunos: [],
      professores: [],
      filtros: { busca: '', professorId: '' },
      loading: false
    }
  },
  computed: {
    isAdmin() {
      return this.$root && this.$root.user && this.$root.user.role === 'admin';
    },
    chartContainerId() {
      return this.isAdmin ? 'chart-container-admin' : 'chart-container-prof';
    },
    alunosFiltrados() {
      if (!Array.isArray(this.alunos)) {
        return [];
      }

      let resultado = [...this.alunos];

      if (this.isAdmin && this.filtros.professorId) {
        resultado = resultado.filter(a => String(a.created_by_teacher_id) === String(this.filtros.professorId));
      }

      const busca = (this.filtros.busca || '').toLowerCase().trim();
      if (busca) {
        
        resultado = resultado.filter(a => {
          const nome = (a.name || '').toLowerCase();
          const escola = (a.school_name || '').toLowerCase();
          const professor = (a.professor_nome || '').toLowerCase();
          
          const match = this.isAdmin
            ? nome.includes(busca) || escola.includes(busca) || professor.includes(busca)
            : nome.includes(busca) || escola.includes(busca);
          
          if (match) {
          }
          
          return match;
        });
        
      }

      return resultado;
    },
    alunosVisiveis() {
      const filtrados = Array.isArray(this.alunosFiltrados) ? this.alunosFiltrados : [];
      return this.isAdmin ? filtrados : filtrados.slice(0, 8);
    },
    professorResumo() {
      const total = Array.isArray(this.alunos) ? this.alunos.length : 0;
      if (!total) {
        return { total: 0, mediaGeral: 0, concluidos: 0, pendentes: 0 };
      }

      let concluidos = 0;
      let soma = 0;
      this.alunos.forEach(aluno => {
        const entrevista = aluno?.entrevista_percent || 0;
        const pdi = aluno?.pdi_percent || 0;
        const pai = aluno?.pai_percent || 0;
        if (entrevista >= 90 && pdi >= 90 && pai >= 90) concluidos++;
        soma += Math.round((entrevista + pdi + pai) / 3);
      });

      return {
        total,
        mediaGeral: Math.round(soma / total) || 0,
        concluidos,
        pendentes: Math.max(total - concluidos, 0)
      };
    },
    professorPendencias() {
      const filtrados = Array.isArray(this.alunosFiltrados) ? this.alunosFiltrados : [];
      if (!filtrados.length) return [];
      return filtrados
        .map(aluno => ({
          ...aluno,
          __mediaCalculada: this.calcularMediaAluno(aluno)
        }))
        .filter(aluno => aluno.__mediaCalculada < 80)
        .sort((a, b) => a.__mediaCalculada - b.__mediaCalculada)
        .slice(0, 5);
    },
    adminResumo() {
      const alunos = Array.isArray(this.alunos) ? this.alunos : [];
      const professores = Array.isArray(this.professores) ? this.professores : [];
      const totalAlunos = alunos.length;
      const totalProfessores = professores.length;
      const escolas = new Set();
      let pendentes = 0;

      alunos.forEach(aluno => {
        if (aluno && aluno.school_id) escolas.add(aluno.school_id);
        const media = this.calcularMediaAluno(aluno);
        if (media < 80) pendentes++;
      });

      return {
        totalAlunos,
        totalProfessores,
        totalEscolas: escolas.size,
        pendentes
      };
    },
    professoresResumo() {
      if (!this.isAdmin) return [];
      const professores = Array.isArray(this.professores) ? this.professores : [];
      const alunos = Array.isArray(this.alunos) ? this.alunos : [];
      const map = new Map();

      professores.forEach(prof => {
        map.set(prof.id, {
          id: prof.id,
          nome: prof.name,
          email: prof.email,
          totalAlunos: 0,
          somaMedia: 0,
          concluidos: 0,
          criticos: 0
        });
      });

      alunos.forEach(aluno => {
        const profId = aluno?.created_by_teacher_id;
        if (!profId) return;
        if (!map.has(profId)) {
          map.set(profId, {
            id: profId,
            nome: aluno.professor_nome || 'Professor n?o identificado',
            email: '',
            totalAlunos: 0,
            somaMedia: 0,
            concluidos: 0,
            criticos: 0
          });
        }
        const entry = map.get(profId);
        const entrevista = aluno?.entrevista_percent || 0;
        const pdi = aluno?.pdi_percent || 0;
        const pai = aluno?.pai_percent || 0;
        const media = this.calcularMediaAluno(aluno);
        entry.totalAlunos += 1;
        entry.somaMedia += media;
        if (entrevista >= 90 && pdi >= 90 && pai >= 90) entry.concluidos += 1;
        if (media < 80) entry.criticos += 1;
      });

      return Array.from(map.values()).map(entry => ({
        ...entry,
        media: entry.totalAlunos ? Math.round(entry.somaMedia / entry.totalAlunos) : 0
      })).sort((a, b) => b.totalAlunos - a.totalAlunos);
    },
    alunosPendentesAdmin() {
      if (!this.isAdmin) return [];
      const filtrados = Array.isArray(this.alunosFiltrados) ? this.alunosFiltrados : [];
      return filtrados
        .map(aluno => ({
          ...aluno,
          __mediaCalculada: this.calcularMediaAluno(aluno)
        }))
        .filter(aluno => aluno.__mediaCalculada < 80)
        .sort((a, b) => a.__mediaCalculada - b.__mediaCalculada)
        .slice(0, 8);
    }
  },
  async mounted() {
    
    // Esperar o user estar disponível (max 5 segundos)
    let attempts = 0;
    while (!this.$root?.user && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!this.$root?.user) {
      console.error('❌ [Dashboard] User não carregado após 5 segundos!');
      this.loading = false;
      return;
    }
    
    
    try {
      await this.loadData();
      this.renderChart();
    } catch (error) {
      console.error('❌ [Dashboard] Erro no mounted:', error);
      this.loading = false;
    }
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        const isAdminNow = this.$root?.user?.role === 'admin';

        if (isAdminNow) {
          try {
            const profRes = await api.get('/users');
            this.professores = (profRes.data?.data?.rows || profRes.data?.data || []).filter(u => u.role !== 'admin');
          } catch (error) {
            console.error('❌ [Dashboard] Erro ao carregar professores:', error);
            this.professores = [];
          }
        } else {
          this.professores = [];
        }

        const params = (!isAdminNow && this.$root?.user) ? { teacher_id: this.$root.user.id } : {};
        const alunosRes = await api.get('/students', { params });

        let alunosData = [];
        if (alunosRes.data?.data?.rows) {
          alunosData = alunosRes.data.data.rows;
        } else if (Array.isArray(alunosRes.data?.data)) {
          alunosData = alunosRes.data.data;
        } else if (Array.isArray(alunosRes.data)) {
          alunosData = alunosRes.data;
        }

        this.alunos = alunosData.map(aluno => {
          let professorNome = aluno.professor_nome || '';
          if (isAdminNow && !professorNome && aluno.created_by_teacher_id && this.professores?.length) {
            const prof = this.professores.find(p => p.id === aluno.created_by_teacher_id);
            professorNome = prof ? prof.name : '';
          }
          return {
            ...aluno,
            professor_nome: professorNome,
            entrevista_percent: aluno.entrevista_percent || 0,
            pdi_percent: aluno.pdi_percent || 0,
            pai_percent: aluno.pai_percent || 0,
            media_percent: aluno.media_percent || 0
          };
        });

        this.loading = false;
        await this.$nextTick();
        this.carregarPercentuais();
      } catch (error) {
        console.error('❌ [Dashboard] Erro ao carregar dados do dashboard:', error);
        console.error('❌ [Dashboard] Detalhes:', error.response || error.message);
        this.loading = false;
      }
    },
    async carregarPercentuais() {
      for (const aluno of this.alunos) {
        try {
          const percentuais = await this.calcularPercentuais(aluno.id);
          aluno.entrevista_percent = percentuais.entrevista;
          aluno.pdi_percent = percentuais.pdi;
          aluno.pai_percent = percentuais.pai;
          aluno.media_percent = Math.round((percentuais.entrevista + percentuais.pdi + percentuais.pai) / 3);
        } catch (error) {
          console.error(`Erro ao calcular percentuais do aluno ${aluno.name}:`, error);
        }
      }
      await this.renderChart();
    },
    async calcularPercentuais(studentId) {
      const percentuais = { entrevista: 0, pdi: 0, pai: 0 };

      try {
        try {
          const entrevistaRes = await api.get('/entrevistas-responsavel/list', { params: { student_id: studentId } });
          const entrevistas = entrevistaRes.data?.data?.rows || entrevistaRes.data?.data || [];
          if (entrevistas.length > 0) {
            const formData = typeof entrevistas[0].form_data === 'string'
              ? JSON.parse(entrevistas[0].form_data)
              : entrevistas[0].form_data;
            percentuais.entrevista = this.calcularPreenchimentoJSON(formData);
          }
        } catch (_) {}

        try {
          const pdiRes = await api.get('/pdi/list', { params: { student_id: studentId } });
          const pdis = pdiRes.data?.data?.rows || pdiRes.data?.data || [];
          if (pdis.length > 0) {
            const formData = typeof pdis[0].form_data === 'string'
              ? JSON.parse(pdis[0].form_data)
              : pdis[0].form_data;
            percentuais.pdi = this.calcularPreenchimentoJSON(formData);
          }
        } catch (_) {}

        try {
          const paiRes = await api.get('/plano-atendimento/list', { params: { student_id: studentId } });
          const pais = paiRes.data?.data?.rows || paiRes.data?.data || [];
          if (pais.length > 0) {
            const formData = typeof pais[0].form_data === 'string'
              ? JSON.parse(pais[0].form_data)
              : pais[0].form_data;
            percentuais.pai = this.calcularPreenchimentoJSON(formData);
          }
        } catch (_) {}
      } catch (error) {
        console.error(`Erro ao calcular percentuais para aluno ${studentId}:`, error);
      }

      return percentuais;
    },
    calcularPreenchimentoJSON(formData) {
      if (!formData || typeof formData !== 'object') return 0;

      let total = 0;
      let preenchidos = 0;

      for (const key in formData) {
        if (['id', 'student_id', 'created_at', 'updated_at', 'status', 'created_by_teacher_id'].includes(key)) {
          continue;
        }

        total++;
        const valor = formData[key];

        if (valor !== null && valor !== undefined && valor !== '') {
          if (Array.isArray(valor) && valor.length === 0) {
            continue;
          }
          preenchidos++;
        }
      }

      return total > 0 ? Math.round((preenchidos / total) * 100) : 0;
    },
    calcularMediaAluno(aluno) {
      if (!aluno) return 0;
      if (aluno.media_percent) return aluno.media_percent;
      const entrevista = aluno?.entrevista_percent || 0;
      const pdi = aluno?.pdi_percent || 0;
      const pai = aluno?.pai_percent || 0;
      return Math.round((entrevista + pdi + pai) / 3);
    },
    getInitials(name) {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    getPercentColor(percent) {
      const p = percent || 0;
      if (p >= 70) return 'text-green-600';
      if (p >= 40) return 'text-yellow-600';
      return 'text-red-600';
    },
    async renderChart() {
      await this.$nextTick();
      const container = document.getElementById(this.chartContainerId);
      if (!container) return;

      const alunosFiltrados = Array.isArray(this.alunosFiltrados) ? this.alunosFiltrados : [];
      const alunos = Array.isArray(this.alunos) ? this.alunos : [];
      const dados = alunosFiltrados.length ? alunosFiltrados : alunos;

      if (!dados || !dados.length) {
        container.innerHTML = '<div class="text-center text-gray-500 py-12">Nenhum dado dispon?vel para exibir no gr?fico</div>';
        return;
      }

      const total = dados.length;
      const mediaEntrevista = Math.round(dados.reduce((sum, a) => sum + (a.entrevista_percent || 0), 0) / total);
      const mediaPDI = Math.round(dados.reduce((sum, a) => sum + (a.pdi_percent || 0), 0) / total);
      const mediaPAI = Math.round(dados.reduce((sum, a) => sum + (a.pai_percent || 0), 0) / total);

      Highcharts.chart(this.chartContainerId, {
        chart: { type: 'column' },
        title: { text: this.isAdmin ? 'M?dia geral dos formul?rios' : 'M?dia dos meus formul?rios' },
        xAxis: { categories: ['Entrevista', 'PDI', 'PAI'], crosshair: true },
        yAxis: { min: 0, max: 100, title: { text: 'Percentual de conclus?o (%)' } },
        tooltip: { valueSuffix: '%' },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: { enabled: true, format: '{y}%' }
          }
        },
        series: [{
          name: this.isAdmin ? 'Rede' : 'Minhas turmas',
          data: [mediaEntrevista, mediaPDI, mediaPAI],
          colorByPoint: true,
          colors: this.isAdmin ? ['#7c3aed', '#2563eb', '#0f766e'] : ['#3b82f6', '#10b981', '#a855f7']
        }],
        credits: { enabled: false }
      });
    },
    limparBusca() {
      this.filtros.busca = '';
    },
    resetarFiltros() {
      this.filtros.busca = '';
      this.filtros.professorId = '';
    },
    debugDashboard() {
      
      alert('Debug info logged to console. Press F12 to see.');
    },
    irPara(segment) {
      if (!segment) return;
      this.$router.push(`/${segment}`);
    },
    abrirFormulario(tipo, alunoId = null) {
      const rotas = {
        entrevista: '/entrevista-responsavel',
        pdi: '/pdi',
        pai: '/plano-atendimento'
      };
      const base = rotas[tipo];
      if (!base) return;
      const url = alunoId ? `${base}?student_id=${alunoId}` : base;
      this.$router.push(url);
    }
  },
  watch: {
    async alunosFiltrados() {
      await this.renderChart();
    },
    async isAdmin() {
      await this.renderChart();
    }
  },
  computed:{
    atividadesFiltradas(){
      const now = new Date();
      let de=null, ate=null;
      if(this.filtros.periodo>0){ de=new Date(now); de.setDate(now.getDate()-this.filtros.periodo); }
      if(this.filtros.periodo===0){ de=this.filtros.de?new Date(this.filtros.de):null; ate=this.filtros.ate?new Date(this.filtros.ate):null; if(ate){ ate.setHours(23,59,59,999);} }
      const q=(this.filtros.q||'').toLowerCase();
      const tipo=this.filtros.tipo||'';
      let arr=this.atividadesRaw.filter(a=>{
        const dt=new Date(a.created_at);
        const okDe=!de || dt>=de;
        const okAte=!ate || dt<=ate;
        const okQ=!q || (a.descricao||'').toLowerCase().includes(q);
        const okTipo=!tipo || a.tipo===tipo;
        return okDe && okAte && okQ && okTipo;
      });
      switch(this.filtros.sort){
        case 'data_asc': arr.sort((x,y)=>new Date(x.created_at)-new Date(y.created_at)); break;
        case 'tipo_asc': arr.sort((x,y)=>String(x.tipo).localeCompare(String(y.tipo))); break;
        case 'tipo_desc': arr.sort((x,y)=>String(y.tipo).localeCompare(String(x.tipo))); break;
        default: arr.sort((x,y)=>new Date(y.created_at)-new Date(x.created_at));
      }
      return arr;
    },
    totalPaginas(){ return Math.max(1, Math.ceil(this.atividadesFiltradas.length / this.paginacao.perPage)); },
    atividadesPaginadas(){
      const start=(this.paginacao.page-1)*this.paginacao.perPage; return this.atividadesFiltradas.slice(start,start+this.paginacao.perPage);
    }
  }
};


// Relatórios e IA (análise do aluno)
const Relatorios = {
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Relatórios do Sistema</h1>
        </div>
      </div>

      <!-- Seleção de Aluno e Tipo -->
      <div class="bg-white shadow rounded p-6 space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Selecionar Aluno</label>
            <select v-model="alunoId" @change="carregarDadosAluno"
                    class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              <option value="">Selecione um aluno</option>
              <option v-for="s in alunos" :key="s.id" :value="s.id">{{ s.name }} - {{ s.class || 'Série não informada' }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Relatório</label>
            <select v-model="tipoRelatorio" 
                    class="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              <option value="geral">Relatório Geral do Aluno</option>
              <option value="atendimentos">Histórico de Atendimentos</option>
              <option value="formularios">Formulários AEE</option>
              <option value="evolucao">Relatório de Evolução</option>
            </select>
          </div>
        </div>

        <div class="flex flex-wrap gap-3" v-if="alunoId">
          <button @click="gerarRelatorio" :disabled="carregandoRelatorio"
                  class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50">
            <span v-if="carregandoRelatorio" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Gerando...
            </span>
            <span v-else>📊 Gerar Relatório</span>
          </button>
          <button @click="exportarPDF" :disabled="!dadosRelatorio || carregandoPDF"
                  class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50">
            <span v-if="carregandoPDF" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Exportando...
            </span>
            <span v-else>📄 Exportar PDF</span>
          </button>
          <button @click="analiseIA" :disabled="!dadosRelatorio || carregandoIA"
                  class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors disabled:opacity-50">
            <span v-if="carregandoIA" class="inline-flex items-center">
              <div class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              Analisando...
            </span>
            <span v-else>🤖 Análise com IA</span>
          </button>
        </div>
      </div>

      <!-- Resultado do Relatório -->
      <div v-if="dadosRelatorio" class="bg-white shadow rounded overflow-hidden">
        <div class="bg-gray-50 px-6 py-4 border-b">
          <h2 class="text-lg font-semibold text-gray-900">{{ tituloRelatorio }}</h2>
          <p class="text-sm text-gray-600">{{ descricaoRelatorio }}</p>
        </div>
        <div class="p-6 space-y-6">
          <div class="grid grid-cols-1 md-grid-cols-2 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <h3 class="font-medium text-gray-900 border-b pb-2">Informações Pessoais</h3>
              <div class="space-y-2 text-sm">
                <p><strong>Nome:</strong> {{ dadosRelatorio.aluno?.name || 'Não informado' }}</p>
                <p><strong>Data de Nascimento:</strong> {{ formatarData(dadosRelatorio.aluno?.birthdate) }}</p>
                <p><strong>Escola:</strong> {{ dadosRelatorio.aluno?.school || 'Não informada' }}</p>
                <p><strong>Série:</strong> {{ dadosRelatorio.aluno?.class || 'Não informada' }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <h3 class="font-medium text-gray-900 border-b pb-2">Estatísticas</h3>
              <div class="space-y-2 text-sm">
                <p><strong>Total de atendimentos:</strong> {{ dadosRelatorio.estatisticas?.total_atendimentos || 0 }}</p>
                <p><strong>Total de formulários:</strong> {{ dadosRelatorio.estatisticas?.total_formularios || 0 }}</p>
                <p><strong>PDIs:</strong> {{ dadosRelatorio.estatisticas?.total_pdis || 0 }} — <strong>PAIs:</strong> {{ dadosRelatorio.estatisticas?.total_pais || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- Histórico de Atendimentos -->
          <div v-if="tipoRelatorio === 'atendimentos'" class="space-y-4">
            <div v-if="dadosRelatorio.atendimentos && dadosRelatorio.atendimentos.length > 0">
              <div v-for="atendimento in dadosRelatorio.atendimentos" :key="atendimento.id" class="border rounded-lg p-4 hover:bg-gray-50">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-medium text-gray-900">{{ formatarData(atendimento.data_atendimento) }}</h4>
                  <span class="text-xs text-gray-500">ID: {{ atendimento.id }}</span>
                </div>
                <p class="text-sm text-gray-700 mb-2"><strong>Descrição:</strong> {{ atendimento.descricao || 'Não informada' }}</p>
                <p class="text-sm text-gray-700 mb-2"><strong>Objetivos:</strong> {{ atendimento.objetivos || 'Não informados' }}</p>
                <p class="text-sm text-gray-700"><strong>Observações:</strong> {{ atendimento.observacoes || 'Nenhuma observação' }}</p>
              </div>
            </div>
            <div v-else class="text-center text-gray-500 py-8">Nenhum atendimento registrado para este aluno</div>
          </div>

          <!-- Formulários AEE -->
          <div v-if="tipoRelatorio === 'formularios' || tipoRelatorio === 'geral'" class="space-y-6">
            <!-- Anamneses/Entrevistas -->
            <div class="bg-white border rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <i class="fas fa-clipboard-list text-blue-600 mr-2"></i>
                Anamneses e Entrevistas
              </h3>
              <div v-if="dadosRelatorio.anamneses && dadosRelatorio.anamneses.length > 0">
                <div class="space-y-4">
                  <div v-for="anamnese in dadosRelatorio.anamneses" :key="anamnese.id" class="border rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-medium text-gray-900">{{ anamnese.tipo === 'entrevista_responsavel' ? 'Entrevista com Responsável' : 'Anamnese' }}</h4>
                      <div class="text-xs text-gray-500">
                        {{ formatarData(anamnese.created_at) }}
                        <span v-if="anamnese.tipo === 'entrevista_responsavel'" class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Entrevista</span>
                      </div>
                    </div>
                    <div v-if="anamnese.tipo !== 'entrevista_responsavel'" class="space-y-2">
                      <div v-for="(value, key) in anamnese.answers" :key="key" class="text-sm">
                        <span class="font-medium text-gray-700">{{ key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}:</span>
                        <span class="text-gray-600 ml-1">{{ value }}</span>
                      </div>
                    </div>
                    <div v-else class="space-y-3">
                      <!-- Seção 1: Dados Básicos -->
                      <div class="bg-blue-50 rounded-lg p-3">
                        <h5 class="text-xs font-semibold text-blue-900 mb-2 uppercase">Dados Básicos</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div v-if="anamnese.answers.escola"><span class="font-medium text-gray-700">Escola:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.escola }}</span></div>
                          <div v-if="anamnese.answers.serie"><span class="font-medium text-gray-700">Série/Ano:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.serie }}</span></div>
                          <div v-if="anamnese.answers.turno"><span class="font-medium text-gray-700">Turno:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.turno }}</span></div>
                        </div>
                      </div>
                      
                      <!-- Seção 2: Responsável -->
                      <div class="bg-green-50 rounded-lg p-3">
                        <h5 class="text-xs font-semibold text-green-900 mb-2 uppercase">Dados do Responsável</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div v-if="anamnese.answers.nome_responsavel"><span class="font-medium text-gray-700">Nome:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.nome_responsavel }}</span></div>
                          <div v-if="anamnese.answers.parentesco"><span class="font-medium text-gray-700">Parentesco:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.parentesco }}</span></div>
                          <div v-if="anamnese.answers.telefone"><span class="font-medium text-gray-700">Telefone:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.telefone }}</span></div>
                          <div v-if="anamnese.answers.email"><span class="font-medium text-gray-700">Email:</span> <span class="text-gray-600 ml-1">{{ anamnese.answers.email }}</span></div>
                        </div>
                      </div>
                      
                      <!-- Seção 3: Histórico Médico -->
                      <div v-if="anamnese.answers.diagnostico || anamnese.answers.medicamentos || anamnese.answers.profissionais" class="bg-red-50 rounded-lg p-3">
                        <h5 class="text-xs font-semibold text-red-900 mb-2 uppercase">Histórico Médico</h5>
                        <div class="space-y-2 text-sm">
                          <div v-if="anamnese.answers.diagnostico">
                            <span class="font-medium text-gray-700">Diagnóstico:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.diagnostico }}</p>
                          </div>
                          <div v-if="anamnese.answers.medicamentos">
                            <span class="font-medium text-gray-700">Medicamentos:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.medicamentos }}</p>
                          </div>
                          <div v-if="anamnese.answers.profissionais">
                            <span class="font-medium text-gray-700">Profissionais que acompanham:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.profissionais }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Seção 4: Desenvolvimento e Comportamento -->
                      <div v-if="anamnese.answers.comportamento_casa || anamnese.answers.dificuldades || anamnese.answers.habilidades" class="bg-purple-50 rounded-lg p-3">
                        <h5 class="text-xs font-semibold text-purple-900 mb-2 uppercase">Desenvolvimento e Comportamento</h5>
                        <div class="space-y-2 text-sm">
                          <div v-if="anamnese.answers.comportamento_casa">
                            <span class="font-medium text-gray-700">Comportamento em casa:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.comportamento_casa }}</p>
                          </div>
                          <div v-if="anamnese.answers.dificuldades">
                            <span class="font-medium text-gray-700">Dificuldades observadas:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.dificuldades }}</p>
                          </div>
                          <div v-if="anamnese.answers.habilidades">
                            <span class="font-medium text-gray-700">Habilidades e potencialidades:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.habilidades }}</p>
                          </div>
                        </div>
                      </div>
                      
                      <!-- Seção 5: Expectativas -->
                      <div v-if="anamnese.answers.expectativas || anamnese.answers.informacoes_adicionais" class="bg-yellow-50 rounded-lg p-3">
                        <h5 class="text-xs font-semibold text-yellow-900 mb-2 uppercase">Expectativas e Informações Adicionais</h5>
                        <div class="space-y-2 text-sm">
                          <div v-if="anamnese.answers.expectativas">
                            <span class="font-medium text-gray-700">Expectativas:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.expectativas }}</p>
                          </div>
                          <div v-if="anamnese.answers.informacoes_adicionais">
                            <span class="font-medium text-gray-700">Informações adicionais:</span>
                            <p class="text-gray-600 mt-1">{{ anamnese.answers.informacoes_adicionais }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 py-8"><i class="fas fa-clipboard-list text-3xl mb-2"></i><p>Nenhuma anamnese ou entrevista registrada para este aluno</p></div>
            </div>

            <!-- PDIs -->
            <div class="bg-white border rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"><i class="fas fa-tasks text-green-600 mr-2"></i>Planos de Desenvolvimento Individual (PDIs)</h3>
              <div v-if="dadosRelatorio.pdis && dadosRelatorio.pdis.length > 0">
                <div class="space-y-4">
                  <div v-for="pdi in dadosRelatorio.pdis" :key="pdi.id" class="border rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-medium text-gray-900">PDI #{{ pdi.id }}</h4>
                      <div class="text-xs"><span class="px-2 py-1 rounded-full text-xs" :class="pdi.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">{{ pdi.status }}</span></div>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div v-if="pdi.objectives"><span class="font-medium text-gray-700">Objetivos:</span><p class="text-gray-600 mt-1">{{ pdi.objectives }}</p></div>
                      <div v-if="pdi.strategies"><span class="font-medium text-gray-700">Estratégias:</span><p class="text-gray-600 mt-1">{{ pdi.strategies }}</p></div>
                      <div class="grid grid-cols-2 gap-4 mt-3">
                        <div v-if="pdi.start_date"><span class="font-medium text-gray-700">Data Início:</span><span class="text-gray-600 ml-1">{{ formatarData(pdi.start_date) }}</span></div>
                        <div v-if="pdi.end_date"><span class="font-medium text-gray-700">Data Fim:</span><span class="text-gray-600 ml-1">{{ formatarData(pdi.end_date) }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 py-8"><i class="fas a-tasks text-3xl mb-2"></i><p>Nenhum PDI registrado para este aluno</p></div>
            </div>

            <!-- PAIs -->
            <div class="bg-white border rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"><i class="fas fa-file-alt text-purple-600 mr-2"></i>Planos de Atendimento Individualizados (PAIs)</h3>
              <div v-if="dadosRelatorio.pais && dadosRelatorio.pais.length > 0">
                <div class="space-y-4">
                  <div v-for="pai in dadosRelatorio.pais" :key="pai.id" class="border rounded-lg p-4 hover:bg-gray-50">
                    <div class="flex justify-between items-start mb-3">
                      <h4 class="font-medium text-gray-900">PAI #{{ pai.id }}</h4>
                      <div class="text-xs"><span class="px-2 py-1 rounded-full text-xs" :class="pai.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">{{ pai.status }}</span></div>
                    </div>
                    <div class="space-y-2 text-sm">
                      <div v-if="pai.objectives"><span class="font-medium text-gray-700">Objetivos:</span><p class="text-gray-600 mt-1">{{ pai.objectives }}</p></div>
                      <div v-if="pai.strategies"><span class="font-medium text-gray-700">Estratégias:</span><p class="text-gray-600 mt-1">{{ pai.strategies }}</p></div>
                      <div class="grid grid-cols-2 gap-4 mt-3">
                        <div v-if="pai.start_date"><span class="font-medium text-gray-700">Data Início:</span><span class="text-gray-600 ml-1">{{ formatarData(pai.start_date) }}</span></div>
                        <div v-if="pai.end_date"><span class="font-medium text-gray-700">Data Fim:</span><span class="text-gray-600 ml-1">{{ formatarData(pai.end_date) }}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="text-center text-gray-500 py-8"><i class="fas fa-file-alt text-3xl mb-2"></i><p>Nenhum PAI registrado para este aluno</p></div>
            </div>
          </div>

          <div v-if="tipoRelatorio === 'evolucao'" class="text-center text-gray-700 py-8">Relatório de evolução em desenvolvimento</div>

          <!-- Notas e Análises do Aluno -->
          <div class="bg-white border rounded-lg p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center"><i class="fas fa-sticky-note text-amber-600 mr-2"></i>Notas e Análises do Aluno</h3>
            <!-- Nova nota manual -->
            <div class="mb-4 p-3 border rounded bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-6 gap-2 items-end">
                <div class="md:col-span-2">
                  <label class="block text-xs text-gray-600 mb-1">Título (opcional)</label>
                  <input v-model="novaNota.title" class="w-full border rounded px-3 py-2 text-sm" placeholder="Ex.: Observações de aula">
                </div>
                <div class="md:col-span-3">
                  <label class="block text-xs text-gray-600 mb-1">Conteúdo</label>
                  <input v-model="novaNota.content" class="w-full border rounded px-3 py-2 text-sm" placeholder="Escreva uma observação rápida">
                </div>
                <div class="md:col-span-1 text-right">
                  <button class="px-3 py-2 bg-amber-600 text-white rounded text-sm w-full md:w-auto" :disabled="!novaNota.content" @click="criarNotaManual">Adicionar</button>
                </div>
              </div>
            </div>
            <div v-if="dadosRelatorio.notes && dadosRelatorio.notes.length" class="space-y-4">
              <div v-for="n in dadosRelatorio.notes" :key="n.id" class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="text-sm text-gray-500">{{ new Date(n.created_at).toLocaleString('pt-BR') }} <span v-if="n.source" class="ml-2 px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">{{ n.source }}</span></div>
                    <div class="font-medium text-gray-900">{{ n.title || 'Nota' }}</div>
                  </div>
                  <button class="text-blue-600 text-sm hover:underline" @click="n.__editing = !n.__editing">{{ n.__editing ? 'Cancelar' : 'Editar' }}</button>
                </div>
                <div v-if="!n.__editing" class="whitespace-pre-wrap text-gray-800 text-sm">{{ n.content }}</div>
                <div v-else class="space-y-2">
                  <input v-model="n.title" class="w-full border rounded px-3 py-2 text-sm" placeholder="Título (opcional)">
                  <textarea v-model="n.content" rows="6" class="w-full border rounded px-3 py-2 text-sm"></textarea>
                  <div class="text-right"><button class="px-4 py-2 bg-green-600 text-white rounded text-sm" @click="salvarNota(n)">Salvar</button></div>
                </div>
              </div>
            </div>
            <div v-else class="text-sm text-gray-500">Nenhuma nota registrada para este aluno.</div>
          </div>
        </div>
      </div>

      <!-- Análise IA (renderização rica) -->
      <div v-if="analiseIA_resultado" class="bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h2 class="text-xl font-bold text-white flex items-center">
            <i class="fas fa-robot mr-3 text-2xl"></i>
            Análise com Inteligência Artificial
          </h2>
          <p class="text-purple-100 text-sm mt-1">Análise automatizada de {{ analiseIA_resultado.aluno_nome }}</p>
        </div>
        
        <div class="p-6 space-y-6">
          <!-- Resumo -->
          <div v-if="analiseIA_resultado.resumo" class="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
            <h3 class="text-base font-semibold text-blue-900 mb-2 flex items-center">
              <i class="fas fa-info-circle mr-2"></i>
              Resumo
            </h3>
            <p class="text-gray-700 leading-relaxed">{{ analiseIA_resultado.resumo }}</p>
          </div>
          
          <!-- Forças -->
          <div v-if="analiseIA_resultado.forcas && analiseIA_resultado.forcas.length" class="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
            <h3 class="text-base font-semibold text-green-900 mb-3 flex items-center">
              <i class="fas fa-star mr-2"></i>
              Forças e Potencialidades
            </h3>
            <ul class="space-y-2">
              <li v-for="(forca, index) in analiseIA_resultado.forcas" :key="'f'+index" 
                  class="flex items-start text-gray-700">
                <i class="fas fa-check-circle text-green-600 mr-2 mt-1 flex-shrink-0"></i>
                <span>{{ forca }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Desafios -->
          <div v-if="analiseIA_resultado.desafios && analiseIA_resultado.desafios.length" class="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-4">
            <h3 class="text-base font-semibold text-yellow-900 mb-3 flex items-center">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Desafios Identificados
            </h3>
            <ul class="space-y-2">
              <li v-for="(desafio, index) in analiseIA_resultado.desafios" :key="'d'+index" 
                  class="flex items-start text-gray-700">
                <i class="fas fa-arrow-right text-yellow-600 mr-2 mt-1 flex-shrink-0"></i>
                <span>{{ desafio }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Objetivos SMART -->
          <div v-if="analiseIA_resultado.objetivos_smart && analiseIA_resultado.objetivos_smart.length" class="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg p-4">
            <h3 class="text-base font-semibold text-indigo-900 mb-3 flex items-center">
              <i class="fas fa-bullseye mr-2"></i>
              Objetivos SMART Recomendados
            </h3>
            <ul class="space-y-3">
              <li v-for="(objetivo, index) in analiseIA_resultado.objetivos_smart" :key="'o'+index" 
                  class="flex items-start bg-white rounded-lg p-3 shadow-sm">
                <span class="inline-flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full mr-3 flex-shrink-0 mt-0.5">{{ index + 1 }}</span>
                <span class="text-gray-700">{{ objetivo }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Estratégias Recomendadas -->
          <div v-if="analiseIA_resultado.estrategias_recomendadas && analiseIA_resultado.estrategias_recomendadas.length" class="bg-purple-50 border-l-4 border-purple-500 rounded-r-lg p-4">
            <h3 class="text-base font-semibold text-purple-900 mb-3 flex items-center">
              <i class="fas fa-lightbulb mr-2"></i>
              Estratégias e Atividades Recomendadas
            </h3>
            <ul class="space-y-3">
              <li v-for="(estrategia, index) in analiseIA_resultado.estrategias_recomendadas" :key="'e'+index" 
                  class="flex items-start bg-white rounded-lg p-3 shadow-sm">
                <i class="fas fa-puzzle-piece text-purple-600 mr-3 mt-1 flex-shrink-0"></i>
                <span class="text-gray-700">{{ estrategia }}</span>
              </li>
            </ul>
          </div>
          
          <!-- Mensagem caso não tenha dados -->
          <div v-if="!analiseIA_resultado.resumo && !analiseIA_resultado.forcas.length && !analiseIA_resultado.desafios.length && !analiseIA_resultado.objetivos_smart.length && !analiseIA_resultado.estrategias_recomendadas.length" 
               class="text-center py-8 text-gray-500">
            <i class="fas fa-exclamation-circle text-4xl mb-3"></i>
            <p>Não foi possível gerar uma análise detalhada no momento.</p>
          </div>
        </div>
      </div>
      
      <!-- Modal de Visualização do PDF -->
      <div v-if="mostrarModalVisualizarPDF" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" @click="fecharModalPDF">
        <div class="relative w-full h-full max-w-7xl max-h-screen p-4" @click.stop>
          <div class="bg-white rounded-lg shadow-2xl h-full flex flex-col">
            <div class="flex items-center justify-between p-4 border-b">
              <h3 class="text-xl font-bold text-gray-900">📄 Visualização do PDF</h3>
              <button @click="fecharModalPDF" class="text-gray-500 hover:text-gray-700 text-2xl font-bold">
                ×
              </button>
            </div>
            <div class="flex-1 overflow-hidden">
              <iframe v-if="pdfUrl" :src="pdfUrl" class="w-full h-full border-0"></iframe>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Modal de Seleção de PDF -->
      <div v-if="mostrarModalPDF" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="mostrarModalPDF = false">
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full m-4" @click.stop>
          <div class="p-6">
            <h3 class="text-xl font-bold text-gray-900 mb-4">📄 Selecione o PDF para Gerar</h3>
            <p class="text-sm text-gray-600 mb-6">Escolha qual formulário AEE deseja exportar em PDF:</p>
            
            <div class="space-y-3">
              <!-- Entrevista -->
              <button v-if="dadosRelatorio.entrevistas && dadosRelatorio.entrevistas.length > 0"
                      @click="gerarPDFSelecionado('entrevista')"
                      class="w-full flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200">
                    <i class="fas fa-clipboard-list text-blue-600 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900">Entrevista com Responsável</div>
                    <div class="text-sm text-gray-500">{{ dadosRelatorio.entrevistas.length }} registro(s)</div>
                  </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400 group-hover:text-blue-600"></i>
              </button>
              
              <!-- PDI -->
              <button v-if="dadosRelatorio.pdis && dadosRelatorio.pdis.length > 0"
                      @click="gerarPDFSelecionado('pdi')"
                      class="w-full flex items-center justify-between p-4 border-2 border-green-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-green-200">
                    <i class="fas fa-file-alt text-green-600 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900">PDI - Plano de Desenvolvimento Individual</div>
                    <div class="text-sm text-gray-500">{{ dadosRelatorio.pdis.length }} registro(s)</div>
                  </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400 group-hover:text-green-600"></i>
              </button>
              
              <!-- PAI -->
              <button v-if="dadosRelatorio.pais && dadosRelatorio.pais.length > 0"
                      @click="gerarPDFSelecionado('pai')"
                      class="w-full flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group">
                <div class="flex items-center">
                  <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 group-hover:bg-purple-200">
                    <i class="fas fa-tasks text-purple-600 text-xl"></i>
                  </div>
                  <div class="text-left">
                    <div class="font-semibold text-gray-900">PAI - Plano de Atendimento Individual</div>
                    <div class="text-sm text-gray-500">{{ dadosRelatorio.pais.length }} registro(s)</div>
                  </div>
                </div>
                <i class="fas fa-chevron-right text-gray-400 group-hover:text-purple-600"></i>
              </button>
            </div>
            
            <div class="mt-6 flex justify-end">
              <button @click="mostrarModalPDF = false" 
                      class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data(){
    return {
      query: '',
      alunos: [],
      alunoId: '',
      tipoRelatorio: 'geral',
      dadosRelatorio: null,
      carregandoRelatorio: false,
      carregandoPDF: false,
      carregandoIA: false,
      analiseIA_resultado: null,
      erroIA: null,
      tentouGerar: false,
      novaNota: { title: '', content: '' },
      mostrarModalPDF: false,
      mostrarModalVisualizarPDF: false,
      pdfUrl: null
    };
  },
  computed: {
    tituloRelatorio() {
      const titulos = {
        'geral': 'Relatório Geral do Aluno',
        'atendimentos': 'Histórico de Atendimentos',
        'formularios': 'Formulários AEE Preenchidos',
        'evolucao': 'Relatório de Evolução'
      };
      return titulos[this.tipoRelatorio] || 'Relatório';
    },
    descricaoRelatorio() {
      if (!this.dadosRelatorio?.aluno) return 'Selecione um aluno para gerar o relatório';
      const aluno = this.dadosRelatorio.aluno;
      return `Relatório detalhado de ${aluno.name} - ${aluno.school || 'Escola não informada'}`;
    },
    podeExportarPDF() {
      if (!this.dadosRelatorio) return false;
      const aluno = this.dadosRelatorio.aluno;
      return aluno?.name && aluno.name !== 'Não informado' && aluno?.school;
    },
    podeAnalisarIA() {
      if (!this.dadosRelatorio) return false;
      const stats = this.dadosRelatorio.estatisticas;
      return stats?.total_atendimentos > 0;
    }
  },
  methods: {
    async buscar(){
      const params = {};
      if (this.query) params.q = this.query;
      params.per_page = 200;
      try {
        const r = await api.get('/students', { params });
        this.alunos = (r.data?.data?.rows) || [];
      } catch(e){
        console.error('Erro ao carregar alunos:', e);
        this.$showToast && this.$showToast('Erro', 'Erro ao carregar alunos', 'error');
      }
    },
    async carregarDadosAluno() {
      if (!this.alunoId) {
        this.dadosRelatorio = null;
        return;
      }
      await this.gerarRelatorio();
    },
    async gerarRelatorio(){
      if(!this.alunoId) { this.tentouGerar = true; return; }
      this.carregandoRelatorio = true;
      try {
        const response = await api.get('/reports/student', { params: { student_id: this.alunoId } });
        const reportData = response.data?.data || response.data;
        if (!reportData) throw new Error('Dados do relatório não encontrados');

        // Atendimentos (opcional)
        let atendimentos = [];
        if (this.tipoRelatorio === 'atendimentos' || this.tipoRelatorio === 'geral') {
          try {
            const at = await api.get('/atendimentos', { params: { aluno_id: this.alunoId } });
            atendimentos = at.data?.data?.rows || [];
          } catch(e) { console.warn('Erro ao carregar atendimentos:', e); }
        }

        const estatisticas = {
          total_atendimentos: atendimentos.length,
          total_formularios: (reportData.anamneses?.length || 0) + (reportData.pdis?.length || 0) + (reportData.pais?.length || 0),
          total_pdis: reportData.pdis?.length || 0,
          total_pais: reportData.pais?.length || 0,
          total_anamneses: reportData.anamneses?.length || 0
        };

        this.dadosRelatorio = {
          aluno: reportData.student,
          atendimentos,
          estatisticas,
          anamneses: reportData.anamneses || [],
          entrevistas: reportData.entrevistas || reportData.anamneses || [], // Alias para compatibilidade
          pdis: reportData.pdis || [],
          pais: reportData.pais || [],
          attendance: reportData.attendance || [],
          weekly_plans: reportData.weekly_plans || [],
          notes: reportData.notes || []
        };
      } catch(e){
        console.error('Erro ao gerar relatório:', e);
        const msg = e.response?.data?.error || e.response?.data?.message || e.message;
        this.$showToast && this.$showToast('Erro', 'Erro ao gerar relatório: ' + msg, 'error');
      } finally {
        this.carregandoRelatorio = false;
      }
    },
    async exportarPDF(){
      if (!this.dadosRelatorio) return;
      
      // Verificar quais formulários existem para este aluno
      const temEntrevista = this.dadosRelatorio.entrevistas && this.dadosRelatorio.entrevistas.length > 0;
      const temPDI = this.dadosRelatorio.pdis && this.dadosRelatorio.pdis.length > 0;
      const temPAI = this.dadosRelatorio.pais && this.dadosRelatorio.pais.length > 0;
      
      if (!temEntrevista && !temPDI && !temPAI) {
        this.$showToast && this.$showToast('Aviso', 'Este aluno ainda não possui formulários AEE preenchidos. Preencha uma Entrevista, PDI ou PAI primeiro.', 'warning');
        return;
      }
      
      // Mostrar modal de seleção
      this.mostrarModalPDF = true;
    },
    
    async gerarPDFSelecionado(tipo){
      this.carregandoPDF = true;
      this.mostrarModalPDF = false;
      
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('❌ Token não encontrado');
          this.$showToast && this.$showToast('Erro', 'Faça login novamente.', 'error');
          return;
        }
        
        let endpoint = '';
        let formId = null;

        switch(tipo) {
          case 'entrevista':
            endpoint = '/generate-pdf-entrevista.php';
            if (this.dadosRelatorio.entrevistas && this.dadosRelatorio.entrevistas.length > 0) {
              formId = this.dadosRelatorio.entrevistas[0].id;
            }
            break;
          case 'pdi':
            endpoint = '/generate-pdf-pdi.php';
            if (this.dadosRelatorio.pdis && this.dadosRelatorio.pdis.length > 0) {
              formId = this.dadosRelatorio.pdis[0].id;
            }
            break;
          case 'pai':
            endpoint = '/generate-pdf-pai.php';
             if (this.dadosRelatorio.pais && this.dadosRelatorio.pais.length > 0) {
              formId = this.dadosRelatorio.pais[0].id;
            }
            break;
          default:
            console.error('❌ Tipo de PDF inválido:', tipo);
            this.$showToast && this.$showToast('Erro', 'Tipo de PDF inválido', 'error');
            return;
        }

        if (!formId) {
          this.$showToast && this.$showToast('Aviso', 'Nenhuma versão deste formulário foi encontrada para o aluno.', 'warning');
          this.carregandoPDF = false;
          return;
        }

        const pdfUrl = buildApiUrl(endpoint, `id=${formId}`);
        
        // Fazer requisição para obter o PDF como blob
        const response = await fetch(pdfUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Erro na resposta:', errorText);
          throw new Error(`Erro ao gerar PDF: ${response.status} - ${errorText.substring(0, 100)}`);
        }
        
        // Verificar se é realmente um PDF
        const contentType = response.headers.get('content-type');
        
        if (!contentType || !contentType.includes('application/pdf')) {
          const text = await response.text();
          console.error('❌ Resposta não é PDF:', text.substring(0, 200));
          throw new Error('Resposta não é um PDF válido');
        }
        
        // Obter o blob do PDF
        const blob = await response.blob();
        
        // Criar URL do blob
        const pdfUrl = URL.createObjectURL(blob);
        
        // Abrir em modal
        this.pdfUrl = pdfUrl;
        this.mostrarModalVisualizarPDF = true;
        
        this.$showToast && this.$showToast('Sucesso', 'PDF gerado com sucesso!', 'success');
        
      } catch(e) {
        console.error('❌ Erro ao gerar PDF:', e);
        this.$showToast && this.$showToast('Erro', 'Erro ao exportar PDF: ' + e.message, 'error');
      } finally {
        this.carregandoPDF = false;
      }
    },
    
    fecharModalPDF() {
      if (this.pdfUrl) {
        URL.revokeObjectURL(this.pdfUrl);
        this.pdfUrl = null;
      }
      this.mostrarModalVisualizarPDF = false;
    },
    async analiseIA(){
      if (!this.dadosRelatorio) return;
      this.carregandoIA = true; this.erroIA = null; this.analiseIA_resultado = null;
      try {
        const resp = await api.get('/ai/evaluate-student', { params: { student_id: this.alunoId } });
        const r = resp.data?.data || resp.data || {};
        
        // Armazenar como objeto estruturado para renderização rica
        this.analiseIA_resultado = {
          aluno_nome: this.dadosRelatorio.aluno.name,
          resumo: r.resumo || null,
          forcas: Array.isArray(r.forcas) && r.forcas.length ? r.forcas : [],
          desafios: Array.isArray(r.desafios) && r.desafios.length ? r.desafios : [],
          objetivos_smart: Array.isArray(r.objetivos_smart) && r.objetivos_smart.length ? r.objetivos_smart : [],
          estrategias_recomendadas: Array.isArray(r.estrategias_recomendadas) && r.estrategias_recomendadas.length ? r.estrategias_recomendadas : []
        };

        // Criar versão em texto para salvar como nota
        const linhas = [];
        linhas.push(`Análise automatizada do aluno ${this.dadosRelatorio.aluno.name}:`);
        if (r.resumo) { linhas.push('\n📌 Resumo'); linhas.push(String(r.resumo)); }
        if (Array.isArray(r.forcas) && r.forcas.length) { linhas.push('\n💪 Forças'); r.forcas.forEach(f=>linhas.push(`- ${f}`)); }
        if (Array.isArray(r.desafios) && r.desafios.length) { linhas.push('\n⚠️ Desafios'); r.desafios.forEach(d=>linhas.push(`- ${d}`)); }
        if (Array.isArray(r.objetivos_smart) && r.objetivos_smart.length) { linhas.push('\n🎯 Objetivos SMART'); r.objetivos_smart.forEach(o=>linhas.push(`- ${o}`)); }
        if (Array.isArray(r.estrategias_recomendadas) && r.estrategias_recomendadas.length) { linhas.push('\n🧩 Estratégias e Atividades Recomendadas'); r.estrategias_recomendadas.forEach(e=>linhas.push(`- ${e}`)); }
        const textoNota = linhas.join('\n');

        // Persistir como nota
        try {
          await api.post('/student-notes/create', {
            student_id: this.alunoId,
            title: `Análise de IA - ${new Date().toLocaleDateString('pt-BR')}`,
            content: textoNota,
            source: 'IA'
          });
          this.$showToast && this.$showToast('Sucesso', 'Análise salva no histórico do aluno.', 'success');
          await this.gerarRelatorio();
        } catch (e) {
          console.warn('Falha ao salvar nota de IA:', e);
        }
      } catch(err){
        this.erroIA = err?.response?.data?.error || err.message || 'Erro na análise com IA';
        this.$showToast && this.$showToast('Erro', this.erroIA, 'error');
      } finally { this.carregandoIA = false; }
    },
    async salvarNota(nota){
      if (!nota || !nota.id) return;
      try {
        await api.post('/student-notes/update', { id: nota.id, title: nota.title, content: nota.content });
        nota.__editing = false;
        this.$showToast && this.$showToast('Sucesso', 'Nota atualizada.', 'success');
        await this.gerarRelatorio();
      } catch(e) {
        console.error('Erro ao atualizar nota:', e);
        const msg = e.response?.data?.error || e.message;
        this.$showToast && this.$showToast('Erro', 'Não foi possível salvar a nota: ' + msg, 'error');
      }
    },
    async criarNotaManual(){
      if (!this.alunoId || !this.novaNota.content) return;
      try {
        await api.post('/student-notes/create', {
          student_id: this.alunoId,
          title: this.novaNota.title || null,
          content: this.novaNota.content,
          source: 'manual'
        });
        this.$showToast && this.$showToast('Sucesso', 'Nota adicionada ao histórico do aluno.', 'success');
        this.novaNota = { title: '', content: '' };
        await this.gerarRelatorio();
      } catch (e) {
        console.error('Erro ao criar nota manual:', e);
        const msg = e.response?.data?.error || e.message;
        this.$showToast && this.$showToast('Erro', 'Não foi possível adicionar a nota: ' + msg, 'error');
      }
    },
    formatarData(data) {
      if (!data) return 'Não informado';
      try { return new Date(data).toLocaleDateString('pt-BR'); } catch(e) { return 'Data inválida'; }
    },
    calcularIdade(dataNascimento) {
      if (!dataNascimento) return 0;
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) idade--;
      return idade;
    },
    pretty(o){ try{ return JSON.stringify(o, null, 2); }catch(e){ return String(o); } }
  },
  async mounted(){ await this.buscar(); }
};


// Componente para Entrevista com Responsável
const EntrevistaResponsavel = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="max-w-6xl mx-auto px-4">
        <!-- Header Compacto -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Entrevista com Responsável</h1>
              <div v-if="savingAuto" class="flex items-center text-sm text-blue-600 mt-1">
                <i class="fas fa-circle-notch fa-spin mr-2"></i>
                Salvando...
              </div>
              <div v-else-if="lastSaved" class="flex items-center text-sm text-green-600 mt-1">
                <i class="fas fa-check-circle mr-2"></i>
                Salvo {{ lastSaved.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }}
              </div>
            </div>
            
            <button v-if="form.id" 
                    @click="generatePDF"
                    :disabled="generatingPDF"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors shadow-md">
              <i v-if="!generatingPDF" class="fas fa-file-pdf"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}</span>
            </button>
          </div>
        </div>

        <!-- TabBar Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div class="flex border-b border-gray-200 overflow-x-auto">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    class="flex-1 min-w-[120px] px-6 py-4 text-sm font-medium transition-all duration-200 relative"
                    :class="[
                    index + 1 === currentStep 
                      ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' 
                      : index + 1 < currentStep 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-500 hover:bg-gray-50'
                  ]">
              <div class="flex items-center justify-center space-x-2">
                <i :class="[step.icon, index + 1 < currentStep ? 'fa-check-circle' : '']"></i>
                <span>{{ step.title }}</span>
              </div>
              <div v-if="index + 1 === currentStep" class="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
            </button>
          </div>
          
          <!-- Progress Indicator -->
          <div class="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm">
            <span class="text-gray-600">
              <i class="fas fa-tasks mr-2"></i>
              Etapa {{ currentStep }} de {{ totalSteps }}
            </span>
            <span class="font-medium text-blue-600">{{ Math.round(progressPercentage) }}% completo</span>
          </div>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <form @submit.prevent="salvarEntrevista" class="relative">
            <!-- Step 1: Dados do Aluno -->
            <div v-show="currentStep === 1" class="step-content">
              <div class="p-6">
                <div class="max-w-4xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" 
                            @change="preencherDadosAlunoEntrevista" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      :class="validationErrors.student_id ? 'border-red-300 bg-red-50' : ''">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">{{ aluno.name }}</option>
                    </select>
                    <p v-if="validationErrors.student_id" class="mt-2 text-sm text-red-600">{{ validationErrors.student_id }}</p>
                  </div>

                  <!-- Informações preenchidas automaticamente do perfil do aluno -->
                  <div v-if="form.student_id" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 class="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                      <i class="fas fa-info-circle mr-2"></i>
                      Dados do perfil do aluno
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span class="font-medium text-blue-700">Escola:</span>
                        <span class="text-blue-600 ml-1">{{ form.escola || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-blue-700">Série/Ano:</span>
                        <span class="text-blue-600 ml-1">{{ form.serie || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-blue-700">Turno:</span>
                        <span class="text-blue-600 ml-1">{{ form.turno || 'Não informado' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Dados do Responsável -->
            <div v-show="currentStep === 2" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-2xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Dados do Responsável</h2>
                  <p class="text-gray-600">Informações sobre o responsável pelo aluno</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <!-- Dados preenchidos do perfil -->
                  <div v-if="form.student_id" class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="text-sm font-semibold text-green-900 mb-3 flex items-center">
                      <i class="fas fa-info-circle mr-2"></i>
                      Dados do perfil do aluno
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span class="font-medium text-green-700">Nome:</span>
                        <span class="text-green-600 ml-1">{{ form.nome_responsavel || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-green-700">Telefone:</span>
                        <span class="text-green-600 ml-1">{{ form.telefone || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-green-700">Email:</span>
                        <span class="text-green-600 ml-1">{{ form.email || 'Não informado' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Campo adicional: apenas o parentesco -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Parentesco <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.parentesco" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      :class="validationErrors.parentesco ? 'border-red-300 bg-red-50' : ''">
                      <option value="">Selecione</option>
                      <option value="pai">Pai</option>
                      <option value="mae">Mãe</option>
                      <option value="avo">Avô/Avó</option>
                      <option value="tio">Tio/Tia</option>
                      <option value="responsavel_legal">Responsável Legal</option>
                      <option value="outro">Outro</option>
                    </select>
                    <p v-if="validationErrors.parentesco" class="mt-2 text-sm text-red-600">{{ validationErrors.parentesco }}</p>
                    <p class="mt-2 text-xs text-gray-500">
                      <i class="fas fa-lightbulb text-yellow-500 mr-1"></i>
                      Os dados de nome, telefone e email são preenchidos automaticamente do cadastro do aluno.
                    </p>
                  </div>
                  
                  <!-- Campo obrigatório: Nome do responsável -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Responsável <span class="text-red-500">*</span>
                    </label>
                    <input v-model="form.nome_responsavel" type="text" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      :class="validationErrors.nome_responsavel ? 'border-red-300 bg-red-50' : ''"
                      placeholder="Digite o nome completo do responsável">
                    <p v-if="validationErrors.nome_responsavel" class="mt-2 text-sm text-red-600">{{ validationErrors.nome_responsavel }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Histórico Médico -->
            <div v-show="currentStep === 3" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-heartbeat text-2xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Histórico Médico</h2>
                  <p class="text-gray-600">Informações sobre diagnósticos e acompanhamento médico</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Diagnóstico médico</label>
                    <textarea v-model="form.diagnostico" rows="4" maxlength="500"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Descreva o diagnóstico médico do aluno, se houver..."></textarea>
                    <div class="flex justify-between mt-1">
                      <p class="text-xs text-gray-500">Descreva brevemente o diagnóstico médico</p>
                      <p class="text-xs text-gray-400">{{ (form.diagnostico || '').length }}/500</p>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Medicamentos em uso</label>
                    <textarea v-model="form.medicamentos" rows="3" maxlength="300"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Liste os medicamentos que o aluno utiliza, se houver..."></textarea>
                    <div class="flex justify-between mt-1">
                      <p class="text-xs text-gray-500">Liste medicamentos, dosagens e horários</p>
                      <p class="text-xs text-gray-400">{{ (form.medicamentos || '').length }}/300</p>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Profissionais que acompanham</label>
                    <textarea v-model="form.profissionais" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Ex: Neurologista, Psicólogo, Fonoaudiólogo..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Desenvolvimento e Comportamento -->
            <div v-show="currentStep === 4" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-child text-2xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Desenvolvimento e Comportamento</h2>
                  <p class="text-gray-600">Como é o aluno em casa e na escola</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Como é o comportamento do aluno em casa?</label>
                    <textarea v-model="form.comportamento_casa" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Descreva como o aluno se comporta em casa, na rotina familiar..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Principais dificuldades observadas</label>
                    <textarea v-model="form.dificuldades" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Quais são as principais dificuldades que você observa no aluno?"></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Habilidades e potencialidades</label>
                    <textarea v-model="form.habilidades" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Quais são os pontos fortes e habilidades do aluno?"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Expectativas e Finalização -->
            <div v-show="currentStep === 5" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-clipboard-check text-2xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Expectativas e Finalização</h2>
                  <p class="text-gray-600">Últimas informações e suas expectativas</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">O que espera do atendimento educacional especializado?</label>
                    <textarea v-model="form.expectativas" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Conte suas expectativas sobre o AEE para seu filho..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Informações adicionais</label>
                    <textarea v-model="form.informacoes_adicionais" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Alguma informação adicional que considera importante..."></textarea>
                  </div>

                  <!-- Resumo dos dados -->
                  <div class="bg-indigo-50 rounded-lg p-6 mt-8">
                    <h3 class="text-lg font-semibold text-indigo-900 mb-4">Resumo da Entrevista</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-700">Aluno:</span>
                        <span class="text-gray-600">{{ (alunos.find(a=>a.id==form.student_id)?.name) || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Responsável:</span>
                        <span class="text-gray-600">{{ form.nome_responsavel || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Escola:</span>
                        <span class="text-gray-600">{{ form.escola || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Série:</span>
                        <span class="text-gray-600">{{ form.serie || 'Não informado' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-white">
              <button type="button" @click="previousStep" 
                      v-if="currentStep > 1"
                      class="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <i class="fas fa-chevron-left mr-2"></i>
                Anterior
              </button>
              <div v-else></div>

              <button v-if="currentStep < totalSteps" type="button" @click="nextStep"
                      class="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                Próximo
                <i class="fas fa-chevron-right ml-2"></i>
              </button>

              <button v-else type="submit" :disabled="loading"
                      class="flex items-center px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                <div v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <i v-else class="fas fa-save mr-2"></i>
                {{ loading ? 'Salvando...' : 'Finalizar Entrevista' }}
              </button>
              
              <!-- Botão PDF -->
              <button v-if="form.student_id" type="button" @click="exportarPDF"
                      class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                <i class="fas fa-file-pdf mr-2"></i>
                📄 Exportar PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  
  data() {
    return {
      __debug: true,
      currentStep: 1,
      totalSteps: 5,
      maxCompletedStep: 1,
      loading: false,
      generatingPDF: false,
      validationErrors: {},
      alunos: [],
      escolas: [],
      preenchidosNaEntrevista: new Set(), // Campos já preenchidos na entrevista
      autoSaveTimeout: null, // Timer para debounce
      lastSaved: null, // Timestamp do último save
  savingAuto: false, // Flag para indicar auto-save em progresso
  isLoadingForm: false, // Impede auto-save durante preenchimento automático
      form: {
        student_id: '',
        escola: '',
        escola_id: '',
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
      },
      steps: [
        { title: 'Aluno', icon: 'fas fa-user-graduate' },
        { title: 'Responsável', icon: 'fas fa-users' },
        { title: 'Médico', icon: 'fas fa-heartbeat' },
        { title: 'Desenvolvimento', icon: 'fas fa-child' },
        { title: 'Finalização', icon: 'fas fa-clipboard-check' }
      ]
    };
  },
  
  computed: {
    progressPercentage() {
      return (this.currentStep / (this.totalSteps || 1)) * 100;
    },
    
  },
  
  watch: {
    form: {
      handler(newVal, oldVal) {
          student_id: newVal.student_id, 
          loading: this.loading,
          savingAuto: this.savingAuto,
          isLoadingForm: this.isLoadingForm
        });
        
        // Auto-save quando qualquer campo do formulário mudar
        if (newVal.student_id && !this.loading && !this.savingAuto && !this.isLoadingForm) {
          this.autoSave();
        } else {
            temStudentId: !!newVal.student_id,
            loading: this.loading,
            savingAuto: this.savingAuto,
            isLoadingForm: this.isLoadingForm
          });
        }
      },
      deep: true
    }
  },
  
  created() {
    try {
      const el = document.getElementById('debug-entrevista-banner');
      if (el) el.style.display = 'block';
    } catch (e) { console.warn('Debug banner não inserido', e); }
  },
 
  beforeDestroy() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = null;
    }
  },
  
  methods: {
    async carregarAlunos() {
      try {
        let params = {};
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const response = await api.get('/students/options', { params });
        this.alunos = response.data?.data?.rows || [];
      } catch (error) {
        console.error('❌ [Entrevista] Erro ao carregar alunos:', error);
        this.alunos = [];
      }
    },
    
    async preencherDadosAlunoEntrevista() {
      if (!this.form.student_id) {
        return;
      }

      this.isLoadingForm = true;
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
      }
      this.savingAuto = false;

      try {
        const aluno = this.alunos.find(a => a.id == this.form.student_id);
        if (aluno) {
          if (aluno.school_name) {
            this.form.escola = aluno.school_name;
          }
          if (aluno.school_id) {
            this.form.escola_id = aluno.school_id;
          }
          if (aluno.grade) {
            this.form.serie = aluno.grade;
          }
          if (aluno.class_name) {
            this.form.turma = aluno.class_name;
          }
          if (aluno.shift) {
            const shiftMap = {
              'manha': 'matutino',
              'tarde': 'vespertino',
              'noite': 'noturno'
            };
            this.form.turno = shiftMap[aluno.shift] || aluno.shift;
          }
          if (aluno.responsible_name) {
            this.form.nome_responsavel = aluno.responsible_name;
          }
          if (aluno.responsible_phone) {
            this.form.telefone = aluno.responsible_phone;
          }
          if (aluno.responsible_email) {
            this.form.email = aluno.responsible_email;
          }
        }

        try {
          const r = await api.get('/entrevistas-responsavel/list', { params: { student_id: this.form.student_id, per_page: 1 } });
          const rows = r.data?.data?.rows || r.data?.data || r.data?.rows || [];
          const ultimo = Array.isArray(rows) && rows.length ? rows[0] : null;
          if (ultimo) {
            this.form.id = ultimo.id;

            const recuperado = ultimo.form_data || ultimo.formData || {};
            Object.keys(recuperado).forEach(key => {
              if (key in this.form && recuperado[key] != null) {
                this.form[key] = recuperado[key];
              }
            });

            this.form.diagnostico = ultimo.diagnostico || this.form.diagnostico;
            this.form.medicamentos = ultimo.medicamentos || this.form.medicamentos;
            this.form.profissionais = ultimo.profissionais || this.form.profissionais;
            this.form.comportamento_casa = ultimo.comportamento_casa || this.form.comportamento_casa;
            this.form.dificuldades = ultimo.dificuldades || this.form.dificuldades;
            this.form.habilidades = ultimo.habilidades || this.form.habilidades;
            this.form.expectativas = ultimo.expectativas || this.form.expectativas;
            this.form.informacoes_adicionais = ultimo.informacoes_adicionais || this.form.informacoes_adicionais;

            if (ultimo.updated_at || ultimo.created_at) {
              this.lastSaved = new Date(ultimo.updated_at || ultimo.created_at);
            }
          }
        } catch (e) {
          console.warn('Não foi possível carregar entrevista existente:', e);
        }
      } finally {
        this.isLoadingForm = false;
      }
    },

    preencherDadosEscolaEntrevista() {
      if (this.form.escola_id) {
        const escola = this.escolas.find(e => e.id == this.form.escola_id);
        if (escola) {
          this.form.escola = escola.name;
        }
      }
    },

    // Navegação entre etapas
    nextStep() {
      // Valida a etapa atual antes de avançar
      if (!this.validateCurrentStep()) return;
      if (this.currentStep < this.totalSteps) {
        this.currentStep += 1;
        // Atualiza o maior passo alcançado para liberar navegação pelos "pills"
        if (this.currentStep > this.maxCompletedStep) {
          this.maxCompletedStep = this.currentStep;
        }
      }
      // Move o foco para o topo do card para melhor UX
      try { document.querySelector('.step-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep -= 1;
      }
      try { document.querySelector('.step-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
    },

    goToStep(step) {
      // Permite ir apenas até o maior passo concluído
      if (step >= 1 && step <= this.maxCompletedStep) {
        this.currentStep = step;
        try { document.querySelector('.step-content')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) {}
      }
    },

    validateCurrentStep() {
      this.validationErrors = {};
      let isValid = true;
      
      if (this.currentStep === 1) {
        if (!this.form.student_id) {
          this.validationErrors.student_id = 'Selecione um aluno';
          isValid = false;
        }
        // Escola, série e turno são preenchidos automaticamente do perfil
      } else if (this.currentStep === 2) {
        if (!this.form.parentesco) {
          this.validationErrors.parentesco = 'Selecione o parentesco';
          isValid = false;
        }
        // Validar e-mail se fornecido
        if (this.form.email && !this.isValidEmail(this.form.email)) {
          this.validationErrors.email = 'E-mail inválido';
          isValid = false;
        }
        // Nome do responsável é obrigatório se não preenchido no perfil
        if (!this.form.nome_responsavel || this.form.nome_responsavel.trim().length < 2) {
          this.validationErrors.nome_responsavel = 'Nome do responsável é obrigatório (mín. 2 caracteres)';
          isValid = false;
        }
      }
      
      return isValid;
    },
    
    getMaxDate() {
      return new Date().toISOString().split('T')[0];
    },

    // Função auxiliar para calcular idade a partir da data de nascimento
    calcularIdade(dataNascimento) {
      if (!dataNascimento) return null;
      const nascimento = new Date(dataNascimento);
      const hoje = new Date();
      let idade = hoje.getFullYear() - nascimento.getFullYear();
      const mes = hoje.getMonth() - nascimento.getMonth();
      if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
        idade--;
      }
      return idade;
    },
    
    // Validações de dados
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    
    isValidCPF(cpf) {
      if (!cpf) return true; // CPF opcional
      cpf = cpf.replace(/[^\d]/g, '');
      if (cpf.length !== 11) return false;
      if (/^(\d)\1+$/.test(cpf)) return false; // CPF com todos dígitos iguais
      
      let sum = 0;
      for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
      }
      let remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      if (remainder !== parseInt(cpf.charAt(9))) return false;
      
      sum = 0;
      for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
      }
      remainder = (sum * 10) % 11;
      if (remainder === 10 || remainder === 11) remainder = 0;
      return remainder === parseInt(cpf.charAt(10));
    },
    
    isValidDate(dateStr) {
      if (!dateStr) return true;
      const date = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date <= today;
    },
    
    async salvarEntrevista() {
      // Validação mínima: apenas student_id é obrigatório
      if (!this.form.student_id) {
        this.$showToast('Atenção', 'Selecione um aluno antes de salvar', 'warning');
        return;
      }
      
      this.loading = true;
      try {
        // Mapear TODOS os campos do formulário para o objeto form_data
        const formData = {
          nome_escola: this.form.escola,
          serie_ano: this.form.serie,
          turno: this.form.turno,
          telefone: this.form.telefone,
          data_entrevista: new Date().toISOString().split('T')[0],
          tipo_entrevista: 'inicial',
          // Campos do responsável
          nome_responsavel: this.form.nome_responsavel,
          parentesco: this.form.parentesco,
          email: this.form.email,
          // Campos médicos/diagnóstico
          diagnostico: this.form.diagnostico,
          medicamentos: this.form.medicamentos,
          profissionais: this.form.profissionais,
          // Campos de desenvolvimento
          comportamento_casa: this.form.comportamento_casa,
          dificuldades: this.form.dificuldades,
          habilidades: this.form.habilidades,
          expectativas: this.form.expectativas,
          informacoes_adicionais: this.form.informacoes_adicionais
        };
        
        // Filtrar apenas campos que têm valor
        const dadosLimpos = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            dadosLimpos[key] = formData[key];
          }
        });
        
        // Estrutura que o backend espera: student_id + form_data + status
        const payload = {
          student_id: this.form.student_id,
          form_data: dadosLimpos,
          status: 'completo'
        };
        
        
        // Sempre usar .create que faz UPSERT automático
        const response = await api.post('?action=entrevistas-responsavel.create', payload);
        
        
        if (response.data?.ok) {
          // Guardar o ID retornado para permitir gerar PDF
          if (response.data.data?.id) {
            this.form.id = response.data.data.id;
          }
          
          // Salvar dados da entrevista no localStorage para evitar duplicação
          const interviewKey = `interview_${this.form.student_id}`;
          localStorage.setItem(interviewKey, JSON.stringify(this.form));
          
          this.$showToast('Sucesso', this.form.id ? 'Entrevista atualizada com sucesso!' : 'Entrevista salva com sucesso!', 'success');
          // Não redirecionar automaticamente para permitir gerar PDF
          // this.$router.push('/');
        } else {
          console.error('❌ Erro na resposta:', response.data);
          this.$showToast('Erro', response.data?.error || 'Erro ao salvar entrevista', 'error');
        }
      } catch (error) {
        console.error('❌ Erro completo:', error);
        console.error('❌ Detalhes:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        this.$showToast('Erro', 'Erro ao salvar entrevista: ' + (error.response?.data?.error || error.response?.data?.message || error.message), 'error');
      } finally {
        this.loading = false;
      }
    },
    
    autoSave() {
      
      // Limpar timeout anterior
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
      }
      
      
      // Debounce: aguardar 2 segundos após última digitação
      this.autoSaveTimeout = setTimeout(async () => {
        this.autoSaveTimeout = null;
          student_id: this.form.student_id,
          savingAuto: this.savingAuto,
          loading: this.loading,
          isLoadingForm: this.isLoadingForm
        });
        
        if (!this.form.student_id || this.savingAuto || this.loading || this.isLoadingForm) {
          return;
        }
        
        this.savingAuto = true;
        try {
          const formData = {
            nome_escola: this.form.escola,
            serie_ano: this.form.serie,
            turno: this.form.turno,
            telefone: this.form.telefone,
            data_entrevista: new Date().toISOString().split('T')[0],
            tipo_entrevista: 'inicial',
            nome_responsavel: this.form.nome_responsavel,
            parentesco: this.form.parentesco,
            email: this.form.email,
            diagnostico: this.form.diagnostico,
            medicamentos: this.form.medicamentos,
            profissionais: this.form.profissionais,
            comportamento_casa: this.form.comportamento_casa,
            dificuldades: this.form.dificuldades,
            habilidades: this.form.habilidades,
            expectativas: this.form.expectativas,
            informacoes_adicionais: this.form.informacoes_adicionais
          };
          
          const dadosLimpos = {};
          Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
              dadosLimpos[key] = formData[key];
            }
          });
          
          const payload = {
            student_id: this.form.student_id,
            form_data: dadosLimpos,
            status: 'rascunho'
          };
          
          let response;
          if (this.form.id) {
            response = await api.post(`?action=entrevistas-responsavel.update&id=${this.form.id}`, payload);
          } else {
            response = await api.post('?action=entrevistas-responsavel.create', payload);
          }
          
          if (response.data?.ok) {
            if (response.data.data?.id && !this.form.id) {
              this.form.id = response.data.data.id;
            }
            this.lastSaved = new Date();
            
            // Feedback visual discreto
            this.$showToast && this.$showToast('Auto-save', 'Rascunho salvo automaticamente', 'info', 2000);
          } else {
            console.error('❌ Auto-save falhou:', response.data);
          }
        } catch (error) {
          console.error('❌ Erro no auto-save:', error);
          console.error('❌ Detalhes do erro:', error.response?.data);
        } finally {
          this.savingAuto = false;
        }
      }, 2000); // 2 segundos de debounce
    },
    
    async generatePDF() {
      if (!this.form.id) {
        this.$showToast('Atenção', 'Salve a entrevista antes de gerar o PDF.', 'info');
        return;
      }
      
      this.generatingPDF = true;
      
      try {
        const baseURL = CONFIG.API_BASE.replace(/\/api\.php$/, '');
        const endpoint = '/generate-pdf-entrevista.php';
        
        const res = await fetch(`${baseURL}${endpoint}?id=${this.form.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) {
          let errorMsg = 'Erro ao gerar PDF';
          try {
            const error = await res.json();
            errorMsg = error.error || errorMsg;
          } catch (e) {
            // Response não é JSON
          }
          throw new Error(errorMsg);
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
        this.$showToast('Erro', '❌ ' + err.message, 'error');
      } finally {
        this.generatingPDF = false;
      }
    },
    
    getPDFFilename() {
      const alunoNome = this.alunos.find(a => a.id == this.form.student_id)?.name || 'Aluno';
      const date = new Date().toISOString().split('T')[0];
      return `Entrevista_${alunoNome.replace(/\s+/g, '_')}_${date}.pdf`;
    },
    
    exportarPDF() {
      if (!this.form.student_id) {
        this.$showToast('Atenção', 'Selecione um aluno primeiro para gerar o PDF.', 'info');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.$showToast('Erro', 'Token de autenticação não encontrado. Faça login novamente.', 'error');
        return;
      }
      
  const url = buildApiUrl('/forms/anamnese/pdf', `student_id=${this.form.student_id}&token=${encodeURIComponent(token)}`);
  window.open(url, '_blank');
    }
  },
  
  async mounted() {
    try {
      // Preferir endpoints simples e consistentes
      await this.carregarAlunos();
      const escolasResponse = await api.get('/schools');
      this.escolas = escolasResponse.data?.data?.rows || [];
    } catch (error) {
      console.error('❌ [Entrevista] Erro ao carregar dados:', error);
      this.$showToast && this.$showToast('Erro', 'Erro ao carregar dados necessários', 'error');
    }
  }
};

// Componente para PDI - ConectAEE
const PDI = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">PDI - Plano de Desenvolvimento Individual</h1>
              <p class="text-gray-600">ConectAEE - Complete as informações em etapas organizadas</p>
            </div>
            
            <!-- Botão Gerar PDF -->
            <button v-if="form.id" 
                    @click="generatePDF"
                    :disabled="generatingPDF"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
              <i v-if="!generatingPDF" class="fas fa-file-pdf"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}</span>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700">Progresso do PDI</span>
            <span class="text-sm text-gray-500">{{ currentStep }}/{{ totalSteps }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 ease-out" 
                 :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="flex justify-between mt-2">
            <span v-for="(step, index) in steps" :key="index" 
                  class="text-xs font-medium transition-colors duration-300"
                  :class="index < currentStep ? 'text-emerald-600' : index === currentStep - 1 ? 'text-emerald-500' : 'text-gray-400'">
              {{ step.title }}
            </span>
          </div>
        </div>

        <!-- Step Navigation Pills -->
        <div class="flex flex-wrap justify-center gap-2 mb-8">
          <button v-for="(step, index) in steps" :key="index"
                  @click="goToStep(index + 1)"
                  :disabled="index + 1 > maxCompletedStep"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  :class="[
                    index + 1 === currentStep 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : index + 1 <= maxCompletedStep 
                        ? 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50' 
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  ]">
            <i :class="step.icon + ' mr-2'"></i>{{ step.title }}
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="salvarPDI" class="relative">
            <!-- Step 1: Identificação -->
            <div v-show="currentStep === 1" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-id-card text-2xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Identificação</h2>
                  <p class="text-gray-600">Dados básicos do aluno e informações escolares</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="preencherDadosAluno" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">{{ aluno.name }}</option>
                    </select>
                  </div>

                  <!-- Dados preenchidos do perfil do aluno -->
                  <div v-if="form.student_id" class="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <h3 class="text-sm font-semibold text-emerald-900 mb-3 flex items-center">
                      <i class="fas fa-info-circle mr-2"></i>
                      Dados do perfil do aluno
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span class="font-medium text-emerald-700">Escola:</span>
                        <span class="text-emerald-600 ml-1">{{ form.escola || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-emerald-700">Série/Ano:</span>
                        <span class="text-emerald-600 ml-1">{{ form.ano_serie || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-emerald-700">Turma:</span>
                        <span class="text-emerald-600 ml-1">{{ form.turma || 'Não informado' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Professor AEE <span class="text-red-500">*</span></label>
                      <select v-model="form.professor_aee" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option v-for="p in professores" :key="p.id" :value="p.name">{{ p.name }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Período de Vigência <span class="text-red-500">*</span></label>
                      <input v-model="form.periodo" type="text" required placeholder="Ex: 1º Semestre 2025"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Diagnóstico -->
            <div v-show="currentStep === 2" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-stethoscope text-2xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Diagnóstico e Características</h2>
                  <p class="text-gray-600">Informações sobre diagnóstico, habilidades e dificuldades</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
                    <textarea v-model="form.diagnostico" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Descreva o diagnóstico médico ou educacional..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Características observadas</label>
                    <textarea v-model="form.caracteristicas" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Descreva as características comportamentais e de aprendizagem..."></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Habilidades Identificadas</label>
                      <textarea v-model="form.habilidades" rows="6" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Liste as habilidades e potencialidades do aluno..."></textarea>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Dificuldades Identificadas</label>
                      <textarea v-model="form.dificuldades" rows="6" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Liste as principais dificuldades observadas..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Objetivos -->
            <div v-show="currentStep === 3" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-target text-2xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Objetivos do PDI</h2>
                  <p class="text-gray-600">Definição dos objetivos gerais e específicos</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Objetivo Geral <span class="text-red-500">*</span></label>
                    <textarea v-model="form.objetivo_geral" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Descreva o objetivo principal do PDI..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Objetivos Específicos <span class="text-red-500">*</span></label>
                    <textarea v-model="form.objetivos_especificos" rows="6" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Liste os objetivos específicos a serem alcançados..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Estratégias e Avaliação -->
            <div v-show="currentStep === 4" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-cogs text-2xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Estratégias e Avaliação</h2>
                  <p class="text-gray-600">Estratégias pedagógicas, recursos e critérios de avaliação</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Estratégias Pedagógicas <span class="text-red-500">*</span></label>
                    <textarea v-model="form.estrategias" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Descreva as estratégias pedagógicas a serem utilizadas..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Recursos Necessários <span class="text-red-500">*</span></label>
                    <textarea v-model="form.recursos" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Liste os recursos pedagógicos necessários..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tecnologia Assistiva</label>
                    <textarea v-model="form.tecnologia_assistiva" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Descreva as tecnologias assistivas necessárias..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Critérios de Avaliação <span class="text-red-500">*</span></label>
                    <textarea v-model="form.criterios_avaliacao" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Defina como será avaliado o progresso do aluno..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Periodicidade de Revisão <span class="text-red-500">*</span></label>
                    <select v-model="form.periodicidade_revisao" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent">
                      <option value="">Selecione</option>
                      <option value="mensal">Mensal</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                    </select>
                  </div>

                  <!-- Resumo dos dados -->
                    <div class="bg-emerald-50 rounded-lg p-6 mt-8">
                    <h3 class="text-lg font-semibold text-emerald-900 mb-4">📋 Resumo do PDI</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-700">Aluno:</span>
                          <p class="text-gray-600">{{ (alunos.find(a=>a.id==form.student_id)?.name) || 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Escola:</span>
                        <p class="text-gray-600">{{ form.escola || 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Professor AEE:</span>
                        <p class="text-gray-600">{{ form.professor_aee || 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Período:</span>
                        <p class="text-gray-600">{{ form.periodo || 'Não informado' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="bg-gray-50 px-8 py-6 flex justify-between items-center">
              <button type="button" @click="previousStep" 
                      :disabled="currentStep === 1"
                      class="flex items-center px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <i class="fas fa-chevron-left mr-2"></i>
                Anterior
              </button>

              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">{{ currentStep }} de {{ totalSteps }}</span>
              </div>

              <button v-if="currentStep < totalSteps" type="button" @click="nextStep"
                      class="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200">
                Próximo
                <i class="fas fa-chevron-right ml-2"></i>
              </button>

              <button v-else type="submit" :disabled="loading"
                      class="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <i v-else class="fas fa-save mr-2"></i>
                {{ loading ? 'Salvando...' : '📋 Finalizar PDI' }}
              </button>
              
              <!-- Botão PDF -->
              <button v-if="form.student_id" type="button" @click="exportarPDF"
                      class="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200">
                <i class="fas fa-file-pdf mr-2"></i>
                📄 Exportar PDF
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
      maxCompletedStep: 1,
      loading: false,
      generatingPDF: false,
      validationErrors: {},
      alunos: [],
  escolas: [],
      professores: [],
      form: {
        student_id: '',
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
      },
      steps: [
        { title: 'Identificação', icon: 'fas fa-id-card' },
        { title: 'Diagnóstico', icon: 'fas fa-stethoscope' },
        { title: 'Objetivos', icon: 'fas fa-target' },
        { title: 'Estratégias', icon: 'fas fa-cogs' }
      ]
    }
  },

  computed: {
    progressPercentage() {
      return (this.currentStep / (this.totalSteps || 1)) * 100;
    }
  },
  async mounted() {
    await Promise.all([this.carregarAlunos(), this.carregarEscolas(), this.carregarProfessores()]);
  },
  methods: {
    async carregarAlunos() {
      try {
        let params = {};
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const response = await api.get('/students/options', { params });
        this.alunos = response.data?.data?.rows || [];
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      }
    },
    async carregarEscolas() {
      try {
        const response = await api.get('/schools');
        const d = response.data;
        this.escolas = (d?.data?.rows) || (Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []));
        if (!Array.isArray(this.escolas)) this.escolas = [];
        if (this.escolas.length === 0) {
          this.$showToast && this.$showToast('Atenção', 'Nenhuma escola encontrada. Cadastre uma escola em "Gestão de Escolas".', 'info');
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        this.$showToast && this.$showToast('Erro', 'Não foi possível carregar a lista de escolas.', 'error');
        this.escolas = [];
      }
    },
    async carregarProfessores() {
      try {
        const resp = await api.get('/professores');
        const arr = resp.data?.data;
        this.professores = Array.isArray(arr) ? arr : [];
      } catch (e) {
        console.error('Erro ao carregar professores:', e);
        this.professores = [];
      }
    },
    
    async preencherDadosAluno() {
      const alunoSelecionado = this.alunos.find(aluno => aluno.id == this.form.student_id);
      if (alunoSelecionado) {
        // Preenche dados automaticamente do perfil do aluno
        if (alunoSelecionado.school_name) {
          this.form.escola = alunoSelecionado.school_name;
        }
        if (alunoSelecionado.school_id) {
          this.form.escola_id = alunoSelecionado.school_id;
        }
        if (alunoSelecionado.grade) {
          this.form.ano_serie = alunoSelecionado.grade;
        }
        if (alunoSelecionado.class_name) {
          this.form.turma = alunoSelecionado.class_name;
        }
        // Carregar último PDI existente para este aluno (se houver)
        try {
          const r = await api.get('/pdi', { params: { student_id: this.form.student_id } });
          const lista = Array.isArray(r.data?.data) ? r.data.data : Array.isArray(r.data) ? r.data : [];
          if (lista.length > 0) {
            const ultimo = lista[0];
            this.form.id = ultimo.id;
            // Preencher a partir de details quando disponível
            const det = ultimo.details || {};
            Object.keys(det).forEach(k => {
              if (k in this.form && det[k] != null) this.form[k] = det[k];
            });
            // Mapear campos básicos se disponíveis
            if (!this.form.escola && det.escola) this.form.escola = det.escola;
            if (!this.form.escola_id && det.escola_id) this.form.escola_id = det.escola_id;
            // Objetivos e estratégias do registro base para campos do formulário
            if (ultimo.objectives) this.form.objetivo_geral = ultimo.objectives;
            if (ultimo.strategies) this.form.estrategias = ultimo.strategies;
          } else {
            // Novo PDI: limpar id
            delete this.form.id;
          }
        } catch (e) {
          console.warn('Falha ao carregar PDI existente:', e);
        }
      }
    },
    preencherEscolaPDI() {
      const escola = this.escolas.find(e => e.id == this.form.escola_id);
      if (escola) {
        this.form.escola = escola.name;
      }
    },

    goToStep(step) {
      if (step <= this.maxCompletedStep) {
        this.currentStep = step;
      }
    },
    
    nextStep() {
      if (this.validateCurrentStep()) {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.maxCompletedStep = Math.max(this.maxCompletedStep, this.currentStep);
        }
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    validateCurrentStep() {
      this.validationErrors = {};
      let isValid = true;
      
      if (this.currentStep === 1) {
        if (!this.form.student_id) {
          this.validationErrors.student_id = 'Selecione um aluno';
          isValid = false;
        }
        if (!this.form.professor_aee) {
          this.validationErrors.professor_aee = 'Selecione o professor AEE';
          isValid = false;
        }
        if (!this.form.periodo || String(this.form.periodo).trim().length < 3) {
          this.validationErrors.periodo = 'Informe o período de vigência (mín. 3 caracteres)';
          isValid = false;
        }
      } else if (this.currentStep === 3) {
        if (!this.form.objetivo_geral || String(this.form.objetivo_geral).trim().length < 5) {
          this.validationErrors.objetivo_geral = 'Informe o objetivo geral (mín. 5 caracteres)';
          isValid = false;
        }
        if (!this.form.objetivos_especificos || String(this.form.objetivos_especificos).trim().length < 10) {
          this.validationErrors.objetivos_especificos = 'Informe os objetivos específicos (mín. 10 caracteres)';
          isValid = false;
        }
      } else if (this.currentStep === 4) {
        if (!this.form.estrategias || String(this.form.estrategias).trim().length < 10) {
          this.validationErrors.estrategias = 'Descreva as estratégias pedagógicas (mín. 10 caracteres)';
          isValid = false;
        }
        if (!this.form.recursos || String(this.form.recursos).trim().length < 5) {
          this.validationErrors.recursos = 'Liste os recursos necessários (mín. 5 caracteres)';
          isValid = false;
        }
        if (!this.form.criterios_avaliacao || String(this.form.criterios_avaliacao).trim().length < 10) {
          this.validationErrors.criterios_avaliacao = 'Defina os critérios de avaliação (mín. 10 caracteres)';
          isValid = false;
        }
        if (!this.form.periodicidade_revisao) {
          this.validationErrors.periodicidade_revisao = 'Selecione a periodicidade de revisão';
          isValid = false;
        }
      }
      
      return isValid;
    },
    
    async salvarPDI() {
      if (!this.validateCurrentStep()) {
        return;
      }
      
      this.loading = true;
      try {
        // Preparar form_data removendo campos de controle
        const formData = { ...this.form };
        delete formData.id;
        delete formData.student_id;
        
        // Estrutura que o backend espera
        const payload = {
          student_id: this.form.student_id,
          form_data: formData,
          data_inicio: this.form.data_inicio || null,
          data_fim: this.form.data_fim || null,
          status: 'ativo'
        };
        
        
        // Sempre usar .create que faz UPSERT automático
        const response = await api.post('?action=pdi.create', payload);
        
        
        if (response.data?.ok) {
          // Atualizar ID se foi criado
          if (response.data.data?.id) {
            this.form.id = response.data.data.id;
          }
          const nomeAluno = (this.alunos.find(a=>a.id==this.form.student_id)?.name) || 'Aluno';
          this.$showToast('Sucesso', `PDI de "${nomeAluno}" salvo com sucesso!`, 'success');
          // Não redirecionar automaticamente para permitir gerar PDF
        } else {
          this.$showToast('Erro', response.data?.error || 'Erro ao salvar PDI', 'error');
        }
      } catch (error) {
        this.$showToast('Erro', 'Erro ao salvar PDI: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async generatePDF() {
      if (!this.form.id) {
        this.$showToast('Atenção', 'Salve o PDI antes de gerar o PDF.', 'info');
        return;
      }
      
      this.generatingPDF = true;
      
      try {
        const baseURL = CONFIG.API_BASE.replace(/\/api\.php$/, '');
        const endpoint = '/generate-pdf-pdi.php';
        
        const res = await fetch(`${baseURL}${endpoint}?id=${this.form.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) {
          let errorMsg = 'Erro ao gerar PDF';
          try {
            const error = await res.json();
            errorMsg = error.error || errorMsg;
          } catch (e) {
            // Response não é JSON
          }
          throw new Error(errorMsg);
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
        this.$showToast('Erro', '❌ ' + err.message, 'error');
      } finally {
        this.generatingPDF = false;
      }
    },
    
    getPDFFilename() {
      const alunoNome = this.alunos.find(a => a.id == this.form.student_id)?.name || 'Aluno';
      const date = new Date().toISOString().split('T')[0];
      return `PDI_${alunoNome.replace(/\s+/g, '_')}_${date}.pdf`;
    },
    
    exportarPDF() {
      if (!this.form.student_id) {
        this.$showToast('Atenção', 'Selecione um aluno primeiro para gerar o PDF.', 'info');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.$showToast('Erro', 'Token de autenticação não encontrado. Faça login novamente.', 'error');
        return;
      }
      
  const url = buildApiUrl('/pdi/pdf', `student_id=${this.form.student_id}&token=${encodeURIComponent(token)}`);
  window.open(url, '_blank');
    },
    
    getMaxDate() {
      return new Date().toISOString().split('T')[0];
    }
  }
};

// Componente para Plano de Atendimento Individual
const PlanoAtendimento = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Plano de Atendimento Individual</h1>
              <p class="text-gray-600">Planejamento detalhado do atendimento educacional especializado</p>
            </div>
            
            <!-- Botão Gerar PDF -->
            <button v-if="form.id" 
                    @click="generatePDF"
                    :disabled="generatingPDF"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md">
              <i v-if="!generatingPDF" class="fas fa-file-pdf"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              <span>{{ generatingPDF ? 'Gerando...' : 'Gerar PDF' }}</span>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700">Progresso do Plano</span>
            <span class="text-sm text-gray-500">{{ currentStep }}/{{ totalSteps }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-purple-500 to-violet-600 h-3 rounded-full transition-all duration-500 ease-out" 
                 :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="flex justify-between mt-2">
            <span v-for="(step, index) in steps" :key="index" 
                  class="text-xs font-medium transition-colors duration-300"
                  :class="index < currentStep ? 'text-violet-600' : index === currentStep - 1 ? 'text-violet-500' : 'text-gray-400'">
              {{ step.title }}
            </span>
          </div>
        </div>

        <!-- Step Navigation Pills -->
        <div class="flex flex-wrap justify-center gap-2 mb-8">
          <button v-for="(step, index) in steps" :key="index"
                  @click="goToStep(index + 1)"
                  :disabled="index + 1 > maxCompletedStep"
                  class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                  :class="[
                    index + 1 === currentStep 
                      ? 'bg-violet-600 text-white shadow-lg' 
                      : index + 1 <= maxCompletedStep 
                        ? 'bg-white text-violet-600 border border-violet-200 hover:bg-violet-50' 
                        : 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  ]">
            <i :class="step.icon + ' mr-2'"></i>{{ step.title }}
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="salvarPlano" class="relative">
            <!-- Step 1: Identificação do Aluno -->
            <div v-show="currentStep === 1" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-circle text-2xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Identificação do Aluno</h2>
                  <p class="text-gray-600">Dados básicos e informações escolares</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="preencherDadosAlunoPlano" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">{{ aluno.name }}</option>
                    </select>
                  </div>

                  <!-- Dados preenchidos do perfil do aluno -->
                  <div v-if="form.student_id" class="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <h3 class="text-sm font-semibold text-violet-900 mb-3 flex items-center">
                      <i class="fas fa-info-circle mr-2"></i>
                      Dados do perfil do aluno
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span class="font-medium text-violet-700">Escola:</span>
                        <span class="text-violet-600 ml-1">{{ form.escola_origem || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-violet-700">Série/Ano:</span>
                        <span class="text-violet-600 ml-1">{{ form.serie || 'Não informado' }}</span>
                      </div>
                      <div>
                        <span class="font-medium text-violet-700">Turma:</span>
                        <span class="text-violet-600 ml-1">{{ form.turma || 'Não informado' }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="mt-4">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Matrícula <span class="text-red-500">*</span></label>
                    <input v-model="form.matricula" type="text" 
                      placeholder="Número de matrícula do aluno"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 2: Necessidades e Objetivos -->
            <div v-show="currentStep === 2" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-puzzle-piece text-2xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Necessidades e Objetivos</h2>
                  <p class="text-gray-600">Defina as necessidades especiais e objetivos do atendimento</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Deficiência/Transtorno <span class="text-red-500">*</span></label>
                    <select v-model="form.tipo_necessidade" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
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
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Descreva detalhadamente as necessidades educacionais especiais..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Objetivo Geral <span class="text-red-500">*</span></label>
                    <textarea v-model="form.objetivo_geral" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Defina o objetivo principal do atendimento..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Objetivos Específicos <span class="text-red-500">*</span></label>
                    <textarea v-model="form.objetivos_especificos" rows="5" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Liste os objetivos específicos, um por linha..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Atividades e Metodologia -->
            <div v-show="currentStep === 3" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-clipboard-list text-2xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Atividades e Metodologia</h2>
                  <p class="text-gray-600">Defina as atividades propostas e metodologia de ensino</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Atividades Propostas <span class="text-red-500">*</span></label>
                    <textarea v-model="form.atividades" rows="5" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Descreva as atividades que serão desenvolvidas com o aluno..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Metodologia de Ensino <span class="text-red-500">*</span></label>
                    <textarea v-model="form.metodologia" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Explique a metodologia e estratégias pedagógicas..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Recursos Didáticos <span class="text-red-500">*</span></label>
                    <textarea v-model="form.recursos_didaticos" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Liste os recursos didáticos e materiais necessários..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Cronograma e Avaliação -->
            <div v-show="currentStep === 4" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-calendar-alt text-2xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Cronograma e Avaliação</h2>
                  <p class="text-gray-600">Configure os horários e critérios de avaliação</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Frequência Semanal <span class="text-red-500">*</span></label>
                      <select v-model="form.frequencia_semanal" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option value="1">1x por semana</option>
                        <option value="2">2x por semana</option>
                        <option value="3">3x por semana</option>
                        <option value="4">4x por semana</option>
                        <option value="5">5x por semana</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Duração da Sessão <span class="text-red-500">*</span></label>
                      <select v-model="form.duracao_sessao" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="60">60 minutos</option>
                        <option value="90">90 minutos</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Período <span class="text-red-500">*</span></label>
                      <select v-model="form.periodo_atendimento" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                        <option value="noite">Noturno</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Horários Específicos</label>
                    <textarea v-model="form.horarios_especificos" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Ex: Segunda-feira: 14h às 15h, Quarta-feira: 14h às 15h"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Instrumentos de Avaliação</label>
                    <textarea v-model="form.instrumentos_avaliacao" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Descreva os instrumentos que serão utilizados para avaliação..."></textarea>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Critérios de Avaliação</label>
                    <textarea v-model="form.criterios_avaliacao" rows="3" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Defina os critérios para avaliar o progresso..."></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Periodicidade de Revisão</label>
                      <select v-model="form.periodicidade_revisao" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option value="mensal">Mensal</option>
                        <option value="bimestral">Bimestral</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Observações Gerais</label>
                    <textarea v-model="form.observacoes" rows="4" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="Informações adicionais relevantes para o atendimento..."></textarea>
                  </div>

                  <!-- Resumo do Plano -->
                  <div class="bg-violet-50 rounded-lg p-6 mt-8">
                    <h3 class="text-lg font-semibold text-violet-900 mb-4">📅 Resumo do Plano</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span class="font-medium text-gray-700">Aluno:</span>
                        <p class="text-gray-600">{{ (alunos.find(a=>a.id==form.student_id)?.name) || 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Escola:</span>
                        <p class="text-gray-600">{{ form.escola_origem || 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Frequência:</span>
                        <p class="text-gray-600">{{ form.frequencia_semanal ? form.frequencia_semanal + 'x por semana' : 'Não informado' }}</p>
                      </div>
                      <div>
                        <span class="font-medium text-gray-700">Duração:</span>
                        <p class="text-gray-600">{{ form.duracao_sessao ? form.duracao_sessao + ' minutos' : 'Não informado' }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="bg-gray-50 px-8 py-6 flex justify-between items-center">
              <button type="button" @click="previousStep" 
                      :disabled="currentStep === 1"
                      class="flex items-center px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <i class="fas fa-chevron-left mr-2"></i>
                Anterior
              </button>

              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-500">{{ currentStep }} de {{ totalSteps }}</span>
              </div>

              <button v-if="currentStep < totalSteps" type="button" @click="nextStep"
                      class="flex items-center px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 transition-all duration-200">
                Próximo
                <i class="fas fa-chevron-right ml-2"></i>
              </button>

              <button v-else type="submit" :disabled="loading"
                      class="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <i v-else class="fas fa-save mr-2"></i>
                {{ loading ? 'Salvando...' : '📅 Finalizar Plano' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      currentStep: 1,
      totalSteps: 4,
      maxCompletedStep: 1,
      loading: false,
      generatingPDF: false,
      validationErrors: {},
      alunos: [],
      escolas: [],
      form: {
        student_id: '',
        matricula: '',
        escola_origem: '',
        escola_origem_id: '',
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
      },
      steps: [
        { title: 'Identificação', icon: 'fas fa-user-circle' },
        { title: 'Necessidades', icon: 'fas fa-puzzle-piece' },
        { title: 'Atividades', icon: 'fas fa-clipboard-list' },
        { title: 'Cronograma', icon: 'fas fa-calendar-alt' }
      ]
    }
  },

  computed: {
    progressPercentage() {
      return (this.currentStep / (this.totalSteps || 1)) * 100;
    }
  },
  async mounted() {
    await Promise.all([this.carregarAlunos(), this.carregarEscolas()]);
  },
  methods: {
    async carregarAlunos() {
      try {
        let params = {};
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const response = await api.get('/students/options', { params });
        this.alunos = response.data?.data?.rows || [];
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      }
    },
    async carregarEscolas() {
      try {
        const response = await api.get('/schools');
        const d = response.data;
        this.escolas = (d?.data?.rows) || (Array.isArray(d?.data) ? d.data : (Array.isArray(d) ? d : []));
        if (!Array.isArray(this.escolas)) this.escolas = [];
        if (this.escolas.length === 0) {
          this.$showToast && this.$showToast('Atenção', 'Nenhuma escola encontrada. Cadastre uma escola em "Gestão de Escolas".', 'info');
        }
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        this.$showToast && this.$showToast('Erro', 'Não foi possível carregar a lista de escolas.', 'error');
        this.escolas = [];
      }
    },
    async preencherDadosAlunoPlano() {
      const alunoSelecionado = this.alunos.find(aluno => aluno.id == this.form.student_id);
      if (alunoSelecionado) {
        // Preenche dados automaticamente do perfil do aluno
        if (alunoSelecionado.school_name) {
          this.form.escola_origem = alunoSelecionado.school_name;
        }
        if (alunoSelecionado.school_id) {
          this.form.escola_origem_id = alunoSelecionado.school_id;
        }
        if (alunoSelecionado.grade) {
          this.form.serie = alunoSelecionado.grade;
        }
        if (alunoSelecionado.class_name) {
          this.form.turma = alunoSelecionado.class_name;
        }
        // Tentar carregar último Plano de Atendimento deste aluno pelo nome
        try {
          const r = await api.get('/planos-atendimento/list', { params: { q: alunoSelecionado.name, per_page: 1 } });
          const rows = r.data?.data?.rows || r.data?.rows || [];
          const ultimo = Array.isArray(rows) && rows.length ? rows[0] : null;
          if (ultimo && ultimo.nome_aluno === alunoSelecionado.name) {
            this.form.id = ultimo.id;
            // Mapear campos conhecidos existentes no formulário
            const map = ['matricula','escola_origem','tipo_necessidade','descricao_necessidades','objetivo_geral','objetivos_especificos','atividades','metodologia','recursos_didaticos','frequencia_semanal','duracao_sessao','periodo_atendimento','horarios_especificos','instrumentos_avaliacao','criterios_avaliacao','periodicidade_revisao','observacoes'];
            map.forEach(k => { if (ultimo[k] != null) this.form[k] = ultimo[k]; });
          } else {
            delete this.form.id;
          }
        } catch (e) {
          console.warn('Falha ao carregar Plano de Atendimento existente:', e);
        }
      }
    },
    preencherEscolaPlano() {
      const escola = this.escolas.find(e => e.id == this.form.escola_origem_id);
      if (escola) {
        this.form.escola_origem = escola.name;
      }
    },

    goToStep(step) {
      if (step <= this.maxCompletedStep) {
        this.currentStep = step;
      }
    },
    
    nextStep() {
      if (this.validateCurrentStep()) {
        if (this.currentStep < this.totalSteps) {
          this.currentStep++;
          this.maxCompletedStep = Math.max(this.maxCompletedStep, this.currentStep);
        }
      }
    },
    
    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    validateCurrentStep() {
      this.validationErrors = {};
      let isValid = true;
      
      if (this.currentStep === 1) {
        if (!this.form.student_id) {
          this.validationErrors.student_id = 'Selecione um aluno';
          isValid = false;
        }
        if (!this.form.matricula || String(this.form.matricula).trim().length < 2) {
          this.validationErrors.matricula = 'Informe a matrícula (mín. 2 caracteres)';
          isValid = false;
        }
      } else if (this.currentStep === 2) {
        if (!this.form.tipo_necessidade) {
          this.validationErrors.tipo_necessidade = 'Selecione o tipo de necessidade';
          isValid = false;
        }
        if (!this.form.objetivo_geral || String(this.form.objetivo_geral).trim().length < 5) {
          this.validationErrors.objetivo_geral = 'Defina o objetivo geral (mín. 5 caracteres)';
          isValid = false;
        }
        if (!this.form.objetivos_especificos || String(this.form.objetivos_especificos).trim().length < 10) {
          this.validationErrors.objetivos_especificos = 'Liste os objetivos específicos (mín. 10 caracteres)';
          isValid = false;
        }
      } else if (this.currentStep === 3) {
        if (!this.form.atividades || String(this.form.atividades).trim().length < 10) {
          this.validationErrors.atividades = 'Descreva as atividades propostas (mín. 10 caracteres)';
          isValid = false;
        }
        if (!this.form.metodologia || String(this.form.metodologia).trim().length < 10) {
          this.validationErrors.metodologia = 'Explique a metodologia (mín. 10 caracteres)';
          isValid = false;
        }
        if (!this.form.recursos_didaticos || String(this.form.recursos_didaticos).trim().length < 5) {
          this.validationErrors.recursos_didaticos = 'Liste os recursos didáticos (mín. 5 caracteres)';
          isValid = false;
        }
      } else if (this.currentStep === 4) {
        if (!this.form.frequencia_semanal) {
          this.validationErrors.frequencia_semanal = 'Selecione a frequência semanal';
          isValid = false;
        }
        if (!this.form.duracao_sessao) {
          this.validationErrors.duracao_sessao = 'Selecione a duração da sessão';
          isValid = false;
        }
        if (!this.form.periodo_atendimento) {
          this.validationErrors.periodo_atendimento = 'Selecione o período de atendimento';
          isValid = false;
        }
      }
      
      return isValid;
    },

    async salvarPlano() {
      if (!this.validateCurrentStep()) {
        this.$showToast && this.$showToast('Atenção', 'Preencha os campos obrigatórios antes de finalizar o plano.', 'warning');
        return;
      }
      
      this.loading = true;
      try {
        // Preparar form_data removendo campos de controle
        const formData = { ...this.form };
        delete formData.id;
        delete formData.student_id;
        delete formData.pdi_id;
        
        // Estrutura que o backend espera
        const payload = {
          student_id: this.form.student_id,
          pdi_id: this.form.pdi_id || null,
          form_data: formData,
          data_inicio: this.form.data_inicio || null,
          data_fim: this.form.data_fim || null,
          status: 'ativo'
        };
        
        
        // Sempre usar .create que faz UPSERT automático
        const response = await api.post('?action=plano-atendimento.create', payload);
        
        
        if (response.data?.ok) {
          // Atualizar ID se foi criado
          if (response.data.data?.id) {
            this.form.id = response.data.data.id;
          }
          const nomeAlunoPlano = (this.alunos.find(a=>a.id==this.form.student_id)?.name) || 'Aluno';
          this.$showToast('Sucesso', `Plano de Atendimento de "${nomeAlunoPlano}" salvo com sucesso!`, 'success');
          // Não redirecionar automaticamente para permitir gerar PDF
        } else {
          this.$showToast('Erro', response.data?.error || 'Erro ao salvar plano', 'error');
        }
      } catch (error) {
        this.$showToast('Erro', 'Erro ao salvar plano: ' + (error.response?.data?.message || error.message), 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async generatePDF() {
      if (!this.form.id) {
        this.$showToast('Atenção', 'Salve o plano antes de gerar o PDF.', 'info');
        return;
      }
      
      this.generatingPDF = true;
      
      try {
        const baseURL = CONFIG.API_BASE.replace(/\/api\.php$/, '');
        const endpoint = '/generate-pdf-pai.php';
        
        const res = await fetch(`${baseURL}${endpoint}?id=${this.form.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.ok) {
          let errorMsg = 'Erro ao gerar PDF';
          try {
            const error = await res.json();
            errorMsg = error.error || errorMsg;
          } catch (e) {
            // Response não é JSON
          }
          throw new Error(errorMsg);
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
        this.$showToast('Erro', '❌ ' + err.message, 'error');
      } finally {
        this.generatingPDF = false;
      }
    },
    
    getPDFFilename() {
      const alunoNome = this.alunos.find(a => a.id == this.form.student_id)?.name || 'Aluno';
      const date = new Date().toISOString().split('T')[0];
      return `PAI_${alunoNome.replace(/\s+/g, '_')}_${date}.pdf`;
    },
    
    getMaxDate() {
      return new Date().toISOString().split('T')[0];
    }
  }
};

// Componente de Relatório de Atendimento
const RelatorioAtendimento = {
  template: `
    <div class="max-w-6xl mx-auto p-6 space-y-6">
      <div class="bg-white shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Relatório de Atendimento</h1>
        
        <!-- Barra de Progresso -->
        <div class="mb-8">
          <div class="flex items-center justify-between mb-2">
            <div class="text-sm font-medium text-gray-600">Progresso</div>
            <div class="text-sm font-medium text-amber-600">{{ Math.round((currentStep / (totalSteps || 1)) * 100) }}%</div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all duration-300" 
                 :style="{ width: (currentStep / (totalSteps || 1)) * 100 + '%' }"></div>
          </div>
        </div>

        <!-- Indicadores de Etapas -->
        <div class="flex justify-between mb-8">
          <div v-for="(step, index) in steps" :key="index" 
               class="flex flex-col items-center cursor-pointer transition-all duration-200"
               @click="goToStep(index)">
            <div class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200"
                 :class="index < currentStep ? 'bg-amber-500 border-amber-500 text-white' : 
                         index === currentStep ? 'bg-amber-100 border-amber-500 text-amber-700' : 
                         'bg-gray-100 border-gray-300 text-gray-600'">
              <i :class="step.icon"></i>
            </div>
            <span class="text-xs mt-2 text-center max-w-20"
                  :class="index <= currentStep ? 'text-amber-600 font-medium' : 'text-gray-700'">
              {{ step.title }}
            </span>
          </div>
        </div>
        
        <form @submit.prevent="save" class="space-y-6">
          <!-- Etapa 1: Identificação -->
          <div v-if="currentStep === 0" class="space-y-6">
            <div class="border-l-4 border-amber-500 pl-4 mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Identificação do Atendimento</h2>
              <p class="text-sm text-gray-600">Selecione o aluno e a data do atendimento</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-user text-amber-500 mr-1"></i>
                  Aluno *
                </label>
                <select v-model="form.student_id" 
                        @change="loadStudentData"
                        class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                        required>
                  <option value="">Selecione um aluno</option>
                  <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
                    {{ aluno.name }}
                  </option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-calendar text-amber-500 mr-1"></i>
                  Data do Atendimento *
                </label>
                <input type="date" 
                       v-model="form.data_atendimento" 
                       class="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500" 
                       required>
              </div>
            </div>
          </div>

          <!-- Etapa 2: Descrição (com gravação) -->
          <div v-if="currentStep === 1" class="space-y-6">
            <div class="border-l-4 border-amber-500 pl-4 mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Descrição do Atendimento</h2>
              <p class="text-sm text-gray-600">Descreva detalhadamente o que foi realizado no atendimento</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-file-alt text-amber-500 mr-1"></i>
                Descrição do Atendimento *
              </label>
              
              <!-- Controles de gravação -->
              <div class="mb-3 flex items-center space-x-3">
                <button type="button" 
                        @click="toggleRecording" 
                        :disabled="isProcessingAudio"
                        class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="isRecording 
                          ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                          : 'bg-amber-100 text-amber-700 hover:bg-amber-200'">
                  <i :class="isRecording ? 'fas fa-stop' : 'fas fa-microphone'"></i>
                  <span>{{ isRecording ? 'Parar Gravação' : 'Gravar Áudio' }}</span>
                </button>
                
                <!-- Indicador de gravação -->
                <div v-if="isRecording" class="flex items-center space-x-2 text-red-600">
                  <div class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                  <span class="text-sm font-medium">{{ Math.floor(recordingTime / 60) }}:{{ String(recordingTime % 60).padStart(2, '0') }}</span>
                </div>
                
                <!-- Instruções -->
                <div class="text-xs text-gray-500">
                  Clique no microfone para gravar ou digite diretamente
                </div>
              </div>
                
              <!-- Status de processamento -->
              <div v-if="isProcessingAudio" class="bg-amber-50 border border-amber-200 rounded p-3 mb-3">
                <div class="flex items-center space-x-2">
                  <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                  <span class="text-sm text-amber-700">Convertendo áudio para texto...</span>
                </div>
              </div>
              
              <!-- Textarea para descrição -->
              <textarea v-model="form.descricao"
                        rows="8"
                        placeholder="Digite ou grave a descrição detalhada do atendimento..."
                        ref="descricaoField"
                        data-voice-field="descricao"
                        @focus="setVoiceTarget('descricao', $event)"
                        :class="fieldInputClass('descricao')"
                        required></textarea>

              <div class="flex justify-end mt-2">
                <button type="button"
                        @click="speak(form.descricao)"
                        :disabled="!form.descricao || isProcessingAudio"
                        class="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                        :class="(!form.descricao || isProcessingAudio)
                          ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'">
                  <i class="fas fa-volume-up"></i>
                  <span>Ouvir descrição</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Etapa 3: Objetivos e Recursos -->
          <div v-if="currentStep === 2" class="space-y-6">
            <div class="border-l-4 border-amber-500 pl-4 mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Objetivos e Recursos</h2>
              <p class="text-sm text-gray-600">Informe os objetivos trabalhados e recursos utilizados</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-bullseye text-amber-500 mr-1"></i>
                  Objetivos Trabalhados
                </label>
                <textarea v-model="form.objetivos"
                          rows="5"
                          ref="objetivosField"
                          data-voice-field="objetivos"
                          @focus="setVoiceTarget('objetivos', $event)"
                          :class="fieldInputClass('objetivos')"
                          placeholder="Descreva os objetivos específicos trabalhados durante o atendimento..."></textarea>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  <i class="fas fa-tools text-amber-500 mr-1"></i>
                  Recursos Utilizados
                </label>
                <textarea v-model="form.recursos"
                          rows="5"
                          ref="recursosField"
                          data-voice-field="recursos"
                          @focus="setVoiceTarget('recursos', $event)"
                          :class="fieldInputClass('recursos')"
                          placeholder="Liste os materiais, jogos, tecnologias e outros recursos utilizados..."></textarea>
              </div>
            </div>
          </div>

          <!-- Etapa 4: Observações e Finalização -->
          <div v-if="currentStep === 3" class="space-y-6">
            <div class="border-l-4 border-amber-500 pl-4 mb-6">
              <h2 class="text-lg font-semibold text-gray-900">Observações e Progressos</h2>
              <p class="text-sm text-gray-600">Registre observações importantes e progressos identificados</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                <i class="fas fa-chart-line text-amber-500 mr-1"></i>
                Observações e Progressos
              </label>
              <textarea v-model="form.observacoes"
                        rows="6"
                        ref="observacoesField"
                        data-voice-field="observacoes"
                        @focus="setVoiceTarget('observacoes', $event)"
                        :class="fieldInputClass('observacoes')"
                        placeholder="Descreva progressos observados, dificuldades encontradas, recomendações para próximos atendimentos..."></textarea>
            </div>

            <!-- Resumo dos dados -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 class="font-medium text-amber-800 mb-3">
                <i class="fas fa-clipboard-check mr-1"></i>
                Resumo do Relatório
              </h3>
              <div class="space-y-2 text-sm">
                <div><strong>Aluno:</strong> {{ getStudentName(form.student_id) || 'Não selecionado' }}</div>
                <div><strong>Data:</strong> {{ formatDate(form.data_atendimento) }}</div>
                <div><strong>Descrição:</strong> {{ form.descricao ? (form.descricao.length > 100 ? form.descricao.substring(0, 100) + '...' : form.descricao) : 'Não informada' }}</div>
                <div><strong>Objetivos:</strong> {{ form.objetivos || 'Não informados' }}</div>
                <div><strong>Recursos:</strong> {{ form.recursos || 'Não informados' }}</div>
              </div>
            </div>
          </div>

          <!-- Navegação -->
            <div class="flex justify-between pt-6 border-t">
            <button type="button" 
                    @click="previousStep" 
                    :disabled="currentStep === 0 || loading || isProcessingAudio"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
              <i class="fas fa-arrow-left mr-1"></i>
              Anterior
            </button>
            
            <div class="flex space-x-3">
              <button type="button" 
                      @click="cancel" 
                      :disabled="loading || isProcessingAudio"
                      class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                Cancelar
              </button>
              
              <button v-if="currentStep < totalSteps - 1" 
                      type="button" 
                      @click="nextStep"
                      :disabled="!canProceed || loading || isProcessingAudio"
                      class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed">
                Próximo
                <i class="fas fa-arrow-right ml-1"></i>
              </button>
              
              <button v-else 
                      type="submit" 
                      :disabled="loading || !canProceed"
                      class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50">
                <i class="fas fa-save mr-1"></i>
                <span v-if="loading">Salvando...</span>
                <span v-else>Salvar Relatório</span>
              </button>
              
              <!-- Botão PDF -->
              <button v-if="form.student_id" type="button" @click="exportarPDF"
                      :disabled="loading || isProcessingAudio"
                      class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                <i class="fas fa-file-pdf mr-1"></i>
                📄 Exportar PDF
              </button>
            </div>
          </div>
        </form>
      </div>

      <!-- Lista de relatórios -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Relatórios Anteriores</h2>
        <div v-if="loadingRelatorios" class="text-sm text-gray-500 py-2 flex items-center gap-2">
          <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></span>
          Carregando relatórios...
        </div>
        <div v-if="!relatorios || relatorios.length === 0" class="text-center text-gray-500 py-8">
          Nenhum relatório de atendimento encontrado.
        </div>
        <div v-else class="space-y-4">
          <div v-for="r in relatorios" :key="r.id" class="border rounded-lg p-4 hover:bg-gray-50">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-sm font-medium text-gray-900">{{ r.student_name || 'Aluno não encontrado' }}</h3>
                  <span class="text-xs text-gray-500">{{ formatDate(r.data_atendimento) }}</span>
                </div>
                <p class="text-sm text-gray-600 line-clamp-2">{{ r.descricao }}</p>
              </div>
              <div class="flex space-x-2">
                <button @click="edit(r)" :disabled="loading || isProcessingAudio" class="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed">Editar</button>
                <button @click="deleteRelatorio(r)"
                        :disabled="deletingId===r.id || loading"
                        class="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                  <span v-if="deletingId===r.id" class="inline-flex items-center gap-1">
                    <span class="animate-spin rounded-full h-3 w-3 border-b-2 border-red-600"></span>
                    Excluindo...
                  </span>
                  <span v-else>Excluir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      currentStep: 0,
      totalSteps: 4,
      steps: [
        { title: 'Identificação', icon: 'fas fa-id-card' },
        { title: 'Descrição', icon: 'fas fa-file-alt' },
        { title: 'Objetivos', icon: 'fas fa-bullseye' },
        { title: 'Finalização', icon: 'fas fa-check-circle' }
      ],
      form: {
        id: null,
        student_id: '',
        data_atendimento: new Date().toISOString().split('T')[0],
        descricao: '',
        objetivos: '',
        recursos: '',
        observacoes: ''
      },
      alunos: [],
      relatorios: [],
      loading: false,
      loadingRelatorios: false,
      loadingStudents: false,
      deletingId: null,
      isRecording: false,
      isProcessingAudio: false,
      recordingTime: 0,
      mediaRecorder: null,
      audioChunks: [],
      recordingTimer: null,
      voiceTargetField: 'descricao',
      voiceTargetElement: null,
      voiceHighlightActive: false,
      voiceHighlightTimeout: null,
      fieldRefMap: {
        descricao: 'descricaoField',
        objetivos: 'objetivosField',
        recursos: 'recursosField',
        observacoes: 'observacoesField'
      }
    }
  },
  async mounted() {
    await this.loadStudents();
    await this.loadRelatorios();
    this.$nextTick(() => {
      this.ensureVoiceTarget();
    });
  },
  computed: {
    canProceed() {
      switch (this.currentStep) {
        case 0:
          return this.form.student_id && this.form.data_atendimento;
        case 1:
          return this.form.descricao && this.form.descricao.trim().length > 0;
        case 2:
          return true; // Objetivos e recursos são opcionais
        case 3:
          return true; // Observações são opcionais
        default:
          return false;
      }
    }
  },
  methods: {
    nextStep() {
      if (this.canProceed && this.currentStep < this.totalSteps - 1) {
        this.currentStep++;
      }
    },
    
    previousStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    
    goToStep(stepIndex) {
      if (stepIndex >= 0 && stepIndex < this.totalSteps) {
        this.currentStep = stepIndex;
      }
    },
    
    getStudentName(studentId) {
      const student = this.alunos.find(s => s.id == studentId);
      return student ? student.name : '';
    },
    async loadStudents() {
      try {
        this.loadingStudents = true;
        let params = {};
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const r = await api.get('/students/options', { params });
        this.alunos = (r.data?.data) || [];
      } catch (e) {
        console.error('Erro ao carregar alunos:', e);
      } finally {
        this.loadingStudents = false;
      }
    },
    
    async loadRelatorios() {
      try {
        this.loadingRelatorios = true;
        let params = { _ts: Date.now() };
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const r = await api.get('/atendimentos', { params });
        this.relatorios = (r.data?.data?.rows) || [];
      } catch (e) {
        console.error('Erro ao carregar relatórios:', e);
      } finally {
        this.loadingRelatorios = false;
      }
    },

    fieldInputClass(fieldKey) {
      const baseClasses = 'border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-150';
      const highlightClasses = (this.voiceTargetField === fieldKey && this.voiceHighlightActive)
        ? 'border-amber-500 ring-2 ring-amber-400 bg-amber-50 shadow-sm'
        : 'border-gray-300';
      return [baseClasses, highlightClasses];
    },

    setVoiceTarget(fieldKey, event) {
      this.voiceTargetField = fieldKey;
      this.voiceTargetElement = event?.target || this.getFieldElement(fieldKey);
      if (this.isRecording || this.isProcessingAudio || this.voiceHighlightActive) {
        this.activateVoiceHighlight();
      }
    },

    getFieldElement(fieldKey) {
      const refName = this.fieldRefMap[fieldKey];
      if (!refName) return null;
      const ref = this.$refs[refName];
      if (!ref) return null;
      return Array.isArray(ref) ? ref[0] : ref;
    },

    ensureVoiceTarget() {
      if (!this.voiceTargetField || !Object.prototype.hasOwnProperty.call(this.form, this.voiceTargetField)) {
        this.voiceTargetField = 'descricao';
      }
      const el = this.getFieldElement(this.voiceTargetField);
      if (el && document.contains(el)) {
        this.voiceTargetElement = el;
      }
    },

    activateVoiceHighlight(durationMs = null) {
      this.voiceHighlightActive = true;
      if (this.voiceHighlightTimeout) {
        clearTimeout(this.voiceHighlightTimeout);
        this.voiceHighlightTimeout = null;
      }
      if (durationMs && durationMs > 0) {
        this.voiceHighlightTimeout = setTimeout(() => {
          this.voiceHighlightActive = false;
          this.voiceHighlightTimeout = null;
        }, durationMs);
      }
    },

    deactivateVoiceHighlight() {
      if (this.voiceHighlightTimeout) {
        clearTimeout(this.voiceHighlightTimeout);
        this.voiceHighlightTimeout = null;
      }
      this.voiceHighlightActive = false;
    },

    isVoiceEditableElement(el) {
      if (!el) return false;
      const tag = (el.tagName || '').toUpperCase();
      if (tag === 'TEXTAREA') return true;
      if (tag === 'INPUT') {
        const type = (el.type || '').toLowerCase();
        return ['text', 'search', 'tel', 'url', 'email', 'number'].includes(type);
      }
      return false;
    },

    insertTranscription(text) {
      if (!text) return;

      const activeEl = document.activeElement;
      if (this.isVoiceEditableElement(activeEl) && activeEl?.dataset?.voiceField) {
        this.voiceTargetField = activeEl.dataset.voiceField;
        this.voiceTargetElement = activeEl;
      }

      const targetKey = (this.voiceTargetField && Object.prototype.hasOwnProperty.call(this.form, this.voiceTargetField))
        ? this.voiceTargetField
        : 'descricao';

      if (!Object.prototype.hasOwnProperty.call(this.form, targetKey)) {
        console.warn('⚠️ Campo de voz não encontrado:', targetKey);
        return;
      }

      let targetEl = this.voiceTargetElement;
      if (!targetEl || !this.isVoiceEditableElement(targetEl) || !document.contains(targetEl)) {
        targetEl = this.getFieldElement(targetKey);
      }

      const hasEditableTarget = targetEl && this.isVoiceEditableElement(targetEl) && document.contains(targetEl);

      if (hasEditableTarget) {
        const currentValue = targetEl.value ?? '';
        const selectionStart = typeof targetEl.selectionStart === 'number' ? targetEl.selectionStart : currentValue.length;
        const selectionEnd = typeof targetEl.selectionEnd === 'number' ? targetEl.selectionEnd : currentValue.length;
        const before = currentValue.slice(0, selectionStart);
        const after = currentValue.slice(selectionEnd);
        const newValue = before + text + after;

        this.form[targetKey] = newValue;
        this.voiceTargetElement = targetEl;

        this.$nextTick(() => {
          targetEl.value = newValue;
          try {
            targetEl.focus();
            const cursorPos = before.length + text.length;
            targetEl.setSelectionRange(cursorPos, cursorPos);
          } catch (_) {}
          targetEl.dispatchEvent(new Event('input', { bubbles: true }));
        });
      } else {
        const current = this.form[targetKey] || '';
        this.form[targetKey] = current ? `${current.trimEnd()}\n\n${text}` : text;
      }
    },

    async toggleRecording() {
      if (this.isRecording) {
        await this.stopRecording();
      } else {
        await this.startRecording();
      }
    },

    async startRecording() {
      try {
        this.ensureVoiceTarget();
        this.activateVoiceHighlight();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];
        this.recordingTime = 0;

        this.mediaRecorder.ondataavailable = (event) => {
          this.audioChunks.push(event.data);
        };

        this.mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
          await this.processAudio(audioBlob);

          // Parar todas as tracks de áudio
          stream.getTracks().forEach(track => track.stop());
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        
        // Timer para mostrar tempo de gravação
        this.recordingTimer = setInterval(() => {
          this.recordingTime++;
        }, 1000);

      } catch (error) {
        console.error('Erro ao iniciar gravação:', error);
        this.$showToast('Erro', 'Erro ao acessar o microfone. Verifique as permissões.', 'error');
        this.deactivateVoiceHighlight();
      }
    },

    async stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        // Verificar se a gravação tem pelo menos 1 segundo
        if (this.recordingTime < 1) {
          this.$showToast('Atenção', 'Grave pelo menos 1 segundo de áudio para uma transcrição adequada.', 'info');
          return;
        }
        
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }
      }
    },

    async processAudio(audioBlob) {
      this.isProcessingAudio = true;
      this.activateVoiceHighlight();

      try {
        // Validar tamanho do blob antes de enviar
        if (audioBlob.size < 1000) { // Menos de 1KB
          throw new Error('Áudio muito curto. Grave pelo menos 1 segundo.');
        }
        
        // Integração real com backend (OpenAI Whisper via PHP):
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.wav');

        const { data } = await api.post('/voice/transcribe', formData, {
          // Não definir Content-Type manualmente para permitir boundary automático
          timeout: 120000
        });

        const transcricao = data?.data?.text || '';
        if (!transcricao) {
          throw new Error('Transcrição vazia - tente falar mais claramente');
        }

        this.ensureVoiceTarget();
        this.insertTranscription(transcricao);

        this.$showToast('Sucesso', 'Áudio transcrito com sucesso!', 'success');
        
      } catch (error) {
        console.error('Erro ao processar áudio:', error);
        const msg = error.response?.data?.error || error.message || 'Erro ao converter áudio para texto.';
        this.$showToast('Erro', msg, 'error');
      } finally {
        this.isProcessingAudio = false;
        this.activateVoiceHighlight(2000);
      }
    },

    async save() {
      this.loading = true;
      try {
        const { id, ...rest } = this.form || {};
        const payload = { ...rest };
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          payload.teacher_id = this.$parent.user.id;
        }

        let r;
        if (id) {
          r = await api.post(`/atendimentos/${id}`, payload);
        } else {
          r = await api.post('/atendimentos', payload);
        }
        if (r.data?.ok) {
          this.$showToast('Sucesso', id ? 'Relatório atualizado com sucesso!' : 'Relatório salvo com sucesso!', 'success');
          this.cancel();
          await this.loadRelatorios();
        } else {
          this.$showToast('Erro', r.data?.error || 'Erro ao salvar relatório', 'error');
        }
      } catch (e) {
        this.$showToast('Erro', 'Erro ao salvar relatório', 'error');
      } finally {
        this.loading = false;
      }
    },

    async speak(text) {
      try {
        if (!text) return;
        const resp = await api.post('/voice/tts', { text, voice: 'alloy', format: 'mp3' }, { responseType: 'arraybuffer' });
        const blob = new Blob([resp.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } catch (err) {
        console.error('Erro no TTS:', err);
        this.$showToast('Erro', 'Falha ao sintetizar fala.', 'error');
      }
    },

    cancel() {
      this.currentStep = 0;
      this.form = {
        id: null,
        student_id: '',
        data_atendimento: new Date().toISOString().split('T')[0],
        descricao: '',
        objetivos: '',
        recursos: '',
        observacoes: ''
      };
      this.voiceTargetField = 'descricao';
      this.voiceTargetElement = null;
      this.deactivateVoiceHighlight();
      this.$nextTick(() => this.ensureVoiceTarget());
    },

    edit(relatorio) {
      this.form = { 
        id: relatorio.id, 
        student_id: relatorio.student_id, 
        data_atendimento: relatorio.data_atendimento,
        descricao: relatorio.descricao || '',
        objetivos: relatorio.objetivos || '',
        recursos: relatorio.recursos || '',
        observacoes: relatorio.observacoes || ''
      };
      // Leva o usuário para a primeira etapa para revisar/atualizar
      this.currentStep = 0;
    },

    async deleteRelatorio(relatorio) {
      const confirmed = await this.$confirmToast(
        'Confirmar exclusão',
        'Deseja realmente excluir este relatório de atendimento? Esta ação não pode ser desfeita.',
        { confirmText: 'Excluir', cancelText: 'Cancelar', type: 'warning', timeoutMs: 15000 }
      );
      if (!confirmed) return;
      try {
        this.deletingId = relatorio.id;
        const r = await api.delete(`/atendimentos/${relatorio.id}`);
        if (r.data?.ok) {
          this.$showToast('Sucesso', 'Relatório excluído', 'success');
          // Remover localmente e recarregar
          this.relatorios = (this.relatorios || []).filter(x => x.id !== relatorio.id);
          await this.loadRelatorios();
        } else {
          this.$showToast('Erro', r.data?.error || 'Erro ao excluir relatório', 'error');
        }
      } catch (e) {
        console.error(e);
        const status = e.response?.status;
        if (status === 403) this.$showToast('Sem permissão', 'Você não tem permissão para excluir este relatório.', 'warning');
        else if (status === 404) this.$showToast('Não encontrado', 'O relatório já não existe mais.', 'info');
        else this.$showToast('Erro', 'Erro ao excluir relatório', 'error');
      } finally {
        this.deletingId = null;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('pt-BR');
    },

    loadStudentData() {
      // Carregar dados específicos do aluno se necessário
    },
    
    exportarPDF() {
      if (!this.form.student_id) {
        this.$showToast('Atenção', 'Selecione um aluno primeiro para gerar o PDF.', 'info');
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        this.$showToast('Erro', 'Token de autenticação não encontrado. Faça login novamente.', 'error');
        return;
      }
      
  const url = buildApiUrl('/pai/pdf', `student_id=${this.form.student_id}&token=${encodeURIComponent(token)}`);
  window.open(url, '_blank');
    }
  },
  beforeUnmount() {
    this.deactivateVoiceHighlight();
  }
};

// Componente Documentos Gerados
const DocumentosGerados = {
  template: `
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900">
        📄 Documentos Gerados
      </h1>
      <button @click="refreshStats" 
              class="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
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
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
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
                  class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
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
                 class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Data Fim
          </label>
          <input type="date" 
                 v-model="filters.data_fim"
                 class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
        </div>
      </div>
      
      <div class="mt-4 flex space-x-2">
        <button @click="loadDocuments" 
                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          🔍 Filtrar
        </button>
        <button @click="clearFilters" 
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
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
              <i v-else-if="doc.tipo === 'pdi'" class="fas fa-chart-line text-green-500"></i>
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
                  class="text-red-600 hover:text-red-800 transition-colors">
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
                class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center space-x-2 transition-colors">
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
              class="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
        ← Anterior
      </button>
      
      <span class="text-sm text-gray-600">
        Página {{ pagination.current_page }} de {{ pagination.total_pages }}
      </span>
      
      <button @click="goToPage(pagination.current_page + 1)"
              :disabled="!pagination.has_next"
              class="px-3 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed">
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
        this.$showToast && this.$showToast('Erro', 'Erro ao carregar documentos', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    async loadStudents() {
      try {
        let params = {};
        if (this.$parent.user && this.$parent.user.role !== 'admin') {
          params.teacher_id = this.$parent.user.id;
        }
        const res = await api.get('/students/options', { params });
        this.students = res.data?.data || [];
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
        const baseURL = CONFIG.API_BASE.replace(/\/api\.php$/, '');
        const res = await fetch(`${baseURL}/api.php?action=documentos.download&id=${doc.id}`, {
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
        this.$showToast && this.$showToast('Erro', 'Erro ao baixar documento', 'error');
      }
    },
    
    async deleteDocument(doc) {
      if (!confirm(`Deseja deletar o documento "${doc.titulo}"?`)) return;
      
      try {
        const res = await api.delete(`/documentos/delete?id=${doc.id}`);
        
        if (res.data.ok) {
          this.$showToast && this.$showToast('Sucesso', 'Documento deletado com sucesso', 'success');
          this.loadDocuments();
          this.loadStats();
        }
      } catch (err) {
        console.error('Erro ao deletar:', err);
        this.$showToast && this.$showToast('Erro', 'Erro ao deletar documento', 'error');
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
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'});
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
      { path: 'usuarios', component: UsuariosTW },
      // Mantém rota dentro do layout para usuários logados também
      { path: 'escolas', component: EscolasTW },
      { path: 'supervisao', component: SupervisaoTW },
      { path: 'relatorio-atendimento', component: RelatorioAtendimento },
      { path: 'entrevista-responsavel', component: EntrevistaResponsavel },
      { path: 'entrevista-completa', component: window.EntrevistaResponsavelCompleta || EntrevistaResponsavel },
      { path: 'pdi', component: PDI },
      { path: 'pdi-completo', component: window.PDICompleto || PDI },
      { path: 'plano-atendimento', component: PlanoAtendimento },
      { path: 'pai-completo', component: window.PAICompleto || PlanoAtendimento },
      { path: 'relatorios', component: Relatorios },
      { path: 'legislacoes', component: LegislacoesTW },
      { path: 'documentos', component: DocumentosGerados }
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
  components: {
    // PainelDesenvolvimento: window.PainelDesenvolvimento
  },
  template: `
    <div>
      <!-- <PainelDesenvolvimento /> -->
      <router-view></router-view>
      
      <!-- Toast Container -->
      <div class="fixed top-4 right-4 z-50 space-y-2" style="max-width: 400px;">
        <div v-for="toast in toasts" :key="toast.id" 
             class="transform transition-all duration-300 ease-in-out opacity-100 translate-x-0"
             :class="[toastClasses(toast.type), toast.visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full']">
          <div class="flex items-start p-4 rounded-lg shadow-lg border-l-4" :class="toastBorderColor(toast.type)">
            <div class="flex-shrink-0">
              <i :class="toastIcon(toast.type)" class="text-xl"></i>
            </div>
            <div class="ml-3 flex-1">
              <h4 v-if="toast.title" class="text-sm font-semibold" :class="toastTextColor(toast.type)">
                {{ toast.title }}
              </h4>
              <p class="text-sm text-gray-700 mt-1">{{ toast.message }}</p>
              <div v-if="toast.actions && toast.actions.length" class="mt-3 flex justify-end space-x-2">
                <button
                  v-for="(action, idx) in toast.actions"
                  :key="idx"
                  @click="handleToastAction(toast, action)"
                  class="px-3 py-1.5 rounded text-sm font-medium focus:outline-none"
                  :class="{
                    'bg-red-600 text-white hover:bg-red-700': action.style === 'danger',
                    'bg-blue-600 text-white hover:bg-blue-700': action.style === 'primary',
                    'bg-gray-100 text-gray-700 hover:bg-gray-200': !action.style || action.style === 'secondary'
                  }"
                >
                  <i v-if="action.icon" :class="[action.icon, 'mr-2']"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
            <button @click="removeToast(toast.id)" 
                    class="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none">
              <i class="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Microfone Flutuante Global -->
      <FloatingMicrophone></FloatingMicrophone>
    </div>
  `,
  data() {
    return {
      user: null, // User global - será preenchido pelo Layout
      loading: true,
      toasts: [],
      toastIdCounter: 0,
      // Voice modal (reutilizável)
      voiceModal: {
        open: false,
        targetSetter: null, // função que recebe o texto transcrito
        targetEl: null, // textarea/input alvo (DOM)
        isRecording: false,
        isProcessing: false,
        recordingTime: 0,
        mediaRecorder: null,
        audioChunks: [],
        timer: null
      }
    }
  },
  computed: {},
  methods: {
    showToast(title, message, type = 'info', duration = 5000, actions = null) {
      const toast = {
        id: ++this.toastIdCounter,
        title,
        message,
        type,
        visible: true,
        actions
      };
      
      this.toasts.push(toast);
      
      // Auto-remove after duration
      if (duration > 0) {
        setTimeout(() => {
          this.removeToast(toast.id);
        }, duration);
      }
    },
    handleToastAction(toast, action) {
      try {
        if (action && typeof action.onClick === 'function') action.onClick();
      } finally {
        // sempre fechar após ação
        this.removeToast(toast.id);
      }
    },
    // Retorna uma Promise resolvendo true/false
    confirmToast(title, message, opts = {}) {
      const {
        confirmText = 'Confirmar',
        cancelText = 'Cancelar',
        type = 'warning',
        timeoutMs = 10000
      } = opts;

      return new Promise((resolve) => {
        const id = ++this.toastIdCounter;
        const toast = {
          id,
          title,
          message,
          type,
          visible: true,
          actions: [
            { label: cancelText, style: 'secondary', icon: 'fas fa-times', onClick: () => resolve(false) },
            { label: confirmText, style: 'danger', icon: 'fas fa-trash', onClick: () => resolve(true) }
          ]
        };
        this.toasts.push(toast);

        // Auto-cancel após timeout
        if (timeoutMs && timeoutMs > 0) {
          setTimeout(() => {
            const idx = this.toasts.findIndex(t => t.id === id);
            if (idx > -1) {
              this.toasts[idx].visible = false;
              setTimeout(() => this.toasts.splice(idx, 1), 300);
              resolve(false);
            }
          }, timeoutMs);
        }
      });
    },
    removeToast(id) {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index > -1) {
        // Fade out animation
        this.toasts[index].visible = false;
        setTimeout(() => {
          this.toasts.splice(index, 1);
        }, 300);
      }
    },
    toastClasses(type) {
      const classes = {
        success: 'bg-green-50 text-green-800',
        error: 'bg-red-50 text-red-800',
        warning: 'bg-yellow-50 text-yellow-800',
        info: 'bg-blue-50 text-blue-800'
      };
      return classes[type] || classes.info;
    },
    toastBorderColor(type) {
      const colors = {
        success: 'border-green-400',
        error: 'border-red-400',
        warning: 'border-yellow-400',
        info: 'border-blue-400'
      };
      return colors[type] || colors.info;
    },
    toastIcon(type) {
      const icons = {
        success: 'fas fa-check-circle text-green-500',
        error: 'fas fa-times-circle text-red-500',
        warning: 'fas fa-exclamation-triangle text-yellow-500',
        info: 'fas fa-info-circle text-blue-500'
      };
      return icons[type] || icons.info;
    },
    toastTextColor(type) {
      const colors = {
        success: 'text-green-800',
        error: 'text-red-800',
        warning: 'text-yellow-800',
        info: 'text-blue-800'
      };
      return colors[type] || colors.info;
    },
    // ===== Voice capture (global modal) =====
    openVoiceModal(setterFn) {
      this.voiceModal.targetSetter = setterFn;
      this.voiceModal.targetEl = null;
      this.voiceModal.open = true;
      this.voiceModal.isRecording = false;
      this.voiceModal.isProcessing = false;
      this.voiceModal.recordingTime = 0;
      this.voiceModal.audioChunks = [];
    },
    openVoiceModalForActive(targetEl = null) {
      // Abre modal e define o elemento alvo (textarea) para inserir o texto
      this.voiceModal.targetSetter = null;
      this.voiceModal.targetEl = targetEl || document.activeElement || null;
      this.voiceModal.open = true;
      this.voiceModal.isRecording = false;
      this.voiceModal.isProcessing = false;
      this.voiceModal.recordingTime = 0;
      this.voiceModal.audioChunks = [];
    },
    closeVoiceModal() {
      if (this.voiceModal.isRecording) {
        try { this.stopVoiceRecording(); } catch (_) {}
      }
      this.voiceModal.open = false;
      this.voiceModal.targetSetter = null;
      this.voiceModal.targetEl = null;
    },
    async toggleVoiceRecording() {
      if (this.voiceModal.isRecording) return this.stopVoiceRecording();
      return this.startVoiceRecording();
    },
    async startVoiceRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const rec = new MediaRecorder(stream);
        this.voiceModal.mediaRecorder = rec;
        this.voiceModal.audioChunks = [];
        this.voiceModal.recordingTime = 0;
        rec.ondataavailable = (e) => this.voiceModal.audioChunks.push(e.data);
        rec.onstop = async () => {
          const audioBlob = new Blob(this.voiceModal.audioChunks, { type: 'audio/wav' });
          // parar tracks
          stream.getTracks().forEach(t => t.stop());
          await this.processVoiceAudio(audioBlob);
        };
        rec.start();
        this.voiceModal.isRecording = true;
        this.voiceModal.timer = setInterval(() => { this.voiceModal.recordingTime++; }, 1000);
      } catch (err) {
        console.error('Erro ao acessar microfone:', err);
        this.$showToast('Erro', 'Erro ao acessar o microfone. Verifique permissões.', 'error');
      }
    },
    stopVoiceRecording() {
      if (!this.voiceModal.mediaRecorder || !this.voiceModal.isRecording) return;
      if (this.voiceModal.recordingTime < 1) {
        this.$showToast('Atenção', 'Grave pelo menos 1 segundo.', 'info');
        return;
      }
      this.voiceModal.mediaRecorder.stop();
      this.voiceModal.isRecording = false;
      if (this.voiceModal.timer) { clearInterval(this.voiceModal.timer); this.voiceModal.timer = null; }
    },
    async processVoiceAudio(audioBlob) {
      this.voiceModal.isProcessing = true;
      try {
        if (audioBlob.size < 1000) throw new Error('Áudio muito curto.');
        const fd = new FormData();
        fd.append('audio', audioBlob, 'recording.wav');
        const { data } = await api.post('/voice/transcribe', fd, { timeout: 120000 });
        const txt = data?.data?.text || '';
        if (!txt) throw new Error('Transcrição vazia.');
        if (typeof this.voiceModal.targetSetter === 'function') {
          this.voiceModal.targetSetter(txt);
        } else if (this.voiceModal.targetEl && (this.voiceModal.targetEl.tagName === 'TEXTAREA' || (this.voiceModal.targetEl.tagName === 'INPUT' && this.voiceModal.targetEl.type === 'text'))) {
          const el = this.voiceModal.targetEl;
          const start = el.selectionStart ?? el.value.length;
          const end = el.selectionEnd ?? el.value.length;
          const before = el.value.slice(0, start);
          const after = el.value.slice(end);
          const spacer = before && !before.endsWith(' ') ? ' ' : '';
          el.value = before + spacer + txt + after;
          // reposiciona cursor e dispara evento para v-model
          const pos = (before + spacer + txt).length;
          try { el.setSelectionRange(pos, pos); } catch (_) {}
          el.dispatchEvent(new Event('input', { bubbles: true }));
        }
        this.$showToast('Sucesso', 'Áudio transcrito com sucesso!', 'success');
        this.closeVoiceModal();
      } catch (e) {
        console.error('Erro na transcrição:', e);
        this.$showToast('Erro', e.message || 'Falha ao transcrever.', 'error');
      } finally {
        this.voiceModal.isProcessing = false;
      }
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

// Adicionar método global para toast
app.config.globalProperties.$showToast = function(title, message, type = 'info', duration = 5000) {
  this.$root.showToast(title, message, type, duration);
};

// Adicionar método global para confirmação via toast
app.config.globalProperties.$confirmToast = function(title, message, options = {}) {
  return this.$root.confirmToast(title, message, options);
};

// Helper global para abrir o modal de voz e anexar texto ao v-model alvo
app.config.globalProperties.$voiceToField = function(setterFn) {
  this.$root.openVoiceModal(setterFn);
};
app.config.globalProperties.$voiceToActive = function(targetEl) {
  this.$root.openVoiceModalForActive(targetEl);
};

// Método global para verificar se campo foi preenchido na entrevista
app.config.globalProperties.$isFieldFilledInInterview = function(studentId, fieldName) {
  // Verificar se existem dados da entrevista do aluno
  const interviewKey = `interview_${studentId}`;
  const interviewData = localStorage.getItem(interviewKey);
  if (interviewData) {
    try {
      const data = JSON.parse(interviewData);
      return data[fieldName] && data[fieldName].trim() !== '';
    } catch (e) {
      return false;
    }
  }
  return false;
};

// Logout global seguro (this.$logout)
let __logoutLock = false;
app.config.globalProperties.$logout = async function() {
  if (__logoutLock) return;
  __logoutLock = true;
  try {
    if (this && typeof this === 'object' && 'loggingOut' in this) this.loggingOut = true;
    await api.post('/logout').catch(() => {});
  } catch (e) {
    console.error('Erro no logout global:', e);
  } finally {
    try {
      if (this && window.innerWidth < 1024 && 'sidebarOpen' in this) this.sidebarOpen = false;
      localStorage.removeItem('token');
      if (api?.defaults?.headers?.common?.Authorization) delete api.defaults.headers.common['Authorization'];
      if (this && this.$showToast) this.$showToast('Sessão encerrada', 'Você saiu da conta com segurança.', 'success', 3000);
      if (this && this.$route && this.$router && this.$route.path !== '/login') {
        await this.$router.push('/login').catch(() => {});
      }
      setTimeout(() => { if (location.hash !== '#/login') location.hash = '#/login'; }, 80);
    } finally {
      if (this && typeof this === 'object' && 'loggingOut' in this) this.loggingOut = false;
      __logoutLock = false;
    }
  }
};

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
  
  /* Variante vermelha para sair */
  .nav-link-tw.logout-link {
    color: #b91c1c; /* red-700 */
    border: 1px solid transparent;
  }
  .nav-link-tw.logout-link:hover {
    background-color: #fee2e2; /* red-100 */
    color: #991b1b; /* red-800 */
    transform: translateX(4px);
  }
  .nav-link-tw.logout-link svg { color: currentColor; }
  
  .nav-link-tw:hover {
    background-color: #f3f4f6;
    color: #111827;
    transform: translateX(4px);
  }
  
  .nav-link-tw.router-link-active {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    border-left: 4px solid #1e40af;
  }
  
  .nav-link-tw.router-link-active:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    color: white;
    transform: translateX(4px);
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

// Modal global de voz (injeção no body via portal simples)
document.body.insertAdjacentHTML('beforeend', `
  <div id="voice-modal-root"></div>
`);

// Renderização reativa simples do modal usando Mutation + template inline
const voiceTpl = document.createElement('template');
voiceTpl.innerHTML = `
  <div v-if="$root.voiceModal.open" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
    <div class="bg-gray-50 rounded-lg w-full max-w-md p-5 shadow-xl border border-gray-200">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-semibold text-gray-900">Capturar por voz</h3>
        <button class="text-gray-500 hover:text-gray-700" @click="$root.closeVoiceModal()"><i class="fas fa-times"></i></button>
      </div>
      <div class="space-y-3">
        <div class="text-sm text-gray-600">Grave sua fala e adicionaremos o texto no campo selecionado.</div>
        <div class="flex items-center gap-3">
          <button @click="$root.toggleVoiceRecording()" :disabled="$root.voiceModal.isProcessing"
                  class="px-3 py-2 rounded-md text-sm font-medium"
                  :class="$root.voiceModal.isRecording ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'">
            <i :class="$root.voiceModal.isRecording ? 'fas fa-stop' : 'fas fa-microphone'"></i>
            <span class="ml-2">{{$root.voiceModal.isRecording ? 'Parar' : 'Gravar'}}</span>
          </button>
          <div v-if="$root.voiceModal.isRecording" class="text-red-600 text-sm flex items-center gap-2">
            <span class="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <span>{{ Math.floor($root.voiceModal.recordingTime/60) }}:{{ String($root.voiceModal.recordingTime%60).padStart(2,'0') }}</span>
          </div>
        </div>
        <div v-if="$root.voiceModal.isProcessing" class="bg-yellow-50 border border-yellow-200 rounded p-3">
          <div class="flex items-center gap-2 text-yellow-800 text-sm">
            <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></span>
            Convertendo áudio para texto...
          </div>
        </div>
        <div class="flex justify-end">
          <button class="px-3 py-2 rounded-md border" @click="$root.closeVoiceModal()">Fechar</button>
        </div>
      </div>
    </div>
  </div>
`;

// Monta um mini-app Vue para renderizar o modal usando o mesmo root
const mountVoicePortal = (mainApp) => {
  const Portal = { template: voiceTpl.innerHTML };
  const voiceApp = Vue.createApp({ template: '<Portal />', components: { Portal } });
  voiceApp.config.globalProperties.$root = mainApp._instance.proxy; // compartilhar root
  voiceApp.mount('#voice-modal-root');
};
// será chamado após o app principal montar

// ====== Mic buttons auto-injection for big textareas ======
// Removido: injeção automática de botões "Falar" ao lado de textareas (requisito do cliente)

// Registrar componente DatePicker
if (typeof DatePickerComponent !== 'undefined') {
  app.component('DatePicker', DatePickerComponent);
}

// Registrar FloatingMicrophone globalmente
app.component('FloatingMicrophone', FloatingMicrophone);

// Usar router e montar aplicação
app.use(router);
app.mount('#app');
// montar portal do modal de voz após app existir
try { mountVoicePortal(app); } catch (_) {}

// Inicialização completa
