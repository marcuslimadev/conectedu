<?php
require_once __DIR__.'/functions.php';
$pdo = db();
$email = 'professor@teste.com';
$uid = $pdo->query("SELECT id FROM users WHERE email = '".$email."'")->fetchColumn();
if(!$uid){ echo "no-user"; exit; }
$tok = $pdo->query("SELECT token FROM sessions WHERE user_id=$uid AND (expires_at IS NULL OR expires_at>NOW()) ORDER BY id DESC LIMIT 1")->fetchColumn();
if(!$tok){ $tok = bin2hex(random_bytes(32)); $stmt=$pdo->prepare("INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 HOUR))"); $stmt->execute([$uid,$tok]); }
echo $tok;