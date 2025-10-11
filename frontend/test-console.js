// Script para testar no console do navegador
// Cole este código no console (F12) da página

console.log('=== TESTE DE DEPURAÇÃO ===');

// 1. Verificar se CONFIG existe
console.log('1. CONFIG:', typeof CONFIG !== 'undefined' ? CONFIG : 'UNDEFINED');

// 2. Verificar se axios existe
console.log('2. axios:', typeof axios !== 'undefined' ? 'EXISTS' : 'UNDEFINED');

// 3. Verificar se api existe
console.log('3. api:', typeof api !== 'undefined' ? api : 'UNDEFINED');

// 4. Testar chamada direta
if (typeof api !== 'undefined') {
  console.log('4. Testando API...');
  api.get('/schools')
    .then(response => {
      console.log('✅ API FUNCIONANDO:', response.data);
      if (response.data && response.data.data && response.data.data.rows) {
        console.log('✅ ESCOLAS ENCONTRADAS:', response.data.data.rows.length);
        response.data.data.rows.forEach((escola, index) => {
          console.log(`   Escola ${index + 1}: ${escola.name}`);
        });
      } else {
        console.error('❌ ESTRUTURA INVÁLIDA:', response.data);
      }
    })
    .catch(error => {
      console.error('❌ ERRO NA API:', error);
    });
} else {
  console.error('4. ❌ API não está disponível');
}

// 5. Verificar se Vue app existe
console.log('5. Vue app:', typeof window.app !== 'undefined' ? 'EXISTS' : 'UNDEFINED');

// 6. Verificar componente EscolasTW
console.log('6. EscolasTW:', typeof EscolasTW !== 'undefined' ? 'EXISTS' : 'UNDEFINED');