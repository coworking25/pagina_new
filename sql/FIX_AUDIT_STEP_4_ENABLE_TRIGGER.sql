-- =====================================================
-- FIX AUDIT LOG - PASO 4: RE-HABILITAR TRIGGER
-- =====================================================
-- Ejecuta este paso después del Paso 3

-- Re-habilitar el trigger
ALTER TABLE clients ENABLE TRIGGER client_audit_trigger;

SELECT '✅ Paso 4 completado: Trigger re-habilitado' as status;
