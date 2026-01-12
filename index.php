<?php
// ConectAEE - Entrada principal (index.php não mais necessário com .htaccess)
// Este arquivo serve apenas como fallback caso .htaccess não esteja funcionando

// Se .htaccess estiver ativo, nunca chegará aqui
// Caso contrário, redireciona para /frontend/

if (!headers_sent()) {
  header('Location: frontend/', true, 302);
  exit;
}
?>
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=frontend/">
  <title>ConectAEE</title>
</head>
<body>
  <p>Redirecionando... <a href="frontend/">Clique aqui</a> se não for redirecionado.</p>
</body>
</html>
