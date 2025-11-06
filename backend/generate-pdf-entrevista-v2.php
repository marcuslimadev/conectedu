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
    
    // Configurar mPDF (margens maiores para header/footer)
    $mpdf = new Mpdf([
        'mode' => 'utf-8',
        'format' => 'A4',
        'margin_left' => 15,
        'margin_right' => 15,
        'margin_top' => 28,
        'margin_bottom' => 20,
    ]);
    
        // Metadados
    $student_name = v($d, 'nome_estudante') ?: ($entrevista['student_name'] ?? 'Aluno');
    $mpdf->SetTitle('Entrevista com Responsável - ' . $student_name);
    $mpdf->SetAuthor('ConectEDU - Sistema AEE');

        // Header com logo e nome da escola
        $logoHtml = '';
        $logoPaths = [
                __DIR__ . '/../frontend/logo.png',
                __DIR__ . '/../frontend/assets/logo.png',
                __DIR__ . '/../frontend/img/logo.png',
                __DIR__ . '/logo.png',
                __DIR__ . '/assets/logo.png'
        ];
        foreach ($logoPaths as $p) {
                if (file_exists($p)) {
                        $logoRel = str_replace(__DIR__ . DIRECTORY_SEPARATOR, '', $p);
                        $logoHtml = '<img src="' . htmlspecialchars($logoRel, ENT_QUOTES, 'UTF-8') . '" style="height:40px;">';
                        break;
                }
        }

        $schoolName = htmlspecialchars($entrevista['school_name'] ?? '', ENT_QUOTES, 'UTF-8');
        $mpdf->SetHTMLHeader('<div style="display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid #ccc; padding:6px 0; font-family: DejaVu Sans, Arial, sans-serif; font-size:10pt;">
                <div>' . $logoHtml . '</div>
                <div style="text-align:right;">
                    <div style="font-weight:bold;">ConectEDU - Sistema AEE</div>
                    <div style="font-size:9pt;">' . $schoolName . '</div>
                </div>
            </div>');

        // Footer com data e paginação
        $mpdf->SetHTMLFooter('<div style="border-top:1px solid #ccc; font-size:9pt; color:#666; display:flex; align-items:center; justify-content:space-between; padding-top:6px; font-family: DejaVu Sans, Arial, sans-serif;">
                <div>Gerado em ' . date('d/m/Y H:i') . '</div>
                <div>Página {PAGENO} de {nbpg}</div>
            </div>');
    
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

    // ALIMENTAÇÃO
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">ALIMENTAÇÃO</div>
        
        <div class="campo">
            <span class="label">Foi amamentado? Até quando?</span>
            <span class="valor">{$d['amamentacao_ate_quando']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Teve alguma dificuldade? Qual?</span>
            <div class="textarea">{$d['amamentacao_dificuldades']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Usou mamadeira? Até quando?</span>
            <span class="valor">{$d['mamadeira_ate_quando']}</span>
        </div>
        
        <div class="campo">
            <span class="label">E a chupeta?</span>
            <span class="valor">{$d['chupeta']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como foi a introdução da alimentação sólida?</span>
            <div class="textarea">{$d['introducao_alimentacao_solida']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Alimenta-se sozinho?</span>
            <span class="valor">{$d['alimenta_sozinho']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Teve/tem alguma dificuldade? Qual?</span>
            <div class="textarea">{$d['alimentacao_dificuldades_atuais']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Como é o apetite?</span>
            <span class="valor">{$d['apetite']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Refeições diárias (descrever tipos de alimentos e quantas vezes se alimenta):</span>
            <div class="textarea">{$d['refeicoes_diarias']}</div>
        </div>
    </div>
HTML;

    // SAÚDE
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">SAÚDE</div>
        
        <div class="campo">
            <span class="label">Toma algum medicamento? Qual? Quem prescreve?</span>
            <div class="textarea">{$d['medicamentos']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Já fez eletroencefalograma?</span>
            <span class="valor">{$d['fez_eletroencefalograma']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Faz tratamento médico? Qual?</span>
            <div class="textarea">{$d['tratamento_medico']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Vacinação em dia?</span>
            <span class="valor">{$d['vacinacao_em_dia']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Teve alguma doença? Qual?</span>
            <div class="textarea">{$d['doencas']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Teve ou tem convulsões?</span>
            <span class="valor">{$d['teve_convulsoes']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Que tipo?</span>
            <span class="valor">{$d['convulsoes_tipo']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como é a crise?</span>
            <div class="textarea">{$d['convulsoes_como_crise']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Com qual frequência?</span>
            <span class="valor">{$d['convulsoes_frequencia']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Já teve internação? Motivo:</span>
            <div class="textarea">{$d['internacoes']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Já fez cirurgia? Motivo:</span>
            <div class="textarea">{$d['cirurgias']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Faz uso de aparelhos ortopédicos? Óculos? Prótese auditiva?</span>
            <div class="textarea">{$d['uso_aparelhos']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Já realizou exames audiométricos, oftalmológicos, neurológicos?</span>
            <div class="textarea">{$d['exames_realizados']}</div>
        </div>
    </div>
HTML;

    // DESENVOLVIMENTO PREGRESSO
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">DESENVOLVIMENTO PREGRESSO</div>
        
        <table class="grid-2col">
            <tr>
                <td>
                    <span class="label">Com que idade engatinhou?</span>
                    <span class="valor">{$d['idade_engatinhou']}</span>
                </td>
                <td>
                    <span class="label">Sentou?</span>
                    <span class="valor">{$d['idade_sentou']}</span>
                </td>
            </tr>
            <tr>
                <td>
                    <span class="label">Andou?</span>
                    <span class="valor">{$d['idade_andou']}</span>
                </td>
                <td>
                    <span class="label">Falou?</span>
                    <span class="valor">{$d['idade_falou']}</span>
                </td>
            </tr>
        </table>
        
        <div class="campo">
            <span class="label">Como foi o controle dos esfíncteres?</span>
            <div class="textarea">{$d['controle_esfincters']}</div>
        </div>
    </div>
HTML;

    // DESENVOLVIMENTO ATUAL
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">DESENVOLVIMENTO ATUAL</div>
        
        <div class="campo">
            <span class="label">Comunicação verbal (claro, gagueja, troca letras, prolixo, monossilábico):</span>
            <div class="textarea">{$d['comunicacao_verbal']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Apresenta dificuldade na fala?</span>
            <span class="valor">{$d['dificuldade_fala']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Qual?</span>
            <div class="textarea">{$d['dificuldade_fala_qual']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Faz tratamento fonoaudiológico?</span>
            <span class="valor">{$d['tratamento_fonoaudiologico']}</span>
        </div>
    </div>
HTML;

    // ATIVIDADES DE VIDA DIÁRIA
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">ATIVIDADES DE VIDA DIÁRIA</div>
        
        <div class="campo">
            <span class="label">Toma banho e se veste sozinho?</span>
            <span class="valor">{$d['banho_veste_sozinho']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Faz a higiene bucal?</span>
            <span class="valor">{$d['higiene_bucal']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Escova os dentes?</span>
            <span class="valor">{$d['escova_dentes']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Usa o banheiro sozinho?</span>
            <span class="valor">{$d['banheiro_sozinho']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Faz a higiene após o uso?</span>
            <span class="valor">{$d['higiene_apos_banheiro']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Usa fralda? Período:</span>
            <span class="valor">{$d['usa_fralda_periodo']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Penteia o cabelo sozinho?</span>
            <span class="valor">{$d['penteia_cabelo_sozinho']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Calça sapatos e amarra os cadarços?</span>
            <span class="valor">{$d['calca_sapatos_amarra']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Reconhece situações de perigo?</span>
            <span class="valor">{$d['reconhece_perigo']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Sai sozinho de casa?</span>
            <span class="valor">{$d['sai_sozinho']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Anda sozinho na rua?</span>
            <span class="valor">{$d['anda_sozinho_rua']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Fica sozinho em casa?</span>
            <span class="valor">{$d['fica_sozinho_casa']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como dorme (sozinho, roupas, coberta, luz acesa/apagada)?</span>
            <div class="textarea">{$d['como_dorme']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Quantas horas de sono?</span>
            <span class="valor">{$d['horas_sono']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Acorda durante a noite?</span>
            <span class="valor">{$d['acorda_durante_noite']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Dorme durante o dia?</span>
            <span class="valor">{$d['dorme_durante_dia']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Tem pesadelos?</span>
            <span class="valor">{$d['tem_pesadelos']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como brinca (sozinho, grupo)? Quais as brincadeiras?</span>
            <div class="textarea">{$d['como_brinca']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Com o que gosta de brincar?</span>
            <div class="textarea">{$d['brinquedos_preferidos']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Assiste TV, joga vídeo game? Quais programas ou jogos? Com qual frequência?</span>
            <div class="textarea">{$d['tv_videogame']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Sente curiosidade sexual?</span>
            <span class="valor">{$d['curiosidade_sexual']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como os pais vêm lidando com isso?</span>
            <div class="textarea">{$d['pais_lidam_sexualidade']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Que medidas disciplinares usam? São discutidas e decididas pelo casal?</span>
            <div class="textarea">{$d['medidas_disciplinares']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Como reage quando contrariado?</span>
            <div class="textarea">{$d['reacao_contrariado']}</div>
        </div>
        
        <div class="campo">
            <span class="label">E quando frustrado?</span>
            <div class="textarea">{$d['reacao_frustrado']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Apresenta hiperfoco (concentração intensa e prolongada em algo específico)? Relatar.</span>
            <div class="textarea">{$d['hiperfoco']}</div>
        </div>
    </div>
HTML;

    // SOCIALIZAÇÃO E PREFERÊNCIAS
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">SOCIALIZAÇÃO E PREFERÊNCIAS</div>
        
        <div class="campo">
            <span class="label">Faz amigos com facilidade?</span>
            <span class="valor">{$d['faz_amigos_facilidade']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Possui amigos (as) na vizinhança? Brinca na rua?</span>
            <span class="valor">{$d['amigos_vizinhanca']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Procura crianças da sua idade?</span>
            <span class="valor">{$d['procura_criancas_idade']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Gosta de passear?</span>
            <span class="valor">{$d['gosta_passear']}</span>
        </div>
        
        <div class="campo">
            <span class="label">E de ir a festas?</span>
            <span class="valor">{$d['gosta_festas']}</span>
        </div>
    </div>
HTML;

    // COMPORTAMENTO
    // Preparar marcadores de checkbox (verdadeiro/falso)
    $comp_alegre = !empty($d['comp_alegre']) ? '☑' : '☐';
    $comp_carinhoso = !empty($d['comp_carinhoso']) ? '☑' : '☐';
    $comp_calmo = !empty($d['comp_calmo']) ? '☑' : '☐';
    $comp_agitado = !empty($d['comp_agitado']) ? '☑' : '☐';
    $comp_triste = !empty($d['comp_triste']) ? '☑' : '☐';
    $comp_timido = !empty($d['comp_timido']) ? '☑' : '☐';
    $comp_criativo = !empty($d['comp_criativo']) ? '☑' : '☐';
    $comp_dependente = !empty($d['comp_dependente']) ? '☑' : '☐';
    $comp_ciumento = !empty($d['comp_ciumento']) ? '☑' : '☐';
    $comp_comunicativo = !empty($d['comp_comunicativo']) ? '☑' : '☐';
    $comp_reservado = !empty($d['comp_reservado']) ? '☑' : '☐';
    $comp_teimoso = !empty($d['comp_teimoso']) ? '☑' : '☐';
    $comp_agressivo = !empty($d['comp_agressivo']) ? '☑' : '☐';
    $comp_medroso = !empty($d['comp_medroso']) ? '☑' : '☐';

    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">COMPORTAMENTO</div>
        
        <div class="campo">
            <span class="label">Como descreveriam seu filho? (Marcar com X):</span><br>
            <span class="checkbox">{$comp_alegre}</span> alegre
            <span class="checkbox">{$comp_carinhoso}</span> carinhoso
            <span class="checkbox">{$comp_calmo}</span> calmo
            <span class="checkbox">{$comp_agitado}</span> agitado
            <span class="checkbox">{$comp_triste}</span> triste<br>
            <span class="checkbox">{$comp_timido}</span> tímido
            <span class="checkbox">{$comp_criativo}</span> criativo
            <span class="checkbox">{$comp_dependente}</span> dependente
            <span class="checkbox">{$comp_ciumento}</span> ciumento
            <span class="checkbox">{$comp_comunicativo}</span> comunicativo<br>
            <span class="checkbox">{$comp_reservado}</span> reservado
            <span class="checkbox">{$comp_teimoso}</span> teimoso
            <span class="checkbox">{$comp_agressivo}</span> agressivo
            <span class="checkbox">{$comp_medroso}</span> medroso
        </div>
        
        <div class="campo">
            <span class="label">Possui hábitos ou manias? Quais?</span>
            <div class="textarea">{$d['habitos_manias']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Como age diante da frustração?</span>
            <div class="textarea">{$d['comportamento_frustracao']}</div>
        </div>
    </div>
HTML;

    // VIDA ESCOLAR
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">VIDA ESCOLAR</div>
        
        <div class="campo">
            <span class="label">Com que idade entrou na escola?</span>
            <span class="valor">{$d['idade_entrada_escola']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como foi a adaptação?</span>
            <div class="textarea">{$d['adaptacao_escola']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Repetiu de ano? Quantas vezes?</span>
            <span class="valor">{$d['repetiu_ano']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Houve muita troca de professores?</span>
            <span class="valor">{$d['troca_professores']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Como é a frequência escolar?</span>
            <span class="valor">{$d['frequencia_escolar']}</span>
        </div>
        
        <div class="campo">
            <span class="label">A família participa dos eventos escolares e reuniões com a escola?</span>
            <div class="textarea">{$d['familia_participa_escola']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Faz as tarefas de casa? Com ajuda de quem?</span>
            <div class="textarea">{$d['faz_tarefas_casa']}</div>
        </div>
        
        <div class="campo">
            <span class="label">O que a escola acha do aluno?</span>
            <div class="textarea">{$d['opiniao_escola']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Corresponde ao desenvolvimento de alunos da mesma idade?</span>
            <span class="valor">{$d['desenvolvimento_compativel_idade']}</span>
        </div>
        
        <div class="campo">
            <span class="label">Na família há casos de problemas na aprendizagem ou de saúde? Quem?</span>
            <div class="textarea">{$d['familia_problemas_aprendizagem']}</div>
        </div>
        
        <div class="campo">
            <span class="label">Já frequentou sala de recursos?</span>
            <span class="valor">{$d['frequentou_sala_recursos']}</span>
        </div>
    </div>
HTML;

    // INFORMAÇÃO COMPLEMENTAR
    $html .= <<<HTML
    <div class="secao">
        <div class="secao-titulo">INFORMAÇÃO COMPLEMENTAR</div>
        
        <div class="campo">
            <span class="label">Informações adicionais que julgue relevantes:</span>
            <div class="textarea">{$d['informacoes_complementares']}</div>
        </div>
        
        <div style="margin-top: 30px;">
            <table class="grid-2col">
                <tr>
                    <td style="text-align: center; padding: 20px;">
                        <div style="border-top: 1px solid #000; padding-top: 5px;">
                            <strong>Assinatura do(a) Entrevistador(a)</strong>
                        </div>
                    </td>
                    <td style="text-align: center; padding: 20px;">
                        <div style="border-top: 1px solid #000; padding-top: 5px;">
                            <strong>Assinatura do(a) Responsável</strong>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
HTML;
    
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
