<?php
require 'functions.php';

$pdo = db();

// User
$stmt = $pdo->prepare('SELECT id, email, role FROM users WHERE id = 13');
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

echo "=== USER ID 13 ===\n";
echo json_encode($user, JSON_PRETTY_PRINT) . "\n\n";

// Session
$stmt = $pdo->prepare('SELECT token, user_id, created_at FROM sessions WHERE user_id = 13 ORDER BY created_at DESC LIMIT 1');
$stmt->execute();
$session = $stmt->fetch(PDO::FETCH_ASSOC);

echo "=== SESSÃO ATIVA ===\n";
echo json_encode($session, JSON_PRETTY_PRINT) . "\n\n";

// Students
$stmt = $pdo->prepare('SELECT id, name, school_name, created_by_teacher_id FROM students WHERE created_by_teacher_id = 13');
$stmt->execute();
$students = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "=== ALUNOS VINCULADOS ===\n";
echo json_encode($students, JSON_PRETTY_PRINT) . "\n";
