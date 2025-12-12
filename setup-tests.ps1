# Script de Setup dos Testes Playwright - ConectEDU
# Execute: .\setup-tests.ps1

Write-Host "🧪 ConectEDU - Setup de Testes Playwright" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Verificar se Node.js está instalado
Write-Host "1️⃣ Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js instalado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "   📥 Baixe em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# Verificar se npm está instalado
Write-Host "`n2️⃣ Verificando npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "   ✅ npm instalado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ npm não encontrado!" -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host "`n3️⃣ Instalando dependências do projeto..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Dependências instaladas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao instalar dependências!" -ForegroundColor Red
    exit 1
}

# Instalar browsers do Playwright
Write-Host "`n4️⃣ Instalando browsers do Playwright..." -ForegroundColor Yellow
Write-Host "   ⏳ Isso pode demorar alguns minutos..." -ForegroundColor Gray
npx playwright install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Browsers instalados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao instalar browsers!" -ForegroundColor Red
    exit 1
}

# Verificar se XAMPP está rodando
Write-Host "`n5️⃣ Verificando XAMPP..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost/conectedu/frontend/" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ XAMPP está rodando!" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ XAMPP não está rodando ou ConectEDU não está acessível" -ForegroundColor Yellow
    Write-Host "   ℹ️ Certifique-se de iniciar Apache e MySQL no XAMPP Control Panel" -ForegroundColor Gray
    Write-Host "   ℹ️ URL esperada: http://localhost/conectedu/frontend/" -ForegroundColor Gray
}

# Verificar banco de dados
Write-Host "`n6️⃣ Verificando banco de dados..." -ForegroundColor Yellow
Write-Host "   ℹ️ Certifique-se de que o banco 'conect_edu' existe" -ForegroundColor Gray
Write-Host "   ℹ️ Execute: mysql -u root -p conect_edu < backend/schema.sql" -ForegroundColor Gray

# Criar diretórios de resultados
Write-Host "`n7️⃣ Criando diretórios de resultados..." -ForegroundColor Yellow
$dirs = @("test-results", "playwright-report")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "   ✅ Criado: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ Já existe: $dir" -ForegroundColor Gray
    }
}

# Resumo
Write-Host "`n" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "✨ Setup concluído com sucesso!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Cyan

Write-Host "`n📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Inicie XAMPP (Apache + MySQL)" -ForegroundColor White
Write-Host "   2. Acesse: http://localhost/conectedu/frontend/" -ForegroundColor White
Write-Host "   3. Faça login como admin (admin@conectedu.com / admin123)" -ForegroundColor White
Write-Host "   4. Execute os testes:" -ForegroundColor White
Write-Host ""
Write-Host "   npm test                  # Todos os testes" -ForegroundColor Cyan
Write-Host "   npm run test:ui           # Interface gráfica" -ForegroundColor Cyan
Write-Host "   npm run test:headed       # Ver navegador" -ForegroundColor Cyan
Write-Host "   npm run test:entrevista   # Só Entrevista" -ForegroundColor Cyan
Write-Host "   npm run test:pdi          # Só PDI" -ForegroundColor Cyan
Write-Host "   npm run test:pai          # Só PAI" -ForegroundColor Cyan
Write-Host "   npm run test:pdf          # Validação de PDFs" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Documentação completa em: tests/README.md" -ForegroundColor Gray
Write-Host ""
