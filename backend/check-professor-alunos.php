<?php
require_once __DIR__ . '/functions.php';

try {
    $pdo = db();
    
    echo "=== VERIFICANDO ALUNOS DO PROFESSOR ===\n\n";
    
    // Pegar o professor atual (assumindo ID 4 baseado no check anterior)
    $stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE role = 'professor' LIMIT 5");
    $professores = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📋 Professores cadastrados:\n";
    foreach ($professores as $prof) {
        echo "  ID: {$prof['id']} - {$prof['name']} ({$prof['email']})\n";
        
        // Buscar alunos desse professor
        $stmt2 = $pdo->prepare("SELECT id, name, status, created_by_teacher_id FROM students WHERE created_by_teacher_id = ?");
        $stmt2->execute([$prof['id']]);
        $alunos = $stmt2->fetchAll(PDO::FETCH_ASSOC);
        
        echo "    👨‍🎓 Alunos vinculados: " . count($alunos) . "\n";
        foreach ($alunos as $aluno) {
            echo "      - {$aluno['name']} (ID: {$aluno['id']}, Status: {$aluno['status']})\n";
        }
        echo "\n";
    }
    
    echo "\n📊 TOTAIS:\n";
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN created_by_teacher_id IS NOT NULL THEN 1 ELSE 0 END) as com_professor,
        SUM(CASE WHEN created_by_teacher_id IS NULL THEN 1 ELSE 0 END) as sem_professor
        FROM students");
    $totais = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "  Total de alunos: {$totais['total']}\n";
    echo "  Com professor vinculado: {$totais['com_professor']}\n";
    echo "  Sem professor vinculado: {$totais['sem_professor']}\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
}
