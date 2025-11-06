<?php
// Teste direto da API de students para professor

require_once __DIR__ . '/backend/functions.php';

echo "=== TESTE API STUDENTS (PROFESSOR) ===\n\n";

// Simula uma requisição autenticada de um professor
// Primeiro, vamos buscar um professor de teste

try {
    $pdo = get_db();
    
    // Busca um professor
    $stmt = $pdo->query("SELECT id, name, email, role FROM users WHERE role = 'professor' LIMIT 1");
    $professor = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$professor) {
        echo "❌ Nenhum professor encontrado no banco!\n";
        echo "Execute o script de criar dados de teste primeiro.\n";
        exit;
    }
    
    echo "✅ Professor encontrado: {$professor['name']} (ID: {$professor['id']})\n\n";
    
    // Busca alunos desse professor
    $stmt = $pdo->prepare("
        SELECT s.*, sc.name as school_name 
        FROM students s 
        LEFT JOIN schools sc ON s.school_id = sc.id 
        WHERE s.created_by_teacher_id = ?
        ORDER BY s.name ASC
    ");
    $stmt->execute([$professor['id']]);
    $alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "📚 Alunos vinculados ao professor: " . count($alunos) . "\n\n";
    
    if (count($alunos) === 0) {
        echo "❌ Nenhum aluno encontrado para este professor!\n";
        echo "Os alunos precisam ter created_by_teacher_id = {$professor['id']}\n\n";
        
        // Verifica se existem alunos sem professor
        $stmt = $pdo->query("SELECT COUNT(*) FROM students WHERE created_by_teacher_id IS NULL");
        $sem_professor = $stmt->fetchColumn();
        echo "ℹ️ Alunos sem professor no banco: $sem_professor\n\n";
        
        if ($sem_professor > 0) {
            echo "💡 Sugestão: Execute o seguinte comando para vincular alunos ao professor:\n";
            echo "UPDATE students SET created_by_teacher_id = {$professor['id']} WHERE created_by_teacher_id IS NULL LIMIT 5;\n\n";
        }
        exit;
    }
    
    // Lista os alunos
    echo "📋 LISTA DE ALUNOS:\n";
    echo str_repeat('-', 80) . "\n";
    foreach ($alunos as $i => $aluno) {
        echo ($i + 1) . ". {$aluno['name']}\n";
        echo "   Escola: {$aluno['school_name']}\n";
        echo "   Status: {$aluno['status']}\n";
        echo "   ID: {$aluno['id']}\n\n";
    }
    
    // Testa o endpoint da API
    echo "\n=== TESTANDO ENDPOINT DA API ===\n\n";
    
    // Cria um token de sessão temporário
    $token = bin2hex(random_bytes(32));
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
    
    $stmt = $pdo->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)");
    $stmt->execute([$professor['id'], $token, $expires]);
    
    echo "✅ Token de teste criado: $token\n\n";
    
    // Simula a requisição
    $_SERVER['HTTP_AUTHORIZATION'] = "Bearer $token";
    $_GET['action'] = 'students.list';
    
    // Inclui a API
    ob_start();
    include __DIR__ . '/backend/api.php';
    $response = ob_get_clean();
    
    echo "📡 Resposta da API:\n";
    echo str_repeat('-', 80) . "\n";
    
    $data = json_decode($response, true);
    if ($data && isset($data['data']['rows'])) {
        echo "✅ API retornou " . count($data['data']['rows']) . " alunos\n";
        echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n";
    } else {
        echo "❌ Erro ao decodificar resposta da API\n";
        echo $response . "\n";
    }
    
    // Limpa o token de teste
    $stmt = $pdo->prepare("DELETE FROM sessions WHERE token = ?");
    $stmt->execute([$token]);
    
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
