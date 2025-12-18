# 🔔 SISTEMA DE ALERTAS AUTOMÁTICAS DE PAGOS

## 📋 Descripción General

Sistema completo de alertas automáticas que envía notificaciones por **Email** y **WhatsApp** sobre pagos programados, integrándose directamente con `payment_schedules`.

## ✨ Características

### 1. Alertas Automáticas
- ✅ **Recordatorios antes del vencimiento**: 14, 7, 5, 3, 1 días antes (configurable)
- ✅ **Alerta día del vencimiento**: "Tu pago vence HOY"
- ✅ **Alertas de vencidos**: 1, 3, 7, 15 días después del vencimiento
- ✅ **Confirmación de pago recibido**: Al registrar un pago
- ✅ **Pago parcial recibido**: Al registrar abono parcial

### 2. Canales de Comunicación
- 📧 **Email**: Plantillas HTML con formato profesional
- 📱 **WhatsApp**: Mensajes con formato Markdown
- 📲 **SMS**: Preparado para integración futura

### 3. Configuración por Cliente
- Habilitar/deshabilitar cada canal
- Seleccionar días de recordatorio
- Frecuencia de alertas de vencidos
- Horario preferido de envío
- Zona horaria

### 4. Información en las Alertas
- Nombre del cliente
- Concepto del pago
- Monto total y saldo pendiente
- Fecha de vencimiento
- Días hasta el vencimiento / días vencido
- Monto ya pagado (si es parcial)

## 🗄️ Estructura de Base de Datos

### Tablas Creadas

#### 1. `payment_alert_settings`
Configuración de alertas por cliente.

```sql
- client_id: UUID (FK a clients)
- email_enabled: BOOLEAN
- whatsapp_enabled: BOOLEAN
- sms_enabled: BOOLEAN
- days_before_due: INTEGER[] (ej: [7,3,1])
- send_on_due_date: BOOLEAN
- send_overdue_alerts: BOOLEAN
- overdue_alert_frequency: INTEGER (cada X días)
- preferred_time: TIME
- timezone: TEXT
- email, whatsapp_number, sms_number: TEXT
- is_active: BOOLEAN
```

**Trigger**: Se crea configuración automática al crear un cliente nuevo.

#### 2. `payment_alerts_sent`
Historial completo de todas las alertas enviadas.

```sql
- payment_schedule_id: UUID (FK a payment_schedules)
- client_id: UUID (FK a clients)
- alert_type: TEXT (reminder_7_days, due_today, overdue_3_days, etc)
- channel: TEXT (email, whatsapp, sms)
- status: TEXT (pending, sent, failed, delivered, read)
- subject, message: TEXT
- payment_amount, paid_amount, remaining_amount: DECIMAL
- due_date: DATE
- days_overdue: INTEGER
- sent_at, delivered_at, read_at: TIMESTAMPTZ
- failed_reason: TEXT
- retry_count: INTEGER
- provider_message_id: TEXT
- provider_response: JSONB
```

#### 3. `payment_alert_templates`
Plantillas de mensajes reutilizables.

```sql
- name: TEXT UNIQUE
- alert_type: TEXT
- channel: TEXT
- subject_template: TEXT (solo para email)
- message_template: TEXT
- is_active: BOOLEAN
```

**Variables disponibles en plantillas:**
- `{client_name}`: Nombre completo del cliente
- `{payment_concept}`: Concepto del pago
- `{amount}`: Monto total
- `{due_date}`: Fecha de vencimiento
- `{days_until_due}`: Días restantes
- `{days_overdue}`: Días de atraso
- `{paid_amount}`: Monto ya pagado
- `{remaining_amount}`: Saldo pendiente

### Plantillas Incluidas

#### Email:
1. `email_reminder_7_days`: Recordatorio 7 días antes
2. `email_due_today`: Vence hoy
3. `email_overdue`: Pago vencido
4. `email_payment_received`: Confirmación de pago

#### WhatsApp:
1. `whatsapp_reminder_3_days`: Recordatorio 3 días antes
2. `whatsapp_due_today`: Vence hoy
3. `whatsapp_overdue`: Pago vencido
4. `whatsapp_payment_received`: Confirmación de pago

## 📁 Archivos Creados

### 1. Base de Datos
```
sql/CREATE_PAYMENT_ALERTS_SYSTEM.sql (450 líneas)
```
- Creación de 3 tablas
- 8 índices para optimización
- 2 triggers automáticos
- 8 plantillas por defecto
- Políticas RLS

### 2. API Layer
```
src/lib/paymentAlertsApi.ts (650 líneas)
```

**Funciones principales:**
- `getClientAlertSettings()`: Obtener configuración
- `updateClientAlertSettings()`: Actualizar configuración
- `getPaymentsNeedingAlerts()`: Detectar pagos que necesitan alerta
- `processPaymentAlerts()`: Procesar y enviar alertas
- `sendEmailAlert()`: Enviar por email
- `sendWhatsAppAlert()`: Enviar por WhatsApp
- `getClientAlertHistory()`: Ver historial
- `getAlertsStatistics()`: Estadísticas
- `markAlertDelivered()`: Marcar como entregado
- `markAlertFailed()`: Marcar como fallido

### 3. Worker Automático
```
src/workers/paymentAlertsWorker.ts (50 líneas)
```
- Ejecutable como cron job
- Puede correr en servidor o serverless
- Registro completo de logs

### 4. Componente UI
```
src/components/client-details/PaymentAlertSettings.tsx (500 líneas)
```
- Panel de configuración visual
- Toggle para email/WhatsApp/SMS
- Selector de días de recordatorio
- Configuración de frecuencia de vencidos
- Horario y zona horaria
- Historial de últimas 10 alertas

## 🔄 Flujo de Funcionamiento

### 1. Detección Automática
```typescript
Worker ejecuta cada hora → processPaymentAlerts()
  ↓
Busca payment_schedules con status 'pending' o 'partial'
  ↓
Para cada pago:
  - Obtiene configuración del cliente
  - Calcula días hasta/desde vencimiento
  - Determina tipo de alerta necesaria
  - Verifica si ya se envió
  - Agrega a cola de envío
```

### 2. Generación de Mensaje
```typescript
Para cada alerta:
  ↓
Obtiene plantilla según tipo y canal
  ↓
Reemplaza variables con datos reales
  ↓
Genera mensaje personalizado
```

### 3. Envío
```typescript
Si email_enabled:
  → sendEmailAlert()
  → Integrar con Resend/SendGrid/AWS SES
  → Registrar en payment_alerts_sent

Si whatsapp_enabled:
  → sendWhatsAppAlert()
  → Integrar con Twilio/Meta/WhatsApp Business API
  → Registrar en payment_alerts_sent
```

### 4. Tracking
```typescript
Webhook del proveedor:
  ↓
markAlertDelivered() o markAlertFailed()
  ↓
Actualizar status en payment_alerts_sent
  ↓
Estadísticas en tiempo real
```

## 🚀 Instalación

### Paso 1: Ejecutar SQL
```bash
# Instalar tablas y plantillas
psql < sql/CREATE_PAYMENT_ALERTS_SYSTEM.sql
```

### Paso 2: Configurar Cron Job

#### Opción A: Vercel Cron (Recomendado)
```typescript
// vercel.json
{
  "crons": [{
    "path": "/api/cron/payment-alerts",
    "schedule": "0 9-18 * * *" // Cada hora de 9am a 6pm
  }]
}

// pages/api/cron/payment-alerts.ts
import { runPaymentAlertsWorker } from '../../../src/workers/paymentAlertsWorker';

export default async function handler(req, res) {
  const result = await runPaymentAlertsWorker();
  res.json(result);
}
```

#### Opción B: Node.js Cron
```typescript
import cron from 'node-cron';
import { runPaymentAlertsWorker } from './src/workers/paymentAlertsWorker';

// Ejecutar cada hora
cron.schedule('0 * * * *', () => {
  runPaymentAlertsWorker();
});
```

#### Opción C: Linux Crontab
```bash
# Ejecutar cada hora
0 * * * * cd /path/to/project && node dist/workers/paymentAlertsWorker.js
```

### Paso 3: Configurar Proveedores

#### Email con Resend
```typescript
// En sendEmailAlert()
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: 'pagos@tudominio.com',
  to: alert.client.email,
  subject: subject,
  html: message
});
```

#### WhatsApp con Twilio
```typescript
// En sendWhatsAppAlert()
import twilio from 'twilio';
const client = twilio(accountSid, authToken);

await client.messages.create({
  body: message,
  from: 'whatsapp:+14155238886',
  to: `whatsapp:${alert.client.phone}`
});
```

### Paso 4: Agregar a ClientDetailsEnhanced
```typescript
import PaymentAlertSettings from './PaymentAlertSettings';

// En las tabs:
{
  id: 'alerts',
  name: 'Alertas',
  icon: Bell,
  component: (
    <PaymentAlertSettings 
      clientId={client.id}
      clientName={client.full_name}
    />
  )
}
```

## 📊 Ejemplos de Uso

### Crear Configuración Manual
```typescript
const settings = {
  client_id: 'uuid-del-cliente',
  email_enabled: true,
  whatsapp_enabled: true,
  days_before_due: [7, 3, 1],
  send_on_due_date: true,
  send_overdue_alerts: true,
  overdue_alert_frequency: 3,
  preferred_time: '09:00:00',
  email: 'cliente@email.com',
  whatsapp_number: '+573001234567'
};

await updateClientAlertSettings(clientId, settings);
```

### Ejecutar Worker Manualmente
```typescript
import { runPaymentAlertsWorker } from './src/workers/paymentAlertsWorker';

const result = await runPaymentAlertsWorker();
console.log(result);
// {
//   success: true,
//   total: 15,
//   sent: 14,
//   failed: 1,
//   timestamp: '2025-12-18T...'
// }
```

### Ver Estadísticas
```typescript
const stats = await getAlertsStatistics(clientId);
console.log(stats);
// {
//   total: 45,
//   by_type: {
//     reminder_3_days: 15,
//     due_today: 10,
//     overdue_3_days: 8,
//     payment_received: 12
//   },
//   by_channel: {
//     email: 23,
//     whatsapp: 22
//   },
//   by_status: {
//     sent: 42,
//     failed: 3
//   }
// }
```

## 🔐 Seguridad

- ✅ RLS habilitado en todas las tablas
- ✅ Service role tiene acceso completo
- ✅ Authenticated users pueden ver (configurar según necesidad)
- ✅ Validación de datos antes de enviar
- ✅ Rate limiting recomendado
- ✅ Logs completos de todos los envíos

## 🎯 Casos de Uso

### Caso 1: Recordatorio 3 Días Antes
```
Cliente: Juan Pérez
Pago: Renta Enero 2026 - $8,500,000
Vence: 05 Enero 2026
Hoy: 02 Enero 2026

Email enviado:
"Hola Juan Pérez,
Te recordamos que tienes un pago próximo en 3 días:
📅 Concepto: Renta Enero 2026
💰 Monto: $8,500,000
📆 Fecha de vencimiento: 5 de enero de 2026
⏰ Días restantes: 3"

WhatsApp enviado:
"🔔 *Recordatorio de Pago*
Hola Juan Pérez,
Tienes un pago próximo en *3 días*:
📅 *Renta Enero 2026*
💰 Monto: *$8,500,000*
📆 Vence: *5 de enero de 2026*"
```

### Caso 2: Pago Vencido 3 Días
```
Cliente: María López
Pago: Mantenimiento - $500,000
Venció: 15 Diciembre 2025
Hoy: 18 Diciembre 2025
Pagado: $0
Saldo: $500,000

Email/WhatsApp:
"🚨 URGENTE: Pago vencido hace 3 días
Hola María López,
Tu pago está VENCIDO:
📅 Concepto: Mantenimiento
💰 Monto original: $500,000
💵 Pagado: $0
⚠️ Saldo pendiente: $500,000
📆 Venció el: 15 de diciembre de 2025
⏰ Días vencidos: 3

Por favor, regulariza tu pago urgentemente."
```

### Caso 3: Pago Parcial Recibido
```
Cliente: Carlos Gómez
Pago: Renta - $8,500,000
Pagado: $4,000,000
Saldo: $4,500,000

Email/WhatsApp:
"✅ Pago Parcial Recibido
Hola Carlos Gómez,
Hemos recibido tu pago parcial:
📅 Concepto: Renta
💰 Monto recibido: $4,000,000
⚠️ Saldo pendiente: $4,500,000
📆 Fecha de pago: 18 de diciembre de 2025

Gracias por tu abono. Recuerda completar el pago restante."
```

## 🔧 Mantenimiento

### Limpiar Alertas Antiguas (>90 días)
```sql
DELETE FROM payment_alerts_sent 
WHERE created_at < NOW() - INTERVAL '90 days'
AND status IN ('sent', 'delivered');
```

### Reintentar Alertas Fallidas
```typescript
const { data: failed } = await supabase
  .from('payment_alerts_sent')
  .select('*')
  .eq('status', 'failed')
  .lt('retry_count', 3);

// Reintentar envío...
```

## 📈 Métricas

### KPIs a Monitorear
- Tasa de entrega (sent/total)
- Tasa de fallas (failed/total)
- Tiempo promedio de entrega
- Alertas por tipo
- Alertas por cliente
- Pagos a tiempo después de alerta

## 🎉 Beneficios

1. **Automatización Completa**: Sin intervención manual
2. **Multicanal**: Email + WhatsApp + SMS (futuro)
3. **Personalizable**: Cada cliente configura sus preferencias
4. **Trazabilidad**: Historial completo de todas las alertas
5. **Escalable**: Maneja miles de pagos simultáneos
6. **Profesional**: Mensajes formateados y claros
7. **Reducción de morosidad**: Recordatorios oportunos
8. **Mejor comunicación**: Clientes informados en tiempo real

## 🚧 Próximos Pasos

1. ✅ **Integrar proveedores reales**:
   - Resend para emails
   - Twilio para WhatsApp
   
2. ✅ **Webhooks de proveedores**:
   - Capturar eventos de entrega
   - Actualizar status automáticamente
   
3. ✅ **Dashboard de alertas**:
   - Estadísticas visuales
   - Gráficas de envío
   - Monitor en tiempo real
   
4. ✅ **Plantillas personalizadas**:
   - Editor visual de plantillas
   - Variables adicionales
   - Previsualización

5. ✅ **Inteligencia**:
   - Mejor horario de envío por cliente
   - Frecuencia óptima
   - Predicción de morosidad

---

**Estado**: ✅ Sistema completo implementado y listo para integración con proveedores
**Versión**: 1.0.0
**Fecha**: Diciembre 2025
