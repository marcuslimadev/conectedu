<?php
require_once __DIR__ . '/backend/functions.php';

$pdo = db();

echo "=== VERIFICANDO PROFESSOR teste@teste.com ===\n\n";

// Busca o professor
$stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE email = 'professor@teste.com'");
$prof = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$prof) {
    echo "❌ Professor não encontrado!\n";
    echo "Criando professor de teste...\n\n";
    
    $password = password_hash('senha123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
    $stmt->execute(['Professor Teste', 'professor@teste.com', $password, 'professor']);
    
    $prof_id = $pdo->lastInsertId();
    $prof = ['id' => $prof_id, 'name' => 'Professor Teste', 'email' => 'professor@teste.com', 'role' => 'professor'];
    
    echo "✅ Professor criado: ID {$prof_id}\n\n";
} else {
    echo "✅ Professor encontrado:\n";
    echo "   Nome: {$prof['name']}\n";
    echo "   Email: {$prof['email']}\n";
    echo "   ID: {$prof['id']}\n\n";
}

// Verifica alunos vinculados
$stmt2 = $pdo->prepare("SELECT COUNT(*) FROM students WHERE created_by_teacher_id = ?");
$stmt2->execute([$prof['id']]);
$count = $stmt2->fetchColumn();

echo "📚 Alunos vinculados: $count\n\n";

if ($count == 0) {
    echo "⚠️ Nenhum aluno vinculado! Vinculando alunos...\n\n";
    
    // Verifica quantos alunos existem
    $total_alunos = $pdo->query("SELECT COUNT(*) FROM students")->fetchColumn();
    echo "   Total de alunos no banco: $total_alunos\n";
    
    if ($total_alunos == 0) {
        echo "   ❌ Não há alunos no banco! Execute o script de criar dados de teste.\n";
    } else {
        // Vincula até 10 alunos ao professor
        $stmt3 = $pdo->prepare("UPDATE students SET created_by_teacher_id = ? WHERE created_by_teacher_id IS NULL OR created_by_teacher_id = 0 LIMIT 10");
        $stmt3->execute([$prof['id']]);
        $updated = $stmt3->rowCount();
        
        echo "   ✅ $updated alunos vinculados ao professor!\n\n";
        
        // Lista os alunos vinculados
        $stmt4 = $pdo->prepare("SELECT id, name, status FROM students WHERE created_by_teacher_id = ?");
        $stmt4->execute([$prof['id']]);
        $alunos = $stmt4->fetchAll(PDO::FETCH_ASSOC);
        
        echo "   📋 Alunos vinculados:\n";
        foreach ($alunos as $i => $aluno) {
            echo "   " . ($i + 1) . ". {$aluno['name']} (ID: {$aluno['id']}, Status: {$aluno['status']})\n";
        }
    }
} else {
    echo "✅ Alunos já vinculados!\n\n";
    
    // Lista os alunos
    $stmt4 = $pdo->prepare("SELECT id, name, status, school_id FROM students WHERE created_by_teacher_id = ? LIMIT 10");
    $stmt4->execute([$prof['id']]);
    $alunos = $stmt4->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 Primeiros 10 alunos:\n";
    foreach ($alunos as $i => $aluno) {
        echo ($i + 1) . ". {$aluno['name']} (ID: {$aluno['id']}, Status: {$aluno['status']}, School: {$aluno['school_id']})\n";
    }
}

echo "\n=== FIM ===\n";
