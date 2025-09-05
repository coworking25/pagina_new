# Guía de Migración: Nuevo Bucket property-images

## Problema Identificado
Las imágenes no cargan debido a problemas de políticas de seguridad en el bucket actual `imagenes`. 

## Solución Propuesta
Crear un nuevo bucket `property-images` con políticas de acceso público correctas.

## Pasos para la Migración

### 1. Crear el Nuevo Bucket en Supabase
1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard/project/gfczfjpyyyyvteyrvhgt/storage/buckets
2. Haz clic en "Create Bucket"
3. Nombre: `property-images`
4. Marcar como "Public"
5. Crear el bucket

### 2. Configurar Políticas de Seguridad
Ejecuta el siguiente SQL en el SQL Editor de Supabase:

```sql
-- El contenido está en el archivo: sql/01_create_bucket.sql
```

### 3. Actualizar las Rutas en la Base de Datos
Ejecuta el siguiente SQL para actualizar las rutas de las imágenes:

```sql
-- El contenido está en el archivo: sql/02_update_images_new_bucket.sql
```

### 4. Migrar las Imágenes
Opción A - Manual desde el Dashboard:
1. Descargar todas las imágenes del bucket `imagenes`
2. Reorganizar en carpetas por código de propiedad
3. Subir al nuevo bucket `property-images` con la estructura:
   ```
   property-images/
   ├── CA-001/
   │   ├── CA-001-(1).jpeg
   │   ├── CA-001-(2).jpeg
   │   └── ...
   ├── CA-002/
   │   └── ...
   ```

Opción B - Usando la API de Supabase (recomendado):
```javascript
// Script para migrar usando JavaScript en el navegador
// (Ver archivo migration_script.js)
```

### 5. Estructura de URLs Resultante
Las nuevas URLs tendrán el formato:
```
https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/CA-001/CA-001-(1).jpeg
```

### 6. Verificar la Migración
1. Probar una URL directamente en el navegador
2. Verificar que la aplicación carga las imágenes correctamente
3. Comprobar que todas las 20 propiedades tienen imágenes

## Total de Imágenes por Propiedad (Datos Reales)

| Código | Imágenes | Código | Imágenes | Código | Imágenes | Código | Imágenes |
|--------|----------|--------|----------|--------|----------|--------|----------|
| CA-001 | 18 | CA-006 | 14 | CA-011 | 14 | CA-016 | 13 |
| CA-002 | 14 | CA-007 | 10 | CA-012 | 11 | CA-017 | 14 |
| CA-003 | 15 | CA-008 | 15 | CA-013 | 13 | CA-018 | 12 |
| CA-004 | 13 | CA-009 | 13 | CA-014 | 10 | CA-019 | 18 |
| CA-005 | 14 | CA-010 | 11 | CA-015 | 10 | CA-020 | 16 |

**Total: 268 imágenes en 20 propiedades**
- `src/lib/supabase.ts` - Función getPublicImageUrl actualizada
- `sql/01_create_bucket.sql` - Script para crear bucket y políticas
- `sql/02_update_images_new_bucket.sql` - Script para actualizar rutas
- `generate_migration_plan.py` - Herramienta para planificar la migración

## Ventajas del Nuevo Enfoque
1. ✅ Políticas de seguridad claras y específicas
2. ✅ Estructura de carpetas más limpia
3. ✅ URLs más cortas y legibles
4. ✅ Bucket público explícitamente configurado
5. ✅ Mejor organización por código de propiedad

## URLs de Ejemplo
Antes: `https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/imagenes/imagenes/CA-001/CA-001-(1).jpeg`
Después: `https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/CA-001/CA-001-(1).jpeg`
