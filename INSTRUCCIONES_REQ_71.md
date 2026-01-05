# Instrucciones para Activar Notas Internas (Req 71)

Se ha implementado la funcionalidad de Notas Internas para Propiedades. Para que funcione correctamente, es necesario ejecutar el siguiente script SQL en Supabase.

## 1. Ejecutar Script SQL

Abre el Editor SQL de Supabase y ejecuta el contenido del archivo `CREATE_INTERNAL_NOTES_TABLE.sql`.

Este script:
1. Crea la tabla `property_internal_notes`.
2. Configura las políticas de seguridad (RLS) para que solo administradores y asesores puedan ver y crear notas.
3. Crea índices para mejorar el rendimiento.

## 2. Verificar Funcionalidad

1. Ve al panel de Administración de Propiedades.
2. Abre los detalles de cualquier propiedad (icono de ojo).
3. Busca la sección "Notas Internas" en la barra lateral derecha (debajo de Estadísticas e Historial de Precios).
4. Intenta agregar una nota. Debería aparecer inmediatamente en la lista con tu fecha y hora.
5. Verifica que puedes eliminar tus propias notas.

## Notas
- Las notas son **privadas**. Los clientes finales NO pueden verlas.
- Solo el autor de la nota o un administrador pueden eliminarla.
