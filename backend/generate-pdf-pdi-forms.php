<?php
/**
 * Gerador de PDF - PDI (pdi_forms JSON)
 * Lê pdi_forms.form_data (JSON) e renderiza um PDF robusto com seções principais.
 * Mantém compatibilidade teacher-centric e salva o arquivo no disco.
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
if (!$id) res(false, null, 'ID do PDI inválido', 400);

// Buscar pdi_forms
$sql = 'SELECT p.*, s.name AS student_name, s.photo_url, sch.name AS school_name, sch.city AS school_city, sch.address AS school_address
        FROM pdi_forms p
        LEFT JOIN students s ON s.id = p.student_id
        LEFT JOIN schools sch ON sch.id = s.school_id
        WHERE p.id = ?';
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$pdi = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$pdi) res(false, null, 'PDI não encontrado', 404);
if ($user['role'] !== 'admin' && (int)$pdi['created_by_teacher_id'] !== (int)$user['id']) {
    res(false, null, 'Sem permissão para gerar este PDF', 403);
}

// Decodificar JSON
$D = [];
if (!empty($pdi['form_data'])) {
    $tmp = json_decode($pdi['form_data'], true);
    if (is_array($tmp)) $D = $tmp;
}

// Helpers
function vv($arr, $key, $default = '') { $v = $arr[$key] ?? $default; return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); }
function data_br_fmt($s) {
    if (!$s || $s === '0000-00-00') return '';
    $t = strtotime($s); return $t ? date('d/m/Y', $t) : '';
}

$studentName = vv($D, 'nome_estudante', $pdi['student_name'] ?? '');
$schoolName  = vv($D, 'nome_escola', $pdi['school_name'] ?? '');
// Usar datas do registro ou, se vazias, tentar do JSON
$dataInicio  = data_br_fmt($pdi['data_inicio'] ?? ($D['data_inicio'] ?? null));
$dataFim     = data_br_fmt($pdi['data_fim'] ?? ($D['data_termino'] ?? null));
// Campos adicionais de cabeçalho
$anoLetivo   = vv($D, 'ano_letivo');
$turno       = vv($D, 'turno');

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 28,
    'margin_bottom' => 20,
]);
$mpdf->SetTitle('PDI - ' . ($studentName ?: 'Aluno'));
$mpdf->SetAuthor('ConectEDU - Sistema AEE');

$css = '<style>
body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 10pt; color: #000; }
h1 { font-size: 14pt; text-align: center; margin: 0 0 8px 0; font-weight: bold; }
.sec { margin: 12px 0; }
.sec-h { background: #eaeaea; padding: 5px 8px; font-weight: bold; }
.field { margin: 5px 0; }
.label { font-weight: bold; }
.value { display: inline; border-bottom: 1px dotted #666; padding: 0 3px; }
.table { width: 100%; border-collapse: collapse; margin-top: 6px; }
.table th,.table td { border: 1px solid #000; padding: 5px; font-size: 9pt; vertical-align: top; }
.small { font-size: 9pt; color: #333; }
.page-break { page-break-after: always; }
</style>';

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
$headerHtml = '<table width="100%" style="border-bottom:1px solid #ccc; font-size:10pt; color:#333;">
    <tr>
        <td style="width:60px;">' . ($logoData ? ('<img src="' . $logoData . '" style="height:36px;" />') : '<strong>ConectEDU</strong>') . '</td>
        <td style="text-align:center; font-weight:bold;">Plano de Desenvolvimento Individual (PDI)</td>
        <td style="text-align:right; font-size:9pt;">' . htmlspecialchars($schoolName ?: '', ENT_QUOTES, 'UTF-8') . '</td>
    </tr>
</table>';
$mpdf->SetHTMLHeader($headerHtml);

// Footer básico com paginação e data
$mpdf->SetHTMLFooter('<div style="border-top:1px solid #ccc; font-size:9pt; padding-top:4px; display:flex; justify-content:space-between;">
    <span>Gerado em ' . date('d/m/Y H:i') . '</span>
    <span>Página {PAGENO}/{nbpg}</span>
</div>');

$html = $css;
$html .= '<div class="small" style="text-align:center;margin-bottom:10px;">Vigência: ' . ($dataInicio ?: '____/____/______') . ' a ' . ($dataFim ?: '____/____/______') . '</div>';

// Cabeçalho do aluno
$html .= '<div class="sec">'
    . '<div class="field"><span class="label">Aluno(a):</span> <span class="value">' . $studentName . '</span></div>'
    . '<div class="field"><span class="label">Escola:</span> <span class="value">' . $schoolName . '</span></div>'
    . (($anoLetivo || $turno) ? ('<div class="field"><span class="label">Ano letivo / Turno:</span> <span class="value">' . trim($anoLetivo . ($turno ? ' — ' . $turno : '')) . '</span></div>') : '')
    . '</div>';

// Seções principais (flexíveis conforme JSON)
// Helpers simples
$field = function($label, $value) {
    if ($value === '' || $value === null) return '';
    return '<div class="field"><span class="label">' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . ':</span> <span class="value">' . htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8') . '</span></div>';
};
$para  = function($label, $value) use ($field) {
    if ($value === '' || $value === null) return '';
    return '<div class="field"><span class="label">' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . ':</span> ' . nl2br(htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8')) . '</div>';
};
$tablePairs = function($title, $pairs) {
    $rows = array_filter($pairs, fn($p) => ($p[1] ?? '') !== '' && $p[1] !== null);
    if (!$rows) return '';
    $h = '<div class="sec"><div class="sec-h">' . htmlspecialchars($title, ENT_QUOTES, 'UTF-8') . '</div>';
    $h .= '<table class="table"><tr><th>Item</th><th>Valor</th></tr>';
    foreach ($rows as $p) {
        $h .= '<tr><td>' . htmlspecialchars($p[0], ENT_QUOTES, 'UTF-8') . '</td><td>' . nl2br(htmlspecialchars((string)$p[1], ENT_QUOTES, 'UTF-8')) . '</td></tr>';
    }
    $h .= '</table></div>';
    return $h;
};

// I. Dados Institucionais
$html .= '<div class="sec"><div class="sec-h">I. DADOS INSTITUCIONAIS</div>';
$html .= $field('SRE', vv($D, 'sre'));
$html .= $field('Código da Escola', vv($D, 'codigo_escola'));
$html .= $field('Endereço', vv($D, 'endereco_escola', $pdi['school_address'] ?? ''));
$html .= $field('Diretor(a)', vv($D, 'diretor'));
$html .= $field('Vice-diretor(a)', vv($D, 'vice_diretor'));
$html .= $field('Supervisor(a) pedagógico(a)', vv($D, 'supervisor_pedagogico'));
$html .= '</div>';

// II. Dados do Estudante
$html .= '<div class="sec"><div class="sec-h">II. DADOS DO ESTUDANTE</div>';
$html .= $field('Responsável / Parentesco', vv($D, 'responsavel_parentesco'));
$html .= $field('Ano / Série', vv($D, 'ano_escolaridade'));
$html .= $field('Deficiência informada', vv($D, 'deficiencia_informada'));
$html .= '</div>';

// III. Considerações da Família
if (!empty($D['consideracoes_familia'])) {
    $html .= '<div class="sec"><div class="sec-h">III. CONSIDERAÇÕES DA FAMÍLIA</div>';
    $html .= '<div class="field">' . nl2br(vv($D, 'consideracoes_familia')) . '</div>';
    $html .= '</div>';
}

// IV. Histórico de Escolarização
if (!empty($D['historico_escolar']) || !empty($D['idade_comecou_escola'])) {
    $html .= '<div class="sec"><div class="sec-h">IV. HISTÓRICO DE ESCOLARIZAÇÃO</div>';
    $html .= '<div class="field"><span class="label">Idade que começou a frequentar a escola:</span> <span class="value">' . vv($D, 'idade_comecou_escola') . '</span></div>';
    $html .= '<div class="field">' . nl2br(vv($D, 'historico_escolar')) . '</div>';
    $html .= '</div>';
}

// III. Aspectos Psicomotores
$html .= $tablePairs('III. ASPECTOS PSICOMOTORES', [
    ['Locomoção', $D['locomocao'] ?? ''],
    ['Equilíbrio', $D['equilibrio'] ?? ''],
    ['Coordenação motora global', $D['coordenacao_motora_global'] ?? ''],
    ['Coordenação motora fina', $D['coordenacao_motora_fina'] ?? ''],
    ['Dominância lateral', $D['dominancia_lateral'] ?? ''],
    ['Esquema corporal', $D['esquema_corporal'] ?? ''],
    ['Orientação espacial', $D['orientacao_espacial'] ?? ''],
    ['Orientação temporal', $D['orientacao_temporal'] ?? ''],
    ['Manipulação de objetos', $D['manipulacao_objetos'] ?? ''],
    ['Tônus muscular', $D['tonus_muscular'] ?? ''],
    ['Velocidade', $D['velocidade'] ?? ''],
    ['Força muscular', $D['forca_muscular'] ?? ''],
    ['Flexibilidade', $D['flexibilidade'] ?? ''],
    ['Resistência', $D['resistencia'] ?? ''],
    ['Precisão dos movimentos', $D['precisao_movimentos'] ?? ''],
    ['Postura', $D['postura'] ?? ''],
]);

// IV. Funções cognitivas e aprendizagem
$html .= '<div class="sec"><div class="sec-h">IV. FUNÇÕES COGNITIVAS E APRENDIZAGEM</div>';
$html .= $para('Atenção e concentração', $D['atencao_concentracao'] ?? '');
$html .= $para('Memória', $D['memoria'] ?? '');
$html .= $para('Raciocínio lógico', $D['raciocinio_logico'] ?? '');
$html .= $para('Resolução de problemas', $D['resolucao_problemas'] ?? '');
$html .= $para('Percepção visual', $D['percepcao_visual'] ?? '');
$html .= $para('Percepção auditiva', $D['percepcao_auditiva'] ?? '');
$html .= $para('Generalização de aprendizagens', $D['generalizacao'] ?? '');
$html .= '</div>';

// V. Comunicação e linguagem
$html .= '<div class="sec"><div class="sec-h">V. COMUNICAÇÃO E LINGUAGEM</div>';
$html .= $para('Expressiva', $D['linguagem_oral_expressiva'] ?? '');
$html .= $para('Receptiva', $D['linguagem_oral_receptiva'] ?? '');
$html .= $para('Interação comunicativa', $D['interacao_comunicativa'] ?? '');
$html .= $para('Comunicação alternativa', $D['comunicacao_alternativa'] ?? '');
$html .= '</div>';

// VI. Leitura e escrita
$html .= '<div class="sec"><div class="sec-h">VI. LEITURA E ESCRITA</div>';
$html .= $field('Nível de leitura', $D['leitura_nivel'] ?? '');
$html .= $field('Nível de escrita', $D['escrita_nivel'] ?? '');
$html .= '</div>';

// VII. Acessibilidade e recursos
$html .= '<div class="sec"><div class="sec-h">VII. ACESSIBILIDADE E RECURSOS</div>';
$html .= $para('Recursos pedagógicos', $D['recursos_pedagogicos'] ?? '');
$html .= $para('Tecnologia assistiva', $D['tecnologia_assistiva'] ?? '');
$html .= $para('Mobiliário / adaptações', $D['mobiliario_adaptacoes'] ?? '');
$html .= $para('Acessibilidade digital', $D['acessibilidade_digital'] ?? '');
$html .= $para('Materiais sensoriais', $D['materiais_sensoriais'] ?? '');
$html .= $para('Barreiras arquitetônicas', $D['barreiras_arquitetonicas'] ?? '');
$html .= $para('Barreiras comunicacionais', $D['barreiras_comunicacionais'] ?? '');
$html .= $para('Barreiras atitudinais', $D['barreiras_atitudinais'] ?? '');
$html .= $para('Facilitadores ambientais', $D['facilitadores_ambientais'] ?? '');
$html .= $para('Facilitadores pessoais', $D['facilitadores_pessoais'] ?? '');
$html .= '</div>';

// VIII. Perfil e necessidades educacionais
$html .= '<div class="sec"><div class="sec-h">VIII. PERFIL E NECESSIDADES EDUCACIONAIS</div>';
$html .= $para('Potencialidades', $D['potencialidades'] ?? '');
$html .= $para('Dificuldades', $D['dificuldades'] ?? '');
$html .= $para('Interesses', $D['interesses'] ?? '');
$html .= $para('Estilo de aprendizagem', $D['estilo_aprendizagem'] ?? '');
$html .= $para('Comportamentos que interferem', $D['comportamentos_interferem'] ?? '');
$html .= '</div>';

// IX. Objetivos do PDI
$html .= '<div class="sec"><div class="sec-h">IX. OBJETIVOS DO PDI</div>';
$html .= $para('Objetivo geral', $D['objetivo_geral'] ?? '');
$html .= $para('Objetivos cognitivos', $D['objetivos_cognitivo'] ?? ($D['objetivos_cognitivos'] ?? ''));
$html .= $para('Objetivos de comunicação', $D['objetivos_comunicacao'] ?? '');
$html .= $para('Objetivos psicomotores', $D['objetivos_psicomotor'] ?? ($D['objetivos_psicomotores'] ?? ''));
$html .= $para('Objetivos socioemocionais', $D['objetivos_socioemocional'] ?? ($D['objetivos_socioemocionais'] ?? ''));
$html .= '</div>';

// X. Estratégias e adaptações
$html .= '<div class="sec"><div class="sec-h">X. ESTRATÉGIAS E ADAPTAÇÕES</div>';
$html .= $para('Estratégias / Metodologias', $D['estrategias_metodologias'] ?? '');
$html .= $para('Adaptações curriculares', $D['adaptacoes_curriculares'] ?? '');
$html .= '</div>';

// XI. Organização do atendimento e avaliação
$html .= '<div class="sec"><div class="sec-h">XI. ORGANIZAÇÃO DO ATENDIMENTO E AVALIAÇÃO</div>';
$html .= $field('Frequência de atendimento', $D['frequencia_atendimento'] ?? '');
$html .= $field('Periodicidade de avaliação', $D['periodicidade_avaliacao'] ?? '');
$html .= $para('Instrumentos de avaliação', $D['instrumentos_avaliacao'] ?? '');
$html .= $para('Indicadores de progresso', $D['indicadores_progresso'] ?? '');
$html .= $para('Critérios de reavaliação', $D['criterios_reavaliacao'] ?? '');
$html .= '</div>';

// XII. Equipe e responsáveis
$html .= '<div class="sec"><div class="sec-h">XII. EQUIPE E RESPONSÁVEIS</div>';
$html .= $field('Professor(a) AEE', $D['professor_aee'] ?? '');
$html .= $field('Professor(a) da sala regular', $D['professor_sala_regular'] ?? '');
$html .= $field('Coordenador(a) pedagógico(a)', $D['coordenador_pedagogico'] ?? '');
$html .= $para('Profissionais de apoio', $D['profissionais_apoio'] ?? '');
$html .= $para('Equipe multidisciplinar', $D['equipe_multidisciplinar'] ?? '');
$html .= $para('Responsável legal', $D['responsavel_legal'] ?? '');
$html .= '</div>';

// XIII. Planejamento Bimestral (se existir no JSON)
if (!empty($D['planejamento_bimestral']) && is_array($D['planejamento_bimestral'])) {
    $html .= '<div class="sec"><div class="sec-h">XIII. PLANEJAMENTO BIMESTRAL (Resumo)</div>';
    $pb = $D['planejamento_bimestral'];
    if (!empty($pb['disciplinas']) && is_array($pb['disciplinas'])) {
        foreach ($pb['disciplinas'] as $disc => $dados) {
            $html .= '<div class="field"><span class="label">Disciplina:</span> ' . htmlspecialchars((string)$disc, ENT_QUOTES, 'UTF-8') . '</div>';
            if (!empty($dados['bimestres']) && is_array($dados['bimestres'])) {
                foreach ($dados['bimestres'] as $bim => $d) {
                    $html .= '<div class="small"><strong>' . $bim . 'º bimestre</strong></div>';
                    $html .= '<table class="table">'
                         . '<tr><th>Objetivo da turma</th><th>Objetivo do estudante</th></tr>'
                         . '<tr><td>' . nl2br(htmlspecialchars((string)($d['objetivo_turma'] ?? ''), ENT_QUOTES, 'UTF-8')) . '</td>'
                         . '<td>' . nl2br(htmlspecialchars((string)($d['objetivo_estudante'] ?? ''), ENT_QUOTES, 'UTF-8')) . '</td></tr>'
                         . '</table>';
                }
            }
            $html .= '<div style="height:6px"></div>';
        }
    }
    $html .= '</div>';
}

// XIV. Relatório Pedagógico Semestral
if (!empty($D['relatorio_semestral'])) {
    $html .= '<div class="sec"><div class="sec-h">XIV. RELATÓRIO PEDAGÓGICO SEMESTRAL</div>';
    $html .= '<div class="field">' . nl2br(vv($D, 'relatorio_semestral')) . '</div>';
    $html .= '</div>';
}

$mpdf->WriteHTML($html);

$dir = __DIR__ . '/uploads/documentos/pdis/';
if (!is_dir($dir)) @mkdir($dir, 0777, true);
$filename = 'PDI_' . preg_replace('/[^A-Za-z0-9_-]/', '_', ($studentName ?: 'Aluno')) . '_' . date('Ymd_His') . '.pdf';
$filepath = $dir . $filename;
$mpdf->Output($filepath, Destination::FILE);

// Registrar em documentos_gerados (opcional e idempotente simples)
try {
    $size = @filesize($filepath) ?: 0;
    $ins = $pdo->prepare('INSERT INTO documentos_gerados (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo, created_at) VALUES (?,?,?,?,?,?,?,?,NOW())');
    $ins->execute(['pdi', $pdi['id'], $pdi['student_id'], $user['id'], $filepath, $filename, $size, 'PDI - ' . ($studentName ?: 'Aluno')]);
} catch (Exception $e) { /* não falhar o download por erro de log */ }

// Responder PDF inline
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . $filename . '"');
header('Content-Length: ' . (@filesize($filepath) ?: 0));
readfile($filepath);
exit;
