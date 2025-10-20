# 🔧 SOLUCIÓN RÁPIDA - Error en Script 03

## ❌ Error Encontrado:
```
ERROR: 42703: column "role" does not exist
```

## ✅ Solución Aplicada:

He corregido el archivo `sql/03_row_level_security.sql`

**Cambio realizado:**
- ❌ ANTES: Verificaba `role = 'admin'` en tabla advisors
- ✅ AHORA: Solo verifica que el usuario existe en tabla advisors

## 🚀 Cómo Proceder:

### Opción 1: Re-ejecutar Script Completo (RECOMENDADO)
```
1. Abre el archivo corregido: sql/03_row_level_security.sql
2. Copia TODO el contenido
3. Pega en Supabase SQL Editor
4. Click en "Run" (▶️)
```

### Opción 2: Ejecutar Solo la Corrección
Si ya ejecutaste parte del script, ejecuta esto en SQL Editor:

```sql
-- ELIMINAR POLÍTICA PROBLEMÁTICA
DROP POLICY IF EXISTS "Admins have full access to clients" ON clients;

-- RECREAR SIN VERIFICAR 'role'
CREATE POLICY "Admins have full access to clients" ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM advisors 
      WHERE id = auth.uid()
    )
  );
```

## 📋 Verificación:

Después de ejecutar, verifica que funcionó:

```sql
-- Ver políticas creadas
SELECT policyname, tablename 
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename = 'clients'
ORDER BY policyname;

-- Debe mostrar:
-- "Admins have full access to clients"
-- "Clients can view own profile"
-- "Clients can update own profile"
```

## ✅ Siguiente Paso:

Una vez corregido este error:
1. ✅ Continúa con el Script 04: `04_extract_functions.sql`
2. ✅ Continúa con el Script 05: `05_storage_buckets.sql`

---

**Estado:** Script 03 CORREGIDO ✅
**Listo para re-ejecutar**
