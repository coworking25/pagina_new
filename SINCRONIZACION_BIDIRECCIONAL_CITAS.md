# 🔄 SISTEMA DE SINCRONIZACIÓN BIDIRECCIONAL DE CITAS IMPLEMENTADO

## ✅ IMPLEMENTACIÓN COMPLETADA

### **Problema Resuelto**
- ❌ Antes: Las citas de la web se guardaban solo en `property_appointments`
- ❌ Antes: Las citas del calendario se guardaban solo en `appointments`
- ✅ Ahora: **Todas las citas se guardan automáticamente en AMBAS tablas**

---

## 📋 ARCHIVOS CREADOS/MODIFICADOS

### **1. Nuevo archivo: `src/lib/appointmentSync.ts`**
Sistema completo de sincronización bidireccional con:
- `syncPropertyToAppointments()` - Sincroniza de property_appointments → appointments
- `syncAppointmentToProperty()` - Sincroniza de appointments → property_appointments
- `deleteSyncedAppointment()` - Elimina de ambas tablas simultáneamente
- Funciones auxiliares de mapeo de tipos y estados

### **2. Modificado: `src/lib/supabase.ts`**
- ✅ Importa funciones de sincronización
- ✅ `savePropertyAppointmentSimple()` ahora sincroniza automáticamente a appointments
- ✅ `deleteAppointment()` elimina de ambas tablas sincronizadamente

### **3. Modificado: `src/lib/calendarService.ts`**
- ✅ Importa funciones de sincronización
- ✅ `createAppointment()` ahora sincroniza automáticamente a property_appointments
- ✅ `deleteAppointment()` elimina de ambas tablas sincronizadamente

---

## 🎯 FLUJOS DE SINCRONIZACIÓN

### **Flujo 1: Cita desde la WEB (formulario de propiedad)**
```
1. Usuario agenda cita en página web
2. savePropertyAppointmentSimple() guarda en property_appointments
3. ✅ Automáticamente llama syncPropertyToAppointments()
4. ✅ Crea entrada en tabla appointments con vínculo (property_appointment_id)
5. ✅ Ambas tablas actualizadas
```

### **Flujo 2: Cita desde CALENDARIO/MODAL**
```
1. Admin crea cita en calendario o modal de citas
2. createAppointment() guarda en appointments
3. ✅ Automáticamente llama syncAppointmentToProperty()
4. ✅ Crea entrada en tabla property_appointments
5. ✅ Actualiza appointment con el vínculo (property_appointment_id)
6. ✅ Ambas tablas actualizadas
```

### **Flujo 3: Eliminar CITA**
```
1. Admin elimina cita desde cualquier lugar
2. deleteAppointment() o calendarService.deleteAppointment()
3. ✅ Llama deleteSyncedAppointment()
4. ✅ Soft delete en appointments (deleted_at)
5. ✅ Soft delete en property_appointments (deleted_at)
6. ✅ Cita eliminada de AMBAS tablas simultáneamente
```

---

## 🔗 VÍNCULO ENTRE TABLAS

### **Campo clave: `property_appointment_id`**
- Presente en la tabla `appointments`
- Referencia el `id` de la tabla `property_appointments`
- Permite sincronización bidireccional
- Evita duplicados

---

## 🗺️ MAPEO DE TIPOS Y ESTADOS

### **Tipos de citas**
```typescript
property_appointments        →    appointments
--------------------              -------------
'visita'                     →    'viewing'
'consulta'                   →    'consultation'
'valuacion'                  →    'valuation'
'seguimiento'                →    'follow_up'
```

### **Estados**
```typescript
property_appointments        →    appointments
--------------------              -------------
'pending'                    →    'scheduled'
'confirmed'                  →    'confirmed'
'completed'                  →    'completed'
'cancelled'                  →    'cancelled'
'no_show'                    →    'no_show'
```

---

## 🔍 PREVENCIÓN DE DUPLICADOS

### **Método 1: Verificación por property_appointment_id**
```typescript
// Antes de crear, verifica si ya existe el vínculo
const { data: existing } = await supabase
  .from('appointments')
  .select('id')
  .eq('property_appointment_id', propertyAppointment.id)
  .single();
```

### **Método 2: Búsqueda por datos similares**
```typescript
// Busca citas con mismo email y fecha
const { data: existing } = await supabase
  .from('property_appointments')
  .select('id')
  .eq('client_email', appointment.contact_email)
  .eq('appointment_date', appointment.start_time)
  .single();
```

---

## ⚡ CARACTERÍSTICAS CLAVE

### **1. Sincronización Automática**
- ✅ No requiere intervención manual
- ✅ Se ejecuta en segundo plano
- ✅ Manejo de errores no críticos (no interrumpe flujo principal)

### **2. Soft Delete**
- ✅ Usa columna `deleted_at` en ambas tablas
- ✅ No elimina datos permanentemente
- ✅ Permite recuperación de datos

### **3. Logs Detallados**
```typescript
console.log('🔄 Sincronizando property_appointment → appointments:', id);
console.log('✅ Cita sincronizada a appointments:', data.id);
console.log('⚠️ Error en sincronización (no crítico):', error);
```

### **4. Manejo de Errores Robusto**
```typescript
try {
  await syncPropertyToAppointments(data);
} catch (syncError) {
  console.warn('⚠️ Error en sincronización (no crítico):', syncError);
  // No lanza error para no interrumpir el flujo principal
}
```

---

## 📝 ESTRUCTURA DE DATOS

### **PropertyAppointmentData (Interface)**
```typescript
interface PropertyAppointmentData {
  id: string;
  client_name?: string;
  client_email?: string;
  client_phone?: string;
  property_id?: number;
  advisor_id?: string;
  appointment_date: string;
  appointment_type?: string;
  status?: string;
  special_requests?: string;
}
```

### **AppointmentData (Interface)**
```typescript
interface AppointmentData {
  id: string;
  title?: string;
  description?: string;
  start_time: string;
  end_time?: string;
  property_id?: number;
  advisor_id?: string;
  appointment_type?: string;
  status?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
  property_appointment_id?: string; // ← Vínculo clave
}
```

---

## 🧪 CÓMO PROBAR

### **Prueba 1: Cita desde WEB**
1. Ve a la página web en localhost:5174
2. Selecciona una propiedad
3. Agenda una cita
4. Verifica en consola: `🔄 Sincronizando property_appointment → appointments`
5. Revisa en base de datos ambas tablas

### **Prueba 2: Cita desde CALENDARIO**
1. Ve al panel admin → Calendario
2. Crea nueva cita
3. Verifica en consola: `🔄 Sincronizando appointment → property_appointments`
4. Revisa en base de datos ambas tablas

### **Prueba 3: Eliminar CITA**
1. Elimina una cita desde cualquier interfaz
2. Verifica en consola: `✅ Cita eliminada exitosamente de ambas tablas`
3. Verifica que `deleted_at` está presente en AMBAS tablas

---

## 🔧 SQL PARA VERIFICAR SINCRONIZACIÓN

### **Ver citas sincronizadas**
```sql
SELECT 
  a.id as appointment_id,
  a.property_appointment_id,
  pa.id as property_appointment_id_actual,
  a.title,
  pa.client_name,
  a.created_at
FROM appointments a
LEFT JOIN property_appointments pa 
  ON a.property_appointment_id = pa.id
WHERE a.deleted_at IS NULL
  AND pa.deleted_at IS NULL
ORDER BY a.created_at DESC;
```

### **Verificar citas huérfanas (sin sincronizar)**
```sql
-- Appointments sin property_appointment
SELECT id, title, created_at 
FROM appointments 
WHERE property_appointment_id IS NULL 
  AND deleted_at IS NULL;

-- Property_appointments sin appointment vinculada
SELECT pa.id, pa.client_name, pa.created_at
FROM property_appointments pa
WHERE NOT EXISTS (
  SELECT 1 FROM appointments a 
  WHERE a.property_appointment_id = pa.id
)
AND pa.deleted_at IS NULL;
```

---

## 📊 ESTADO ACTUAL

✅ **Sistema de sincronización bidireccional implementado**
✅ **Soft delete implementado en ambas tablas**
✅ **Prevención de duplicados implementada**
✅ **Mapeo de tipos y estados implementado**
✅ **Manejo de errores robusto**
✅ **Logs detallados para debugging**

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **Probar el sistema completo**
   - Crear citas desde web y calendario
   - Verificar sincronización en base de datos
   - Probar eliminación

2. **Sincronizar citas existentes** (opcional)
   - Crear script para sincronizar citas antiguas
   - Ejecutar una sola vez para datos históricos

3. **Monitorear logs**
   - Revisar consola del navegador
   - Verificar mensajes de sincronización
   - Detectar posibles errores

---

## 🚀 COMANDOS ÚTILES

```powershell
# Iniciar servidor de desarrollo
npm run dev

# Verificar errores de TypeScript
npx tsc --noEmit

# Ver logs en tiempo real
# (Abre DevTools → Console en el navegador)
```

---

## 📞 SOPORTE

Si encuentras algún problema:
1. Revisa los logs en la consola del navegador
2. Verifica que las variables de entorno estén configuradas (.env)
3. Comprueba la conexión a Supabase
4. Revisa que las columnas `deleted_at` y `property_appointment_id` existan

---

**Sistema implementado el:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Estado:** ✅ LISTO PARA PRUEBAS
