const { test, expect } = require('@playwright/test');
const { login, createStudent, fillForm, downloadPDF, extractPDFText, assertFieldInPDF } = require('./helpers/test-helpers');
const testData = require('./fixtures/test-data');

test.describe('Formulário de Entrevista com Responsável - Completo', () => {
  let studentName;

  test.beforeEach(async ({ page }) => {
    // Login como professor
    await login(page, testData.credentials.admin);
    
    // Criar aluno de teste
    studentName = await createStudent(page, {
      name: 'Maria Silva Santos - Teste Entrevista',
      birth_date: '2010-03-20'
    });
  });

  test('deve preencher formulário completo e validar todos os campos', async ({ page }) => {
    // Navegar para formulário de entrevista
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    
    // Selecionar aluno
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await page.waitForTimeout(1000);
    
    // Preencher todo o formulário
    await fillForm(page, testData.entrevistaCompleta);
    
    // Salvar formulário
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Verificar mensagem de sucesso
    const successMsg = page.locator('text=/salvo|sucesso/i');
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('deve gerar PDF com todos os campos da entrevista', async ({ page }) => {
    // Preencher formulário (usar código acima)
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.entrevistaCompleta);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Navegar para relatórios
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    
    // Selecionar o aluno
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Baixar PDF da entrevista
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    // Validar campos críticos no PDF
    const camposCriticos = {
      nome_estudante: testData.entrevistaCompleta.nome_estudante,
      nome_escola: testData.entrevistaCompleta.nome_escola,
      serie_ano: testData.entrevistaCompleta.serie_ano,
      nome_mae: testData.entrevistaCompleta.nome_mae,
      nome_pai: testData.entrevistaCompleta.nome_pai,
      telefone: testData.entrevistaCompleta.telefone,
      endereco: testData.entrevistaCompleta.endereco,
      deficiencia_informada: testData.entrevistaCompleta.deficiencia_informada,
      uso_medicamento: testData.entrevistaCompleta.uso_medicamento,
      tratamentos_atuais: testData.entrevistaCompleta.tratamentos_atuais
    };
    
    for (const [campo, valor] of Object.entries(camposCriticos)) {
      assertFieldInPDF(pdfText, valor, campo);
    }
    
    // Validar seções específicas
    expect(pdfText).toContain('ENTREVISTA COM O RESPONSÁVEL');
    expect(pdfText).toContain('Dados de Identificação');
    expect(pdfText).toContain('Histórico Médico');
    expect(pdfText).toContain('Desenvolvimento');
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    
    // Tentar salvar sem preencher
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(1000);
    
    // Verificar mensagem de erro ou validação HTML5
    const requiredFields = page.locator('input:required:invalid, select:required:invalid');
    const count = await requiredFields.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Seções específicas da Entrevista', () => {
  test('deve validar seção de Gestação/Nascimento no PDF', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    // Preencher apenas seção de gestação
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    const dadosGestacao = {
      nome_estudante: student,
      gravidez_planejada: testData.entrevistaCompleta.gravidez_planejada,
      tipo_parto: testData.entrevistaCompleta.tipo_parto,
      nasceu_tempo_normal: testData.entrevistaCompleta.nasceu_tempo_normal,
      observacoes_nascimento: testData.entrevistaCompleta.observacoes_nascimento
    };
    
    await fillForm(page, dadosGestacao);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Validar PDF
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosGestacao.tipo_parto, 'tipo_parto');
    assertFieldInPDF(text, dadosGestacao.observacoes_nascimento, 'observacoes_nascimento');
  });

  test('deve validar seção de Vida Escolar no PDF', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    const dadosEscolares = {
      nome_estudante: student,
      idade_entrou_escola: testData.entrevistaCompleta.idade_entrou_escola,
      adaptacao_escolar: testData.entrevistaCompleta.adaptacao_escolar,
      frequenta_sala_recursos: testData.entrevistaCompleta.frequenta_sala_recursos,
      frequencia_atendimento_recursos: testData.entrevistaCompleta.frequencia_atendimento_recursos,
      opiniao_atendimento_escola: testData.entrevistaCompleta.opiniao_atendimento_escola
    };
    
    await fillForm(page, dadosEscolares);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosEscolares.adaptacao_escolar, 'adaptacao_escolar');
    assertFieldInPDF(text, dadosEscolares.opiniao_atendimento_escola, 'opiniao_atendimento_escola');
  });
});
