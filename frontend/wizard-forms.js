// Formulário de Entrevista com Responsável - Estilo JotForm
// Sistema de Etapas com Cartões e Barra de Progresso

const EntrevistaResponsavelWizard = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Entrevista com Responsável</h1>
          <p class="text-gray-600">Complete as informações em etapas organizadas</p>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700">Progresso do Formulário</span>
            <span class="text-sm text-gray-500">{{ currentStep }}/{{ totalSteps }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div class="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" 
                 :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="flex justify-between mt-2">
            <span v-for="(step, index) in steps" :key="index" 
                  class="text-xs font-medium transition-colors duration-300"
                  :class="index < currentStep ? 'text-indigo-600' : index === currentStep - 1 ? 'text-indigo-500' : 'text-gray-400'">
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
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : index + 1 <= maxCompletedStep 
                        ? 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  ]">
            <i :class="step.icon + ' mr-2'"></i>{{ step.title }}
          </button>
        </div>

        <!-- Form Card -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="handleFormSubmit" class="relative">
            <!-- Step 1: Dados do Aluno -->
            <div v-show="currentStep === 1" class="step-content">
              <div class="p-8">
                <div class="text-center mb-8">
                  <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-graduate text-2xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Dados do Aluno</h2>
                  <p class="text-gray-600">Vamos começar com as informações básicas do aluno</p>
                </div>

                <div class="max-w-2xl mx-auto space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="preencherDadosAlunoEntrevista" required 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                      :class="validationErrors.student_id ? 'border-red-300 bg-red-50' : ''">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">{{ aluno.name }}</option>
                    </select>
                    <p v-if="validationErrors.student_id" class="mt-2 text-sm text-red-600">{{ validationErrors.student_id }}</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Nome completo do aluno</label>
                      <input v-model="form.nome_aluno" type="text" readonly 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
                    </div>
                    <div>
                      <DatePicker
                        v-model="form.data_nascimento"
                        label="Data de nascimento"
                        :required="true"
                        :max-date="getMaxDate()"
                        :has-error="!!validationErrors.data_nascimento"
                        :error-message="validationErrors.data_nascimento"
                        placeholder="DD/MM/AAAA" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                      <input v-model="form.idade" type="number" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Escola</label>
                      <input v-model="form.escola" type="text" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Série/Ano</label>
                      <input v-model="form.serie" type="text" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Turno</label>
                      <select v-model="form.turno" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">Selecione</option>
                        <option value="matutino">Matutino</option>
                        <option value="vespertino">Vespertino</option>
                        <option value="noturno">Noturno</option>
                      </select>
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
                      class="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200">
                Próximo
                <i class="fas fa-chevron-right ml-2"></i>
              </button>

              <button v-else type="submit" :disabled="loading"
                      class="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                <div v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <i v-else class="fas fa-save mr-2"></i>
                {{ loading ? 'Salvando...' : 'Finalizar Entrevista' }}
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
      totalSteps: 5,
      maxCompletedStep: 1,
      loading: false,
      validationErrors: {},
      alunos: [],
      form: {
        student_id: '',
        nome_aluno: '',
        data_nascimento: '',
        idade: '',
        escola: '',
        serie: '',
        turno: ''
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
      return (this.currentStep / this.totalSteps) * 100;
    }
  },
  
  async mounted() {
    await this.carregarAlunos();
  },
  
  methods: {
    async carregarAlunos() {
      try {
        const response = await api.get('/students');
        this.alunos = response.data?.data?.rows || [];
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
      }
    },
    
    preencherDadosAlunoEntrevista() {
      const aluno = this.alunos.find(a => a.id == this.form.student_id);
      if (aluno) {
        this.form.nome_aluno = aluno.name || '';
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
        if (!this.form.data_nascimento) {
          this.validationErrors.data_nascimento = 'Informe a data de nascimento';
          isValid = false;
        }
      }
      
      return isValid;
    },
    
    getMaxDate() {
      return new Date().toISOString().split('T')[0];
    },
    
    async handleFormSubmit() {
      if (this.currentStep === this.totalSteps) {
        await this.salvarEntrevista();
      }
    },
    
    async salvarEntrevista() {
      this.loading = true;
      try {
        const response = await api.post('/entrevista-responsavel', this.form);
        if (response.data?.ok) {
          alert('Entrevista salva com sucesso!');
          this.$router.push('/');
        } else {
          alert('Erro ao salvar entrevista');
        }
      } catch (error) {
        alert('Erro ao salvar entrevista: ' + (error.response?.data?.message || error.message));
      } finally {
        this.loading = false;
      }
    }
  }
};

// Exportar para window para uso no router
window.EntrevistaResponsavelWizard = EntrevistaResponsavelWizard;