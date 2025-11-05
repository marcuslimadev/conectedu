<?php
require __DIR__.'/backend/functions.php';

echo "🔧 Testando Geradores de PDF ConectEDU\n\n";

// Test 1: Login e obter token
echo "1. Fazendo login...\n";
$loginData = [
    'action' => 'auth.login',
    'email' => 'admin@conectedu.local',
    'password' => 'admin123'
];

$ch = curl_init('http://localhost/conectedu/backend/api.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($loginData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$responseData = json_decode($response, true);

if (!$responseData['success']) {
    echo "❌ Erro no login: " . $responseData['message'] . "\n";
    exit(1);
}

$token = $responseData['data']['token'];
echo "✅ Login realizado com sucesso! Token: " . substr($token, 0, 10) . "...\n\n";

curl_close($ch);

// Test 2: Criar dados de teste mínimos
echo "2. Criando dados de teste...\n";

// Criar aluno de teste
$studentData = [
    'action' => 'students.create',
    'name' => 'João da Silva Teste',
    'birthdate' => '2010-05-15',
    'responsible_name' => 'Maria da Silva',
    'responsible_phone' => '(11) 99999-9999',
    'school' => 'EMEF Teste',
    'class' => '5º Ano A',
    'shift' => 'manha',
    'disability_type' => 'Autismo',
    'modalidade' => 'apoio'
];

$ch = curl_init('http://localhost/conectedu/backend/api.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($studentData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$studentResponse = json_decode($response, true);

if (!$studentResponse['success']) {
    echo "⚠️ Erro ao criar aluno (pode já existir): " . $studentResponse['message'] . "\n";
} else {
    echo "✅ Aluno de teste criado com ID: " . $studentResponse['data']['id'] . "\n";
}
curl_close($ch);

// Pegar ID do primeiro aluno disponível
$ch = curl_init('http://localhost/conectedu/backend/api.php');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['action' => 'students.list']));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$studentsResponse = json_decode($response, true);

if (!$studentsResponse['success'] || empty($studentsResponse['data'])) {
    echo "❌ Nenhum aluno encontrado para teste\n";
    exit(1);
}

$studentId = $studentsResponse['data'][0]['id'];
echo "📝 Usando aluno ID $studentId para teste\n\n";
curl_close($ch);

// Test 3: Testar gerador de PDF de Entrevista
echo "3. Testando gerador PDF - Entrevista...\n";
$entrevistaUrl = "http://localhost/conectedu/backend/generate-pdf-entrevista.php?student_id=$studentId&token=$token";
$ch = curl_init($entrevistaUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$pdfResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 && strpos($pdfResponse, '%PDF') === 0) {
    echo "✅ PDF de Entrevista gerado com sucesso! (" . strlen($pdfResponse) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de Entrevista. HTTP: $httpCode\n";
    echo "Resposta: " . substr($pdfResponse, 0, 200) . "...\n";
}

// Test 4: Testar gerador de PDF de PDI
echo "\n4. Testando gerador PDF - PDI...\n";
$pdiUrl = "http://localhost/conectedu/backend/generate-pdf-pdi.php?student_id=$studentId&token=$token";
$ch = curl_init($pdiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$pdfResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 && strpos($pdfResponse, '%PDF') === 0) {
    echo "✅ PDF de PDI gerado com sucesso! (" . strlen($pdfResponse) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PDI. HTTP: $httpCode\n";
    echo "Resposta: " . substr($pdfResponse, 0, 200) . "...\n";
}

// Test 5: Testar gerador de PDF de PAI
echo "\n5. Testando gerador PDF - PAI...\n";
$paiUrl = "http://localhost/conectedu/backend/generate-pdf-pai.php?student_id=$studentId&token=$token";
$ch = curl_init($paiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$pdfResponse = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 && strpos($pdfResponse, '%PDF') === 0) {
    echo "✅ PDF de PAI gerado com sucesso! (" . strlen($pdfResponse) . " bytes)\n";
} else {
    echo "❌ Erro ao gerar PDF de PAI. HTTP: $httpCode\n";
    echo "Resposta: " . substr($pdfResponse, 0, 200) . "...\n";
}

echo "\n📊 Teste concluído!\n";
?>