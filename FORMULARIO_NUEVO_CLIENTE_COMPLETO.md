# 📋 FORMULARIO NUEVO CLIENTE - ANÁLISIS Y DISEÑO COMPLETO

## 🎯 CAMPOS ACTUALES (Lo que ya tienes)

### ✅ 1. Información Personal
- Nombre completo
- Tipo de documento (cédula, pasaporte, NIT)
- Número de documento
- Tipo de cliente (tenant/landlord)
- Estado (activo/inactivo/suspendido)

### ✅ 2. Información de Contacto
- Teléfono
- Email
- Dirección
- Ciudad

### ✅ 3. Información Profesional
- Ingresos mensuales
- Ocupación
- Nombre de la empresa
- Notas adicionales

### ✅ 4. Contacto de Emergencia
- Nombre del contacto
- Teléfono del contacto

### ✅ 5. Propiedades de Interés
- **DEBE CAMBIAR A**: "Propiedades del Cliente" o "Propiedades Asignadas"
- Permite selección múltiple de propiedades

---

## 🚀 CAMPOS NUEVOS OBLIGATORIOS (Lo que necesitas agregar)

### 🔐 A. CREDENCIALES DE ACCESO AL PORTAL
**Ubicación sugerida**: Nueva sección al final del formulario

```typescript
portal_credentials: {
  // Opción 1: Generar automáticamente
  email: string,              // Email del cliente (ya existe)
  password: string,           // Generada automáticamente o manual
  send_welcome_email: boolean, // ¿Enviar email de bienvenida?
  portal_access_enabled: boolean, // ¿Habilitar acceso inmediatamente?
  
  // Opción 2: Permitir que el cliente se registre después
  send_registration_link: boolean, // Enviar link de registro
}
```

**Recomendación**: 
- ✅ Generar contraseña temporal automáticamente (ej: "Cowork2025#123")
- ✅ Enviar email con credenciales
- ✅ Forzar cambio de contraseña en primer login
- ✅ Checkbox: "Enviar credenciales por email"

---

### 💰 B. INFORMACIÓN DE PAGOS
**Ubicación sugerida**: Nueva pestaña/sección "Configuración de Pagos"

```typescript
payment_configuration: {
  // Método de pago preferido
  preferred_payment_method: 'transferencia' | 'efectivo' | 'tarjeta' | 'cheque',
  
  // Información bancaria (para transferencias)
  bank_name?: string,
  account_type?: 'ahorros' | 'corriente',
  account_number?: string,
  
  // Ciclo de facturación
  billing_day: number,         // Día del mes para facturar (1-31)
  payment_due_days: number,    // Días para pagar después de factura (ej: 5)
  
  // Conceptos de pago
  payment_concepts: {
    arriendo: boolean,         // ¿Paga arriendo?
    arriendo_amount?: number,  // Monto mensual
    
    administracion: boolean,   // ¿Paga administración?
    administracion_amount?: number,
    
    servicios_publicos: boolean, // ¿Paga servicios?
    servicios_tipo?: string[],   // ['agua', 'luz', 'gas', 'internet']
    
    otros: boolean,
    otros_descripcion?: string,
    otros_amount?: number,
  },
  
  // Alertas de pago
  send_payment_reminders: boolean,
  reminder_days_before: number, // Días antes de vencimiento
}
```

**Recomendación**:
- ✅ Configurar conceptos de pago desde el inicio
- ✅ Generar automáticamente facturas recurrentes
- ✅ Enviar recordatorios automáticos

---

### 📄 C. DOCUMENTOS Y CONTRATOS
**Ubicación sugerida**: Nueva pestaña "Documentos y Contratos"

```typescript
contract_documents: {
  // Información del contrato
  contract_type: 'arriendo' | 'coworking' | 'oficina_privada' | 'otro',
  contract_start_date: string,
  contract_end_date?: string,
  contract_duration_months: number,
  
  // Documentos requeridos (checklist)
  required_documents: {
    cedula_frente: { uploaded: boolean, file_url?: string, upload_date?: string },
    cedula_reverso: { uploaded: boolean, file_url?: string, upload_date?: string },
    certificado_laboral?: { uploaded: boolean, file_url?: string, upload_date?: string },
    declaracion_renta?: { uploaded: boolean, file_url?: string, upload_date?: string },
    referencias_personales?: { uploaded: boolean, file_url?: string, upload_date?: string },
    contrato_firmado: { uploaded: boolean, file_url?: string, upload_date?: string },
    pagare?: { uploaded: boolean, file_url?: string, upload_date?: string },
    carta_autorizacion?: { uploaded: boolean, file_url?: string, upload_date?: string },
  },
  
  // Contrato digital
  digital_contract: {
    template_id?: string,          // Plantilla de contrato usada
    generated_at?: string,         // Fecha de generación
    contract_file_url?: string,    // URL del contrato generado
    signed_by_client: boolean,     // ¿Firmado por cliente?
    signed_date_client?: string,
    signed_by_landlord: boolean,   // ¿Firmado por propietario?
    signed_date_landlord?: string,
    witness_name?: string,
    witness_signature?: string,
  },
  
  // Depósito y garantías
  deposit_info: {
    deposit_amount: number,
    deposit_paid: boolean,
    deposit_payment_date?: string,
    deposit_receipt_url?: string,
    
    guarantor_required: boolean,   // ¿Requiere fiador?
    guarantor_name?: string,
    guarantor_document?: string,
    guarantor_phone?: string,
    guarantor_documents_url?: string,
  },
}
```

**Recomendación**:
- ✅ Drag & drop para subir documentos
- ✅ Vista previa de documentos (PDF, imágenes)
- ✅ Botón "Descargar todos los documentos" (ZIP)
- ✅ Checklist visual de documentos faltantes
- ✅ Firma digital integrada (opcional)

---

## 🎨 CAMPOS ADICIONALES IMPORTANTES (Recomendaciones profesionales)

### 📊 D. REFERENCIAS COMERCIALES Y PERSONALES
```typescript
references: {
  personal: [
    {
      name: string,
      phone: string,
      relationship: string,
      years_known: number,
    }
  ],
  commercial: [
    {
      company_name: string,
      contact_person: string,
      phone: string,
      relationship: 'previous_landlord' | 'employer' | 'business_partner',
    }
  ],
}
```

### 🏢 E. INFORMACIÓN ESPECÍFICA POR TIPO DE CLIENTE

**Para INQUILINOS (tenants)**:
```typescript
tenant_info: {
  current_residence_type: 'casa_propia' | 'arriendo' | 'familiar',
  reason_for_moving: string,
  expected_move_in_date: string,
  number_of_occupants: number,
  has_pets: boolean,
  pet_details?: string,
  vehicle_info?: {
    has_vehicle: boolean,
    license_plate?: string,
    requires_parking: boolean,
  },
}
```

**Para PROPIETARIOS (landlords)**:
```typescript
landlord_info: {
  property_ids: string[],        // Propiedades que posee
  tax_id: string,                // RUT/NIT para facturación
  tax_regime: string,            // Régimen tributario
  receives_payment_reports: boolean,
  report_frequency: 'weekly' | 'monthly' | 'quarterly',
  authorized_representative?: {
    name: string,
    document: string,
    phone: string,
    email: string,
    powers_of_attorney_url?: string, // Poder notarial
  },
}
```

### 🔔 F. PREFERENCIAS DE COMUNICACIÓN
```typescript
communication_preferences: {
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'sms',
  whatsapp_number?: string,
  best_time_to_contact: 'morning' | 'afternoon' | 'evening',
  language: 'es' | 'en',
  
  notifications: {
    payment_reminders: boolean,
    maintenance_updates: boolean,
    community_news: boolean,
    promotional_offers: boolean,
  },
}
```

### 🔒 G. VERIFICACIÓN Y SEGURIDAD
```typescript
verification: {
  identity_verified: boolean,
  identity_verified_by?: string,  // ID del admin que verificó
  identity_verified_date?: string,
  
  background_check_required: boolean,
  background_check_status?: 'pending' | 'approved' | 'rejected',
  background_check_date?: string,
  background_check_notes?: string,
  
  credit_check_required: boolean,
  credit_score?: number,
  credit_check_date?: string,
  
  risk_level: 'low' | 'medium' | 'high',
  risk_notes?: string,
}
```

### 📅 H. INFORMACIÓN DE ONBOARDING
```typescript
onboarding: {
  welcome_package_sent: boolean,
  welcome_package_date?: string,
  
  orientation_scheduled: boolean,
  orientation_date?: string,
  
  keys_delivered: boolean,
  keys_delivery_date?: string,
  keys_quantity: number,
  
  access_cards_delivered: boolean,
  access_card_numbers?: string[],
  
  rules_and_regulations_accepted: boolean,
  rules_acceptance_date?: string,
  rules_signature_url?: string,
  
  inventory_checklist_completed: boolean,
  inventory_checklist_url?: string,
}
```

---

## 🎯 ESTRUCTURA RECOMENDADA DEL FORMULARIO

### **Opción 1: Formulario Multi-Paso (Wizard)**
```
Paso 1: Información Básica
  - Datos personales
  - Contacto
  - Tipo de cliente

Paso 2: Información Financiera
  - Ingresos
  - Referencias comerciales
  - Configuración de pagos

Paso 3: Documentación
  - Subir documentos
  - Crear/Adjuntar contrato
  - Información de depósito

Paso 4: Credenciales de Acceso
  - Crear usuario portal
  - Configurar notificaciones
  - Preferencias de comunicación

Paso 5: Propiedades y Relaciones
  - Asignar propiedades
  - Configurar servicios
  - Información adicional

Paso 6: Revisión y Confirmación
  - Revisar toda la información
  - Enviar emails de bienvenida
  - Crear cliente
```

### **Opción 2: Pestañas (Tabs)**
```
Tab 1: 📋 Información Personal
Tab 2: 💼 Información Profesional
Tab 3: 💰 Pagos y Facturación
Tab 4: 📄 Documentos y Contratos
Tab 5: 🏠 Propiedades Asignadas
Tab 6: 🔐 Acceso al Portal
Tab 7: ✅ Revisión Final
```

---

## 💡 RECOMENDACIONES TÉCNICAS

### 1. **Validaciones Inteligentes**
```typescript
// Ejemplo de validación
if (client_type === 'tenant') {
  // Requerir: contrato, depósito, referencias
  validateTenantRequirements();
}

if (client_type === 'landlord') {
  // Requerir: RUT/NIT, propiedades, datos bancarios
  validateLandlordRequirements();
}
```

### 2. **Autocompletado y Sugerencias**
- Autocompletar ciudad con API de Google Places
- Sugerir bancos del país
- Autocompletar direcciones

### 3. **Carga de Documentos**
- Drag & drop zone
- Vista previa de archivos
- Validación de tipo y tamaño
- Compresión automática de imágenes
- Organización por carpetas en Supabase Storage

### 4. **Generación Automática**
- Contraseña temporal
- Código de cliente único
- Contrato desde plantilla
- Email de bienvenida

### 5. **Flujo de Aprobación**
```
Cliente Creado → Documentos Pendientes → Revisión → Aprobado → Portal Activo
```

---

## 🗄️ CAMBIOS EN LA BASE DE DATOS

Necesitarás agregar nuevas tablas:

```sql
-- Tabla de credenciales de portal
CREATE TABLE client_portal_credentials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  must_change_password BOOLEAN DEFAULT true,
  portal_access_enabled BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de documentos del cliente
CREATE TABLE client_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP,
  notes TEXT
);

-- Tabla de configuración de pagos
CREATE TABLE client_payment_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  preferred_payment_method VARCHAR(50),
  bank_name VARCHAR(100),
  account_type VARCHAR(20),
  account_number VARCHAR(50),
  billing_day INTEGER DEFAULT 1,
  payment_due_days INTEGER DEFAULT 5,
  send_reminders BOOLEAN DEFAULT true,
  reminder_days_before INTEGER DEFAULT 3,
  payment_concepts JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de referencias
CREATE TABLE client_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  reference_type VARCHAR(20), -- 'personal' | 'commercial'
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),
  relationship VARCHAR(100),
  company_name VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ✅ PRIORIDADES DE IMPLEMENTACIÓN

### 🔴 **Fase 1 - CRÍTICO (Hacer primero)**
1. ✅ Credenciales de portal (email + password)
2. ✅ Configuración de pagos (conceptos + montos)
3. ✅ Documentos del contrato (subir + descargar)
4. ✅ Cambiar "Propiedades de Interés" → "Propiedades Asignadas"

### 🟡 **Fase 2 - IMPORTANTE (Hacer después)**
5. Referencias personales y comerciales
6. Información específica por tipo de cliente
7. Checklist de documentos requeridos
8. Depósito y garantías

### 🟢 **Fase 3 - MEJORAS (Hacer al final)**
9. Verificación de identidad
10. Preferencias de comunicación
11. Información de onboarding
12. Generación automática de contratos

---

## 🎬 SIGUIENTE PASO

**¿Quieres que implemente la Fase 1 (CRÍTICO)?**
- Agregaré los campos de credenciales
- Agregaré configuración de pagos
- Agregaré sección de documentos
- Cambiaré el nombre de "Propiedades de Interés"

Solo confirma y empiezo a codificar! 🚀
