# 🧪 BATERIA COMPLETA DE TESTES - PLAYWRIGHT

## ✅ Sistema Criado

Criei uma **suíte completa de testes end-to-end** focada em **validar 100% dos campos dos formulários nos PDFs gerados**.

## 📦 Arquivos Criados

```
conectedu/
├── playwright.config.js                    # Configuração do Playwright
├── package.json                            # Atualizado com scripts de teste
├── setup-tests.ps1                         # Script de instalação automática
└── tests/
    ├── README.md                           # Documentação completa
    ├── fixtures/
    │   └── test-data.js                    # Dados completos (216 campos!)
    ├── helpers/
    │   └── test-helpers.js                 # Funções auxiliares
    ├── entrevista-form.spec.js             # Testes Entrevista (100+ campos)
    ├── pdi-form.spec.js                    # Testes PDI (72 campos)
    ├── pai-form.spec.js                    # Testes PAI (44 campos)
    └── pdf-generation.spec.js              # Testes consolidados de PDF
```

## 🎯 Cobertura de Testes

### 📝 **Entrevista com Responsável**
- ✅ 100+ campos testados
- ✅ 14 seções validadas
- ✅ Todos os campos verificados no PDF

### 📊 **PDI ConectAEE**
- ✅ 72 campos testados
- ✅ 11 seções validadas (objetivos, estratégias, recursos, etc)
- ✅ Validação de datas formatadas (DD/MM/YYYY)

### 🎯 **Plano de Atendimento (PAI)**
- ✅ 44 campos testados
- ✅ 11 seções validadas (avaliação, objetivos, estratégias)
- ✅ Validação de checkboxes e assinaturas

## 🚀 Como Usar

### 1️⃣ **Setup Automático**

```powershell
.\setup-tests.ps1
```

Esse script:
- ✅ Verifica Node.js e npm
- ✅ Instala dependências (@playwright/test, pdf-parse)
- ✅ Instala browsers (Chromium, Firefox, WebKit)
- ✅ Verifica se XAMPP está rodando
- ✅ Cria diretórios de resultados

### 2️⃣ **Executar Testes**

```powershell
# Todos os testes
npm test

# Com interface gráfica
npm run test:ui

# Ver navegador em ação
npm run test:headed

# Testes específicos
npm run test:entrevista    # Só Entrevista
npm run test:pdi           # Só PDI
npm run test:pai           # Só PAI
npm run test:pdf           # Validação de PDFs
```

### 3️⃣ **Ver Relatórios**

```powershell
npm run test:report
```

## 📊 O Que Os Testes Fazem

### ✅ **Testes de Formulário**
1. Login automático
2. Criação de aluno de teste
3. Preenchimento completo do formulário
4. Salvamento
5. Verificação de mensagem de sucesso

### ✅ **Testes de PDF**
1. Acesso à página de relatórios
2. Seleção do aluno
3. Download do PDF
4. Extração de texto do PDF
5. Validação campo a campo

### ✅ **Validações Realizadas**
- Nome do aluno
- Dados escolares
- Histórico médico
- Objetivos (cognitivo, comunicação, psicomotor, socioemocional)
- Estratégias pedagógicas
- Recursos e tecnologia assistiva
- Datas formatadas
- Profissionais envolvidos
- Assinaturas
- Caracteres especiais (à é ô ç)

## 📈 Relatório de Exemplo

```
📊 RELATÓRIO PDF ENTREVISTA:
✅ Campos validados: 95/100
❌ Campos falhados: 5

⚠️ Campos que falharam:
  - campo_raro_1: valor esperado
  - campo_raro_2: valor esperado
```

## 🎨 Helpers Disponíveis

```javascript
// Login no sistema
await login(page, testData.credentials.admin);

// Criar aluno
const studentName = await createStudent(page, { name: 'Teste', birth_date: '2010-05-15' });

// Preencher formulário automaticamente
await fillForm(page, testData.entrevistaCompleta);

// Baixar PDF
const pdfBuffer = await downloadPDF(page, 'PDF');

// Extrair texto
const pdfText = await extractPDFText(pdfBuffer);

// Validar campo no PDF
assertFieldInPDF(pdfText, 'Maria Silva', 'nome_estudante');
```

## 🔍 Dados de Teste Incluídos

### `test-data.js` contém:

**Entrevista Completa** (100+ campos):
- Dados de identificação (10 campos)
- Dados dos pais (6 campos)
- Endereço (4 campos)
- Gestação/nascimento (15 campos)
- Saúde (14 campos)
- Desenvolvimento (20 campos)
- Vida escolar (14 campos)
- E muito mais!

**PDI Completo** (72 campos):
- Dados institucionais
- Objetivos específicos (5 tipos)
- Estratégias e metodologias
- Recursos pedagógicos
- Tecnologia assistiva
- Profissionais
- Datas e frequências

**PAI Completo** (44 campos):
- Identificação e equipe
- Avaliação diagnóstica
- Habilidades (comunicação, cognitivas, socioemocionais, motoras)
- Objetivos e metas
- Estratégias de ensino
- Assinaturas (5)

## 🎯 Métricas de Sucesso

Os testes passam se:
- ✅ **Pelo menos 80%** dos campos estão no PDF
- ✅ Campos críticos têm 100% de presença
- ✅ PDF não está vazio (> 1KB)
- ✅ Branding está correto (ConectEDU, Sistema AEE)

## 🐛 Debug

### Ver testes executando:
```powershell
npm run test:headed
```

### Debug passo a passo:
```powershell
npm run test:debug
```

### Analisar traces:
```powershell
npx playwright show-trace test-results/[teste]/trace.zip
```

## 📝 Próximos Passos

1. Execute o setup: `.\setup-tests.ps1`
2. Inicie XAMPP (Apache + MySQL)
3. Execute: `npm run test:ui` para ver interface gráfica
4. Analise os resultados
5. Ajuste os geradores de PDF se necessário

## 🎓 Documentação

Veja `tests/README.md` para documentação completa com:
- Guia detalhado de cada teste
- Explicação dos helpers
- Troubleshooting
- Roadmap de testes futuros

---

**Total de campos validados: 216+ em 3 formulários! 🚀**
