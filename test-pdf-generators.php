<?php
require __DIR__.'/backend/functions.php';

echo "🔧 Testando Geradores de PDF com Versionamento\n\n";

function run_curl_request($url) {
    // Para este teste, vamos simular a execução direta do script,
    // pois o ambiente de CLI não tem um servidor web rodando.
    // Isso evita problemas com cURL e localhost.

    // Extrai o ID da URL
    parse_str(parse_url($url, PHP_URL_QUERY), $queryParams);
    $id = $queryParams['id'] ?? 0;

    if (!$id) {
        return ['code' => 400, 'response' => 'ID não encontrado na URL'];
    }

    // Isola o nome do script
    $script_name = basename(parse_url($url, PHP_URL_PATH));
    $script_path = __DIR__ . '/backend/' . $script_name;

    if (!file_exists($script_path)) {
        return ['code' => 404, 'response' => "Script não encontrado: $script_path"];
    }

    // Prepara o ambiente para a execução do script
    $_GET['id'] = $id;

    ob_start();
    try {
        // Inclui o script, que irá gerar o PDF e dar 'exit'
        include $script_path;
        $output = ob_get_clean();

        // Se o script der 'exit', a execução aqui para.
        // Se não, podemos capturar qualquer outra saída.
        // A validação real será se o output começa com '%PDF'.
        return ['code' => 200, 'response' => $output];

    } catch (Exception $e) {
        $error = ob_get_clean();
        return ['code' => 500, 'response' => "Erro ao executar script: " . $e->getMessage() . "\nOutput: " . $error];
    }
}

// Simular usuário admin para `require_auth()`
if (!function_exists('require_auth')) {
    function require_auth() {
        return ['id' => 1, 'role' => 'admin'];
    }
}

echo "1. Conectando ao banco de dados e buscando dados de teste...\n";
$pdo = db();

// Pegar o primeiro aluno que tenha os 3 tipos de formulários
$query = "
    SELECT s.id AS student_id
    FROM students s
    WHERE
        EXISTS (SELECT 1 FROM entrevista_forms ef WHERE ef.student_id = s.id) AND
        EXISTS (SELECT 1 FROM pdi_forms pf WHERE pf.student_id = s.id) AND
        EXISTS (SELECT 1 FROM plano_atendimento_forms paf WHERE paf.student_id = s.id)
    LIMIT 1
";
$student_id = $pdo->query($query)->fetchColumn();

if (!$student_id) {
    echo "❌ Erro: Nenhum aluno de teste com os 3 formulários associados foi encontrado.\n";
    echo "   Por favor, crie dados de teste antes de rodar a verificação.\n";
    exit(1);
}

// Buscar a ÚLTIMA versão de cada formulário para este aluno
$entrevista_id = $pdo->query("SELECT id FROM entrevista_forms WHERE student_id = $student_id ORDER BY id DESC LIMIT 1")->fetchColumn();
$pdi_id = $pdo->query("SELECT id FROM pdi_forms WHERE student_id = $student_id ORDER BY id DESC LIMIT 1")->fetchColumn();
$pai_id = $pdo->query("SELECT id FROM plano_atendimento_forms WHERE student_id = $student_id ORDER BY id DESC LIMIT 1")->fetchColumn();

if (!$entrevista_id || !$pdi_id || !$pai_id) {
    echo "❌ Erro: Não foi possível encontrar a última versão de um dos formulários para o aluno ID $student_id.\n";
    exit(1);
}

echo "✅ Dados de teste encontrados:\n";
echo "   - Aluno ID: $student_id\n";
echo "   - Última Entrevista ID: $entrevista_id\n";
echo "   - Último PDI ID: $pdi_id\n";
echo "   - Último PAI ID: $pai_id\n\n";

// Test 2: Gerar PDF da Entrevista
echo "2. Testando gerador de PDF - Entrevista (ID: $entrevista_id)...\n";
$entrevistaUrl = "http://localhost/backend/generate-pdf-entrevista.php?id=$entrevista_id";
$result = run_curl_request($entrevistaUrl);

// Como o script de geração de PDF finaliza com `exit`, a resposta direta
// é o conteúdo do PDF. Se a execução continuar, algo deu errado.
if (strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de Entrevista gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de Entrevista. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 300) . "...\n";
}

// Test 3: Gerar PDF do PDI
echo "\n3. Testando gerador de PDF - PDI (ID: $pdi_id)...\n";
$pdiUrl = "http://localhost/backend/generate-pdf-pdi.php?id=$pdi_id";
$result = run_curl_request($pdiUrl);

if (strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de PDI gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PDI. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 300) . "...\n";
}

// Test 4: Gerar PDF do PAI
echo "\n4. Testando gerador de PDF - PAI (ID: $pai_id)...\n";
$paiUrl = "http://localhost/backend/generate-pdf-pai.php?id=$pai_id";
$result = run_curl_request($paiUrl);

if (strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de PAI gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PAI. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 300) . "...\n";
}

echo "\n📊 Teste concluído!\n";
