<?php
require __DIR__.'/backend/functions.php';

// Fazer login
$pdo = db();
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = 'admin@conectedu.local'");
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify('admin123', $user['password_hash'])) {
    echo "Erro no login\n";
    exit(1);
}

// Criar sessão
$token = token();
$stmt = $pdo->prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))");
$stmt->execute([$token, $user['id']]);

echo "Token gerado: $token\n";

// Testar PAI PDF
$paiId = 1;
$url = "http://localhost/conectedu/backend/generate-pdf-pai.php?id=$paiId&token=$token";
echo "\nTeste PAI PDF:\n$url\n\n";

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode == 200 && strpos($response, '%PDF') === 0) {
    $pdfPath = __DIR__ . '/test-pai-output.pdf';
    file_put_contents($pdfPath, $response);
    echo "✅ PDF PAI gerado com sucesso! Salvo em: $pdfPath\n";
    echo "Tamanho: " . number_format(strlen($response)) . " bytes\n";
} else {
    echo "❌ Erro ao gerar PDF PAI. HTTP: $httpCode\n";
    echo "Resposta: " . substr($response, 0, 500) . "\n";
}
?>