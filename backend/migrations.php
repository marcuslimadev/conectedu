<?php
/**
 * Sistema de Migração Automática do Banco de Dados
 * ConectEDU - Sistema de Gestão Educacional AEE
 * 
 * Este arquivo é executado automaticamente no primeiro acesso
 * e aplica todas as correções necessárias no banco de dados.
 */

require_once __DIR__ . '/functions.php';

function log_migration($message) {
    error_log("[MIGRATION] " . $message);
}

function run_migrations() {
    try {
        $pdo = db();
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        log_migration("Iniciando verificação de migrações...");
        
        // Criar tabela de controle de migrações
        $pdo->exec("CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            migration_name VARCHAR(255) NOT NULL UNIQUE,
            executed_at DATETIME NOT NULL,
            INDEX idx_migration_name (migration_name)
        ) DEFAULT CHARSET=utf8mb4");
        
        // Lista de migrações a serem aplicadas
        $migrations = [
            'add_student_modern_fields' => function($pdo) {
                log_migration("Adicionando campos modernos na tabela students...");
                
                // Adicionar campos modernos se não existirem
                $columns_to_add = [
                    'birth_date' => "ADD COLUMN birth_date DATE NULL AFTER responsible_phone",
                    'cpf' => "ADD COLUMN cpf VARCHAR(14) NULL AFTER birth_date",
                    'rg' => "ADD COLUMN rg VARCHAR(20) NULL AFTER cpf",
                    'grade' => "ADD COLUMN grade VARCHAR(50) NULL AFTER rg",
                    'class_name' => "ADD COLUMN class_name VARCHAR(50) NULL AFTER grade",
                    'address' => "ADD COLUMN address TEXT NULL AFTER class_name",
                    'school_id' => "ADD COLUMN school_id INT DEFAULT NULL AFTER address"
                ];
                
                foreach ($columns_to_add as $column => $sql) {
                    try {
                        $check = $pdo->query("SHOW COLUMNS FROM students LIKE '$column'")->fetch();
                        if (!$check) {
                            $pdo->exec("ALTER TABLE students $sql");
                            log_migration("  ✓ Adicionada coluna: $column");
                        }
                    } catch (Exception $e) {
                        log_migration("  ⚠ Coluna $column já existe ou erro: " . $e->getMessage());
                    }
                }
                
                // Adicionar índices
                try {
                    $pdo->exec("ALTER TABLE students ADD INDEX IF NOT EXISTS idx_school_id (school_id)");
                    log_migration("  ✓ Índice idx_school_id criado");
                } catch (Exception $e) {
                    log_migration("  ⚠ Índice já existe: " . $e->getMessage());
                }
            },
            
            'fix_support_teacher_foreign_key' => function($pdo) {
                log_migration("Corrigindo foreign key de support_teacher_id...");
                
                try {
                    // Tentar remover a FK antiga (pode não existir)
                    $pdo->exec("ALTER TABLE students DROP FOREIGN KEY fk_students_support_teacher_id");
                    log_migration("  ✓ FK antiga removida");
                } catch (Exception $e) {
                    log_migration("  ℹ FK antiga não existe (OK)");
                }
                
                try {
                    // Adicionar nova FK apontando para users
                    $pdo->exec("ALTER TABLE students ADD CONSTRAINT fk_students_support_teacher_user 
                                FOREIGN KEY (support_teacher_id) REFERENCES users(id) 
                                ON DELETE SET NULL ON UPDATE CASCADE");
                    log_migration("  ✓ Nova FK criada apontando para users");
                } catch (Exception $e) {
                    log_migration("  ⚠ FK já existe: " . $e->getMessage());
                }
            },
            
            'create_schools_table' => function($pdo) {
                log_migration("Verificando tabela schools...");
                
                $pdo->exec("CREATE TABLE IF NOT EXISTS schools (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    address TEXT,
                    city VARCHAR(100),
                    phone VARCHAR(20),
                    email VARCHAR(255),
                    created_by_teacher_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_name (name),
                    INDEX idx_city (city),
                    FOREIGN KEY (created_by_teacher_id) REFERENCES users(id) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4");
                
                log_migration("  ✓ Tabela schools OK");
                
                // Adicionar FK de students para schools se não existir
                try {
                    $pdo->exec("ALTER TABLE students ADD CONSTRAINT fk_students_school_id 
                                FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL");
                    log_migration("  ✓ FK students->schools criada");
                } catch (Exception $e) {
                    log_migration("  ℹ FK students->schools já existe");
                }
            },
            
            'create_entrevistas_table' => function($pdo) {
                log_migration("Verificando tabela entrevistas_responsavel...");
                
                $pdo->exec("CREATE TABLE IF NOT EXISTS entrevistas_responsavel (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    nome_escola VARCHAR(255),
                    serie_ano VARCHAR(100),
                    turno VARCHAR(50),
                    nome_responsavel VARCHAR(255),
                    parentesco VARCHAR(100),
                    telefone VARCHAR(20),
                    email VARCHAR(255),
                    diagnostico TEXT,
                    medicamentos TEXT,
                    profissionais TEXT,
                    comportamento_casa TEXT,
                    dificuldades TEXT,
                    habilidades TEXT,
                    expectativas TEXT,
                    informacoes_adicionais TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_student_id (student_id),
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4");
                
                log_migration("  ✓ Tabela entrevistas_responsavel OK");
            },
            
            'create_student_notes_table' => function($pdo) {
                log_migration("Verificando tabela student_notes...");
                
                $pdo->exec("CREATE TABLE IF NOT EXISTS student_notes (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    student_id INT NOT NULL,
                    teacher_id INT NULL,
                    title VARCHAR(255) NULL,
                    content TEXT NOT NULL,
                    source VARCHAR(50) NULL,
                    created_at DATETIME NOT NULL,
                    updated_at DATETIME NULL,
                    INDEX idx_student_id (student_id),
                    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
                    FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
                ) DEFAULT CHARSET=utf8mb4");
                
                log_migration("  ✓ Tabela student_notes OK");
            },
            
            'create_atendimentos_table' => function($pdo) {
                log_migration("Verificando tabela atendimentos...");
                
                $pdo->exec("CREATE TABLE IF NOT EXISTS atendimentos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    aluno_id INT NOT NULL,
                    data_atendimento DATE NOT NULL,
                    horario_inicio TIME,
                    horario_fim TIME,
                    descricao TEXT,
                    objetivos TEXT,
                    atividades TEXT,
                    observacoes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_aluno_id (aluno_id),
                    INDEX idx_data (data_atendimento),
                    FOREIGN KEY (aluno_id) REFERENCES students(id) ON DELETE CASCADE
                ) DEFAULT CHARSET=utf8mb4");
                
                log_migration("  ✓ Tabela atendimentos OK");
            },
            
            'ensure_modalidade_not_null' => function($pdo) {
                log_migration("Verificando constraint de modalidade...");
                
                try {
                    // Atualizar registros NULL para 'apoio'
                    $pdo->exec("UPDATE students SET modalidade = 'apoio' WHERE modalidade IS NULL");
                    
                    // Alterar coluna para NOT NULL
                    $pdo->exec("ALTER TABLE students MODIFY COLUMN modalidade ENUM('apoio','srm') NOT NULL");
                    log_migration("  ✓ Campo modalidade agora é NOT NULL");
                } catch (Exception $e) {
                    log_migration("  ℹ Campo modalidade já está correto");
                }
            }
        ];
        
        // Executar cada migração se ainda não foi executada
        foreach ($migrations as $name => $migration) {
            $check = $pdo->prepare("SELECT id FROM migrations WHERE migration_name = ?");
            $check->execute([$name]);
            
            if (!$check->fetch()) {
                log_migration("Executando migração: $name");
                
                try {
                    $migration($pdo);
                    
                    // Registrar migração como executada
                    $stmt = $pdo->prepare("INSERT INTO migrations (migration_name, executed_at) VALUES (?, NOW())");
                    $stmt->execute([$name]);
                    
                    log_migration("✓ Migração $name concluída com sucesso");
                } catch (Exception $e) {
                    log_migration("✗ Erro na migração $name: " . $e->getMessage());
                    // Continua com as outras migrações
                }
            } else {
                log_migration("⊘ Migração $name já foi executada");
            }
        }
        
        log_migration("Todas as migrações foram verificadas!");
        return ['success' => true, 'message' => 'Banco de dados atualizado com sucesso'];
        
    } catch (Exception $e) {
        log_migration("ERRO CRÍTICO: " . $e->getMessage());
        return ['success' => false, 'message' => 'Erro ao executar migrações: ' . $e->getMessage()];
    }
}

// Se for chamado diretamente, executar migrações
if (php_sapi_name() === 'cli' || (isset($_GET['run']) && $_GET['run'] === 'migrations')) {
    header('Content-Type: application/json');
    $result = run_migrations();
    echo json_encode($result);
    exit;
}
