# 🔧 FIX: Error de Conversión Numérica en Wizard

## 🐛 Problema Detectado

**Error:** `invalid input syntax for type numeric: ""`

**Causa:** El wizard estaba enviando cadenas vacías `""` para campos numéricos, y PostgreSQL no puede convertir una cadena vacía a tipo `numeric`.

### Campos Afectados

Los siguientes campos numéricos podían recibir cadenas vacías:
- ❌ `monthly_income` (clients table)
- ❌ `billing_day` (client_payment_config table)
- ❌ `deposit_amount` (client_contract_info table)
- ❌ `duration_months` (client_contract_info table)
- ❌ `payment_concepts.*.amount` (client_payment_config table)

---

## ✅ Solución Implementada

### 1. Función Helper: `sanitizeNumericValue`

```typescript
const sanitizeNumericValue = (value: any): number | undefined => {
  if (value === null || value === undefined || value === '') {
    return undefined;  // ✅ Convierte "" a undefined
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};
```

**Comportamiento:**
- `""` → `undefined` ✅
- `null` → `undefined` ✅
- `undefined` → `undefined` ✅
- `"123"` → `123` ✅
- `"abc"` → `undefined` ✅
- `123` → `123` ✅

### 2. Función Helper: `sanitizePaymentConcepts`

```typescript
const sanitizePaymentConcepts = (concepts: any) => {
  if (!concepts) return undefined;
  
  const sanitized: any = {};
  
  // Sanitiza cada concepto de pago (arriendo, administracion, etc.)
  if (concepts.arriendo) {
    sanitized.arriendo = {
      enabled: concepts.arriendo.enabled,
      amount: sanitizeNumericValue(concepts.arriendo.amount) || 0
    };
  }
  
  // ... similar para otros conceptos
  
  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
};
```

**Comportamiento:**
- Convierte todos los `amount` a números válidos
- Si no hay conceptos, retorna `undefined`
- Garantiza que `amount` nunca sea una cadena vacía

---

## 📝 Cambios en handleWizardSubmit

### Antes (❌ Causaba Error)

```typescript
const clientData: ClientFormData = {
  full_name: wizardData.full_name,
  // ...
  monthly_income: wizardData.monthly_income,  // ❌ Podía ser ""
  // ...
};
```

### Después (✅ Correcto)

```typescript
const clientData: ClientFormData = {
  full_name: wizardData.full_name,
  // ...
  monthly_income: sanitizeNumericValue(wizardData.monthly_income),  // ✅ "" → undefined
  // ...
};
```

### Otros Campos Corregidos

```typescript
// Payment Config
await savePaymentConfig(newClient.id, {
  preferred_payment_method: wizardData.preferred_payment_method,
  billing_day: sanitizeNumericValue(wizardData.billing_day) || 1,  // ✅
  payment_concepts: sanitizePaymentConcepts(wizardData.payment_concepts)  // ✅
});

// Contract Info
await saveContractInfo(newClient.id, {
  // ...
  duration_months: sanitizeNumericValue(wizardData.contract_duration_months),  // ✅
  deposit_amount: sanitizeNumericValue(wizardData.deposit_amount),  // ✅
  // ...
});
```

---

## 🧪 Casos de Prueba

### Caso 1: Campo Vacío

**Input del Wizard:**
```json
{
  "full_name": "Juan Pérez",
  "monthly_income": ""  // Campo vacío
}
```

**Antes:** ❌ Error `invalid input syntax for type numeric: ""`

**Ahora:** ✅ Se guarda como `null` en la BD

**SQL Resultante:**
```sql
INSERT INTO clients (full_name, monthly_income) 
VALUES ('Juan Pérez', NULL);  -- ✅ Válido
```

### Caso 2: Valor Numérico Válido

**Input del Wizard:**
```json
{
  "monthly_income": "3000000"
}
```

**Resultado:** ✅ Se convierte a `3000000` (número)

### Caso 3: Payment Concepts con Cadenas Vacías

**Input del Wizard:**
```json
{
  "payment_concepts": {
    "arriendo": {
      "enabled": true,
      "amount": ""  // ❌ Cadena vacía
    }
  }
}
```

**Antes:** ❌ Error en BD

**Ahora:** ✅ Se convierte a:
```json
{
  "arriendo": {
    "enabled": true,
    "amount": 0  // ✅ Default 0 en lugar de ""
  }
}
```

---

## 📊 Resumen de Cambios

| Archivo | Líneas Añadidas | Cambios |
|---------|-----------------|---------|
| `AdminClients.tsx` | +47 líneas | 2 helpers + 4 usos |

### Funciones Añadidas

1. ✅ `sanitizeNumericValue` - Convierte strings a números o undefined
2. ✅ `sanitizePaymentConcepts` - Sanitiza todos los montos de conceptos de pago

### Llamadas Actualizadas

1. ✅ `clientData.monthly_income` - Usa `sanitizeNumericValue`
2. ✅ `savePaymentConfig.billing_day` - Usa `sanitizeNumericValue`
3. ✅ `savePaymentConfig.payment_concepts` - Usa `sanitizePaymentConcepts`
4. ✅ `saveContractInfo.duration_months` - Usa `sanitizeNumericValue`
5. ✅ `saveContractInfo.deposit_amount` - Usa `sanitizeNumericValue`

---

## ✅ Estado Actual

- ✅ **0 errores de compilación**
- ✅ **Todos los campos numéricos sanitizados**
- ✅ **Manejo correcto de cadenas vacías**
- ✅ **Conversión segura a números**
- ✅ **Valores por defecto apropiados**

---

## 🚀 Prueba Recomendada

1. Abre el wizard de cliente
2. **Deja campos numéricos vacíos** (no ingreses nada)
3. Completa solo los campos obligatorios
4. Envía el formulario
5. ✅ **Verificar:** El cliente se crea sin errores
6. ✅ **Verificar:** Los campos vacíos se guardan como `null` en BD
7. ✅ **Verificar:** Los campos con valores se convierten correctamente

### Campos a Probar Vacíos

- [ ] Ingreso mensual (monthly_income)
- [ ] Día de facturación (billing_day)
- [ ] Monto de depósito (deposit_amount)
- [ ] Duración del contrato (duration_months)
- [ ] Montos de conceptos de pago (payment_concepts.*.amount)

---

## 📋 Checklist

- [x] Función `sanitizeNumericValue` creada
- [x] Función `sanitizePaymentConcepts` creada
- [x] Campo `monthly_income` sanitizado
- [x] Campo `billing_day` sanitizado
- [x] Campo `deposit_amount` sanitizado
- [x] Campo `duration_months` sanitizado
- [x] Objeto `payment_concepts` sanitizado
- [x] Verificación de 0 errores de compilación
- [ ] Prueba funcional en navegador

---

## 🎯 Resultado Esperado

Ahora el wizard puede:
- ✅ Aceptar campos numéricos vacíos sin error
- ✅ Convertir strings a números automáticamente
- ✅ Manejar valores `null`, `undefined` y `""` correctamente
- ✅ Guardar valores por defecto cuando sea necesario
- ✅ Crear clientes sin errores de tipo de datos

**Estado:** ✅ **FIX COMPLETADO Y LISTO PARA PRUEBAS**

---

**Fecha:** 16 de Octubre, 2025  
**Tipo de Fix:** Conversión de tipos y validación de datos  
**Impacto:** Alto - Resuelve error crítico en creación de clientes
