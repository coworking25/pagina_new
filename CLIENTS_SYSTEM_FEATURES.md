# SISTEMA DE GESTIÓN DE CLIENTES - FUNCIONALIDADES Y UI

## 🎯 TIPOS DE CLIENTES

### 1. **ARRENDATARIO (Tenant)**
- **Color:** Azul (`blue`)
- **Icono:** `Home` 
- **Descripción:** Cliente que arrienda una propiedad

### 2. **ARRENDADOR (Landlord)**
- **Color:** Verde (`green`)
- **Icono:** `Building` 
- **Descripción:** Cliente propietario que arrienda su propiedad

### 3. **COMPRADOR (Buyer)**
- **Color:** Naranja (`orange`)
- **Icono:** `ShoppingCart`
- **Descripción:** Cliente que compra una propiedad

### 4. **VENDEDOR (Seller)**
- **Color:** Púrpura (`purple`)
- **Icono:** `DollarSign`
- **Descripción:** Cliente que vende una propiedad

## 📊 ESTADOS DEL CLIENTE

### Estados Principales:
1. **ACTIVO** (`active`) - Verde ✅
2. **INACTIVO** (`inactive`) - Gris ⭕
3. **PENDIENTE** (`pending`) - Amarillo ⏳
4. **BLOQUEADO** (`blocked`) - Rojo ❌

## 🔧 FUNCIONALIDADES PRINCIPALES

### 📋 **1. GESTIÓN DE CLIENTES**

#### Botones de Acción:
- 👁️ **Ver Detalles** - `Eye` (Azul)
- ✏️ **Editar** - `Edit` (Verde)
- 🗑️ **Eliminar** - `Trash2` (Rojo)
- 📞 **Contactar** - `Phone` (Púrpura)
- 📄 **Documentos** - `FileText` (Gris)
- ⚠️ **Alertas** - `AlertTriangle` (Amarillo)
- 📝 **Contrato** - `Scroll` (Azul)
- 💰 **Pagos** - `CreditCard` (Verde)

#### Filtros Disponibles:
- **Por Tipo:** Todos, Arrendatario, Arrendador, Comprador, Vendedor
- **Por Estado:** Todos, Activo, Inactivo, Pendiente, Bloqueado
- **Por Asesor:** Dropdown con lista de asesores
- **Por Fecha:** Rango de fechas de registro
- **Búsqueda:** Nombre, documento, email, teléfono

### 📋 **2. FORMULARIOS**

#### **Formulario de Cliente:**
```typescript
interface ClientForm {
  // Información Personal
  full_name: string;
  document_type: 'cedula' | 'pasaporte' | 'nit';
  document_number: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Tipo y Estado
  client_type: 'tenant' | 'landlord' | 'buyer' | 'seller';
  status: 'active' | 'inactive' | 'pending' | 'blocked';
  
  // Información Financiera
  monthly_income?: number;
  occupation?: string;
  company_name?: string;
  
  // Asignación
  assigned_advisor_id?: string;
  notes?: string;
}
```

#### **Formulario de Contrato:**
```typescript
interface ContractForm {
  client_id: string;
  property_id: string;
  landlord_id?: string; // Solo si client es tenant
  contract_type: 'rental' | 'sale' | 'management';
  contract_number?: string;
  
  // Fechas
  start_date: string;
  end_date?: string;
  signature_date?: string;
  
  // Financiero
  monthly_rent?: number;
  deposit_amount?: number;
  administration_fee?: number;
  sale_price?: number;
  
  // Términos
  contract_duration_months?: number;
  renewal_type: 'automatic' | 'manual' | 'none';
  payment_day: number;
  late_fee_percentage: number;
  
  notes?: string;
}
```

### 🏠 **3. CARDS DE DETALLES**

#### **Card Principal del Cliente:**
```tsx
<ClientCard>
  <Header>
    <Avatar initials="JD" />
    <ClientInfo>
      <Name>Juan Diego Restrepo</Name>
      <TypeBadge type="tenant" />
      <StatusBadge status="active" />
    </ClientInfo>
    <ActionButtons>
      <ContactButton />
      <EditButton />
      <MoreOptionsDropdown />
    </ActionButtons>
  </Header>
  
  <Body>
    <ContactInfo>
      <Phone>+57 300 123 4567</Phone>
      <Email>juan@email.com</Email>
      <Address>Calle 123 #45-67, Medellín</Address>
    </ContactInfo>
    
    <FinancialInfo>
      <MonthlyIncome>$5,000,000</MonthlyIncome>
      <Occupation>Ingeniero</Occupation>
    </FinancialInfo>
    
    <ContractSummary>
      <ActiveContracts count="1" />
      <NextPayment amount="$1,500,000" date="2025-10-05" />
    </ContractSummary>
  </Body>
  
  <Footer>
    <LastActivity>Último contacto: Hace 3 días</LastActivity>
    <AssignedAdvisor>María García</AssignedAdvisor>
  </Footer>
</ClientCard>
```

#### **Card de Contrato:**
```tsx
<ContractCard>
  <Header>
    <ContractNumber>#CTR-2025-001</ContractNumber>
    <ContractType>Arrendamiento</ContractType>
    <StatusBadge status="active" />
  </Header>
  
  <PropertyInfo>
    <PropertyImage />
    <PropertyDetails>
      <Address>Apartamento 501, Torre A</Address>
      <MonthlyRent>$1,500,000</MonthlyRent>
    </PropertyDetails>
  </PropertyInfo>
  
  <ContractDates>
    <StartDate>01/01/2025</StartDate>
    <EndDate>31/12/2025</EndDate>
    <DaysRemaining>110 días</DaysRemaining>
  </ContractDates>
  
  <PaymentInfo>
    <NextPayment>05/10/2025</NextPayment>
    <PaymentStatus>Al día</PaymentStatus>
  </PaymentInfo>
  
  <Actions>
    <ViewContractButton />
    <PaymentHistoryButton />
    <RenewContractButton />
  </Actions>
</ContractCard>
```

### 💰 **4. GESTIÓN DE PAGOS**

#### **Estados de Pago:**
- ✅ **PAGADO** (`paid`) - Verde
- ⏳ **PENDIENTE** (`pending`) - Amarillo  
- 🔴 **VENCIDO** (`overdue`) - Rojo
- 📊 **PARCIAL** (`partial`) - Naranja

#### **Tipos de Pago:**
- 🏠 **Arriendo** (`rent`)
- 💰 **Depósito** (`deposit`)
- 🏢 **Administración** (`administration`)
- ⚡ **Servicios** (`utilities`)
- ⚠️ **Mora** (`late_fee`)

#### **Card de Pago:**
```tsx
<PaymentCard>
  <Header>
    <PaymentType>Arriendo Octubre 2025</PaymentType>
    <Amount>$1,500,000</Amount>
    <StatusBadge status="pending" />
  </Header>
  
  <Dates>
    <DueDate>05/10/2025</DueDate>
    <Period>01/10/2025 - 31/10/2025</Period>
  </Dates>
  
  <Actions>
    <MarkAsPaidButton />
    <SendReminderButton />
    <ViewReceiptButton />
  </Actions>
</PaymentCard>
```

### 📱 **5. SISTEMA DE COMUNICACIONES**

#### **Tipos de Comunicación:**
- 📞 **Llamada** (`call`) - `Phone`
- 📧 **Email** (`email`) - `Mail`
- 💬 **WhatsApp** (`whatsapp`) - `MessageCircle`
- 🤝 **Reunión** (`meeting`) - `Users`
- 🏠 **Visita** (`visit`) - `MapPin`

#### **Timeline de Comunicaciones:**
```tsx
<CommunicationTimeline>
  <TimelineItem>
    <Icon type="call" />
    <Content>
      <Title>Llamada telefónica</Title>
      <Description>Seguimiento pago de octubre</Description>
      <DateTime>12/09/2025 14:30</DateTime>
      <Advisor>María García</Advisor>
    </Content>
  </TimelineItem>
</CommunicationTimeline>
```

### 🔔 **6. SISTEMA DE ALERTAS**

#### **Tipos de Alertas:**
- 💰 **Pago Vencido** (`payment_due`) - Rojo
- 📅 **Contrato por Vencer** (`contract_expiring`) - Amarillo
- 📄 **Documento Faltante** (`document_missing`) - Naranja
- 📞 **Seguimiento Pendiente** (`follow_up`) - Azul
- 🔧 **Mantenimiento** (`maintenance`) - Púrpura

#### **Widget de Alertas:**
```tsx
<AlertsWidget>
  <Header>
    <Title>Alertas Activas</Title>
    <Count>{activeAlerts.length}</Count>
  </Header>
  
  <AlertsList>
    {alerts.map(alert => (
      <AlertItem key={alert.id}>
        <AlertIcon type={alert.type} />
        <AlertContent>
          <Title>{alert.title}</Title>
          <Description>{alert.description}</Description>
          <DueDate>{alert.due_date}</DueDate>
        </AlertContent>
        <AlertActions>
          <ResolveButton />
          <DismissButton />
        </AlertActions>
      </AlertItem>
    ))}
  </AlertsList>
</AlertsWidget>
```

### 📊 **7. DASHBOARD Y MÉTRICAS**

#### **KPIs Principales:**
- 👥 **Total Clientes**
- 🏠 **Contratos Activos**
- 💰 **Ingresos Mensuales**
- ⚠️ **Pagos Vencidos**
- 📅 **Contratos por Vencer**
- 📞 **Comunicaciones Pendientes**

#### **Gráficos Sugeridos:**
- **Línea:** Evolución de ingresos mensuales
- **Dona:** Distribución por tipo de cliente
- **Barras:** Pagos por mes
- **Área:** Contratos firmados en el tiempo

### 🔄 **8. FLUJOS DE TRABAJO**

#### **Flujo: Nuevo Cliente Arrendatario**
1. ✅ Crear cliente con información básica
2. ✅ Subir documentos requeridos
3. ✅ Crear contrato de arrendamiento
4. ✅ Configurar cronograma de pagos
5. ✅ Enviar contrato para firma
6. ✅ Activar contrato y alertas

#### **Flujo: Gestión de Pagos**
1. 🔔 Sistema genera alerta 5 días antes
2. 📱 Envío automático de recordatorio
3. 💳 Cliente realiza pago
4. ✅ Asesor confirma pago
5. 📧 Envío de recibo
6. 📊 Actualización de métricas

#### **Flujo: Renovación de Contrato**
1. 🔔 Alerta 60 días antes del vencimiento
2. 📞 Contacto con cliente
3. 📝 Negociación de términos
4. 📄 Generación de nuevo contrato
5. ✍️ Firma y activación

### 📱 **9. INTERFAZ MÓVIL**

#### **Características Responsivas:**
- 📱 **Cards adaptativas** con información condensada
- 🔍 **Búsqueda rápida** con filtros simplificados
- 📞 **Botones de contacto** prominentes
- 💰 **Gestión de pagos** optimizada para móvil
- 🔔 **Notificaciones push** para alertas importantes

### 🔐 **10. PERMISOS Y ROLES**

#### **Roles Sugeridos:**
- 👑 **Administrador:** Acceso completo
- 👤 **Asesor Senior:** Gestión completa de sus clientes
- 👤 **Asesor Junior:** Solo consulta y comunicaciones
- 📊 **Contador:** Solo información financiera
- 🏢 **Gerente:** Dashboard y reportes

### 📈 **11. REPORTES SUGERIDOS**

#### **Reportes Financieros:**
- 💰 **Estado de cuenta por cliente**
- 📊 **Resumen de ingresos mensual**
- 📈 **Proyección de ingresos**
- ⚠️ **Cartera vencida**

#### **Reportes Operativos:**
- 📅 **Contratos por vencer**
- 📞 **Seguimientos pendientes**
- 📄 **Documentos faltantes**
- 🏠 **Ocupación de propiedades**

### 🚀 **12. FUNCIONALIDADES AVANZADAS (Futuro)**

- 🤖 **Automatización de recordatorios**
- 📧 **Templates de email personalizables**
- 💳 **Integración con pasarelas de pago**
- 📱 **App móvil para clientes**
- 🔗 **Integración con sistemas contables**
- 📊 **BI y analytics avanzados**
- 🏠 **Portal del inquilino**
- 📷 **Gestión de inspecciones con fotos**
