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
  
  $sql = 'SELECT s.*, sc.name as school_name FROM students s LEFT JOIN schools sc ON s.school_id = sc.id WHERE s.status="ativo"';
  $params = [];
  
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
  
  $sql .= ' ORDER BY s.name ASC';
  
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, ['ok' => true, 'data' => $rows]);
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

