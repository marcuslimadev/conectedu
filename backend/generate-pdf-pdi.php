<?php
/**
 * GERADOR DE PDF - PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI) (Refatorado e Inteligente)
 *
 * Prioriza os dados do cadastro do aluno para garantir consistência.
 */

require_once 'functions.php';
require_once __DIR__ . '/services/PdfGeneratorService.php';

try {
    $user = require_auth();
    $pdo = db();

    $pdi_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$pdi_id) {
        res(false, null, 'ID do PDI inválido', 400);
    }

    // Busca dados do PDI e os dados mais recentes do aluno
    $stmt = $pdo->prepare("
        SELECT
            pdi.*,
            s.name as student_name_from_db,
            s.birth_date,
            s.photo_url
        FROM pdi_forms pdi
        JOIN students s ON pdi.student_id = s.id
        WHERE pdi.id = :id
    ");
    $stmt->execute([':id' => $pdi_id]);
    $pdi = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pdi) {
        res(false, null, 'PDI não encontrado', 404);
    }

    if ($user['role'] !== 'admin' && $pdi['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    $form_data = json_decode($pdi['form_data'], true) ?: [];

    // Lógica inteligente: dados do formulário são a base, mas dados
    // de identificação do aluno são sempre os mais recentes.
    $data = [
        'pdi' => array_merge($form_data, [
            'student_name' => $pdi['student_name_from_db'], // Prioridade
            'data_nascimento_formatada' => !empty($pdi['birth_date']) ? date('d/m/Y', strtotime($pdi['birth_date'])) : '',
            'data_elaboracao_formatada' => !empty($form_data['data_elaboracao']) ? date('d/m/Y', strtotime($form_data['data_elaboracao'])) : '',
        ]),
        'aspectos_psicomotores' => $form_data['aspectos_psicomotores'] ?? [],
        'aspectos_pedagogicos' => $form_data['aspectos_pedagogicos'] ?? [],
        'planejamento_bimestral' => $form_data['planejamento_bimestral'] ?? [],
        'avaliacoes_bimestrais' => $form_data['avaliacoes_bimestrais'] ?? [],
        'photo_path' => $pdi['photo_url'] ? '../' . $pdi['photo_url'] : null,
    ];

    ob_start();
    include __DIR__ . '/templates/pdf/pdi_template.php';
    $html = ob_get_clean();

    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'pdi',
        'title' => 'Plano de Desenvolvimento Individual - ' . $pdi['student_name_from_db'],
        'student_name' => $pdi['student_name_from_db'],
        'form_id' => $pdi_id,
        'student_id' => $pdi['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF do PDI: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
