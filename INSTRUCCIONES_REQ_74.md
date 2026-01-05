# Instrucciones para Activar el Historial de Precios (Req 74)

Se ha implementado la funcionalidad de Historial de Precios. Para que funcione correctamente, es necesario ejecutar el siguiente script SQL en Supabase.

## 1. Ejecutar Script SQL

Abre el Editor SQL de Supabase y ejecuta el contenido del archivo `CREATE_PRICE_HISTORY_TABLE.sql`.

Este script:
1. Crea la tabla `property_price_history`.
2. Configura las políticas de seguridad (RLS).
3. Crea la función y el trigger `log_property_price_change` que registrará automáticamente cualquier cambio en `sale_price` o `rent_price` en la tabla `properties`.

## 2. Verificar Funcionalidad

1. Ve al panel de Administración de Propiedades.
2. Edita una propiedad y cambia su precio (Venta o Arriendo).
3. Guarda los cambios.
4. Abre los detalles de esa propiedad (icono de ojo).
5. Deberías ver una nueva sección "Historial de Precios" con un gráfico mostrando el cambio.

## Notas
- El historial se genera automáticamente mediante el trigger de base de datos. No requiere acción manual del usuario.
- El gráfico solo aparecerá si hay al menos un registro en el historial.
