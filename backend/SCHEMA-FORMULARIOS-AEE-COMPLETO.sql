-- =========================================================
-- CONECTEDU - SCHEMA COMPLETO FORMULÁRIOS AEE
-- Versão: 2.0.0 - COM TODOS OS CAMPOS DOS DOCUMENTOS
-- 
-- Contém 100% dos campos de:
-- 1. Entrevista com Responsável
-- 2. PDI (Plano de Desenvolvimento Individual)
-- 3. PAI (Plano de Atendimento Individual)
-- =========================================================

USE conectedu;

-- =========================================================
-- TABELA 1: ENTREVISTA COM RESPONSÁVEL
-- =========================================================

CREATE TABLE IF NOT EXISTS `entrevistas_responsavel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  
  -- CABEÇALHO
  `data_entrevista` date DEFAULT NULL,
  
  -- DADOS DE IDENTIFICAÇÃO
  `nome_estudante` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `naturalidade` varchar(255) DEFAULT NULL,
  `nome_escola` varchar(255) DEFAULT NULL,
  `serie_ano` varchar(100) DEFAULT NULL,
  `turno` enum('matutino','vespertino','noturno') DEFAULT NULL,
  
  -- DADOS DOS PAIS
  `nome_pai` varchar(255) DEFAULT NULL,
  `idade_pai` int(11) DEFAULT NULL,
  `escolaridade_pai` varchar(255) DEFAULT NULL,
  `nome_mae` varchar(255) DEFAULT NULL,
  `idade_mae` int(11) DEFAULT NULL,
  `escolaridade_mae` varchar(255) DEFAULT NULL,
  
  -- ENDEREÇO E CONTATO
  `endereco` text DEFAULT NULL,
  `bairro` varchar(255) DEFAULT NULL,
  `cidade` varchar(255) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  
  -- MOTIVO DA ENTREVISTA
  `motivo_entrevista` enum('primeira','atualizacao','outros') DEFAULT NULL,
  `motivo_outros` text DEFAULT NULL,
  
  -- INFORMAÇÕES DA FAMÍLIA
  `composicao_familia_concepcao` text DEFAULT NULL,
  `tem_irmaos` enum('sim','nao') DEFAULT NULL,
  `quantos_irmaos` int(11) DEFAULT NULL,
  `idades_irmaos` text DEFAULT NULL,
  `pais_casados` enum('sim','nao','separados') DEFAULT NULL,
  `pais_presentes` text DEFAULT NULL,
  `vida_social_familia` longtext DEFAULT NULL,
  `habito_familiar` longtext DEFAULT NULL,
  `beneficios_sociais` text DEFAULT NULL,
  
  -- GESTAÇÃO/NASCIMENTO
  `gravidez_planejada` enum('sim','nao') DEFAULT NULL,
  `gravidez_planejada_relato` text DEFAULT NULL,
  `gestacao_agradavel` enum('sim','nao') DEFAULT NULL,
  `saude_mae_gestacao` text DEFAULT NULL,
  `estado_emocional_mae` text DEFAULT NULL,
  `fez_prenatal` enum('sim','nao') DEFAULT NULL,
  `prenatal_mes_inicio` int(11) DEFAULT NULL,
  `prenatal_tratamento_necessario` enum('sim','nao') DEFAULT NULL,
  `prenatal_qual_tratamento` text DEFAULT NULL,
  `tipo_parto` enum('normal','cesariana','forceps','outros') DEFAULT NULL,
  `nasceu_tempo_normal` enum('sim','nao') DEFAULT NULL,
  `observacoes_nascimento` text DEFAULT NULL,
  `bebe_necessitou_oxigenio` tinyint(1) DEFAULT 0,
  `bebe_teve_convulsao` tinyint(1) DEFAULT 0,
  `bebe_ictericia` tinyint(1) DEFAULT 0,
  `bebe_incubadora` tinyint(1) DEFAULT 0,
  
  -- ALIMENTAÇÃO
  `foi_amamentado` enum('sim','nao') DEFAULT NULL,
  `amamentacao_ate_idade` varchar(100) DEFAULT NULL,
  `problemas_alimentacao` text DEFAULT NULL,
  `alimentacao_atual` text DEFAULT NULL,
  
  -- SAÚDE
  `deficiencia_informada` text DEFAULT NULL,
  `uso_medicamento` enum('sim','nao') DEFAULT NULL,
  `medicamento_nome` varchar(255) DEFAULT NULL,
  `medicamento_horarios` text DEFAULT NULL,
  `vacinacao_atualizada` enum('sim','nao') DEFAULT NULL,
  `vacinacao_relato` text DEFAULT NULL,
  
  -- DOENÇAS E PROBLEMAS
  `doencas_infectocontagiosas` text DEFAULT NULL,
  `teve_convulsoes` tinyint(1) DEFAULT 0,
  `teve_cirurgias` tinyint(1) DEFAULT 0,
  `teve_acidentes` tinyint(1) DEFAULT 0,
  `tem_alergias` tinyint(1) DEFAULT 0,
  `febre_alta_recorrente` tinyint(1) DEFAULT 0,
  `problemas_audicao` tinyint(1) DEFAULT 0,
  `problemas_visao` tinyint(1) DEFAULT 0,
  `algum_tratamento_medico` text DEFAULT NULL,
  `medico_responsavel` varchar(255) DEFAULT NULL,
  `medico_especialidade` varchar(255) DEFAULT NULL,
  
  -- TRATAMENTOS ATUAIS
  `tratamento_atual_profissional` text DEFAULT NULL,
  `tratamento_atual_qual` text DEFAULT NULL,
  
  -- CRISES E CONVULSÕES
  `apresenta_crises_rotineiramente` enum('sim','nao') DEFAULT NULL,
  `tem_convulsoes_atual` enum('sim','nao') DEFAULT NULL,
  `primeira_convulsao_quando` varchar(255) DEFAULT NULL,
  `ultimo_episodio_quando` varchar(255) DEFAULT NULL,
  `frequencia_episodios` varchar(255) DEFAULT NULL,
  `como_familia_lida_episodios` text DEFAULT NULL,
  `mudancas_apos_convulsoes` text DEFAULT NULL,
  
  -- DESENVOLVIMENTO PREGRESSO
  `idade_engatinhou` varchar(100) DEFAULT NULL,
  `idade_andou` varchar(100) DEFAULT NULL,
  `idade_falou` varchar(100) DEFAULT NULL,
  `controle_esfincters` varchar(100) DEFAULT NULL,
  
  -- DESENVOLVIMENTO ATUAL - COMUNICAÇÃO
  `comunicacao_verbal` enum('sim','nao') DEFAULT NULL,
  `dificuldade_fala` text DEFAULT NULL,
  `outra_comunicacao` text DEFAULT NULL,
  `como_se_comunica_filho` text DEFAULT NULL,
  
  -- ATIVIDADES DE VIDA DIÁRIA
  `alimenta_independente` enum('sim','nao') DEFAULT NULL,
  `usa_banheiro_independente` enum('sim','nao') DEFAULT NULL,
  `gerencia_dia_a_dia` enum('sim','nao') DEFAULT NULL,
  `sono_qualidade` enum('dorme_bem','agitado','contraturno') DEFAULT NULL,
  `sono_observacoes` text DEFAULT NULL,
  `gosta_brincar` enum('sim','nao') DEFAULT NULL,
  `brinquedos_preferencia` text DEFAULT NULL,
  
  -- SEXUALIDADE
  `curiosidade_sexual` enum('sim','nao') DEFAULT NULL,
  `se_masturba` enum('sim','nao') DEFAULT NULL,
  `masturbacao_frequencia` varchar(255) DEFAULT NULL,
  `recebe_orientacao_sexual` enum('sim','nao') DEFAULT NULL,
  
  -- DISCIPLINA E CORREÇÃO
  `como_crianca_corrigida` text DEFAULT NULL,
  `correcao_conversa` tinyint(1) DEFAULT 0,
  `correcao_grita` tinyint(1) DEFAULT 0,
  `correcao_castigo` tinyint(1) DEFAULT 0,
  `correcao_bate` tinyint(1) DEFAULT 0,
  `correcao_outro` text DEFAULT NULL,
  
  -- COMPORTAMENTO
  `lida_negativa_desejo` text DEFAULT NULL,
  `tem_hiperfoco` enum('sim','nao') DEFAULT NULL,
  `hiperfoco_descricao` text DEFAULT NULL,
  
  -- SOCIALIZAÇÃO E PREFERÊNCIAS
  `faz_amigos_facilidade` enum('sim','nao') DEFAULT NULL,
  `tem_amigos_vizinhanca` enum('sim','nao') DEFAULT NULL,
  `interage_mesma_idade` enum('sim','nao') DEFAULT NULL,
  `gosta_passeios_festas` enum('sim','nao') DEFAULT NULL,
  `preferencias_diversao` text DEFAULT NULL,
  
  -- COMPORTAMENTO GERAL
  `comportamento_introvertido` tinyint(1) DEFAULT 0,
  `comportamento_afetuoso` tinyint(1) DEFAULT 0,
  `comportamento_obediente` tinyint(1) DEFAULT 0,
  `comportamento_resistente` tinyint(1) DEFAULT 0,
  `comportamento_cooperador` tinyint(1) DEFAULT 0,
  `comportamento_medroso` tinyint(1) DEFAULT 0,
  `comportamento_inseguro` tinyint(1) DEFAULT 0,
  `comportamento_outro` text DEFAULT NULL,
  `tem_habito_mania` enum('sim','nao') DEFAULT NULL,
  `habito_mania_descricao` text DEFAULT NULL,
  `comporta_frustracao` text DEFAULT NULL,
  
  -- VIDA ESCOLAR
  `idade_entrou_escola` varchar(100) DEFAULT NULL,
  `adaptacao_escola` text DEFAULT NULL,
  `teve_repetencia` enum('sim','nao') DEFAULT NULL,
  `repetencia_detalhes` text DEFAULT NULL,
  `ressente_muda_professor` enum('sim','nao') DEFAULT NULL,
  `frequencia_escolar` enum('regular','irregular','falta_muito') DEFAULT NULL,
  `familia_participa_vida_escolar` enum('sim','nao') DEFAULT NULL,
  `familia_participa_como` text DEFAULT NULL,
  `quem_ajuda_para_casa` varchar(255) DEFAULT NULL,
  `opiniao_atendimento_escola` text DEFAULT NULL,
  `desenvolvimento_compativel_idade` enum('sim','nao') DEFAULT NULL,
  `antecedentes_familiares_problemas` text DEFAULT NULL,
  
  -- SALA DE RECURSOS
  `frequenta_sala_recursos` enum('sim','nao') DEFAULT NULL,
  `frequencia_atendimento` varchar(255) DEFAULT NULL,
  
  -- INFORMAÇÕES COMPLEMENTARES
  `informacoes_complementares` longtext DEFAULT NULL,
  
  -- CONTROLE
  `nome_entrevistador` varchar(255) DEFAULT NULL,
  `funcao_entrevistador` varchar(255) DEFAULT NULL,
  `nome_responsavel_entrevistado` varchar(255) DEFAULT NULL,
  `parentesco_responsavel` varchar(255) DEFAULT NULL,
  
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABELA 2: PDI - PLANO DE DESENVOLVIMENTO INDIVIDUAL
-- =========================================================

CREATE TABLE IF NOT EXISTS `pdis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  
  -- I. DADOS INSTITUCIONAIS
  `data_elaboracao` date DEFAULT NULL,
  `sre` varchar(255) DEFAULT NULL,
  `nome_escola` varchar(255) DEFAULT NULL,
  `codigo_escola` varchar(100) DEFAULT NULL,
  `endereco_escola` text DEFAULT NULL,
  `etapa_ef_anos_iniciais` tinyint(1) DEFAULT 0,
  `etapa_ef_anos_finais` tinyint(1) DEFAULT 0,
  `etapa_ensino_medio` tinyint(1) DEFAULT 0,
  `escola_acessibilidade_fisica` enum('sim','nao') DEFAULT NULL,
  `possui_sala_recursos` enum('sim','nao') DEFAULT NULL,
  `nome_escola_sala_recursos` varchar(255) DEFAULT NULL,
  `diretor` varchar(255) DEFAULT NULL,
  `vice_diretor` varchar(255) DEFAULT NULL,
  
  -- RESPONSÁVEIS PELA ELABORAÇÃO
  `especialista_nome` varchar(255) DEFAULT NULL,
  `especialista_cargo` varchar(100) DEFAULT NULL,
  `especialista_masp` varchar(50) DEFAULT NULL,
  `prof_apoio_nome` varchar(255) DEFAULT NULL,
  `prof_apoio_cargo` varchar(100) DEFAULT NULL,
  `prof_apoio_masp` varchar(50) DEFAULT NULL,
  `guia_interprete_nome` varchar(255) DEFAULT NULL,
  `guia_interprete_cargo` varchar(100) DEFAULT NULL,
  `guia_interprete_masp` varchar(50) DEFAULT NULL,
  `tils_nome` varchar(255) DEFAULT NULL,
  `tils_cargo` varchar(100) DEFAULT NULL,
  `tils_masp` varchar(50) DEFAULT NULL,
  `prof_sala_recursos_nome` varchar(255) DEFAULT NULL,
  `prof_sala_recursos_cargo` varchar(100) DEFAULT NULL,
  `prof_sala_recursos_masp` varchar(50) DEFAULT NULL,
  `regentes_nomes` text DEFAULT NULL,
  
  -- II. DADOS DO ESTUDANTE
  `nome_estudante` varchar(255) DEFAULT NULL,
  `data_nascimento_estudante` date DEFAULT NULL,
  `idade_estudante` int(11) DEFAULT NULL,
  `responsavel_nome` varchar(255) DEFAULT NULL,
  `responsavel_parentesco` varchar(100) DEFAULT NULL,
  `ano_escolaridade` varchar(100) DEFAULT NULL,
  `deficiencia_informada` text DEFAULT NULL,
  `acompanhado_profissional_externo` enum('sim','nao') DEFAULT NULL,
  `profissional_especialidade` varchar(255) DEFAULT NULL,
  `uso_medicamento_continuo` enum('sim','nao') DEFAULT NULL,
  `medicamento_efeitos_colaterais` enum('sim','nao') DEFAULT NULL,
  `medicamento_quais_efeitos` text DEFAULT NULL,
  `necessidades_especificas` text DEFAULT NULL,
  
  -- TIPO DE ATENDIMENTO
  `atend_guia_interprete` tinyint(1) DEFAULT 0,
  `atend_prof_libras` tinyint(1) DEFAULT 0,
  `atend_interprete_libras` tinyint(1) DEFAULT 0,
  `atend_sala_recursos` tinyint(1) DEFAULT 0,
  `atend_prof_apoio_aclta` tinyint(1) DEFAULT 0,
  `atend_outro` varchar(255) DEFAULT NULL,
  
  `utiliza_recurso_acessibilidade` enum('sim','nao') DEFAULT NULL,
  `recurso_acessibilidade_descricao` text DEFAULT NULL,
  `como_gosta_divertir` text DEFAULT NULL,
  
  -- III. CONSIDERAÇÕES DA FAMÍLIA
  `consideracoes_familia` longtext DEFAULT NULL,
  
  -- IV. HISTÓRICO DE ESCOLARIZAÇÃO
  `idade_comecou_escola` varchar(100) DEFAULT NULL,
  `percurso_escolar` longtext DEFAULT NULL,
  `frequenta_sala_recursos` enum('sim','nao') DEFAULT NULL,
  `frequencia_atendimento_sr` varchar(255) DEFAULT NULL,
  `frequenta_educacao_integral` enum('sim','nao') DEFAULT NULL,
  
  -- V. LIMITES E AGRESSIVIDADE
  `apresenta_autoagressividade` tinyint(1) DEFAULT 0,
  `apresenta_indisciplina` tinyint(1) DEFAULT 0,
  `apresenta_heteroagressividade` tinyint(1) DEFAULT 0,
  `apresenta_desobediencia_regras` tinyint(1) DEFAULT 0,
  `apresenta_apatia` tinyint(1) DEFAULT 0,
  `limites_agressividade_obs` text DEFAULT NULL,
  
  -- VI. ASPECTOS PSICOMOTORES
  `psicomotor_esquema_corporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_consciencia_corporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_expressao_corporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_imagem_corporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_tonus_hipertonico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_tonus_hipotonico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_coordenacao_ampla` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_coordenacao_fina` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_equilibrio_dinamico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_equilibrio_estatico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_lateralidade` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_percepcao_gustativa` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_percepcao_olfativa` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_percepcao_tatil` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_percepcao_visual` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `psicomotor_postura` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  
  -- VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS
  `cognitivo_memoria_curto_prazo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_memoria_longo_prazo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_memoria_auditiva` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_memoria_visual` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_auditiva` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_corporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_espacial` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_tatil` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_temporal` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_percepcao_visual` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_atencao_alerta` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_atencao_alternada` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_atencao_seletiva` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_atencao_sustentada` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_raciocinio_abdutivo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_raciocinio_dedutivo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_raciocinio_intuitivo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_analitico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_criativo` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_critico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_sintese` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_questionador` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_pensamento_sistemico` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_compreende_ordens_simples` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_compreende_ordens_complexas` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  `cognitivo_relata_situacoes_vividas` enum('apresenta','apresenta_com_ajuda','nao_apresenta','nao_observado') DEFAULT NULL,
  
  `habilidades_demonstradas` longtext DEFAULT NULL,
  
  -- VIII. COMUNICAÇÃO E LINGUAGEM
  `intencao_comunicativa` enum('sim','nao') DEFAULT NULL,
  
  `comunica_comentarios` tinyint(1) DEFAULT 0,
  `comunica_solicitacoes` tinyint(1) DEFAULT 0,
  `comunica_necessidades_basicas` tinyint(1) DEFAULT 0,
  `comunica_obter_atencao` tinyint(1) DEFAULT 0,
  `comunica_realizar_escolhas` tinyint(1) DEFAULT 0,
  `comunica_pequenas_narrativas` tinyint(1) DEFAULT 0,
  
  `recurso_alfabeto_movel` tinyint(1) DEFAULT 0,
  `recurso_alta_tecnologia` tinyint(1) DEFAULT 0,
  `recurso_baixa_tecnologia` tinyint(1) DEFAULT 0,
  `recurso_figuras_avulsas` tinyint(1) DEFAULT 0,
  `recurso_fotos` tinyint(1) DEFAULT 0,
  `recurso_numerais` tinyint(1) DEFAULT 0,
  `recurso_nao_usa` tinyint(1) DEFAULT 0,
  `recurso_pictograma` tinyint(1) DEFAULT 0,
  `recurso_prancha_comunicacao` tinyint(1) DEFAULT 0,
  `recurso_prancha_tematica` tinyint(1) DEFAULT 0,
  
  `expressa_gestos_caseiros` tinyint(1) DEFAULT 0,
  `expressa_libras` tinyint(1) DEFAULT 0,
  `expressa_palavras` tinyint(1) DEFAULT 0,
  `expressa_sons` tinyint(1) DEFAULT 0,
  `expressa_timidez` tinyint(1) DEFAULT 0,
  `expressa_descreve_gravuras` tinyint(1) DEFAULT 0,
  `expressa_ecolalia` tinyint(1) DEFAULT 0,
  `expressa_clareza` tinyint(1) DEFAULT 0,
  `expressa_muito_rapido` tinyint(1) DEFAULT 0,
  `expressa_som_final_palavras` tinyint(1) DEFAULT 0,
  `expressa_frases_completas` tinyint(1) DEFAULT 0,
  `expressa_frases_curtas` tinyint(1) DEFAULT 0,
  `expressa_gagueira` tinyint(1) DEFAULT 0,
  `expressa_lentidao_fala` tinyint(1) DEFAULT 0,
  `expressa_nomeia_objetos` tinyint(1) DEFAULT 0,
  `expressa_omite_fonemas` tinyint(1) DEFAULT 0,
  `expressa_troca_fonemas` tinyint(1) DEFAULT 0,
  `expressa_distorce_fonemas` tinyint(1) DEFAULT 0,
  `expressa_conversa_espontanea` tinyint(1) DEFAULT 0,
  `expressa_reconta_historias` tinyint(1) DEFAULT 0,
  `expressa_repete_fala_adultos` tinyint(1) DEFAULT 0,
  `expressa_entende_proposto` tinyint(1) DEFAULT 0,
  `expressa_tom_voz_baixo` tinyint(1) DEFAULT 0,
  `expressa_tom_voz_alto` tinyint(1) DEFAULT 0,
  
  `escrita_garatujas` tinyint(1) DEFAULT 0,
  `escrita_pre_silabica` tinyint(1) DEFAULT 0,
  `escrita_silabica` tinyint(1) DEFAULT 0,
  `escrita_silabica_alfabetica` tinyint(1) DEFAULT 0,
  `escrita_alfabetica` tinyint(1) DEFAULT 0,
  `escrita_diferencia_desenho_escrita_numeros` tinyint(1) DEFAULT 0,
  `escrita_identifica_rotulos` tinyint(1) DEFAULT 0,
  `escrita_conhece_algumas_letras` tinyint(1) DEFAULT 0,
  `escrita_conhece_todas_letras` tinyint(1) DEFAULT 0,
  `escrita_identifica_letras_iguais` tinyint(1) DEFAULT 0,
  `escrita_reconhece_letra_inicial_nome` tinyint(1) DEFAULT 0,
  `escrita_reconhece_nome_em_frases` tinyint(1) DEFAULT 0,
  `escrita_reconhece_nome_pais_colegas` tinyint(1) DEFAULT 0,
  `escrita_escreve_nome_familiares_amigos` tinyint(1) DEFAULT 0,
  `escrita_relaciona_parte_nomes` tinyint(1) DEFAULT 0,
  `escrita_procura_formar_palavras_ler` tinyint(1) DEFAULT 0,
  `escrita_escreve_frases` tinyint(1) DEFAULT 0,
  `escrita_escreve_textos` tinyint(1) DEFAULT 0,
  `escrita_letra_cursiva` tinyint(1) DEFAULT 0,
  `escrita_letra_impressa` tinyint(1) DEFAULT 0,
  `escrita_letra_legivel` tinyint(1) DEFAULT 0,
  `escrita_relaciona_letras_varios_tipos` tinyint(1) DEFAULT 0,
  `escrita_tenta_atribuir_sentido_pistas` tinyint(1) DEFAULT 0,
  `escrita_com_apoio_adaptacao` tinyint(1) DEFAULT 0,
  `escrita_recusa_dizendo_nao_sabe` tinyint(1) DEFAULT 0,
  
  `leitura_palavras` tinyint(1) DEFAULT 0,
  `leitura_frases` tinyint(1) DEFAULT 0,
  `leitura_textos` tinyint(1) DEFAULT 0,
  `leitura_global_compreensao` tinyint(1) DEFAULT 0,
  `leitura_fonetica_silabada` tinyint(1) DEFAULT 0,
  `leitura_imita_texto_conhecido` tinyint(1) DEFAULT 0,
  `leitura_nao_le` tinyint(1) DEFAULT 0,
  
  -- IX. PLANEJAMENTO BIMESTRAL (JSON para flexibilidade)
  `planejamento_bimestral` longtext DEFAULT NULL COMMENT 'JSON com planejamento de todas as disciplinas',
  
  -- X. AVALIAÇÃO BIMESTRAL (JSON para flexibilidade)
  `avaliacoes_bimestrais` longtext DEFAULT NULL COMMENT 'JSON com avaliações de todos os bimestres',
  
  -- XI. RELATÓRIO PEDAGÓGICO SEMESTRAL
  `relatorio_semestre_1` longtext DEFAULT NULL,
  `relatorio_semestre_2` longtext DEFAULT NULL,
  
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- TABELA 3: PAI - PLANO DE ATENDIMENTO INDIVIDUAL
-- =========================================================

CREATE TABLE IF NOT EXISTS `pais` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  
  -- 1. IDENTIFICAÇÃO DO ALUNO E DA EQUIPE
  `nome_escola` varchar(255) DEFAULT NULL,
  `nome_estudante` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `idade` int(11) DEFAULT NULL,
  `serie_ano` varchar(100) DEFAULT NULL,
  `turno` enum('matutino','vespertino','noturno') DEFAULT NULL,
  `nome_responsavel` varchar(255) DEFAULT NULL,
  `telefone_contato` varchar(50) DEFAULT NULL,
  `endereco_residencial` text DEFAULT NULL,
  `diagnostico_caracterizacao` text DEFAULT NULL,
  `cid` varchar(100) DEFAULT NULL,
  `professor_regente` varchar(255) DEFAULT NULL,
  `professor_aee` varchar(255) DEFAULT NULL,
  `outros_profissionais` longtext DEFAULT NULL,
  
  `data_elaboracao_pai` date DEFAULT NULL,
  `data_avaliacao_diagnostica` date DEFAULT NULL,
  `periodo_vigencia_pai` varchar(255) DEFAULT NULL,
  `data_prevista_reavaliacao` date DEFAULT NULL,
  
  -- 2. HISTÓRICO DO ESTUDANTE E CONTEXTUALIZAÇÃO
  `historico_escolar` longtext DEFAULT NULL,
  `historico_familiar_social` longtext DEFAULT NULL,
  `interesses_preferencias` longtext DEFAULT NULL,
  `dificuldades` longtext DEFAULT NULL,
  `potencialidades_observadas` longtext DEFAULT NULL,
  
  -- 3. AVALIAÇÃO DIAGNÓSTICA E LEVANTAMENTO DE NECESSIDADES
  
  -- I. Habilidades de Comunicação e Linguagem
  `oralidade` text DEFAULT NULL,
  `compreensao` text DEFAULT NULL,
  `expressao_verbal` text DEFAULT NULL,
  `clareza` text DEFAULT NULL,
  `usa_frases_completas` enum('sim','nao') DEFAULT NULL,
  `interage_verbalmente` enum('sim','nao') DEFAULT NULL,
  
  `escreve` enum('sim','nao') DEFAULT NULL,
  `grafia_legivel` enum('sim','nao') DEFAULT NULL,
  `escreve_certo` enum('sim','nao') DEFAULT NULL,
  `producao_textos` enum('sim','nao') DEFAULT NULL,
  `desenha` enum('sim','nao') DEFAULT NULL,
  `copia` enum('sim','nao') DEFAULT NULL,
  `faz_garatujas` enum('sim','nao') DEFAULT NULL,
  
  `leitura` text DEFAULT NULL,
  `comunicacao_nao_verbal` text DEFAULT NULL,
  
  -- II. Habilidades Cognitivas e Acadêmicas
  `raciocinio_logico_matematico` text DEFAULT NULL,
  `conceitos_academicos` text DEFAULT NULL,
  `atencao_concentracao` text DEFAULT NULL,
  `memoria` text DEFAULT NULL,
  `organizacao_planejamento` text DEFAULT NULL,
  
  -- III. Habilidades Socioemocionais e Comportamentais
  `interacao_social` text DEFAULT NULL,
  `autonomia_independencia` text DEFAULT NULL,
  `manejo_emocoes` text DEFAULT NULL,
  `comportamento_sala` text DEFAULT NULL,
  
  -- IV. Habilidades Motoras e Perceptivas
  `coordenacao_motora_fina` text DEFAULT NULL,
  `coordenacao_motora_grossa` text DEFAULT NULL,
  `orientacao_espacial_temporal` text DEFAULT NULL,
  `percepcao_visual_auditiva` text DEFAULT NULL,
  
  -- 4. DEFINIÇÃO DE OBJETIVOS E METAS
  `objetivo_geral_pai` longtext DEFAULT NULL,
  `objetivos_especificos` longtext DEFAULT NULL COMMENT 'JSON com objetivos por área',
  
  -- 5. ESTRATÉGIAS E RECURSOS PEDAGÓGICOS
  `adaptacoes_curriculares` longtext DEFAULT NULL,
  `recursos_didaticos_tecnologias` text DEFAULT NULL,
  `estrategias_ensino` longtext DEFAULT NULL,
  `adaptacoes_ambiente_escolar` text DEFAULT NULL,
  `atendimento_aee_detalhes` text DEFAULT NULL,
  `envolvimento_familia` text DEFAULT NULL,
  `articulacao_outros_profissionais` text DEFAULT NULL,
  
  -- 6. AVALIAÇÃO E ACOMPANHAMENTO
  `criterios_avaliacao` longtext DEFAULT NULL,
  `periodicidade_reavaliacoes` varchar(255) DEFAULT NULL,
  `registro_progresso` text DEFAULT NULL,
  
  -- 7. ASSINATURAS E CONSENSO
  `assinatura_prof_regente` varchar(255) DEFAULT NULL,
  `assinatura_prof_aee` varchar(255) DEFAULT NULL,
  `assinatura_coordenacao` varchar(255) DEFAULT NULL,
  `assinatura_direcao` varchar(255) DEFAULT NULL,
  `assinatura_responsavel_aluno` varchar(255) DEFAULT NULL,
  
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  KEY `idx_student_id` (`student_id`),
  KEY `idx_teacher_id` (`teacher_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =========================================================
-- REGISTRAR MIGRATION
-- =========================================================

INSERT IGNORE INTO `migrations` (`migration_name`, `executed_at`) VALUES
('formularios_aee_completos_v2', NOW());

-- =========================================================
-- VERIFICAÇÃO
-- =========================================================

SELECT '✅ FORMULÁRIOS AEE COMPLETOS CRIADOS!' AS status;

SHOW TABLES LIKE '%entrevistas%';
SHOW TABLES LIKE '%pdi%';
SHOW TABLES LIKE '%pai%';
