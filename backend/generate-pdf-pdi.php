<?php
/**
 * Gerador de PDF - Plano de Desenvolvimento Individual (PDI)
 * 
 * Template baseado 100% no modelo oficial do PDI
 * Gera documento profissional com 11 seções + tabelas bimestrais dinâmicas
 * 
 * Pode ser chamado diretamente ou incluído via api.php
 */

// Só carrega dependencies se não estiver sendo incluído
if (!function_exists('db')) {
    require_once 'functions.php';
}
if (!class_exists('Mpdf\Mpdf')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use Mpdf\Mpdf;
use Mpdf\Output\Destination;

// Se chamado diretamente (não via api.php)
if (!isset($user)) {
    $user = require_auth();
}

// Validar ID do PDI
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    res(false, null, 'ID do PDI inválido', 400);
}

$pdi_id = intval($_GET['id']);

// Buscar PDI com dados do aluno
$sql = "SELECT p.*, s.name as student_name, s.photo_url 
        FROM pdi_conectaee p
        LEFT JOIN students s ON p.student_id = s.id
        WHERE p.id = :id";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $pdi_id, PDO::PARAM_INT);
$stmt->execute();
$pdi = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$pdi) {
    res(false, null, 'PDI não encontrado', 404);
}

// Validar permissões (teacher-centric)
if ($user['role'] !== 'admin' && $pdi['teacher_id'] != $user['id']) {
    res(false, null, 'Sem permissão para gerar este PDF', 403);
}

// Decodificar campos JSON
$aspectos_psicomotores = json_decode($pdi['aspectos_psicomotores'] ?? '{}', true) ?: [];
$aspectos_pedagogicos = json_decode($pdi['aspectos_pedagogicos'] ?? '{}', true) ?: [];
$planejamento_bimestral = json_decode($pdi['planejamento_bimestral'] ?? '{}', true) ?: [];

// Preparar dados para o template
$data = [
    'pdi' => $pdi,
    'aspectos_psicomotores' => $aspectos_psicomotores,
    'aspectos_pedagogicos' => $aspectos_pedagogicos,
    'planejamento_bimestral' => $planejamento_bimestral,
    'photo_path' => $pdi['photo_url'] ? __DIR__ . '/uploads/students/' . basename($pdi['photo_url']) : null
];

// Gerar HTML do template
$html = getPDITemplate($data);

// Configurar mPDF
$mpdf = new Mpdf([
    'mode' => 'utf-8',
    'format' => 'A4',
    'orientation' => 'P',
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 20,
    'margin_bottom' => 20,
    'margin_header' => 10,
    'margin_footer' => 10,
]);

// Gerar PDF
$mpdf->WriteHTML($html);

// Definir nome do arquivo
$filename = 'PDI_' . preg_replace('/[^a-zA-Z0-9]/', '_', $pdi['nome_aluno']) . '_' . date('Ymd_His') . '.pdf';
$filepath = __DIR__ . '/uploads/documentos/pdis/' . $filename;

// Salvar arquivo
// Garantir diretório de saída
$dir = dirname($filepath);
if (!is_dir($dir)) {
    @mkdir($dir, 0777, true);
}

$mpdf->Output($filepath, Destination::FILE);

// Calcular tamanho do arquivo
$filesize = filesize($filepath);

// Registrar documento na tabela documentos_gerados
$sql_insert = "INSERT INTO documentos_gerados 
               (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
               VALUES (:tipo, :form_id, :student_id, :teacher_id, :file_path, :file_name, :file_size, :titulo)";

$stmt_insert = $pdo->prepare($sql_insert);
$stmt_insert->execute([
    ':tipo' => 'pdi',
    ':form_id' => $pdi_id,
    ':student_id' => $pdi['student_id'],
    ':teacher_id' => $user['id'],
    ':file_path' => $filepath,
    ':file_name' => $filename,
    ':file_size' => $filesize,
    ':titulo' => 'PDI - ' . $pdi['nome_aluno']
]);

// Retornar PDF como download
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . $filesize);
readfile($filepath);

exit;

/**
 * Template HTML do PDI
 * Estrutura complexa com 11 seções + tabelas bimestrais
 */
function getPDITemplate($data) {
    $pdi = $data['pdi'];
    $aspectos_psicomotores = $data['aspectos_psicomotores'];
    $aspectos_pedagogicos = $data['aspectos_pedagogicos'];
    $planejamento_bimestral = $data['planejamento_bimestral'];
    $photo_path = $data['photo_path'];
    
    // CSS inline para mPDF
    $css = "
    <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #1f2937; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 5px; color: #1f4c7a; }
        h2 { font-size: 11pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; background: #f1f5f9; padding: 6px; border-left: 3px solid #8fb3d9; }
        h3 { font-size: 10pt; font-weight: bold; margin-top: 10px; margin-bottom: 5px; color: #334155; }
        .section { margin-bottom: 15px; }
        .field { margin-bottom: 5px; }
        .label { font-weight: bold; display: inline; color: #334155; }
        .value { display: inline; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; font-size: 9pt; }
        table th { background: #eef2f7; padding: 4px; border: 1px solid #d7e0ea; font-weight: 600; text-align: center; color: #1f2937; }
        table td { padding: 4px; border: 1px solid #d7e0ea; vertical-align: top; }
        .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #cbd5e1; margin-right: 3px; text-align: center; line-height: 12px; font-size: 8pt; }
        .checkbox.checked::after { content: 'X'; }
        .photo { width: 80px; height: 100px; border: 1px solid #cbd5e1; float: right; margin-left: 10px; }
        .signature-line { border-top: 1px solid #cbd5e1; width: 200px; margin-top: 30px; text-align: center; font-size: 8pt; }
        .page-break { page-break-after: always; }
        .small-text { font-size: 8pt; color: #475569; }
    </style>
    ";
    
    // Início do HTML
    $html = $css;
    
    // Cabeçalho
    $html .= "<h1>PLANO DE DESENVOLVIMENTO INDIVIDUAL – PDI</h1>";
    $html .= "<p style='text-align: center; font-size: 9pt; margin-bottom: 15px;'>Modelo para as Redes Públicas e Privadas de Ensino</p>";
    
    // Foto do aluno (se existir)
    if ($photo_path && file_exists($photo_path)) {
        $html .= "<img src='" . $photo_path . "' class='photo' />";
    }
    
    // SEÇÃO I - DADOS INSTITUCIONAIS
    $html .= "<div class='section'>";
    $html .= "<h2>I. DADOS INSTITUCIONAIS</h2>";
    $html .= "<div class='field'><span class='label'>1. Data da elaboração:</span> <span class='value'>" . ($pdi['data_elaboracao'] ? date('d/m/Y', strtotime($pdi['data_elaboracao'])) : '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>2. SRE:</span> <span class='value'>" . htmlspecialchars($pdi['sre'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>3. Nome da escola:</span> <span class='value'>" . htmlspecialchars($pdi['nome_escola'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>4. Código:</span> <span class='value'>" . htmlspecialchars($pdi['codigo_escola'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>5. Endereço:</span> <span class='value'>" . htmlspecialchars($pdi['endereco_escola'] ?? '') . "</span></div>";
    
    // Etapas da Educação Básica (checkboxes)
    $etapas = $pdi['etapas_educacao_basica'] ?? '';
    $html .= "<div class='field'><span class='label'>6. Etapas da Educação Básica oferecidas pela escola:</span> ";
    $html .= "<span class='checkbox " . (strpos($etapas, 'ef_iniciais') !== false ? 'checked' : '') . "'></span> EF anos iniciais ";
    $html .= "<span class='checkbox " . (strpos($etapas, 'ef_finais') !== false ? 'checked' : '') . "'></span> EF anos finais ";
    $html .= "<span class='checkbox " . (strpos($etapas, 'ensino_medio') !== false ? 'checked' : '') . "'></span> Ensino Médio</div>";
    
    $html .= "<div class='field'><span class='label'>7. A Escola possui acessibilidade física:</span> ";
    $html .= "<span class='checkbox " . ($pdi['escola_acessibilidade'] == 'sim' ? 'checked' : '') . "'></span> Sim ";
    $html .= "<span class='checkbox " . ($pdi['escola_acessibilidade'] == 'nao' ? 'checked' : '') . "'></span> Não</div>";
    
    $html .= "<div class='field'><span class='label'>8. Possui Sala de recursos:</span> ";
    $html .= "<span class='checkbox " . ($pdi['possui_sala_recursos'] == 'sim' ? 'checked' : '') . "'></span> Sim ";
    $html .= "<span class='checkbox " . ($pdi['possui_sala_recursos'] == 'nao' ? 'checked' : '') . "'></span> Não";
    if ($pdi['nome_escola_encaminhada']) {
        $html .= " - Nome Escola encaminhada: " . htmlspecialchars($pdi['nome_escola_encaminhada']);
    }
    $html .= "</div>";
    
    $html .= "<div class='field'><span class='label'>9. Diretor(a):</span> <span class='value'>" . htmlspecialchars($pdi['diretor'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>10. Vice-diretor(a):</span> <span class='value'>" . htmlspecialchars($pdi['vice_diretor'] ?? '') . "</span></div>";
    
    $html .= "<h3>11. Responsáveis pela elaboração PDI: NOME – CARGO - MASP</h3>";
    $html .= "<div class='field'><span class='label'>Especialista:</span> <span class='value'>" . htmlspecialchars($pdi['especialista'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Professor de Apoio (quando houver):</span> <span class='value'>" . htmlspecialchars($pdi['professor_apoio'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Guia Intérprete (quando houver):</span> <span class='value'>" . htmlspecialchars($pdi['guia_interprete'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>TILS (quando houver):</span> <span class='value'>" . htmlspecialchars($pdi['tils'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Professor de Sala de Recursos (quando houver):</span> <span class='value'>" . htmlspecialchars($pdi['professor_sala_recursos'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Regente(s) de turma/aula:</span> <span class='value'>" . nl2br(htmlspecialchars($pdi['regentes_turma'] ?? '')) . "</span></div>";
    $html .= "</div>";
    
    // SEÇÃO II - DADOS DO ESTUDANTE
    $html .= "<div class='section'>";
    $html .= "<h2>II. DADOS DO(A) ESTUDANTE</h2>";
    $html .= "<div class='field'><span class='label'>1. Nome do Estudante:</span> <span class='value'>" . htmlspecialchars($pdi['nome_aluno'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>2. Data de nascimento:</span> <span class='value'>" . ($pdi['data_nascimento'] ? date('d/m/Y', strtotime($pdi['data_nascimento'])) : '') . "</span> <span class='label'>Idade:</span> <span class='value'>" . ($pdi['idade'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>3. Responsável pelo estudante/parentesco:</span> <span class='value'>" . htmlspecialchars($pdi['responsavel_parentesco'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>4. Ano de escolaridade:</span> <span class='value'>" . htmlspecialchars($pdi['ano_escolaridade'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>5. Deficiência informada:</span> <span class='value'>" . htmlspecialchars($pdi['deficiencia_informada'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>6. É acompanhado por um profissional fora da escola?</span> <span class='value'>" . ($pdi['acompanhado_profissional'] == 'sim' ? 'Sim' : 'Não') . "</span>";
    if ($pdi['especialidade_profissional']) {
        $html .= " <span class='label'>Qual especialidade?</span> <span class='value'>" . htmlspecialchars($pdi['especialidade_profissional']) . "</span>";
    }
    $html .= "</div>";
    $html .= "<div class='field'><span class='label'>7. Faz uso contínuo de medicamento?</span> <span class='value'>" . ($pdi['uso_medicamento'] == 'sim' ? 'Sim' : 'Não') . "</span>";
    if ($pdi['efeitos_colaterais']) {
        $html .= " <span class='label'>Causa efeitos colaterais? Quais?</span> <span class='value'>" . htmlspecialchars($pdi['efeitos_colaterais']) . "</span>";
    }
    $html .= "</div>";
    $html .= "<div class='field'><span class='label'>8. Possui alguma necessidade específica:</span> <span class='value'>" . htmlspecialchars($pdi['necessidade_especifica'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>9. Tipo de atendimento:</span> <span class='value'>" . nl2br(htmlspecialchars($pdi['tipo_atendimento'] ?? '')) . "</span></div>";
    $html .= "<div class='field'><span class='label'>10. Utiliza recurso de Acessibilidade?</span> <span class='label'>Descreva:</span> <span class='value'>" . htmlspecialchars($pdi['recurso_acessibilidade'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>11. Como gosta de se divertir?</span> <span class='value'>" . htmlspecialchars($pdi['como_gosta_divertir'] ?? '') . "</span></div>";
    $html .= "</div>";
    
    // SEÇÃO III - CONSIDERAÇÕES DA FAMÍLIA
    $html .= "<div class='section'>";
    $html .= "<h2>III. CONSIDERAÇÕES DA FAMÍLIA</h2>";
    $html .= "<p>" . nl2br(htmlspecialchars($pdi['consideracoes_familia'] ?? '')) . "</p>";
    $html .= "</div>";
    
    // SEÇÃO IV - HISTÓRICO DE ESCOLARIZAÇÃO
    $html .= "<div class='section'>";
    $html .= "<h2>IV. HISTÓRICO DE ESCOLARIZAÇÃO</h2>";
    $html .= "<div class='field'><span class='label'>1. Com que idade o aluno começou a frequentar a escola?</span> <span class='value'>" . htmlspecialchars($pdi['idade_comecou_escola'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>2. Onde e como foi o percurso escolar?</span> <span class='value'>" . nl2br(htmlspecialchars($pdi['percurso_escolar'] ?? '')) . "</span></div>";
    $html .= "<div class='field'><span class='label'>3. Frequenta sala de recursos?</span> <span class='value'>" . ($pdi['frequenta_sala_recursos'] == 'sim' ? 'Sim' : 'Não') . "</span>";
    if ($pdi['frequencia_atendimento']) {
        $html .= " <span class='label'>Qual a frequência do atendimento (dia/horas)?</span> <span class='value'>" . htmlspecialchars($pdi['frequencia_atendimento']) . "</span>";
    }
    $html .= "</div>";
    $html .= "<div class='field'><span class='label'>4. Frequenta Educação Integral?</span> <span class='value'>" . ($pdi['frequenta_educacao_integral'] == 'sim' ? 'Sim' : 'Não') . "</span></div>";
    $html .= "</div>";
    
    // SEÇÃO V - LIMITES E AGRESSIVIDADE
    $html .= "<div class='section'>";
    $html .= "<h2>V. LIMITES E AGRESSIVIDADE</h2>";
    $html .= "<div class='field'>";
    $html .= "<span class='checkbox " . ($pdi['autoagressividade'] ? 'checked' : '') . "'></span> Apresenta Autoagressividade ";
    $html .= "<span class='checkbox " . ($pdi['indisciplina'] ? 'checked' : '') . "'></span> Apresenta indisciplina ";
    $html .= "<span class='checkbox " . ($pdi['heteroagressividade'] ? 'checked' : '') . "'></span> Apresenta Heteroagressividade<br>";
    $html .= "<span class='checkbox " . ($pdi['desobediencia_regras'] ? 'checked' : '') . "'></span> Apresenta desobediência às regras e/ou combinados ";
    $html .= "<span class='checkbox " . ($pdi['apatia'] ? 'checked' : '') . "'></span> Apresenta apatia";
    $html .= "</div>";
    $html .= "<div class='field'><span class='label'>Obs.:</span> <span class='value'>" . nl2br(htmlspecialchars($pdi['observacoes_comportamento'] ?? '')) . "</span></div>";
    $html .= "</div>";
    
    // SEÇÃO VI - ASPECTOS PSICOMOTORES
    $html .= "<div class='section page-break'>";
    $html .= "<h2>VI. ASPECTOS PSICOMOTORES OBSERVADOS</h2>";
    $html .= getAspectosPsicomotoresTable($aspectos_psicomotores);
    $html .= "</div>";
    
    // SEÇÃO VII - ASPECTOS PEDAGÓGICOS/COGNITIVOS
    $html .= "<div class='section page-break'>";
    $html .= "<h2>VII. ASPECTOS PEDAGÓGICOS/COGNITIVOS OBSERVADOS</h2>";
    $html .= getAspectosPedagogicosTable($aspectos_pedagogicos);
    
    // Texto adicional após as tabelas VI e VII
    if ($pdi['habilidades_demonstradas']) {
        $html .= "<p style='margin-top: 10px;'><strong>Nos itens VI e VII, caso o estudante apresente 50% ou mais de marcações 'Não Apresenta' e 'Não Observado' descreva as habilidades que ele demonstra:</strong></p>";
        $html .= "<p>" . nl2br(htmlspecialchars($pdi['habilidades_demonstradas'])) . "</p>";
    }
    $html .= "</div>";
    
    // SEÇÃO VIII - COMUNICAÇÃO E LINGUAGEM
    $html .= "<div class='section page-break'>";
    $html .= "<h2>VIII. COMUNICAÇÃO E LINGUAGEM</h2>";
    $html .= getComunicacaoLinguagemSection($pdi);
    $html .= "</div>";
    
    // SEÇÃO IX - PLANEJAMENTO BIMESTRAL (COMPLEXO)
    $html .= "<div class='section page-break'>";
    $html .= "<h2>IX. PLANEJAMENTO BIMESTRAL</h2>";
    $html .= getPlanejamentoBimestralSection($planejamento_bimestral, $pdi);
    $html .= "</div>";
    
    // SEÇÃO X - RELATÓRIO PEDAGÓGICO SEMESTRAL
    $html .= "<div class='section page-break'>";
    $html .= "<h2>X. RELATÓRIO PEDAGÓGICO DO DESENVOLVIMENTO DO ESTUDANTE / SEMESTRAL</h2>";
    $html .= "<p class='small-text'>Relatório Pedagógico DESCRITIVO de até uma lauda, elencando os aspectos cognitivos, sociais, comunicacionais e motores de desenvolvimento do estudante durante o semestre:</p>";
    $html .= "<p>" . nl2br(htmlspecialchars($pdi['relatorio_semestral'] ?? '')) . "</p>";
    $html .= "</div>";
    
    return $html;
}

/**
 * Tabela de Aspectos Psicomotores
 */
function getAspectosPsicomotoresTable($aspectos) {
    $items = [
        'esquema_corporal' => 'Esquema corporal – Conhece as partes e funções do corpo? Nomeia as partes do corpo?',
        'consciencia_corporal' => 'Consciência corporal – Sabe do uso específico de cada membro do corpo para a realização de atividades, mesmo nos casos em que haja limitações de movimento.',
        'expressao_corporal' => 'Expressão corporal – Realizar gestos expressivos (susto, grito, tristeza, raiva)?',
        'imagem_corporal' => 'Imagem corporal - Relação do próprio corpo com o espaço e as pessoas.',
        'tonus_hipertonico' => 'Tônus Hipertônico – Apresenta rigidez muscular elevada?',
        'tonus_hipotonico' => 'Tônus Hipotônico - Apresenta flacidez muscular elevada?',
        'coordenacao_motora_ampla' => 'Coordenação motora ampla – Controla os movimentos amplos do corpo?',
        'coordenacao_motora_fina' => 'Coordenação motora fina – Controla os pequenos músculos para exercícios refinados?',
        'equilibrio_dinamico' => 'Equilíbrio dinâmico',
        'equilibrio_estatico' => 'Equilíbrio estático – Sustenta-se em diferentes situações?',
        'lateralidade' => 'Lateralidade – Tem capacidade motora de percepção integrada dos dois lados do corpo?',
        'percepcao_gustativa' => 'Percepção gustativa – Tem a capacidade de distinguir sabores?',
        'percepcao_olfativa' => 'Percepção olfativa – Tem a capacidade de distinguir odores?',
        'percepcao_tatil' => 'Percepção tátil – Sente as variações de pressão, temperatura, noções de peso?',
        'percepcao_visual' => 'Percepção visual – Identifica formas geométricas, junta objetos iguais?',
        'postura' => 'Postura – Posição ou atitude do corpo ligada ao movimento.',
    ];
    
    $html = "<table>";
    $html .= "<tr>";
    $html .= "<th style='width: 40%'>ASPECTOS PSICOMOTORES</th>";
    $html .= "<th style='width: 15%'>APRESENTA</th>";
    $html .= "<th style='width: 15%'>APRESENTA COM AJUDA</th>";
    $html .= "<th style='width: 15%'>NÃO APRESENTA</th>";
    $html .= "<th style='width: 15%'>NÃO OBSERVADO</th>";
    $html .= "</tr>";
    
    foreach ($items as $key => $label) {
        $valor = $aspectos[$key] ?? '';
        $html .= "<tr>";
        $html .= "<td>" . $label . "</td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'apresenta' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'apresenta_com_ajuda' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'nao_apresenta' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'nao_observado' ? 'checked' : '') . "'></span></td>";
        $html .= "</tr>";
    }
    
    $html .= "</table>";
    return $html;
}

/**
 * Tabela de Aspectos Pedagógicos/Cognitivos
 */
function getAspectosPedagogicosTable($aspectos) {
    $items = [
        'memoria_curto_prazo' => 'Memória de Curto Prazo – lembra-se de acontecimentos cotidianos ocorridos num período de até 6 horas?',
        'memoria_longo_prazo' => 'Memória de Longo Prazo – lembra-se de fatos ocorridos ao longo da vida e os utiliza no cotidiano?',
        'memoria_auditiva' => 'Memória Auditiva – memoriza o que escuta?',
        'memoria_visual' => 'Memória Visual – memoriza o que vê?',
        'percepcao_auditiva' => 'Percepção Auditiva – escuta e interpreta os estímulos sonoros?',
        'percepcao_corporal' => 'Percepção Corporal – tem consciência do próprio corpo?',
        'percepcao_espacial' => 'Percepção Espacial – compreende as dimensões do entorno e dos objetos?',
        'percepcao_tatil' => 'Percepção Tátil – reconhece formas, texturas, tamanhos pelo tato?',
        'percepcao_temporal' => 'Percepção Temporal – Tem a capacidade de situar-se em função da sucessão dos acontecimentos?',
        'percepcao_visual' => 'Percepção Visual - enxerga e interpreta os estímulos visuais?',
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
        'compreende_ordens_simples' => 'Compreende Ordens Simples?',
        'compreende_ordens_complexas' => 'Compreende Ordens Complexas?',
        'relata_situacoes' => 'Relata situações vividas por ele?',
    ];
    
    $html = "<table>";
    $html .= "<tr>";
    $html .= "<th style='width: 40%'>ASPECTOS PEDAGÓGICOS/COGNITIVOS</th>";
    $html .= "<th style='width: 15%'>APRESENTA</th>";
    $html .= "<th style='width: 15%'>APRESENTA COM AJUDA</th>";
    $html .= "<th style='width: 15%'>NÃO APRESENTA</th>";
    $html .= "<th style='width: 15%'>NÃO OBSERVADO</th>";
    $html .= "</tr>";
    
    foreach ($items as $key => $label) {
        $valor = $aspectos[$key] ?? '';
        $html .= "<tr>";
        $html .= "<td>" . $label . "</td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'apresenta' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'apresenta_com_ajuda' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'nao_apresenta' ? 'checked' : '') . "'></span></td>";
        $html .= "<td style='text-align: center'><span class='checkbox " . ($valor == 'nao_observado' ? 'checked' : '') . "'></span></td>";
        $html .= "</tr>";
    }
    
    $html .= "</table>";
    return $html;
}

/**
 * Seção de Comunicação e Linguagem
 */
function getComunicacaoLinguagemSection($pdi) {
    $html = "";
    
    // 1. Apresenta intenção comunicativa
    $html .= "<div class='field'><span class='label'>1. Apresenta intenção comunicativa:</span><br>";
    $html .= "<span class='checkbox " . ($pdi['intencao_comunicativa'] == 'sim' ? 'checked' : '') . "'></span> Sim ";
    $html .= "<span class='checkbox " . ($pdi['intencao_comunicativa'] == 'nao' ? 'checked' : '') . "'></span> Não</div>";
    
    // 2. Utiliza a comunicação
    $utiliza_com = explode(',', $pdi['utiliza_comunicacao'] ?? '');
    $html .= "<div class='field' style='margin-top: 8px;'><span class='label'>2. Utiliza a comunicação:</span><br>";
    $opcoes_utiliza = [
        'comentarios' => 'para fazer comentários',
        'solicitacoes' => 'para fazer solicitações',
        'necessidades_basicas' => 'para necessidades básicas',
        'obter_atencao' => 'para obter atenção',
        'realizar_escolhas' => 'realizar escolhas',
        'pequenas_narrativas' => 'realizar pequenas narrativas',
    ];
    foreach ($opcoes_utiliza as $key => $label) {
        $html .= "<span class='checkbox " . (in_array($key, $utiliza_com) ? 'checked' : '') . "'></span> $label<br>";
    }
    $html .= "</div>";
    
    // 3. Recursos CSA
    $recursos = explode(',', $pdi['recursos_comunicacao_alternativa'] ?? '');
    $html .= "<div class='field' style='margin-top: 8px;'><span class='label'>3. Recursos utilizados para Comunicação Suplementar Alternativa:</span><br>";
    $opcoes_recursos = [
        'alfabeto_movel' => 'Alfabeto Móvel',
        'alta_tecnologia' => 'Alta Tecnologia',
        'baixa_tecnologia' => 'Baixa Tecnologia',
        'figuras_avulsas' => 'Figuras Avulsas',
        'fotos' => 'Fotos',
        'numerais' => 'Numerais',
        'nao_faz_uso' => 'Não Faz uso de nenhum recurso suplementar',
        'pictograma' => 'Pictograma',
        'prancha_comunicacao' => 'Prancha de Comunicação',
        'prancha_tematica' => 'Prancha Temática',
    ];
    foreach ($opcoes_recursos as $key => $label) {
        $html .= "<span class='checkbox " . (in_array($key, $recursos) ? 'checked' : '') . "'></span> $label<br>";
    }
    $html .= "</div>";
    
    // 4. Expressa-se por/como/com
    $expressa = explode(',', $pdi['expressa_se_por'] ?? '');
    $html .= "<div class='field' style='margin-top: 8px;'><span class='label'>4. Expressa-se por/como/com:</span><br>";
    $opcoes_expressao = [
        'gestos_caseiros' => 'Gestos caseiros',
        'libras' => 'Língua de Sinais Brasileira - Libras',
        'palavras' => 'Palavras',
        'sons' => 'Sons',
        'timidez' => 'Demonstra timidez ao se expressar',
        'descreve_gravuras' => 'Descreve gravuras',
        'ecolalia' => 'Ecolalia',
        'clareza' => 'Expressa-se com clareza',
        'rapido' => 'Expressa-se muito rápido',
        'som_final' => 'Expressa-se pelo som final das palavras',
        'frases_completas' => 'Frases completas',
        'frases_curtas' => 'Frases curtas',
        'gagueira' => 'Gagueira',
        'lentidao' => 'Lentidão na fala',
        'nomeia_objetos' => 'Nomeia objetos',
        'omite_fonemas' => 'Omite fonemas',
        'troca_fonemas' => 'Troca fonemas',
        'distorce_fonemas' => 'Distorce fonemas',
        'conversa_espontanea' => 'Conversa espontaneamente',
        'reconta_historias' => 'Reconta histórias',
        'repete_adultos' => 'Repete a fala dos adultos',
        'entende_proposto' => 'Demonstra entender o que é proposto',
        'voz_baixa' => 'Tom de voz baixo',
        'voz_alta' => 'Tom de voz alto',
    ];
    $count = 0;
    foreach ($opcoes_expressao as $key => $label) {
        $html .= "<span class='checkbox " . (in_array($key, $expressa) ? 'checked' : '') . "'></span> $label ";
        $count++;
        if ($count % 2 == 0) $html .= "<br>";
    }
    $html .= "</div>";
    
    // 5. Escrita
    $escrita = explode(',', $pdi['escrita_nivel'] ?? '');
    $html .= "<div class='field page-break' style='margin-top: 8px;'><span class='label'>5. Escrita:</span><br>";
    $opcoes_escrita = [
        'garatujas' => 'Garatujas',
        'pre_silabica' => 'Escrita pré-silábica',
        'silabica' => 'Escrita silábica',
        'silabica_alfabetica' => 'Escrita silábica-alfabética',
        'alfabetica' => 'Escrita alfabética',
        'diferencia_desenho' => 'Diferencia desenho da escrita e dos números',
        'identifica_rotulos' => 'Identifica rótulos',
        'conhece_algumas_letras' => 'Conhece algumas letras',
        'conhece_todas_letras' => 'Conhece todas as letras',
        'identifica_letras_iguais' => 'Identifica letras iguais',
        'letra_inicial_nome' => 'Reconhece a letra inicial do seu nome',
        'reconhece_nome_frases' => 'Reconhece seu nome em frases',
        'nome_pais_colegas' => 'Reconhece o nome dos pais e colegas',
        'escreve_nomes' => 'Escreve nome de familiares e amigos',
        'relaciona_partes_nomes' => 'Observa e relaciona parte dos nomes',
        'forma_palavras' => 'Procura formar palavras e tenta ler',
        'escreve_frases' => 'Escreve frases',
        'escreve_textos' => 'Escreve textos',
        'letra_cursiva' => 'Letra cursiva',
        'letra_impressa' => 'Letra impressa',
        'letra_legivel' => 'Letra legível',
        'relaciona_letras' => 'Relaciona letras de vários tipos e tamanhos',
        'sentido_texto' => 'Tenta atribuir um sentido num texto por meio de pistas',
        'escreve_com_apoio' => 'Escreve com apoio/adaptação',
        'recusa_escrever' => 'Recusa escrever dizendo que não sabe',
    ];
    $count = 0;
    foreach ($opcoes_escrita as $key => $label) {
        $html .= "<span class='checkbox " . (in_array($key, $escrita) ? 'checked' : '') . "'></span> $label ";
        $count++;
        if ($count % 2 == 0) $html .= "<br>";
    }
    $html .= "</div>";
    
    // 6. Leitura
    $leitura = explode(',', $pdi['leitura_nivel'] ?? '');
    $html .= "<div class='field' style='margin-top: 8px;'><span class='label'>6. Leitura:</span><br>";
    $opcoes_leitura = [
        'le_palavras' => 'Lê palavras',
        'le_frases' => 'Lê frases',
        'le_textos' => 'Lê textos',
        'leitura_global' => 'Leitura global (compreensão, inferência, comparação)',
        'leitura_fonetica' => 'Leitura fonética (silabada) com dificuldade no entendimento',
        'imita_leitura' => 'É capaz de imitar a leitura a partir de um texto conhecido oralmente',
        'nao' => 'Não',
    ];
    foreach ($opcoes_leitura as $key => $label) {
        $html .= "<span class='checkbox " . (in_array($key, $leitura) ? 'checked' : '') . "'></span> $label<br>";
    }
    $html .= "</div>";
    
    return $html;
}

/**
 * Seção de Planejamento Bimestral (COMPLEXA)
 * Gera tabelas dinâmicas para cada disciplina e bimestre
 */
function getPlanejamentoBimestralSection($planejamento, $pdi) {
    $html = "";
    
    $html .= "<p><strong>ESTUDANTE:</strong> " . htmlspecialchars($pdi['nome_aluno'] ?? '') . " &nbsp;&nbsp; <strong>TURMA:</strong> " . htmlspecialchars($pdi['ano_escolaridade'] ?? '') . "</p>";
    
    // Disciplinas padrão (podem variar conforme ano)
    $disciplinas = $planejamento['disciplinas'] ?? [];
    
    // Se não houver disciplinas no JSON, criar estrutura básica
    if (empty($disciplinas)) {
        $disciplinas_padrao = ['ARTE', 'LÍNGUA PORTUGUESA', 'MATEMÁTICA', 'CIÊNCIAS', 'HISTÓRIA', 'GEOGRAFIA', 'EDUCAÇÃO FÍSICA'];
        foreach ($disciplinas_padrao as $disc) {
            $disciplinas[$disc] = ['bimestres' => []];
        }
    }
    
    // Gerar tabelas de planejamento por disciplina
    foreach ($disciplinas as $nome_disciplina => $dados_disciplina) {
        for ($bimestre = 1; $bimestre <= 4; $bimestre++) {
            $dados_bim = $dados_disciplina['bimestres'][$bimestre] ?? [];
            
            $html .= "<div class='section' style='margin-top: 15px;'>";
            $html .= "<h3>DISCIPLINA: " . htmlspecialchars($nome_disciplina) . " &nbsp;&nbsp; PROFESSOR(A): " . htmlspecialchars($dados_bim['professor'] ?? '') . "</h3>";
            $html .= "<p><strong>BIMESTRE:</strong> ";
            for ($i = 1; $i <= 4; $i++) {
                $html .= "<span class='checkbox " . ($i == $bimestre ? 'checked' : '') . "'></span> {$i}º ";
            }
            $html .= "</p>";
            
            $html .= "<div class='field'><span class='label'>Objetivo geral da disciplina para a turma:</span><br>";
            $html .= "<span class='value'>" . nl2br(htmlspecialchars($dados_bim['objetivo_turma'] ?? '')) . "</span></div>";
            
            $html .= "<div class='field'><span class='label'>Objetivo geral da disciplina para o(a) estudante:</span><br>";
            $html .= "<span class='value'>" . nl2br(htmlspecialchars($dados_bim['objetivo_estudante'] ?? '')) . "</span></div>";
            
            // Tabela de conteúdos/habilidades
            $html .= "<table style='margin-top: 8px;'>";
            $html .= "<tr>";
            $html .= "<th style='width: 25%'>Qual o conteúdo será trabalhado?</th>";
            $html .= "<th style='width: 25%'>Qual a habilidade a ser construída/desenvolvida?</th>";
            $html .= "<th style='width: 25%'>Metodologia e materiais</th>";
            $html .= "<th style='width: 25%'>Habilidade/aprendizado adquirida</th>";
            $html .= "</tr>";
            
            $conteudos = $dados_bim['conteudos'] ?? [[]];
            foreach ($conteudos as $conteudo) {
                $html .= "<tr>";
                $html .= "<td>" . nl2br(htmlspecialchars($conteudo['conteudo'] ?? '')) . "</td>";
                $html .= "<td>" . nl2br(htmlspecialchars($conteudo['habilidade'] ?? '')) . "</td>";
                $html .= "<td>" . nl2br(htmlspecialchars($conteudo['metodologia'] ?? '')) . "</td>";
                $html .= "<td>" . nl2br(htmlspecialchars($conteudo['aprendizado'] ?? '')) . "</td>";
                $html .= "</tr>";
            }
            
            $html .= "</table>";
            $html .= "</div>";
        }
        
        // Quebra de página após cada disciplina
        $html .= "<div class='page-break'></div>";
    }
    
    // Tabelas de Avaliação Bimestral
    $html .= "<h3 style='margin-top: 20px;'>AVALIAÇÕES BIMESTRAIS</h3>";
    $html .= getAvaliacoesBimestraisTable($planejamento);
    
    return $html;
}

/**
 * Tabela de Avaliações Bimestrais (4 bimestres × disciplinas)
 */
function getAvaliacoesBimestraisTable($planejamento) {
    $html = "";
    
    $disciplinas_avaliacao = [
        'ARTE', 'LÍNGUA PORTUGUESA', 'GEOGRAFIA', 'HISTÓRIA', 
        'EDUCAÇÃO FÍSICA', 'MATEMÁTICA', 'BIOLOGIA OU CIÊNCIAS',
        'FÍSICA', 'QUÍMICA', 'SOCIOLOGIA', 'ENSINO RELIGIOSO',
        'ITINERÁRIOS FORMATIVOS P.VIDA', 'ITINERÁRIOS FORMATIVOS',
    ];
    
    for ($bimestre = 1; $bimestre <= 4; $bimestre++) {
        $html .= "<h4>{$bimestre}º BIMESTRE</h4>";
        $html .= "<table>";
        $html .= "<tr>";
        $html .= "<th style='width: 20%'>Disciplina</th>";
        $html .= "<th style='width: 8%'>Valor</th>";
        $html .= "<th style='width: 8%'>Nota</th>";
        $html .= "<th style='width: 18%'>Grau de autonomia</th>";
        $html .= "<th style='width: 23%'>Metodologia de avaliação</th>";
        $html .= "<th style='width: 23%'>Diagnóstico pedagógico</th>";
        $html .= "</tr>";
        
        foreach ($disciplinas_avaliacao as $disciplina) {
            $aval = $planejamento['avaliacoes'][$bimestre][$disciplina] ?? [];
            
            $html .= "<tr>";
            $html .= "<td>" . $disciplina . "</td>";
            $html .= "<td style='text-align: center'>" . ($aval['valor'] ?? '') . "</td>";
            $html .= "<td style='text-align: center'>" . ($aval['nota'] ?? '') . "</td>";
            $html .= "<td style='font-size: 7pt'>";
            $html .= "<span class='checkbox " . (($aval['autonomia'] ?? '') == 'muito_suporte' ? 'checked' : '') . "'></span> muito suporte<br>";
            $html .= "<span class='checkbox " . (($aval['autonomia'] ?? '') == 'alta_compreensao' ? 'checked' : '') . "'></span> alta compreensão<br>";
            $html .= "<span class='checkbox " . (($aval['autonomia'] ?? '') == 'pouco_suporte' ? 'checked' : '') . "'></span> pouco suporte<br>";
            $html .= "<span class='checkbox " . (($aval['autonomia'] ?? '') == 'pouca_compreensao' ? 'checked' : '') . "'></span> pouca compreensão";
            $html .= "</td>";
            $html .= "<td style='font-size: 8pt'>" . nl2br(htmlspecialchars($aval['metodologia'] ?? '')) . "</td>";
            $html .= "<td style='font-size: 8pt'>" . nl2br(htmlspecialchars($aval['diagnostico'] ?? '')) . "</td>";
            $html .= "</tr>";
        }
        
        $html .= "</table>";
        
        // Quebra de página após cada bimestre (exceto o último)
        if ($bimestre < 4) {
            $html .= "<div class='page-break'></div>";
        }
    }
    
    return $html;
}
