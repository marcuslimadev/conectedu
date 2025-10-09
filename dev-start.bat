@echo off
echo Iniciando ConectEDU em modo de desenvolvimento...
echo.
echo Pressione Ctrl+C para parar
echo.

REM Iniciar o Tailwind CSS em modo watch
echo [TAILWIND] Iniciando build automatico do CSS...
start /B npm run build-css

REM Aguardar um pouco para que o primeiro build seja concluído
timeout /t 3 /nobreak > nul

echo.
echo Sistema pronto! Acesse: http://localhost/conectedu
echo.
echo - CSS sera atualizado automaticamente quando voce editar os arquivos
echo - Para parar, pressione Ctrl+C neste terminal
echo.

REM Manter o terminal aberto
pause