## INSTRUCCIONES PARA AGREGAR LA COLUMNA COVER_IMAGE

### Método 1: Usando la Dashboard de Supabase (Recomendado)

1. Ve a la dashboard de Supabase: https://gfczfjpyyyyvteyrvhgt.supabase.co
2. Inicia sesión con tus credenciales
3. Ve a la sección "SQL Editor" en el menú lateral
4. Ejecuta el siguiente SQL:

```sql
-- Agregar la columna cover_image
ALTER TABLE properties ADD COLUMN IF NOT EXISTS cover_image TEXT;

-- Actualizar propiedades existentes
UPDATE properties 
SET cover_image = (
  CASE 
    WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 
    THEN images->>0 
    ELSE NULL 
  END
)
WHERE cover_image IS NULL;
```

### Método 2: Usando la interfaz de tabla

1. Ve a "Table Editor" → "properties"
2. Haz clic en "Add column"
3. Nombre: `cover_image`
4. Tipo: `text`
5. Nullable: ✅ (permitir valores nulos)
6. Guarda los cambios

### Verificación

Después de agregar la columna, verifica que funcione ejecutando:

```sql
SELECT id, title, cover_image, jsonb_array_length(images) as image_count 
FROM properties 
LIMIT 5;
```

### ¿Por qué necesitamos esta columna?

- Permite seleccionar cualquier imagen como portada de la propiedad
- Mejora la experiencia de usuario al mostrar la imagen más relevante
- Mantiene consistencia en las tarjetas de propiedades
- Permite cambiar la portada sin reordenar todas las imágenes

### Estado actual

❌ La columna `cover_image` NO existe en la base de datos
✅ El componente `CoverImageSelector` está implementado y listo
✅ La funcionalidad está integrada en `AdminProperties`
⏳ Esperando la creación de la columna en Supabase

### Error actual

```
"Could not find the 'cover_image' column of 'properties' in the schema cache"
```

Este error se resolverá una vez que se agregue la columna usando cualquiera de los métodos anteriores.
