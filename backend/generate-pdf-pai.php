<?php
/**
 * GERADOR DE PDF - PLANO DE ATENDIMENTO INDIVIDUAL (PAI) (Refatorado)
 *
 * Utiliza o servico centralizado de geracao de PDF.
 */

require_once 'functions.php';
require_once __DIR__ . '/services/PdfGeneratorService.php';

try {
    // Autenticacao e Conexao DB
    $user = require_auth();
    $pdo = db();

    // Validar ID
    $pai_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$pai_id) {
        res(false, null, 'ID do PAI inválido', 400);
    }

    // Buscar dados do PAI
    $stmt = $pdo->prepare("
        SELECT pai.*, s.name as student_name, s.birth_date, s.photo_url
        FROM pai_forms pai
        JOIN students s ON pai.student_id = s.id
        WHERE pai.id = :id
    ");
    $stmt->execute([':id' => $pai_id]);
    $pai = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pai) {
        res(false, null, 'PAI não encontrado', 404);
    }

    // Validar permissao
    if ($user['role'] !== 'admin' && $pai['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    // Preparar dados para o template
    $form_data = json_decode($pai['form_data'], true) ?: [];
    $data = [
        'pai' => array_merge($pai, $form_data, [
            'data_nascimento_formatada' => !empty($pai['birth_date']) ? date('d/m/Y', strtotime($pai['birth_date'])) : '',
        ]),
        'photo_path' => $pai['photo_url'] ? '../' . $pai['photo_url'] : null,
    ];

    // Capturar o HTML do template
    ob_start();
    include __DIR__ . '/templates/pdf/pai_template.php';
    $html = ob_get_clean();

    // Configurar e gerar PDF
    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'pai',
        'title' => 'Plano de Atendimento Individual - ' . $pai['student_name'],
        'student_name' => $pai['student_name'],
        'form_id' => $pai_id,
        'student_id' => $pai['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF do PAI: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
