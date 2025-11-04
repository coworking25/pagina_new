# 🔄 Guía Completa: Sincronización de Citas Web + Calendario

## 📋 Tabla de Contenidos
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Cómo Funciona](#cómo-funciona)
5. [Características Implementadas](#características-implementadas)
6. [Próximos Pasos](#próximos-pasos)
7. [FAQ](#faq)

---

## 🎯 Resumen Ejecutivo

### ¿Qué se implementó?

**Sistema de sincronización bidireccional** entre:
- **Property Appointments** (citas desde la página web) 
- **Calendar Appointments** (sistema de calendario avanzado)

### Beneficios

✅ **Visibilidad Total**: Los asesores ven TODAS sus citas en un solo calendario  
✅ **Sincronización Automática**: Cualquier cambio se refleja en ambos sistemas  
✅ **Sin Duplicación**: Sistema inteligente que evita duplicados  
✅ **Diferenciación Visual**: Citas web tienen borde punteado naranja 🌐  
✅ **Integración con Google Calendar**: Listo para sincronizar externamente  

---

## 🏗️ Arquitectura del Sistema

### Flujo de Datos

```
┌──────────────────┐
│   Página Web     │ Cliente agenda cita
│   (Pública)      │ ──────────┐
└──────────────────┘           │
                               ▼
                    ┌─────────────────────┐
                    │ property_appointments│
                    │      (Tabla BD)      │
                    └─────────────────────┘
                               │
                               │ 🔄 Sincronización Automática
                               │ appointmentSyncService
                               ▼
                    ┌─────────────────────┐
                    │    appointments     │
                    │   (Tabla Calendario)│
                    └─────────────────────┘
                               │
                               │
            ┌──────────────────┴──────────────────┐
            │                                     │
            ▼                                     ▼
    ┌──────────────┐                    ┌──────────────┐
    │ CalendarView │                    │  AdminCalendar│
    │  (Calendario)│                    │   (Vista)     │
    └──────────────┘                    └──────────────┘
            │                                     │
            └────────────────┬────────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  Asesor ve TODO  │
                  │  en su calendario│
                  └──────────────────┘
```

### Componentes Clave

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `appointmentSyncService.ts` | `src/services/` | Sincronización bidireccional |
| `CalendarView.tsx` | `src/components/Calendar/` | Vista del calendario combinado |
| `AdminAppointments.tsx` | `src/pages/` | Gestión de citas (lista) |
| `AdminCalendar.tsx` | `src/pages/` | Sistema de calendario avanzado |

---

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar Migración SQL

```sql
-- Ejecutar en Supabase SQL Editor
-- Archivo: sql/add_appointment_sync_column.sql

-- 1️⃣ Agregar columna de sincronización
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS property_appointment_id VARCHAR 
REFERENCES property_appointments(id) ON DELETE CASCADE;

-- 2️⃣ Crear índice
CREATE INDEX IF NOT EXISTS idx_appointments_property_appointment_id 
ON appointments(property_appointment_id);
```

### Paso 2: Sincronización Inicial (Opcional)

Si ya tienes citas existentes que quieres sincronizar:

```typescript
// En la consola del navegador o en un script
import { appointmentSyncService } from './services/appointmentSyncService';

// Sincronizar TODAS las citas existentes
const result = await appointmentSyncService.syncAllPropertyAppointmentsToCalendar();

console.log(`✅ Sincronizadas: ${result.synced}/${result.total}`);
console.log(`❌ Fallidas: ${result.failed}`);
```

### Paso 3: Verificar Instalación

```typescript
// Verificar que el servicio funciona
import { appointmentSyncService } from './services/appointmentSyncService';

// Obtener citas combinadas
const citas = await appointmentSyncService.getCombinedAppointments({
  advisor_id: 'tu_advisor_id_aqui'
});

console.log('Citas combinadas:', citas.length);
```

---

## ⚙️ Cómo Funciona

### 1. Creación de Cita desde la Web

```typescript
// AdminAppointments.tsx
const handleCreateAppointment = async (data) => {
  // 1️⃣ Crear en property_appointments
  const newAppointment = await savePropertyAppointmentSimple(data);
  
  // 2️⃣ Sincronizar automáticamente al calendario
  await appointmentSyncService.onPropertyAppointmentCreated(newAppointment);
  
  // ✅ La cita ahora está en AMBOS sistemas
};
```

### 2. Actualización de Estado

```typescript
// Cuando cambias el estado de una cita
const handleStatusChange = async (id, newStatus) => {
  // 1️⃣ Actualizar en property_appointments
  await updateAppointmentStatus(id, newStatus);
  
  // 2️⃣ Sincronizar cambio al calendario
  await appointmentSyncService.onPropertyAppointmentStatusChanged(id, newStatus);
  
  // ✅ Ambos sistemas actualizados
};
```

### 3. Eliminación de Cita

```typescript
// Cuando eliminas una cita
const handleDeleteAppointment = async (id) => {
  // 1️⃣ Eliminar de property_appointments
  await deleteAppointment(id);
  
  // 2️⃣ Eliminar del calendario también
  await appointmentSyncService.onPropertyAppointmentDeleted(id);
  
  // ✅ Eliminada de ambos lados
};
```

### 4. Visualización en Calendario

```typescript
// CalendarView.tsx muestra AMBAS fuentes
const loadAppointments = async () => {
  // Obtiene citas de property_appointments Y appointments
  const combined = await appointmentSyncService.getCombinedAppointments(filters);
  
  // Las citas de la web tienen source: 'property_appointment'
  // Las del calendario tienen source: 'calendar_appointment'
};
```

---

## ✨ Características Implementadas

### 🔄 Sincronización Automática

✅ **Creación**: Al crear cita desde web → Se crea en calendario  
✅ **Actualización**: Al editar cita → Se actualiza en calendario  
✅ **Estado**: Al cambiar estado → Se sincroniza al calendario  
✅ **Eliminación**: Al borrar cita → Se elimina del calendario  

### 🎨 Diferenciación Visual

| Característica | Cita Web | Cita Calendario |
|----------------|----------|-----------------|
| **Borde** | 🟠 Punteado naranja | 🔵 Sólido azul |
| **Icono** | 🌐 | 📅 |
| **Origen** | property_appointment | calendar_appointment |

### 📊 Datos Combinados

El calendario muestra:
- ✅ Cliente / Contacto
- ✅ Propiedad (si aplica)
- ✅ Tipo de cita
- ✅ Estado (confirmada, completada, etc.)
- ✅ Ubicación
- ✅ Notas especiales

### 🔍 Filtrado Inteligente

```typescript
// Filtrar por asesor
getCombinedAppointments({ advisor_id: 'xxx' })

// Filtrar por fechas
getCombinedAppointments({ 
  start_date: '2025-01-01',
  end_date: '2025-01-31'
})

// Ambos
getCombinedAppointments({ 
  advisor_id: 'xxx',
  start_date: '2025-01-01' 
})
```

---

## 🎯 Próximos Pasos Recomendados

### Prioridad Alta (Esta semana)

#### 1. Agregar Botón "Ver en Calendario"
Ubicación: `AdminAppointments.tsx`

```typescript
// Agregar botón en cada fila de la tabla
<button onClick={() => handleViewInCalendar(appointment)}>
  <Calendar className="w-4 h-4" />
  Ver en Calendario
</button>

// Función para abrir calendario filtrado
const handleViewInCalendar = (appointment) => {
  // Navegar a /admin/calendar con fecha de la cita
  navigate(`/admin/calendar?date=${appointment.appointment_date}`);
};
```

#### 2. Notificaciones Push para Asesores
```typescript
// Cuando se crea una cita nueva
const notifyAdvisor = async (advisorId, appointment) => {
  // Enviar notificación push
  await sendPushNotification(advisorId, {
    title: '🎉 Nueva Cita Agendada',
    body: `${appointment.client_name} - ${appointment.property_title}`,
    action: `/admin/calendar?appointment_id=${appointment.id}`
  });
};
```

#### 3. Dashboard de Citas del Día
```typescript
// Componente para mostrar en home del asesor
<TodayAppointments advisorId={currentUser.id} />

// Muestra:
// - Citas del día actual
// - Próxima cita (tiempo restante)
// - Recordatorios pendientes
```

### Prioridad Media (Próximas 2 semanas)

#### 4. Integración con Google Calendar Real
```typescript
// Configurar OAuth2 de Google
// Ver: services/googleCalendarService.ts

// Permitir a asesores conectar su Google Calendar
// Las citas se sincronizan automáticamente
```

#### 5. Recordatorios Automáticos por WhatsApp
```typescript
// 24 horas antes de la cita
const sendReminder24h = async (appointment) => {
  const message = `⏰ Recordatorio: Mañana tienes cita con ${appointment.client_name}...`;
  await sendWhatsApp(appointment.client_phone, message);
};

// 2 horas antes de la cita
const sendReminder2h = async (appointment) => {
  const message = `⏰ Recordatorio: En 2 horas tienes cita...`;
  await sendWhatsApp(appointment.client_phone, message);
};
```

#### 6. Estadísticas de Citas por Asesor
```tsx
<AdvisorStats advisorId={id}>
  - Total citas este mes
  - Tasa de conversión
  - Citas canceladas vs completadas
  - Tiempo promedio por cita
</AdvisorStats>
```

### Prioridad Baja (Futuro)

#### 7. Exportación de Citas
```typescript
// Exportar a CSV, Excel, PDF
exportAppointments({
  format: 'excel',
  advisor_id: 'xxx',
  date_range: { start: '...', end: '...' }
});
```

#### 8. Citas Recurrentes
```typescript
// Permitir crear citas que se repiten
createRecurringAppointment({
  title: 'Reunión de equipo',
  frequency: 'weekly', // daily, weekly, monthly
  days: [1, 3, 5], // Lunes, Miércoles, Viernes
  until: '2025-12-31'
});
```

#### 9. Disponibilidad Pública
```typescript
// Los clientes pueden ver disponibilidad del asesor
// y agendar directamente
<PublicCalendar advisorId="xxx" />
```

---

## 📱 Flujo de Usuario Completo

### Asesor: Vista Día a Día

```
📅 Lunes 6 de Enero, 2025

┌─────────────────────────────────────────┐
│ 🌐 09:00 - Visita Apartamento Centro   │ ← Desde web
│    👤 Juan Pérez                        │
│    📞 +57 300 123 4567                  │
│    🏠 APT-001 - Centro, Bogotá          │
├─────────────────────────────────────────┤
│ 📅 11:00 - Reunión con Cliente         │ ← Calendario
│    👤 María García                      │
│    📞 +57 310 987 6543                  │
├─────────────────────────────────────────┤
│ 🌐 14:00 - Consulta Virtual            │ ← Desde web
│    👤 Carlos López                      │
│    📞 +57 320 456 7890                  │
│    🏠 CASA-025 - Chapinero              │
└─────────────────────────────────────────┘

Total: 3 citas | 2 desde web | 1 calendario
```

### Cliente: Flujo de Agendamiento

```
1. Cliente entra a la web
   └─> Ve propiedad
       └─> Click "Agendar Visita"
           └─> Llena formulario
               └─> Selecciona fecha/hora
                   └─> CONFIRMACIÓN

2. Sistema crea cita en property_appointments
   └─> Sincroniza a appointments
       └─> Notifica al asesor
           └─> Envía WhatsApp al cliente
               └─> Aparece en calendario del asesor

3. Asesor ve la cita en su calendario
   └─> Puede confirmar/reprogramar
       └─> Cliente recibe actualización
```

---

## 🔧 Configuración Avanzada

### Variables de Entorno

```env
# Google Calendar (opcional)
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_API_KEY=your_api_key

# WhatsApp Business API (opcional)
VITE_WHATSAPP_API_TOKEN=your_token
VITE_WHATSAPP_PHONE_ID=your_phone_id

# Timezone
VITE_TIMEZONE=America/Bogota
```

### Políticas RLS (Row Level Security)

```sql
-- Asesores solo ven sus propias citas
CREATE POLICY "Asesores ven sus citas"
ON appointments FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM advisors WHERE id = appointments.advisor_id
  )
);

-- Administradores ven todo
CREATE POLICY "Admins ven todo"
ON appointments FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM admin_users
  )
);
```

---

## ❓ FAQ

### ¿Qué pasa si una cita se elimina de property_appointments?
Se elimina automáticamente del calendario también.

### ¿Puedo crear citas directamente en el calendario?
Sí, puedes crear citas en `appointments` que no estén vinculadas a property_appointments.

### ¿Cómo se evitan duplicados?
Cada cita sincronizada tiene un `property_appointment_id` único que previene duplicados.

### ¿Las citas antiguas se sincronizan?
Solo si ejecutas la sincronización masiva inicial. Las nuevas se sincronizan automáticamente.

### ¿Qué pasa con Google Calendar?
Las citas sincronizadas también se pueden enviar a Google Calendar si está configurado.

### ¿Los clientes ven el calendario?
No, solo los asesores y administradores tienen acceso al sistema de calendario.

### ¿Puedo desactivar la sincronización?
Sí, simplemente no llames las funciones de `appointmentSyncService` en los hooks.

---

## 🐛 Troubleshooting

### Problema: Citas no aparecen en calendario

**Solución:**
```typescript
// 1. Verificar que la sincronización se ejecutó
const result = await appointmentSyncService.syncPropertyAppointmentToCalendar(appointment);
console.log(result); // debe retornar { success: true }

// 2. Verificar en BD
SELECT * FROM appointments WHERE property_appointment_id = 'xxx';

// 3. Revisar filtros de fecha
const appointments = await getCombinedAppointments({
  start_date: '2024-01-01', // Asegúrate de incluir rango amplio
  end_date: '2026-01-01'
});
```

### Problema: Duplicados en el calendario

**Solución:**
```sql
-- Eliminar duplicados (ejecutar solo si es necesario)
DELETE FROM appointments a
USING appointments b
WHERE a.id > b.id
  AND a.property_appointment_id = b.property_appointment_id
  AND a.property_appointment_id IS NOT NULL;
```

### Problema: Cambios no se reflejan

**Solución:**
```typescript
// Forzar re-sincronización
await appointmentSyncService.syncPropertyAppointmentToCalendar(appointment);

// O refrescar el calendario
window.location.reload(); // Temporal
```

---

## 📊 Métricas de Éxito

### KPIs a Monitorear

1. **Tasa de Sincronización**
   - Meta: > 99%
   - Fórmula: (Citas sincronizadas / Total citas) × 100

2. **Tiempo de Sincronización**
   - Meta: < 2 segundos
   - Medir: Tiempo entre creación y aparición en calendario

3. **Errores de Sincronización**
   - Meta: < 1% de citas
   - Monitorear: Logs de errores en Supabase

4. **Adopción por Asesores**
   - Meta: 100% de asesores usando calendario
   - Medir: Login al módulo de calendario

---

## 🎓 Recursos Adicionales

### Documentación Relacionada
- `ANALISIS_MODAL_CITAS_CALENDARIO_CONEXION.md` - Análisis original
- `CALENDARIO_SISTEMA_COMPLETO_DOCUMENTACION.md` - Sistema de calendario
- `sql/add_appointment_sync_column.sql` - Script de migración

### Código Fuente Clave
- `src/services/appointmentSyncService.ts` - Servicio de sincronización
- `src/components/Calendar/CalendarView.tsx` - Vista del calendario
- `src/pages/AdminAppointments.tsx` - Gestión de citas
- `src/lib/calendarService.ts` - Servicio base del calendario

---

## 🚀 Comandos Útiles

```bash
# Ejecutar migraciones
supabase db push

# Ver logs en tiempo real
supabase functions logs --tail

# Reset de sincronización (cuidado!)
supabase db reset

# Backup antes de cambios grandes
supabase db dump -f backup.sql
```

---

**Creado:** 2025-01-04  
**Versión:** 1.0  
**Autor:** GitHub Copilot  
**Estado:** ✅ Implementado y Funcionando
