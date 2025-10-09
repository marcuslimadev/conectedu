// Melhorias de Acessibilidade JavaScript para ConectAEE

(function() {
  'use strict';

  // Adiciona navegação por teclado melhorada
  function enhanceKeyboardNavigation() {
    // Captura eventos de teclado globais
    document.addEventListener('keydown', function(e) {
      // Navegação por Tab melhorada
      if (e.key === 'Tab') {
        document.body.classList.add('using-keyboard');
      }
      
      // Esc para fechar modais/formulários
      if (e.key === 'Escape') {
        const activeModals = document.querySelectorAll('[role="dialog"]');
        activeModals.forEach(modal => {
          if (modal.style.display !== 'none') {
            const cancelBtn = modal.querySelector('[aria-label*="Cancelar"], .cancel-btn');
            if (cancelBtn) cancelBtn.click();
          }
        });
      }
      
      // Enter/Space em elementos com tabindex
      if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute('tabindex')) {
        if (e.target.click && typeof e.target.click === 'function') {
          e.preventDefault();
          e.target.click();
        }
      }
    });

    // Remove classe de navegação por teclado ao usar mouse
    document.addEventListener('mousedown', function() {
      document.body.classList.remove('using-keyboard');
    });
  }

  // Melhora anúncios para leitores de tela
  function enhanceScreenReaderSupport() {
    // Cria região para anúncios dinâmicos
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.id = 'live-announcements';
    document.body.appendChild(liveRegion);

    // Função para anunciar mensagens
    window.announceToScreenReader = function(message, priority = 'polite') {
      const region = document.getElementById('live-announcements');
      if (region) {
        region.setAttribute('aria-live', priority);
        region.textContent = message;
        
        // Limpa após 3 segundos
        setTimeout(() => {
          region.textContent = '';
        }, 3000);
      }
    };
  }

  // Melhora contraste visual baseado em preferências
  function enhanceVisualContrast() {
    // Detecta preferência de alto contraste
    if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
      document.body.classList.add('high-contrast');
    }

    // Detecta preferência de movimento reduzido
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.body.classList.add('reduced-motion');
    }

    // Detecta preferência de esquema de cores
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.body.classList.add('prefers-dark');
    }
  }

  // Melhora validação de formulários com feedback acessível
  function enhanceFormValidation() {
    document.addEventListener('invalid', function(e) {
      e.preventDefault();
      
      const field = e.target;
      const fieldName = field.getAttribute('aria-label') || field.getAttribute('placeholder') || 'Campo';
      let message = '';

      if (field.validity.valueMissing) {
        message = `${fieldName} é obrigatório`;
      } else if (field.validity.typeMismatch) {
        message = `${fieldName} está em formato inválido`;
      } else if (field.validity.tooShort) {
        message = `${fieldName} deve ter pelo menos ${field.minLength} caracteres`;
      } else if (field.validity.tooLong) {
        message = `${fieldName} deve ter no máximo ${field.maxLength} caracteres`;
      } else {
        message = `${fieldName} contém valor inválido`;
      }

      // Adiciona ou atualiza mensagem de erro
      let errorElement = document.getElementById(field.id + '-error');
      if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = field.id + '-error';
        errorElement.className = 'text-red-600 text-sm mt-1';
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'assertive');
        field.parentNode.appendChild(errorElement);
        
        // Associa erro ao campo
        field.setAttribute('aria-describedby', errorElement.id);
      }
      
      errorElement.textContent = message;
      field.classList.add('border-red-500');
      
      // Anuncia erro para leitores de tela
      if (window.announceToScreenReader) {
        window.announceToScreenReader(message, 'assertive');
      }
      
      // Foca no campo com erro
      field.focus();
    });

    // Remove erros quando campo fica válido
    document.addEventListener('input', function(e) {
      const field = e.target;
      if (field.checkValidity()) {
        const errorElement = document.getElementById(field.id + '-error');
        if (errorElement) {
          errorElement.remove();
          field.removeAttribute('aria-describedby');
        }
        field.classList.remove('border-red-500');
      }
    });
  }

  // Melhora navegação por headings
  function enhanceHeadingNavigation() {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading, index) => {
      if (!heading.id) {
        heading.id = `heading-${index + 1}`;
      }
    });
  }

  // Adiciona skip links dinâmicos
  function addSkipLinks() {
    const skipNav = document.createElement('nav');
    skipNav.className = 'skip-navigation';
    skipNav.setAttribute('aria-label', 'Links de navegação rápida');
    
    const skipList = document.createElement('ul');
    skipList.className = 'skip-links';
    
    // Skip para conteúdo principal
    const mainContent = document.querySelector('main, [role="main"], #main-content');
    if (mainContent) {
      if (!mainContent.id) mainContent.id = 'main-content';
      
      const skipToMain = document.createElement('li');
      skipToMain.innerHTML = `<a href="#${mainContent.id}" class="skip-link">Ir para conteúdo principal</a>`;
      skipList.appendChild(skipToMain);
    }
    
    // Skip para navegação
    const navigation = document.querySelector('nav, [role="navigation"]');
    if (navigation) {
      if (!navigation.id) navigation.id = 'main-navigation';
      
      const skipToNav = document.createElement('li');
      skipToNav.innerHTML = `<a href="#${navigation.id}" class="skip-link">Ir para navegação</a>`;
      skipList.appendChild(skipToNav);
    }
    
    skipNav.appendChild(skipList);
    document.body.insertBefore(skipNav, document.body.firstChild);
  }

  // Melhora tabelas com cabeçalhos apropriados
  function enhanceTableAccessibility() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
      // Adiciona scope aos cabeçalhos
      const headers = table.querySelectorAll('th');
      headers.forEach(header => {
        if (!header.hasAttribute('scope')) {
          // Determina se é cabeçalho de coluna ou linha
          const isRowHeader = header.parentElement.firstElementChild === header &&
                             table.querySelector('tbody th') === header;
          header.setAttribute('scope', isRowHeader ? 'row' : 'col');
        }
      });
      
      // Adiciona caption se não existe
      if (!table.querySelector('caption') && !table.hasAttribute('aria-label')) {
        const heading = table.previousElementSibling;
        if (heading && /^H[1-6]$/.test(heading.tagName)) {
          table.setAttribute('aria-labelledby', heading.id || 'table-heading');
          if (!heading.id) heading.id = 'table-heading';
        }
      }
    });
  }

  // Monitora mudanças de foco para debug (apenas em desenvolvimento)
  function debugFocusManagement() {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      document.addEventListener('focusin', function(e) {
        console.log('Focus entered:', e.target);
      });
      
      document.addEventListener('focusout', function(e) {
        console.log('Focus left:', e.target);
      });
    }
  }

  // Função principal de inicialização
  function initializeAccessibility() {
    // Aguarda DOM carregar completamente
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(initializeAccessibility, 100);
      });
      return;
    }
    
    enhanceKeyboardNavigation();
    enhanceScreenReaderSupport();
    enhanceVisualContrast();
    enhanceFormValidation();
    enhanceHeadingNavigation();
    addSkipLinks();
    enhanceTableAccessibility();
    debugFocusManagement();
    
    // Anuncia carregamento completo
    setTimeout(() => {
      if (window.announceToScreenReader) {
        window.announceToScreenReader('Sistema ConectAEE carregado e pronto para uso');
      }
    }, 1000);
  }

  // Inicia melhorias de acessibilidade
  initializeAccessibility();

  // Reaplica melhorias quando conteúdo dinâmico é carregado
  const observer = new MutationObserver(function(mutations) {
    let shouldReapply = false;
    
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'TABLE' || node.querySelector('table')) {
              enhanceTableAccessibility();
            }
            if (node.tagName === 'FORM' || node.querySelector('form')) {
              shouldReapply = true;
            }
          }
        });
      }
    });
    
    if (shouldReapply) {
      setTimeout(() => {
        enhanceHeadingNavigation();
        enhanceTableAccessibility();
      }, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();