<?php
require_once __DIR__ . '/functions.php';

$pdo = db();
$stmt = $pdo->prepare('SELECT id, name, email, role FROM users WHERE email = ?');
$stmt->execute(['professor@teste.com']);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo "✅ Usuário encontrado:\n";
    echo "   ID: {$user['id']}\n";
    echo "   Nome: {$user['name']}\n";
    echo "   Email: {$user['email']}\n";
    echo "   Role: {$user['role']}\n\n";
    
    $stmt2 = $pdo->prepare('SELECT COUNT(*) as total FROM students WHERE created_by_teacher_id = ?');
    $stmt2->execute([$user['id']]);
    $count = $stmt2->fetchColumn();
    echo "👨‍🎓 Alunos vinculados: $count\n";
} else {
    echo "❌ Usuário não encontrado!\n";
}
