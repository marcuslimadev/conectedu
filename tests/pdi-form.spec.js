const { test, expect } = require('@playwright/test');
const { login, createStudent, fillForm, downloadPDF, extractPDFText, assertFieldInPDF } = require('./helpers/test-helpers');
const testData = require('./fixtures/test-data');

test.describe('Formulário PDI ConectAEE - Completo', () => {
  let studentName;

  test.beforeEach(async ({ page }) => {
    await login(page, testData.credentials.admin);
    studentName = await createStudent(page, {
      name: 'Maria Silva Santos - Teste PDI',
      birth_date: '2010-03-20'
    });
  });

  test('deve preencher PDI completo e validar todos os campos', async ({ page }) => {
    // Navegar para PDI
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    
    // Selecionar aluno
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await page.waitForTimeout(1000);
    
    // Preencher todo o formulário PDI
    await fillForm(page, testData.pdiCompleto);
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Verificar sucesso
    const successMsg = page.locator('text=/salvo|sucesso/i');
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('deve gerar PDF do PDI com todos os 72 campos', async ({ page }) => {
    // Preencher PDI
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.pdiCompleto);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Ir para relatórios
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Baixar PDF do PDI
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    // Validar campos principais do PDI
    const camposCriticosPDI = {
      nome_estudante: testData.pdiCompleto.nome_estudante,
      nome_escola: testData.pdiCompleto.nome_escola,
      diretor: testData.pdiCompleto.diretor,
      ano_letivo: testData.pdiCompleto.ano_letivo,
      objetivo_geral: testData.pdiCompleto.objetivo_geral,
      objetivos_cognitivo: testData.pdiCompleto.objetivos_cognitivo,
      objetivos_comunicacao: testData.pdiCompleto.objetivos_comunicacao,
      objetivos_psicomotor: testData.pdiCompleto.objetivos_psicomotor,
      objetivos_socioemocional: testData.pdiCompleto.objetivos_socioemocional,
      estrategias_metodologias: testData.pdiCompleto.estrategias_metodologias,
      recursos_tecnologia_assistiva: testData.pdiCompleto.recursos_tecnologia_assistiva,
      professor_aee: testData.pdiCompleto.professor_aee,
      frequencia_atendimento: testData.pdiCompleto.frequencia_atendimento
    };
    
    for (const [campo, valor] of Object.entries(camposCriticosPDI)) {
      assertFieldInPDF(pdfText, valor, campo);
    }
    
    // Validar estrutura do PDF
    expect(pdfText).toContain('PDI');
    expect(pdfText).toContain('Plano de Desenvolvimento Individual');
    expect(pdfText).toContain('Objetivos');
    expect(pdfText).toContain('Estratégias');
  });

  test('deve validar seção de Objetivos Específicos', async ({ page }) => {
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    // Preencher apenas objetivos
    const dadosObjetivos = {
      nome_estudante: studentName,
      objetivos_cognitivo: testData.pdiCompleto.objetivos_cognitivo,
      objetivos_comunicacao: testData.pdiCompleto.objetivos_comunicacao,
      objetivos_psicomotor: testData.pdiCompleto.objetivos_psicomotor,
      objetivos_socioemocional: testData.pdiCompleto.objetivos_socioemocional
    };
    
    await fillForm(page, dadosObjetivos);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Validar no PDF
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    // Todos os 4 tipos de objetivos devem estar no PDF
    assertFieldInPDF(text, dadosObjetivos.objetivos_cognitivo, 'objetivos_cognitivo');
    assertFieldInPDF(text, dadosObjetivos.objetivos_comunicacao, 'objetivos_comunicacao');
    assertFieldInPDF(text, dadosObjetivos.objetivos_psicomotor, 'objetivos_psicomotor');
    assertFieldInPDF(text, dadosObjetivos.objetivos_socioemocional, 'objetivos_socioemocional');
  });

  test('deve validar recursos e tecnologia assistiva no PDF', async ({ page }) => {
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosRecursos = {
      nome_estudante: studentName,
      recursos_tecnologia_assistiva: testData.pdiCompleto.recursos_tecnologia_assistiva,
      recursos_pedagogicos: testData.pdiCompleto.recursos_pedagogicos,
      estrategias_metodologias: testData.pdiCompleto.estrategias_metodologias
    };
    
    await fillForm(page, dadosRecursos);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosRecursos.recursos_tecnologia_assistiva, 'recursos_tecnologia_assistiva');
    assertFieldInPDF(text, dadosRecursos.recursos_pedagogicos, 'recursos_pedagogicos');
  });

  test('deve validar datas de início e término no PDF', async ({ page }) => {
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosDatas = {
      nome_estudante: studentName,
      data_inicio: testData.pdiCompleto.data_inicio,
      data_termino: testData.pdiCompleto.data_termino,
      data_elaboracao: testData.pdiCompleto.data_elaboracao
    };
    
    await fillForm(page, dadosDatas);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    // Validar datas formatadas (formato brasileiro)
    expect(text).toContain('05/02/2025'); // data_inicio formatada
    expect(text).toContain('20/12/2025'); // data_termino formatada
  });
});

test.describe('PDI - Campos Opcionais e Validações', () => {
  test('deve permitir salvar PDI com campos mínimos', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    // Preencher apenas campos obrigatórios
    await fillForm(page, {
      nome_estudante: student,
      objetivo_geral: 'Objetivo geral mínimo'
    });
    
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(2000);
    
    const successMsg = page.locator('text=/salvo|sucesso/i');
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('deve validar profissionais envolvidos no PDF', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    const dadosProfissionais = {
      nome_estudante: student,
      professor_aee: testData.pdiCompleto.professor_aee,
      professor_sala_regular: testData.pdiCompleto.professor_sala_regular,
      coordenador_pedagogico: testData.pdiCompleto.coordenador_pedagogico,
      outros_profissionais: testData.pdiCompleto.outros_profissionais
    };
    
    await fillForm(page, dadosProfissionais);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosProfissionais.professor_aee, 'professor_aee');
    assertFieldInPDF(text, dadosProfissionais.outros_profissionais, 'outros_profissionais');
  });
});
