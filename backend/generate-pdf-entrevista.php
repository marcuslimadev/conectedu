<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL (Refatorado e Inteligente)
 *
 * Utiliza o servico centralizado de geracao de PDF e prioriza os dados
 * do cadastro do aluno para garantir consistência.
 */

require_once 'functions.php';
require_once __DIR__ . '/services/PdfGeneratorService.php';

try {
    $user = require_auth();
    $pdo = db();

    $entrevista_id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$entrevista_id) {
        res(false, null, 'ID da entrevista inválido', 400);
    }

    // Busca dados da entrevista e os dados mais recentes do aluno e da escola
    $stmt = $pdo->prepare("
        SELECT
            e.*,
            s.name as student_name_from_db,
            s.birth_date,
            s.address as student_address,
            s.photo_url,
            sch.name as school_name_from_db
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

    if ($user['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Acesso não autorizado', 403);
    }

    $formData = json_decode($entrevista['form_data'], true) ?: [];

    // Lógica de formulário inteligente:
    // Os dados do formulário ($formData) são a base, mas os dados de identificação
    // do aluno (nome, data de nasc., escola) são sobrescritos com os dados
    // mais recentes do banco de dados.
    $data = array_merge($formData, [
        'nome_estudante' => $entrevista['student_name_from_db'], // Prioridade
        'data_nascimento_formatada' => !empty($entrevista['birth_date']) ? date('d/m/Y', strtotime($entrevista['birth_date'])) : '',
        'nome_escola' => $entrevista['school_name_from_db'] ?? 'Não informado',
        'endereco_completo' => $entrevista['student_address'],
        'photo_url' => $entrevista['photo_url'] ? '../' . $entrevista['photo_url'] : null,
        'data_entrevista_formatada' => !empty($formData['data_entrevista']) ? date('d/m/Y', strtotime($formData['data_entrevista'])) : date('d/m/Y'),
    ]);
    
    ob_start();
    include __DIR__ . '/templates/pdf/entrevista_template.php';
    $html = ob_get_clean();

    $pdfService = new PdfGeneratorService($pdo, $user);
    $pdfConfig = [
        'document_type' => 'entrevista',
        'title' => 'Entrevista com Responsável - ' . $data['nome_estudante'],
        'student_name' => $data['nome_estudante'],
        'form_id' => $entrevista_id,
        'student_id' => $entrevista['student_id']
    ];
    
    $pdfService->generate($html, $pdfConfig);

} catch (Exception $e) {
    error_log("Erro ao gerar PDF da entrevista: " . $e->getMessage());
    res(false, null, 'Ocorreu um erro interno ao gerar o PDF.', 500);
}
