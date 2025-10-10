# Barra de Estadísticas para Consultas

**Fecha:** 10 de octubre de 2025  
**Estado:** ✅ IMPLEMENTADO

## Descripción

Se agregó una barra de estadísticas en la página de **Consultas de Servicio** (`AdminInquiries.tsx`) similar a la que existe en otras secciones del dashboard.

## Estadísticas Implementadas

La barra muestra 6 métricas clave en tiempo real:

### 1. 📊 Total
- **Descripción:** Número total de consultas en el sistema
- **Icono:** MessageSquare (💬)
- **Color:** Azul
- **Cálculo:** Todas las consultas activas (deleted_at = null)

### 2. ⏰ Pendientes
- **Descripción:** Consultas que aún no han sido contactadas
- **Icono:** Clock (🕐)
- **Color:** Amarillo
- **Cálculo:** `status === 'pending'`
- **Importancia:** Requieren atención inmediata

### 3. 📞 Contactadas
- **Descripción:** Consultas que ya han sido contactadas
- **Icono:** Phone (📱)
- **Color:** Azul
- **Cálculo:** `status === 'contacted'`
- **Siguiente paso:** Pasar a "En Progreso" o dar seguimiento

### 4. 🚀 En Progreso
- **Descripción:** Consultas en proceso de gestión activa
- **Icono:** Send (📤)
- **Color:** Morado
- **Cálculo:** `status === 'in_progress'`
- **Significado:** Negociación activa, reuniones agendadas

### 5. ✅ Completadas
- **Descripción:** Consultas finalizadas exitosamente
- **Icono:** CheckCircle (✔️)
- **Color:** Verde
- **Cálculo:** `status === 'completed'`
- **Resultado:** Servicio prestado o contrato cerrado

### 6. 🚨 Urgentes
- **Descripción:** Consultas marcadas como urgentes
- **Icono:** AlertTriangle (⚠️)
- **Color:** Rojo
- **Cálculo:** `urgency === 'urgent'`
- **Prioridad:** Alta - requieren respuesta rápida

## Diseño Visual

### Estructura de Cada Card

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
  <div className="flex items-center space-x-3">
    {/* Icono con fondo de color */}
    <div className="w-12 h-12 bg-{color}-100 dark:bg-{color}-900 rounded-lg">
      <Icon className="w-6 h-6 text-{color}-600" />
    </div>
    
    {/* Datos */}
    <div>
      <p className="text-sm text-gray-600">Label</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
</div>
```

### Grid Responsive

- **Mobile (< 768px):** 2 columnas
- **Tablet (768px - 1024px):** 3 columnas
- **Desktop (> 1024px):** 6 columnas (todas en una fila)

```tsx
grid-cols-2 md:grid-cols-3 lg:grid-cols-6
```

## Código Implementado

### Cálculo de Estadísticas

```typescript
const stats = {
  total: inquiries.length,
  pending: inquiries.filter(inq => inq.status === 'pending').length,
  contacted: inquiries.filter(inq => inq.status === 'contacted').length,
  inProgress: inquiries.filter(inq => inq.status === 'in_progress').length,
  completed: inquiries.filter(inq => inq.status === 'completed').length,
  urgent: inquiries.filter(inq => inq.urgency === 'urgent').length,
};
```

### Estados Posibles

#### Status (Estado de Gestión)
1. `pending` - Pendiente (sin contactar)
2. `contacted` - Contactado (primera comunicación realizada)
3. `in_progress` - En Progreso (gestión activa)
4. `completed` - Completado (finalizado con éxito)
5. `cancelled` - Cancelado (no incluido en estadísticas principales)

#### Urgency (Nivel de Prioridad)
1. `urgent` - Urgente (requiere respuesta inmediata)
2. `normal` - Normal (prioridad estándar)
3. `flexible` - Flexible (sin apuro)

## Ubicación en la UI

La barra de estadísticas se ubica:

1. **Después del Header** (título y descripción)
2. **Antes de los Filtros** (búsqueda, estado, urgencia)
3. **Antes del Control de Selección Múltiple**

```
📱 Consultas de Servicio
   Gestiona las consultas...

📊 [Estadísticas en 6 cards]

🔍 [Filtros de búsqueda]

☑️ [Selección múltiple]

📋 [Lista de consultas]
```

## Interactividad

### Actualización en Tiempo Real

Las estadísticas se recalculan automáticamente cuando:

- ✅ Se carga la página
- ✅ Se actualiza el estado de una consulta
- ✅ Se elimina una consulta
- ✅ Se restaura una consulta
- ✅ Se crea una nueva consulta

### Filtros vs Estadísticas

**IMPORTANTE:** Las estadísticas muestran:
- ✅ **TODAS las consultas** en la base de datos (sin filtros)
- ❌ NO se filtran por búsqueda, estado o urgencia

**El contador de consultas** debajo del título:
- ✅ Muestra las consultas **filtradas** actualmente visibles
- ✅ Cambia según búsqueda y filtros aplicados

```tsx
{/* Total sin filtros */}
<p>Total: {stats.total}</p>

{/* Total con filtros aplicados */}
<span>{filteredInquiries.length} consultas</span>
```

## Paleta de Colores

| Estadística | Color Base | BG Light | BG Dark | Texto Light | Texto Dark |
|-------------|-----------|----------|---------|-------------|------------|
| Total       | Blue      | bg-blue-100 | bg-blue-900 | text-blue-600 | text-blue-400 |
| Pendientes  | Yellow    | bg-yellow-100 | bg-yellow-900 | text-yellow-600 | text-yellow-400 |
| Contactadas | Blue      | bg-blue-100 | bg-blue-900 | text-blue-600 | text-blue-400 |
| En Progreso | Purple    | bg-purple-100 | bg-purple-900 | text-purple-600 | text-purple-400 |
| Completadas | Green     | bg-green-100 | bg-green-900 | text-green-600 | text-green-400 |
| Urgentes    | Red       | bg-red-100 | bg-red-900 | text-red-600 | text-red-400 |

## Modo Oscuro

Todas las cards son totalmente compatibles con dark mode:

- ✅ Fondo cambia de `bg-white` a `bg-gray-800`
- ✅ Bordes cambian de `border-gray-200` a `border-gray-700`
- ✅ Texto cambia de `text-gray-900` a `text-white`
- ✅ Iconos ajustan tonalidad (`600` → `400`)

## Casos de Uso

### 1. Vista General Rápida
```
Total: 16
Pendientes: 3
Contactadas: 4
En Progreso: 5
Completadas: 2
Urgentes: 4
```

**Interpretación:**
- Tienes 16 consultas en total
- 3 necesitan contacto inmediato
- 4 requieren atención urgente
- 5 están en negociación activa
- 2 ya fueron completadas

### 2. Identificar Cuellos de Botella

Si ves:
```
Pendientes: 10
Contactadas: 1
En Progreso: 0
```

**Acción:** El equipo necesita ponerse al día con contactos iniciales.

### 3. Medir Productividad

Si ves:
```
Completadas: 8
En Progreso: 12
Pendientes: 2
```

**Análisis:** Buen flujo de trabajo, pocas pendientes, muchas activas.

### 4. Priorizar Atención

Si ves:
```
Urgentes: 6
Pendientes: 6
```

**Si coinciden:** Todas las pendientes son urgentes → máxima prioridad.

## Ejemplo Visual

```
┌──────────────────────────────────────────────────────────────────┐
│  📊 Consultas de Servicio                     🔵 16 consultas    │
│  Gestiona las consultas...                                       │
└──────────────────────────────────────────────────────────────────┘

┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ 💬 Total│ 🕐 Pend.│ 📱 Cont.│ 📤 Prog.│ ✅ Comp.│ ⚠️ Urg. │
│    16   │    3    │    4    │    5    │    2    │    4    │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 🔍 Buscar...    📋 Estado: Todos    ⚠️ Urgencia: Todas          │
└──────────────────────────────────────────────────────────────────┘
```

## Beneficios

### Para el Usuario
1. ✅ **Vista rápida** del estado general sin hacer scroll
2. ✅ **Identificación inmediata** de consultas que requieren atención
3. ✅ **Métricas clave** visibles de un vistazo
4. ✅ **Seguimiento de productividad** (completadas vs pendientes)

### Para el Sistema
1. ✅ **Actualizaciones automáticas** sin necesidad de recargar
2. ✅ **Cálculo eficiente** con filtros de JavaScript
3. ✅ **Diseño consistente** con otras secciones del dashboard
4. ✅ **Responsive** adaptado a todos los dispositivos

## Mantenimiento

### Agregar Nueva Estadística

Para agregar una nueva métrica:

```typescript
// 1. Agregar al cálculo
const stats = {
  // ...existentes
  cancelled: inquiries.filter(inq => inq.status === 'cancelled').length,
};

// 2. Agregar card en el grid
<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
  <div className="flex items-center space-x-3">
    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg">
      <XCircle className="w-6 h-6 text-gray-600" />
    </div>
    <div>
      <p className="text-sm text-gray-600">Canceladas</p>
      <p className="text-2xl font-bold">{stats.cancelled}</p>
    </div>
  </div>
</div>
```

### Cambiar Orden de las Cards

Simplemente reorganiza el orden en el grid:

```tsx
{/* Total - siempre primero */}
{/* Urgentes - segunda para dar prioridad visual */}
{/* Pendientes */}
{/* Contactadas */}
{/* En Progreso */}
{/* Completadas */}
```

## Archivos Modificados

- `src/pages/AdminInquiries.tsx`
  - Agregadas estadísticas (líneas ~600-710)
  - Cálculo de stats antes del return
  - Grid de 6 cards con diseño responsive

## Comparación con Otras Secciones

### AdminClients.tsx
```
Total | Inquilinos | Propietarios | Compradores | Activos | Inactivos
  3   |     1      |      2       |      0      |    3    |     0
```

### AdminInquiries.tsx (NUEVO)
```
Total | Pendientes | Contactadas | En Progreso | Completadas | Urgentes
  16  |     3      |      4      |      5      |      2      |    4
```

**Diseño idéntico, métricas específicas al contexto.**

## Conclusión

Las estadísticas de consultas están completamente funcionales y proporcionan una vista panorámica instantánea del estado del sistema de gestión de leads de servicios.

**Estado:** ✅ Listo para uso en producción
