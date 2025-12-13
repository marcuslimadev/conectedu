# 🔄 FORÇAR ATUALIZAÇÃO DO SISTEMA

## Problema
O navegador está com cache antigo e não mostra os títulos atualizados do formulário PAI.

## ✅ SOLUÇÃO RÁPIDA (RECOMENDADA)

### 1️⃣ Abra o Console do Navegador
- Pressione `F12` ou `CTRL+SHIFT+I`
- Vá na aba **Console**

### 2️⃣ Cole e Execute Este Código

```javascript
// Limpa TUDO e recarrega
(async function() {
  console.log('🧹 Limpando cache...');
  
  // Limpar localStorage
  localStorage.clear();
  console.log('✅ localStorage limpo');
  
  // Limpar sessionStorage  
  sessionStorage.clear();
  console.log('✅ sessionStorage limpo');
  
  // Limpar Service Workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (let registration of registrations) {
      await registration.unregister();
    }
    console.log('✅ Service Workers removidos');
  }
  
  // Limpar Cache API
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    for (let cacheName of cacheNames) {
      await caches.delete(cacheName);
    }
    console.log('✅ Cache API limpo');
  }
  
  console.log('🔄 Recarregando página...');
  setTimeout(() => {
    window.location.reload(true);
  }, 500);
})();
```

### 3️⃣ Pressione ENTER

O sistema vai limpar tudo e recarregar automaticamente!

---

## 🔧 ALTERNATIVA 1: Hard Refresh Manual

1. Pressione **CTRL + SHIFT + DELETE**
2. Selecione "Imagens e arquivos em cache"
3. Clique em "Limpar dados"
4. Feche TODAS as abas do ConectAEE
5. Abra uma nova aba e acesse novamente

---

## 🔧 ALTERNATIVA 2: Modo Anônimo

1. Abra uma janela anônima: **CTRL + SHIFT + N** (Chrome) ou **CTRL + SHIFT + P** (Firefox)
2. Acesse: `http://localhost/conectedu/frontend/`
3. Faça login
4. Vá em "PAI - Plano de Atendimento Individual"

✅ No modo anônimo você verá os títulos corretos!

---

## ✅ O Que Você Deve Ver Depois:

As 7 abas do formulário PAI:

1. **1. Identificação do Aluno e da Equipe**
2. **2. Histórico do Estudante e Contextualização**
3. **3. Avaliação Diagnóstica e Levantamento de Necessidades**
4. **4. Definição de Objetivos e Metas**
5. **5. Estratégias e Recursos Pedagógicos**
6. **Avaliação e Acompanhamento**
7. **Assinaturas e Consenso**

---

## 🆘 Se AINDA não funcionar:

1. Verifique se você está em: `http://localhost/conectedu/frontend/#/pai-completo`
2. Abra o console (F12) e procure por erros em vermelho
3. Copie os erros e me envie

---

## 📝 Nota Técnica

O código foi atualizado corretamente:
- Commit: `ea2db28` - "fix: sistema de versionamento automático"
- Data: 12/12/2025
- Arquivos alterados: `spa-tailwind.js`, `index.html`

O problema é 100% cache do navegador! 🎯
