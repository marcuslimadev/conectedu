# 🚨 FORMULÁRIO PAI - ATUALIZAÇÃO NECESSÁRIA

## Status Atual
O formulário do Plano de Atendimento Individual (PAI) implementado possui **APENAS 25%** dos campos necessários conforme o documento oficial.

## Campos por Seção

### ✅ SEÇÃO 1: Identificação do Aluno e da Equipe
**Documento Original:**
1. Nome da Escola
2. Nome do Estudante
3. Data de Nascimento
4. Idade
5. Série/Ano
6. Turno
7. Nome do Responsável
8. Tel. para contato
9. Endereço Residencial do Estudante
10. Diagnóstico/Caracterização (PAEE) + CID
11. Professor(a) Regente
12. Professor(a) do AEE
13. Outros Profissionais Envolvidos
14. Data de Elaboração do PAI
15. Data da avaliação Diagnóstica
16. Período de Vigência do PAI
17. Data Prevista para Reavaliação

**Formulário Atual:** ❌ TEM: student_id, matricula | FALTA: 15 campos

---

### ✅ SEÇÃO 2: Histórico do Estudante e Contextualização
**Documento Original:**
1. Histórico Escolar
2. Histórico Familiar e Social
3. Interesses e Preferências do Estudante
4. Dificuldades
5. Potencialidades Observadas

**Formulário Atual:** ❌ **SEÇÃO INTEIRA FALTANDO** (0/5 campos)

---

### ✅ SEÇÃO 3: Avaliação Diagnóstica e Levantamento de Necessidades

#### I. Habilidades de Comunicação e Linguagem (15 campos):
1. Oralidade (textarea)
2. Compreensão (textarea)
3. Expressão verbal (textarea)
4. Clareza (text)
5. Usa frases completas? (text)
6. Interage verbalmente? (text)
7. Escreve (checkbox Sim/Não)
8. Grafia é legível (checkbox Sim/Não)
9. Escreve certo (checkbox Sim/Não)
10. Produção de textos (checkbox Sim/Não)
11. Desenha? (checkbox Sim/Não)
12. Copia? (checkbox Sim/Não)
13. Faz garatujas (checkbox Sim/Não)
14. Leitura (textarea)
15. Comunicação Não-Verbal/Alternativa (textarea)

#### II. Habilidades Cognitivas e Acadêmicas (5 campos):
1. Raciocínio Lógico-Matemático
2. Conceitos Acadêmicos
3. Atenção e Concentração
4. Memória
5. Organização e Planejamento

#### III. Habilidades Socioemocionais e Comportamentais (4 campos):
1. Interação Social
2. Autonomia e Independência
3. Manejo de Emoções
4. Comportamento em Sala

#### IV. Habilidades Motoras e Perceptivas (4 campos):
1. Coordenação Motora Fina
2. Coordenação Motora Grossa
3. Orientação Espacial e Temporal
4. Percepção Visual e Auditiva

**Formulário Atual:** ❌ **SEÇÃO INTEIRA FALTANDO** (0/28 campos)

---

### ✅ SEÇÃO 4: Definição de Objetivos e Metas
**Documento Original:**
1. Objetivo Geral do PAI (textarea grande)
2. Objetivos Específicos por Área:
   - Área: Comunicação (objetivo + meta)
   - Área: Acadêmica – Leitura (objetivo + meta)
   - Área: Acadêmica – Matemática (objetivo + meta)
   - Área: Socioemocional (objetivo + meta)
   - Área: Autonomia (objetivo + meta)

**Formulário Atual:** 
- ✅ TEM: objetivo_geral, objetivos_especificos (genérico)
- ❌ FALTA: Separação por áreas com campos específicos (objetivo + meta)

---

### ✅ SEÇÃO 5: Estratégias e Recursos Pedagógicos
**Documento Original:**
1. Adaptações Curriculares
2. Recursos Didáticos e Tecnologias Assistivas
3. Estratégias de Ensino
4. Adaptações no Ambiente Escolar
5. Atendimento do AEE
6. Envolvimento da Família
7. Articulação com Outros Profissionais

**Formulário Atual:**
- ✅ TEM: recursos_didaticos (genérico)
- ❌ FALTA: 6 campos específicos

---

### ✅ SEÇÃO 6: Avaliação e Acompanhamento
**Documento Original:**
1. Critérios de Avaliação
2. Periodicidade das Reavaliações
3. Registro de Progresso

**Formulário Atual:**
- ✅ TEM: criterios_avaliacao, periodicidade_revisao
- ❌ FALTA: registro_progresso

---

### ✅ ASSINATURAS E CONSENSO
**Documento Original:**
1. Professor(a) Regente
2. Professor(a) de AEE
3. Coordenação Pedagógica
4. Direção Escolar
5. Responsável pelo Aluno

**Formulário Atual:** ❌ **SEÇÃO INTEIRA FALTANDO** (0/5 campos)

---

## 📊 RESUMO ESTATÍSTICO

| Seção | Campos Originais | Campos Implementados | % Completo |
|-------|-----------------|---------------------|------------|
| 1. Identificação | 17 | 2 | 12% |
| 2. Histórico | 5 | 0 | 0% |
| 3. Avaliação Diagnóstica | 28 | 0 | 0% |
| 4. Objetivos e Metas | 11 | 2 | 18% |
| 5. Estratégias | 7 | 1 | 14% |
| 6. Avaliação | 3 | 2 | 67% |
| 7. Assinaturas | 5 | 0 | 0% |
| **TOTAL** | **76** | **7** | **9%** |

## 🎯 AÇÃO NECESSÁRIA

O formulário precisa ser **COMPLETAMENTE REESCRITO** para incluir todos os 76 campos organizados em 7 seções conforme o documento oficial do PAI.

### Próximos Passos:
1. ✅ Documentação completa criada (este arquivo)
2. ⏳ Implementar novo formulário com todos os campos
3. ⏳ Atualizar backend para aceitar novos campos JSON
4. ⏳ Atualizar gerador de PDF para incluir todos os campos
5. ⏳ Migrar dados existentes (se houver)

---

**Data:** 12/12/2025  
**Status:** AGUARDANDO IMPLEMENTAÇÃO COMPLETA
