# Script para corrigir rebase travado e fazer push
Set-Location C:\xampp\htdocs\conectedu

# Remove arquivos de rebase travado
Write-Host "Limpando estado do rebase..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git\rebase-merge -ErrorAction SilentlyContinue
Remove-Item -Force .git\REBASE_HEAD -ErrorAction SilentlyContinue
Remove-Item -Force .git\.COMMIT_EDITMSG.swp -ErrorAction SilentlyContinue

# Configura editor para não abrir
$env:GIT_EDITOR = 'true'

# Verifica estado
Write-Host "Estado do git:" -ForegroundColor Cyan
git status -sb

# Adiciona arquivos modificados
Write-Host "`nAdicionando arquivos..." -ForegroundColor Yellow
git add backend/api.php frontend/a11y.js frontend/spa-tailwind.js

# Faz commit
Write-Host "`nCriando commit..." -ForegroundColor Yellow
git commit -m "Fix registration: accept multiple password fields and auto-create professors"

# Faz push
Write-Host "`nEnviando para o GitHub..." -ForegroundColor Yellow
git push origin frontvue

Write-Host "`nPronto! Alterações enviadas." -ForegroundColor Green
