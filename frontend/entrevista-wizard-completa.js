const EntrevistaResponsavelWizardCompleto = {
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
          <form @submit.prevent="salvarEntrevista" class="relative">
            
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
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nome completo <span class="text-red-500">*</span>
                      </label>
                      <input v-model="form.nome_responsavel" type="text" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        :class="validationErrors.nome_responsavel ? 'border-red-300 bg-red-50' : ''"
                        maxlength="120">
                      <p v-if="validationErrors.nome_responsavel" class="mt-2 text-sm text-red-600">{{ validationErrors.nome_responsavel }}</p>
                    </div>
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
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Telefone <span class="text-red-500">*</span>
                      </label>
                      <input v-model="form.telefone" type="tel" required 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        :class="validationErrors.telefone ? 'border-red-300 bg-red-50' : ''">
                      <p v-if="validationErrors.telefone" class="mt-2 text-sm text-red-600">{{ validationErrors.telefone }}</p>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input v-model="form.email" type="email" 
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                    </div>
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
                        <span class="text-gray-600">{{ form.nome_aluno || 'Não informado' }}</span>
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
        
        if (aluno.birth_date) {
          this.form.data_nascimento = aluno.birth_date;
        }
        if (aluno.school) {
          this.form.escola = aluno.school;
        }
        if (aluno.grade) {
          this.form.serie = aluno.grade;
        }
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
      } else if (this.currentStep === 2) {
        if (!this.form.nome_responsavel) {
          this.validationErrors.nome_responsavel = 'Informe o nome do responsável';
          isValid = false;
        }
        if (!this.form.parentesco) {
          this.validationErrors.parentesco = 'Selecione o parentesco';
          isValid = false;
        }
        if (!this.form.telefone) {
          this.validationErrors.telefone = 'Informe o telefone';
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
    
    async salvarEntrevista() {
      if (!this.validateCurrentStep()) {
        return;
      }
      
      this.loading = true;
      try {
        // Cria uma cópia dos dados do formulário e adiciona a idade calculada se necessário
        const dadosParaSalvar = {
          ...this.form,
          idade: this.calcularIdade(this.form.data_nascimento) // Calcula idade apenas no momento do envio
        };
        
        const response = await api.post('/entrevistas-responsavel', dadosParaSalvar);
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
window.EntrevistaResponsavelCompleta = EntrevistaResponsavelWizardCompleto;