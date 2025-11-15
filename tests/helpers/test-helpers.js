const { test, expect } = require('@playwright/test');

/**
 * Helpers para autenticação e navegação
 */

/**
 * Faz login no sistema
 * @param {import('@playwright/test').Page} page
 * @param {Object} credentials
 */
async function login(page, credentials) {
  await page.goto('/');
  
  // Aguardar formulário de login carregar
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  
  // Preencher credenciais
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password);
  
  // Clicar em entrar
  await page.click('button[type="submit"]');
  
  // Aguardar login completar (3 segundos)
  await page.waitForTimeout(3000);
  
  // Verificar que não está mais no login
  const url = page.url();
  if (url.includes('/login')) {
    throw new Error('Login falhou - ainda na página de login');
  }
}

/**
 * Cria um aluno de teste
 * @param {import('@playwright/test').Page} page
 * @param {Object} studentData
 * @returns {Promise<number>} ID do aluno criado
 */
async function createStudent(page, studentData = {}) {
  const defaultData = {
    name: `Aluno Teste ${Date.now()}`,
    birth_date: '2010-05-15',
    escola: 'Escola Teste',
    ...studentData
  };
  
  await page.goto('/#/alunos');
  await page.waitForTimeout(1000);
  
  // Clicar em "Cadastrar Novo Aluno"
  await page.click('button:has-text("Cadastrar"), button:has-text("Novo")');
  await page.waitForSelector('input[placeholder*="Nome"], input[name="name"]');
  
  // Preencher formulário
  await page.fill('input[placeholder*="Nome"], input[name="name"]', defaultData.name);
  await page.fill('input[type="date"], input[name="birth_date"]', defaultData.birth_date);
  
  // Salvar
  await page.click('button:has-text("Salvar"), button:has-text("Cadastrar")');
  
  // Aguardar confirmação
  await page.waitForTimeout(2000);
  
  return defaultData.name;
}

/**
 * Preenche um formulário completo
 * @param {import('@playwright/test').Page} page
 * @param {Object} formData
 */
async function fillForm(page, formData) {
  for (const [key, value] of Object.entries(formData)) {
    try {
      // Tentar por name
      const input = page.locator(`[name="${key}"]`).first();
      const count = await input.count();
      
      if (count > 0) {
        const inputType = await input.getAttribute('type');
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          await input.selectOption(value);
        } else if (inputType === 'checkbox' || inputType === 'radio') {
          if (value === 'sim' || value === true || value === '1') {
            await input.check();
          }
        } else if (tagName === 'textarea') {
          await input.fill(value);
        } else {
          await input.fill(String(value));
        }
        
        await page.waitForTimeout(100);
      }
    } catch (error) {
      console.log(`Campo ${key} não encontrado ou erro ao preencher: ${error.message}`);
    }
  }
}

/**
 * Baixa um PDF e retorna o buffer
 * @param {import('@playwright/test').Page} page
 * @param {string} buttonText
 * @returns {Promise<Buffer>}
 */
async function downloadPDF(page, buttonText = 'PDF') {
  const [download] = await Promise.all([
    page.waitForEvent('download', { timeout: 30000 }),
    page.click(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`)
  ]);
  
  const path = await download.path();
  const fs = require('fs');
  return fs.readFileSync(path);
}

/**
 * Extrai texto de um PDF
 * @param {Buffer} pdfBuffer
 * @returns {Promise<string>}
 */
async function extractPDFText(pdfBuffer) {
  // Usar pdf-parse para extrair texto
  const pdfParse = require('pdf-parse');
  const data = await pdfParse(pdfBuffer);
  return data.text;
}

/**
 * Verifica se um campo está no PDF
 * @param {string} pdfText
 * @param {string} fieldValue
 * @param {string} fieldName
 */
function assertFieldInPDF(pdfText, fieldValue, fieldName) {
  // Remover espaços extras e normalizar
  const normalizedPDF = pdfText.replace(/\s+/g, ' ').toLowerCase();
  const normalizedValue = String(fieldValue).replace(/\s+/g, ' ').toLowerCase();
  
  if (!normalizedPDF.includes(normalizedValue)) {
    throw new Error(
      `Campo "${fieldName}" com valor "${fieldValue}" NÃO encontrado no PDF!\n` +
      `Trecho do PDF: ...${normalizedPDF.substring(0, 500)}...`
    );
  }
}

module.exports = {
  login,
  createStudent,
  fillForm,
  downloadPDF,
  extractPDFText,
  assertFieldInPDF
};
