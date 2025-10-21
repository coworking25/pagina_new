$file = "c:\Users\Usuario\Desktop\COWORKING\PAGINA WEB FINAL\src\components\ClientEditForm.tsx"
$content = Get-Content $file -Raw

# Reemplazar inputs de texto simples
$content = $content -replace 'className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"', 'className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"'

# Reemplazar textareas
$content = $content -replace 'className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"', 'className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"'

# Reemplazar títulos de sección
$content = $content -replace 'className="font-medium text-gray-900"', 'className="font-medium text-gray-900 dark:text-white"'

# Reemplazar cajas de conceptos de pago
$content = $content -replace 'className="p-4 border border-gray-200 rounded-lg"', 'className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"'

# Reemplazar fondos de secciones (fiador, etc)
$content = $content -replace 'className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg"', 'className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"'

# Reemplazar bg-blue-50 (sección de documentos)
$content = $content -replace 'className="p-4 bg-blue-50 rounded-lg border border-blue-200"', 'className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"'

# Reemplazar bg-gray-50 (lista de documentos)
$content = $content -replace 'className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"', 'className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"'

# Reemplazar texto de notas
$content = $content -replace 'className="mt-3 text-xs text-gray-500"', 'className="mt-3 text-xs text-gray-500 dark:text-gray-400"'

# Reemplazar botones secundarios (ver, eliminar)
$content = $content -replace 'className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"', 'className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"'

$content = $content -replace 'className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"', 'className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"'

# Reemplazar mensaje "No hay documentos"
$content = $content -replace 'className="text-center py-8 text-gray-500"', 'className="text-center py-8 text-gray-500 dark:text-gray-400"'

# Guardar
Set-Content $file $content -NoNewline

Write-Host "✅ Modo oscuro aplicado correctamente a ClientEditForm.tsx"
