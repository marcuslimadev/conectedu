<?php
/**
 * GERADOR DE PDF - PLANO DE DESENVOLVIMENTO INDIVIDUAL (PDI) (Refatorado)
 *
 * Gera o PDI utilizando a classe PdfGenerator e templates externos.
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
$pdi_id = $_GET['id'] ?? null;
if (!$pdi_id || !is_numeric($pdi_id)) {
    res(false, null, 'ID do PDI inválido', 400);
}

try {
    // --- Busca de Dados ---
    $sql = "SELECT p.*, s.name as student_name, s.photo_url, s.birth_date, sch.name as school_name
            FROM pdi_forms p
            LEFT JOIN students s ON p.student_id = s.id
            LEFT JOIN schools sch ON s.school_id = sch.id
            WHERE p.id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([':id' => $pdi_id]);
    $pdi = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$pdi) {
        res(false, null, 'PDI não encontrado', 404);
    }

    // --- Verificação de Permissões ---
    if ($user['role'] !== 'admin' && $pdi['created_by_teacher_id'] != $user['id']) {
        res(false, null, 'Sem permissão para gerar este PDF', 403);
    }

    $formData = json_decode($pdi['form_data'] ?? '{}', true);
    if (!is_array($formData)) {
        $formData = [];
    }

    if (empty($formData['nome_aluno']) && !empty($pdi['student_name'])) {
        $formData['nome_aluno'] = $pdi['student_name'];
    }

    if (empty($formData['nome_escola']) && !empty($pdi['school_name'])) {
        $formData['nome_escola'] = $pdi['school_name'];
    }

    $studentName = $pdi['student_name'] ?? ($formData['nome_aluno'] ?? 'Estudante');

    // --- Preparação dos Dados para o Template ---
    $data = [
        'pdi' => $formData,
        'aspectos_psicomotores' => $formData['aspectos_psicomotores'] ?? [],
        'aspectos_pedagogicos' => $formData['aspectos_pedagogicos'] ?? [],
        'planejamento_bimestral' => $formData['planejamento_bimestral'] ?? [],
        'photo_path' => !empty($pdi['photo_url']) ? __DIR__ . '/../' . $pdi['photo_url'] : null,
        // Passando as listas de itens para o template
        'psicomotores_items' => get_psicomotores_items(),
        'pedagogicos_items' => get_pedagogicos_items(),
        'main_title' => 'PLANO DE DESENVOLVIMENTO INDIVIDUAL',
        'document_date' => date('d/m/Y'),
    ];

    // --- Geração do PDF ---
    $pdfGenerator = new PdfGenerator($pdo);

    $pdfGenerator->setMetadata(
        'PDI - ' . $studentName,
        'ConectEDU - Sistema AEE',
        'Plano de Desenvolvimento Individual (PDI)',
        'AEE, PDI, Educação Especial'
    );

    // Carregar o template HTML principal
    $pdfGenerator->loadHtmlFromFile(__DIR__ . '/templates/pdi-template.php', $data);

    // --- Salvamento e Registro ---
    $uploadDir = __DIR__ . '/uploads/documentos/pdis/';
    $fileName = 'PDI_' . sanitizeFileName($studentName) . '_' . date('Y-m-d') . '.pdf';
    $filePath = $uploadDir . $fileName;
    $relativeFilePath = 'backend/uploads/documentos/pdis/' . $fileName;

    $pdfGenerator->saveToFile($filePath);

    $pdfGenerator->logDocument(
        'pdi',
        $pdi_id,
        $pdi['student_id'],
        $user['id'],
        $relativeFilePath,
        $fileName,
        'PDI - ' . $studentName . ' - ' . date('d/m/Y')
    );

    // --- Resposta ---
    $pdfGenerator->downloadFile($filePath, $fileName);

} catch (Exception $e) {
    error_log('Erro ao gerar PDF do PDI (refatorado): ' . $e->getMessage());
    res(false, null, 'Erro interno ao gerar o PDF.', 500);
}

// --- Funções Auxiliares para Itens de Tabela ---
function get_psicomotores_items() {
    return [
        'esquema_corporal' => 'Esquema corporal – Conhece as partes e funções do corpo? Nomeia as partes do corpo?',
        'consciencia_corporal' => 'Consciência corporal – Sabe do uso específico de cada membro do corpo para a realização de atividades.',
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
}

function get_pedagogicos_items() {
     return [
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
}
