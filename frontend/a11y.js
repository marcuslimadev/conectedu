// Sistema de Acessibilidade - ConectEdu
class AccessibilityManager {
  constructor() {
    this.settings = {
      theme: 'light',
      fontSize: 'normal',
      fontFamily: 'normal',
      lineSpacing: 'normal',
      contrast: 'normal',
      highlightLinks: false,
      largeCursor: false,
      focusVisible: false,
      reduceMotion: false,
      vlibras: true
    };
    this.api = { mode: null, detected: false };
    this.saveTimer = null;
    this.isHydrating = false;
    this.init();
  }

  init() {
    this.loadSettings();
    this.createFloatingButton();
    this.createAccessibilityPanel();
    this.loadVlibras();
    this.applySettings();
    this.updatePanelUI();
    this.setupKeyboardShortcuts();
    this.syncFromServer();
  }

  loadSettings() {
    const saved = localStorage.getItem('conectedu-a11y-settings');
    if (saved) {
      this.settings = { ...this.settings, ...JSON.parse(saved) };
    }
  }

  saveSettings() {
    localStorage.setItem('conectedu-a11y-settings', JSON.stringify(this.settings));
    this.scheduleSaveToServer();
  }

  createFloatingButton() {
    const button = document.createElement('button');
    button.className = 'a11y-floating-btn';
    button.innerHTML = '♿';
    button.setAttribute('aria-label', 'Abrir opções de acessibilidade');
    button.title = 'Acessibilidade';
    button.addEventListener('click', () => this.togglePanel());
    document.body.appendChild(button);
  }

  createAccessibilityPanel() {
    const panel = document.createElement('div');
    panel.className = 'a11y-panel';
    panel.innerHTML = this.getPanelHTML();
    document.body.appendChild(panel);
    this.setupPanelEvents(panel);
    this.panel = panel;
  }

  getPanelHTML() {
    return `
      <div class="a11y-panel-header">
        <h3 class="a11y-panel-title">Acessibilidade</h3>
        <button class="a11y-panel-close" aria-label="Fechar painel">&times;</button>
      </div>
      <div class="a11y-panel-content">
        <div class="a11y-section">
          <h4 class="a11y-section-title">Aparência</h4>
          <div class="a11y-option">
            <span class="a11y-option-label">Modo Escuro</span>
            <div class="a11y-toggle" data-setting="theme" data-value="dark">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="a11y-section">
          <h4 class="a11y-section-title">Fonte</h4>
          <div class="a11y-option">
            <span class="a11y-option-label">Tamanho</span>
            <select class="a11y-select" data-setting="fontSize">
              <option value="small">Pequena</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
              <option value="xlarge">Muito Grande</option>
              <option value="xxlarge">Extra Grande</option>
            </select>
          </div>
          <div class="a11y-option">
            <span class="a11y-option-label">Espaçamento</span>
            <select class="a11y-select" data-setting="lineSpacing">
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxado</option>
              <option value="extra">Extra</option>
            </select>
          </div>
          <div class="a11y-option">
            <span class="a11y-option-label">Fonte para Disléxicos</span>
            <div class="a11y-toggle" data-setting="fontFamily" data-value="dyslexic">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="a11y-section">
          <h4 class="a11y-section-title">Contraste</h4>
          <div class="a11y-option">
            <span class="a11y-option-label">Alto Contraste</span>
            <div class="a11y-toggle" data-setting="contrast" data-value="high">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="a11y-section">
          <h4 class="a11y-section-title">Navegação</h4>
          <div class="a11y-option">
            <span class="a11y-option-label">Destacar Links</span>
            <div class="a11y-toggle" data-setting="highlightLinks" data-value="true">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
          <div class="a11y-option">
            <span class="a11y-option-label">Cursor Grande</span>
            <div class="a11y-toggle" data-setting="largeCursor" data-value="true">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
          <div class="a11y-option">
            <span class="a11y-option-label">Foco Visível</span>
            <div class="a11y-toggle" data-setting="focusVisible" data-value="true">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
          <div class="a11y-option">
            <span class="a11y-option-label">Reduzir Animações</span>
            <div class="a11y-toggle" data-setting="reduceMotion" data-value="true">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="a11y-section">
          <h4 class="a11y-section-title">Ferramentas</h4>
          <div class="a11y-option">
            <span class="a11y-option-label">Vlibras (Libras)</span>
            <div class="a11y-toggle" data-setting="vlibras" data-value="true">
              <div class="a11y-toggle-slider"></div>
            </div>
          </div>
        </div>
        <div class="a11y-section">
          <h4 class="a11y-section-title">Ações</h4>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="a11y-button" onclick="a11yManager.resetSettings()">Resetar</button>
            <button class="a11y-button secondary" onclick="a11yManager.togglePanel()">Fechar</button>
          </div>
        </div>
      </div>
    `;
  }

  setupPanelEvents(panel) {
    panel.querySelector('.a11y-panel-close').addEventListener('click', () => this.togglePanel());
    
    panel.querySelectorAll('.a11y-toggle').forEach(toggle => {
      toggle.addEventListener('click', () => {
        const setting = toggle.dataset.setting;
        const value = toggle.dataset.value;
        this.toggleSetting(setting, value);
      });
    });

    panel.querySelectorAll('.a11y-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const setting = e.target.dataset.setting;
        const value = e.target.value;
        this.updateSetting(setting, value);
      });
    });
  }

  loadVlibras() {
    if (this.settings.vlibras) {
      if (document.getElementById('vlibras-script')) return; // Evita carregar duas vezes
      
      const script = document.createElement('script');
      script.id = 'vlibras-script';
      script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
      script.onload = () => {
        if (window.VLibras) {
          try {
            new window.VLibras.Widget('https://vlibras.gov.br/app');
          } catch (e) {
            console.warn('ConectEDU: Erro ao iniciar VLibras:', e);
          }
        }
      };
      document.head.appendChild(script);
    }
  }

  togglePanel() {
    const isOpen = this.panel.classList.toggle('open');
    document.body.classList.toggle('a11y-panel-is-open', isOpen);
  }

  toggleSetting(setting, value) {
    const currentValue = this.settings[setting];
    const newValue = currentValue === value ? (setting === 'theme' ? 'light' : false) : value;
    this.updateSetting(setting, newValue);
  }

  updateSetting(setting, value) {
    this.settings[setting] = value;
    this.saveSettings();
    this.applySettings();
    this.updatePanelUI();
    this.showStatus(`${setting} alterado`);
  }

  updatePanelUI() {
    this.panel.querySelectorAll('.a11y-toggle').forEach(toggle => {
      const setting = toggle.dataset.setting;
      const value = toggle.dataset.value;
      const isActive = this.settings[setting] === value;
      toggle.classList.toggle('active', isActive);
    });

    this.panel.querySelectorAll('.a11y-select').forEach(select => {
      const setting = select.dataset.setting;
      select.value = this.settings[setting];
    });
  }

  applySettings() {
    const body = document.body;
    body.setAttribute('data-theme', this.settings.theme);
    body.setAttribute('data-font-size', this.settings.fontSize);
    body.setAttribute('data-font-family', this.settings.fontFamily);
    body.setAttribute('data-line-spacing', this.settings.lineSpacing);
    body.setAttribute('data-contrast', this.settings.contrast);
    body.setAttribute('data-highlight', this.settings.highlightLinks ? 'links' : 'none');
    body.setAttribute('data-cursor', this.settings.largeCursor ? 'large' : 'default');
    body.setAttribute('data-focus', this.settings.focusVisible ? 'visible' : 'auto');
    body.setAttribute('data-reduced-motion', this.settings.reduceMotion ? 'true' : 'false');
    
    // Aplicar fonte disléxica globalmente
    if (this.settings.fontFamily === 'dyslexic') {
      body.style.fontFamily = "'OpenDyslexic', 'Comic Sans MS', cursive";
      body.style.letterSpacing = "0.05em";
      body.style.lineHeight = "1.6";
    } else {
      body.style.fontFamily = "";
      body.style.letterSpacing = "";
      body.style.lineHeight = "";
    }
    
    // Sincronizar com Tailwind dark mode
    document.documentElement.classList.toggle('dark', this.settings.theme === 'dark');
    
    const vlibrasWidget = document.querySelector('.vlibras-widget');
    if (vlibrasWidget) {
      vlibrasWidget.style.display = this.settings.vlibras ? 'block' : 'none';
    }
  }
  
  getToken() {
    return localStorage.getItem('token');
  }
  
  async detectApiRouting() {
    if (this.api.detected) return this.api.mode;
    const base = (window.CONFIG && window.CONFIG.API_BASE) || '';
    if (!base) {
      this.api.detected = true;
      this.api.mode = 'path';
      return this.api.mode;
    }
    const tryFetch = async (url) => {
      try {
        const r = await fetch(url, { method: 'GET', headers: { 'Accept': 'application/json' } });
        return r.ok;
      } catch (_) {
        return false;
      }
    };
    const okPath = await tryFetch(base.replace(/\/$/, '') + '/health');
    if (okPath) {
      this.api.mode = 'path';
      this.api.detected = true;
      return this.api.mode;
    }
    const okQuery = await tryFetch(base + (base.includes('?') ? '&' : '?') + 'action=health');
    if (okQuery) {
      this.api.mode = 'query';
      this.api.detected = true;
      return this.api.mode;
    }
    this.api.detected = true;
    this.api.mode = 'path';
    return this.api.mode;
  }
  
  async buildApiUrl(route) {
    const base = (window.CONFIG && window.CONFIG.API_BASE) || '';
    const r = route.startsWith('/') ? route : '/' + route;
    const mode = await this.detectApiRouting();
    if (mode === 'query') {
      return base + (base.includes('?') ? '&' : '?') + 'action=' + r.slice(1);
    }
    return base.replace(/\/$/, '') + r;
  }
  
  async fetchFromServer() {
    const token = this.getToken();
    if (!token) return null;
    const url = await this.buildApiUrl('/user/preferences');
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });
    if (!r.ok) return null;
    const json = await r.json();
    return json?.data?.preferences || json?.preferences || null;
  }
  
  async saveToServer() {
    const token = this.getToken();
    if (!token) return;
    const url = await this.buildApiUrl('/user/preferences');
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ preferences: this.settings })
    });
  }
  
  scheduleSaveToServer() {
    if (this.isHydrating) return;
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveToServer().catch(() => {});
    }, 400);
  }
  
  async syncFromServer() {
    const token = this.getToken();
    if (!token) return;
    this.isHydrating = true;
    try {
      const serverPrefs = await this.fetchFromServer();
      if (serverPrefs && typeof serverPrefs === 'object') {
        this.settings = { ...this.settings, ...serverPrefs };
        this.saveSettings();
        this.applySettings();
        this.updatePanelUI();
      }
    } catch (_) {
      // ignore
    } finally {
      this.isHydrating = false;
    }
  }

  resetSettings() {
    this.settings = {
      theme: 'light',
      fontSize: 'normal',
      fontFamily: 'normal',
      lineSpacing: 'normal',
      contrast: 'normal',
      highlightLinks: false,
      largeCursor: false,
      focusVisible: false,
      reduceMotion: false,
      vlibras: true
    };
    this.saveSettings();
    this.applySettings();
    this.updatePanelUI();
    this.showStatus('Configurações resetadas');
  }

  showStatus(message) {
    const status = document.createElement('div');
    status.className = 'a11y-status';
    status.textContent = message;
    document.body.appendChild(status);
    
    setTimeout(() => status.classList.add('show'), 100);
    setTimeout(() => {
      status.classList.remove('show');
      setTimeout(() => document.body.removeChild(status), 300);
    }, 2000);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.togglePanel();
      }
      if (e.altKey && e.key === 'd') {
        e.preventDefault();
        this.toggleSetting('theme', 'dark');
      }
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        this.toggleSetting('fontFamily', 'dyslexic');
      }
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        this.toggleSetting('contrast', 'high');
      }
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        this.toggleSetting('highlightLinks', true);
      }
    });
  }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  window.a11yManager = new AccessibilityManager();
});

// Ancillary accessibility features
(function() {
  // Skip links and ARIA roles
  document.addEventListener('DOMContentLoaded', () => {
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Pular para o conteúdo principal';
    document.body.insertBefore(skipLink, document.body.firstChild);

    const mainContent = document.querySelector('#app');
    if (mainContent) {
      mainContent.setAttribute('role', 'main');
      mainContent.id = 'main-content';
    }
  });

  // Keyboard navigation detection
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
  });

  // Focus styles
  const style = document.createElement('style');
  style.textContent = `
    .keyboard-navigation *:focus {
      outline: 2px solid #3b82f6 !important;
      outline-offset: 2px !important;
    }
  `;
  document.head.appendChild(style);
})();
