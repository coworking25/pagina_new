# 🔍 ANÁLISIS COMPLETO: ESTADOS DE PROPIEDADES

## 📊 PROBLEMA IDENTIFICADO

### El Issue Principal:
Las propiedades aparecen con estado "Disponible" en la página web, pero **NO** muestran correctamente si son "En Venta" o "En Arriendo" como en el dashboard.

---

## 🏗️ ARQUITECTURA ACTUAL DEL SISTEMA

### 1️⃣ **Estructura de Base de Datos**

La tabla `properties` tiene DOS campos relacionados con estado:

```sql
-- Campo 1: availability_type (Tipo de disponibilidad)
availability_type TEXT DEFAULT 'sale'
CHECK (availability_type IN ('sale', 'rent', 'both'))

-- Campo 2: status (Estado actual de la propiedad)
status TEXT
CHECK (status IN ('available', 'sale', 'rent', 'both', 'sold', 'rented', 'reserved', 'maintenance', 'pending'))
```

#### **Diferencia Clave:**
- **`availability_type`**: Define QUÉ se ofrece (venta, arriendo, o ambos)
- **`status`**: Define el ESTADO actual de la propiedad (disponible, vendida, arrendada, etc.)

---

## ⚠️ INCONSISTENCIA DETECTADA

### **Problema 1: Confusión entre `status` y `availability_type`**

En el código actual:

#### **Dashboard (AdminProperties.tsx)** - ✅ CORRECTO
```tsx
// Filtro de propiedades en venta
{allProperties.filter(p => 
  (p.availability_type === 'sale' || p.availability_type === 'both') && 
  (p.status === 'available' || p.status === 'sale')
).length}

// Filtro de propiedades en arriendo
{allProperties.filter(p => 
  (p.availability_type === 'rent' || p.availability_type === 'both') && 
  (p.status === 'available' || p.status === 'rent')
).length}
```

#### **Página Pública (Properties.tsx)** - ❌ INCORRECTO
```tsx
// Transaction Type filter - Solo mira el STATUS, no el availability_type
if (filters.transactionType && filters.transactionType.trim()) {
  filtered = filtered.filter(property => 
    property && property.status && 
    ((filters.transactionType === 'Arriendo' && property.status === 'rent') ||
     (filters.transactionType === 'Venta' && property.status === 'sale'))
  );
}
```

**Problema**: No considera `availability_type`, solo `status`.

---

### **Problema 2: Query de Supabase**

En `src/lib/supabase.ts`:

```typescript
if (onlyAvailable) {
  // Incluir solo propiedades con status: 'rent', 'sale', 'available', o 'both'
  query = query.or('status.eq.rent,status.eq.sale,status.eq.available,status.eq.both');
}
```

**Problema**: Trae propiedades con `status='available'`, pero NO las filtra por `availability_type`.

---

### **Problema 3: Filtros de la Página Web**

En `PropertyFilters.tsx`:

```tsx
<select
  value={filters.transactionType}
  onChange={(e) => handleInputChange('transactionType', e.target.value)}
>
  <option value="">Todos</option>
  <option value="Arriendo">Arriendo</option>
  <option value="Venta">Venta</option>
</select>
```

**Falta**: No hay opción para "Venta y Arriendo" (both).

Y en el filtro de estado:

```tsx
<select value={filters.status}>
  <option value="">Todos</option>
  <option value="available">Disponible</option>
  <option value="sale">En Venta</option>
  <option value="rent">En Arriendo</option>
</select>
```

**Problema**: Confunde `status` con `availability_type`.

---

## 💡 SOLUCIÓN PROPUESTA

### 1️⃣ **Corregir el filtro de Transaction Type**

En `Properties.tsx`, cambiar de:

```tsx
// ❌ INCORRECTO
if (filters.transactionType === 'Arriendo' && property.status === 'rent')
```

A:

```tsx
// ✅ CORRECTO
if (filters.transactionType === 'Arriendo' && 
    (property.availability_type === 'rent' || property.availability_type === 'both'))

if (filters.transactionType === 'Venta' && 
    (property.availability_type === 'sale' || property.availability_type === 'both'))
```

---

### 2️⃣ **Agregar filtro "Venta y Arriendo"**

En `PropertyFilters.tsx`:

```tsx
<select value={filters.transactionType}>
  <option value="">Todos</option>
  <option value="Arriendo">Arriendo</option>
  <option value="Venta">Venta</option>
  <option value="Both">Venta y Arriendo</option>  {/* ← NUEVO */}
</select>
```

---

### 3️⃣ **Mejorar visualización de estado en PropertyCard**

Actualizar `getStatusText()` para considerar `availability_type`:

```tsx
const getDisplayStatus = (property: Property) => {
  // Si la propiedad está vendida o arrendada, mostrar ese estado
  if (property.status === 'sold') return 'Vendido';
  if (property.status === 'rented') return 'Arrendado';
  if (property.status === 'reserved') return 'Reservado';
  if (property.status === 'maintenance') return 'Mantenimiento';
  if (property.status === 'pending') return 'Pendiente';
  
  // Si está disponible, mostrar según availability_type
  if (property.status === 'available' || property.status === 'sale' || property.status === 'rent') {
    switch (property.availability_type) {
      case 'sale': return 'En Venta';
      case 'rent': return 'En Arriendo';
      case 'both': return 'En Venta y Arriendo';
      default: return 'Disponible';
    }
  }
  
  return 'Disponible';
};
```

---

### 4️⃣ **Corregir query de Supabase**

En lugar de filtrar solo por `status`, también considerar `availability_type`:

```typescript
if (onlyAvailable) {
  // Propiedades disponibles: status available/sale/rent Y no vendidas/arrendadas
  query = query
    .in('status', ['available', 'sale', 'rent', 'both'])
    .not('status', 'eq', 'sold')
    .not('status', 'eq', 'rented');
}
```

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

- [ ] Actualizar filtro `transactionType` en `Properties.tsx`
- [ ] Agregar opción "Venta y Arriendo" en `PropertyFilters.tsx`
- [ ] Crear función `getDisplayStatus()` en `PropertyCard.tsx`
- [ ] Actualizar lógica de `getStatusText()` en `PropertyCard.tsx`
- [ ] Corregir query en `getProperties()` en `supabase.ts`
- [ ] Agregar filtro de estado basado en `availability_type` (no solo `status`)
- [ ] Ejecutar script SQL para corregir inconsistencias en BD
- [ ] Probar filtros en página pública
- [ ] Validar que dashboard siga funcionando correctamente

---

## 🧪 CASOS DE PRUEBA

### Caso 1: Propiedad en Venta
- `availability_type = 'sale'`
- `status = 'available'`
- **Debe mostrar**: "En Venta"
- **Debe aparecer en filtro**: "Venta" ✅

### Caso 2: Propiedad en Arriendo
- `availability_type = 'rent'`
- `status = 'available'`
- **Debe mostrar**: "En Arriendo"
- **Debe aparecer en filtro**: "Arriendo" ✅

### Caso 3: Propiedad en Venta Y Arriendo
- `availability_type = 'both'`
- `status = 'available'` o `status = 'both'`
- **Debe mostrar**: "En Venta y Arriendo"
- **Debe aparecer en filtros**: "Venta", "Arriendo", "Venta y Arriendo" ✅

### Caso 4: Propiedad Vendida
- `availability_type = 'sale'`
- `status = 'sold'`
- **Debe mostrar**: "Vendido"
- **NO debe aparecer** en página pública ❌

### Caso 5: Propiedad Arrendada
- `availability_type = 'rent'`
- `status = 'rented'`
- **Debe mostrar**: "Arrendado"
- **NO debe aparecer** en página pública ❌

---

## 🔧 SCRIPT SQL DE CORRECCIÓN

```sql
-- Asegurar que propiedades con availability_type='both' tengan status correcto
UPDATE properties
SET status = 'both'
WHERE deleted_at IS NULL
  AND availability_type = 'both'
  AND status IN ('available', 'sale', 'rent');

-- Validar que no haya inconsistencias
SELECT 
  id,
  code,
  title,
  availability_type,
  status,
  CASE 
    WHEN availability_type = 'both' AND status != 'both' THEN '⚠️ INCONSISTENTE'
    WHEN availability_type = 'sale' AND status NOT IN ('available', 'sale', 'sold', 'reserved', 'maintenance', 'pending') THEN '⚠️ INCONSISTENTE'
    WHEN availability_type = 'rent' AND status NOT IN ('available', 'rent', 'rented', 'reserved', 'maintenance', 'pending') THEN '⚠️ INCONSISTENTE'
    ELSE '✅ OK'
  END as validacion
FROM properties
WHERE deleted_at IS NULL
ORDER BY created_at DESC;
```

---

## 🎯 RESULTADO ESPERADO

Después de las correcciones:

1. ✅ Dashboard sigue funcionando correctamente
2. ✅ Propiedades en la web muestran "En Venta", "En Arriendo", o "En Venta y Arriendo"
3. ✅ Filtros permiten buscar por tipo de transacción correctamente
4. ✅ Propiedades con `availability_type='both'` aparecen en ambos filtros
5. ✅ Estados consistentes entre BD, backend y frontend

---

## 🐛 ERRORES ADICIONALES ENCONTRADOS

### 1. Falta de validación de precios
- Propiedades con `availability_type='both'` deben tener `sale_price` Y `rent_price`
- Propiedades con `availability_type='sale'` deben tener `sale_price`
- Propiedades con `availability_type='rent'` deben tener `rent_price`

### 2. Campo `price` obsoleto
- El campo `price` ya no debería usarse directamente
- Debería calcularse dinámicamente según `availability_type`:
  - Si `sale`: usar `sale_price`
  - Si `rent`: usar `rent_price`
  - Si `both`: priorizar según contexto

### 3. Inconsistencia en PropertyCard
- La función `getStatusText()` no considera `availability_type`
- Solo mira `status`, causando que todo aparezca como "Disponible"

---

## 📝 RECOMENDACIONES ADICIONALES

1. **Crear constantes para estados**:
```typescript
export const AVAILABILITY_TYPES = {
  SALE: 'sale',
  RENT: 'rent',
  BOTH: 'both'
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  SALE: 'sale',
  RENT: 'rent',
  BOTH: 'both',
  SOLD: 'sold',
  RENTED: 'rented',
  RESERVED: 'reserved',
  MAINTENANCE: 'maintenance',
  PENDING: 'pending'
} as const;
```

2. **Función helper para obtener estado display**:
```typescript
export function getPropertyDisplayStatus(property: Property): string {
  // Lógica centralizada para obtener el estado visual correcto
}
```

3. **Validación de datos en formularios**:
- Agregar validación al crear/editar propiedades
- Asegurar que `availability_type` y precios sean consistentes

---

## 🚀 PRÓXIMOS PASOS

1. Implementar las correcciones en el código
2. Ejecutar script SQL de validación
3. Probar en entorno de desarrollo
4. Validar con datos reales
5. Desplegar a producción

