# 🧪 Bateria de Testes Playwright - ConectEDU

## 📋 Visão Geral

Suíte completa de testes end-to-end (E2E) para o sistema ConectEDU, com foco especial na **validação de geração de PDFs** e garantia de que **todos os campos preenchidos nos formulários aparecem corretamente nos documentos gerados**.

## 🎯 Objetivo Principal

**Garantir 100% de consistência entre formulários preenchidos e PDFs gerados**, validando que:
- ✅ Todos os campos do formulário de **Entrevista** (100+ campos) estão no PDF
- ✅ Todos os campos do formulário **PDI** (72 campos) estão no PDF
- ✅ Todos os campos do formulário **PAI** (44 campos) estão no PDF
- ✅ Formatação, acentuação e caracteres especiais são preservados
- ✅ Estrutura visual e branding estão corretos

## 📦 Instalação

### 1. Instalar dependências

```powershell
npm install
```

### 2. Instalar browsers do Playwright

```powershell
npx playwright install
```

### 3. Verificar XAMPP rodando

Certifique-se de que Apache e MySQL estão ativos:
```powershell
# Verificar se http://localhost/conectedu/frontend/ está acessível
```

## 🚀 Executando os Testes

### Todos os testes
```powershell
npm test
```

### Testes específicos por formulário

```powershell
# Testes do formulário de Entrevista
npm run test:entrevista

# Testes do formulário PDI
npm run test:pdi

# Testes do formulário PAI
npm run test:pai

# Testes de geração de PDF
npm run test:pdf
```

### Modos de execução

```powershell
# Modo UI (interface gráfica)
npm run test:ui

# Modo headed (ver navegador)
npm run test:headed

# Modo debug (passo a passo)
npm run test:debug
```

### Visualizar relatórios

```powershell
npm run test:report
```

## 📁 Estrutura dos Testes

```
tests/
├── fixtures/
│   └── test-data.js           # Dados completos dos 3 formulários
├── helpers/
│   └── test-helpers.js        # Funções auxiliares (login, fillForm, etc)
├── entrevista-form.spec.js    # Testes da Entrevista (100+ campos)
├── pdi-form.spec.js           # Testes do PDI (72 campos)
├── pai-form.spec.js           # Testes do PAI (44 campos)
└── pdf-generation.spec.js     # Testes de validação de PDFs
```

## 🧩 Cobertura de Testes

### 📝 Entrevista com Responsável (100+ campos)

**Seções testadas:**
- ✅ Dados de Identificação (10 campos)
- ✅ Dados dos Pais (6 campos)
- ✅ Endereço e Contato (4 campos)
- ✅ Informações da Família (8 campos)
- ✅ Gestação/Nascimento (15 campos)
- ✅ Alimentação (4 campos)
- ✅ Saúde (14 campos)
- ✅ Desenvolvimento Pregresso (4 campos)
- ✅ Comunicação (4 campos)
- ✅ Atividades de Vida Diária (11 campos)
- ✅ Socialização (5 campos)
- ✅ Comportamento (3 campos)
- ✅ Vida Escolar (14 campos)
- ✅ Informações Complementares (4 campos)

**Total: ~100 campos validados no PDF**

### 📊 PDI ConectAEE (72 campos)

**Seções testadas:**
- ✅ Dados Institucionais (11 campos)
- ✅ Responsáveis pela Elaboração (6 campos)
- ✅ Dados do Estudante (14 campos)
- ✅ Histórico de Escolarização (5 campos)
- ✅ Objetivos Específicos (5 campos - cognitivo, comunicação, psicomotor, socioemocional, geral)
- ✅ Estratégias e Metodologias (3 campos)
- ✅ Recursos (2 campos)
- ✅ Avaliação (2 campos)
- ✅ Datas e Frequência (3 campos)
- ✅ Profissionais (5 campos)
- ✅ Observações (1 campo)

**Total: 72 campos validados no PDF**

### 🎯 Plano de Atendimento Individual (44 campos)

**Seções testadas:**
- ✅ Identificação e Equipe (13 campos)
- ✅ Datas (4 campos)
- ✅ Histórico (5 campos)
- ✅ Avaliação Diagnóstica - Comunicação (10 campos)
- ✅ Habilidades Cognitivas (5 campos)
- ✅ Habilidades Socioemocionais (4 campos)
- ✅ Habilidades Motoras (4 campos)
- ✅ Objetivos e Metas (2 campos)
- ✅ Estratégias e Recursos (7 campos)
- ✅ Avaliação e Acompanhamento (3 campos)
- ✅ Assinaturas (5 campos)

**Total: 44 campos validados no PDF**

## 📊 Relatórios de Teste

Os testes geram relatórios detalhados mostrando:

```
📊 RELATÓRIO PDF ENTREVISTA:
✅ Campos validados: 95
❌ Campos falhados: 5

⚠️ Campos que falharam:
  - campo_exemplo_1: valor esperado
  - campo_exemplo_2: valor esperado
```

## 🔍 Validações Realizadas

### 1. **Preenchimento de Formulários**
- Validação de campos obrigatórios
- Teste de dropdowns automáticos de alunos
- Teste de diferentes tipos de input (text, date, select, textarea, checkbox)

### 2. **Geração de PDFs**
- Extração de texto do PDF usando `pdf-parse`
- Comparação campo a campo entre formulário e PDF
- Validação de formatação de datas (DD/MM/YYYY)
- Validação de acentuação e caracteres especiais

### 3. **Casos Extremos**
- PDFs com campos vazios
- PDFs com caracteres especiais (à é ô ç ñ • © ®)
- PDFs com textos longos
- Validação de branding (logo, cabeçalho, rodapé)

### 4. **Integração Multi-formulário**
- Criação de aluno com os 3 formulários preenchidos
- Validação de consistência de dados entre formulários
- Testes de navegação entre formulários

## 🎨 Helpers Disponíveis

### `login(page, credentials)`
Faz login no sistema

### `createStudent(page, data)`
Cria um aluno de teste e retorna o nome

### `fillForm(page, formData)`
Preenche automaticamente um formulário completo

### `downloadPDF(page, buttonText)`
Baixa um PDF e retorna o buffer

### `extractPDFText(pdfBuffer)`
Extrai texto de um PDF

### `assertFieldInPDF(pdfText, fieldValue, fieldName)`
Valida se um campo está presente no PDF

## 📈 Métricas de Sucesso

Os testes são considerados **bem-sucedidos** se:

- ✅ **Pelo menos 80%** dos campos aparecem no PDF
- ✅ Campos críticos (nome, data, diagnóstico) têm **100% de presença**
- ✅ Formatação de datas está correta
- ✅ Caracteres especiais são preservados
- ✅ PDF tem mais de 1KB (não está vazio)

## 🐛 Debugging

### Ver testes executando

```powershell
npm run test:headed
```

### Debug passo a passo

```powershell
npm run test:debug
```

### Analisar screenshots de falhas

Os screenshots são salvos automaticamente em:
```
test-results/
└── [nome-do-teste]-chromium/
    ├── test-failed-1.png
    └── trace.zip
```

### Analisar trace de execução

```powershell
npx playwright show-trace test-results/[teste]/trace.zip
```

## ⚙️ Configuração

### `playwright.config.js`

Principais configurações:

```javascript
{
  baseURL: 'http://localhost/conectedu/frontend/',
  timeout: 60000, // 60s por teste
  expect: { timeout: 10000 }, // 10s para expects
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry'
}
```

### Browsers testados

- ✅ Chromium (Chrome/Edge)
- ✅ Firefox
- ✅ WebKit (Safari)
- ✅ Mobile Chrome

## 📝 Dados de Teste

Todos os dados de teste estão em `tests/fixtures/test-data.js`:

```javascript
{
  credentials: { admin, professor },
  entrevistaCompleta: { /* 100+ campos */ },
  pdiCompleto: { /* 72 campos */ },
  paiCompleto: { /* 44 campos */ }
}
```

## 🚨 Troubleshooting

### Erro: "baseURL não acessível"

Verifique se XAMPP está rodando:
```powershell
# Acesse: http://localhost/conectedu/frontend/
```

### Erro: "Timeout ao fazer login"

Verifique credenciais em `test-data.js`:
```javascript
admin: {
  email: 'admin@teste.com',
  password: 'Teste@123'
}
```

### Erro: "PDF vazio ou corrompido"

1. Verifique se mPDF está instalado no backend
2. Teste geração manual via browser
3. Verifique logs do PHP em `C:\xampp\apache\logs\error.log`

### Erro: "Campo não encontrado no PDF"

Possíveis causas:
1. Campo não foi salvo no banco
2. Gerador de PDF não está incluindo o campo
3. Nome do campo diferente entre form e PDF

**Solução:** Ative debug nos testes:
```javascript
console.log('PDF Text:', pdfText.substring(0, 500));
```

## 🎯 Roadmap de Testes

### Fase 1 (Atual) ✅
- [x] Testes de formulários individuais
- [x] Testes de geração de PDFs
- [x] Validação campo a campo

### Fase 2 (Próxima)
- [ ] Testes de performance (tempo de geração de PDF)
- [ ] Testes de acessibilidade (a11y)
- [ ] Testes de responsividade mobile

### Fase 3 (Futuro)
- [ ] Testes de integração com APIs externas
- [ ] Testes de carga (múltiplos usuários)
- [ ] Testes de segurança (XSS, CSRF)

## 📞 Suporte

Para dúvidas sobre os testes:

1. Consulte a [Documentação do Playwright](https://playwright.dev)
2. Veja exemplos em `tests/*.spec.js`
3. Analise helpers em `tests/helpers/test-helpers.js`

---

**ConectEDU Test Suite** - Garantindo qualidade em cada PDF gerado! 🎓✨
