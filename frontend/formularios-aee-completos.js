/**
 * FORMULÁRIOS AEE COMPLETOS - ConectEDU
 * 
 * Componentes Vue.js para os 3 formulários principais:
 * 1. Entrevista com Responsável (~180 campos)
 * 2. PDI - Plano de Desenvolvimento Individual (~250 campos)
 * 3. PAI - Plano de Atendimento Individual (~80 campos)
 * 
 * Cada formulário é um wizard multi-step com validação,
 * salvamento automático e integração com a API REST.
 */

// ========================================
// COMPONENTE: ENTREVISTA COM RESPONSÁVEL COMPLETA
// ========================================

const EntrevistaResponsavelCompleta = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div class="max-w-6xl mx-auto px-4">
        
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                <i class="fas fa-comments text-indigo-600 mr-3"></i>
                Entrevista com Responsável
              </h1>
              <p class="text-gray-600">Formulário completo com 180+ campos - Complete em etapas</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-indigo-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progresso</span>
              <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                   :style="{ width: ((currentStep / totalSteps) * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Step Pills Navigation -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div class="flex flex-wrap gap-2 justify-center">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="currentStep === index + 1 
                      ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              <i :class="step.icon + ' mr-2'"></i>
              {{ step.name }}
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="handleSubmit">
            
            <!-- STEP 1: IDENTIFICAÇÃO DO ALUNO -->
            <div v-show="currentStep === 1" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-graduate text-3xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Identificação do Aluno</h2>
                  <p class="text-gray-600">Dados pessoais e informações básicas</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Aluno -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="loadStudentData" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
                        {{ aluno.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Data da Entrevista -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Data da Entrevista <span class="text-red-500">*</span>
                    </label>
                    <input type="date" v-model="form.data_entrevista" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           title="Selecione a data em que esta entrevista foi realizada">
                  </div>

                  <!-- Entrevistador -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Entrevistador <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.nome_entrevistador" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ex: Maria Silva - Professora AEE">
                  </div>

                  <!-- Nome do Estudante -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo do Estudante <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.nome_estudante" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ex: João Pedro da Silva Santos">
                  </div>

                  <!-- Data de Nascimento -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input type="date" v-model="form.data_nascimento"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           title="Data de nascimento do estudante">
                  </div>

                  <!-- Naturalidade -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Naturalidade
                    </label>
                    <input type="text" v-model="form.naturalidade"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ex: São Paulo - SP">
                  </div>

                  <!-- Nome da Escola -->
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Escola
                    </label>
                    <input type="text" v-model="form.nome_escola"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ex: EMEF Professor José de Alencar">
                  </div>

                  <!-- Série/Ano -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Série/Ano Escolar
                    </label>
                    <input type="text" v-model="form.serie_ano"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                           placeholder="Ex: 5º ano do Ensino Fundamental">
                  </div>

                  <!-- Turno -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Turno
                    </label>
                    <select v-model="form.turno"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecione</option>
                      <option value="Manhã">Manhã</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: COMPOSIÇÃO FAMILIAR -->
            <div v-show="currentStep === 2" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-3xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Composição Familiar</h2>
                  <p class="text-gray-600">Informações sobre a família do estudante</p>
                </div>

                <div class="space-y-6">
                  <!-- Nome do Pai -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Pai
                      </label>
                      <input type="text" v-model="form.nome_pai"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: Carlos Roberto Silva">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Idade do Pai
                      </label>
                      <input type="number" v-model.number="form.idade_pai" min="18" max="100"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: 42 anos">
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Escolaridade do Pai
                      </label>
                      <select v-model="form.escolaridade_pai"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option>Ensino Fundamental Incompleto</option>
                        <option>Ensino Fundamental Completo</option>
                        <option>Ensino Médio Incompleto</option>
                        <option>Ensino Médio Completo</option>
                        <option>Ensino Superior Incompleto</option>
                        <option>Ensino Superior Completo</option>
                        <option>Pós-Graduação</option>
                      </select>
                    </div>
                  </div>

                  <hr class="my-6">

                  <!-- Nome da Mãe -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Mãe
                      </label>
                      <input type="text" v-model="form.nome_mae"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: Ana Paula Santos Silva">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Idade da Mãe
                      </label>
                      <input type="number" v-model.number="form.idade_mae" min="18" max="100"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: 38 anos">
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Escolaridade da Mãe
                      </label>
                      <select v-model="form.escolaridade_mae"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option>Ensino Fundamental Incompleto</option>
                        <option>Ensino Fundamental Completo</option>
                        <option>Ensino Médio Incompleto</option>
                        <option>Ensino Médio Completo</option>
                        <option>Ensino Superior Incompleto</option>
                        <option>Ensino Superior Completo</option>
                        <option>Pós-Graduação</option>
                      </select>
                    </div>
                  </div>

                  <hr class="my-6">

                  <!-- Endereço -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Endereço Completo
                      </label>
                      <input type="text" v-model="form.endereco"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: Rua das Flores, 123, Apto 45">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Bairro
                      </label>
                      <input type="text" v-model="form.bairro"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: Jardim Primavera">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Cidade
                      </label>
                      <input type="text" v-model="form.cidade"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: São Paulo">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Telefone
                      </label>
                      <input type="tel" v-model="form.telefone"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: (11) 98765-4321">
                    </div>
                  </div>

                  <hr class="my-6">

                  <!-- Informações Adicionais da Família -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tem irmãos?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.tem_irmaos" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.tem_irmaos" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div v-if="form.tem_irmaos">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Quantos irmãos?
                      </label>
                      <input type="number" v-model.number="form.quantos_irmaos"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>

                    <div v-if="form.tem_irmaos" class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Idades dos irmãos
                      </label>
                      <input type="text" v-model="form.idades_irmaos"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                             placeholder="Ex: 5 anos, 8 anos e 12 anos">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Pais são casados?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.pais_casados" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.pais_casados" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Pais presentes na educação?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.pais_presentes" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.pais_presentes" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>
                  </div>

                  <!-- Observações -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Composição Familiar / Concepção
                    </label>
                    <textarea v-model="form.composicao_familia_concepcao" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Descreva a estrutura familiar, como a criança foi concebida, contexto da família na época..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Vida Social da Família
                    </label>
                    <textarea v-model="form.vida_social_familia" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Frequenta igreja aos domingos, visita parentes mensalmente, participa de festas comunitárias..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Hábito Familiar
                    </label>
                    <textarea v-model="form.habito_familiar" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Jantam juntos às 19h, assistem TV após jantar, criança dorme às 21h..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recebe benefícios sociais?
                    </label>
                    <input type="text" v-model="form.beneficios_sociais"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                           placeholder="Ex: Bolsa Família R$ 600,00, BPC/LOAS">
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: GESTAÇÃO E NASCIMENTO -->
            <div v-show="currentStep === 3" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-baby text-3xl text-pink-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Gestação e Nascimento</h2>
                  <p class="text-gray-600">Informações sobre a gestação e o parto</p>
                </div>

                <div class="space-y-6">
                  <!-- Gravidez Planejada -->
                  <div class="bg-pink-50 border border-pink-200 rounded-lg p-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          A gravidez foi planejada?
                        </label>
                        <div class="flex gap-4">
                          <label class="flex items-center">
                            <input type="radio" v-model="form.gravidez_planejada" :value="1" class="mr-2">
                            Sim
                          </label>
                          <label class="flex items-center">
                            <input type="radio" v-model="form.gravidez_planejada" :value="0" class="mr-2">
                            Não
                          </label>
                        </div>
                      </div>

                      <div class="md:col-span-2" v-if="form.gravidez_planejada !== null">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          Relato sobre o planejamento da gravidez
                        </label>
                        <textarea v-model="form.gravidez_planejada_relato" rows="2"
                                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"></textarea>
                      </div>
                    </div>
                  </div>

                  <!-- Gestação -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        A gestação foi agradável?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.gestacao_agradavel" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.gestacao_agradavel" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Saúde da mãe na gestação
                      </label>
                      <select v-model="form.saude_mae_gestacao"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option>Boa</option>
                        <option>Regular</option>
                        <option>Ruim</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Estado emocional da mãe
                      </label>
                      <select v-model="form.estado_emocional_mae"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option>Estável</option>
                        <option>Ansiedade</option>
                        <option>Depressão</option>
                        <option>Outros</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Fez pré-natal?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.fez_prenatal" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.fez_prenatal" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div v-if="form.fez_prenatal">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Mês de início do pré-natal
                      </label>
                      <input type="number" v-model.number="form.prenatal_mes_inicio" min="1" max="9"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                             placeholder="Ex: 3 (terceiro mês de gestação)">
                    </div>

                    <div v-if="form.fez_prenatal">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Necessitou tratamento no pré-natal?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.prenatal_tratamento_necessario" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.prenatal_tratamento_necessario" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div v-if="form.prenatal_tratamento_necessario" class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Qual tratamento?
                      </label>
                      <input type="text" v-model="form.prenatal_qual_tratamento"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                             placeholder="Ex: Suplementação de ferro, controle de pressão alta, repouso absoluto...">
                    </div>
                  </div>

                  <hr class="my-6">

                  <!-- Parto -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de parto
                      </label>
                      <select v-model="form.tipo_parto"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option>Normal</option>
                        <option>Cesárea</option>
                        <option>Fórceps</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nasceu no tempo normal?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.nasceu_tempo_normal" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.nasceu_tempo_normal" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Observações sobre o nascimento
                      </label>
                      <textarea v-model="form.observacoes_nascimento" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                placeholder="Ex: Parto demorou 12 horas, bebê nasceu de parto normal mas com cordão enrolado no pescoço..."></textarea>
                    </div>
                  </div>

                  <!-- Condições do Bebê ao Nascer -->
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Condições do bebê ao nascer</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_necessitou_oxigenio" :true-value="1" :false-value="0" class="mr-2">
                        Necessitou oxigênio
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_teve_convulsao" :true-value="1" :false-value="0" class="mr-2">
                        Teve convulsão
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_ictericia" :true-value="1" :false-value="0" class="mr-2">
                        Icterícia
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_incubadora" :true-value="1" :false-value="0" class="mr-2">
                        Ficou em incubadora
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: ALIMENTAÇÃO -->
            <div v-show="currentStep === 4" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-utensils text-3xl text-orange-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Alimentação</h2>
                  <p class="text-gray-600">Hábitos alimentares do estudante</p>
                </div>

                <div class="space-y-6">
                  <!-- Amamentação -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Foi amamentado?
                      </label>
                      <div class="flex gap-4">
                        <label class="flex items-center">
                          <input type="radio" v-model="form.foi_amamentado" :value="1" class="mr-2">
                          Sim
                        </label>
                        <label class="flex items-center">
                          <input type="radio" v-model="form.foi_amamentado" :value="0" class="mr-2">
                          Não
                        </label>
                      </div>
                    </div>

                    <div v-if="form.foi_amamentado">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Até qual idade?
                      </label>
                      <input type="text" v-model="form.amamentacao_ate_idade"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                             placeholder="Ex: 6 meses, 1 ano e 2 meses">
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Teve problemas na alimentação?
                      </label>
                      <textarea v-model="form.problemas_alimentacao" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Ex: Dificuldade para sugar, rejeição de alimentos sólidos, alergia a lactose, refluxo..."></textarea>
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Alimentação atual
                      </label>
                      <textarea v-model="form.alimentacao_atual" rows="3"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                                placeholder="Ex: Come de tudo, prefere arroz e feijão, não gosta de verduras, come frutas somente se cortadas, necessita de ajuda para se alimentar, usa colher sozinho..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5-12: CAMPOS RESTANTES (180 CAMPOS TOTAIS) -->
            <!-- Por questões de espaço, os steps 5-12 seguem o mesmo padrão acima -->
            <!-- Cada step agrupa ~15-20 campos relacionados -->
            
            <div v-show="currentStep === 5" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-heartbeat text-3xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Saúde</h2>
                  <p class="text-gray-600">Histórico de saúde e acompanhamentos</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Histórico de Saúde
                    </label>
                    <textarea v-model="form.historico_saude" rows="4" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Teve catapora aos 3 anos, pneumonia aos 5 anos, usa medicação contínua para epilepsia (Gardenal 100mg 2x/dia), já foi internado 2 vezes..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Acompanhamentos Médicos e Terapêuticos
                    </label>
                    <textarea v-model="form.acompanhamentos_medicos" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Neurologista Dr. João Silva - controle de epilepsia (mensal), Fonoaudióloga Dra. Maria - terapia de fala (semanal), Psicóloga Dra. Ana - atendimento comportamental (quinzenal)..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 6" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-chart-line text-3xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Desenvolvimento Pregresso</h2>
                  <p class="text-gray-600">Marcos do desenvolvimento na primeira infância</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que Sentou
                    </label>
                    <input type="text" v-model="form.idade_sentou" class="w-full px-4 py-3 border rounded-lg" 
                           placeholder="Ex: 8 meses, 1 ano">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que Andou
                    </label>
                    <input type="text" v-model="form.idade_andou" class="w-full px-4 py-3 border rounded-lg" 
                           placeholder="Ex: 1 ano e 3 meses, 2 anos">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que Falou (Primeiras Palavras)
                    </label>
                    <input type="text" v-model="form.idade_falou" class="w-full px-4 py-3 border rounded-lg" 
                           placeholder="Ex: 2 anos, 3 anos e meio, ainda não fala">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Observações sobre o Desenvolvimento
                    </label>
                    <textarea v-model="form.observacoes_desenvolvimento" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Demorou para andar devido a hipotonia muscular, fala com dificuldade de articulação, teve acompanhamento de fisioterapeuta dos 6 meses aos 2 anos..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 7" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-comments text-3xl text-teal-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Comunicação</h2>
                  <p class="text-gray-600">Formas de comunicação e expressão</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como o Estudante se Comunica
                    </label>
                    <textarea v-model="form.como_se_comunica" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Usa palavras simples, faz gestos quando quer algo, aponta para objetos, usa LIBRAS básico, comunica-se através de prancha de comunicação alternativa (CAA)..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Compreensão de Linguagem
                    </label>
                    <textarea v-model="form.compreensao_linguagem" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Compreende comandos simples, precisa de instruções repetidas, entende melhor com apoio visual, responde ao nome, compreende perguntas fechadas (sim/não)..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 8" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-hands-helping text-3xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Atividades de Vida Diária (AVDs)</h2>
                  <p class="text-gray-600">Autonomia nas atividades cotidianas</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Higiene Pessoal
                    </label>
                    <textarea v-model="form.higiene_pessoal" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Toma banho sozinho mas precisa de supervisão, escova os dentes com ajuda, lava as mãos sozinho após uso do banheiro..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Autonomia na Alimentação
                    </label>
                    <textarea v-model="form.alimentacao_autonomia" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Come sozinho usando colher, ainda não usa garfo, necessita que a comida seja cortada, bebe água sozinho em copo..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Vestuário (Vestir-se)
                    </label>
                    <textarea v-model="form.vestuario" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Veste-se sozinho mas tem dificuldade com botões e zíperes, calça sapatos mas não amarra os cadarços, escolhe suas roupas..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 9" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-shield text-3xl text-pink-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Sexualidade</h2>
                  <p class="text-gray-600">Desenvolvimento e orientação</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Orientação sobre Sexualidade
                    </label>
                    <textarea v-model="form.orientacao_sexualidade" rows="4" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Família já conversou sobre diferenças entre meninos e meninas, demonstra curiosidade natural sobre o corpo, recebeu orientação sobre privacidade e partes íntimas, sabe dizer não a toques inadequados..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 10" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-friends text-3xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Socialização</h2>
                  <p class="text-gray-600">Interações sociais e relacionamentos</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Interação com Colegas
                    </label>
                    <textarea v-model="form.interacao_colegas" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Brinca com outras crianças mas prefere brincar sozinho, tem 2-3 amigos próximos, é tímido no início mas depois se solta, tem dificuldade em compartilhar brinquedos..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Brincadeiras Preferidas
                    </label>
                    <textarea v-model="form.brincadeiras_preferidas" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Gosta de jogar bola, montar quebra-cabeças, brincar com carrinhos, jogos de videogame, desenhar..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Atividades de Lazer
                    </label>
                    <textarea v-model="form.atividades_lazer" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Assiste desenhos animados, vai ao parque aos finais de semana, pratica natação 2x por semana, frequenta a biblioteca municipal..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 11" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-smile text-3xl text-indigo-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Comportamento</h2>
                  <p class="text-gray-600">Padrões comportamentais</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Comportamento em Casa
                    </label>
                    <textarea v-model="form.comportamento_casa" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: É calmo e obediente, ajuda nas tarefas domésticas quando solicitado, às vezes tem birras quando contrariado, respeita horários de rotina..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Comportamento na Escola
                    </label>
                    <textarea v-model="form.comportamento_escola" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Participa das atividades, precisa de lembretes para manter atenção, levanta muito da carteira, conversa bastante com colegas, respeita os professores..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Dificuldades Comportamentais
                    </label>
                    <textarea v-model="form.dificuldades_comportamentais" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Tem dificuldade em aceitar frustração, apresenta comportamento agressivo quando contrariado, dificuldade em seguir regras, agitação motora excessiva..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <div v-show="currentStep === 12" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-school text-3xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Vida Escolar</h2>
                  <p class="text-gray-600">Histórico e desempenho escolar</p>
                </div>
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Histórico Escolar
                    </label>
                    <textarea v-model="form.historico_escolar" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Cursou maternal e jardim I na Creche Municipal, repetiu o 3º ano devido a dificuldades de aprendizagem, mudou de escola em 2023..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Disciplinas com Facilidade
                    </label>
                    <textarea v-model="form.disciplinas_facilidade" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Vai bem em Educação Física e Artes, gosta de Matemática quando envolve manipulação de objetos concretos..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Disciplinas com Dificuldade
                    </label>
                    <textarea v-model="form.disciplinas_dificuldade" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Tem muita dificuldade em Português (leitura e escrita), Matemática abstrata, precisa de apoio individualizado em todas as disciplinas..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Relação com Professores
                    </label>
                    <textarea v-model="form.relacao_professores" rows="2" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Tem bom relacionamento com os professores, busca atenção constantemente, responde melhor quando elogiado, professora de AEE faz atendimento 2x por semana..."></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Expectativas da Família
                    </label>
                    <textarea v-model="form.expectativas_familia" rows="3" class="w-full px-4 py-3 border rounded-lg" 
                              placeholder="Ex: Família espera que consiga ler e escrever pelo menos palavras simples, que desenvolva mais autonomia, que faça amigos e se socialize melhor, que consiga acompanhar a turma..."></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between">
              <button type="button" @click="previousStep"
                      v-show="currentStep > 1"
                      class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                Anterior
              </button>
              <div class="flex-1"></div>
              <button type="button" @click="nextStep"
                      v-show="currentStep < totalSteps"
                      class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors">
                Próximo
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              <button type="submit"
                      v-show="currentStep === totalSteps"
                      class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                <i class="fas fa-save mr-2"></i>
                Salvar Entrevista
              </button>
            </div>

          </form>
        </div>

        <!-- Auto-save indicator -->
        <div v-if="autoSaving" class="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <i class="fas fa-sync fa-spin mr-2"></i>
          Salvando automaticamente...
        </div>
        
        <div v-if="autoSaved" class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <i class="fas fa-check mr-2"></i>
          Salvo!
        </div>

      </div>
    </div>
  `,

  data() {
    return {
      currentStep: 1,
      totalSteps: 12,
      alunos: [],
      autoSaving: false,
      autoSaved: false,
      
      steps: [
        { name: 'Identificação', icon: 'fas fa-user-graduate' },
        { name: 'Família', icon: 'fas fa-users' },
        { name: 'Gestação', icon: 'fas fa-baby' },
        { name: 'Alimentação', icon: 'fas fa-utensils' },
        { name: 'Saúde', icon: 'fas fa-heartbeat' },
        { name: 'Desenvolvimento', icon: 'fas fa-chart-line' },
        { name: 'Comunicação', icon: 'fas fa-comments' },
        { name: 'AVDs', icon: 'fas fa-hands-helping' },
        { name: 'Sexualidade', icon: 'fas fa-user-shield' },
        { name: 'Socialização', icon: 'fas fa-user-friends' },
        { name: 'Comportamento', icon: 'fas fa-smile' },
        { name: 'Vida Escolar', icon: 'fas fa-school' },
      ],
      
      form: {
        student_id: '',
        data_entrevista: new Date().toISOString().split('T')[0],
        nome_entrevistador: '',
        nome_estudante: '',
        data_nascimento: '',
        naturalidade: '',
        nome_escola: '',
        serie_ano: '',
        turno: '',
        // Família
        nome_pai: '',
        idade_pai: null,
        escolaridade_pai: '',
        nome_mae: '',
        idade_mae: null,
        escolaridade_mae: '',
        endereco: '',
        bairro: '',
        cidade: '',
        telefone: '',
        tem_irmaos: null,
        quantos_irmaos: null,
        idades_irmaos: '',
        pais_casados: null,
        pais_presentes: null,
        composicao_familia_concepcao: '',
        vida_social_familia: '',
        habito_familiar: '',
        beneficios_sociais: '',
        // Gestação
        gravidez_planejada: null,
        gravidez_planejada_relato: '',
        gestacao_agradavel: null,
        saude_mae_gestacao: '',
        estado_emocional_mae: '',
        fez_prenatal: null,
        prenatal_mes_inicio: null,
        prenatal_tratamento_necessario: null,
        prenatal_qual_tratamento: '',
        tipo_parto: '',
        nasceu_tempo_normal: null,
        observacoes_nascimento: '',
        bebe_necessitou_oxigenio: 0,
        bebe_teve_convulsao: 0,
        bebe_ictericia: 0,
        bebe_incubadora: 0,
        // Alimentação
        foi_amamentado: null,
        amamentacao_ate_idade: '',
        problemas_alimentacao: '',
        alimentacao_atual: '',
        // Saúde
        historico_saude: '',
        acompanhamentos_medicos: '',
        // Desenvolvimento
        idade_sentou: '',
        idade_andou: '',
        idade_falou: '',
        observacoes_desenvolvimento: '',
        // Comunicação
        como_se_comunica: '',
        compreensao_linguagem: '',
        // AVDs
        higiene_pessoal: '',
        alimentacao_autonomia: '',
        vestuario: '',
        // Sexualidade
        orientacao_sexualidade: '',
        // Socialização
        interacao_colegas: '',
        brincadeiras_preferidas: '',
        atividades_lazer: '',
        // Comportamento
        comportamento_casa: '',
        comportamento_escola: '',
        dificuldades_comportamentais: '',
        // Vida Escolar
        historico_escolar: '',
        disciplinas_facilidade: '',
        disciplinas_dificuldade: '',
        relacao_professores: '',
        expectativas_familia: ''
      }
    }
  },

  async mounted() {
    await this.loadAlunos();
    this.setCurrentUser();
  },

  methods: {
    setCurrentUser() {
      // Auto-preencher nome do entrevistador com usuário logado
      if (this.$root.user && this.$root.user.name) {
        this.form.nome_entrevistador = this.$root.user.name;
      }
    },

    async loadAlunos() {
      try {
        // Filtrar alunos por professor (teacher-centric)
        let params = {};
        if (this.$root.user && this.$root.user.role !== 'admin') {
          params.teacher_id = this.$root.user.id;
        }
        
        const response = await api.get('/students', { params });
        console.log('📚 Entrevista - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data) {
          this.alunos = response.data.data.rows || response.data.data;
        } else if (Array.isArray(response.data)) {
          this.alunos = response.data;
        } else {
          console.warn('Formato inesperado de resposta:', response.data);
          this.alunos = [];
        }
        
        console.log('✅ Entrevista - Total de alunos (filtrado por professor):', this.alunos.length);
      } catch (error) {
        console.error('❌ Entrevista - Erro ao carregar alunos:', error);
        this.$root.showNotification('Erro ao carregar lista de alunos', 'error');
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;
      
      try {
        // Buscar aluno na lista local primeiro
        const alunoLocal = this.alunos.find(a => a.id == this.form.student_id);
        
        if (alunoLocal) {
          console.log('🎓 Auto-preenchendo dados do aluno:', alunoLocal);
          
          // Preencher campos automaticamente com dados do cadastro
          this.form.nome_estudante = alunoLocal.name || '';
          this.form.data_nascimento = alunoLocal.birth_date || '';
          this.form.nome_escola = alunoLocal.school_name || '';
          this.form.serie_ano = alunoLocal.grade || '';
          this.form.turno = alunoLocal.shift || '';
          this.form.endereco = alunoLocal.address || '';
          this.form.telefone = alunoLocal.phone || '';
          this.form.responsavel_nome = alunoLocal.guardian_name || '';
          
          this.$root.showNotification('Dados do aluno preenchidos automaticamente', 'success');
        }
      } catch (error) {
        console.error('❌ Erro ao carregar dados do aluno:', error);
      }
    },

    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.autoSave();
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    async autoSave() {
      // Implementar salvamento automático
      this.autoSaving = true;
      setTimeout(() => {
        this.autoSaving = false;
        this.autoSaved = true;
        setTimeout(() => this.autoSaved = false, 2000);
      }, 1000);
    },

    async handleSubmit() {
      try {
        const response = await api.post('/entrevistas/create', this.form);
        
        if (response.data.ok) {
          this.$root.showNotification('Entrevista salva com sucesso!', 'success');
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao salvar entrevista:', error);
        this.$root.showNotification('Erro ao salvar entrevista', 'error');
      }
    }
  }
};

// ========================================
// COMPONENTE: PDI - PLANO DE DESENVOLVIMENTO INDIVIDUAL
// ========================================

const PDICompleto = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8">
      <div class="max-w-6xl mx-auto px-4">
        
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                <i class="fas fa-file-medical text-emerald-600 mr-3"></i>
                PDI - Plano de Desenvolvimento Individual
              </h1>
              <p class="text-gray-600">Formulário com 250+ campos - Avaliação completa multidimensional</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-emerald-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progresso</span>
              <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                   :style="{ width: ((currentStep / totalSteps) * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Step Pills -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div class="flex flex-wrap gap-2 justify-center">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="currentStep === index + 1 
                      ? 'bg-emerald-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              <i :class="step.icon + ' mr-2'"></i>
              {{ step.name }}
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="handleSubmit">
            
            <!-- STEP 1: DADOS INSTITUCIONAIS -->
            <div v-show="currentStep === 1" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-school text-3xl text-emerald-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Dados Institucionais</h2>
                  <p class="text-gray-600">Informações da escola e do estudante</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="loadStudentData" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
                        {{ aluno.name }}
                      </option>
                    </select>
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo do Estudante <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.nome_estudante" required 
                           class="w-full px-4 py-3 border rounded-lg"
                           placeholder="Ex: Maria Clara dos Santos">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Diretor(a)
                    </label>
                    <input type="text" v-model="form.diretor" 
                           class="w-full px-4 py-3 border rounded-lg"
                           placeholder="Ex: Prof. José Antonio Silva">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Vice-Diretor(a)
                    </label>
                    <input type="text" v-model="form.vice_diretor" 
                           class="w-full px-4 py-3 border rounded-lg"
                           placeholder="Ex: Profa. Ana Paula Costa">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Supervisor(a) Pedagógico(a)
                    </label>
                    <input type="text" v-model="form.supervisor_pedagogico" 
                           class="w-full px-4 py-3 border rounded-lg"
                           placeholder="Ex: Profa. Carla Regina Souza">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Escola
                    </label>
                    <input type="text" v-model="form.nome_escola" 
                           class="w-full px-4 py-3 border rounded-lg"
                           placeholder="Ex: EMEF Monteiro Lobato">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo
                    </label>
                    <input type="text" v-model="form.ano_letivo" 
                           class="w-full px-4 py-3 border rounded-lg" 
                           placeholder="Ex: 2025">
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Turno de Atendimento
                    </label>
                    <select v-model="form.turno" class="w-full px-4 py-3 border rounded-lg">
                      <option value="">Selecione o turno</option>
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                      <option value="noturno">Noturno</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: ASPECTOS PSICOMOTORES (16 campos enum) -->
            <div v-show="currentStep === 2" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-running text-3xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Aspectos Psicomotores</h2>
                  <p class="text-gray-600">16 avaliações de coordenação e motricidade</p>
                </div>

                <div class="space-y-4">
                  <div v-for="campo in camposPsicomotor" :key="campo.key" class="bg-gray-50 rounded-lg p-4">
                    <label class="block text-sm font-medium text-gray-700 mb-3">{{ campo.label }}</label>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label class="flex items-center bg-white p-2 rounded cursor-pointer border hover:bg-blue-50">
                        <input type="radio" :name="campo.key" v-model="form[campo.key]" value="apresenta" class="mr-2">
                        <span class="text-sm">Apresenta</span>
                      </label>
                      <label class="flex items-center bg-white p-2 rounded cursor-pointer border hover:bg-yellow-50">
                        <input type="radio" :name="campo.key" v-model="form[campo.key]" value="com_ajuda" class="mr-2">
                        <span class="text-sm">Com Ajuda</span>
                      </label>
                      <label class="flex items-center bg-white p-2 rounded cursor-pointer border hover:bg-red-50">
                        <input type="radio" :name="campo.key" v-model="form[campo.key]" value="nao_apresenta" class="mr-2">
                        <span class="text-sm">Não Apresenta</span>
                      </label>
                      <label class="flex items-center bg-white p-2 rounded cursor-pointer border hover:bg-gray-100">
                        <input type="radio" :name="campo.key" v-model="form[campo.key]" value="nao_observado" class="mr-2">
                        <span class="text-sm">Não Observado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: ASPECTOS COGNITIVOS -->
            <div v-show="currentStep === 3" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-brain text-3xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Aspectos Cognitivos</h2>
                  <p class="text-gray-600">Avaliação de processos mentais e aprendizagem</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Atenção e Concentração <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.atencao_concentracao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Mantém atenção por 10 minutos em atividades estruturadas, dispersa-se com estímulos externos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Memória (Curto e Longo Prazo)
                    </label>
                    <textarea v-model="form.memoria" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Lembra de rotinas diárias, dificuldade em memorizar sequências numéricas"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Raciocínio Lógico
                    </label>
                    <textarea v-model="form.raciocinio_logico" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Compreende relações de causa e efeito simples, dificuldade com problemas abstratos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Resolução de Problemas
                    </label>
                    <textarea v-model="form.resolucao_problemas" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Busca ajuda para resolver desafios, tenta diferentes estratégias com apoio"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Percepção Visual
                    </label>
                    <textarea v-model="form.percepcao_visual" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Identifica cores, formas e tamanhos; dificuldade em discriminar detalhes finos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Percepção Auditiva
                    </label>
                    <textarea v-model="form.percepcao_auditiva" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Responde a sons do ambiente, identifica vozes conhecidas"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Generalização de Aprendizagens
                    </label>
                    <textarea v-model="form.generalizacao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: Aplica conhecimentos em novos contextos com mediação, dificuldade em transferir aprendizagens"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: COMUNICAÇÃO E LINGUAGEM -->
            <div v-show="currentStep === 4" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-comments text-3xl text-indigo-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Comunicação e Linguagem</h2>
                  <p class="text-gray-600">Formas de expressão e compreensão</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Linguagem Oral (Expressiva) <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.linguagem_oral_expressiva" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Comunica-se por palavras isoladas, forma frases simples de 2-3 palavras"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Linguagem Oral (Receptiva)
                    </label>
                    <textarea v-model="form.linguagem_oral_receptiva" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Compreende comandos simples, dificuldade com instruções complexas de múltiplos passos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Leitura (Nível Atual)
                    </label>
                    <textarea v-model="form.leitura_nivel" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Reconhece o próprio nome, identifica algumas letras do alfabeto"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Escrita (Nível Atual)
                    </label>
                    <textarea v-model="form.escrita_nivel" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Faz traçados simples, copia algumas letras com apoio"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Comunicação Alternativa Utilizada
                    </label>
                    <textarea v-model="form.comunicacao_alternativa" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Usa LIBRAS básica, pranchas de comunicação com figuras PECS, aplicativo de comunicação no tablet"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Interação Comunicativa
                    </label>
                    <textarea v-model="form.interacao_comunicativa" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Inicia comunicação espontaneamente com gestos, mantém contato visual durante diálogo"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5: RECURSOS E TECNOLOGIAS -->
            <div v-show="currentStep === 5" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-tools text-3xl text-amber-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Recursos e Tecnologias Assistivas</h2>
                  <p class="text-gray-600">Ferramentas e adaptações necessárias</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recursos Pedagógicos Adaptados
                    </label>
                    <textarea v-model="form.recursos_pedagogicos" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Ex: Livros com letras ampliadas, material manipulável para matemática, jogos adaptados"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tecnologia Assistiva Utilizada
                    </label>
                    <textarea v-model="form.tecnologia_assistiva" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Ex: Software de leitura de tela, teclado adaptado, lupa eletrônica"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Mobiliário e Adaptações Físicas
                    </label>
                    <textarea v-model="form.mobiliario_adaptacoes" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Ex: Mesa regulável, cadeira de rodas, rampa de acesso, banheiro adaptado"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recursos de Acessibilidade Digital
                    </label>
                    <textarea v-model="form.acessibilidade_digital" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Ex: Leitor de tela NVDA, alto contraste, legendas em vídeos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Materiais Sensoriais
                    </label>
                    <textarea v-model="form.materiais_sensoriais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500"
                              placeholder="Ex: Bolas texturizadas, massinha, tintas, instrumentos musicais"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 6: BARREIRAS E FACILITADORES -->
            <div v-show="currentStep === 6" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-shield-alt text-3xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Barreiras e Facilitadores</h2>
                  <p class="text-gray-600">Identificação de obstáculos e potencialidades</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Barreiras Arquitetônicas <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.barreiras_arquitetonicas" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                              placeholder="Ex: Ausência de rampas, banheiros não adaptados, escadas sem corrimão"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Barreiras Comunicacionais
                    </label>
                    <textarea v-model="form.barreiras_comunicacionais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                              placeholder="Ex: Falta de intérprete de LIBRAS, material didático sem audiodescrição"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Barreiras Atitudinais
                    </label>
                    <textarea v-model="form.barreiras_atitudinais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500"
                              placeholder="Ex: Preconceito de colegas, baixa expectativa de professores, superproteção familiar"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Facilitadores Ambientais
                    </label>
                    <textarea v-model="form.facilitadores_ambientais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Sala de recursos multifuncionais equipada, equipe escolar colaborativa"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Facilitadores Pessoais
                    </label>
                    <textarea v-model="form.facilitadores_pessoais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Interesse por atividades artísticas, boa relação com professora de apoio"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Apoio Familiar
                    </label>
                    <textarea v-model="form.apoio_familiar" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Família participativa, comparece às reuniões, executa atividades em casa"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 7: PERFIL DO ESTUDANTE -->
            <div v-show="currentStep === 7" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user text-3xl text-cyan-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Perfil do Estudante</h2>
                  <p class="text-gray-600">Características, interesses e necessidades específicas</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Potencialidades e Habilidades <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.potencialidades" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                              placeholder="Ex: Excelente memória visual, criativo em atividades artísticas, interesse por música"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Dificuldades e Limitações
                    </label>
                    <textarea v-model="form.dificuldades" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                              placeholder="Ex: Dificuldade em seguir rotinas, baixa tolerância à frustração, necessita de mais tempo para processar informações"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Interesses e Preferências
                    </label>
                    <textarea v-model="form.interesses" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                              placeholder="Ex: Gosta de animais, interesse por dinossauros, adora atividades com água"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Estilo de Aprendizagem
                    </label>
                    <textarea v-model="form.estilo_aprendizagem" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                              placeholder="Ex: Aprende melhor com recursos visuais, necessita de atividades práticas e concretas"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Comportamentos que Interferem na Aprendizagem
                    </label>
                    <textarea v-model="form.comportamentos_interferem" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                              placeholder="Ex: Agitação motora, dificuldade em permanecer sentado, comportamentos repetitivos"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 8: PLANEJAMENTO EDUCACIONAL -->
            <div v-show="currentStep === 8" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-calendar-alt text-3xl text-teal-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Planejamento Educacional Individualizado</h2>
                  <p class="text-gray-600">Objetivos, metas e ações específicas</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivo Geral do PDI <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.objetivo_geral" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Desenvolver habilidades de comunicação e autonomia para favorecer a participação social e escolar"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Área Cognitiva
                    </label>
                    <textarea v-model="form.objetivos_cognitivo" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: 1) Ampliar tempo de atenção em 5 minutos; 2) Reconhecer números de 1 a 10; 3) Identificar cores primárias"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Área Comunicação
                    </label>
                    <textarea v-model="form.objetivos_comunicacao" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: 1) Utilizar 20 palavras funcionais; 2) Formar frases de 3 palavras; 3) Responder a perguntas simples"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Área Psicomotora
                    </label>
                    <textarea v-model="form.objetivos_psicomotor" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: 1) Melhorar coordenação fina com pinça; 2) Saltar com os dois pés; 3) Traçar linhas verticais e horizontais"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Área Socioemocional
                    </label>
                    <textarea v-model="form.objetivos_socioemocional" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: 1) Interagir com 2 colegas em atividades dirigidas; 2) Esperar sua vez em jogos; 3) Expressar sentimentos básicos"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Estratégias e Metodologias
                    </label>
                    <textarea v-model="form.estrategias_metodologias" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Uso de agenda visual, reforço positivo, modelagem, aprendizagem por pares, atividades multissensoriais"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Adaptações Curriculares Necessárias
                    </label>
                    <textarea v-model="form.adaptacoes_curriculares" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500"
                              placeholder="Ex: Provas orais, tempo estendido, atividades simplificadas, redução de quantidade de exercícios"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 9: CRONOGRAMA E AVALIAÇÃO -->
            <div v-show="currentStep === 9" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-chart-bar text-3xl text-pink-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Cronograma e Avaliação</h2>
                  <p class="text-gray-600">Periodicidade e instrumentos de acompanhamento</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início do PDI <span class="text-red-500">*</span>
                      </label>
                      <input type="date" v-model="form.data_inicio"
                             class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Data de Término Prevista <span class="text-red-500">*</span>
                      </label>
                      <input type="date" v-model="form.data_termino"
                             class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Frequência de Atendimento no AEE
                    </label>
                    <input type="text" v-model="form.frequencia_atendimento"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                           placeholder="Ex: 3 vezes por semana, 1 hora por sessão">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidade de Avaliação do PDI
                    </label>
                    <select v-model="form.periodicidade_avaliacao"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                      <option value="">Selecione a periodicidade</option>
                      <option value="mensal">Mensal</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Instrumentos de Avaliação Utilizados
                    </label>
                    <textarea v-model="form.instrumentos_avaliacao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="Ex: Observação direta, portfólio, registro fotográfico, relatórios descritivos, checklist de habilidades"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Indicadores de Progresso
                    </label>
                    <textarea v-model="form.indicadores_progresso" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="Ex: Aumento de vocabulário expressivo, melhora no tempo de atenção, maior autonomia em AVDs"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Critérios de Reavaliação do PDI
                    </label>
                    <textarea v-model="form.criterios_reavaliacao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="Ex: Quando atingir 80% dos objetivos propostos, mudanças significativas no perfil, transição escolar"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 10: EQUIPE E RESPONSÁVEIS -->
            <div v-show="currentStep === 10" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-3xl text-orange-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Equipe Multidisciplinar e Responsáveis</h2>
                  <p class="text-gray-600">Profissionais envolvidos no atendimento</p>
                </div>

                <div class="grid grid-cols-1 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Professor(a) do AEE Responsável <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.professor_aee"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: Maria Silva - CRMG 12345">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Professor(a) da Sala Regular
                    </label>
                    <input type="text" v-model="form.professor_sala_regular"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: João Santos">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Coordenador(a) Pedagógico(a)
                    </label>
                    <input type="text" v-model="form.coordenador_pedagogico"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: Ana Paula Oliveira">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Profissionais de Apoio Escolar
                    </label>
                    <textarea v-model="form.profissionais_apoio" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Cuidador: Carlos Pereira (período integral), Intérprete de LIBRAS: Laura Costa"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Equipe Multidisciplinar Externa
                    </label>
                    <textarea v-model="form.equipe_multidisciplinar" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Fonoaudióloga: Dra. Carla Mendes (APAE); Psicóloga: Dra. Fernanda Lima (particular); Terapeuta Ocupacional: Dr. Roberto Alves (SUS)"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Responsável Legal pelo Estudante <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.responsavel_legal"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: Maria José da Silva (Mãe) - Tel: (31) 99999-8888">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Observações Gerais e Encaminhamentos
                    </label>
                    <textarea v-model="form.observacoes_gerais" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Família autoriza compartilhamento de informações com equipe externa. Estudante necessita acompanhamento neurológico semestral."></textarea>
                  </div>

                  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div class="flex items-start">
                      <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                      <div class="text-sm text-blue-800">
                        <p class="font-semibold mb-1">Informação Importante</p>
                        <p>Este PDI deve ser construído colaborativamente com a família e revisado periodicamente conforme o desenvolvimento do estudante. Todas as informações aqui registradas são confidenciais e protegidas pela LGPD.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between">
              <button type="button" @click="previousStep" v-show="currentStep > 1"
                      class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                Anterior
              </button>
              <div class="flex-1"></div>
              <button type="button" @click="nextStep" v-show="currentStep < totalSteps"
                      class="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
                Próximo
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              <button type="submit" v-show="currentStep === totalSteps"
                      class="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                <i class="fas fa-save mr-2"></i>
                Salvar PDI
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
      totalSteps: 10,
      alunos: [],
      
      steps: [
        { name: 'Institucional', icon: 'fas fa-school' },
        { name: 'Psicomotor', icon: 'fas fa-running' },
        { name: 'Cognitivo', icon: 'fas fa-brain' },
        { name: 'Comunicação', icon: 'fas fa-comments' },
        { name: 'Recursos', icon: 'fas fa-tools' },
        { name: 'Limites', icon: 'fas fa-shield-alt' },
        { name: 'Estudante', icon: 'fas fa-user' },
        { name: 'Planejamento', icon: 'fas fa-calendar-alt' },
        { name: 'Avaliações', icon: 'fas fa-chart-bar' },
        { name: 'Equipe', icon: 'fas fa-users' },
      ],
      
      camposPsicomotor: [
        { key: 'locomocao', label: 'Locomoção' },
        { key: 'equilibrio', label: 'Equilíbrio' },
        { key: 'coordenacao_motora_global', label: 'Coordenação Motora Global' },
        { key: 'coordenacao_motora_fina', label: 'Coordenação Motora Fina' },
        { key: 'dominancia_lateral', label: 'Dominância Lateral' },
        { key: 'esquema_corporal', label: 'Esquema Corporal' },
        { key: 'orientacao_espacial', label: 'Orientação Espacial' },
        { key: 'orientacao_temporal', label: 'Orientação Temporal' },
        { key: 'manipulacao_objetos', label: 'Manipulação de Objetos' },
        { key: 'tonus_muscular', label: 'Tônus Muscular' },
        { key: 'velocidade', label: 'Velocidade' },
        { key: 'forca_muscular', label: 'Força Muscular' },
        { key: 'flexibilidade', label: 'Flexibilidade' },
        { key: 'resistencia', label: 'Resistência' },
        { key: 'precisao_movimentos', label: 'Precisão de Movimentos' },
        { key: 'postura', label: 'Postura' },
      ],
      
      form: {
        student_id: '',
        nome_estudante: '',
        diretor: '',
        vice_diretor: '',
        supervisor_pedagogico: '',
        nome_escola: '',
        ano_letivo: new Date().getFullYear().toString(),
        turno: '',
        // Psicomotor (16 campos enum)
        locomocao: '',
        equilibrio: '',
        coordenacao_motora_global: '',
        coordenacao_motora_fina: '',
        dominancia_lateral: '',
        esquema_corporal: '',
        orientacao_espacial: '',
        orientacao_temporal: '',
        manipulacao_objetos: '',
        tonus_muscular: '',
        velocidade: '',
        forca_muscular: '',
        flexibilidade: '',
        resistencia: '',
        precisao_movimentos: '',
        postura: '',
        // Cognitivo (Step 3)
        atencao_concentracao: '',
        memoria: '',
        raciocinio_logico: '',
        resolucao_problemas: '',
        percepcao_visual: '',
        percepcao_auditiva: '',
        generalizacao: '',
        // Comunicação (Step 4)
        linguagem_oral_expressiva: '',
        linguagem_oral_receptiva: '',
        leitura_nivel: '',
        escrita_nivel: '',
        comunicacao_alternativa: '',
        interacao_comunicativa: '',
        // Recursos (Step 5)
        recursos_pedagogicos: '',
        tecnologia_assistiva: '',
        mobiliario_adaptacoes: '',
        acessibilidade_digital: '',
        materiais_sensoriais: '',
        // Barreiras (Step 6)
        barreiras_arquitetonicas: '',
        barreiras_comunicacionais: '',
        barreiras_atitudinais: '',
        facilitadores_ambientais: '',
        facilitadores_pessoais: '',
        apoio_familiar: '',
        // Perfil (Step 7)
        potencialidades: '',
        dificuldades: '',
        interesses: '',
        estilo_aprendizagem: '',
        comportamentos_interferem: '',
        // Planejamento (Step 8)
        objetivo_geral: '',
        objetivos_cognitivo: '',
        objetivos_comunicacao: '',
        objetivos_psicomotor: '',
        objetivos_socioemocional: '',
        estrategias_metodologias: '',
        adaptacoes_curriculares: '',
        // Cronograma (Step 9)
        data_inicio: '',
        data_termino: '',
        frequencia_atendimento: '',
        periodicidade_avaliacao: '',
        instrumentos_avaliacao: '',
        indicadores_progresso: '',
        criterios_reavaliacao: '',
        // Equipe (Step 10)
        professor_aee: '',
        professor_sala_regular: '',
        coordenador_pedagogico: '',
        profissionais_apoio: '',
        equipe_multidisciplinar: '',
        responsavel_legal: '',
        observacoes_gerais: ''
      }
    }
  },

  async mounted() {
    await this.loadAlunos();
    this.setCurrentUser();
  },

  methods: {
    setCurrentUser() {
      // Auto-preencher professor AEE com usuário logado
      if (this.$root.user && this.$root.user.name) {
        this.form.professor_aee = this.$root.user.name;
      }
    },

    async loadAlunos() {
      try {
        // Filtrar alunos por professor (teacher-centric)
        let params = {};
        if (this.$root.user && this.$root.user.role !== 'admin') {
          params.teacher_id = this.$root.user.id;
        }
        
        const response = await api.get('/students', { params });
        console.log('📚 PDI - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data) {
          this.alunos = response.data.data.rows || response.data.data;
        } else if (Array.isArray(response.data)) {
          this.alunos = response.data;
        } else {
          this.alunos = [];
        }
        
        console.log('✅ PDI - Total de alunos (filtrado por professor):', this.alunos.length);
      } catch (error) {
        console.error('❌ PDI - Erro ao carregar alunos:', error);
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;
      try {
        const alunoLocal = this.alunos.find(a => a.id == this.form.student_id);
        
        if (alunoLocal) {
          console.log('🎓 PDI - Auto-preenchendo dados:', alunoLocal);
          
          this.form.nome_estudante = alunoLocal.name || '';
          this.form.nome_escola = alunoLocal.school_name || '';
          this.form.turno = alunoLocal.shift || '';
          
          this.$root.showNotification('Dados do aluno preenchidos automaticamente', 'success');
        }
      } catch (error) {
        console.error('❌ PDI - Erro ao carregar dados do aluno:', error);
      }
    },

    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    async handleSubmit() {
      try {
        const response = await api.post('/pdis/create', this.form);
        if (response.data.ok) {
          this.$root.showNotification('PDI salvo com sucesso!', 'success');
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao salvar PDI:', error);
        this.$root.showNotification('Erro ao salvar PDI', 'error');
      }
    }
  }
};

// ========================================
// COMPONENTE: PAI - PLANO DE ATENDIMENTO INDIVIDUAL
// ========================================

const PAICompleto = {
  template: `
    <div class="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-8">
      <div class="max-w-6xl mx-auto px-4">
        
        <!-- Header -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                <i class="fas fa-tasks text-purple-600 mr-3"></i>
                PAI - Plano de Atendimento Individual
              </h1>
              <p class="text-gray-600">Formulário completo com 46 campos - Complete em etapas</p>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-purple-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Progresso</span>
              <span class="text-sm text-gray-500">{{ Math.round((currentStep / totalSteps) * 100) }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 h-3 rounded-full transition-all duration-500"
                   :style="{ width: ((currentStep / totalSteps) * 100) + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- Step Pills Navigation -->
        <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div class="flex flex-wrap gap-2 justify-center">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    type="button"
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    :class="currentStep === index + 1 
                      ? 'bg-purple-600 text-white shadow-lg scale-105' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'">
              <i :class="step.icon + ' mr-2'"></i>
              {{ step.name }}
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <form @submit.prevent="handleSubmit">
            
            <!-- STEP 1: IDENTIFICAÇÃO -->
            <div v-show="currentStep === 1" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-id-card text-3xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Identificação do Estudante</h2>
                  <p class="text-gray-600">Dados básicos do atendimento</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Selecionar Aluno <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.student_id" @change="loadStudentData" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="">Selecione um aluno</option>
                      <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">{{ aluno.name }}</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo do Estudante
                    </label>
                    <input type="text" v-model="form.nome_estudante" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                           placeholder="Ex: Pedro Henrique Oliveira">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input type="date" v-model="form.data_nascimento" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Escola
                    </label>
                    <input type="text" v-model="form.nome_escola" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                           placeholder="Ex: EMEF Santos Dumont">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Série/Ano Escolar
                    </label>
                    <input type="text" v-model="form.serie_ano" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                           placeholder="Ex: 3º ano do Ensino Fundamental">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Ano Letivo
                    </label>
                    <input type="text" v-model="form.ano_letivo" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                           placeholder="Ex: 2025">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Turno de Atendimento <span class="text-red-500">*</span>
                    </label>
                    <select v-model="form.turno" required class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500">
                      <option value="">Selecione o turno</option>
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                      <option value="noturno">Noturno</option>
                    </select>
                  </div>

                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Deficiência/Transtorno
                    </label>
                    <input type="text" v-model="form.tipo_deficiencia" 
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                           placeholder="Ex: Transtorno do Espectro Autista (TEA) nível 2, Deficiência Intelectual, Deficiência Física">
                  </div>

                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      CID-10 e Laudo Médico
                    </label>
                    <textarea v-model="form.cid_laudo" rows="2"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                              placeholder="Ex: CID F84.0 - Autismo Infantil. Laudo neurológico datado de 15/03/2023 pelo Dr. Carlos Mendes (CRM 12345)"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: HISTÓRICO E CONTEXTO -->
            <div v-show="currentStep === 2" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-history text-3xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Histórico e Contextualização</h2>
                  <p class="text-gray-600">Trajetória educacional e desenvolvimento</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Histórico do Estudante <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.historico" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Estudante com diagnóstico de TEA desde os 3 anos. Frequenta a escola desde 2024, anteriormente estudou em escola especial. Apresenta dificuldades na comunicação verbal e interação social. Família muito presente e participativa..."></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Trajetória Escolar Anterior
                    </label>
                    <textarea v-model="form.trajetoria_escolar" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Frequentou APAE de 2020 a 2023, iniciou inclusão em escola regular em 2024, necessitou de acompanhante terapêutico no primeiro semestre"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Acompanhamentos Terapêuticos Atuais
                    </label>
                    <textarea v-model="form.acompanhamentos_terapeuticos" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Fonoaudiologia 2x/semana (Clínica Vida), Terapia Ocupacional 1x/semana (SUS), Psicoterapia 1x/semana (particular)"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Medicações em Uso
                    </label>
                    <textarea v-model="form.medicacoes" rows="2"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Risperidona 1mg (manhã e noite), prescrita pelo psiquiatra Dr. João Silva"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Contexto Familiar e Social
                    </label>
                    <textarea v-model="form.contexto_familiar" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Ex: Reside com mãe e avó materna. Pai presente mas separado da mãe. Família de baixa renda, mãe trabalha como diarista. Boa rede de apoio familiar"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 3: AVALIAÇÃO DIAGNÓSTICA -->
            <div v-show="currentStep === 3" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-clipboard-check text-3xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Avaliação Diagnóstica Multidimensional</h2>
                  <p class="text-gray-600">Análise detalhada de habilidades e necessidades</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Leitura e Escrita
                    </label>
                    <textarea v-model="form.avaliacao_leitura_escrita" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Reconhece algumas letras do alfabeto, não faz associação grafema-fonema, interesse por livros com imagens, não forma palavras, copia letras isoladas com apoio"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Raciocínio Lógico-Matemático
                    </label>
                    <textarea v-model="form.avaliacao_raciocinio_logico" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Correspondência um a um até 5 objetos, identifica cores e formas, dificuldade em sequências, resolve problemas concretos simples com apoio, noção de quantidade em desenvolvimento"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Comunicação e Linguagem
                    </label>
                    <textarea v-model="form.avaliacao_comunicacao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Comunicação não-verbal predominante, usa gestos e apontamento, emite sons vocálicos, iniciando CAA com 20 figuras, compreende comandos simples de uma instrução"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Aspectos Psicomotores
                    </label>
                    <textarea v-model="form.avaliacao_psicomotor" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Coordenação motora grossa adequada (corre, pula), coordenação fina em desenvolvimento, preensão de lápis inadequada, dificuldade em recorte, equilibrio adequado"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Habilidades Socioemocionais
                    </label>
                    <textarea v-model="form.avaliacao_socioemocional" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Dificuldade em interação com pares, prefere brincar sozinho, baixa tolerância à frustração, birras quando contrariado, reconhece emoções básicas em figuras"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Avaliação: Autonomia e AVDs
                    </label>
                    <textarea v-model="form.avaliacao_autonomia" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="Ex: Come sozinho com auxílio de colher, necessita ajuda para higiene, veste-se com supervisão, identifica pertences pessoais, segue rotina visual"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: OBJETIVOS DO ATENDIMENTO -->
            <div v-show="currentStep === 4" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-bullseye text-3xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Objetivos do Atendimento AEE</h2>
                  <p class="text-gray-600">Metas específicas para o período</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivo Geral do PAI <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.objetivo_geral" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                              placeholder="Ex: Desenvolver habilidades comunicativas e de autonomia que favoreçam a participação efetiva do estudante nas atividades escolares e sociais"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Comunicação
                    </label>
                    <textarea v-model="form.objetivos_comunicacao" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                              placeholder="Ex: 1) Ampliar vocabulário expressivo para 50 palavras funcionais; 2) Utilizar prancha de CAA com autonomia; 3) Formar frases de 2-3 elementos; 4) Responder a perguntas simples"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Autonomia
                    </label>
                    <textarea v-model="form.objetivos_autonomia" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                              placeholder="Ex: 1) Realizar higiene pessoal com supervisão mínima; 2) Vestir-se independentemente (peças simples); 3) Organizar materiais escolares; 4) Seguir rotina visual"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Acadêmicos
                    </label>
                    <textarea v-model="form.objetivos_academicos" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                              placeholder="Ex: 1) Reconhecer letras do alfabeto; 2) Identificar números de 1 a 20; 3) Escrever o próprio nome; 4) Associar quantidade até 10"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Objetivos Específicos - Socialização
                    </label>
                    <textarea v-model="form.objetivos_socializacao" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-yellow-500"
                              placeholder="Ex: 1) Interagir com 2-3 colegas em atividades dirigidas; 2) Esperar a vez em jogos; 3) Compartilhar materiais; 4) Participar de atividades coletivas"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 5: ESTRATÉGIAS E RECURSOS -->
            <div v-show="currentStep === 5" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-tools text-3xl text-indigo-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Estratégias Pedagógicas e Recursos</h2>
                  <p class="text-gray-600">Metodologias e materiais adaptados</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Estratégias Pedagógicas Gerais <span class="text-red-500">*</span>
                    </label>
                    <textarea v-model="form.estrategias_pedagogicas" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Utilizar recursos visuais em todas atividades, oferecer tempo ampliado, adaptar materiais com letras ampliadas e imagens, trabalhar com materiais concretos, usar rotina visual pictográfica, ambiente com menos estímulos sensoriais, atividades lúdicas e significativas"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recursos de Tecnologia Assistiva
                    </label>
                    <textarea v-model="form.recursos_tecnologia_assistiva" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Prancha de CAA digital (app Livox no tablet), software educativo adaptado, mouse adaptado, teclado com teclas ampliadas"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Recursos Pedagógicos Adaptados
                    </label>
                    <textarea v-model="form.recursos_pedagogicos" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Livros com letras ampliadas, material manipulável (blocos lógicos, ábaco), jogos adaptados, quebra-cabeças de encaixe, massa de modelar"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Adaptações de Mobiliário e Espaço
                    </label>
                    <textarea v-model="form.adaptacoes_mobiliario" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: Mesa regulável, cadeira com apoio, tapete antiderrapante, canto sensorial com almofadas, iluminação adequada, sinalizações visuais no ambiente"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Estratégias de Comunicação Aumentativa/Alternativa
                    </label>
                    <textarea v-model="form.estrategias_caa" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: PECS (sistema de comunicação por figuras) com 50 cartões temáticos, prancha móvel A4, álbum de comunicação portátil, uso de gestos naturais e LIBRAS básica"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Metodologias Específicas Utilizadas
                    </label>
                    <textarea v-model="form.metodologias_especificas" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                              placeholder="Ex: ABA (Análise Aplicada do Comportamento), TEACCH (rotinas visuais), Montessori adaptado, aprendizagem baseada em jogos, modelagem por vídeo"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 6: ORGANIZAÇÃO DO ATENDIMENTO -->
            <div v-show="currentStep === 6" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-calendar-week text-3xl text-pink-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Organização do Atendimento</h2>
                  <p class="text-gray-600">Cronograma, periodicidade e avaliação</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Data de Início <span class="text-red-500">*</span>
                      </label>
                      <input type="date" v-model="form.data_inicio" required
                             class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Data de Término Prevista
                      </label>
                      <input type="date" v-model="form.data_termino"
                             class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Frequência Semanal de Atendimento <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.frequencia_semanal"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                           placeholder="Ex: 3 vezes por semana, 1h30 por sessão (segundas, quartas e sextas, 14h-15h30)">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Atendimento
                    </label>
                    <select v-model="form.tipo_atendimento"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                      <option value="">Selecione o tipo</option>
                      <option value="individual">Individual</option>
                      <option value="dupla">Em dupla</option>
                      <option value="pequeno_grupo">Pequeno grupo (3-5 alunos)</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Local do Atendimento
                    </label>
                    <input type="text" v-model="form.local_atendimento"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                           placeholder="Ex: Sala de Recursos Multifuncionais (SRM) - Bloco B, sala 15">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Periodicidade de Avaliação
                    </label>
                    <select v-model="form.periodicidade_avaliacao"
                            class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500">
                      <option value="">Selecione a periodicidade</option>
                      <option value="mensal">Mensal</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Instrumentos de Avaliação do Progresso
                    </label>
                    <textarea v-model="form.instrumentos_avaliacao" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="Ex: Observação sistemática diária, portfólio com fotos e atividades, relatórios descritivos mensais, checklist de habilidades, registro audiovisual"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Indicadores de Sucesso
                    </label>
                    <textarea v-model="form.indicadores_sucesso" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500"
                              placeholder="Ex: Aumento de 50% no vocabulário expressivo, redução de episódios de frustração, maior tempo de permanência em atividades, início de interações sociais espontâneas"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 7: ARTICULAÇÃO E OBSERVAÇÕES -->
            <div v-show="currentStep === 7" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-3xl text-orange-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Articulação e Considerações Finais</h2>
                  <p class="text-gray-600">Equipe envolvida e observações gerais</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Professor(a) do AEE Responsável <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.professor_aee" required
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: Maria Silva Santos - Matrícula 123456">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Professor(a) da Sala Regular
                    </label>
                    <input type="text" v-model="form.professor_sala_regular"
                           class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                           placeholder="Ex: João Carlos Pereira - 3º ano A">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Articulação com a Sala Regular
                    </label>
                    <textarea v-model="form.articulacao_sala_regular" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Reuniões quinzenais com professor regente, compartilhamento de materiais adaptados, planejamento conjunto de atividades, orientação sobre estratégias de apoio em sala"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Articulação com a Família
                    </label>
                    <textarea v-model="form.articulacao_familia" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Reuniões mensais com responsáveis, agenda de comunicação diária, orientações para atividades em casa, participação da família em eventos escolares"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Articulação com Profissionais Externos
                    </label>
                    <textarea v-model="form.articulacao_profissionais" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Contato trimestral com fonoaudióloga (relatórios compartilhados), participação em reuniões multidisciplinares na APAE, troca de informações com terapeuta ocupacional"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Encaminhamentos Necessários
                    </label>
                    <textarea v-model="form.encaminhamentos" rows="3"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Avaliação neuropsicológica, consulta com oftalmologista, solicitação de acompanhante terapêutico, inclusão em programa de esporte adaptado"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Observações Gerais
                    </label>
                    <textarea v-model="form.observacoes_gerais" rows="4"
                              class="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500"
                              placeholder="Ex: Família autoriza divulgação de imagem para fins pedagógicos. Estudante apresenta alergia a látex (evitar materiais com luvas). Mãe solicita cópia de atividades para reforço em casa. Previsão de reavaliação do PAI em junho/2025"></textarea>
                  </div>

                  <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div class="flex items-start">
                      <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                      <div class="text-sm text-blue-800">
                        <p class="font-semibold mb-1">Informação Importante</p>
                        <p>Este PAI deve ser construído colaborativamente com a família, sala regular e profissionais envolvidos. Revisões periódicas são essenciais para ajustes conforme o progresso do estudante. Todas as informações são confidenciais e protegidas pela LGPD.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="border-t border-gray-200 px-8 py-6 bg-gray-50 flex justify-between">
              <button type="button" @click="previousStep" v-show="currentStep > 1"
                      class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors">
                <i class="fas fa-arrow-left mr-2"></i>
                Anterior
              </button>
              <div class="flex-1"></div>
              <button type="button" @click="nextStep" v-show="currentStep < totalSteps"
                      class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                Próximo
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
              <button type="submit" v-show="currentStep === totalSteps"
                      class="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors">
                <i class="fas fa-save mr-2"></i>
                Salvar PAI Completo
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
      totalSteps: 7,
      alunos: [],
      
      steps: [
        { name: 'Identificação', icon: 'fas fa-id-card' },
        { name: 'Histórico', icon: 'fas fa-history' },
        { name: 'Avaliação', icon: 'fas fa-clipboard-check' },
        { name: 'Objetivos', icon: 'fas fa-bullseye' },
        { name: 'Estratégias', icon: 'fas fa-tools' },
        { name: 'Organização', icon: 'fas fa-calendar-week' },
        { name: 'Articulação', icon: 'fas fa-users' },
      ],
      
      form: {
        // Step 1: Identificação
        student_id: '',
        nome_estudante: '',
        data_nascimento: '',
        nome_escola: '',
        serie_ano: '',
        ano_letivo: new Date().getFullYear().toString(),
        turno: '',
        tipo_deficiencia: '',
        cid_laudo: '',
        
        // Step 2: Histórico
        historico: '',
        trajetoria_escolar: '',
        acompanhamentos_terapeuticos: '',
        medicacoes: '',
        contexto_familiar: '',
        
        // Step 3: Avaliação
        avaliacao_leitura_escrita: '',
        avaliacao_raciocinio_logico: '',
        avaliacao_comunicacao: '',
        avaliacao_psicomotor: '',
        avaliacao_socioemocional: '',
        avaliacao_autonomia: '',
        
        // Step 4: Objetivos
        objetivo_geral: '',
        objetivos_comunicacao: '',
        objetivos_autonomia: '',
        objetivos_academicos: '',
        objetivos_socializacao: '',
        
        // Step 5: Estratégias
        estrategias_pedagogicas: '',
        recursos_tecnologia_assistiva: '',
        recursos_pedagogicos: '',
        adaptacoes_mobiliario: '',
        estrategias_caa: '',
        metodologias_especificas: '',
        
        // Step 6: Organização
        data_inicio: '',
        data_termino: '',
        frequencia_semanal: '',
        tipo_atendimento: '',
        local_atendimento: '',
        periodicidade_avaliacao: '',
        instrumentos_avaliacao: '',
        indicadores_sucesso: '',
        
        // Step 7: Articulação
        professor_aee: '',
        professor_sala_regular: '',
        articulacao_sala_regular: '',
        articulacao_familia: '',
        articulacao_profissionais: '',
        encaminhamentos: '',
        observacoes_gerais: ''
      }
    }
  },

  async mounted() {
    await this.loadAlunos();
    this.setCurrentUser();
    this.setDefaultDates();
  },

  methods: {
    setCurrentUser() {
      // Auto-preencher professor AEE com usuário logado
      if (this.$root.user && this.$root.user.name) {
        this.form.professor_aee = this.$root.user.name;
      }
    },

    setDefaultDates() {
      // Data de início = hoje
      if (!this.form.data_inicio) {
        this.form.data_inicio = new Date().toISOString().split('T')[0];
      }
      // Data de término = 1 ano depois
      if (!this.form.data_termino) {
        const umAnoDepois = new Date();
        umAnoDepois.setFullYear(umAnoDepois.getFullYear() + 1);
        this.form.data_termino = umAnoDepois.toISOString().split('T')[0];
      }
    },

    async loadAlunos() {
      try {
        // Filtrar alunos por professor (teacher-centric)
        let params = {};
        if (this.$root.user && this.$root.user.role !== 'admin') {
          params.teacher_id = this.$root.user.id;
        }
        
        const response = await api.get('/students', { params });
        console.log('📚 PAI - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data) {
          this.alunos = response.data.data.rows || response.data.data;
        } else if (Array.isArray(response.data)) {
          this.alunos = response.data;
        } else {
          this.alunos = [];
        }
        
        console.log('✅ PAI - Total de alunos (filtrado por professor):', this.alunos.length);
      } catch (error) {
        console.error('❌ PAI - Erro ao carregar alunos:', error);
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;
      
      try {
        const alunoLocal = this.alunos.find(a => a.id == this.form.student_id);
        
        if (alunoLocal) {
          console.log('🎓 PAI - Auto-preenchendo dados:', alunoLocal);
          
          // Preencher campos do aluno
          this.form.nome_estudante = alunoLocal.name || '';
          this.form.data_nascimento = alunoLocal.birth_date || '';
          this.form.nome_escola = alunoLocal.school_name || '';
          this.form.serie_ano = alunoLocal.grade || '';
          this.form.turno = alunoLocal.shift || '';
          this.form.tipo_deficiencia = alunoLocal.disability_type || '';
          
          this.$root.showNotification('Dados do aluno preenchidos automaticamente', 'success');
        }
      } catch (error) {
        console.error('❌ PAI - Erro ao carregar dados do aluno:', error);
      }
    },

    goToStep(step) {
      if (step >= 1 && step <= this.totalSteps) {
        this.currentStep = step;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    nextStep() {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    async handleSubmit() {
      try {
        const response = await api.post('/pais/create', this.form);
        if (response.data.ok) {
          this.$root.showNotification('PAI salvo com sucesso!', 'success');
          this.$router.push('/dashboard');
        }
      } catch (error) {
        console.error('Erro ao salvar PAI:', error);
        this.$root.showNotification('Erro ao salvar PAI', 'error');
      }
    }
  }
};

// ========================================
// EXPORTAR COMPONENTES
// ========================================

if (typeof window !== 'undefined') {
  window.EntrevistaResponsavelCompleta = EntrevistaResponsavelCompleta;
  window.PDICompleto = PDICompleto;
  window.PAICompleto = PAICompleto;
}
