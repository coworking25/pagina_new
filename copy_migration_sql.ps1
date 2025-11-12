# ============================================
# SCRIPT PARA COPIAR SQL AL PORTAPAPELES
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "MIGRACION: PAGOS Y ADMINISTRACION" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que existe el archivo
$sqlFile = "ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql"

if (-not (Test-Path $sqlFile)) {
    Write-Host "Error: No se encuentra el archivo $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Copiando SQL al portapapeles..." -ForegroundColor Blue

# Copiar al portapapeles
Get-Content $sqlFile | Set-Clipboard

Write-Host "SQL copiado exitosamente!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SIGUIENTE PASO:" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Abre Supabase SQL Editor:" -ForegroundColor Yellow
Write-Host "   https://gfczfjpyyyyvteyrvhgt.supabase.co/project/_/sql" -ForegroundColor Blue
Write-Host ""

Write-Host "2. Haz clic en New Query" -ForegroundColor Yellow
Write-Host ""

Write-Host "3. Pega el SQL (Ctrl+V)" -ForegroundColor Yellow
Write-Host ""

Write-Host "4. Haz clic en Run" -ForegroundColor Yellow
Write-Host ""

Write-Host "5. Espera el mensaje de exito" -ForegroundColor Yellow
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "TIP: El SQL ya esta en tu portapapeles" -ForegroundColor Cyan
Write-Host ""

# Preguntar si quiere abrir el navegador
$response = Read-Host "Quieres abrir Supabase en el navegador? (S/N)"

if ($response -eq "S" -or $response -eq "s" -or $response -eq "si") {
    Start-Process "https://gfczfjpyyyyvteyrvhgt.supabase.co/project/_/sql"
    Write-Host ""
    Write-Host "Navegador abierto. Pega el SQL y ejecuta!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Ok, copia este link:" -ForegroundColor Yellow
    Write-Host "https://gfczfjpyyyyvteyrvhgt.supabase.co/project/_/sql" -ForegroundColor Blue
    Write-Host ""
}

Write-Host "Presiona Enter para salir..." -ForegroundColor Gray
Read-Host
