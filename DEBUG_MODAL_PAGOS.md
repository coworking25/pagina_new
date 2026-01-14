# 🔍 DEBUGGING: Modal de Registro de Pagos

## ✅ Base de Datos Verificada

Según `pg_stat_statements`, la función PostgreSQL **está funcionando correctamente**:
- ✅ Función `register_tenant_payment` existe
- ✅ Permisos correctos (authenticated)
- ✅ 4 ejecuciones exitosas registradas
- ✅ Tiempo promedio de ejecución: 1.11ms

**El problema está en el frontend, no en la base de datos.**

---

## 🧪 Pasos para Diagnosticar el Problema

### 1. Abrir la Consola del Navegador

1. Presiona **F12** para abrir las herramientas de desarrollo
2. Ve a la pestaña **Console**
3. Deja la consola abierta

### 2. Abrir el Modal de Pagos

1. Ve a **Admin** → **Clientes**
2. Haz clic en cualquier cliente con contrato activo
3. En el modal del cliente, haz clic en **"Registrar Pago"**

### 3. Observar Errores en la Consola

Busca en la consola:

❌ **Errores comunes:**
```
- "contract is undefined"
- "contract.monthly_rent is undefined"
- "Cannot read property 'id' of undefined"
- "Failed to call register_tenant_payment"
- "permission denied for function"
- "RLS policy violation"
```

### 4. Verificar el Estado del Formulario

Con el modal abierto, ejecuta en la consola:

```javascript
// Ver el contrato que se pasó al modal
console.log('Contract:', window.__CONTRACT_DEBUG__);

// Verificar que Supabase esté configurado
console.log('Supabase client:', window.supabase);
```

### 5. Intentar Registrar un Pago

1. Deja todos los campos con sus valores por defecto
2. Observa si el desglose se calcula (panel derecho)
3. Verifica que el botón "Registrar Pago" esté habilitado
4. Haz clic en "Registrar Pago"
5. **Observa la consola:**
   - Deberías ver: `📤 Enviando datos de pago: {...}`
   - Luego: `✅ Pago registrado exitosamente: {...}`
   - O: `❌ Error de base de datos: ...`

---

## 🐛 Problemas Frecuentes y Soluciones

### Problema 1: "Contract is undefined" o "Cannot read property 'id' of undefined"

**Causa:** El contrato no se está pasando correctamente al modal.

**Solución:** Verificar en AdminClients.tsx que el contrato se construya correctamente:

```typescript
// En la línea ~2398 de AdminClients.tsx
const contract: Contract = {
  id: contractInfo.id || '',  // ← Verificar que contractInfo.id exista
  client_id: selectedClient?.id || '',
  // ...
};
```

**Prueba rápida:** Agregar console.log antes de abrir el modal:
```typescript
console.log('📋 ContractInfo:', contractInfo);
console.log('🎯 Contract construido:', contract);
```

### Problema 2: "Permission denied for function register_tenant_payment"

**Causa:** El usuario no está autenticado o los permisos RLS no permiten la operación.

**Solución:** Verificar en Supabase SQL Editor:

```sql
-- Verificar permisos
SELECT 
    routine_name,
    routine_schema,
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'register_tenant_payment';

-- Debería mostrar:
-- | register_tenant_payment | public | authenticated | EXECUTE |
```

### Problema 3: El breakdown no se calcula (panel derecho vacío)

**Causa:** Error en la función `calculatePaymentBreakdown` de JavaScript.

**Solución:** Verificar en la consola si hay errores de cálculo:

```javascript
// El modal debería mostrar este error
"Error calculando breakdown: [error details]"
```

**Revisar:** src/lib/paymentCalculations.ts

### Problema 4: El botón "Registrar Pago" está deshabilitado

**Causas posibles:**
- `breakdown` es null (no se calculó)
- `formData.gross_amount` es 0 o negativo
- `loading` es true

**Verificar en consola:**
```javascript
// Ver estado del formulario
console.log('Breakdown:', breakdown);
console.log('Gross amount:', formData.gross_amount);
console.log('Loading:', loading);
```

### Problema 5: Error "Failed to call RPC function"

**Causa:** Problema de conexión con Supabase o función no disponible.

**Verificar:**
```javascript
// En la consola del navegador
await supabase.rpc('register_tenant_payment', {
  p_contract_id: 'UUID-DE-PRUEBA',
  p_gross_amount: 1500000,
  p_payment_date: '2026-01-14',
  p_payment_method: 'bank_transfer',
  p_transaction_reference: null,
  p_period_start: '2026-01-01',
  p_period_end: '2026-01-31'
});
```

---

## 📸 Capturas Recomendadas

Si el problema persiste, captura:

1. **Consola completa** (F12 → Console) mostrando todos los logs y errores
2. **Pestaña Network** (F12 → Network) filtrando por "register_tenant_payment"
3. **Estado del modal** cuando el botón está deshabilitado
4. **Panel de desglose** (lado derecho del modal)

---

## 🔧 Código de Debugging Temporal

Si necesitas más información, agrega esto temporalmente al modal:

```typescript
// En RegisterPaymentModal.tsx, después de la línea 30
useEffect(() => {
  console.log('🔍 DEBUG Modal Pagos:', {
    isOpen,
    contract: {
      id: contract?.id,
      monthly_rent: contract?.monthly_rent,
      admin_paid_by: contract?.admin_paid_by
    },
    formData,
    breakdown,
    loading,
    error
  });
}, [isOpen, contract, formData, breakdown, loading, error]);
```

Esto mostrará el estado completo del modal cada vez que algo cambie.

---

## ✅ Checklist de Verificación

- [ ] La consola del navegador está abierta
- [ ] El modal de pagos se abre correctamente
- [ ] Se ve el desglose en el panel derecho
- [ ] El botón "Registrar Pago" está habilitado
- [ ] Al hacer clic, se ve "📤 Enviando datos de pago" en consola
- [ ] Se ve "✅ Pago registrado exitosamente" o un error específico
- [ ] El modal se cierra después de 1.5 segundos

Si alguno falla, **copia el mensaje de error exacto de la consola** y continuamos desde ahí.

---

## 🆘 Si Nada Funciona

Ejecuta este test directo en la consola del navegador:

```javascript
// Test directo de la función
const { data, error } = await supabase.rpc('register_tenant_payment', {
  p_contract_id: 'PEGAR-UUID-DE-CONTRATO-REAL-AQUI',
  p_gross_amount: 1500000.00,
  p_payment_date: '2026-01-14',
  p_payment_method: 'bank_transfer',
  p_transaction_reference: 'TEST-001',
  p_period_start: '2026-01-01',
  p_period_end: '2026-01-31'
});

console.log('Data:', data);
console.log('Error:', error);
```

Esto confirmará si el problema es de conexión, permisos o datos.
