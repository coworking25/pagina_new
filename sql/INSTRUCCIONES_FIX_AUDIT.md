-- =====================================================
-- INSTRUCCIONES DE EJECUCIÓN: FIX AUDIT LOG
-- =====================================================

EJECUTAR EN ESTE ORDEN EN SUPABASE SQL EDITOR:

📝 **PASO 1: Deshabilitar Trigger**
Archivo: FIX_AUDIT_STEP_1_DISABLE_TRIGGER.sql
- Deshabilita el trigger temporalmente
- Evita conflictos durante la migración
- Tiempo estimado: < 1 segundo

📝 **PASO 2: Modificar Tabla**
Archivo: FIX_AUDIT_STEP_2_ALTER_TABLE.sql
- Elimina constraint FK antigua
- Hace columna changed_by nullable
- Recrea FK con ON DELETE SET NULL
- Recrea índice como parcial
- Tiempo estimado: < 5 segundos

📝 **PASO 3: Actualizar Funciones**
Archivo: FIX_AUDIT_STEP_3_UPDATE_FUNCTIONS.sql
- Actualiza log_client_changes() con lógica mejorada:
  * Verifica si usuario es asesor
  * Usa NULL si no es asesor
  * Usa IS DISTINCT FROM para comparaciones
- Tiempo estimado: < 1 segundo

📝 **PASO 4: Re-habilitar Trigger**
Archivo: FIX_AUDIT_STEP_4_ENABLE_TRIGGER.sql
- Re-habilita client_audit_trigger
- Sistema queda completamente funcional
- Tiempo estimado: < 1 segundo

⚠️ **IMPORTANTE:**
- NO ejecutar todos los scripts juntos
- Ejecutar UNO POR UNO en orden
- Esperar mensaje de éxito antes de continuar al siguiente
- Si hay error, detener y reportar

✅ **DESPUÉS DE COMPLETAR:**
El sistema permitirá:
- Editar clientes desde cualquier usuario admin
- changed_by será NULL si no es asesor
- changed_by tendrá UUID si es asesor
- No habrá error FK constraint
- Audit log seguirá funcionando correctamente
