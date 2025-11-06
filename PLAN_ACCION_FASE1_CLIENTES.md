# 🎯 PLAN DE ACCIÓN DETALLADO - SISTEMA DE CLIENTES
## Correcciones y Mejoras Prioritarias

---

## 📋 FASE 1: LIMPIEZA Y ESTABILIZACIÓN (Semanas 1-2)

### **Semana 1: Limpieza de Código**

#### **Día 1-2: Eliminar Duplicidad**

**Tareas:**
```bash
# 1. Eliminar archivos sin uso
- Borrar: src/pages/ClientsAdmin.tsx (vacío)
- Analizar: src/components/ClientModals.tsx (ver si algo se usa)
- Consolidar: AdminRealClients.tsx → AdminClients.tsx
```

**Archivos a modificar:**
- ✅ `ClientsAdmin.tsx` → ELIMINAR
- ✅ `ClientModals.tsx` → ELIMINAR (después de migrar ViewClientModal si se usa)
- ✅ `AdminRealClients.tsx` → REVISAR y posiblemente ELIMINAR

**Commits sugeridos:**
```
🧹 Eliminar archivos sin uso del sistema de clientes
- Remove ClientsAdmin.tsx (empty file)
- Remove ClientModals.tsx (legacy modals replaced by ClientWizard)
- Consolidate AdminRealClients into AdminClients
```

---

#### **Día 3-4: Unificar Tipos de Cliente**

**Problema actual:**
```typescript
// ❌ Inconsistente en diferentes lugares:
'tenant' | 'landlord'                    // Wizard
'buyer' | 'seller' | 'renter' | 'owner'  // AdminClients
```

**Solución:**
```typescript
// ✅ Definir en src/types/clients.ts
export type ClientType = 
  | 'tenant'      // Arrendatario
  | 'landlord'    // Arrendador/Propietario
  | 'buyer'       // Comprador
  | 'seller'      // Vendedor
  | 'interested'; // Interesado

// Migración en BD:
UPDATE clients 
SET client_type = CASE 
  WHEN client_type = 'renter' THEN 'tenant'
  WHEN client_type = 'owner' THEN 'landlord'
  ELSE client_type
END;
```

**Archivos a modificar:**
- ✅ `src/types/clients.ts` → Actualizar interface Client
- ✅ `src/components/ClientWizard.tsx` → Actualizar opciones select
- ✅ `src/pages/AdminClients.tsx` → Actualizar filtros
- ✅ `src/components/ClientEditForm.tsx` → Actualizar form

**Script SQL:**
```sql
-- Crear en: fix_client_types.sql

-- 1. Actualizar valores antiguos
UPDATE clients 
SET client_type = 'tenant' 
WHERE client_type IN ('renter', 'arrendatario');

UPDATE clients 
SET client_type = 'landlord' 
WHERE client_type IN ('owner', 'propietario');

-- 2. Verificar tipos únicos
SELECT DISTINCT client_type FROM clients;

-- Resultado esperado:
-- tenant, landlord, buyer, seller, interested
```

**Commits sugeridos:**
```
🔧 Unificar tipos de cliente en todo el sistema
- Define ClientType enum in types/clients.ts
- Update all components to use unified types
- Add SQL migration script for existing data
```

---

#### **Día 5: Eliminar Campos Duplicados**

**Problema actual:**
```typescript
// ❌ ClientWizardData tiene campos duplicados:
export interface ClientWizardData {
  // Campos directos (duplicados)
  preferred_payment_method?: string;
  billing_day?: number;
  contract_type?: string;
  
  // Campos anidados (originales)
  payment_config: {
    preferred_payment_method: string;
    billing_day: number;
  };
  contract_info: {
    contract_type: string;
  };
}
```

**Solución:**
```typescript
// ✅ Mantener solo estructura anidada
export interface ClientWizardData {
  // Información básica
  full_name: string;
  document_type: 'cedula' | 'pasaporte' | 'nit';
  document_number: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  client_type: ClientType;
  status: 'active' | 'inactive' | 'suspended';
  
  // Configuración de pagos (anidado)
  payment_config: {
    preferred_payment_method: 'transferencia' | 'efectivo' | 'tarjeta' | 'cheque';
    billing_day: number;
    concepts: {
      arriendo: { enabled: boolean; amount: number };
      administracion: { enabled: boolean; amount: number };
    };
  };
  
  // Información del contrato (anidado)
  contract_info: {
    contract_type: 'arriendo' | 'coworking' | 'oficina';
    start_date: string;
    end_date: string;
    deposit_amount: number;
  };
  
  // Referencias (anidado)
  references: {
    personal: Array<{ name: string; phone: string; relationship: string }>;
    commercial: Array<{ company_name: string; phone: string }>;
  };
  
  // ... resto de campos
}
```

**Archivos a modificar:**
- ✅ `src/components/ClientWizard.tsx` → Actualizar interface
- ✅ `src/pages/AdminClients.tsx` → Actualizar handleWizardSubmit
- ✅ `src/lib/clientsApi.ts` → Actualizar savePaymentConfig, saveContractInfo

**Commits sugeridos:**
```
♻️ Refactor ClientWizardData para eliminar campos duplicados
- Remove direct fields (preferred_payment_method, billing_day, etc.)
- Keep only nested structures (payment_config, contract_info, references)
- Update all save functions to use nested fields
```

---

### **Semana 2: Validaciones y UX**

#### **Día 1-2: Validación de Duplicados**

**Crear función de validación:**
```typescript
// src/lib/clientsApi.ts

export async function checkClientExists(
  documentNumber: string, 
  email: string
): Promise<{
  exists: boolean;
  field: 'document' | 'email' | null;
  existingClient?: Client;
}> {
  // Verificar documento
  const { data: byDoc } = await supabase
    .from('clients')
    .select('*')
    .eq('document_number', documentNumber)
    .is('deleted_at', null)
    .single();
  
  if (byDoc) {
    return { 
      exists: true, 
      field: 'document',
      existingClient: byDoc 
    };
  }
  
  // Verificar email
  const { data: byEmail } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .is('deleted_at', null)
    .single();
  
  if (byEmail) {
    return { 
      exists: true, 
      field: 'email',
      existingClient: byEmail 
    };
  }
  
  return { exists: false, field: null };
}
```

**Integrar en Wizard:**
```typescript
// src/components/wizard/Step1BasicInfo.tsx

const handleNext = async () => {
  // Validar duplicados antes de continuar
  const check = await checkClientExists(
    formData.document_number,
    formData.email
  );
  
  if (check.exists) {
    setError(
      `Ya existe un cliente con este ${
        check.field === 'document' ? 'documento' : 'email'
      }: ${check.existingClient?.full_name}`
    );
    return;
  }
  
  onNext(formData);
};
```

**Archivos a modificar:**
- ✅ `src/lib/clientsApi.ts` → Agregar checkClientExists()
- ✅ `src/components/wizard/Step1BasicInfo.tsx` → Validar antes de next
- ✅ `src/components/ClientEditForm.tsx` → Validar al cambiar email/documento

**Commits sugeridos:**
```
✨ Agregar validación de clientes duplicados
- Add checkClientExists() function in clientsApi
- Validate document_number and email in Step1BasicInfo
- Show clear error message if client already exists
- Prevent duplicate clients in database
```

---

#### **Día 3: Validaciones de Formato**

**Crear utilidad de validación:**
```typescript
// src/utils/validators.ts

export const validators = {
  // Email
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Teléfono colombiano (10 dígitos)
  phone: (phone: string): boolean => {
    const phoneRegex = /^[3][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },
  
  // Cédula colombiana (6-10 dígitos)
  cedula: (cedula: string): boolean => {
    const cedulaRegex = /^[0-9]{6,10}$/;
    return cedulaRegex.test(cedula);
  },
  
  // NIT colombiano (9 dígitos + dígito de verificación)
  nit: (nit: string): boolean => {
    const nitRegex = /^[0-9]{9}-[0-9]$/;
    return nitRegex.test(nit);
  },
  
  // Fecha no futura
  pastDate: (date: string): boolean => {
    return new Date(date) <= new Date();
  },
  
  // Fecha inicio < fecha fin
  dateRange: (start: string, end: string): boolean => {
    return new Date(start) < new Date(end);
  },
  
  // Monto positivo
  positiveAmount: (amount: number): boolean => {
    return amount > 0;
  }
};

export const validateMessages = {
  email: 'Email inválido. Formato: usuario@dominio.com',
  phone: 'Teléfono inválido. Debe tener 10 dígitos comenzando con 3',
  cedula: 'Cédula inválida. Debe tener entre 6 y 10 dígitos',
  nit: 'NIT inválido. Formato: 123456789-0',
  pastDate: 'La fecha no puede ser futura',
  dateRange: 'La fecha de inicio debe ser anterior a la fecha de fin',
  positiveAmount: 'El monto debe ser mayor a cero'
};
```

**Usar en formularios:**
```typescript
// src/components/wizard/Step1BasicInfo.tsx

const [errors, setErrors] = useState<{[key: string]: string}>({});

const validateForm = (): boolean => {
  const newErrors: {[key: string]: string} = {};
  
  if (!validators.email(formData.email)) {
    newErrors.email = validateMessages.email;
  }
  
  if (!validators.phone(formData.phone)) {
    newErrors.phone = validateMessages.phone;
  }
  
  if (formData.document_type === 'cedula' && !validators.cedula(formData.document_number)) {
    newErrors.document_number = validateMessages.cedula;
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Archivos a crear:**
- ✅ `src/utils/validators.ts` → Nuevas funciones de validación

**Archivos a modificar:**
- ✅ `src/components/wizard/Step1BasicInfo.tsx`
- ✅ `src/components/wizard/Step2FinancialInfo.tsx`
- ✅ `src/components/wizard/Step3Documents.tsx`
- ✅ `src/components/ClientEditForm.tsx`

**Commits sugeridos:**
```
✅ Agregar validaciones de formato en formularios
- Create validators.ts utility with email, phone, cedula, NIT validators
- Add real-time validation in wizard steps
- Show error messages below invalid fields
- Prevent submission with invalid data
```

---

#### **Día 4-5: Mejorar UX del Wizard**

**1. Guardar borrador en localStorage:**
```typescript
// src/components/ClientWizard.tsx

useEffect(() => {
  // Cargar borrador al abrir wizard
  const draft = localStorage.getItem('client_wizard_draft');
  if (draft) {
    const parsed = JSON.parse(draft);
    setFormData(parsed.data);
    setCurrentStep(parsed.step);
    setShowDraftNotice(true);
  }
}, [isOpen]);

useEffect(() => {
  // Guardar borrador automáticamente cada cambio
  if (formData.full_name || formData.email) {
    localStorage.setItem('client_wizard_draft', JSON.stringify({
      data: formData,
      step: currentStep,
      savedAt: new Date().toISOString()
    }));
  }
}, [formData, currentStep]);

const handleFinalSubmit = async () => {
  await onSubmit(formData);
  // Limpiar borrador después de guardar exitosamente
  localStorage.removeItem('client_wizard_draft');
};
```

**2. Confirmación al cerrar:**
```typescript
const handleClose = () => {
  if (formData.full_name || formData.email) {
    if (confirm('¿Seguro que deseas cerrar? Los cambios no guardados se perderán.')) {
      // Opcional: mantener borrador
      if (confirm('¿Deseas guardar un borrador para continuar después?')) {
        localStorage.setItem('client_wizard_draft', JSON.stringify({
          data: formData,
          step: currentStep,
          savedAt: new Date().toISOString()
        }));
      }
      onClose();
    }
  } else {
    onClose();
  }
};
```

**3. Indicador de progreso mejorado:**
```tsx
<div className="flex items-center justify-between mb-8">
  {steps.map((step, index) => (
    <div key={step.id} className="flex items-center flex-1">
      {/* Círculo con número */}
      <div className={`
        relative flex items-center justify-center
        w-10 h-10 rounded-full font-semibold
        ${currentStep === step.id 
          ? 'bg-green-600 text-white ring-4 ring-green-200'
          : currentStep > step.id
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-500'
        }
      `}>
        {currentStep > step.id ? <CheckCircle /> : step.id}
      </div>
      
      {/* Línea conectora */}
      {index < steps.length - 1 && (
        <div className={`flex-1 h-1 mx-2 ${
          currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
        }`} />
      )}
    </div>
  ))}
</div>

{/* Texto del paso actual */}
<div className="text-center mb-6">
  <h3 className="text-xl font-bold text-gray-900">
    {steps.find(s => s.id === currentStep)?.title}
  </h3>
  <p className="text-gray-600">
    {steps.find(s => s.id === currentStep)?.description}
  </p>
  <p className="text-sm text-gray-500 mt-2">
    Paso {currentStep} de {steps.length}
  </p>
</div>
```

**4. Tooltips en campos:**
```tsx
// Instalar react-tooltip
npm install react-tooltip

// Usar en campos complejos
<div className="relative">
  <label className="flex items-center gap-2">
    Billing Day
    <span 
      data-tooltip-id="billing-day-tooltip"
      className="cursor-help text-gray-400 hover:text-gray-600"
    >
      <HelpCircle className="w-4 h-4" />
    </span>
  </label>
  <Tooltip id="billing-day-tooltip">
    Día del mes en que se genera automáticamente la factura (1-28)
  </Tooltip>
  <input type="number" min="1" max="28" />
</div>
```

**Archivos a modificar:**
- ✅ `src/components/ClientWizard.tsx`
- ✅ Todos los `src/components/wizard/Step*.tsx`

**Commits sugeridos:**
```
💫 Mejorar UX del wizard de creación de clientes
- Auto-save draft to localStorage
- Confirm before closing wizard with unsaved changes
- Enhanced progress indicator with checkmarks
- Add helpful tooltips to complex fields
- Show step title and description
```

---

## 📦 ENTREGABLES FASE 1

Al final de las 2 semanas debes tener:

### **Código Limpio**
✅ Sin archivos duplicados
✅ Tipos unificados en todo el sistema
✅ Estructura de datos consistente

### **Validaciones**
✅ No se pueden crear clientes duplicados
✅ Todos los campos validan formato
✅ Fechas y montos validados

### **UX Mejorada**
✅ Borrador automático en wizard
✅ Confirmación al cerrar
✅ Tooltips informativos
✅ Progreso visual claro

### **Base de Datos**
✅ Migración de tipos antiguos
✅ Constraints de unicidad
✅ Índices optimizados

---

## 🎯 SIGUIENTES PASOS (Fase 2)

Después de completar Fase 1, continuar con:

1. **Sistema de permisos** (Semana 3)
2. **Exportación de datos** (Semana 4)
3. **Reportes con gráficas** (Semana 5)

---

**Documento creado:** 5 de Noviembre, 2025  
**Autor:** GitHub Copilot  
**Versión:** 1.0
