<?php
date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'America/Sao_Paulo');
// Forçar UTF-8 em toda a aplicação
@ini_set('default_charset', 'UTF-8');
if (function_exists('mb_internal_encoding')) { @mb_internal_encoding('UTF-8'); }
header('Access-Control-Allow-Origin: ' . (getenv('CORS_ORIGIN') ?: '*'));
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
function require_auth(){ $pdo=db(); $t=bearer(); if(!$t) res(false,null,'NO_TOKEN',401); $q=$pdo->prepare('SELECT s.token,u.* FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND (s.expires_at IS NULL OR s.expires_at>NOW())'); $q->execute([$t]); $u=$q->fetch(PDO::FETCH_ASSOC); if(!$u) res(false,null,'INVALID_TOKEN',401); return $u; }
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

