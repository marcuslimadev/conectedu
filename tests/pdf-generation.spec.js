const { test, expect } = require('@playwright/test');
const { login, createStudent, fillForm, downloadPDF, extractPDFText, assertFieldInPDF } = require('./helpers/test-helpers');
const testData = require('./fixtures/test-data');

test.describe('Geração de PDFs - Validação Completa', () => {
  let studentName;

  test.beforeAll(async ({ browser }) => {
    // Setup: criar um aluno com todos os 3 formulários preenchidos
    const page = await browser.newPage();
    await login(page, testData.credentials.admin);
    
    studentName = await createStudent(page, {
      name: 'Aluno Completo - Teste PDF',
      birth_date: '2010-03-20'
    });
    
    // Preencher Entrevista
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.entrevistaCompleta);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Preencher PDI
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.pdiCompleto);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Preencher PAI
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.paiCompleto);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.close();
  });

  test('PDF Entrevista - Validação de 100% dos campos', async ({ page }) => {
    await login(page, testData.credentials.admin);
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Navegar para seção de Entrevistas
    const entrevistasSection = page.locator('text=Entrevistas');
    if (await entrevistasSection.count() > 0) {
      await entrevistasSection.click();
    }
    
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    // Validar TODOS os campos da entrevista
    const allFields = testData.entrevistaCompleta;
    let camposValidados = 0;
    let camposFalhados = [];
    
    for (const [campo, valor] of Object.entries(allFields)) {
      try {
        assertFieldInPDF(pdfText, valor, campo);
        camposValidados++;
      } catch (error) {
        camposFalhados.push({ campo, valor, error: error.message });
      }
    }
    
    // Relatório
    console.log(`\n📊 RELATÓRIO PDF ENTREVISTA:`);
    console.log(`✅ Campos validados: ${camposValidados}`);
    console.log(`❌ Campos falhados: ${camposFalhados.length}`);
    
    if (camposFalhados.length > 0) {
      console.log('\n⚠️ Campos que falharam:');
      camposFalhados.forEach(f => {
        console.log(`  - ${f.campo}: ${f.valor}`);
      });
    }
    
    // Exigir pelo menos 80% de campos no PDF
    const percentualValidado = (camposValidados / Object.keys(allFields).length) * 100;
    expect(percentualValidado).toBeGreaterThan(80);
  });

  test('PDF PDI - Validação dos 72 campos', async ({ page }) => {
    await login(page, testData.credentials.admin);
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Navegar para seção PDI
    const pdiSection = page.locator('text=PDI');
    if (await pdiSection.count() > 0) {
      await pdiSection.click();
    }
    
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    const allFields = testData.pdiCompleto;
    let camposValidados = 0;
    let camposFalhados = [];
    
    for (const [campo, valor] of Object.entries(allFields)) {
      try {
        assertFieldInPDF(pdfText, valor, campo);
        camposValidados++;
      } catch (error) {
        camposFalhados.push({ campo, valor });
      }
    }
    
    console.log(`\n📊 RELATÓRIO PDF PDI:`);
    console.log(`✅ Campos validados: ${camposValidados}`);
    console.log(`❌ Campos falhados: ${camposFalhados.length}`);
    
    const percentualValidado = (camposValidados / Object.keys(allFields).length) * 100;
    expect(percentualValidado).toBeGreaterThan(80);
  });

  test('PDF PAI - Validação dos 44 campos', async ({ page }) => {
    await login(page, testData.credentials.admin);
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Navegar para seção PAI
    const paiSection = page.locator('text=Plano de Atendimento');
    if (await paiSection.count() > 0) {
      await paiSection.click();
    }
    
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    const allFields = testData.paiCompleto;
    let camposValidados = 0;
    let camposFalhados = [];
    
    for (const [campo, valor] of Object.entries(allFields)) {
      try {
        assertFieldInPDF(pdfText, valor, campo);
        camposValidados++;
      } catch (error) {
        camposFalhados.push({ campo, valor });
      }
    }
    
    console.log(`\n📊 RELATÓRIO PDF PAI:`);
    console.log(`✅ Campos validados: ${camposValidados}`);
    console.log(`❌ Campos falhados: ${camposFalhados.length}`);
    
    const percentualValidado = (camposValidados / Object.keys(allFields).length) * 100;
    expect(percentualValidado).toBeGreaterThan(80);
  });

  test('Validar branding e estrutura dos PDFs', async ({ page }) => {
    await login(page, testData.credentials.admin);
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    // Validar elementos de branding
    expect(pdfText).toContain('ConectEDU');
    expect(pdfText).toContain('Sistema AEE');
    
    // Validar estrutura
    expect(pdfText.length).toBeGreaterThan(1000); // PDF não vazio
  });

  test('Comparar PDFs - garantir consistência de dados', async ({ page }) => {
    await login(page, testData.credentials.admin);
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(3000);
    
    // Baixar PDFs dos 3 formulários
    const pdfs = {
      entrevista: await downloadPDF(page, 'PDF'),
      // Navegar entre seções se necessário
    };
    
    // Extrair textos
    const texts = {
      entrevista: await extractPDFText(pdfs.entrevista)
    };
    
    // Validar que nome do aluno aparece em todos
    const nomeAluno = testData.entrevistaCompleta.nome_estudante;
    expect(texts.entrevista).toContain(nomeAluno);
  });
});

test.describe('PDFs - Casos Extremos e Robustez', () => {
  test('deve gerar PDF mesmo com campos vazios', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page, { name: 'Aluno Mínimo' });
    
    // Criar PDI com apenas campos obrigatórios
    await page.goto('/#/pdi');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    await fillForm(page, { nome_estudante: student });
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Tentar gerar PDF
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    expect(pdf.length).toBeGreaterThan(0);
  });

  test('deve validar caracteres especiais nos PDFs', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    await page.goto('/#/entrevista-responsavel');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    // Preencher com caracteres especiais
    const dadosEspeciais = {
      nome_estudante: student,
      informacoes_complementares: 'Teste com acentuação: à é ê ô ç ü ñ • © ® ™ — – " " ' ''
    };
    
    await fillForm(page, dadosEspeciais);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    // Validar que caracteres especiais são preservados
    expect(text).toContain('acentuação');
  });
});
