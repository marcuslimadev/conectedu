<?php
require __DIR__.'/backend/functions.php';

echo "🔧 Testando Geradores de PDF ConectEDU (Versão Refatorada)\n\n";

function run_curl_request($url, $token) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token
    ]);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    return ['code' => $httpCode, 'response' => $response];
}

// Test 1: Login e obter token
echo "1. Fazendo login...\n";
// O login nao e necessario pois o require_auth() pega o usuario do contexto
// Assumindo que o usuario admin esta logado para o teste.
// Em um cenario real, o login seria necessario.
$user = ['id' => 1, 'role' => 'admin']; // Mock user for testing
$token = 'dummy-token-for-testing'; // O token nao e realmente usado, mas a logica espera um
echo "✅ Usando usuário mock de administrador.\n\n";


// Pegar ID do primeiro aluno e de cada formulario
$pdo = db();
$student_id = $pdo->query("SELECT id FROM students LIMIT 1")->fetchColumn();
$entrevista_id = $pdo->query("SELECT id FROM entrevista_forms WHERE student_id = $student_id LIMIT 1")->fetchColumn();
$pdi_id = $pdo->query("SELECT id FROM pdi_forms WHERE student_id = $student_id LIMIT 1")->fetchColumn();
$pai_id = $pdo->query("SELECT id FROM pai_forms WHERE student_id = $student_id LIMIT 1")->fetchColumn();

if (!$student_id || !$entrevista_id || !$pdi_id || !$pai_id) {
    echo "❌ Erro: Dados de teste (aluno, entrevista, pdi, pai) não encontrados no banco. Execute o script de seed.\n";
    exit(1);
}

echo "📝 Usando os seguintes IDs para os testes:\n";
echo "   - Aluno ID: $student_id\n";
echo "   - Entrevista ID: $entrevista_id\n";
echo "   - PDI ID: $pdi_id\n";
echo "   - PAI ID: $pai_id\n\n";

// Test 2: Testar gerador de PDF de Entrevista
echo "2. Testando gerador PDF - Entrevista...\n";
$entrevistaUrl = "http://localhost/backend/generate-pdf-entrevista.php?id=$entrevista_id";
$result = run_curl_request($entrevistaUrl, $token);

if ($result['code'] == 200 && strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de Entrevista gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de Entrevista. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 200) . "...\n";
}

// Test 3: Testar gerador de PDF de PDI
echo "\n3. Testando gerador PDF - PDI...\n";
$pdiUrl = "http://localhost/backend/generate-pdf-pdi.php?id=$pdi_id";
$result = run_curl_request($pdiUrl, $token);

if ($result['code'] == 200 && strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de PDI gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PDI. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 200) . "...\n";
}

// Test 4: Testar gerador de PDF de PAI
echo "\n4. Testando gerador PDF - PAI...\n";
$paiUrl = "http://localhost/backend/generate-pdf-pai.php?id=$pai_id";
$result = run_curl_request($paiUrl, $token);

if ($result['code'] == 200 && strpos($result['response'], '%PDF') === 0) {
    echo "✅ PDF de PAI gerado com sucesso! (" . strlen($result['response']) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PAI. HTTP: " . $result['code'] . "\n";
    echo "   Resposta: " . substr($result['response'], 0, 200) . "...\n";
}

echo "\n📊 Teste concluído!\n";
