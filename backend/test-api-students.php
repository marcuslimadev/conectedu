<?php
require 'functions.php';

$pdo = db();

// Simula a requisição GET /students?teacher_id=13 com o token
$_SERVER['REQUEST_METHOD'] = 'GET';
$_SERVER['HTTP_AUTHORIZATION'] = 'Bearer 33c012bb1acd55da389fb4fabb77886d616820dd7892a8852402d9168e81ba43';
$_GET['teacher_id'] = 13;

echo "=== TESTE API: GET /students?teacher_id=13 ===\n\n";

// Valida token
$stmt = $pdo->prepare('SELECT u.* FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? LIMIT 1');
$stmt->execute(['33c012bb1acd55da389fb4fabb77886d616820dd7892a8852402d9168e81ba43']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo "❌ Token inválido\n";
    exit;
}

echo "✅ Usuário autenticado: {$user['email']} (ID {$user['id']})\n\n";

// Busca alunos
$stmt = $pdo->prepare('SELECT * FROM students WHERE created_by_teacher_id = ?');
$stmt->execute([13]);
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "📚 Alunos encontrados: " . count($students) . "\n\n";
echo json_encode(['ok' => true, 'data' => $students], JSON_PRETTY_PRINT) . "\n";
