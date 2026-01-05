# Instrucciones para Activar Etiquetas (Tags) (Req 76)

Se ha implementado la funcionalidad de Etiquetas (Tags) para Propiedades. Para que funcione correctamente, es necesario ejecutar el siguiente script SQL en Supabase.

## 1. Ejecutar Script SQL

Abre el Editor SQL de Supabase y ejecuta el contenido del archivo `ADD_TAGS_COLUMN.sql`.

Este script:
1. Agrega la columna `tags` (array de texto) a la tabla `properties`.
2. Crea un índice GIN para optimizar búsquedas futuras por etiquetas.

## 2. Verificar Funcionalidad

1. Ve al panel de Administración de Propiedades.
2. Edita una propiedad existente.
3. Busca la nueva sección "Etiquetas (Tags)" debajo de la descripción.
4. Escribe una etiqueta (ej: "Oportunidad") y presiona Enter o el botón Agregar.
5. Guarda los cambios.
6. Abre los detalles de la propiedad (icono de ojo) y verifica que las etiquetas aparezcan en la barra lateral derecha.

## Notas
- Las etiquetas son visibles públicamente (a diferencia de las notas internas).
- Puedes usar etiquetas para destacar características especiales como "Remodelado", "Vista al Mar", "Pet Friendly", etc.
