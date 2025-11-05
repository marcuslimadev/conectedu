<?php
/**
 * GERADOR DE PDF - PLANO DE ATENDIMENTO INDIVIDUAL (PAI) (Refatorado)
 *
 * Gera o PAI utilizando a classe PdfGenerator e templates externos.
 */

if (!function_exists('db')) {
    require_once 'functions.php';
}
if (!class_exists('PdfGenerator')) {
    require_once 'PdfGenerator.php';
}

// --- Inicialização e Autenticação ---
header('Content-Type: application/json; charset=utf-8');
cors();
$user = require_auth();
$pdo = db();

// --- Validação de Entrada ---
$pai_id = $_GET['id'] ?? null;
if (!$pai_id || !is_numeric($pai_id)) {
    res(false, null, 'ID do PAI inválido', 400);
}

try {
    // --- Busca de Dados ---
    $sql = "SELECT p.*, s.name as student_name, s.photo_url
            FROM planos_atendimento p
            LEFT JOIN students s ON p.student_id = s.id
            WHERE p.id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $pai_id]);
    $pai = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pai) {
        res(false, null, 'PAI não encontrado', 404);
    }

    // --- Verificação de Permissões ---
    if ($user['role'] !== 'admin' && $pai['teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão para gerar este PDF', 403);
    }

    // --- Preparação dos Dados para o Template ---
    $data = [
        'pai' => $pai,
        'photo_path' => $pai['photo_url'] ? __DIR__ . '/../' . $pai['photo_url'] : null,
        'main_title' => 'PLANO DE ATENDIMENTO INDIVIDUAL',
        'document_date' => date('d/m/Y'),
    ];

    // --- Geração do PDF ---
    $pdfGenerator = new PdfGenerator($pdo);

    $pdfGenerator->setMetadata(
        'PAI - ' . $pai['student_name'],
        'ConectEDU - Sistema AEE',
        'Plano de Atendimento Individual (PAI)',
        'AEE, PAI, Educação Especial'
    );

    // Carregar o template HTML
    $pdfGenerator->loadHtmlFromFile(__DIR__ . '/templates/pai-template.php', $data);

    // --- Salvamento e Registro ---
    $uploadDir = __DIR__ . '/uploads/documentos/pais/';
    $fileName = 'PAI_' . sanitizeFileName($pai['student_name']) . '_' . date('Y-m-d') . '.pdf';
    $filePath = $uploadDir . $fileName;
    $relativeFilePath = 'backend/uploads/documentos/pais/' . $fileName;

    $pdfGenerator->saveToFile($filePath);

    $pdfGenerator->logDocument(
        'pai',
        $pai_id,
        $pai['student_id'],
        $user['id'],
        $relativeFilePath,
        $fileName,
        'PAI - ' . $pai['student_name'] . ' - ' . date('d/m/Y')
    );

    // --- Resposta ---
    $pdfGenerator->downloadFile($filePath, $fileName);
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF do PAI (refatorado): ' . $e->getMessage());
    res(false, null, 'Erro interno ao gerar o PDF.', 500);
}
