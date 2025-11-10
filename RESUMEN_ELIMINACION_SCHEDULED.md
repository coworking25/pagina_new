# 🔥 RESUMEN: Eliminación de 'scheduled' y uso de 'pending'

## Problema
La base de datos tenía un CHECK constraint que solo aceptaba:
- `'pending'`, `'confirmed'`, `'completed'`, `'cancelled'`, `'no_show'`, `'rescheduled'`

Pero el código TypeScript estaba usando `'scheduled'` en varios lugares, causando errores 400/406.

## ✅ Archivos Modificados

### 1. **SQL - Base de Datos**
- `sql/FIX_STATUS_CONSTRAINT_AND_DEFAULT.sql`
  - Eliminó constraint viejo
  - Actualizó todas las citas de 'scheduled' → 'pending'
  - Creó nuevo constraint con valores correctos
  - Cambió default de 'scheduled' → 'pending'

### 2. **TypeScript - Código Frontend**

#### `src/lib/calendarService.ts`
- **Línea 17**: Tipo `status` actualizado
  ```typescript
  // ANTES: status: 'scheduled' | 'confirmed' | ...
  // AHORA: status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled'
  ```
- **Línea 241**: Valor default al crear cita
  ```typescript
  // ANTES: status: 'scheduled'
  // AHORA: status: 'pending'
  ```

#### `src/services/appointmentSyncService.ts`
- **Líneas 132-141**: Mapeo de estados
  ```typescript
  // ANTES: 'pending': 'scheduled', 'rescheduled': 'scheduled'
  // AHORA: 'pending': 'pending', 'rescheduled': 'rescheduled'
  ```

#### `src/lib/appointmentSync.ts`
- **Líneas 298-318**: Funciones de mapeo
  ```typescript
  // ANTES: 'pending': 'scheduled', default 'scheduled'
  // AHORA: 'pending': 'pending', default 'pending'
  ```
- **Línea 179**: Default al sincronizar
  ```typescript
  // ANTES: appointment.status || 'scheduled'
  // AHORA: appointment.status || 'pending'
  ```

#### `src/components/Calendar/CalendarAppointmentDetailsModal.tsx`
- **Líneas 102-130**: Funciones de UI (getStatusIcon, getStatusColor, getStatusLabel)
  - Agregado soporte para `'pending'` y `'rescheduled'`
  - Eliminado caso `'scheduled'`
  - Actualizado default
- **Líneas 166-168**: Defaults en UI
  ```typescript
  // ANTES: appointment.status || 'scheduled'
  // AHORA: appointment.status || 'pending'
  ```

## 📊 Estados Soportados (Completo)

| Estado | Español | Color | Icono |
|--------|---------|-------|-------|
| `pending` | Pendiente | Amarillo | AlertCircle |
| `confirmed` | Confirmado | Verde | CheckCircle |
| `completed` | Completado | Azul | CheckCircle |
| `cancelled` | Cancelado | Rojo | XCircle |
| `no_show` | No Asistió | Naranja | AlertCircle |
| `rescheduled` | Reagendado | Púrpura | AlertCircle |

## 🎯 Resultado Final
- ✅ Base de datos alineada con código TypeScript
- ✅ Todos los mapeos actualizados de 'scheduled' → 'pending'
- ✅ UI soporta todos los 6 estados
- ✅ Sin más errores 400/406 por constraint violation
- ✅ Sistema de traducciones intacto (valores en inglés en DB, español en UI)
