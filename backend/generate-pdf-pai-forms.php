<?php
/**
 * Gerador de PDF - PAI (plano_atendimento_forms JSON)
 * Lê plano_atendimento_forms.form_data (JSON) e renderiza um PDF com seções principais.
 * Salva o arquivo em disco e registra em documentos_gerados.
 */

// Dependências
if (!function_exists('db')) {
    require_once __DIR__ . '/functions.php';
}
if (!class_exists('Mpdf\\Mpdf')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Mpdf\Mpdf;
use Mpdf\Output\Destination;

// Se chamado diretamente
if (!isset($user) || !isset($pdo)) {
    header('Content-Type: application/json; charset=utf-8');
    $user = require_auth();
    $pdo = db();
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) res(false, null, 'ID do PAI inválido', 400);

// Buscar plano_atendimento_forms
$sql = 'SELECT pa.*, s.name AS student_name, s.photo_url, sch.name AS school_name, sch.city AS school_city, sch.address AS school_address
        FROM plano_atendimento_forms pa
        LEFT JOIN students s ON s.id = pa.student_id
        LEFT JOIN schools sch ON sch.id = s.school_id
        WHERE pa.id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$pai = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$pai) res(false, null, 'PAI não encontrado', 404);
if ($user['role'] !== 'admin' && (int)$pai['created_by_teacher_id'] !== (int)$user['id']) {
    res(false, null, 'Sem permissão para gerar este PDF', 403);
}

// Decodificar JSON
$D = [];
if (!empty($pai['form_data'])) {
    $tmp = json_decode($pai['form_data'], true);
    if (is_array($tmp)) $D = $tmp;
}

// Helpers
function vvh($arr, $key, $fallback = '') { $v = $arr[$key] ?? $fallback; return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function data_br_fmt_pai($s) {
    if (!$s || $s === '0000-00-00') return '';
    $t = strtotime($s); return $t ? date('d/m/Y', $t) : '';
}

$studentName = vvh($D, 'nome_estudante', $pai['student_name'] ?? '');
$schoolName  = vvh($D, 'nome_escola', $pai['school_name'] ?? '');
$dataInicio  = data_br_fmt_pai($pai['data_inicio'] ?? null);
$dataFim     = data_br_fmt_pai($pai['data_fim'] ?? null);

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 28,
    'margin_bottom' => 20,
]);
$mpdf->SetTitle('PAI - ' . ($studentName ?: 'Aluno'));
$mpdf->SetAuthor('ConectEDU - Sistema AEE');

$css = '<style>
body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10pt; color: #1f2937; }
h1 { font-size: 14pt; text-align: center; margin: 0 0 8px 0; font-weight: bold; color: #1f4c7a; }
.sec { margin: 12px 0; }
.sec-h { background: #f1f5f9; padding: 5px 8px; font-weight: bold; color: #1f2937; border-left: 3px solid #8fb3d9; }
.field { margin: 5px 0; }
.label { font-weight: bold; color: #334155; }
.value { display: inline; border-bottom: 1px solid #cbd5e1; padding: 0 3px; }
.table { width: 100%; border-collapse: collapse; margin-top: 6px; }
.table th,.table td { border: 1px solid #d7e0ea; padding: 5px; font-size: 9pt; vertical-align: top; }
.table th { background: #eef2f7; font-weight: 600; }
.small { font-size: 9pt; color: #475569; }
.page-break { page-break-after: always; }
</style>';

$html = $css;
$html .= '<h1>PLANO DE ATENDIMENTO INDIVIDUAL (PAI)</h1>';
$html .= '<div class="small" style="text-align:center;margin-bottom:10px;">Vigência: ' . ($dataInicio ?: '____/____/______') . ' a ' . ($dataFim ?: '____/____/______') . '</div>';

// Header com logo (opcional)
$logoData = '';
$candidates = [
        __DIR__ . '/uploads/logo.png',
        __DIR__ . '/logo.png',
        dirname(__DIR__) . '/frontend/logo.png',
];
foreach ($candidates as $cand) {
        if (file_exists($cand)) { $logoData = 'data:image/png;base64,' . base64_encode(@file_get_contents($cand)); break; }
}
$headerHtml = '<table width=\"100%\" style=\"border-bottom:1px solid #d7e0ea; font-size:10pt; color:#475569;\">'
    . '<tr>'
    . '<td style=\"width:60px;\">' . ($logoData ? ('<img src=\"' . $logoData . '\" style=\"height:36px;\" />') : '<strong>ConectEDU</strong>') . '</td>'
    . '<td style=\"text-align:center; font-weight:bold;\">Plano de Atendimento Individual (PAI)</td>'
    . '<td style=\"text-align:right; font-size:9pt;\">' . htmlspecialchars($schoolName ?: '', ENT_QUOTES, 'UTF-8') . '</td>'
    . '</tr>'
    . '</table>';
$mpdf->SetHTMLHeader($headerHtml);

// Footer com paginação e data
$mpdf->SetHTMLFooter('<div style=\"border-top:1px solid #d7e0ea; font-size:9pt; padding-top:4px; display:flex; justify-content:space-between; color:#475569;\">'
    . '<span>Gerado em ' . date('d/m/Y H:i') . '</span>'
    . '<span>Página {PAGENO}</span>'
    . '</div>');
// Cabeçalho do aluno
$html .= '<div class="sec">'
       . '<div class="field"><span class="label">Aluno(a):</span> <span class="value">' . $studentName . '</span></div>'
       . '<div class="field"><span class="label">Escola:</span> <span class="value">' . $schoolName . '</span></div>'
       . '</div>';

// Seções principais - usar chaves comuns do PAI
$html .= '<div class="sec"><div class="sec-h">I. INFORMAÇÕES BÁSICAS</div>';
$html .= '<div class="field"><span class="label">Série/Ano:</span> <span class="value">' . vvh($D, 'serie_ano') . '</span></div>';
$html .= '<div class="field"><span class="label">Turno:</span> <span class="value">' . vvh($D, 'turno') . '</span></div>';
$html .= '<div class="field"><span class="label">Tipo/Deficiência:</span> <span class="value">' . vvh($D, 'tipo_deficiencia') . '</span></div>';
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">II. HISTÓRICO E CONTEXTO</div>';
$html .= '<div class="field"><span class="label">CID / Laudo:</span> <span class="value">' . vvh($D, 'cid_laudo') . '</span></div>';
$html .= '<div class="field">' . nl2br(vvh($D, 'historico')) . '</div>';
$html .= '<div class="field">' . nl2br(vvh($D, 'trajetoria_escolar')) . '</div>';
$html .= '<div class="field">' . nl2br(vvh($D, 'contexto_familiar')) . '</div>';
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">III. ACOMPANHAMENTOS / MEDICAÇÕES</div>';
$html .= '<div class="field">' . nl2br(vvh($D, 'acompanhamentos_terapeuticos')) . '</div>';
$html .= '<div class="field">' . nl2br(vvh($D, 'medicacoes')) . '</div>';
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">IV. AVALIAÇÕES</div>';
foreach ([
    'avaliacao_leitura_escrita' => 'Leitura e Escrita',
    'avaliacao_raciocinio_logico' => 'Raciocínio Lógico',
    'avaliacao_comunicacao' => 'Comunicação',
    'avaliacao_psicomotor' => 'Psicomotor',
    'avaliacao_socioemocional' => 'Socioemocional',
    'avaliacao_autonomia' => 'Autonomia',
] as $key => $label) {
    if (!empty($D[$key])) {
        $html .= '<div class="field"><span class="label">' . $label . ':</span> ' . nl2br(vvh($D, $key)) . '</div>';
    }
}
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">V. OBJETIVOS</div>';
foreach ([
    'objetivo_geral' => 'Objetivo Geral',
    'objetivos_comunicacao' => 'Objetivos de Comunicação',
    'objetivos_autonomia' => 'Objetivos de Autonomia',
    'objetivos_academicos' => 'Objetivos Acadêmicos',
    'objetivos_socializacao' => 'Objetivos de Socialização',
] as $key => $label) {
    if (!empty($D[$key])) {
        $html .= '<div class="field"><span class="label">' . $label . ':</span> ' . nl2br(vvh($D, $key)) . '</div>';
    }
}
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">VI. ESTRATÉGIAS E RECURSOS</div>';
foreach ([
    'estrategias_pedagogicas' => 'Estratégias Pedagógicas',
    'metodologias_especificas' => 'Metodologias',
    'recursos_pedagogicos' => 'Recursos Pedagógicos',
    'recursos_tecnologia_assistiva' => 'Tecnologia Assistiva',
    'adaptacoes_mobiliario' => 'Adaptações de Mobiliário',
    'estrategias_caa' => 'Estratégias de CAA',
] as $key => $label) {
    if (!empty($D[$key])) {
        $html .= '<div class="field"><span class="label">' . $label . ':</span> ' . nl2br(vvh($D, $key)) . '</div>';
    }
}
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">VII. ORGANIZAÇÃO DO ATENDIMENTO</div>';
foreach ([
    'frequencia_semanal' => 'Frequência Semanal',
    'tipo_atendimento' => 'Tipo de Atendimento',
    'local_atendimento' => 'Local do Atendimento',
    'periodicidade_avaliacao' => 'Periodicidade de Avaliação',
    'instrumentos_avaliacao' => 'Instrumentos de Avaliação',
] as $key => $label) {
    if (!empty($D[$key])) {
        $html .= '<div class="field"><span class="label">' . $label . ':</span> ' . nl2br(vvh($D, $key)) . '</div>';
    }
}
$html .= '</div>';

$html .= '<div class="sec"><div class="sec-h">VIII. ARTICULAÇÕES</div>';
foreach ([
    'professor_aee' => 'Professor AEE',
    'professor_sala_regular' => 'Professor da Sala Regular',
    'articulacao_sala_regular' => 'Articulação com Sala Regular',
    'articulacao_familia' => 'Articulação com Família',
    'articulacao_profissionais' => 'Articulação com Profissionais',
] as $key => $label) {
    if (!empty($D[$key])) {
        $html .= '<div class="field"><span class="label">' . $label . ':</span> ' . nl2br(vvh($D, $key)) . '</div>';
    }
}
$html .= '</div>';

if (!empty($D['encaminhamentos']) || !empty($D['observacoes_gerais'])) {
    $html .= '<div class="sec"><div class="sec-h">IX. ENCAMINHAMENTOS / OBSERVAÇÕES</div>';
    if (!empty($D['encaminhamentos'])) $html .= '<div class="field">' . nl2br(vvh($D, 'encaminhamentos')) . '</div>';
    if (!empty($D['observacoes_gerais'])) $html .= '<div class="field">' . nl2br(vvh($D, 'observacoes_gerais')) . '</div>';
    $html .= '</div>';
}

$mpdf->WriteHTML($html);

$dir = __DIR__ . '/uploads/documentos/pais/';
if (!is_dir($dir)) @mkdir($dir, 0777, true);
$filename = 'PAI_' . preg_replace('/[^A-Za-z0-9_-]/', '_', ($studentName ?: 'Aluno')) . '_' . date('Ymd_His') . '.pdf';
$filepath = $dir . $filename;
$mpdf->Output($filepath, Destination::FILE);

// Registrar em documentos_gerados
try {
    $size = @filesize($filepath) ?: 0;
    $ins = $pdo->prepare('INSERT INTO documentos_gerados (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo, created_at) VALUES (?,?,?,?,?,?,?,?,NOW())');
    $ins->execute(['pai', $pai['id'], $pai['student_id'], $user['id'], $filepath, $filename, $size, 'PAI - ' . ($studentName ?: 'Aluno')]);
} catch (Exception $e) { /* não falhar o download por erro de log */ }

// Responder PDF inline
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $filename . '"');
header('Content-Length: ' . (@filesize($filepath) ?: 0));
readfile($filepath);
exit;
