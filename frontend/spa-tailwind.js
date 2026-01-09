// ConectAEE v5.0 - Sistema de Gestão Educacional com Tailwind CSS

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
      if (location.hash !== '#/') {
        location.hash = '#/';
      }
    }
    return Promise.reject(error);
  }
);

// Guard de autenticação
const AuthGuard = (to, from, next) => {
  const token = localStorage.getItem('token');
  if (!token && to.path.startsWith('/app')) return next('/');
  next();
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
          <button @click="load" class="w-full px-4 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-dark transition-colors font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
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
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
    <!-- Botão Dark Mode -->
    <button 
      @click="$root.toggleDarkMode()"
      class="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
      :title="$root.darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'">
      <svg v-if="!$root.darkMode" class="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
      </svg>
      <svg v-else class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
      </svg>
    </button>
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div class="text-center">
        <div class="mx-auto h-40 w-40 flex items-center justify-center mb-4">
          <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-36 w-36">
        </div>
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white">Cadastro de Professor</h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Cadastre-se como professor no ConectAEE</p>
      </div>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
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
              <router-link to="/?tab=login" class="font-medium text-brand-primary hover:text-brand-primary-dark">
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
    onBuscaChange() {
      this.showSugestoes = true;
      this.sugIndex = -1;
    },
    fecharSugestoesComAtraso() {
      setTimeout(() => { this.showSugestoes = false; }, 150);
    },
    moveSugestao(dir) {
      if (!this.showSugestoes || !this.sugestoes.length) return;
      const max = this.sugestoes.length - 1;
      let idx = this.sugIndex + dir;
      if (idx < 0) idx = max;
      if (idx > max) idx = 0;
      this.sugIndex = idx;
    },
    confirmSugestao() {
      if (!this.showSugestoes) return;
      const aluno = this.sugestoes[this.sugIndex] || this.sugestoes[0];
      if (aluno) {
        this.abrirFormulario('entrevista', aluno.id);
        this.showSugestoes = false;
      }
    },
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
        <button class="px-4 py-2 bg-brand-primary text-white rounded hover:bg-brand-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary" 
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
          const entrevistaResp = await api.get(`/app/entrevista-completa/student/${aluno.id}`);
          aluno.has_entrevista = entrevistaResp.data?.ok && entrevistaResp.data.data?.length > 0;
          
          const pdiResp = await api.get(`/app/pdi-completo/student/${aluno.id}`);
          aluno.has_pdi = pdiResp.data?.ok && pdiResp.data.data?.length > 0;
          
          const paiResp = await api.get(`/app/pai-completo/student/${aluno.id}`);
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
      this.$router.push(`/app/entrevista-completa?student_id=${studentId}&readonly=1`);
    },
    
    viewPDI(studentId) {
      this.$router.push(`/app/pdi-completo?student_id=${studentId}&readonly=1`);
    },
    
    viewPAI(studentId) {
      this.$router.push(`/app/pai-completo?student_id=${studentId}&readonly=1`);
    },
    
    viewRelatorio(relatorioId) {
      this.$router.push(`/app/relatorio-atendimento?id=${relatorioId}&readonly=1`);
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
        :class="['fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out flex flex-col', sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0']">
        
        <!-- Header da Sidebar -->
        <div class="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-12 w-12 lg:h-16 lg:w-16">
              <div class="hidden sm:block">
                <h5 class="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">ConectAEE</h5>
                <p class="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Sistema AEE</p>
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Dashboard
            </h6>
            <router-link to="/app" class="nav-link-tw" @click="closeMobileSidebar">
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
            <h6 class="mb-2 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
            <!-- Toggle Dark Mode -->
            <button type="button" class="nav-link-tw w-full text-left" @click.prevent="$root.toggleDarkMode()">
              <svg v-if="!$root.darkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
              <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
              </svg>
              {{ $root.darkMode ? 'Modo Claro' : 'Modo Escuro' }}
            </button>
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
      <main class="flex-1 flex flex-col overflow-hidden lg:ml-0 bg-gray-50 dark:bg-gray-900">
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
                <!-- Toggle Dark Mode -->
                <button 
                  @click="$root.toggleDarkMode()"
                  class="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  :title="$root.darkMode ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'">
                  <svg v-if="!$root.darkMode" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                  </svg>
                </button>
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
      console.log('🔒 Logout iniciado');
      try {
        // Tenta informar o backend (se o endpoint existir)
        await api.post('/logout').catch(() => {});
        console.log('🔒 Logout: backend notificado (se disponível)');
      } catch (error) {
        console.error('Erro no logout:', error);
      } finally {
        try {
          // Fecha a sidebar em mobile para evitar estado inconsistente
          if (window.innerWidth < 1024) this.sidebarOpen = false;
          // Limpa token e header Authorization
          localStorage.removeItem('token');
          console.log('🔒 Logout: token removido');
          if (api?.defaults?.headers?.common?.Authorization) delete api.defaults.headers.common['Authorization'];
          this.user = null;
          // Feedback visual
          if (this.$showToast) this.$showToast('Sessão encerrada', 'Você saiu da conta com segurança.', 'success', 3000);
          // Redireciona via router (suave)
          if (this.$route.path !== '/') {
            await this.$router.push('/').catch(() => {});
            console.log('🔒 Logout: navegação para /');
          }
          // Fallback hard caso algo impeça a navegação
          setTimeout(() => {
            if (location.hash !== '#/') location.hash = '#/';
            this.loggingOut = false;
            console.log('🔒 Logout finalizado');
          }, 50);
        } catch (e) {
          this.loggingOut = false;
        }
      }
    }
  },
  async mounted() {
    console.log('🏢 [Layout] Mounted - iniciando carregamento do user');
    console.log('🏢 [Layout] Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    try {
      console.log('🏢 [Layout] Chamando /user...');
      const response = await api.get('/user');
      console.log('🏢 [Layout] Resposta /user:', response);
      this.user = (response.data && response.data.data) ? response.data.data : response.data;
      
      // CRÍTICO: Atualizar $root.user para todos os componentes filhos acessarem
      if (this.$root) {
        this.$root.user = this.user;
        console.log('✅ [Layout] $root.user atualizado:', this.$root.user);
      }
      
      console.log('✅ [Layout] User carregado:', this.user);
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
      const rawPath = this.$route?.path || '';
      const path = rawPath.startsWith('/app') ? (rawPath.slice(4) || '/') : rawPath;
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
      this.currentPageTitle = titles[path] || 'ConectAEE';
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

// Página inicial com login embutido
// Novo HomeLanding - Versão Premium
const HomeLanding = {
  template: `
    <div class="min-h-screen bg-white">
      <!-- Header/Navbar -->
      <nav class="bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-10 w-10">
              <span class="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">ConectAEE</span>
            </div>
            <div class="flex items-center gap-4">
              <button @click="tab = 'login'" class="text-gray-700 hover:text-emerald-600 font-medium transition">Entrar</button>
              <button @click="tab = 'register'" class="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition font-medium">
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section - Premium -->
      <section class="relative py-24 lg:py-40 overflow-hidden">
        <!-- Background decorativo -->
        <div class="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
        <div class="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl -mr-48"></div>
        <div class="absolute bottom-0 left-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl -ml-48"></div>
        
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <!-- Conteúdo Hero -->
            <div class="space-y-8">
              <div class="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                <span class="w-2 h-2 bg-emerald-600 rounded-full"></span>
                Educação Inclusiva com Tecnologia
              </div>
              
              <h1 class="text-6xl lg:text-7xl font-black text-gray-900 leading-tight">
                Transforme a <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Gestão AEE</span> 
              </h1>
              
              <p class="text-xl text-gray-600 leading-relaxed max-w-lg">
                Plataforma completa para Atendimento Educacional Especializado. Crie PDI, PAI e Entrevistas seguindo os modelos oficiais com facilidade, acessibilidade e segurança.
              </p>
              
              <div class="flex flex-col sm:flex-row gap-4 pt-4">
                <button @click="tab = 'register'" 
                        class="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition duration-300">
                  <i class="fas fa-rocket mr-2"></i>
                  Começar Agora
                </button>
                <button @click="tab = 'login'" 
                        class="px-8 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 transition duration-300">
                  <i class="fas fa-sign-in-alt mr-2"></i>
                  Fazer Login
                </button>
              </div>

              <!-- Trust badges -->
              <div class="flex flex-wrap items-center gap-6 pt-8 border-t border-gray-200">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-check text-emerald-600 text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Totalmente Acessível</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-shield-alt text-emerald-600 text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Dados Seguros</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-bolt text-emerald-600 text-sm"></i>
                  </div>
                  <span class="text-sm font-medium text-gray-700">Rápido e Confiável</span>
                </div>
              </div>
            </div>

            <!-- Visual Hero -->
            <div class="relative">
              <!-- Imagem principal -->
              <div class="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&q=80" 
                     alt="Professora trabalhando com aluno em educação especial" 
                     class="w-full h-[500px] object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
              </div>
              
              <!-- Cards flutuantes com dados -->
              <div class="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-file-pdf text-white text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-black text-gray-900">3</div>
                    <div class="text-sm text-gray-600 font-medium">Formulários Oficiais</div>
                  </div>
                </div>
              </div>
              
              <div class="absolute -top-8 -right-8 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 backdrop-blur-sm">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-universal-access text-white text-2xl"></i>
                  </div>
                  <div>
                    <div class="text-3xl font-black text-gray-900">100%</div>
                    <div class="text-sm text-gray-600 font-medium">Acessível</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section - Grid 3 colunas -->
      <section class="py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-20">
            <h2 class="text-5xl font-black text-gray-900 mb-6">Funcionalidades Completas</h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">Tudo que você precisa para gerenciar o AEE de forma profissional e organizada</p>
          </div>

          <div class="grid md:grid-cols-3 gap-8">
            <!-- Feature 1: PDI -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-emerald-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-file-alt text-emerald-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">PDI Completo</h3>
              <p class="text-gray-600 leading-relaxed">Plano de Desenvolvimento Individual seguindo modelo oficial com todos os campos obrigatórios e validações.</p>
              <div class="mt-6 flex items-center gap-2 text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Feature 2: PAI -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-teal-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-clipboard-list text-teal-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">PAI Estruturado</h3>
              <p class="text-gray-600 leading-relaxed">Plano de Atendimento Individual com sequência preservada do documento original e campos específicos.</p>
              <div class="mt-6 flex items-center gap-2 text-teal-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Feature 3: Entrevista -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-cyan-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-comments text-cyan-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Entrevista com Responsável</h3>
              <p class="text-gray-600 leading-relaxed">Formulário completo para entrevista inicial com todas as informações necessárias do aluno.</p>
              <div class="mt-6 flex items-center gap-2 text-cyan-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Feature 4: PDFs -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-file-pdf text-orange-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Geração de PDFs</h3>
              <p class="text-gray-600 leading-relaxed">Gere documentos em PDF profissionais, otimizados e prontos para impressão ou arquivamento digital.</p>
              <div class="mt-6 flex items-center gap-2 text-orange-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Feature 5: Gestão de Alunos -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-pink-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-users text-pink-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Gestão de Alunos</h3>
              <p class="text-gray-600 leading-relaxed">Cadastre e acompanhe todos os alunos em atendimento com histórico completo e filtros avançados.</p>
              <div class="mt-6 flex items-center gap-2 text-pink-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>

            <!-- Feature 6: Relatórios -->
            <div class="group bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition duration-300">
              <div class="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition">
                <i class="fas fa-chart-bar text-indigo-600 text-2xl"></i>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-3">Relatórios de Atendimento</h3>
              <p class="text-gray-600 leading-relaxed">Registre atendimentos com gravação de áudio, transcrição automática e análise completa dos dados.</p>
              <div class="mt-6 flex items-center gap-2 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition">
                <span>Saiba mais</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="py-24 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid lg:grid-cols-2 gap-16 items-center">
            <!-- Imagem -->
            <div class="relative order-2 lg:order-1">
              <div class="rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&q=80" 
                     alt="Professores usando ConectAEE" 
                     class="w-full h-[500px] object-cover">
              </div>
            </div>

            <!-- Conteúdo -->
            <div class="order-1 lg:order-2 space-y-8">
              <div>
                <h2 class="text-5xl font-black text-gray-900 mb-6">Por que escolher ConectAEE?</h2>
                <p class="text-xl text-gray-600 leading-relaxed">Desenvolvido especificamente para professores de AEE, com foco em facilidade de uso e conformidade com regulamentações educacionais.</p>
              </div>

              <div class="space-y-6">
                <!-- Benefit 1 -->
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-lock text-emerald-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Privacidade e Segurança</h3>
                    <p class="text-gray-600">Dados criptografados e isolados por professor. Cada professor vê apenas seus alunos.</p>
                  </div>
                </div>

                <!-- Benefit 2 -->
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-mobile-alt text-teal-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Funciona em Qualquer Dispositivo</h3>
                    <p class="text-gray-600">Acesse de computador, tablet ou smartphone. Interface responsiva e intuitiva.</p>
                  </div>
                </div>

                <!-- Benefit 3 -->
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-headphones-alt text-cyan-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Suporte Completo</h3>
                    <p class="text-gray-600">Documentação detalhada, tutoriais em vídeo e suporte técnico disponível.</p>
                  </div>
                </div>

                <!-- Benefit 4 -->
                <div class="flex gap-4">
                  <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-sync-alt text-orange-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-bold text-gray-900 mb-2">Atualizações Contínuas</h3>
                    <p class="text-gray-600">Novas funcionalidades e melhorias regulares baseadas em feedback de usuários.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Stats Section -->
      <section class="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div class="text-5xl font-black mb-2">100%</div>
              <p class="text-emerald-100 font-medium">Acessível</p>
            </div>
            <div>
              <div class="text-5xl font-black mb-2">3</div>
              <p class="text-emerald-100 font-medium">Formulários Oficiais</p>
            </div>
            <div>
              <div class="text-5xl font-black mb-2">∞</div>
              <p class="text-emerald-100 font-medium">Alunos Suportados</p>
            </div>
            <div>
              <div class="text-5xl font-black mb-2">24/7</div>
              <p class="text-emerald-100 font-medium">Disponível</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-gray-50">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 class="text-5xl font-black text-gray-900 mb-6">Comece Agora</h2>
          <p class="text-xl text-gray-600 mb-10 leading-relaxed">Transforme a forma como você gerencia o Atendimento Educacional Especializado. Acesso imediato a todas as funcionalidades.</p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <button @click="tab = 'register'" 
                    class="px-10 py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition">
              <i class="fas fa-rocket mr-2"></i>
              Cadastre-se Agora
            </button>
            <button @click="tab = 'login'" 
                    class="px-10 py-5 bg-white text-gray-900 rounded-xl font-bold text-lg border-2 border-gray-300 hover:border-emerald-600 hover:bg-emerald-50 transition">
              <i class="fas fa-sign-in-alt mr-2"></i>
              Já tenho conta
            </button>
          </div>
        </div>
      </section>

      <!-- Login/Register Modal -->
      <div v-if="tab === 'login' || tab === 'register'" @click.self="tab = null" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <section class="bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
          <button @click="tab = null" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition">
            <i class="fas fa-times text-gray-600"></i>
          </button>
          
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-semibold">Acesso ao sistema</h2>
              <p class="text-sm text-slate-500">Login e cadastro no mesmo lugar.</p>
            </div>
            <span class="text-xs uppercase tracking-[0.3em] text-slate-400">Professor</span>
          </div>

          <div class="grid grid-cols-2 rounded-2xl bg-slate-100 p-1 text-sm font-medium mb-6">
            <button type="button"
                    class="py-2 rounded-2xl transition"
                    :class="tab === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'"
                    @click="tab = 'login'">
              Entrar
            </button>
            <button type="button"
                    class="py-2 rounded-2xl transition"
                    :class="tab === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500'"
                    @click="tab = 'register'">
              Registrar
            </button>
          </div>

          <form v-show="tab === 'login'" @submit.prevent="login" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-email">Email</label>
              <input id="home-email" v-model.trim="loginForm.email" type="email" autocomplete="username" required
                     class="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                     placeholder="seu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-password">Senha</label>
              <div class="relative">
                <input id="home-password" :type="showLoginPassword ? 'text' : 'password'"
                       v-model="loginForm.password" autocomplete="current-password" required
                       class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                       placeholder="••••••••">
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        @click="showLoginPassword = !showLoginPassword">
                  <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <label class="inline-flex items-center gap-2 text-slate-600">
                <input type="checkbox" v-model="loginForm.remember" class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
                Lembrar meu e-mail
              </label>
              <button type="button" class="text-emerald-700 hover:text-emerald-900"
                      @click="$showToast && $showToast('Recuperação em breve', 'Estamos finalizando essa etapa.', 'info')">
                Esqueci minha senha
              </button>
            </div>
            <div v-if="loginError" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {{ loginError }}
            </div>
            <button type="submit" :disabled="loginLoading"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60">
              <span v-if="loginLoading" class="inline-flex items-center gap-2">
                <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Entrando...
              </span>
              <span v-else>Entrar</span>
            </button>
          </form>

          <form v-show="tab === 'register'" @submit.prevent="register" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-name">Nome completo</label>
              <input id="home-name" v-model.trim="registerForm.name" type="text" required
                     class="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                     placeholder="Seu nome completo">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-register-email">Email</label>
              <input id="home-register-email" v-model.trim="registerForm.email" type="email" required
                     class="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                     placeholder="professor@escola.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-register-password">Senha</label>
              <div class="relative">
                <input id="home-register-password" :type="showRegisterPassword ? 'text' : 'password'"
                       v-model="registerForm.password" required
                       class="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                       placeholder="Crie uma senha">
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400"
                        @click="showRegisterPassword = !showRegisterPassword">
                  <i :class="showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="mt-2 text-xs text-slate-600 grid grid-cols-2 gap-1">
                <span :class="passwordChecks.length ? 'text-emerald-600' : ''">✓ 8+ caracteres</span>
                <span :class="passwordChecks.uppercase ? 'text-emerald-600' : ''">✓ 1 maiúscula</span>
                <span :class="passwordChecks.lowercase ? 'text-emerald-600' : ''">✓ 1 minúscula</span>
                <span :class="passwordChecks.number ? 'text-emerald-600' : ''">✓ 1 número</span>
                <span :class="passwordChecks.special ? 'text-emerald-600' : ''">✓ 1 especial</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1" for="home-register-confirm">Confirmar senha</label>
              <input id="home-register-confirm" v-model="registerForm.confirm_password" type="password" required
                     class="w-full rounded-xl border border-slate-200 px-3 py-2.5 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500"
                     placeholder="Repita a senha">
              <div v-if="registerForm.password && registerForm.confirm_password && registerForm.password !== registerForm.confirm_password"
                   class="mt-1 text-xs text-rose-600">As senhas não coincidem</div>
            </div>
            <div v-if="registerError" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
              {{ registerError }}
            </div>
            <div v-if="registerSuccess" class="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">
              {{ registerSuccess }}
            </div>
            <button type="submit" :disabled="registerLoading || !isRegisterValid"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60">
              <span v-if="registerLoading" class="inline-flex items-center gap-2">
                <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Criando conta...
              </span>
              <span v-else>Finalizar cadastro</span>
            </button>
            <p class="text-xs text-slate-500 text-center">
              Administradores são cadastrados manualmente pelo gestor do sistema.
            </p>
          </form>
        </section>
      </div>

      <!-- Footer -->
      <footer class="bg-gray-900 text-white py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div class="flex items-center gap-3 mb-4">
                <img src="./icons/logo-icon.png" alt="ConectAEE" class="h-10 w-10">
                <span class="text-xl font-bold">ConectAEE</span>
              </div>
              <p class="text-gray-400 text-sm leading-relaxed">
                Plataforma completa para gestão do Atendimento Educacional Especializado com segurança, acessibilidade e conformidade regulatória.
              </p>
            </div>
            <div>
              <h4 class="font-bold mb-6 text-white">Funcionalidades</h4>
              <ul class="space-y-3 text-sm text-gray-400">
                <li class="hover:text-white transition cursor-pointer">PDI - Plano de Desenvolvimento</li>
                <li class="hover:text-white transition cursor-pointer">PAI - Plano de Atendimento</li>
                <li class="hover:text-white transition cursor-pointer">Entrevista com Responsável</li>
                <li class="hover:text-white transition cursor-pointer">Geração de PDFs</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-6 text-white">Recursos</h4>
              <ul class="space-y-3 text-sm text-gray-400">
                <li class="hover:text-white transition cursor-pointer">Documentação</li>
                <li class="hover:text-white transition cursor-pointer">Tutoriais</li>
                <li class="hover:text-white transition cursor-pointer">Suporte</li>
                <li class="hover:text-white transition cursor-pointer">FAQ</li>
              </ul>
            </div>
            <div>
              <h4 class="font-bold mb-6 text-white">Acessibilidade</h4>
              <button @click="openA11y" class="text-sm text-gray-400 hover:text-white transition inline-flex items-center gap-2">
                <i class="fas fa-universal-access"></i>
                Painel de Acessibilidade
              </button>
            </div>
          </div>
          <div class="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2026 ConectAEE. Desenvolvido para educação inclusiva.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  data() {
    return {
      tab: null,
      loginForm: {
        email: '',
        password: '',
        remember: false
      },
      registerForm: {
        name: '',
        email: '',
        password: '',
        confirm_password: ''
      },
      loginLoading: false,
      registerLoading: false,
      loginError: '',
      registerError: '',
      registerSuccess: '',
      showLoginPassword: false,
      showRegisterPassword: false
    };
  },
  computed: {
    passwordChecks() {
      const pass = this.registerForm.password || '';
      return {
        length: pass.length >= 8,
        uppercase: /[A-Z]/.test(pass),
        lowercase: /[a-z]/.test(pass),
        number: /[0-9]/.test(pass),
        special: /[^A-Za-z0-9]/.test(pass)
      };
    },
    isRegisterValid() {
      return this.registerForm.name &&
        this.registerForm.email &&
        this.registerForm.password &&
        this.registerForm.confirm_password &&
        this.registerForm.password === this.registerForm.confirm_password &&
        Object.values(this.passwordChecks).every(check => check);
    }
  },
  methods: {
    openA11y() {
      if (window.a11yManager && typeof window.a11yManager.togglePanel === 'function') {
        window.a11yManager.togglePanel();
      }
    },
    syncA11y() {
      if (window.a11yManager && typeof window.a11yManager.syncFromServer === 'function') {
        window.a11yManager.syncFromServer();
      }
    },
    async login() {
      this.loginLoading = true;
      this.loginError = '';
      try {
        await ensureApiRouting();
        const response = await api.post('/login', {
          email: this.loginForm.email,
          password: this.loginForm.password
        });
        const token = response.data?.data?.token || response.data?.token;
        const user = response.data?.data?.user || response.data?.user;
        if (!token) throw new Error('TOKEN_MISSING');
        if (user && user.role === 'student') {
          this.loginError = 'Acesso negado. Apenas professores e administradores podem fazer login.';
          return;
        }
        localStorage.setItem('token', token);
        if (this.loginForm.remember && this.loginForm.email) {
          localStorage.setItem('remember_email', this.loginForm.email);
        } else {
          localStorage.removeItem('remember_email');
        }
        this.syncA11y();
        this.$router.push('/app');
      } catch (error) {
        this.loginError = error.response?.data?.message || 'Erro ao fazer login';
      } finally {
        this.loginLoading = false;
      }
    },
    async register() {
      this.registerLoading = true;
      this.registerError = '';
      this.registerSuccess = '';
      try {
        await ensureApiRouting();
        const response = await api.post('/register', {
          name: this.registerForm.name,
          email: this.registerForm.email,
          password: this.registerForm.password
        });
        const token = response.data?.data?.token || response.data?.token;
        if (!token) throw new Error('TOKEN_MISSING');
        localStorage.setItem('token', token);
        this.syncA11y();
        this.$router.push('/app');
      } catch (error) {
        this.registerError = error.response?.data?.message || 'Erro ao criar conta';
      } finally {
        this.registerLoading = false;
      }
    }
  },
  mounted() {
    const remembered = localStorage.getItem('remember_email');
    if (remembered) {
      this.loginForm.email = remembered;
      this.loginForm.remember = true;
    }
    const tab = this.$route?.query?.tab;
    if (tab === 'register') this.tab = 'register';
    if (tab === 'login') this.tab = 'login';
  },
  watch: {
    '$route.query.tab'(val) {
      if (val === 'register') this.tab = 'register';
      if (val === 'login') this.tab = 'login';
    }
  }
};


