-- Atualização da tabela pdi_conectaee para suportar o modelo oficial completo do PDI
-- Este script adiciona os campos faltantes e mantém os existentes

-- Adicionar campos de referência e controle
ALTER TABLE pdi_conectaee 
ADD COLUMN IF NOT EXISTS student_id INT NULL AFTER id,
ADD COLUMN IF NOT EXISTS teacher_id INT NULL AFTER student_id,
ADD COLUMN IF NOT EXISTS created_by_teacher_id INT NULL AFTER teacher_id;

-- Adicionar índices para performance
ALTER TABLE pdi_conectaee
ADD INDEX IF NOT EXISTS idx_student_id (student_id),
ADD INDEX IF NOT EXISTS idx_teacher_id (teacher_id),
ADD INDEX IF NOT EXISTS idx_created_by_teacher_id (created_by_teacher_id);

-- I. DADOS INSTITUCIONAIS
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS data_elaboracao DATE NULL AFTER created_by_teacher_id,
ADD COLUMN IF NOT EXISTS sre VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS nome_escola VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS codigo_escola VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS endereco_escola TEXT NULL,
ADD COLUMN IF NOT EXISTS etapas_educacao_basica TEXT NULL,
ADD COLUMN IF NOT EXISTS escola_acessibilidade ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS possui_sala_recursos ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS nome_escola_encaminhada VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS diretor VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS vice_diretor VARCHAR(255) NULL;

-- Responsáveis pela elaboração
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS especialista VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS professor_apoio VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS guia_interprete VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS tils VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS professor_sala_recursos VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS regentes_turma TEXT NULL;

-- II. DADOS DO ESTUDANTE (complementar)
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS idade INT NULL,
ADD COLUMN IF NOT EXISTS responsavel_parentesco VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS ano_escolaridade VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS deficiencia_informada TEXT NULL,
ADD COLUMN IF NOT EXISTS acompanhado_profissional ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS especialidade_profissional VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS uso_medicamento ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS efeitos_colaterais TEXT NULL,
ADD COLUMN IF NOT EXISTS necessidade_especifica TEXT NULL,
ADD COLUMN IF NOT EXISTS tipo_atendimento TEXT NULL,
ADD COLUMN IF NOT EXISTS recurso_acessibilidade TEXT NULL,
ADD COLUMN IF NOT EXISTS como_gosta_divertir TEXT NULL;

-- III. CONSIDERAÇÕES DA FAMÍLIA
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS consideracoes_familia TEXT NULL;

-- IV. HISTÓRICO DE ESCOLARIZAÇÃO
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS idade_comecou_escola VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS percurso_escolar TEXT NULL,
ADD COLUMN IF NOT EXISTS frequenta_sala_recursos ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS frequencia_atendimento TEXT NULL,
ADD COLUMN IF NOT EXISTS frequenta_educacao_integral ENUM('sim', 'nao') NULL;

-- V. LIMITES E AGRESSIVIDADE
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS autoagressividade BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS indisciplina BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS heteroagressividade BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS desobediencia_regras BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS apatia BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS observacoes_comportamento TEXT NULL;

-- VI. ASPECTOS PSICOMOTORES (JSON para flexibilidade)
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS aspectos_psicomotores JSON NULL;

-- VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS (JSON)
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS aspectos_pedagogicos JSON NULL;

-- Habilidades demonstradas (complemento seções VI e VII)
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS habilidades_demonstradas TEXT NULL;

-- VIII. COMUNICAÇÃO E LINGUAGEM
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS intencao_comunicativa ENUM('sim', 'nao') NULL,
ADD COLUMN IF NOT EXISTS utiliza_comunicacao TEXT NULL,
ADD COLUMN IF NOT EXISTS recursos_comunicacao_alternativa TEXT NULL,
ADD COLUMN IF NOT EXISTS expressa_se_por TEXT NULL,
ADD COLUMN IF NOT EXISTS escrita_nivel TEXT NULL,
ADD COLUMN IF NOT EXISTS leitura_nivel TEXT NULL;

-- IX. PLANEJAMENTO BIMESTRAL (JSON para estrutura complexa)
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS planejamento_bimestral JSON NULL;

-- X. RELATÓRIO SEMESTRAL
ALTER TABLE pdi_conectaee
ADD COLUMN IF NOT EXISTS relatorio_semestral TEXT NULL;

-- Atualizar campos existentes para alinhar com novos
UPDATE pdi_conectaee 
SET nome_escola = escola 
WHERE nome_escola IS NULL AND escola IS NOT NULL;

UPDATE pdi_conectaee
SET ano_escolaridade = ano_serie
WHERE ano_escolaridade IS NULL AND ano_serie IS NOT NULL;

UPDATE pdi_conectaee
SET deficiencia_informada = diagnostico
WHERE deficiencia_informada IS NULL AND diagnostico IS NOT NULL;

-- Comentário: Os campos antigos (escola, ano_serie, diagnostico, etc) são mantidos para compatibilidade
-- mas recomenda-se usar os novos campos alinhados com o modelo oficial
