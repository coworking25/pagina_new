# Sistema de Persistencia de Formularios - AdminProperties

## 🎯 Problema Resuelto

**Problema:** Cuando el administrador estaba creando una propiedad nueva y cambiaba de pestaña del navegador (para buscar información, subir imágenes, etc.), al regresar TODO el formulario se perdía por completo.

**Solución:** Sistema automático de guardado de borradores usando `localStorage` que persiste el estado del formulario incluso cuando:
- Cambias de pestaña
- Refrescas la página
- Cierras y vuelves a abrir el navegador (si fue en las últimas 24 horas)

---

## 🚀 Características Implementadas

### 1. **Custom Hook: `usePersistedState`**

Ubicación: `src/hooks/usePersistedState.ts`

Este hook reemplaza a `useState` pero con persistencia automática en `localStorage`:

```typescript
const {
  state: formData,
  setState: setFormData,
  clearPersistedState: clearFormDraft,
  hasDraft: hasFormDraft,
  lastSaved: formLastSaved
} = usePersistedState({
  key: 'admin-property-form-draft',
  initialValue: initialFormData,
  expirationTime: 24 * 60 * 60 * 1000 // 24 horas
});
```

**Funcionalidades:**
- ✅ Auto-guarda cada cambio en `localStorage`
- ✅ Restaura automáticamente al cargar el componente
- ✅ Expira después de 24 horas
- ✅ Maneja errores de localStorage (quota exceeded, etc.)
- ✅ Incluye timestamp del último guardado

---

### 2. **Estados Persistidos**

Se están persistiendo 3 estados críticos del formulario:

```typescript
// 1. Datos del formulario
usePersistedState({
  key: 'admin-property-form-draft',
  initialValue: initialFormData
});

// 2. Imágenes preview
usePersistedState({
  key: 'admin-property-images-draft',
  initialValue: [] as string[]
});

// 3. Amenidades seleccionadas
usePersistedState({
  key: 'admin-property-amenities-draft',
  initialValue: [] as string[]
});
```

**Nota:** Las imágenes completas NO se guardan en localStorage (sería demasiado pesado). Solo se guardan las URLs de las imágenes ya subidas a Supabase.

---

### 3. **UI de Restauración de Borradores**

Cuando el usuario regresa y hay un borrador guardado, se muestra:

#### Alerta de Borrador Restaurado
```tsx
📝 Borrador Restaurado
Se ha restaurado un borrador guardado automáticamente.
Último guardado: 14/1/2025 15:30:45

[Descartar borrador y empezar de nuevo]
```

#### Indicador de Auto-Guardado
```tsx
✅ Borrador guardado automáticamente
```

Aparece en la esquina superior derecha del formulario cuando hay datos guardados.

---

### 4. **Limpieza Automática de Borradores**

Los borradores se limpian automáticamente en estos casos:

1. **Al crear la propiedad exitosamente:** 
   - Se limpia todo: formulario + imágenes + amenidades
   
2. **Al presionar "Descartar borrador":**
   - Vuelve al formulario vacío
   
3. **Después de 24 horas:**
   - El borrador expira automáticamente

```typescript
const resetForm = () => {
  setFormData(initialFormData);
  setSelectedAmenities([]);
  setPreviewImages([]);
  
  // Limpiar borradores de localStorage
  clearFormDraft();
  clearImagesDraft();
  clearAmenitiesDraft();
  
  console.log('🧹 Formulario y borradores limpiados');
};
```

---

## 📋 Flujo de Uso

### Escenario 1: Crear Propiedad (con interrupciones)

1. **Usuario abre modal "Nueva Propiedad"**
   - Formulario vacío
   
2. **Usuario completa campos:**
   - Título: "Casa moderna en Chapinero"
   - Precio: "500000000"
   - Ubicación: "Chapinero, Bogotá"
   - ...
   - **Cada cambio se guarda automáticamente en localStorage**

3. **Usuario cambia de pestaña** (para buscar info en Google)
   - Estado guardado en localStorage ✅

4. **Usuario regresa a la pestaña**
   - Componente se re-monta
   - `usePersistedState` detecta borrador en localStorage
   - **Formulario restaurado con todos los datos** ✅
   - Alerta azul aparece: "📝 Borrador Restaurado"

5. **Usuario termina de completar y envía**
   - Propiedad creada exitosamente
   - `resetForm()` limpia todo
   - Borradores eliminados de localStorage ✅

---

### Escenario 2: Usuario descarta el borrador

1. **Usuario ve la alerta de borrador restaurado**
2. **Usuario hace clic en "Descartar borrador y empezar de nuevo"**
3. **Formulario se limpia completamente**
4. **localStorage se limpia**
5. **Usuario puede empezar desde cero**

---

## 🛠️ Archivos Modificados

### 1. `src/hooks/usePersistedState.ts` (NUEVO)
- Custom hook para persistencia en localStorage
- Manejo de expiración
- Funciones de limpieza

### 2. `src/pages/AdminProperties.tsx`
- Importación del hook: `import { usePersistedState } from '../hooks/usePersistedState'`
- Reemplazo de `useState` por `usePersistedState` para:
  - `formData`
  - `previewImages`
  - `selectedAmenities`
- Agregado de `initialFormData` con propiedad `featured: false`
- Actualización de `resetForm()` para limpiar borradores
- UI de alerta de borrador restaurado
- Indicador de auto-guardado

---

## 🔍 Detalles Técnicos

### Estructura de Datos en localStorage

```json
{
  "admin-property-form-draft": {
    "value": {
      "code": "",
      "title": "Casa moderna en Chapinero",
      "description": "Hermosa casa...",
      "price": "500000000",
      "location": "Chapinero, Bogotá",
      "bedrooms": "4",
      "bathrooms": "3",
      "area": "250",
      "type": "house",
      "status": "sale",
      "advisor_id": "",
      "images": [],
      "cover_image": "",
      "featured": false
    },
    "timestamp": 1705253445123
  },
  "admin-property-images-draft": {
    "value": [
      "https://supabase.../image1.jpg",
      "https://supabase.../image2.jpg"
    ],
    "timestamp": 1705253445123
  },
  "admin-property-amenities-draft": {
    "value": ["wifi", "parking", "pool"],
    "timestamp": 1705253445123
  }
}
```

### Expiración de Borradores

- **Tiempo de expiración:** 24 horas (86,400,000 ms)
- **Verificación:** Al cargar el componente
- **Limpieza:** Automática si `Date.now() - timestamp > expirationTime`

```typescript
const isExpired = Date.now() - parsed.timestamp > expirationTime;
if (isExpired) {
  localStorage.removeItem(key);
  return initialValue;
}
```

---

## ⚠️ Consideraciones y Limitaciones

### 1. **Límite de localStorage**
- **Límite típico:** 5-10 MB por dominio
- **Solución actual:** Solo guardamos datos del formulario, NO archivos completos
- **Imágenes:** Se suben primero a Supabase, luego guardamos solo las URLs

### 2. **Datos que NO se persisten**
- ❌ Archivos de imágenes (antes de subir a Supabase)
- ❌ Estado de loading/submitting (efímeros)
- ❌ Estados de modales (deben cerrarse/abrirse manualmente)

### 3. **Múltiples pestañas**
- Cada pestaña tiene su propio estado en memoria
- localStorage es compartido entre pestañas
- **Escenario:** 
  - Pestaña A guarda borrador → localStorage actualizado
  - Pestaña B NO ve cambios automáticamente (falta Broadcast Channel)
  - Pestaña B al refrescarse → Ve el borrador de Pestaña A

**Mejora futura:** Implementar Broadcast Channel API para sincronización en tiempo real.

### 4. **Navegadores privados/incógnito**
- localStorage puede estar deshabilitado
- El hook maneja errores gracefully
- Si falla, funciona como `useState` normal

---

## 🎨 Mejoras Futuras Sugeridas

### 1. **Sincronización entre pestañas**
```typescript
// Usar Broadcast Channel API
const channel = new BroadcastChannel('property-form-sync');
channel.postMessage({ type: 'form-update', data: formData });
```

### 2. **Indicador visual de auto-guardado en tiempo real**
```tsx
// Mostrar "Guardando..." → "Guardado ✓"
const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
```

### 3. **Historial de versiones**
```typescript
// Guardar múltiples versiones del borrador
localStorage.setItem('drafts-history', JSON.stringify([
  { timestamp: ..., data: ... },
  { timestamp: ..., data: ... }
]));
```

### 4. **Compresión de datos**
```typescript
// Usar LZ-string para comprimir antes de guardar
import LZString from 'lz-string';
const compressed = LZString.compress(JSON.stringify(data));
localStorage.setItem(key, compressed);
```

---

## ✅ Testing Manual

### Caso 1: Verificar Auto-Guardado
1. Abrir modal "Nueva Propiedad"
2. Completar campo título: "Test Casa"
3. Abrir DevTools → Application → Local Storage
4. Verificar key: `admin-property-form-draft`
5. Ver que contiene `{ value: { title: "Test Casa", ... }, timestamp: ... }`

### Caso 2: Verificar Restauración
1. Completar formulario parcialmente
2. Refrescar página (F5)
3. Abrir modal "Nueva Propiedad" de nuevo
4. Verificar que aparece alerta azul: "📝 Borrador Restaurado"
5. Verificar que todos los campos tienen los valores guardados

### Caso 3: Verificar Limpieza
1. Crear borrador
2. Completar formulario y guardar propiedad
3. Verificar en DevTools que las keys de localStorage están vacías o no existen
4. Abrir modal de nuevo → Formulario vacío (sin borrador)

### Caso 4: Verificar Expiración (requiere cambio temporal)
1. Cambiar `expirationTime` a 10 segundos (para testing)
2. Crear borrador
3. Esperar 11 segundos
4. Refrescar página
5. Abrir modal → Formulario vacío (borrador expirado)

---

## 📊 Logs de Consola

El sistema incluye logs para debugging:

```typescript
✅ Estado restaurado desde localStorage: admin-property-form-draft
💾 Estado guardado en localStorage: admin-property-form-draft
🧹 Formulario y borradores limpiados
🗑️ Estado limpiado: admin-property-form-draft
```

---

## 🎓 Conclusión

Este sistema resuelve completamente el problema de pérdida de datos al cambiar de pestaña. El administrador ahora puede:

✅ Trabajar sin miedo a perder su progreso
✅ Cambiar de pestaña libremente
✅ Cerrar el navegador y retomar después (en 24h)
✅ Ver claramente cuándo se guardó el último borrador
✅ Descartar borradores fácilmente si quiere empezar de nuevo

**Impacto en UX:** 🚀 Mejora dramática en la experiencia del administrador.
