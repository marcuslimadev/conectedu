<?php
/**
 * Script para criar usuário admin padrão
 * Executado automaticamente no deploy
 */

require_once __DIR__ . '/functions.php';

try {
    $pdo = db();
    
    // Verificar se o admin já existe
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute(['admin@teste.com']);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
        echo "✅ Usuário admin@teste.com já existe (ID: {$exists['id']})\n";
        exit(0);
    }
    
    // Criar o usuário admin
    $passwordHash = password_hash('Teste@123', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare('
        INSERT INTO users (name, email, password, role, created_at) 
        VALUES (?, ?, ?, ?, NOW())
    ');
    
    $stmt->execute([
        'Administrador',
        'admin@teste.com',
        $passwordHash,
        'admin'
    ]);
    
    $adminId = $pdo->lastInsertId();
    
    echo "✅ Usuário admin criado com sucesso!\n";
    echo "   Email: admin@teste.com\n";
    echo "   Senha: Teste@123\n";
    echo "   ID: {$adminId}\n";
    
    exit(0);
    
} catch (Exception $e) {
    echo "❌ Erro ao criar usuário admin: " . $e->getMessage() . "\n";
    exit(1);
}
