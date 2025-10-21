# Script para aplicar modo oscuro a mensajes de "no data" en ClientDetailsEnhanced.tsx

$filePath = "src\components\ClientDetailsEnhanced.tsx"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Reemplazar clases de iconos en mensajes de "no data"
$content = $content -replace 'text-gray-300 mx-auto mb-4', 'text-gray-300 dark:text-gray-600 mx-auto mb-4'

# Reemplazar clases de texto en mensajes de "no data"
$content = $content -replace '(<p className="text-gray-600)(">[^<]+</p>)', '$1 dark:text-gray-400$2'

# Guardar el archivo
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Modo oscuro aplicado correctamente a mensajes de 'no data' en ClientDetailsEnhanced.tsx" -ForegroundColor Green
