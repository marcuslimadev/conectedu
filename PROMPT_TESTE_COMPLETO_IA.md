# 🤖 PROMPT PARA TESTE COMPLETO DO CONECTAEE v5.0 COM IA

## 📋 **INSTRUÇÕES PARA IA PERPLEXITY**

**Você é um testador automatizado especializado em sistemas educacionais. Sua missão é validar completamente o ConectAEE v5.0, um sistema de gestão de Atendimento Educacional Especializado (AEE).**

---

## 🎯 **OBJETIVO DO TESTE**

Executar uma bateria completa de testes no sistema ConectAEE v5.0 para validar:
- ✅ Funcionalidade de todos os componentes
- ✅ Criação massiva de dados de teste
- ✅ Preenchimento automático de formulários
- ✅ Geração de relatórios e PDFs
- ✅ Sistema de análise com IA
- ✅ Interface responsiva e usabilidade

---

## 🚀 **PASSO A PASSO PARA EXECUÇÃO**

### **ETAPA 1: ACESSO E CONFIGURAÇÃO INICIAL**

1. **Acesse o sistema:**
   - URL: `http://localhost/conectedu/frontend/`
   - Aguarde carregamento completo da página

2. **Faça login:**
   - Use credenciais válidas do sistema
   - Aguarde redirecionamento para dashboard

3. **Verifique o Painel de Desenvolvimento:**
   - Deve aparecer uma barra roxa no topo com "🤖 PAINEL DE TESTES AUTOMATIZADOS"
   - Se não aparecer, abra o console (F12) e digite: `DEV.mostrarPainel()`

4. **Abra o Console do Navegador:**
   - Pressione F12
   - Vá para a aba "Console"
   - Digite: `console.log("✅ Console ativo para testes")`

### **ETAPA 2: VALIDAÇÃO INICIAL DO SISTEMA**

5. **Execute a validação completa:**
   - No console, digite: `DEV.validarSistema()`
   - Aguarde as 5 etapas de validação:
     - 1️⃣ Verificando componentes...
     - 2️⃣ Testando formulários...
     - 3️⃣ Testando relatórios...
     - 4️⃣ Testando geração de PDFs...
     - 5️⃣ Testando sistema IA...
   - **RESULTADO ESPERADO:** "🎉 SISTEMA TOTALMENTE VALIDADO!"

6. **Documente o resultado:**
   - Se sucesso: "✅ Validação inicial aprovada"
   - Se erro: "❌ Erro na validação: [descrever erro]"

### **ETAPA 3: CRIAÇÃO MASSIVA DE DADOS DE TESTE**

7. **Criar base de alunos:**
   - Clique no botão "👥 Criar 5 Alunos" no painel de desenvolvimento
   - OU digite no console: `DEV.criarAlunos()`
   - Observe os logs em tempo real
   - **RESULTADO ESPERADO:** 5 alunos criados com sucesso

8. **Verificar alunos criados:**
   - Navegue para "Alunos" no menu lateral
   - Verifique se aparecem os alunos:
     - Ana Clara Silva Santos
     - João Pedro Oliveira Costa
     - Isabella Fernanda Rodrigues
     - Miguel Henrique dos Santos
     - Sofia Vitória Almeida Souza

### **ETAPA 4: PREENCHIMENTO AUTOMÁTICO DE FORMULÁRIOS**

9. **Preencher todos os formulários:**
   - Clique em "📋 Preencher Formulários" no painel
   - OU digite no console: `DEV.preencherFormularios()`
   - Aguarde as etapas:
     - ✅ Entrevistas preenchidas
     - ✅ PDIs preenchidos
     - ✅ Planos de Atendimento preenchidos

10. **Validar um formulário manualmente:**
    - Navegue para "Novo" → "Entrevista com Responsável"
    - Selecione "Ana Clara Silva Santos"
    - Verifique se o campo de data aceita: `15/03/2010`
    - Teste o calendário clicando no ícone
    - Avance pelas etapas sem bloqueios

### **ETAPA 5: TESTE DOS COMPONENTES DATEPICKER**

11. **Testar DatePickers:**
    - Clique em "📅 Testar DatePickers" no painel
    - Visite diferentes formulários (PDI, Plano de Atendimento)
    - Em cada campo de data, teste:
      - Entrada manual: digite `22/07/2008`
      - Calendário nativo: clique no ícone e selecione data
      - Validação: digite data inválida como `32/13/2025`
    - **RESULTADO ESPERADO:** Campos funcionam perfeitamente

### **ETAPA 6: TESTE DE RELATÓRIOS INTELIGENTES**

12. **Acessar relatórios:**
    - Navegue para "Relatórios" no menu
    - Busque por "Ana Clara"
    - Selecione da lista
    - **RESULTADO ESPERADO:** Informações do aluno aparecem

13. **Gerar relatório:**
    - Clique em "📊 Gerar Relatório"
    - Verifique se aparecem dados completos
    - **RESULTADO ESPERADO:** Relatório com informações pessoais e estatísticas

14. **Testar controles inteligentes:**
    - Se aluno tem dados completos: botões PDF e IA devem estar habilitados
    - Se aluno sem dados: deve aparecer alerta "Atenção: Dados Limitados"
    - **RESULTADO ESPERADO:** Interface reage inteligentemente aos dados

### **ETAPA 7: GERAÇÃO EM LOTE DE PDFS**

15. **Gerar todos os PDFs:**
    - Clique em "📄 Gerar Todos PDFs" no painel
    - Observe a geração para cada um dos 5 alunos
    - **RESULTADO ESPERADO:** Sucesso para todos os alunos

16. **Validar PDF individual:**
    - Na tela de relatórios, com aluno selecionado
    - Clique em "📄 Exportar PDF"
    - **RESULTADO ESPERADO:** PDF abre em nova aba sem erros

### **ETAPA 8: ANÁLISE COM IA CONTEXTUALIZADA**

17. **Executar análise IA em lote:**
    - Clique em "🤖 Análise IA Todos" no painel
    - Aguarde processamento dos 5 alunos
    - **RESULTADO ESPERADO:** Análises concluídas para todos

18. **Testar análise IA individual:**
    - Na tela de relatórios, selecione "João Pedro Oliveira Costa"
    - Gere o relatório
    - Clique em "🤖 Análise com IA"
    - **RESULTADO ESPERADO:** Análise contextualizada sobre TEA e tecnologia

19. **Verificar qualidade da análise:**
    - A análise deve mencionar:
      - Status do acompanhamento baseado no número de atendimentos
      - Recomendações específicas para o perfil do aluno
      - Análise temporal do último atendimento
      - Sugestões personalizadas

### **ETAPA 9: TESTE DE WIZARDS COMPLETOS**

20. **Testar wizard de Entrevista:**
    - Navegue para "Novo" → "Entrevista com Responsável"
    - Use dados de teste para Isabella Fernanda Rodrigues:
      - Nome: Isabella Fernanda Rodrigues
      - Data Nascimento: 08/11/2011
      - Escola: EMEF Cecília Meireles
    - Avance por todas as etapas
    - Submeta o formulário
    - **RESULTADO ESPERADO:** Envio sem bloqueios

21. **Testar wizard de PDI:**
    - Navegue para "Novo" → "PDI"
    - Use dados de Miguel Henrique:
      - Nome: Miguel Henrique dos Santos
      - Data Nascimento: 30/05/2009
      - Necessidades: TDAH
    - Complete todas as 4 etapas
    - **RESULTADO ESPERADO:** PDI salvo com sucesso

### **ETAPA 10: VALIDAÇÃO FINAL COMPLETA**

22. **Executar validação final:**
    - Clique em "✅ Validar Sistema Completo" no painel
    - Aguarde todas as verificações
    - **RESULTADO ESPERADO:** "🎉 SISTEMA TOTALMENTE VALIDADO! Pronto para testes automáticos"

23. **Verificar logs finais:**
    - No console, digite: `console.log("Testes concluídos:", new Date())`
    - Verifique se não há erros JavaScript críticos
    - **RESULTADO ESPERADO:** Console limpo de erros

---

## 📊 **RELATÓRIO DE RESULTADOS ESPERADOS**

### **✅ SUCESSOS OBRIGATÓRIOS**
- [ ] Login efetuado sem problemas
- [ ] Painel de desenvolvimento visível e funcional
- [ ] Validação inicial do sistema aprovada (5 etapas)
- [ ] 5 alunos criados com dados completos
- [ ] Formulários preenchidos automaticamente
- [ ] DatePickers funcionam (entrada manual + calendário)
- [ ] Wizards avançam sem bloqueios
- [ ] Relatórios carregam dados consistentes
- [ ] PDFs gerados sem erros técnicos
- [ ] IA produz análises contextualizadas e úteis
- [ ] Geração em lote funciona para todos os alunos
- [ ] Validação final conclui com sucesso

### **⚠️ ALERTAS ACEITÁVEIS**
- Alertas de "Dados Limitados" para alunos sem informações completas
- Botões desabilitados quando dados são insuficientes
- Mensagens explicativas sobre limitações de funcionalidades

### **❌ ERROS CRÍTICOS (NÃO ACEITÁVEIS)**
- Travamentos em formulários por problemas de data
- Impossibilidade de avançar em wizards
- Erros JavaScript que quebram a interface
- PDFs que não são gerados
- Sistema que não responde a comandos

---

## 🎯 **COMANDOS DE EMERGÊNCIA**

**Se algo não funcionar:**

```javascript
// Recarregar dados de teste
location.reload()
localStorage.setItem('dev_mode', 'true')

// Verificar carregamento
console.log('Vue:', typeof Vue)
console.log('DatePicker:', typeof DatePickerComponent)
console.log('Dados:', typeof DADOS_TESTE_AUTOMATIZADO)

// Forçar painel
DEV.mostrarPainel()

// Status do sistema
console.log('Rota atual:', window.location.hash)
console.log('Token:', localStorage.getItem('token') ? 'Presente' : 'Ausente')
```

---

## 📝 **FORMATO DO RELATÓRIO FINAL**

**Ao concluir, documente:**

### **RESUMO EXECUTIVO**
- Status geral: ✅ Aprovado / ❌ Reprovado
- Tempo total de teste: [X minutos]
- Funcionalidades testadas: [X/12]
- Erros encontrados: [X]

### **DETALHAMENTO POR ETAPA**
- Etapa 1 (Acesso): ✅/❌ + observações
- Etapa 2 (Validação): ✅/❌ + logs
- Etapa 3 (Dados): ✅/❌ + quantidade criada
- [Continue para todas as etapas...]

### **PONTOS FORTES IDENTIFICADOS**
- Interface intuitiva e profissional
- Automação robusta de preenchimento
- IA contextualizada por situação
- [Adicionar outros pontos observados]

### **OPORTUNIDADES DE MELHORIA**
- [Listar apenas se encontrar problemas reais]

### **CONCLUSÃO**
- Sistema está pronto para produção: ✅/❌
- Recomendação para uso: [Sua avaliação]
- Observações finais: [Suas impressões]

---

## 🎉 **MENSAGEM FINAL ESPERADA**

**Ao concluir todos os testes com sucesso, você deve ver:**

```
🎉 SISTEMA TOTALMENTE VALIDADO! Pronto para testes automáticos
✅ Componentes validados
✅ Formulários funcionando  
✅ Relatórios operacionais
✅ PDFs funcionando
✅ IA operacional

ConectAEE v5.0 - Sistema robusto e profissional para gestão de AEE!
```

---

**🚀 EXECUTE ESTE ROTEIRO COMPLETO E DOCUMENTE CADA RESULTADO. O SISTEMA DEVE PASSAR EM TODOS OS TESTES PARA SER CONSIDERADO APROVADO!**