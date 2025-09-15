-- db/scripts/fix_property_statuses.sql
-- Normaliza valores de status en public.properties (renta/sale -> rented/sold) y muestra conteo final
BEGIN;

-- Map 'rent' and common english/spanish variants to 'rented'
UPDATE public.properties
SET status = 'rented'
WHERE lower(trim(coalesce(status,''))) IN ('rent','renta','rental','alquiler','for rent');

-- Map 'sale' and variants to 'sold'
UPDATE public.properties
SET status = 'sold'
WHERE lower(trim(coalesce(status,''))) IN ('sale','venta','for sale');

-- (Opcional) otros mapeos conservadores
UPDATE public.properties
SET status = 'rented'
WHERE lower(trim(coalesce(status,''))) IN ('occupied','ocupada','ocupado','arrendada','alquilada');

UPDATE public.properties
SET status = 'sold'
WHERE lower(trim(coalesce(status,''))) IN ('vendido','vendida');

-- Fallback: cualquier valor desconocido -> 'available'
UPDATE public.properties
SET status = 'available'
WHERE lower(trim(coalesce(status,''))) NOT IN ('available','rented','sold','reserved','maintenance','pending');

COMMIT;

-- Verificación
SELECT status, count(*) FROM public.properties GROUP BY status ORDER BY count DESC;
