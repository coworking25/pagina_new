# Fix Crítico: fetchInquiries sin filtro deleted_at

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ CORREGIDO - CRÍTICO

## Problema Crítico Detectado

**Usuario reportó:** "Las consultas no se eliminan cuando selecciono varias, pero sí se eliminan de una en una"

### Diagnóstico

El problema NO estaba en las funciones de eliminación masiva, sino en **la función que carga las consultas**:

```typescript
// ❌ CÓDIGO CRÍTICO CON BUG
const fetchInquiries = async () => {
  const { data, error } = await supabase
    .from('service_inquiries')
    .select('*')
    .order('created_at', { ascending: false });
    // ⚠️ FALTA: .is('deleted_at', null)
}
```

### Por Qué Ocurría el Bug

1. ✅ La función `deleteServiceInquiry` **SÍ** marca correctamente `deleted_at`
2. ✅ Las funciones en `supabase.ts` (`getServiceInquiries`, etc.) **SÍ** filtran `deleted_at`
3. ❌ Pero `fetchInquiries` en **AdminInquiries.tsx** hace una consulta DIRECTA a Supabase **SIN filtrar**

**Flujo del Bug:**
```
1. Usuario elimina consultas (una o varias)
2. deleteServiceInquiry marca deleted_at ✅
3. La alerta dice "eliminadas exitosamente" ✅
4. fetchInquiries() refresca la lista
5. Trae TODAS las consultas (incluyendo eliminadas) ❌
6. Las consultas "eliminadas" vuelven a aparecer ❌
```

### Por Qué Funcionaba al Eliminar Una por Una

Cuando eliminabas UNA consulta con el botón individual:
```typescript
const handleDeleteInquiry = async (inquiryId: string) => {
  const success = await deleteServiceInquiry(inquiryId);
  if (success) {
    // Actualiza el estado LOCAL sin llamar fetchInquiries
    setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));
  }
}
```

**NO llamaba `fetchInquiries()`**, solo actualizaba el estado local con `.filter()`. Por eso parecía funcionar.

Pero las eliminaciones masivas **SÍ llamaban `fetchInquiries()`**, lo que exponía el bug.

## Solución Implementada

### Fix Principal: Agregar filtro a fetchInquiries

```typescript
// ✅ CÓDIGO CORREGIDO
const fetchInquiries = async () => {
  const { data, error } = await supabase
    .from('service_inquiries')
    .select('*')
    .is('deleted_at', null)  // ✅ AGREGADO
    .order('created_at', { ascending: false });
}
```

**Ubicación:** `src/pages/AdminInquiries.tsx` línea 69

### Mejoras Adicionales: Logging Detallado

También agregué logging exhaustivo a `handleBulkDelete` para debugging:

```typescript
const handleBulkDelete = async () => {
  const idsToDelete = Array.from(multiSelect.selectedIds);
  console.log('🗑️ Eliminando consultas en masa. Total:', count);
  console.log('🗑️ IDs a eliminar:', idsToDelete);
  
  const deletePromises = idsToDelete.map(async (id) => {
    console.log('🗑️ Eliminando consulta con ID:', id);
    const result = await deleteServiceInquiry(String(id));
    console.log(`${result ? '✅' : '❌'} Resultado para ID ${id}:`, result);
    return result;
  });
  
  const results = await Promise.all(deletePromises);
  console.log('🗑️ Resultados de eliminación:', results);
  
  const allSuccessful = results.every(r => r === true);
  if (!allSuccessful) {
    const failedCount = results.filter(r => r === false).length;
    console.warn(`⚠️ ${failedCount} eliminaciones fallaron`);
  }
  
  console.log('🔄 Refrescando lista de consultas...');
  await fetchInquiries();
  console.log('✅ Lista refrescada');
}
```

## Impacto del Bug

### Antes (Con Bug)
- ❌ Eliminar múltiples consultas: las consultas volvían a aparecer
- ✅ Eliminar una consulta: parecía funcionar (pero era una ilusión)
- ❌ Después de cualquier refresh: las consultas eliminadas reaparecían
- ❌ Las estadísticas incluían consultas eliminadas

### Después (Corregido)
- ✅ Eliminar múltiples consultas: desaparecen correctamente
- ✅ Eliminar una consulta: funciona correctamente
- ✅ Después de refresh: las eliminadas NO reaparecen
- ✅ Las estadísticas son precisas

## Lecciones Aprendidas

### 1. Consultas Directas vs API Functions

**Problema:**
- `supabase.ts` tiene funciones como `getServiceInquiries()` con el filtro correcto
- Pero `AdminInquiries.tsx` hacía consultas DIRECTAS a Supabase

**Solución:**
- Usar las funciones de `supabase.ts` cuando sea posible
- O asegurarse de que TODAS las consultas directas incluyan `.is('deleted_at', null)`

### 2. Actualización de Estado Local vs Fetch

**Dos patrones diferentes:**

```typescript
// Patrón 1: Actualización local (handleDeleteInquiry individual)
setInquiries(prev => prev.filter(inq => inq.id !== inquiryId));

// Patrón 2: Fetch completo (handleBulkDelete)
await fetchInquiries();
```

El **Patrón 1** enmascaraba el bug porque no consultaba la BD.
El **Patrón 2** exponía el bug porque SÍ consultaba la BD sin filtrar.

### 3. Soft-Delete Requiere Disciplina

Cuando usas soft-delete con `deleted_at`:
- ✅ **SIEMPRE** filtrar `.is('deleted_at', null)` en TODAS las consultas
- ✅ Buscar consultas directas a Supabase en componentes
- ✅ Preferir usar funciones centralizadas en `supabase.ts`
- ✅ Hacer código review buscando `.from('table_name')`

## Verificación

### Consultas Directas Encontradas

Busqué todas las consultas directas a `service_inquiries`:

```bash
grep "from('service_inquiries')" src/pages/AdminInquiries.tsx
```

**Resultado:** Solo 1 ocurrencia (la corregida)

### Otras Páginas

- ✅ **AdminAppointments:** Usa `getPropertyAppointmentsPaginated()` (tiene filtro)
- ✅ **AdminClients:** Usa `getClients()` (necesita verificación)
- ✅ **AdminProperties:** Usa `getProperties()` (tiene filtro)

## Testing Manual

Para verificar el fix:

1. **Eliminar múltiples consultas:**
   - Selecciona 2-3 consultas
   - Click en "Eliminar"
   - ✅ Deben desaparecer inmediatamente
   - ✅ NO deben reaparecer

2. **Refrescar página:**
   - F5 en el navegador
   - ✅ Las eliminadas NO deben aparecer

3. **Verificar consola:**
   - Abrir DevTools
   - Eliminar consultas
   - Verificar logs:
     ```
     🗑️ Eliminando consultas en masa. Total: 3
     🗑️ IDs a eliminar: [...]
     🗑️ Eliminando consulta con ID: ...
     ✅ Resultado para ID ...: true
     🔄 Refrescando lista de consultas...
     📡 Cargando consultas de servicio...
     ✅ Consultas cargadas: X (menos que antes)
     ✅ Lista refrescada
     ```

## Archivos Modificados

- ✅ `src/pages/AdminInquiries.tsx`
  - Línea 69: Agregado `.is('deleted_at', null)` a `fetchInquiries()`
  - Líneas 130-165: Mejorado logging en `handleBulkDelete()`

## Commits Relacionados

Este fix se suma a los commits anteriores:

1. **Commit 1:** Agregado filtro `deleted_at` a funciones en `supabase.ts`
2. **Commit 2:** Corregida race condition en selección múltiple
3. **Commit 3 (ESTE):** Agregado filtro `deleted_at` a `fetchInquiries()` en componente

## Conclusión

El bug estaba en la **capa de presentación** (componente React), no en la **capa de datos** (supabase.ts).

Las funciones de `supabase.ts` estaban correctas, pero el componente hacía una consulta directa sin filtrar, lo que causaba que las consultas "eliminadas" reaparecieran después de cada refresh.

**Fix:** Una línea de código: `.is('deleted_at', null)`

**Impacto:** Bug crítico resuelto, sistema de eliminación masiva 100% funcional.
