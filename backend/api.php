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

if ($action === 'students.search') {
  // $u = require_auth(); // Removido para permitir busca de alunos na entrevista
  $q = trim($_GET['q'] ?? '');
  $limit = min(30, max(1, (int)($_GET['limit'] ?? 10)));
  
  $sql = 'SELECT s.id, s.name, s.modalidade, s.status, s.responsible_name, s.responsible_phone, s.grade, s.class_name, s.school_id, sch.name as school_name FROM students s LEFT JOIN schools sch ON s.school_id = sch.id WHERE s.name LIKE ? ORDER BY s.name LIMIT ' . $limit;
  $params = ['%' . $q . '%'];
  $stm = $pdo->prepare($sql);
  $stm->execute($params);
  res(true, $stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'students.list') {
  $u = require_auth();
  $q = $_GET['q'] ?? '';
  $status = $_GET['status'] ?? '';
  $modalidade = $_GET['modalidade'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per = min(200, max(1, (int)($_GET['per_page'] ?? 50)));
  $sql = 'SELECT s.*, sch.name as school_name, prof.name as support_teacher_name 
          FROM students s 
          LEFT JOIN schools sch ON s.school_id = sch.id 
          LEFT JOIN users prof ON s.support_teacher_id = prof.id
          WHERE 1';
  $p = [];
  
  // Professores só veem alunos que criaram, admins veem todos
  if ($u['role'] !== 'admin') {
    $sql .= ' AND s.created_by_teacher_id = ?';
    $p[] = $u['id'];
  }
  
  if ($q) {
    $sql .= ' AND s.name LIKE ?';
    $p[] = '%' . $q . '%';
  }
  if ($status) {
    $sql .= ' AND s.status=?';
    $p[] = $status;
  }
  if ($modalidade) {
    $sql .= ' AND s.modalidade=?';
    $p[] = $modalidade;
  }
  $stm = $pdo->prepare($sql . ' ORDER BY s.id DESC LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
  $stm->execute($p);
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows, 'page' => $page, 'per_page' => $per]);
}
if ($action === 'students.create') {
  $u = require_auth();
  $f = $B;
  
  // Debug: log do payload recebido
  error_log('DEBUG students.create - Payload: ' . json_encode($f));
  
  if (!($f['name'] ?? '')) res(false, null, 'Nome é obrigatório', 422);
  if (!($f['modalidade'] ?? '')) res(false, null, 'Modalidade é obrigatória', 422);
  if (!($f['school_id'] ?? '')) res(false, null, 'Escola é obrigatória', 422);
  
  // Campos modernos + alguns legados ainda aceitos
  $cols = [
    'name', 'photo_url',
    // dados pessoais
    'birth_date', 'cpf', 'rg',
    // relacionamento com escola e turma
    'school_id', 'grade', 'class_name', 'address',
    // responsáveis
    'responsible_name', 'responsible_phone', 'responsible_email',
    // outros
    'shift', 'disability_type', 'cid_code', 'status', 'modalidade', 'support_teacher_id', 'srm_room_id',
    // autoria
    'created_by_teacher_id'
  ];
  $vals = [];
  $ph = [];
  foreach ($cols as $c) {
    if (isset($f[$c])) {
      $vals[$c] = $f[$c];
      $ph[] = '?';
    }
  }
  
  try {
    $sql = 'INSERT INTO students (' . implode(',', array_keys($vals)) . ',created_at,updated_at) VALUES (' . implode(',', $ph) . ',NOW(),NOW())';
    $pdo->prepare($sql)->execute(array_values($vals));
    $id = $pdo->lastInsertId();
  } catch (PDOException $e) {
    error_log('Erro ao criar aluno: ' . $e->getMessage());
    res(false, null, 'Erro ao criar aluno: ' . $e->getMessage(), 500);
  }
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Aluno: criado #' . $id . ' — ' . ($f['name'] ?? '');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, ['id' => $id]);
}
if ($action === 'students.update') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $f = $B;
  $row0 = $pdo->query('SELECT name FROM students WHERE id=' . $id)->fetch(PDO::FETCH_ASSOC);
  $sets = [];
  $vals = [];
  foreach ([
    'name', 'photo_url',
    // dados pessoais
    'birth_date', 'cpf', 'rg',
    // relacionamento com escola e turma
    'school_id', 'grade', 'class_name', 'address',
    // responsáveis
    'responsible_name', 'responsible_phone', 'responsible_email',
    // outros
    'shift', 'disability_type', 'cid_code', 'status', 'modalidade', 'support_teacher_id', 'srm_room_id',
    // autoria
    'created_by_teacher_id'
  ] as $c) {
    if (array_key_exists($c, $f)) {
      $sets[] = "$c=?";
      $vals[] = $f[$c];
    }
  }
  if (!$sets) res(false, null, 'EMPTY', 422);
  $vals[] = $id;
  $pdo->prepare('UPDATE students SET ' . implode(',', $sets) . ',updated_at=NOW() WHERE id=?')->execute($vals);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $nm = $f['name'] ?? ($row0['name'] ?? '');
  $msg = 'Aluno: atualizado #' . $id . ' — ' . $nm;
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, []);
}
if ($action === 'students.delete') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  // fetch name for log
  $old = $pdo->prepare('SELECT name FROM students WHERE id=?');
  $old->execute([$id]);
  $row = $old->fetch(PDO::FETCH_ASSOC);
  $pdo->prepare('DELETE FROM students WHERE id=?')->execute([$id]);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Aluno: excluído #' . $id . ' — ' . ($row['name'] ?? '');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, []);
}

if ($action === 'forms.anamnese.create') {
  $u = require_auth();
  $sid = (int)($B['student_id'] ?? 0);
  $ans = $B['answers'] ?? [];
  if (!$sid) res(false, null, 'INVALID_STUDENT', 422);
  $pdo->prepare('INSERT INTO anamneses (student_id,answers,created_at) VALUES (?,?,NOW())')->execute([$sid, json_encode($ans, JSON_UNESCAPED_UNICODE)]);
  res(true, []);
}
if ($action === 'forms.anamnese.list') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  $q = $pdo->prepare('SELECT id,answers,created_at FROM anamneses WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    $r['answers'] = json_decode($r['answers'], true);
  }
  res(true, $rows);
}

if ($action === 'pdi.create') {
  $u = require_auth();
  $sid = (int)($B['student_id'] ?? 0);
  if (!$sid) res(false, null, 'INVALID_STUDENT', 422);
  // Permite incluir school_id e escola (nome) em details, mantendo esquema atual
  $details = $B['details'] ?? [];
  if (!is_array($details)) { $details = []; }
  if (isset($B['escola_id'])) $details['escola_id'] = (int)$B['escola_id'];
  if (isset($B['escola'])) $details['escola'] = $B['escola'];
  $pdo->prepare('INSERT INTO pdis (student_id,objectives,strategies,start_date,end_date,status,details,created_at) VALUES (?,?,?,?,?,?,?,NOW())')->execute([$sid, $B['objectives'] ?? null, $B['strategies'] ?? null, $B['start_date'] ?? null, $B['end_date'] ?? null, $B['status'] ?? 'ativo', $details ? json_encode($details, JSON_UNESCAPED_UNICODE) : null]);
  $pid = $pdo->lastInsertId();
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'PDI: criado #' . $pid . ' — Aluno #' . $sid;
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, ['id' => $pid]);
}
if ($action === 'pdi.list') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  $q = $pdo->prepare('SELECT * FROM pdis WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  res(true, $rows);
}

if ($action === 'pdi.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  // Campos atualizáveis
  $fields = ['objectives','strategies','start_date','end_date','status'];
  $sets = [];$vals=[];
  foreach ($fields as $f) {
    if (array_key_exists($f, $B)) { $sets[] = "$f = ?"; $vals[] = $B[$f]; }
  }
  if (isset($B['details'])) { $sets[] = 'details = ?'; $vals[] = is_array($B['details']) ? json_encode($B['details'], JSON_UNESCAPED_UNICODE) : $B['details']; }
  if (!$sets) res(false, null, 'NO_FIELDS', 422);
  $vals[] = $id;
  $sql = 'UPDATE pdis SET ' . implode(',', $sets) . ' WHERE id=?';
  $pdo->prepare($sql)->execute($vals);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['PDI: atualizado #'.$id]);
  res(true, ['id'=>$id]);
}

if ($action === 'pai.create') {
  $u = require_auth();
  $sid = (int)($B['student_id'] ?? 0);
  if (!$sid) res(false, null, 'INVALID_STUDENT', 422);
  $pdo->prepare('INSERT INTO pais (student_id,goals,services,start_date,end_date,status,details,created_at) VALUES (?,?,?,?,?,?,?,NOW())')->execute([$sid, $B['goals'] ?? null, $B['services'] ?? null, $B['start_date'] ?? null, $B['end_date'] ?? null, $B['status'] ?? 'ativo', isset($B['details']) ? json_encode($B['details'], JSON_UNESCAPED_UNICODE) : null]);
  $pid = $pdo->lastInsertId();
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'PAI: criado #' . $pid . ' — Aluno #' . $sid;
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, ['id' => $pid]);
}
if ($action === 'pai.list') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  $q = $pdo->prepare('SELECT * FROM pais WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  res(true, $rows);
}

if ($action === 'pai.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $fields = ['goals','services','start_date','end_date','status'];
  $sets = [];$vals=[];
  foreach ($fields as $f) { if (array_key_exists($f, $B)) { $sets[] = "$f = ?"; $vals[] = $B[$f]; } }
  if (isset($B['details'])) { $sets[] = 'details = ?'; $vals[] = is_array($B['details']) ? json_encode($B['details'], JSON_UNESCAPED_UNICODE) : $B['details']; }
  if (!$sets) res(false, null, 'NO_FIELDS', 422);
  $vals[] = $id;
  $sql = 'UPDATE pais SET ' . implode(',', $sets) . ' WHERE id=?';
  $pdo->prepare($sql)->execute($vals);
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['PAI: atualizado #'.$id]);
  res(true, ['id'=>$id]);
}

if ($action === 'plans.create') {
  $u = require_auth();
  $sid = (int)($B['student_id'] ?? 0);
  $week = $B['week_start'] ?? null;
  if (!$sid || !$week) res(false, null, 'INVALID_INPUT', 422);
  // Permitir salvar escola de origem no notes (ou JSON dedicado se existir)
  $notes = $B['notes'] ?? null;
  $details = $B['details'] ?? [];
  if (!is_array($details)) { $details = []; }
  if (isset($B['escola_origem_id'])) $details['escola_origem_id'] = (int)$B['escola_origem_id'];
  if (isset($B['escola_origem'])) $details['escola_origem'] = $B['escola_origem'];
  if ($details) {
    $notes = trim(($notes ? $notes . "\n" : '') . '[escola_origem] ' . json_encode($details, JSON_UNESCAPED_UNICODE));
  }
  $pdo->prepare('INSERT INTO weekly_plans (student_id,week_start,objectives,notes,created_at) VALUES (?,?,?, ?,NOW())')->execute([$sid, $week, $B['objectives'] ?? null, $notes]);
  $pid = $pdo->lastInsertId();
  foreach ($B['items'] ?? [] as $it) {
    $pdo->prepare('INSERT INTO weekly_plan_items (weekly_plan_id,day,time_start,time_end,description,materials,interventions) VALUES (?,?,?,?,?,?,?)')->execute([$pid, $it['day'] ?? 'seg', $it['time_start'] ?? null, $it['time_end'] ?? null, $it['description'] ?? null, $it['materials'] ?? null, $it['interventions'] ?? null]);
  }
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Plano semanal: criado #' . $pid . ' — Aluno #' . $sid . ' — Semana ' . $week;
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, ['id' => $pid]);
}
if ($action === 'plans.list') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  $q = $pdo->prepare('SELECT * FROM weekly_plans WHERE student_id=? ORDER BY week_start DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    $q2 = $pdo->prepare('SELECT * FROM weekly_plan_items WHERE weekly_plan_id=? ORDER BY id');
    $q2->execute([$r['id']]);
    $r['items'] = $q2->fetchAll(PDO::FETCH_ASSOC);
  }
  res(true, $rows);
}

// -------- CLASSES (Turmas) --------
if ($action === 'classes.list') {
  $u = require_auth();
  $course_id = (int)($_GET['course_id'] ?? 0);
  $sql = 'SELECT * FROM classes WHERE 1'; $p=[];
  if ($course_id) { $sql .= ' AND course_id=?'; $p[]=$course_id; }
  $sql .= ' ORDER BY id DESC LIMIT 500';
  $stm=$pdo->prepare($sql); $stm->execute($p);
  res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'classes.create') {
  $u = require_auth();
  $course_id = (int)($B['course_id'] ?? 0);
  $name = trim($B['name'] ?? '');
  if(!$course_id || !$name) res(false,null,'INVALID_INPUT',422);
  $year = $B['year'] ?? null; $sem = $B['semestre'] ?? null; $sched = $B['schedule'] ?? null; $status = $B['status'] ?? 'ativo'; $teacher_id = $B['teacher_id'] ?? null;
  $pdo->prepare('INSERT INTO classes (course_id,name,teacher_id,year,semestre,schedule,status) VALUES (?,?,?,?,?,?,?)')->execute([$course_id,$name,$teacher_id,$year,$sem,$sched,$status]);
  res(true,['id'=>$pdo->lastInsertId()]);
}
if ($action === 'classes.update') {
  $u = require_auth();
  $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $row=$pdo->query('SELECT * FROM classes WHERE id='.$id)->fetch(PDO::FETCH_ASSOC); if(!$row) res(false,null,'NOT_FOUND',404);
  $sets=[]; $vals=[]; foreach(['course_id','name','teacher_id','year','semestre','schedule','status'] as $c){ if(array_key_exists($c,$B)){ $sets[]="$c=?"; $vals[]=$B[$c]; }} if(!$sets) res(false,null,'EMPTY',422); $vals[]=$id;
  $pdo->prepare('UPDATE classes SET '.implode(',', $sets).' WHERE id=?')->execute($vals); res(true,[]);
}
if ($action === 'classes.delete') {
  $u = require_auth();
  $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $pdo->prepare('DELETE FROM classes WHERE id=?')->execute([$id]); res(true,[]);
}
if ($action === 'classes.enroll') {
  $u = require_auth();
  $class_id=(int)($B['class_id'] ?? 0); $student_id=(int)($B['student_id'] ?? 0);
  if(!$class_id || !$student_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO class_enrollments (class_id,student_id) VALUES (?,?) ON DUPLICATE KEY UPDATE status="ativo"')->execute([$class_id,$student_id]); res(true,[]);
}
if ($action === 'classes.unenroll') {
  $u = require_auth();
  $class_id=(int)($B['class_id'] ?? 0); $student_id=(int)($B['student_id'] ?? 0);
  if(!$class_id || !$student_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('DELETE FROM class_enrollments WHERE class_id=? AND student_id=?')->execute([$class_id,$student_id]); res(true,[]);
}
if ($action === 'classes.students') {
  $u = require_auth();
  $class_id=(int)($_GET['class_id'] ?? 0); if(!$class_id) res(false,null,'INVALID_INPUT',422);
  $stm=$pdo->prepare('SELECT s.* FROM class_enrollments ce JOIN students s ON s.id=ce.student_id WHERE ce.class_id=? ORDER BY s.name'); $stm->execute([$class_id]); res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}

// -------- LESSONS (Planos de Aula) --------
if ($action === 'lessons.list') {
  $u = require_auth(); $class_id=(int)($_GET['class_id'] ?? 0); if(!$class_id) res(false,null,'INVALID_INPUT',422);
  $stm=$pdo->prepare('SELECT * FROM lessons WHERE class_id=? ORDER BY COALESCE(date, created_at) DESC'); $stm->execute([$class_id]); res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'lessons.create') {
  $u = require_auth(); $class_id=(int)($B['class_id'] ?? 0); $title=trim($B['title'] ?? ''); if(!$class_id || !$title) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO lessons (class_id,title,content,resources,date,created_by) VALUES (?,?,?,?,?,?)')->execute([$class_id,$title,$B['content'] ?? null,$B['resources'] ?? null,$B['date'] ?? null,$u['id'] ?? null]); res(true,['id'=>$pdo->lastInsertId()]);
}
if ($action === 'lessons.update') {
  $u = require_auth(); $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $sets=[]; $vals=[]; foreach(['title','content','resources','date'] as $c){ if(array_key_exists($c,$B)){ $sets[]="$c=?"; $vals[]=$B[$c]; }} if(!$sets) res(false,null,'EMPTY',422); $vals[]=$id;
  $pdo->prepare('UPDATE lessons SET '.implode(',', $sets).', updated_at=NOW() WHERE id=?')->execute($vals); res(true,[]);
}
if ($action === 'lessons.delete') {
  $u = require_auth(); $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $pdo->prepare('DELETE FROM lessons WHERE id=?')->execute([$id]); res(true,[]);
}

// -------- ASSESSMENTS --------
if ($action === 'assessments.list') {
  $u = require_auth(); $class_id=(int)($_GET['class_id'] ?? 0); if(!$class_id) res(false,null,'INVALID_INPUT',422);
  $stm=$pdo->prepare('SELECT * FROM assessments WHERE class_id=? ORDER BY COALESCE(due_date, created_at) DESC'); $stm->execute([$class_id]); res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'assessments.create') {
  $u = require_auth(); $class_id=(int)($B['class_id'] ?? 0); $title=trim($B['title'] ?? ''); if(!$class_id || !$title) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO assessments (class_id,title,description,max_points,due_date,created_by) VALUES (?,?,?,?,?,?)')->execute([$class_id,$title,$B['description'] ?? null,(int)($B['max_points'] ?? 10),$B['due_date'] ?? null,$u['id'] ?? null]); res(true,['id'=>$pdo->lastInsertId()]);
}
if ($action === 'assessments.update') {
  $u = require_auth(); $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $sets=[]; $vals=[]; foreach(['title','description','max_points','due_date'] as $c){ if(array_key_exists($c,$B)){ $sets[]="$c=?"; $vals[]=$B[$c]; }} if(!$sets) res(false,null,'EMPTY',422); $vals[]=$id;
  $pdo->prepare('UPDATE assessments SET '.implode(',', $sets).', updated_at=NOW() WHERE id=?')->execute($vals); res(true,[]);
}
if ($action === 'assessments.delete') {
  $u = require_auth(); $id=(int)($B['id'] ?? ($_GET['id'] ?? 0)); if(!$id) res(false,null,'INVALID_ID',422);
  $pdo->prepare('DELETE FROM assessments WHERE id=?')->execute([$id]); res(true,[]);
}
if ($action === 'assessments.submissions') {
  $u=require_auth(); $assessment_id=(int)($_GET['assessment_id'] ?? 0); if(!$assessment_id) res(false,null,'INVALID_INPUT',422);
  $stm=$pdo->prepare('SELECT * FROM submissions WHERE assessment_id=? ORDER BY submitted_at DESC'); $stm->execute([$assessment_id]); res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'assessments.submit') {
  $u=require_auth(); $assessment_id=(int)($B['assessment_id'] ?? 0); $student_id=(int)($B['student_id'] ?? 0); $content=$B['content'] ?? null; if(!$assessment_id||!$student_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('INSERT INTO submissions (assessment_id,student_id,content,submitted_at) VALUES (?,?,?,NOW()) ON DUPLICATE KEY UPDATE content=VALUES(content),submitted_at=NOW()')->execute([$assessment_id,$student_id,$content]); res(true,[]);
}
if ($action === 'assessments.grade') {
  $u=require_admin(); $assessment_id=(int)($B['assessment_id'] ?? 0); $student_id=(int)($B['student_id'] ?? 0); $points=isset($B['points'])?(int)$B['points']:null; $feedback=$B['feedback'] ?? null; if(!$assessment_id||!$student_id) res(false,null,'INVALID_INPUT',422);
  $pdo->prepare('UPDATE submissions SET points=?, feedback=?, graded_at=NOW() WHERE assessment_id=? AND student_id=?')->execute([$points,$feedback,$assessment_id,$student_id]); res(true,[]);
}

// -------- AGENDA (Calendar) --------
if ($action === 'agenda.list') {
  $u = require_auth();
  // Garantir tabela
  $pdo->exec('CREATE TABLE IF NOT EXISTS agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(200) NOT NULL,
    date_start DATETIME NULL,
    date_end DATETIME NULL,
    location VARCHAR(200) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $q = trim($_GET['q'] ?? '');
  $start = $_GET['start'] ?? '';
  $end = $_GET['end'] ?? '';
  $sql = 'SELECT * FROM agenda WHERE 1';
  $p = [];
  if ($q) { $sql .= ' AND (title LIKE ? OR location LIKE ? OR notes LIKE ?)'; $p[]='%'.$q.'%'; $p[]='%'.$q.'%'; $p[]='%'.$q.'%'; }
  if ($start) { $sql .= ' AND (date_start IS NULL OR date_start>=?)'; $p[] = $start; }
  if ($end) { $sql .= ' AND (date_end IS NULL OR date_end<=?)'; $p[] = $end; }
  $sql .= ' ORDER BY COALESCE(date_start, created_at) DESC LIMIT 500';
  $stm = $pdo->prepare($sql); $stm->execute($p);
  res(true, $stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'agenda.create') {
  $u = require_auth();
  $pdo->exec('CREATE TABLE IF NOT EXISTS agenda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    title VARCHAR(200) NOT NULL,
    date_start DATETIME NULL,
    date_end DATETIME NULL,
    location VARCHAR(200) NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $title = trim($B['title'] ?? '');
  if (!$title) res(false, null, 'INVALID_INPUT', 422);
  $date_start = $B['date_start'] ?? null;
  $date_end = $B['date_end'] ?? null;
  $location = $B['location'] ?? null;
  $notes = $B['notes'] ?? null;
  $stm = $pdo->prepare('INSERT INTO agenda (user_id,title,date_start,date_end,location,notes,created_at) VALUES (?,?,?,?,?,?,NOW())');
  $stm->execute([$u['id'] ?? null, $title, $date_start, $date_end, $location, $notes]);
  $newId = $pdo->lastInsertId();
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Agenda: criado evento #' . $newId . ' — ' . $title;
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, ['id' => $newId]);
}
if ($action === 'agenda.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? ($_GET['id'] ?? 0));
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $row = $pdo->query('SELECT * FROM agenda WHERE id=' . $id)->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);
  $f = $B;
  $sets = [];
  $vals = [];
  foreach (['title','date_start','date_end','location','notes'] as $c) {
    if (array_key_exists($c, $f)) { $sets[] = "$c=?"; $vals[] = $f[$c]; }
  }
  if (!$sets) res(false, null, 'EMPTY', 422);
  $vals[] = $id;
  $pdo->prepare('UPDATE agenda SET '.implode(',', $sets).' WHERE id=?')->execute($vals);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Agenda: atualizado evento #' . $id . ' — ' . ($f['title'] ?? $row['title']);
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, []);
}
if ($action === 'agenda.delete') {
  $u = require_auth();
  $id = (int)($B['id'] ?? ($_GET['id'] ?? 0));
  if (!$id) res(false, null, 'INVALID_ID', 422);
  // fetch title for log
  $old = $pdo->prepare('SELECT title FROM agenda WHERE id=?');
  $old->execute([$id]);
  $row = $old->fetch(PDO::FETCH_ASSOC);
  $pdo->prepare('DELETE FROM agenda WHERE id=?')->execute([$id]);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $msg = 'Agenda: excluído evento #' . $id . ' — ' . ($row['title'] ?? '');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute([$msg]);
  res(true, []);
}

if ($action === 'attendance.mark') {
  $u = require_auth();
  $sid = (int)($B['student_id'] ?? 0);
  $date = $B['date'] ?? null;
  $period = $B['period'] ?? 'manha';
  if (!$sid || !$date) res(false, null, 'INVALID_INPUT', 422);
  $present = (int)($B['present'] ?? 1);
  $class_id = isset($B['class_id']) ? (int)$B['class_id'] : null;
  $notes = $B['activities'] ?? $B['notes'] ?? null;
  $pdo->prepare('INSERT INTO attendance (student_id,date,period,present,notes,created_at) VALUES (?,?,?,?,?,NOW()) ON DUPLICATE KEY UPDATE present=VALUES(present),notes=VALUES(notes)')->execute([$sid, $date, $period, $present, $notes]);
  res(true, []);
}
if ($action === 'attendance.list') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  $from = $_GET['from'] ?? null;
  $to = $_GET['to'] ?? null;
  $sql = 'SELECT student_id,date,period,present,notes as activities FROM attendance WHERE student_id=?';
  $p = [$sid];
  if ($from) {
    $sql .= ' AND date>=?';
    $p[] = $from;
  }
  if ($to) {
    $sql .= ' AND date<=?';
    $p[] = $to;
  }
  $sql .= ' ORDER BY date DESC';
  $stm = $pdo->prepare($sql);
  $stm->execute($p);
  res(true, $stm->fetchAll(PDO::FETCH_ASSOC));
}
if ($action === 'attendance.class') {
  $u=require_auth();
  $class_id=(int)($_GET['class_id'] ?? 0);
  $date=$_GET['date'] ?? null;
  if(!$class_id) res(false,null,'INVALID_INPUT',422);
  $sql='SELECT a.* FROM attendance a WHERE a.class_id=?';
  $p=[$class_id];
  if($date){ $sql.=' AND a.date=?'; $p[]=$date; }
  $stm=$pdo->prepare($sql.' ORDER BY a.date DESC');
  $stm->execute($p);
  res(true,$stm->fetchAll(PDO::FETCH_ASSOC));
}

if ($action === 'stats') {
  $u = require_auth();
  $tot = (int)$pdo->query('SELECT COUNT(*) FROM students')->fetchColumn();
  $act = (int)$pdo->query('SELECT COUNT(*) FROM students WHERE status="ativo"')->fetchColumn();
  $pdi_conc = (int)$pdo->query('SELECT COUNT(*) FROM pdis WHERE status="concluido"')->fetchColumn();
  $forms_pend = (int)$pdo->query('SELECT COUNT(*) FROM students s LEFT JOIN anamneses a ON a.student_id=s.id GROUP BY s.id HAVING COUNT(a.id)=0')->rowCount();
  
  // Verificar se activity_log existe
  $table_exists = $pdo->query("SHOW TABLES LIKE 'activity_log'")->rowCount() > 0;
  if ($table_exists) {
    $recent = $pdo->query('SELECT id,action,created_at FROM activity_log ORDER BY id DESC LIMIT 10')->fetchAll(PDO::FETCH_ASSOC);
  } else {
    $recent = []; // Tabela não existe ainda
  }
  $apoio = $pdo->query('SELECT st.id,st.name,st.capacity,(SELECT COUNT(*) FROM students s WHERE s.support_teacher_id=st.id AND s.status="ativo") used FROM support_teachers st')->fetchAll(PDO::FETCH_ASSOC);
  foreach ($apoio as &$r) {
    $r['available'] = max(0, $r['capacity'] - (int)$r['used']);
  }
  $srm = $pdo->query('SELECT r.id,r.name,r.capacity,(SELECT COUNT(*) FROM students s WHERE s.srm_room_id=r.id AND s.status="ativo") used FROM srm_rooms r')->fetchAll(PDO::FETCH_ASSOC);
  foreach ($srm as &$r) {
    $r['available'] = max(0, $r['capacity'] - (int)$r['used']);
  }
  $by_mod = $pdo->query('SELECT modalidade,COUNT(*) c FROM students GROUP BY modalidade')->fetchAll(PDO::FETCH_ASSOC);
  $att = $pdo->query('SELECT date,present,COUNT(*) c FROM attendance WHERE date>=DATE_SUB(CURDATE(), INTERVAL 30 DAY) GROUP BY date,present ORDER BY date')->fetchAll(PDO::FETCH_ASSOC);
  $pdi_status = $pdo->query('SELECT status,COUNT(*) c FROM pdis GROUP BY status')->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['cards' => ['total_students' => $tot, 'active_students' => $act, 'pdis_concluidos' => $pdi_conc, 'formularios_pendentes' => $forms_pend], 'recent' => $recent, 'vagas' => ['apoio' => $apoio, 'srm' => $srm], 'charts' => ['students_by_modalidade' => $by_mod, 'attendance_30d' => $att, 'pdi_status' => $pdi_status]]);
}

if ($action === 'reports.student') {
  // $u = require_auth(); // Removido temporariamente para teste
  $sid = (int)($_GET['student_id'] ?? 0);
  
  // Buscar aluno sem verificação de acesso (teste)
  $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  
  if (!$stu) res(false, null, 'NOT_FOUND', 404);
  $a = $pdo->prepare('SELECT id,answers,created_at FROM anamneses WHERE student_id=? ORDER BY id DESC');
  $a->execute([$sid]);
  $anam = $a->fetchAll(PDO::FETCH_ASSOC);
  foreach ($anam as &$r) {
    $r['answers'] = json_decode($r['answers'], true);
  }
  
  // Buscar entrevistas_responsavel e formatar como anamneses
  $entrevistas = $pdo->prepare('SELECT * FROM entrevistas_responsavel WHERE student_id=? ORDER BY created_at DESC');
  $entrevistas->execute([$sid]);
  $entrevistas = $entrevistas->fetchAll(PDO::FETCH_ASSOC);
  $entrevistas_formatted = [];
  foreach ($entrevistas as $ent) {
    $entrevistas_formatted[] = [
      'id' => 'ent_' . $ent['id'],
      'answers' => $ent, // Manter todos os campos estruturados
      'created_at' => $ent['created_at'],
      'tipo' => 'entrevista_responsavel'
    ];
  }
  
  // Combinar anamneses e entrevistas
  $anam = array_merge($anam, $entrevistas_formatted);
  $pdis = $pdo->prepare('SELECT * FROM pdis WHERE student_id=? ORDER BY id DESC');
  $pdis->execute([$sid]);
  $pdis = $pdis->fetchAll(PDO::FETCH_ASSOC);
  foreach ($pdis as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  $pais = $pdo->prepare('SELECT * FROM pais WHERE student_id=? ORDER BY id DESC');
  $pais->execute([$sid]);
  $pais = $pais->fetchAll(PDO::FETCH_ASSOC);
  foreach ($pais as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  $att = $pdo->prepare('SELECT date,period,present,notes as activities FROM attendance WHERE student_id=? ORDER BY date DESC LIMIT 200');
  $att->execute([$sid]);
  $att = $att->fetchAll(PDO::FETCH_ASSOC);
  $wps = $pdo->prepare('SELECT id,week_start,objectives,notes,created_at FROM weekly_plans WHERE student_id=? ORDER BY week_start DESC LIMIT 8');
  $wps->execute([$sid]);
  $wps = $wps->fetchAll(PDO::FETCH_ASSOC);
  // Notas do aluno (histórico livre e análises IA)
  $pdo->exec('CREATE TABLE IF NOT EXISTS student_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NULL,
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    source VARCHAR(50) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    INDEX(student_id)
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $notesQ = $pdo->prepare('SELECT id,student_id,teacher_id,title,content,source,created_at,updated_at FROM student_notes WHERE student_id=? ORDER BY id DESC');
  $notesQ->execute([$sid]);
  $notes = $notesQ->fetchAll(PDO::FETCH_ASSOC);

  res(true, ['student' => $stu, 'anamneses' => $anam, 'pdis' => $pdis, 'pais' => $pais, 'attendance' => $att, 'weekly_plans' => $wps, 'notes' => $notes]);
}


if ($action === 'reports.student.pdf' || ($action === 'reports.student' && ($_GET['format'] ?? '') === 'pdf')) {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  
  // Verificar acesso do professor ao aluno
  if ($u['role'] !== 'admin') {
    $stu = $pdo->prepare('SELECT * FROM students WHERE id=? AND created_by_teacher_id=?');
    $stu->execute([$sid, $u['id']]);
    $stu = $stu->fetch(PDO::FETCH_ASSOC);
  } else {
    $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  }
  
  if (!$stu) {
    res(false, null, 'NOT_FOUND', 404);
  }
  $a = $pdo->prepare('SELECT id,answers,created_at FROM anamneses WHERE student_id=? ORDER BY id DESC');
  $a->execute([$sid]);
  $anam = $a->fetchAll(PDO::FETCH_ASSOC);
  foreach ($anam as &$r) {
    $r['answers'] = json_decode($r['answers'], true);
  }
  
  // Buscar entrevistas_responsavel e formatar como anamneses para o PDF
  $entrevistas = $pdo->prepare('SELECT * FROM entrevistas_responsavel WHERE student_id=? ORDER BY created_at DESC');
  $entrevistas->execute([$sid]);
  $entrevistas = $entrevistas->fetchAll(PDO::FETCH_ASSOC);
  foreach ($entrevistas as $ent) {
    $anam[] = [
      'id' => 'ENT-' . $ent['id'],
      'answers' => $ent,
      'created_at' => $ent['created_at'],
      'tipo' => 'entrevista_responsavel'
    ];
  }
  
  $pdis = $pdo->prepare('SELECT * FROM pdis WHERE student_id=? ORDER BY id DESC');
  $pdis->execute([$sid]);
  $pdis = $pdis->fetchAll(PDO::FETCH_ASSOC);
  foreach ($pdis as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  $pais = $pdo->prepare('SELECT * FROM pais WHERE student_id=? ORDER BY id DESC');
  $pais->execute([$sid]);
  $pais = $pais->fetchAll(PDO::FETCH_ASSOC);
  foreach ($pais as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }
  $att = $pdo->prepare('SELECT date,period,present,notes as activities FROM attendance WHERE student_id=? ORDER BY date DESC LIMIT 200');
  $att->execute([$sid]);
  $att = $att->fetchAll(PDO::FETCH_ASSOC);

  // Relatórios de Atendimento (AEE)
  $ats = $pdo->prepare('SELECT a.id, a.data_atendimento, a.descricao, a.objetivos, a.recursos, a.observacoes, u.name AS teacher_name, u.email AS teacher_email 
                        FROM atendimentos a 
                        LEFT JOIN users u ON u.id = a.teacher_id 
                        WHERE a.student_id = ? 
                        ORDER BY a.data_atendimento DESC, a.id DESC');
  $ats->execute([$sid]);
  $ats = $ats->fetchAll(PDO::FETCH_ASSOC);

  // Professor proprietário do aluno (owner)
  $owner = null;
  if (!empty($stu['created_by_teacher_id'])) {
    $st = $pdo->prepare('SELECT id,name,email,role FROM users WHERE id=?');
    $st->execute([$stu['created_by_teacher_id']]);
    $owner = $st->fetch(PDO::FETCH_ASSOC) ?: null;
  }

  $vendor = __DIR__ . '/vendor/autoload.php';
  if (!file_exists($vendor)) {
    res(false, null, 'MPDF_NOT_INSTALLED', 500);
  }
  require_once $vendor;
  if (!class_exists('\\Mpdf\\Mpdf')) {
    res(false, null, 'MPDF_AUTOLOAD_FAILED', 500);
  }
  $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'A4', 'margin_top' => 12, 'margin_bottom' => 12]);
  $css = 'body{font-family: DejaVu Sans; font-size: 11px; color:#0f172a;} h1{font-size:18px;margin:0 0 6px} h2{font-size:14px;margin:16px 0 8px} .muted{color:#64748b} .tag{display:inline-block;background:#e0f2fe;color:#0369a1;padding:2px 6px;border-radius:6px;font-size:10px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #e2e8f0;padding:6px 8px} th{background:#f1f5f9;text-align:left} .header{display:flex;align-items:center;gap:12px;margin-bottom:8px} .title{font-size:18px;font-weight:bold;margin:0} .sub{color:#475569;font-size:11px;margin:0} .meta{margin:4px 0 12px;color:#475569;font-size:10px}';
  $mpdf->WriteHTML('<style>' . $css . '</style>', 1);
  // Logo (base64) + título
  $logoTag = '';
  $logoFile = realpath(__DIR__ . '/../frontend/icons/logo-icon.png');
  if ($logoFile && file_exists($logoFile)) {
    $imgData = base64_encode(@file_get_contents($logoFile));
    if ($imgData) {
      $logoTag = '<img src="data:image/png;base64,' . $imgData . '" style="height:40px;" />';
    }
  }
  $headerHtml = '<div class="header">' . ($logoTag ?: '') . '<div><div class="title">Relatório do Estudante</div><div class="sub">ConectEDU • AEE</div></div></div>';
  $mpdf->WriteHTML($headerHtml, 2);
  $mpdf->WriteHTML('<div class="muted">' . htmlspecialchars($stu['name']) . ' • Modalidade: ' . strtoupper((string)($stu['modalidade'] ?? '')) . ' • Status: ' . htmlspecialchars((string)($stu['status'] ?? '-')) . ' • CID: ' . ((($stu['cid_code'] ?? '') ?: '-')) . '</div>');
  $mpdf->WriteHTML('<div class="meta">Emitido por: ' . htmlspecialchars($u['name']) . ' (' . htmlspecialchars($u['email'] ?? '') . ') • Gerado em: ' . date('d/m/Y H:i') . '</div>');

  // Bloco de identificação do aluno e professor
  $birth = $stu['birthdate'] ? date('d/m/Y', strtotime($stu['birthdate'])) : '-';
  // Montagem segura do responsável (nome + telefone)
  $respName = isset($stu['responsible_name']) && $stu['responsible_name'] !== '' ? $stu['responsible_name'] : '-';
  $respPhone = isset($stu['responsible_phone']) && $stu['responsible_phone'] !== '' ? '(' . $stu['responsible_phone'] . ')' : '';
  $respFull = trim($respName . ' ' . $respPhone);
  $mpdf->WriteHTML('<h2>Identificação do Estudante e Professor</h2><table><tbody>');
  $mpdf->WriteHTML('<tr><th>Aluno</th><td>' . htmlspecialchars($stu['name']) . '</td><th>Data de Nascimento</th><td>' . $birth . '</td></tr>');
  $mpdf->WriteHTML('<tr><th>Modalidade</th><td>' . strtoupper((string)($stu['modalidade'] ?? '')) . '</td><th>Status</th><td>' . htmlspecialchars((string)($stu['status'] ?? '-')) . '</td></tr>');
  $mpdf->WriteHTML('<tr><th>CID</th><td>' . htmlspecialchars($stu['cid_code'] ?: '-') . '</td><th>Deficiência</th><td>' . htmlspecialchars($stu['disability_type'] ?: '-') . '</td></tr>');
  $mpdf->WriteHTML('<tr><th>Escola</th><td>' . htmlspecialchars($stu['school'] ?: '-') . '</td><th>Série/Turma</th><td>' . htmlspecialchars($stu['class'] ?: '-') . '</td></tr>');
  $mpdf->WriteHTML('<tr><th>Turno</th><td>' . htmlspecialchars($stu['shift'] ?: '-') . '</td><th>Responsável</th><td>' . htmlspecialchars($respFull) . '</td></tr>');
  $mpdf->WriteHTML('<tr><th>Professor (owner)</th><td>' . htmlspecialchars($owner['name'] ?? '-') . '</td><th>E-mail do professor</th><td>' . htmlspecialchars($owner['email'] ?? '-') . '</td></tr>');
  $mpdf->WriteHTML('</tbody></table>');

  $mpdf->WriteHTML('<h2>Anamneses e Entrevistas</h2><table><thead><tr><th>#</th><th>Tipo</th><th>Data</th><th>Resumo</th></tr></thead><tbody>', 2);
  if (count($anam) == 0) {
    $mpdf->WriteHTML('<tr><td colspan="4" class="muted">Sem registros</td></tr>');
  } else {
    foreach ($anam as $r) {
      $sum = '';
      $tipo = isset($r['tipo']) && $r['tipo'] === 'entrevista_responsavel' ? 'Entrevista' : 'Anamnese';
      
      // Se for entrevista, extrair dados diferentes
      if (isset($r['tipo']) && $r['tipo'] === 'entrevista_responsavel') {
        if (isset($r['answers']['nome_responsavel'])) $sum .= 'Resp.: ' . $r['answers']['nome_responsavel'] . '; ';
        if (isset($r['answers']['parentesco'])) $sum .= 'Parentesco: ' . $r['answers']['parentesco'] . '; ';
        if (isset($r['answers']['diagnostico'])) $sum .= 'Diagnóstico: ' . $r['answers']['diagnostico'] . '; ';
        if (isset($r['answers']['medicamentos'])) $sum .= 'Medicamentos: ' . $r['answers']['medicamentos'] . '; ';
      } else {
        // Se for anamnese antiga
        if (isset($r['answers']['ident']['nome'])) $sum .= 'Nome: ' . $r['answers']['ident']['nome'] . '; ';
        if (isset($r['answers']['saude']['deficiencia'])) $sum .= 'Deficiência: ' . $r['answers']['saude']['deficiencia'] . '; ';
      }
      
      $mpdf->WriteHTML('<tr><td>' . $r['id'] . '</td><td>' . $tipo . '</td><td>' . date('d/m/Y H:i', strtotime($r['created_at'])) . '</td><td>' . htmlspecialchars($sum) . '</td></tr>');
    }
  }
  $mpdf->WriteHTML('</tbody></table>');

  $mpdf->WriteHTML('<h2>PDIs</h2><table><thead><tr><th>#</th><th>Período</th><th>Status</th><th>Objetivos</th></tr></thead><tbody>');
  if (count($pdis) == 0) {
    $mpdf->WriteHTML('<tr><td colspan="4" class="muted">Sem registros</td></tr>');
  } else {
    foreach ($pdis as $r) {
      $mpdf->WriteHTML('<tr><td>' . $r['id'] . '</td><td>' . ($r['start_date'] ?: '-') . ' a ' . ($r['end_date'] ?: '-') . '</td><td>' . $r['status'] . '</td><td>' . htmlspecialchars($r['objectives'] ?: '-') . '</td></tr>');
    }
  }
  $mpdf->WriteHTML('</tbody></table>');

  $mpdf->WriteHTML('<h2>PAIs</h2><table><thead><tr><th>#</th><th>Período</th><th>Status</th><th>Serviços</th></tr></thead><tbody>');
  if (count($pais) == 0) {
    $mpdf->WriteHTML('<tr><td colspan="4" class="muted">Sem registros</td></tr>');
  } else {
    foreach ($pais as $r) {
      $mpdf->WriteHTML('<tr><td>' . $r['id'] . '</td><td>' . ($r['start_date'] ?: '-') . ' a ' . ($r['end_date'] ?: '-') . '</td><td>' . $r['status'] . '</td><td>' . htmlspecialchars($r['services'] ?: '-') . '</td></tr>');
    }
  }
  $mpdf->WriteHTML('</tbody></table>');

  // Relatórios de Atendimento (AEE)
  $mpdf->WriteHTML('<h2>Relatórios de Atendimento</h2><table><thead><tr><th>#</th><th>Data</th><th>Professor</th><th>Resumo</th></tr></thead><tbody>');
  if (count($ats) == 0) {
    $mpdf->WriteHTML('<tr><td colspan="4" class="muted">Sem registros</td></tr>');
  } else {
    foreach ($ats as $r) {
      $desc = trim($r['descricao'] ?? '');
      if (mb_strlen($desc) > 140) $desc = mb_substr($desc, 0, 140) . '...';
      $mpdf->WriteHTML('<tr><td>' . $r['id'] . '</td><td>' . date('d/m/Y', strtotime($r['data_atendimento'])) . '</td><td>' . htmlspecialchars($r['teacher_name'] ?: '-') . '</td><td>' . nl2br(htmlspecialchars($desc ?: '-')) . '</td></tr>');
    }
  }
  $mpdf->WriteHTML('</tbody></table>');

  // Detalhamento completo das Entrevistas (somente entrevistas, não anamneses antigas)
  $entrevistasDetalhadas = array_filter($anam, function($r) {
    return isset($r['tipo']) && $r['tipo'] === 'entrevista_responsavel';
  });
  
  if (count($entrevistasDetalhadas) > 0) {
    $mpdf->WriteHTML('<h2>Detalhamento das Entrevistas com Responsável</h2>');
    foreach ($entrevistasDetalhadas as $ent) {
      $ans = $ent['answers'];
      $mpdf->WriteHTML('<h3 style="font-size:12px;margin:12px 0 6px;color:#0369a1;">Entrevista #' . $ent['id'] . ' - ' . date('d/m/Y H:i', strtotime($ent['created_at'])) . '</h3>');
      
      // Dados Básicos
      $mpdf->WriteHTML('<h4 style="font-size:11px;margin:8px 0 4px;color:#1e40af;">📋 Dados Básicos</h4>');
      $mpdf->WriteHTML('<table><tbody>');
      $mpdf->WriteHTML('<tr><th>Nome do Responsável</th><td>' . htmlspecialchars($ans['nome_responsavel'] ?? '-') . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Parentesco</th><td>' . htmlspecialchars($ans['parentesco'] ?? '-') . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Telefone</th><td>' . htmlspecialchars($ans['telefone'] ?? '-') . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Profissão</th><td>' . htmlspecialchars($ans['profissao'] ?? '-') . '</td></tr>');
      $mpdf->WriteHTML('</tbody></table>');
      
      // Histórico Médico
      $mpdf->WriteHTML('<h4 style="font-size:11px;margin:8px 0 4px;color:#dc2626;">🏥 Histórico Médico</h4>');
      $mpdf->WriteHTML('<table><tbody>');
      $mpdf->WriteHTML('<tr><th>Diagnóstico</th><td>' . nl2br(htmlspecialchars($ans['diagnostico'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Laudos Disponíveis</th><td>' . htmlspecialchars($ans['laudos_disponiveis'] ?? '-') . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Tratamentos</th><td>' . nl2br(htmlspecialchars($ans['tratamentos'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Medicamentos</th><td>' . nl2br(htmlspecialchars($ans['medicamentos'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('</tbody></table>');
      
      // Desenvolvimento
      $mpdf->WriteHTML('<h4 style="font-size:11px;margin:8px 0 4px;color:#7c3aed;">🧠 Desenvolvimento</h4>');
      $mpdf->WriteHTML('<table><tbody>');
      $mpdf->WriteHTML('<tr><th>Desenvolvimento Motor</th><td>' . nl2br(htmlspecialchars($ans['desenvolvimento_motor'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Desenvolvimento Cognitivo</th><td>' . nl2br(htmlspecialchars($ans['desenvolvimento_cognitivo'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Desenvolvimento Social</th><td>' . nl2br(htmlspecialchars($ans['desenvolvimento_social'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Comunicação</th><td>' . nl2br(htmlspecialchars($ans['comunicacao'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('</tbody></table>');
      
      // Expectativas
      $mpdf->WriteHTML('<h4 style="font-size:11px;margin:8px 0 4px;color:#ca8a04;">✨ Expectativas e Observações</h4>');
      $mpdf->WriteHTML('<table><tbody>');
      $mpdf->WriteHTML('<tr><th>Expectativas da Família</th><td>' . nl2br(htmlspecialchars($ans['expectativas_familia'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('<tr><th>Observações Gerais</th><td>' . nl2br(htmlspecialchars($ans['observacoes_gerais'] ?? '-')) . '</td></tr>');
      $mpdf->WriteHTML('</tbody></table>');
    }
  }

  $mpdf->WriteHTML('<h2>Frequência (últimos 200)</h2><table><thead><tr><th>Data</th><th>Período</th><th>Status</th><th>Atividades</th></tr></thead><tbody>');
  if (count($att) == 0) {
    $mpdf->WriteHTML('<tr><td colspan="4" class="muted">Sem registros</td></tr>');
  } else {
    foreach ($att as $r) {
      $mpdf->WriteHTML('<tr><td>' . $r['date'] . '</td><td>' . $r['period'] . '</td><td>' . ($r['present'] ? 'Presente' : 'Ausente') . '</td><td>' . htmlspecialchars($r['activities'] ?: '-') . '</td></tr>');
    }
  }
  $mpdf->WriteHTML('</tbody></table>');

  $mpdf->SetFooter('ConectEdu • {DATE d/m/Y H:i} • Página {PAGENO}/{nb}');
  $mpdf->Output('relatorio-' . $sid . '.pdf', 'I');
  exit;
}



/** --------------- PDFs individuais (Anamnese/Entrevista, PDI, PAI) --------------- */
if ($action === 'forms.anamnese.pdf') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  
  // Verificar acesso do professor ao aluno
  if ($u['role'] !== 'admin') {
    $stu = $pdo->prepare('SELECT * FROM students WHERE id=? AND created_by_teacher_id=?');
    $stu->execute([$sid, $u['id']]);
    $stu = $stu->fetch(PDO::FETCH_ASSOC);
  } else {
    $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  }
  
  if (!$stu) {
    res(false, null, 'NOT_FOUND', 404);
  }
  $q = $pdo->prepare('SELECT id,answers,created_at FROM anamneses WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    $r['answers'] = json_decode($r['answers'], true);
  }

  $vendor = __DIR__ . '/vendor/autoload.php';
  if (!file_exists($vendor)) res(false, null, 'MPDF_NOT_INSTALLED', 500);
  require_once $vendor;
  $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'A4', 'margin_top' => 12, 'margin_bottom' => 12]);
  $css = 'body{font-family:DejaVu Sans;font-size:11px} h1{font-size:18px;margin:0 0 6px} h2{font-size:14px;margin:12px 0 6px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #e2e8f0;padding:6px 8px} th{background:#f1f5f9} .muted{color:#64748b}';
  $mpdf->WriteHTML('<style>' . $css . '</style>', 1);
  $mpdf->WriteHTML('<h1>Entrevistas / Anamnese</h1><div class="muted">' . $stu['name'] . ' • Modalidade: ' . strtoupper($stu['modalidade']) . ' • CID: ' . ($stu['cid_code'] ?: '-') . '</div>', 2);
  if (count($rows) == 0) {
    $mpdf->WriteHTML('<p class="muted">Sem entrevistas registradas.</p>');
  }
  foreach ($rows as $r) {
    $a = $r['answers'];
    $mpdf->WriteHTML('<h2>#' . $r['id'] . ' — ' . $r['created_at'] . '</h2>');
    $mpdf->WriteHTML('<table><tbody>');
    $mpdf->WriteHTML('<tr><th colspan="2">Identificação</th></tr>');
    $mpdf->WriteHTML('<tr><td>Nome escola</td><td>' . htmlspecialchars($a['ident']['escola'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Série/Ano</td><td>' . htmlspecialchars($a['ident']['serie'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Turno</td><td>' . htmlspecialchars($a['ident']['turno'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Família</th></tr>');
    $mpdf->WriteHTML('<tr><td>Composição</td><td>' . htmlspecialchars($a['familia']['composicao'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Hábitos</td><td>' . htmlspecialchars($a['familia']['habitos'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Gestação/Nascimento</th></tr>');
    $mpdf->WriteHTML('<tr><td>Planejada</td><td>' . htmlspecialchars($a['gestacao']['planejada'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Saúde da mãe</td><td>' . htmlspecialchars($a['gestacao']['saude_mae'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Tipo de parto</td><td>' . htmlspecialchars($a['gestacao']['parto'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Saúde</th></tr>');
    $mpdf->WriteHTML('<tr><td>Deficiência</td><td>' . htmlspecialchars($a['saude']['deficiencia'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Medicações</td><td>' . htmlspecialchars($a['saude']['medicacao'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Desenvolvimento/Comunicação</th></tr>');
    $mpdf->WriteHTML('<tr><td>Comunicação</td><td>' . htmlspecialchars($a['desenvolvimento']['comunicacao'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">AVDs</th></tr>');
    $mpdf->WriteHTML('<tr><td>Alimentação independente</td><td>' . htmlspecialchars($a['avd']['alimentacao'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Vida Escolar</th></tr>');
    $mpdf->WriteHTML('<tr><td>Adaptação</td><td>' . htmlspecialchars($a['escola']['adaptacao'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('</tbody></table>');
  }
  $mpdf->SetFooter('ConectEdu • Anamnese • {DATE d/m/Y H:i} • Página {PAGENO}/{nb}');
  $mpdf->Output('anamnese-' . $sid . '.pdf', 'I');
  exit;
}

if ($action === 'pdi.pdf') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  
  // Verificar acesso do professor ao aluno
  if ($u['role'] !== 'admin') {
    $stu = $pdo->prepare('SELECT * FROM students WHERE id=? AND created_by_teacher_id=?');
    $stu->execute([$sid, $u['id']]);
    $stu = $stu->fetch(PDO::FETCH_ASSOC);
  } else {
    $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  }
  
  if (!$stu) {
    res(false, null, 'NOT_FOUND', 404);
  }
  $q = $pdo->prepare('SELECT * FROM pdis WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }

  $vendor = __DIR__ . '/vendor/autoload.php';
  if (!file_exists($vendor)) res(false, null, 'MPDF_NOT_INSTALLED', 500);
  require_once $vendor;
  $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'A4', 'margin_top' => 12, 'margin_bottom' => 12]);
  $css = 'body{font-family:DejaVu Sans;font-size:11px} h1{font-size:18px;margin:0 0 6px} h2{font-size:14px;margin:12px 0 6px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #e2e8f0;padding:6px 8px} th{background:#f1f5f9} .muted{color:#64748b}';
  $mpdf->WriteHTML('<style>' . $css . '</style>', 1);
  $mpdf->WriteHTML('<h1>Plano de Desenvolvimento Individual (PDI)</h1><div class="muted">' . $stu['name'] . ' • Modalidade: ' . strtoupper($stu['modalidade']) . ' • CID: ' . ($stu['cid_code'] ?: '-') . '</div>', 2);

  if (count($rows) == 0) {
    $mpdf->WriteHTML('<p class="muted">Sem PDIs cadastrados.</p>');
  }
  foreach ($rows as $r) {
    $d = $r['details'] ?: [];
    $mpdf->WriteHTML('<h2>#' . $r['id'] . ' — ' . $r['start_date'] . ' a ' . $r['end_date'] . ' — Status: ' . $r['status'] . '</h2>');
    // Dados Estudante/Institucionais
    $mpdf->WriteHTML('<table><tbody>');
    $mpdf->WriteHTML('<tr><th colspan="2">Dados do Estudante</th></tr>');
    $mpdf->WriteHTML('<tr><td>Responsável</td><td>' . htmlspecialchars($d['dados']['responsavel'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Deficiência informada</td><td>' . htmlspecialchars($d['dados']['deficiencia'] ?? '-') . '</td></tr>');
    // Aspectos Psicomotores (resumo simples)
    $mpdf->WriteHTML('<tr><th colspan="2">Aspectos Psicomotores (resumo)</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . htmlspecialchars($d['psicomotor']['resumo'] ?? '-') . '</td></tr>');
    // Aspectos Pedagógicos/Cognitivos
    $mpdf->WriteHTML('<tr><th colspan="2">Aspectos Pedagógicos/Cognitivos (resumo)</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . htmlspecialchars($d['cognitivo']['resumo'] ?? '-') . '</td></tr>');
    // Comunicação e Linguagem
    $mpdf->WriteHTML('<tr><th colspan="2">Comunicação e Linguagem</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . htmlspecialchars($d['comunicacao']['resumo'] ?? '-') . '</td></tr>');
    // Objetivos / Estratégias
    $mpdf->WriteHTML('<tr><th colspan="2">Objetivos</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($r['objectives'] ?: '-')) . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Estratégias</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($r['strategies'] ?: '-')) . '</td></tr>');
    $mpdf->WriteHTML('</tbody></table>');
  }
  $mpdf->SetFooter('ConectEdu • PDI • {DATE d/m/Y H:i} • Página {PAGENO}/{nb}');
  $mpdf->Output('pdi-' . $sid . '.pdf', 'I');
  exit;
}

if ($action === 'pai.pdf') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? 0);
  
  // Verificar acesso do professor ao aluno
  if ($u['role'] !== 'admin') {
    $stu = $pdo->prepare('SELECT * FROM students WHERE id=? AND created_by_teacher_id=?');
    $stu->execute([$sid, $u['id']]);
    $stu = $stu->fetch(PDO::FETCH_ASSOC);
  } else {
    $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  }
  
  if (!$stu) {
    res(false, null, 'NOT_FOUND', 404);
  }
  $q = $pdo->prepare('SELECT * FROM pais WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  foreach ($rows as &$r) {
    if ($r['details']) $r['details'] = json_decode($r['details'], true);
  }

  $vendor = __DIR__ . '/vendor/autoload.php';
  if (!file_exists($vendor)) res(false, null, 'MPDF_NOT_INSTALLED', 500);
  require_once $vendor;
  $mpdf = new \Mpdf\Mpdf(['mode' => 'utf-8', 'format' => 'A4', 'margin_top' => 12, 'margin_bottom' => 12]);
  $css = 'body{font-family:DejaVu Sans;font-size:11px} h1{font-size:18px;margin:0 0 6px} h2{font-size:14px;margin:12px 0 6px} table{border-collapse:collapse;width:100%} th,td{border:1px solid #e2e8f0;padding:6px 8px} th{background:#f1f5f9} .muted{color:#64748b}';
  $mpdf->WriteHTML('<style>' . $css . '</style>', 1);
  $mpdf->WriteHTML('<h1>Plano de Atendimento Individual (PAI)</h1><div class="muted">' . $stu['name'] . ' • Modalidade: ' . strtoupper($stu['modalidade']) . ' • CID: ' . ($stu['cid_code'] ?: '-') . '</div>', 2);

  if (count($rows) == 0) {
    $mpdf->WriteHTML('<p class="muted">Sem PAIs cadastrados.</p>');
  }
  foreach ($rows as $r) {
    $d = $r['details'] ?: [];
    $mpdf->WriteHTML('<h2>#' . $r['id'] . ' — ' . $r['start_date'] . ' a ' . $r['end_date'] . ' — Status: ' . $r['status'] . '</h2>');
    $mpdf->WriteHTML('<table><tbody>');
    $mpdf->WriteHTML('<tr><th colspan="2">Identificação</th></tr>');
    $mpdf->WriteHTML('<tr><td>Professor AEE</td><td>' . htmlspecialchars($d['ident']['prof_aee'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><td>Outros profissionais</td><td>' . htmlspecialchars($d['ident']['outros_prof'] ?? '-') . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Histórico & Contexto</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($d['historico']['resumo'] ?? '-')) . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Avaliação Diagnóstica</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($d['avaliacao']['resumo'] ?? '-')) . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Objetivos SMART</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($r['goals'] ?: '-')) . '</td></tr>');
    $mpdf->WriteHTML('<tr><th colspan="2">Serviços/Recursos</th></tr>');
    $mpdf->WriteHTML('<tr><td colspan="2">' . nl2br(htmlspecialchars($r['services'] ?: '-')) . '</td></tr>');
    $mpdf->WriteHTML('</tbody></table>');
  }
  $mpdf->SetFooter('ConectEdu • PAI • {DATE d/m/Y H:i} • Página {PAGENO}/{nb}');
  $mpdf->Output('pai-' . $sid . '.pdf', 'I');
  exit;
}


if ($action === 'ai.evaluate_student') {
  $u = require_auth();
  $sid = (int)($_GET['student_id'] ?? ($B['student_id'] ?? 0));
  if (!$sid) res(false, null, 'INVALID_STUDENT', 422);
  $stu = $pdo->query('SELECT * FROM students WHERE id=' . $sid)->fetch(PDO::FETCH_ASSOC);
  if (!$stu) res(false, null, 'NOT_FOUND', 404);
  $report = json_decode(file_get_contents('http://localhost' . $_SERVER['SCRIPT_NAME'] . '?action=reports.student&student_id=' . $sid), true);
  $messages = [
    ['role' => 'system', 'content' => 'Você é um especialista em AEE. Saída STRICT JSON com chaves: resumo, forcas[], desafios[], objetivos_smart[], estrategias_recomendadas[].'],
    ['role' => 'user', 'content' => json_encode(['aluno' => $stu, 'dados' => $report['data']], JSON_UNESCAPED_UNICODE)]
  ];
  $txt = openai_chat($messages, 0.2);
  $j = json_decode($txt, true);
  if (!$j) {
    $j = ['resumo' => $txt];
  }
  res(true, $j);
}

// ---------------------- Student Notes (histórico de análises/observações) ----------------------
if ($action === 'student_notes.list') {
  $u = require_auth();
  $pdo = db();
  // tabela
  $pdo->exec('CREATE TABLE IF NOT EXISTS student_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NULL,
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    source VARCHAR(50) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    INDEX(student_id)
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $sid = (int)($_GET['student_id'] ?? $_GET['aluno_id'] ?? 0);
  if (!$sid) res(false, null, 'MISSING_STUDENT_ID', 422);
  $q = $pdo->prepare('SELECT id,student_id,teacher_id,title,content,source,created_at,updated_at FROM student_notes WHERE student_id=? ORDER BY id DESC');
  $q->execute([$sid]);
  $rows = $q->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows]);
}

if ($action === 'student_notes.create') {
  $u = require_auth();
  $pdo = db();
  $pdo->exec('CREATE TABLE IF NOT EXISTS student_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    teacher_id INT NULL,
    title VARCHAR(255) NULL,
    content TEXT NOT NULL,
    source VARCHAR(50) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,
    INDEX(student_id)
  ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $B = body();
  $sid = (int)($B['student_id'] ?? 0);
  $title = trim($B['title'] ?? '') ?: null;
  $content = trim($B['content'] ?? '');
  $source = trim($B['source'] ?? 'manual');
  if (!$sid || !$content) res(false, null, 'INVALID_INPUT', 422);
  $stm = $pdo->prepare('INSERT INTO student_notes (student_id,teacher_id,title,content,source,created_at) VALUES (?,?,?,?,?,NOW())');
  $stm->execute([$sid, $u['id'] ?? null, $title, $content, $source]);
  $id = $pdo->lastInsertId();
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Nota aluno: criada #'.$id.' — Aluno #'.$sid]);
  res(true, ['id' => (int)$id]);
}

if ($action === 'student_notes.update') {
  $u = require_auth();
  $pdo = db();
  $id = (int)($_GET['id'] ?? $_POST['id'] ?? 0);
  if (!$id) res(false, null, 'MISSING_ID', 422);
  $B = body();
  $title = isset($B['title']) ? (trim($B['title']) ?: null) : null;
  $content = $B['content'] ?? null;
  if ($content === null) res(false, null, 'INVALID_INPUT', 422);
  $stm = $pdo->prepare('UPDATE student_notes SET title=?, content=?, updated_at=NOW() WHERE id=?');
  $stm->execute([$title, $content, $id]);
  // log
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Nota aluno: atualizada #'.$id]);
  res(true, ['id' => $id]);
}

// (fallback no final do arquivo)
// Endpoints para Entrevistas com Responsável
if ($action === 'entrevistas-responsavel.create') {
  $u = require_auth();
  $f = $B;
  // Campo nome_estudante não é mais obrigatório; derivar do student_id quando possível
  if (($f['student_id'] ?? null) && !($f['nome_estudante'] ?? '')) {
    $sid = (int)$f['student_id'];
    $q = $pdo->prepare('SELECT name FROM students WHERE id=?');
    $q->execute([$sid]);
    $nm = $q->fetchColumn();
    if ($nm) $f['nome_estudante'] = $nm;
  }

  $cols = ['student_id', 'data_entrevista', 'tipo_entrevista', 'motivo_entrevista', 'nome_estudante', 'naturalidade', 'nome_escola', 'serie_ano', 'turno', 'nome_pai', 'idade_pai', 'escolaridade_pai', 'nome_mae', 'idade_mae', 'escolaridade_mae', 'endereco', 'bairro', 'cidade', 'telefone', 'composicao_familia_concepcao', 'tem_irmaos', 'quantidade_irmaos', 'idades_irmaos', 'situacao_pais', 'vida_social_familia', 'habito_familiar', 'beneficios_sociais', 'gravidez_planejada', 'experiencia_gestacao', 'saude_mae_gestacao', 'estado_emocional_mae', 'fez_prenatal', 'mes_inicio_prenatal', 'tratamento_necessario', 'qual_tratamento', 'tipo_parto', 'nasceu_tempo_normal', 'observacoes_nascimento', 'bebe_necessitou_oxigenio', 'bebe_teve_convulsao', 'bebe_ictericia', 'bebe_incubadora', 'foi_amamentado', 'amamentado_ate_idade', 'problemas_alimentacao', 'alimentacao_atual'];

  $vals = [];
  $ph = [];
  foreach ($cols as $c) {
    if (isset($f[$c])) {
      $vals[$c] = $f[$c];
      $ph[] = '?';
    }
  }

  $sql = 'INSERT INTO entrevistas_responsavel (' . implode(',', array_keys($vals)) . ',created_at,updated_at) VALUES (' . implode(',', $ph) . ',NOW(),NOW())';
  $pdo->prepare($sql)->execute(array_values($vals));
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id]);
}

if ($action === 'entrevistas-responsavel.list') {
  // $u = require_auth(); // Removido temporariamente para teste
  $q = $_GET['q'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per = min(200, max(1, (int)($_GET['per_page'] ?? 50)));
  $student_id = (int)($_GET['student_id'] ?? 0);

  $sql = 'SELECT * FROM entrevistas_responsavel WHERE 1';
  $p = [];
  if ($q) { $sql .= ' AND nome_estudante LIKE ?'; $p[] = '%' . $q . '%'; }
  if ($student_id) { $sql .= ' AND student_id = ?'; $p[] = $student_id; }

  $stm = $pdo->prepare($sql . ' ORDER BY id DESC LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
  $stm->execute($p);
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows, 'page' => $page, 'per_page' => $per]);
}

if ($action === 'entrevistas-responsavel.get') {
  $u = require_auth();
  $id = (int)($_GET['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);

  $q = $pdo->prepare('SELECT * FROM entrevistas_responsavel WHERE id=?');
  $q->execute([$id]);
  $row = $q->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);

  res(true, $row);
}

if ($action === 'entrevistas-responsavel.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  // Montar update dinâmico com base nos campos enviados
  $allow = ['data_entrevista','tipo_entrevista','motivo_entrevista','nome_estudante','naturalidade','nome_escola','serie_ano','turno','nome_pai','idade_pai','escolaridade_pai','nome_mae','idade_mae','escolaridade_mae','endereco','bairro','cidade','telefone','composicao_familia_concepcao','tem_irmaos','quantidade_irmaos','idades_irmaos','situacao_pais','vida_social_familia','habito_familiar','beneficios_sociais','gravidez_planejada','experiencia_gestacao','saude_mae_gestacao','estado_emocional_mae','fez_prenatal','mes_inicio_prenatal','tratamento_necessario','qual_tratamento','tipo_parto','nasceu_tempo_normal','observacoes_nascimento','bebe_necessitou_oxigenio','bebe_teve_convulsao','bebe_ictericia','bebe_incubadora','foi_amamentado','amamentado_ate_idade','problemas_alimentacao','alimentacao_atual'];
  $sets=[];$vals=[];
  foreach ($allow as $f) { if (array_key_exists($f,$B)) { $sets[] = "$f = ?"; $vals[] = $B[$f]; } }
  if (!$sets) res(false, null, 'NO_FIELDS', 422);
  $sql = 'UPDATE entrevistas_responsavel SET ' . implode(',', $sets) . ', updated_at=NOW() WHERE id=?';
  $vals[] = $id;
  $pdo->prepare($sql)->execute($vals);
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Entrevista: atualizada #'.$id]);
  res(true, ['id'=>$id]);
}

// Endpoints para PDI ConectAEE
if ($action === 'pdi-conectaee.create') {
  $u = require_auth();
  $f = $B;
  // Campo nome_aluno não é mais obrigatório; tentar preencher a partir de student_id se disponível
  if (($f['student_id'] ?? null) && !($f['nome_aluno'] ?? '')) {
    $sid = (int)$f['student_id'];
    $q = $pdo->prepare('SELECT name FROM students WHERE id=?');
    $q->execute([$sid]);
    $nm = $q->fetchColumn();
    if ($nm) $f['nome_aluno'] = $nm;
  }

  $cols = ['nome_aluno', 'escola', 'ano_serie', 'professor_aee', 'periodo', 'diagnostico', 'caracteristicas', 'habilidades', 'dificuldades', 'objetivo_geral', 'objetivos_especificos', 'estrategias', 'recursos', 'tecnologia_assistiva', 'criterios_avaliacao', 'periodicidade_revisao'];

  $vals = [];
  $ph = [];
  foreach ($cols as $c) {
    if (isset($f[$c])) {
      $vals[$c] = $f[$c];
      $ph[] = '?';
    }
  }

  $sql = 'INSERT INTO pdi_conectaee (' . implode(',', array_keys($vals)) . ',created_at,updated_at) VALUES (' . implode(',', $ph) . ',NOW(),NOW())';
  $pdo->prepare($sql)->execute(array_values($vals));
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id]);
}

if ($action === 'pdi-conectaee.list') {
  $u = require_auth();
  $q = $_GET['q'] ?? '';
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per = min(200, max(1, (int)($_GET['per_page'] ?? 50)));

  $sql = 'SELECT * FROM pdi_conectaee WHERE 1';
  $p = [];
  if ($q) {
    $sql .= ' AND nome_aluno LIKE ?';
    $p[] = '%' . $q . '%';
  }

  $stm = $pdo->prepare($sql . ' ORDER BY id DESC LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
  $stm->execute($p);
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows, 'page' => $page, 'per_page' => $per]);
}

// Endpoints para Planos de Atendimento Individual
if ($action === 'planos-atendimento.create') {
  $u = require_auth();
  $f = $B;
  // Campo nome_aluno não é mais obrigatório; tentar preencher a partir de student_id se disponível
  if (($f['student_id'] ?? null) && !($f['nome_aluno'] ?? '')) {
    $sid = (int)$f['student_id'];
    $q = $pdo->prepare('SELECT name FROM students WHERE id=?');
    $q->execute([$sid]);
    $nm = $q->fetchColumn();
    if ($nm) $f['nome_aluno'] = $nm;
  }

  $cols = ['nome_aluno', 'matricula', 'escola_origem', 'tipo_necessidade', 'descricao_necessidades', 'objetivo_geral', 'objetivos_especificos', 'atividades', 'metodologia', 'recursos_didaticos', 'frequencia_semanal', 'duracao_sessao', 'periodo_atendimento', 'horarios_especificos', 'instrumentos_avaliacao', 'criterios_avaliacao', 'periodicidade_revisao', 'observacoes'];

  $vals = [];
  $ph = [];
  foreach ($cols as $c) {
    if (isset($f[$c])) {
      $vals[$c] = $f[$c];
      $ph[] = '?';
    }
  }

  $sql = 'INSERT INTO planos_atendimento (' . implode(',', array_keys($vals)) . ',created_at,updated_at) VALUES (' . implode(',', $ph) . ',NOW(),NOW())';
  $pdo->prepare($sql)->execute(array_values($vals));
  $id = $pdo->lastInsertId();
  res(true, ['id' => $id]);
}

if ($action === 'planos-atendimento.list') {
  $u = require_auth();
  $q = $_GET['q'] ?? '';
  $sid = (int)($_GET['student_id'] ?? 0);
  $page = max(1, (int)($_GET['page'] ?? 1));
  $per = min(200, max(1, (int)($_GET['per_page'] ?? 50)));

  $sql = 'SELECT * FROM planos_atendimento WHERE 1';
  $p = [];
  if ($q) {
    $sql .= ' AND nome_aluno LIKE ?';
    $p[] = '%' . $q . '%';
  }
  if ($sid) {
    // Tentar identificar por nome do aluno
    $qs = $pdo->prepare('SELECT name FROM students WHERE id=?');
    $qs->execute([$sid]);
    $nm = $qs->fetchColumn();
    if ($nm) {
      $sql .= ' AND nome_aluno = ?';
      $p[] = $nm;
    }
  }

  $stm = $pdo->prepare($sql . ' ORDER BY id DESC LIMIT ' . $per . ' OFFSET ' . (($page - 1) * $per));
  $stm->execute($p);
  $rows = $stm->fetchAll(PDO::FETCH_ASSOC);
  res(true, ['rows' => $rows, 'page' => $page, 'per_page' => $per]);
}

if ($action === 'planos-atendimento.update') {
  $u = require_auth();
  $id = (int)($B['id'] ?? 0);
  if (!$id) res(false, null, 'INVALID_ID', 422);
  $allow = ['nome_escola','nome_aluno','data_nascimento','idade','serie_ano','turno','nome_responsavel','telefone_contato','endereco_residencial','diagnostico_cid','professor_regente','professor_aee','outros_profissionais','data_elaboracao','data_avaliacao_diagnostica','periodo_vigencia','data_prevista_reavaliacao','historico_escolar','historico_familiar_social','interesses_preferencias','dificuldades','potencialidades_observadas','oralidade','compreensao','expressao_verbal','clareza_frases_completas','interage_verbalmente','escreve','grafia_legivel','escreve_certo','producao_textos','copia','faz_garatujas','desenha','leitura_nivel','comunicacao_nao_verbal','raciocinio_logico_matematico','conceitos_academicos','atencao_concentracao','memoria','organizacao_planejamento','interacao_social','autonomia_independencia','manejo_emocoes','comportamento_sala','coordenacao_motora_fina','coordenacao_motora_grossa','orientacao_espacial_temporal','percepcao_visual_auditiva','objetivo_geral','objetivos_especificos','adaptacoes_curriculares','recursos_didaticos_tecnologias','estrategias_ensino','adaptacoes_ambiente_escolar','atendimento_aee','envolvimento_familia','articulacao_outros_profissionais','criterios_avaliacao','periodicidade_reavaliacoes','registro_progresso','professor_regente_assinatura','professor_aee_assinatura','coordenacao_pedagogica_assinatura','direcao_escolar_assinatura','responsavel_aluno_assinatura'];
  $sets=[];$vals=[];
  foreach ($allow as $f) { if (array_key_exists($f,$B)) { $sets[] = "$f = ?"; $vals[] = $B[$f]; } }
  if (!$sets) res(false, null, 'NO_FIELDS', 422);
  $sql = 'UPDATE planos_atendimento SET ' . implode(',', $sets) . ', updated_at=NOW() WHERE id=?';
  $vals[] = $id;
  $pdo->prepare($sql)->execute($vals);
  $pdo->exec('CREATE TABLE IF NOT EXISTS activity_log (id INT AUTO_INCREMENT PRIMARY KEY, message VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4');
  $pdo->prepare('INSERT INTO activity_log (message,created_at) VALUES (?,NOW())')->execute(['Plano Atendimento: atualizado #'.$id]);
  res(true, ['id'=>$id]);
}

// Endpoint para estatísticas do dashboard
if ($action === 'dashboard.stats') {
  $u = require_auth();

  $stats = [];

  // Total de alunos
  $q = $pdo->query('SELECT COUNT(*) as total FROM students WHERE status="ativo"');
  $stats['alunos'] = $q->fetch(PDO::FETCH_ASSOC)['total'];

  // Cursos ativos (usando uma estimativa baseada em modalidades)
  $q = $pdo->query('SELECT COUNT(DISTINCT modalidade) as total FROM students WHERE status="ativo"');
  $stats['cursos'] = $q->fetch(PDO::FETCH_ASSOC)['total'];

  // Eventos hoje (usando planos semanais como proxy)
  $stats['eventos_hoje'] = 5; // Valor fixo para demonstração

  // Formulários AEE
  $entrevistas = $pdo->query('SELECT COUNT(*) as total FROM entrevistas_responsavel')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
  $pdis = $pdo->query('SELECT COUNT(*) as total FROM pdi_conectaee')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
  $planos = $pdo->query('SELECT COUNT(*) as total FROM planos_atendimento')->fetch(PDO::FETCH_ASSOC)['total'] ?? 0;
  $stats['formularios'] = $entrevistas + $pdis + $planos;

  res(true, $stats);
}

// Endpoint para atividades recentes
if ($action === 'dashboard.atividades') {
  $u = require_auth();

  $atividades = [
    ['descricao' => 'Nova entrevista com responsável cadastrada', 'data' => '2 horas atrás'],
    ['descricao' => 'PDI atualizado para aluno João Silva', 'data' => '1 dia atrás'],
    ['descricao' => 'Plano de atendimento criado', 'data' => '2 dias atrás'],
    ['descricao' => 'Relatório de frequência gerado', 'data' => '3 dias atrás'],
    ['descricao' => 'Novo aluno cadastrado no sistema', 'data' => '1 semana atrás']
  ];

  res(true, $atividades);
}

// Endpoint para relatórios de atendimento
// Atendimentos - GET lista / POST cria
if ($action === 'atendimentos' && $_SERVER['REQUEST_METHOD'] === 'GET') {
  $u = require_auth();
  
  $params = [];
  $where = ' WHERE 1=1';
  
  // Filtro opcional por aluno
  $studentFilter = isset($_GET['student_id']) ? (int)$_GET['student_id'] : (isset($_GET['aluno_id']) ? (int)$_GET['aluno_id'] : 0);
  if ($studentFilter > 0) {
    $where .= ' AND a.student_id = ?';
    $params[] = $studentFilter;
  }
  
  // Filtrar por professor se não for admin
  if ($u['role'] !== 'admin') {
    $where .= ' AND a.teacher_id = ?';
    $params[] = $u['id'];
  }
  
  $sql = "SELECT a.*, s.name as student_name 
          FROM atendimentos a 
          LEFT JOIN students s ON a.student_id = s.id" . $where . " 
          ORDER BY a.data_atendimento DESC, a.id DESC";
          
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, ['rows' => $rows]);
}

// Endpoint para criar novo relatório de atendimento
if ($action === 'atendimentos' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $u = require_auth();
  
  $input = json_decode(file_get_contents('php://input'), true);
  if (!$input) {
    res(false, null, 'INVALID_JSON', 400);
  }
  
  $student_id = (int)($input['student_id'] ?? 0);
  $data_atendimento = $input['data_atendimento'] ?? '';
  $descricao = trim($input['descricao'] ?? '');
  $objetivos = trim($input['objetivos'] ?? '');
  $recursos = trim($input['recursos'] ?? '');
  $observacoes = trim($input['observacoes'] ?? '');
  $teacher_id = $input['teacher_id'] ?? $u['id'];
  
  if (!$student_id || !$data_atendimento || !$descricao) {
    res(false, null, 'MISSING_REQUIRED_FIELDS', 400);
  }
  
  // Verificar se o professor tem acesso ao aluno
  if ($u['role'] !== 'admin' && $teacher_id != $u['id']) {
    res(false, null, 'UNAUTHORIZED', 403);
  }
  
  if ($u['role'] !== 'admin') {
    // Busca ownership do aluno
    $stmt = $pdo->prepare('SELECT created_by_teacher_id FROM students WHERE id = ?');
    $stmt->execute([$student_id]);
    $stuRow = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$stuRow) {
      res(false, null, 'STUDENT_NOT_FOUND', 404);
    }
    // Se aluno ainda não tem professor associado, faz o "claim" para o professor atual
    if ($stuRow['created_by_teacher_id'] === null) {
      $upd = $pdo->prepare('UPDATE students SET created_by_teacher_id = ? WHERE id = ?');
      $upd->execute([$u['id'], $student_id]);
    } elseif ((int)$stuRow['created_by_teacher_id'] !== (int)$u['id']) {
      res(false, null, 'FORBIDDEN_STUDENT', 403);
    }
  }
  
  $stmt = $pdo->prepare('INSERT INTO atendimentos (student_id, teacher_id, data_atendimento, descricao, objetivos, recursos, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)');
  $result = $stmt->execute([$student_id, $teacher_id, $data_atendimento, $descricao, $objetivos, $recursos, $observacoes]);
  
  if ($result) {
    res(true, ['id' => $pdo->lastInsertId()]);
  } else {
    res(false, null, 'CREATE_FAILED', 500);
  }
}

// Endpoint para deletar relatório de atendimento
if (preg_match('/^atendimentos\/(\d+)$/', $pathInfo, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $u = require_auth();
  $id = (int)$matches[1];
  
  // Verificar se o atendimento existe e se o professor tem acesso
  if ($u['role'] !== 'admin') {
    $stmt = $pdo->prepare('SELECT id FROM atendimentos WHERE id = ? AND teacher_id = ?');
    $stmt->execute([$id, $u['id']]);
    if (!$stmt->fetch()) {
      res(false, null, 'NOT_FOUND', 404);
    }
  }
  
  $stmt = $pdo->prepare('DELETE FROM atendimentos WHERE id = ?');
  $result = $stmt->execute([$id]);
  
  if ($result) {
    res(true, null);
  } else {
    res(false, null, 'DELETE_FAILED', 500);
  }
}

// Endpoint para atualizar relatório de atendimento
if (preg_match('/^atendimentos\/(\d+)$/', $pathInfo, $matches) && in_array($_SERVER['REQUEST_METHOD'], ['PUT','POST','PATCH'])) {
  $u = require_auth();
  $id = (int)$matches[1];

  // Buscar registro existente
  $stmt = $pdo->prepare('SELECT * FROM atendimentos WHERE id = ?');
  $stmt->execute([$id]);
  $row = $stmt->fetch(PDO::FETCH_ASSOC);
  if (!$row) res(false, null, 'NOT_FOUND', 404);

  // Verificar permissão de edição (somente dono ou admin)
  if ($u['role'] !== 'admin' && (int)$row['teacher_id'] !== (int)$u['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }

  $B = body();
  if (!$B) res(false, null, 'INVALID_JSON', 400);

  $allowed = ['data_atendimento','descricao','objetivos','recursos','observacoes','student_id'];
  $sets = [];
  $params = [];

  // Atualização opcional de student_id com checagem de posse
  if (array_key_exists('student_id', $B)) {
    $newStudentId = (int)$B['student_id'];
    if ($newStudentId && $newStudentId !== (int)$row['student_id']) {
      if ($u['role'] !== 'admin') {
        // Verifica posse do novo aluno
        $st = $pdo->prepare('SELECT created_by_teacher_id FROM students WHERE id = ?');
        $st->execute([$newStudentId]);
        $stu = $st->fetch(PDO::FETCH_ASSOC);
        if (!$stu) res(false, null, 'STUDENT_NOT_FOUND', 404);
        if ($stu['created_by_teacher_id'] === null) {
          // claim aluno
          $upd = $pdo->prepare('UPDATE students SET created_by_teacher_id = ? WHERE id = ?');
          $upd->execute([$u['id'], $newStudentId]);
        } elseif ((int)$stu['created_by_teacher_id'] !== (int)$u['id']) {
          res(false, null, 'FORBIDDEN_STUDENT', 403);
        }
      }
      $sets[] = 'student_id = ?';
      $params[] = $newStudentId;
    }
  }

  // Demais campos de texto/datas
  foreach (['data_atendimento','descricao','objetivos','recursos','observacoes'] as $col) {
    if (array_key_exists($col, $B)) {
      $sets[] = "$col = ?";
      $params[] = ($B[$col] === null ? null : trim((string)$B[$col]));
    }
  }

  if (empty($sets)) {
    res(false, null, 'NO_FIELDS_TO_UPDATE', 400);
  }

  $sql = 'UPDATE atendimentos SET ' . implode(', ', $sets) . ', updated_at = NOW() WHERE id = ?';
  $params[] = $id;
  $stmt = $pdo->prepare($sql);
  $ok = $stmt->execute($params);
  if ($ok) res(true, ['id' => $id]);
  res(false, null, 'UPDATE_FAILED', 500);
}

// Endpoint para listar legislações
if ($action === 'legislacoes.list') {
  $u = require_auth();
  
  $page = (int)($_GET['page'] ?? 1);
  $perPage = (int)($_GET['per_page'] ?? 20);
  $search = trim($_GET['q'] ?? '');
  $offset = ($page - 1) * $perPage;
  
  $whereClause = '';
  $params = [];
  
  if ($search) {
    $whereClause = 'WHERE titulo LIKE ? OR descricao LIKE ?';
    $params = ["%$search%", "%$search%"];
  }
  
  // Contar total
  $countSql = "SELECT COUNT(*) as total FROM legislacoes $whereClause";
  $countStmt = $pdo->prepare($countSql);
  $countStmt->execute($params);
  $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
  
  // Buscar dados paginados
  $sql = "SELECT id, titulo, descricao, arquivo_pdf, nome_original, tamanho_arquivo, created_at 
          FROM legislacoes $whereClause 
          ORDER BY created_at DESC 
          LIMIT $perPage OFFSET $offset";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  // Formatar tamanho do arquivo
  foreach ($rows as &$row) {
    if ($row['tamanho_arquivo']) {
      $bytes = $row['tamanho_arquivo'];
      if ($bytes >= 1048576) {
        $row['tamanho_formatado'] = number_format($bytes / 1048576, 1) . ' MB';
      } elseif ($bytes >= 1024) {
        $row['tamanho_formatado'] = number_format($bytes / 1024, 1) . ' KB';
      } else {
        $row['tamanho_formatado'] = $bytes . ' bytes';
      }
    }
    $row['data_formatada'] = date('d/m/Y H:i', strtotime($row['created_at']));
  }
  
  res(true, [
    'rows' => $rows,
    'total' => $total,
    'page' => $page,
    'per_page' => $perPage,
    'total_pages' => ceil($total / $perPage)
  ]);
}

// Endpoint para upload de legislação (apenas admin)
if ($action === 'legislacoes.upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
  $u = require_auth();
  
  // Verificar se é admin
  if ($u['role'] !== 'admin') {
    res(false, null, 'UNAUTHORIZED', 403);
  }
  
  $titulo = trim($_POST['titulo'] ?? '');
  $descricao = trim($_POST['descricao'] ?? '');
  
  if (!$titulo) {
    res(false, null, 'TITULO_REQUIRED', 400);
  }
  
  if (!isset($_FILES['arquivo']) || $_FILES['arquivo']['error'] !== UPLOAD_ERR_OK) {
    res(false, null, 'FILE_UPLOAD_ERROR', 400);
  }
  
  $arquivo = $_FILES['arquivo'];
  $nomeOriginal = $arquivo['name'];
  $tamanho = $arquivo['size'];
  $tipoMime = $arquivo['type'];
  
  // Verificar se é PDF
  if ($tipoMime !== 'application/pdf' && !str_ends_with(strtolower($nomeOriginal), '.pdf')) {
    res(false, null, 'INVALID_FILE_TYPE', 400);
  }
  
  // Verificar tamanho (max 50MB)
  if ($tamanho > 50 * 1024 * 1024) {
    res(false, null, 'FILE_TOO_LARGE', 400);
  }
  
  // Criar diretório de uploads se não existir
  $uploadDir = __DIR__ . '/uploads/legislacoes/';
  if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
  }
  
  // Gerar nome único para o arquivo
  $extensao = pathinfo($nomeOriginal, PATHINFO_EXTENSION);
  $nomeArquivo = uniqid() . '_' . time() . '.' . $extensao;
  $caminhoCompleto = $uploadDir . $nomeArquivo;
  
  if (!move_uploaded_file($arquivo['tmp_name'], $caminhoCompleto)) {
    res(false, null, 'FILE_MOVE_ERROR', 500);
  }
  
  // Salvar no banco
  $stmt = $pdo->prepare('INSERT INTO legislacoes (titulo, descricao, arquivo_pdf, nome_original, tamanho_arquivo) VALUES (?, ?, ?, ?, ?)');
  $result = $stmt->execute([$titulo, $descricao, $nomeArquivo, $nomeOriginal, $tamanho]);
  
  if ($result) {
    res(true, ['id' => $pdo->lastInsertId()]);
  } else {
    // Remover arquivo se falhou salvar no banco
    unlink($caminhoCompleto);
    res(false, null, 'DATABASE_ERROR', 500);
  }
}

// Endpoint para deletar legislação (apenas admin)
if (preg_match('/^legislacoes\/(\d+)$/', $pathInfo, $matches) && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
  $u = require_auth();
  $id = (int)$matches[1];
  
  // Verificar se é admin
  if ($u['role'] !== 'admin') {
    res(false, null, 'UNAUTHORIZED', 403);
  }
  
  // Buscar dados da legislação
  $stmt = $pdo->prepare('SELECT arquivo_pdf FROM legislacoes WHERE id = ?');
  $stmt->execute([$id]);
  $legislacao = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$legislacao) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  // Deletar do banco
  $stmt = $pdo->prepare('DELETE FROM legislacoes WHERE id = ?');
  $result = $stmt->execute([$id]);
  
  if ($result && $stmt->rowCount() > 0) {
    // Tentar deletar o arquivo físico
    $fileDeleted = false;
    $hadFile = false;
    $arquivo = $legislacao['arquivo_pdf'] ?? '';
    $arquivoPath = __DIR__ . '/uploads/legislacoes/' . $arquivo;
    if ($arquivo) {
      if (file_exists($arquivoPath)) {
        $hadFile = true;
        $fileDeleted = @unlink($arquivoPath);
        if (!$fileDeleted) {
          @error_log('UNLINK_FAILED legislacoes id=' . $id . ' path=' . $arquivoPath);
        }
      } else {
        @error_log('FILE_NOT_FOUND legislacoes id=' . $id . ' path=' . $arquivoPath);
      }
    }
    res(true, ['file_deleted' => $fileDeleted, 'had_file' => $hadFile, 'filename' => $arquivo]);
  } else {
    // Se executou mas não removeu linhas, retornar 409 para indicar que não foi possível
    if ($result && $stmt->rowCount() === 0) {
      res(false, null, 'NOT_DELETED', 409);
    }
    res(false, null, 'DELETE_FAILED', 500);
  }
}

// Endpoint para download de arquivo de legislação
if (preg_match('/^legislacoes\/(\d+)\/download$/', $pathInfo, $matches)) {
  $u = require_auth();
  $id = (int)$matches[1];
  
  $stmt = $pdo->prepare('SELECT arquivo_pdf, nome_original FROM legislacoes WHERE id = ?');
  $stmt->execute([$id]);
  $legislacao = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$legislacao) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  $arquivoPath = __DIR__ . '/uploads/legislacoes/' . $legislacao['arquivo_pdf'];
  
  if (!file_exists($arquivoPath)) {
    res(false, null, 'FILE_NOT_FOUND', 404);
  }
  
  // Definir headers para download (UTF-8 seguro)
  $nomeOriginal = $legislacao['nome_original'] ?: basename($arquivoPath);
  $asciiFallback = @iconv('UTF-8','ASCII//TRANSLIT//IGNORE',$nomeOriginal);
  if(!$asciiFallback) { $asciiFallback = preg_replace('/[^A-Za-z0-9_\.\-]+/','_', $nomeOriginal); }
  header('Content-Type: application/pdf; charset=UTF-8');
  header('X-Content-Type-Options: nosniff');
  header('Content-Disposition: inline; filename="' . $asciiFallback . '"; filename*=UTF-8\'' . rawurlencode($nomeOriginal) . '' );
  header('Content-Length: ' . filesize($arquivoPath));
  header('Cache-Control: no-cache, must-revalidate');
  
  readfile($arquivoPath);
  exit;
}

// ==================== SCHOOLS (Escolas) ====================

// Lista escolas
if ($action === 'schools.list') {
  // $user = require_auth(); // Removido para permitir acesso público às escolas
  
  $page = max(1, (int)($_GET['page'] ?? 1));
  $perPage = max(1, min(100, (int)($_GET['per_page'] ?? 10)));
  $offset = ($page - 1) * $perPage;
  
  $where = [];
  $params = [];
  
  // Filtro por busca
  if (!empty($_GET['q'])) {
    $where[] = '(name LIKE ? OR address LIKE ? OR city LIKE ?)';
    $search = '%' . $_GET['q'] . '%';
    $params[] = $search;
    $params[] = $search;
    $params[] = $search;
  }
  
  $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
  
  // Contar total
  $countSql = "SELECT COUNT(*) FROM schools $whereClause";
  $stmt = $pdo->prepare($countSql);
  $stmt->execute($params);
  $total = $stmt->fetchColumn();
  
  // Buscar dados
  $sql = "SELECT id, name, address, city, phone, email, created_by_teacher_id, created_at 
          FROM schools $whereClause 
          ORDER BY name ASC 
          LIMIT $perPage OFFSET $offset";
  $stmt = $pdo->prepare($sql);
  $stmt->execute($params);
  $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, [
    'rows' => $rows,
    'total' => $total,
    'page' => $page,
    'per_page' => $perPage,
    'total_pages' => ceil($total / $perPage)
  ]);
}

// Criar escola
if ($action === 'schools.create') {
  $user = require_admin();
  $data = $B;
  
  if (empty($data['name'])) {
    res(false, null, 'SCHOOL_NAME_REQUIRED', 422);
  }
  
  // Campos da tabela schools: name, code, address, phone, email, type, status
  $stmt = $pdo->prepare('INSERT INTO schools (name, code, address, phone, email, type, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())');
  if ($stmt->execute([
    $data['name'],
    $data['code'] ?? null,
    $data['address'] ?? null,
    $data['phone'] ?? null,
    $data['email'] ?? null,
    $data['type'] ?? 'municipal',
    $data['status'] ?? 'ativo'
  ])) {
    res(true, ['id' => $pdo->lastInsertId()]);
  } else {
    res(false, null, 'CREATE_FAILED', 500);
  }
}

// Atualizar escola
if ($action === 'schools.update') {
  $user = require_admin();
  $data = $B;
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  if (empty($data['name'])) {
    res(false, null, 'SCHOOL_NAME_REQUIRED', 422);
  }
  
  // Campos da tabela schools: name, code, address, phone, email, type, status
  $stmt = $pdo->prepare('UPDATE schools SET name=?, code=?, address=?, phone=?, email=?, type=?, status=?, updated_at=NOW() WHERE id=?');
  if ($stmt->execute([
    $data['name'],
    $data['code'] ?? null,
    $data['address'] ?? null,
    $data['phone'] ?? null,
    $data['email'] ?? null,
    $data['type'] ?? 'municipal',
    $data['status'] ?? 'ativo',
    $id
  ])) {
    res(true, null);
  } else {
    res(false, null, 'UPDATE_FAILED', 500);
  }
}

// Deletar escola
if ($action === 'schools.delete') {
  $user = require_admin();
  $id = (int)($_GET['id'] ?? 0);
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  $stmt = $pdo->prepare('DELETE FROM schools WHERE id=?');
  if ($stmt->execute([$id])) {
    res(true, null);
  } else {
    res(false, null, 'DELETE_FAILED', 500);
  }
}

// ========================================
// ENTREVISTAS COM RESPONSÁVEL
// ========================================

if ($action === 'entrevistas.create') {
  error_log("=== ENTROU EM entrevistas.create ===");
  $user = require_auth();
  error_log("=== AUTH OK === User: " . json_encode($user));
  $data = $B;
  
  // DEBUG
  error_log("DEBUG: \$B = " . json_encode($B));
  error_log("DEBUG: \$data = " . json_encode($data));
  error_log("DEBUG: student_id = " . ($data['student_id'] ?? 'EMPTY'));
  
  // Campos obrigatórios
  if (empty($data['student_id'])) {
    error_log("=== ERRO: STUDENT_ID_REQUIRED ===");
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // Preparar todos os campos da entrevista
  $fields = [
    'student_id', 'teacher_id',
    // Identificação
    'data_entrevista', 'entrevistador', 'nome_aluno', 'data_nascimento', 'idade',
    'sexo', 'deficiencia', 'codigo_aluno', 'endereco', 'bairro', 'cidade', 'estado',
    'cep', 'telefone_residencial', 'telefone_celular', 'nome_escola', 'ano_escolar',
    'turma', 'turno', 'nome_professor',
    // Família
    'nome_responsavel', 'parentesco', 'idade_responsavel', 'escolaridade_responsavel',
    'profissao_responsavel', 'renda_familiar', 'qtd_pessoas_familia', 'tipo_moradia',
    'condicoes_moradia', 'observacoes_familia',
    // Gestação e Nascimento
    'gravidez_planejada', 'tipo_parto', 'intercorrencias_gravidez', 'uso_medicamentos_gravidez',
    'uso_alcool_drogas', 'peso_nascimento', 'estatura_nascimento', 'apgar',
    'chorou_ao_nascer', 'mamou_bem', 'teve_ictericia', 'teve_convulsoes',
    'internacao_pos_parto', 'tempo_internacao', 'motivo_internacao',
    'prematuridade', 'pos_maturidade', 'anoxia_perinatal', 'forceps',
    'cesariana_emergencia', 'outras_intercorrencias',
    // Alimentação
    'tipo_alimentacao', 'idade_desmame', 'aceitacao_alimentar', 'preferencias_alimentares',
    'restricoes_alimentares',
    // Saúde
    'doencas_cronicas', 'medicamentos_uso_continuo', 'alergias', 'cirurgias_realizadas',
    'internacoes_previas', 'acompanhamento_medico', 'especialidades_medicas',
    'uso_oculos', 'uso_aparelho_auditivo', 'usa_cadeira_rodas', 'usa_andador',
    'outras_tecnologias_assistivas', 'vacinacao_em_dia', 'doencas_infancia',
    'hospitalizacoes', 'tratamentos_atuais', 'nivel_independencia_avds',
    'necessita_cuidador', 'observacoes_saude',
    // Desenvolvimento Pregresso
    'idade_sustentou_cabeca', 'idade_sentou', 'idade_engatinhou', 'idade_andou',
    'idade_primeiras_palavras', 'idade_frases', 'idade_controle_esfincteriano',
    'desenvolvimento_motor', 'desenvolvimento_linguagem',
    // Desenvolvimento Atual - Comunicação
    'como_comunica', 'compreende_ordens_simples', 'compreende_ordens_complexas',
    'vocabulario', 'estrutura_frases', 'usa_comunicacao_alternativa',
    'tipo_caa', 'comunicacao_efetiva', 'intencao_comunicativa',
    'inicia_dialogo', 'mantem_dialogo', 'observacoes_comunicacao',
    // AVDs
    'alimenta_sozinho', 'controla_esfincters', 'higiene_pessoal', 'veste_se_sozinho',
    'calca_sapatos', 'toma_banho_sozinho', 'escova_dentes', 'autonomia_geral',
    'necessita_adaptacoes', 'observacoes_avds',
    // Sexualidade
    'demonstra_curiosidade_sexual', 'recebeu_orientacao_sexual', 'comportamento_adequado',
    'necessita_orientacao', 'autocuidado_menstruacao', 'compreende_privacidade',
    'situacoes_vulnerabilidade', 'observacoes_sexualidade',
    // Socialização
    'brinca_com_outras_criancas', 'prefere_brincar_sozinho', 'compartilha_brinquedos',
    'respeita_regras', 'relaciona_bem_adultos', 'relaciona_bem_criancas',
    'tem_amigos', 'participa_atividades_grupo', 'aceita_perder_jogos',
    'demonstra_empatia', 'reconhece_emocoes', 'expressa_emocoes',
    'frequenta_ambientes_sociais', 'observacoes_socializacao',
    // Comportamento
    'comportamento_agitado', 'comportamento_apatico', 'comportamento_agressivo',
    'comportamento_opositor', 'comportamento_colaborativo', 'comportamento_dependente',
    'comportamento_autonomo', 'apresenta_medos', 'quais_medos', 'apresenta_manias',
    'quais_manias', 'apresenta_estereotipias', 'quais_estereotipias',
    'tolerancia_frustracao', 'controle_impulsos', 'atencao_concentracao',
    'tempo_atencao', 'facilmente_distraido', 'observacoes_comportamento',
    // Vida Escolar
    'idade_ingresso_escolar', 'escolas_anteriores', 'repetencias', 'quais_anos_repetiu',
    'motivo_repetencias', 'adaptacao_escolar', 'relacionamento_professores',
    'relacionamento_colegas', 'participacao_atividades', 'interesse_aprendizagem',
    'areas_maior_dificuldade', 'areas_maior_facilidade', 'faz_temas_casa',
    'precisa_ajuda_temas', 'observacoes_vida_escolar',
    // Sala de Recursos
    'frequenta_sala_recursos', 'frequencia_atendimentos', 'gosta_atendimento',
    'atividades_preferidas', 'observacoes_sala_recursos',
    // Controle
    'responsavel_preenchimento', 'assinatura_responsavel', 'assinatura_professor',
    'assinatura_coordenador', 'data_preenchimento'
  ];
  
  // Pegar valores do input
  $values = [];
  $placeholders = [];
  $insertFields = [];
  
  // teacher_id sempre vem do usuário logado
  $data['teacher_id'] = $user['id'];
  
  foreach ($fields as $field) {
    if (isset($data[$field]) && $data[$field] !== '') {
      $insertFields[] = $field;
      $placeholders[] = ':' . $field;
      $values[':' . $field] = $data[$field];
    }
  }
  
  // created_at
  $insertFields[] = 'created_at';
  $placeholders[] = 'NOW()';
  
  $sql = 'INSERT INTO entrevistas_responsavel (' . implode(', ', $insertFields) . ') 
          VALUES (' . implode(', ', $placeholders) . ')';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    $id = $pdo->lastInsertId();
    res(true, ['id' => $id, 'message' => 'Entrevista criada com sucesso']);
  } else {
    res(false, null, 'CREATE_FAILED', 500);
  }
}

if ($action === 'entrevistas.list') {
  $user = require_auth();
  
  // Admin vê todas, professor vê apenas as suas
  if ($user['role'] === 'admin') {
    $stmt = $pdo->query('SELECT e.*, s.name as student_name 
                         FROM entrevistas_responsavel e 
                         LEFT JOIN students s ON e.student_id = s.id 
                         ORDER BY e.created_at DESC');
    $entrevistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } else {
    $stmt = $pdo->prepare('SELECT e.*, s.name as student_name 
                           FROM entrevistas_responsavel e 
                           LEFT JOIN students s ON e.student_id = s.id 
                           WHERE e.teacher_id = :teacher_id 
                           ORDER BY e.created_at DESC');
    $stmt->execute(['teacher_id' => $user['id']]);
    $entrevistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  res(true, $entrevistas);
}

if ($action === 'entrevistas.get') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  $stmt = $pdo->prepare('SELECT e.*, s.name as student_name 
                         FROM entrevistas_responsavel e 
                         LEFT JOIN students s ON e.student_id = s.id 
                         WHERE e.id = :id');
  $stmt->execute(['id' => $id]);
  $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$entrevista) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  // Verificar permissão
  if ($user['role'] !== 'admin' && $entrevista['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  res(true, $entrevista);
}

if ($action === 'entrevistas.update') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  $data = $B;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar se existe e se tem permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM entrevistas_responsavel WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$entrevista) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $entrevista['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  // Preparar campos para update (aceita qualquer campo enviado, exceto id, created_at)
  $updates = [];
  $values = [];
  
  $protectedFields = ['id', 'created_at', 'teacher_id']; // Campos que não podem ser alterados
  
  foreach ($data as $field => $value) {
    if (!in_array($field, $protectedFields)) {
      $updates[] = "`$field` = :$field";
      $values[':' . $field] = $value;
    }
  }
  
  if (empty($updates)) {
    res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  }
  
  // Adicionar updated_at
  $updates[] = 'updated_at = NOW()';
  
  $values[':id'] = $id;
  $sql = 'UPDATE entrevistas_responsavel SET ' . implode(', ', $updates) . ' WHERE id = :id';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    res(true, ['message' => 'Entrevista atualizada com sucesso']);
  } else {
    res(false, null, 'UPDATE_FAILED', 500);
  }
}

if ($action === 'entrevistas.student') {
  $user = require_auth();
  $studentId = $_GET['student_id'] ?? null;
  
  if (!$studentId) {
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // Verificar se o professor tem permissão para ver esse aluno
  if ($user['role'] !== 'admin') {
    $stmt = $pdo->prepare('SELECT id FROM students WHERE id = :id AND created_by_teacher_id = :teacher_id');
    $stmt->execute(['id' => $studentId, 'teacher_id' => $user['id']]);
    if (!$stmt->fetch()) {
      res(false, null, 'FORBIDDEN', 403);
    }
  }
  
  $stmt = $pdo->prepare('SELECT * FROM entrevistas_responsavel 
                         WHERE student_id = :student_id 
                         ORDER BY created_at DESC');
  $stmt->execute(['student_id' => $studentId]);
  $entrevistas = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, $entrevistas);
}

if ($action === 'entrevistas.delete') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM entrevistas_responsavel WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $entrevista = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$entrevista) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $entrevista['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $stmt = $pdo->prepare('DELETE FROM entrevistas_responsavel WHERE id = :id');
  
  if ($stmt->execute(['id' => $id])) {
    res(true, ['message' => 'Entrevista deletada com sucesso']);
  } else {
    res(false, null, 'DELETE_FAILED', 500);
  }
}

// ========================================
// PDI (PLANO DE DESENVOLVIMENTO INDIVIDUAL)
// ========================================

if ($action === 'pdis.create') {
  $user = require_auth();
  $data = $B;
  
  // Campos obrigatórios
  if (empty($data['student_id'])) {
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // teacher_id sempre vem do usuário logado
  $data['teacher_id'] = $user['id'];
  
  // Preparar INSERT dinâmico (aceita qualquer campo exceto id, created_at)
  $protectedFields = ['id', 'created_at', 'updated_at'];
  $insertFields = [];
  $placeholders = [];
  $values = [];
  
  foreach ($data as $field => $value) {
    if (!in_array($field, $protectedFields)) {
      $insertFields[] = "`$field`";
      $placeholders[] = ":$field";
      $values[":$field"] = $value;
    }
  }
  
  $sql = 'INSERT INTO pdis (' . implode(', ', $insertFields) . ', created_at) 
          VALUES (' . implode(', ', $placeholders) . ', NOW())';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    $id = $pdo->lastInsertId();
    res(true, ['id' => $id, 'message' => 'PDI criado com sucesso']);
  } else {
    res(false, null, 'CREATE_FAILED', 500);
  }
}

if ($action === 'pdis.list') {
  $user = require_auth();
  
  // Admin vê todos, professor vê apenas os seus
  if ($user['role'] === 'admin') {
    $stmt = $pdo->query('SELECT p.*, s.name as student_name 
                         FROM pdis p 
                         LEFT JOIN students s ON p.student_id = s.id 
                         ORDER BY p.created_at DESC');
    $pdis = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } else {
    $stmt = $pdo->prepare('SELECT p.*, s.name as student_name 
                           FROM pdis p 
                           LEFT JOIN students s ON p.student_id = s.id 
                           WHERE p.teacher_id = :teacher_id 
                           ORDER BY p.created_at DESC');
    $stmt->execute(['teacher_id' => $user['id']]);
    $pdis = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  res(true, $pdis);
}

if ($action === 'pdis.get') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  $stmt = $pdo->prepare('SELECT p.*, s.name as student_name 
                         FROM pdis p 
                         LEFT JOIN students s ON p.student_id = s.id 
                         WHERE p.id = :id');
  $stmt->execute(['id' => $id]);
  $pdi = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pdi) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  // Verificar permissão
  if ($user['role'] !== 'admin' && $pdi['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  res(true, $pdi);
}

if ($action === 'pdis.update') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  $data = $B;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar se existe e se tem permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM pdis WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $pdi = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pdi) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $pdi['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  // Preparar campos para update (aceita qualquer campo enviado, exceto id, created_at, teacher_id)
  $updates = [];
  $values = [];
  
  $protectedFields = ['id', 'created_at', 'teacher_id'];
  
  foreach ($data as $field => $value) {
    if (!in_array($field, $protectedFields)) {
      $updates[] = "`$field` = :$field";
      $values[':' . $field] = $value;
    }
  }
  
  if (empty($updates)) {
    res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  }
  
  // Adicionar updated_at
  $updates[] = 'updated_at = NOW()';
  
  $values[':id'] = $id;
  $sql = 'UPDATE pdis SET ' . implode(', ', $updates) . ' WHERE id = :id';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    res(true, ['message' => 'PDI atualizado com sucesso']);
  } else {
    res(false, null, 'UPDATE_FAILED', 500);
  }
}

if ($action === 'pdis.student') {
  $user = require_auth();
  $studentId = $_GET['student_id'] ?? null;
  
  if (!$studentId) {
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // Verificar se o professor tem permissão para ver esse aluno
  if ($user['role'] !== 'admin') {
    $stmt = $pdo->prepare('SELECT id FROM students WHERE id = :id AND created_by_teacher_id = :teacher_id');
    $stmt->execute(['id' => $studentId, 'teacher_id' => $user['id']]);
    if (!$stmt->fetch()) {
      res(false, null, 'FORBIDDEN', 403);
    }
  }
  
  $stmt = $pdo->prepare('SELECT * FROM pdis 
                         WHERE student_id = :student_id 
                         ORDER BY created_at DESC');
  $stmt->execute(['student_id' => $studentId]);
  $pdis = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, $pdis);
}

if ($action === 'pdis.delete') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM pdis WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $pdi = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pdi) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $pdi['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $stmt = $pdo->prepare('DELETE FROM pdis WHERE id = :id');
  
  if ($stmt->execute(['id' => $id])) {
    res(true, ['message' => 'PDI deletado com sucesso']);
  } else {
    res(false, null, 'DELETE_FAILED', 500);
  }
}

// ========================================
// PAI (PLANO DE ATENDIMENTO INDIVIDUAL)
// ========================================

if ($action === 'pais.create') {
  $user = require_auth();
  $data = $B;
  
  // Campos obrigatórios
  if (empty($data['student_id'])) {
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // teacher_id sempre vem do usuário logado
  $data['teacher_id'] = $user['id'];
  
  // Preparar INSERT dinâmico
  $protectedFields = ['id', 'created_at', 'updated_at'];
  $insertFields = [];
  $placeholders = [];
  $values = [];
  
  foreach ($data as $field => $value) {
    if (!in_array($field, $protectedFields)) {
      $insertFields[] = "`$field`";
      $placeholders[] = ":$field";
      $values[":$field"] = $value;
    }
  }
  
  $sql = 'INSERT INTO pais (' . implode(', ', $insertFields) . ', created_at) 
          VALUES (' . implode(', ', $placeholders) . ', NOW())';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    $id = $pdo->lastInsertId();
    res(true, ['id' => $id, 'message' => 'PAI criado com sucesso']);
  } else {
    res(false, null, 'CREATE_FAILED', 500);
  }
}

if ($action === 'pais.list') {
  $user = require_auth();
  
  // Admin vê todos, professor vê apenas os seus
  if ($user['role'] === 'admin') {
    $stmt = $pdo->query('SELECT p.*, s.name as student_name 
                         FROM pais p 
                         LEFT JOIN students s ON p.student_id = s.id 
                         ORDER BY p.created_at DESC');
    $pais = $stmt->fetchAll(PDO::FETCH_ASSOC);
  } else {
    $stmt = $pdo->prepare('SELECT p.*, s.name as student_name 
                           FROM pais p 
                           LEFT JOIN students s ON p.student_id = s.id 
                           WHERE p.teacher_id = :teacher_id 
                           ORDER BY p.created_at DESC');
    $stmt->execute(['teacher_id' => $user['id']]);
    $pais = $stmt->fetchAll(PDO::FETCH_ASSOC);
  }
  
  res(true, $pais);
}

if ($action === 'pais.get') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  $stmt = $pdo->prepare('SELECT p.*, s.name as student_name 
                         FROM pais p 
                         LEFT JOIN students s ON p.student_id = s.id 
                         WHERE p.id = :id');
  $stmt->execute(['id' => $id]);
  $pai = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pai) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  // Verificar permissão
  if ($user['role'] !== 'admin' && $pai['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  res(true, $pai);
}

if ($action === 'pais.update') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  $data = $B;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar se existe e se tem permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM pais WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $pai = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pai) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $pai['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  // Preparar campos para update
  $updates = [];
  $values = [];
  
  $protectedFields = ['id', 'created_at', 'teacher_id'];
  
  foreach ($data as $field => $value) {
    if (!in_array($field, $protectedFields)) {
      $updates[] = "`$field` = :$field";
      $values[':' . $field] = $value;
    }
  }
  
  if (empty($updates)) {
    res(false, null, 'NO_FIELDS_TO_UPDATE', 422);
  }
  
  // Adicionar updated_at
  $updates[] = 'updated_at = NOW()';
  
  $values[':id'] = $id;
  $sql = 'UPDATE pais SET ' . implode(', ', $updates) . ' WHERE id = :id';
  
  $stmt = $pdo->prepare($sql);
  
  if ($stmt->execute($values)) {
    res(true, ['message' => 'PAI atualizado com sucesso']);
  } else {
    res(false, null, 'UPDATE_FAILED', 500);
  }
}

if ($action === 'pais.student') {
  $user = require_auth();
  $studentId = $_GET['student_id'] ?? null;
  
  if (!$studentId) {
    res(false, null, 'STUDENT_ID_REQUIRED', 422);
  }
  
  // Verificar se o professor tem permissão para ver esse aluno
  if ($user['role'] !== 'admin') {
    $stmt = $pdo->prepare('SELECT id FROM students WHERE id = :id AND created_by_teacher_id = :teacher_id');
    $stmt->execute(['id' => $studentId, 'teacher_id' => $user['id']]);
    if (!$stmt->fetch()) {
      res(false, null, 'FORBIDDEN', 403);
    }
  }
  
  $stmt = $pdo->prepare('SELECT * FROM pais 
                         WHERE student_id = :student_id 
                         ORDER BY created_at DESC');
  $stmt->execute(['student_id' => $studentId]);
  $pais = $stmt->fetchAll(PDO::FETCH_ASSOC);
  
  res(true, $pais);
}

if ($action === 'pais.delete') {
  $user = require_auth();
  $id = $_GET['id'] ?? null;
  
  if (!$id) {
    res(false, null, 'ID_REQUIRED', 422);
  }
  
  // Verificar permissão
  $stmt = $pdo->prepare('SELECT teacher_id FROM pais WHERE id = :id');
  $stmt->execute(['id' => $id]);
  $pai = $stmt->fetch(PDO::FETCH_ASSOC);
  
  if (!$pai) {
    res(false, null, 'NOT_FOUND', 404);
  }
  
  if ($user['role'] !== 'admin' && $pai['teacher_id'] != $user['id']) {
    res(false, null, 'FORBIDDEN', 403);
  }
  
  $stmt = $pdo->prepare('DELETE FROM pais WHERE id = :id');
  
  if ($stmt->execute(['id' => $id])) {
    res(true, ['message' => 'PAI deletado com sucesso']);
  } else {
    res(false, null, 'DELETE_FAILED', 500);
  }
}

res(false, null, 'NOT_FOUND', 404);

