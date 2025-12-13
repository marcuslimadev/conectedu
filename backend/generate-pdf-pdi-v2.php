<?php
/**
 * GERADOR DE PDF - PDI V2
 * Layout EXATO do modelo oficial PDI.txt
 * Inclui tabelas de planejamento bimestral e relatórios
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
function vv($arr, $key, $default = '') { 
    $v = $arr[$key] ?? $default; 
    return htmlspecialchars((string)$v, ENT_QUOTES, 'UTF-8'); 
}

function data_br_fmt($s) {
    if (!$s || $s === '0000-00-00') return '';
    $t = strtotime($s); 
    return $t ? date('d/m/Y', $t) : '';
}

function campo_pdi($label, $valor = '') {
    $v = $valor ? htmlspecialchars($valor, ENT_QUOTES, 'UTF-8') : '';
    return '<span class="label">' . $label . '</span><div class="field-box" style="min-height:18px;">' . $v . '</div>';
}

function texto_pdi($label, $valor = '') {
    $v = $valor ? nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8')) : '';
    return '<span class="label">' . $label . '</span><div class="field-box" style="min-height:30px;">' . $v . '</div>';
}

function check_pdi($arr, $key) {
    return !empty($arr[$key]) ? '☑' : '☐';
}

$studentName = vv($D, 'nome_estudante', $pdi['student_name'] ?? '');
$schoolName  = vv($D, 'nome_escola', $pdi['school_name'] ?? '');
$dataElaboracao = data_br_fmt($D['data_elaboracao'] ?? ($pdi['data_inicio'] ?? null));

$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'margin_left' => 20,
    'margin_right' => 20,
    'margin_top' => 15,
    'margin_bottom' => 15,
    'default_font_size' => 9,
]);

$mpdf->SetTitle('PDI - ' . ($studentName ?: 'Aluno'));
$mpdf->SetAuthor('ConectEDU - Sistema AEE');

// CSS Global
$css = '<style>
body { font-family: DejaVu Sans, Arial, sans-serif; font-size: 9pt; line-height: 1.4; color: #000; }
h1 { text-align: center; color: #1a5490; font-size: 13pt; font-weight: bold; margin: 10px 0; }
h2 { text-align: center; font-size: 10pt; margin: 0 0 10px 0; }
.secao { font-size: 11pt; font-weight: bold; margin: 12px 0 5px 0; padding: 3px 5px; background: #e8f0f8; border-left: 4px solid #1a5490; }
.bordered { width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 8pt; }
.bordered td { border: 2px solid #000; padding: 5px; vertical-align: top; }
.label { font-weight: bold; font-size: 8pt; display: block; margin-bottom: 2px; }
.field-box { border: 1px solid #666; padding: 4px; background: #fff; min-height: 25px; }
table { width: 100%; border-collapse: collapse; font-size: 8pt; }
th, td { border: 1px solid #000; padding: 3px; vertical-align: top; text-align: left; }
th { background: #e8e8e8; font-weight: bold; }
.page-break { page-break-after: always; }
</style>';

// HTML do documento
$html = $css;
$html .= '<h1>PLANO DE DESENVOLVIMENTO INDIVIDUAL – PDI</h1>';
$html .= '<h2>Modelo para as Redes Públicas e Privadas de Ensino</h2>';

// ==================== I. DADOS INSTITUCIONAIS ====================
$html .= '<div class="secao">I. DADOS INSTITUCIONAIS</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td>' . campo_pdi('1. Data da elaboração:', $dataElaboracao) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('2. SRE:', vv($D, 'sre')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('3. Nome da escola:', $schoolName) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('4. Código:', vv($D, 'codigo_escola')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('5. Endereço:', vv($D, 'endereco_escola')) . '</td></tr>';

$html .= '<tr><td><span class="label">6. Etapas da Educação Básica oferecidas pela escola:</span><div class="field-box">';
$html .= check_pdi($D, 'ef_anos_iniciais') . ' EF anos iniciais &nbsp; ';
$html .= check_pdi($D, 'ef_anos_finais') . ' EF anos finais &nbsp; ';
$html .= check_pdi($D, 'ensino_medio') . ' Ensino Médio</div></td></tr>';

$html .= '<tr><td><span class="label">7. A Escola possui acessibilidade física:</span><div class="field-box">';
$html .= check_pdi($D, 'acessibilidade_fisica_sim') . ' Sim &nbsp; ';
$html .= check_pdi($D, 'acessibilidade_fisica_nao') . ' Não</div></td></tr>';

$html .= '<tr><td><span class="label">8. Possui Sala de recursos:</span><div class="field-box">';
$html .= check_pdi($D, 'possui_sala_recursos_sim') . ' Sim &nbsp; ';
$html .= check_pdi($D, 'possui_sala_recursos_nao') . ' Não';
if (vv($D, 'escola_encaminhada')) {
    $html .= ' &nbsp; Nome Escola encaminhada: ' . vv($D, 'escola_encaminhada');
}
$html .= '</div></td></tr>';

$html .= '<tr><td>' . campo_pdi('9. Diretor(a):', vv($D, 'diretor')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('10. Vice-diretor(a):', vv($D, 'vice_diretor')) . '</td></tr>';

$html .= '<tr><td><span class="label">11. Responsáveis pela elaboração PDI: NOME – CARGO - MASP</span></td></tr>';
$html .= '<tr><td>' . campo_pdi('Especialista:', vv($D, 'especialista')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('Professor de Apoio (quando houver):', vv($D, 'professor_apoio')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('Guia Intérprete (quando houver):', vv($D, 'guia_interprete')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('TILS (quando houver):', vv($D, 'tils')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('Professor de Sala de Recursos (quando houver):', vv($D, 'professor_sala_recursos')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('Regente(s) de turma/aula:', vv($D, 'regentes')) . '</td></tr>';
$html .= '</table>';

// ==================== II. DADOS DO ESTUDANTE ====================
$html .= '<div class="secao">II. DADOS DO(A) ESTUDANTE</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td>' . campo_pdi('1. Nome do Estudante:', $studentName) . '</td></tr>';
$html .= '<tr><td style="width:50%;">' . campo_pdi('2. Data de nascimento:', data_br_fmt(vv($D, 'data_nascimento'))) . '</td>';
$html .= '<td>' . campo_pdi('Idade:', vv($D, 'idade')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('3. Responsável pelo estudante/parentesco:', vv($D, 'responsavel')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('4. Ano de escolaridade:', vv($D, 'ano_escolaridade')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('5. Deficiência informada:', vv($D, 'deficiencia_informada')) . '</td></tr>';
$html .= '<tr><td style="width:50%;">' . campo_pdi('6. É acompanhado por um profissional fora da escola?', vv($D, 'acompanhado_profissional')) . '</td>';
$html .= '<td>' . campo_pdi('Qual especialidade?', vv($D, 'especialidade_profissional')) . '</td></tr>';
$html .= '<tr><td style="width:40%;">' . campo_pdi('7. Faz uso contínuo de medicamento?', vv($D, 'uso_medicamento')) . '</td>';
$html .= '<td style="width:30%;">' . campo_pdi('Causa efeitos colaterais?', vv($D, 'efeitos_colaterais')) . '</td>';
$html .= '<td>' . campo_pdi('Quais?', vv($D, 'quais_efeitos')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('8. Possui alguma necessidade específica:', vv($D, 'necessidade_especifica')) . '</td></tr>';

$html .= '<tr><td><span class="label">9. Tipo de atendimento:</span><div class="field-box">';
$html .= check_pdi($D, 'atendimento_guia_interprete') . ' Guia Intérprete &nbsp; ';
$html .= check_pdi($D, 'atendimento_professor_libras') . ' Professor de LIBRAS &nbsp; ';
$html .= check_pdi($D, 'atendimento_interprete_libras') . ' Intérprete de LIBRAS<br>';
$html .= check_pdi($D, 'atendimento_sala_recursos') . ' Sala de Recursos &nbsp; ';
$html .= check_pdi($D, 'atendimento_professor_apoio') . ' Professor de apoio ACLTA &nbsp; ';
$html .= check_pdi($D, 'atendimento_outro') . ' Outro. Qual? ' . vv($D, 'atendimento_outro_qual') . '</div></td></tr>';

$html .= '<tr><td>' . campo_pdi('10. Utiliza recurso de Acessibilidade? Descreva:', vv($D, 'recurso_acessibilidade')) . '</td></tr>';
$html .= '<tr><td>' . texto_pdi('11. Como gosta de se divertir?', vv($D, 'como_divertir')) . '</td></tr>';
$html .= '</table>';

// ==================== III. CONSIDERAÇÕES DA FAMÍLIA ====================
$html .= '<div class="secao">III. CONSIDERAÇÕES DA FAMÍLIA</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td>' . texto_pdi('', vv($D, 'consideracoes_familia')) . '</td></tr>';
$html .= '</table>';

// ==================== IV. HISTÓRICO DE ESCOLARIZAÇÃO ====================
$html .= '<div class="secao">IV. HISTÓRICO DE ESCOLARIZAÇÃO</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td>' . campo_pdi('1. Com que idade o aluno começou a frequentar a escola?', vv($D, 'idade_comecou_escola')) . '</td></tr>';
$html .= '<tr><td>' . texto_pdi('2. Onde e como foi o percurso escolar?', vv($D, 'percurso_escolar')) . '</td></tr>';
$html .= '<tr><td style="width:50%;">' . campo_pdi('3. Frequenta sala de recursos?', vv($D, 'frequenta_sala_recursos')) . '</td>';
$html .= '<td>' . campo_pdi('Qual a frequência do atendimento (dia/horas)?', vv($D, 'frequencia_sala_recursos')) . '</td></tr>';
$html .= '<tr><td>' . campo_pdi('4. Frequenta Educação Integral?', vv($D, 'frequenta_educacao_integral')) . '</td></tr>';
$html .= '</table>';

// ==================== V. LIMITES E AGRESSIVIDADE ====================
$html .= '<div class="secao">V. LIMITES E AGRESSIVIDADE</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><div class="field-box">';
$html .= check_pdi($D, 'autoagressividade') . ' Apresenta Autoagressividade &nbsp; ';
$html .= check_pdi($D, 'indisciplina') . ' Apresenta indisciplina<br>';
$html .= check_pdi($D, 'heteroagressividade') . ' Apresenta Heteroagressividade &nbsp; ';
$html .= check_pdi($D, 'desobediencia_regras') . ' Apresenta desobediência às regras e/ou combinados<br>';
$html .= check_pdi($D, 'apatia') . ' Apresenta apatia</div></td></tr>';
$html .= '<tr><td>' . texto_pdi('Obs.:', vv($D, 'limites_obs')) . '</td></tr>';
$html .= '</table>';

// ==================== VI. ASPECTOS PSICOMOTORES OBSERVADOS ====================
$html .= '<div class="secao">VI. ASPECTOS PSICOMOTORES OBSERVADOS</div>';
$html .= '<table class="bordered">';
$html .= '<tr><th style="width:45%;">ASPECTOS PSICOMOTORES</th><th style="width:14%;">APRESENTA</th><th style="width:14%;">APRESENTA COM AJUDA</th><th style="width:14%;">NÃO APRESENTA</th><th style="width:13%;">NÃO OBSERVADO</th></tr>';

$aspectos_psico = [
    'esquema_corporal' => 'Esquema corporal – Conhece as partes e funções do corpo? Nomeia as partes do corpo?',
    'consciencia_corporal' => 'Consciência corporal – Sabe do uso específico de cada membro do corpo para a realização de atividades',
    'expressao_corporal' => 'Expressão corporal – Realizar gestos expressivos (susto, grito, tristeza, raiva)?',
    'imagem_corporal' => 'Imagem corporal - Relação do próprio corpo com o espaço e as pessoas',
    'tonus_hipertonico' => 'Tônus Hipertônico – Apresenta rigidez muscular elevada?',
    'tonus_hipotonico' => 'Tônus Hipotônico - Apresenta flacidez muscular elevada?',
    'coordenacao_motora_ampla' => 'Coordenação motora ampla – Controla os movimentos amplos do corpo?',
    'coordenacao_motora_fina' => 'Coordenação motora fina – Controla os pequenos músculos para exercícios refinados?',
    'equilibrio_dinamico' => 'Equilíbrio dinâmico – Ex.: andar na ponta dos pés, correr com copo cheio de água na mão',
    'equilibrio_estatico' => 'Equilíbrio estático – Sustenta-se em diferentes situações?',
    'lateralidade' => 'Lateralidade – Tem capacidade motora de percepção integrada dos dois lados do corpo?',
    'percepcao_gustativa' => 'Percepção gustativa – Tem a capacidade de distinguir sabores?',
    'percepcao_olfativa' => 'Percepção olfativa – Tem a capacidade de distinguir odores?',
    'percepcao_tatil' => 'Percepção tátil – Sente as variações de pressão, temperatura, noções de peso?',
    'percepcao_visual' => 'Percepção visual – Identifica formas geométricas, junta objetos iguais, compara objetos?',
    'postura' => 'Postura – Posição ou atitude do corpo ligada ao movimento',
];

foreach ($aspectos_psico as $key => $label) {
    $ap = vv($D, 'psico_' . $key . '_apresenta') == 'sim' ? '☑' : '☐';
    $ac = vv($D, 'psico_' . $key . '_com_ajuda') == 'sim' ? '☑' : '☐';
    $na = vv($D, 'psico_' . $key . '_nao_apresenta') == 'sim' ? '☑' : '☐';
    $no = vv($D, 'psico_' . $key . '_nao_observado') == 'sim' ? '☑' : '☐';
    
    $html .= '<tr><td>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</td>';
    $html .= '<td style="text-align:center;">' . $ap . '</td>';
    $html .= '<td style="text-align:center;">' . $ac . '</td>';
    $html .= '<td style="text-align:center;">' . $na . '</td>';
    $html .= '<td style="text-align:center;">' . $no . '</td></tr>';
}

$html .= '</table>';

// ==================== VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS ====================
$html .= '<div class="secao page-break">VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS</div>';
$html .= '<table class="bordered">';
$html .= '<tr><th style="width:45%;">ASPECTOS PEDAGÓGICOS/COGNITIVOS</th><th style="width:14%;">APRESENTA</th><th style="width:14%;">APRESENTA COM AJUDA</th><th style="width:14%;">NÃO APRESENTA</th><th style="width:13%;">NÃO OBSERVADO</th></tr>';

$aspectos_cog = [
    'memoria_curto_prazo' => 'Memória de Curto Prazo – lembra-se de acontecimentos cotidianos ocorridos num período de até 6 horas?',
    'memoria_longo_prazo' => 'Memória de Longo Prazo – lembra-se de fatos ocorridos ao longo da vida e os utiliza no cotidiano?',
    'memoria_auditiva' => 'Memória Auditiva – memoriza o que escuta?',
    'memoria_visual' => 'Memória Visual – memoriza o que vê?',
    'percepcao_auditiva' => 'Percepção Auditiva – escuta e interpreta os estímulos sonoros?',
    'percepcao_corporal' => 'Percepção Corporal – tem consciência do próprio corpo?',
    'percepcao_espacial' => 'Percepção Espacial – compreende as dimensões do entorno e dos objetos?',
    'percepcao_tatil_cog' => 'Percepção Tátil – reconhece formas, texturas, tamanhos pelo tato?',
    'percepcao_temporal' => 'Percepção Temporal – Tem a capacidade de situar-se em função da sucessão dos acontecimentos?',
    'percepcao_visual_cog' => 'Percepção Visual - enxerga e interpreta os estímulos visuais?',
    'atencao_alerta' => 'Atenção Alerta – responde imediatamente a um estímulo apresentado?',
    'atencao_alternada' => 'Atenção Alternada – realiza atividade proposta e conversa ao mesmo tempo?',
    'atencao_seletiva' => 'Atenção Seletiva – concentra-se em uma atividade ignorando os demais estímulos?',
    'atencao_sustentada' => 'Atenção Sustentada – concentra-se por um longo período de tempo na atividade proposta?',
    'raciocinio_abdutivo' => 'Raciocínio Lógico Abdutivo – busca novas ideias e conhecimentos que possam validar uma conclusão?',
    'raciocinio_dedutivo' => 'Raciocínio Lógico Dedutivo – parte de um fato geral para um particular, concluindo-o?',
    'raciocinio_intuitivo' => 'Raciocínio Lógico Intuitivo – parte de um fato específico para o geral, concluindo-o?',
    'pensamento_analitico' => 'Pensamento Analítico – separa o todo em partes com as mesmas características?',
    'pensamento_criativo' => 'Pensamento Criativo – baseado em seus conhecimentos cria ou modifica algo existente?',
    'pensamento_critico' => 'Pensamento Crítico – examina, analisa ou avalia?',
    'pensamento_sintese' => 'Pensamento de Síntese – sintetiza, resume histórias ou fatos em poucas palavras?',
    'pensamento_questionador' => 'Pensamento Questionador – propõe perguntas e busca respondê-las?',
    'pensamento_sistemico' => 'Pensamento Sistêmico – considera vários elementos e os relaciona?',
    'compreende_ordens_simples' => 'Compreende Ordens Simples? Ex.: Sentar, levantar, sair, entrar',
    'compreende_ordens_complexas' => 'Compreende Ordens Complexas? Ex.: Transmitir um recado à alguém',
    'relata_situacoes_vividas' => 'Relata situações vividas por ele?',
];

foreach ($aspectos_cog as $key => $label) {
    $ap = vv($D, 'cog_' . $key . '_apresenta') == 'sim' ? '☑' : '☐';
    $ac = vv($D, 'cog_' . $key . '_com_ajuda') == 'sim' ? '☑' : '☐';
    $na = vv($D, 'cog_' . $key . '_nao_apresenta') == 'sim' ? '☑' : '☐';
    $no = vv($D, 'cog_' . $key . '_nao_observado') == 'sim' ? '☑' : '☐';
    
    $html .= '<tr><td>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</td>';
    $html .= '<td style="text-align:center;">' . $ap . '</td>';
    $html .= '<td style="text-align:center;">' . $ac . '</td>';
    $html .= '<td style="text-align:center;">' . $na . '</td>';
    $html .= '<td style="text-align:center;">' . $no . '</td></tr>';
}

$html .= '</table>';
$html .= '<table class="bordered" style="margin-top:10px;">';
$html .= '<tr><td>' . texto_pdi('Nos itens VI e VII, caso o estudante apresente 50% ou mais de marcações "Não Apresenta" e "Não Observado" descreva as habilidades que ele demonstra:', vv($D, 'habilidades_demonstradas')) . '</td></tr>';
$html .= '</table>';

// ==================== VIII. COMUNICAÇÃO E LINGUAGEM ====================
$html .= '<div class="secao page-break">VIII. COMUNICAÇÃO E LINGUAGEM</div>';
$html .= '<table class="bordered">';

$html .= '<tr><td><span class="label">1. Apresenta intenção comunicativa:</span><div class="field-box">';
$html .= check_pdi($D, 'intencao_comunicativa_sim') . ' Sim &nbsp; ';
$html .= check_pdi($D, 'intencao_comunicativa_nao') . ' Não</div></td></tr>';

$html .= '<tr><td><span class="label">2. Utiliza a comunicação:</span><div class="field-box">';
$html .= check_pdi($D, 'comunicacao_comentarios') . ' para fazer comentários &nbsp; ';
$html .= check_pdi($D, 'comunicacao_solicitacoes') . ' para fazer solicitações<br>';
$html .= check_pdi($D, 'comunicacao_necessidades') . ' para necessidades básicas &nbsp; ';
$html .= check_pdi($D, 'comunicacao_atencao') . ' para obter atenção<br>';
$html .= check_pdi($D, 'comunicacao_escolhas') . ' realizar escolhas &nbsp; ';
$html .= check_pdi($D, 'comunicacao_narrativas') . ' realizar pequenas narrativas</div></td></tr>';

$html .= '<tr><td><span class="label">3. Recursos utilizados pelo estudante para Comunicação Suplementar Alternativa:</span><div class="field-box">';
$html .= check_pdi($D, 'recurso_alfabeto_movel') . ' Alfabeto Móvel &nbsp; ';
$html .= check_pdi($D, 'recurso_alta_tecnologia') . ' Alta Tecnologia &nbsp; ';
$html .= check_pdi($D, 'recurso_baixa_tecnologia') . ' Baixa Tecnologia<br>';
$html .= check_pdi($D, 'recurso_figuras_avulsas') . ' Figuras Avulsas &nbsp; ';
$html .= check_pdi($D, 'recurso_fotos') . ' Fotos &nbsp; ';
$html .= check_pdi($D, 'recurso_numerais') . ' Numerais<br>';
$html .= check_pdi($D, 'recurso_nenhum') . ' Não Faz uso de nenhum recurso suplementar para a comunicação<br>';
$html .= check_pdi($D, 'recurso_pictograma') . ' Pictograma &nbsp; ';
$html .= check_pdi($D, 'recurso_prancha_comunicacao') . ' Prancha de Comunicação &nbsp; ';
$html .= check_pdi($D, 'recurso_prancha_tematica') . ' Prancha Temática</div></td></tr>';

$html .= '<tr><td><span class="label">4. Expressa-se por/como/com:</span><div class="field-box">';
$expressoes = [
    'gestos_caseiros' => 'Gestos caseiros', 'libras' => 'Língua de Sinais Brasileira - Libras', 'palavras' => 'Palavras', 'sons' => 'Sons',
    'timidez' => 'Demonstra timidez ao se expressar', 'descreve_gravuras' => 'Descreve gravuras', 'ecolalia' => 'Ecolalia',
    'clareza' => 'Expressa-se com clareza', 'rapido' => 'Expressa-se muito rápido', 'som_final' => 'Expressa-se pelo som final das palavras',
    'frases_completas' => 'Frases completas', 'frases_curtas' => 'Frases curtas', 'gagueira' => 'Gagueira', 'lentidao' => 'Lentidão na fala',
    'nomeia_objetos' => 'Nomeia objetos', 'omite_fonemas' => 'Omite fonemas', 'troca_fonemas' => 'Troca fonemas', 'distorce_fonemas' => 'Distorce fonemas',
    'conversa_espontanea' => 'Conversa espontaneamente', 'reconta_historias' => 'Reconta histórias', 'repete_adultos' => 'Repete a fala dos adultos',
    'entende_proposto' => 'Demonstra entender o que é proposto', 'tom_baixo' => 'Tom de voz baixo', 'tom_alto' => 'Tom de voz alto',
];
$i = 0;
foreach ($expressoes as $key => $label) {
    $html .= check_pdi($D, 'expressao_' . $key) . ' ' . $label . ($i % 3 == 2 ? '<br>' : ' &nbsp; ');
    $i++;
}
$html .= '</div></td></tr>';

$html .= '<tr><td><span class="label">5. Escrita:</span><div class="field-box">';
$escrita = [
    'garatujas' => 'Garatujas', 'pre_silabica' => 'Escrita pré-silábica', 'silabica' => 'Escrita silábica', 'silabica_alfabetica' => 'Escrita silábica-alfabética',
    'alfabetica' => 'Escrita alfabética', 'diferencia_desenho' => 'Diferencia desenho da escrita e dos números', 'identifica_rotulos' => 'Identifica rótulos',
    'conhece_algumas_letras' => 'Conhece algumas letras', 'conhece_todas_letras' => 'Conhece todas as letras', 'identifica_letras_iguais' => 'Identifica letras iguais',
    'letra_inicial_nome' => 'Reconhece a letra inicial do seu nome', 'nome_em_frases' => 'Reconhece seu nome em frases',
    'nome_pais_colegas' => 'Reconhece o nome dos pais e colegas', 'escreve_nomes' => 'Escreve nome de familiares e amigos',
    'relaciona_nomes' => 'Observa e relaciona parte dos nomes', 'forma_palavras' => 'Procura formar palavras e tenta ler',
    'escreve_frases' => 'Escreve frases', 'escreve_textos' => 'Escreve textos', 'letra_cursiva' => 'Letra cursiva',
    'letra_impressa' => 'Letra impressa', 'letra_legivel' => 'Letra legível', 'relaciona_tipos_letras' => 'Relaciona letras de vários tipos e tamanhos',
    'atribui_sentido' => 'Tenta atribuir um sentido num texto por meio de pistas', 'escreve_apoio' => 'Escreve com apoio/adaptação',
    'recusa_escrever' => 'Recusa escrever dizendo que não sabe',
];
$j = 0;
foreach ($escrita as $key => $label) {
    $html .= check_pdi($D, 'escrita_' . $key) . ' ' . $label . ($j % 3 == 2 ? '<br>' : ' &nbsp; ');
    $j++;
}
$html .= '</div></td></tr>';

$html .= '<tr><td><span class="label">6. Leitura:</span><div class="field-box">';
$html .= check_pdi($D, 'leitura_palavras') . ' Lê palavras &nbsp; ';
$html .= check_pdi($D, 'leitura_frases') . ' Lê frases &nbsp; ';
$html .= check_pdi($D, 'leitura_textos') . ' Lê textos<br>';
$html .= check_pdi($D, 'leitura_global') . ' Leitura global (compreensão, inferência, comparação)<br>';
$html .= check_pdi($D, 'leitura_fonetica') . ' Leitura fonética (silabada) com dificuldade no entendimento da palavra<br>';
$html .= check_pdi($D, 'leitura_imita') . ' É capaz de imitar a leitura a partir de um texto conhecido oralmente<br>';
$html .= check_pdi($D, 'leitura_nao') . ' Não</div></td></tr>';
$html .= '</table>';

// ==================== IX. PLANEJAMENTO BIMESTRAL ====================
$html .= '<div class="secao page-break">IX. PLANEJAMENTO BIMESTRAL</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><strong>ESTUDANTE:</strong> ' . $studentName . ' &nbsp;&nbsp;&nbsp; <strong>TURMA:</strong> ' . vv($D, 'turma') . '</td></tr>';
$html .= '</table>';

// Exemplo de tabela de planejamento (repetir para cada disciplina/bimestre conforme necessário)
$disciplinas = ['ARTE', 'LÍNGUA PORTUGUESA', 'MATEMÁTICA', 'CIÊNCIAS', 'GEOGRAFIA', 'HISTÓRIA', 'EDUCAÇÃO FÍSICA'];

foreach ($disciplinas as $disc) {
    $disc_key = strtolower(str_replace([' ', 'Ç', 'Ã', 'Ú'], ['_', 'c', 'a', 'u'], $disc));
    
    for ($bim = 1; $bim <= 4; $bim++) {
        $key_prefix = 'planejamento_' . $disc_key . '_bim' . $bim;
        
        if (vv($D, $key_prefix . '_ativo')) {
            $html .= '<div style="margin-top:10px;"><strong>DISCIPLINA: ' . $disc . ' &nbsp;&nbsp;&nbsp; BIMESTRE: ' . $bim . 'º</strong></div>';

                        // Campos adicionais do modelo (professor + objetivos)
                        $prof = vv($D, $key_prefix . '_professor');
                        $objTurma = vv($D, $key_prefix . '_objetivo_turma');
                        $objEstud = vv($D, $key_prefix . '_objetivo_estudante');
                        if ($prof || $objTurma || $objEstud) {
                                $html .= '<table class="bordered" style="margin-top:4px;">';
                                $html .= '<tr><td style="width:50%;">' . campo_pdi('PROFESSOR(A):', $prof) . '</td></tr>';
                                $html .= '<tr><td>' . texto_pdi('Objetivo geral da disciplina para a turma:', $objTurma) . '</td></tr>';
                                $html .= '<tr><td>' . texto_pdi('Objetivo geral da disciplina para o(a) estudante:', $objEstud) . '</td></tr>';
                                $html .= '</table>';
                        }

            $html .= '<table class="bordered" style="margin-top:4px;">';
            $html .= '<tr><th>Conteúdo</th><th>Habilidade</th><th>Metodologia</th><th>Aprendizado adquirido</th></tr>';
            $html .= '<tr>';
            $html .= '<td>' . nl2br(vv($D, $key_prefix . '_conteudo')) . '</td>';
            $html .= '<td>' . nl2br(vv($D, $key_prefix . '_habilidade')) . '</td>';
            $html .= '<td>' . nl2br(vv($D, $key_prefix . '_metodologia')) . '</td>';
            $html .= '<td>' . nl2br(vv($D, $key_prefix . '_aprendizado')) . '</td>';
            $html .= '</tr></table>';
        }
    }
}

// ==================== X. AVALIAÇÃO BIMESTRAL ====================
$html .= '<div class="secao page-break">X. AVALIAÇÃO BIMESTRAL</div>';

$disciplinas_av = [
    ['arte','ARTE'],
    ['lingua_portuguesa','LÍNGUA PORTUGUESA'],
    ['geografia','GEOGRAFIA'],
    ['historia','HISTÓRIA'],
    ['educacao_fisica','EDUCAÇÃO FÍSICA'],
    ['matematica','MATEMÁTICA'],
    ['biologia_ciencias','BIOLOGIA OU CIÊNCIAS'],
    ['fisica','FÍSICA'],
    ['quimica','QUIMÍCA'],
    ['sociologia','SOCIOLOGIA'],
    ['ensino_religioso','ENSINO RELIGIOSO'],
    ['itinerarios_p_vida','INTINERÁRIOS FORMATICOS P.VIDA'],
    ['itinerarios_1','INTINERÁRIOS FORMATICOS'],
    ['itinerarios_2','INTINERÁRIOS FORMATICOS'],
    ['itinerarios_3','INTINERÁRIOS FORMATICOS'],
    ['itinerarios_4','INTINERÁRIOS FORMATICOS'],
];

for ($bim = 1; $bim <= 4; $bim++) {
    $html .= '<div style="margin-top:10px;"><strong>' . $bim . 'º BIMESTRE</strong></div>';
    $html .= '<table class="bordered" style="margin-top:4px;">';
    $html .= '<tr>';
    $html .= '<th style="width:14%;">Disciplina</th>';
    $html .= '<th style="width:6%;">Valor</th>';
    $html .= '<th style="width:8%;">Nota alcançada</th>';
    $html .= '<th style="width:14%;">Grau de autonomia para realizar a atividade</th>';
    $html .= '<th style="width:28%;">Metodologia utilizada (descrever como foi realizada a avaliação)</th>';
    $html .= '<th style="width:30%;">Qual o diagnóstico pedagógico do estudante nessa habilidade? (descreva potenciais e desafios)</th>';
    $html .= '</tr>';

    foreach ($disciplinas_av as $d) {
        $k = $d[0]; $label = $d[1];
        $prefix = 'avaliacao_bim' . $bim . '_' . $k . '_';
        $valor = vv($D, $prefix . 'valor');
        $nota = vv($D, $prefix . 'nota');
        $suporte = vv($D, $prefix . 'suporte');
        $comp = vv($D, $prefix . 'compreensao');
        $met = vv($D, $prefix . 'metodologia');
        $diag = vv($D, $prefix . 'diagnostico');

        $autonomiaTxt = '';
        if ($suporte === 'muito_suporte') $autonomiaTxt .= 'muito suporte';
        if ($suporte === 'pouco_suporte') $autonomiaTxt .= ($autonomiaTxt ? ' / ' : '') . 'pouco suporte';
        if ($comp === 'alta_compreensao') $autonomiaTxt .= ($autonomiaTxt ? ' / ' : '') . 'alta compreensão';
        if ($comp === 'pouca_compreensao') $autonomiaTxt .= ($autonomiaTxt ? ' / ' : '') . 'pouca compreensão';

        $html .= '<tr>';
        $html .= '<td>' . htmlspecialchars($label, ENT_QUOTES, 'UTF-8') . '</td>';
        $html .= '<td>' . nl2br($valor) . '</td>';
        $html .= '<td>' . nl2br($nota) . '</td>';
        $html .= '<td>' . nl2br(htmlspecialchars($autonomiaTxt, ENT_QUOTES, 'UTF-8')) . '</td>';
        $html .= '<td>' . nl2br($met) . '</td>';
        $html .= '<td>' . nl2br($diag) . '</td>';
        $html .= '</tr>';
    }

    $html .= '</table>';
}

// ==================== XI. RELATÓRIO PEDAGÓGICO DO DESENVOLVIMENTO DO ESTUDANTE / SEMESTRAL ====================
$html .= '<div class="secao page-break">XI. RELATÓRIO PEDAGÓGICO DO DESENVOLVIMENTO DO ESTUDANTE / SEMESTRAL</div>';
$html .= '<table class="bordered">';
$html .= '<tr><td><em>Relatório Pedagógico DESCRITIVO de até uma lauda, elencando os aspectos cognitivos, sociais, comunicacionais e motores de desenvolvimento do estudante durante o semestre:</em></td></tr>';
$html .= '<tr><td>' . texto_pdi('', vv($D, 'relatorio_semestral')) . '</td></tr>';
$html .= '</table>';

// Renderizar PDF
$mpdf->WriteHTML($html);

// Salvar arquivo
$dir = __DIR__ . '/uploads/documentos/pdis/';
if (!is_dir($dir)) mkdir($dir, 0755, true);

$filename = 'pdi_' . $pdi['student_id'] . '_' . $id . '_' . date('YmdHis') . '.pdf';
$filepath = $dir . $filename;
$mpdf->Output($filepath, \Mpdf\Output\Destination::FILE);

// Registrar em documentos_gerados
$doc_sql = "INSERT INTO documentos_gerados (tipo, student_id, form_id, file_path, file_name, teacher_id, created_at) 
            VALUES ('pdi', :student_id, :form_id, :file_path, :file_name, :teacher_id, NOW())";
$doc_stmt = $pdo->prepare($doc_sql);
$doc_stmt->execute([
    ':student_id' => $pdi['student_id'],
    ':form_id' => $id,
    ':file_path' => $filepath,
    ':file_name' => $filename,
    ':teacher_id' => $user['id']
]);

// Retornar para download
try {
    $mpdf->Output($filename, \Mpdf\Output\Destination::DOWNLOAD);
} catch (PDOException $e) {
    error_log('[PDF-PDI-V2] Erro SQL: ' . $e->getMessage());
    error_log('[PDF-PDI-V2] SQL State: ' . $e->getCode());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    error_log('[PDF-PDI-V2] Erro: ' . $e->getMessage());
    res(false, null, 'Erro ao gerar PDF: ' . $e->getMessage(), 500);
}
