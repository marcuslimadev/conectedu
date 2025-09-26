-- Schema para os novos formulários AEE - ConectEdu v5.0

-- Tabela para Entrevistas com Responsável
CREATE TABLE IF NOT EXISTS entrevistas_responsavel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data_entrevista DATE,
    tipo_entrevista ENUM('primeira', 'atualizacao', 'outros'),
    motivo_entrevista TEXT,
    
    -- Dados de Identificação
    nome_estudante VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    naturalidade VARCHAR(255),
    nome_escola VARCHAR(255),
    serie_ano VARCHAR(100),
    turno ENUM('matutino', 'vespertino', 'noturno'),
    
    -- Dados dos Pais
    nome_pai VARCHAR(255),
    idade_pai INT,
    escolaridade_pai VARCHAR(255),
    nome_mae VARCHAR(255),
    idade_mae INT,
    escolaridade_mae VARCHAR(255),
    
    -- Endereço e Contato
    endereco TEXT,
    bairro VARCHAR(255),
    cidade VARCHAR(255),
    telefone VARCHAR(50),
    
    -- Informações da Família
    composicao_familia_concepcao TEXT,
    tem_irmaos ENUM('sim', 'nao'),
    quantidade_irmaos INT,
    idades_irmaos TEXT,
    situacao_pais TEXT,
    vida_social_familia TEXT,
    habito_familiar TEXT,
    beneficios_sociais TEXT,
    
    -- Gestação/Nascimento
    gravidez_planejada TEXT,
    experiencia_gestacao TEXT,
    saude_mae_gestacao TEXT,
    estado_emocional_mae TEXT,
    fez_prenatal ENUM('sim', 'nao'),
    mes_inicio_prenatal INT,
    tratamento_necessario ENUM('sim', 'nao'),
    qual_tratamento TEXT,
    tipo_parto ENUM('normal', 'cesariana', 'forceps'),
    nasceu_tempo_normal ENUM('sim', 'nao'),
    observacoes_nascimento TEXT,
    bebe_necessitou_oxigenio BOOLEAN DEFAULT FALSE,
    bebe_teve_convulsao BOOLEAN DEFAULT FALSE,
    bebe_ictericia BOOLEAN DEFAULT FALSE,
    bebe_incubadora BOOLEAN DEFAULT FALSE,
    
    -- Alimentação
    foi_amamentado ENUM('sim', 'nao'),
    amamentado_ate_idade VARCHAR(100),
    problemas_alimentacao TEXT,
    alimentacao_atual TEXT,
    
    -- Saúde
    deficiencia_informada TEXT,
    uso_medicamento TEXT,
    horarios_medicamento TEXT,
    vacinacao_atualizada ENUM('sim', 'nao'),
    doencas_infancia TEXT,
    problemas_saude TEXT,
    medico_responsavel TEXT,
    tratamentos_atuais TEXT,
    apresenta_crises ENUM('sim', 'nao'),
    tem_convulsoes ENUM('sim', 'nao'),
    primeira_convulsao DATE,
    ultimo_episodio DATE,
    frequencia_crises TEXT,
    como_familia_lida_crises TEXT,
    mudancas_pos_convulsoes TEXT,
    
    -- Desenvolvimento Pregresso
    idade_engatinhou VARCHAR(50),
    idade_andou VARCHAR(50),
    idade_falou VARCHAR(50),
    controle_esfincters VARCHAR(100),
    
    -- Desenvolvimento Atual (Comunicação)
    comunicacao_verbal ENUM('sim', 'nao'),
    dificuldade_fala TEXT,
    outro_tipo_comunicacao TEXT,
    como_se_comunica TEXT,
    
    -- Atividades de Vida Diária
    alimenta_independente ENUM('sim', 'nao'),
    usa_banheiro_independente ENUM('sim', 'nao'),
    gerencia_dia_a_dia ENUM('sim', 'nao'),
    sono_qualidade ENUM('dorme_bem', 'agitado', 'contraturno'),
    gosta_brincar ENUM('sim', 'nao'),
    brinquedos_preferencia TEXT,
    curiosidade_sexual ENUM('sim', 'nao'),
    masturbacao ENUM('sim', 'nao'),
    frequencia_masturbacao TEXT,
    orientacao_sexual ENUM('sim', 'nao'),
    como_corrigida TEXT,
    lida_negativa TEXT,
    preferencia_objetos TEXT,
    
    -- Socialização e Preferências
    faz_amigos_facilidade ENUM('sim', 'nao'),
    amigos_vizinhanca ENUM('sim', 'nao'),
    interage_mesma_idade ENUM('sim', 'nao'),
    gosta_passeios_festas ENUM('sim', 'nao'),
    preferencias_diversao TEXT,
    
    -- Comportamento
    comportamento_tipo TEXT,
    habitos_manias TEXT,
    comporta_frustracao TEXT,
    
    -- Vida Escolar
    idade_entrou_escola VARCHAR(50),
    adaptacao_escolar TEXT,
    repetencia TEXT,
    ressente_mudanca_professor ENUM('sim', 'nao'),
    frequencia_escolar TEXT,
    familia_participa_vida_escolar ENUM('sim', 'nao'),
    forma_participacao TEXT,
    quem_ajuda_para_casa TEXT,
    opiniao_atendimento_escola TEXT,
    desenvolvimento_compativel_idade ENUM('sim', 'nao'),
    antecedentes_familiares TEXT,
    frequenta_sala_recursos ENUM('sim', 'nao'),
    frequencia_atendimento_recursos TEXT,
    
    -- Informações Complementares
    informacoes_complementares TEXT,
    nome_entrevistador VARCHAR(255),
    funcao_entrevistador VARCHAR(255),
    nome_responsavel_informacoes VARCHAR(255),
    parentesco_responsavel VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para PDI ConectAEE
CREATE TABLE IF NOT EXISTS pdi_conectaee (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Dados Institucionais
    data_elaboracao DATE,
    sre VARCHAR(255),
    nome_escola VARCHAR(255),
    codigo_escola VARCHAR(100),
    endereco_escola TEXT,
    etapas_educacao_basica TEXT,
    escola_acessibilidade ENUM('sim', 'nao'),
    possui_sala_recursos ENUM('sim', 'nao'),
    nome_escola_encaminhada VARCHAR(255),
    diretor VARCHAR(255),
    vice_diretor VARCHAR(255),
    
    -- Responsáveis pela elaboração
    especialista VARCHAR(255),
    professor_apoio VARCHAR(255),
    guia_interprete VARCHAR(255),
    tils VARCHAR(255),
    professor_sala_recursos VARCHAR(255),
    regentes_turma TEXT,
    
    -- Dados do Estudante
    nome_aluno VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    idade INT,
    responsavel_parentesco VARCHAR(255),
    ano_escolaridade VARCHAR(100),
    deficiencia_informada TEXT,
    acompanhado_profissional ENUM('sim', 'nao'),
    especialidade_profissional VARCHAR(255),
    uso_medicamento ENUM('sim', 'nao'),
    efeitos_colaterais TEXT,
    necessidade_especifica TEXT,
    tipo_atendimento TEXT,
    recurso_acessibilidade TEXT,
    como_gosta_divertir TEXT,
    
    -- Considerações da Família
    consideracoes_familia TEXT,
    
    -- Histórico de Escolarização
    idade_comecou_escola VARCHAR(50),
    percurso_escolar TEXT,
    frequenta_sala_recursos ENUM('sim', 'nao'),
    frequencia_atendimento TEXT,
    frequenta_educacao_integral ENUM('sim', 'nao'),
    
    -- Limites e Agressividade
    autoagressividade BOOLEAN DEFAULT FALSE,
    indisciplina BOOLEAN DEFAULT FALSE,
    heteroagressividade BOOLEAN DEFAULT FALSE,
    desobediencia_regras BOOLEAN DEFAULT FALSE,
    apatia BOOLEAN DEFAULT FALSE,
    observacoes_comportamento TEXT,
    
    -- Aspectos Psicomotores (JSON para flexibilidade)
    aspectos_psicomotores JSON,
    
    -- Aspectos Pedagógicos/Cognitivos (JSON para flexibilidade)
    aspectos_pedagogicos JSON,
    
    -- Habilidades demonstradas
    habilidades_demonstradas TEXT,
    
    -- Comunicação e Linguagem
    intencao_comunicativa ENUM('sim', 'nao'),
    utiliza_comunicacao TEXT,
    recursos_comunicacao_alternativa TEXT,
    expressa_se_por TEXT,
    escrita_nivel TEXT,
    leitura_nivel TEXT,
    
    -- Planejamento Bimestral (JSON para flexibilidade)
    planejamento_bimestral JSON,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela para Planos de Atendimento Individual
CREATE TABLE IF NOT EXISTS planos_atendimento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- Identificação do Aluno e da Equipe
    nome_escola VARCHAR(255),
    nome_aluno VARCHAR(255) NOT NULL,
    data_nascimento DATE,
    idade INT,
    serie_ano VARCHAR(100),
    turno ENUM('matutino', 'vespertino', 'noturno'),
    nome_responsavel VARCHAR(255),
    telefone_contato VARCHAR(50),
    endereco_residencial TEXT,
    diagnostico_cid TEXT,
    professor_regente VARCHAR(255),
    professor_aee VARCHAR(255),
    outros_profissionais TEXT,
    data_elaboracao DATE,
    data_avaliacao_diagnostica DATE,
    periodo_vigencia VARCHAR(100),
    data_prevista_reavaliacao DATE,
    
    -- Histórico do Estudante e Contextualização
    historico_escolar TEXT,
    historico_familiar_social TEXT,
    interesses_preferencias TEXT,
    dificuldades TEXT,
    potencialidades_observadas TEXT,
    
    -- Avaliação Diagnóstica - Habilidades de Comunicação e Linguagem
    oralidade TEXT,
    compreensao TEXT,
    expressao_verbal TEXT,
    clareza_frases_completas ENUM('sim', 'nao'),
    interage_verbalmente ENUM('sim', 'nao'),
    escreve ENUM('sim', 'nao'),
    grafia_legivel ENUM('sim', 'nao'),
    escreve_certo ENUM('sim', 'nao'),
    producao_textos ENUM('sim', 'nao'),
    copia ENUM('sim', 'nao'),
    faz_garatujas ENUM('sim', 'nao'),
    desenha ENUM('sim', 'nao'),
    leitura_nivel TEXT,
    comunicacao_nao_verbal TEXT,
    
    -- Habilidades Cognitivas e Acadêmicas
    raciocinio_logico_matematico TEXT,
    conceitos_academicos TEXT,
    atencao_concentracao TEXT,
    memoria TEXT,
    organizacao_planejamento TEXT,
    
    -- Habilidades Socioemocionais e Comportamentais
    interacao_social TEXT,
    autonomia_independencia TEXT,
    manejo_emocoes TEXT,
    comportamento_sala TEXT,
    
    -- Habilidades Motoras e Perceptivas
    coordenacao_motora_fina TEXT,
    coordenacao_motora_grossa TEXT,
    orientacao_espacial_temporal TEXT,
    percepcao_visual_auditiva TEXT,
    
    -- Definição de Objetivos e Metas
    objetivo_geral TEXT,
    objetivos_especificos TEXT,
    
    -- Estratégias e Recursos Pedagógicos
    adaptacoes_curriculares TEXT,
    recursos_didaticos_tecnologias TEXT,
    estrategias_ensino TEXT,
    adaptacoes_ambiente_escolar TEXT,
    atendimento_aee TEXT,
    envolvimento_familia TEXT,
    articulacao_outros_profissionais TEXT,
    
    -- Avaliação e Acompanhamento
    criterios_avaliacao TEXT,
    periodicidade_reavaliacoes ENUM('mensal', 'bimestral', 'trimestral', 'semestral', 'anual'),
    registro_progresso TEXT,
    
    -- Assinaturas e Consenso
    professor_regente_assinatura VARCHAR(255),
    professor_aee_assinatura VARCHAR(255),
    coordenacao_pedagogica_assinatura VARCHAR(255),
    direcao_escolar_assinatura VARCHAR(255),
    responsavel_aluno_assinatura VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX idx_entrevistas_nome_estudante ON entrevistas_responsavel(nome_estudante);
CREATE INDEX idx_entrevistas_data ON entrevistas_responsavel(data_entrevista);
CREATE INDEX idx_pdi_nome_aluno ON pdi_conectaee(nome_aluno);
CREATE INDEX idx_pdi_data ON pdi_conectaee(data_elaboracao);
CREATE INDEX idx_planos_nome_aluno ON planos_atendimento(nome_aluno);
CREATE INDEX idx_planos_data ON planos_atendimento(data_elaboracao);

