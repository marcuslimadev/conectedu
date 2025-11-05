const express = require('express');
const router = express.Router();
const pool = require('../db');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');

async function generatePdf(htmlContent, res, filename) {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Set content and emulate screen media type
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        await page.emulateMediaType('screen');

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Could not generate PDF');
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// @route   GET /generate-pdf-entrevista.php
// @desc    Generate PDF for an interview form
router.get('/generate-pdf-entrevista.php', authMiddleware, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Form ID is required.');

    try {
        // Fetch form data
        const [forms] = await pool.query('SELECT * FROM entrevista_responsavel_forms WHERE id = ?', [id]);
        if (forms.length === 0) return res.status(404).send('Form not found.');

        const formData = JSON.parse(forms[0].form_data || '{}');
        const studentId = forms[0].student_id;

        // Fetch student data
        const [students] = await pool.query('SELECT s.*, sch.name as school_name FROM students s LEFT JOIN schools sch ON s.school_id = sch.id WHERE s.id = ?', [studentId]);
        if (students.length === 0) return res.status(404).send('Student not found.');
        const student = students[0];

        // Read and populate HTML template
        const templatePath = path.join(__dirname, '../../backend/templates/pdf/entrevista.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        const data = {
            ...formData,
            ...student,
            data_nascimento: student.birth_date ? new Date(student.birth_date).toLocaleDateString('pt-BR') : '',
            nome_aluno: student.name,
            escola: student.school_name,
            serie: student.grade,
        };

        // Replace placeholders
        for (const key in data) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        }

        await generatePdf(html, res, `Entrevista_${student.name.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error('Failed to generate interview PDF:', error);
        res.status(500).send('Server error');
    }
});

// @route   GET /generate-pdf-pdi.php
// @desc    Generate PDF for a PDI form
router.get('/generate-pdf-pdi.php', authMiddleware, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Form ID is required.');

    try {
        const [forms] = await pool.query('SELECT * FROM pdi_forms WHERE id = ?', [id]);
        if (forms.length === 0) return res.status(404).send('PDI Form not found.');

        const formData = JSON.parse(forms[0].form_data || '{}');
        const studentId = forms[0].student_id;

        const [students] = await pool.query('SELECT s.*, sch.name as school_name FROM students s LEFT JOIN schools sch ON s.school_id = sch.id WHERE s.id = ?', [studentId]);
        if (students.length === 0) return res.status(404).send('Student not found.');
        const student = students[0];

        const templatePath = path.join(__dirname, '../../backend/templates/pdf/pdi.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        const data = { ...formData, ...student, nome_aluno: student.name };

        for (const key in data) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        }

        await generatePdf(html, res, `PDI_${student.name.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error('Failed to generate PDI PDF:', error);
        res.status(500).send('Server error');
    }
});

// @route   GET /generate-pdf-pai.php
// @desc    Generate PDF for a PAI form
router.get('/generate-pdf-pai.php', authMiddleware, async (req, res) => {
    const { id } = req.query;
    if (!id) return res.status(400).send('Form ID is required.');

    try {
        const [forms] = await pool.query('SELECT * FROM plano_atendimento_forms WHERE id = ?', [id]);
        if (forms.length === 0) return res.status(404).send('PAI Form not found.');

        const formData = JSON.parse(forms[0].form_data || '{}');
        const studentId = forms[0].student_id;

        const [students] = await pool.query('SELECT s.*, sch.name as school_name FROM students s LEFT JOIN schools sch ON s.school_id = sch.id WHERE s.id = ?', [studentId]);
        if (students.length === 0) return res.status(404).send('Student not found.');
        const student = students[0];

        const templatePath = path.join(__dirname, '../../backend/templates/pdf/pai.html');
        let html = await fs.readFile(templatePath, 'utf-8');

        const data = { ...formData, ...student, nome_aluno: student.name };

        for (const key in data) {
            const regex = new RegExp(`{{${key}}}`, 'g');
            html = html.replace(regex, data[key] || '');
        }

        await generatePdf(html, res, `PAI_${student.name.replace(/ /g, '_')}.pdf`);

    } catch (error) {
        console.error('Failed to generate PAI PDF:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
