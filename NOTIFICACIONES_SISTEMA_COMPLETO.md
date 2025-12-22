# 🔔 SISTEMA DE NOTIFICACIONES PUSH - Portal de Clientes

## 📋 Resumen Ejecutivo

Se ha implementado un **Sistema de Notificaciones en Tiempo Real** para el Portal de Clientes, que permite mantener a los propietarios informados sobre eventos importantes relacionados con sus contratos, pagos y documentos.

---

## ✅ COMPONENTES IMPLEMENTADOS

### 1. Base de Datos

**Archivo:** `CREATE_CLIENT_NOTIFICATIONS_TABLE.sql`

#### Tabla: `client_notifications`
- **Campos principales:**
  - `id` (UUID) - Identificador único
  - `client_id` (UUID) - Referencia al cliente
  - `type` - Tipo de notificación (7 tipos disponibles)
  - `title` - Título breve (max 200 caracteres)
  - `message` - Mensaje detallado
  - `priority` - Prioridad: low, normal, high, urgent
  - `is_read` - Estado de lectura
  - `is_dismissed` - Estado de descarte
  - `related_payment_id`, `related_contract_id`, `related_document_id` - Referencias opcionales
  - `created_at`, `read_at`, `dismissed_at` - Timestamps

#### Tipos de Notificaciones
1. **payment_due** ⏰ - Pago próximo a vencer
2. **payment_overdue** 🔴 - Pago vencido
3. **contract_expiring** 📋 - Contrato próximo a vencer
4. **new_document** 📄 - Nuevo documento disponible
5. **admin_message** 💬 - Mensaje del administrador
6. **payment_received** ✅ - Pago recibido confirmado
7. **maintenance_scheduled** 🔧 - Mantenimiento programado

#### Funciones SQL
- `create_client_notification()` - Crear notificación
- `mark_notification_as_read()` - Marcar como leída
- `mark_all_notifications_as_read()` - Marcar todas como leídas
- `dismiss_notification()` - Descartar notificación
- `cleanup_old_notifications()` - Limpiar notificaciones antiguas (30+ días)

#### Triggers Automáticos
- **trigger_notify_new_document** - Notifica cuando se sube un nuevo documento
- **trigger_notify_payment_received** - Notifica cuando se confirma un pago (status='completed')

#### Seguridad (RLS)
- ✅ Clientes solo ven sus propias notificaciones
- ✅ Clientes pueden actualizar estado (read/dismissed)
- ✅ Admins pueden gestionar todas las notificaciones

---

### 2. Lógica de Negocio

**Archivo:** `src/lib/client-portal/clientNotifications.ts`

#### Funciones Principales

**Consultas:**
- `getClientNotifications(clientId, onlyUnread?, limit?)` - Obtener notificaciones
- `getNotificationCounts(clientId)` - Contar notificaciones (total, unread, high_priority)

**Acciones:**
- `markNotificationAsRead(notificationId)` - Marcar como leída
- `markAllNotificationsAsRead(clientId)` - Marcar todas como leídas
- `dismissNotification(notificationId)` - Descartar notificación
- `createNotification(...)` - Crear notificación (solo admins)

**Tiempo Real:**
- `subscribeToNotifications(clientId, callback)` - Suscripción a Supabase Realtime
- Retorna función de desuscripción para cleanup

**Utilidades:**
- `getNotificationEmoji(type)` - Emoji según tipo
- `getNotificationColor(priority)` - Color de texto según prioridad
- `getNotificationBgColor(priority)` - Color de fondo según prioridad
- `getRelativeTime(dateString)` - Tiempo relativo ("hace 5 min", "ayer", etc.)
- `playNotificationSound()` - Reproducir sonido de notificación

#### TypeScript Interfaces
```typescript
export interface ClientNotification {
  id: string;
  client_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_payment_id?: string | null;
  related_contract_id?: string | null;
  related_document_id?: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  priority: NotificationPriority;
  created_at: string;
  read_at?: string | null;
  dismissed_at?: string | null;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  high_priority: number;
}
```

---

### 3. Componente UI

**Archivo:** `src/components/client-portal/NotificationCenter.tsx`

#### NotificationCenter (Componente Principal)

**Props:**
- `clientId: string` - ID del cliente
- `onClose?: () => void` - Callback para cerrar modal

**Características:**
- ✅ **Lista de notificaciones** con scroll infinito
- ✅ **Filtros:** Todas / No leídas
- ✅ **Contador de notificaciones:** Total, no leídas, prioritarias
- ✅ **Tiempo relativo:** "hace 5 min", "ayer", etc.
- ✅ **Colores según prioridad:** Gray (low), Blue (normal), Orange (high), Red (urgent)
- ✅ **Acciones individuales:**
  - Marcar como leída ✓
  - Descartar 🗑️
- ✅ **Acción masiva:** Marcar todas como leídas
- ✅ **Toggle de sonido:** Activar/desactivar audio
- ✅ **Suscripción en tiempo real:** Recibe notificaciones instantáneas
- ✅ **Browser notifications:** Solicita permisos y muestra notificaciones del navegador
- ✅ **Animaciones:** Framer Motion para entrada/salida
- ✅ **Dark mode:** Soporte completo
- ✅ **Estados vacíos:** Mensaje cuando no hay notificaciones
- ✅ **Responsive:** Adaptado para móviles

**Diseño:**
- Header con título y badge de contador
- Filtros de vista (Todas / No leídas)
- Lista scrolleable con máximo 600px de altura
- Footer con resumen (total + prioritarias)
- Cada notificación muestra:
  - Emoji/icono según tipo
  - Título en negrita (si no leída)
  - Mensaje truncado (2 líneas)
  - Tiempo relativo
  - Botones de acción

#### NotificationBadge (Componente Auxiliar)

**Props:**
- `clientId: string` - ID del cliente
- `onClick?: () => void` - Callback al hacer clic

**Características:**
- ✅ Badge circular con icono de campana
- ✅ Contador rojo con número de notificaciones sin leer
- ✅ Actualización automática cada 30 segundos
- ✅ Suscripción en tiempo real para actualizar contadores
- ✅ Indicador visual cuando hay notificaciones (campana verde)
- ✅ Animación del badge con scale

---

### 4. Integración en Layout

**Archivo modificado:** `src/components/client-portal/ClientLayout.tsx`

**Cambios realizados:**
1. **Import de componentes:**
   ```tsx
   import NotificationCenter, { NotificationBadge } from './NotificationCenter';
   ```

2. **Estado para modal:**
   ```tsx
   const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
   ```

3. **Badge en topbar:**
   ```tsx
   <NotificationBadge 
     clientId={session.client_id}
     onClick={() => setNotificationCenterOpen(!notificationCenterOpen)}
   />
   ```

4. **Modal flotante:**
   ```tsx
   <AnimatePresence>
     {notificationCenterOpen && (
       <>
         <motion.div /* overlay */ />
         <motion.div /* modal en top-right */ >
           <NotificationCenter 
             clientId={session.client_id}
             onClose={() => setNotificationCenterOpen(false)}
           />
         </motion.div>
       </>
     )}
   </AnimatePresence>
   ```

**Posición del modal:**
- Fijo en `top-20 right-4`
- Z-index: 50 (sobre todo)
- Animación: opacity + scale + y
- Overlay semi-transparente para cerrar al hacer clic fuera

---

### 5. Sistema Automático de Alertas

**Archivo:** `AUTOMATIC_NOTIFICATION_SYSTEM.sql`

#### Funciones Automáticas

**1. generate_payment_due_notifications()**
- ✅ Busca pagos pendientes que vencen en 0-7 días
- ✅ Prioridades:
  - **URGENTE** (vence hoy o mañana) - Icono 🔴
  - **ALTA** (vence en 2-3 días) - Icono ⏰
  - **NORMAL** (vence en 4-7 días) - Icono 📅
- ✅ Evita duplicados (no crea si ya existe notificación reciente de 2 días)
- ✅ Incluye: monto, propiedad, código, días restantes

**2. generate_payment_overdue_notifications()**
- ✅ Busca pagos vencidos (hasta 30 días de atraso)
- ✅ Prioridad: **URGENTE** siempre
- ✅ Icono: 🔴
- ✅ Mensaje: incluye días de atraso + advertencia de recargos
- ✅ Evita duplicados (2 días)

**3. generate_contract_expiring_notifications()**
- ✅ Busca contratos que vencen en 0-60 días
- ✅ Prioridades:
  - **ALTA** (vence en ≤30 días)
  - **NORMAL** (vence en >30 días)
- ✅ Icono: 📋
- ✅ Evita duplicados (7 días)
- ✅ Recomienda contactar asesor para renovación

**4. run_automatic_notifications()** (Función Maestra)
- ✅ Ejecuta las 3 funciones anteriores
- ✅ Retorna tabla con resumen:
  - Tarea ejecutada
  - Notificaciones creadas
  - Detalles
  - Timestamp de ejecución
- ✅ Logs detallados con RAISE NOTICE

#### Automatización

**Opción 1: pg_cron (Recomendado si está disponible)**
```sql
-- Habilitar extensión
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Ejecutar diariamente a las 8:00 AM
SELECT cron.schedule(
    'automatic-payment-notifications',
    '0 8 * * *',
    $$SELECT * FROM run_automatic_notifications()$$
);
```

**Opción 2: Supabase Edge Functions**
- Crear función en `supabase/functions/automatic-notifications/index.ts`
- Llamar a `supabase.rpc('run_automatic_notifications')`
- Programar con GitHub Actions o servicio externo (ej: cron-job.org)

**Opción 3: Ejecución Manual**
```sql
-- Ejecutar todas las alertas
SELECT * FROM run_automatic_notifications();

-- Ejecutar solo una tarea específica
SELECT * FROM generate_payment_due_notifications();
```

#### Monitoreo
```sql
-- Ver notificaciones creadas hoy
SELECT 
    cn.type,
    cn.priority,
    cn.created_at,
    c.full_name as client_name,
    cn.title
FROM client_notifications cn
JOIN clients c ON cn.client_id = c.id
WHERE cn.created_at > (NOW() - INTERVAL '24 hours')
ORDER BY cn.created_at DESC;
```

---

## 🚀 FLUJO DE USUARIO

### Escenario 1: Cliente recibe notificación de pago próximo

1. **Día -7:** Sistema genera notificación "📅 Recordatorio: Pago próximo en 7 días"
2. **Cliente ingresa al portal:** Ve badge rojo con "1" en icono de campana (topbar)
3. **Click en campana:** Se abre modal de NotificationCenter
4. **Ve notificación sin leer:** Fondo azul claro, título en negrita
5. **Click en "Marcar leída":** Notificación cambia a estado leído
6. **Día -1:** Nueva notificación "🔴 Pago Urgente: Vence MAÑANA" (prioridad urgente)
7. **Cliente recibe:** 
   - Notificación en tiempo real (sin recargar)
   - Sonido (si lo habilitó)
   - Browser notification (si dio permisos)
8. **Badge actualiza:** Ahora muestra "2" (o "1" si marcó la anterior)

### Escenario 2: Se sube un nuevo documento

1. **Admin sube documento** en sistema
2. **Trigger automático** crea notificación "📄 Nuevo Documento Disponible"
3. **Cliente conectado recibe instantáneamente:**
   - Supabase Realtime push
   - Sonido de notificación
   - Browser notification
   - Badge incrementa contador
4. **Cliente abre NotificationCenter:**
   - Ve nueva notificación al tope de la lista
   - Click en notificación para marcar leída
   - Puede navegar a sección Documentos

### Escenario 3: Gestión masiva de notificaciones

1. **Cliente tiene 15 notificaciones sin leer**
2. **Abre NotificationCenter:** Badge muestra "15"
3. **Filtra por "No leídas":** Ve solo las 15 sin leer
4. **Click "Marcar todas":** Las 15 se marcan como leídas
5. **Badge desaparece:** Contador vuelve a 0
6. **Cambia a "Todas":** Ve historial completo (leídas + no leídas)
7. **Descarta notificaciones antiguas:** Click en 🗑️ para ocultar

---

## 📊 CARACTERÍSTICAS TÉCNICAS

### Realtime con Supabase
- **Canal único por cliente:** `notifications:${clientId}`
- **Evento:** `postgres_changes` con `INSERT` en tabla `client_notifications`
- **Filter:** `client_id=eq.${clientId}`
- **Auto-reconexión:** Manejada por Supabase client
- **Cleanup:** Unsubscribe al desmontar componente

### Optimizaciones
- ✅ **Debounce de actualizaciones:** Actualiza counts cada 30 segundos
- ✅ **Lazy loading:** Solo carga 50 notificaciones por defecto
- ✅ **Índices de base de datos:** Queries optimizados con índices compuestos
- ✅ **RLS policies:** Seguridad a nivel de base de datos
- ✅ **Animaciones performantes:** Framer Motion con GPU acceleration
- ✅ **Evita duplicados:** Sistema inteligente que no crea notificaciones repetidas

### Browser Notifications
- **Solicitud de permisos:** Al montar componente por primera vez
- **Notificaciones nativas:** Muestra título + mensaje + icono
- **Funciona en background:** Incluso con pestaña inactiva
- **Requiere HTTPS:** No funciona en localhost (excepto http://localhost)

### Sonido de Notificaciones
- **Archivo:** `/notification.mp3` (debe existir en public/)
- **Volumen:** 50% por defecto
- **Opcional:** Usuario puede activar/desactivar con toggle
- **Graceful degradation:** Si el archivo no existe, falla silenciosamente

---

## 🎨 DISEÑO Y UX

### Colores por Prioridad

| Prioridad | Color Texto | Color Fondo |
|-----------|------------|-------------|
| low       | text-gray-500 | bg-gray-50 |
| normal    | text-blue-500 | bg-blue-50 |
| high      | text-orange-500 | bg-orange-50 |
| urgent    | text-red-500 | bg-red-50 |

### Emojis por Tipo

| Tipo | Emoji |
|------|-------|
| payment_due | ⏰ |
| payment_overdue | 🔴 |
| contract_expiring | 📋 |
| new_document | 📄 |
| admin_message | 💬 |
| payment_received | ✅ |
| maintenance_scheduled | 🔧 |

### Responsive
- **Desktop:** Modal 400px ancho, top-right corner
- **Mobile:** Modal full-width con max-width 95vw
- **Touch-friendly:** Botones grandes (min 44px)
- **Scroll:** Smooth scroll con momentum

### Dark Mode
- ✅ Todos los colores tienen versión dark
- ✅ Bordes adaptados: `border-gray-200 dark:border-gray-700`
- ✅ Fondos: `bg-white dark:bg-gray-900`
- ✅ Texto: `text-gray-900 dark:text-white`

---

## 📦 ARCHIVOS CREADOS/MODIFICADOS

### ✅ NUEVOS ARCHIVOS

1. **CREATE_CLIENT_NOTIFICATIONS_TABLE.sql** (467 líneas)
   - Tabla + índices + RLS + funciones + triggers
   
2. **src/lib/client-portal/clientNotifications.ts** (363 líneas)
   - Lógica de negocio + utilidades
   
3. **src/components/client-portal/NotificationCenter.tsx** (381 líneas)
   - NotificationCenter component
   - NotificationBadge component
   
4. **AUTOMATIC_NOTIFICATION_SYSTEM.sql** (542 líneas)
   - Funciones automáticas de alertas
   - Documentación de automatización
   
5. **NOTIFICACIONES_SISTEMA_COMPLETO.md** (este archivo)
   - Documentación completa del sistema

### ✅ ARCHIVOS MODIFICADOS

1. **src/components/client-portal/ClientLayout.tsx**
   - Agregado import de NotificationCenter
   - Agregado estado `notificationCenterOpen`
   - Reemplazado botón de notificaciones con `NotificationBadge`
   - Agregado modal de `NotificationCenter` con AnimatePresence

---

## 🧪 TESTING

### Pasos para Probar

#### 1. Ejecutar SQL en Supabase

```sql
-- 1. Crear tabla y funciones
-- Ejecutar: CREATE_CLIENT_NOTIFICATIONS_TABLE.sql

-- 2. Crear funciones automáticas
-- Ejecutar: AUTOMATIC_NOTIFICATION_SYSTEM.sql

-- 3. Crear notificaciones de prueba para cliente Carlos
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'payment_due',
    '⏰ Pago Próximo a Vencer',
    'Tu pago mensual de diciembre vence en 5 días.',
    NULL, NULL, NULL, 'high'
);

SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'new_document',
    '📄 Nuevo Documento Disponible',
    'Se ha subido el contrato actualizado.',
    NULL, NULL, NULL, 'normal'
);

-- 4. Verificar creación
SELECT * FROM client_notifications 
WHERE client_id = '11111111-1111-1111-1111-111111111111'::UUID
ORDER BY created_at DESC;
```

#### 2. Probar en Browser

1. **Login:** Ingresar con `carlos.propietario@test.com`
2. **Verificar badge:** Debe mostrar número de notificaciones sin leer
3. **Click en campana:** Abre NotificationCenter
4. **Verificar lista:** Ve las notificaciones creadas
5. **Marcar como leída:** Click en "Marcar leída"
6. **Verificar actualización:** Badge debe decrementar
7. **Probar filtros:** Cambiar entre "Todas" / "No leídas"
8. **Marcar todas:** Click en "Marcar todas"
9. **Descartar:** Click en 🗑️ para ocultar notificación
10. **Activar sonido:** Toggle el checkbox de sonido

#### 3. Probar Realtime

**En Supabase SQL Editor (mientras el portal está abierto):**
```sql
SELECT create_client_notification(
    '11111111-1111-1111-1111-111111111111'::UUID,
    'admin_message',
    '💬 Mensaje URGENTE',
    'Esta es una prueba de notificación en tiempo real',
    NULL, NULL, NULL, 'urgent'
);
```

**Resultado esperado:**
- ✅ Notificación aparece instantáneamente (sin recargar)
- ✅ Badge incrementa automáticamente
- ✅ Sonido se reproduce (si está activado)
- ✅ Browser notification se muestra (si hay permisos)

#### 4. Probar Sistema Automático

```sql
-- Ejecutar función maestra
SELECT * FROM run_automatic_notifications();

-- Ver resultado
SELECT 
    task,
    notifications_created,
    details,
    execution_time
FROM run_automatic_notifications();
```

---

## 🔧 CONFIGURACIÓN DE PRODUCCIÓN

### 1. Ejecutar Scripts SQL

```bash
# En Supabase Dashboard > SQL Editor

# 1. Crear tabla y funciones básicas
-- Pegar contenido de CREATE_CLIENT_NOTIFICATIONS_TABLE.sql
-- Click "Run"

# 2. Crear sistema automático
-- Pegar contenido de AUTOMATIC_NOTIFICATION_SYSTEM.sql
-- Click "Run"
```

### 2. Configurar pg_cron (Opcional)

```sql
-- Solo si Supabase plan soporta pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'daily-notifications',
    '0 8 * * *',  -- 8:00 AM todos los días
    $$SELECT * FROM run_automatic_notifications()$$
);
```

### 3. Agregar Archivo de Sonido

```bash
# En tu proyecto
# public/notification.mp3

# Puedes usar un sonido libre de derechos de:
# - https://freesound.org/
# - https://mixkit.co/free-sound-effects/notification/
```

### 4. Configurar Edge Function (Si no tienes pg_cron)

```bash
# Crear función
supabase functions new automatic-notifications

# Editar: supabase/functions/automatic-notifications/index.ts
# (Ver contenido en AUTOMATIC_NOTIFICATION_SYSTEM.sql)

# Deploy
supabase functions deploy automatic-notifications

# Programar con cron-job.org o GitHub Actions
```

### 5. Configurar Browser Notifications

**En producción (HTTPS):**
- Las notificaciones del navegador funcionarán automáticamente
- El usuario debe dar permisos la primera vez

**En desarrollo (localhost):**
- Funcionan en `http://localhost:5173` (puerto específico)
- NO funcionan en `http://192.168.x.x` (IP local)

---

## 📈 PRÓXIMAS MEJORAS (Opcional)

### Fase 2 (Futuro)
- [ ] **Configuración de notificaciones:** Permitir al usuario elegir qué notificaciones recibir
- [ ] **Notificaciones por email:** Enviar también por correo electrónico
- [ ] **Notificaciones push móviles:** Con PWA o app nativa
- [ ] **Historial completo:** Página dedicada con todas las notificaciones
- [ ] **Estadísticas:** Gráficas de notificaciones recibidas/leídas
- [ ] **Acciones directas:** Desde la notificación ir a pagar o ver documento
- [ ] **Notificaciones grupales:** Agrupar notificaciones similares
- [ ] **Snooze:** Posponer notificación para más tarde

---

## 🎯 IMPACTO ESPERADO

### Para Clientes
- ✅ **Mejor comunicación:** No se pierden eventos importantes
- ✅ **Proactividad:** Recordatorios antes de vencimientos
- ✅ **Tranquilidad:** Saben que serán notificados a tiempo
- ✅ **Centralización:** Todas las alertas en un solo lugar

### Para la Empresa
- ✅ **Reducir mora:** Alertas tempranas mejoran cobro
- ✅ **Menos llamadas:** Clientes informados = menos consultas
- ✅ **Mejor experiencia:** Clientes más satisfechos
- ✅ **Automatización:** Menos trabajo manual de seguimiento

### Métricas de Éxito (Medir después de 1 mes)
- Reducción de pagos vencidos
- Aumento de renovaciones de contratos a tiempo
- Disminución de consultas de soporte
- Aumento de engagement en portal

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [x] Crear tabla `client_notifications` en Supabase
- [x] Configurar RLS policies
- [x] Crear funciones SQL básicas
- [x] Crear triggers automáticos
- [x] Crear sistema de alertas automáticas
- [x] Implementar `clientNotifications.ts` con funciones de API
- [x] Crear componente `NotificationCenter`
- [x] Crear componente `NotificationBadge`
- [x] Integrar en `ClientLayout`
- [x] Configurar Supabase Realtime
- [x] Implementar browser notifications
- [x] Implementar sonido de notificación
- [x] Soporte para dark mode
- [x] Responsive design
- [x] Documentación completa

### Pendiente (Antes de Producción)
- [ ] Ejecutar SQL en Supabase de producción
- [ ] Agregar archivo `notification.mp3`
- [ ] Configurar automatización (pg_cron o Edge Function)
- [ ] Probar con usuario real
- [ ] Monitorear logs por 1 semana
- [ ] Ajustar tiempos de alerta si es necesario

---

## 📞 SOPORTE

Si encuentras problemas:

1. **Verificar RLS:** `SELECT * FROM client_notifications` (debe funcionar con sesión de cliente)
2. **Verificar Realtime:** En Supabase Dashboard > Database > Replication > habilitar tabla
3. **Verificar permisos browser:** Chrome DevTools > Application > Permissions
4. **Ver logs:** Chrome DevTools > Console (buscar errores de notificaciones)

---

**Fecha de implementación:** Diciembre 22, 2025  
**Tiempo estimado:** 5-6 horas  
**Estado:** ✅ COMPLETADO - LISTO PARA TESTING

---

¡El Sistema de Notificaciones está **100% implementado** y listo para mejorar la experiencia de tus clientes! 🎉
