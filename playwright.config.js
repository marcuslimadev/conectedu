// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Configuração do Playwright para testes do ConectEDU
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  
  /* Timeout máximo para cada teste */
  timeout: 60 * 1000,
  
  /* Configuração de expect */
  expect: {
    timeout: 10000
  },
  
  /* Executar testes em paralelo */
  fullyParallel: false,
  
  /* Falhar se algum teste usar .only */
  forbidOnly: !!process.env.CI,
  
  /* Retry em CI */
  retries: process.env.CI ? 2 : 0,
  
  /* Workers em paralelo */
  workers: process.env.CI ? 1 : 2,
  
  /* Reporter */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  
  /* Configurações globais */
  use: {
    /* URL base do sistema */
    baseURL: 'http://localhost/conectedu/frontend/',
    
    /* Screenshot em falhas */
    screenshot: 'only-on-failure',
    
    /* Vídeo em falhas */
    video: 'retain-on-failure',
    
    /* Trace em retry */
    trace: 'on-first-retry',
    
    /* Ignorar erros HTTPS */
    ignoreHTTPSErrors: true,
    
    /* Viewport padrão */
    viewport: { width: 1280, height: 720 },
    
    /* User agent */
    userAgent: 'Playwright-ConectEDU-Tests'
  },

  /* Projetos de teste para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Permissões para microfone (gravação de áudio)
        permissions: ['microphone'],
        contextOptions: {
          permissions: ['microphone']
        }
      },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Testes mobile */
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        permissions: ['microphone']
      },
    },
  ],

  /* Servidor local (se necessário) */
  // webServer: {
  //   command: 'php -S localhost:8000 -t frontend/',
  //   url: 'http://localhost:8000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
