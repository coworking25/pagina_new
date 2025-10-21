# Script para eliminar los modales viejos de AdminClients.tsx
# Elimina las líneas 1586-2722 (modales viejos de Ver y Editar cliente)

$filePath = "src\pages\AdminClients.tsx"

# Leer todas las líneas
$lines = Get-Content $filePath

# Crear nuevo array sin las líneas 1586-2722 (indices 1585-2721 en el array)
$newLines = @()

# Agregar líneas 1-1585
for ($i = 0; $i -lt 1585; $i++) {
    $newLines += $lines[$i]
}

# Agregar comentario de reemplazo
$newLines += ""
$newLines += "      {/* ========================================"
$newLines += "          MODALES VIEJOS ELIMINADOS (1,137 líneas)"
$newLines += "          - Modal Ver Cliente (viejo)"
$newLines += "          - Modal Editar Cliente (viejo)"
$newLines += "          Reemplazados por:"
$newLines += "          - ClientDetailsEnhanced (ver más abajo)"
$newLines += "          - ClientEditForm (ver más abajo)"
$newLines += "          ======================================== */}"
$newLines += ""

# Agregar líneas desde 2723 en adelante (índice 2722)
for ($i = 2722; $i -lt $lines.Count; $i++) {
    $newLines += $lines[$i]
}

# Guardar el archivo
$newLines | Set-Content $filePath -Encoding UTF8

Write-Host "[OK] Modales viejos eliminados exitosamente!" -ForegroundColor Green
Write-Host "[INFO] Lineas eliminadas: 1,137" -ForegroundColor Yellow
Write-Host "[INFO] Lineas restantes: $($newLines.Count)" -ForegroundColor Cyan
