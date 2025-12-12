/**
 * Dados de teste para formulários AEE
 * Todos os campos preenchidos para validação em PDFs
 */

module.exports = {
  // Credenciais de teste
  credentials: {
    admin: {
      email: 'admin@teste.com',
      password: 'Teste@123'
    },
    professor: {
      email: 'professor@teste.com',
      password: 'Teste@123'
    }
  },

  // Dados completos de Entrevista com Responsável
  entrevistaCompleta: {
    // Dados de Identificação
    data_entrevista: '2025-01-15',
    tipo_entrevista: 'primeira',
    motivo_entrevista: 'Entrevista inicial para avaliação do atendimento AEE',
    
    nome_estudante: 'Maria Silva Santos',
    data_nascimento: '2010-03-20',
    naturalidade: 'São Paulo - SP',
    nome_escola: 'E.E. Professor João Mendes',
    serie_ano: '5º ano',
    turno: 'matutino',
    
    // Dados dos Pais
    nome_pai: 'José Silva Santos',
    idade_pai: '42',
    escolaridade_pai: 'Ensino Médio Completo',
    nome_mae: 'Ana Paula Santos',
    idade_mae: '38',
    escolaridade_mae: 'Ensino Superior Completo',
    
    // Endereço e Contato
    endereco: 'Rua das Flores, 123',
    bairro: 'Jardim das Acácias',
    cidade: 'São Paulo',
    telefone: '(11) 98765-4321',
    
    // Informações da Família
    composicao_familia_concepcao: 'Família nuclear com pai, mãe e 2 filhos',
    tem_irmaos: 'sim',
    quantidade_irmaos: '1',
    idades_irmaos: '8 anos',
    situacao_pais: 'Casados',
    vida_social_familia: 'A família participa de atividades comunitárias aos finais de semana',
    habito_familiar: 'Jantam juntos todos os dias, assistem TV à noite',
    beneficios_sociais: 'Não recebe',
    
    // Gestação/Nascimento
    gravidez_planejada: 'Sim, gravidez planejada',
    experiencia_gestacao: 'Gestação tranquila, sem intercorrências',
    saude_mae_gestacao: 'Boa saúde durante toda a gestação',
    estado_emocional_mae: 'Estado emocional equilibrado',
    fez_prenatal: 'sim',
    mes_inicio_prenatal: '2',
    tratamento_necessario: 'nao',
    tipo_parto: 'cesariana',
    nasceu_tempo_normal: 'sim',
    observacoes_nascimento: 'Nascimento sem intercorrências, peso 3,2kg',
    
    // Alimentação
    foi_amamentado: 'sim',
    amamentado_ate_idade: '1 ano e 6 meses',
    problemas_alimentacao: 'Não apresentou',
    alimentacao_atual: 'Alimentação variada e balanceada',
    
    // Saúde
    deficiencia_informada: 'Transtorno do Espectro Autista (TEA) Nível 1',
    uso_medicamento: 'Risperidona 0,5mg - 1x ao dia',
    horarios_medicamento: 'Noite (20h)',
    vacinacao_atualizada: 'sim',
    doencas_infancia: 'Catapora aos 4 anos',
    problemas_saude: 'Nenhum problema de saúde crônico',
    medico_responsavel: 'Dr. Carlos Mendes - Neuropediatra',
    tratamentos_atuais: 'Terapia ocupacional 2x/semana, fonoaudiologia 1x/semana',
    apresenta_crises: 'nao',
    tem_convulsoes: 'nao',
    
    // Desenvolvimento Pregresso
    idade_engatinhou: '8 meses',
    idade_andou: '14 meses',
    idade_falou: '2 anos e 6 meses',
    controle_esfincters: 'Diurno aos 3 anos, noturno aos 4 anos',
    
    // Desenvolvimento Atual (Comunicação)
    comunicacao_verbal: 'sim',
    dificuldade_fala: 'Dificuldade em manter diálogos longos, vocabulário limitado',
    outro_tipo_comunicacao: 'Usa gestos e apontamentos',
    como_se_comunica: 'Frases curtas, precisa de apoio visual',
    
    // Atividades de Vida Diária
    alimenta_independente: 'sim',
    usa_banheiro_independente: 'sim',
    gerencia_dia_a_dia: 'nao',
    sono_qualidade: 'dorme_bem',
    gosta_brincar: 'sim',
    brinquedos_preferencia: 'Lego, carrinhos, jogos de encaixe',
    curiosidade_sexual: 'nao',
    masturbacao: 'nao',
    orientacao_sexual: 'nao',
    preferencia_objetos: 'Objetos com textura e que giram',
    
    // Socialização e Preferências
    faz_amigos_facilidade: 'nao',
    amigos_vizinhanca: 'sim',
    interage_mesma_idade: 'nao',
    gosta_passeios_festas: 'nao',
    preferencias_diversao: 'Prefere ambientes tranquilos, parques sem muita gente',
    
    // Comportamento
    comportamento_tipo: 'Comportamento geralmente calmo, mas apresenta rigidez em mudanças de rotina',
    habitos_manias: 'Alinha objetos, gosta de manter as coisas organizadas',
    comporta_frustracao: 'Apresenta dificuldade, pode chorar ou se isolar',
    
    // Vida Escolar
    idade_entrou_escola: '3 anos (educação infantil)',
    adaptacao_escolar: 'Adaptação gradual, precisou de acompanhamento nos primeiros meses',
    repetencia: 'Não',
    ressente_mudanca_professor: 'sim',
    frequencia_escolar: 'Regular, faltas apenas por doença',
    familia_participa_vida_escolar: 'sim',
    forma_participacao: 'Comparecem a reuniões, acompanham tarefas de casa',
    quem_ajuda_para_casa: 'Mãe',
    opiniao_atendimento_escola: 'Satisfeitos com o atendimento, gostariam de mais apoio especializado',
    desenvolvimento_compativel_idade: 'nao',
    antecedentes_familiares: 'Tio paterno com diagnóstico de TDAH',
    frequenta_sala_recursos: 'sim',
    frequencia_atendimento_recursos: '2 vezes por semana',
    
    // Informações Complementares
    informacoes_complementares: 'A família está muito engajada no desenvolvimento da criança e busca todas as terapias recomendadas. Maria gosta muito de desenhar e demonstra talento artístico.',
    nome_entrevistador: 'Professora Ana Costa',
    funcao_entrevistador: 'Professor AEE',
    nome_responsavel_informacoes: 'Ana Paula Santos',
    parentesco_responsavel: 'Mãe'
  },

  // Dados completos de PDI
  pdiCompleto: {
    // Dados Institucionais
    data_elaboracao: '2025-01-20',
    nome_escola: 'E.E. Professor João Mendes',
    diretor: 'Maria Fernandes',
    vice_diretor: 'Carlos Alberto',
    ano_letivo: '2025',
    turno: 'matutino',
    
    // Dados do Estudante
    nome_estudante: 'Maria Silva Santos',
    data_nascimento: '2010-03-20',
    idade: '14',
    serie_ano: '5º ano',
    deficiencia_informada: 'TEA Nível 1',
    
    // Objetivos
    objetivo_geral: 'Desenvolver habilidades de comunicação, interação social e autonomia',
    
    objetivos_cognitivo: 'Desenvolver raciocínio lógico-matemático, melhorar atenção e concentração, trabalhar memória de trabalho',
    
    objetivos_comunicacao: 'Ampliar vocabulário, desenvolver narrativas, melhorar compreensão de instruções complexas, trabalhar comunicação não-verbal',
    
    objetivos_psicomotor: 'Desenvolver coordenação motora fina para escrita, trabalhar equilíbrio e coordenação motora grossa, fortalecer musculatura das mãos',
    
    objetivos_socioemocional: 'Desenvolver habilidades de interação social, trabalhar reconhecimento e expressão de emoções, desenvolver autorregulação emocional, fortalecer autoestima',
    
    // Estratégias e Metodologias
    estrategias_metodologias: 'Uso de apoios visuais (pictogramas, agendas visuais), rotinas estruturadas e previsíveis, atividades lúdicas e concretas, ensino explícito de habilidades sociais, pausas sensoriais quando necessário',
    
    // Recursos
    recursos_tecnologia_assistiva: 'Tablet com aplicativos educacionais, timer visual, fones de ouvido com cancelamento de ruído',
    
    recursos_pedagogicos: 'Materiais manipuláveis, jogos educativos, livros com imagens, caderno de comunicação alternativa',
    
    // Avaliação
    criterios_avaliacao: 'Observação contínua, registros de progresso semanais, avaliações formativas adaptadas, portfólio de trabalhos',
    
    periodicidade_reavaliacoes: 'Bimestral',
    
    // Datas
    data_inicio: '2025-02-05',
    data_termino: '2025-12-20',
    frequencia_atendimento: '2 vezes por semana (terça e quinta) - 1h cada atendimento',
    
    // Profissionais
    professor_aee: 'Ana Costa',
    professor_sala_regular: 'João Pedro Silva',
    coordenador_pedagogico: 'Márcia Santos',
    outros_profissionais: 'Terapeuta Ocupacional: Dra. Paula Lima, Fonoaudióloga: Dra. Carla Souza',
    
    // Observações
    observacoes: 'A aluna demonstra interesse por atividades artísticas. É importante manter comunicação constante com a família e terapeutas externos.'
  },

  // Dados completos de Plano de Atendimento (PAI)
  paiCompleto: {
    // Identificação
    nome_escola: 'E.E. Professor João Mendes',
    nome_estudante: 'Maria Silva Santos',
    data_nascimento: '2010-03-20',
    idade: '14',
    serie_ano: '5º ano',
    turno: 'matutino',
    nome_responsavel: 'Ana Paula Santos',
    telefone_contato: '(11) 98765-4321',
    endereco_residencial: 'Rua das Flores, 123 - Jardim das Acácias - São Paulo/SP',
    diagnostico_cid: 'F84.0 - Transtorno do Espectro Autista',
    
    // Equipe
    professor_regente: 'João Pedro Silva',
    professor_aee: 'Ana Costa',
    outros_profissionais: 'TO: Paula Lima, Fono: Carla Souza',
    
    // Datas
    data_elaboracao: '2025-01-20',
    data_avaliacao_diagnostica: '2025-01-10',
    periodo_vigencia: 'Fevereiro a Dezembro/2025',
    data_prevista_reavaliacao: '2025-07-15',
    
    // Histórico
    historico_escolar: 'Iniciou na educação infantil aos 3 anos. Sempre frequentou escola regular. Recebe apoio da sala de recursos desde o 2º ano. Não apresenta histórico de repetência.',
    
    historico_familiar_social: 'Família nuclear estruturada. Pais participativos. Recebe apoio terapêutico externo (TO e Fono). Irmão mais novo com desenvolvimento típico.',
    
    interesses_preferencias: 'Gosta de desenhar, brincar com Lego, assistir desenhos animados. Prefere atividades individuais ou em pequenos grupos.',
    
    dificuldades: 'Dificuldade em interação social espontânea, rigidez comportamental, sensibilidade sensorial a ruídos altos, dificuldade em mudanças de rotina.',
    
    potencialidades_observadas: 'Excelente memória visual, habilidade em artes, interesse por aprendizagem quando usa apoios visuais, capacidade de concentração em atividades de interesse.',
    
    // Avaliação - Comunicação
    oralidade: 'Comunica-se verbalmente com frases curtas. Vocabulário funcional adequado.',
    compreensao: 'Boa compreensão de instruções simples. Necessita apoio para instruções complexas.',
    expressao_verbal: 'Expressa necessidades básicas. Dificuldade em narrativas longas.',
    clareza_frases_completas: 'sim',
    interage_verbalmente: 'sim',
    escreve: 'sim',
    grafia_legivel: 'sim',
    escreve_certo: 'nao',
    producao_textos: 'nao',
    copia: 'sim',
    faz_garatujas: 'nao',
    desenha: 'sim',
    leitura_nivel: 'Lê palavras e frases simples. Dificuldade em textos longos.',
    comunicacao_nao_verbal: 'Usa gestos, expressões faciais. Contato visual inconstante.',
    
    // Avaliação - Cognitivo
    raciocinio_logico_matematico: 'Compreende conceitos básicos de número e quantidade. Dificuldade em resolução de problemas complexos.',
    
    conceitos_academicos: 'Domina alfabeto e números. Em processo de alfabetização. Conceitos matemáticos básicos em desenvolvimento.',
    
    atencao_concentracao: 'Boa atenção em atividades de interesse. Necessita redirecionamento em tarefas menos motivadoras.',
    
    memoria: 'Excelente memória visual. Memória auditiva em desenvolvimento.',
    
    organizacao_planejamento: 'Necessita apoio para organização de materiais e planejamento de tarefas.',
    
    // Avaliação - Socioemocional
    interacao_social: 'Interage quando solicitada. Dificuldade em iniciar interações espontâneas. Prefere adultos a pares.',
    
    autonomia_independencia: 'Independente em AVDs básicas. Necessita apoio em gestão de tempo e organização.',
    
    manejo_emocoes: 'Dificuldade em identificar e expressar emoções. Frustração pode gerar choro ou isolamento.',
    
    comportamento_sala: 'Geralmente calma e cooperativa. Pode apresentar rigidez em mudanças. Necessita previsibilidade.',
    
    // Avaliação - Motora
    coordenacao_motora_fina: 'Coordenação adequada. Preensão do lápis funcional. Grafia legível.',
    
    coordenacao_motora_grossa: 'Desenvolvimento adequado para a idade. Participa de atividades físicas.',
    
    orientacao_espacial_temporal: 'Noção espacial adequada. Dificuldade com conceitos temporais abstratos.',
    
    percepcao_visual_auditiva: 'Excelente percepção visual. Sensibilidade auditiva a ruídos intensos.',
    
    // Objetivos e Metas
    objetivo_geral: 'Promover desenvolvimento integral com foco em comunicação, interação social e habilidades acadêmicas funcionais.',
    
    objetivos_especificos: `1. Ampliar vocabulário e narrativas orais
2. Desenvolver leitura e escrita funcional
3. Fortalecer habilidades de interação social
4. Trabalhar autorregulação emocional
5. Desenvolver autonomia em contextos escolares`,
    
    // Estratégias e Recursos
    adaptacoes_curriculares: 'Atividades com apoio visual, tempo estendido em avaliações, instruções fragmentadas, redução de estímulos visuais em provas.',
    
    recursos_didaticos_tecnologias: 'Tablet educacional, aplicativos de comunicação alternativa, jogos pedagógicos, materiais manipuláveis, livros ilustrados.',
    
    estrategias_ensino: 'Rotina visual estruturada, pausas sensoriais, reforço positivo, ensino explícito de habilidades sociais, modelagem.',
    
    adaptacoes_ambiente_escolar: 'Espaço tranquilo para pausas, sinalizações visuais, fones de ouvido disponíveis.',
    
    atendimento_aee: '2x por semana (terça e quinta), 1h cada. Foco em comunicação, habilidades sociais e apoio pedagógico.',
    
    envolvimento_familia: 'Reuniões bimestrais, agenda de comunicação diária, orientações sobre estratégias a serem replicadas em casa.',
    
    articulacao_outros_profissionais: 'Reuniões semestrais com TO e Fono. Troca de relatórios. Alinhamento de estratégias.',
    
    // Avaliação
    criterios_avaliacao: 'Observação sistemática, registros de progresso, portfólio, avaliações adaptadas, feedback da família e terapeutas.',
    
    periodicidade_reavaliacoes: 'bimestral',
    
    registro_progresso: 'Registro semanal de atividades e progressos. Relatório bimestral para família e escola.',
    
    // Assinaturas
    professor_regente_assinatura: 'João Pedro Silva',
    professor_aee_assinatura: 'Ana Costa',
    coordenacao_pedagogica_assinatura: 'Márcia Santos',
    direcao_escolar_assinatura: 'Maria Fernandes',
    responsavel_aluno_assinatura: 'Ana Paula Santos'
  }
};
