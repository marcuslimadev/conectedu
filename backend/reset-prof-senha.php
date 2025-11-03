<?php
require_once __DIR__ . '/functions.php';

$hash = password_hash('123456', PASSWORD_DEFAULT);
$stmt = $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = 4');
$stmt->execute([$hash]);
echo "Senha do professor id=4 atualizada para '123456'\n";
echo "Hash: $hash\n";

// Verificar
$check = $pdo->query('SELECT password_hash FROM users WHERE id = 4')->fetch(PDO::FETCH_ASSOC);
echo "Hash no banco: {$check['password_hash']}\n";
