-- Inserindo legislações fundamentais da Educação Inclusiva e AEE
-- Estas legislações devem ser inseridas apenas uma vez pelo administrador

INSERT INTO `legislacoes` (`titulo`, `descricao`, `arquivo_pdf`, `nome_original`, `tamanho_arquivo`, `created_at`) VALUES
('Lei Brasileira de Inclusão (LBI) - Lei 13.146/2015', 
 'Estatuto da Pessoa com Deficiência. Assegura e promove condições de igualdade, o exercício dos direitos e das liberdades fundamentais da pessoa com deficiência, visando à sua inclusão social e cidadania.',
 'lbi_2015.pdf',
 'Lei 13.146-2015 LBI.pdf',
 256000,
 NOW()),

('Decreto 10.502/2020 - Política Nacional de Educação Especial', 
 'Institui a Política Nacional de Educação Especial: Equitativa, Inclusiva e com Aprendizado ao Longo da Vida, que orienta os sistemas de ensino para garantir o acesso, a participação, a permanência e o sucesso escolar dos estudantes público-alvo da educação especial.',
 'decreto_10502_2020.pdf',
 'Decreto 10.502-2020 Educação Especial.pdf',
 185000,
 NOW()),

('Resolução CNE/CEB n° 4/2009 - Diretrizes Operacionais AEE', 
 'Institui Diretrizes Operacionais para o Atendimento Educacional Especializado na Educação Básica, modalidade Educação Especial. Define o público-alvo do AEE, as funções do professor especializado e a organização do atendimento.',
 'resolucao_4_2009.pdf',
 'Resolução CNE-CEB 04-2009 AEE.pdf',
 142000,
 NOW()),

('Lei 12.764/2012 - Lei Berenice Piana', 
 'Institui a Política Nacional de Proteção dos Direitos da Pessoa com Transtorno do Espectro Autista. Equipara a pessoa com autismo à pessoa com deficiência para todos os efeitos legais.',
 'lei_12764_2012.pdf',
 'Lei 12.764-2012 Autismo.pdf',
 95000,
 NOW()),

('Nota Técnica 04/2014 MEC/SECADI/DPEE - AEE', 
 'Orientação quanto a documentos comprobatórios de alunos com deficiência, transtornos globais do desenvolvimento e altas habilidades/superdotação no Censo Escolar.',
 'nota_tecnica_04_2014.pdf',
 'Nota Técnica 04-2014 AEE.pdf',
 78000,
 NOW()),

('Lei 14.254/2021 - Dislexia e TDAH', 
 'Dispõe sobre o acompanhamento integral para educandos com dislexia ou Transtorno do Déficit de Atenção com Hiperatividade (TDAH) ou outro transtorno de aprendizagem.',
 'lei_14254_2021.pdf',
 'Lei 14.254-2021 Dislexia TDAH.pdf',
 120000,
 NOW()),

('Decreto 6.571/2008 - AEE na Educação Básica', 
 'Dispõe sobre o atendimento educacional especializado, regulamenta o parágrafo único do art. 60 da Lei no 9.394, de 20 de dezembro de 1996, e acrescenta dispositivo ao Decreto no 6.253, de 13 de novembro de 2007.',
 'decreto_6571_2008.pdf',
 'Decreto 6.571-2008 AEE.pdf',
 89000,
 NOW()),

('Convenção Internacional sobre os Direitos das Pessoas com Deficiência - ONU', 
 'Convenção da ONU ratificada pelo Brasil em 2008. Estabelece os direitos das pessoas com deficiência e os princípios da não discriminação, participação plena e igualdade de oportunidades.',
 'convencao_onu_deficiencia.pdf',
 'Convenção ONU Direitos PcD.pdf',
 342000,
 NOW()),

('Parecer CNE/CEB 13/2009 - Diretrizes Operacionais AEE', 
 'Parecer que fundamenta as Diretrizes Operacionais para o Atendimento Educacional Especializado na Educação Básica, explicando conceitos, princípios e organização do AEE.',
 'parecer_13_2009.pdf',
 'Parecer CNE-CEB 13-2009 AEE.pdf',
 298000,
 NOW()),

('Lei 13.005/2014 - Plano Nacional de Educação (PNE)', 
 'Meta 4 do PNE: universalizar, para a população de 4 a 17 anos com deficiência, transtornos globais do desenvolvimento e altas habilidades ou superdotação, o acesso à educação básica e ao atendimento educacional especializado.',
 'pne_2014_meta4.pdf',
 'PNE 2014 Meta 4 Educação Especial.pdf',
 167000,
 NOW());