<?php
// Script para criar/resetar senha de usuário de teste
$host = 'localhost';
$db = 'conectedu';
$user = 'root';
$pass = '';

$pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Hash da senha "123456"
$hash = password_hash('123456', PASSWORD_DEFAULT);
echo "Hash gerado: $hash\n";

// Atualizar professor id=4
$stmt = $pdo->prepare('UPDATE users SET password_hash = :hash WHERE id = 4');
$stmt->execute([':hash' => $hash]);
echo "✅ Senha do professor id=4 atualizada!\n";

// Verificar
$check = $pdo->query('SELECT id, email, password_hash FROM users WHERE id = 4')->fetch(PDO::FETCH_ASSOC);
echo "Email: {$check['email']}\n";
echo "Hash salvo: {$check['password_hash']}\n";

// Testar password_verify
$works = password_verify('123456', $check['password_hash']);
echo "password_verify('123456'): " . ($works ? '✅ SIM' : '❌ NÃO') . "\n";
