-- Migration: Garantir relacionamento 1:1 entre aluno e formulários AEE
-- Data: 2025-11-03
-- Objetivo: Apenas 1 entrevista/PDI/PAI por aluno (editável)
-- Versionamento via tabela documentos_gerados

-- 1. Remover duplicatas existentes (manter a mais recente de cada aluno)
-- ENTREVISTAS
DELETE e1 FROM entrevista_forms e1
INNER JOIN entrevista_forms e2 
WHERE e1.student_id = e2.student_id 
  AND e1.created_at < e2.created_at;

-- PDIs
DELETE p1 FROM pdi_forms p1
INNER JOIN pdi_forms p2 
WHERE p1.student_id = p2.student_id 
  AND p1.created_at < p2.created_at;

-- PAIs
DELETE pa1 FROM plano_atendimento_forms pa1
INNER JOIN plano_atendimento_forms pa2 
WHERE pa1.student_id = pa2.student_id 
  AND pa1.created_at < pa2.created_at;

-- 2. Adicionar constraints UNIQUE para garantir 1:1
ALTER TABLE entrevista_forms 
ADD UNIQUE KEY unique_student_entrevista (student_id);

ALTER TABLE pdi_forms 
ADD UNIQUE KEY unique_student_pdi (student_id);

ALTER TABLE plano_atendimento_forms 
ADD UNIQUE KEY unique_student_pai (student_id);

-- 3. Documentação da lógica:
-- - Professor pode editar formulário a qualquer momento (UPDATE)
-- - Cada geração de PDF cria registro em documentos_gerados com snapshot
-- - Histórico de versões fica nos PDFs gerados, não nos formulários
