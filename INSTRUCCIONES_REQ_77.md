# Instrucciones para Req 77: Gestión de Amenidades

## Descripción
Se ha implementado un sistema dinámico para la gestión de amenidades, reemplazando la lista hardcoded en el código por una tabla en la base de datos. Esto permite a los administradores agregar, editar y eliminar amenidades desde el panel de administración sin necesidad de modificar el código fuente.

## Cambios Realizados

### Base de Datos
1.  **Nueva Tabla `amenities`**:
    *   Columnas: `id` (UUID), `name` (Texto, único), `category` (Texto), `icon_name` (Texto), `created_at` (Timestamp).
    *   Se ha poblado la tabla con las amenidades que existían previamente en el código para asegurar la compatibilidad.

### Backend (Supabase)
1.  **Funciones API (`src/lib/supabase.ts`)**:
    *   `getAmenities()`: Obtiene todas las amenidades ordenadas por categoría y nombre.
    *   `createAmenity(amenity)`: Crea una nueva amenidad.
    *   `deleteAmenity(id)`: Elimina una amenidad por su ID.

### Frontend
1.  **Nuevo Componente `AmenitiesManager`**:
    *   Ubicación: `src/components/Properties/AmenitiesManager.tsx`.
    *   Funcionalidad: Permite listar, agregar y eliminar amenidades.
    *   Características:
        *   Visualización agrupada por categorías.
        *   Selector de iconos visual.
        *   Validación de nombres duplicados.
        *   Confirmación antes de eliminar.

2.  **Actualización de `AdminProperties`**:
    *   Se reemplazó la constante `amenitiesList` por un estado que se carga desde la base de datos.
    *   Se agregó un botón "Amenidades" en la cabecera del panel.
    *   Se integró el modal `AmenitiesManager` para la gestión.
    *   Se implementó un mapeo de iconos (`iconMap`) para convertir los nombres de iconos guardados en la DB a componentes de React (Lucide Icons).

## Cómo Probar
1.  **Verificar Carga Inicial**:
    *   Ir al panel de administración de propiedades.
    *   Verificar que las amenidades se carguen correctamente en los filtros o al editar una propiedad.
    *   Deberían aparecer las mismas amenidades que antes (WiFi, Piscina, etc.).

2.  **Gestión de Amenidades**:
    *   Hacer clic en el botón "Amenidades" en la parte superior derecha.
    *   **Agregar**: Intentar agregar una nueva amenidad (ej: "Sala de Cine", Categoría: "Recreación", Icono: "Film").
    *   **Verificar**: Cerrar el modal y verificar que la nueva amenidad aparece disponible para seleccionar en las propiedades.
    *   **Eliminar**: Eliminar la amenidad creada y verificar que desaparece.

## Notas Técnicas
*   **Iconos**: Se utiliza un mapa de iconos (`iconMap`) en `AdminProperties.tsx` que asocia strings (ej: "Wifi") con componentes de Lucide React. Si se agregan nuevos iconos al sistema, deben agregarse a este mapa.
*   **Compatibilidad**: El campo `id` de la amenidad en el frontend se mapea al `name` de la base de datos para mantener la compatibilidad con el array de strings que se guarda en la tabla `properties` (columna `amenities`).
