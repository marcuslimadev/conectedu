const Dashboard = {
  template: `
    <div class="p-6 space-y-6">
      <!-- Header com Busca -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Visão Geral dos Alunos</h1>
            <p class="text-sm text-gray-600 mt-1">Acompanhe o progresso dos formulários AEE</p>
          </div>
          <div class="flex gap-3 w-full md:w-auto">
            <!-- Busca por Aluno (Professor) ou Professor (Admin) -->
            <input 
              v-model="filtros.busca" 
              type="text" 
              :placeholder="isAdmin ? 'Buscar por professor...' : 'Buscar por aluno...'" 
              class="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <!-- Filtro de Professor (apenas para Admin) -->
            <select 
              v-if="isAdmin" 
              v-model="filtros.professorId" 
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Todos os professores</option>
              <option v-for="prof in professores" :key="prof.id" :value="prof.id">
                {{ prof.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Gráfico de Estatísticas -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-6 text-gray-800">Estatísticas de Conclusão</h2>
        <div id="chart-container" style="width:100%; height:350px;"></div>
      </div>

      <!-- Grid de Cards de Alunos -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-bold mb-6 text-gray-800">
          Alunos 
          <span class="text-sm font-normal text-gray-500">({{ alunosFiltrados.length }} encontrado{{ alunosFiltrados.length !== 1 ? 's' : '' }})</span>
        </h2>

        <!-- Loading -->
        <div v-if="loading" class="text-center py-12">
          <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="mt-4 text-gray-600">Carregando alunos...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="alunosFiltrados.length === 0" class="text-center py-12 text-gray-500">
          <svg class="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
          </svg>
          <p class="text-lg font-medium">Nenhum aluno encontrado</p>
          <p class="text-sm mt-1">{{ filtros.busca ? 'Tente ajustar sua busca' : 'Comece cadastrando novos alunos' }}</p>
        </div>

        <!-- Grid de Cards -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div 
            v-for="aluno in alunosFiltrados" 
            :key="aluno.id" 
            class="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <!-- Avatar e Nome -->
            <div class="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                {{ getInitials(aluno.name) }}
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800 truncate text-base">{{ aluno.name }}</h3>
                <p class="text-xs text-gray-500 truncate">{{ aluno.school_name || 'Escola não informada' }}</p>
                <p v-if="isAdmin && aluno.professor_nome" class="text-xs text-blue-600 truncate mt-0.5">
                  Prof: {{ aluno.professor_nome }}
                </p>
              </div>
            </div>

            <!-- Percentuais de Conclusão -->
            <div class="space-y-3">
              <!-- Entrevista -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">Entrevista</span>
                  <span class="font-bold" :class="getPercentColor(aluno.entrevista_percent)">
                    {{ aluno.entrevista_percent }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-indigo-400 to-indigo-600"
                    :style="{width: aluno.entrevista_percent + '%'}"
                  ></div>
                </div>
              </div>

              <!-- PDI -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">PDI</span>
                  <span class="font-bold" :class="getPercentColor(aluno.pdi_percent)">
                    {{ aluno.pdi_percent }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-emerald-400 to-emerald-600"
                    :style="{width: aluno.pdi_percent + '%'}"
                  ></div>
                </div>
              </div>

              <!-- PAI -->
              <div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="font-medium text-gray-700">PAI</span>
                  <span class="font-bold" :class="getPercentColor(aluno.pai_percent)">
                    {{ aluno.pai_percent }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    class="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-400 to-purple-600"
                    :style="{width: aluno.pai_percent + '%'}"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Média Geral -->
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-700">Média Geral</span>
                <span class="text-lg font-bold" :class="getPercentColor(aluno.media_percent)">
                  {{ aluno.media_percent }}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      alunos: [],
      professores: [],
      filtros: {
        busca: '',
        professorId: ''
      },
      loading: false
    }
  },
  computed: {
    isAdmin() {
      return this.$root.user && this.$root.user.role === 'admin';
    },
    alunosFiltrados() {
      let resultado = this.alunos;

      // Filtro por professor (apenas admin)
      if (this.isAdmin && this.filtros.professorId) {
        resultado = resultado.filter(a => 
          String(a.created_by_teacher_id) === String(this.filtros.professorId)
        );
      }

      // Filtro de busca
      const busca = (this.filtros.busca || '').toLowerCase().trim();
      if (busca) {
        resultado = resultado.filter(a => {
          if (this.isAdmin) {
            // Admin busca por nome do professor
            return (a.professor_nome || '').toLowerCase().includes(busca);
          } else {
            // Professor busca por nome do aluno
            return (a.name || '').toLowerCase().includes(busca);
          }
        });
      }

      return resultado;
    }
  },
  async mounted() {
    await this.loadData();
    this.renderChart();
  },
  methods: {
    async loadData() {
      this.loading = true;
      try {
        // Carregar professores (se admin)
        if (this.isAdmin) {
          const profRes = await api.get('/users');
          this.professores = (profRes.data?.data?.rows || profRes.data?.data || [])
            .filter(u => u.role !== 'admin');
        }

        // Carregar alunos com percentuais
        let params = {};
        if (!this.isAdmin && this.$root.user) {
          params.teacher_id = this.$root.user.id;
        }

        const alunosRes = await api.get('/students', { params });
        const alunosData = alunosRes.data?.data?.rows || alunosRes.data?.data || [];

        // Buscar dados dos formulários para cada aluno
        this.alunos = await Promise.all(alunosData.map(async (aluno) => {
          const percentuais = await this.calcularPercentuais(aluno.id);
          
          // Buscar nome do professor (se admin)
          let professorNome = '';
          if (this.isAdmin && aluno.created_by_teacher_id) {
            const prof = this.professores.find(p => p.id === aluno.created_by_teacher_id);
            professorNome = prof ? prof.name : '';
          }

          return {
            ...aluno,
            professor_nome: professorNome,
            entrevista_percent: percentuais.entrevista,
            pdi_percent: percentuais.pdi,
            pai_percent: percentuais.pai,
            media_percent: Math.round((percentuais.entrevista + percentuais.pdi + percentuais.pai) / 3)
          };
        }));

        console.log('📊 [Dashboard] Alunos carregados:', this.alunos.length);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do dashboard:', error);
      } finally {
        this.loading = false;
      }
    },
    async calcularPercentuais(studentId) {
      const percentuais = { entrevista: 0, pdi: 0, pai: 0 };

      try {
        // Entrevista - 180 campos totais
        const entrevistaRes = await api.get('/entrevista-forms', { params: { student_id: studentId } });
        const entrevistaData = entrevistaRes.data?.data?.rows || entrevistaRes.data?.data || [];
        if (entrevistaData.length > 0) {
          percentuais.entrevista = this.calcularPreenchimento(entrevistaData[0], 180);
        }

        // PDI - 74 campos totais  
        const pdiRes = await api.get('/pdi-forms', { params: { student_id: studentId } });
        const pdiData = pdiRes.data?.data?.rows || pdiRes.data?.data || [];
        if (pdiData.length > 0) {
          percentuais.pdi = this.calcularPreenchimento(pdiData[0], 74);
        }

        // PAI - 46 campos totais
        const paiRes = await api.get('/plano-atendimento-forms', { params: { student_id: studentId } });
        const paiData = paiRes.data?.data?.rows || paiRes.data?.data || [];
        if (paiData.length > 0) {
          percentuais.pai = this.calcularPreenchimento(paiData[0], 46);
        }
      } catch (error) {
        console.error(`Erro ao calcular percentuais para aluno ${studentId}:`, error);
      }

      return percentuais;
    },
    calcularPreenchimento(formData, totalCampos) {
      if (!formData) return 0;

      let camposPreenchidos = 0;
      for (const key in formData) {
        if (key !== 'id' && key !== 'student_id' && key !== 'created_at' && key !== 'updated_at') {
          const valor = formData[key];
          if (valor !== null && valor !== undefined && valor !== '') {
            camposPreenchidos++;
          }
        }
      }

      return Math.round((camposPreenchidos / totalCampos) * 100);
    },
    getInitials(name) {
      if (!name) return '?';
      const parts = name.trim().split(' ');
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    },
    getPercentColor(percent) {
      if (percent >= 70) return 'text-green-600';
      if (percent >= 40) return 'text-yellow-600';
      return 'text-red-600';
    },
    renderChart() {
      // Aguardar dados serem carregados
      setTimeout(() => {
        if (!this.alunos.length) return;

        // Calcular estatísticas reais
        const totalAlunos = this.alunos.length;
        const mediaEntrevista = Math.round(this.alunos.reduce((sum, a) => sum + a.entrevista_percent, 0) / totalAlunos);
        const mediaPDI = Math.round(this.alunos.reduce((sum, a) => sum + a.pdi_percent, 0) / totalAlunos);
        const mediaPAI = Math.round(this.alunos.reduce((sum, a) => sum + a.pai_percent, 0) / totalAlunos);

        Highcharts.chart('chart-container', {
          chart: { type: 'column' },
          title: { text: 'Média de Conclusão por Formulário' },
          xAxis: {
            categories: ['Entrevista', 'PDI', 'PAI'],
            crosshair: true
          },
          yAxis: {
            min: 0,
            max: 100,
            title: { text: 'Percentual de Conclusão (%)' }
          },
          tooltip: {
            valueSuffix: '%'
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
              dataLabels: {
                enabled: true,
                format: '{y}%'
              }
            }
          },
          series: [{
            name: 'Conclusão Média',
            data: [mediaEntrevista, mediaPDI, mediaPAI],
            colorByPoint: true,
            colors: ['#6366f1', '#10b981', '#a855f7']
          }],
          credits: { enabled: false }
        });
      }, 500);
    }
  },
  watch: {
    alunosFiltrados() {
      this.renderChart();
    }
  }
};
