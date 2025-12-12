const { test, expect } = require('@playwright/test');

test.describe('ConectEDU - Teste Rápido de Sanidade', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/');
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/ConectEDU|ConectAEE|Login/i);
    
    // Verificar se formulário de login existe
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Página inicial carregada com sucesso!');
  });

  test('deve fazer login como admin', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/');
    
    // Aguardar formulário de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Preencher credenciais
    await page.fill('input[type="email"]', 'admin@teste.com');
    await page.fill('input[type="password"]', 'Teste@123');
    
    // Fazer login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento (pode ser / ou /dashboard)
    await page.waitForTimeout(3000);
    
    // Verificar se NÃO está mais na página de login
    const currentUrl = page.url();
    expect(currentUrl).not.toContain('/login');
    
    console.log('✅ Login realizado com sucesso!');
  });

  test('deve navegar para página de alunos', async ({ page }) => {
    // Login
    await page.goto('http://localhost/conectedu/frontend/');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@teste.com');
    await page.fill('input[type="password"]', 'Teste@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Navegar para alunos
    await page.goto('http://localhost/conectedu/frontend/#/alunos');
    await page.waitForTimeout(2000);
    
    // Verificar se há lista de alunos ou botão de cadastrar
    const alunosSection = page.locator('h1, h2, h3, .title').filter({ hasText: /aluno/i });
    await expect(alunosSection.first()).toBeVisible({ timeout: 10000 });
    
    console.log('✅ Página de alunos acessível!');
  });
});
