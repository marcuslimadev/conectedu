<?php
/**
 * Gerador de PDF - Plano de Atendimento Individual (PAI)
 * 
 * Template baseado 100% no modelo oficial do PAI
 * Gera documento profissional com 7 seções + assinaturas
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

// Validar ID do PAI
if (!isset($_GET['id']) || !is_numeric($_GET['id'])) {
    res(false, null, 'ID do PAI inválido', 400);
}

$pai_id = intval($_GET['id']);

// Buscar PAI com dados do aluno
$sql = "SELECT p.*, s.name as student_name, s.photo_url 
        FROM planos_atendimento p
        LEFT JOIN students s ON p.student_id = s.id
        WHERE p.id = :id";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':id', $pai_id, PDO::PARAM_INT);
$stmt->execute();
$pai = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$pai) {
    res(false, null, 'PAI não encontrado', 404);
}

// Validar permissões (teacher-centric)
if ($user['role'] !== 'admin' && $pai['teacher_id'] != $user['id']) {
    res(false, null, 'Sem permissão para gerar este PDF', 403);
}

// Preparar dados para o template
$data = [
    'pai' => $pai,
    'photo_path' => $pai['photo_url'] ? __DIR__ . '/uploads/students/' . basename($pai['photo_url']) : null
];

// Gerar HTML do template
$html = getPAITemplate($data);

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
$filename = 'PAI_' . preg_replace('/[^a-zA-Z0-9]/', '_', $pai['nome_aluno']) . '_' . date('Ymd_His') . '.pdf';
$filepath = __DIR__ . '/uploads/documentos/pais/' . $filename;

// Salvar arquivo
$mpdf->Output($filepath, Destination::FILE);

// Calcular tamanho do arquivo
$filesize = filesize($filepath);

// Registrar documento na tabela documentos_gerados
$sql_insert = "INSERT INTO documentos_gerados 
               (tipo, form_id, student_id, teacher_id, file_path, file_name, file_size, titulo)
               VALUES (:tipo, :form_id, :student_id, :teacher_id, :file_path, :file_name, :file_size, :titulo)";

$stmt_insert = $pdo->prepare($sql_insert);
$stmt_insert->execute([
    ':tipo' => 'pai',
    ':form_id' => $pai_id,
    ':student_id' => $pai['student_id'],
    ':teacher_id' => $user['id'],
    ':file_path' => $filepath,
    ':file_name' => $filename,
    ':file_size' => $filesize,
    ':titulo' => 'PAI - ' . $pai['nome_aluno']
]);

// Retornar PDF como download
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . $filesize);
readfile($filepath);

exit;

/**
 * Template HTML do PAI
 * Estrutura com 7 seções principais + assinaturas
 */
function getPAITemplate($data) {
    $pai = $data['pai'];
    $photo_path = $data['photo_path'];
    
    // CSS inline para mPDF
    $css = "
    <style>
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        h1 { font-size: 14pt; text-align: center; font-weight: bold; margin-bottom: 5px; }
        h2 { font-size: 11pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px; background: #f0f0f0; padding: 5px; }
        h3 { font-size: 10pt; font-weight: bold; margin-top: 10px; margin-bottom: 5px; }
        .section { margin-bottom: 15px; }
        .field { margin-bottom: 5px; }
        .label { font-weight: bold; display: inline; }
        .value { display: inline; }
        .text-block { margin-top: 5px; padding: 8px; background: #f9f9f9; border: 1px solid #ddd; min-height: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 8px; font-size: 9pt; }
        table th { background: #e0e0e0; padding: 4px; border: 1px solid #000; font-weight: bold; text-align: left; }
        table td { padding: 6px; border: 1px solid #000; vertical-align: top; }
        .checkbox { display: inline-block; width: 12px; height: 12px; border: 1px solid #000; margin-right: 3px; text-align: center; line-height: 12px; font-size: 8pt; }
        .checkbox.checked::after { content: 'X'; }
        .photo { width: 80px; height: 100px; border: 1px solid #000; float: right; margin-left: 10px; }
        .signature-area { margin-top: 40px; }
        .signature-line { border-top: 1px solid #000; width: 350px; margin-top: 50px; margin-bottom: 5px; }
        .signature-label { font-size: 9pt; font-weight: bold; }
        .page-break { page-break-after: always; }
        .two-columns { display: inline-block; width: 48%; vertical-align: top; }
    </style>
    ";
    
    // Início do HTML
    $html = $css;
    
    // Cabeçalho
    $html .= "<h1>Plano de Atendimento Individual (PAI)</h1>";
    
    // Foto do aluno (se existir)
    if ($photo_path && file_exists($photo_path)) {
        $html .= "<img src='" . $photo_path . "' class='photo' />";
    }
    
    // SEÇÃO 1 - IDENTIFICAÇÃO DO ALUNO E DA EQUIPE
    $html .= "<div class='section'>";
    $html .= "<h2>1. Identificação do Aluno e da Equipe</h2>";
    
    $html .= "<div class='field'><span class='label'>Nome da Escola:</span> <span class='value'>" . htmlspecialchars($pai['nome_escola'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Nome do Estudante:</span> <span class='value'>" . htmlspecialchars($pai['nome_aluno'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Data de Nascimento:</span> <span class='value'>" . ($pai['data_nascimento'] ? date('d/m/Y', strtotime($pai['data_nascimento'])) : '') . "</span> <span class='label'>Idade:</span> <span class='value'>" . ($pai['idade'] ?? '') . "</span></div>";
    
    // Tabela de informações do aluno
    $html .= "<table style='margin-top: 10px;'>";
    $html .= "<tr>";
    $html .= "<td style='width: 25%'><strong>Série/Ano:</strong><br>" . htmlspecialchars($pai['serie_ano'] ?? '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Turno:</strong><br>" . ucfirst($pai['turno'] ?? '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Nome do Responsável:</strong><br>" . htmlspecialchars($pai['nome_responsavel'] ?? '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Tel. para contato:</strong><br>" . htmlspecialchars($pai['telefone_contato'] ?? '') . "</td>";
    $html .= "</tr>";
    $html .= "</table>";
    
    $html .= "<div class='field'><span class='label'>Endereço Residencial do Estudante:</span><br><span class='value'>" . htmlspecialchars($pai['endereco_residencial'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Diagnóstico/Caracterização da Necessidade Educacional Especial (PAEE): Citar o CID:</span><br><span class='value'>" . htmlspecialchars($pai['diagnostico_cid'] ?? '') . "</span></div>";
    
    $html .= "<div class='field' style='margin-top: 10px;'><span class='label'>Professor(a) Regente:</span> <span class='value'>" . htmlspecialchars($pai['professor_regente'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Professor(a) do Atendimento Educacional Especializado (AEE):</span> <span class='value'>" . htmlspecialchars($pai['professor_aee'] ?? '') . "</span></div>";
    $html .= "<div class='field'><span class='label'>Outros Profissionais Envolvidos:</span> (Ex: Psicólogo, Fonoaudiólogo, Terapeuta Ocupacional, Especifique a instituição e a frequência do atendimento, se houver.)<br><span class='value'>" . nl2br(htmlspecialchars($pai['outros_profissionais'] ?? '')) . "</span></div>";
    
    // Tabela de datas
    $html .= "<table style='margin-top: 10px;'>";
    $html .= "<tr>";
    $html .= "<td style='width: 25%'><strong>Data de Elaboração do PAI:</strong><br>" . ($pai['data_elaboracao'] ? date('d/m/Y', strtotime($pai['data_elaboracao'])) : '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Data da avaliação Diagnóstica:</strong><br>" . ($pai['data_avaliacao_diagnostica'] ? date('d/m/Y', strtotime($pai['data_avaliacao_diagnostica'])) : '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Período de Vigência do PAI:</strong><br>" . htmlspecialchars($pai['periodo_vigencia'] ?? '') . "</td>";
    $html .= "<td style='width: 25%'><strong>Data Prevista para Reavaliação:</strong><br>" . ($pai['data_prevista_reavaliacao'] ? date('d/m/Y', strtotime($pai['data_prevista_reavaliacao'])) : '') . "</td>";
    $html .= "</tr>";
    $html .= "</table>";
    
    $html .= "</div>";
    
    // SEÇÃO 2 - HISTÓRICO DO ESTUDANTE E CONTEXTUALIZAÇÃO
    $html .= "<div class='section'>";
    $html .= "<h2>2. Histórico do Estudante e Contextualização</h2>";
    
    $html .= "<h3>Histórico Escolar:</h3>";
    $html .= "<p class='small-text'>(Percurso educacional, adaptações anteriores, resultados e observações relevantes de anos anteriores.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['historico_escolar'] ?? '')) . "</div>";
    
    $html .= "<h3>Histórico Familiar e Social:</h3>";
    $html .= "<p class='small-text'>(Breve descrição da estrutura familiar, apoio, expectativas da família em relação ao desenvolvimento do aluno. Informações relevantes sobre o convívio social fora da escola.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['historico_familiar_social'] ?? '')) . "</div>";
    
    $html .= "<h3>Interesses e Preferências do Estudante:</h3>";
    $html .= "<p class='small-text'>(O que o aluno gosta de fazer? Quais são seus pontos fortes e motivações?)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['interesses_preferencias'] ?? '')) . "</div>";
    
    $html .= "<h3>Dificuldades (Descreva as principais dificuldades):</h3>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['dificuldades'] ?? '')) . "</div>";
    
    $html .= "<h3>Potencialidades Observadas:</h3>";
    $html .= "<p class='small-text'>(Descreva as habilidades já consolidadas pelo estudante nas diferentes áreas de desenvolvimento: acadêmica, social, comunicacional e motora.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['potencialidades_observadas'] ?? '')) . "</div>";
    
    $html .= "</div>";
    
    // SEÇÃO 3 - AVALIAÇÃO DIAGNÓSTICA E LEVANTAMENTO DE NECESSIDADES
    $html .= "<div class='section page-break'>";
    $html .= "<h2>3. Avaliação Diagnóstica e Levantamento de Necessidades</h2>";
    $html .= "<p class='small-text' style='font-style: italic;'>Esta seção é muito importante, pois detalha a situação atual do aluno e serve de base para a definição dos objetivos.</p>";
    
    // I. Habilidades de Comunicação e Linguagem
    $html .= "<h3>I. Habilidades de Comunicação e Linguagem:</h3>";
    
    $html .= "<div class='field'><span class='label'>Oralidade:</span><br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['oralidade'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Compreensão:</span><br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['compreensao'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Expressão verbal:</span><br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['expressao_verbal'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Clareza:</span><br>";
    $html .= "<span class='checkbox " . ($pai['clareza_frases_completas'] == 'sim' ? 'checked' : '') . "'></span> Usa frases completas? ";
    $html .= "<span class='checkbox " . ($pai['interage_verbalmente'] == 'sim' ? 'checked' : '') . "'></span> Interage verbalmente?</div>";
    
    // Tabela de habilidades de escrita/leitura
    $html .= "<table style='margin-top: 10px;'>";
    $html .= "<tr>";
    $html .= "<td style='width: 50%'>";
    $html .= "<strong>Escreve:</strong> <span class='checkbox " . ($pai['escreve'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['escreve'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "<strong>Grafia é legível:</strong> <span class='checkbox " . ($pai['grafia_legivel'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['grafia_legivel'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "<strong>Escreve certo:</strong> <span class='checkbox " . ($pai['escreve_certo'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['escreve_certo'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "<strong>Produção de textos:</strong> <span class='checkbox " . ($pai['producao_textos'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['producao_textos'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "</td>";
    $html .= "<td style='width: 50%'>";
    $html .= "<strong>Desenha:</strong> <span class='checkbox " . ($pai['desenha'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['desenha'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "<strong>Copia:</strong> <span class='checkbox " . ($pai['copia'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['copia'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "<strong>Faz garatujas:</strong> <span class='checkbox " . ($pai['faz_garatujas'] == 'sim' ? 'checked' : '') . "'></span> Sim <span class='checkbox " . ($pai['faz_garatujas'] == 'nao' ? 'checked' : '') . "'></span> Não<br>";
    $html .= "</td>";
    $html .= "</tr>";
    $html .= "</table>";
    
    $html .= "<div class='field'><span class='label'>Leitura:</span> Reconhecimento de letras/palavras, compreensão de textos, velocidade, fluência. Leitura funcional?<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['leitura_nivel'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Comunicação Não-Verbal/Alternativa:</span> (Uso de gestos, expressões faciais, Comunicação Alternativa e Ampliada – CAA, Libras, Braille. Há necessidade de uso de recursos?)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['comunicacao_nao_verbal'] ?? '')) . "</div></div>";
    
    // II. Habilidades Cognitivas e Acadêmicas
    $html .= "<h3 style='margin-top: 15px;'>II. Habilidades Cognitivas e Acadêmicas:</h3>";
    
    $html .= "<div class='field'><span class='label'>Raciocínio Lógico-Matemático:</span> (Contagem, reconhecimento de números, operações básicas, resolução de problemas, noções de grandeza, espaço, tempo.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['raciocinio_logico_matematico'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Conceitos Acadêmicos:</span> (Compreensão de conteúdos curriculares – Português, Matemática, Ciências, História, Geografia. Nível de abstração.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['conceitos_academicos'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Atenção e Concentração:</span> (Capacidade de focar em tarefas, tempo de permanência, distração.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['atencao_concentracao'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Memória:</span> (Memória de curto e longo prazo, recordação de informações.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['memoria'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Organização e Planejamento:</span> (Capacidade de organizar materiais, sequenciar tarefas, planejar ações.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['organizacao_planejamento'] ?? '')) . "</div></div>";
    
    // III. Habilidades Socioemocionais e Comportamentais
    $html .= "<h3 class='page-break' style='margin-top: 15px;'>III. Habilidades Socioemocionais e Comportamentais:</h3>";
    
    $html .= "<div class='field'><span class='label'>Interação Social:</span> (Como o aluno se relaciona com colegas e adultos? Participação em atividades em grupo, iniciação de contato.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['interacao_social'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Autonomia e Independência:</span> (Higiene pessoal, alimentação, organização de pertences, deslocamento na escola, tomada de decisões simples.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['autonomia_independencia'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Manejo de Emoções:</span> (Expressão de sentimentos, manejo de frustrações, impulsividade.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['manejo_emocoes'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Comportamento em Sala:</span> (Seguir regras, aceitar limites, respeito, persistência em tarefas.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['comportamento_sala'] ?? '')) . "</div></div>";
    
    // IV. Habilidades Motoras e Perceptivas
    $html .= "<h3 style='margin-top: 15px;'>IV. Habilidades Motoras e Perceptivas:</h3>";
    
    $html .= "<div class='field'><span class='label'>Coordenação Motora Fina:</span> (Escrita, recorte, manuseio de objetos pequenos.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['coordenacao_motora_fina'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Coordenação Motora Grossa:</span> (Equilíbrio, locomoção, pular, correr.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['coordenacao_motora_grossa'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Orientação Espacial e Temporal:</span> (Noção de direita/esquerda, antes/depois, hoje/ontem, dias da semana, meses.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['orientacao_espacial_temporal'] ?? '')) . "</div></div>";
    
    $html .= "<div class='field'><span class='label'>Percepção Visual e Auditiva:</span> (Discriminação de sons, imagens, formas, cores.)<br>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['percepcao_visual_auditiva'] ?? '')) . "</div></div>";
    
    $html .= "</div>";
    
    // SEÇÃO 4 - DEFINIÇÃO DE OBJETIVOS E METAS
    $html .= "<div class='section page-break'>";
    $html .= "<h2>4. Definição de Objetivos e Metas</h2>";
    $html .= "<p class='small-text'>Com base na avaliação diagnóstica, defina os objetivos do PAI, que devem ser <strong>Específicos, Mensuráveis, Atingíveis, Relevantes e com Prazo Definido</strong>.</p>";
    
    $html .= "<h3>Objetivo Geral do PAI:</h3>";
    $html .= "<p class='small-text'>(O que se espera que o aluno alcance ao final do período de vigência do PAI?)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['objetivo_geral'] ?? '')) . "</div>";
    
    $html .= "<h3 style='margin-top: 15px;'>Objetivos Específicos:</h3>";
    $html .= "<p class='small-text'>(Divididos por áreas de desenvolvimento, separe em curto, médio e longo prazo.)</p>";
    $html .= "<p class='small-text' style='font-style: italic;'>Exemplo:<br>";
    $html .= "<strong>Área:</strong> Comunicação<br>";
    $html .= "<strong>Objetivo:</strong> O aluno será capaz de expressar suas necessidades básicas utilizando frases de 3 a 4 palavras.<br>";
    $html .= "<strong>Meta:</strong> (Ex: Em 2 meses, o aluno utilizará frases de 3 a 4 palavras em 80% das interações com o professor.)</p>";
    $html .= "<div class='text-block' style='min-height: 100px;'>" . nl2br(htmlspecialchars($pai['objetivos_especificos'] ?? '')) . "</div>";
    
    $html .= "</div>";
    
    // SEÇÃO 5 - ESTRATÉGIAS E RECURSOS PEDAGÓGICOS
    $html .= "<div class='section page-break'>";
    $html .= "<h2>5. Estratégias e Recursos Pedagógicos</h2>";
    $html .= "<p class='small-text'>Descreva as ações e suportes que serão oferecidos para que o estudante alcance os objetivos.</p>";
    
    $html .= "<h3>Adaptações Curriculares:</h3>";
    $html .= "<p class='small-text'>(Simplificação de conteúdos, flexibilização de atividades, priorização de habilidades.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['adaptacoes_curriculares'] ?? '')) . "</div>";
    
    $html .= "<h3>Recursos Didáticos e Tecnologias Assistivas:</h3>";
    $html .= "<p class='small-text'>(Materiais manipuláveis, pranchas de comunicação, softwares educativos, lupa, cadeira adaptada.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['recursos_didaticos_tecnologias'] ?? '')) . "</div>";
    
    $html .= "<h3>Estratégias de Ensino:</h3>";
    $html .= "<p class='small-text'>(Aprendizagem cooperativa, instrução direta, ensino individualizado, modelagem, uso de rotinas visuais, pareamento.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['estrategias_ensino'] ?? '')) . "</div>";
    
    $html .= "<h3>Adaptações no Ambiente Escolar:</h3>";
    $html .= "<p class='small-text'>(Organização da sala, redução de estímulos, sinalização visual, acessibilidade arquitetônica.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['adaptacoes_ambiente_escolar'] ?? '')) . "</div>";
    
    $html .= "<h3 class='page-break'>Atendimento do AEE:</h3>";
    $html .= "<p class='small-text'>(Frequência, duração, tipo de atendimento – individual/grupo, atividades específicas que serão desenvolvidas na Sala de Recursos Multifuncional.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['atendimento_aee'] ?? '')) . "</div>";
    
    $html .= "<h3>Envolvimento da Família:</h3>";
    $html .= "<p class='small-text'>(Orientações, atividades para fazer em casa, reuniões periódicas.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['envolvimento_familia'] ?? '')) . "</div>";
    
    $html .= "<h3>Articulação com Outros Profissionais:</h3>";
    $html .= "<p class='small-text'>(Troca de informações, reuniões para alinhamento de estratégias.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['articulacao_outros_profissionais'] ?? '')) . "</div>";
    
    $html .= "</div>";
    
    // SEÇÃO 6 - AVALIAÇÃO E ACOMPANHAMENTO
    $html .= "<div class='section page-break'>";
    $html .= "<h2>6. Avaliação e Acompanhamento</h2>";
    
    $html .= "<h3>Critérios de Avaliação:</h3>";
    $html .= "<p class='small-text'>(Como o progresso do aluno será medido? Observações, produções do aluno, participação, registros.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['criterios_avaliacao'] ?? '')) . "</div>";
    
    $html .= "<h3>Periodicidade das Reavaliações:</h3>";
    $html .= "<p class='small-text'>(Mensal, bimestral, semestral – para ajustar o PAI)</p>";
    $html .= "<div class='text-block'>" . ucfirst($pai['periodicidade_reavaliacoes'] ?? '') . "</div>";
    
    $html .= "<h3>Registro de Progresso:</h3>";
    $html .= "<p class='small-text'>(Como o professor vai registrar os avanços e dificuldades do aluno – portfólio, relatórios de observação, diário de bordo.)</p>";
    $html .= "<div class='text-block'>" . nl2br(htmlspecialchars($pai['registro_progresso'] ?? '')) . "</div>";
    
    $html .= "</div>";
    
    // SEÇÃO 7 - ASSINATURAS E CONSENSO
    $html .= "<div class='section signature-area' style='margin-top: 40px;'>";
    $html .= "<h2>7. Assinaturas e Consenso</h2>";
    
    $html .= "<div class='signature-line'></div>";
    $html .= "<p class='signature-label'>Professor(a) Regente: " . htmlspecialchars($pai['professor_regente'] ?? '') . "</p>";
    
    $html .= "<div class='signature-line'></div>";
    $html .= "<p class='signature-label'>Professor(a) de AEE: " . htmlspecialchars($pai['professor_aee'] ?? '') . "</p>";
    
    $html .= "<div class='signature-line'></div>";
    $html .= "<p class='signature-label'>Coordenação Pedagógica</p>";
    
    $html .= "<div class='signature-line'></div>";
    $html .= "<p class='signature-label'>Direção Escolar</p>";
    
    $html .= "<div class='signature-line'></div>";
    $html .= "<p class='signature-label'>Responsável pelo Aluno: " . htmlspecialchars($pai['nome_responsavel'] ?? '') . "</p>";
    
    $html .= "</div>";
    
    return $html;
}
