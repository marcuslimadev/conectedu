<?php
/**
 * GERADOR DE PDF - PLANO DE ATENDIMENTO INDIVIDUAL (PAI) (Refatorado e Inteligente)
 *
 * Prioriza os dados do cadastro do aluno para garantir consistência.
 */

require_once 'functions.php';
require_once __DIR__ . '/services/PdfGeneratorService.php';

try {
    $user = require_auth();
    $pdo = db();

    $pai_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$pai_id) {
        res(false, null, 'ID do PAI inválido', 400);
    }

    // Busca dados do PAI e os dados mais recentes do aluno e da escola
    $stmt = $pdo->prepare("
        SELECT
            pai.*,
            s.name as student_name_from_db,
            s.birth_date,
            s.photo_url,
            sch.name as school_name_from_db
        FROM plano_atendimento_forms pai
        JOIN students s ON pai.student_id = s.id
        LEFT JOIN schools sch ON s.school_id = sch.id
        WHERE pai.id = :id
    ");
    $stmt->execute([':id' => $pai_id]);
    $pai = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pai) {
        res(false, null, 'PAI não encontrado', 404);
    }

    if ($user['role'] !== 'admin' && $pai['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    $form_data = json_decode($pai['form_data'], true) ?: [];

    // Lógica inteligente: dados do formulário são a base, mas dados de identificação
    // do aluno são sempre os mais recentes do banco de dados.
    $data = [
        'pai' => array_merge($form_data, [
            'student_name' => $pai['student_name_from_db'], // Prioridade
            'nome_escola' => $pai['school_name_from_db'], // Prioridade
            'data_nascimento_formatada' => !empty($pai['birth_date']) ? date('d/m/Y', strtotime($pai['birth_date'])) : '',
        ]),
        'photo_path' => $pai['photo_url'] ? '../' . $pai['photo_url'] : null,
    ];

    ob_start();
    include __DIR__ . '/templates/pdf/pai_template.php';
    $html = ob_get_clean();

    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'pai',
        'title' => 'Plano de Atendimento Individual - ' . $pai['student_name_from_db'],
        'student_name' => $pai['student_name_from_db'],
        'form_id' => $pai_id,
        'student_id' => $pai['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF do PAI: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
