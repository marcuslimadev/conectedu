# ✅ GUIA PRÁTICO DE TESTE MANUAL - CONECTAEE v5.0

## 🎯 **CHECKLIST INTERATIVO DE VALIDAÇÃO**

**👨‍💻 TESTADOR:** ________________  
**📅 DATA:** ________________  
**⏰ INÍCIO:** ________________  

---

## 📋 **PRÉ-REQUISITOS**

- [ ] **XAMPP rodando** (Apache + MySQL)
- [ ] **Navegador moderno** (Chrome/Edge/Firefox)
- [ ] **Console do navegador** acessível (F12)
- [ ] **Sistema ConectAEE** carregado em `http://localhost/conectedu/frontend/`

## ✅ **CORREÇÕES APLICADAS NO SISTEMA**

**🎉 Os seguintes problemas foram corrigidos automaticamente:**
- ✅ **CDN Tailwind substituído** por versão local de produção
- ✅ **Arquivo `tailwind-local.css`** criado com utilitários otimizados
- ✅ **Aviso de produção removido** - sistema pronto para uso profissional
- ✅ **Erro 500 da API explicado** - normal antes do login, resolve após autenticação
- ✅ **Erros CSS2 monitorados** - URLs do Google Fonts testadas e funcionais

**📝 Consulte `CORREÇÕES_APLICADAS.md` para detalhes completos das melhorias.**

---

## 🚀 **ETAPA 1: ACESSO E CONFIGURAÇÃO INICIAL**

### **PASSO 1.1 - Acesso ao Sistema**
- [ ] **Abrir navegador** e acessar: `http://localhost/conectedu/frontend/`
- [ ] **Aguardar carregamento** completo da página
- [ ] **Verificar se carregou** sem erros visuais

**✏️ OBSERVAÇÕES:**
```
_________________________________________________
_________________________________________________
```

### **PASSO 1.2 - Login no Sistema**
- [ ] **Inserir credenciais** de acesso válidas
- [ ] **Clicar em "Entrar"**
- [ ] **Verificar redirecionamento** para dashboard
- [ ] **Confirmar menu lateral** visível

**✏️ STATUS:** ✅ Sucesso / ❌ Erro: ________________

### **PASSO 1.3 - Verificar Painel de Desenvolvimento**
- [ ] **Localizar barra roxa** no topo: "🤖 PAINEL DE TESTES AUTOMATIZADOS"
- [ ] **Se não aparecer:** Pressionar F12 → Console → digitar: `DEV.mostrarPainel()`
- [ ] **Confirmar botões visíveis:**
  - [ ] 👥 Criar 5 Alunos
  - [ ] 📋 Preencher Formulários  
  - [ ] 📅 Testar DatePickers
  - [ ] 📄 Gerar Todos PDFs
  - [ ] 🤖 Análise IA Todos
  - [ ] ✅ Validar Sistema Completo

**✏️ RESULTADO:** ________________

### **PASSO 1.4 - Ativar Console**
- [ ] **Pressionar F12** para abrir Developer Tools
- [ ] **Ir para aba "Console"**
- [ ] **Digitar:** `console.log("✅ Console ativo para testes")`
- [ ] **Verificar mensagem** aparece no console

**✏️ CONSOLE ATIVO:** ✅ Sim / ❌ Não

---

## 🔍 **ETAPA 2: VALIDAÇÃO INICIAL DO SISTEMA**

### **PASSO 2.1 - Executar Validação Automática**
- [ ] **No console, digitar:** `DEV.validarSistema()`
- [ ] **Aguardar execução** das 5 etapas:

**📝 REGISTRAR RESULTADOS:**
- [ ] **1️⃣ Verificando componentes:** ✅ / ❌ ________________
- [ ] **2️⃣ Testando formulários:** ✅ / ❌ ________________  
- [ ] **3️⃣ Testando relatórios:** ✅ / ❌ ________________
- [ ] **4️⃣ Testando geração de PDFs:** ✅ / ❌ ________________
- [ ] **5️⃣ Testando sistema IA:** ✅ / ❌ ________________

### **PASSO 2.2 - Verificar Resultado Final**
- [ ] **Mensagem esperada:** "🎉 SISTEMA TOTALMENTE VALIDADO!"
- [ ] **Se erro:** Anotar mensagem específica

**✏️ RESULTADO GERAL:**
```
_________________________________________________
_________________________________________________
```

---

## 👥 **ETAPA 3: CRIAÇÃO MASSIVA DE DADOS**

### **PASSO 3.1 - Criar Base de Alunos**
- [ ] **Clicar no botão:** "👥 Criar 5 Alunos" (painel roxo)
- [ ] **OU no console:** `DEV.criarAlunos()`
- [ ] **Observar logs** em tempo real
- [ ] **Aguardar conclusão**

**📝 LOGS OBSERVADOS:**
```
_________________________________________________
_________________________________________________
```

### **PASSO 3.2 - Verificar Alunos Criados**
- [ ] **Navegar para "Alunos"** no menu lateral
- [ ] **Confirmar presença dos alunos:**
  - [ ] Ana Clara Silva Santos
  - [ ] João Pedro Oliveira Costa  
  - [ ] Isabella Fernanda Rodrigues
  - [ ] Miguel Henrique dos Santos
  - [ ] Sofia Vitória Almeida Souza

**✏️ ALUNOS ENCONTRADOS:** ___/5

---

## 📋 **ETAPA 4: PREENCHIMENTO AUTOMÁTICO**

### **PASSO 4.1 - Preencher Formulários**
- [ ] **Clicar:** "📋 Preencher Formulários" (painel)
- [ ] **OU no console:** `DEV.preencherFormularios()`
- [ ] **Aguardar processamento:**
  - [ ] ✅ Entrevistas preenchidas
  - [ ] ✅ PDIs preenchidos  
  - [ ] ✅ Planos de Atendimento preenchidos

**✏️ STATUS:** ________________

### **PASSO 4.2 - Teste Manual de Formulário**
- [ ] **Navegar:** "Novo" → "Entrevista com Responsável"
- [ ] **Selecionar:** "Ana Clara Silva Santos"
- [ ] **Testar campo de data:** digitar `15/03/2010`
- [ ] **Testar calendário:** clicar no ícone e selecionar data
- [ ] **Avançar etapas** sem bloqueios

**✏️ TESTE MANUAL:** ✅ Sucesso / ❌ Problema: ________________

---

## 📅 **ETAPA 5: TESTE DOS DATEPICKERS**

### **PASSO 5.1 - Teste Automático**
- [ ] **Clicar:** "📅 Testar DatePickers" (painel)
- [ ] **Observar execução** nos diferentes formulários

### **PASSO 5.2 - Teste Manual Específico**
- [ ] **Ir para:** "Novo" → "PDI"
- [ ] **Em campo de data, testar:**
  - [ ] **Entrada manual:** `22/07/2008` - ✅ / ❌
  - [ ] **Calendário nativo:** clicar ícone e selecionar - ✅ / ❌  
  - [ ] **Validação erro:** `32/13/2025` - deve rejeitar - ✅ / ❌

**✏️ DATEPICKERS FUNCIONANDO:** ✅ Perfeitamente / ⚠️ Com problemas / ❌ Não funcionam

---

## 📊 **ETAPA 6: RELATÓRIOS INTELIGENTES**

### **PASSO 6.1 - Acessar Relatórios**
- [ ] **Navegar:** "Relatórios" no menu
- [ ] **Buscar:** "Ana Clara"
- [ ] **Selecionar** da lista
- [ ] **Verificar:** informações aparecem

### **PASSO 6.2 - Gerar Relatório**
- [ ] **Clicar:** "📊 Gerar Relatório"
- [ ] **Verificar dados completos** aparecem
- [ ] **Observar informações:**
  - [ ] Dados pessoais
  - [ ] Estatísticas
  - [ ] Histórico

### **PASSO 6.3 - Testar Controles Inteligentes**
- [ ] **Para aluno com dados completos:** botões PDF e IA habilitados - ✅ / ❌
- [ ] **Para aluno sem dados:** alerta "Atenção: Dados Limitados" - ✅ / ❌

**✏️ RELATÓRIOS:** ✅ Funcionando / ❌ Problemas: ________________

---

## 📄 **ETAPA 7: GERAÇÃO DE PDFS**

### **PASSO 7.1 - PDFs em Lote**
- [ ] **Clicar:** "📄 Gerar Todos PDFs" (painel)
- [ ] **Observar processamento** para cada aluno
- [ ] **Registrar sucessos:**
  - [ ] Ana Clara: ✅ / ❌
  - [ ] João Pedro: ✅ / ❌
  - [ ] Isabella: ✅ / ❌  
  - [ ] Miguel: ✅ / ❌
  - [ ] Sofia: ✅ / ❌

### **PASSO 7.2 - PDF Individual**
- [ ] **Na tela de relatórios:** selecionar aluno
- [ ] **Clicar:** "📄 Exportar PDF"  
- [ ] **Verificar:** PDF abre em nova aba sem erros

**✏️ GERAÇÃO PDF:** ✅ Funcionando / ❌ Problemas: ________________

---

## 🤖 **ETAPA 8: ANÁLISE COM IA**

### **PASSO 8.1 - IA em Lote**
- [ ] **Clicar:** "🤖 Análise IA Todos" (painel)
- [ ] **Aguardar processamento** dos 5 alunos
- [ ] **Verificar conclusão** para todos

### **PASSO 8.2 - IA Individual**
- [ ] **Selecionar:** "João Pedro Oliveira Costa"
- [ ] **Gerar relatório**
- [ ] **Clicar:** "🤖 Análise com IA"
- [ ] **Verificar análise contextualizada** sobre TEA e tecnologia

### **PASSO 8.3 - Qualidade da Análise**
**A análise deve mencionar:**
- [ ] **Status do acompanhamento** baseado em atendimentos
- [ ] **Recomendações específicas** para o perfil  
- [ ] **Análise temporal** do último atendimento
- [ ] **Sugestões personalizadas**

**✏️ QUALIDADE IA:** ✅ Excelente / ⚠️ Boa / ❌ Problemas: ________________

---

## 🧙‍♂️ **ETAPA 9: TESTE DE WIZARDS**

### **PASSO 9.1 - Wizard de Entrevista**
- [ ] **Navegar:** "Novo" → "Entrevista com Responsável"
- [ ] **Usar dados:** Isabella Fernanda Rodrigues
  - Nome: Isabella Fernanda Rodrigues
  - Data Nascimento: 08/11/2011  
  - Escola: EMEF Cecília Meireles
- [ ] **Avançar** por todas as etapas
- [ ] **Submeter** formulário

### **PASSO 9.2 - Wizard de PDI**
- [ ] **Navegar:** "Novo" → "PDI"
- [ ] **Usar dados:** Miguel Henrique dos Santos
  - Nome: Miguel Henrique dos Santos
  - Data Nascimento: 30/05/2009
  - Necessidades: TDAH
- [ ] **Completar** todas as 4 etapas
- [ ] **Salvar** PDI

**✏️ WIZARDS:** ✅ Sem bloqueios / ❌ Travaram em: ________________

---

## ✅ **ETAPA 10: VALIDAÇÃO FINAL**

### **PASSO 10.1 - Validação Completa**
- [ ] **Clicar:** "✅ Validar Sistema Completo" (painel)
- [ ] **Aguardar** todas as verificações
- [ ] **Verificar mensagem:** "🎉 SISTEMA TOTALMENTE VALIDADO! Pronto para testes automáticos"

### **PASSO 10.2 - Verificação Final**
- [ ] **No console:** `console.log("Testes concluídos:", new Date())`
- [ ] **Verificar:** não há erros JavaScript críticos
- [ ] **Console limpo** de erros

**✏️ VALIDAÇÃO FINAL:** ✅ Aprovado / ❌ Reprovado: ________________

---

## 📊 **RELATÓRIO DE RESULTADOS**

### **RESUMO EXECUTIVO**
**⏰ Horário término:** ________________  
**🕐 Tempo total:** _______ minutos  

**📈 PONTUAÇÃO GERAL:**
- **Etapas concluídas:** ___/10
- **Testes aprovados:** ___/23  
- **Funcionalidades OK:** ___/12

### **STATUS POR ETAPA**
- **Etapa 1 (Acesso):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 2 (Validação):** ✅ / ⚠️ / ❌ - ________________  
- **Etapa 3 (Dados):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 4 (Formulários):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 5 (DatePickers):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 6 (Relatórios):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 7 (PDFs):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 8 (IA):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 9 (Wizards):** ✅ / ⚠️ / ❌ - ________________
- **Etapa 10 (Final):** ✅ / ⚠️ / ❌ - ________________

### **PROBLEMAS ENCONTRADOS**
```
1. _________________________________________________
2. _________________________________________________  
3. _________________________________________________
4. _________________________________________________
5. _________________________________________________
```

### **PONTOS FORTES OBSERVADOS**
```
1. _________________________________________________
2. _________________________________________________
3. _________________________________________________
4. _________________________________________________
5. _________________________________________________
```

### **RECOMENDAÇÕES**
```
_________________________________________________
_________________________________________________
_________________________________________________
_________________________________________________
```

### **CONCLUSÃO FINAL**

**Sistema aprovado para produção:** ✅ SIM / ❌ NÃO  

**Justificativa:**
```
_________________________________________________
_________________________________________________
_________________________________________________
```

**Assinatura do testador:** ________________

---

## 🆘 **COMANDOS DE EMERGÊNCIA**

**Se algo não funcionar, use no console:**

```javascript
// Recarregar sistema
location.reload()
localStorage.setItem('dev_mode', 'true')

// Verificar componentes
console.log('Vue:', typeof Vue)
console.log('DatePicker:', typeof DatePickerComponent)  
console.log('Dados:', typeof DADOS_TESTE_AUTOMATIZADO)

// Forçar painel
DEV.mostrarPainel()

// Status atual
console.log('Rota:', window.location.hash)
console.log('Token:', localStorage.getItem('token') ? 'OK' : 'AUSENTE')
```

---

## 🎯 **CRITÉRIOS DE APROVAÇÃO**

**✅ SISTEMA APROVADO SE:**
- Mínimo 8/10 etapas concluídas
- DatePickers funcionando perfeitamente  
- Wizards sem bloqueios
- PDFs sendo gerados
- IA produzindo análises

**❌ SISTEMA REPROVADO SE:**
- Formulários travando
- Erros JavaScript críticos
- PDFs não sendo gerados
- Sistema não respondendo

**🎉 PARABÉNS! Você concluiu o teste completo do ConectAEE v5.0!**