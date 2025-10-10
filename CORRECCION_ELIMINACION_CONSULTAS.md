# Corrección: Eliminación de Consultas de Servicios

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ CORREGIDO

## Problema Detectado

Las consultas de servicios mostraban un mensaje de confirmación de eliminación exitosa, pero seguían apareciendo en el dashboard después de ser eliminadas.

### Síntomas
- ✅ Mensaje "Consulta eliminada correctamente"
- ❌ La consulta seguía visible en la lista
- ❌ Las estadísticas no se actualizaban
- ❌ Las alertas seguían mostrando consultas eliminadas

## Causa Raíz

Similar al problema de eliminación de propiedades, el sistema usa **soft-delete** (marca `deleted_at`) pero las funciones de consulta NO estaban filtrando los registros eliminados.

### Análisis Técnico

1. **La función `deleteServiceInquiry`** correctamente marca el registro como eliminado:
   ```typescript
   .update({ deleted_at: new Date().toISOString() })
   ```

2. **Las funciones de lectura NO filtraban** los registros con `deleted_at`:
   - `getServiceInquiries()` - Lista principal de consultas
   - `getServiceInquiriesStats()` - Estadísticas del dashboard
   - Alertas de leads sin seguimiento
   - Métricas de conversión de leads

## Solución Implementada

Se agregó el filtro `.is('deleted_at', null)` a **5 consultas** diferentes:

### 1. `getServiceInquiries` (línea 1524)
**Archivo:** `src/lib/supabase.ts`

```typescript
// ❌ ANTES
let query = supabase
  .from('service_inquiries')
  .select('*')
  .order('created_at', { ascending: false });

// ✅ DESPUÉS  
let query = supabase
  .from('service_inquiries')
  .select('*')
  .is('deleted_at', null)
  .order('created_at', { ascending: false });
```

**Impacto:** Lista principal de consultas en AdminInquiries

---

### 2. `getServiceInquiriesStats` (línea 1663)
**Archivo:** `src/lib/supabase.ts`

```typescript
// ❌ ANTES
const { data, error } = await supabase
  .from('service_inquiries')
  .select('service_type, status, created_at');

// ✅ DESPUÉS
const { data, error } = await supabase
  .from('service_inquiries')
  .select('service_type, status, created_at')
  .is('deleted_at', null);
```

**Impacto:** Estadísticas en el dashboard (total, por servicio, por estado, pendientes, este mes)

---

### 3. Alertas de Leads Sin Seguimiento (línea 1918)
**Archivo:** `src/lib/supabase.ts`

```typescript
// ❌ ANTES
const { data: unfollowedLeads } = await supabase
  .from('service_inquiries')
  .select('id, client_name, service_type, created_at')
  .eq('status', 'pending')
  .lt('created_at', twoDaysAgo.toISOString());

// ✅ DESPUÉS
const { data: unfollowedLeads } = await supabase
  .from('service_inquiries')
  .select('id, client_name, service_type, created_at')
  .is('deleted_at', null)
  .eq('status', 'pending')
  .lt('created_at', twoDaysAgo.toISOString());
```

**Impacto:** Sistema de alertas críticas del dashboard

---

### 4 y 5. Métricas de Conversión de Leads (líneas 2131 y 2136)
**Archivo:** `src/lib/supabase.ts`

```typescript
// ❌ ANTES - Total de consultas
const { data: totalInquiries } = await supabase
  .from('service_inquiries')
  .select('id')
  .gte('created_at', new Date(currentYear, 0, 1).toISOString());

// ✅ DESPUÉS
const { data: totalInquiries } = await supabase
  .from('service_inquiries')
  .select('id')
  .is('deleted_at', null)
  .gte('created_at', new Date(currentYear, 0, 1).toISOString());

// ❌ ANTES - Consultas convertidas
const { data: convertedInquiries } = await supabase
  .from('service_inquiries')
  .select('id')
  .eq('status', 'completed')
  .gte('created_at', new Date(currentYear, 0, 1).toISOString());

// ✅ DESPUÉS
const { data: convertedInquiries } = await supabase
  .from('service_inquiries')
  .select('id')
  .is('deleted_at', null)
  .eq('status', 'completed')
  .gte('created_at', new Date(currentYear, 0, 1).toISOString());
```

**Impacto:** Tasa de conversión de leads en métricas financieras

---

## Funciones Corregidas

| # | Función | Línea | Propósito |
|---|---------|-------|-----------|
| 1 | `getServiceInquiries` | 1524 | Obtener lista de consultas |
| 2 | `getServiceInquiriesStats` | 1663 | Estadísticas del dashboard |
| 3 | `getCriticalAlerts` | 1918 | Alertas de leads sin seguimiento |
| 4 | `getFinancialMetrics` | 2131 | Total de consultas del año |
| 5 | `getFinancialMetrics` | 2136 | Consultas convertidas |

## Funciones que NO necesitan filtro

Las siguientes funciones NO necesitan el filtro porque no son de lectura o son de actualización específica:

- `createServiceInquiry` - Inserción de nuevas consultas
- `updateServiceInquiry` - Actualización específica por ID
- `markInquiryAsWhatsAppSent` - Actualización específica por ID
- `deleteServiceInquiry` - Ya marca el `deleted_at`

## Beneficios

1. ✅ **Consistencia en la eliminación**
   - Las consultas eliminadas desaparecen inmediatamente del dashboard
   - No hay discrepancia entre el mensaje y la realidad

2. ✅ **Estadísticas precisas**
   - Los contadores reflejan solo consultas activas
   - Las métricas de conversión son correctas

3. ✅ **Alertas limpias**
   - No se generan alertas para consultas ya eliminadas
   - El sistema de priorización funciona correctamente

4. ✅ **Mantenimiento del historial**
   - Los registros no se eliminan físicamente
   - Se pueden recuperar si es necesario
   - Auditoría completa de eliminaciones

## Patrón de Soft-Delete

Este fix sigue el patrón de soft-delete implementado en toda la aplicación:

```typescript
// Al eliminar
.update({ deleted_at: new Date().toISOString() })

// Al consultar
.is('deleted_at', null)
```

### Otras entidades con soft-delete:
- ✅ Propiedades (`properties`)
- ✅ Citas (`appointments`)
- ✅ Consultas de servicios (`service_inquiries`)
- ⚠️ Clientes (revisar si aplica)

## Testing

### Casos de Prueba
1. ✅ Eliminar una consulta individual
   - Verificar que desaparece de la lista
   - Verificar que las estadísticas se actualizan
   
2. ✅ Eliminar múltiples consultas (bulk delete)
   - Verificar que todas desaparecen
   - Verificar contador de "consultas seleccionadas"
   
3. ✅ Verificar estadísticas
   - Total debe excluir eliminadas
   - Por servicio debe excluir eliminadas
   - Por estado debe excluir eliminadas
   
4. ✅ Verificar alertas
   - No deben aparecer consultas eliminadas en alertas críticas

5. ✅ Verificar métricas financieras
   - Tasa de conversión debe calcular correctamente

## Archivos Modificados

- ✅ `src/lib/supabase.ts` - 5 funciones corregidas

## Commits

```bash
git add src/lib/supabase.ts CORRECCION_ELIMINACION_CONSULTAS.md
git commit -m "🐛 Corregir eliminación de consultas - Filtrar deleted_at

- Agregado .is('deleted_at', null) a 5 funciones:
  * getServiceInquiries (lista principal)
  * getServiceInquiriesStats (estadísticas)
  * getCriticalAlerts (alertas de leads)
  * getFinancialMetrics (2 consultas de conversión)
  
- Las consultas eliminadas ya no aparecen en:
  * Dashboard de consultas
  * Estadísticas y contadores
  * Sistema de alertas
  * Métricas de conversión
  
- Mantiene soft-delete para auditoría
- Consistente con fix de propiedades anterior"
```

## Notas Adicionales

- Este problema era idéntico al de eliminación de propiedades
- Confirma la necesidad de revisar TODAS las entidades con soft-delete
- Considerar crear un helper genérico `whereNotDeleted()` para evitar repetir `.is('deleted_at', null)`

## Próximos Pasos

1. ⏳ Revisar entidad `clients` para mismo patrón
2. ⏳ Crear helper de consulta para soft-delete
3. ⏳ Documentar patrón en guía de desarrollo
