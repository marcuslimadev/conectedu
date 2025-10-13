<?php
// Redireciona automaticamente para a SPA em /frontend/
// Mantém compatibilidade com subdiretório (ex.: /conectedu)

$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
$base = $scriptDir === '' ? '' : $scriptDir; // ex.: '/conectedu'
$target = $base . '/frontend/';

// Preserva query string, se houver (opcional para rastreio)
$qs = $_SERVER['QUERY_STRING'] ?? '';
if ($qs) {
    $target .= (strpos($target, '?') === false ? '?' : '&') . $qs;
}

// Envia redirecionamento HTTP quando possível
if (!headers_sent()) {
  header('Location: ' . $target, true, 302);
  header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
  header('Pragma: no-cache');
  header('Expires: 0');
  exit;
}

// Fallback HTML (caso headers já tenham sido enviados)
?>
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=frontend/">
  <title>Redirecionando…</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem;color:#111827}</style>
  <script>location.replace('frontend/');</script>
  <link rel="canonical" href="frontend/">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  </head>
<body>
  <p>Redirecionando para a aplicação… <a href="frontend/">clique aqui</a> se não for redirecionado automaticamente.</p>
</body>
</html>
