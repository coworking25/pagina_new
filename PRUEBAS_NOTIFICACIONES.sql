-- =====================================================
-- PRUEBAS DEL SISTEMA DE NOTIFICACIONES
-- Para el cliente Carlos (Portal de Clientes)
-- =====================================================

-- =====================================================
-- PASO 1: Crear notificaciones de prueba
-- =====================================================

-- Notificación 1: Pago próximo a vencer (ALTA PRIORIDAD)
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

-- Notificación 2: Nuevo documento disponible (NORMAL)
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

-- Notificación 3: Mensaje del administrador (NORMAL)
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

-- Notificación 4: Pago recibido confirmado (NORMAL)
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

-- Notificación 5: Contrato próximo a vencer (ALTA PRIORIDAD)
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

-- Notificación 6: Mantenimiento programado (BAJA PRIORIDAD)
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

-- Notificación 7: Pago URGENTE (URGENTE)
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

-- =====================================================
-- PASO 2: Verificar notificaciones creadas
-- =====================================================

SELECT 
    id,
    type,
    title,
    message,
    priority,
    is_read,
    created_at
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
ORDER BY created_at DESC;

-- =====================================================
-- PASO 3: Verificar contadores
-- =====================================================

SELECT 
    COUNT(*) as total_notificaciones,
    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as no_leidas,
    SUM(CASE WHEN priority IN ('high', 'urgent') THEN 1 ELSE 0 END) as prioritarias
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
AND is_dismissed = FALSE;

-- =====================================================
-- PASO 4: Marcar una notificación como leída (Prueba)
-- =====================================================

-- Obtener el ID de la primera notificación
DO $$
DECLARE
    v_notification_id UUID;
BEGIN
    SELECT id INTO v_notification_id
    FROM client_notifications
    WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
    AND is_read = FALSE
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF v_notification_id IS NOT NULL THEN
        PERFORM mark_notification_as_read(v_notification_id);
        RAISE NOTICE 'Notificación % marcada como leída', v_notification_id;
    END IF;
END $$;

-- =====================================================
-- PASO 5: Probar notificación en tiempo real
-- (Ejecutar esto MIENTRAS el portal está abierto)
-- =====================================================

-- Esta notificación debería aparecer instantáneamente en el portal
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'admin_message',
    '🔔 NOTIFICACIÓN EN TIEMPO REAL',
    '¡Hola! Esta notificación debería aparecer instantáneamente en tu portal sin necesidad de recargar la página. Si la ves, ¡el sistema Realtime está funcionando correctamente!',
    NULL,
    NULL,
    NULL,
    'urgent'
);

-- =====================================================
-- PASO 6: Limpiar notificaciones de prueba (Opcional)
-- =====================================================

-- DESCOMENTAR SOLO SI QUIERES BORRAR TODAS LAS NOTIFICACIONES DE PRUEBA
/*
DELETE FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID;

RAISE NOTICE 'Notificaciones de prueba eliminadas';
*/

-- =====================================================
-- PASO 7: Probar sistema automático de alertas
-- =====================================================

-- Ejecutar función maestra para generar alertas automáticas
SELECT * FROM run_automatic_notifications();

-- Ver resultado detallado
SELECT 
    task,
    notifications_created,
    details,
    execution_time
FROM run_automatic_notifications();

-- =====================================================
-- VALIDACIONES FINALES
-- =====================================================

-- 1. Verificar que las notificaciones tienen el formato correcto
SELECT 
    type,
    COUNT(*) as cantidad,
    AVG(CASE WHEN is_read THEN 1 ELSE 0 END) * 100 as porcentaje_leidas
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
GROUP BY type;

-- 2. Verificar distribución por prioridad
SELECT 
    priority,
    COUNT(*) as cantidad
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

-- 3. Ver últimas 10 notificaciones con formato legible
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
    TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as fecha
FROM client_notifications
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- INSTRUCCIONES DE PRUEBA EN EL PORTAL
-- =====================================================

/*
PASOS PARA PROBAR EN EL NAVEGADOR:
===================================

1. EJECUTAR SQL:
   - Ejecuta las notificaciones de prueba (Paso 1)
   - Verifica que se crearon correctamente (Paso 2)

2. ABRIR PORTAL:
   - Ve a http://localhost:5173/login
   - Login: carlos.propietario@test.com / Carlos123!

3. VERIFICAR BADGE:
   - Debe aparecer un número rojo en el icono de campana (topbar)
   - El número debe ser 7 o más (según las notificaciones creadas)

4. ABRIR NOTIFICATION CENTER:
   - Click en el icono de campana
   - Se abre el modal de notificaciones
   - Verifica que aparecen las 7 notificaciones

5. PROBAR FILTROS:
   - Click en "No leídas" → debe mostrar todas (ninguna leída aún)
   - Click en "Todas" → debe mostrar todas también

6. MARCAR COMO LEÍDA:
   - Click en "Marcar leída" en una notificación
   - El badge debe decrementar (ej: 7 → 6)
   - La notificación cambia de fondo (ya no tiene fondo azul)

7. MARCAR TODAS COMO LEÍDAS:
   - Click en "Marcar todas"
   - El badge debe desaparecer (0 sin leer)
   - Todas las notificaciones ya no tienen fondo azul

8. PROBAR DESCARTE:
   - Click en icono de basura 🗑️
   - La notificación desaparece de la lista
   - El contador "total" decrementa

9. PROBAR REALTIME:
   - MIENTRAS el portal está abierto, ejecuta el SQL del Paso 5
   - La notificación "EN TIEMPO REAL" debe aparecer instantáneamente
   - Sin recargar la página
   - Debe escucharse un sonido (si activaste el toggle)

10. ACTIVAR SONIDO:
    - Marca el checkbox "🔊 Activar sonido"
    - Ejecuta otra notificación en tiempo real
    - Debe reproducirse un sonido de notificación

11. VERIFICAR DARK MODE:
    - Activa el dark mode en el portal
    - Las notificaciones deben verse bien en modo oscuro
    - Colores adaptados, legibles

12. VERIFICAR RESPONSIVE:
    - Abre DevTools (F12)
    - Cambia a vista móvil (375px)
    - El modal debe adaptarse al ancho de la pantalla
    - Scroll debe funcionar correctamente

RESULTADOS ESPERADOS:
======================
✅ Badge muestra contador correcto
✅ Notificaciones se cargan y muestran
✅ Filtros funcionan (Todas / No leídas)
✅ Marcar como leída funciona y actualiza badge
✅ Marcar todas funciona
✅ Descartar funciona
✅ Notificaciones en tiempo real aparecen instantáneamente
✅ Sonido se reproduce (si está activado)
✅ Dark mode se ve bien
✅ Responsive funciona en móvil

SI ALGO FALLA:
==============
1. Abre Console (F12) y busca errores
2. Verifica que la tabla existe: SELECT * FROM client_notifications;
3. Verifica RLS: Debe permitir SELECT para el cliente
4. Verifica Realtime: En Supabase Dashboard > Database > Replication
5. Verifica que las funciones SQL existen: \df create_client_notification
*/
