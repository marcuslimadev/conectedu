<?php
date_default_timezone_set(getenv('APP_TIMEZONE') ?: 'America/Sao_Paulo');
header('Access-Control-Allow-Origin: ' . (getenv('CORS_ORIGIN') ?: '*'));
header('Access-Control-Allow-Headers: Authorization, Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
if (($_SERVER['REQUEST_METHOD'] ?? '')==='OPTIONS'){ http_response_code(204); exit; }

function env($k,$d=null){ static $e=null; if($e===null){ $e=[]; $p=__DIR__.'/.env'; if(file_exists($p)){ foreach(file($p,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES) as $l){ if(strpos($l,'=')!==false && strpos(ltrim($l),'#')!==0){ [$a,$b]=explode('=',$l,2); $e[trim($a)] = trim($b); } } } } return $e[$k]??getenv($k)??$d; }
function res($ok,$data=null,$error=null,$code=200){ header('Content-Type: application/json; charset=utf-8'); http_response_code($code); echo json_encode(['ok'=>$ok,'data'=>$data,'error'=>$error],JSON_UNESCAPED_UNICODE); exit; }
function db(){ static $pdo=null; if($pdo) return $pdo; try{ $dsn='mysql:host='.env('DB_HOST','127.0.0.1').';port='.env('DB_PORT','3306').';dbname='.env('DB_NAME','conectedu').';charset=utf8mb4'; $pdo=new PDO($dsn,env('DB_USER','root'),env('DB_PASS',''),[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION]); return $pdo; }catch(Exception $e){ res(false,null,'DB_CONNECTION_FAILED',500); } }
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
function openai_chat($messages,$temperature=0.2){ $key=env('OPENAI_API_KEY'); if(!$key) res(false,null,'OPENAI_KEY_MISSING',500); $model=env('OPENAI_MODEL','gpt-4o-mini'); $ch=curl_init('https://api.openai.com/v1/chat/completions'); curl_setopt($ch,CURLOPT_HTTPHEADER,['Authorization: Bearer '.$key,'Content-Type: application/json']); curl_setopt($ch,CURLOPT_POST,true); curl_setopt($ch,CURLOPT_RETURNTRANSFER,true); curl_setopt($ch,CURLOPT_POSTFIELDS,json_encode(['model'=>$model,'messages'=>$messages,'temperature'=>$temperature])); $out=curl_exec($ch); if(curl_errno($ch)) res(false,null,'OPENAI_ERROR',500); $code=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch); $json=json_decode($out,true); if($code>=400||!$json) res(false,null,'OPENAI_HTTP_'.$code,500); $txt=$json['choices'][0]['message']['content']??''; return $txt; }
