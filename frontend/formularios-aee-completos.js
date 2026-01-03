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
              
              <!-- AUTO-SAVE INDICATOR -->
              <div class="mt-3 flex items-center text-sm font-medium" :class="{
                'text-blue-600': autoSaving,
                'text-green-600': autoSaved && !autoSaving,
                'text-gray-500': !autoSaving && !autoSaved
              }">
                <i v-if="autoSaving" class="fas fa-circle-notch fa-spin mr-2"></i>
                <i v-else-if="autoSaved" class="fas fa-check-circle mr-2"></i>
                <i v-else class="fas fa-cloud mr-2"></i>
                <span v-if="autoSaving">Salvando automaticamente...</span>
                <span v-else-if="autoSaved">Alterações salvas automaticamente</span>
                <span v-else>Preencha os campos para salvar automaticamente</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-indigo-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Campos preenchidos</span>
              <span class="text-sm font-semibold" :class="[
                progressPercentage >= 80 ? 'text-green-600' : 
                progressPercentage >= 50 ? 'text-blue-600' : 
                'text-gray-500'
              ]">{{ progressPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="h-3 rounded-full transition-all duration-500"
                   :class="[
                     progressPercentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                     progressPercentage >= 50 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                     'bg-gradient-to-r from-gray-400 to-gray-500'
                   ]"
                   :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- TabBar Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div class="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    class="flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 relative whitespace-nowrap"
                    :class="getTabColorClasses(index + 1)">
              <div class="flex items-center justify-center space-x-2">
                <i :class="[step.icon, index + 1 < currentStep ? 'fa-check-circle' : '']"></i>
                <span>{{ step.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <form @submit.prevent="handleSubmit">
            <!-- STEP 1: IDENTIFICA��O -->
            <div v-show="currentStep === 1" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-graduate text-3xl text-indigo-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Identifica��o do Estudante</h2>
                  <p class="text-gray-600">Dados do estudante e da escola conforme o modelo oficial</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Data da Entrevista
                    </label>
                    <input type="date" v-model="form.data_entrevista"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Estudante <span class="text-red-500">*</span>
                    </label>
                    <input type="text" v-model="form.nome_estudante" required
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Data de Nascimento
                    </label>
                    <input type="date" v-model="form.data_nascimento"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Naturalidade
                    </label>
                    <input type="text" v-model="form.naturalidade"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Escola
                    </label>
                    <input type="text" v-model="form.nome_escola"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      S�rie/Ano
                    </label>
                    <input type="text" v-model="form.serie_ano"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Turno
                    </label>
                    <select v-model="form.turno"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecione</option>
                      <option value="Manh�">Manh�</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noite">Noite</option>
                      <option value="Integral">Integral</option>
                    </select>
                  </div>
                </div>

                <hr class="my-6">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Pai
                    </label>
                    <input type="text" v-model="form.nome_pai"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade do Pai
                    </label>
                    <input type="number" v-model.number="form.idade_pai" min="18" max="100"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Escolaridade do Pai
                    </label>
                    <select v-model="form.escolaridade_pai"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecione</option>
                      <option>Ensino Fundamental Incompleto</option>
                      <option>Ensino Fundamental Completo</option>
                      <option>Ensino M�dio Incompleto</option>
                      <option>Ensino M�dio Completo</option>
                      <option>Ensino Superior Incompleto</option>
                      <option>Ensino Superior Completo</option>
                      <option>P�s-Gradua��o</option>
                    </select>
                  </div>
                </div>

                <hr class="my-6">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Nome da M�e
                    </label>
                    <input type="text" v-model="form.nome_mae"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade da M�e
                    </label>
                    <input type="number" v-model.number="form.idade_mae" min="18" max="100"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Escolaridade da M�e
                    </label>
                    <select v-model="form.escolaridade_mae"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                      <option value="">Selecione</option>
                      <option>Ensino Fundamental Incompleto</option>
                      <option>Ensino Fundamental Completo</option>
                      <option>Ensino M�dio Incompleto</option>
                      <option>Ensino M�dio Completo</option>
                      <option>Ensino Superior Incompleto</option>
                      <option>Ensino Superior Completo</option>
                      <option>P�s-Gradua��o</option>
                    </select>
                  </div>
                </div>

                <hr class="my-6">

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Endere�o
                    </label>
                    <input type="text" v-model="form.endereco"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Bairro
                    </label>
                    <input type="text" v-model="form.bairro"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input type="text" v-model="form.cidade"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input type="tel" v-model="form.telefone"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                  </div>
                </div>

                <hr class="my-6">

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Motivo da Entrevista
                  </label>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.motivo_primeira_entrevista" :true-value="1" :false-value="0" class="mr-2">
                      Primeira entrevista
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.motivo_atualizacao" :true-value="1" :false-value="0" class="mr-2">
                      Atualiza��o da entrevista
                    </label>
                    <label class="flex items-center">
                      <input type="checkbox" v-model="form.motivo_outros" :true-value="1" :false-value="0" class="mr-2">
                      Outros
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 2: INFORMA��ES DA FAM�LIA -->
            <div v-show="currentStep === 2" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-users text-3xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Informa��es da Fam�lia</h2>
                  <p class="text-gray-600">Composi��o familiar e rotina do estudante</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como era composta a fam�lia na �poca da concep��o da crian�a?
                    </label>
                    <textarea v-model="form.composicao_familiar" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tem irm�os?
                      </label>
                      <select v-model="form.tem_irmaos"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Quantos?
                      </label>
                      <input type="text" v-model="form.quantos_irmaos"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>

                    <div class="md:col-span-2">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Quais as idades?
                      </label>
                      <input type="text" v-model="form.idades_irmaos"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Os pais continuam casados? Se separados, s�o presentes?
                    </label>
                    <input type="text" v-model="form.situacao_pais"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Vida social da fam�lia (amigos, festas, passeios, moradia, n�vel econ�mico) - Fa�a um relato
                    </label>
                    <textarea v-model="form.vida_social_familia" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como � o h�bito familiar do estudante? (Relatar como � o dia a dia)
                    </label>
                    <textarea v-model="form.habito_familiar" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Benef�cios sociais? (Bolsa Fam�lia, BPC, Passe Livre, outros)
                    </label>
                    <textarea v-model="form.beneficios_sociais" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                  </div>
                </div>
              </div>
            </div>            <!-- STEP 3: GESTA��O E NASCIMENTO -->
            <div v-show="currentStep === 3" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-baby text-3xl text-pink-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Gesta��o e Nascimento</h2>
                  <p class="text-gray-600">Informa��es sobre a gesta��o e o parto</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      A gravidez foi planejada pelos pais? (Relate)
                    </label>
                    <textarea v-model="form.gravidez_planejada" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      A gesta��o foi uma experi�ncia agrad�vel para a m�e?
                    </label>
                    <textarea v-model="form.gestacao_agradavel" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como foi a sa�de da m�e?
                    </label>
                    <textarea v-model="form.saude_mae" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      E o estado emocional?
                    </label>
                    <input type="text" v-model="form.estado_emocional_mae"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Fez pr�-natal?
                      </label>
                      <select v-model="form.fez_prenatal"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        M�s que come�ou
                      </label>
                      <input type="text" v-model="form.mes_inicio_prenatal"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Foi necess�rio algum tratamento?
                      </label>
                      <select v-model="form.tratamento_prenatal"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div v-if="form.tratamento_prenatal === 'Sim'">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Qual?
                    </label>
                    <input type="text" v-model="form.qual_tratamento_prenatal"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nascimento - Tipo de parto
                      </label>
                      <input type="text" v-model="form.tipo_parto"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nasceu no tempo normal?
                      </label>
                      <select v-model="form.nasceu_tempo_normal"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Observa��es
                    </label>
                    <textarea v-model="form.observacoes_nascimento" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"></textarea>
                  </div>

                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">O beb� ao nascer</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_necessitou_oxigenio" :true-value="1" :false-value="0" class="mr-2">
                        Necessitou oxig�nio
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_teve_convulsao" :true-value="1" :false-value="0" class="mr-2">
                        Teve convuls�o
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_ictericia" :true-value="1" :false-value="0" class="mr-2">
                        Icter�cia
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.bebe_incubadora" :true-value="1" :false-value="0" class="mr-2">
                        Incubadora
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 4: ALIMENTA��O -->
            <div v-show="currentStep === 4" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-utensils text-3xl text-orange-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Alimenta��o</h2>
                  <p class="text-gray-600">H�bitos alimentares do estudante</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Foi amamentado?
                      </label>
                      <select v-model="form.foi_amamentado"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        At� que idade?
                      </label>
                      <input type="text" v-model="form.amamentado_ate_idade"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Teve problemas com alimenta��o?
                    </label>
                    <textarea v-model="form.problemas_alimentacao" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Alimenta��o atual
                    </label>
                    <textarea v-model="form.alimentacao_atual" rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <!-- STEP 5: SA�DE -->
            <div v-show="currentStep === 5" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-heartbeat text-3xl text-red-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Sa�de</h2>
                  <p class="text-gray-600">Hist�rico de sa�de e acompanhamentos</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Defici�ncia informada
                    </label>
                    <input type="text" v-model="form.deficiencia_informada"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Faz uso de medicamento?
                      </label>
                      <select v-model="form.uso_medicamento"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Nome
                      </label>
                      <input type="text" v-model="form.nome_medicamento"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Quais hor�rios
                      </label>
                      <input type="text" v-model="form.horarios_medicamento"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      A vacina��o est� atualizada? (Relate)
                    </label>
                    <textarea v-model="form.vacinacao_atualizada" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Teve alguma doen�a infectocontagiosa na inf�ncia? Qual?
                    </label>
                    <textarea v-model="form.doenca_infancia" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                  </div>

                  <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Hist�rico de sa�de</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.convulsoes" :true-value="1" :false-value="0" class="mr-2">
                        Convuls�es
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.cirurgias" :true-value="1" :false-value="0" class="mr-2">
                        Cirurgias
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.acidentes" :true-value="1" :false-value="0" class="mr-2">
                        Acidentes
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.alergias" :true-value="1" :false-value="0" class="mr-2">
                        Alergias
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.febre_alta" :true-value="1" :false-value="0" class="mr-2">
                        Febre alta recorrente
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.problemas_audicao" :true-value="1" :false-value="0" class="mr-2">
                        Problemas com audi��o
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.problemas_visao" :true-value="1" :false-value="0" class="mr-2">
                        Problemas de vis�o
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Algum tratamento: m�dico respons�vel? Qual? Especialidade
                    </label>
                    <textarea v-model="form.tratamento_medico" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Atualmente faz algum tratamento ou acompanhamento com profissional espec�fico? Qual?
                    </label>
                    <textarea v-model="form.acompanhamento_atual" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Apresenta crises rotineiramente?
                      </label>
                      <select v-model="form.crises_rotineiramente"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tem convuls�es?
                      </label>
                      <select v-model="form.tem_convulsoes"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div v-if="form.tem_convulsoes === 'Sim'" class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Quando foi a primeira convuls�o?
                      </label>
                      <input type="text" v-model="form.primeira_convulsao_quando"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Qual o �ltimo epis�dio?
                      </label>
                      <input type="text" v-model="form.ultima_convulsao"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Acontece de quanto em quanto tempo?
                      </label>
                      <input type="text" v-model="form.frequencia_convulsoes"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Como a fam�lia lida com os epis�dios?
                      </label>
                      <textarea v-model="form.familia_lida_convulsoes" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Caso tenha crises, quais as mudan�as analisadas ap�s as convuls�es?
                      </label>
                      <textarea v-model="form.mudancas_apos_convulsoes" rows="2"
                                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 6: DESENVOLVIMENTO PREGRESSO -->
            <div v-show="currentStep === 6" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-chart-line text-3xl text-purple-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Desenvolvimento Pregresso</h2>
                  <p class="text-gray-600">Marcos do desenvolvimento na primeira inf�ncia</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que engatinhou
                    </label>
                    <input type="text" v-model="form.idade_engatinhou"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que andou
                    </label>
                    <input type="text" v-model="form.idade_andou"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que falou
                    </label>
                    <input type="text" v-model="form.idade_falou"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Controle dos esf�ncteres
                    </label>
                    <input type="text" v-model="form.controle_esfincteres"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                  </div>
                </div>
              </div>
            </div>
            <!-- STEP 7: DESENVOLVIMENTO ATUAL (COMUNICA��O) -->
            <div v-show="currentStep === 7" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-comments text-3xl text-teal-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Desenvolvimento Atual (Comunica��o)</h2>
                  <p class="text-gray-600">Comunica��o verbal e formas alternativas</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Apresenta comunica��o verbal?
                    </label>
                    <textarea v-model="form.comunicacao_verbal" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Alguma dificuldade na fala?
                    </label>
                    <textarea v-model="form.dificuldade_fala" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Caso n�o seja oralizado apresenta outro tipo de comunica��o?
                    </label>
                    <textarea v-model="form.outro_tipo_comunicacao" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"></textarea>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como voc� se comunica com seu filho(a)
                    </label>
                    <textarea v-model="form.como_se_comunica" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 8: ATIVIDADES DE VIDA DI�RIA -->
            <div v-show="currentStep === 8" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-hands-helping text-3xl text-yellow-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Atividades de Vida Di�ria</h2>
                  <p class="text-gray-600">Autonomia e rotina do estudante</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Alimenta de forma independente?
                      </label>
                      <select v-model="form.alimenta_independente"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Faz uso do banheiro de forma independente?
                      </label>
                      <select v-model="form.banheiro_independente"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Gerencia coisas do dia a dia (material escolar, rem�dio etc.)?
                      </label>
                      <select v-model="form.gerencia_dia_a_dia"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Sono</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.sono_dorme_bem" :true-value="1" :false-value="0" class="mr-2">
                        Dorme bem, calmo (noite inteira)
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.sono_agitado" :true-value="1" :false-value="0" class="mr-2">
                        Agitado, tem pesadelos
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.sono_contraturno" :true-value="1" :false-value="0" class="mr-2">
                        Dorme no contraturno
                      </label>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Gosta de brincar? Brinquedos e brincadeiras de prefer�ncia
                    </label>
                    <textarea v-model="form.gosta_brincar" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Apresenta curiosidade sexual? Se masturba? Com frequ�ncia? Recebe orienta��o sexual?
                    </label>
                    <textarea v-model="form.curiosidade_sexual" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"></textarea>
                  </div>

                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Como a crian�a � corrigida?</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.correcao_conversa" :true-value="1" :false-value="0" class="mr-2">
                        Conversa
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.correcao_grita" :true-value="1" :false-value="0" class="mr-2">
                        Grita
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.correcao_castigo" :true-value="1" :false-value="0" class="mr-2">
                        P�e de castigo
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.correcao_bate" :true-value="1" :false-value="0" class="mr-2">
                        Bate
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.correcao_outro" :true-value="1" :false-value="0" class="mr-2">
                        Outro
                      </label>
                    </div>
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Se outro, qual?
                      </label>
                      <input type="text" v-model="form.correcao_outro_qual"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como ela lida com a negativa/desejo imediatamente?
                    </label>
                    <textarea v-model="form.lida_negativa" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tem prefer�ncia por algum tipo de objeto/brinquedo/hist�ria (hiperfoco)?
                    </label>
                    <textarea v-model="form.preferencia_hiperfoco" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"></textarea>
                  </div>
                </div>
              </div>
            </div>
            <!-- STEP 9: SOCIALIZA��O E PREFER�NCIAS -->
            <div v-show="currentStep === 9" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-user-friends text-3xl text-green-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Socializa��o e Prefer�ncias</h2>
                  <p class="text-gray-600">Intera��es sociais e interesses</p>
                </div>

                <div class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Faz amigos com facilidade?
                      </label>
                      <select v-model="form.faz_amigos_facilidade"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Tem amigos na vizinhan�a?
                      </label>
                      <select v-model="form.tem_amigos_vizinhanca"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Interage com crian�as da mesma idade?
                      </label>
                      <select v-model="form.interage_mesma_idade"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Gosta de passeios e festas?
                      </label>
                      <select v-model="form.gosta_passeios_festas"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Prefer�ncias de divers�o
                    </label>
                    <textarea v-model="form.preferencias_diversao" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 10: COMPORTAMENTO -->
            <div v-show="currentStep === 10" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-smile text-3xl text-indigo-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Comportamento</h2>
                  <p class="text-gray-600">Caracter�sticas comportamentais</p>
                </div>

                <div class="space-y-6">
                  <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                    <h3 class="font-semibold text-gray-900 mb-4">Caracter�sticas comportamentais</h3>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_introvertido" :true-value="1" :false-value="0" class="mr-2">
                        Introvertido
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_afetuoso" :true-value="1" :false-value="0" class="mr-2">
                        Afetuoso
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_obediente" :true-value="1" :false-value="0" class="mr-2">
                        Obediente
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_resistente" :true-value="1" :false-value="0" class="mr-2">
                        Resistente
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_cooperador" :true-value="1" :false-value="0" class="mr-2">
                        Cooperador
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_medroso" :true-value="1" :false-value="0" class="mr-2">
                        Medroso
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_inseguro" :true-value="1" :false-value="0" class="mr-2">
                        Inseguro
                      </label>
                      <label class="flex items-center">
                        <input type="checkbox" v-model="form.comportamento_outro" :true-value="1" :false-value="0" class="mr-2">
                        Outro
                      </label>
                    </div>
                    <div class="mt-4">
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Se outro, qual?
                      </label>
                      <input type="text" v-model="form.comportamento_outro_qual"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Tem algum h�bito/mania?
                    </label>
                    <textarea v-model="form.habito_mania" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como comporta diante da frustra��o?
                    </label>
                    <textarea v-model="form.comporta_frustracao" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"></textarea>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 11: VIDA ESCOLAR -->
            <div v-show="currentStep === 11" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-school text-3xl text-blue-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Vida Escolar</h2>
                  <p class="text-gray-600">Percurso escolar e participa��o da fam�lia</p>
                </div>

                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Idade em que entrou na escola
                    </label>
                    <input type="text" v-model="form.idade_entrou_escola"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Como foi a adapta��o
                    </label>
                    <textarea v-model="form.adaptacao_escola" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Repet�ncia
                      </label>
                      <select v-model="form.repetencia"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Se ressente quando muda o professor(a)?
                      </label>
                      <select v-model="form.ressente_muda_professor"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Frequ�ncia escolar
                    </label>
                    <input type="text" v-model="form.frequencia_escolar"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      A fam�lia participa da vida escolar do filho(a)?
                    </label>
                    <textarea v-model="form.familia_participa_escola" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      De que forma?
                    </label>
                    <textarea v-model="form.forma_participacao_escola" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Quem ajuda no para casa?
                    </label>
                    <input type="text" v-model="form.quem_ajuda_para_casa"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      O que acha do atendimento da escola?
                    </label>
                    <textarea v-model="form.acha_atendimento_escola" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Acha que o desenvolvimento da crian�a � compat�vel com a idade?
                    </label>
                    <textarea v-model="form.desenvolvimento_compativel_idade" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      H� antecedentes familiares com problemas de sa�de ou aprendizagem?
                    </label>
                    <textarea v-model="form.antecedentes_familiares" rows="2"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Frequenta Sala de Recursos?
                      </label>
                      <select v-model="form.frequenta_sala_recursos"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="N�o">N�o</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        Qual a frequ�ncia do atendimento?
                      </label>
                      <input type="text" v-model="form.frequencia_sala_recursos"
                             class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- STEP 12: INFORMA��ES COMPLEMENTARES -->
            <div v-show="currentStep === 12" class="p-8">
              <div class="max-w-4xl mx-auto">
                <div class="text-center mb-8">
                  <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-info-circle text-3xl text-gray-600"></i>
                  </div>
                  <h2 class="text-2xl font-bold text-gray-900 mb-2">Informa��es Complementares</h2>
                  <p class="text-gray-600">Observa��es do entrevistador</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Observa��o: todas as informa��es, coment�rios espont�neos que julgar importante devem ser anotados pelo entrevistador.
                  </label>
                  <textarea v-model="form.informacoes_complementares" rows="4"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"></textarea>
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
  autoSaveTimeout: null,
  isLoadingForm: false,
      
      steps: [
        { name: 'Identifica��o', icon: 'fas fa-user-graduate' },
        { name: 'Fam�lia', icon: 'fas fa-users' },
        { name: 'Gesta��o', icon: 'fas fa-baby' },
        { name: 'Alimenta��o', icon: 'fas fa-utensils' },
        { name: 'Sa�de', icon: 'fas fa-heartbeat' },
        { name: 'Desenvolvimento', icon: 'fas fa-chart-line' },
        { name: 'Comunica��o', icon: 'fas fa-comments' },
        { name: 'AVDs', icon: 'fas fa-hands-helping' },
        { name: 'Socializa��o', icon: 'fas fa-user-friends' },
        { name: 'Comportamento', icon: 'fas fa-smile' },
        { name: 'Vida Escolar', icon: 'fas fa-school' },
        { name: 'Complementares', icon: 'fas fa-info-circle' },
      ],
      
      form: {
        student_id: '',
        data_entrevista: new Date().toISOString().split('T')[0],
        nome_estudante: '',
        data_nascimento: '',
        naturalidade: '',
        nome_escola: '',
        serie_ano: '',
        turno: '',
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
        motivo_primeira_entrevista: 0,
        motivo_atualizacao: 0,
        motivo_outros: 0,
        composicao_familiar: '',
        tem_irmaos: '',
        quantos_irmaos: '',
        idades_irmaos: '',
        situacao_pais: '',
        vida_social_familia: '',
        habito_familiar: '',
        beneficios_sociais: '',
        gravidez_planejada: '',
        gestacao_agradavel: '',
        saude_mae: '',
        estado_emocional_mae: '',
        fez_prenatal: '',
        mes_inicio_prenatal: '',
        tratamento_prenatal: '',
        qual_tratamento_prenatal: '',
        tipo_parto: '',
        nasceu_tempo_normal: '',
        observacoes_nascimento: '',
        bebe_necessitou_oxigenio: 0,
        bebe_teve_convulsao: 0,
        bebe_ictericia: 0,
        bebe_incubadora: 0,
        foi_amamentado: '',
        amamentado_ate_idade: '',
        problemas_alimentacao: '',
        alimentacao_atual: '',
        deficiencia_informada: '',
        uso_medicamento: '',
        nome_medicamento: '',
        horarios_medicamento: '',
        vacinacao_atualizada: '',
        doenca_infancia: '',
        convulsoes: 0,
        cirurgias: 0,
        acidentes: 0,
        alergias: 0,
        febre_alta: 0,
        problemas_audicao: 0,
        problemas_visao: 0,
        tratamento_medico: '',
        acompanhamento_atual: '',
        crises_rotineiramente: '',
        tem_convulsoes: '',
        primeira_convulsao_quando: '',
        ultima_convulsao: '',
        frequencia_convulsoes: '',
        familia_lida_convulsoes: '',
        mudancas_apos_convulsoes: '',
        idade_engatinhou: '',
        idade_andou: '',
        idade_falou: '',
        controle_esfincteres: '',
        comunicacao_verbal: '',
        dificuldade_fala: '',
        outro_tipo_comunicacao: '',
        como_se_comunica: '',
        alimenta_independente: '',
        banheiro_independente: '',
        gerencia_dia_a_dia: '',
        sono_dorme_bem: 0,
        sono_agitado: 0,
        sono_contraturno: 0,
        gosta_brincar: '',
        curiosidade_sexual: '',
        correcao_conversa: 0,
        correcao_grita: 0,
        correcao_castigo: 0,
        correcao_bate: 0,
        correcao_outro: 0,
        correcao_outro_qual: '',
        lida_negativa: '',
        preferencia_hiperfoco: '',
        faz_amigos_facilidade: '',
        tem_amigos_vizinhanca: '',
        interage_mesma_idade: '',
        gosta_passeios_festas: '',
        preferencias_diversao: '',
        comportamento_introvertido: 0,
        comportamento_afetuoso: 0,
        comportamento_obediente: 0,
        comportamento_resistente: 0,
        comportamento_cooperador: 0,
        comportamento_medroso: 0,
        comportamento_inseguro: 0,
        comportamento_outro: 0,
        comportamento_outro_qual: '',
        habito_mania: '',
        comporta_frustracao: '',
        idade_entrou_escola: '',
        adaptacao_escola: '',
        repetencia: '',
        ressente_muda_professor: '',
        frequencia_escolar: '',
        familia_participa_escola: '',
        forma_participacao_escola: '',
        quem_ajuda_para_casa: '',
        acha_atendimento_escola: '',
        desenvolvimento_compativel_idade: '',
        antecedentes_familiares: '',
        frequenta_sala_recursos: '',
        frequencia_sala_recursos: '',
        informacoes_complementares: ''
      }
    }
  },
  computed: {
    progressPercentage() {
      // Campos obrigatórios/importantes que devem ser considerados
      const totalFields = Object.keys(this.form).length;
      
      // Contar campos preenchidos
      let filledFields = 0;
      for (const [key, value] of Object.entries(this.form)) {
        // Considerar preenchido se não for vazio, null ou undefined
        if (value !== '' && value !== null && value !== undefined) {
          filledFields++;
        }
      }
      
      return Math.round((filledFields / totalFields) * 100);
    }
  },

  watch: {
    form: {
      handler(newVal, oldVal) {
        if (this.isLoadingForm) {
          console.log('⏸️ [ENTREVISTA COMPLETA] Auto-save pausado durante carregamento');
          return;
        }
        const oldStudentId = oldVal?.student_id ?? null;
        if (newVal.student_id !== oldStudentId) {
          console.log('ℹ️ [ENTREVISTA COMPLETA] Mudança de aluno detectada, auto-save ignorado');
          return;
        }
        if (newVal.student_id && !this.autoSaving && !this.isLoadingForm) {
          console.log('💾 [ENTREVISTA COMPLETA] Watch detectou mudança');
          this.triggerAutoSave();
        }
      },
      deep: true
    }
  },

  async mounted() {
    await this.loadAlunos();
  },

  beforeUnmount() {
    this.cancelAutoSaveTimer();
  },

  beforeDestroy() {
    this.cancelAutoSaveTimer();
  },

  methods: {
    getTabColorClasses(stepNumber) {
      const colors = [
        { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-600', hover: 'hover:bg-blue-50' },
        { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-600', hover: 'hover:bg-purple-50' },
        { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-600', hover: 'hover:bg-pink-50' },
        { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-600', hover: 'hover:bg-orange-50' },
        { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-600', hover: 'hover:bg-red-50' },
        { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-600', hover: 'hover:bg-teal-50' },
        { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-600', hover: 'hover:bg-cyan-50' },
        { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-600', hover: 'hover:bg-indigo-50' },
        { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-600', hover: 'hover:bg-rose-50' },
        { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-600', hover: 'hover:bg-emerald-50' },
        { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-600', hover: 'hover:bg-violet-50' },
        { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-600', hover: 'hover:bg-amber-50' }
      ];
      
      const color = colors[(stepNumber - 1) % colors.length];
      
      if (this.currentStep === stepNumber) {
        return `${color.bg} ${color.text} border-b-3 ${color.border}`;
      } else if (stepNumber < this.currentStep) {
        return `text-green-600 hover:bg-green-50`;
      } else {
        return `text-gray-500 ${color.hover}`;
      }
    },

    cancelAutoSaveTimer() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
        console.log('🛑 Timer de auto-save cancelado');
      }
    },

    normalizeYesNo(value) {
      if (value === 1 || value === '1' || value === true) return 'Sim';
      if (value === 0 || value === '0' || value === false) return 'N�o';
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'sim') return 'Sim';
        if (normalized === 'n�o' || normalized === 'nao') return 'N�o';
      }
      return value;
    },

    mapLegacyInterviewData(data) {
      const mapped = { ...(data || {}) };
      const renames = {
        composicao_familia_concepcao: 'composicao_familiar',
        amamentacao_ate_idade: 'amamentado_ate_idade',
        prenatal_mes_inicio: 'mes_inicio_prenatal',
        prenatal_tratamento_necessario: 'tratamento_prenatal',
        prenatal_qual_tratamento: 'qual_tratamento_prenatal',
        saude_mae_gestacao: 'saude_mae'
      };

      Object.entries(renames).forEach(([oldKey, newKey]) => {
        if ((mapped[newKey] === undefined || mapped[newKey] === '') && mapped[oldKey] !== undefined) {
          mapped[newKey] = mapped[oldKey];
        }
      });

      if (!mapped.situacao_pais && (mapped.pais_casados !== undefined || mapped.pais_presentes !== undefined)) {
        const casados = this.normalizeYesNo(mapped.pais_casados);
        const presentes = this.normalizeYesNo(mapped.pais_presentes);
        if (casados === 'Sim') {
          mapped.situacao_pais = 'Sim, casados';
        } else if (casados === 'N�o') {
          mapped.situacao_pais = presentes === 'Sim'
            ? 'Separados, mas presentes'
            : 'Separados';
        }
      }

      if (!mapped.gosta_brincar && mapped.brincadeiras_preferidas) {
        mapped.gosta_brincar = mapped.brincadeiras_preferidas;
      }
      if (!mapped.preferencias_diversao && mapped.atividades_lazer) {
        mapped.preferencias_diversao = mapped.atividades_lazer;
      }
      if (!mapped.curiosidade_sexual && mapped.orientacao_sexualidade) {
        mapped.curiosidade_sexual = mapped.orientacao_sexualidade;
      }
      if (!mapped.acompanhamento_atual && mapped.acompanhamentos_medicos) {
        mapped.acompanhamento_atual = mapped.acompanhamentos_medicos;
      }
      if (!mapped.tratamento_medico && mapped.historico_saude) {
        mapped.tratamento_medico = mapped.historico_saude;
      }

      const yesNoFields = [
        'tem_irmaos',
        'fez_prenatal',
        'tratamento_prenatal',
        'nasceu_tempo_normal',
        'foi_amamentado',
        'uso_medicamento',
        'crises_rotineiramente',
        'tem_convulsoes',
        'alimenta_independente',
        'banheiro_independente',
        'gerencia_dia_a_dia',
        'faz_amigos_facilidade',
        'tem_amigos_vizinhanca',
        'interage_mesma_idade',
        'gosta_passeios_festas',
        'repetencia',
        'ressente_muda_professor',
        'frequenta_sala_recursos'
      ];

      yesNoFields.forEach((key) => {
        if (mapped[key] !== undefined && mapped[key] !== '') {
          mapped[key] = this.normalizeYesNo(mapped[key]);
        }
      });

      if (mapped.gravidez_planejada_relato && !mapped.gravidez_planejada) {
        mapped.gravidez_planejada = mapped.gravidez_planejada_relato;
      }

      mapped.gravidez_planejada = this.normalizeYesNo(mapped.gravidez_planejada);
      mapped.gestacao_agradavel = this.normalizeYesNo(mapped.gestacao_agradavel);

      return mapped;
    },
    triggerAutoSave() {
      if (this.isLoadingForm) {
        console.log('🚫 [AUTO-SAVE] Ignorado porque formulário está carregando');
        return;
      }
      this.cancelAutoSaveTimer();
      console.log('⏱️ Timer de 2 segundos iniciado');
      this.autoSaveTimeout = setTimeout(() => {
        this.performAutoSave();
      }, 2000);
    },
    
    async performAutoSave() {
      if (!this.form.student_id || this.autoSaving || this.isLoadingForm) {
        if (!this.form.student_id) {
          console.log('🚫 [AUTO-SAVE] Nenhum aluno selecionado, cancelando');
        }
        if (this.autoSaving) {
          console.log('🚫 [AUTO-SAVE] Já existe uma operação em andamento');
        }
        if (this.isLoadingForm) {
          console.log('🚫 [AUTO-SAVE] Ignorado porque formulário está carregando');
        }
        return;
      }
      
      console.log('🚀 [AUTO-SAVE] Salvando...', this.form.id ? `(UPDATE ID: ${this.form.id})` : '(CREATE)');
      this.autoSaving = true;
      
      try {
        const formDataCopy = { ...this.form };
        delete formDataCopy.student_id;
        delete formDataCopy.id;
        
        const payload = {
          student_id: this.form.student_id,
          form_data: formDataCopy,
          status: 'rascunho'
        };
        
        // LÓGICA 1:1 - Sempre usa .create que faz UPSERT (INSERT ou UPDATE automaticamente)
        response = await api.post('?action=entrevistas-responsavel.create', payload);
        console.log('💾 Salvando entrevista (UPSERT)...');
        
        console.log('📥 Resposta:', response.data);
        
        if (response.data?.ok) {
          // Armazenar ID se foi criado agora ou já existia
          if (response.data.data?.id && !this.form.id) {
            this.form.id = response.data.data.id;
            console.log('🆔 ID criado:', this.form.id);
          }
          this.autoSaved = true;
          console.log('✅ Salvo automaticamente! Action:', response.data.data?.action || 'unknown');
          setTimeout(() => { this.autoSaved = false; }, 3000);
        }
      } catch (error) {
        console.error('❌ Erro auto-save:', error);
        console.error('❌ Detalhes:', error.response?.data);
      } finally {
        this.autoSaving = false;
      }
    },
    async loadAlunos() {
      try {
        // Usar endpoint de seleção dinâmica (já filtra por professor automaticamente via token)
        const response = await api.get('?action=students.options');
        console.log('📚 Entrevista - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data && response.data.data.options) {
          // Endpoint retorna {ok: true, data: {options: [{id, text}]}}
          this.alunos = response.data.data.options.map(opt => ({
            id: opt.id,
            name: opt.text.split(' (')[0] // Remove modalidade do texto
          }));
        } else {
          console.warn('Formato inesperado de resposta:', response.data);
          this.alunos = [];
        }
        
        console.log('✅ Entrevista - Total de alunos (filtrado por professor):', this.alunos.length);
      } catch (error) {
        console.error('❌ Entrevista - Erro ao carregar alunos:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao carregar lista de alunos');
        }
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;

      this.cancelAutoSaveTimer();
      this.isLoadingForm = true;
      this.autoSaving = false;
      this.autoSaved = false;

      try {
        const studentId = this.form.student_id;
        console.log('🎓 Carregando dados completos do aluno:', studentId);

        const response = await api.get('?action=students.get', { params: { id: studentId } });
        const alunoData = response.data?.data;

        // Resetar formulário utilizando estrutura base
        const baseForm = JSON.parse(JSON.stringify(this.$options.data().form));
        this.form = { ...baseForm, student_id: studentId };

        if (alunoData) {
          this.form.id = alunoData.last_interview_id || null;
          this.form.nome_estudante = alunoData.name || '';
          this.form.data_nascimento = alunoData.birth_date || '';
          this.form.nome_escola = alunoData.school_name || alunoData.school || '';
          this.form.serie_ano = alunoData.grade || '';
          this.form.turno = alunoData.shift || '';
          this.form.endereco = alunoData.address || '';
          this.form.telefone = alunoData.phone || '';

          console.log('✅ Dados do aluno preenchidos automaticamente');
        }

        await this.loadSavedInterview();
      } catch (error) {
        console.error('❌ Erro ao carregar dados do aluno:', error);
      } finally {
        this.isLoadingForm = false;
      }
    },

    async loadSavedInterview() {
      if (!this.form.student_id) return;

      try {
        console.log('🔍 Buscando entrevista salva para aluno:', this.form.student_id);

        const response = await api.get('?action=entrevistas-responsavel.list', {
          params: { student_id: this.form.student_id }
        });

        console.log('📥 Resposta da busca:', response.data);

        if (response.data?.ok) {
          const data = response.data.data;
          const entrevistas = data?.data || data?.rows || data || [];

          if (entrevistas.length > 0) {
            const entrevistasOrdenadas = [...entrevistas].sort((a, b) => {
              const dateA = new Date(a.updated_at || a.created_at || 0);
              const dateB = new Date(b.updated_at || b.created_at || 0);
              if (dateA.getTime() === dateB.getTime()) {
                return (b.id || 0) - (a.id || 0);
              }
              return dateB - dateA;
            });

            const ultima = entrevistasOrdenadas[0];
            console.log('📄 Entrevista encontrada:', ultima);

            if (ultima.id) {
              this.form.id = ultima.id;
            }

            if (ultima.form_data) {
              const normalizedData = this.mapLegacyInterviewData(ultima.form_data);
              Object.entries(normalizedData).forEach(([key, value]) => {
                if (key !== 'student_id' && key in this.form) {
                  this.form[key] = value;
                }
              });

              console.log('✅ Entrevista recuperada com sucesso! ID:', ultima.id);

              if (this.$root.showToast) {
                this.$root.showToast('info', `Entrevista recuperada (ID: ${ultima.id})`);
              }

              this.autoSaved = false;
            }
          } else {
            console.log('ℹ️ Nenhuma entrevista salva encontrada para este aluno');
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar entrevista salva:', error);
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
        this.triggerAutoSave();
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
        const response = await api.post('/entrevistas/create', this.form);
        
        if (response.data.ok) {
          if (this.$root.showToast) {
            this.$root.showToast('success', 'Entrevista salva com sucesso!');
          }
          this.$router.push('/app');
        }
      } catch (error) {
        console.error('Erro ao salvar entrevista:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao salvar entrevista');
        }
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
              <div class="mt-3 flex items-center text-sm font-medium" :class="{
                'text-blue-600': autoSaving,
                'text-emerald-600': autoSaved && !autoSaving,
                'text-gray-500': !autoSaving && !autoSaved
              }">
                <i v-if="autoSaving" class="fas fa-circle-notch fa-spin mr-2"></i>
                <i v-else-if="autoSaved" class="fas fa-check-circle mr-2"></i>
                <i v-else class="fas fa-cloud mr-2"></i>
                <span v-if="autoSaving">Salvando automaticamente...</span>
                <span v-else-if="autoSaved">Alterações salvas automaticamente</span>
                <span v-else>Edições serão salvas automaticamente</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-emerald-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Campos preenchidos</span>
              <span class="text-sm font-semibold" :class="[
                progressPercentage >= 80 ? 'text-green-600' : 
                progressPercentage >= 50 ? 'text-emerald-600' : 
                'text-gray-500'
              ]">{{ progressPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="h-3 rounded-full transition-all duration-500"
                   :class="[
                     progressPercentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                     progressPercentage >= 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                     'bg-gradient-to-r from-gray-400 to-gray-500'
                   ]"
                   :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- TabBar Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div class="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    class="flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 relative whitespace-nowrap"
                    :class="getTabColorClasses(index + 1)">
              <div class="flex items-center justify-center space-x-2">
                <i :class="[step.icon, index + 1 < currentStep ? 'fa-check-circle' : '']"></i>
                <span>{{ step.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Form Content -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
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

        <div v-if="autoSaving" class="fixed bottom-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg">
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
      totalSteps: 10,
      alunos: [],
      autoSaving: false,
      autoSaved: false,
      autoSaveTimeout: null,
      isLoadingForm: false,
      
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
        id: null,
        student_id: '',
        nome_estudante: '',
        diretor: '',
        vice_diretor: '',
        supervisor_pedagogico: '',
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

  computed: {
    progressPercentage() {
      const totalFields = Object.keys(this.form).length;
      let filledFields = 0;
      for (const [key, value] of Object.entries(this.form)) {
        if (value !== '' && value !== null && value !== undefined) {
          filledFields++;
        }
      }
      return Math.round((filledFields / totalFields) * 100);
    }
  },

  watch: {
    form: {
      handler(newVal, oldVal) {
        if (this.isLoadingForm) {
          console.log('⏸️ [PDI COMPLETO] Auto-save pausado durante carregamento');
          return;
        }

        const oldStudentId = oldVal?.student_id ?? null;
        if (newVal.student_id !== oldStudentId) {
          console.log('ℹ️ [PDI COMPLETO] Mudança de aluno detectada, auto-save ignorado');
          return;
        }

        if (newVal.student_id && !this.autoSaving && !this.isLoadingForm) {
          console.log('💾 [PDI COMPLETO] Watch detectou mudança');
          this.triggerAutoSave();
        }
      },
      deep: true
    }
  },

  async mounted() {
    await this.loadAlunos();
  },

  beforeUnmount() {
    this.cancelAutoSaveTimer();
  },

  beforeDestroy() {
    this.cancelAutoSaveTimer();
  },

  methods: {
    getTabColorClasses(stepNumber) {
      const colors = [
        { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-600', hover: 'hover:bg-emerald-50' },
        { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-600', hover: 'hover:bg-teal-50' },
        { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-600', hover: 'hover:bg-cyan-50' },
        { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-600', hover: 'hover:bg-sky-50' },
        { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-600', hover: 'hover:bg-blue-50' },
        { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-600', hover: 'hover:bg-indigo-50' },
        { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-600', hover: 'hover:bg-violet-50' },
        { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-600', hover: 'hover:bg-purple-50' },
        { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-600', hover: 'hover:bg-fuchsia-50' },
        { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-600', hover: 'hover:bg-green-50' }
      ];
      
      const color = colors[(stepNumber - 1) % colors.length];
      
      if (this.currentStep === stepNumber) {
        return `${color.bg} ${color.text} border-b-3 ${color.border}`;
      } else if (stepNumber < this.currentStep) {
        return `text-green-600 hover:bg-green-50`;
      } else {
        return `text-gray-500 ${color.hover}`;
      }
    },

    cancelAutoSaveTimer() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
        console.log('🛑 [PDI COMPLETO] Timer de auto-save cancelado');
      }
    },

    triggerAutoSave() {
      if (this.isLoadingForm) {
        console.log('🚫 [PDI COMPLETO] Auto-save ignorado porque formulário está carregando');
        return;
      }

      this.cancelAutoSaveTimer();
      console.log('⏱️ [PDI COMPLETO] Timer de 2 segundos iniciado');
      this.autoSaveTimeout = setTimeout(() => {
        this.performAutoSave();
      }, 2000);
    },

    async performAutoSave(status = 'rascunho', options = {}) {
      if (!this.form.student_id || this.isLoadingForm) {
        if (!this.form.student_id) {
          console.log('🚫 [PDI COMPLETO] Auto-save abortado: nenhum aluno selecionado');
        }
        if (this.isLoadingForm) {
          console.log('🚫 [PDI COMPLETO] Auto-save abortado: formulário carregando');
        }
        return false;
      }

    const isAuto = status === 'rascunho' && !options.showToast;
    this.cancelAutoSaveTimer();
      if (isAuto && this.autoSaving) {
        console.log('⏳ [PDI COMPLETO] Auto-save já em andamento, ignorando novo disparo');
        return false;
      }

      if (isAuto) {
        this.autoSaving = true;
      }

      try {
        const formDataCopy = { ...this.form };
        delete formDataCopy.student_id;
        delete formDataCopy.id;

        const payload = {
          student_id: this.form.student_id,
          form_data: formDataCopy,
          status,
          data_inicio: this.form.data_inicio || null,
          data_fim: this.form.data_termino || null
        };

        // LÓGICA 1:1 - Sempre usa .create que faz UPSERT
        console.log('💾 [PDI COMPLETO] Salvando PDI (UPSERT) - Status:', status);
        response = await api.post('?action=pdi.create', payload);

        if (response.data?.ok) {
          if (response.data.data?.id && !this.form.id) {
            this.form.id = response.data.data.id;
            console.log('🆔 [PDI COMPLETO] ID:', this.form.id);
          }

          if (isAuto) {
            this.autoSaved = true;
            setTimeout(() => { this.autoSaved = false; }, 3000);
            console.log('✅ [PDI COMPLETO] Salvo automaticamente! Action:', response.data.data?.action);
          }

          if (options.showToast && this.$root.showToast) {
            this.$root.showToast('success', 'PDI salvo com sucesso!');
          }

          return true;
        }

        console.warn('⚠️ [PDI COMPLETO] Resposta inesperada no auto-save:', response.data);
        if (options.showToast && this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao salvar PDI');
        }
      } catch (error) {
        console.error('❌ [PDI COMPLETO] Erro ao salvar:', error);
        if (options.showToast && this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao salvar PDI');
        }
      } finally {
        if (isAuto) {
          this.autoSaving = false;
        }
      }

      return false;
    },

    async loadSavedPdi(studentId = this.form.student_id) {
      if (!studentId) return;

      try {
        console.log('🔍 [PDI COMPLETO] Buscando PDI salvo para aluno:', studentId);
        const response = await api.get('?action=pdi.list', { params: { student_id: studentId } });

        const registros = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        if (registros.length === 0) {
          console.log('ℹ️ [PDI COMPLETO] Nenhum PDI salvo encontrado para este aluno');
          return;
        }

        const ordenados = [...registros].sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          if (dateA.getTime() === dateB.getTime()) {
            return (b.id || 0) - (a.id || 0);
          }
          return dateB - dateA;
        });

        const ultimo = ordenados[0];
        console.log('📄 [PDI COMPLETO] Registro recuperado:', ultimo);

        this.form.id = ultimo.id || null;
        this.form.data_inicio = ultimo.data_inicio || this.form.data_inicio;
        this.form.data_termino = ultimo.data_fim || this.form.data_termino;

        if (ultimo.form_data) {
          Object.entries(ultimo.form_data).forEach(([key, value]) => {
            if (key !== 'student_id' && key in this.form) {
              this.form[key] = value;
            }
          });
        }

        this.autoSaved = false;

        if (this.$root.showToast) {
          this.$root.showToast('info', `PDI recuperado (ID: ${ultimo.id})`);
        }
      } catch (error) {
        console.error('❌ [PDI COMPLETO] Erro ao carregar PDI salvo:', error);
      }
    },
    async loadAlunos() {
      try {
        // Usar endpoint de seleção dinâmica (já filtra por professor automaticamente via token)
        const response = await api.get('?action=students.options');
        console.log('📚 PDI - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data && response.data.data.options) {
          // Endpoint retorna {ok: true, data: {options: [{id, text}]}}
          this.alunos = response.data.data.options.map(opt => ({
            id: opt.id,
            name: opt.text.split(' (')[0] // Remove modalidade do texto
          }));
        } else {
          this.alunos = [];
        }
        
        console.log('✅ PDI - Total de alunos:', this.alunos.length);
      } catch (error) {
        console.error('❌ PDI - Erro ao carregar alunos:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao carregar lista de alunos');
        }
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;

      this.cancelAutoSaveTimer();
      this.isLoadingForm = true;
      this.autoSaving = false;
      this.autoSaved = false;

      try {
        const studentId = this.form.student_id;
        console.log('🎓 [PDI COMPLETO] Carregando dados completos do aluno:', studentId);

        const baseForm = JSON.parse(JSON.stringify(this.$options.data().form));
        this.form = { ...baseForm, student_id: studentId };
  this.setCurrentUser();

        const response = await api.get('?action=students.get', { params: { id: studentId } });
        const alunoData = response.data?.data;

        if (alunoData) {
          this.form.nome_estudante = alunoData.name || '';
          this.form.turno = alunoData.shift || '';

          if (this.$root.showToast) {
            this.$root.showToast('success', 'Dados do aluno preenchidos automaticamente');
          }
        }

        await this.loadSavedPdi(studentId);
      } catch (error) {
        console.error('❌ [PDI COMPLETO] Erro ao carregar dados do aluno:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao carregar dados do aluno');
        }
      } finally {
        this.isLoadingForm = false;
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
        this.triggerAutoSave();
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    async handleSubmit() {
      const sucesso = await this.performAutoSave('completo', { showToast: true });
      if (sucesso) {
        this.$router.push('/app');
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
              <div class="mt-3 flex items-center text-sm font-medium" :class="{
                'text-indigo-600': autoSaving,
                'text-purple-600': autoSaved && !autoSaving,
                'text-gray-500': !autoSaving && !autoSaved
              }">
                <i v-if="autoSaving" class="fas fa-circle-notch fa-spin mr-2"></i>
                <i v-else-if="autoSaved" class="fas fa-check-circle mr-2"></i>
                <i v-else class="fas fa-cloud mr-2"></i>
                <span v-if="autoSaving">Salvando automaticamente...</span>
                <span v-else-if="autoSaved">Alterações salvas automaticamente</span>
                <span v-else>Edições serão salvas automaticamente</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-sm text-gray-500">Etapa</div>
              <div class="text-3xl font-bold text-purple-600">{{ currentStep }}/{{ totalSteps }}</div>
            </div>
          </div>
          
          <!-- Progress Bar -->
          <div class="mt-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-gray-700">Campos preenchidos</span>
              <span class="text-sm font-semibold" :class="[
                progressPercentage >= 80 ? 'text-green-600' : 
                progressPercentage >= 50 ? 'text-purple-600' : 
                'text-gray-500'
              ]">{{ progressPercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3">
              <div class="h-3 rounded-full transition-all duration-500"
                   :class="[
                     progressPercentage >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                     progressPercentage >= 50 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                     'bg-gradient-to-r from-gray-400 to-gray-500'
                   ]"
                   :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
        </div>

        <!-- TabBar Navigation -->
        <div class="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div class="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button v-for="(step, index) in steps" :key="index"
                    @click="goToStep(index + 1)"
                    type="button"
                    class="flex-shrink-0 px-6 py-4 text-sm font-medium transition-all duration-200 relative whitespace-nowrap"
                    :class="getTabColorClasses(index + 1)">
              <div class="flex items-center justify-center space-x-2">
                <i :class="[step.icon, index + 1 < currentStep ? 'fa-check-circle' : '']"></i>
                <span>{{ step.name }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- Form -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden">
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

        <div v-if="autoSaving" class="fixed bottom-4 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <i class="fas fa-sync fa-spin mr-2"></i>
          Salvando automaticamente...
        </div>
        <div v-if="autoSaved" class="fixed bottom-4 right-4 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <i class="fas fa-check mr-2"></i>
          Salvo!
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      currentStep: 1,
      totalSteps: 7,
      alunos: [],
      autoSaving: false,
      autoSaved: false,
      autoSaveTimeout: null,
      isLoadingForm: false,
      
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
        id: null,
        // Step 1: Identificação
        student_id: '',
        nome_estudante: '',
        data_nascimento: '',
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

  computed: {
    progressPercentage() {
      const totalFields = Object.keys(this.form).length;
      let filledFields = 0;
      for (const [key, value] of Object.entries(this.form)) {
        if (value !== '' && value !== null && value !== undefined) {
          filledFields++;
        }
      }
      return Math.round((filledFields / totalFields) * 100);
    }
  },

  watch: {
    form: {
      handler(newVal, oldVal) {
        if (this.isLoadingForm) {
          console.log('⏸️ [PAI COMPLETO] Auto-save pausado durante carregamento');
          return;
        }

        const oldStudentId = oldVal?.student_id ?? null;
        if (newVal.student_id !== oldStudentId) {
          console.log('ℹ️ [PAI COMPLETO] Mudança de aluno detectada, auto-save ignorado');
          return;
        }

        if (newVal.student_id && !this.autoSaving && !this.isLoadingForm) {
          console.log('💾 [PAI COMPLETO] Watch detectou mudança');
          this.triggerAutoSave();
        }
      },
      deep: true
    }
  },

  async mounted() {
    await this.loadAlunos();
    this.setDefaultDates();
  },

  beforeUnmount() {
    this.cancelAutoSaveTimer();
  },

  beforeDestroy() {
    this.cancelAutoSaveTimer();
  },

  methods: {
    getTabColorClasses(stepNumber) {
      const colors = [
        { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-600', hover: 'hover:bg-purple-50' },
        { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-600', hover: 'hover:bg-pink-50' },
        { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-600', hover: 'hover:bg-rose-50' },
        { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-600', hover: 'hover:bg-fuchsia-50' },
        { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-600', hover: 'hover:bg-violet-50' },
        { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-600', hover: 'hover:bg-indigo-50' },
        { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-600', hover: 'hover:bg-blue-50' }
      ];
      
      const color = colors[(stepNumber - 1) % colors.length];
      
      if (this.currentStep === stepNumber) {
        return `${color.bg} ${color.text} border-b-3 ${color.border}`;
      } else if (stepNumber < this.currentStep) {
        return `text-green-600 hover:bg-green-50`;
      } else {
        return `text-gray-500 ${color.hover}`;
      }
    },

    cancelAutoSaveTimer() {
      if (this.autoSaveTimeout) {
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = null;
        console.log('🛑 [PAI COMPLETO] Timer de auto-save cancelado');
      }
    },

    triggerAutoSave() {
      if (this.isLoadingForm) {
        console.log('🚫 [PAI COMPLETO] Auto-save ignorado porque formulário está carregando');
        return;
      }

      this.cancelAutoSaveTimer();
      console.log('⏱️ [PAI COMPLETO] Timer de 2 segundos iniciado');
      this.autoSaveTimeout = setTimeout(() => {
        this.performAutoSave();
      }, 2000);
    },

    async performAutoSave(status = 'rascunho', options = {}) {
      if (!this.form.student_id || this.isLoadingForm) {
        if (!this.form.student_id) {
          console.log('🚫 [PAI COMPLETO] Auto-save abortado: nenhum aluno selecionado');
        }
        if (this.isLoadingForm) {
          console.log('🚫 [PAI COMPLETO] Auto-save abortado: formulário carregando');
        }
        return false;
      }

      const isAuto = status === 'rascunho' && !options.showToast;
      this.cancelAutoSaveTimer();

      if (isAuto && this.autoSaving) {
        console.log('⏳ [PAI COMPLETO] Auto-save em andamento, ignorando novo disparo');
        return false;
      }

      if (isAuto) {
        this.autoSaving = true;
      }

      try {
        const formDataCopy = { ...this.form };
        delete formDataCopy.student_id;
        delete formDataCopy.id;

        const payload = {
          student_id: this.form.student_id,
          form_data: formDataCopy,
          status,
          data_inicio: this.form.data_inicio || null,
          data_fim: this.form.data_termino || null
        };

        // LÓGICA 1:1 - Sempre usa .create que faz UPSERT
        console.log('💾 [PAI COMPLETO] Salvando PAI (UPSERT) - Status:', status);
        response = await api.post('?action=plano-atendimento.create', payload);

        if (response.data?.ok) {
          if (response.data.data?.id && !this.form.id) {
            this.form.id = response.data.data.id;
            console.log('🆔 [PAI COMPLETO] ID:', this.form.id);
          }

          if (isAuto) {
            this.autoSaved = true;
            setTimeout(() => { this.autoSaved = false; }, 3000);
            console.log('✅ [PAI COMPLETO] Salvo automaticamente! Action:', response.data.data?.action);
          }

          if (options.showToast && this.$root.showToast) {
            this.$root.showToast('success', 'PAI salvo com sucesso!');
          }

          return true;
        }

        console.warn('⚠️ [PAI COMPLETO] Resposta inesperada no auto-save:', response.data);
        if (options.showToast && this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao salvar PAI');
        }
      } catch (error) {
        console.error('❌ [PAI COMPLETO] Erro ao salvar:', error);
        if (options.showToast && this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao salvar PAI');
        }
      } finally {
        if (isAuto) {
          this.autoSaving = false;
        }
      }

      return false;
    },

    async loadSavedPai(studentId = this.form.student_id) {
      if (!studentId) return;

      try {
        console.log('🔍 [PAI COMPLETO] Buscando PAI salvo para aluno:', studentId);
        const response = await api.get('?action=plano-atendimento.list', { params: { student_id: studentId } });

        const registros = Array.isArray(response.data?.data)
          ? response.data.data
          : response.data?.data?.data || [];

        if (registros.length === 0) {
          console.log('ℹ️ [PAI COMPLETO] Nenhum PAI salvo encontrado para este aluno');
          return;
        }

        const ordenados = [...registros].sort((a, b) => {
          const dateA = new Date(a.updated_at || a.created_at || 0);
          const dateB = new Date(b.updated_at || b.created_at || 0);
          if (dateA.getTime() === dateB.getTime()) {
            return (b.id || 0) - (a.id || 0);
          }
          return dateB - dateA;
        });

        const ultimo = ordenados[0];
        console.log('📄 [PAI COMPLETO] Registro recuperado:', ultimo);

        this.form.id = ultimo.id || null;
        this.form.data_inicio = ultimo.data_inicio || this.form.data_inicio;
        this.form.data_termino = ultimo.data_fim || this.form.data_termino;

        if (ultimo.form_data) {
          Object.entries(ultimo.form_data).forEach(([key, value]) => {
            if (key !== 'student_id' && key in this.form) {
              this.form[key] = value;
            }
          });
        }

        this.autoSaved = false;

        if (this.$root.showToast) {
          this.$root.showToast('info', `PAI recuperado (ID: ${ultimo.id})`);
        }
      } catch (error) {
        console.error('❌ [PAI COMPLETO] Erro ao carregar PAI salvo:', error);
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
        // Usar endpoint de seleção dinâmica (já filtra por professor automaticamente via token)
        const response = await api.get('?action=students.options');
        console.log('📚 PAI - Alunos carregados:', response.data);
        
        if (response.data.ok && response.data.data && response.data.data.options) {
          // Endpoint retorna {ok: true, data: {options: [{id, text}]}}
          this.alunos = response.data.data.options.map(opt => ({
            id: opt.id,
            name: opt.text.split(' (')[0] // Remove modalidade do texto
          }));
        } else {
          this.alunos = [];
        }
        
        console.log('✅ PAI - Total de alunos:', this.alunos.length);
      } catch (error) {
        console.error('❌ PAI - Erro ao carregar alunos:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao carregar lista de alunos');
        }
        this.alunos = [];
      }
    },

    async loadStudentData() {
      if (!this.form.student_id) return;

      this.cancelAutoSaveTimer();
      this.isLoadingForm = true;
      this.autoSaving = false;
      this.autoSaved = false;

      try {
        const studentId = this.form.student_id;
        console.log('🎓 [PAI COMPLETO] Carregando dados completos do aluno:', studentId);

        const baseForm = JSON.parse(JSON.stringify(this.$options.data().form));
        this.form = { ...baseForm, student_id: studentId };
  this.setCurrentUser();

        const response = await api.get('?action=students.get', { params: { id: studentId } });
        const alunoData = response.data?.data;

        if (alunoData) {
          this.form.nome_estudante = alunoData.name || '';
          this.form.data_nascimento = alunoData.birth_date || '';
          this.form.nome_escola = alunoData.school_name || alunoData.school || '';
          this.form.serie_ano = alunoData.grade || '';
          this.form.turno = alunoData.shift || '';
          this.form.tipo_deficiencia = alunoData.disability_type || this.form.tipo_deficiencia;

          if (this.$root.showToast) {
            this.$root.showToast('success', 'Dados do aluno preenchidos automaticamente');
          }
        }

        this.setDefaultDates();
        await this.loadSavedPai(studentId);
      } catch (error) {
        console.error('❌ [PAI COMPLETO] Erro ao carregar dados do aluno:', error);
        if (this.$root.showToast) {
          this.$root.showToast('error', 'Erro ao carregar dados do aluno');
        }
      } finally {
        this.isLoadingForm = false;
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
        this.triggerAutoSave();
      }
    },

    previousStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    async handleSubmit() {
      const sucesso = await this.performAutoSave('completo', { showToast: true });
      if (sucesso) {
        this.$router.push('/app');
      }
    }
  }
};

// ========================================
// EXPORTAR COMPONENTES
// ========================================

if (typeof window !== 'undefined') {
  window.EntrevistaResponsavelCompleta = EntrevistaResponsavelCompleta;
  // Mantido apenas para referência/legado (não usado pela rota #/pdi-completo)
  window.PDICompletoLegacy = PDICompleto;
  // Mantido apenas para referência/legado (não usado pela rota #/pai-completo)
  window.PAICompletoLegacy = PAICompleto;
}
















