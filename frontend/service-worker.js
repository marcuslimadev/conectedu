// SERVICE WORKER COMPLETAMENTE DESABILITADO
// Este arquivo existe apenas para limpar caches antigos

self.addEventListener('install', event => {
  // Pular espera e ativar imediatamente
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  // Assumir controle de todos os clientes imediatamente
  self.clients.claim();
  
  // Limpar TODOS os caches existentes
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log('🧹 Removendo todos os caches:', cacheNames);
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('✅ Todos os caches foram limpos');
      // Desregistrar este próprio service worker
      return self.registration.unregister();
    }).then(() => {
      console.log('✅ Service Worker desregistrado');
    })
  );
});

// Não interceptar NENHUMA requisição
self.addEventListener('fetch', event => {
  // Deixar todas as requisições passarem normalmente
  return;
});