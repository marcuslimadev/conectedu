<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL (Refatorado)
 *
 * Utiliza o servico centralizado de geracao de PDF.
 * Foco: buscar dados, preparar e chamar o template.
 */

require_once 'functions.php';
require_once __DIR__ . '/services/PdfGeneratorService.php';

try {
    // Autenticacao e Conexao DB
    $user = require_auth();
    $pdo = db();

    // Validar ID
    $entrevista_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$entrevista_id) {
        res(false, null, 'ID da entrevista inválido', 400);
    }

    // Buscar dados da entrevista
    $stmt = $pdo->prepare("
        SELECT e.*, s.name as student_name, s.photo_url, s.birth_date, sch.name as school_name
        FROM entrevista_forms e
        JOIN students s ON e.student_id = s.id
        LEFT JOIN schools sch ON s.school_id = sch.id
        WHERE e.id = :id
    ");
    $stmt->execute([':id' => $entrevista_id]);
    $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$entrevista) {
        res(false, null, 'Entrevista não encontrada', 404);
    }

    // Validar permissao
    if ($user['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    // Preparar dados para o template
    $formData = json_decode($entrevista['form_data'], true) ?: [];
    $data = array_merge($formData, [
        'student_name' => $entrevista['student_name'],
        'photo_url' => $entrevista['photo_url'] ? '../' . $entrevista['photo_url'] : null,
        'data_entrevista_formatada' => !empty($formData['data_entrevista']) ? date('d/m/Y', strtotime($formData['data_entrevista'])) : date('d/m/Y'),
        'data_nascimento_formatada' => !empty($entrevista['birth_date']) ? date('d/m/Y', strtotime($entrevista['birth_date'])) : '',
        'nome_escola' => $entrevista['school_name'] ?? $formData['nome_escola'] ?? 'Não informado',
        'endereco_completo' => implode(', ', array_filter([$formData['endereco'] ?? '', $formData['bairro'] ?? '', $formData['cidade'] ?? '']))
    ]);
    
    // Capturar o HTML do template
    ob_start();
    include __DIR__ . '/templates/pdf/entrevista_template.php';
    $html = ob_get_clean();

    // Configurar e gerar PDF
    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'entrevista',
        'title' => 'Entrevista com Responsável - ' . $data['student_name'],
        'student_name' => $data['student_name'],
        'form_id' => $entrevista_id,
        'student_id' => $entrevista['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF da entrevista: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
