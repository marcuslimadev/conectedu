<?php
/**
 * GERADOR DE PDF - PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI) (Refatorado)
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
    $pdi_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$pdi_id) {
        res(false, null, 'ID do PDI inválido', 400);
    }

    // Buscar dados do PDI
    $stmt = $pdo->prepare("
        SELECT pdi.*, s.name as student_name, s.birth_date, s.photo_url
        FROM pdi_forms pdi
        JOIN students s ON pdi.student_id = s.id
        WHERE pdi.id = :id
    ");
    $stmt->execute([':id' => $pdi_id]);
    $pdi = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pdi) {
        res(false, null, 'PDI não encontrado', 404);
    }

    // Validar permissao
    if ($user['role'] !== 'admin' && $pdi['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    // Preparar dados para o template
    $form_data = json_decode($pdi['form_data'], true) ?? [];
    $data = [
        'pdi' => array_merge($pdi, $form_data, [
            'data_elaboracao_formatada' => !empty($form_data['data_elaboracao']) ? date('d/m/Y', strtotime($form_data['data_elaboracao'])) : '',
            'data_nascimento_formatada' => !empty($pdi['birth_date']) ? date('d/m/Y', strtotime($pdi['birth_date'])) : '',
        ]),
        'aspectos_psicomotores' => json_decode($form_data['aspectos_psicomotores'] ?? '{}', true),
        'aspectos_pedagogicos' => json_decode($form_data['aspectos_pedagogicos'] ?? '{}', true),
        'planejamento_bimestral' => json_decode($form_data['planejamento_bimestral'] ?? '{}', true),
        'photo_path' => $pdi['photo_url'] ? '../' . $pdi['photo_url'] : null,
    ];

    // Capturar o HTML do template
    ob_start();
    include __DIR__ . '/templates/pdf/pdi_template.php';
    $html = ob_get_clean();

    // Configurar e gerar PDF
    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'pdi',
        'title' => 'Plano de Desenvolvimento Individual - ' . $pdi['student_name'],
        'student_name' => $pdi['student_name'],
        'form_id' => $pdi_id,
        'student_id' => $pdi['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF do PDI: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
