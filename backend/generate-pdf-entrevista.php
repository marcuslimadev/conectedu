<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL (Refatorado)
 *
 * Gera documento PDF profissional utilizando a classe PdfGenerator e templates externos.
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
$entrevista_id = $_GET['id'] ?? null;
if (!$entrevista_id) {
    res(false, null, 'ID da entrevista não fornecido', 400);
}

try {
    // --- Busca de Dados ---
    $sql = "SELECT e.*, s.name as student_name, s.photo_url, s.birth_date, sch.name as school_name
            FROM entrevista_forms e
            LEFT JOIN students s ON e.student_id = s.id
            LEFT JOIN schools sch ON s.school_id = sch.id
            WHERE e.id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $entrevista_id]);
    $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$entrevista) {
        res(false, null, 'Entrevista não encontrada', 404);
    }

    // --- Verificação de Permissões ---
    if ($user['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão para acessar esta entrevista', 403);
    }

    // --- Preparação dos Dados para o Template ---
    $formData = json_decode($entrevista['form_data'], true) ?? [];

    $data = array_merge($formData, [
        'id' => $entrevista['id'],
        'student_id' => $entrevista['student_id'],
        'student_name' => $entrevista['student_name'] ?? $formData['nome_estudante'] ?? '',
        'photo_url' => $entrevista['photo_url'],
        'birth_date' => $entrevista['birth_date'],
        'school_name' => $entrevista['school_name'] ?? $formData['nome_escola'] ?? ''
    ]);
    
    // Fallbacks para dados essenciais
    if (empty($data['nome_estudante']) && !empty($data['student_name'])) {
        $data['nome_estudante'] = $data['student_name'];
    }
    if (empty($data['nome_escola']) && !empty($data['school_name'])) {
        $data['nome_escola'] = $data['school_name'];
    }
    
    // Formatação de datas e títulos para o template
    $data['data_entrevista_formatada'] = !empty($data['data_entrevista']) ? date('d/m/Y', strtotime($data['data_entrevista'])) : date('d/m/Y');
    $data['data_nascimento_formatada'] = !empty($data['birth_date']) ? date('d/m/Y', strtotime($data['birth_date'])) : (!empty($data['data_nascimento']) ? date('d/m/Y', strtotime($data['data_nascimento'])) : '');
    $data['main_title'] = 'ENTREVISTA COM O RESPONSÁVEL';
    $data['document_date'] = $data['data_entrevista_formatada'];


    // --- Geração do PDF ---
    $pdfGenerator = new PdfGenerator($pdo);

    $pdfGenerator->setMetadata(
        'Entrevista com Responsável - ' . $data['student_name'],
        'ConectEDU - Sistema AEE',
        'Entrevista com Responsável',
        'AEE, Entrevista, Educação Especial'
    );

    // Carregar o template HTML, passando os dados
    $pdfGenerator->loadHtmlFromFile(__DIR__ . '/templates/entrevista-template.php', $data);

    // --- Salvamento e Registro ---
    $uploadDir = __DIR__ . '/uploads/documentos/entrevistas/';
    $fileName = 'Entrevista_' . sanitizeFileName($data['student_name']) . '_' . date('Y-m-d') . '.pdf';
    $filePath = $uploadDir . $fileName;
    $relativeFilePath = 'backend/uploads/documentos/entrevistas/' . $fileName;

    // Salvar o arquivo no servidor
    $pdfGenerator->saveToFile($filePath);

    // Registrar no banco de dados
    $pdfGenerator->logDocument(
        'entrevista',
        $entrevista_id,
        $data['student_id'],
        $user['id'],
        $relativeFilePath,
        $fileName,
        'Entrevista - ' . $data['student_name'] . ' - ' . date('d/m/Y')
    );

    // --- Resposta ---
    // Enviar o PDF para download
    $pdfGenerator->downloadFile($filePath, $fileName);

} catch (Exception $e) {
    error_log('Erro ao gerar PDF da entrevista (refatorado): ' . $e->getMessage());
    res(false, null, 'Erro interno ao gerar o PDF.', 500);
}
