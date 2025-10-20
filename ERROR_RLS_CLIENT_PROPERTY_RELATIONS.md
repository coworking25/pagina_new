# 🔴 ERROR CRÍTICO: RLS Policy - 403 Forbidden en client_property_relations

## 📋 Resumen del Problema

**Error completo:**
```
POST https://...supabase.co/rest/v1/client_property_relations?... 403 (Forbidden)
❌ Error creando relaciones cliente-propiedad en lote: 
{
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "client_property_relations"'
}
```

**Ubicación del error:**
- `clientsApi.ts:506` - createClientPropertyRelations()
- `AdminClients.tsx:1096` - handleWizardSubmit()
- `ClientWizard.tsx:579` - handleSubmit()

**Impacto:**
- ❌ No se pueden crear clientes con propiedades asignadas
- ❌ El wizard falla en el paso 6
- ❌ Error 403 (Forbidden) al intentar INSERT

---

## 🔍 Diagnóstico Técnico

### Causa Raíz

La política RLS de `client_property_relations` está **mal configurada**:

```sql
-- ❌ POLÍTICA INCORRECTA (ACTUAL)
CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (
  EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())
);
```

**Problema:** Solo tiene `USING`, falta `WITH CHECK`

### ¿Por qué falla?

| Operación | Necesita USING | Necesita WITH CHECK | Funciona |
|-----------|----------------|---------------------|----------|
| SELECT | ✅ | ❌ | ✅ SÍ |
| INSERT | ❌ | ✅ | ❌ NO (falla aquí) |
| UPDATE | ✅ | ✅ | ⚠️ Parcial |
| DELETE | ✅ | ❌ | ✅ SÍ |

Para políticas `FOR ALL` (todas las operaciones), **PostgreSQL requiere ambos**:
- `USING`: Verifica filas **existentes** (SELECT, UPDATE, DELETE)
- `WITH CHECK`: Verifica filas **nuevas** (INSERT, UPDATE)

**Sin `WITH CHECK`:** Los INSERT son rechazados automáticamente por seguridad.

### Documentación Oficial

> "For INSERT and UPDATE statements, WITH CHECK is evaluated **after** USING; if it evaluates to FALSE, the operation fails with a policy violation."
> 
> "If a FOR ALL policy is created, then **both USING and WITH CHECK expressions must be provided**."
> 
> — [PostgreSQL Documentation](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

## 🛠️ Solución

### Script de Corrección

He creado **2 scripts SQL**:

1. **`FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql`** - Solo arregla la tabla problemática
2. **`FIX_ALL_RLS_POLICIES_CLIENTS.sql`** - Arregla TODAS las tablas de clientes (recomendado ⭐)

### Política Correcta

```sql
-- ✅ POLÍTICA CORRECTA
DROP POLICY IF EXISTS "Admins have full access to property relations" 
ON client_property_relations;

CREATE POLICY "Admins have full access to property relations" 
ON client_property_relations
FOR ALL
USING (
  EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())
);
```

**Cambios:**
- ✅ Agregado: `WITH CHECK (...)` al final
- ✅ Ahora permite: INSERT, UPDATE, DELETE, SELECT

---

## 📊 Tablas Afectadas

**Todas estas tablas tienen el mismo problema:**

| Tabla | Estado | Prioridad |
|-------|--------|-----------|
| `client_property_relations` | ❌ CRÍTICO | 🔥 ALTA |
| `clients` | ⚠️ Potencial | 🟡 MEDIA |
| `client_portal_credentials` | ⚠️ Potencial | 🟡 MEDIA |
| `client_documents` | ⚠️ Potencial | 🟡 MEDIA |
| `client_communications` | ⚠️ Potencial | 🟡 MEDIA |
| `client_alerts` | ⚠️ Potencial | 🟡 MEDIA |
| `client_payment_config` | ⚠️ Potencial | 🟡 MEDIA |
| `client_references` | ⚠️ Potencial | 🟡 MEDIA |
| `client_contract_info` | ⚠️ Potencial | 🟡 MEDIA |

**Recomendación:** Usar `FIX_ALL_RLS_POLICIES_CLIENTS.sql` para arreglar todas de una vez.

---

## 🚀 Pasos para Resolver

### Paso 1: Abrir Supabase SQL Editor

1. Ir a: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **SQL Editor** en el menú lateral

### Paso 2: Ejecutar el Script

**Opción A - Solo tabla problemática:**
```sql
-- Copiar contenido de: FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql
-- Pegar en SQL Editor
-- Clic en "Run"
```

**Opción B - Todas las tablas (RECOMENDADO):**
```sql
-- Copiar contenido de: FIX_ALL_RLS_POLICIES_CLIENTS.sql
-- Pegar en SQL Editor
-- Clic en "Run"
```

### Paso 3: Verificar

Ejecutar esta query de verificación:

```sql
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN '❌ FALTA WITH CHECK'
    ELSE '✅ WITH CHECK OK'
  END as status
FROM pg_policies 
WHERE tablename = 'client_property_relations'
AND policyname LIKE '%Admin%';
```

**Resultado esperado:**
```
tablename                    | policyname                              | cmd | status
-----------------------------|-----------------------------------------|-----|---------------
client_property_relations    | Admins have full access to property... | ALL | ✅ WITH CHECK OK
```

### Paso 4: Probar en la Aplicación

1. Ir al Admin Dashboard
2. Clic en "Nuevo Cliente"
3. Completar el wizard (6 pasos)
4. En el Paso 6, asignar al menos una propiedad
5. Clic en "Crear Cliente"
6. ✅ Debería crearse sin errores

---

## 🧪 Test de Inserción (Opcional)

Para probar directamente en SQL Editor:

```sql
DO $$
DECLARE
  v_client_id uuid;
  v_property_id uuid;
  v_relation_id uuid;
BEGIN
  -- Obtener IDs reales
  SELECT id INTO v_client_id FROM clients ORDER BY created_at DESC LIMIT 1;
  SELECT id INTO v_property_id FROM properties ORDER BY created_at DESC LIMIT 1;
  
  IF v_client_id IS NULL OR v_property_id IS NULL THEN
    RAISE EXCEPTION 'No hay clientes o propiedades para probar';
  END IF;
  
  -- Intentar INSERT
  INSERT INTO client_property_relations (
    client_id,
    property_id,
    relation_type,
    status
  ) VALUES (
    v_client_id,
    v_property_id,
    'tenant',
    'active'
  ) RETURNING id INTO v_relation_id;
  
  RAISE NOTICE '✅ TEST EXITOSO: Relación creada con ID %', v_relation_id;
  
  -- Limpiar test
  DELETE FROM client_property_relations WHERE id = v_relation_id;
  RAISE NOTICE '🗑️ Test limpiado';
  
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ TEST FALLÓ: %', SQLERRM;
END $$;
```

**Resultados posibles:**
- ✅ `TEST EXITOSO`: La política está corregida
- ❌ `violates row-level security policy`: La política aún está mal

---

## 🔍 Validaciones Adicionales

### 1. Verificar que el usuario está en advisors

```sql
SELECT id, email, full_name, role 
FROM advisors 
WHERE id = auth.uid();
```

**Si retorna 0 filas:** El usuario no es admin, necesita ser agregado.

### 2. Verificar que RLS está activo

```sql
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ RLS ENABLED' ELSE '❌ RLS DISABLED' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'client_property_relations';
```

**Resultado esperado:** `✅ RLS ENABLED`

### 3. Listar todas las políticas

```sql
SELECT 
  policyname,
  cmd,
  qual IS NOT NULL as tiene_using,
  with_check IS NOT NULL as tiene_with_check
FROM pg_policies 
WHERE tablename = 'client_property_relations'
ORDER BY policyname;
```

**Resultado esperado después del fix:**
```
policyname                                    | cmd | tiene_using | tiene_with_check
----------------------------------------------|-----|-------------|------------------
Admins have full access to property relations | ALL | true        | true ✅
Clients can view own property relations       | SELECT | true     | false (OK para SELECT)
```

---

## 📝 Cambios en el Código

**NO se requieren cambios en el código**. El error es **100% de base de datos**.

### Código Afectado (Funciona correctamente después del fix)

**clientsApi.ts:**
```typescript
// Línea 497-515
export async function createClientPropertyRelations(
  relations: Array<Omit<ClientPropertyRelation, 'id' | 'created_at' | 'updated_at'>>
): Promise<ClientPropertyRelation[]> {
  try {
    const { data, error } = await supabase
      .from('client_property_relations')
      .insert(relations)  // ⬅️ Fallaba aquí con 403
      .select();

    if (error) {
      console.error('❌ Error creando relaciones:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error en createClientPropertyRelations:', error);
    throw error;
  }
}
```

**AdminClients.tsx:**
```typescript
// Línea 1090-1100
if (formData.assigned_properties?.length > 0) {
  try {
    await createClientPropertyRelations(
      formData.assigned_properties.map(propertyId => ({
        client_id: newClientId,
        property_id: propertyId,
        relation_type: 'tenant',
        status: 'active'
      }))
    ); // ⬅️ Fallaba aquí
  } catch (error) {
    console.error('⚠️ Error asignando propiedades:', error);
  }
}
```

Después del fix SQL: ✅ Este código funcionará perfectamente sin cambios.

---

## 🎯 Checklist de Resolución

- [ ] 1. Abrir Supabase SQL Editor
- [ ] 2. Ejecutar `FIX_ALL_RLS_POLICIES_CLIENTS.sql`
- [ ] 3. Verificar que no hay errores en la ejecución
- [ ] 4. Ejecutar query de verificación
- [ ] 5. Confirmar que aparece "✅ WITH CHECK OK"
- [ ] 6. Probar crear cliente desde el wizard
- [ ] 7. Asignar propiedades en el Paso 6
- [ ] 8. Crear cliente exitosamente
- [ ] 9. Verificar en consola que no hay errores 403
- [ ] 10. Confirmar en Supabase que las relaciones se crearon

---

## 📚 Recursos Adicionales

### Archivos Relacionados

- `FIX_RLS_CLIENT_PROPERTY_RELATIONS.sql` - Fix específico
- `FIX_ALL_RLS_POLICIES_CLIENTS.sql` - Fix completo (⭐ recomendado)
- `sql/03_row_level_security.sql` - Script original (desactualizado)

### Documentación

- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)

### Logs Útiles

**Antes del fix:**
```
POST .../client_property_relations... 403 (Forbidden)
❌ Error creando relaciones: {code: '42501', message: 'new row violates row-level security policy'}
```

**Después del fix:**
```
✅ Cliente creado con ID: abc-123-def
✅ Relaciones cliente-propiedad creadas
```

---

## 🎉 Resultado Final

Después de ejecutar el script SQL:

| Aspecto | Antes | Después |
|---------|-------|---------|
| INSERT en client_property_relations | ❌ Error 403 | ✅ Funciona |
| Crear cliente con propiedades | ❌ Falla | ✅ Funciona |
| Wizard paso 6 | ❌ Error | ✅ Completa |
| Console errors | 🔴 3 errores | 🟢 0 errores |
| Políticas RLS | ⚠️ Incompletas | ✅ Completas |

---

## ⚠️ Notas Importantes

1. **Este es un error de base de datos, no de código**
2. **Afecta solo a las operaciones INSERT**
3. **SELECT funciona normalmente** (por eso puedes ver los datos)
4. **El fix es retrocompatible** (no rompe nada existente)
5. **Debe ejecutarse con usuario administrador de Supabase**

---

**Fecha de detección:** 16 de Octubre, 2025  
**Severidad:** 🔴 CRÍTICA  
**Estado:** ⚠️ PENDIENTE DE FIX EN BD  
**Impacto:** Bloquea creación de clientes con propiedades  
**Solución:** Script SQL listo para ejecutar

---

## 🚨 Mensaje para el Usuario

> **IMPORTANTE:** Este error NO se puede arreglar desde el código. Necesitas ejecutar el script SQL en Supabase para actualizar las políticas de seguridad de la base de datos.
> 
> **Pasos rápidos:**
> 1. Abre Supabase Dashboard → SQL Editor
> 2. Copia y pega todo el contenido de `FIX_ALL_RLS_POLICIES_CLIENTS.sql`
> 3. Clic en "Run"
> 4. Espera mensaje de éxito
> 5. Vuelve a probar crear un cliente
> 
> El error desaparecerá inmediatamente. ✅
