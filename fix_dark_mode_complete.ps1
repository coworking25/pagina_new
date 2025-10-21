# Script completo para aplicar modo oscuro a todos los elementos de ClientDetailsEnhanced.tsx

$filePath = "src\components\ClientDetailsEnhanced.tsx"
$content = Get-Content -Path $filePath -Raw -Encoding UTF8

# Documentos - cards de documentos
$content = $content -replace 'className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"', 'className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"'

# Documentos - container de icono
$content = $content -replace 'className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg"', 'className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg"'

# Documentos - icono de archivo
$content = $content -replace '(<FileText className="w-6 h-6 text-blue-600)', '$1 dark:text-blue-400'

# Documentos - título del documento
$content = $content -replace '(<h4 className="font-medium text-gray-900">)', '$1 dark:text-white'

# Documentos - separadores
$content = $content -replace '(<span className="text-sm text-gray-400">•</span>)', '<span className="text-sm text-gray-400 dark:text-gray-600">•</span>'

# Propiedades - cards de propiedades  
$content = $content -replace 'className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"', 'className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"'

# Pagos - cards de pagos
$content = $content -replace 'className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"', 'className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"'

# Resumen de conceptos de pago
$content = $content -replace 'className="p-3 bg-gray-50 rounded-lg"', 'className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"'

# Nota de pago
$content = $content -replace 'className="mb-3 p-2 bg-gray-50 rounded text-sm text-gray-600"', 'className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400"'

# Botones
$content = $content -replace '(className="[^"]*text-blue-600)( [^"]*")', '$1 dark:text-blue-400$2'
$content = $content -replace '(className="[^"]*bg-blue-50)( [^"]*")', '$1 dark:bg-blue-900/30$2'
$content = $content -replace '(className="[^"]*hover:bg-blue-100)( [^"]*")', '$1 dark:hover:bg-blue-900/50$2'

# Botones de descarga/vista (solo los que aún no tienen dark mode)
$content = $content -replace 'className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"', 'className="px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"'

# Estados de pago
$content = $content -replace '(className="[^"]*text-green-600)', '$1 dark:text-green-400'
$content = $content -replace '(className="[^"]*text-yellow-600)', '$1 dark:text-yellow-400'  
$content = $content -replace '(className="[^"]*text-red-600)', '$1 dark:text-red-400'

# Badges
$content = $content -replace '(className="[^"]*bg-green-100 text-green-800)', '$1 dark:bg-green-900/30 dark:text-green-400'
$content = $content -replace '(className="[^"]*bg-yellow-100 text-yellow-800)', '$1 dark:bg-yellow-900/30 dark:text-yellow-400'
$content = $content -replace '(className="[^"]*bg-red-100 text-red-800)', '$1 dark:bg-red-900/30 dark:text-red-400'
$content = $content -replace '(className="[^"]*bg-gray-100 text-gray-800)', '$1 dark:bg-gray-700 dark:text-gray-300'
$content = $content -replace '(className="[^"]*bg-blue-100 text-blue-800)', '$1 dark:bg-blue-900/30 dark:text-blue-400'

# Guardar el archivo
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Modo oscuro completo aplicado a ClientDetailsEnhanced.tsx" -ForegroundColor Green
