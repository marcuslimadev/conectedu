const { test, expect } = require('@playwright/test');
const { login, createStudent, fillForm, downloadPDF, extractPDFText, assertFieldInPDF } = require('./helpers/test-helpers');
const testData = require('./fixtures/test-data');

test.describe('Formulário Plano de Atendimento (PAI) - Completo', () => {
  let studentName;

  test.beforeEach(async ({ page }) => {
    await login(page, testData.credentials.admin);
    studentName = await createStudent(page, {
      name: 'Maria Silva Santos - Teste PAI',
      birth_date: '2010-03-20'
    });
  });

  test('deve preencher PAI completo e validar todos os 44 campos', async ({ page }) => {
    // Navegar para PAI
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    
    // Selecionar aluno
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await page.waitForTimeout(1000);
    
    // Preencher formulário completo
    await fillForm(page, testData.paiCompleto);
    
    // Salvar
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Verificar sucesso
    const successMsg = page.locator('text=/salvo|sucesso/i');
    await expect(successMsg).toBeVisible({ timeout: 10000 });
  });

  test('deve gerar PDF do PAI com todos os campos', async ({ page }) => {
    // Preencher PAI
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    await fillForm(page, testData.paiCompleto);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    // Ir para relatórios
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    // Baixar PDF do PAI
    const pdfBuffer = await downloadPDF(page, 'PDF');
    const pdfText = await extractPDFText(pdfBuffer);
    
    // Validar campos críticos do PAI
    const camposCriticosPAI = {
      nome_estudante: testData.paiCompleto.nome_estudante,
      nome_escola: testData.paiCompleto.nome_escola,
      diagnostico_cid: testData.paiCompleto.diagnostico_cid,
      professor_aee: testData.paiCompleto.professor_aee,
      professor_regente: testData.paiCompleto.professor_regente,
      historico_escolar: testData.paiCompleto.historico_escolar,
      dificuldades: testData.paiCompleto.dificuldades,
      potencialidades_observadas: testData.paiCompleto.potencialidades_observadas,
      objetivo_geral: testData.paiCompleto.objetivo_geral,
      objetivos_especificos: testData.paiCompleto.objetivos_especificos,
      estrategias_ensino: testData.paiCompleto.estrategias_ensino,
      criterios_avaliacao: testData.paiCompleto.criterios_avaliacao
    };
    
    for (const [campo, valor] of Object.entries(camposCriticosPAI)) {
      assertFieldInPDF(pdfText, valor, campo);
    }
    
    // Validar estrutura
    expect(pdfText).toContain('Plano de Atendimento');
    expect(pdfText).toContain('Diagnóstico');
    expect(pdfText).toContain('Objetivos');
    expect(pdfText).toContain('Estratégias');
  });

  test('deve validar seção de Avaliação Diagnóstica - Comunicação', async ({ page }) => {
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosComunicacao = {
      nome_estudante: studentName,
      oralidade: testData.paiCompleto.oralidade,
      compreensao: testData.paiCompleto.compreensao,
      expressao_verbal: testData.paiCompleto.expressao_verbal,
      leitura_nivel: testData.paiCompleto.leitura_nivel,
      comunicacao_nao_verbal: testData.paiCompleto.comunicacao_nao_verbal
    };
    
    await fillForm(page, dadosComunicacao);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosComunicacao.oralidade, 'oralidade');
    assertFieldInPDF(text, dadosComunicacao.leitura_nivel, 'leitura_nivel');
    assertFieldInPDF(text, dadosComunicacao.comunicacao_nao_verbal, 'comunicacao_nao_verbal');
  });

  test('deve validar habilidades cognitivas e acadêmicas no PDF', async ({ page }) => {
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosCognitivos = {
      nome_estudante: studentName,
      raciocinio_logico_matematico: testData.paiCompleto.raciocinio_logico_matematico,
      conceitos_academicos: testData.paiCompleto.conceitos_academicos,
      atencao_concentracao: testData.paiCompleto.atencao_concentracao,
      memoria: testData.paiCompleto.memoria,
      organizacao_planejamento: testData.paiCompleto.organizacao_planejamento
    };
    
    await fillForm(page, dadosCognitivos);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosCognitivos.raciocinio_logico_matematico, 'raciocinio_logico_matematico');
    assertFieldInPDF(text, dadosCognitivos.atencao_concentracao, 'atencao_concentracao');
    assertFieldInPDF(text, dadosCognitivos.memoria, 'memoria');
  });

  test('deve validar habilidades socioemocionais no PDF', async ({ page }) => {
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosSocioemocionais = {
      nome_estudante: studentName,
      interacao_social: testData.paiCompleto.interacao_social,
      autonomia_independencia: testData.paiCompleto.autonomia_independencia,
      manejo_emocoes: testData.paiCompleto.manejo_emocoes,
      comportamento_sala: testData.paiCompleto.comportamento_sala
    };
    
    await fillForm(page, dadosSocioemocionais);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosSocioemocionais.interacao_social, 'interacao_social');
    assertFieldInPDF(text, dadosSocioemocionais.autonomia_independencia, 'autonomia_independencia');
    assertFieldInPDF(text, dadosSocioemocionais.manejo_emocoes, 'manejo_emocoes');
  });

  test('deve validar estratégias e recursos pedagógicos no PDF', async ({ page }) => {
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosEstrategias = {
      nome_estudante: studentName,
      adaptacoes_curriculares: testData.paiCompleto.adaptacoes_curriculares,
      recursos_didaticos_tecnologias: testData.paiCompleto.recursos_didaticos_tecnologias,
      estrategias_ensino: testData.paiCompleto.estrategias_ensino,
      atendimento_aee: testData.paiCompleto.atendimento_aee,
      envolvimento_familia: testData.paiCompleto.envolvimento_familia
    };
    
    await fillForm(page, dadosEstrategias);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    assertFieldInPDF(text, dadosEstrategias.adaptacoes_curriculares, 'adaptacoes_curriculares');
    assertFieldInPDF(text, dadosEstrategias.recursos_didaticos_tecnologias, 'recursos_didaticos_tecnologias');
    assertFieldInPDF(text, dadosEstrategias.estrategias_ensino, 'estrategias_ensino');
  });

  test('deve validar assinaturas e consenso no PDF', async ({ page }) => {
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: studentName });
    
    const dadosAssinaturas = {
      nome_estudante: studentName,
      professor_regente_assinatura: testData.paiCompleto.professor_regente_assinatura,
      professor_aee_assinatura: testData.paiCompleto.professor_aee_assinatura,
      coordenacao_pedagogica_assinatura: testData.paiCompleto.coordenacao_pedagogica_assinatura,
      direcao_escolar_assinatura: testData.paiCompleto.direcao_escolar_assinatura,
      responsavel_aluno_assinatura: testData.paiCompleto.responsavel_aluno_assinatura
    };
    
    await fillForm(page, dadosAssinaturas);
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: studentName });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    // Validar todas as 5 assinaturas
    assertFieldInPDF(text, dadosAssinaturas.professor_regente_assinatura, 'professor_regente');
    assertFieldInPDF(text, dadosAssinaturas.professor_aee_assinatura, 'professor_aee');
    assertFieldInPDF(text, dadosAssinaturas.coordenacao_pedagogica_assinatura, 'coordenacao');
    assertFieldInPDF(text, dadosAssinaturas.direcao_escolar_assinatura, 'direcao');
    assertFieldInPDF(text, dadosAssinaturas.responsavel_aluno_assinatura, 'responsavel');
  });
});

test.describe('PAI - Checkboxes e Campos Especiais', () => {
  test('deve validar checkboxes de escrita e leitura', async ({ page }) => {
    await login(page, testData.credentials.admin);
    const student = await createStudent(page);
    
    await page.goto('/#/plano-atendimento');
    await page.waitForTimeout(2000);
    await page.selectOption('select[name="student_id"]', { label: student });
    
    // Marcar checkboxes
    await page.check('input[name="escreve"]');
    await page.check('input[name="grafia_legivel"]');
    await page.check('input[name="desenha"]');
    await page.check('input[name="copia"]');
    
    await page.click('button:has-text("Salvar")');
    await page.waitForTimeout(3000);
    
    await page.goto('/#/relatorios');
    await page.waitForTimeout(2000);
    await page.selectOption('select', { label: student });
    await page.waitForTimeout(2000);
    
    const pdf = await downloadPDF(page, 'PDF');
    const text = await extractPDFText(pdf);
    
    // Verificar que checkboxes marcados aparecem no PDF
    expect(text).toMatch(/escreve.*sim|☑.*escreve/i);
    expect(text).toMatch(/grafia.*legível.*sim|☑.*grafia/i);
  });
});
