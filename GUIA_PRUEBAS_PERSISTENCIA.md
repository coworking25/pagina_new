# 🧪 Guía de Pruebas - Sistema de Persistencia de Formularios

## ✅ Estado del Sistema

- **Servidor:** ✅ Corriendo en http://localhost:5174
- **Build:** ✅ Compilado sin errores
- **Archivos creados:**
  - `src/hooks/usePersistedState.ts` (Custom hook)
  - `SISTEMA_PERSISTENCIA_FORMULARIOS.md` (Documentación completa)
- **Archivos modificados:**
  - `src/pages/AdminProperties.tsx` (Implementación de persistencia)

---

## 🎯 Pruebas a Realizar

### Prueba 1: Auto-Guardado Básico ⏱️ 2 min

**Objetivo:** Verificar que el formulario se guarda automáticamente

**Pasos:**
1. Ir a http://localhost:5174
2. Iniciar sesión como administrador
3. Ir a la sección de propiedades
4. Hacer clic en "Nueva Propiedad"
5. Llenar algunos campos:
   - Título: "Casa de Prueba Auto-Guardado"
   - Precio: "350000000"
   - Ubicación: "Chapinero"
6. **Abrir DevTools** (F12)
7. Ir a: **Application → Storage → Local Storage → http://localhost:5174**
8. Buscar la key: `admin-property-form-draft`

**Resultado Esperado:**
```json
{
  "value": {
    "title": "Casa de Prueba Auto-Guardado",
    "price": "350000000",
    "location": "Chapinero",
    ...
  },
  "timestamp": 1705253445123
}
```

✅ **PASS:** Los datos están en localStorage
❌ **FAIL:** No hay nada en localStorage

---

### Prueba 2: Restauración al Cambiar de Pestaña ⏱️ 3 min

**Objetivo:** El problema original - verificar que NO se pierde nada

**Pasos:**
1. Llenar el formulario de nueva propiedad con bastantes datos:
   ```
   Título: "Apartamento Moderno Chicó"
   Descripción: "Hermoso apartamento con acabados de lujo..."
   Precio: "800000000"
   Ubicación: "Chicó, Bogotá"
   Habitaciones: "3"
   Baños: "2"
   Área: "120"
   Tipo: "Apartamento"
   ```
2. Seleccionar algunas amenidades:
   - WiFi
   - Parqueadero
   - Gimnasio
3. **Sin guardar, abrir una nueva pestaña** (Ctrl+T)
4. Navegar a cualquier sitio (Google, YouTube, etc.)
5. **Volver a la pestaña original**
6. **Refrescar la página** (F5)
7. Volver a abrir el modal "Nueva Propiedad"

**Resultado Esperado:**
- ✅ Aparece alerta azul: "📝 Borrador Restaurado"
- ✅ Todos los campos tienen los valores que escribiste
- ✅ Las amenidades están seleccionadas
- ✅ Se muestra "Último guardado: [fecha/hora]"
- ✅ Hay un botón "Descartar borrador y empezar de nuevo"

**Comparación con el problema original:**
- ❌ ANTES: Todo se perdía, formulario vacío
- ✅ AHORA: Todo está restaurado

---

### Prueba 3: Descartar Borrador ⏱️ 1 min

**Objetivo:** Verificar que puedes limpiar el borrador si quieres empezar de nuevo

**Pasos:**
1. Con un borrador restaurado (de la prueba anterior)
2. Hacer clic en "Descartar borrador y empezar de nuevo"

**Resultado Esperado:**
- ✅ Formulario se vacía completamente
- ✅ La alerta azul desaparece
- ✅ En DevTools, las keys de localStorage están vacías o no existen

---

### Prueba 4: Limpieza al Guardar ⏱️ 3 min

**Objetivo:** Verificar que el borrador se limpia después de guardar exitosamente

**Pasos:**
1. Llenar formulario de nueva propiedad (puede ser simple):
   ```
   Título: "Propiedad Test"
   Precio: "100000000"
   Ubicación: "Bogotá"
   Habitaciones: "2"
   Baños: "1"
   Área: "60"
   ```
2. Seleccionar 1-2 amenidades
3. **Hacer clic en "Guardar" o "Crear Propiedad"**
4. Esperar a que se cree exitosamente
5. Abrir DevTools → Local Storage

**Resultado Esperado:**
- ✅ Propiedad creada exitosamente
- ✅ Modal se cierra
- ✅ LocalStorage NO tiene `admin-property-form-draft` (o está vacío)
- ✅ Al abrir el modal de nuevo → Formulario vacío (sin borrador)

---

### Prueba 5: Persistencia de Imágenes (URLs) ⏱️ 5 min

**Objetivo:** Verificar que las URLs de imágenes subidas se guardan

**Pasos:**
1. Abrir modal "Nueva Propiedad"
2. Llenar campo título: "Casa con Imágenes"
3. **Subir 2-3 imágenes** (esperar a que suban a Supabase)
4. Ver que aparecen en la preview del formulario
5. **Cambiar de pestaña** y volver
6. **Refrescar página** (F5)
7. Abrir modal "Nueva Propiedad" de nuevo

**Resultado Esperado:**
- ✅ Formulario restaurado
- ✅ Las URLs de las imágenes están en `previewImages`
- ✅ **NOTA:** Las imágenes físicas no se pueden restaurar (solo URLs)

---

### Prueba 6: Indicador de Auto-Guardado ⏱️ 1 min

**Objetivo:** Verificar que se muestra el indicador de guardado

**Pasos:**
1. Abrir modal "Nueva Propiedad"
2. Escribir cualquier cosa en el campo título
3. Observar la esquina superior derecha del formulario

**Resultado Esperado:**
- ✅ Aparece un pequeño texto: "✅ Borrador guardado automáticamente"
- ✅ El texto es verde/gris suave (no intrusivo)

---

### Prueba 7: Expiración de Borrador ⏱️ Variable

**Objetivo:** Verificar que borradores antiguos expiran

**Pasos:**
1. **Temporal:** Editar `src/hooks/usePersistedState.ts`
   ```typescript
   expirationTime: 10 * 1000 // 10 segundos en lugar de 24 horas
   ```
2. Crear un borrador
3. Esperar 11 segundos
4. Refrescar página
5. Abrir modal

**Resultado Esperado:**
- ✅ Formulario vacío (borrador expirado)
- ✅ No aparece alerta de borrador

**IMPORTANTE:** Revertir el cambio después de probar:
```typescript
expirationTime: 24 * 60 * 60 * 1000 // 24 horas
```

---

### Prueba 8: Consola de Logs ⏱️ 1 min

**Objetivo:** Verificar que los logs de debug funcionan

**Pasos:**
1. Abrir DevTools → Console
2. Crear un borrador
3. Refrescar y restaurar
4. Descartar borrador

**Resultado Esperado - Logs en consola:**
```
✅ Estado restaurado desde localStorage: admin-property-form-draft
✅ Estado restaurado desde localStorage: admin-property-images-draft
✅ Estado restaurado desde localStorage: admin-property-amenities-draft
💾 Estado guardado en localStorage: admin-property-form-draft
💾 Estado guardado en localStorage: admin-property-images-draft
💾 Estado guardado en localStorage: admin-property-amenities-draft
🧹 Formulario y borradores limpiados
🗑️ Estado limpiado: admin-property-form-draft
🗑️ Estado limpiado: admin-property-images-draft
🗑️ Estado limpiado: admin-property-amenities-draft
```

---

## 🐛 Troubleshooting

### Problema: No se guarda en localStorage

**Posibles causas:**
1. Navegador en modo privado/incógnito
2. localStorage deshabilitado por configuración
3. Cuota de localStorage excedida (raro)

**Solución:**
- Verificar en consola si hay errores
- Probar en modo normal (no incógnito)
- Limpiar localStorage: `localStorage.clear()`

---

### Problema: Borrador no se restaura

**Posibles causas:**
1. El borrador expiró (>24 horas)
2. El formulario está vacío (no hay título)
3. Error de parsing JSON

**Solución:**
- Verificar timestamp en localStorage
- Ver logs en consola
- Verificar que `formData.title` no esté vacío

---

### Problema: Alerta azul no aparece

**Posibles causas:**
1. `showDraftAlert` está en false
2. `formData.title` está vacío
3. No hay borrador en localStorage

**Solución:**
- Verificar que hay un borrador con título en localStorage
- Revisar estado de `showDraftAlert` en React DevTools

---

## 📊 Checklist de Verificación

Marca las pruebas completadas:

- [ ] ✅ Prueba 1: Auto-guardado básico
- [ ] ✅ Prueba 2: Restauración al cambiar pestaña (CRÍTICA)
- [ ] ✅ Prueba 3: Descartar borrador
- [ ] ✅ Prueba 4: Limpieza al guardar
- [ ] ✅ Prueba 5: Persistencia de imágenes (URLs)
- [ ] ✅ Prueba 6: Indicador de auto-guardado
- [ ] ✅ Prueba 7: Expiración de borrador (opcional)
- [ ] ✅ Prueba 8: Consola de logs

---

## 🎉 Resultado Final Esperado

### ✅ ANTES (Problema)
```
Usuario completa formulario
↓
Usuario cambia de pestaña
↓
Usuario regresa
↓
😱 TODO PERDIDO
↓
Usuario frustrado
```

### ✅ AHORA (Solución)
```
Usuario completa formulario
↓
Auto-guardado en localStorage
↓
Usuario cambia de pestaña
↓
Usuario regresa
↓
🎉 TODO RESTAURADO
↓
Alerta: "📝 Borrador Restaurado"
↓
Usuario feliz
```

---

## 📝 Notas Adicionales

1. **Tiempo de expiración:** 24 horas es configurable
2. **Múltiples borradores:** Actualmente solo hay 1 borrador (el más reciente)
3. **Sincronización entre pestañas:** No implementado (mejora futura)
4. **Tamaño de datos:** Solo texto/URLs, no archivos completos

---

## 🚀 Próximos Pasos Sugeridos

Si todo funciona correctamente:

1. Hacer commit del código:
   ```bash
   git add .
   git commit -m "feat: Sistema de persistencia de formularios con localStorage"
   git push origin main
   ```

2. Documentar en changelog:
   - Problema resuelto
   - Características agregadas
   - Archivos modificados

3. Considerar mejoras futuras:
   - Broadcast Channel para sync entre pestañas
   - Historial de versiones de borradores
   - Compresión de datos (LZ-string)
   - Notificación toast en lugar de alerta

---

**¿Todo funcionó? ¡Excelente!** 🎉

El problema de pérdida de datos está completamente resuelto.
