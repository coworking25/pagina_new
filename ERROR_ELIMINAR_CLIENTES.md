# ❌ ERROR: No se Pueden Eliminar Clientes

## 🔴 Problema

Al intentar eliminar un cliente, aparece un error:

```
ERROR: update or delete on table "clients" violates foreign key constraint
DETAIL: Key (id) is still referenced from table "client_portal_credentials"
```

**Causa:** Las tablas relacionadas tienen **foreign keys sin CASCADE**, lo que impide eliminar el cliente si tiene datos relacionados.

---

## 🔍 Diagnóstico

### Tablas con Foreign Keys a `clients`:

| Tabla | Constraint | Comportamiento Actual |
|-------|------------|----------------------|
| `client_portal_credentials` | `client_id` | ❌ RESTRICT (bloquea eliminación) |
| `client_documents` | `client_id` | ❌ RESTRICT |
| `client_payment_config` | `client_id` | ❌ RESTRICT |
| `client_references` | `client_id` | ❌ RESTRICT |
| `client_contract_info` | `client_id` | ❌ RESTRICT |
| `client_property_relations` | `client_id` | ❌ RESTRICT |
| `client_communications` | `client_id` | ❌ RESTRICT |
| `client_alerts` | `client_id` | ❌ RESTRICT |
| `contracts` | `client_id` | ❌ RESTRICT |
| `payments` | `client_id` | ❌ RESTRICT |

**Resultado:** No puedes eliminar ningún cliente que tenga datos relacionados (99% de los casos).

---

## ✅ Solución

### Opción 1: ON DELETE CASCADE (Recomendado ⭐)

**Qué hace:**
- Cuando eliminas un cliente, **automáticamente elimina** todos sus datos relacionados
- Mantiene la integridad referencial
- No deja registros huérfanos

**Script SQL:**
```sql
-- Ejecutar: FIX_DELETE_CASCADE_CLIENTS.sql
```

**Resultado:**
```sql
DELETE FROM clients WHERE id = 'xxx';
-- ✅ DELETE 1
-- ✅ También eliminó:
--    - Credenciales del portal
--    - Documentos
--    - Referencias
--    - Contratos
--    - Pagos
--    - Relaciones con propiedades
--    - Todo lo relacionado
```

### Opción 2: Soft Delete (Alternativa)

**Qué hace:**
- En lugar de eliminar, marca el registro como "eliminado"
- Los datos permanecen en la base de datos
- Puedes recuperarlos si es necesario

**Requiere:**
1. Agregar campo `deleted_at` a tabla `clients`
2. Modificar el código para usar UPDATE en lugar de DELETE
3. Filtrar clientes eliminados en las consultas

**No recomendado en este caso** porque:
- Requiere cambios en el código
- Complica las consultas
- Ocupa más espacio en DB

---

## 🚀 Pasos para Resolver

### 1. Ejecutar Script SQL en Supabase

1. Abrir Supabase SQL Editor
2. Copiar contenido de `FIX_DELETE_CASCADE_CLIENTS.sql`
3. Ejecutar el script completo
4. Verificar que no hay errores

### 2. Verificar Cambios

Ejecutar esta query de verificación:

```sql
SELECT 
  tc.table_name,
  tc.constraint_name,
  rc.delete_rule,
  CASE 
    WHEN rc.delete_rule = 'CASCADE' THEN '✅ CASCADE OK'
    ELSE '❌ NO CASCADE'
  END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'clients'
ORDER BY tc.table_name;
```

**Resultado esperado:** Todas las filas deben mostrar `✅ CASCADE OK`

### 3. Probar Eliminación

En la aplicación:
1. Ir a Admin → Clientes
2. Seleccionar un cliente de prueba
3. Clic en botón "Eliminar" (🗑️)
4. Confirmar eliminación
5. ✅ Cliente debería eliminarse sin errores

---

## ⚠️ ADVERTENCIAS IMPORTANTES

### Eliminación Permanente

```
⚠️ LA ELIMINACIÓN ES PERMANENTE E IRREVERSIBLE
```

Cuando eliminas un cliente con CASCADE, se eliminan **TODOS** sus datos:
- ✅ Credenciales del portal
- ✅ Documentos subidos
- ✅ Configuración de pagos
- ✅ Referencias personales y comerciales
- ✅ Información de contratos
- ✅ Relaciones con propiedades
- ✅ Historial de comunicaciones
- ✅ Alertas
- ✅ Contratos
- ✅ Pagos

**NO HAY FORMA DE RECUPERAR ESTOS DATOS**

### Recomendaciones

1. **Hacer backup** antes de aplicar el script
2. **Probar primero** con un cliente de prueba
3. **Advertir a los usuarios** sobre la eliminación permanente
4. **Considerar agregar confirmación doble** en la UI
5. **Registrar en logs** qué se eliminó y cuándo

---

## 🎯 Implementación en el Código

El código actual **ya está correcto**:

```typescript
const handleDeleteClient = async (client: Client) => {
  if (window.confirm(`¿Estás seguro de que quieres eliminar al cliente ${client.full_name}?`)) {
    try {
      await deleteClient(client.id);
      setClients(clients.filter(c => c.id !== client.id));
      alert('Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      alert('Error al eliminar el cliente');
    }
  }
};
```

**Después del fix SQL:** Este código funcionará perfectamente.

---

## 📋 Mejoras Opcionales a la UI

### 1. Confirmación Doble

```typescript
const handleDeleteClient = async (client: Client) => {
  const confirm1 = window.confirm(
    `¿Estás seguro de que quieres eliminar al cliente ${client.full_name}?`
  );
  
  if (confirm1) {
    const confirm2 = window.confirm(
      `⚠️ ADVERTENCIA: Se eliminarán TODOS los datos relacionados:\n` +
      `- Documentos\n- Pagos\n- Contratos\n- Referencias\n\n` +
      `Esta acción NO se puede deshacer.\n\n` +
      `¿Confirmas la eliminación?`
    );
    
    if (confirm2) {
      try {
        await deleteClient(client.id);
        setClients(clients.filter(c => c.id !== client.id));
        alert('✅ Cliente y todos sus datos eliminados correctamente');
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        alert('❌ Error al eliminar el cliente');
      }
    }
  }
};
```

### 2. Modal de Confirmación Personalizado

En lugar de `window.confirm`, usar un modal con:
- ✅ Lista de lo que se va a eliminar
- ✅ Checkbox "Entiendo que esto es permanente"
- ✅ Campo de texto para escribir el nombre del cliente
- ✅ Conteo regresivo (3, 2, 1) antes de permitir eliminar

### 3. Registro de Eliminaciones

```typescript
const handleDeleteClient = async (client: Client) => {
  if (window.confirm(`¿Eliminar ${client.full_name}?`)) {
    try {
      // 1. Registrar en logs antes de eliminar
      await supabase.from('deletion_logs').insert({
        entity_type: 'client',
        entity_id: client.id,
        entity_name: client.full_name,
        deleted_by: auth.uid(),
        deleted_at: new Date().toISOString(),
        related_data: {
          documents: client.documents?.length || 0,
          contracts: client.contracts?.length || 0,
          payments: client.payments?.length || 0
        }
      });
      
      // 2. Eliminar cliente
      await deleteClient(client.id);
      
      // 3. Actualizar UI
      setClients(clients.filter(c => c.id !== client.id));
      alert('✅ Cliente eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar');
    }
  }
};
```

---

## 📊 Resumen

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Eliminación** | ❌ Bloqueada por FK | ✅ Funciona |
| **Datos relacionados** | ⚠️ Quedan huérfanos | ✅ Se eliminan en cascade |
| **Integridad** | ⚠️ Puede romperse | ✅ Se mantiene |
| **Cambios en código** | - | ✅ No requiere |
| **Reversible** | - | ❌ NO (permanente) |

---

## ✅ Checklist

- [ ] 1. Hacer backup de la base de datos
- [ ] 2. Abrir Supabase SQL Editor
- [ ] 3. Ejecutar `FIX_DELETE_CASCADE_CLIENTS.sql`
- [ ] 4. Verificar que todas las FK tienen CASCADE
- [ ] 5. Probar eliminar un cliente de prueba
- [ ] 6. Verificar que se eliminan todos los datos relacionados
- [ ] 7. Probar en la aplicación
- [ ] 8. (Opcional) Implementar confirmación doble
- [ ] 9. (Opcional) Agregar registro de eliminaciones
- [ ] 10. Documentar a los usuarios sobre eliminación permanente

---

**Fecha:** 16 de Octubre, 2025  
**Problema:** Error al eliminar clientes (FK constraint violation)  
**Solución:** ON DELETE CASCADE en todas las foreign keys  
**Script:** FIX_DELETE_CASCADE_CLIENTS.sql  
**Estado:** ⚠️ Pendiente de aplicar en Supabase
