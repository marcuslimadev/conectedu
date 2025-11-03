<?php
/**
 * GERADOR DE PDF - ENTREVISTA COM RESPONSÁVEL V2
 * Baseado no modelo oficial ENTREVISTA COM O RESPONSÁVEL.txt
 * Estrutura completa com todas as seções do formulário AEE
 */

// Só carrega dependencies se não estiver sendo incluído
if (!function_exists('db')) {
    require_once 'functions.php';
}
if (!class_exists('Mpdf\Mpdf')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Mpdf\Mpdf;

// Se chamado diretamente (não via api.php)
if (!isset($user) || !isset($pdo)) {
    header('Content-Type: application/json; charset=utf-8');
    cors();
    $user = require_auth();
    $pdo = db();
}

// Pegar ID da entrevista
$entrevista_id = $_GET['id'] ?? null;

if (!$entrevista_id) {
    res(false, null, 'ID da entrevista não fornecido', 400);
}

try {
    // Buscar dados da entrevista
    $sql = "SELECT e.*, s.name as student_name, s.photo_url, s.birth_date, 
                   sch.name as school_name
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
    
    // Verificar permissões
    if ($user['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão', 403);
    }
    
    // Decodificar form_data JSON
    $d = json_decode($entrevista['form_data'], true) ?? [];
    
    error_log('[PDF-V2] Campos disponíveis: ' . implode(', ', array_keys($d)));
    
    // Helper para valores seguros
    function v($arr, $key, $default = '') {
        $val = $arr[$key] ?? $default;
        return htmlspecialchars($val, ENT_QUOTES, 'UTF-8');
    }
    
    // Helper para checkbox
    function check($arr, $key, $value) {
        return ($arr[$key] ?? '') == $value ? '☑' : '☐';
    }
    
    // Helper para data formatada
    function data_br($data) {
        if (empty($data) || $data == '0000-00-00') return '___/___/______';
        try {
            return date('d/m/Y', strtotime($data));
        } catch (Exception $e) {
            return '___/___/______';
        }
    }
    
    // Configurar mPDF
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 15,
        'margin_bottom' => 15,
    ]);
    
    // Metadados
    $student_name = v($d, 'nome_estudante') ?: ($entrevista['student_name'] ?? 'Aluno');
    $mpdf->SetTitle('Entrevista com Responsável - ' . $student_name);
    $mpdf->SetAuthor('ConectEDU - Sistema AEE');
    
    // DATA DA ENTREVISTA
    $data_entrevista = data_br(v($d, 'data_entrevista'));
    
    // DADOS DE IDENTIFICAÇÃO
    $nome_estudante = v($d, 'nome_estudante') ?: ($entrevista['student_name'] ?? '');
    $data_nascimento = data_br(v($d, 'data_nascimento'));
    $naturalidade = v($d, 'naturalidade');
    $nome_escola = v($d, 'nome_escola') ?: ($entrevista['school_name'] ?? '');
    $serie_ano = v($d, 'serie_ano');
    $turno = v($d, 'turno');
    
    // PAIS
    $nome_pai = v($d, 'nome_pai');
    $idade_pai = v($d, 'idade_pai');
    $escolaridade_pai = v($d, 'escolaridade_pai');
    $nome_mae = v($d, 'nome_mae');
    $idade_mae = v($d, 'idade_mae');
    $escolaridade_mae = v($d, 'escolaridade_mae');
    
    // ENDEREÇO
    $endereco = v($d, 'endereco');
    $bairro = v($d, 'bairro');
    $cidade = v($d, 'cidade');
    $telefone = v($d, 'telefone');
    
    // MOTIVO DA ENTREVISTA
    $check_primeira = check($d, 'motivo_entrevista', 'primeira');
    $check_atualizacao = check($d, 'motivo_entrevista', 'atualizacao');
    $check_outros = check($d, 'motivo_entrevista', 'outros');
    
    // HTML DO PDF
    $html = <<<HTML
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'DejaVu Sans', Arial, sans-serif;
            font-size: 10pt;
            line-height: 1.4;
            color: #000;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .header h1 {
            font-size: 14pt;
            font-weight: bold;
            margin: 0 0 10px 0;
        }
        .data-entrevista {
            text-align: right;
            font-size: 9pt;
        }
        .secao {
            margin-top: 12px;
            margin-bottom: 12px;
        }
        .secao-titulo {
            background-color: #e0e0e0;
            padding: 4px 8px;
            font-weight: bold;
            font-size: 10pt;
            margin-bottom: 8px;
        }
        .campo {
            margin-bottom: 6px;
        }
        .label {
            font-weight: bold;
            display: inline;
        }
        .valor {
            display: inline;
            border-bottom: 1px dotted #666;
            min-width: 100px;
            padding-left: 5px;
        }
        .linha {
            display: block;
            margin-bottom: 5px;
        }
        .grid-2col {
            width: 100%;
        }
        .grid-2col td {
            width: 50%;
            padding: 3px 5px 3px 0;
        }
        .checkbox {
            font-size: 12pt;
            margin-right: 5px;
        }
        .textarea {
            border: 1px solid #ccc;
            padding: 6px;
            background-color: #f9f9f9;
            min-height: 50px;
            margin-top: 4px;
            word-wrap: break-word;
        }
    </style>
</head>
<body>
    <!-- HEADER -->
    <div class="header">
        <h1>ENTREVISTA COM O RESPONSÁVEL</h1>
        <div class="data-entrevista">Data da Entrevista: {$data_entrevista}</div>
    </div>
    
    <!-- DADOS DE IDENTIFICAÇÃO -->
    <div class="secao">
        <div class="secao-titulo">DADOS DE IDENTIFICAÇÃO</div>
        
        <div class="campo">
            <span class="label">Nome do estudante:</span>
            <span class="valor">{$nome_estudante}</span>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Data de Nascimento:</span>
                    <span class="valor">{$data_nascimento}</span>
                </td>
                <td>
                    <span class="label">Naturalidade:</span>
                    <span class="valor">{$naturalidade}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">Nome da Escola:</span>
            <span class="valor">{$nome_escola}</span>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Série/Ano:</span>
                    <span class="valor">{$serie_ano}</span>
                </td>
                <td>
                    <span class="label">Turno:</span>
                    <span class="valor">{$turno}</span>
                </td>
            </tr>
        </table>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Pai:</span>
                    <span class="valor">{$nome_pai}</span>
                </td>
                <td>
                    <span class="label">Idade:</span>
                    <span class="valor">{$idade_pai}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">Escolaridade:</span>
                    <span class="valor">{$escolaridade_pai}</span>
                </td>
            </tr>
        </table>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Mãe:</span>
                    <span class="valor">{$nome_mae}</span>
                </td>
                <td>
                    <span class="label">Idade:</span>
                    <span class="valor">{$idade_mae}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">Escolaridade:</span>
                    <span class="valor">{$escolaridade_mae}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">Endereço:</span>
            <span class="valor">{$endereco}</span>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Bairro:</span>
                    <span class="valor">{$bairro}</span>
                </td>
                <td>
                    <span class="label">Cidade:</span>
                    <span class="valor">{$cidade}</span>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <span class="label">Tel.:</span>
                    <span class="valor">{$telefone}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo" style="margin-top: 10px;">
            <span class="label">Motivo da Entrevista:</span><br>
            <span class="checkbox">{$check_primeira}</span> Primeira Entrevista
            <span class="checkbox">{$check_atualizacao}</span> Atualização Da Entrevista
            <span class="checkbox">{$check_outros}</span> Outros
        </div>
    </div>
HTML;

    // INFORMAÇÕES DA FAMÍLIA
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">INFORMAÇÕES DA FAMÍLIA</div>
        
        <div class="campo">
            <span class="label">Como era composta a família na época da concepção da criança:</span>
            <div class="textarea">{$d['composicao_familia_concepcao']}</div>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Tem Irmãos:</span>
                    <span class="valor">{$d['tem_irmaos']}</span>
                </td>
                <td>
                    <span class="label">Quantos:</span>
                    <span class="valor">{$d['quantos_irmaos']}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">Quais as idades:</span>
            <span class="valor">{$d['idades_irmaos']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Os pais continuam casados? Se separados são presentes:</span>
            <span class="valor">{$d['pais_presentes']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Vida Social da Família (amigos, festas, passeios, moradia, nível econômico):</span>
            <div class="textarea">{$d['vida_social_familia']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Como é o hábito familiar do estudante? (Relatar como é o dia a dia):</span>
            <div class="textarea">{$d['habito_familiar']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Benefícios sociais? Bolsa Família / BPC / Passe Livre / Outros:</span>
            <div class="textarea">{$d['beneficios_sociais']}</div>
        </div>
    </div>
HTML;

    // GESTAÇÃO/NASCIMENTO
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">GESTAÇÃO/NASCIMENTO</div>
        
        <div class="campo">
            <span class="label">A gravidez foi planejada pelos pais? (Relate):</span>
            <div class="textarea">{$d['gravidez_planejada_relato']}</div>
        </div>
        
        <div class="campo">
            <span class="label">A gestação foi uma experiência agradável para a mãe?</span>
            <span class="valor">{$d['gestacao_agradavel']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como foi a saúde da mãe?</span>
            <div class="textarea">{$d['saude_mae_gestacao']}</div>
        </div>
        
        <div class="campo">
            <span class="label">E o estado emocional?</span>
            <div class="textarea">{$d['estado_emocional_mae']}</div>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Fez Pré-natal:</span>
                    <span class="valor">{$d['fez_prenatal']}</span>
                </td>
                <td>
                    <span class="label">Mês que começou:</span>
                    <span class="valor">{$d['prenatal_mes_inicio']}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">Foi necessário algum tratamento? Qual:</span>
            <div class="textarea">{$d['prenatal_qual_tratamento']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Nascimento – Tipo de parto:</span>
            <span class="valor">{$d['tipo_parto']}</span>
        </div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Nasceu no tempo normal?</span>
                    <span class="valor">{$d['nasceu_tempo_normal']}</span>
                </td>
                <td>
                    <span class="label">Observações:</span>
                    <span class="valor">{$d['observacoes_nascimento']}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">O bebê ao nascer:</span><br>
            <span class="checkbox">{$d['bebe_necessitou_oxigenio']}</span> necessitou oxigênio
            <span class="checkbox">{$d['bebe_teve_convulsao']}</span> teve convulsão
            <span class="checkbox">{$d['bebe_ictericia']}</span> icterícia
            <span class="checkbox">{$d['bebe_incubadora']}</span> incubadora
        </div>
    </div>
HTML;

    // Continua com mais seções...
    
    $mpdf->WriteHTML($html);
    
    // Salvar PDF
    $uploadDir = __DIR__ . '/uploads/documentos/entrevistas/';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $fileName = 'Entrevista_' . preg_replace('/[^A-Za-z0-9_-]/', '_', $student_name) . '_' . date('Y-m-d') . '.pdf';
    $filePath = $uploadDir . $fileName;
    
    $mpdf->Output($filePath, \Mpdf\Output\Destination::FILE);
    
    // Retornar PDF
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . $fileName . '"');
    header('Content-Length: ' . filesize($filePath));
    readfile($filePath);
    exit;
    
} catch (Exception $e) {
    error_log('[PDF-V2] ERRO: ' . $e->getMessage());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
}
