console.log('ConectEdu SPA v5.0 - Sistema Otimizado');

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

// Layout principal com sidebar moderna
const Layout = {
  template: `
    <div class="d-flex" style="min-height: 100vh;">
      <!-- Overlay para mobile -->
      <div 
        v-if="sidebarOpen" 
        class="position-fixed w-100 h-100" 
        style="background: rgba(0,0,0,0.5); z-index: 1040; top: 0; left: 0;"
        @click="sidebarOpen = false">
      </div>
      
      <!-- Sidebar -->
      <aside 
        :class="['sidebar position-fixed position-lg-static h-100', sidebarOpen ? 'sidebar-open' : '']"
        style="width: 280px; z-index: 1050; transition: transform 0.3s ease;">
        
        <div class="p-4 border-bottom">
          <div class="d-flex align-items-center justify-content-between">
            <h5 class="mb-0 text-contrast">Menu Principal</h5>
            <button 
              class="btn btn-sm btn-outline-secondary d-lg-none" 
              @click="sidebarOpen = false">
              ✕
            </button>
          </div>
        </div>
        
        <nav class="p-3">
          <div class="nav-section mb-4">
            <h6 class="nav-section-title mb-2 text-muted text-uppercase" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;">
              Dashboard
            </h6>
            <router-link to="/" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              Visão Geral
            </router-link>
          </div>
          
          <div class="nav-section mb-4">
            <h6 class="nav-section-title mb-2 text-muted text-uppercase" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;">
              Gestão
            </h6>
            <router-link to="/alunos" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Alunos
            </router-link>
            
          </div>
          
          <div class="nav-section mb-4">
            <h6 class="nav-section-title mb-2 text-muted text-uppercase" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;">
              Formulários
            </h6>
            <router-link to="/formularios" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Formulários AEE
            </router-link>
            <router-link to="/planos" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              Planejamento
            </router-link>
            <router-link to="/frequencia" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
              </svg>
              Frequência
            </router-link>
          </div>
          
          <div class="nav-section mb-4">
            <h6 class="nav-section-title mb-2 text-muted text-uppercase" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;">
              Relatórios
            </h6>
            <router-link to="/relatorios" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
              Relatórios
            </router-link>
          </div>
          
          <div class="nav-section" v-if="me && me.role === 'admin'">
            <h6 class="nav-section-title mb-2 text-muted text-uppercase" style="font-size: 0.75rem; font-weight: 600; letter-spacing: 0.05em;">
              Administração
            </h6>
            <router-link to="/admin/users" class="nav-link" @click="closeMobileSidebar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Usuários
            </router-link>
          </div>
        </nav>
        
        <div class="mt-auto p-3 border-top">
          <div class="d-flex align-items-center mb-3" v-if="me">
            <div class="me-3">
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-weight: 600;">
                {{ (me.name || 'U').charAt(0).toUpperCase() }}
              </div>
            </div>
            <div class="flex-1">
              <div class="fw-semibold text-sm">{{ me.name }}</div>
              <div class="text-muted" style="font-size: 0.75rem;">{{ me.email }}</div>
            </div>
          </div>
          <button 
            class="btn btn-outline-danger w-100" 
            @click="logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>
      </aside>
      
      <!-- Conteúdo principal -->
      <main class="flex-1 main-content" style="margin-left: 0;">
        <header class="bg-white border-bottom p-3 sticky-top">
          <div class="d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <button 
                class="btn btn-outline-secondary d-lg-none" 
                @click="sidebarOpen = true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <h4 class="mb-0 text-contrast">{{ pageTitle }}</h4>
            </div>
            
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-outline-secondary btn-sm" @click="toggleTheme">
                <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        <section class="p-4 fade-in">
          <router-view></router-view>
        </section>
      </main>
    </div>
  `,
  data() {
    return {
      sidebarOpen: false,
      me: null,
      isDark: false
    };
  },
  computed: {
    pageTitle() {
      const route = this.$route;
      const titles = {
        '/': 'Dashboard',
        '/alunos': 'Gestão de Alunos',
        '/formularios': 'Formulários AEE',
        '/planos': 'Planejamento',
        '/frequencia': 'Controle de Frequência',
        '/relatorios': 'Relatórios',
        '/admin/users': 'Gerenciar Usuários'
      };
      return titles[route.path] || 'ConectEdu';
    }
  },
  async created() {
    try {
      const response = await api.get('/auth/me');
      this.me = response.data.data;
    } catch (error) {
      // 401 será tratado pelo interceptador
    }
    
    // Verificar tema salvo
    this.isDark = localStorage.getItem('theme') === 'dark';
    this.applyTheme();
  },
  methods: {
    closeMobileSidebar() {
      if (window.innerWidth < 992) {
        this.sidebarOpen = false;
      }
    },
    
    toggleTheme() {
      this.isDark = !this.isDark;
      localStorage.setItem('theme', this.isDark ? 'dark' : 'light');
      this.applyTheme();
    },
    
    applyTheme() {
      if (this.isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    },
    
    async logout() {
      try {
        await api.post('/auth/logout', {});
      } catch (error) {
        // Ignorar erros no logout
      }
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
};

// Página de Login modernizada
const Login = {
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div class="w-100" style="max-width: 400px;">
        <div class="card slide-up">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <div class="brand-logo mx-auto mb-3" style="width: 60px; height: 60px;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1d4ed8"/>
                  <circle cx="12" cy="12" r="6" fill="#06b6d4"/>
                </svg>
              </div>
              <h2 class="mb-2">Bem-vindo de volta</h2>
              <p class="text-muted">Entre com suas credenciais para acessar o sistema</p>
            </div>
            
            <form @submit.prevent="doLogin">
              <div class="form-group mb-3">
                <label class="form-label">E-mail</label>
                <input 
                  v-model="email" 
                  type="email" 
                  class="form-control" 
                  placeholder="seu@email.com"
                  required>
              </div>
              
              <div class="form-group mb-4">
                <label class="form-label">Senha</label>
                <input 
                  v-model="password" 
                  type="password" 
                  class="form-control" 
                  placeholder="Sua senha"
                  required>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary w-100 mb-3"
                :disabled="loading">
                <span v-if="loading" class="spinner me-2"></span>
                {{ loading ? 'Entrando...' : 'Entrar' }}
              </button>
            </form>
            
            <div class="text-center">
              <router-link to="/register" class="text-decoration-none">
                Não tem conta? Criar nova conta
              </router-link>
            </div>
            
            <div v-if="error" class="alert alert-danger mt-3" role="alert">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: 'admin@conectedu.local',
      password: 'admin123',
      error: null,
      loading: false
    };
  },
  methods: {
    async doLogin() {
      this.error = null;
      this.loading = true;
      
      try {
        const response = await api.post('/auth/login', {
          email: this.email,
          password: this.password
        });
        
        if (response.data.ok) {
          localStorage.setItem('token', response.data.data.token);
          this.$router.push('/');
        } else {
          this.error = response.data.error || 'Erro ao fazer login';
        }
      } catch (error) {
        this.error = 'Não foi possível conectar ao servidor';
      } finally {
        this.loading = false;
      }
    }
  }
};

// Página de Registro
const Register = {
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center p-4">
      <div class="w-100" style="max-width: 400px;">
        <div class="card slide-up">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <div class="brand-logo mx-auto mb-3" style="width: 60px; height: 60px;">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#1d4ed8"/>
                  <circle cx="12" cy="12" r="6" fill="#06b6d4"/>
                </svg>
              </div>
              <h2 class="mb-2">Criar nova conta</h2>
              <p class="text-muted">Preencha os dados para se cadastrar</p>
            </div>
            
            <form @submit.prevent="doRegister">
              <div class="form-group mb-3">
                <label class="form-label">Nome completo</label>
                <input 
                  v-model="name" 
                  type="text" 
                  class="form-control" 
                  placeholder="Seu nome completo"
                  required>
              </div>
              
              <div class="form-group mb-3">
                <label class="form-label">E-mail</label>
                <input 
                  v-model="email" 
                  type="email" 
                  class="form-control" 
                  placeholder="seu@email.com"
                  required>
              </div>
              
              <div class="form-group mb-4">
                <label class="form-label">Senha</label>
                <input 
                  v-model="password" 
                  type="password" 
                  class="form-control" 
                  placeholder="Escolha uma senha"
                  required>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary w-100 mb-3"
                :disabled="loading">
                <span v-if="loading" class="spinner me-2"></span>
                {{ loading ? 'Criando conta...' : 'Criar conta' }}
              </button>
            </form>
            
            <div class="text-center">
              <router-link to="/login" class="text-decoration-none">
                Já tem conta? Fazer login
              </router-link>
            </div>
            
            <div v-if="error" class="alert alert-danger mt-3" role="alert">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      name: '',
      email: '',
      password: '',
      error: null,
      loading: false
    };
  },
  methods: {
    async doRegister() {
      this.error = null;
      this.loading = true;
      
      try {
        const response = await api.post('/auth/register', {
          name: this.name,
          email: this.email,
          password: this.password
        });
        
        if (response.data.ok) {
          localStorage.setItem('token', response.data.data.token);
          this.$router.push('/');
        } else {
          this.error = response.data.error || 'Erro ao criar conta';
        }
      } catch (error) {
        this.error = 'Não foi possível conectar ao servidor';
      } finally {
        this.loading = false;
      }
    }
  }
};

// Dashboard com estatísticas visuais
const Dashboard = {
  template: `
    <div class="fade-in">
      <!-- Cards de estatísticas -->
      <div class="row g-4 mb-5">
        <div class="col-6 col-md-3">
          <div class="stats-card p-4 text-center">
            <div class="stats-number">{{ cards.total_students || 0 }}</div>
            <div class="stats-label">Total de Alunos</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stats-card p-4 text-center">
            <div class="stats-number">{{ cards.active_students || 0 }}</div>
            <div class="stats-label">Alunos Ativos</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stats-card p-4 text-center">
            <div class="stats-number">{{ cards.pdis_concluidos || 0 }}</div>
            <div class="stats-label">PDIs Concluídos</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stats-card p-4 text-center">
            <div class="stats-number">{{ cards.formularios_pendentes || 0 }}</div>
            <div class="stats-label">Pendências</div>
          </div>
        </div>
      </div>
      
      <!-- Gráficos e informações -->
      <div class="row g-4 mb-4">
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header d-flex align-items-center justify-content-between">
              <h5 class="mb-0">Atividades Recentes</h5>
              <button class="btn btn-sm btn-outline-secondary" @click="openStatsDebug" title="Abrir stats (debug)">Debug</button>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div 
                  v-for="activity in recent" 
                  :key="activity.id"
                  class="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <div class="fw-medium">{{ activity.message }}</div>
                    <small class="text-muted">{{ formatDate(activity.created_at) }}</small>
                  </div>
                </div>
                <div v-if="recent.length === 0" class="list-group-item text-muted text-center py-4">
                  Nenhuma atividade recente
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-6">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Resumo de Vagas</h5>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="text-muted mb-3">Professores de Apoio</h6>
                <div class="table-container">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Usadas</th>
                        <th>Capacidade</th>
                        <th>Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="teacher in vagas.apoio" :key="'apoio-' + teacher.id">
                        <td>{{ teacher.name }}</td>
                        <td>{{ teacher.used }}</td>
                        <td>{{ teacher.capacity }}</td>
                        <td>
                          <span :class="['badge', (teacher.capacity - teacher.used) > 0 ? 'bg-success' : 'bg-warning']">
                            {{ teacher.capacity - teacher.used }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div>
                <h6 class="text-muted mb-3">Salas de Recursos</h6>
                <div class="table-container">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>Nome</th>
                        <th>Usadas</th>
                        <th>Capacidade</th>
                        <th>Disponível</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="room in vagas.srm" :key="'srm-' + room.id">
                        <td>{{ room.name }}</td>
                        <td>{{ room.used }}</td>
                        <td>{{ room.capacity }}</td>
                        <td>
                          <span :class="['badge', (room.capacity - room.used) > 0 ? 'bg-success' : 'bg-warning']">
                            {{ room.capacity - room.used }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gráficos -->
      <div class="row g-4">
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Alunos por Modalidade</h6>
            </div>
            <div class="card-body">
              <div id="chart-modalidade" style="height: 250px;"></div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">PDIs por Status</h6>
            </div>
            <div class="card-body">
              <div id="chart-pdi" style="height: 250px;"></div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="mb-0">Presenças (30 dias)</h6>
            </div>
            <div class="card-body">
              <div id="chart-attendance" style="height: 250px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      cards: {
        total_students: 0,
        active_students: 0,
        pdis_concluidos: 0,
        formularios_pendentes: 0
      },
      recent: [],
      vagas: {
        apoio: [],
        srm: []
      },
      charts: null
    };
  },
  async mounted() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      try {
        const response = await api.get('/stats');
        if (response.data.ok) {
          this.cards = response.data.data.cards;
          this.recent = response.data.data.recent;
          this.vagas = response.data.data.vagas;
          this.charts = response.data.data.charts;
          this.renderCharts();
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    },
    
    formatDate(dateString) {
      return new Date(dateString).toLocaleString('pt-BR');
    },
    
    renderCharts() {
      // Gráfico de modalidades
      const modalidadeData = (this.charts.students_by_modalidade || []).map(item => ({
        name: String(item.modalidade || 'N/D').toUpperCase(),
        y: Number(item.c || 0)
      }));
      
      Highcharts.chart('chart-modalidade', {
        chart: { type: 'pie' },
        title: { text: null },
        series: [{
          name: 'Alunos',
          data: modalidadeData
        }],
        credits: { enabled: false },
        colors: ['#1d4ed8', '#06b6d4', '#10b981', '#f59e0b']
      });
      
      // Gráfico de PDI
      const pdiData = (this.charts.pdi_status || []).map(item => [
        String(item.status || 'N/D'),
        Number(item.c || 0)
      ]);
      
      Highcharts.chart('chart-pdi', {
        chart: { type: 'column' },
        title: { text: null },
        xAxis: { type: 'category' },
        yAxis: { title: { text: 'Quantidade' } },
        series: [{
          name: 'PDIs',
          data: pdiData
        }],
        credits: { enabled: false },
        colors: ['#1d4ed8']
      });
      
      // Gráfico de frequência
      const attendanceData = {};
      (this.charts.attendance_30d || []).forEach(item => {
        const date = item.date;
        if (!attendanceData[date]) {
          attendanceData[date] = { present: 0, absent: 0 };
        }
        if (String(item.present) === '1') {
          attendanceData[date].present += Number(item.c);
        } else {
          attendanceData[date].absent += Number(item.c);
        }
      });
      
      const dates = Object.keys(attendanceData).sort();
      const presentData = dates.map(date => attendanceData[date].present);
      const absentData = dates.map(date => attendanceData[date].absent);
      
      Highcharts.chart('chart-attendance', {
        chart: { type: 'line' },
        title: { text: null },
        xAxis: { categories: dates },
        yAxis: { title: { text: 'Registros' } },
        series: [
          { name: 'Presente', data: presentData, color: '#10b981' },
          { name: 'Ausente', data: absentData, color: '#ef4444' }
        ],
        credits: { enabled: false }
      });
    },
    openStatsDebug(){ const t=localStorage.getItem('token'); if(!t){ alert('Sem token'); return; } const url=CONFIG.API_BASE + '/stats?token=' + encodeURIComponent(t); window.open(url,'_blank'); }
  }
};

// Placeholder para outras páginas (serão implementadas nas próximas fases)
const Alunos = { template: '<div class="fade-in"><h3>Gestão de Alunos</h3><p class="text-muted">Em desenvolvimento...</p></div>' };
const Cursos = { template: '<div class="fade-in"><h3>Gestão de Cursos</h3><p class="text-muted">Em desenvolvimento...</p></div>' };

const Agenda={template:`
<div>
  <div class="d-flex align-items-center justify-content-between mb-3">
    <h3 class="text-xl font-semibold">Agenda</h3>
    <div class="btn-group">
      <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">◀</button>
      <span class="px-2 text-muted">{{monthLabel}}</span>
      <button class="btn btn-outline-secondary btn-sm" @click="nextMonth">▶</button>
      <button class="btn btn-outline-primary btn-sm ms-2" @click="goToday">Hoje</button>
    </div>
  </div>
  <div class="row g-2 mb-3">
    <div class="col-md-3"><input v-model="filters.q" class="form-control" placeholder="Buscar (título/local)"></div>
    <div class="col-md-3"><input v-model="filters.start" type="date" class="form-control" placeholder="Início"></div>
    <div class="col-md-3"><input v-model="filters.end" type="date" class="form-control" placeholder="Fim"></div>
    <div class="col-md-3 d-grid">
      <button class="btn btn-primary" @click="load">Filtrar</button>
    </div>
  </div>
  <div class="rounded-2xl bg-white shadow-lg ring-1 ring-slate-200 p-3 mb-3">
    <div class="calendar grid" style="display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:.5rem;">
      <div class="text-center text-muted small" v-for="d in ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']">{{d}}</div>
      <div v-for="cell in calendarCells" :key="cell.key" class="p-2 rounded border" :class="cell.isCurrentMonth?'bg-white':'bg-slate-50'">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <span class="small" :class="cell.isToday?'badge bg-primary':''">{{cell.day}}</span>
          <span class="small text-muted">{{cell.dateStr}}</span>
        </div>
        <div class="list-group small" style="max-height:96px; overflow:auto">
          <a href="javascript:void(0)" class="list-group-item list-group-item-action py-1 px-2"
             v-for="e in cell.events" :key="e.id" @click="edit(e)">
            {{e.title}}
          </a>
          <div v-if="cell.events.length===0" class="text-muted small">—</div>
        </div>
      </div>
    </div>
  </div>
  <div class="row g-2 mb-3">
    <div class="col-md-3"><input v-model="form.title" class="form-control" placeholder="Título"></div>
    <div class="col-md-3"><input v-model="form.date_start" type="datetime-local" class="form-control"></div>
    <div class="col-md-3"><input v-model="form.date_end" type="datetime-local" class="form-control"></div>
    <div class="col-md-3"><input v-model="form.location" class="form-control" placeholder="Local"></div>
    <div class="col-12"><input v-model="form.notes" class="form-control" placeholder="Notas"></div>
    <div class="col-12">
      <button class="btn btn-primary" @click="save">{{form.id?'Atualizar':'Adicionar'}}</button>
      <button v-if="form.id" class="btn btn-outline-secondary" @click="cancel">Cancelar</button>
    </div>
  </div>
  <div class="table-responsive rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">
    <table class="w-full">
      <thead><tr><th>Título</th><th>Início</th><th>Fim</th><th>Local</th><th></th></tr></thead>
      <tbody>
        <tr v-for="e in list" :key="e.id">
          <td>{{e.title}}</td>
          <td>{{fmt(e.date_start)}}</td>
          <td>{{fmt(e.date_end)}}</td>
          <td>{{e.location||'-'}}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary" @click="edit(e)">Editar</button>
            <button class="btn btn-sm btn-outline-danger" @click="del(e)">Excluir</button>
          </td>
        </tr>
        <tr v-if="list.length===0"><td colspan="5" class="text-center text-muted">Sem eventos</td></tr>
      </tbody>
    </table>
  </div>
</div>
`,data(){const now=new Date(); const y=now.getFullYear(), m=now.getMonth(); return{
  list:[], form:{id:null,title:'',date_start:'',date_end:'',location:'',notes:''}, filters:{q:'',start:'',end:''}, y,m
}},computed:{
  monthLabel(){return new Date(this.y,this.m,1).toLocaleDateString('pt-BR',{month:'long',year:'numeric'});},
  calendarCells(){
    const first=new Date(this.y,this.m,1);
    const start=new Date(first); start.setDate(1-first.getDay());
    const cells=[];
    for(let i=0;i<42;i++){
      const d=new Date(start); d.setDate(start.getDate()+i);
      const key=d.toISOString().slice(0,10);
      const events=this.list.filter(e=> (e.date_start||'').slice(0,10)===key || (e.date_end||'').slice(0,10)===key || ((e.date_start||'')<key && key<(e.date_end||'')));
      cells.push({key,day:d.getDate(),dateStr:key,isCurrentMonth:d.getMonth()===this.m,isToday:(new Date().toDateString()===d.toDateString()),events});
    }
    return cells;
  }
},methods:{
  fmt(s){ try{ return new Date(s).toLocaleString(); }catch(e){ return s||'-'; } },
  edit(e){ this.form=Object.assign({},e); },
  cancel(){ this.form={id:null,title:'',date_start:'',date_end:'',location:'',notes:''}; },
  async load(){
    const params={};
    if(this.filters.q) params.q=this.filters.q;
    if(this.filters.start) params.start=this.filters.start;
    if(this.filters.end) params.end=this.filters.end;
    const r=await api.get('/agenda',{params}); this.list=r.data.ok?r.data.data:[];
  },
  async save(){ const path=this.form.id?'/agenda/update':'/agenda/create'; const r=await api.post(path,this.form); if(r.data.ok){ this.cancel(); this.load(); } else alert(r.data.error||'Erro'); },
  async del(e){ if(!confirm('Excluir evento?')) return; const r=await api.post('/agenda/delete',{id:e.id}); if(r.data.ok){ this.load(); } else alert(r.data.error||'Erro'); },
  prevMonth(){ if(this.m===0){ this.y--; this.m=11;} else this.m--; this.recalcRange(); },
  nextMonth(){ if(this.m===11){ this.y++; this.m=0;} else this.m++; this.recalcRange(); },
  goToday(){ const d=new Date(); this.y=d.getFullYear(); this.m=d.getMonth(); this.recalcRange(); },
  recalcRange(){
    const d0=new Date(this.y,this.m,1); const d1=new Date(this.y,this.m+1,0);
    this.filters.start=d0.toISOString().slice(0,10); this.filters.end=d1.toISOString().slice(0,10); this.load();
  }
},mounted(){ this.recalcRange(); }};
const Formularios = { template: '<div class="fade-in"><h3>Formulários AEE</h3><p class="text-muted">Em desenvolvimento...</p></div>' };
const Planos = { template: '<div class="fade-in"><h3>Planejamento</h3><p class="text-muted">Em desenvolvimento...</p></div>' };
const Frequencia = { template: '<div class="fade-in"><h3>Controle de Frequência</h3><p class="text-muted">Em desenvolvimento...</p></div>' };
const Relatorios = { template: '<div class="fade-in"><h3>Relatórios</h3><p class="text-muted">Em desenvolvimento...</p></div>' };
const AdminUsers = { template: '<div class="fade-in"><h3>Gerenciar Usuários</h3><p class="text-muted">Em desenvolvimento...</p></div>' };

// Configuração das rotas
const routes = [
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { 
    path: '/', 
    component: Layout,
    beforeEnter: AuthGuard,
    children: [
      { path: '', component: Dashboard },
      { path: 'alunos', component: Alunos },
      { path: 'formularios', component: Formularios },
      { path: 'planos', component: Planos },
      { path: 'frequencia', component: Frequencia },
      { path: 'relatorios', component: Relatorios },
      { path: 'admin/users', component: AdminUsers }
    ]
  }
];

// Criação do router
const router = VueRouter.createRouter({
  history: VueRouter.createWebHashHistory(),
  routes
});

// Criação da aplicação Vue
const app = Vue.createApp({});
app.use(router);
app.mount('#app');

console.log('ConectEdu v5.0 inicializado com sucesso!');

