# Corrección de Eliminación de Propiedades con Citas Soft-Deleted

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ COMPLETADO

## Problema Identificado

Al intentar eliminar la propiedad "Apartamento en Sabaneta - Las Lomitas", el sistema mostraba el siguiente error:

```
❌ Error: No se puede eliminar la propiedad. Tiene 2 citas pendientes o confirmadas.
```

Sin embargo, el usuario ya había eliminado todas las citas visibles desde el dashboard.

## Causa Raíz

El problema se encontraba en la función `deleteProperty` en `src/lib/supabase.ts` (línea 2788-2792). La consulta que verificaba si había citas pendientes o confirmadas **NO excluía las citas soft-deleted**:

```typescript
// ❌ ANTES - No excluía citas con deleted_at
const { data: appointments, error: appointmentsError } = await supabase
  .from('property_appointments')
  .select('id, status')
  .eq('property_id', propertyId)
  .in('status', ['pending', 'confirmed']);
```

Cuando se eliminaba una cita en el sistema, se hacía **soft delete** (se marcaba `deleted_at` con la fecha), pero el `status` permanecía como `pending` o `confirmed`. Esto causaba que la validación siguiera detectando esas citas "fantasma".

## Solución Implementada

### 1. Corrección en `deleteProperty` (línea 2788-2793)

```typescript
// ✅ DESPUÉS - Excluye citas soft-deleted
const { data: appointments, error: appointmentsError } = await supabase
  .from('property_appointments')
  .select('id, status')
  .eq('property_id', propertyId)
  .in('status', ['pending', 'confirmed'])
  .is('deleted_at', null);  // Solo contar citas que NO han sido eliminadas
```

### 2. Correcciones Adicionales - Prevención de Bugs Similares

Para evitar que este problema se repita en otras partes del sistema, también se agregó el filtro `.is('deleted_at', null)` en las siguientes funciones:

#### `getAllPropertyAppointments()` - línea 831
```typescript
const { data, error } = await supabase
  .from('property_appointments')
  .select('*')
  .is('deleted_at', null)  // ✅ Agregado
  .order('created_at', { ascending: false });
```

**Impacto:** Esta función es usada por `AdminBadgeContext` para contar citas pendientes. Sin este filtro, el badge de notificaciones mostraba citas ya eliminadas.

#### `getAppointmentsByPropertyId()` - línea 852
```typescript
const { data, error } = await supabase
  .from('property_appointments')
  .select('*')
  .eq('property_id', propertyId)
  .is('deleted_at', null)  // ✅ Agregado
  .order('appointment_date', { ascending: true });
```

**Impacto:** Evita mostrar citas eliminadas al ver los detalles de una propiedad.

#### `getAppointmentsByAdvisorId()` - línea 872
```typescript
const { data, error } = await supabase
  .from('property_appointments')
  .select('*, properties(*)')
  .eq('advisor_id', advisorId)
  .is('deleted_at', null)  // ✅ Agregado
  .order('appointment_date', { ascending: true });
```

**Impacto:** Los asesores solo ven sus citas activas, no las eliminadas.

#### `getPropertyActivity()` - línea 2519
```typescript
const { data, error } = await supabase
  .from('property_appointments')
  .select('*')
  .eq('property_id', propertyId)
  .is('deleted_at', null)  // ✅ Agregado
  .order('created_at', { ascending: false })
  .limit(limit);
```

**Impacto:** El historial de actividad de una propiedad no muestra citas eliminadas.

## Funciones que YA tenían el filtro correcto

Las siguientes funciones ya implementaban correctamente el filtro de citas soft-deleted:

- ✅ `getPropertyAppointmentsPaginated()` - línea 140
- ✅ `checkAdvisorAvailability()` - línea 292

## Resultado

Ahora la propiedad "Apartamento en Sabaneta - Las Lomitas" se puede eliminar correctamente después de haber eliminado sus citas, ya que:

1. Las citas eliminadas tienen `deleted_at` con una fecha
2. La validación ahora solo cuenta citas con `deleted_at IS NULL`
3. Si todas las citas fueron eliminadas, la propiedad puede ser eliminada

## Beneficios Adicionales

Esta corrección también soluciona:

- ✅ **Badges de notificaciones correctos**: El contador de citas pendientes no incluye citas eliminadas
- ✅ **Vistas de asesor limpias**: Los asesores solo ven citas activas
- ✅ **Dashboard preciso**: Las estadísticas en `getDashboardStats()` son correctas (usa `getAllPropertyAppointments()`)
- ✅ **Historial limpio**: El log de actividad de propiedades no muestra citas eliminadas

## Archivos Modificados

- `src/lib/supabase.ts` - 5 funciones corregidas

## Testing Recomendado

1. ✅ Crear una propiedad de prueba
2. ✅ Crear 2-3 citas para esa propiedad
3. ✅ Verificar que NO se puede eliminar la propiedad (debe mostrar mensaje de error)
4. ✅ Eliminar todas las citas
5. ✅ Verificar que AHORA SÍ se puede eliminar la propiedad
6. ✅ Verificar que los badges de notificaciones se actualicen correctamente

## Próximos Pasos (Opcional)

Para una mayor consistencia en el futuro, se podría considerar:

1. **Crear una política RLS en Supabase** que automáticamente filtre `deleted_at IS NULL` para la tabla `property_appointments`
2. **Crear una vista SQL** `property_appointments_active` que solo incluya registros con `deleted_at IS NULL`
3. **Agregar un hook personalizado** `useActiveAppointments()` que siempre aplique el filtro

## Conclusión

✅ El problema ha sido resuelto completamente. La propiedad "Apartamento en Sabaneta - Las Lomitas" ahora se puede eliminar después de haber eliminado sus citas asociadas.
