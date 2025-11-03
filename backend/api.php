<?php

require __DIR__ . '/functions.php';
$pdo = db();

// Executar migrações automáticas na primeira vez
// Cria um arquivo de lock para não executar novamente
$migrationLockFile = __DIR__ . '/.migrations_completed';
if (!file_exists($migrationLockFile)) {
    require_once __DIR__ . '/migrations.php';
    $result = run_migrations();
    if ($result['success']) {
        file_put_contents($migrationLockFile, date('Y-m-d H:i:s'));
        error_log("ConectEDU: Migrações aplicadas com sucesso!");
    } else {
        error_log("ConectEDU: Erro ao aplicar migrações - " . $result['message']);
    }
}

// Sistema de roteamento REST - converte URLs REST para actions
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$scriptName = $_SERVER['SCRIPT_NAME'] ?? '';
$pathInfo = str_replace($scriptName, '', $requestUri);
$pathInfo = strtok($pathInfo, '?'); // Remove query string
$pathInfo = trim($pathInfo, '/');

// Mapeamento de rotas REST para actions
$restRoutes = [
    // Auth routes
    // Diagnóstico do sistema (não requer auth)
    'diagnose' => 'diagnose',
    'create-admin' => 'create-admin',
    
    'auth/login' => 'auth.login',
    'auth/register' => 'auth.register', 
    'auth/logout' => 'auth.logout',
    'auth/me' => 'auth.me',
    'user' => 'auth.me', // Alias para compatibilidade
    // Aliases simples
    'login' => 'auth.login',
    'logout' => 'auth.logout',
    
    // Auto-registro e notificações
    'register' => 'auth.register',
    'notifications' => 'notifications.list',
    'notifications/read' => 'notifications.read',
    
    // Dashboard routes
    'dashboard/stats' => 'stats',
    'dashboard/atividades' => 'stats',
    'stats' => 'stats',
    
    // Students routes
    'students' => 'students.list',
    'students/search' => 'students.search',
    'students/create' => 'students.create',
    'students/update' => 'students.update',
    'students/delete' => 'students.delete',
    'students/upload-photo' => 'students.upload-photo',
    'alunos' => 'students.list',
    
    // Schools routes
    'schools' => 'schools.list',
    'schools/create' => 'schools.create',
    'schools/update' => 'schools.update',
    'schools/delete' => 'schools.delete',
    'escolas' => 'schools.list',
    
    // Users routes (admin)
    'users' => 'users.list',
    'users/create' => 'users.create',
    'users/update' => 'users.update',
    'users/delete' => 'users.delete',

  // Professores (somente lista básica para selects)
  'professores' => 'professores.list',
    
    // Forms routes
    'forms/anamnese' => 'forms.anamnese.list',
    'forms/anamnese/create' => 'forms.anamnese.create',
    'forms/anamnese/pdf' => 'forms.anamnese.pdf',
    // Entrevistas com Responsável (AEE)
    'entrevistas-responsavel' => 'entrevistas-responsavel.create',
    'entrevistas-responsavel/create' => 'entrevistas-responsavel.create',
    'entrevistas-responsavel/list' => 'entrevistas-responsavel.list',
  'entrevistas-responsavel/get' => 'entrevistas-responsavel.get',
  'entrevistas-responsavel/update' => 'entrevistas-responsavel.update',
    
    // PDI routes
    'pdi' => 'pdi.list',
    'pdi/create' => 'pdi.create',
  'pdi/update' => 'pdi.update',
    'pdi/pdf' => 'pdi.pdf',
    // PDI ConectAEE simplificado
    'pdi-conectaee' => 'pdi-conectaee.create',
    'pdi-conectaee/create' => 'pdi-conectaee.create',
    'pdi-conectaee/list' => 'pdi-conectaee.list',
    
    // PAI routes
    'pai' => 'pai.list',
    'pai/create' => 'pai.create',
  'pai/update' => 'pai.update',
    'pai/pdf' => 'pai.pdf',
    // Planos de Atendimento Individual (formulário separado)
    'planos-atendimento' => 'planos-atendimento.create',
    'planos-atendimento/create' => 'planos-atendimento.create',
    'planos-atendimento/list' => 'planos-atendimento.list',
    'planos-atendimento/update' => 'planos-atendimento.update',
    'plano-atendimento/create' => 'plano-atendimento.create',
    'plano-atendimento/list' => 'plano-atendimento.list',
    'plano-atendimento/update' => 'plano-atendimento.update',
    
    // Plans routes
    'plans' => 'plans.list',
    'plans/create' => 'plans.create',

    // Courses routes
    'courses' => 'courses.list',
    'courses/create' => 'courses.create',
    'courses/update' => 'courses.update',
    'courses/delete' => 'courses.delete',

    // Course relations
    'courses/enroll' => 'courses.enroll',
    'courses/unenroll' => 'courses.unenroll',
    'courses/teachers/assign' => 'courses.teachers.assign',
    'courses/teachers/remove' => 'courses.teachers.remove',
    'courses/teachers' => 'courses.teachers.list',

    // Agenda routes
    'agenda' => 'agenda.list',
    'agenda/create' => 'agenda.create',
    'agenda/update' => 'agenda.update',
    'agenda/delete' => 'agenda.delete',
    
    // Attendance routes
    'attendance/mark' => 'attendance.mark',
    'attendance/list' => 'attendance.list',
    'attendance/class' => 'attendance.class',
    
    // Relatórios de Atendimento
    'relatorios' => 'relatorios.list',
    'relatorios/create' => 'relatorios.create',
    'relatorios/list' => 'relatorios.list',
    'relatorios/get' => 'relatorios.get',
    'relatorios/update' => 'relatorios.update',
    'relatorios/upload-audio' => 'relatorios.upload-audio',
    'relatorios/transcribe' => 'relatorios.transcribe',

    // Classes (turmas)
    'classes' => 'classes.list',
    'classes/create' => 'classes.create',
    'classes/update' => 'classes.update',
    'classes/delete' => 'classes.delete',
    'classes/enroll' => 'classes.enroll',
    'classes/unenroll' => 'classes.unenroll',
    'classes/students' => 'classes.students',

    // Lessons (planos de aula)
    'lessons' => 'lessons.list',
    'lessons/create' => 'lessons.create',
    'lessons/update' => 'lessons.update',
    'lessons/delete' => 'lessons.delete',

    // Assessments
    'assessments' => 'assessments.list',
    'assessments/create' => 'assessments.create',
    'assessments/update' => 'assessments.update',
    'assessments/delete' => 'assessments.delete',
    'assessments/submissions' => 'assessments.submissions',
    'assessments/submit' => 'assessments.submit',
    'assessments/grade' => 'assessments.grade',
    
    // Reports routes
    'reports/student' => 'reports.student',
    'reports/student/pdf' => 'reports.student.pdf',
    
  // Atendimentos routes
  // Mapeia para ação genérica e decide pelo método HTTP (GET=list, POST=create)
  'atendimentos' => 'atendimentos',
    
    // Legislações routes
    'legislacoes' => 'legislacoes.list',
    'legislacoes/upload' => 'legislacoes.upload',
    
    // Support routes
    'support-teachers' => 'support_teachers.list',
    'srm-rooms' => 'srm_rooms.list',
    
    // AI routes
    'ai/evaluate-student' => 'ai.evaluate_student',
  // Student notes routes
  'student-notes' => 'student_notes.list',
  'student-notes/create' => 'student_notes.create',
  'student-notes/update' => 'student_notes.update',
  // Voice routes
  'voice/transcribe' => 'voice.transcribe',
  'voice/tts' => 'voice.tts',
    
    // Formulários AEE Completos
    'entrevistas' => 'entrevistas.list',
    'entrevistas/list' => 'entrevistas.list',
    'entrevistas/create' => 'entrevistas.create',
    'entrevistas/get' => 'entrevistas.get',
    'entrevistas/update' => 'entrevistas.update',
    'entrevistas/delete' => 'entrevistas.delete',
    'entrevistas/student' => 'entrevistas.student',
    
    // PDI Completo
    'pdis' => 'pdis.list',
    'pdis/list' => 'pdis.list',
    'pdis/create' => 'pdis.create',
    'pdis/get' => 'pdis.get',
    'pdis/update' => 'pdis.update',
    'pdis/delete' => 'pdis.delete',
    'pdis/student' => 'pdis.student',
    
    // PAI Completo
    'pais' => 'pais.list',
    'pais/list' => 'pais.list',
    'pais/create' => 'pais.create',
    'pais/get' => 'pais.get',
    'pais/update' => 'pais.update',
    'pais/delete' => 'pais.delete',
    'pais/student' => 'pais.student',
    
    // Documentos Gerados (PDFs)
    'documentos' => 'documentos.list',
    'documentos/list' => 'documentos.list',
    'documentos/download' => 'documentos.download',
    'documentos/delete' => 'documentos.delete',
    'documentos/stats' => 'documentos.stats',
    
    // Health check & Migrations
    'health' => 'health',
    'migrations/run' => 'migrations.run'
];

// Determinar a action: primeiro tenta REST, depois query parameter
// Importante: NÃO definir 'health' como fallback aqui, para permitir que rotas dinâmicas (preg_match)
// sejam avaliadas mais abaixo. Apenas definiremos 'health' quando explicitamente solicitado.
$action = $_GET['action'] ?? null;

// Se veio via query (?action=...), propaga para $pathInfo para habilitar rotas dinâmicas (preg_match)
if (!$pathInfo && isset($_GET['action'])) {
  $pathInfo = trim($_GET['action'], '/');
}

// Quando houver action explícita (via query) que seja um alias, normaliza usando $restRoutes
if ($action && isset($restRoutes[$action])) {
  $action = $restRoutes[$action];
}

if (!$action && $pathInfo && isset($restRoutes[$pathInfo])) {
  $action = $restRoutes[$pathInfo];
}

// Rotas dinâmicas com ID: /users/123
if (!$action && $pathInfo && preg_match('#^users/(\d+)$#', $pathInfo, $matches)) {
  $action = 'users.get';
  $_GET['id'] = $matches[1];
}

$B = body();

if ($action === 'health') {
  res(true, ['time' => date('c')]);
}

// ---------- DIAGNÓSTICO: Verificar estado do sistema ----------
if ($action === 'diagnose') {
  $diagnostics = [
    'php_version' => phpversion(),
    'time' => date('c'),
    'db_connection' => false,
    'users_count' => 0,
    'admin_exists' => false,
    'migrations_table_exists' => false,
  ];
  
  try {
    $pdo = db();
    $diagnostics['db_connection'] = true;
    
    // Verificar se tabela users existe
    $result = $pdo->query("SHOW TABLES LIKE 'users'");
    if ($result->rowCount() > 0) {
      // Contar usuários
      $count = $pdo->query("SELECT COUNT(*) as total FROM users")->fetch(PDO::FETCH_ASSOC);
      $diagnostics['users_count'] = (int)$count['total'];
      
      // Verificar se admin existe
      $admin = $pdo->prepare("SELECT COUNT(*) as total FROM users WHERE email = 'admin@teste.com'");
      $admin->execute();
      $adminCount = $admin->fetch(PDO::FETCH_ASSOC);
      $diagnostics['admin_exists'] = (int)$adminCount['total'] > 0;
    }
    
    // Verificar tabela de migrações
    $result = $pdo->query("SHOW TABLES LIKE 'migrations'");
    $diagnostics['migrations_table_exists'] = $result->rowCount() > 0;
    
  } catch (Exception $e) {
    $diagnostics['error'] = $e->getMessage();
  }
  
  res(true, $diagnostics);
}

// ---------- CRIAR ADMIN: Criar usuário admin manualmente (sem autenticação) ----------
if ($action === 'create-admin') {
  try {
    $pdo = db();
    
    // Verificar se admin já existe
    $stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = ?');
    $stmt->execute(['admin@teste.com']);
    $exists = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($exists) {
      res(true, ['message' => 'Admin já existe', 'admin' => $exists]);
    }
    
    // Criar o usuário admin
    $passwordHash = password_hash('Teste@123', PASSWORD_BCRYPT);
    
    $stmt = $pdo->prepare('
      INSERT INTO users (name, email, password_hash, role, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ');
    
    $stmt->execute([
      'Administrador',
      'admin@teste.com',
      $passwordHash,
      'admin',
      'ativo'
    ]);
    
    $adminId = $pdo->lastInsertId();
    
    res(true, [
      'message' => 'Admin criado com sucesso!',
      'admin' => [
        'id' => $adminId,
        'email' => 'admin@teste.com',
        'password' => 'Teste@123'
      ]
    ]);
    
  } catch (Exception $e) {
    res(false, null, 'CREATE_ADMIN_ERROR: ' . $e->getMessage(), 500);
  }
}

// ---------- MIGRATIONS: Executar migrações manualmente ----------
if ($action === 'migrations.run') {
  $u = require_auth();
  if ($u['role'] !== 'admin') {
    res(false, null, 'ADMIN_ONLY', 403);
  }
  
  require_once __DIR__ . '/migrations.php';
  $result = run_migrations();
  
  if ($result['success']) {
    // Atualizar arquivo de lock
    $lockFile = __DIR__ . '/.migrations_completed';
    file_put_contents($lockFile, date('Y-m-d H:i:s'));
  }
  
  res($result['success'], $result, $result['message']);
}

// ---------- USER: Get current user info ----------
if ($action === 'user') {
  $u = require_auth();
  // Retornar dados do usuário logado
  res(true, $u);
}

// ---------- VOICE: Speech-to-Text (Transcrição) ----------
if ($action === 'voice.transcribe') {
  // Auth opcional (pode exigir depois):
  $u = require_auth();
  // Aceita multipart/form-data com campo 'audio'
  if (!isset($_FILES['audio']) || $_FILES['audio']['error']!==UPLOAD_ERR_OK) {
    res(false,null,'AUDIO_UPLOAD_REQUIRED',422);
  }
  $tmp=$_FILES['audio']['tmp_name'];
  $name=$_FILES['audio']['name'] ?? 'audio.wav';
  $text=openai_transcribe($tmp,$name);
  res(true,['text'=>$text]);
}

// ---------- VOICE: Text-to-Speech (TTS) ----------
if ($action === 'voice.tts') {
  $u = require_auth();
  $text=trim($B['text'] ?? '');
  $voice=trim($B['voice'] ?? 'alloy');
  $format=strtolower(trim($B['format'] ?? 'mp3'));
  if(!$text) res(false,null,'TEXT_REQUIRED',422);
  $bin=openai_tts_binary($text,$voice,$format);
  $mime = $format==='wav' ? 'audio/wav' : ($format==='ogg'?'audio/ogg':'audio/mpeg');
  header('Content-Type: '.$mime);
  header('Content-Length: '.strlen($bin));
  echo $bin; exit;
}

if ($action === 'auth.register') {
  $name = trim($B['name'] ?? '');
  $email = strtolower(trim($B['email'] ?? ''));
  $pass = $B['password'] ?? '';
  $confirm_pass = $B['confirm_password'] ?? '';
  
  if (!$name || !$email || !$pass) res(false, null, 'INVALID_INPUT', 422);
  if ($pass !== $confirm_pass) res(false, null, 'PASSWORD_MISMATCH', 422);
  
  // Validação de senha forte
  if (strlen($pass) < 8) res(false, null, 'PASSWORD_TOO_SHORT', 422);
  if (!preg_match('/[A-Z]/', $pass)) res(false, null, 'PASSWORD_NO_UPPERCASE', 422);
  if (!preg_match('/[a-z]/', $pass)) res(false, null, 'PASSWORD_NO_LOWERCASE', 422);
  if (!preg_match('/[0-9]/', $pass)) res(false, null, 'PASSWORD_NO_NUMBER', 422);
  if (!preg_match('/[^A-Za-z0-9]/', $pass)) res(false, null, 'PASSWORD_NO_SPECIAL', 422);
  
  $q = $pdo->prepare('SELECT id FROM users WHERE email=?');
  $q->execute([$email]);
  if ($q->fetch()) res(false, null, 'EMAIL_IN_USE', 409);
  
  $hash = password_hash($pass, PASSWORD_BCRYPT);
  $role = 'aluno'; // Auto-registro sempre como aluno
  $status = 'ativo'; // Status ativo imediatamente
  
  $pdo->prepare('INSERT INTO users (name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,NOW(),NOW())')->execute([$name, $email, $hash, $role, $status]);
  $uid = $pdo->lastInsertId();
  
  res(true, ['message' => 'Registro realizado com sucesso! Você já pode fazer login.']);
}
if ($action === 'auth.login') {
  $email = strtolower(trim($B['email'] ?? ''));
  $pass = $B['password'] ?? '';
  $q = $pdo->prepare('SELECT * FROM users WHERE email=? AND status="ativo"');
  $q->execute([$email]);
  $u = $q->fetch(PDO::FETCH_ASSOC);
  if (!$u || !password_verify($pass, $u['password_hash'])) res(false, null, 'INVALID_CREDENTIALS', 401);
  $t = token();
  $exp = date('Y-m-d H:i:s', time() + ((int)env('TOKEN_TTL_HOURS', 72)) * 3600);
  $pdo->prepare('INSERT INTO sessions (token,user_id,created_at,expires_at) VALUES (?,?,NOW(),?)')->execute([$t, $u['id'], $exp]);
  res(true, ['token' => $t]);
}
if ($action === 'auth.me') {
  $u = require_auth();
  unset($u['password_hash']);
  res(true, $u);
}
if ($action === 'auth.logout') {
  $t = bearer();
  if ($t) $pdo->prepare('DELETE FROM sessions WHERE token=?')->execute([$t]);
  res(true, []);
}



if ($action === 'notifications.list') {
  $u = require_auth();
  $unread_only = ($_GET['unread_only'] ?? 'false') === 'true';
  
  $sql = 'SELECT * FROM notifications WHERE 1';
  $params = [];
  
  if ($unread_only) {
    $sql .= ' AND read_at IS NULL';
  }
  
  $sql .= ' ORDER BY created_at DESC LIMIT 50';
  
  $stm = $pdo->prepare($sql);
  $stm->execute($params);
  $notifications = $stm->fetchAll(PDO::FETCH_ASSOC);
  
  // Parse JSON data
  foreach ($notifications as &$n) {
    if ($n['data']) {
      $n['data'] = json_decode($n['data'], true);
    }
  }
  
  res(true, $notifications);
}

if ($action === 'notifications.read') {
  $u = require_auth();
  $notification_id = (int)($B['notification_id'] ?? 0);
  
  if (!$notification_id) res(false, null, 'INVALID_NOTIFICATION_ID', 422);
  
  $pdo->prepare('UPDATE notifications SET read_at=NOW() WHERE id=?')
    ->execute([$notification_id]);
  
  res(true, ['message' => 'Notificação marcada como lida']);
}

if ($action === 'users.list') {
  $u = require_admin();
  $q = $_GET['q'] ?? '';
  $role = $_GET['role'] ?? '';
  $status = $_GET['status'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per = min(200, max(1, (int)($_GET['per_page'] ?? 50)));
  $sql = 'SELECT id,name,email,role,status,created_at FROM users WHERE 1';
  $p = [];
  if ($q) {
    $sql .= ' AND (name LIKE ? OR email LIKE ?)';
    $p[] = '%' . $q . '%';
    $p[] = '%' . $q . '%';
  }
  if ($role) {
    $sql .= ' AND role=?';
    $p[] = $role;
  }
  if ($status) {
    $sql .= ' AND status=?';
    $p[] = $status;
  }
  $stm = $pdo->prepare($sql . ' ORDER BY status ASC, created_at DESC LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
  $stm->execute($p);
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows, 'page' => $page, 'per_page' => $per]);
}
if ($action === 'users.get') {
  $u = require_admin();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $stmt = $pdo->prepare('SELECT id,name,email,role,status,created_at FROM users WHERE id=?');
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  res(true, ['ok' => true, 'data' => $row]);
}
if ($action === 'users.create') {
  $u = require_admin();
  $name = trim($B['name'] ?? '');
  $email = strtolower(trim($B['email'] ?? ''));
  $pass = $B['password'] ?? '';
  $role = $B['role'] ?? 'professor';
  $status = $B['status'] ?? 'ativo';
  if (!$name || !$email || !$pass) res(false, null, 'INVALID_INPUT', 422);
  $q = $pdo->prepare('SELECT id FROM users WHERE email=?');
  $q->execute([$email]);
  if ($q->fetch()) res(false, null, 'EMAIL_IN_USE', 409);
  $hash = password_hash($pass, PASSWORD_BCRYPT);
  $pdo->prepare('INSERT INTO users (name,email,password_hash,role,status,created_at,updated_at) VALUES (?,?,?,?,?,NOW(),NOW())')->execute([$name, $email, $hash, $role, $status]);
  res(true, []);
}
if ($action === 'users.update') {
  $u = require_admin();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $row = $pdo->query('SELECT * FROM users WHERE id=' . $id)->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  $name = trim($B['name'] ?? $row['name']);
  $email = strtolower(trim($B['email'] ?? $row['email']));
  $role = $B['role'] ?? $row['role'];
  $status = $B['status'] ?? $row['status'];
  if (isset($B['password']) && $B['password']) {
    $hash = password_hash($B['password'], PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET name=?,email=?,password_hash=?,role=?,status=?,updated_at=NOW() WHERE id=?')->execute([$name, $email, $hash, $role, $status, $id]);
  } else {
    $pdo->prepare('UPDATE users SET name=?,email=?,role=?,status=?,updated_at=NOW() WHERE id=?')->execute([$name, $email, $role, $status, $id]);
  }
  res(true, []);
}
if ($action === 'users.delete') {
  $u = require_admin();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $pdo->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
  res(true, []);
}

// Lista de professores (para selects) — visível a qualquer usuário autenticado
if ($action === 'professores.list') {
  $u = require_auth();
  $q = trim($_GET['q'] ?? '');
  $limit = min(200, max(1, (int)($_GET['limit'] ?? 100)));
  $sql = 'SELECT id,name FROM users WHERE role="professor" AND status="ativo"';
  $p = [];
  if ($q) { $sql .= ' AND name LIKE ?'; $p[] = '%'.$q.'%'; }
  $sql .= ' ORDER BY name ASC LIMIT ' . $limit;
  $stm = $pdo->prepare($sql);
  $stm->execute($p);
  res(true, $stm->fetchAll(PDO::FETCH_ASSOC));
}

if ($action === 'support_teachers.list') {
  $u = require_auth();
  $stm = $pdo->query('SELECT st.id,st.name,st.capacity,(SELECT COUNT(*) FROM students s WHERE s.support_teacher_id=st.id AND s.status="ativo") used FROM support_teachers st');
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, $rows);
}
if ($action === 'srm_rooms.list') {
  $u = require_auth();
  $stm = $pdo->query('SELECT r.id,r.name,r.capacity,(SELECT COUNT(*) FROM students s WHERE s.srm_room_id=r.id AND s.status="ativo") used FROM srm_rooms r');
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, $rows);
}

// -------- COURSES --------
if ($action === 'courses.list') {
  $u = require_auth();
  $pdo->exec('CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT "ativo",
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $q = trim($_GET['q'] ?? '');
  $status = trim($_GET['status'] ?? '');
  $sql = 'SELECT * FROM courses WHERE 1';
  $p = [];
  if ($q) { $sql .= ' AND name LIKE ?'; $p[] = '%'.$q.'%'; }
  if ($status) { $sql .= ' AND status=?'; $p[] = $status; }
  $sql .= ' ORDER BY id DESC LIMIT 500';
  $stm = $pdo->prepare($sql); $stm->execute($p);
  res(true, $stm->fetchAll(PDO::FETCH_ASSOC));
}
// Vincular aluno a curso
if ($action === 'courses.enroll') {
  $u = require_auth();
  $student_id = (int)($B['student_id'] ?? 0);
  $course_id = (int)($B['course_id'] ?? 0);
  if (!$student_id || !$course_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO course_enrollments (student_id,course_id) VALUES (?,?) ON DUPLICATE KEY UPDATE status="ativo"')->execute([$student_id,$course_id]);
  res(true,[]);
}
// Desvincular aluno de curso
if ($action === 'courses.unenroll') {
  $u = require_auth();
  $student_id = (int)($B['student_id'] ?? 0);
  $course_id = (int)($B['course_id'] ?? 0);
  if (!$student_id || !$course_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('DELETE FROM course_enrollments WHERE student_id=? AND course_id=?')->execute([$student_id,$course_id]);
  res(true,[]);
}
// Professores em curso
if ($action === 'courses.teachers.assign') {
  $adm = require_admin();
  $course_id = (int)($B['course_id'] ?? 0);
  $teacher_id = (int)($B['teacher_id'] ?? 0);
  $role = $B['role'] ?? 'principal';
  if (!$course_id || !$teacher_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO course_teachers (course_id,teacher_id,role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE role=VALUES(role)')->execute([$course_id,$teacher_id,$role]);
  res(true,[]);
}
if ($action === 'courses.teachers.remove') {
  $adm = require_admin();
  $course_id = (int)($B['course_id'] ?? 0);
  $teacher_id = (int)($B['teacher_id'] ?? 0);
  if (!$course_id || !$teacher_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('DELETE FROM course_teachers WHERE course_id=? AND teacher_id=?')->execute([$course_id,$teacher_id]);
  res(true,[]);
}
if ($action === 'courses.teachers.list') {
  $u = require_auth();
  $course_id = (int)($_GET['course_id'] ?? 0);
  if (!$course_id) res(false,null,'INVALID_INPUT',422);
  $stm=$pdo->prepare('SELECT ct.teacher_id as id,u.name,ct.role FROM course_teachers ct JOIN users u ON u.id=ct.teacher_id WHERE ct.course_id=? ORDER BY u.name');
  $stm->execute([$course_id]);
  res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'courses.create') {
  $u = require_auth();
  $pdo->exec('CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT "ativo",
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $name = trim($B['name'] ?? '');
  if (!$name) res(false, null, 'INVALID_INPUT', 422);
  $desc = $B['description'] ?? null;
  $status = $B['status'] ?? 'ativo';
  $pdo->prepare('INSERT INTO courses (name,description,status,created_at,updated_at) VALUES (?,?,?,NOW(),NOW())')->execute([$name, $desc, $status]);
  $id = $pdo->lastInsertId();
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Curso: criado #'.$id.' — '.$name]);
  res(true, ['id' => $id]);
}
if ($action === 'courses.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? ($_GET['id'] ?? 0));
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $row = $pdo->query('SELECT name FROM courses WHERE id='.$id)->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  $sets=[]; $vals=[];
  foreach(['name','description','status'] as $c){ if(array_key_exists($c,$B)){ $sets[]="$c=?"; $vals[]=$B[$c]; }}
  if(!$sets) res(false,null,'EMPTY',422);
  $vals[]=$id;
  $pdo->prepare('UPDATE courses SET '.implode(',', $sets).',updated_at=NOW() WHERE id=?')->execute($vals);
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $name = $B['name'] ?? ($row['name'] ?? '');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Curso: atualizado #'.$id.' — '.$name]);
  res(true, []);
}
if ($action === 'courses.delete') {
  $u = require_auth();
  $id = (int)($B['id'] ?? ($_GET['id'] ?? 0));
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $old = $pdo->prepare('SELECT name FROM courses WHERE id=?'); $old->execute([$id]); $row=$old->fetch(PDO::FETCH_ASSOC);
  $pdo->prepare('DELETE FROM courses WHERE id=?')->execute([$id]);
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Curso: excluído #'.$id.' — '.($row['name'] ?? '')]);
  res(true, []);
}

// ==================== SELEÇÕES DINÂMICAS PARA FORMULÁRIOS ====================

/**
 * Lista completa de estudantes
 * GET /students
 * Query params:
 * - teacher_id: filtrar por professor específico (admin apenas)
 * - q: busca por nome
 */
if ($action === 'students.list') {
  $u = require_auth();
  
  $teacher_id = isset($_GET['teacher_id']) ? (int)$_GET['teacher_id'] : null;
  $q = trim($_GET['q'] ?? '');
  $status = trim($_GET['status'] ?? '');
  $modalidade = trim($_GET['modalidade'] ?? '');
  
  // Paginação
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per_page = min(100, max(1, (int)($_GET['per_page'] ?? 50)));
  $offset = ($page - 1) * $per_page;
  
  // Ordenação
  $sort_by = $_GET['sort_by'] ?? 'name';
  $sort_direction = strtoupper($_GET['sort_direction'] ?? 'ASC');
  if (!in_array($sort_direction, ['ASC', 'DESC'])) $sort_direction = 'ASC';
  $allowed_sort = ['name', 'status', 'modalidade', 'grade', 'class_name', 'created_at'];
  if (!in_array($sort_by, $allowed_sort)) $sort_by = 'name';
  
  $sql = 'SELECT s.*, sc.name as school_name FROM students s LEFT JOIN schools sc ON s.school_id = sc.id WHERE 1=1';
  $params = [];
  
  // Filtro de status
  if ($status) {
    $sql .= ' AND s.status = ?';
    $params[] = $status;
  }
  
  // Admin pode filtrar por professor específico
  if ($teacher_id && $u['role'] === 'admin') {
    $sql .= ' AND s.created_by_teacher_id = ?';
    $params[] = $teacher_id;
  }
  // Professor só vê seus próprios alunos
  else if ($u['role'] !== 'admin') {
    $sql .= ' AND s.created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  // Filtro de busca
  if ($q) {
    $sql .= ' AND s.name LIKE ?';
    $params[] = '%' . $q . '%';
  }
  
  // Filtro de modalidade
  if ($modalidade) {
    $sql .= ' AND s.modalidade = ?';
    $params[] = $modalidade;
  }
  
  // Count total
  $count_sql = preg_replace('/^SELECT s\.\*, sc\.name as school_name/', 'SELECT COUNT(*)', $sql);
  $count_stmt = $pdo->prepare($count_sql);
  $count_stmt->execute($params);
  $total = $count_stmt->fetchColumn();
  
  // Ordenação e paginação
  $sql .= " ORDER BY s.$sort_by $sort_direction LIMIT $per_page OFFSET $offset";
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, [
    'rows' => $rows,
    'total' => $total,
    'page' => $page,
    'per_page' => $per_page,
    'total_pages' => ceil($total / $per_page)
  ]);
}

/**
 * Lista de alunos para dropdowns (filtrada por professor)
 * GET /students.options
 * Query params:
 * - q: busca por nome
 * - limit: limite de resultados (default 50)
 */
if ($action === 'students.options') {
  $u = require_auth();
  
  $q = trim($_GET['q'] ?? '');
  $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
  
  $sql = 'SELECT id, name, modalidade, grade, class_name, status FROM students WHERE status="ativo"';
  $params = [];
  
  // Teacher-centric: professor só vê alunos que criou
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  // Filtro de busca
  if ($q) {
    $sql .= ' AND name LIKE ?';
    $params[] = '%' . $q . '%';
  }
  
  $sql .= ' ORDER BY name ASC LIMIT ' . $limit;
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $students = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Formatar para dropdown (id, text, modalidade)
  $options = array_map(function($student) {
    return [
      'id' => $student['id'],
      'text' => $student['name'] . 
               ($student['modalidade'] ? ' (' . $student['modalidade'] . ')' : '') .
               ($student['grade'] ? ' - ' . $student['grade'] : '') .
               ($student['class_name'] ? ' ' . $student['class_name'] : ''),
      'modalidade' => $student['modalidade'],
      'serie' => $student['grade'],
      'turma' => $student['class_name']
    ];
  }, $students);
  
  res(true, ['options' => $options]);
}

/**
 * Criar aluno
 * POST /students/create
 */
if ($action === 'students.create') {
  $u = require_auth();
  
  // Limpar dados inválidos antes de validar
  if (isset($B['birth_date']) && $B['birth_date'] === '0000-00-00') {
    $B['birth_date'] = null;
  }
  
  // Validar dados recebidos
  $validation = validateStudent($B, false);
  if (!$validation['valid']) {
    res(false, null, json_encode($validation['errors']), 422);
  }
  
  $name = trim($B['name'] ?? '');
  $school_id = (int)($B['school_id'] ?? 0);
  $modalidade = $B['modalidade'] ?? '';
  
  if (!$name || !$school_id || !$modalidade) {
    res(false, null, 'MISSING_FIELDS - Nome, escola e modalidade são obrigatórios', 422);
  }
  
  // Determinar created_by_teacher_id
  $created_by = $B['created_by_teacher_id'] ?? $u['id'];
  if ($u['role'] !== 'admin') {
    $created_by = $u['id']; // Professor só cria para si mesmo
  }
  
  $sql = 'INSERT INTO students (
    name, school_id, modalidade, birth_date, cpf, grade, class_name,
    address, responsible_name, responsible_phone, status,
    created_by_teacher_id, support_teacher_id, srm_room_id,
    photo_url, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    $name,
    $school_id,
    $modalidade,
    $B['birth_date'] ?? null,
    $B['cpf'] ?? null,
    $B['grade'] ?? null,
    $B['class_name'] ?? null,
    $B['address'] ?? null,
    $B['responsible_name'] ?? null,
    $B['responsible_phone'] ?? null,
    $B['status'] ?? 'ativo',
    $created_by,
    $B['support_teacher_id'] ?? null,
    $B['srm_room_id'] ?? null,
    $B['photo_url'] ?? null
  ]);
  
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id, 'message' => 'Aluno criado com sucesso']);
}

/**
 * Atualizar aluno
 * PUT /students/update?id=X
 */
if ($action === 'students.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'INVALID_ID', 422);
  
  // Validar dados recebidos (update permite campos parciais)
  $validation = validateStudent($B, true);
  if (!$validation['valid']) {
    // Log para debug
    error_log('Validation errors: ' . json_encode($validation['errors']));
    error_log('Data sent: ' . json_encode($B));
    res(false, $validation['errors'], 'VALIDATION_FAILED', 422);
  }
  
  // Verificar permissão
  $check = $pdo->prepare('SELECT created_by_teacher_id FROM students WHERE id = ?');
  $check->execute([$id]);
  $student = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$student) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $student['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $fields = [];
  $values = [];
  
  // Limpar dados inválidos antes de processar
  if (isset($B['birth_date']) && $B['birth_date'] === '0000-00-00') {
    $B['birth_date'] = null;
  }
  
  $allowed = ['name', 'school_id', 'modalidade', 'birth_date', 'cpf', 'grade', 'class_name',
              'address', 'responsible_name', 'responsible_phone', 'status',
              'support_teacher_id', 'srm_room_id', 'photo_url'];
  
  foreach ($allowed as $field) {
    if (isset($B[$field])) {
      $fields[] = "$field = ?";
      $values[] = $B[$field];
    }
  }
  
  if (empty($fields)) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  
  $fields[] = 'updated_at = NOW()';
  $values[] = $id;
  
  $sql = 'UPDATE students SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($values);
  
  res(true, ['message' => 'Aluno atualizado com sucesso']);
}

/**
 * Excluir aluno
 * POST /students/delete?id=X
 */
if ($action === 'students.delete') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? $B['id'] ?? 0);
  
  if (!$id) res(false, null, 'INVALID_ID', 422);
  
  // Verificar permissão
  $check = $pdo->prepare('SELECT created_by_teacher_id, name FROM students WHERE id = ?');
  $check->execute([$id]);
  $student = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$student) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $student['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $pdo->prepare('DELETE FROM students WHERE id = ?')->execute([$id]);
  res(true, ['message' => 'Aluno excluído com sucesso']);
}

/**
 * Lista de escolas para dropdowns
 * GET /schools.options
 * Query params:
 * - q: busca por nome
 * - limit: limite de resultados (default 50)
 */
if ($action === 'schools.options') {
  $u = require_auth();
  
  $q = trim($_GET['q'] ?? '');
  $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
  
  // Verificar se a coluna status existe
  $checkStatus = $pdo->query("SHOW COLUMNS FROM schools LIKE 'status'");
  $hasStatus = $checkStatus->rowCount() > 0;
  
  $sql = 'SELECT id, name, city, address FROM schools';
  $whereClause = [];
  $params = [];
  
  if ($hasStatus) {
    $whereClause[] = 'status="ativo"';
  }
  
  // Teacher-centric: professor só vê suas escolas
  if ($u['role'] !== 'admin') {
    $whereClause[] = 'created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  // Filtro de busca
  if ($q) {
    $whereClause[] = '(name LIKE ? OR city LIKE ?)';
    $params[] = '%' . $q . '%';
    $params[] = '%' . $q . '%';
  }
  
  if (!empty($whereClause)) {
    $sql .= ' WHERE ' . implode(' AND ', $whereClause);
  }
  
  $sql .= ' ORDER BY name ASC LIMIT ' . $limit;
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $schools = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Formatar para dropdown
  $options = array_map(function($school) {
    return [
      'id' => $school['id'],
      'text' => $school['name'] . 
               ($school['city'] ? ' - ' . $school['city'] : ''),
      'cidade' => $school['city'],
      'endereco' => $school['address']
    ];
  }, $schools);
  
  res(true, ['options' => $options]);
}

/**
 * Lista de professores para dropdowns
 * GET /professores.options
 * Query params:
 * - q: busca por nome
 * - limit: limite de resultados (default 50)
 */
if ($action === 'professores.options') {
  $u = require_auth();
  
  $q = trim($_GET['q'] ?? '');
  $limit = min(200, max(1, (int)($_GET['limit'] ?? 50)));
  
  $sql = 'SELECT id, name, email FROM users WHERE role="professor" AND status="ativo"';
  $params = [];
  
  // Filtro de busca
  if ($q) {
    $sql .= ' AND name LIKE ?';
    $params[] = '%' . $q . '%';
  }
  
  $sql .= ' ORDER BY name ASC LIMIT ' . $limit;
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $professores = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Formatar para dropdown
  $options = array_map(function($prof) {
    return [
      'id' => $prof['id'],
      'text' => $prof['name'] . 
               ($prof['email'] ? ' (' . $prof['email'] . ')' : ''),
      'email' => $prof['email']
    ];
  }, $professores);
  
  res(true, ['options' => $options]);
}

/**
 * CRUD de Escolas
 */

// GET /schools - Listar escolas do professor (ou todas se admin)
if ($action === 'schools.list') {
  $u = require_auth();
  
  try {
    // Verificar se a coluna status existe
    $checkStatus = $pdo->query("SHOW COLUMNS FROM schools LIKE 'status'");
    $hasStatus = $checkStatus->rowCount() > 0;
    
    // Construir WHERE clause baseado em role e status
    $where = [];
    $params = [];
    
    // Filtrar por professor (exceto admin)
    if ($u['role'] !== 'admin') {
      $where[] = 'created_by_teacher_id = ?';
      $params[] = $u['id'];
    }
    
    // Filtrar por status ativo se coluna existir
    if ($hasStatus) {
      $where[] = 'status = "ativo"';
    }
    
    $whereClause = !empty($where) ? 'WHERE ' . implode(' AND ', $where) : '';
    
    $fields = $hasStatus 
      ? 'id, name, address, city, phone, status, created_at, updated_at'
      : 'id, name, address, city, phone, created_at, updated_at';
    
    $sql = "SELECT $fields FROM schools $whereClause ORDER BY name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    res(true, ['rows' => $rows, 'total' => count($rows)]);
  } catch (PDOException $e) {
    error_log("Erro ao listar escolas: " . $e->getMessage());
    res(false, null, 'DATABASE_ERROR: ' . $e->getMessage(), 500);
  }
}

// POST /schools/create - Criar nova escola
if ($action === 'schools.create') {
  $u = require_auth();
  
  $name = trim($B['name'] ?? '');
  $address = trim($B['address'] ?? '');
  $city = trim($B['city'] ?? '');
  $phone = trim($B['phone'] ?? '');
  
  if (!$name) {
    res(false, null, 'MISSING_NAME', 400);
  }
  
  try {
    // Verificar se a coluna status existe
    $checkStatus = $pdo->query("SHOW COLUMNS FROM schools LIKE 'status'");
    $hasStatus = $checkStatus->rowCount() > 0;
    
    if ($hasStatus) {
      $sql = 'INSERT INTO schools (name, address, city, phone, status, created_by_teacher_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, "ativo", ?, NOW(), NOW())';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$name, $address, $city, $phone, $u['id']]);
    } else {
      $sql = 'INSERT INTO schools (name, address, city, phone, created_by_teacher_id, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
      $stmt = $pdo->prepare($sql);
      $stmt->execute([$name, $address, $city, $phone, $u['id']]);
    }
    
    $newId = $pdo->lastInsertId();
    
    res(true, ['id' => $newId, 'message' => 'Escola criada com sucesso']);
  } catch (PDOException $e) {
    error_log("Erro ao criar escola: " . $e->getMessage());
    res(false, null, 'DATABASE_ERROR: ' . $e->getMessage(), 500);
  }
}

// POST /schools/update - Atualizar escola existente
if ($action === 'schools.update') {
  $u = require_auth();
  
  $id = (int)($B['id'] ?? 0);
  $name = trim($B['name'] ?? '');
  $address = trim($B['address'] ?? '');
  $city = trim($B['city'] ?? '');
  $phone = trim($B['phone'] ?? '');
  
  if (!$id || !$name) {
    res(false, null, 'MISSING_DATA', 400);
  }
  
  try {
    // Verificar propriedade (professor só atualiza suas escolas)
    if ($u['role'] !== 'admin') {
      $checkStmt = $pdo->prepare('SELECT id FROM schools WHERE id=? AND created_by_teacher_id=?');
      $checkStmt->execute([$id, $u['id']]);
      if (!$checkStmt->fetch()) {
        res(false, null, 'FORBIDDEN', 403);
      }
    }
    
    $sql = 'UPDATE schools SET name=?, address=?, city=?, phone=?, updated_at=NOW() WHERE id=?';
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $address, $city, $phone, $id]);
    
    res(true, ['message' => 'Escola atualizada com sucesso']);
  } catch (PDOException $e) {
    error_log("Erro ao atualizar escola: " . $e->getMessage());
    res(false, null, 'DATABASE_ERROR', 500);
  }
}

// DELETE /schools/delete - Excluir escola (soft delete ou hard delete)
if ($action === 'schools.delete') {
  $u = require_auth();
  
  $id = (int)($_GET['id'] ?? $B['id'] ?? 0);
  
  if (!$id) {
    res(false, null, 'MISSING_ID', 400);
  }
  
  try {
    // Verificar propriedade (professor só exclui suas escolas)
    if ($u['role'] !== 'admin') {
      $checkStmt = $pdo->prepare('SELECT id FROM schools WHERE id=? AND created_by_teacher_id=?');
      $checkStmt->execute([$id, $u['id']]);
      if (!$checkStmt->fetch()) {
        res(false, null, 'FORBIDDEN', 403);
      }
    }
    
    // Verificar se a coluna status existe
    $checkStatus = $pdo->query("SHOW COLUMNS FROM schools LIKE 'status'");
    $hasStatus = $checkStatus->rowCount() > 0;
    
    if ($hasStatus) {
      // Soft delete - marca como inativo
      $sql = 'UPDATE schools SET status="inativo", updated_at=NOW() WHERE id=?';
    } else {
      // Hard delete - remove definitivamente
      $sql = 'DELETE FROM schools WHERE id=?';
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id]);
    
    res(true, ['message' => 'Escola excluída com sucesso']);
  } catch (PDOException $e) {
    error_log("Erro ao excluir escola: " . $e->getMessage());
    res(false, null, 'DATABASE_ERROR: ' . $e->getMessage(), 500);
  }
}

// ========================================
// ENDPOINTS FORMULÁRIOS AEE
// ========================================

// POST /entrevistas-responsavel/create - Criar entrevista
if ($action === 'entrevistas-responsavel.create') {
  $u = require_auth();
  
  $student_id = (int)($B['student_id'] ?? 0);
  $form_data = $B['form_data'] ?? [];
  
  if (!$student_id || empty($form_data)) {
    res(false, null, 'MISSING_REQUIRED_FIELDS - student_id e form_data são obrigatórios', 422);
  }
  
  // Verificar se aluno pertence ao professor
  if ($u['role'] !== 'admin') {
    $check = $pdo->prepare('SELECT id FROM students WHERE id=? AND created_by_teacher_id=?');
    $check->execute([$student_id, $u['id']]);
    if (!$check->fetch()) {
      res(false, null, 'FORBIDDEN - Aluno não pertence a este professor', 403);
    }
  }
  
  $sql = 'INSERT INTO entrevista_forms (student_id, created_by_teacher_id, form_data, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, NOW(), NOW())';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    $student_id,
    $u['id'],
    json_encode($form_data, JSON_UNESCAPED_UNICODE),
    $B['status'] ?? 'rascunho'
  ]);
  
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id, 'message' => 'Entrevista criada com sucesso']);
}

// GET /entrevistas-responsavel/list - Listar entrevistas
if ($action === 'entrevistas-responsavel.list') {
  $u = require_auth();
  
  $sql = 'SELECT e.*, s.name as student_name, s.modalidade 
          FROM entrevista_forms e 
          LEFT JOIN students s ON e.student_id = s.id 
          WHERE 1=1';
  
  $params = [];
  
  // Professor só vê suas próprias entrevistas
  if ($u['role'] !== 'admin') {
    $sql .= ' AND e.created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  // Filtros
  if (isset($_GET['student_id'])) {
    $sql .= ' AND e.student_id = ?';
    $params[] = (int)$_GET['student_id'];
  }
  
  if (isset($_GET['status'])) {
    $sql .= ' AND e.status = ?';
    $params[] = $_GET['status'];
  }
  
  $sql .= ' ORDER BY e.created_at DESC';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Decodificar JSON
  foreach ($rows as &$row) {
    $row['form_data'] = json_decode($row['form_data'], true);
  }
  
  res(true, ['data' => $rows]);
}

// GET /entrevistas-responsavel/get?id=X - Obter entrevista específica
if ($action === 'entrevistas-responsavel.get') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  $sql = 'SELECT e.*, s.name as student_name, s.modalidade 
          FROM entrevista_forms e 
          LEFT JOIN students s ON e.student_id = s.id 
          WHERE e.id = ?';
  
  $params = [$id];
  
  if ($u['role'] !== 'admin') {
    $sql .= ' AND e.created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  
  $row['form_data'] = json_decode($row['form_data'], true);
  res(true, ['data' => $row]);
}

// PUT /entrevistas-responsavel/update?id=X - Atualizar entrevista
if ($action === 'entrevistas-responsavel.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  // Verificar permissão
  $check = $pdo->prepare('SELECT created_by_teacher_id FROM entrevista_forms WHERE id=?');
  $check->execute([$id]);
  $entrevista = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$entrevista) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $entrevista['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $fields = [];
  $values = [];
  
  if (isset($B['form_data'])) {
    $fields[] = 'form_data = ?';
    $values[] = json_encode($B['form_data'], JSON_UNESCAPED_UNICODE);
  }
  
  if (isset($B['status'])) {
    $fields[] = 'status = ?';
    $values[] = $B['status'];
  }
  
  if (empty($fields)) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  
  $fields[] = 'updated_at = NOW()';
  $values[] = $id;
  
  $sql = 'UPDATE entrevista_forms SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($values);
  
  res(true, ['message' => 'Entrevista atualizada com sucesso']);
}

// ========== PDI ENDPOINTS ==========

// POST /pdi/create - Criar PDI
if ($action === 'pdi.create') {
  $u = require_auth();
  
  $student_id = (int)($B['student_id'] ?? 0);
  $form_data = $B['form_data'] ?? [];
  
  if (!$student_id || empty($form_data)) {
    res(false, null, 'MISSING_REQUIRED_FIELDS', 422);
  }
  
  if ($u['role'] !== 'admin') {
    $check = $pdo->prepare('SELECT id FROM students WHERE id=? AND created_by_teacher_id=?');
    $check->execute([$student_id, $u['id']]);
    if (!$check->fetch()) {
      res(false, null, 'FORBIDDEN', 403);
    }
  }
  
  $sql = 'INSERT INTO pdi_forms (student_id, created_by_teacher_id, form_data, data_inicio, data_fim, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    $student_id,
    $u['id'],
    json_encode($form_data, JSON_UNESCAPED_UNICODE),
    $B['data_inicio'] ?? null,
    $B['data_fim'] ?? null,
    $B['status'] ?? 'rascunho'
  ]);
  
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id, 'message' => 'PDI criado com sucesso']);
}

// GET /pdi - Listar PDIs
if ($action === 'pdi.list') {
  $u = require_auth();
  
  $sql = 'SELECT p.*, s.name as student_name, s.modalidade 
          FROM pdi_forms p 
          LEFT JOIN students s ON p.student_id = s.id 
          WHERE 1=1';
  
  $params = [];
  
  if ($u['role'] !== 'admin') {
    $sql .= ' AND p.created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  if (isset($_GET['student_id'])) {
    $sql .= ' AND p.student_id = ?';
    $params[] = (int)$_GET['student_id'];
  }
  
  if (isset($_GET['status'])) {
    $sql .= ' AND p.status = ?';
    $params[] = $_GET['status'];
  }
  
  $sql .= ' ORDER BY p.created_at DESC';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  foreach ($rows as &$row) {
    $row['form_data'] = json_decode($row['form_data'], true);
  }
  
  res(true, ['data' => $rows]);
}

// PUT /pdi/update?id=X - Atualizar PDI
if ($action === 'pdi.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  $check = $pdo->prepare('SELECT created_by_teacher_id FROM pdi_forms WHERE id=?');
  $check->execute([$id]);
  $pdi = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$pdi) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $pdi['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $fields = [];
  $values = [];
  
  if (isset($B['form_data'])) {
    $fields[] = 'form_data = ?';
    $values[] = json_encode($B['form_data'], JSON_UNESCAPED_UNICODE);
  }
  
  if (isset($B['status'])) {
    $fields[] = 'status = ?';
    $values[] = $B['status'];
  }
  
  if (isset($B['data_inicio'])) {
    $fields[] = 'data_inicio = ?';
    $values[] = $B['data_inicio'];
  }
  
  if (isset($B['data_fim'])) {
    $fields[] = 'data_fim = ?';
    $values[] = $B['data_fim'];
  }
  
  if (empty($fields)) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  
  $fields[] = 'updated_at = NOW()';
  $values[] = $id;
  
  $sql = 'UPDATE pdi_forms SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($values);
  
  res(true, ['message' => 'PDI atualizado com sucesso']);
}

// ========== PLANO DE ATENDIMENTO ENDPOINTS ==========

// POST /plano-atendimento/create - Criar Plano de Atendimento
if ($action === 'plano-atendimento.create') {
  $u = require_auth();
  
  $student_id = (int)($B['student_id'] ?? 0);
  $form_data = $B['form_data'] ?? [];
  
  if (!$student_id || empty($form_data)) {
    res(false, null, 'MISSING_REQUIRED_FIELDS', 422);
  }
  
  if ($u['role'] !== 'admin') {
    $check = $pdo->prepare('SELECT id FROM students WHERE id=? AND created_by_teacher_id=?');
    $check->execute([$student_id, $u['id']]);
    if (!$check->fetch()) {
      res(false, null, 'FORBIDDEN', 403);
    }
  }
  
  $sql = 'INSERT INTO plano_atendimento_forms (student_id, created_by_teacher_id, pdi_id, form_data, data_inicio, data_fim, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    $student_id,
    $u['id'],
    $B['pdi_id'] ?? null,
    json_encode($form_data, JSON_UNESCAPED_UNICODE),
    $B['data_inicio'] ?? null,
    $B['data_fim'] ?? null,
    $B['status'] ?? 'rascunho'
  ]);
  
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id, 'message' => 'Plano de Atendimento criado com sucesso']);
}

// GET /plano-atendimento/list - Listar Planos de Atendimento
if ($action === 'plano-atendimento.list') {
  $u = require_auth();
  
  $sql = 'SELECT pa.*, s.name as student_name, s.modalidade 
          FROM plano_atendimento_forms pa 
          LEFT JOIN students s ON pa.student_id = s.id 
          WHERE 1=1';
  
  $params = [];
  
  if ($u['role'] !== 'admin') {
    $sql .= ' AND pa.created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  if (isset($_GET['student_id'])) {
    $sql .= ' AND pa.student_id = ?';
    $params[] = (int)$_GET['student_id'];
  }
  
  if (isset($_GET['pdi_id'])) {
    $sql .= ' AND pa.pdi_id = ?';
    $params[] = (int)$_GET['pdi_id'];
  }
  
  if (isset($_GET['status'])) {
    $sql .= ' AND pa.status = ?';
    $params[] = $_GET['status'];
  }
  
  $sql .= ' ORDER BY pa.created_at DESC';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  foreach ($rows as &$row) {
    $row['form_data'] = json_decode($row['form_data'], true);
  }
  
  res(true, ['data' => $rows]);
}

// PUT /plano-atendimento/update?id=X - Atualizar Plano de Atendimento
if ($action === 'plano-atendimento.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  $check = $pdo->prepare('SELECT created_by_teacher_id FROM plano_atendimento_forms WHERE id=?');
  $check->execute([$id]);
  $pa = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$pa) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $pa['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $fields = [];
  $values = [];
  
  if (isset($B['form_data'])) {
    $fields[] = 'form_data = ?';
    $values[] = json_encode($B['form_data'], JSON_UNESCAPED_UNICODE);
  }
  
  if (isset($B['status'])) {
    $fields[] = 'status = ?';
    $values[] = $B['status'];
  }
  
  if (isset($B['pdi_id'])) {
    $fields[] = 'pdi_id = ?';
    $values[] = $B['pdi_id'];
  }
  
  if (isset($B['data_inicio'])) {
    $fields[] = 'data_inicio = ?';
    $values[] = $B['data_inicio'];
  }
  
  if (isset($B['data_fim'])) {
    $fields[] = 'data_fim = ?';
    $values[] = $B['data_fim'];
  }
  
  if (empty($fields)) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  
  $fields[] = 'updated_at = NOW()';
  $values[] = $id;
  
  $sql = 'UPDATE plano_atendimento_forms SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($values);
  
  res(true, ['message' => 'Plano de Atendimento atualizado com sucesso']);
}

// ========================================
// UPLOAD DE FOTOS DE ALUNOS
// ========================================

// POST /students/upload-photo?id=X - Upload de foto do aluno
if ($action === 'students.upload-photo') {
  $u = require_auth();
  $student_id = (int)($_GET['id'] ?? $_POST['student_id'] ?? 0);
  
  if (!$student_id) {
    res(false, null, 'MISSING_STUDENT_ID', 422);
  }
  
  // Verificar se o aluno existe e pertence ao professor
  $check = $pdo->prepare('SELECT id, created_by_teacher_id FROM students WHERE id=?');
  $check->execute([$student_id]);
  $student = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$student) {
    res(false, null, 'STUDENT_NOT_FOUND', 404);
  }
  
  if ($u['role'] !== 'admin' && $student['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN - Aluno não pertence a este professor', 403);
  }
  
  // Validar arquivo enviado
  if (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
    res(false, null, 'NO_FILE_UPLOADED - Envie uma foto válida', 422);
  }
  
  // Validar se é imagem
  if (!validateImage($_FILES['photo'])) {
    res(false, null, 'INVALID_IMAGE - Envie uma imagem válida (JPG, PNG ou WEBP)', 422);
  }
  
  // Verificar tamanho (máximo 5MB)
  if ($_FILES['photo']['size'] > 5 * 1024 * 1024) {
    res(false, null, 'FILE_TOO_LARGE - Tamanho máximo: 5MB', 422);
  }
  
  // Criar diretório de uploads se não existir
  $uploadDir = __DIR__ . '/uploads/students/photos';
  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }
  
  // Gerar nome único para o arquivo
  $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
  $filename = 'student_' . $student_id . '_' . time() . '.' . $ext;
  $tempPath = $_FILES['photo']['tmp_name'];
  $finalPath = $uploadDir . '/' . $filename;
  
  // Redimensionar e salvar imagem (max 800x800)
  if (!resizeImage($tempPath, $finalPath, 800, 800)) {
    res(false, null, 'IMAGE_PROCESSING_FAILED - Erro ao processar imagem', 500);
  }
  
  // Atualizar banco de dados
  $photoUrl = '/backend/uploads/students/photos/' . $filename;
  $updateStmt = $pdo->prepare('UPDATE students SET photo_url = ?, updated_at = NOW() WHERE id = ?');
  $updateStmt->execute([$photoUrl, $student_id]);
  
  res(true, [
    'message' => 'Foto enviada com sucesso',
    'photo_url' => $photoUrl,
    'filename' => $filename
  ]);
}

// ========================================
// RELATÓRIOS DE ATENDIMENTO COM ÁUDIO/IA
// ========================================

// POST /relatorios/create - Criar relatório
if ($action === 'relatorios.create') {
  $u = require_auth();
  
  $student_id = (int)($B['student_id'] ?? 0);
  $data_atendimento = $B['data_atendimento'] ?? null;
  $descricao = trim($B['descricao'] ?? '');
  
  if (!$student_id || !$data_atendimento || !$descricao) {
    res(false, null, 'MISSING_REQUIRED_FIELDS - student_id, data_atendimento e descricao são obrigatórios', 422);
  }
  
  // Verificar se aluno pertence ao professor
  if ($u['role'] !== 'admin') {
    $check = $pdo->prepare('SELECT id FROM students WHERE id=? AND created_by_teacher_id=?');
    $check->execute([$student_id, $u['id']]);
    if (!$check->fetch()) {
      res(false, null, 'FORBIDDEN - Aluno não pertence a este professor', 403);
    }
  }
  
  $sql = 'INSERT INTO relatorios_atendimento (
    student_id, teacher_id, data_atendimento, duracao_minutos, tipo, local,
    descricao, objetivos, atividades, recursos, observacoes,
    progresso, proximos_passos, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    $student_id,
    $u['id'],
    $data_atendimento,
    $B['duracao_minutos'] ?? null,
    $B['tipo'] ?? 'individual',
    $B['local'] ?? null,
    $descricao,
    $B['objetivos'] ?? null,
    $B['atividades'] ?? null,
    $B['recursos'] ?? null,
    $B['observacoes'] ?? null,
    $B['progresso'] ?? null,
    $B['proximos_passos'] ?? null,
    $B['status'] ?? 'rascunho'
  ]);
  
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id, 'message' => 'Relatório criado com sucesso']);
}

// GET /relatorios/list - Listar relatórios
if ($action === 'relatorios.list') {
  $u = require_auth();
  
  $sql = 'SELECT r.*, s.name as student_name, s.modalidade, u.name as teacher_name
          FROM relatorios_atendimento r
          LEFT JOIN students s ON r.student_id = s.id
          LEFT JOIN users u ON r.teacher_id = u.id
          WHERE 1=1';
  
  $params = [];
  
  // Professor só vê seus próprios relatórios
  if ($u['role'] !== 'admin') {
    $sql .= ' AND r.teacher_id = ?';
    $params[] = $u['id'];
  }
  
  // Filtros
  if (isset($_GET['student_id'])) {
    $sql .= ' AND r.student_id = ?';
    $params[] = (int)$_GET['student_id'];
  }
  
  if (isset($_GET['tipo'])) {
    $sql .= ' AND r.tipo = ?';
    $params[] = $_GET['tipo'];
  }
  
  if (isset($_GET['status'])) {
    $sql .= ' AND r.status = ?';
    $params[] = $_GET['status'];
  }
  
  if (isset($_GET['data_inicio']) && isset($_GET['data_fim'])) {
    $sql .= ' AND r.data_atendimento BETWEEN ? AND ?';
    $params[] = $_GET['data_inicio'];
    $params[] = $_GET['data_fim'];
  }
  
  // Paginação
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per_page = min(100, max(1, (int)($_GET['per_page'] ?? 50)));
  $offset = ($page - 1) * $per_page;
  
  // Count total
  $count_sql = preg_replace('/^SELECT r\.\*, s\.name as student_name.*/', 'SELECT COUNT(*)', $sql);
  $count_stmt = $pdo->prepare($count_sql);
  $count_stmt->execute($params);
  $total = $count_stmt->fetchColumn();
  
  $sql .= " ORDER BY r.data_atendimento DESC, r.created_at DESC LIMIT $per_page OFFSET $offset";
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, [
    'data' => $rows,
    'total' => $total,
    'page' => $page,
    'per_page' => $per_page,
    'total_pages' => ceil($total / $per_page)
  ]);
}

// GET /relatorios/get?id=X - Obter relatório específico
if ($action === 'relatorios.get') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  $sql = 'SELECT r.*, s.name as student_name, s.modalidade, u.name as teacher_name
          FROM relatorios_atendimento r
          LEFT JOIN students s ON r.student_id = s.id
          LEFT JOIN users u ON r.teacher_id = u.id
          WHERE r.id = ?';
  
  $params = [$id];
  
  if ($u['role'] !== 'admin') {
    $sql .= ' AND r.teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  
  res(true, ['data' => $row]);
}

// PUT /relatorios/update?id=X - Atualizar relatório
if ($action === 'relatorios.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) res(false, null, 'MISSING_ID', 422);
  
  // Verificar permissão
  $check = $pdo->prepare('SELECT teacher_id FROM relatorios_atendimento WHERE id=?');
  $check->execute([$id]);
  $relatorio = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$relatorio) res(false, null, 'NOT_FOUND', 404);
  if ($u['role'] !== 'admin' && $relatorio['teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $fields = [];
  $values = [];
  
  $allowed = ['data_atendimento', 'duracao_minutos', 'tipo', 'local', 'descricao',
              'objetivos', 'atividades', 'recursos', 'observacoes', 'progresso',
              'proximos_passos', 'status'];
  
  foreach ($allowed as $field) {
    if (isset($B[$field])) {
      $fields[] = "$field = ?";
      $values[] = $B[$field];
    }
  }
  
  if (empty($fields)) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  
  $fields[] = 'updated_at = NOW()';
  $values[] = $id;
  
  $sql = 'UPDATE relatorios_atendimento SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($values);
  
  res(true, ['message' => 'Relatório atualizado com sucesso']);
}

// POST /relatorios/upload-audio?id=X - Upload de áudio para relatório
if ($action === 'relatorios.upload-audio') {
  $u = require_auth();
  $relatorio_id = (int)($_GET['id'] ?? $_POST['relatorio_id'] ?? 0);
  
  if (!$relatorio_id) {
    res(false, null, 'MISSING_RELATORIO_ID', 422);
  }
  
  // Verificar permissão
  $check = $pdo->prepare('SELECT teacher_id FROM relatorios_atendimento WHERE id=?');
  $check->execute([$relatorio_id]);
  $relatorio = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$relatorio) {
    res(false, null, 'RELATORIO_NOT_FOUND', 404);
  }
  
  if ($u['role'] !== 'admin' && $relatorio['teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  // Validar arquivo enviado
  if (!isset($_FILES['audio']) || $_FILES['audio']['error'] !== UPLOAD_ERR_OK) {
    res(false, null, 'NO_FILE_UPLOADED - Envie um arquivo de áudio', 422);
  }
  
  // Validar se é áudio
  if (!validateAudio($_FILES['audio'])) {
    res(false, null, 'INVALID_AUDIO - Envie um arquivo de áudio válido (MP3, WAV, WEBM, OGG)', 422);
  }
  
  // Verificar tamanho (máximo 25MB - limite OpenAI Whisper)
  if ($_FILES['audio']['size'] > 25 * 1024 * 1024) {
    res(false, null, 'FILE_TOO_LARGE - Tamanho máximo: 25MB', 422);
  }
  
  // Criar diretório de uploads se não existir
  $uploadDir = __DIR__ . '/uploads/relatorios/audio';
  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }
  
  // Gerar nome único para o arquivo
  $ext = pathinfo($_FILES['audio']['name'], PATHINFO_EXTENSION);
  $filename = 'relatorio_' . $relatorio_id . '_' . time() . '.' . $ext;
  $tempPath = $_FILES['audio']['tmp_name'];
  $finalPath = $uploadDir . '/' . $filename;
  
  // Mover arquivo
  if (!move_uploaded_file($tempPath, $finalPath)) {
    res(false, null, 'UPLOAD_FAILED - Erro ao salvar arquivo', 500);
  }
  
  // Atualizar banco de dados
  $audioUrl = '/backend/uploads/relatorios/audio/' . $filename;
  $updateStmt = $pdo->prepare('UPDATE relatorios_atendimento 
    SET audio_path = ?, transcricao_status = ?, updated_at = NOW() 
    WHERE id = ?');
  $updateStmt->execute([$audioUrl, 'pendente', $relatorio_id]);
  
  res(true, [
    'message' => 'Áudio enviado com sucesso',
    'audio_path' => $audioUrl,
    'filename' => $filename,
    'note' => 'Use o endpoint /relatorios/transcribe para transcrever o áudio'
  ]);
}

// POST /relatorios/transcribe?id=X - Transcrever áudio do relatório com OpenAI Whisper
if ($action === 'relatorios.transcribe') {
  $u = require_auth();
  $relatorio_id = (int)($_GET['id'] ?? 0);
  
  if (!$relatorio_id) {
    res(false, null, 'MISSING_RELATORIO_ID', 422);
  }
  
  // Buscar relatório
  $check = $pdo->prepare('SELECT teacher_id, audio_path, transcricao_status FROM relatorios_atendimento WHERE id=?');
  $check->execute([$relatorio_id]);
  $relatorio = $check->fetch(PDO::FETCH_ASSOC);
  
  if (!$relatorio) {
    res(false, null, 'RELATORIO_NOT_FOUND', 404);
  }
  
  if ($u['role'] !== 'admin' && $relatorio['teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  if (!$relatorio['audio_path']) {
    res(false, null, 'NO_AUDIO_FILE - Faça upload de um áudio primeiro', 422);
  }
  
  if ($relatorio['transcricao_status'] === 'processando') {
    res(false, null, 'ALREADY_PROCESSING - Transcrição já em andamento', 409);
  }
  
  // Marcar como processando
  $updateStmt = $pdo->prepare('UPDATE relatorios_atendimento SET transcricao_status = ? WHERE id = ?');
  $updateStmt->execute(['processando', $relatorio_id]);
  
  // Caminho do arquivo
  $audioPath = __DIR__ . str_replace('/backend', '', $relatorio['audio_path']);
  
  if (!file_exists($audioPath)) {
    $updateStmt->execute(['erro', $relatorio_id]);
    res(false, null, 'AUDIO_FILE_NOT_FOUND - Arquivo de áudio não encontrado', 404);
  }
  
  try {
    // Transcrever com OpenAI Whisper
    $transcricao = openai_transcribe($audioPath, basename($audioPath));
    
    // Salvar transcrição
    $updateStmt = $pdo->prepare('UPDATE relatorios_atendimento 
      SET transcricao = ?, transcricao_status = ?, updated_at = NOW() 
      WHERE id = ?');
    $updateStmt->execute([$transcricao, 'concluida', $relatorio_id]);
    
    res(true, [
      'message' => 'Transcrição concluída com sucesso',
      'transcricao' => $transcricao,
      'caracteres' => mb_strlen($transcricao)
    ]);
    
  } catch (Exception $e) {
    // Marcar como erro
    $updateStmt->execute(['erro', $relatorio_id]);
    res(false, null, 'TRANSCRIPTION_FAILED - ' . $e->getMessage(), 500);
  }
}

// ========================================
// NOTAS DO ALUNO (student_notes)
// ========================================

// GET /student-notes?student_id=X
if ($action === 'student_notes.list') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  if (!$student_id) res(false, null, 'MISSING_STUDENT_ID', 422);

  ensure_student_access($pdo, $u, $student_id);

  $sql = 'SELECT n.id, n.student_id, n.teacher_id, n.title, n.content, n.source, n.created_at, n.updated_at, u.name AS teacher_name
          FROM student_notes n
          LEFT JOIN users u ON n.teacher_id = u.id
          WHERE n.student_id = ?';
  $params = [$student_id];

  if ($u['role'] !== 'admin') {
    $sql .= ' AND (n.teacher_id = ? OR n.teacher_id IS NULL)';
    $params[] = $u['id'];
  }

  $sql .= ' ORDER BY n.created_at DESC';

  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);

  res(true, ['notes' => $notes]);
}

// POST /student-notes/create
if ($action === 'student_notes.create') {
  $u = require_auth();
  $student_id = (int)($B['student_id'] ?? 0);
  $content = trim($B['content'] ?? '');
  $title = trim($B['title'] ?? '');
  $source = $B['source'] ?? null;

  if (!$student_id || !$content) res(false, null, 'MISSING_FIELDS', 422);

  ensure_student_access($pdo, $u, $student_id);

  $teacher_id = $u['role'] === 'admin' ? ($B['teacher_id'] ?? $u['id']) : $u['id'];

  $stmt = $pdo->prepare('INSERT INTO student_notes (student_id, teacher_id, title, content, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
  $stmt->execute([$student_id, $teacher_id, $title ?: null, $content, $source ?: null]);
  $id = $pdo->lastInsertId();

  $noteStmt = $pdo->prepare('SELECT n.id, n.student_id, n.teacher_id, n.title, n.content, n.source, n.created_at, n.updated_at, u.name AS teacher_name FROM student_notes n LEFT JOIN users u ON n.teacher_id = u.id WHERE n.id = ?');
  $noteStmt->execute([$id]);
  $note = $noteStmt->fetch(PDO::FETCH_ASSOC);

  res(true, ['note' => $note]);
}

// POST /student-notes/update
if ($action === 'student_notes.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? 0);
  if (!$id) res(false, null, 'MISSING_ID', 422);

  $stmt = $pdo->prepare('SELECT * FROM student_notes WHERE id = ?');
  $stmt->execute([$id]);
  $note = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$note) res(false, null, 'NOT_FOUND', 404);

  ensure_student_access($pdo, $u, (int)$note['student_id']);

  if ($u['role'] !== 'admin' && $note['teacher_id'] && (int)$note['teacher_id'] !== (int)$u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }

  $fields = [];
  $values = [];

  if (array_key_exists('title', $B)) {
    $fields[] = 'title = ?';
    $values[] = trim($B['title'] ?? '') ?: null;
  }
  if (array_key_exists('content', $B)) {
    $content = trim($B['content'] ?? '');
    if (!$content) res(false, null, 'CONTENT_REQUIRED', 422);
    $fields[] = 'content = ?';
    $values[] = $content;
  }
  if (array_key_exists('source', $B)) {
    $fields[] = 'source = ?';
    $values[] = $B['source'] ?: null;
  }

  if (!$fields) res(false, null, 'NO_FIELDS_TO_UPDATE', 422);

  $fields[] = 'updated_at = NOW()';
  $values[] = $id;

  $sql = 'UPDATE student_notes SET ' . implode(', ', $fields) . ' WHERE id = ?';
  $upd = $pdo->prepare($sql);
  $upd->execute($values);

  res(true, ['message' => 'Nota atualizada com sucesso']);
}

// ========================================
// RELATÓRIO DO ALUNO (dashboard)
// ========================================

// GET /reports/student?student_id=X
if ($action === 'reports.student') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  if (!$student_id) res(false, null, 'MISSING_STUDENT_ID', 422);

  $student = ensure_student_access($pdo, $u, $student_id);

  // Dados básicos do aluno
  $report = [
    'student' => [
      'id' => (int)$student['id'],
      'name' => $student['name'],
      'school' => $student['school_name'],
      'school_city' => $student['school_city'],
      'school_address' => $student['school_address'],
      'status' => $student['status'],
      'modalidade' => $student['modalidade'],
      'grade' => $student['grade'],
      'class_name' => $student['class_name'],
      'responsible_name' => $student['responsible_name'],
      'responsible_phone' => $student['responsible_phone'],
      'created_at' => $student['created_at'],
      'updated_at' => $student['updated_at']
    ],
    'anamneses' => [],
    'pdis' => [],
    'pais' => [],
    'attendance' => [],
    'weekly_plans' => [],
    'notes' => []
  ];

  // Entrevistas/Anamneses (formulários longos)
  $anamneses = [];

  // Tabela antiga de anamneses
  $stmt = $pdo->prepare('SELECT id, student_id, answers, created_at FROM anamneses WHERE student_id = ? ORDER BY created_at DESC');
  $stmt->execute([$student_id]);
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $row['answers'] = $row['answers'] ? json_decode($row['answers'], true) : [];
    $row['source'] = 'anamnese';
    $anamneses[] = $row;
  }

  // Entrevista forms
  $sql = 'SELECT id, student_id, status, form_data, created_at, updated_at FROM entrevista_forms WHERE student_id = ?';
  $params = [$student_id];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  $sql .= ' ORDER BY updated_at DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $answers = $row['form_data'] ? json_decode($row['form_data'], true) : [];
    $anamneses[] = [
      'id' => $row['id'],
      'student_id' => $row['student_id'],
      'answers' => $answers,
      'status' => $row['status'],
      'created_at' => $row['created_at'],
      'updated_at' => $row['updated_at'],
      'source' => 'entrevista'
    ];
  }

  $report['anamneses'] = $anamneses;
  
  // Separar entrevistas para facilitar no frontend
  $report['entrevistas'] = array_filter($anamneses, function($item) {
    return ($item['source'] ?? '') === 'entrevista';
  });
  $report['entrevistas'] = array_values($report['entrevistas']); // Reindexar

  // PDIs
  $sql = 'SELECT id, student_id, created_by_teacher_id, status, form_data, data_inicio, data_fim, created_at, updated_at
          FROM pdi_forms WHERE student_id = ?';
  $params = [$student_id];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  $sql .= ' ORDER BY updated_at DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $pdis = [];
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $data = $row['form_data'] ? json_decode($row['form_data'], true) : [];
    $row['form_data'] = $data;
    $row['objectives'] = $data['objetivo_geral'] ?? ($data['objetivos'] ?? null);
    $row['strategies'] = $data['estrategias'] ?? null;
    $row['start_date'] = $row['data_inicio'];
    $row['end_date'] = $row['data_fim'];
    unset($row['data_inicio'], $row['data_fim']);
    $pdis[] = $row;
  }
  $report['pdis'] = $pdis;

  // PAIs
  $sql = 'SELECT id, student_id, created_by_teacher_id, status, form_data, data_inicio, data_fim, created_at, updated_at
          FROM plano_atendimento_forms WHERE student_id = ?';
  $params = [$student_id];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  $sql .= ' ORDER BY updated_at DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $pais = [];
  foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
    $data = $row['form_data'] ? json_decode($row['form_data'], true) : [];
    $row['form_data'] = $data;
    $row['objectives'] = $data['objetivos'] ?? ($data['objetivo_geral'] ?? null);
    $row['strategies'] = $data['estrategias'] ?? null;
    $row['start_date'] = $row['data_inicio'];
    $row['end_date'] = $row['data_fim'];
    unset($row['data_inicio'], $row['data_fim']);
    $pais[] = $row;
  }
  $report['pais'] = $pais;

  // Frequência
  $stmt = $pdo->prepare('SELECT id, student_id, date, period, present, notes, created_at FROM attendance WHERE student_id = ? ORDER BY date DESC LIMIT 100');
  $stmt->execute([$student_id]);
  $report['attendance'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Planos semanais
  $sql = 'SELECT id, student_id, support_teacher_id, week_start, objectives, notes, created_at FROM weekly_plans WHERE student_id = ?';
  $params = [$student_id];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND (support_teacher_id IS NULL OR support_teacher_id = ?)';
    $params[] = $u['id'];
  }
  $sql .= ' ORDER BY week_start DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $report['weekly_plans'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

  // Notas
  $sql = 'SELECT n.id, n.student_id, n.teacher_id, n.title, n.content, n.source, n.created_at, n.updated_at, u.name AS teacher_name
          FROM student_notes n
          LEFT JOIN users u ON n.teacher_id = u.id
          WHERE n.student_id = ?';
  $params = [$student_id];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND (n.teacher_id = ? OR n.teacher_id IS NULL)';
    $params[] = $u['id'];
  }
  $sql .= ' ORDER BY n.created_at DESC';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $report['notes'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

  res(true, $report);
}

// GET /reports/student/pdf?student_id=X
if ($action === 'reports.student.pdf') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  $tipo = $_GET['tipo'] ?? 'geral';
  
  if (!$student_id) res(false, null, 'STUDENT_ID_REQUIRED', 400);
  
  // Verificar se o aluno existe e o usuário tem permissão
  $sql = 'SELECT * FROM students WHERE id = ?';
  $stmt = $pdo->prepare($sql);
  $stmt->execute([$student_id]);
  $student = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$student) res(false, null, 'STUDENT_NOT_FOUND', 404);
  
  if ($u['role'] !== 'admin' && $student['created_by_teacher_id'] != $u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  // Por enquanto, retornar mensagem indicando que está em desenvolvimento
  // TODO: Implementar gerador de PDF dedicado para relatórios gerais
  res(false, ['message' => 'Gerador de PDF de relatórios gerais em desenvolvimento. Use "Exportar PDF" nos formulários específicos (Entrevista, PDI, PAI).'], 'PDF_GERAL_EM_DESENVOLVIMENTO', 501);
}

// ========================================
// GERADORES DE PDF AEE
// ========================================

// GET /forms/anamnese/pdf?student_id=X
if ($action === 'forms.anamnese.pdf') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  
  if (!$student_id) res(false, null, 'STUDENT_ID_REQUIRED', 400);
  
  // Buscar última entrevista do aluno (tabela nova)
  $sql = 'SELECT id FROM entrevista_forms WHERE student_id = ?';
  $params = [$student_id];
  
  // Teacher-centric: professor só vê suas entrevistas
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $sql .= ' ORDER BY created_at DESC LIMIT 1';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$entrevista) {
    res(false, null, 'NO_ENTREVISTA_FOUND', 404);
  }
  
  // Redirecionar para o gerador standalone
  $token = bearer();
  header('Location: generate-pdf-entrevista.php?id=' . $entrevista['id'] . '&token=' . urlencode($token));
  exit;
}

// GET /pdi/pdf?student_id=X
if ($action === 'pdi.pdf') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  
  if (!$student_id) res(false, null, 'STUDENT_ID_REQUIRED', 400);
  
  // Buscar último PDI do aluno (tabela nova)
  $sql = 'SELECT id FROM pdi_forms WHERE student_id = ?';
  $params = [$student_id];
  
  // Teacher-centric: professor só vê seus PDIs
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $sql .= ' ORDER BY created_at DESC LIMIT 1';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $pdi = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pdi) {
    res(false, null, 'NO_PDI_FOUND', 404);
  }
  
  // Redirecionar para o gerador standalone
  $token = bearer();
  header('Location: generate-pdf-pdi.php?id=' . $pdi['id'] . '&token=' . urlencode($token));
  exit;
}

// GET /pai/pdf?student_id=X
if ($action === 'pai.pdf') {
  $u = require_auth();
  $student_id = (int)($_GET['student_id'] ?? 0);
  
  if (!$student_id) res(false, null, 'STUDENT_ID_REQUIRED', 400);
  
  // Buscar último PAI do aluno (tabela nova)
  $sql = 'SELECT id FROM plano_atendimento_forms WHERE student_id = ?';
  $params = [$student_id];
  
  // Teacher-centric: professor só vê seus PAIs
  if ($u['role'] !== 'admin') {
    $sql .= ' AND created_by_teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $sql .= ' ORDER BY created_at DESC LIMIT 1';
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $pai = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pai) {
    res(false, null, 'NO_PAI_FOUND', 404);
  }
  
  // Redirecionar para o gerador standalone
  $token = bearer();
  header('Location: generate-pdf-pai.php?id=' . $pai['id'] . '&token=' . urlencode($token));
  exit;
}

// ========================================
// DOCUMENTOS GERADOS (PDFs)
// ========================================

if ($action === 'documentos.list') {
  $u = require_auth();

  $page = max(1, (int)($_GET['page'] ?? 1));
  $per_page = min(50, max(1, (int)($_GET['per_page'] ?? 12)));
  $offset = ($page - 1) * $per_page;

  $baseSql = ' FROM documentos_gerados d LEFT JOIN students s ON d.student_id = s.id LEFT JOIN users us ON d.teacher_id = us.id WHERE d.deleted_at IS NULL';
  $params = [];

  if ($u['role'] !== 'admin') {
    $baseSql .= ' AND d.teacher_id = ?';
    $params[] = $u['id'];
  }

  if (!empty($_GET['tipo'])) {
    $baseSql .= ' AND d.tipo = ?';
    $params[] = $_GET['tipo'];
  }

  if (!empty($_GET['student_id'])) {
    $baseSql .= ' AND d.student_id = ?';
    $params[] = (int)$_GET['student_id'];
  }

  if (!empty($_GET['data_inicio'])) {
    $baseSql .= ' AND d.created_at >= ?';
    $params[] = $_GET['data_inicio'] . ' 00:00:00';
  }

  if (!empty($_GET['data_fim'])) {
    $baseSql .= ' AND d.created_at <= ?';
    $params[] = $_GET['data_fim'] . ' 23:59:59';
  }

  $countStmt = $pdo->prepare('SELECT COUNT(*)' . $baseSql);
  $countStmt->execute($params);
  $total = (int)$countStmt->fetchColumn();

  $listSql = 'SELECT d.*, s.name AS student_name, us.name AS teacher_name' . $baseSql . ' ORDER BY d.created_at DESC LIMIT ' . $per_page . ' OFFSET ' . $offset;
  $listStmt = $pdo->prepare($listSql);
  $listStmt->execute($params);
  $rows = $listStmt->fetchAll(PDO::FETCH_ASSOC);

  foreach ($rows as &$row) {
    $row['file_size'] = (int)($row['file_size'] ?? 0);
    $row['file_size_formatted'] = formatFileSize($row['file_size']);
  }

  $pagination = [
    'current_page' => $page,
    'per_page' => $per_page,
    'total' => $total,
    'total_pages' => $per_page ? (int)ceil($total / $per_page) : 0,
    'has_next' => ($offset + $per_page) < $total,
    'has_prev' => $page > 1
  ];

  res(true, ['documentos' => $rows, 'pagination' => $pagination]);
}

if ($action === 'documentos.stats') {
  $u = require_auth();

  $sql = 'SELECT COUNT(*) AS total, COALESCE(SUM(file_size), 0) AS tamanho_total FROM documentos_gerados WHERE deleted_at IS NULL';
  $params = [];
  if ($u['role'] !== 'admin') {
    $sql .= ' AND teacher_id = ?';
    $params[] = $u['id'];
  }
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $totais = $stmt->fetch(PDO::FETCH_ASSOC) ?: ['total' => 0, 'tamanho_total' => 0];

  $sqlTipo = 'SELECT tipo, COUNT(*) AS count FROM documentos_gerados WHERE deleted_at IS NULL';
  $paramsTipo = [];
  if ($u['role'] !== 'admin') {
    $sqlTipo .= ' AND teacher_id = ?';
    $paramsTipo[] = $u['id'];
  }
  $sqlTipo .= ' GROUP BY tipo';
  $stmt = $pdo->prepare($sqlTipo);
  $stmt->execute($paramsTipo);
  $porTipo = $stmt->fetchAll(PDO::FETCH_ASSOC);

  res(true, [
    'total' => (int)$totais['total'],
    'tamanho_total' => (int)$totais['tamanho_total'],
    'por_tipo' => array_map(function ($row) {
      return ['tipo' => $row['tipo'], 'count' => (int)$row['count']];
    }, $porTipo)
  ]);
}

if ($action === 'documentos.download') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);

  $stmt = $pdo->prepare('SELECT d.*, s.name AS student_name FROM documentos_gerados d LEFT JOIN students s ON d.student_id = s.id WHERE d.id = ? AND d.deleted_at IS NULL');
  $stmt->execute([$id]);
  $doc = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$doc) res(false, null, 'NOT_FOUND', 404);

  if ($u['role'] !== 'admin' && (int)$doc['teacher_id'] !== (int)$u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }

  $baseDir = dirname(__DIR__);
  $stored = $doc['file_path'];
  $candidate = null;
  if ($stored) {
    if (preg_match('/^(?:[a-zA-Z]:\\\\|\\\\|\/)/', $stored)) {
      $candidate = $stored;
    } else {
      $candidate = $baseDir . '/' . ltrim(str_replace('\\', '/', $stored), '/');
    }
  }
  $fullPath = $candidate ? realpath($candidate) : null;
  if (!$fullPath || !file_exists($fullPath)) {
    res(false, null, 'FILE_NOT_FOUND', 404);
  }

  header('Content-Type: application/pdf');
  $fileName = $doc['file_name'] ?: ('documento-' . $doc['id'] . '.pdf');
  header('Content-Disposition: attachment; filename="' . basename($fileName) . '"');
  header('Content-Length: ' . filesize($fullPath));
  readfile($fullPath);
  exit;
}

if ($action === 'documentos.delete') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);

  $stmt = $pdo->prepare('SELECT * FROM documentos_gerados WHERE id = ? AND deleted_at IS NULL');
  $stmt->execute([$id]);
  $doc = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$doc) res(false, null, 'NOT_FOUND', 404);

  if ($u['role'] !== 'admin' && (int)$doc['teacher_id'] !== (int)$u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }

  $pdo->prepare('UPDATE documentos_gerados SET deleted_at = NOW() WHERE id = ?')->execute([$id]);

  // Opcionalmente remover arquivo físico
  $baseDir = dirname(__DIR__);
  $stored = $doc['file_path'];
  $candidate = null;
  if ($stored) {
    if (preg_match('/^(?:[a-zA-Z]:\\\\|\\\\|\/)/', $stored)) {
      $candidate = $stored;
    } else {
      $candidate = $baseDir . '/' . ltrim(str_replace('\\', '/', $stored), '/');
    }
  }
  $fullPath = $candidate ? realpath($candidate) : null;
  if ($fullPath && file_exists($fullPath)) {
    @unlink($fullPath);
  }

  res(true, ['message' => 'Documento removido com sucesso']);
}


