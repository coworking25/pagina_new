# ✅ INTEGRACIÓN COMPLETADA: Automatización + Emails

## 🎯 Resumen de la Integración

Se ha creado un sistema completo que conecta las **reglas de automatización** con el **sistema de emails**, permitiendo envío automático de correos basado en eventos y programación.

---

## 📋 PASOS PARA COMPLETAR LA INTEGRACIÓN

### **PASO 1: Desregistrar Service Worker** ✅ HECHO
El código del Service Worker ya fue corregido. Ahora debes:

1. Abre DevTools en el navegador (F12)
2. Ve a Application → Service Workers
3. Haz clic en "Unregister" en todos los service workers
4. O ejecuta en la consola del navegador:
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
  console.log('✅ Service Workers desregistrados');
  location.reload();
});
```

---

### **PASO 2: Actualizar Base de Datos**

#### 2.1 Agregar columnas de email a automation_logs

Ejecuta este SQL en **Supabase SQL Editor**:

```sql
-- Agregar columnas para rastrear emails
ALTER TABLE automation_logs
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT NULL;

ALTER TABLE automation_logs
ADD COLUMN IF NOT EXISTS email_id VARCHAR(100) DEFAULT NULL;

-- Comentarios
COMMENT ON COLUMN automation_logs.email_sent IS 'Indica si se envió email: true=enviado, false=no enviado, null=no procesado';
COMMENT ON COLUMN automation_logs.email_id IS 'ID del email en Resend (message ID)';

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_automation_logs_email_sent 
ON automation_logs(email_sent, executed_at DESC)
WHERE email_sent IS NULL OR email_sent = true;
```

#### 2.2 Habilitar emails en las reglas de automatización

Ejecuta este SQL en **Supabase SQL Editor**:

```sql
-- Habilitar emails en reglas importantes
UPDATE automation_rules
SET actions = jsonb_set(actions, '{send_email}', 'true'::jsonb)
WHERE name IN (
  'Recordatorio de Pago - 7 días antes',
  'Recordatorio de Pago - 3 días antes',
  'Alerta de Pago Vencido',
  'Recordatorio de Cita - 1 día antes',
  'Contrato próximo a vencer - 30 días',
  'Bienvenida a Nuevo Cliente'
);

-- Verificar
SELECT 
  name,
  rule_type,
  actions->>'send_email' as email_enabled,
  is_active
FROM automation_rules
WHERE actions->>'send_email' = 'true';
```

---

### **PASO 3: Probar la Integración**

#### Opción A: Crear una cita para probar email inmediato

1. Ve al sistema (http://localhost:5173/admin/citas)
2. Crea una nueva cita para mañana
3. El sistema automáticamente:
   - Ejecutará el trigger `trigger_appointment_created`
   - Creará alertas para admins
   - Procesará el envío de email al cliente (si tiene email configurado)

#### Opción B: Procesar cola de emails pendientes

Ejecuta este comando en la terminal:

```bash
npx tsx test-automation-email.ts
```

Este script:
- Revisará todos los logs de automatización de las últimas 24 horas
- Enviará emails para aquellos que tengan `send_email: true`
- Marcará los logs con `email_sent: true` y guardará el `email_id`

---

## 📁 Archivos Creados

### ✅ Código TypeScript
- **`src/lib/automation-email-integration.ts`** - Lógica de integración
  - `processAutomationRuleWithEmail()` - Procesa una regla y envía email
  - `processAutomationEmailQueue()` - Procesa cola de emails pendientes
  - Funciones específicas por tipo de email

### ✅ Scripts SQL
- **`ADD_EMAIL_COLUMNS_TO_AUTOMATION_LOGS.sql`** - Agrega columnas email_sent y email_id
- **`ENABLE_EMAILS_IN_RULES.sql`** - Habilita emails en 6 reglas principales

### ✅ Scripts de Prueba
- **`test-automation-email.ts`** - Prueba la integración completa

### ✅ Configuración
- **`public/sw.js`** - Service Worker corregido (no cachea en localhost)

---

## 🔄 Flujo de Funcionamiento

### Flujo Automático (Triggers)

```
1. EVENTO OCURRE (ej: nueva cita creada)
         ↓
2. TRIGGER SQL se dispara (trigger_appointment_created)
         ↓
3. Ejecuta execute_automation_rule()
         ↓
4. Crea alertas (client_alerts + admin_alerts)
         ↓
5. Registra en automation_logs
         ↓
6. Si send_email = true → Envía email
         ↓
7. Actualiza automation_logs (email_sent=true, email_id)
```

### Flujo Manual/Programado

```
1. CRON JOB o Manual: Ejecutar test-automation-email.ts
         ↓
2. Consulta automation_logs donde email_sent = NULL
         ↓
3. Para cada log:
   - Obtiene datos del cliente
   - Determina tipo de email
   - Envía email correspondiente
   - Actualiza log con resultado
         ↓
4. Delay de 600ms entre emails (rate limit)
```

---

## 🎨 Tipos de Emails Disponibles

### 1. **Payment Reminder** (Recordatorio de Pago)
- **Cuándo:** 7 o 3 días antes del vencimiento
- **Contenido:** Monto, fecha de vencimiento, días restantes
- **Diseño:** Gradient morado, botón de acción

### 2. **Payment Overdue** (Pago Vencido)
- **Cuándo:** Después de la fecha de vencimiento
- **Contenido:** Monto adeudado, días de retraso, consecuencias
- **Diseño:** Rojo de urgencia, advertencias

### 3. **Appointment Reminder** (Recordatorio de Cita)
- **Cuándo:** 1 día antes de la cita
- **Contenido:** Fecha, hora, ubicación, asesor
- **Diseño:** Verde, información clara

### 4. **Contract Expiring** (Contrato por Vencer)
- **Cuándo:** 30 días antes del fin del contrato
- **Contenido:** Propiedad, fecha de fin, contacto del asesor
- **Diseño:** Naranja, llamado a renovación

### 5. **Welcome Email** (Bienvenida)
- **Cuándo:** Nuevo cliente registrado
- **Contenido:** Bienvenida, características del sistema, soporte
- **Diseño:** Gradient morado, lista de características

---

## ⚙️ Configuración de Producción

### Variables de Entorno (.env)
```env
RESEND_API_KEY=re_KvxpCFQK_6mRmUU5AcgQ2UTcU4AYdAEB1
EMAIL_FROM=onboarding@resend.dev
EMAIL_FROM_NAME=Tu Coworking
SUPPORT_EMAIL=cooworking.digital2025@gmail.com
SUPPORT_PHONE=+57 3028240488
```

### ⚠️ Limitación Actual: Modo Testing
- Solo puedes enviar a: **cooworking.digital2025@gmail.com**
- Para enviar a cualquier cliente, necesitas verificar un dominio en Resend

### Verificar Dominio (Producción)
1. Ve a https://resend.com/domains
2. Agrega tu dominio (ej: `tucoworking.com`)
3. Configura registros DNS:
   - MX Record
   - TXT Record (SPF)
   - DKIM Records
4. Espera verificación (24-48 horas)
5. Cambia `EMAIL_FROM=notificaciones@tucoworking.com`

---

## 📊 Monitoreo y Logs

### Ver emails enviados en Base de Datos
```sql
-- Ver todos los emails enviados
SELECT 
  al.id,
  al.executed_at,
  al.email_sent,
  al.email_id,
  ar.name as rule_name,
  al.trigger_data->>'client_id' as client_id,
  al.execution_time_ms
FROM automation_logs al
JOIN automation_rules ar ON al.rule_id = ar.id
WHERE al.email_sent = true
ORDER BY al.executed_at DESC
LIMIT 20;
```

### Dashboard de Resend
- URL: https://resend.com/emails
- Ver todos los emails enviados
- Estadísticas de entrega
- Logs de errores
- Rate limits

---

## 🚀 Próximos Pasos Recomendados

1. **✅ Probar integración completa**
   - Ejecutar SQLs de actualización
   - Crear cita de prueba
   - Verificar email recibido

2. **Panel Admin para Automatización** (45 min)
   - Página: `/admin/automatizacion`
   - Ver reglas activas/inactivas
   - Toggle on/off para cada regla
   - Ver logs de ejecución
   - Ver emails enviados

3. **Configurar Cron Job Diario** (10 min)
   - Ejecutar `test-automation-email.ts` a las 8:00 AM
   - Opciones:
     - GitHub Actions (gratis)
     - Vercel Cron Jobs
     - Supabase pg_cron
     - cron-job.org

4. **Verificar Dominio Propio** (cuando disponible)
   - Permite enviar a cualquier cliente
   - Mejor deliverability
   - Marca profesional

5. **Continuar con Mejora #5 o #8**
   - #5: Dashboard con Widgets (visual)
   - #8: Temas y Modo Oscuro (rápido)

---

## 🎯 Estado Actual del Proyecto

### Mejoras Completadas (4.5/10 = 45%)
- ✅ #1: Sistema de Alertas para Clientes
- ✅ #2: Sistema de Alertas para Administradores
- ✅ #3: Notificaciones Push Frontend
- ✅ #6: Sistema de Automatización de Tareas (85% - falta UI)
- ✅ #4: Notificaciones por Email (90% - falta prueba en prod)

### Próximas Mejoras
- ⏳ #5: Dashboard con Widgets
- ⏳ #7: PWA/Modo Offline
- ⏳ #8: Temas y Modo Oscuro
- ⏳ #9: Analytics Avanzado
- ⏳ #10: Permisos Granulares

---

## ✅ Checklist de Integración

- [ ] Desregistrar Service Worker en navegador
- [ ] Ejecutar SQL: ADD_EMAIL_COLUMNS_TO_AUTOMATION_LOGS.sql
- [ ] Ejecutar SQL: ENABLE_EMAILS_IN_RULES.sql
- [ ] Verificar columnas creadas
- [ ] Crear cita de prueba o ejecutar test-automation-email.ts
- [ ] Verificar email recibido en cooworking.digital2025@gmail.com
- [ ] Revisar Dashboard de Resend
- [ ] Confirmar logs actualizados con email_sent=true

---

## 🆘 Troubleshooting

### Error: "You can only send testing emails to your own email"
- **Solución:** Enviar solo a `cooworking.digital2025@gmail.com` o verificar dominio

### Error: "Rate limit exceeded"
- **Solución:** El script ya tiene delays de 600ms, Resend permite 2 req/s

### Error: "Client not found"
- **Solución:** Asegúrate de que el cliente tiene email configurado en la tabla `clients`

### Emails no se envían
- **Solución:** Verifica que `actions.send_email = true` en las reglas
- **Solución:** Revisa que RESEND_API_KEY esté configurada correctamente

---

**💡 Sistema listo para pruebas. Sigue los pasos del checklist para completar la integración.**
