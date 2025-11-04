-- Script para verificar todas las propiedades en la base de datos
-- Ejecutar en Supabase SQL Editor

-- Ver todas las propiedades
SELECT
    id,
    code,
    title,
    status,
    deleted_at,
    created_at
FROM properties
ORDER BY created_at DESC;

-- Contar propiedades activas vs eliminadas
SELECT
    COUNT(*) as total_properties,
    COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_properties,
    COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as deleted_properties
FROM properties;

-- Ver las primeras 5 propiedades activas
SELECT
    id,
    code,
    title,
    status,
    deleted_at,
    created_at
FROM properties
WHERE deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 5;

-- Ver las primeras 5 propiedades eliminadas
SELECT
    id,
    code,
    title,
    status,
    deleted_at,
    created_at
FROM properties
WHERE deleted_at IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;