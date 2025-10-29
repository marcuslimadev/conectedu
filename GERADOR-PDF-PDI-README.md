# Gerador PDF do PDI - Documentação Técnica

## Visão Geral
Implementação completa do gerador de PDF para o **Plano de Desenvolvimento Individual (PDI)**, o documento mais complexo do sistema AEE.

## Características Técnicas

### Complexidade: ALTA ⚠️
- **1.030 linhas** de código PHP
- **11 seções principais** do modelo oficial
- **Tabelas dinâmicas bimestrais** (4 bimestres × até 15 disciplinas)
- **Aspectos avaliativos** com 16 itens psicomotores + 26 itens pedagógicos
- **Sistema de checkboxes** para opções múltiplas
- **JSON storage** para estruturas complexas

## Estrutura do Documento

### Seção I - Dados Institucionais
- Data de elaboração, SRE, escola, código, endereço
- Etapas da educação básica (checkboxes)
- Acessibilidade física e sala de recursos
- Direção escolar
- Equipe de elaboração (11 campos):
  - Especialista, Professor de Apoio, Guia Intérprete, TILS
  - Professor de Sala de Recursos, Regentes

### Seção II - Dados do Estudante
- Identificação completa (nome, data nascimento, idade)
- Responsável e parentesco
- Ano de escolaridade e deficiência informada
- Acompanhamento profissional externo
- Medicamentos e efeitos colaterais
- Necessidades específicas
- Tipo de atendimento
- Recursos de acessibilidade
- Como gosta de se divertir

### Seção III - Considerações da Família
- Campo texto livre para relatos da família

### Seção IV - Histórico de Escolarização
- Idade que começou a frequentar escola
- Percurso escolar detalhado
- Frequência em sala de recursos
- Educação integral

### Seção V - Limites e Agressividade
- Checkboxes para:
  - Autoagressividade
  - Indisciplina
  - Heteroagressividade
  - Desobediência a regras
  - Apatia
- Campo observações

### Seção VI - Aspectos Psicomotores (Tabela)
**16 aspectos avaliados** com 4 opções cada:
- Apresenta
- Apresenta com ajuda
- Não apresenta
- Não observado

**Aspectos incluídos:**
1. Esquema corporal
2. Consciência corporal
3. Expressão corporal
4. Imagem corporal
5. Tônus hipertônico
6. Tônus hipotônico
7. Coordenação motora ampla
8. Coordenação motora fina
9. Equilíbrio dinâmico
10. Equilíbrio estático
11. Lateralidade
12. Percepção gustativa
13. Percepção olfativa
14. Percepção tátil
15. Percepção visual
16. Postura

### Seção VII - Aspectos Pedagógicos/Cognitivos (Tabela)
**26 aspectos avaliados** com mesma estrutura de 4 opções:

**Memória (4):**
- Curto prazo, Longo prazo, Auditiva, Visual

**Percepção (5):**
- Auditiva, Corporal, Espacial, Tátil, Temporal, Visual

**Atenção (4):**
- Alerta, Alternada, Seletiva, Sustentada

**Raciocínio Lógico (3):**
- Abdutivo, Dedutivo, Intuitivo

**Pensamento (5):**
- Analítico, Criativo, Crítico, Síntese, Questionador, Sistêmico

**Compreensão (3):**
- Ordens simples, Ordens complexas, Relato de situações

**Observação:** Texto descritivo se 50%+ marcações "Não Apresenta"

### Seção VIII - Comunicação e Linguagem
**1. Intenção comunicativa:** Sim/Não

**2. Utiliza comunicação para (6 opções):**
- Fazer comentários
- Fazer solicitações
- Necessidades básicas
- Obter atenção
- Realizar escolhas
- Pequenas narrativas

**3. Recursos CSA (10 opções):**
- Alfabeto móvel, Alta tecnologia, Baixa tecnologia
- Figuras avulsas, Fotos, Numerais
- Pictograma, Prancha de comunicação, Prancha temática
- Não faz uso

**4. Expressa-se por/como/com (24 opções):**
- Gestos caseiros, Libras, Palavras, Sons
- Timidez, Descreve gravuras, Ecolalia
- Clareza, Rapidez, Som final
- Frases completas/curtas, Gagueira, Lentidão
- Nomeia objetos, Omite/troca/distorce fonemas
- Conversa espontânea, Reconta histórias
- Repete adultos, Entende proposto
- Tom de voz (baixo/alto)

**5. Escrita (24 níveis):**
- Garatujas
- Pré-silábica, Silábica, Silábica-alfabética, Alfabética
- Diferencia desenho/escrita/números
- Conhecimento de letras (algumas/todas/iguais)
- Reconhece nomes (próprio/pais/colegas)
- Escreve (frases/textos)
- Tipo de letra (cursiva/impressa/legível)
- Compreensão textual
- Uso de apoio/adaptação

**6. Leitura (7 níveis):**
- Lê palavras/frases/textos
- Leitura global (compreensão)
- Leitura fonética (silabada)
- Imita leitura de textos conhecidos
- Não lê

### Seção IX - Planejamento Bimestral (COMPLEXA) 🔥

**Estrutura dinâmica por disciplina:**

Para cada disciplina (até 15):
- ARTE
- LÍNGUA PORTUGUESA
- MATEMÁTICA
- CIÊNCIAS
- GEOGRAFIA
- HISTÓRIA
- EDUCAÇÃO FÍSICA
- BIOLOGIA
- FÍSICA
- QUÍMICA
- SOCIOLOGIA
- ENSINO RELIGIOSO
- ITINERÁRIOS FORMATIVOS (3 tipos)

**Por disciplina, em cada bimestre (1º a 4º):**

1. **Cabeçalho:**
   - Nome da disciplina
   - Nome do professor
   - Checkbox do bimestre (1º, 2º, 3º, 4º)

2. **Objetivos:**
   - Objetivo geral para a turma
   - Objetivo geral para o estudante

3. **Tabela de conteúdos (4 colunas):**
   - Conteúdo trabalhado
   - Habilidade a desenvolver
   - Metodologia e materiais
   - Habilidade/aprendizado adquirido

**Tabelas de Avaliação Bimestral:**

Para cada bimestre, tabela com todas disciplinas:
- Disciplina
- Valor (pontuação máxima)
- Nota alcançada
- Grau de autonomia (4 opções):
  - Muito suporte
  - Alta compreensão
  - Pouco suporte
  - Pouca compreensão
- Metodologia de avaliação (descritivo)
- Diagnóstico pedagógico (potenciais e desafios)

**Total de células nas tabelas:** ~240 (4 bimestres × 15 disciplinas × 4 campos)

### Seção X - Relatório Pedagógico Semestral
- Campo texto livre (até 1 lauda)
- Aspectos: cognitivos, sociais, comunicacionais, motores
- Desenvolvimento do estudante durante o semestre

## Schema do Banco de Dados

### Tabela: `pdi_conectaee`

**Campos de controle:**
```sql
id INT AUTO_INCREMENT PRIMARY KEY
student_id INT (FK → students)
teacher_id INT (FK → users)
created_by_teacher_id INT
created_at TIMESTAMP
updated_at TIMESTAMP
```

**Campos textuais (70+):**
- Todos os campos das 11 seções
- Ver `backend/update-pdi-schema.sql` para lista completa

**Campos JSON (3):**
```sql
aspectos_psicomotores JSON  -- 16 itens × 4 opções
aspectos_pedagogicos JSON   -- 26 itens × 4 opções
planejamento_bimestral JSON -- Estrutura complexa bimestral
```

**Exemplo JSON Planejamento Bimestral:**
```json
{
  "disciplinas": {
    "ARTE": {
      "bimestres": {
        "1": {
          "professor": "João Silva",
          "objetivo_turma": "Desenvolver expressão artística",
          "objetivo_estudante": "Reconhecer cores primárias",
          "conteudos": [
            {
              "conteudo": "Cores primárias",
              "habilidade": "Identificar e nomear cores",
              "metodologia": "Atividades lúdicas com tintas",
              "aprendizado": "Identifica 3 cores primárias"
            }
          ]
        }
      }
    }
  },
  "avaliacoes": {
    "1": {
      "ARTE": {
        "valor": 10,
        "nota": 8,
        "autonomia": "alta_compreensao",
        "metodologia": "Atividade prática de pintura",
        "diagnostico": "Excelente compreensão de cores"
      }
    }
  }
}
```

## Template HTML/CSS

### Estilo mPDF
- Font: Arial 10pt (corpo), 9pt (tabelas), 8pt (rodapés)
- Margens: 15mm laterais, 20mm topo/base
- Orientação: Portrait (A4)
- Quebras de página: Automáticas entre seções

### Classes CSS principais:
```css
.section      /* Seção principal */
.field        /* Campo de formulário */
.label        /* Rótulo em negrito */
.value        /* Valor do campo */
.checkbox     /* Checkbox visual (12px) */
.photo        /* Foto 80×100px */
.page-break   /* Quebra de página */
.small-text   /* Texto 8pt */
```

### Tabelas HTML:
- `border-collapse: collapse`
- `border: 1px solid #000`
- `th` com background #e0e0e0
- `td` com padding 4px
- Texto centralizado em checkboxes

## Funções PHP Principais

### 1. `getPDITemplate($data)`
- **Entrada:** Array com dados do PDI, aspectos, planejamento
- **Saída:** String HTML completa
- **Responsabilidade:** Monta template com todas as 11 seções

### 2. `getAspectosPsicomotoresTable($aspectos)`
- **Entrada:** JSON decodificado dos aspectos psicomotores
- **Saída:** HTML da tabela com 16 linhas
- **Checkboxes:** Marcados conforme valor no JSON

### 3. `getAspectosPedagogicosTable($aspectos)`
- **Entrada:** JSON decodificado dos aspectos pedagógicos
- **Saída:** HTML da tabela com 26 linhas
- **Similar:** Estrutura idêntica à tabela psicomotora

### 4. `getComunicacaoLinguagemSection($pdi)`
- **Entrada:** Array com dados do PDI
- **Saída:** HTML da seção VIII completa
- **Checkboxes múltiplos:** 6 + 10 + 24 + 24 + 7 = 71 opções

### 5. `getPlanejamentoBimestralSection($planejamento, $pdi)`
- **Entrada:** JSON planejamento + dados PDI
- **Saída:** HTML com tabelas dinâmicas por disciplina/bimestre
- **Complexidade:** Loop aninhado (disciplinas → bimestres)

### 6. `getAvaliacoesBimestraisTable($planejamento)`
- **Entrada:** JSON planejamento
- **Saída:** 4 tabelas (uma por bimestre) com todas disciplinas
- **Total linhas:** ~60 (15 disciplinas × 4 bimestres)

## Endpoint da API

### URL
```
POST /backend/generate-pdf-pdi.php?id={pdi_id}
```

### Headers
```
Authorization: Bearer {token}
```

### Resposta (Sucesso)
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="PDI_Nome_Aluno_20241029_143022.pdf"
Content-Length: 458302

[Binary PDF data]
```

### Resposta (Erro)
```json
{
  "success": false,
  "message": "PDI não encontrado",
  "code": 404
}
```

## Segurança

### Autenticação
- Bearer token obrigatório
- Função `require_auth()` valida sessão

### Autorização (Teacher-centric)
```php
if ($user['role'] !== 'admin' && $pdi['teacher_id'] != $user['id']) {
    res(false, null, 'Sem permissão', 403);
}
```

### Validações
- ID numérico obrigatório
- PDI deve existir no banco
- Teacher só vê seus PDIs
- Admin vê todos

### Armazenamento
- Arquivo salvo em: `backend/uploads/documentos/pdis/`
- Registro na tabela: `documentos_gerados`
- Metadados: tipo, form_id, student_id, teacher_id, file_path, file_name, file_size

## Foto do Aluno
- **Campo:** `students.photo_url`
- **Path absoluto:** `__DIR__ . '/uploads/students/' . basename($photo_url)`
- **Validação:** `file_exists()` antes de incluir no PDF
- **Posição:** Float right no cabeçalho
- **Dimensões:** 80×100px com borda

## Desempenho

### Estimativas
- **Geração PDF:** ~2-4 segundos (dependendo de disciplinas/bimestres)
- **Tamanho arquivo:** ~300-600KB (sem fotos), ~500-900KB (com foto)
- **Memória PHP:** ~32MB pico (mPDF renderização)

### Otimizações
- JSON indexado por chaves (não arrays numéricos)
- Loops eficientes com isset() checks
- HTML minificado inline (sem espaços desnecessários)
- Tabelas renderizadas sob demanda

## Testes Necessários

### 1. Validação de Estrutura
- [ ] PDF gerado abre sem erros
- [ ] Todas 11 seções presentes
- [ ] Layout idêntico ao modelo oficial
- [ ] Quebras de página corretas

### 2. Conteúdo Dinâmico
- [ ] Checkboxes marcados conforme dados
- [ ] Tabelas bimestrais com dados corretos
- [ ] Foto aparece quando existe
- [ ] Textos com acentuação correta (UTF-8)

### 3. Casos Extremos
- [ ] PDI sem planejamento bimestral (JSON vazio)
- [ ] PDI com 15 disciplinas (tamanho máximo)
- [ ] PDI com textos longos (textarea overflow)
- [ ] Aluno sem foto

### 4. Segurança
- [ ] Professor A não acessa PDI do Professor B
- [ ] Admin acessa qualquer PDI
- [ ] Token inválido retorna 401
- [ ] ID inválido retorna 400

### 5. Performance
- [ ] Geração < 5 segundos
- [ ] Arquivo < 1MB
- [ ] Sem memory exhaustion

## Comparação com Gerador Entrevista

| Aspecto | Entrevista | PDI |
|---------|-----------|-----|
| **Linhas código** | 390 | 1.030 |
| **Seções** | 9 | 11 |
| **Tabelas complexas** | 0 | 6 |
| **Checkboxes** | ~50 | ~180 |
| **JSON fields** | 0 | 3 |
| **Tabelas dinâmicas** | 0 | Sim (bimestrais) |
| **Complexidade** | Média | Alta |
| **Tempo estimado** | 3h | 5h |

## Próximos Passos

1. ✅ **Schema atualizado** - Tabela `pdi_conectaee` com todos campos
2. ✅ **Gerador criado** - Arquivo `generate-pdf-pdi.php` (1.030 linhas)
3. ⏳ **Testes práticos** - Gerar PDF de um PDI real
4. ⏳ **Ajustes layout** - Refinar quebras de página e espaçamentos
5. ⏳ **Frontend** - Botão "Gerar PDF" no formulário PDI
6. ⏳ **API integration** - Endpoint documentos.list para listar PDFs

## Limitações Conhecidas

1. **Disciplinas fixas:** Lista hardcoded de 15 disciplinas (pode variar por ano/escola)
2. **JSON structure:** Frontend precisa enviar JSON no formato específico
3. **Quebras de página:** Podem falhar em textos muito longos (>1 página por tabela)
4. **Fotos:** Apenas JPG/PNG suportados, dimensões fixas

## Recursos Utilizados

- **mPDF 8.x:** Renderização HTML → PDF
- **PDO:** Queries prepared statements
- **JSON:** Estruturas complexas flexíveis
- **PHP 7.4+:** Type hints, null coalescing operator

## Arquivos Relacionados

```
backend/
├── generate-pdf-pdi.php          # Gerador (1.030 linhas) ← NOVO
├── update-pdi-schema.sql         # Schema update ← NOVO
├── schema-aee.sql                # Schema original
├── functions.php                 # require_auth(), res()
└── uploads/
    ├── students/                 # Fotos alunos
    └── documentos/
        └── pdis/                 # PDFs gerados ← NOVO
```

## Changelog

### v1.0 - 29/10/2024
- ✅ Implementação completa do gerador PDF PDI
- ✅ Template HTML com 11 seções
- ✅ Tabelas dinâmicas bimestrais
- ✅ Sistema de checkboxes (180+)
- ✅ JSON storage para estruturas complexas
- ✅ Schema atualizado com 70+ campos
- ✅ Validação sintaxe PHP (sem erros)
- ✅ Integração com sistema de documentos

---

**Autor:** Sistema ConectEDU  
**Data:** 29 de outubro de 2024  
**Status:** ✅ Completo - Pronto para testes
