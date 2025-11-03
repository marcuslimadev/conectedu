<?php
date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'America/Sao_Paulo');
// Forçar UTF-8 em toda a aplicação
@ini_set('default_charset', 'UTF-8');
if (function_exists('mb_internal_encoding')) { @mb_internal_encoding('UTF-8'); }
// CORS com lista de origens permitidas
$allowed_origins = [
  'https://conectedu.com',
  'https://www.conectedu.com',
  'http://localhost:8001',
  'http://localhost',
  'http://127.0.0.1',
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins) || env('CORS_ORIGIN') === '*') {
  header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
  header('Access-Control-Allow-Credentials: true');
} else {
  header('Access-Control-Allow-Origin: ' . (env('CORS_ORIGIN') ?: 'http://localhost'));
}
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){ http_response_code(204); exit; }

function env($k,$d=null){ static $e=null; if($e===null){ $e=[]; $p=__DIR__.'/.env'; if(file_exists($p)){ foreach(file($p,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES) as $l){ if(strpos($l,'=')!==false && strpos(ltrim($l),'#')!==0){ [$a,$b]=explode('=',$l,2); $e[trim($a)] = trim($b); } } } } return $e[$k]??getenv($k)??$d; }
function res($ok,$data=null,$error=null,$code=200,$extra=null){ header('Content-Type: application/json; charset=utf-8'); http_response_code($code); $response=['ok'=>$ok,'data'=>$data,'error'=>$error]; if($extra) $response['extra']=$extra; echo json_encode($response,JSON_UNESCAPED_UNICODE); exit; }
function db(){ static $pdo=null; if($pdo) return $pdo; try{ $dsn='mysql:host='.env('DB_HOST','127.0.0.1').';port='.env('DB_PORT','3306').';dbname='.env('DB_NAME','conectedu').';charset=utf8mb4'; $pdo=new PDO($dsn,env('DB_USER','root'),env('DB_PASS',''),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]);
  // Garantir collation/charset mesmo se o servidor estiver com defaults diferentes
  try {
    $pdo->exec("SET NAMES utf8mb4");
    $pdo->exec("SET CHARACTER SET utf8mb4");
    $pdo->exec("SET collation_connection = utf8mb4_unicode_ci");
  } catch (Exception $ie) { /* ignore */ }
  return $pdo; }catch(Exception $e){ res(false,null,'DB_CONNECTION_FAILED',500); } }
function body(){ $raw=file_get_contents('php://input'); $j=json_decode($raw,true); return is_array($j)?$j:[]; }
function token(){ return bin2hex(random_bytes(32)); }
function bearer(){
  $cands=[];
  if(isset($_SERVER['HTTP_AUTHORIZATION'])) $cands[]=$_SERVER['HTTP_AUTHORIZATION'];
  if(isset($_SERVER['Authorization'])) $cands[]=$_SERVER['Authorization'];
  if(isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) $cands[]=$_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
  if(function_exists('getallheaders')){ $h=getallheaders(); foreach(['Authorization','authorization','AUTHORIZATION'] as $k){ if(isset($h[$k])){ $cands[]=$h[$k]; break; } } }
  foreach($cands as $h){ if(preg_match('/Bearer\s+([A-Za-z0-9\._\-]+)/',$h,$m)) return $m[1]; }
  if(isset($_GET['token']) && $_GET['token']) return $_GET['token'];
  if(isset($_POST['token']) && $_POST['token']) return $_POST['token'];
  return null;
}
function require_auth(){ 
  $pdo=db(); 
  $t=bearer(); 
  if(!$t) res(false,null,'NO_TOKEN',401); 
  
  // Limpar sessões expiradas (1% de chance a cada requisição para não sobrecarregar)
  if(rand(1, 100) === 1) {
    try {
      $pdo->exec('DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at < NOW()');
    } catch(Exception $e) { /* Ignorar erros de limpeza */ }
  }
  
  $q=$pdo->prepare('SELECT s.token,u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND (s.expires_at IS NULL OR s.expires_at>NOW())'); 
  $q->execute([$t]); 
  $u=$q->fetch(PDO::FETCH_ASSOC); 
  if(!$u) res(false,null,'INVALID_TOKEN',401); 
  return $u; 
}
function require_admin(){ $u=require_auth(); if($u['role']!=='admin') res(false,null,'FORBIDDEN',403); return $u; }
function openai_headers($contentType=null){
  $key=env('OPENAI_API_KEY');
  if(!$key || $key === '') res(false,null,'OPENAI_KEY_MISSING - Configure OPENAI_API_KEY no arquivo .env com uma chave válida da OpenAI',500);
  $headers=['Authorization: Bearer '.$key];
  if($contentType) $headers[]='Content-Type: '.$contentType;
  $project=env('OPENAI_PROJECT') ?? env('OPENAI_PROJECT_ID');
  if(!$project && strpos($key,'sk-proj-')===0){
    $parts=explode('-', $key);
    if(isset($parts[2]) && $parts[2]!== ''){
      $chunk=strtr($parts[2], '-_', '+/');
      $pad=(4 - strlen($chunk)%4)%4;
      if($pad) $chunk.=str_repeat('=', $pad);
      $decoded=base64_decode($chunk,true);
      if($decoded && strpos($decoded,'proj_')===0) $project=$decoded;
    }
  }
  if($project) $headers[]='OpenAI-Project: '.$project;
  $org=env('OPENAI_ORG') ?? env('OPENAI_ORGANIZATION');
  if($org) $headers[]='OpenAI-Organization: '.$org;
  return $headers;
}

function openai_chat($messages,$temperature=0.2){
  $headers=openai_headers('application/json');
  $model=env('OPENAI_MODEL','gpt-4o-mini');
  $ch=curl_init('https://api.openai.com/v1/chat/completions');
  curl_setopt($ch,CURLOPT_HTTPHEADER,$headers);
  curl_setopt($ch,CURLOPT_POST,true);
  curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
  curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode(['model'=>$model,'messages'=>$messages,'temperature'=>$temperature]));
  $out=curl_exec($ch);
  if(curl_errno($ch)) res(false,null,'OPENAI_ERROR',500);
  $code=curl_getinfo($ch,CURLINFO_HTTP_CODE);
  curl_close($ch);
  $json=json_decode($out,true);
  if($code>=400||!$json) res(false,null,'OPENAI_HTTP_'.$code,500);
  $txt=$json['choices'][0]['message']['content']??'';
  return $txt;
}

// Speech-to-Text (Transcrição) com OpenAI Whisper
function openai_transcribe($filePath,$filename='audio.wav'){
  if(!file_exists($filePath)) res(false,null,'AUDIO_FILE_NOT_FOUND',422);
  
  // Validar tamanho mínimo do arquivo (aproximadamente 0.1s de áudio)
  $fileSize = filesize($filePath);
  if($fileSize < 1024) { // ~1KB mínimo para áudio válido
    res(false,null,'AUDIO_TOO_SHORT - Grave pelo menos 1 segundo de áudio',422);
  }
  
  $model=env('OPENAI_STT_MODEL','whisper-1');
  $ch=curl_init('https://api.openai.com/v1/audio/transcriptions');
  $cfile=new CURLFile($filePath, mime_content_type($filePath) ?: 'application/octet-stream', $filename);
  $data=[
    'file'=>$cfile,
    'model'=>$model,
    'response_format'=>'json'
  ];
  curl_setopt($ch,CURLOPT_HTTPHEADER,openai_headers()); // multipart: boundary definido automaticamente
  curl_setopt($ch,CURLOPT_POST,true);
  curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
  curl_setopt($ch,CURLOPT_POSTFIELDS,$data);
  $out=curl_exec($ch);
  if(curl_errno($ch)) res(false,null,'OPENAI_ERROR',500);
  $code=curl_getinfo($ch,CURLINFO_HTTP_CODE);
  curl_close($ch);
  $json=json_decode($out,true);
  
  // Melhorar tratamento de erros 400 específicos
  if($code>=400) {
    $errorMsg = 'OPENAI_HTTP_'.$code;
    if($json && isset($json['error']['message'])) {
      $apiError = $json['error']['message'];
      if(strpos($apiError, 'too short') !== false) {
        $errorMsg = 'AUDIO_TOO_SHORT - Grave áudio mais longo (mín. 1 segundo)';
      } elseif(strpos($apiError, 'could not be decoded') !== false) {
        $errorMsg = 'AUDIO_FORMAT_INVALID - Formato de áudio não suportado';
      } else {
        $errorMsg .= ' - ' . $apiError;
      }
    }
    res(false,null,$errorMsg,400);
  }
  
  if(!$json) res(false,null,'OPENAI_INVALID_RESPONSE',500);
  $text=$json['text'] ?? ($json['results'][0]['text'] ?? '');
  return $text;
}

// Text-to-Speech (TTS) com OpenAI
function openai_tts_binary($text,$voice='alloy',$format='mp3'){
  $model=env('OPENAI_TTS_MODEL','tts-1');
  $payload=[
    'model'=>$model,
    'input'=>$text,
    'voice'=>$voice,
    'format'=>$format
  ];
  $ch=curl_init('https://api.openai.com/v1/audio/speech');
  curl_setopt($ch,CURLOPT_HTTPHEADER,openai_headers('application/json'));
  curl_setopt($ch,CURLOPT_POST,true);
  curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
  curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode($payload));
  $out=curl_exec($ch);
  if(curl_errno($ch)) res(false,null,'OPENAI_ERROR',500);
  $code=curl_getinfo($ch,CURLINFO_HTTP_CODE);
  curl_close($ch);
  if($code>=400||!$out) res(false,null,'OPENAI_HTTP_'.$code,500);
  return $out; // binário
}

// ========== ACESSO A DADOS ==========

/**
 * Retorna dados do aluno garantindo isolamento teacher-centric.
 */
function ensure_student_access(PDO $pdo, array $user, int $student_id){
  $stmt=$pdo->prepare('SELECT s.*, sc.name AS school_name, sc.city AS school_city, sc.address AS school_address FROM students s LEFT JOIN schools sc ON sc.id = s.school_id WHERE s.id = ?');
  $stmt->execute([$student_id]);
  $student=$stmt->fetch(PDO::FETCH_ASSOC);
  if(!$student) res(false,null,'STUDENT_NOT_FOUND',404);
  if($user['role']!=='admin' && (int)$student['created_by_teacher_id']!==(int)$user['id']){
    res(false,null,'FORBIDDEN',403);
  }
  return $student;
}

// ========== VALIDAÇÃO DE UPLOADS ==========

/**
 * Valida se arquivo é PDF real verificando magic bytes
 * @param array $file - $_FILES['field']
 * @return bool
 */
function validatePDF($file) {
  if (!isset($file['tmp_name']) || !file_exists($file['tmp_name'])) {
    return false;
  }
  
  // Verificar MIME type real
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mimeType = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);
  
  // PDF deve ter MIME application/pdf
  if ($mimeType !== 'application/pdf') {
    return false;
  }
  
  // Verificar magic bytes (PDF começa com %PDF-)
  $handle = fopen($file['tmp_name'], 'rb');
  $header = fread($handle, 5);
  fclose($handle);
  
  return $header === '%PDF-';
}

/**
 * Valida se arquivo é imagem real verificando magic bytes
 * @param array $file - $_FILES['field']
 * @param array $allowedTypes - ['image/jpeg', 'image/png', 'image/webp']
 * @return bool
 */
function validateImage($file, $allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
  if (!isset($file['tmp_name']) || !file_exists($file['tmp_name'])) {
    return false;
  }
  
  // Verificar MIME type real
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mimeType = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);
  
  if (!in_array($mimeType, $allowedTypes)) {
    return false;
  }
  
  // Verificar se é realmente uma imagem válida
  $imageInfo = @getimagesize($file['tmp_name']);
  return $imageInfo !== false;
}

/**
 * Valida se arquivo é áudio válido
 * @param array $file - $_FILES['field']
 * @return bool
 */
function validateAudio($file) {
  if (!isset($file['tmp_name']) || !file_exists($file['tmp_name'])) {
    return false;
  }
  
  $finfo = finfo_open(FILEINFO_MIME_TYPE);
  $mimeType = finfo_file($finfo, $file['tmp_name']);
  finfo_close($finfo);
  
  $allowedAudio = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg'];
  return in_array($mimeType, $allowedAudio);
}

/**
 * Redimensiona imagem mantendo aspect ratio
 * @param string $sourcePath - Caminho da imagem original
 * @param string $destPath - Caminho de destino
 * @param int $maxWidth - Largura máxima
 * @param int $maxHeight - Altura máxima
 * @return bool
 */
function resizeImage($sourcePath, $destPath, $maxWidth = 800, $maxHeight = 800) {
  $imageInfo = getimagesize($sourcePath);
  if (!$imageInfo) return false;
  
  list($width, $height, $type) = $imageInfo;
  
  // Calcular novas dimensões mantendo aspect ratio
  $ratio = min($maxWidth / $width, $maxHeight / $height);
  $newWidth = intval($width * $ratio);
  $newHeight = intval($height * $ratio);
  
  // Criar imagem de origem baseado no tipo
  switch ($type) {
    case IMAGETYPE_JPEG:
      $source = imagecreatefromjpeg($sourcePath);
      break;
    case IMAGETYPE_PNG:
      $source = imagecreatefrompng($sourcePath);
      break;
    case IMAGETYPE_WEBP:
      $source = imagecreatefromwebp($sourcePath);
      break;
    default:
      return false;
  }
  
  // Criar imagem de destino
  $dest = imagecreatetruecolor($newWidth, $newHeight);
  
  // Preservar transparência para PNG
  if ($type === IMAGETYPE_PNG) {
    imagealphablending($dest, false);
    imagesavealpha($dest, true);
  }
  
  // Redimensionar
  imagecopyresampled($dest, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
  
  // Salvar
  $result = false;
  switch ($type) {
    case IMAGETYPE_JPEG:
      $result = imagejpeg($dest, $destPath, 90);
      break;
    case IMAGETYPE_PNG:
      $result = imagepng($dest, $destPath, 9);
      break;
    case IMAGETYPE_WEBP:
      $result = imagewebp($dest, $destPath, 90);
      break;
  }
  
  imagedestroy($source);
  imagedestroy($dest);
  
  return $result;
}

/**
 * Formatar tamanho de arquivo em formato legível
 * @param int $bytes Tamanho em bytes
 * @return string Formato legível (KB, MB, GB)
 */
function formatFileSize($bytes) {
  if ($bytes <= 0) return '0 B';
  
  $units = ['B', 'KB', 'MB', 'GB', 'TB'];
  $power = floor(log($bytes, 1024));
  $power = min($power, count($units) - 1);
  
  $size = $bytes / pow(1024, $power);
  
  return round($size, 2) . ' ' . $units[$power];
}

// ========== VALIDAÇÃO DE DADOS ==========

/**
 * Valida dados de estudante
 * @param array $data - Dados a validar
 * @param bool $isUpdate - Se é update (campos não obrigatórios)
 * @return array ['valid' => bool, 'errors' => array]
 */
function validateStudent($data, $isUpdate = false) {
  $errors = [];
  
  // Nome obrigatório
  if (!$isUpdate || (isset($data['name']) && $data['name'] !== '')) {
    if (isset($data['name']) && (empty($data['name']) || strlen(trim($data['name'])) < 3)) {
      $errors['name'] = 'Nome deve ter no mínimo 3 caracteres';
    }
  }
  
  // Email (se fornecido e não vazio)
  if (isset($data['email']) && $data['email'] !== '' && !empty($data['email'])) {
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      $errors['email'] = 'Email inválido';
    }
  }
  
  // CPF (se fornecido e não vazio)
  if (isset($data['cpf']) && $data['cpf'] !== '' && !empty($data['cpf'])) {
    $cpf = preg_replace('/[^0-9]/', '', $data['cpf']);
    if (strlen($cpf) !== 11 || preg_match('/^(\d)\1{10}$/', $cpf)) {
      $errors['cpf'] = 'CPF inválido';
    }
  }
  
  // Data de nascimento (se fornecido e não vazio)
  if (isset($data['birth_date']) && $data['birth_date'] !== '' && !empty($data['birth_date'])) {
    $date = DateTime::createFromFormat('Y-m-d', $data['birth_date']);
    if (!$date || $date->format('Y-m-d') !== $data['birth_date']) {
      $errors['birth_date'] = 'Data de nascimento inválida (formato: YYYY-MM-DD)';
    }
  }
  
  // Status (se fornecido e não vazio)
  if (isset($data['status']) && $data['status'] !== '') {
    $validStatuses = ['ativo', 'inativo', 'transferido', 'concluido'];
    if (!in_array($data['status'], $validStatuses)) {
      $errors['status'] = 'Status inválido. Use: ativo, inativo, transferido ou concluido';
    }
  }
  
  // Modalidade (se fornecido e não vazio)
  if (isset($data['modalidade']) && $data['modalidade'] !== '') {
    $validModalidades = ['apoio', 'srm'];
    if (!in_array($data['modalidade'], $validModalidades)) {
      $errors['modalidade'] = 'Modalidade inválida. Use: apoio ou srm';
    }
  }
  
  return [
    'valid' => empty($errors),
    'errors' => $errors
  ];
}

/**
 * Valida dados de escola
 * @param array $data - Dados a validar
 * @param bool $isUpdate - Se é update
 * @return array ['valid' => bool, 'errors' => array]
 */
function validateSchool($data, $isUpdate = false) {
  $errors = [];
  
  if (!$isUpdate || isset($data['name'])) {
    if (empty($data['name']) || strlen(trim($data['name'])) < 3) {
      $errors['name'] = 'Nome da escola deve ter no mínimo 3 caracteres';
    }
  }
  
  if (isset($data['email']) && !empty($data['email'])) {
    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      $errors['email'] = 'Email inválido';
    }
  }
  
  if (isset($data['phone']) && !empty($data['phone'])) {
    $phone = preg_replace('/[^0-9]/', '', $data['phone']);
    if (strlen($phone) < 10 || strlen($phone) > 11) {
      $errors['phone'] = 'Telefone inválido (use formato: (XX) XXXXX-XXXX)';
    }
  }
  
  return [
    'valid' => empty($errors),
    'errors' => $errors
  ];
}

/**
 * Valida dados de usuário
 * @param array $data - Dados a validar
 * @param bool $isUpdate - Se é update
 * @return array ['valid' => bool, 'errors' => array]
 */
function validateUser($data, $isUpdate = false) {
  $errors = [];
  
  if (!$isUpdate || isset($data['name'])) {
    if (empty($data['name']) || strlen(trim($data['name'])) < 3) {
      $errors['name'] = 'Nome deve ter no mínimo 3 caracteres';
    }
  }
  
  if (!$isUpdate || isset($data['email'])) {
    if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
      $errors['email'] = 'Email inválido';
    }
  }
  
  if (!$isUpdate || isset($data['password'])) {
    if (!$isUpdate && (empty($data['password']) || strlen($data['password']) < 6)) {
      $errors['password'] = 'Senha deve ter no mínimo 6 caracteres';
    } elseif ($isUpdate && isset($data['password']) && !empty($data['password']) && strlen($data['password']) < 6) {
      $errors['password'] = 'Senha deve ter no mínimo 6 caracteres';
    }
  }
  
  if (isset($data['role'])) {
    $validRoles = ['admin', 'professor', 'coordenador'];
    if (!in_array($data['role'], $validRoles)) {
      $errors['role'] = 'Role inválido. Use: admin, professor ou coordenador';
    }
  }
  
  return [
    'valid' => empty($errors),
    'errors' => $errors
  ];
}

/**
 * Sanitiza string para prevenir XSS
 * @param string $str
 * @return string
 */
function sanitize($str) {
  return htmlspecialchars($str, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

