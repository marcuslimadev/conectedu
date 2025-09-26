// Formulários AEE Completos - ConectEdu v5.0
// Baseados nos templates oficiais fornecidos

// Componente para Entrevista com Responsável - Template Completo
const EntrevistaResponsavelCompleta = {
  template: `
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Entrevista com o Responsável</h1>
        <p class="mt-1 text-sm text-gray-600">Formulário completo de entrevista inicial com o responsável pelo aluno</p>
      </div>
      
      <form @submit.prevent="salvarEntrevista" class="space-y-8">
        <!-- Data da Entrevista -->
        <div class="bg-white shadow rounded-lg p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data da Entrevista</label>
              <input v-model="form.data_entrevista" type="date" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Entrevista</label>
              <select v-model="form.tipo_entrevista" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <option value="">Selecione</option>
                <option value="primeira">Primeira Entrevista</option>
                <option value="atualizacao">Atualização da Entrevista</option>
                <option value="outros">Outros</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Motivo da Entrevista</label>
              <input v-model="form.motivo_entrevista" type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Dados de Identificação -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Dados de Identificação</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome do estudante</label>
              <input v-model="form.nome_estudante" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
              <input v-model="form.data_nascimento" type="date" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Naturalidade</label>
              <input v-model="form.naturalidade" type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nome da Escola</label>
              <input v-model="form.nome_escola" type="text" required 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Série/Ano</label>
              <input v-model="form.serie_ano" type="text" required 
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
          
          <!-- Dados dos Pais -->
          <div class="mt-6">
            <h4 class="text-md font-medium text-gray-800 mb-4">Dados dos Pais</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <h5 class="text-sm font-medium text-gray-700">Pai</h5>
                <input v-model="form.nome_pai" type="text" placeholder="Nome do pai"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <div class="grid grid-cols-2 gap-4">
                  <input v-model="form.idade_pai" type="number" placeholder="Idade"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <input v-model="form.escolaridade_pai" type="text" placeholder="Escolaridade"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                </div>
              </div>
              <div class="space-y-4">
                <h5 class="text-sm font-medium text-gray-700">Mãe</h5>
                <input v-model="form.nome_mae" type="text" placeholder="Nome da mãe"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                <div class="grid grid-cols-2 gap-4">
                  <input v-model="form.idade_mae" type="number" placeholder="Idade"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <input v-model="form.escolaridade_mae" type="text" placeholder="Escolaridade"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                </div>
              </div>
            </div>
          </div>
          
          <!-- Endereço e Contato -->
          <div class="mt-6">
            <h4 class="text-md font-medium text-gray-800 mb-4">Endereço e Contato</h4>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="md:col-span-2">
                <input v-model="form.endereco" type="text" placeholder="Endereço"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
              <div>
                <input v-model="form.bairro" type="text" placeholder="Bairro"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
              <div>
                <input v-model="form.cidade" type="text" placeholder="Cidade"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
            </div>
            <div class="mt-4">
              <input v-model="form.telefone" type="tel" placeholder="Telefone"
                class="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
            </div>
          </div>
        </div>

        <!-- Informações da Família -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Informações da Família</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Como era composta a família na época da concepção da criança:</label>
              <textarea v-model="form.composicao_familia_concepcao" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tem Irmãos?</label>
                <select v-model="form.tem_irmaos" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quantos?</label>
                <input v-model="form.quantidade_irmaos" type="number" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Quais as idades?</label>
                <input v-model="form.idades_irmaos" type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Os pais continuam casados? Se separados, são presentes?</label>
              <textarea v-model="form.situacao_pais" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Vida Social da Família (amigos, festas, passeios, moradia, nível econômico) - Faça um relato:</label>
              <textarea v-model="form.vida_social_familia" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Como é o hábito familiar do estudante? (Relatar como é o dia a dia do estudante)</label>
              <textarea v-model="form.habito_familiar" rows="4" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Benefícios sociais? Bolsa Família / BPC/ Passe Livre/ Outros - Relate quais benefícios a família recebe:</label>
              <textarea v-model="form.beneficios_sociais" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
          </div>
        </div>

        <!-- Gestação/Nascimento -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Gestação/Nascimento</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">A gravidez foi planejada pelos pais? (Relate)</label>
              <textarea v-model="form.gravidez_planejada" rows="3" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">A gestação foi uma experiência agradável para a mãe?</label>
              <textarea v-model="form.experiencia_gestacao" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Como foi a saúde da mãe?</label>
                <textarea v-model="form.saude_mae_gestacao" rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">E o estado emocional?</label>
                <textarea v-model="form.estado_emocional_mae" rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fez Pré-natal?</label>
                <select v-model="form.fez_prenatal" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Mês que começou</label>
                <input v-model="form.mes_inicio_prenatal" type="number" min="1" max="9" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Foi necessário algum tratamento?</label>
                <select v-model="form.tratamento_necessario" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>
            
            <div v-if="form.tratamento_necessario === 'sim'">
              <label class="block text-sm font-medium text-gray-700 mb-2">Qual tratamento?</label>
              <textarea v-model="form.qual_tratamento" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nascimento - Tipo de parto:</label>
                <select v-model="form.tipo_parto" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="normal">Normal</option>
                  <option value="cesariana">Cesárea</option>
                  <option value="forceps">Fórceps</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nasceu no tempo normal?</label>
                <select v-model="form.nasceu_tempo_normal" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Observações sobre o nascimento:</label>
              <textarea v-model="form.observacoes_nascimento" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">O bebê ao nascer:</label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label class="flex items-center">
                  <input type="checkbox" v-model="form.bebe_necessitou_oxigenio" class="mr-2">
                  Necessitou oxigênio
                </label>
                <label class="flex items-center">
                  <input type="checkbox" v-model="form.bebe_teve_convulsao" class="mr-2">
                  Teve convulsão
                </label>
                <label class="flex items-center">
                  <input type="checkbox" v-model="form.bebe_ictericia" class="mr-2">
                  Icterícia
                </label>
                <label class="flex items-center">
                  <input type="checkbox" v-model="form.bebe_incubadora" class="mr-2">
                  Incubadora
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Alimentação -->
        <div class="bg-white shadow rounded-lg p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Alimentação</h3>
          <div class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Foi amamentado?</label>
                <select v-model="form.foi_amamentado" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
                  <option value="">Selecione</option>
                  <option value="sim">Sim</option>
                  <option value="nao">Não</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Até que idade?</label>
                <input v-model="form.amamentado_ate_idade" type="text" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teve problemas com alimentação?</label>
              <textarea v-model="form.problemas_alimentacao" rows="2" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"></textarea>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Alimentação atual:</label>
              <textarea v-model="form.alimentacao_atual" rows="3" 
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
        data_entrevista: '',
        tipo_entrevista: '',
        motivo_entrevista: '',
        nome_estudante: '',
        data_nascimento: '',
        naturalidade: '',
        nome_escola: '',
        serie_ano: '',
        turno: '',
        nome_pai: '',
        idade_pai: '',
        escolaridade_pai: '',
        nome_mae: '',
        idade_mae: '',
        escolaridade_mae: '',
        endereco: '',
        bairro: '',
        cidade: '',
        telefone: '',
        composicao_familia_concepcao: '',
        tem_irmaos: '',
        quantidade_irmaos: '',
        idades_irmaos: '',
        situacao_pais: '',
        vida_social_familia: '',
        habito_familiar: '',
        beneficios_sociais: '',
        gravidez_planejada: '',
        experiencia_gestacao: '',
        saude_mae_gestacao: '',
        estado_emocional_mae: '',
        fez_prenatal: '',
        mes_inicio_prenatal: '',
        tratamento_necessario: '',
        qual_tratamento: '',
        tipo_parto: '',
        nasceu_tempo_normal: '',
        observacoes_nascimento: '',
        bebe_necessitou_oxigenio: false,
        bebe_teve_convulsao: false,
        bebe_ictericia: false,
        bebe_incubadora: false,
        foi_amamentado: '',
        amamentado_ate_idade: '',
        problemas_alimentacao: '',
        alimentacao_atual: ''
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

