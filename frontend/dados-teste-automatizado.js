// ConectAEE v5.0 - Dados de Teste para Automação com IA
// Este arquivo contém dados estruturados para testes automatizados

const DADOS_TESTE_AUTOMATIZADO = {
  // Dados base para alunos fictícios
  alunos: [
    {
      id: 'auto_test_001',
      name: 'Ana Clara Silva Santos',
      birth_date: '2010-03-15',
      school: 'EMEF Maria Montessori',
      grade: '8º Ano',
      registration_number: 'MT2024001',
      status: 'ativo',
      modalidade: 'srm',
      responsavel: {
        nome: 'Maria Santos Silva',
        parentesco: 'mãe',
        telefone: '(11) 98765-4321',
        email: 'maria.santos@email.com'
      },
      necessidades: ['Deficiência Intelectual', 'Dificuldades de Aprendizagem'],
      observacoes: 'Aluna comunicativa, necessita apoio em matemática'
    },
    {
      id: 'auto_test_002', 
      name: 'João Pedro Oliveira Costa',
      birth_date: '2008-07-22',
      school: 'EMEF Paulo Freire',
      grade: '9º Ano',
      registration_number: 'PF2024002',
      status: 'ativo',
      modalidade: 'apoio',
      responsavel: {
        nome: 'Carlos Oliveira Costa',
        parentesco: 'pai',
        telefone: '(11) 97654-3210',
        email: 'carlos.costa@email.com'
      },
      necessidades: ['TEA - Transtorno do Espectro Autista', 'Hiperfoco em tecnologia'],
      observacoes: 'Excelente em informática, dificuldades sociais'
    },
    {
      id: 'auto_test_003',
      name: 'Isabella Fernanda Rodrigues',
      birth_date: '2011-11-08',
      school: 'EMEF Cecília Meireles',
      grade: '7º Ano', 
      registration_number: 'CM2024003',
      status: 'ativo',
      modalidade: 'srm',
      responsavel: {
        nome: 'Fernanda Rodrigues Lima',
        parentesco: 'mãe',
        telefone: '(11) 96543-2109',
        email: 'fernanda.lima@email.com'
      },
      necessidades: ['Deficiência Visual', 'Baixa visão'],
      observacoes: 'Usa óculos especiais, precisa de material ampliado'
    },
    {
      id: 'auto_test_004',
      name: 'Miguel Henrique dos Santos',
      birth_date: '2009-05-30',
      school: 'EMEF Machado de Assis',
      grade: '8º Ano',
      registration_number: 'MA2024004',
      status: 'ativo',
      modalidade: 'apoio',
      responsavel: {
        nome: 'Helena dos Santos Pereira',
        parentesco: 'avó',
        telefone: '(11) 95432-1098',
        email: 'helena.pereira@email.com'
      },
      necessidades: ['TDAH', 'Dificuldades de concentração'],
      observacoes: 'Muito ativo, aprende melhor com atividades práticas'
    },
    {
      id: 'auto_test_005',
      name: 'Sofia Vitória Almeida Souza',
      birth_date: '2012-01-12',
      school: 'EMEF Tarsila do Amaral',
      grade: '6º Ano',
      registration_number: 'TA2024005',
      status: 'ativo',
      modalidade: 'srm',
      responsavel: {
        nome: 'Roberto Almeida Souza',
        parentesco: 'pai',
        telefone: '(11) 94321-0987',
        email: 'roberto.souza@email.com'
      },
      necessidades: ['Síndrome de Down', 'Atraso no desenvolvimento'],
      observacoes: 'Muito carinhosa, gosta de música e arte'
    }
  ],

  // Templates de formulários preenchidos
  entrevista_responsavel: {
    'auto_test_001': {
      data_entrevista: '2024-10-01',
      tipo_entrevista: 'primeira',
      motivo_entrevista: 'Encaminhamento da professora regente',
      
      // Dados pessoais
      nome_estudante: 'Ana Clara Silva Santos',
      data_nascimento: '2010-03-15',
      escola: 'EMEF Maria Montessori',
      serie: '8º Ano',
      
      // Responsável
      nome_responsavel: 'Maria Santos Silva',
      parentesco: 'mãe',
      telefone: '(11) 98765-4321',
      profissao_responsavel: 'Auxiliar de enfermagem',
      
      // Histórico escolar
      primeira_escola: 'Creche Municipal Pequenos Passos',
      adaptacao_escolar: 'Boa, mas com dificuldades em matemática',
      problemas_aprendizagem: 'Sim, principalmente em operações matemáticas',
      
      // Desenvolvimento
      gestacao_normal: true,
      parto_normal: true,
      desenvolvimento_motor: 'Normal, caminhou aos 14 meses',
      desenvolvimento_fala: 'Começou a falar aos 2 anos',
      
      // Saúde
      possui_diagnostico: true,
      diagnostico_medico: 'Deficiência Intelectual Leve',
      usa_medicacao: false,
      acompanhamento_medico: 'Neurologista - Dr. Silva',
      
      // Comportamento
      comportamento_casa: 'Tranquila, obediente, gosta de ajudar',
      comportamento_escola: 'Participativa, mas dispersa em matemática',
      brincadeiras_preferidas: 'Desenhar, bonecas, jogos no tablet',
      
      // Observações gerais
      observacoes_familia: 'Família muito presente, busca sempre apoiar o desenvolvimento da Ana Clara',
      expectativas: 'Espera que ela consiga acompanhar melhor as aulas de matemática'
    },
    
    'auto_test_002': {
      data_entrevista: '2024-10-02',
      tipo_entrevista: 'primeira',
      motivo_entrevista: 'Diagnóstico recente de TEA',
      
      nome_estudante: 'João Pedro Oliveira Costa',
      data_nascimento: '2008-07-22',
      escola: 'EMEF Paulo Freire',
      serie: '9º Ano',
      
      nome_responsavel: 'Carlos Oliveira Costa',
      parentesco: 'pai',
      telefone: '(11) 97654-3210',
      profissao_responsavel: 'Analista de sistemas',
      
      primeira_escola: 'Escola particular até o 5º ano',
      adaptacao_escolar: 'Dificuldades sociais, mas excelente academicamente',
      problemas_aprendizagem: 'Não, apenas questões de interação social',
      
      gestacao_normal: true,
      parto_cesarea: true,
      desenvolvimento_motor: 'Normal',
      desenvolvimento_fala: 'Tardia, começou aos 3 anos',
      
      possui_diagnostico: true,
      diagnostico_medico: 'TEA - Transtorno do Espectro Autista (leve)',
      usa_medicacao: false,
      acompanhamento_medico: 'Psiquiatra infantil - Dra. Oliveira',
      
      comportamento_casa: 'Calmo, gosta de rotina, passa horas no computador',
      comportamento_escola: 'Isolado, evita grupos, mas participa quando chamado',
      brincadeiras_preferidas: 'Programação, jogos de lógica, quebra-cabeças',
      
      observacoes_familia: 'Pai também é da área de tecnologia, compreende as particularidades do filho',
      expectativas: 'Desenvolver habilidades sociais mantendo os pontos fortes'
    }
  },

  // Templates para PDI
  pdi_templates: {
    'auto_test_001': {
      data_inicio: '2024-10-01',
      data_fim: '2024-12-01',
      periodo: '4º bimestre 2024',
      
      // Etapa 1 - Identificação
      nome_aluno: 'Ana Clara Silva Santos',
      data_nascimento: '2010-03-15',
      escola: 'EMEF Maria Montessori',
      serie: '8º Ano',
      professor_aee: 'Professora Mariana Costa',
      
      // Etapa 2 - Objetivos
      objetivos_gerais: 'Desenvolver habilidades matemáticas básicas e autoestima acadêmica',
      objetivos_especificos: [
        'Compreender operações de adição e subtração com reagrupamento',
        'Resolver problemas matemáticos simples do cotidiano',
        'Desenvolver estratégias de cálculo mental',
        'Aumentar a confiança em atividades numéricas'
      ],
      
      // Etapa 3 - Estratégias
      estrategias_ensino: [
        'Uso de material concreto (blocos lógicos, ábaco)',
        'Jogos matemáticos digitais adaptados',
        'Resolução de problemas com situações do dia a dia',
        'Trabalho colaborativo com colegas tutores'
      ],
      recursos_necessarios: [
        'Tablet com aplicativos educacionais',
        'Material manipulativo',
        'Jogos pedagógicos',
        'Apostila adaptada com letras ampliadas'
      ],
      
      // Etapa 4 - Avaliação
      criterios_avaliacao: [
        'Participação nas atividades propostas',
        'Progresso na resolução de operações básicas',
        'Autonomia na execução de tarefas',
        'Autoconfiança demonstrada'
      ],
      instrumentos_avaliacao: [
        'Observação diária registrada',
        'Portfólio de atividades realizadas',
        'Auto-avaliação semanal',
        'Avaliação bimestral adaptada'
      ]
    }
  },

  // Templates para Plano de Atendimento
  plano_atendimento_templates: {
    'auto_test_002': {
      data_inicio: '2024-10-01',
      data_fim: '2024-12-15',
      
      // Identificação
      nome_aluno: 'João Pedro Oliveira Costa',
      data_nascimento: '2008-07-22',
      matricula: 'PF2024002',
      escola_origem: 'EMEF Paulo Freire',
      
      // Histórico
      historico_escolar: 'Aluno com excelente desempenho acadêmico, especialmente em exatas e tecnologia. Apresenta dificuldades na interação social e comportamentos repetitivos.',
      diagnostico_atual: 'TEA - Transtorno do Espectro Autista (leve), sem deficiência intelectual',
      medicacoes: 'Não faz uso de medicação',
      
      // Avaliação inicial
      pontos_fortes: [
        'Excelente raciocínio lógico-matemático',
        'Hiperfoco em tecnologia e programação',
        'Boa memória para detalhes',
        'Honestidade e transparência'
      ],
      areas_desenvolvimento: [
        'Habilidades sociais e comunicação',
        'Flexibilidade cognitiva',
        'Regulação emocional',
        'Trabalho em equipe'
      ],
      
      // Objetivos do plano
      objetivo_geral: 'Desenvolver habilidades sociais e de comunicação, mantendo e potencializando as áreas de interesse e competência do aluno',
      objetivos_especificos: [
        'Ampliar repertório de interação social com pares',
        'Desenvolver estratégias de comunicação assertiva',
        'Criar projetos colaborativos usando tecnologia',
        'Estabelecer rotinas de autoregulação emocional'
      ],
      
      // Estratégias
      estrategias_pedagogicas: [
        'Criação de clube de programação na escola',
        'Mentoria de colegas em projets tecnológicos',
        'Uso de aplicativos para desenvolvimento social',
        'Estabelecimento de rotinas visuais'
      ],
      
      // Cronograma
      cronograma_semanal: '2x por semana - terças e quintas, 50 minutos cada',
      local_atendimento: 'Sala de Recursos Multifuncionais e Laboratório de Informática'
    }
  },

  // Dados para atendimentos (para gerar histórico)
  atendimentos_templates: [
    {
      aluno_id: 'auto_test_001',
      data_atendimento: '2024-10-01',
      descricao: 'Avaliação inicial - aplicação de atividades diagnósticas em matemática',
      objetivos: 'Identificar nível atual de conhecimento em operações básicas',
      atividades_realizadas: 'Teste com material concreto, problemas ilustrados, jogos digitais',
      observacoes: 'Demonstrou interesse pelos jogos, dificuldades em subtração com empréstimo',
      evolucao: 'Positiva - engajamento alto, necessita reforço em estratégias de cálculo'
    },
    {
      aluno_id: 'auto_test_001', 
      data_atendimento: '2024-10-08',
      descricao: 'Trabalho com material manipulativo - operações de adição',
      objetivos: 'Consolidar conceitos de adição com reagrupamento',
      atividades_realizadas: 'Ábaco, blocos lógicos, situações-problema do cotidiano',
      observacoes: 'Melhor compreensão com material concreto, mais confiante',
      evolucao: 'Progresso significativo - conseguiu resolver 8 de 10 problemas propostos'
    },
    {
      aluno_id: 'auto_test_002',
      data_atendimento: '2024-10-02', 
      descricao: 'Primeira sessão - estabelecimento de vínculo e rotinas',
      objetivos: 'Conhecer preferências do aluno e estabelecer ambiente confortável',
      atividades_realizadas: 'Conversa sobre interesses, exploração de jogos de programação',
      observacoes: 'Inicialmente tímido, se abriu ao falar sobre programação Python',
      evolucao: 'Boa - demonstrou interesse em compartilhar conhecimentos'
    }
  ]
};

// Função para popular automaticamente um formulário com dados de teste
window.POPULAR_DADOS_TESTE = function(tipoFormulario, alunoId) {
  console.log(`🤖 Populando ${tipoFormulario} para ${alunoId}`);
  
  const aluno = DADOS_TESTE_AUTOMATIZADO.alunos.find(a => a.id === alunoId);
  if (!aluno) {
    console.error('Aluno não encontrado:', alunoId);
    return false;
  }
  
  try {
    switch(tipoFormulario) {
      case 'entrevista':
        return popularEntrevista(alunoId);
      case 'pdi': 
        return popularPDI(alunoId);
      case 'plano_atendimento':
        return popularPlanoAtendimento(alunoId);
      default:
        console.error('Tipo de formulário não reconhecido:', tipoFormulario);
        return false;
    }
  } catch(error) {
    console.error('Erro ao popular formulário:', error);
    return false;
  }
};

// Função auxiliar para popular entrevista
function popularEntrevista(alunoId) {
  const dados = DADOS_TESTE_AUTOMATIZADO.entrevista_responsavel[alunoId];
  if (!dados) return false;
  
  // Popular campos de data usando o DatePicker
  setTimeout(() => {
    const campoData = document.querySelector('input[type="text"][placeholder*="DD/MM/AAAA"]');
    if (campoData) {
      // Simular entrada manual no DatePicker
      const evento = new Event('input', { bubbles: true });
      campoData.value = dados.data_entrevista.split('-').reverse().join('/');
      campoData.dispatchEvent(evento);
    }
  }, 100);
  
  // Popular outros campos
  Object.keys(dados).forEach(campo => {
    if (campo !== 'data_entrevista') {
      const elemento = document.querySelector(`[v-model*="${campo}"], [name="${campo}"], #${campo}`);
      if (elemento) {
        elemento.value = dados[campo];
        elemento.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });
  
  return true;
}

// Função auxiliar para popular PDI
function popularPDI(alunoId) {
  const dados = DADOS_TESTE_AUTOMATIZADO.pdi_templates[alunoId];
  if (!dados) return false;
  
  // Implementação similar à entrevista
  console.log('📋 Populando PDI com dados:', dados);
  return true;
}

// Função auxiliar para popular Plano de Atendimento
function popularPlanoAtendimento(alunoId) {
  const dados = DADOS_TESTE_AUTOMATIZADO.plano_atendimento_templates[alunoId];
  if (!dados) return false;
  
  console.log('📝 Populando Plano de Atendimento com dados:', dados);
  return true;
}

// Função para criar aluno e todos os formulários automaticamente
window.CRIAR_ALUNO_COMPLETO = async function(alunoId) {
  console.log(`🚀 Iniciando criação completa para aluno: ${alunoId}`);
  
  try {
    // 1. Cadastrar aluno
    console.log('1️⃣ Cadastrando aluno...');
    await cadastrarAluno(alunoId);
    
    // 2. Preencher entrevista
    console.log('2️⃣ Preenchendo entrevista...');
    await preencherEntrevista(alunoId);
    
    // 3. Preencher PDI
    console.log('3️⃣ Preenchendo PDI...');
    await preencherPDI(alunoId);
    
    // 4. Preencher Plano de Atendimento
    console.log('4️⃣ Preenchendo Plano de Atendimento...');
    await preencherPlanoAtendimento(alunoId);
    
    // 5. Criar atendimentos
    console.log('5️⃣ Criando atendimentos...');
    await criarAtendimentos(alunoId);
    
    console.log(`✅ Aluno ${alunoId} criado com sucesso!`);
    return true;
    
  } catch(error) {
    console.error(`❌ Erro ao criar aluno ${alunoId}:`, error);
    return false;
  }
};

// Exportar dados para uso global
window.DADOS_TESTE_AUTOMATIZADO = DADOS_TESTE_AUTOMATIZADO;

console.log('🤖 Sistema de dados de teste carregado! Use POPULAR_DADOS_TESTE() ou CRIAR_ALUNO_COMPLETO()');