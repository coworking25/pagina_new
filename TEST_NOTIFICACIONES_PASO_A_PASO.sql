-- =====================================================
-- PRUEBAS PASO A PASO - SISTEMA DE NOTIFICACIONES
-- Ejecuta cada sección por separado
-- =====================================================

-- =====================================================
-- PASO 1: LIMPIAR NOTIFICACIONES ANTERIORES (OPCIONAL)
-- =====================================================
-- Ejecuta esto si quieres empezar limpio
/*
DELETE FROM client_notifications 
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID;
*/

-- =====================================================
-- PASO 2: CREAR 7 NOTIFICACIONES DE PRUEBA
-- =====================================================

-- Notificación 1: URGENTE - Pago vence mañana
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'payment_due',
    '🔴 Pago Urgente: Vence MAÑANA',
    'Tu pago de $18,500.00 para la propiedad Departamento Centro vence mañana (23 de Diciembre). Por favor, realiza el pago a la brevedad para evitar recargos.',
    NULL,
    NULL,
    NULL,
    'urgent'
);

-- Notificación 2: ALTA - Pago vence en 3 días
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'payment_due',
    '⏰ Pago Próximo a Vencer',
    'Tu pago mensual de Enero 2026 vence en 3 días. Recuerda realizar el pago a tiempo para evitar recargos por mora.',
    NULL,
    NULL,
    NULL,
    'high'
);

-- Notificación 3: NORMAL - Nuevo documento
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'new_document',
    '📄 Nuevo Documento Disponible',
    'Se ha subido el contrato actualizado de tu propiedad Casa en la Playa. Puedes revisarlo en la sección de Documentos.',
    NULL,
    NULL,
    NULL,
    'normal'
);

-- Notificación 4: NORMAL - Mensaje del administrador
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'admin_message',
    '💬 Mensaje del Administrador',
    'Estimado propietario, le informamos que se realizará mantenimiento en el edificio el próximo sábado de 9:00 AM a 1:00 PM. Por favor, tome las precauciones necesarias.',
    NULL,
    NULL,
    NULL,
    'normal'
);

-- Notificación 5: NORMAL - Pago recibido
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'payment_received',
    '✅ Pago Recibido',
    'Se ha confirmado el pago de $25,000.00 para tu propiedad Casa en la Playa. Puedes ver los detalles en la sección de Pagos.',
    NULL,
    NULL,
    NULL,
    'normal'
);

-- Notificación 6: ALTA - Contrato por vencer
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'contract_expiring',
    '📋 Contrato por Vencer',
    'Tu contrato para la propiedad Departamento Centro vence en 25 días (15 de Enero 2026). Por favor, contacta a tu asesor para renovar o finalizar el contrato.',
    NULL,
    NULL,
    NULL,
    'high'
);

-- Notificación 7: BAJA - Mantenimiento programado
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'maintenance_scheduled',
    '🔧 Mantenimiento Programado',
    'Se ha programado mantenimiento preventivo para tu propiedad Casa en la Playa el día 30 de Diciembre a las 10:00 AM.',
    NULL,
    NULL,
    NULL,
    'low'
);

-- =====================================================
-- PASO 3: VERIFICAR QUE SE CREARON
-- =====================================================

SELECT 
    id,
    type,
    title,
    priority,
    is_read,
    created_at
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
ORDER BY created_at DESC;

-- Debería mostrar 7 notificaciones

-- =====================================================
-- PASO 4: VERIFICAR CONTADORES
-- =====================================================

SELECT 
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN priority IN ('high', 'urgent') THEN 1 ELSE 0 END) as prioritarias,
    SUM(CASE WHEN is_dismissed = TRUE THEN 1 ELSE 0 END) as descartadas
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID;

-- Debería mostrar: 7 totales, 7 no leídas, 3 prioritarias, 0 descartadas

-- =====================================================
-- PASO 5: AHORA VE AL NAVEGADOR
-- =====================================================

/*
EN EL NAVEGADOR:
===============

1. Abre: http://localhost:5173/login
2. Login: carlos.propietario@test.com / Carlos123!
3. Verifica el BADGE ROJO con número "7" en la campana

✅ DEBES VER:
- Icono de campana 🔔 en esquina superior derecha
- Badge ROJO con "7"
- Campana de color VERDE (indica notificaciones)

4. CLICK EN LA CAMPANA para abrir el modal

✅ DEBES VER EN EL MODAL:
- Título "Notificaciones" con badge "7" en rojo
- Filtros: "Todas (7)" y "No leídas (7)"
- Botón "Marcar todas"
- Toggle "🔊 Activar sonido"
- Lista de 7 notificaciones con:
  * Fondo azul claro (no leídas)
  * Emoji según tipo
  * Título en negrita
  * Mensaje
  * Tiempo relativo ("Ahora mismo")
  * Botones "Marcar leída" y "Descartar"

5. PRUEBA MARCAR COMO LEÍDA:
- Click en "Marcar leída" en cualquier notificación
- El badge debe cambiar: 7 → 6
- La notificación pierde el fondo azul claro
- Aparece sin fondo o fondo blanco

6. PRUEBA MARCAR TODAS:
- Click en "Marcar todas" (esquina superior derecha)
- El badge debe DESAPARECER
- Todas las notificaciones pierden fondo azul
- El filtro "No leídas" debe mostrar (0)

7. PRUEBA DESCARTAR:
- Click en icono de basura 🗑️ en cualquier notificación
- La notificación desaparece de la lista
- El contador total decrementa

8. PRUEBA FILTROS:
- Click en "No leídas" → muestra solo las que no has leído
- Click en "Todas" → muestra todas (leídas y no leídas)
*/

-- =====================================================
-- PASO 6: PRUEBA REALTIME (EJECUTAR MIENTRAS PORTAL ESTÁ ABIERTO)
-- =====================================================

/*
IMPORTANTE: El portal debe estar ABIERTO en el navegador
Esta notificación debe aparecer INSTANTÁNEAMENTE sin recargar (F5)
*/

SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'admin_message',
    '🔔 NOTIFICACIÓN EN TIEMPO REAL',
    '¡Hola Carlos! Esta notificación debería aparecer INSTANTÁNEAMENTE en tu portal sin necesidad de recargar la página. Si la ves aparecer automáticamente, ¡el sistema Realtime está funcionando perfectamente! 🎉',
    NULL,
    NULL,
    NULL,
    'urgent'
);

/*
✅ SI FUNCIONA REALTIME DEBERÍAS VER:
- La notificación aparece automáticamente en el modal
- El badge incrementa automáticamente
- Sonido se reproduce (si activaste el toggle)
- NO necesitas presionar F5

❌ SI NO FUNCIONA:
1. Abre Console del navegador (F12)
2. Busca errores en rojo
3. Ve a Supabase Dashboard → Database → Replication
4. Habilita la tabla "client_notifications" para Realtime
5. Recarga el portal
*/

-- =====================================================
-- PASO 7: PRUEBA NOTIFICACIONES DEL NAVEGADOR (OPCIONAL)
-- =====================================================

/*
Si diste permisos de notificación al navegador, también deberías
ver una notificación nativa del sistema operativo cuando ejecutes
la notificación de tiempo real del Paso 6.
*/

-- =====================================================
-- PASO 8: VERIFICAR DARK MODE
-- =====================================================

/*
EN EL NAVEGADOR:
1. Activa el Dark Mode (icono de luna/sol en topbar)
2. Abre el NotificationCenter
3. Verifica que se vea bien en modo oscuro:
   - Fondo negro/gris oscuro
   - Texto blanco/gris claro
   - Bordes visibles
   - Colores adaptados
*/

-- =====================================================
-- PASO 9: PRUEBA RESPONSIVE (OPCIONAL)
-- =====================================================

/*
EN EL NAVEGADOR:
1. Abre DevTools (F12)
2. Click en el icono de dispositivos móviles
3. Cambia a iPhone SE (375px) o similar
4. Abre el NotificationCenter
5. Verifica que:
   - Modal se adapta al ancho
   - Todo es legible
   - Scroll funciona
   - Botones son tocables (44px mínimo)
*/

-- =====================================================
-- PASO 10: VER RESUMEN FINAL
-- =====================================================

-- Ver distribución por tipo
SELECT 
    type,
    COUNT(*) as cantidad,
    ROUND(AVG(CASE WHEN is_read THEN 1 ELSE 0 END) * 100, 0) as porcentaje_leidas
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
GROUP BY type
ORDER BY cantidad DESC;

-- Ver distribución por prioridad
SELECT 
    priority,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 0) as porcentaje
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
AND is_dismissed = FALSE
GROUP BY priority
ORDER BY 
    CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END;

-- Ver últimas notificaciones con formato legible
SELECT 
    CASE type
        WHEN 'payment_due' THEN '⏰'
        WHEN 'payment_overdue' THEN '🔴'
        WHEN 'contract_expiring' THEN '📋'
        WHEN 'new_document' THEN '📄'
        WHEN 'admin_message' THEN '💬'
        WHEN 'payment_received' THEN '✅'
        WHEN 'maintenance_scheduled' THEN '🔧'
    END as emoji,
    title,
    CASE 
        WHEN is_read THEN '✓ Leída'
        ELSE '• Sin leer'
    END as estado,
    CASE priority
        WHEN 'urgent' THEN '🔴 URGENTE'
        WHEN 'high' THEN '🟠 ALTA'
        WHEN 'normal' THEN '🟢 NORMAL'
        WHEN 'low' THEN '⚪ BAJA'
    END as prioridad,
    TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI:SS') as fecha
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

/*
SI NO VES EL BADGE EN EL NAVEGADOR:
------------------------------------
1. Verifica en SQL que las notificaciones existen:
   SELECT COUNT(*) FROM client_notifications 
   WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID;

2. Abre Console del navegador (F12) y busca errores

3. Verifica que el client_id en localStorage coincide:
   - En Console ejecuta: localStorage.getItem('client_portal_session')
   - Debe mostrar client_id: "11111111-1111-1111-1111-111111111111"

4. Verifica las políticas RLS:
   SELECT * FROM pg_policies WHERE tablename = 'client_notifications';


SI EL MODAL NO SE ABRE:
-----------------------
1. Verifica errores en Console (F12)
2. Verifica que el componente se importó:
   - Busca "NotificationCenter" en ClientLayout.tsx
3. Recarga el navegador con Ctrl+Shift+R


SI REALTIME NO FUNCIONA:
------------------------
1. Ve a Supabase Dashboard
2. Database → Replication
3. Busca "client_notifications"
4. Activa el toggle para habilitar Realtime
5. Recarga el portal


SI EL CONTADOR NO ACTUALIZA:
----------------------------
1. Verifica que las notificaciones tienen is_read = FALSE
2. Recarga el portal (a veces el contador se queda cacheado)
3. Abre/cierra el modal para forzar actualización
*/

-- =====================================================
-- CLEANUP (OPCIONAL)
-- =====================================================

/*
Si quieres limpiar todo y empezar de nuevo:

DELETE FROM client_notifications 
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID;

Y vuelve a ejecutar desde el PASO 2
*/
