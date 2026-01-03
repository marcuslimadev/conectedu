<?php
/**
 * GERADOR DE PDF - PAI V2
 * Layout EXATO do modelo oficial Plano de Atendimento Individual (PAI).ini
 */

// Dependências
if (!function_exists('db')) {
    require_once 'functions.php';
}
if (!class_exists('Mpdf\\Mpdf')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Mpdf\Mpdf;

// Se chamado diretamente
if (!isset($user) || !isset($pdo)) {
    header('Content-Type: application/json; charset=utf-8');
    $user = require_auth();
    $pdo = db();
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if (!$id) res(false, null, 'ID do PAI inválido', 400);

// Buscar plano_atendimento_forms
$sql = 'SELECT pa.*, s.name AS student_name, s.photo_url, s.birth_date, sch.name AS school_name, sch.city AS school_city, sch.address AS school_address
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

// Aliases para compatibilidade entre formulários e modelo oficial
$aliasMap = [
    'telefone_contato' => ['telefone'],
    'endereco_residencial' => ['endereco'],
    'data_avaliacao' => ['data_avaliacao_diagnostica'],
    'periodo_vigencia' => ['periodo_vigencia'],
    'oralidade' => ['avaliacao_oralidade'],
    'compreensao' => ['avaliacao_compreensao'],
    'expressao_verbal' => ['avaliacao_expressao_verbal'],
    'clareza' => ['avaliacao_clareza'],
    'producao_textos' => ['produz_textos'],
    'leitura' => ['avaliacao_leitura'],
    'raciocinio_logico_matematico' => ['raciocinio_logico'],
    'objetivo_comunicacao' => ['obj_comunicacao_objetivo'],
    'meta_comunicacao' => ['obj_comunicacao_meta'],
    'objetivo_leitura' => ['obj_leitura_objetivo'],
    'meta_leitura' => ['obj_leitura_meta'],
    'objetivo_matematica' => ['obj_matematica_objetivo'],
    'meta_matematica' => ['obj_matematica_meta'],
    'objetivo_socioemocional' => ['obj_socioemocional_objetivo'],
    'meta_socioemocional' => ['obj_socioemocional_meta'],
    'objetivo_autonomia' => ['obj_autonomia_objetivo'],
    'meta_autonomia' => ['obj_autonomia_meta'],
    'recursos_didaticos' => ['recursos_tecnologias'],
];

foreach ($aliasMap as $dest => $keys) {
    if (!empty($D[$dest])) continue;
    foreach ((array)$keys as $key) {
        if (!empty($D[$key])) {
            $D[$dest] = $D[$key];
            break;
        }
    }
}

// Helpers
function vp($arr, $key, $default = '') { 
    $v = $arr[$key] ?? $default; 
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); 
}

function data_br_pai($s) {
    if (!$s || $s === '0000-00-00') return '____/____/______';
    $t = strtotime($s); 
    return $t ? date('d/m/Y', $t) : '____/____/______';
}

function campo_pai($label, $valor = '') {
    $v = $valor ? htmlspecialchars($valor, ENT_QUOTES, 'UTF-8') : '';
    return '<div style="margin:3px 0;"><strong>' . $label . '</strong> <span style="border-bottom:1px solid #000;display:inline-block;min-width:150px;padding:0 5px;">' . $v . '</span></div>';
}

function texto_pai($label, $valor = '') {
    $v = $valor ? nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8')) : '';
    return '<div style="margin:5px 0;"><strong>' . $label . '</strong><div style="margin-top:2px;padding:4px;border:1px solid #ccc;background:#f9f9f9;min-height:30px;">' . $v . '</div></div>';
}

$studentName = vp($D, 'nome_estudante', $pai['student_name'] ?? '');
$schoolName  = vp($D, 'nome_escola', $pai['school_name'] ?? '');
$dataElaboracao = data_br_pai($D['data_elaboracao'] ?? ($pai['data_inicio'] ?? null));
$dataAvaliacao = data_br_pai($D['data_avaliacao'] ?? null);
$dataReavaliacao = data_br_pai($D['data_reavaliacao'] ?? ($pai['data_fim'] ?? null));
$periodoTexto = vp($D, 'periodo_vigencia');
$periodoInicio = vp($D, 'periodo_inicio');
$periodoFim = vp($D, 'periodo_fim');
$periodoDisplay = $periodoTexto ? $periodoTexto : (data_br_pai($periodoInicio) . ' a ' . data_br_pai($periodoFim));

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 20,
    'margin_right' => 20,
    'margin_top' => 15,
    'margin_bottom' => 15,
]);

$mpdf->SetTitle('PAI - ' . ($studentName ?: 'Aluno'));
$mpdf->SetAuthor('ConectEDU - Sistema AEE');

// CSS Global - EXATAMENTE como o modelo oficial
$css = '<style>
body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9pt; line-height: 1.2; color: #000; }
h1 { text-align: center; font-size: 13pt; font-weight: bold; margin: 5px 0 10px 0; color: #1a5490; }
.secao-titulo { background: #b0b0b0; padding: 6px 10px; font-weight: bold; font-size: 10pt; margin: 8px 0 4px 0; border: 1px solid #000; }
table { width: 100%; border-collapse: collapse; margin: 3px 0; }
table.bordered { border: 2px solid #000; }
table.bordered td, table.bordered th { border: 1px solid #000; padding: 4px; font-size: 8.5pt; vertical-align: top; }
table.bordered th { background: #d0d0d0; font-weight: bold; text-align: left; }
.label { font-weight: bold; font-size: 8pt; }
.field-box { border: 1px solid #000; padding: 3px; min-height: 18px; background: #fff; }
.photo-box { width: 100px; height: 120px; border: 2px solid #000; background: #f5f5f5; text-align: center; vertical-align: middle; font-size: 7pt; color: #666; }
</style>';

// HTML do documento
$html = $css;
$html .= '<h1>Plano de Atendimento Individual (PAI)</h1>';

// ==================== 1. IDENTIFICAÇÃO DO ALUNO E DA EQUIPE ====================
$html .= '<div class="secao-titulo">1. Identificação do Aluno e da Equipe</div>';

// Tabela principal com quadro para foto
$html .= '<table class="bordered">';

// Linha 1: Quadro de foto + Nome da Escola
$html .= '<tr>';
$html .= '<td rowspan="3" style="width:110px;"><div class="photo-box">FOTO<br>3x4</div></td>';
$html .= '<td colspan="3"><span class="label">Nome da Escola:</span><div class="field-box">' . $schoolName . '</div></td>';
$html .= '</tr>';

// Linha 2: Nome do Estudante | Data Nascimento | Idade
$html .= '<tr>';
$html .= '<td colspan="2"><span class="label">Nome do Estudante:</span><div class="field-box">' . $studentName . '</div></td>';
$html .= '<td style="width:22%;"><span class="label">Data de Nascimento:</span><div class="field-box">' . data_br_pai(vp($D, 'data_nascimento')) . '</div></td>';
$html .= '<td style="width:12%;"><span class="label">Idade:</span><div class="field-box">' . vp($D, 'idade') . '</div></td>';
$html .= '</tr>';

// Linha 3: Série/Ano | Turno | Responsável | Tel
$html .= '<tr>';
$html .= '<td style="width:20%;"><span class="label">Série/Ano:</span><div class="field-box">' . vp($D, 'serie_ano') . '</div></td>';
$html .= '<td style="width:15%;"><span class="label">Turno:</span><div class="field-box">' . vp($D, 'turno') . '</div></td>';
$html .= '<td><span class="label">Nome do Responsável:</span><div class="field-box">' . vp($D, 'responsavel') . '</div></td>';
$html .= '<td><span class="label">Tel.: Para contato:</span><div class="field-box">' . vp($D, 'telefone_contato') . '</div></td>';
$html .= '</tr>';

// Linha 4: Endereço Residencial
$html .= '<tr>';
$html .= '<td colspan="4"><span class="label">Endereço Residencial do Estudante:</span><div class="field-box">' . vp($D, 'endereco_residencial') . '</div></td>';
$html .= '</tr>';

// Linha 5: Diagnóstico/CID
$html .= '<tr>';
$html .= '<td colspan="4"><span class="label">Diagnóstico/Caracterização da Necessidade Educacional Especial (PAEE): Citar o CID:</span><div class="field-box">' . vp($D, 'diagnostico_cid') . '</div></td>';
$html .= '</tr>';

$html .= '</table>';

// Tabela de Equipe
$html .= '<div style="margin-top:5px;"><span class="label" style="font-size:9pt;">Equipe</span></div>';
$html .= '<table class="bordered">';

$html .= '<tr><td><span class="label">Professor(a) Regente:</span><div class="field-box">' . vp($D, 'professor_regente') . '</div></td></tr>';
$html .= '<tr><td><span class="label">Professor(a) do Atendimento Educacional Especializado (AEE):</span><div class="field-box">' . vp($D, 'professor_aee') . '</div></td></tr>';
$html .= '<tr><td><span class="label">Outros Profissionais Envolvidos: (Ex: Psicólogo, Fonoaudiólogo, Terapeuta Ocupacional, Especifique a instituição e a frequência do atendimento, se houver.)</span><div class="field-box">' . nl2br(vp($D, 'outros_profissionais')) . '</div></td></tr>';

$html .= '</table>';

// Tabela de Datas
$html .= '<table class="bordered" style="margin-top:5px;">';
$html .= '<tr>';
$html .= '<th style="width:25%;">Data de Elaboração do PAI</th>';
$html .= '<th style="width:25%;">Data da avaliação Diagnóstica</th>';
$html .= '<th style="width:25%;">Período de Vigência do PAI</th>';
$html .= '<th style="width:25%;">Data Prevista para Reavaliação</th>';
$html .= '</tr>';
$html .= '<tr>';
$html .= '<td>' . $dataElaboracao . '</td>';
$html .= '<td>' . $dataAvaliacao . '</td>';
$html .= '<td>' . $periodoDisplay . '</td>';
$html .= '<td>' . $dataReavaliacao . '</td>';
$html .= '</tr>';
$html .= '</table>';

// ==================== 2. HISTÓRICO DO ESTUDANTE E CONTEXTUALIZAÇÃO ====================
$html .= '<div class="secao-titulo">2. Histórico do Estudante e Contextualização</div>';
$html .= '<table class="bordered">';

$html .= '<tr><td><span class="label">Histórico Escolar: (Percurso educacional, adaptações anteriores, resultados e observações relevantes de anos anteriores.)</span><div class="field-box" style="min-height:35px;">' . nl2br(vp($D, 'historico_escolar')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Histórico Familiar e Social: (Breve descrição da estrutura familiar, apoio, expectativas da família em relação ao desenvolvimento do aluno. Informações relevantes sobre o convívio social fora da escola.)</span><div class="field-box" style="min-height:35px;">' . nl2br(vp($D, 'historico_familiar_social')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Interesses e Preferências do Estudante: (O que o aluno gosta de fazer? Quais são seus pontos fortes e motivações?)</span><div class="field-box" style="min-height:30px;">' . nl2br(vp($D, 'interesses_preferencias')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Dificuldades (Descreva as principais dificuldades)</span><div class="field-box" style="min-height:30px;">' . nl2br(vp($D, 'dificuldades')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Potencialidades Observadas: (Descreva as habilidades já consolidadas pelo estudante nas diferentes áreas de desenvolvimento: acadêmica, social, comunicacional e motora.)</span><div class="field-box" style="min-height:30px;">' . nl2br(vp($D, 'potencialidades')) . '</div></td></tr>';

$html .= '</table>';

// ==================== 3. AVALIAÇÃO DIAGNÓSTICA E LEVANTAMENTO DE NECESSIDADES ====================
$html .= '<div class="secao-titulo">3. Avaliação Diagnóstica e Levantamento de Necessidades</div>';
$html .= '<p style="font-style:italic;margin:5px 0;font-size:8pt;">Esta seção é muito importante, pois detalha a situação atual do aluno e serve de base para a definição dos objetivos.</p>';

// I. Habilidades de Comunicação e Linguagem
$html .= '<div style="font-weight:bold;margin:8px 0 3px 0;font-size:9pt;">I. Habilidades de Comunicação e Linguagem:</div>';
$html .= '<table class="bordered">';

$html .= '<tr><td><span class="label">Oralidade:</span><div class="field-box">' . nl2br(vp($D, 'oralidade')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Compreensão:</span><div class="field-box">' . nl2br(vp($D, 'compreensao')) . '</div></td></tr>';

$html .= '<tr><td><span class="label">Expressão verbal:</span><div class="field-box">' . nl2br(vp($D, 'expressao_verbal')) . '</div></td></tr>';

$html .= '<tr>';
$html .= '<td style="width:20%;"><span class="label">Clareza:</span><div class="field-box">' . vp($D, 'clareza') . '</div></td>';
$html .= '<td style="width:20%;"><span class="label">Usa frases completas?</span><div class="field-box">' . vp($D, 'usa_frases_completas') . '</div></td>';
$html .= '<td><span class="label">Interage verbalmente?</span><div class="field-box">' . vp($D, 'interage_verbalmente') . '</div></td>';
$html .= '</tr>';

$html .= '<tr>';
$html .= '<td><span class="label">Escreve:</span><div class="field-box">' . vp($D, 'escreve') . '</div></td>';
$html .= '<td><span class="label">Grafia é legível:</span><div class="field-box">' . vp($D, 'grafia_legivel') . '</div></td>';
$html .= '<td><span class="label">Escreve certo:</span><div class="field-box">' . vp($D, 'escreve_certo') . '</div></td>';
$html .= '</tr>';

$html .= '<tr>';
$html .= '<td><span class="label">Produção de textos:</span><div class="field-box">' . vp($D, 'producao_textos') . '</div></td>';
$html .= '<td><span class="label">Desenha?</span><div class="field-box">' . vp($D, 'desenha') . '</div></td>';
$html .= '<td><span class="label">Copia?</span><div class="field-box">' . vp($D, 'copia') . '</div></td>';
$html .= '</tr>';

$html .= '<tr><td colspan="3"><span class="label">Faz garatujas:</span><div class="field-box">' . vp($D, 'faz_garatujas') . '</div></td></tr>';

$html .= '<tr><td colspan="3"><span class="label">Leitura: Reconhecimento de letras/palavras, compreensão de textos, velocidade, fluência. Leitura funcional?</span><div class="field-box">' . nl2br(vp($D, 'leitura')) . '</div></td></tr>';

$html .= '<tr><td colspan="3"><span class="label">Comunicação Não-Verbal/Alternativa: (Uso de gestos, expressões faciais, Comunicação Alternativa e Ampliada – CAA, Libras, Braille. Há necessidade de uso de recursos?)</span><div class="field-box">' . nl2br(vp($D, 'comunicacao_nao_verbal')) . '</div></td></tr>';

$html .= '</table>';

// II. Habilidades Cognitivas e Acadêmicas
$html .= '<div style="font-weight:bold;margin:8px 0 3px 0;font-size:9pt;">II. Habilidades Cognitivas e Acadêmicas</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Raciocínio Lógico-Matemático: (Contagem, reconhecimento de números, operações básicas, resolução de problemas, noções de grandeza, espaço, tempo.)</span><div class="field-box">' . nl2br(vp($D, 'raciocinio_logico_matematico')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Conceitos Acadêmicos: (Compreensão de conteúdos curriculares – Português, Matemática, Ciências, História, Geografia. Nível de abstração.)</span><div class="field-box">' . nl2br(vp($D, 'conceitos_academicos')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Atenção e Concentração: (Capacidade de focar em tarefas, tempo de permanência, distração.)</span><div class="field-box">' . nl2br(vp($D, 'atencao_concentracao')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Memória: (Memória de curto e longo prazo, recordação de informações.)</span><div class="field-box">' . nl2br(vp($D, 'memoria')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Organização e Planejamento: (Capacidade de organizar materiais, sequenciar tarefas, planejar ações.)</span><div class="field-box">' . nl2br(vp($D, 'organizacao_planejamento')) . '</div></td></tr>';
$html .= '</table>';

// III. Habilidades Socioemocionais e Comportamentais
$html .= '<div style="font-weight:bold;margin:8px 0 3px 0;font-size:9pt;">III. Habilidades Socioemocionais e Comportamentais</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Interação Social: (Como o aluno se relaciona com colegas e adultos? Participação em atividades em grupo, iniciação de contato.)</span><div class="field-box">' . nl2br(vp($D, 'interacao_social')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Autonomia e Independência: (Higiene pessoal, alimentação, organização de pertences, deslocamento na escola, tomada de decisões simples.)</span><div class="field-box">' . nl2br(vp($D, 'autonomia_independencia')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Manejo de Emoções: (Expressão de sentimentos, manejo de frustrações, impulsividade.)</span><div class="field-box">' . nl2br(vp($D, 'manejo_emocoes')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Comportamento em Sala: (Seguir regras, aceitar limites, respeito, persistência em tarefas.)</span><div class="field-box">' . nl2br(vp($D, 'comportamento_sala')) . '</div></td></tr>';
$html .= '</table>';

// IV. Habilidades Motoras e Perceptivas
$html .= '<div style="font-weight:bold;margin:8px 0 3px 0;font-size:9pt;">IV. Habilidades Motoras e Perceptivas</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Coordenação Motora Fina: (Escrita, recorte, manuseio de objetos pequenos.)</span><div class="field-box">' . nl2br(vp($D, 'coordenacao_motora_fina')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Coordenação Motora Grossa: (Equilíbrio, locomoção, pular, correr.)</span><div class="field-box">' . nl2br(vp($D, 'coordenacao_motora_grossa')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Orientação Espacial e Temporal: (Noção de direita/esquerda, antes/depois, hoje/ontem, dias da semana, meses.)</span><div class="field-box">' . nl2br(vp($D, 'orientacao_espacial_temporal')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Percepção Visual e Auditiva: (Discriminação de sons, imagens, formas, cores.)</span><div class="field-box">' . nl2br(vp($D, 'percepcao_visual_auditiva')) . '</div></td></tr>';
$html .= '</table>';

// ==================== 4. DEFINIÇÃO DE OBJETIVOS E METAS ====================
$html .= '<div class="secao">4. DEFINIÇÃO DE OBJETIVOS E METAS</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Objetivo Geral do PAI: O que se espera que o aluno alcance ao final do período de vigência do PAI?</span><div class="field-box" style="min-height:35px;">' . nl2br(vp($D, 'objetivo_geral')) . '</div></td></tr>';
$html .= '</table>';

$html .= '<div style="font-weight:bold;margin:8px 0 3px 0;font-size:9pt;">Objetivos Específicos por Área de Desenvolvimento:</div>';
$html .= '<table class="bordered">';

// Exemplo de áreas de objetivos
$areas_objetivos = [
    'comunicacao' => 'Comunicação',
    'academica_leitura' => 'Acadêmica – Leitura',
    'academica_matematica' => 'Acadêmica – Matemática',
    'socioemocional' => 'Socioemocional',
    'autonomia' => 'Autonomia'
];

foreach ($areas_objetivos as $key => $area) {
    $obj = vp($D, 'objetivo_' . $key);
    $meta = vp($D, 'meta_' . $key);
    if ($obj || $meta) {
        $html .= '<tr><td><span class="label">' . $area . ':</span>';
        if ($obj) $html .= '<div class="field-box" style="min-height:25px;"><strong>Objetivo:</strong> ' . nl2br($obj) . '</div>';
        if ($meta) $html .= '<div class="field-box" style="min-height:25px;margin-top:3px;"><strong>Meta:</strong> ' . nl2br($meta) . '</div>';
        $html .= '</td></tr>';
    }
}
$html .= '</table>';

// ==================== 5. ESTRATÉGIAS E RECURSOS PEDAGÓGICOS ====================
$html .= '<div class="secao">5. ESTRATÉGIAS E RECURSOS PEDAGÓGICOS</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Adaptações Curriculares: (Simplificação de conteúdos, flexibilização de atividades, priorização de habilidades.)</span><div class="field-box">' . nl2br(vp($D, 'adaptacoes_curriculares')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Recursos Didáticos e Tecnologias Assistivas: (Materiais manipuláveis, pranchas de comunicação, softwares educativos, lupa, cadeira adaptada.)</span><div class="field-box">' . nl2br(vp($D, 'recursos_didaticos')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Estratégias de Ensino: (Aprendizagem cooperativa, instrução direta, ensino individualizado, modelagem, uso de rotinas visuais, pareamento.)</span><div class="field-box">' . nl2br(vp($D, 'estrategias_ensino')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Adaptações no Ambiente Escolar: (Organização da sala, redução de estímulos, sinalização visual, acessibilidade arquitetônica.)</span><div class="field-box">' . nl2br(vp($D, 'adaptacoes_ambiente')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Atendimento do AEE: (Frequência, duração, tipo de atendimento – individual/grupo, atividades específicas que serão desenvolvidas na Sala de Recursos Multifuncional.)</span><div class="field-box">' . nl2br(vp($D, 'atendimento_aee')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Envolvimento da Família: (Orientações, atividades para fazer em casa, reuniões periódicas.)</span><div class="field-box">' . nl2br(vp($D, 'envolvimento_familia')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Articulação com Outros Profissionais: (Troca de informações, reuniões para alinhamento de estratégias.)</span><div class="field-box">' . nl2br(vp($D, 'articulacao_profissionais')) . '</div></td></tr>';
$html .= '</table>';

// ==================== 6. AVALIAÇÃO E ACOMPANHAMENTO ====================
$html .= '<div class="secao">';
$html .= '<div class="secao">6. AVALIAÇÃO E ACOMPANHAMENTO</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><span class="label">Critérios de Avaliação: (Como o progresso do aluno será medido? Observações, produções do aluno, participação, registros.)</span><div class="field-box">' . nl2br(vp($D, 'criterios_avaliacao')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Periodicidade das Reavaliações: (Mensal, bimestral, semestral – para ajustar o PAI)</span><div class="field-box">' . nl2br(vp($D, 'periodicidade_reavaliacoes')) . '</div></td></tr>';
$html .= '<tr><td><span class="label">Registro de Progresso: (Como o professor vai registrar os avanços e dificuldades do aluno – portfólio, relatórios de observação, diário de bordo.)</span><div class="field-box">' . nl2br(vp($D, 'registro_progresso')) . '</div></td></tr>';
$html .= '</table>';

// ==================== ASSINATURAS E CONSENSO ====================
$html .= '<div class="secao" style="margin-top:15px;">ASSINATURAS E CONSENSO</div>';
$html .= '<table class="bordered" style="margin-top:10px;">';
$html .= '<tr><td style="padding:25px 10px 8px 10px;text-align:center;height:50px;">_____________________________________________<br>Professor(a) Regente</td></tr>';
$html .= '<tr><td style="padding:25px 10px 8px 10px;text-align:center;height:50px;">_____________________________________________<br>Professor(a) de AEE</td></tr>';
$html .= '<tr><td style="padding:25px 10px 8px 10px;text-align:center;height:50px;">_____________________________________________<br>Coordenação Pedagógica</td></tr>';
$html .= '<tr><td style="padding:25px 10px 8px 10px;text-align:center;height:50px;">_____________________________________________<br>Direção Escolar</td></tr>';
$html .= '<tr><td style="padding:25px 10px 8px 10px;text-align:center;height:50px;">_____________________________________________<br>Responsável pelo Aluno</td></tr>';
$html .= '</table>';

// Renderizar PDF
$mpdf->WriteHTML($html);

// Salvar arquivo
$dir = __DIR__ . '/uploads/documentos/pais/';
if (!is_dir($dir)) mkdir($dir, 0755, true);

$filename = 'pai_' . $pai['student_id'] . '_' . $id . '_' . date('YmdHis') . '.pdf';
$filepath = $dir . $filename;
$mpdf->Output($filepath, \Mpdf\Output\Destination::FILE);

// Registrar em documentos_gerados
$doc_sql = "INSERT INTO documentos_gerados (tipo, student_id, form_id, file_path, file_name, teacher_id, created_at) 
            VALUES ('pai', :student_id, :form_id, :file_path, :file_name, :teacher_id, NOW())";
$doc_stmt = $pdo->prepare($doc_sql);
$doc_stmt->execute([
    ':student_id' => $pai['student_id'],
    ':form_id' => $id,
    ':file_path' => $filepath,
    ':file_name' => $filename,
    ':teacher_id' => $user['id']
]);

// Retornar para download
try {
    $mpdf->Output($filename, \Mpdf\Output\Destination::DOWNLOAD);
} catch (PDOException $e) {
    error_log('[PDF-PAI-V2] Erro SQL: ' . $e->getMessage());
    error_log('[PDF-PAI-V2] SQL State: ' . $e->getCode());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('[PDF-PAI-V2] Erro: ' . $e->getMessage());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
}
