# Corrección: Race Condition en Selección Múltiple

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ CORREGIDO

## Problema Detectado

Al usar el sistema de selección múltiple (bulk actions), especialmente al eliminar varios elementos, ocurría un comportamiento extraño:

### Síntomas Reportados por Usuario
- ❌ Al seleccionar varias consultas y eliminar, **volvían a aparecer consultas previamente eliminadas**
- ❌ Las consultas seleccionadas **NO se eliminaban**
- ❌ El contador de selección se mantenía pero con items incorrectos
- ✅ El mensaje de confirmación se mostraba correctamente

### Comportamiento Observado
1. Usuario selecciona consultas A, B, C
2. Usuario clickea "Eliminar"
3. Sistema ejecuta eliminaciones
4. **BUG**: Aparecen consultas X, Y, Z (previamente eliminadas)
5. Las consultas A, B, C siguen ahí

## Causa Raíz

**Race Condition** en el orden de ejecución de las operaciones masivas:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
const handleBulkDelete = async () => {
  const count = multiSelect.selectedCount;
  
  // 1. selectedItems es un useMemo que depende de items + selectedIds
  const deletePromises = multiSelect.selectedItems.map(inquiry => 
    inquiry.id ? deleteServiceInquiry(inquiry.id) : Promise.resolve(false)
  );
  
  await Promise.all(deletePromises);
  
  // 2. fetchInquiries() actualiza la lista de items
  await fetchInquiries();
  
  // 3. multiSelect se recalcula CON LA NUEVA LISTA pero selectedIds aún está lleno
  // 4. clearSelection() se ejecuta DESPUÉS del recálculo
  multiSelect.clearSelection();
}
```

### Flujo del Bug

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona items [ID: 1, 2, 3]                  │
│    selectedIds = Set(1, 2, 3)                               │
│    selectedItems = [Item1, Item2, Item3]                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. handleBulkDelete ejecuta                                 │
│    - Elimina IDs 1, 2, 3 de la BD (soft-delete)            │
│    - selectedIds TODAVÍA = Set(1, 2, 3) ⚠️                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. fetchInquiries() trae nueva lista                        │
│    - items = [Item4, Item5, Item6, Item7, ...]             │
│    - selectedIds TODAVÍA = Set(1, 2, 3) ⚠️                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. React recalcula selectedItems (useMemo)                  │
│    selectedItems = items.filter(item =>                     │
│      selectedIds.has(item.id)                               │
│    )                                                         │
│                                                              │
│    SI en la nueva lista hay items con IDs 1, 2, 3          │
│    (que venían de consultas antiguas eliminadas),           │
│    ¡ESOS SE INCLUYEN EN selectedItems! 🐛                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. clearSelection() se ejecuta MUY TARDE                    │
│    - Ya se renderizó con los items incorrectos              │
└─────────────────────────────────────────────────────────────┘
```

### Por Qué Aparecen Items Viejos

Con el filtro `.is('deleted_at', null)` recién agregado, la lista ya no incluye los eliminados. PERO si hay **colisión de IDs** (por ejemplo, IDs que se reutilizan o consultas más antiguas con los mismos IDs), el hook `multiSelect` los selecciona automáticamente porque sus IDs coinciden con `selectedIds`.

## Solución Implementada

**Capturar los IDs/Items ANTES de cualquier operación y limpiar la selección ANTES del refresh:**

```typescript
// ✅ CÓDIGO CORREGIDO
const handleBulkDelete = async () => {
  const count = multiSelect.selectedCount;
  
  // 1. Capturar los IDs ANTES de cualquier cambio
  const idsToDelete = Array.from(multiSelect.selectedIds);
  
  // 2. Limpiar selección INMEDIATAMENTE para evitar race condition
  multiSelect.clearSelection();
  
  // 3. Eliminar usando los IDs capturados
  const deletePromises = idsToDelete.map(id => 
    deleteServiceInquiry(String(id))
  );
  
  await Promise.all(deletePromises);
  
  // 4. Refrescar la lista (selectedIds ya está vacío)
  await fetchInquiries();
}
```

### Nuevo Flujo Corregido

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuario selecciona items [ID: 1, 2, 3]                  │
│    selectedIds = Set(1, 2, 3)                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. handleBulkDelete captura IDs                             │
│    idsToDelete = [1, 2, 3] ✅ (copia independiente)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. clearSelection() se ejecuta PRIMERO                      │
│    selectedIds = Set() ✅ (vacío)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Elimina usando idsToDelete [1, 2, 3]                    │
│    - Los elimina de la BD                                   │
│    - selectedIds sigue vacío ✅                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. fetchInquiries() trae nueva lista                        │
│    - items = [Item4, Item5, Item6, ...]                    │
│    - selectedIds = Set() ✅ (vacío)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. React recalcula selectedItems                            │
│    selectedItems = [] ✅ (vacío, correcto)                  │
│    - No hay race condition                                  │
│    - No hay items fantasma                                  │
└─────────────────────────────────────────────────────────────┘
```

## Archivos Corregidos

Se aplicó el fix a **TODAS las funciones de acciones masivas** en las 4 secciones:

### 1. AdminInquiries (`src/pages/AdminInquiries.tsx`)

```typescript
// Funciones corregidas:
✅ handleBulkDelete (línea 130)
✅ handleBulkChangeStatus (línea 161)
✅ handleBulkExport (línea 192) - captura items para exportar
```

**Patrón aplicado:**
- Captura `Array.from(multiSelect.selectedIds)` 
- Ejecuta `multiSelect.clearSelection()` ANTES de las operaciones
- Usa los IDs capturados para las operaciones
- Llama `fetchInquiries()` al final

---

### 2. AdminAppointments (`src/pages/AdminAppointments.tsx`)

```typescript
// Funciones corregidas:
✅ handleBulkDelete (línea 524)
✅ handleBulkChangeStatus (línea 552)
✅ handleBulkAssignAdvisor (línea 584)
✅ handleBulkExport (línea 629) - captura items para exportar
```

**Patrón aplicado:**
- Captura `Array.from(multiSelect.selectedIds)`
- Ejecuta `multiSelect.clearSelection()` ANTES de las operaciones
- Convierte IDs a String: `String(id)`
- Llama `loadAppointments()` al final

---

### 3. AdminClients (`src/pages/AdminClients.tsx`)

```typescript
// Funciones corregidas:
✅ handleBulkDelete (línea 739)
✅ handleBulkChangeStatus (línea 765)
✅ handleBulkExport (línea 793) - captura items para exportar
✅ handleBulkTag (línea 827) - ya limpia correctamente
```

**Patrón aplicado:**
- Captura `Array.from(multiSelect.selectedIds)`
- Ejecuta `multiSelect.clearSelection()` ANTES de las operaciones
- Convierte IDs a String: `String(id)`
- Llama `loadClients()` al final

---

### 4. AdminProperties (`src/pages/AdminProperties.tsx`)

```typescript
// Funciones corregidas:
✅ handleBulkDelete (línea 1179)
✅ handleBulkChangeStatus (línea 1206)
✅ handleBulkToggleFeatured (línea 1234) - captura items para leer .featured
✅ handleBulkAssignAdvisor (línea 1258)
```

**Patrón aplicado:**
- Captura `Array.from(multiSelect.selectedIds)` 
- Para `handleBulkToggleFeatured`: captura `[...multiSelect.selectedItems]` (necesita el estado actual)
- Ejecuta `multiSelect.clearSelection()` ANTES de las operaciones
- Convierte IDs a Number: `Number(id)`
- Llama `refreshProperties()` al final

---

## Casos Especiales

### Exportación (handleBulkExport)
Para exportar se necesitan los **items completos** (no solo IDs), por lo que se captura:

```typescript
const itemsToExport = [...multiSelect.selectedItems];
const count = itemsToExport.length;
```

No se limpia la selección en este caso porque no hay refresh que pueda causar race condition.

### Toggle Featured (handleBulkToggleFeatured)
Necesita conocer el estado actual de `featured` para alternarlo:

```typescript
const itemsToUpdate = [...multiSelect.selectedItems];
multiSelect.clearSelection();

const updatePromises = itemsToUpdate.map(property => {
  return updateProperty(property.id, { featured: !property.featured });
});
```

## Beneficios

1. ✅ **Eliminación correcta**
   - Los items seleccionados se eliminan sin problemas
   - No vuelven a aparecer items viejos

2. ✅ **Sin race conditions**
   - La selección se limpia antes del refresh
   - No hay recálculos con datos stale

3. ✅ **Experiencia de usuario mejorada**
   - El comportamiento es predecible
   - Los contadores se actualizan correctamente

4. ✅ **Consistencia**
   - Mismo patrón en todas las secciones
   - Código mantenible y entendible

## Patrón de Código Recomendado

```typescript
const handleBulkOperation = async () => {
  const count = multiSelect.selectedCount;
  
  // 1. Confirmación
  if (!confirm(`Confirmar operación en ${count} items?`)) return;
  
  try {
    // 2. CAPTURAR IDs/Items ANTES
    const idsToProcess = Array.from(multiSelect.selectedIds);
    // O si necesitas items completos:
    // const itemsToProcess = [...multiSelect.selectedItems];
    
    // 3. LIMPIAR selección ANTES de cualquier operación async
    multiSelect.clearSelection();
    
    // 4. Ejecutar operaciones con los datos capturados
    const promises = idsToProcess.map(id => 
      apiFunction(String(id), params)
    );
    await Promise.all(promises);
    
    // 5. Refrescar lista (selectedIds ya está vacío)
    await refreshList();
    
    // 6. Notificar éxito
    alert(`✅ Operación completada en ${count} items`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error en la operación');
  }
};
```

## Testing

### Escenarios Probados
1. ✅ Seleccionar y eliminar múltiples consultas
2. ✅ Seleccionar y cambiar estado en masa
3. ✅ Seleccionar y exportar a CSV
4. ✅ Operaciones con lista filtrada
5. ✅ Operaciones después de eliminar items previamente

### Casos Edge Verificados
- ✅ Seleccionar todos y eliminar
- ✅ Seleccionar algunos después de filtrar
- ✅ Eliminar mientras hay filtros activos
- ✅ Refresh rápido de lista no causa items fantasma

## Archivos Modificados

- ✅ `src/pages/AdminInquiries.tsx` - 3 funciones corregidas
- ✅ `src/pages/AdminAppointments.tsx` - 4 funciones corregidas  
- ✅ `src/pages/AdminClients.tsx` - 4 funciones corregidas
- ✅ `src/pages/AdminProperties.tsx` - 4 funciones corregidas

**Total:** 15 funciones corregidas en 4 archivos

## Lecciones Aprendidas

1. **useMemo y dependencias reactivas**
   - Los valores computados se recalculan en cada render
   - Capturar datos antes de operaciones async es crucial

2. **Orden de operaciones en React**
   - setState es asíncrono
   - Múltiples actualizaciones pueden causar race conditions
   - Limpiar estado ANTES de refrescar datos previene bugs

3. **Hooks personalizados con estado derivado**
   - `selectedItems` depende de `items` Y `selectedIds`
   - Cambiar `items` mientras `selectedIds` tiene valores puede causar comportamientos inesperados

## Conclusión

Este fix resuelve completamente el problema de race condition en el sistema de selección múltiple. El patrón aplicado es consistente, predecible y fácil de mantener. Todas las operaciones masivas ahora funcionan correctamente sin efectos secundarios.
