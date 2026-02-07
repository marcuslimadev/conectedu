# Fix detached HEAD e push
Set-Location C:\xampp\htdocs\conectedu

Write-Host "Voltando para branch frontvue..." -ForegroundColor Yellow
git checkout frontvue

Write-Host "Aplicando commit a4fda0c..." -ForegroundColor Yellow
git cherry-pick a4fda0c

Write-Host "Fazendo push..." -ForegroundColor Yellow
git push origin frontvue

Write-Host "Pronto!" -ForegroundColor Green
