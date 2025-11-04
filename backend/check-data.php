<?php
/**
 * Script para verificar dados do sistema
 */
require_once __DIR__ . '/functions.php';

try {
    $pdo = db();
    
    echo "=== VERIFICAÇÃO DO BANCO DE DADOS ===\n\n";
    
    // Usuários
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM users');
    $usersCount = $stmt->fetchColumn();
    echo "👥 Usuários cadastrados: {$usersCount}\n";
    
    if ($usersCount > 0) {
        $stmt = $pdo->query('SELECT id, name, email, role FROM users LIMIT 5');
        while ($user = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "   - {$user['name']} ({$user['email']}) - Role: {$user['role']}\n";
        }
    }
    
    echo "\n";
    
    // Alunos
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM students');
    $studentsCount = $stmt->fetchColumn();
    echo "🎓 Alunos cadastrados: {$studentsCount}\n";
    
    if ($studentsCount > 0) {
        $stmt = $pdo->query('SELECT id, name, status, created_by_teacher_id FROM students LIMIT 5');
        while ($student = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "   - {$student['name']} (Status: {$student['status']}) - Professor ID: {$student['created_by_teacher_id']}\n";
        }
    }
    
    echo "\n";
    
    // Escolas
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM schools');
    $schoolsCount = $stmt->fetchColumn();
    echo "🏫 Escolas cadastradas: {$schoolsCount}\n";
    
    echo "\n";
    
    // Formulários
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM entrevista_forms');
    $entrevistasCount = $stmt->fetchColumn();
    echo "📋 Entrevistas: {$entrevistasCount}\n";
    
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM pdi_forms');
    $pdiCount = $stmt->fetchColumn();
    echo "📋 PDIs: {$pdiCount}\n";
    
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM plano_atendimento_forms');
    $paiCount = $stmt->fetchColumn();
    echo "📋 Planos de Atendimento: {$paiCount}\n";
    
    echo "\n";
    
    // Sessões ativas
    $stmt = $pdo->query('SELECT COUNT(*) as total FROM sessions WHERE expires_at > NOW() OR expires_at IS NULL');
    $sessionsCount = $stmt->fetchColumn();
    echo "🔐 Sessões ativas: {$sessionsCount}\n";
    
    echo "\n=== FIM DA VERIFICAÇÃO ===\n";
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    exit(1);
}
