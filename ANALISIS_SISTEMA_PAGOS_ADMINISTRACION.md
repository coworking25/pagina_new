# 💰 ANÁLISIS COMPLETO: SISTEMA DE GESTIÓN DE PAGOS Y ADMINISTRACIÓN

## 📋 CONTEXTO DEL NEGOCIO

### **Flujo de Pagos Actual**
```
INQUILINO → AGENCIA (nosotros) → PROPIETARIO
   💵          💼                    🏠
```

**¿Cómo funciona?**
1. El **inquilino** paga el arriendo completo a la **agencia**
2. La **agencia** recibe el pago y administra el dinero
3. La **agencia** paga al **propietario** (descontando comisión si aplica)

---

## 🔍 ANÁLISIS DE SITUACIÓN ACTUAL

### ✅ **Lo que YA tenemos implementado:**

#### 1. **En la tabla `contracts`:**
```sql
CREATE TABLE contracts (
    ...
    monthly_rent DECIMAL(15,2),
    deposit_amount DECIMAL(15,2),
    administration_fee DECIMAL(15,2),  -- ✅ YA EXISTE
    ...
);
```

#### 2. **En la tabla `payments`:**
```sql
CREATE TABLE payments (
    ...
    payment_type VARCHAR(20) CHECK (payment_type IN ('rent', 'deposit', 'administration', 'utilities', 'late_fee', 'other')),
    amount DECIMAL(15,2),
    ...
);
```

#### 3. **En ClientWizard y formularios:**
- ✅ Campo `administracion` con checkbox y monto
- ✅ Conceptos de pago incluyen administración
- ✅ Cálculo automático de total mensual

---

## ❌ **Lo que NOS FALTA implementar:**

### **PROBLEMA 1: No hay claridad sobre QUIÉN paga la administración**
Necesitamos saber:
- ¿La paga el **inquilino** directamente a la administración?
- ¿La paga el **propietario** del valor que recibe?
- ¿Está incluida en el valor del arriendo o es aparte?

### **PROBLEMA 2: No hay control del flujo de dinero**
Cuando la agencia recibe el pago del inquilino:
- ¿Cuánto va para el propietario?
- ¿Cuánto se descuenta para administración?
- ¿La agencia paga la administración o el propietario?

### **PROBLEMA 3: Portal del cliente no muestra desglose**
El propietario necesita ver:
- Arriendo cobrado al inquilino
- Descuentos aplicados (administración, comisión)
- Valor neto que recibirá

---

## 🎯 SOLUCIÓN PROPUESTA

### **FASE 1: Estructura de Datos - Nuevos Campos**

#### **A. En tabla `contracts` (principal)**
```sql
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS 
    -- Configuración de administración
    admin_included_in_rent BOOLEAN DEFAULT false,
    -- ¿La admin está incluida en monthly_rent o es aparte?
    
    admin_paid_by VARCHAR(20) CHECK (admin_paid_by IN ('tenant', 'landlord', 'agency')),
    -- ¿Quién paga la administración?
    
    admin_payment_method VARCHAR(20) CHECK (admin_payment_method IN ('direct', 'deducted', 'split')),
    -- 'direct': inquilino paga directo a admin
    -- 'deducted': se descuenta del arriendo antes de pagar al propietario
    -- 'split': se divide entre inquilino y propietario
    
    admin_landlord_percentage DECIMAL(5,2),
    -- Si es 'split', % que paga el propietario (0-100)
    
    agency_commission_percentage DECIMAL(5,2),
    -- % de comisión que cobra la agencia
    
    agency_commission_fixed DECIMAL(15,2);
    -- O comisión fija en pesos
```

#### **B. En tabla `payments` (expandir)**
```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS
    -- Para pagos de tipo 'rent' del inquilino
    gross_amount DECIMAL(15,2),
    -- Monto bruto recibido del inquilino
    
    admin_deduction DECIMAL(15,2) DEFAULT 0,
    -- Descuento por administración
    
    agency_commission DECIMAL(15,2) DEFAULT 0,
    -- Comisión de la agencia
    
    net_amount DECIMAL(15,2),
    -- Monto neto que recibe el propietario
    
    payment_direction VARCHAR(20) CHECK (payment_direction IN ('incoming', 'outgoing')),
    -- 'incoming': pago recibido (inquilino → agencia)
    -- 'outgoing': pago realizado (agencia → propietario)
    
    related_payment_id UUID REFERENCES payments(id),
    -- Para vincular pago recibido con pago enviado
    
    recipient_type VARCHAR(20) CHECK (recipient_type IN ('landlord', 'admin', 'agency', 'utility_company'));
    -- A quién se le paga
```

---

### **FASE 2: Lógica de Negocio - Casos de Uso**

#### **CASO 1: Administración incluida, paga propietario**
```typescript
// Ejemplo: Arriendo $1,000,000 (incluye admin $150,000)
// El inquilino paga $1,000,000 a la agencia
// La agencia descuenta admin y paga al propietario

contract: {
    monthly_rent: 1000000,
    administration_fee: 150000,
    admin_included_in_rent: true,
    admin_paid_by: 'landlord',
    admin_payment_method: 'deducted'
}

// Cuando se recibe pago del inquilino:
payment_incoming: {
    payment_type: 'rent',
    payment_direction: 'incoming',
    gross_amount: 1000000,
    admin_deduction: 150000,
    net_amount: 850000,
    recipient_type: null  // La agencia recibe
}

// Cuando la agencia paga al propietario:
payment_outgoing: {
    payment_type: 'rent',
    payment_direction: 'outgoing',
    amount: 850000,
    recipient_type: 'landlord',
    related_payment_id: [ID del pago incoming],
    notes: 'Arriendo $1,000,000 - Admin $150,000 = $850,000'
}

// Cuando la agencia paga la administración:
payment_admin: {
    payment_type: 'administration',
    payment_direction: 'outgoing',
    amount: 150000,
    recipient_type: 'admin',
    related_payment_id: [ID del pago incoming],
    notes: 'Administración descontada del arriendo'
}
```

#### **CASO 2: Administración aparte, paga inquilino**
```typescript
// El inquilino paga $1,000,000 arriendo + $150,000 admin
// La agencia recibe todo y distribuye

contract: {
    monthly_rent: 1000000,
    administration_fee: 150000,
    admin_included_in_rent: false,
    admin_paid_by: 'tenant',
    admin_payment_method: 'direct'
}

// Pago arriendo (inquilino → agencia → propietario)
payment_rent_incoming: {
    payment_type: 'rent',
    gross_amount: 1000000,
    net_amount: 1000000,  // Sin descuentos
}

payment_rent_outgoing: {
    payment_type: 'rent',
    amount: 1000000,
    recipient_type: 'landlord'
}

// Pago administración (inquilino → agencia → administración)
payment_admin_incoming: {
    payment_type: 'administration',
    amount: 150000,
    payment_direction: 'incoming'
}

payment_admin_outgoing: {
    payment_type: 'administration',
    amount: 150000,
    recipient_type: 'admin',
    payment_direction: 'outgoing'
}
```

#### **CASO 3: Administración dividida**
```typescript
// Admin $150,000: 60% inquilino ($90k), 40% propietario ($60k)

contract: {
    monthly_rent: 1000000,
    administration_fee: 150000,
    admin_included_in_rent: false,
    admin_paid_by: 'tenant',
    admin_payment_method: 'split',
    admin_landlord_percentage: 40
}

// El inquilino paga: $1,000,000 + $90,000 = $1,090,000
// Del arriendo del propietario se descuenta: $60,000
// Propietario recibe: $940,000
```

---

### **FASE 3: Formularios y UI**

#### **A. En AdminProperties.tsx - Formulario de Propiedades**
Agregar sección "Configuración de Pagos y Administración":

```tsx
<div className="space-y-4">
  <h3 className="font-semibold">Configuración de Administración</h3>
  
  {/* Campo: Valor administración */}
  <div>
    <label>Valor de Administración (COP)</label>
    <input 
      type="number" 
      name="administration_fee"
      value={formData.administration_fee}
      onChange={handleFormChange}
    />
  </div>
  
  {/* ¿Está incluida en el arriendo? */}
  <div>
    <label className="flex items-center gap-2">
      <input 
        type="checkbox"
        name="admin_included_in_rent"
        checked={formData.admin_included_in_rent}
        onChange={handleFormChange}
      />
      <span>La administración está incluida en el valor del arriendo</span>
    </label>
    <p className="text-xs text-gray-500">
      {formData.admin_included_in_rent 
        ? "El inquilino paga un solo valor que incluye arriendo + admin"
        : "El inquilino paga arriendo y administración por separado"
      }
    </p>
  </div>
  
  {/* ¿Quién paga la administración? */}
  <div>
    <label>¿Quién paga la administración?</label>
    <select 
      name="admin_paid_by"
      value={formData.admin_paid_by}
      onChange={handleFormChange}
    >
      <option value="tenant">Inquilino (directamente)</option>
      <option value="landlord">Propietario (se descuenta del arriendo)</option>
      <option value="split">Compartida (inquilino y propietario)</option>
    </select>
  </div>
  
  {/* Si es compartida, mostrar porcentaje */}
  {formData.admin_paid_by === 'split' && (
    <div>
      <label>¿Qué % paga el propietario?</label>
      <input 
        type="number"
        name="admin_landlord_percentage"
        min="0"
        max="100"
        value={formData.admin_landlord_percentage}
        onChange={handleFormChange}
      />
      <p className="text-xs">
        Inquilino: {100 - formData.admin_landlord_percentage}% 
        (${((150000 * (100 - formData.admin_landlord_percentage)) / 100).toLocaleString()})
        <br/>
        Propietario: {formData.admin_landlord_percentage}%
        (${((150000 * formData.admin_landlord_percentage) / 100).toLocaleString()})
      </p>
    </div>
  )}
  
  {/* Método de pago */}
  <div>
    <label>Método de Pago de Administración</label>
    <select 
      name="admin_payment_method"
      value={formData.admin_payment_method}
      onChange={handleFormChange}
    >
      <option value="direct">El inquilino paga directo a la administración</option>
      <option value="deducted">La agencia recibe y paga (se descuenta del arriendo)</option>
    </select>
  </div>
  
  {/* Comisión de la agencia */}
  <div className="border-t pt-4 mt-4">
    <h4 className="font-medium mb-2">Comisión de la Agencia</h4>
    
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2">
        <input 
          type="radio"
          name="commission_type"
          value="percentage"
          checked={formData.commission_type === 'percentage'}
          onChange={handleFormChange}
        />
        <span>Porcentaje</span>
      </label>
      
      <label className="flex items-center gap-2">
        <input 
          type="radio"
          name="commission_type"
          value="fixed"
          checked={formData.commission_type === 'fixed'}
          onChange={handleFormChange}
        />
        <span>Monto Fijo</span>
      </label>
    </div>
    
    {formData.commission_type === 'percentage' ? (
      <input 
        type="number"
        name="agency_commission_percentage"
        min="0"
        max="100"
        step="0.1"
        value={formData.agency_commission_percentage}
        onChange={handleFormChange}
        placeholder="Ej: 10 (10%)"
      />
    ) : (
      <input 
        type="number"
        name="agency_commission_fixed"
        min="0"
        value={formData.agency_commission_fixed}
        onChange={handleFormChange}
        placeholder="Ej: 50000"
      />
    )}
  </div>
  
  {/* Preview de cálculos */}
  <div className="bg-blue-50 p-4 rounded-lg">
    <h4 className="font-semibold mb-2">Resumen de Pagos</h4>
    <CalculationPreview formData={formData} />
  </div>
</div>
```

#### **B. En ClientWizard - Paso 2 (Información Financiera)**
Ya existe el campo de administración, pero agregar:

```tsx
<div className="bg-yellow-50 p-4 rounded-lg">
  <AlertTriangle className="w-5 h-5 text-yellow-600 mb-2" />
  <p className="text-sm text-gray-700">
    <strong>Nota sobre administración:</strong><br/>
    {formData.payment_config.concepts.administracion.enabled && (
      <>
        La administración de ${formData.payment_config.concepts.administracion.amount.toLocaleString()} 
        {contract.admin_included_in_rent ? ' está incluida en el arriendo' : ' se cobra por separado'}.
        {contract.admin_paid_by === 'landlord' && ' El propietario paga esta administración.'}
        {contract.admin_paid_by === 'tenant' && ' El inquilino paga esta administración.'}
      </>
    )}
  </p>
</div>
```

#### **C. En Portal del Cliente (ClientExtractos.tsx)**
Expandir para mostrar desglose completo:

```tsx
<div className="bg-white p-6 rounded-lg border">
  <h3 className="font-semibold mb-4">Detalle de Pago - Marzo 2025</h3>
  
  <div className="space-y-2">
    <div className="flex justify-between">
      <span>Arriendo base:</span>
      <span className="font-semibold">$1,000,000</span>
    </div>
    
    {payment.admin_deduction > 0 && (
      <>
        <div className="flex justify-between text-red-600">
          <span>(-) Administración:</span>
          <span className="font-semibold">-$150,000</span>
        </div>
        <p className="text-xs text-gray-500">
          Pagado por la agencia a la administración del edificio
        </p>
      </>
    )}
    
    {payment.agency_commission > 0 && (
      <div className="flex justify-between text-red-600">
        <span>(-) Comisión agencia:</span>
        <span className="font-semibold">-${payment.agency_commission.toLocaleString()}</span>
      </div>
    )}
    
    <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
      <span>Total a recibir:</span>
      <span>${payment.net_amount.toLocaleString()}</span>
    </div>
  </div>
  
  <div className="mt-4 p-3 bg-gray-50 rounded">
    <p className="text-xs text-gray-600">
      <strong>Fecha de pago al propietario:</strong> {payment.payment_date}<br/>
      <strong>Método:</strong> {payment.payment_method}<br/>
      <strong>Referencia:</strong> {payment.transaction_reference}
    </p>
  </div>
</div>
```

---

### **FASE 4: Lógica de Cálculo Automático**

#### **Función para calcular desgloses de pago:**

```typescript
// src/lib/paymentCalculations.ts

interface PaymentBreakdown {
  gross_amount: number;         // Lo que paga el inquilino
  admin_deduction: number;      // Descuento por admin
  agency_commission: number;    // Comisión agencia
  net_amount: number;          // Lo que recibe el propietario
  admin_tenant_pays: number;   // Admin que paga inquilino directo
  admin_landlord_pays: number; // Admin que paga propietario
}

export function calculatePaymentBreakdown(
  contract: Contract
): PaymentBreakdown {
  const {
    monthly_rent,
    administration_fee,
    admin_included_in_rent,
    admin_paid_by,
    admin_payment_method,
    admin_landlord_percentage,
    agency_commission_percentage,
    agency_commission_fixed
  } = contract;
  
  let gross_amount = monthly_rent;
  let admin_deduction = 0;
  let admin_tenant_pays = 0;
  let admin_landlord_pays = 0;
  
  // 1. Calcular quién paga administración
  if (admin_paid_by === 'tenant') {
    if (!admin_included_in_rent) {
      // Inquilino paga arriendo + admin por separado
      admin_tenant_pays = administration_fee;
      gross_amount = monthly_rent + administration_fee;
    } else {
      // Inquilino paga todo junto, pero no se descuenta al propietario
      admin_tenant_pays = administration_fee;
    }
  } else if (admin_paid_by === 'landlord') {
    // Se descuenta del arriendo del propietario
    admin_deduction = administration_fee;
    admin_landlord_pays = administration_fee;
  } else if (admin_paid_by === 'split') {
    // División porcentual
    admin_landlord_pays = (administration_fee * admin_landlord_percentage) / 100;
    admin_tenant_pays = administration_fee - admin_landlord_pays;
    
    if (!admin_included_in_rent) {
      gross_amount = monthly_rent + admin_tenant_pays;
    }
    admin_deduction = admin_landlord_pays;
  }
  
  // 2. Calcular comisión agencia
  let agency_commission = 0;
  if (agency_commission_percentage) {
    agency_commission = (monthly_rent * agency_commission_percentage) / 100;
  } else if (agency_commission_fixed) {
    agency_commission = agency_commission_fixed;
  }
  
  // 3. Calcular neto para el propietario
  const net_amount = monthly_rent - admin_deduction - agency_commission;
  
  return {
    gross_amount,
    admin_deduction,
    agency_commission,
    net_amount,
    admin_tenant_pays,
    admin_landlord_pays
  };
}
```

---

### **FASE 5: Alertas y Notificaciones**

#### **Crear alertas automáticas:**

```typescript
// Cuando se registra un pago del inquilino
async function onTenantPaymentReceived(payment: Payment, contract: Contract) {
  const breakdown = calculatePaymentBreakdown(contract);
  
  // 1. Crear alerta para pagar al propietario
  await createAlert({
    client_id: contract.landlord_id,
    alert_type: 'payment_due',
    title: 'Pago pendiente para propietario',
    description: `Arriendo recibido: $${breakdown.gross_amount.toLocaleString()}. 
                  Pagar al propietario: $${breakdown.net_amount.toLocaleString()}`,
    priority: 'high',
    due_date: addDays(new Date(), 2) // Pagar en 2 días
  });
  
  // 2. Si hay que pagar administración
  if (breakdown.admin_deduction > 0) {
    await createAlert({
      alert_type: 'payment_due',
      title: 'Pago de administración pendiente',
      description: `Administración a pagar: $${breakdown.admin_deduction.toLocaleString()}`,
      priority: 'medium',
      due_date: addDays(new Date(), 5)
    });
  }
  
  // 3. Notificar al propietario
  await sendNotificationToLandlord(contract.landlord_id, {
    title: 'Pago recibido',
    message: `Hemos recibido el pago del inquilino. 
              Recibirás $${breakdown.net_amount.toLocaleString()} en los próximos días.`
  });
}
```

---

## 📊 RESUMEN DE CAMBIOS NECESARIOS

### **Base de Datos:**
- ✅ `ALTER TABLE contracts` - 6 nuevos campos
- ✅ `ALTER TABLE payments` - 7 nuevos campos
- ✅ Trigger para calcular desgloses automáticamente

### **Backend/API:**
- ✅ Función `calculatePaymentBreakdown()`
- ✅ Endpoint para registrar pago con desglose
- ✅ Endpoint para ver historial de pagos con detalles

### **Frontend - Panel Admin:**
- ✅ AdminProperties: Sección "Configuración de Administración"
- ✅ Formulario de pagos: Campos de desglose
- ✅ Vista de pagos: Mostrar incoming/outgoing

### **Frontend - Portal Cliente:**
- ✅ ClientExtractos: Desglose completo de pagos
- ✅ Dashboard: Resumen de próximos pagos con descuentos
- ✅ Notificaciones cuando se reciben/envían pagos

### **Documentación:**
- ✅ Manual de configuración de administración
- ✅ Guía para registrar pagos correctamente
- ✅ FAQ sobre flujo de pagos

---

## 🎯 PRIORIDAD DE IMPLEMENTACIÓN

### **FASE 1 (Crítico)** - Base de datos y cálculos
1. Migración SQL para nuevos campos
2. Función `calculatePaymentBreakdown()`
3. Actualizar formulario de propiedades

### **FASE 2 (Alta)** - Panel Admin
4. Formulario de registro de pagos con desglose
5. Vista de pagos pendientes con alertas
6. Dashboard con resumen de flujo de caja

### **FASE 3 (Media)** - Portal Cliente
7. Vista de extractos con desglose
8. Notificaciones de pagos
9. Historial de transacciones

### **FASE 4 (Baja)** - Mejoras
10. Reportes de comisiones
11. Exportar extractos PDF
12. Gráficas de flujo de caja

---

## ✅ CHECKLIST FINAL

- [ ] Migración SQL ejecutada en producción
- [ ] Función de cálculo probada con casos reales
- [ ] Formulario de propiedades actualizado
- [ ] Formulario de pagos actualizado
- [ ] Portal del cliente muestra desglose
- [ ] Alertas automáticas funcionando
- [ ] Documentación para usuarios creada
- [ ] Capacitación al equipo realizada

---

¿Te parece bien este análisis? ¿Comenzamos con la implementación de la Fase 1?
