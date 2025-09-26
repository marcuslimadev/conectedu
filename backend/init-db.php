<?php
require __DIR__.'/functions.php';

echo "Inicializando banco de dados ConectEdu...\n";

try {
    // Garantir que o banco de dados exista
    $dbHost = env('DB_HOST','127.0.0.1');
    $dbPort = env('DB_PORT','3306');
    $dbName = env('DB_NAME','conectedu');
    $dbUser = env('DB_USER','root');
    $dbPass = env('DB_PASS','');
    $pdoRoot = new PDO('mysql:host='.$dbHost.';port='.$dbPort.';charset=utf8mb4', $dbUser, $dbPass, [PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
    $pdoRoot->exec('CREATE DATABASE IF NOT EXISTS `'.$dbName.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci');
    echo "Banco de dados verificado/criado: $dbName\n";

    $pdo = db();
    
    // Criar tabelas principais
    $tables = [
        // Usuários
        'users' => "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role ENUM('admin', 'professor', 'coordenador') DEFAULT 'professor',
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Sessões
        'sessions' => "CREATE TABLE IF NOT EXISTS sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            token VARCHAR(64) UNIQUE NOT NULL,
            user_id INT NOT NULL,
            created_at DATETIME NOT NULL,
            expires_at DATETIME NULL,
            INDEX(user_id),
            INDEX(token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Professores de apoio
        'support_teachers' => "CREATE TABLE IF NOT EXISTS support_teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            capacity INT DEFAULT 3,
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Salas de recursos multifuncionais
        'srm_rooms' => "CREATE TABLE IF NOT EXISTS srm_rooms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            capacity INT DEFAULT 12,
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Alunos
        'students' => "CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NULL,
            name VARCHAR(120) NOT NULL,
            photo_url VARCHAR(255) NULL,
            birthdate DATE NULL,
            responsible_name VARCHAR(120) NULL,
            responsible_phone VARCHAR(20) NULL,
            responsible_email VARCHAR(120) NULL,
            school VARCHAR(120) NULL,
            class VARCHAR(50) NULL,
            shift ENUM('manha', 'tarde', 'noite') NULL,
            disability_type VARCHAR(120) NULL,
            cid_code VARCHAR(20) NULL,
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            modalidade ENUM('apoio', 'srm') NOT NULL,
            support_teacher_id INT NULL,
            srm_room_id INT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(user_id),
            INDEX(support_teacher_id),
            INDEX(srm_room_id),
            INDEX(modalidade),
            INDEX(status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Cursos
        'courses' => "CREATE TABLE IF NOT EXISTS courses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(120) NOT NULL,
            code VARCHAR(40) NULL,
            description TEXT NULL,
            workload INT NULL,
            status ENUM('ativo', 'inativo') DEFAULT 'ativo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Professores associados a cursos
        'course_teachers' => "CREATE TABLE IF NOT EXISTS course_teachers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            teacher_id INT NOT NULL,
            role ENUM('principal','assistente') DEFAULT 'principal',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_ct (course_id, teacher_id),
            INDEX(course_id), INDEX(teacher_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Matrículas em cursos (alunos)
        'course_enrollments' => "CREATE TABLE IF NOT EXISTS course_enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            course_id INT NOT NULL,
            enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
            INDEX(student_id),
            INDEX(course_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Turmas
        'classes' => "CREATE TABLE IF NOT EXISTS classes (
            id INT AUTO_INCREMENT PRIMARY KEY,
            course_id INT NOT NULL,
            name VARCHAR(120) NOT NULL,
            teacher_id INT NULL,
            year INT NULL,
            semestre TINYINT NULL,
            schedule VARCHAR(200) NULL,
            status ENUM('ativo','inativo') DEFAULT 'ativo',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(course_id),
            INDEX(teacher_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Vínculo aluno-turma
        'class_enrollments' => "CREATE TABLE IF NOT EXISTS class_enrollments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            student_id INT NOT NULL,
            enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('ativo','concluido','cancelado') DEFAULT 'ativo',
            UNIQUE KEY uniq_ce (class_id, student_id),
            INDEX(class_id), INDEX(student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Planos de aula / lições
        'lessons' => "CREATE TABLE IF NOT EXISTS lessons (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            content TEXT NULL,
            resources TEXT NULL,
            date DATE NULL,
            created_by INT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(class_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Avaliações
        'assessments' => "CREATE TABLE IF NOT EXISTS assessments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            class_id INT NOT NULL,
            title VARCHAR(150) NOT NULL,
            description TEXT NULL,
            max_points INT NOT NULL DEFAULT 10,
            due_date DATETIME NULL,
            created_by INT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(class_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Entregas/Respostas
        'submissions' => "CREATE TABLE IF NOT EXISTS submissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assessment_id INT NOT NULL,
            student_id INT NOT NULL,
            content TEXT NULL,
            points INT NULL,
            feedback TEXT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            graded_at DATETIME NULL,
            UNIQUE KEY uniq_sub (assessment_id, student_id),
            INDEX(assessment_id), INDEX(student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Agenda/Eventos
        'events' => "CREATE TABLE IF NOT EXISTS events (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(200) NOT NULL,
            description TEXT NULL,
            start_datetime DATETIME NOT NULL,
            end_datetime DATETIME NULL,
            student_id INT NULL,
            user_id INT NOT NULL,
            type ENUM('atendimento', 'reuniao', 'avaliacao', 'outros') DEFAULT 'atendimento',
            status ENUM('agendado', 'realizado', 'cancelado') DEFAULT 'agendado',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(student_id),
            INDEX(user_id),
            INDEX(start_datetime)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Anamneses (Entrevistas)
        'anamneses' => "CREATE TABLE IF NOT EXISTS anamneses (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            answers JSON NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX(student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // PDIs
        'pdis' => "CREATE TABLE IF NOT EXISTS pdis (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            objectives TEXT NULL,
            strategies TEXT NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
            details JSON NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // PAIs
        'pais' => "CREATE TABLE IF NOT EXISTS pais (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            goals TEXT NULL,
            services TEXT NULL,
            start_date DATE NULL,
            end_date DATE NULL,
            status ENUM('ativo', 'concluido', 'cancelado') DEFAULT 'ativo',
            details JSON NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX(student_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Planos semanais
        'weekly_plans' => "CREATE TABLE IF NOT EXISTS weekly_plans (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            week_start DATE NOT NULL,
            objectives TEXT NULL,
            notes TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            INDEX(student_id),
            INDEX(week_start)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Itens dos planos semanais
        'weekly_plan_items' => "CREATE TABLE IF NOT EXISTS weekly_plan_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            weekly_plan_id INT NOT NULL,
            day ENUM('seg', 'ter', 'qua', 'qui', 'sex') NOT NULL,
            time_start TIME NULL,
            time_end TIME NULL,
            description TEXT NULL,
            materials TEXT NULL,
            interventions TEXT NULL,
            INDEX(weekly_plan_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",
        
        // Frequência (alinhado aos endpoints)
        'attendance' => "CREATE TABLE IF NOT EXISTS attendance (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id INT NOT NULL,
            class_id INT NULL,
            date DATE NOT NULL,
            period ENUM('manha', 'tarde', 'noite') DEFAULT 'manha',
            present TINYINT(1) DEFAULT 1,
            activities TEXT NULL,
            behavior TEXT NULL,
            achievements TEXT NULL,
            difficulties TEXT NULL,
            family_contact TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_attendance (student_id, date, period),
            INDEX(student_id), INDEX(class_id),
            INDEX(date)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Entrevistas com Responsável (AEE)
        'entrevistas_responsavel' => "CREATE TABLE IF NOT EXISTS entrevistas_responsavel (
            id INT AUTO_INCREMENT PRIMARY KEY,
            data_entrevista DATE NULL,
            tipo_entrevista VARCHAR(100) NULL,
            motivo_entrevista TEXT NULL,
            nome_estudante VARCHAR(150) NOT NULL,
            data_nascimento DATE NULL,
            naturalidade VARCHAR(120) NULL,
            nome_escola VARCHAR(150) NULL,
            serie_ano VARCHAR(50) NULL,
            turno VARCHAR(50) NULL,
            nome_pai VARCHAR(150) NULL,
            idade_pai INT NULL,
            escolaridade_pai VARCHAR(120) NULL,
            nome_mae VARCHAR(150) NULL,
            idade_mae INT NULL,
            escolaridade_mae VARCHAR(120) NULL,
            endereco VARCHAR(200) NULL,
            bairro VARCHAR(120) NULL,
            cidade VARCHAR(120) NULL,
            telefone VARCHAR(50) NULL,
            composicao_familia_concepcao TEXT NULL,
            tem_irmaos TINYINT(1) NULL,
            quantidade_irmaos INT NULL,
            idades_irmaos VARCHAR(120) NULL,
            situacao_pais VARCHAR(120) NULL,
            vida_social_familia TEXT NULL,
            habito_familiar TEXT NULL,
            beneficios_sociais TEXT NULL,
            gravidez_planejada VARCHAR(50) NULL,
            experiencia_gestacao TEXT NULL,
            saude_mae_gestacao TEXT NULL,
            estado_emocional_mae TEXT NULL,
            fez_prenatal TINYINT(1) NULL,
            mes_inicio_prenatal VARCHAR(20) NULL,
            tratamento_necessario TINYINT(1) NULL,
            qual_tratamento TEXT NULL,
            tipo_parto VARCHAR(50) NULL,
            nasceu_tempo_normal TINYINT(1) NULL,
            observacoes_nascimento TEXT NULL,
            bebe_necessitou_oxigenio TINYINT(1) NULL,
            bebe_teve_convulsao TINYINT(1) NULL,
            bebe_ictericia TINYINT(1) NULL,
            bebe_incubadora TINYINT(1) NULL,
            foi_amamentado TINYINT(1) NULL,
            amamentado_ate_idade VARCHAR(50) NULL,
            problemas_alimentacao TEXT NULL,
            alimentacao_atual TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // PDI ConectAEE (form simplificado)
        'pdi_conectaee' => "CREATE TABLE IF NOT EXISTS pdi_conectaee (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome_aluno VARCHAR(150) NOT NULL,
            data_nascimento DATE NULL,
            escola VARCHAR(150) NULL,
            ano_serie VARCHAR(50) NULL,
            professor_aee VARCHAR(150) NULL,
            periodo VARCHAR(50) NULL,
            diagnostico TEXT NULL,
            caracteristicas TEXT NULL,
            habilidades TEXT NULL,
            dificuldades TEXT NULL,
            objetivo_geral TEXT NULL,
            objetivos_especificos TEXT NULL,
            estrategias TEXT NULL,
            recursos TEXT NULL,
            tecnologia_assistiva TEXT NULL,
            criterios_avaliacao TEXT NULL,
            periodicidade_revisao VARCHAR(50) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4",

        // Planos de Atendimento Individual
        'planos_atendimento' => "CREATE TABLE IF NOT EXISTS planos_atendimento (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome_aluno VARCHAR(150) NOT NULL,
            data_nascimento DATE NULL,
            matricula VARCHAR(80) NULL,
            escola_origem VARCHAR(150) NULL,
            tipo_necessidade VARCHAR(80) NULL,
            descricao_necessidades TEXT NULL,
            objetivo_geral TEXT NULL,
            objetivos_especificos TEXT NULL,
            atividades TEXT NULL,
            metodologia TEXT NULL,
            recursos_didaticos TEXT NULL,
            frequencia_semanal VARCHAR(20) NULL,
            duracao_sessao VARCHAR(20) NULL,
            periodo_atendimento VARCHAR(30) NULL,
            horarios_especificos TEXT NULL,
            instrumentos_avaliacao TEXT NULL,
            criterios_avaliacao TEXT NULL,
            periodicidade_revisao VARCHAR(30) NULL,
            observacoes TEXT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
    ];
    
    foreach ($tables as $name => $sql) {
        echo "Criando tabela $name...\n";
        $pdo->exec($sql);
    }
    
    // Inserir dados iniciais
    echo "Inserindo dados iniciais...\n";
    
    // Usuário administrador padrão
    $adminExists = $pdo->query("SELECT COUNT(*) FROM users WHERE email = 'admin@conectedu.local'")->fetchColumn();
    if (!$adminExists) {
        $adminPassword = password_hash('admin123', PASSWORD_BCRYPT);
        $pdo->prepare("INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())")
            ->execute(['Administrador', 'admin@conectedu.local', $adminPassword, 'admin', 'ativo']);
        echo "Usuário administrador criado: admin@conectedu.local / admin123\n";
    }
    
    // Professores de apoio de exemplo
    $teacherExists = $pdo->query("SELECT COUNT(*) FROM support_teachers")->fetchColumn();
    if (!$teacherExists) {
        $teachers = [
            ['Maria Silva', 3],
            ['João Santos', 3],
            ['Ana Costa', 3]
        ];
        
        foreach ($teachers as $teacher) {
            $pdo->prepare("INSERT INTO support_teachers (name, capacity) VALUES (?, ?)")
                ->execute($teacher);
        }
        echo "Professores de apoio criados.\n";
    }
    
    // Salas de recursos de exemplo
    $roomExists = $pdo->query("SELECT COUNT(*) FROM srm_rooms")->fetchColumn();
    if (!$roomExists) {
        $rooms = [
            ['SRM - Sala 01', 12],
            ['SRM - Sala 02', 12],
            ['SRM - Sala 03', 10]
        ];
        
        foreach ($rooms as $room) {
            $pdo->prepare("INSERT INTO srm_rooms (name, capacity) VALUES (?, ?)")
                ->execute($room);
        }
        echo "Salas de recursos criadas.\n";
    }
    
    // Cursos de exemplo
    $courseExists = $pdo->query("SELECT COUNT(*) FROM courses")->fetchColumn();
    if (!$courseExists) {
        $courses = [
            ['Alfabetização Adaptada', 'ALFA001', 'Curso de alfabetização para alunos com necessidades especiais', 40],
            ['Matemática Básica', 'MAT001', 'Matemática básica adaptada', 30],
            ['Comunicação Alternativa', 'COM001', 'Desenvolvimento de comunicação alternativa', 20],
            ['Autonomia e Vida Diária', 'AVD001', 'Desenvolvimento de habilidades de vida diária', 25]
        ];
        
        foreach ($courses as $course) {
            $pdo->prepare("INSERT INTO courses (name, code, description, workload) VALUES (?, ?, ?, ?)")
                ->execute($course);
        }
        echo "Cursos de exemplo criados.\n";
    }
    
    echo "Banco de dados inicializado com sucesso!\n";
    echo "Acesse o sistema com: admin@conectedu.local / admin123\n";
    
} catch (Exception $e) {
    echo "Erro ao inicializar banco de dados: " . $e->getMessage() . "\n";
    exit(1);
}

