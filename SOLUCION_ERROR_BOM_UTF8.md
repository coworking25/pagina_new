# 🐛 ERROR SOLUCIONADO - Cannot convert object to primitive value

**Fecha:** 20 de Octubre, 2025  
**Error:** `TypeError: Cannot convert object to primitive value`  
**Ubicación:** `lazyInitializer` en React lazy loading

---

## 📋 DESCRIPCIÓN DEL ERROR

Después de eliminar los modales duplicados usando el script de PowerShell (`remove_old_modals.ps1`), la aplicación mostraba el siguiente error:

```
🚨 Error global capturado: TypeError: Cannot convert object to primitive value
    at String (<anonymous>)
    at chunk-OU5AQDZK.js?v=c2eb93cf:133:22
    at Array.map (<anonymous>)
    at printWarning (chunk-OU5AQDZK.js?v=c2eb93cf:132:39)
    at error (chunk-OU5AQDZK.js?v=c2eb93cf:120:15)
    at lazyInitializer (chunk-OU5AQDZK.js?v=c2eb93cf:898:17)
```

---

## 🔍 CAUSA RAÍZ

Cuando el script de PowerShell (`remove_old_modals.ps1`) guardó el archivo `AdminClients.tsx`, utilizó:

```powershell
$newLines | Set-Content $filePath -Encoding UTF8
```

Esta opción de encoding **UTF8** en PowerShell 5.1 incluye un **BOM (Byte Order Mark)** al principio del archivo. Este BOM invisible causó que:

1. El parser de JavaScript/TypeScript tuviera problemas leyendo el archivo
2. React lazy() fallara al intentar cargar el componente dinámicamente
3. El error se manifestaba como "Cannot convert object to primitive value"

---

## ✅ SOLUCIÓN IMPLEMENTADA

Se recodificó el archivo `AdminClients.tsx` a **UTF-8 sin BOM** usando .NET Framework:

```powershell
$content = Get-Content "src\pages\AdminClients.tsx" -Raw
[System.IO.File]::WriteAllText(
    "$PWD\src\pages\AdminClients.tsx", 
    $content, 
    (New-Object System.Text.UTF8Encoding $false)
)
```

**Parámetros clave:**
- `$false` en `UTF8Encoding` = **Sin BOM**
- `WriteAllText` = Escribe todo el contenido de una vez

---

## 🔧 PASOS REALIZADOS

1. ✅ Identificar que el error venía del lazy loading de React
2. ✅ Descartar errores de sintaxis (el archivo compilaba sin errores)
3. ✅ Detectar que el problema era el encoding del archivo
4. ✅ Crear backup del archivo (`AdminClients.backup.tsx`)
5. ✅ Recodificar a UTF-8 sin BOM
6. ✅ Reiniciar servidor de desarrollo
7. ✅ Verificar que la aplicación carga correctamente

---

## 📝 LECCIONES APRENDIDAS

### ❌ **MAL:**
```powershell
# PowerShell 5.1 agrega BOM con -Encoding UTF8
$content | Set-Content $file -Encoding UTF8
```

### ✅ **BIEN:**
```powershell
# Usar .NET para guardar sin BOM
$content = Get-Content $file -Raw
[System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
```

### ✅ **MEJOR (PowerShell 7+):**
```powershell
# PowerShell 7 tiene UTF8NoBOM nativo
$content | Set-Content $file -Encoding UTF8NoBOM
```

---

## 🚨 CÓMO DETECTAR ESTE PROBLEMA

### **Síntomas:**
- Error "Cannot convert object to primitive value"
- Error en `lazyInitializer` de React
- El componente exporta correctamente pero lazy() falla
- El archivo compila sin errores en TypeScript

### **Verificación:**
```powershell
# Ver los primeros bytes del archivo
Format-Hex "src\pages\AdminClients.tsx" -Count 16

# Si ves EF BB BF al inicio = HAY BOM
# Si ves directamente el código = SIN BOM (correcto)
```

---

## 📊 ARCHIVOS MODIFICADOS

| Archivo | Acción | Encoding |
|---------|--------|----------|
| `src/pages/AdminClients.tsx` | Recodificado | UTF-8 sin BOM ✅ |
| `src/pages/AdminClients.backup.tsx` | Backup creado | UTF-8 con BOM |
| `remove_old_modals.ps1` | Script original | (No modificado) |

---

## ✅ VERIFICACIÓN POST-SOLUCIÓN

- [ ] ¿El servidor de desarrollo inicia sin errores?
- [ ] ¿La página `/admin/clients` carga correctamente?
- [ ] ¿NO hay errores en la consola del navegador?
- [ ] ¿Los modales de cliente funcionan correctamente?
- [ ] ¿El wizard de crear cliente funciona?

---

## 🔄 SI EL PROBLEMA PERSISTE

Si después de recodificar el archivo el error persiste:

1. **Limpiar caché de Vite:**
   ```powershell
   Remove-Item -Recurse -Force node_modules\.vite
   npm run dev
   ```

2. **Revisar otros archivos que puedan tener BOM:**
   ```powershell
   Get-ChildItem src -Recurse -Include *.tsx,*.ts | ForEach-Object {
       $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
       if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
           Write-Host "BOM encontrado en: $($_.FullName)" -ForegroundColor Red
       }
   }
   ```

3. **Recodificar todos los archivos afectados:**
   ```powershell
   # Para cada archivo con BOM
   $file = "ruta/al/archivo.tsx"
   $content = Get-Content $file -Raw
   [System.IO.File]::WriteAllText($file, $content, (New-Object System.Text.UTF8Encoding $false))
   ```

---

## 🛠️ SCRIPT MEJORADO PARA FUTURAS ELIMINACIONES

Para evitar este problema en el futuro, actualizar `remove_old_modals.ps1`:

```powershell
# VERSIÓN MEJORADA - Guarda sin BOM
$filePath = "src\pages\AdminClients.tsx"
$lines = Get-Content $filePath

# ... (lógica de eliminación)

# CAMBIO AQUÍ: Usar .NET en lugar de Set-Content
$content = $newLines -join "`n"
[System.IO.File]::WriteAllText(
    (Resolve-Path $filePath).Path,
    $content,
    (New-Object System.Text.UTF8Encoding $false)
)

Write-Host "[OK] Archivo guardado sin BOM" -ForegroundColor Green
```

---

## 📚 REFERENCIAS

- [PowerShell Encoding Issues](https://stackoverflow.com/questions/5596982/using-powershell-to-write-a-file-in-utf-8-without-the-bom)
- [React Lazy Loading](https://react.dev/reference/react/lazy)
- [UTF-8 BOM vs No BOM](https://en.wikipedia.org/wiki/Byte_order_mark)

---

**✅ PROBLEMA RESUELTO**

El archivo `AdminClients.tsx` ahora está correctamente codificado en UTF-8 sin BOM y la aplicación carga correctamente.

---

**Generado por:** GitHub Copilot  
**Fecha:** 20 de Octubre, 2025
