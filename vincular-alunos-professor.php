<?php
require_once __DIR__ . '/backend/functions.php';

$pdo = db();

echo "Vinculando mais alunos ao professor ID 13...\n\n";

$pdo->exec("UPDATE students SET created_by_teacher_id = 13 WHERE (created_by_teacher_id IS NULL OR created_by_teacher_id != 13) AND status = 'ativo' LIMIT 15");

$count = $pdo->query("SELECT COUNT(*) FROM students WHERE created_by_teacher_id = 13")->fetchColumn();

echo "Total de alunos vinculados: $count\n\n";

// Lista os alunos
$stmt = $pdo->query("SELECT id, name, status FROM students WHERE created_by_teacher_id = 13 ORDER BY name");
$alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo "Lista de alunos:\n";
foreach ($alunos as $i => $aluno) {
    echo ($i + 1) . ". {$aluno['name']} (ID: {$aluno['id']})\n";
}
