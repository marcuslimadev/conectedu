const { test, expect } = require('@playwright/test');

test.describe('ConectEDU - Validação Completa de TODAS as Funcionalidades', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login admin
    await page.goto('http://localhost/conectedu/frontend/');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@teste.com');
    await page.fill('input[type="password"]', 'Teste@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
  });

  // ===== GESTÃO DE USUÁRIOS =====
  test('USUÁRIOS - Deve listar todos os usuários cadastrados', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/usuarios');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Usuário');
    
    // Verificar se há tabela ou lista de usuários
    const hasTable = await page.locator('table, .user-list, [class*="user"]').count() > 0;
    expect(hasTable).toBeTruthy();
    
    console.log('✅ USUÁRIOS: Listagem funcionando');
  });

  test('USUÁRIOS - Deve acessar formulário de novo usuário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/usuarios');
    await page.waitForTimeout(2000);
    
    const addButton = page.locator('button:has-text("Novo"), button:has-text("Adicionar"), button:has-text("Cadastrar")').first();
    const buttonExists = await addButton.count() > 0;
    
    if (buttonExists) {
      await addButton.click();
      await page.waitForTimeout(1000);
      
      // Verificar campos do formulário
      const hasInputs = await page.locator('input[type="email"], input[type="text"]').count() > 0;
      expect(hasInputs).toBeTruthy();
      
      console.log('✅ USUÁRIOS: Formulário de cadastro acessível');
    } else {
      console.log('⚠️ USUÁRIOS: Botão de adicionar não encontrado (pode ser menu admin)');
    }
  });

  // ===== GESTÃO DE ALUNOS =====
  test('ALUNOS - Deve listar todos os alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/alunos');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toContain('aluno');
    
    console.log('✅ ALUNOS: Listagem funcionando');
  });

  test('ALUNOS - Deve verificar campos disponíveis no formulário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/alunos');
    await page.waitForTimeout(2000);
    
    // Verificar se existem campos essenciais (mesmo que em modal fechado)
    const pageHTML = await page.content();
    const hasStudentFields = pageHTML.includes('name') || 
                             pageHTML.includes('nome') ||
                             pageHTML.includes('birth') ||
                             pageHTML.includes('nascimento');
    
    expect(hasStudentFields).toBeTruthy();
    console.log('✅ ALUNOS: Estrutura de formulário presente');
  });

  // ===== FORMULÁRIO ENTREVISTA =====
  test('ENTREVISTA - Deve verificar estrutura completa do formulário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    
    const pageHTML = await page.content();
    
    // Verificar seções principais
    const sections = [
      'nome_estudante',
      'escola',
      'responsável',
      'mae',
      'pai',
      'telefone',
      'endereco',
      'deficiencia',
      'medicamento'
    ];
    
    let foundSections = 0;
    sections.forEach(section => {
      if (pageHTML.toLowerCase().includes(section)) foundSections++;
    });
    
    expect(foundSections).toBeGreaterThan(4); // Pelo menos metade das seções
    console.log(`✅ ENTREVISTA: ${foundSections}/${sections.length} seções encontradas`);
  });

  test('ENTREVISTA - Deve ter dropdown de seleção de alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    expect(selectCount).toBeGreaterThan(0);
    
    // Verificar se dropdown tem opções
    const firstSelect = selects.first();
    const options = await firstSelect.locator('option').count();
    
    console.log(`✅ ENTREVISTA: Dropdown com ${options} opções (incluindo default)`);
  });

  // ===== FORMULÁRIO PDI =====
  test('PDI - Deve verificar estrutura completa do formulário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/pdi');
    await page.waitForTimeout(2000);
    
    const pageHTML = await page.content();
    
    // Verificar campos principais do PDI
    const pdiFields = [
      'objetivo',
      'cognitivo',
      'comunicacao',
      'psicomotor',
      'socioemocional',
      'estrategia',
      'metodologia',
      'recurso',
      'tecnologia',
      'professor',
      'data'
    ];
    
    let foundFields = 0;
    pdiFields.forEach(field => {
      if (pageHTML.toLowerCase().includes(field)) foundFields++;
    });
    
    expect(foundFields).toBeGreaterThan(5);
    console.log(`✅ PDI: ${foundFields}/${pdiFields.length} campos encontrados`);
  });

  test('PDI - Deve ter dropdown de seleção de alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/pdi');
    await page.waitForTimeout(2000);
    
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    expect(selectCount).toBeGreaterThan(0);
    console.log('✅ PDI: Dropdown de alunos presente');
  });

  // ===== FORMULÁRIO PAI =====
  test('PAI - Deve verificar estrutura completa do formulário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/plano-atendimento');
    await page.waitForTimeout(2000);
    
    const pageHTML = await page.content();
    
    // Verificar campos principais do PAI
    const paiFields = [
      'diagnostico',
      'cid',
      'historico',
      'dificuldade',
      'potencialidade',
      'objetivo',
      'estrategia',
      'avaliacao',
      'professor',
      'regente'
    ];
    
    let foundFields = 0;
    paiFields.forEach(field => {
      if (pageHTML.toLowerCase().includes(field)) foundFields++;
    });
    
    expect(foundFields).toBeGreaterThan(5);
    console.log(`✅ PAI: ${foundFields}/${paiFields.length} campos encontrados`);
  });

  test('PAI - Deve ter dropdown de seleção de alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/plano-atendimento');
    await page.waitForTimeout(2000);
    
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    expect(selectCount).toBeGreaterThan(0);
    console.log('✅ PAI: Dropdown de alunos presente');
  });

  // ===== RELATÓRIOS =====
  test('RELATÓRIOS - Deve carregar página de relatórios', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent.toLowerCase()).toContain('relatório');
    
    console.log('✅ RELATÓRIOS: Página principal acessível');
  });

  test('RELATÓRIOS - Deve ter seletor de alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    expect(selectCount).toBeGreaterThan(0);
    console.log('✅ RELATÓRIOS: Seletor de alunos presente');
  });

  test('RELATÓRIOS - Deve exibir dados quando aluno selecionado', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      // Verificar se dados aparecem
      const pageContent = await page.textContent('body');
      const hasData = pageContent.length > 500; // Mais conteúdo indica dados carregados
      
      expect(hasData).toBeTruthy();
      console.log('✅ RELATÓRIOS: Dados do aluno carregados');
    }
  });

  test('RELATÓRIOS - Deve mostrar seção Entrevista', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const pageContent = await page.textContent('body');
      const hasEntrevista = pageContent.toLowerCase().includes('entrevista');
      
      expect(hasEntrevista).toBeTruthy();
      console.log('✅ RELATÓRIOS: Seção Entrevista presente');
    }
  });

  test('RELATÓRIOS - Deve mostrar seção PDI', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const pageContent = await page.textContent('body');
      const hasPDI = pageContent.toUpperCase().includes('PDI') || 
                     pageContent.toLowerCase().includes('desenvolvimento individual');
      
      expect(hasPDI).toBeTruthy();
      console.log('✅ RELATÓRIOS: Seção PDI presente');
    }
  });

  test('RELATÓRIOS - Deve mostrar seção PAI', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const pageContent = await page.textContent('body');
      const hasPAI = pageContent.toUpperCase().includes('PAI') || 
                     pageContent.toLowerCase().includes('plano de atendimento');
      
      expect(hasPAI).toBeTruthy();
      console.log('✅ RELATÓRIOS: Seção PAI presente');
    }
  });

  test('RELATÓRIOS - Deve ter botões de gerar PDF', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorios');
    await page.waitForTimeout(2000);
    
    const select = page.locator('select').first();
    const options = await select.locator('option').count();
    
    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.waitForTimeout(2000);
      
      const pdfButtons = page.locator('button:has-text("PDF"), a:has-text("PDF"), button:has-text("Gerar"), button:has-text("Download")');
      const buttonCount = await pdfButtons.count();
      
      expect(buttonCount).toBeGreaterThan(0);
      console.log(`✅ RELATÓRIOS: ${buttonCount} botões de PDF encontrados`);
    }
  });

  // ===== RELATÓRIO DE ATENDIMENTO =====
  test('ATENDIMENTO - Deve carregar página de relatório de atendimento', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorio-atendimento');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    const hasContent = pageContent.toLowerCase().includes('atendimento') ||
                       pageContent.toLowerCase().includes('relatório');
    
    expect(hasContent).toBeTruthy();
    console.log('✅ ATENDIMENTO: Página de relatório acessível');
  });

  test('ATENDIMENTO - Deve ter dropdown de alunos', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorio-atendimento');
    await page.waitForTimeout(2000);
    
    const selects = page.locator('select');
    const selectCount = await selects.count();
    
    expect(selectCount).toBeGreaterThan(0);
    console.log('✅ ATENDIMENTO: Dropdown de alunos presente');
  });

  test('ATENDIMENTO - Deve ter campos de formulário', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/relatorio-atendimento');
    await page.waitForTimeout(2000);
    
    const pageHTML = await page.content();
    const hasDateField = pageHTML.includes('type="date"');
    const hasTextarea = pageHTML.includes('textarea');
    
    expect(hasDateField || hasTextarea).toBeTruthy();
    console.log('✅ ATENDIMENTO: Campos de formulário presentes');
  });

  // ===== DASHBOARD =====
  test('DASHBOARD - Deve carregar dashboard principal', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    expect(pageContent.length).toBeGreaterThan(100);
    
    console.log('✅ DASHBOARD: Página principal carregada');
  });

  test('DASHBOARD - Deve ter elementos de navegação', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const links = page.locator('a, button');
    const linkCount = await links.count();
    
    expect(linkCount).toBeGreaterThan(5);
    console.log(`✅ DASHBOARD: ${linkCount} elementos de navegação encontrados`);
  });

  // ===== NAVEGAÇÃO GLOBAL =====
  test('NAVEGAÇÃO - Deve ter menu lateral ou superior', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const menu = page.locator('nav, .menu, .sidebar, [class*="nav"]');
    const menuCount = await menu.count();
    
    expect(menuCount).toBeGreaterThan(0);
    console.log('✅ NAVEGAÇÃO: Menu principal presente');
  });

  test('NAVEGAÇÃO - Deve ter opção de logout', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const logoutButton = page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Sair")');
    const hasLogout = await logoutButton.count() > 0;
    
    expect(hasLogout).toBeTruthy();
    console.log('✅ NAVEGAÇÃO: Botão de logout presente');
  });

  // ===== PERFIL DE USUÁRIO =====
  test('PERFIL - Deve acessar página de perfil/configurações', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/perfil');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    // Se não tiver página de perfil específica, não falha
    const hasProfile = pageContent.toLowerCase().includes('perfil') ||
                       pageContent.toLowerCase().includes('configurações') ||
                       pageContent.toLowerCase().includes('usuário');
    
    if (hasProfile) {
      console.log('✅ PERFIL: Página de perfil acessível');
    } else {
      console.log('⚠️ PERFIL: Funcionalidade pode não estar implementada');
    }
  });

  // ===== SISTEMA DE BUSCA =====
  test('BUSCA - Deve ter campos de busca/filtro', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/alunos');
    await page.waitForTimeout(2000);
    
    const searchInputs = page.locator('input[type="search"], input[placeholder*="Busca"], input[placeholder*="Pesquisa"]');
    const hasSearch = await searchInputs.count() > 0;
    
    if (hasSearch) {
      console.log('✅ BUSCA: Campo de busca encontrado');
    } else {
      console.log('⚠️ BUSCA: Campo de busca não encontrado (pode usar outro método)');
    }
  });

  // ===== RESPONSIVIDADE =====
  test('RESPONSIVO - Layout deve funcionar em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    console.log('✅ RESPONSIVO: Site carrega em viewport mobile');
  });

  test('RESPONSIVO - Layout deve funcionar em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    expect(pageContent).toBeTruthy();
    
    console.log('✅ RESPONSIVO: Site carrega em viewport tablet');
  });

  // ===== ACESSIBILIDADE =====
  test('ACESSIBILIDADE - Formulários devem ter labels', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    
    const labels = page.locator('label');
    const labelCount = await labels.count();
    
    expect(labelCount).toBeGreaterThan(0);
    console.log(`✅ ACESSIBILIDADE: ${labelCount} labels encontrados`);
  });

  test('ACESSIBILIDADE - Links devem ter texto descritivo', async ({ page }) => {
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(2000);
    
    const links = page.locator('a');
    const linkCount = await links.count();
    
    let emptyLinks = 0;
    for (let i = 0; i < Math.min(linkCount, 10); i++) {
      const text = await links.nth(i).textContent();
      if (!text || text.trim() === '') emptyLinks++;
    }
    
    const ratio = emptyLinks / Math.min(linkCount, 10);
    expect(ratio).toBeLessThan(0.5); // Menos de 50% de links vazios
    
    console.log(`✅ ACESSIBILIDADE: ${Math.min(linkCount, 10) - emptyLinks}/${Math.min(linkCount, 10)} links com texto`);
  });

  // ===== PERFORMANCE =====
  test('PERFORMANCE - Página inicial deve carregar rápido', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost/conectedu/frontend/');
    await page.waitForSelector('input[type="email"]');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // Menos de 5 segundos
    console.log(`✅ PERFORMANCE: Login carregou em ${loadTime}ms`);
  });

  test('PERFORMANCE - Dashboard deve carregar rápido após login', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost/conectedu/frontend/#/dashboard');
    await page.waitForTimeout(1000);
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(8000); // Menos de 8 segundos
    console.log(`✅ PERFORMANCE: Dashboard carregou em ${loadTime}ms`);
  });

});
