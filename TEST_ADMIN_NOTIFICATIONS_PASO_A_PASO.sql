-- =====================================================
-- PRUEBAS PASO A PASO - SISTEMA DE NOTIFICACIONES ADMIN
-- Ejecuta cada sección por separado
-- =====================================================

-- =====================================================
-- PASO 1: OBTENER TU USER_ID
-- =====================================================

-- Encuentra tu user_id de administrador
SELECT id, email, full_name, role
FROM user_profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- COPIA EL ID QUE APARECE ARRIBA Y ÚSALO EN LAS PRUEBAS

-- =====================================================
-- PASO 2: LIMPIAR NOTIFICACIONES ANTERIORES (OPCIONAL)
-- =====================================================

-- Reemplaza 'TU_USER_ID_AQUI' con tu ID real
/*
DELETE FROM admin_notifications 
WHERE user_id = 'TU_USER_ID_AQUI'::UUID;
*/

-- =====================================================
-- PASO 3: CREAR 8 NOTIFICACIONES DE PRUEBA
-- =====================================================

-- IMPORTANTE: Reemplaza 'TU_USER_ID_AQUI' con tu ID real del PASO 1

-- Notificación 1: URGENTE - Nueva cita
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'new_appointment',
    '📅 Nueva Cita Urgente',
    'Nueva cita agendada con Carlos Propietario para hoy a las 3:00 PM en Departamento Centro',
    NULL, NULL, NULL, NULL, NULL,
    'urgent'
);

-- Notificación 2: ALTA - Cita cancelada
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'appointment_cancelled',
    '❌ Cita Cancelada',
    'La cita con María García programada para mañana ha sido cancelada por el cliente',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 3: NORMAL - Pago recibido
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'payment_received',
    '💰 Pago Recibido',
    'Se ha recibido el pago de $18,500.00 de Carlos Propietario para el mes de Diciembre 2025',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 4: ALTA - Pago atrasado
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'payment_overdue',
    '⚠️ Pago Atrasado',
    'El cliente Juan Pérez tiene un pago vencido hace 5 días por $25,000.00',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 5: NORMAL - Nuevo cliente
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'new_client',
    '👤 Nuevo Cliente Registrado',
    'Se ha registrado un nuevo cliente: Ana Martínez (ana.martinez@example.com)',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 6: ALTA - Contrato por vencer
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'contract_expiring',
    '📋 Contrato por Vencer',
    'El contrato del cliente Pedro López vence en 15 días. Contactar para renovación.',
    NULL, NULL, NULL, NULL, NULL,
    'high'
);

-- Notificación 7: NORMAL - Nueva consulta
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'new_inquiry',
    '💬 Nueva Consulta de Servicio',
    'Nueva consulta recibida: "Estoy interesado en rentar un departamento en la zona centro"',
    NULL, NULL, NULL, NULL, NULL,
    'normal'
);

-- Notificación 8: BAJA - Nueva propiedad
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'new_property',
    '🏠 Nueva Propiedad Agregada',
    'Se ha agregado la propiedad "Casa Moderna en Las Condes" al sistema',
    NULL, NULL, NULL, NULL, NULL,
    'low'
);

-- =====================================================
-- PASO 4: VERIFICAR QUE SE CREARON
-- =====================================================

-- Reemplaza 'TU_USER_ID_AQUI' con tu ID real
SELECT 
    id,
    type,
    title,
    priority,
    is_read,
    created_at
FROM admin_notifications
WHERE user_id = 'TU_USER_ID_AQUI'::UUID
ORDER BY created_at DESC;

-- Debería mostrar 8 notificaciones

-- =====================================================
-- PASO 5: VERIFICAR CONTADORES
-- =====================================================

-- Reemplaza 'TU_USER_ID_AQUI' con tu ID real
SELECT 
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN priority IN ('high', 'urgent') THEN 1 ELSE 0 END) as prioritarias,
    SUM(CASE WHEN is_dismissed = TRUE THEN 1 ELSE 0 END) as descartadas
FROM admin_notifications
WHERE user_id = 'TU_USER_ID_AQUI'::UUID;

-- Debería mostrar: 8 totales, 8 no leídas, 4 prioritarias, 0 descartadas

-- =====================================================
-- PASO 6: AHORA VE AL NAVEGADOR
-- =====================================================

/*
EN EL NAVEGADOR:
===============

1. Abre: http://localhost:5173/login
2. Login con tu cuenta de admin
3. Verifica el BADGE ROJO con número "8" en la campana (esquina superior derecha)

✅ DEBES VER:
- Icono de campana 🔔 en el header
- Badge ROJO con "8"
- Campana de color VERDE (indica notificaciones)

4. CLICK EN LA CAMPANA para abrir el modal

✅ DEBES VER EN EL MODAL:
- Título "Notificaciones" con badge "8" en rojo
- Filtros: "Todas (8)" y "No leídas (8)"
- Botón de check para "Marcar todas"
- Toggle de sonido 🔊
- Lista de 8 notificaciones con:
  * Fondo azul claro (no leídas)
  * Emoji según tipo
  * Título en negrita
  * Mensaje
  * Tiempo relativo ("Ahora mismo")
  * Botones: Check (marcar leída) y basura (descartar)

5. PRUEBA MARCAR COMO LEÍDA:
- Click en el check ✓ de cualquier notificación
- El badge debe cambiar: 8 → 7
- La notificación pierde el fondo azul claro

6. PRUEBA MARCAR TODAS:
- Click en el botón de check en el header
- El badge debe DESAPARECER
- Todas las notificaciones pierden fondo azul
- El filtro "No leídas" debe mostrar (0)

7. PRUEBA DESCARTAR:
- Click en icono de basura 🗑️ en cualquier notificación
- La notificación desaparece de la lista
- El contador total decrementa

8. PRUEBA NAVEGACIÓN:
- Click en cualquier notificación
- Debe navegar a la sección correspondiente:
  * new_appointment → /admin/appointments
  * new_client → /admin/clients
  * payment_received → /admin/clients
  * new_property → /admin/properties
  * new_inquiry → /admin/service-inquiries
*/

-- =====================================================
-- PASO 7: PRUEBA REALTIME (EJECUTAR MIENTRAS DASHBOARD ESTÁ ABIERTO)
-- =====================================================

/*
IMPORTANTE: El dashboard de admin debe estar ABIERTO en el navegador
Esta notificación debe aparecer INSTANTÁNEAMENTE sin recargar (F5)
*/

-- Reemplaza 'TU_USER_ID_AQUI' con tu ID real
SELECT create_admin_notification(
    'TU_USER_ID_AQUI'::UUID,
    'system_alert',
    '🔔 NOTIFICACIÓN EN TIEMPO REAL',
    '¡Esta notificación debería aparecer INSTANTÁNEAMENTE en tu dashboard sin necesidad de recargar la página! Si la ves aparecer automáticamente, ¡el sistema Realtime está funcionando perfectamente! 🎉',
    NULL, NULL, NULL, NULL, NULL,
    'urgent'
);

/*
✅ SI FUNCIONA REALTIME DEBERÍAS VER:
- La notificación aparece automáticamente en el modal
- El badge incrementa automáticamente
- Sonido se reproduce (si activaste el toggle)
- Notificación del navegador (si diste permisos)
- NO necesitas presionar F5

❌ SI NO FUNCIONA:
1. Abre Console del navegador (F12)
2. Busca errores en rojo
3. Ve a Supabase Dashboard → Database → Replication
4. Habilita la tabla "admin_notifications" para Realtime
5. Recarga el dashboard
*/

-- =====================================================
-- PASO 8: VERIFICAR DARK MODE
-- =====================================================

/*
EN EL NAVEGADOR:
1. Activa el Dark Mode (icono de luna/sol en sidebar)
2. Abre el NotificationCenter
3. Verifica que se vea bien en modo oscuro:
   - Fondo oscuro
   - Texto claro
   - Bordes visibles
   - Colores adaptados
*/

-- =====================================================
-- PASO 9: PROBAR FUNCIONES SQL DIRECTAMENTE
-- =====================================================

-- Marcar una notificación como leída
SELECT mark_admin_notification_as_read(
    (SELECT id FROM admin_notifications WHERE user_id = 'TU_USER_ID_AQUI'::UUID LIMIT 1)
);

-- Marcar todas como leídas
SELECT mark_all_admin_notifications_as_read('TU_USER_ID_AQUI'::UUID);

-- Descartar una notificación
SELECT dismiss_admin_notification(
    (SELECT id FROM admin_notifications WHERE user_id = 'TU_USER_ID_AQUI'::UUID LIMIT 1)
);

-- =====================================================
-- PASO 10: PRUEBA DE TRIGGERS AUTOMÁTICOS
-- =====================================================

-- TRIGGER 1: Crear una cita nueva (debe generar notificación)
/*
INSERT INTO appointments (
    client_id,
    property_id,
    advisor_id,
    appointment_date,
    status
) VALUES (
    (SELECT id FROM clients LIMIT 1),
    (SELECT id FROM properties LIMIT 1),
    'TU_USER_ID_AQUI'::UUID,
    NOW() + INTERVAL '1 day',
    'scheduled'
);

-- Verifica que se creó la notificación
SELECT * FROM admin_notifications 
WHERE type = 'new_appointment' 
ORDER BY created_at DESC LIMIT 1;
*/

-- TRIGGER 2: Marcar cita como cancelada (debe generar notificación)
/*
UPDATE appointments
SET status = 'cancelled'
WHERE id = (SELECT id FROM appointments WHERE status = 'scheduled' LIMIT 1);

-- Verifica que se creó la notificación
SELECT * FROM admin_notifications 
WHERE type = 'appointment_cancelled' 
ORDER BY created_at DESC LIMIT 1;
*/

-- =====================================================
-- PASO 11: VER RESUMEN FINAL
-- =====================================================

-- Ver distribución por tipo
SELECT 
    type,
    COUNT(*) as cantidad,
    ROUND(AVG(CASE WHEN is_read THEN 1 ELSE 0 END) * 100, 0) as porcentaje_leidas
FROM admin_notifications
WHERE user_id = 'TU_USER_ID_AQUI'::UUID
GROUP BY type
ORDER BY cantidad DESC;

-- Ver distribución por prioridad
SELECT 
    priority,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 0) as porcentaje
FROM admin_notifications
WHERE user_id = 'TU_USER_ID_AQUI'::UUID
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
        WHEN 'new_appointment' THEN '📅'
        WHEN 'appointment_cancelled' THEN '❌'
        WHEN 'new_client' THEN '👤'
        WHEN 'payment_received' THEN '💰'
        WHEN 'payment_overdue' THEN '⚠️'
        WHEN 'contract_expiring' THEN '📋'
        WHEN 'new_property' THEN '🏠'
        WHEN 'new_inquiry' THEN '💬'
        WHEN 'system_alert' THEN '🔔'
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
FROM admin_notifications
WHERE user_id = 'TU_USER_ID_AQUI'::UUID
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- PASO 12: PRUEBA DE NOTIFICACIÓN PARA TODOS LOS ADMINS
-- =====================================================

-- Crear una notificación para todos los administradores
SELECT create_notification_for_all_admins(
    'system_alert',
    '📢 Anuncio Importante',
    'El sistema estará en mantenimiento el próximo sábado de 9:00 AM a 12:00 PM',
    'high'
);

-- Verificar cuántos admins la recibieron
SELECT 
    COUNT(DISTINCT user_id) as admins_notificados,
    COUNT(*) as notificaciones_creadas
FROM admin_notifications
WHERE type = 'system_alert'
AND title = '📢 Anuncio Importante';

-- =====================================================
-- TROUBLESHOOTING
-- =====================================================

/*
SI NO VES EL BADGE EN EL NAVEGADOR:
------------------------------------
1. Verifica en SQL que las notificaciones existen:
   SELECT COUNT(*) FROM admin_notifications WHERE user_id = 'TU_USER_ID_AQUI'::UUID;

2. Abre Console del navegador (F12) y busca errores

3. Verifica que el user_id en el código coincide con el de la base de datos


SI EL MODAL NO SE ABRE:
-----------------------
1. Verifica errores en Console (F12)
2. Verifica que AdminNotificationCenter se importó correctamente
3. Recarga el navegador con Ctrl+Shift+R


SI REALTIME NO FUNCIONA:
------------------------
1. Ve a Supabase Dashboard
2. Database → Replication
3. Busca "admin_notifications"
4. Activa el toggle para habilitar Realtime
5. Recarga el dashboard


SI EL CONTADOR NO ACTUALIZA:
----------------------------
1. Verifica que las notificaciones tienen is_read = FALSE
2. Recarga el dashboard
3. Abre/cierra el modal para forzar actualización


SI LOS TRIGGERS NO FUNCIONAN:
-----------------------------
1. Verifica que los triggers existen:
   SELECT * FROM pg_trigger WHERE tgname LIKE '%notify%';

2. Verifica que las funciones existen:
   SELECT * FROM pg_proc WHERE proname LIKE '%notify%';

3. Re-ejecuta CREATE_ADMIN_NOTIFICATIONS_TABLE.sql
*/

-- =====================================================
-- CLEANUP (OPCIONAL)
-- =====================================================

/*
Si quieres limpiar todo y empezar de nuevo:

DELETE FROM admin_notifications 
WHERE user_id = 'TU_USER_ID_AQUI'::UUID;

Y vuelve a ejecutar desde el PASO 3
*/

-- =====================================================
-- LIMPIAR NOTIFICACIONES ANTIGUAS (>30 DÍAS)
-- =====================================================

-- Ejecutar esto periódicamente para mantener la base de datos limpia
SELECT cleanup_old_admin_notifications();

-- Ver cuántas fueron eliminadas
-- Retorna el número de notificaciones eliminadas
