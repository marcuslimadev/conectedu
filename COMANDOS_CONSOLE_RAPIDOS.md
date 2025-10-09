# ⚡ COMANDOS RÁPIDOS PARA CONSOLE - CONECTAEE v5.0

## 🎯 **COMANDOS PRINCIPAIS DE TESTE**

### **Validação Completa do Sistema**
```javascript
DEV.validarSistema()
```
*Executa todas as 5 etapas de validação automaticamente*

### **Criar Base de Dados de Teste**
```javascript
DEV.criarAlunos()
```
*Cria 5 alunos fictícios com dados completos*

### **Preencher Todos os Formulários**
```javascript
DEV.preencherFormularios()
```
*Preenche automaticamente entrevistas, PDIs e planos*

### **Testar Todos os DatePickers**
```javascript
DEV.testarDatePickers()
```
*Valida funcionamento dos campos de data*

### **Gerar Todos os PDFs**
```javascript
DEV.gerarTodosPDFs()
```
*Gera PDFs para todos os 5 alunos de teste*

### **Executar Análises IA**
```javascript
DEV.analisarTodosIA()
```
*Executa análise IA para todos os alunos*

---

## 🔧 **COMANDOS DE VERIFICAÇÃO**

### **Status dos Componentes**
```javascript
console.log('Vue:', typeof Vue)
console.log('DatePicker:', typeof DatePickerComponent)
console.log('Dados Teste:', typeof DADOS_TESTE_AUTOMATIZADO)
console.log('DEV Tools:', typeof DEV)
```

### **Verificar Estado do Sistema**
```javascript
console.log('Rota atual:', window.location.hash)
console.log('Token presente:', localStorage.getItem('token') ? 'SIM' : 'NÃO')
console.log('Modo DEV:', localStorage.getItem('dev_mode'))
```

### **Listar Alunos Criados**
```javascript
if (window.app && window.app.alunos) {
    console.log('Alunos cadastrados:', window.app.alunos.length)
    window.app.alunos.forEach((aluno, i) => {
        console.log(`${i+1}. ${aluno.nome}`)
    })
}
```

---

## 🆘 **COMANDOS DE EMERGÊNCIA**

### **Resetar Sistema**
```javascript
location.reload()
localStorage.setItem('dev_mode', 'true')
```

### **Forçar Painel de Desenvolvimento**
```javascript
DEV.mostrarPainel()
```

### **Limpar Dados de Teste**
```javascript
localStorage.removeItem('alunos_teste')
localStorage.removeItem('dados_preenchidos')
console.log('✅ Dados de teste removidos')
```

### **Verificar Erros no Console**
```javascript
console.clear()
console.log('🧹 Console limpo - observe novos erros')
```

---

## 📊 **COMANDOS DE ANÁLISE**

### **Contar Elementos na Página**
```javascript
console.log('Formulários:', document.querySelectorAll('form').length)
console.log('DatePickers:', document.querySelectorAll('.date-picker').length)
console.log('Botões:', document.querySelectorAll('button').length)
```

### **Verificar DatePickers Ativos**
```javascript
document.querySelectorAll('.date-picker input').forEach((input, i) => {
    console.log(`DatePicker ${i+1}:`, input.value || 'vazio')
})
```

### **Status de Carregamento**
```javascript
console.log('DOM ready:', document.readyState)
console.log('Vue montado:', !!document.getElementById('app').__vue__)
```

---

## 🎯 **SEQUÊNCIA COMPLETA DE TESTE**

**Cole esta sequência para teste completo automatizado:**

```javascript
console.log('🚀 Iniciando teste completo ConectAEE v5.0...')

// 1. Validar sistema
DEV.validarSistema()

setTimeout(() => {
    // 2. Criar alunos
    console.log('📝 Criando alunos de teste...')
    DEV.criarAlunos()
    
    setTimeout(() => {
        // 3. Preencher formulários
        console.log('📋 Preenchendo formulários...')
        DEV.preencherFormularios()
        
        setTimeout(() => {
            // 4. Gerar PDFs
            console.log('📄 Gerando PDFs...')
            DEV.gerarTodosPDFs()
            
            setTimeout(() => {
                // 5. Análise IA
                console.log('🤖 Executando análises IA...')
                DEV.analisarTodosIA()
                
                setTimeout(() => {
                    console.log('🎉 TESTE COMPLETO FINALIZADO!')
                    console.log('✅ Verifique os resultados no painel')
                }, 3000)
            }, 2000)
        }, 2000)
    }, 2000)
}, 2000)
```

---

## 📱 **COMANDOS PARA TESTE RESPONSIVO**

### **Simular Mobile**
```javascript
// Redimensionar para mobile
window.resizeTo(375, 667)
console.log('📱 Modo mobile ativado')
```

### **Simular Tablet**
```javascript
// Redimensionar para tablet
window.resizeTo(768, 1024)
console.log('📱 Modo tablet ativado')
```

### **Voltar Desktop**
```javascript
// Redimensionar para desktop
window.resizeTo(1920, 1080)
console.log('🖥️ Modo desktop ativado')
```

---

## 🔍 **COMANDOS DE DEBUG**

### **Inspecionar Elemento Específico**
```javascript
// Para DatePicker
console.log('DatePickers encontrados:', document.querySelectorAll('.date-picker'))

// Para formulários
console.log('Formulários ativos:', document.querySelectorAll('form'))

// Para botões
console.log('Botões encontrados:', document.querySelectorAll('button'))
```

### **Verificar Estado do Vue**
```javascript
if (window.app) {
    console.log('Vue App:', window.app)
    console.log('Rota atual:', window.app.$route?.name)
    console.log('Dados:', Object.keys(window.app.$data))
}
```

---

## 💡 **DICAS DE USO**

1. **Sempre aguarde** comandos terminarem antes do próximo
2. **Use setTimeout()** para dar tempo entre comandos
3. **Observe os logs** em tempo real no console
4. **F5 para resetar** se algo travar
5. **F12 sempre aberto** durante os testes

---

**🎯 Use estes comandos para teste rápido e eficiente do ConectAEE v5.0!**