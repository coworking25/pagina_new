# Script para corregir caracteres corruptos en AdminClients.tsx
# Fecha: 20 de Octubre, 2025

$filePath = "src\pages\AdminClients.tsx"

Write-Host "🔧 Corrigiendo caracteres corruptos en AdminClients.tsx..." -ForegroundColor Cyan

# Leer el archivo completo
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# Diccionario de reemplazos
$replacements = @{
    'mÃ¡s' = 'más'
    'mÃ¡' = 'má'
    'selecciÃ³n' = 'selección'
    'automÃ¡ticamente' = 'automáticamente'
    'especÃ­fico' = 'específico'
    'podrÃ­amos' = 'podríamos'
    'pestaÃ±a' = 'pestaña'
    'buscarÃ­amos' = 'buscaríamos'
    'producciÃ³n' = 'producción'
    'relaciÃ³n' = 'relación'
    'mÃºltiple' = 'múltiple'
    'EstadÃ­sticas' = 'Estadísticas'
    'AcciÃ³n' = 'Acción'
    'TelÃ©fono' = 'Teléfono'
    'UbicaciÃ³n' = 'Ubicación'
    'ProfesiÃ³n' = 'Profesión'
    'InformaciÃ³n' = 'Información'
    'DirecciÃ³n' = 'Dirección'
    'CÃ³digo' = 'Código'
    'CaracterÃ­sticas' = 'Características'
    'BaÃ±os' = 'Baños'
    'Ãrea' = 'Área'
    'DescripciÃ³n' = 'Descripción'
    'implementaciÃ³n' = 'implementación'
    'âœ…' = '✅'
    'mÂ²' = 'm²'
}

# Aplicar todos los reemplazos
$originalContent = $content
foreach ($key in $replacements.Keys) {
    $content = $content.Replace($key, $replacements[$key])
}

# Verificar si hubo cambios
if ($content -ne $originalContent) {
    # Guardar sin BOM
    [System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding $false))
    Write-Host "✅ Caracteres corregidos exitosamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Caracteres corregidos:" -ForegroundColor Yellow
    foreach ($key in $replacements.Keys) {
        if ($originalContent.Contains($key)) {
            Write-Host "   $key → $($replacements[$key])" -ForegroundColor White
        }
    }
} else {
    Write-Host "ℹ️ No se encontraron caracteres corruptos" -ForegroundColor Blue
}

Write-Host ""
Write-Host "✅ Archivo listo!" -ForegroundColor Green
