<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL
 * 
 * Gera documento PDF profissional baseado no modelo fornecido
 * Utiliza mPDF para geração do documento
 * 
 * Endpoint: POST /pdf/entrevista/{id}
 * Resposta: Arquivo PDF para download
 */

require_once 'functions.php';
require_once __DIR__ . '/vendor/autoload.php';

use Mpdf\Mpdf;

header('Content-Type: application/json; charset=utf-8');
cors();

// Verificar autenticação
$user = require_auth();

// Pegar ID da entrevista
$entrevista_id = $_GET['id'] ?? null;

if (!$entrevista_id) {
    res(false, null, 'ID da entrevista não fornecido', 400);
}

try {
    // Buscar dados da entrevista
    $sql = "SELECT e.*, s.name as student_name, s.photo_url, s.birth_date, s.school_name
            FROM entrevistas_responsavel e
            LEFT JOIN students s ON e.student_id = s.id
            WHERE e.id = :id";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $entrevista_id]);
    $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$entrevista) {
        res(false, null, 'Entrevista não encontrada', 404);
    }
    
    // Verificar permissões (professor só vê suas entrevistas)
    if ($user['role'] !== 'admin' && $entrevista['teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão para acessar esta entrevista', 403);
    }
    
    // Preparar dados para o template
    $data = $entrevista;
    $data['data_entrevista_formatada'] = date('d/m/Y', strtotime($data['data_entrevista']));
    $data['data_nascimento_formatada'] = $data['data_nascimento'] ? date('d/m/Y', strtotime($data['data_nascimento'])) : '';
    
    // Template HTML baseado no modelo PDF
    $html = getEntrevistaTemplate($data);
    
    // Configurar mPDF
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 20,
        'margin_bottom' => 20,
        'margin_header' => 10,
        'margin_footer' => 10
    ]);
    
    // Metadados
    $mpdf->SetTitle('Entrevista com Responsável - ' . $data['student_name']);
    $mpdf->SetAuthor('ConectEDU - Sistema AEE');
    $mpdf->SetSubject('Entrevista com Responsável');
    $mpdf->SetKeywords('AEE, Entrevista, Educação Especial');
    
    // Escrever HTML no PDF
    $mpdf->WriteHTML($html);
    
    // Criar diretório se não existir
    $uploadDir = __DIR__ . '/uploads/documentos/entrevistas/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    // Nome do arquivo
    $fileName = 'Entrevista_' . sanitizeFileName($data['student_name']) . '_' . date('Y-m-d') . '.pdf';
    $filePath = $uploadDir . $fileName;
    
    // Salvar PDF
    $mpdf->Output($filePath, \Mpdf\Output\Destination::FILE);
    
    // Registrar documento gerado na tabela
    $insertSql = "INSERT INTO documentos_gerados 
                  (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
                  VALUES 
                  (:tipo, :form_id, :student_id, :teacher_id, :file_path, :file_name, :file_size, :titulo)";
    
    $insertStmt = $pdo->prepare($insertSql);
    $insertStmt->execute([
        ':tipo' => 'entrevista',
        ':form_id' => $entrevista_id,
        ':student_id' => $data['student_id'],
        ':teacher_id' => $user['id'],
        ':file_path' => 'backend/uploads/documentos/entrevistas/' . $fileName,
        ':file_name' => $fileName,
        ':file_size' => filesize($filePath),
        ':titulo' => 'Entrevista - ' . $data['student_name'] . ' - ' . date('d/m/Y')
    ]);
    
    $documentoId = $pdo->lastInsertId();
    
    // Retornar PDF como download
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $fileName . '"');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
    
} catch (Exception $e) {
    error_log('Erro ao gerar PDF da entrevista: ' . $e->getMessage());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
}

/**
 * Template HTML da Entrevista
 * Baseado no modelo PDF fornecido
 */
function getEntrevistaTemplate($data) {
    // Foto do aluno
    $fotoHtml = '';
    if (!empty($data['photo_url'])) {
        $fotoPath = __DIR__ . '/../' . $data['photo_url'];
        if (file_exists($fotoPath)) {
            $fotoHtml = '<img src="' . $fotoPath . '" style="width:80px;height:100px;object-fit:cover;border:1px solid #333;">';
        }
    }
    
    // Checkboxes
    $motivo_primeira = $data['motivo_entrevista'] == 'primeira' ? '☑' : '☐';
    $motivo_atualizacao = $data['motivo_entrevista'] == 'atualizacao' ? '☑' : '☐';
    $motivo_outros = $data['motivo_entrevista'] == 'outros' ? '☑' : '☐';
    
    $amamentado_sim = $data['foi_amamentado'] == 1 ? '☑' : '☐';
    $amamentado_nao = $data['foi_amamentado'] == 0 ? '☑' : '☐';
    
    return <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            margin: 20mm 15mm;
        }
        body {
            font-family: Arial, sans-serif;
            font-size: 11pt;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }
        .header h1 {
            margin: 0;
            font-size: 18pt;
            font-weight: bold;
        }
        .data-entrevista {
            text-align: right;
            margin-top: 10px;
            font-size: 10pt;
        }
        .section {
            margin-bottom: 15px;
            page-break-inside: avoid;
        }
        .section-title {
            background-color: #4a5568;
            color: white;
            padding: 5px 10px;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 12pt;
        }
        .field-row {
            margin-bottom: 8px;
            display: table;
            width: 100%;
        }
        .field-label {
            font-weight: bold;
            display: inline-block;
            min-width: 150px;
        }
        .field-value {
            display: inline;
            border-bottom: 1px dotted #999;
            padding-left: 5px;
        }
        .grid-2 {
            display: table;
            width: 100%;
        }
        .grid-col {
            display: table-cell;
            width: 50%;
            padding-right: 10px;
        }
        .checkbox {
            font-size: 14pt;
            margin-right: 3px;
        }
        .textarea-field {
            border: 1px solid #ccc;
            padding: 5px;
            min-height: 40px;
            margin-top: 5px;
            background-color: #f9f9f9;
        }
        .signature-box {
            margin-top: 40px;
            text-align: center;
        }
        .signature-line {
            border-top: 1px solid #000;
            width: 300px;
            margin: 0 auto 5px auto;
        }
        .foto-aluno {
            float: right;
            margin-left: 15px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <div class="header">
        <h1>ENTREVISTA COM O RESPONSÁVEL</h1>
        <div class="data-entrevista">Data da Entrevista: {$data['data_entrevista_formatada']}</div>
    </div>
    
    <!-- DADOS DE IDENTIFICAÇÃO -->
    <div class="section">
        <div class="section-title">DADOS DE IDENTIFICAÇÃO</div>
        
        <div class="foto-aluno">{$fotoHtml}</div>
        
        <div class="field-row">
            <span class="field-label">Nome do estudante:</span>
            <span class="field-value">{$data['nome_estudante']}</span>
        </div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Data de Nascimento:</span>
                <span class="field-value">{$data['data_nascimento_formatada']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Naturalidade:</span>
                <span class="field-value">{$data['naturalidade']}</span>
            </div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Nome da Escola:</span>
            <span class="field-value">{$data['nome_escola']}</span>
        </div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Série/Ano:</span>
                <span class="field-value">{$data['serie_ano']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Turno:</span>
                <span class="field-value">{$data['turno']}</span>
            </div>
        </div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Pai:</span>
                <span class="field-value">{$data['nome_pai']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Idade:</span>
                <span class="field-value">{$data['idade_pai']}</span>
            </div>
        </div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Mãe:</span>
                <span class="field-value">{$data['nome_mae']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Idade:</span>
                <span class="field-value">{$data['idade_mae']}</span>
            </div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Endereço:</span>
            <span class="field-value">{$data['endereco']}</span>
        </div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Bairro:</span>
                <span class="field-value">{$data['bairro']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Cidade:</span>
                <span class="field-value">{$data['cidade']}</span>
            </div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Motivo da Entrevista:</span><br>
            <span class="checkbox">{$motivo_primeira}</span> Primeira Entrevista &nbsp;&nbsp;
            <span class="checkbox">{$motivo_atualizacao}</span> Atualização da Entrevista &nbsp;&nbsp;
            <span class="checkbox">{$motivo_outros}</span> Outros
        </div>
    </div>
    
    <!-- INFORMAÇÕES DA FAMÍLIA -->
    <div class="section">
        <div class="section-title">INFORMAÇÕES DA FAMÍLIA</div>
        
        <div class="field-row">
            <span class="field-label">Composição da família na época da concepção:</span>
            <div class="textarea-field">{$data['composicao_familia_concepcao']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Vida Social da Família:</span>
            <div class="textarea-field">{$data['vida_social_familia']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Hábito Familiar:</span>
            <div class="textarea-field">{$data['habito_familiar']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Benefícios sociais:</span>
            <div class="textarea-field">{$data['beneficios_sociais']}</div>
        </div>
    </div>
    
    <!-- GESTAÇÃO/NASCIMENTO -->
    <div class="section">
        <div class="section-title">GESTAÇÃO/NASCIMENTO</div>
        
        <div class="field-row">
            <span class="field-label">A gravidez foi planejada?</span>
            <div class="textarea-field">{$data['gravidez_planejada_relato']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Tipo de parto:</span>
            <span class="field-value">{$data['tipo_parto']}</span>
        </div>
        
        <div class="field-row">
            <span class="field-label">Observações sobre o nascimento:</span>
            <div class="textarea-field">{$data['observacoes_nascimento']}</div>
        </div>
    </div>
    
    <!-- ALIMENTAÇÃO -->
    <div class="section">
        <div class="section-title">ALIMENTAÇÃO</div>
        
        <div class="field-row">
            <span class="field-label">Foi amamentado?</span>
            <span class="checkbox">{$amamentado_sim}</span> Sim &nbsp;&nbsp;
            <span class="checkbox">{$amamentado_nao}</span> Não
        </div>
        
        <div class="field-row">
            <span class="field-label">Até que idade:</span>
            <span class="field-value">{$data['amamentacao_ate_idade']}</span>
        </div>
        
        <div class="field-row">
            <span class="field-label">Alimentação atual:</span>
            <div class="textarea-field">{$data['alimentacao_atual']}</div>
        </div>
    </div>
    
    <!-- SAÚDE -->
    <div class="section">
        <div class="section-title">SAÚDE</div>
        
        <div class="field-row">
            <span class="field-label">Histórico de saúde:</span>
            <div class="textarea-field">{$data['historico_saude']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Acompanhamentos médicos:</span>
            <div class="textarea-field">{$data['acompanhamentos_medicos']}</div>
        </div>
    </div>
    
    <!-- DESENVOLVIMENTO -->
    <div class="section">
        <div class="section-title">DESENVOLVIMENTO PREGRESSO</div>
        
        <div class="grid-2">
            <div class="grid-col">
                <span class="field-label">Idade que andou:</span>
                <span class="field-value">{$data['idade_andou']}</span>
            </div>
            <div class="grid-col">
                <span class="field-label">Idade que falou:</span>
                <span class="field-value">{$data['idade_falou']}</span>
            </div>
        </div>
    </div>
    
    <!-- COMUNICAÇÃO -->
    <div class="section">
        <div class="section-title">DESENVOLVIMENTO ATUAL (Comunicação)</div>
        
        <div class="field-row">
            <span class="field-label">Como se comunica:</span>
            <div class="textarea-field">{$data['como_se_comunica']}</div>
        </div>
    </div>
    
    <!-- VIDA ESCOLAR -->
    <div class="section">
        <div class="section-title">VIDA ESCOLAR</div>
        
        <div class="field-row">
            <span class="field-label">Histórico escolar:</span>
            <div class="textarea-field">{$data['historico_escolar']}</div>
        </div>
        
        <div class="field-row">
            <span class="field-label">Frequenta Sala de Recursos:</span>
            <span class="field-value">{$data['frequenta_sala_recursos']}</span>
        </div>
        
        <div class="field-row">
            <span class="field-label">Expectativas da família:</span>
            <div class="textarea-field">{$data['expectativas_familia']}</div>
        </div>
    </div>
    
    <!-- ASSINATURAS -->
    <div class="signature-box">
        <div style="display:inline-block; margin: 0 30px;">
            <div class="signature-line"></div>
            <div>{$data['nome_entrevistador']}</div>
            <div style="font-size:9pt;">Entrevistador(a)</div>
        </div>
        
        <div style="display:inline-block; margin: 0 30px;">
            <div class="signature-line"></div>
            <div>{$data['responsavel_nome']}</div>
            <div style="font-size:9pt;">Responsável</div>
        </div>
    </div>
    
</body>
</html>
HTML;
}

/**
 * Sanitizar nome de arquivo
 */
function sanitizeFileName($name) {
    $name = preg_replace('/[^a-zA-Z0-9\s]/', '', $name);
    $name = str_replace(' ', '_', $name);
    return substr($name, 0, 50);
}
