# Sistema de Selección Múltiple y Acciones Masivas

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ IMPLEMENTADO PARCIALMENTE (Propiedades completo, Citas y Clientes pendientes)

## Descripción General

Se ha implementado un sistema completo de selección múltiple con acciones masivas para el dashboard administrativo. Este permite a los administradores seleccionar varios elementos a la vez y realizar operaciones masivas sobre ellos.

## Componentes Creados

### 1. Hook `useMultiSelect` (`src/hooks/useMultiSelect.ts`)

Hook personalizado reutilizable para manejar la lógica de selección múltiple.

**Características:**
- ✅ Seleccionar/deseleccionar items individuales
- ✅ Seleccionar todos los items
- ✅ Limpiar selección
- ✅ Verificar si un item está seleccionado
- ✅ Estado indeterminado (algunos seleccionados)
- ✅ Obtener lista de items seleccionados
- ✅ Contador de items seleccionados

**Uso:**
```typescript
const multiSelect = useMultiSelect({
  items: properties,  // Array de items
  getItemId: (property) => property.id || 0  // Función para obtener ID
});

// Métodos disponibles:
multiSelect.toggleSelect(id)
multiSelect.selectAll()
multiSelect.clearSelection()
multiSelect.isSelected(id)
multiSelect.selectedCount
multiSelect.selectedItems
multiSelect.isAllSelected
multiSelect.isSomeSelected
```

### 2. Componente `BulkActionBar` (`src/components/UI/BulkActionBar.tsx`)

Barra flotante animada que aparece cuando hay elementos seleccionados.

**Características:**
- ✅ Aparece con animación desde abajo
- ✅ Muestra contador de elementos seleccionados
- ✅ Botones de acción personalizables
- ✅ Variantes de color (default, danger, success, primary)
- ✅ Iconos predefinidos para acciones comunes
- ✅ Responsive (oculta texto en móviles)
- ✅ Botón para limpiar selección

**Props:**
```typescript
interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  actions: BulkAction[];
  entityName?: string;  // "propiedades", "citas", "clientes"
}
```

**Iconos predefinidos:**
- `BulkActionIcons.Delete` - Eliminar
- `BulkActionIcons.Edit` - Editar
- `BulkActionIcons.Check` - Marcar/Aprobar
- `BulkActionIcons.Download` - Descargar/Exportar
- `BulkActionIcons.Email` - Enviar email
- `BulkActionIcons.Tag` - Etiquetar
- `BulkActionIcons.AssignUser` - Asignar usuario
- `BulkActionIcons.Feature` - Destacar

## Implementación en Propiedades (AdminProperties.tsx)

### ✅ Funcionalidades Implementadas

1. **Checkbox de seleccionar todo**
   - Ubicación: En la sección de filtros
   - Estados visuales: normal, todos seleccionados, algunos seleccionados
   - Muestra contador de elementos seleccionados
   - Botón para limpiar selección

2. **Checkbox en cada card**
   - Ubicación: Esquina superior izquierda de cada propiedad
   - Estilo: Fondo blanco/gris con efecto hover
   - Seleccionado: Fondo azul con icono de check

3. **Barra de acciones flotante**
   - Aparece solo cuando hay elementos seleccionados
   - Posición: Fija en la parte inferior central
   - Gradiente azul-púrpura con efecto de desenfoque

### Acciones Disponibles para Propiedades

#### 1. Eliminar Múltiples (`handleBulkDelete`)
```typescript
- Muestra confirmación con cantidad
- Elimina todas las propiedades seleccionadas
- Refresca la lista automáticamente
- Limpia la selección al completar
- Notifica el resultado
```

#### 2. Destacar/Quitar Destacado (`handleBulkToggleFeatured`)
```typescript
- Alterna el estado 'featured' de cada propiedad
- Si está destacada la quita, si no lo está la destaca
- Útil para promocionar propiedades
```

#### 3. Marcar como Disponible (`handleBulkChangeStatus`)
```typescript
- Cambia el status de todas a 'available'
- Puede extenderse para otros estados:
  * 'sale', 'rent', 'sold', 'rented', etc.
```

#### 4. Asignar Asesor (`handleBulkAssignAdvisor`)
```typescript
- Solicita ID de asesor mediante prompt
- Asigna el mismo asesor a todas las propiedades
- TODO: Mejorar con modal de selección de asesor
```

### Ubicación del Código

```
AdminProperties.tsx
├── Línea 91-92: Imports useMultiSelect y BulkActionBar
├── Línea 87-88: Imports CheckSquare, CheckboxIcon, Minus
├── Línea 115-118: Inicialización de multiSelect hook
├── Línea 1173-1276: Funciones de acciones masivas
│   ├── handleBulkDelete
│   ├── handleBulkChangeStatus
│   ├── handleBulkToggleFeatured
│   └── handleBulkAssignAdvisor
├── Línea 1436-1476: Checkbox "Seleccionar todo" en filtros
├── Línea 1545-1564: Checkbox en cada card de propiedad
└── Línea 3537-3563: BulkActionBar flotante
```

## Implementación en Citas (AdminAppointments.tsx)

### ⏳ Estado: PARCIALMENTE IMPLEMENTADO

**Completado:**
- ✅ Imports agregados (useMultiSelect, BulkActionBar, iconos)
- ✅ Hook useMultiSelect inicializado

**Pendiente:**
- ⏳ Funciones de acciones masivas
- ⏳ Checkbox de seleccionar todo
- ⏳ Checkbox en cada fila de cita
- ⏳ BulkActionBar con acciones específicas

### Acciones Planeadas para Citas

1. **Eliminar Múltiples**
   - Eliminar varias citas a la vez

2. **Cambiar Estado Masivo**
   - Confirmar múltiples citas
   - Cancelar múltiples citas
   - Marcar como completadas

3. **Asignar Asesor**
   - Reasignar múltiples citas a un asesor

4. **Exportar**
   - Exportar citas seleccionadas a CSV/Excel
   - Incluir información del cliente y propiedad

5. **Enviar Recordatorios**
   - Enviar WhatsApp masivo a clientes
   - Enviar emails de recordatorio

## Implementación en Clientes (AdminClients.tsx)

### ⏳ Estado: NO INICIADO

### Acciones Planeadas para Clientes

1. **Eliminar Múltiples**
   - Eliminar varios clientes a la vez

2. **Exportar**
   - Exportar a CSV/Excel
   - Incluir toda la información relevante

3. **Enviar Email Masivo**
   - Campaña de email marketing
   - Boletines informativos
   - Ofertas especiales

4. **Etiquetar/Categorizar**
   - Asignar etiquetas a múltiples clientes
   - Categorizar por interés, estado, etc.

5. **Asignar a Asesor**
   - Distribuir clientes entre asesores

## Mejoras Futuras

### Prioridad Alta
1. **Modal de Confirmación Mejorado**
   - Reemplazar `window.confirm()` y `alert()`
   - Usar modales personalizados con animaciones
   - Mostrar preview de elementos afectados

2. **Modal de Selección de Asesor**
   - Reemplazar `prompt()` en `handleBulkAssignAdvisor`
   - Mostrar lista de asesores con fotos
   - Permitir búsqueda y filtrado

3. **Exportación de Datos**
   - Implementar export a CSV
   - Implementar export a Excel
   - Seleccionar qué columnas exportar

### Prioridad Media
4. **Deshacer Acción**
   - Permitir deshacer eliminaciones masivas
   - Toast con botón "Deshacer" (5 segundos)

5. **Acciones Personalizadas por Tipo**
   - Para propiedades: Publicar/Despublicar, Duplicar
   - Para citas: Reprogramar masivo, Enviar recordatorios
   - Para clientes: Segmentar, Crear lista de distribución

6. **Selección Avanzada**
   - Seleccionar por rango (Shift + Click)
   - Filtrar y seleccionar todos los filtrados
   - Invertir selección

### Prioridad Baja
7. **Atajos de Teclado**
   - `Ctrl/Cmd + A`: Seleccionar todo
   - `Escape`: Limpiar selección
   - `Delete`: Eliminar seleccionados

8. **Drag & Drop**
   - Arrastrar para seleccionar múltiples
   - Arrastrar seleccionados para asignar asesor

## Diseño y UX

### Colores y Estados
- **No seleccionado:** Fondo blanco/gris claro
- **Seleccionado:** Fondo azul (#3B82F6)
- **Hover:** Efecto de escala y sombra
- **Indeterminado:** Icono de menos (-) en checkbox principal

### Animaciones
- **Barra flotante:** Slide up desde abajo con fade in
- **Checkboxes:** Scale al hacer hover y click
- **Botones:** Scale 1.05 en hover, 0.95 en click

### Accesibilidad
- ✅ Botones con títulos descriptivos
- ✅ Iconos con significado claro
- ✅ Feedback visual claro
- ⏳ Atajos de teclado (pendiente)
- ⏳ Anuncios para lectores de pantalla (pendiente)

## Testing Recomendado

1. **Selección**
   - [ ] Seleccionar un elemento
   - [ ] Seleccionar múltiples elementos
   - [ ] Seleccionar todos
   - [ ] Deseleccionar uno a uno
   - [ ] Limpiar selección
   - [ ] Estado indeterminado del checkbox principal

2. **Acciones Masivas**
   - [ ] Eliminar múltiples (2-3 elementos)
   - [ ] Eliminar todas las seleccionadas
   - [ ] Destacar múltiples propiedades
   - [ ] Cambiar estado de múltiples
   - [ ] Asignar asesor a múltiples

3. **UI/UX**
   - [ ] Barra flotante aparece/desaparece correctamente
   - [ ] Animaciones fluidas
   - [ ] Responsive en móvil
   - [ ] Dark mode funciona correctamente

4. **Edge Cases**
   - [ ] Seleccionar todo con 0 elementos
   - [ ] Intentar acción con selección vacía
   - [ ] Error al ejecutar acción (manejo correcto)
   - [ ] Actualización de lista después de acción

## Notas Técnicas

### Rendimiento
- El hook `useMultiSelect` usa `useMemo` y `useCallback` para evitar re-renders innecesarios
- La selección se maneja con un `Set` para búsquedas O(1)
- Las acciones masivas usan `Promise.all()` para ejecución en paralelo

### TypeScript
- Todos los componentes están fuertemente tipados
- El hook es genérico (`<T>`) para reutilización
- Interfaces claras y documentadas

### Compatibilidad
- React 18+
- Framer Motion para animaciones
- Lucide React para iconos
- TailwindCSS para estilos

## Archivos Creados/Modificados

### Nuevos Archivos
- ✅ `src/hooks/useMultiSelect.ts` (78 líneas)
- ✅ `src/components/UI/BulkActionBar.tsx` (102 líneas)

### Archivos Modificados
- ✅ `src/pages/AdminProperties.tsx` (+150 líneas aprox.)
- ⏳ `src/pages/AdminAppointments.tsx` (+20 líneas, incompleto)
- ⏳ `src/pages/AdminClients.tsx` (no iniciado)

## Conclusión

El sistema de selección múltiple está completamente funcional para **Propiedades** y proporciona una base sólida y reutilizable para implementarlo en **Citas** y **Clientes**. El código es modular, tipado y fácil de mantener.

La barra de acciones flotante proporciona una excelente experiencia de usuario con animaciones fluidas y diseño intuitivo.
