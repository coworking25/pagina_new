-- =====================================================
-- FIX AUDIT LOG - PASO 1: DESHABILITAR TRIGGER
-- =====================================================
-- Ejecuta SOLO este paso primero

-- 1. Deshabilitar el trigger temporalmente
ALTER TABLE clients DISABLE TRIGGER client_audit_trigger;

SELECT '✅ Paso 1 completado: Trigger deshabilitado' as status;
