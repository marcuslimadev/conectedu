# Script para substituir o componente HomeLanding por versão Bootstrap 5

# Ler arquivo original
$originalFile = 'frontend\spa-tailwind.js'
$lines = Get-Content -Path $originalFile -Encoding UTF8

# Encontrar índices
$startIndex = 3649  # Linha após o comentário "// Página inicial com login embutido"
$endIndex = 4290    # Linha antes da linha vazia antes de "// Página de Login"

Write-Host "Start: $startIndex, End: $endIndex" -ForegroundColor Cyan

if ($startIndex -eq -1 -or $endIndex -eq -1) {
    Write-Host "Erro: Não encontrou os marcadores" -ForegroundColor Red
    exit 1
}

# Parte antes do HomeLanding
$before = $lines[0..($startIndex-1)]

# Parte depois do HomeLanding
$after = $lines[($endIndex+1)..($lines.Count-1)]

# Novo componente HomeLanding Bootstrap 5
$newHomeLanding = @'
const HomeLanding = {
  template: `
    <div class="min-vh-100 text-white overflow-hidden" style="background: #0a0f1e; font-family: 'Inter', sans-serif;">
      
      <!-- Navbar Bootstrap -->
      <nav class="navbar py-4" style="background: rgba(10, 15, 30, 0.95); backdrop-filter: blur(15px); border-bottom: 1px solid rgba(255,255,255,0.1);">
        <div class="container-xxl px-4 px-lg-5">
          <div class="d-flex align-items-center justify-content-between w-100">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3 fw-black fs-4" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                C
              </div>
              <span class="fs-4 fw-bold">ConectAEE</span>
            </div>
            <div class="d-flex gap-3">
              <button @click="tab = 'login'" class="btn btn-link text-white text-decoration-none px-4 py-2">
                Entrar
              </button>
              <button @click="tab = 'register'" class="btn px-4 py-2 fw-bold rounded-3" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);">
                Começar Grátis
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Hero Section Bootstrap -->
      <section class="py-5 position-relative overflow-hidden" style="padding-top: 5rem !important; padding-bottom: 8rem !important;">
        <div class="position-absolute top-0 start-0 w-100 h-100" style="opacity: 0.2; pointer-events: none;">
          <div class="position-absolute rounded-circle" style="top: 0; left: 25%; width: 400px; height: 400px; background: radial-gradient(circle, #667eea 0%, transparent 70%); filter: blur(100px);"></div>
          <div class="position-absolute rounded-circle" style="top: 50%; right: 25%; width: 400px; height: 400px; background: radial-gradient(circle, #764ba2 0%, transparent 70%); filter: blur(100px);"></div>
        </div>

        <div class="container-xxl px-4 px-lg-5 position-relative" style="z-index: 10;">
          <div class="row align-items-center g-5 py-5">
            <div class="col-lg-6 text-center text-lg-start">
              <div class="d-inline-flex align-items-center gap-2 px-4 py-2 rounded-pill mb-4" style="background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3);">
                <span class="rounded-circle" style="width: 8px; height: 8px; background: #667eea;"></span>
                <span class="small fw-semibold" style="color: #a0cfff;">Educação Especial + Tecnologia</span>
              </div>
              
              <h1 class="display-1 fw-black lh-sm mb-4">
                <span style="background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                  ConectAEE
                </span>
                <br>
                <span class="text-white">Plataforma AEE Completa</span>
              </h1>
              
              <p class="fs-5 mb-4 mx-auto mx-lg-0" style="max-width: 540px; line-height: 1.8; color: rgba(255,255,255,0.7);">
                Sistema especializado em Atendimento Educacional Especializado com IA, formulários digitais e geração automática de relatórios profissionais.
              </p>
              
              <div class="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start mb-5">
                <button @click="tab = 'register'" class="btn btn-lg px-5 py-3 rounded-3 fw-bold" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; box-shadow: 0 15px 40px rgba(102, 126, 234, 0.4);">
                  Começar Agora
                </button>
                <button @click="scrollToFeatures" class="btn btn-outline-light btn-lg px-5 py-3 rounded-3 fw-bold">
                  Ver Funcionalidades
                </button>
              </div>

              <div class="row g-4 pt-4">
                <div class="col-4">
                  <div class="display-5 fw-black mb-2" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    3
                  </div>
                  <div class="small" style="color: rgba(255,255,255,0.5);">Formulários Oficiais</div>
                </div>
                <div class="col-4">
                  <div class="display-5 fw-black mb-2" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    100%
                  </div>
                  <div class="small" style="color: rgba(255,255,255,0.5);">Cloud & Seguro</div>
                </div>
                <div class="col-4">
                  <div class="display-5 fw-black mb-2" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                    IA
                  </div>
                  <div class="small" style="color: rgba(255,255,255,0.5);">Integrada GPT-4</div>
                </div>
              </div>
            </div>

            <div class="col-lg-6 mt-5 mt-lg-0">
              <div class="rounded-4 overflow-hidden" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%); border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(20px);">
                <div class="p-4 p-lg-5">
                  <div class="row g-4">
                    <div class="col-6">
                      <div class="p-4 rounded-4" style="background: rgba(102, 126, 234, 0.15); border: 1px solid rgba(102, 126, 234, 0.3);">
                        <div class="fs-1 mb-3">📋</div>
                        <div class="fw-bold fs-5 mb-2">PDI Digital</div>
                        <div class="small" style="color: rgba(255,255,255,0.5);">Plano completo</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-4 rounded-4" style="background: rgba(118, 75, 162, 0.15); border: 1px solid rgba(118, 75, 162, 0.3);">
                        <div class="fs-1 mb-3">🎯</div>
                        <div class="fw-bold fs-5 mb-2">PAI Estruturado</div>
                        <div class="small" style="color: rgba(255,255,255,0.5);">Atendimento Individual</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-4 rounded-4" style="background: rgba(240, 147, 251, 0.15); border: 1px solid rgba(240, 147, 251, 0.3);">
                        <div class="fs-1 mb-3">💬</div>
                        <div class="fw-bold fs-5 mb-2">Entrevista</div>
                        <div class="small" style="color: rgba(255,255,255,0.5);">Com Responsável</div>
                      </div>
                    </div>
                    <div class="col-6">
                      <div class="p-4 rounded-4" style="background: rgba(102, 126, 234, 0.15); border: 1px solid rgba(102, 126, 234, 0.3);">
                        <div class="fs-1 mb-3">🤖</div>
                        <div class="fw-bold fs-5 mb-2">IA Avançada</div>
                        <div class="small" style="color: rgba(255,255,255,0.5);">Transcrição de Áudio</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section Bootstrap -->
      <section id="features" class="py-5" style="background: rgba(255,255,255,0.02); padding-top: 6rem !important; padding-bottom: 6rem !important;">
        <div class="container-xxl px-4 px-lg-5">
          <div class="text-center mb-5">
            <div class="d-inline-block px-4 py-2 rounded-pill mb-4" style="background: rgba(102, 126, 234, 0.1); border: 1px solid rgba(102, 126, 234, 0.3);">
              <span class="small fw-semibold" style="color: #a0cfff;">FUNCIONALIDADES</span>
            </div>
            <h2 class="display-3 fw-black mb-4">Tudo que você precisa</h2>
            <p class="fs-5 mx-auto" style="max-width: 700px; line-height: 1.8; color: rgba(255,255,255,0.6);">Ferramentas profissionais para gestão completa do AEE</p>
          </div>

          <div class="row g-4 g-lg-5">
            <div class="col-md-4">
              <div class="p-5 rounded-4 h-100" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%); border: 1px solid rgba(255,255,255,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div class="d-flex align-items-center justify-content-center rounded-3 mb-4" style="width: 64px; height: 64px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); font-size: 2rem;">
                  📝
                </div>
                <h3 class="fs-4 fw-bold mb-3">Formulários Completos</h3>
                <p class="mb-0" style="line-height: 1.8; color: rgba(255,255,255,0.6);">PDI, PAI e Entrevista com Responsável totalmente digitalizados seguindo modelos oficiais</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="p-5 rounded-4 h-100" style="background: linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(240, 147, 251, 0.05) 100%); border: 1px solid rgba(255,255,255,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div class="d-flex align-items-center justify-content-center rounded-3 mb-4" style="width: 64px; height: 64px; background: linear-gradient(135deg, #764ba2 0%, #f093fb 100%); font-size: 2rem;">
                  🤖
                </div>
                <h3 class="fs-4 fw-bold mb-3">Inteligência Artificial</h3>
                <p class="mb-0" style="line-height: 1.8; color: rgba(255,255,255,0.6);">Transcrição automática de áudio para texto e sugestões pedagógicas inteligentes com GPT-4</p>
              </div>
            </div>

            <div class="col-md-4">
              <div class="p-5 rounded-4 h-100" style="background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%); border: 1px solid rgba(255,255,255,0.1); transition: transform 0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                <div class="d-flex align-items-center justify-content-center rounded-3 mb-4" style="width: 64px; height: 64px; background: linear-gradient(135deg, #f093fb 0%, #667eea 100%); font-size: 2rem;">
                  📄
                </div>
                <h3 class="fs-4 fw-bold mb-3">Relatórios Profissionais</h3>
                <p class="mb-0" style="line-height: 1.8; color: rgba(255,255,255,0.6);">Geração automática de PDFs formatados, prontos para impressão e compartilhamento</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section Bootstrap -->
      <section class="py-5" style="padding-top: 6rem !important; padding-bottom: 6rem !important;">
        <div class="container-xxl px-4 px-lg-5">
          <div class="row justify-content-center">
            <div class="col-lg-10 col-xl-8">
              <div class="p-5 rounded-4 text-center" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(20px);">
                <h2 class="display-3 fw-black mb-4">Pronto para começar?</h2>
                <p class="fs-5 mb-5 mx-auto" style="max-width: 600px; line-height: 1.8; color: rgba(255,255,255,0.7);">Cadastre-se gratuitamente e tenha acesso completo a todas as funcionalidades</p>
                <button @click="tab = 'register'" class="btn btn-lg px-5 py-3 rounded-3 fw-bold" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; color: white; box-shadow: 0 20px 50px rgba(102, 126, 234, 0.5);">
                  Criar Conta Grátis
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer Bootstrap -->
      <footer class="py-5" style="background: rgba(255,255,255,0.02); border-top: 1px solid rgba(255,255,255,0.1);">
        <div class="container-xxl px-4 px-lg-5">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            <div class="d-flex align-items-center gap-3">
              <div class="d-flex align-items-center justify-content-center rounded-3 fw-black fs-4" style="width: 48px; height: 48px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                C
              </div>
              <span class="fs-5 fw-bold">ConectAEE</span>
            </div>
            <div class="small text-center text-md-start" style="color: rgba(255,255,255,0.5);">
              © 2025 ConectAEE - Sistema de Gestão AEE
            </div>
          </div>
        </div>
      </footer>

      <!-- Login/Register Modal (mantém Tailwind pois é usado em outros componentes também) -->
      <div v-if="tab === 'login' || tab === 'register'" @click.self="tab = null" 
           class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <section class="bg-slate-900/95 backdrop-blur-xl border border-white/20 text-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full relative">
          <button @click="tab = null" class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition">
            <i class="fas fa-times text-gray-400"></i>
          </button>
          
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-semibold text-white">Acesso ao sistema</h2>
              <p class="text-sm text-gray-400">Login e cadastro no mesmo lugar.</p>
            </div>
            <span class="text-xs uppercase tracking-[0.3em] text-gray-500">Professor</span>
          </div>

          <div class="grid grid-cols-2 rounded-2xl bg-slate-800/50 p-1 text-sm font-medium mb-6">
            <button type="button"
                    class="py-2 rounded-2xl transition"
                    :class="tab === 'login' ? 'bg-gradient-to-r from-cyan-600 to-purple-600 shadow text-white' : 'text-gray-400 hover:text-white'"
                    @click="tab = 'login'">
              Entrar
            </button>
            <button type="button"
                    class="py-2 rounded-2xl transition"
                    :class="tab === 'register' ? 'bg-gradient-to-r from-cyan-600 to-purple-600 shadow text-white' : 'text-gray-400 hover:text-white'"
                    @click="tab = 'register'">
              Registrar
            </button>
          </div>

          <form v-show="tab === 'login'" @submit.prevent="login" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-email">Email</label>
              <input id="home-email" v-model.trim="loginForm.email" type="email" autocomplete="username" required
                     class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="seu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-password">Senha</label>
              <div class="relative">
                <input id="home-password" :type="showLoginPassword ? 'text' : 'password'"
                       v-model="loginForm.password" autocomplete="current-password" required
                       class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="••••••••">
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        @click="showLoginPassword = !showLoginPassword">
                  <i :class="showLoginPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between text-sm">
              <label class="inline-flex items-center gap-2 text-gray-300">
                <input type="checkbox" v-model="loginForm.remember" class="rounded border-gray-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500">
                Lembrar meu e-mail
              </label>
              <button type="button" class="text-cyan-400 hover:text-cyan-300"
                      @click="$showToast && $showToast('Recuperação em breve', 'Estamos finalizando essa etapa.', 'info')">
                Esqueci minha senha
              </button>
            </div>
            <div v-if="loginError" class="rounded-xl bg-rose-500/20 border border-rose-500/30 p-3 text-sm text-rose-200">
              {{ loginError }}
            </div>
            <button type="submit" :disabled="loginLoading"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60">
              <span v-if="loginLoading" class="inline-flex items-center gap-2">
                <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Entrando...
              </span>
              <span v-else>Entrar</span>
            </button>
          </form>

          <form v-show="tab === 'register'" @submit.prevent="register" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-name">Nome completo</label>
              <input id="home-name" v-model.trim="registerForm.name" type="text" required
                     class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="Seu nome completo">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-register-email">Email</label>
              <input id="home-register-email" v-model.trim="registerForm.email" type="email" required
                     class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="professor@escola.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-register-password">Senha</label>
              <div class="relative">
                <input id="home-register-password" :type="showRegisterPassword ? 'text' : 'password'"
                       v-model="registerForm.password" required
                       class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                       placeholder="Crie uma senha">
                <button type="button" class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                        @click="showRegisterPassword = !showRegisterPassword">
                  <i :class="showRegisterPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="mt-2 text-xs text-gray-400 grid grid-cols-2 gap-1">
                <span :class="passwordChecks.length ? 'text-cyan-400' : ''">8+ caracteres</span>
                <span :class="passwordChecks.uppercase ? 'text-cyan-400' : ''">1 maiúscula</span>
                <span :class="passwordChecks.lowercase ? 'text-cyan-400' : ''">1 minúscula</span>
                <span :class="passwordChecks.number ? 'text-cyan-400' : ''">1 número</span>
                <span :class="passwordChecks.special ? 'text-cyan-400' : ''">1 especial</span>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-1" for="home-register-confirm">Confirmar senha</label>
              <input id="home-register-confirm" v-model="registerForm.confirm_password" type="password" required
                     class="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                     placeholder="Repita a senha">
              <div v-if="registerForm.password && registerForm.confirm_password && registerForm.password !== registerForm.confirm_password"
                   class="mt-1 text-xs text-rose-400">As senhas não coincidem</div>
            </div>
            <div v-if="registerError" class="rounded-xl bg-rose-500/20 border border-rose-500/30 p-3 text-sm text-rose-200">
              {{ registerError }}
            </div>
            <div v-if="registerSuccess" class="rounded-xl bg-cyan-500/20 border border-cyan-500/30 p-3 text-sm text-cyan-200">
              {{ registerSuccess }}
            </div>
            <button type="submit" :disabled="registerLoading || !isRegisterValid"
                    class="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-60">
              <span v-if="registerLoading" class="inline-flex items-center gap-2">
                <span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Criando conta...
              </span>
              <span v-else>Finalizar cadastro</span>
            </button>
            <p class="text-xs text-gray-400 text-center">
              Administradores são cadastrados manualmente pelo gestor do sistema.
            </p>
          </form>
        </section>
      </div>
    </div>
  `,
  data() {
    return {
      tab: null,
      showModal: false,
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
    scrollToFeatures() {
      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
    },
    async login() {
      this.loginLoading = true;
      this.loginError = '';

      if (this.loginForm.remember) {
        localStorage.setItem('rememberedEmail', this.loginForm.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      try {
        const res = await api.post('/login', {
          email: this.loginForm.email,
          password: this.loginForm.password
        });

        if (res.data.ok) {
          localStorage.setItem('token', res.data.data.token);
          this.$root.user = res.data.data;
          this.$router.push('/dashboard');
        } else {
          this.loginError = res.data.error || 'Erro ao fazer login';
        }
      } catch (err) {
        this.loginError = err.response?.data?.error || 'Erro de conexão';
      } finally {
        this.loginLoading = false;
      }
    },
    async register() {
      this.registerLoading = true;
      this.registerError = '';
      this.registerSuccess = '';

      try {
        const res = await api.post('/register', {
          name: this.registerForm.name,
          email: this.registerForm.email,
          password: this.registerForm.password
        });

        if (res.data.ok) {
          this.registerSuccess = 'Conta criada com sucesso! Redirecionando...';
          setTimeout(() => {
            localStorage.setItem('token', res.data.data.token);
            this.$root.user = res.data.data;
            this.$router.push('/dashboard');
          }, 1500);
        } else {
          this.registerError = res.data.error || 'Erro ao criar conta';
        }
      } catch (err) {
        this.registerError = err.response?.data?.error || 'Erro de conexão';
      } finally {
        this.registerLoading = false;
      }
    }
  },
  mounted() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      this.loginForm.email = rememberedEmail;
      this.loginForm.remember = true;
    }
  }
};

'@

# Juntar tudo
$newContent = $before + $newHomeLanding + $after

# Salvar
$newContent | Set-Content -Path $originalFile -Encoding UTF8

Write-Host "HomeLanding substituído com sucesso!" -ForegroundColor Green
Write-Host "Total de linhas: $($newContent.Count)" -ForegroundColor Cyan
