# 📊 ANÁLISIS COMPLETO DE ARQUITECTURA DEL SISTEMA

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura General](#arquitectura-general)
4. [Base de Datos](#base-de-datos)
5. [Frontend](#frontend)
6. [Backend y Servicios](#backend-y-servicios)
7. [Flujo de Datos](#flujo-de-datos)
8. [Módulos del Sistema](#módulos-del-sistema)
9. [Seguridad](#seguridad)
10. [Despliegue y Ejecución](#despliegue-y-ejecución)
11. [Integrations](#integraciones)

---

## 🎯 RESUMEN EJECUTIVO

Este documento describe la arquitectura completa de la **Plataforma de Gestión Inmobiliaria**, un sistema integral construido para la administración de propiedades, clientes, citas y procesos inmobiliarios.

### Características Principales
- **Plataforma web completa** con interfaz pública y dashboards privados
- **Sistema multi-rol**: Administradores, Asesores y Clientes
- **Gestión integral** de propiedades, clientes, contratos y pagos
- **Portal del cliente** con acceso personalizado
- **Sistema de citas** con sincronización a Google Calendar
- **Analytics y reportes** en tiempo real
- **Notificaciones automáticas** y sistema de alertas

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
```
React 18.3.1          - Biblioteca UI principal
TypeScript 5.5.3      - Lenguaje de programación tipado
Vite 5.4.2            - Build tool y dev server
React Router 7.8.2    - Enrutamiento
Tailwind CSS 3.4.1    - Framework CSS utility-first
Framer Motion 12.x    - Animaciones
```

### Backend & Base de Datos
```
Supabase              - Backend as a Service (BaaS)
  ├── PostgreSQL      - Base de datos relacional
  ├── Auth            - Sistema de autenticación
  ├── Storage         - Almacenamiento de archivos
  └── Realtime        - Suscripciones en tiempo real
```

### Gestión de Estado y Datos
```
Zustand 5.0.8         - State management global
React Hook Form 7.x   - Manejo de formularios
Zod 4.3.5             - Validación de schemas
date-fns 4.1.0        - Manipulación de fechas
```

### Librerías de UI y Utilidades
```
Lucide React          - Iconos
React Big Calendar    - Componente de calendario
Recharts 3.2.1        - Gráficas y visualización de datos
jsPDF 3.0.3           - Generación de PDFs
ExcelJS 4.4.0         - Exportación a Excel
React Hot Toast       - Notificaciones toast
```

### Servicios Externos
```
Google Calendar API   - Integración de calendario
SendGrid             - Envío de emails (configurado)
Twilio               - SMS y WhatsApp (configurado)
```

---

## 🏗️ ARQUITECTURA GENERAL

### Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                       USUARIOS FINALES                       │
├──────────────┬──────────────┬──────────────┬───────────────┤
│   Visitantes │ Administrador│   Asesores   │   Clientes    │
│   (Público)  │    (Admin)   │  (Advisors)  │  (Portal)     │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬────────┘
       │              │              │              │
       └──────────────┴──────────────┴──────────────┘
                      │
       ┌──────────────▼──────────────┐
       │   REACT SPA (TypeScript)    │
       │   ┌─────────────────────┐   │
       │   │  React Router v7    │   │
       │   │  ├─ Rutas Públicas  │   │
       │   │  ├─ Rutas Admin     │   │
       │   │  └─ Rutas Cliente   │   │
       │   └─────────────────────┘   │
       │                              │
       │   ┌─────────────────────┐   │
       │   │  State Management   │   │
       │   │  ├─ Zustand Store   │   │
       │   │  ├─ Context API     │   │
       │   │  └─ Local State     │   │
       │   └─────────────────────┘   │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼───────────────┐
       │  CAPA DE SERVICIOS (lib/)    │
       │  ├─ supabase.ts (Cliente)    │
       │  ├─ clientsApi.ts            │
       │  ├─ paymentsApi.ts           │
       │  ├─ analytics.ts             │
       │  ├─ emailService.ts          │
       │  └─ notificationService.ts   │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼───────────────┐
       │      SUPABASE (BaaS)         │
       │  ┌───────────────────────┐   │
       │  │  PostgreSQL Database  │   │
       │  │  ├─ 40+ Tablas        │   │
       │  │  ├─ RLS Policies      │   │
       │  │  ├─ Triggers          │   │
       │  │  └─ Functions         │   │
       │  └───────────────────────┘   │
       │                              │
       │  ┌───────────────────────┐   │
       │  │   Authentication      │   │
       │  │  ├─ Email/Password    │   │
       │  │  ├─ Sessions          │   │
       │  │  └─ JWT Tokens        │   │
       │  └───────────────────────┘   │
       │                              │
       │  ┌───────────────────────┐   │
       │  │   Storage Buckets     │   │
       │  │  ├─ property-images   │   │
       │  │  ├─ property-videos   │   │
       │  │  ├─ client-documents  │   │
       │  │  ├─ advisor-photos    │   │
       │  │  └─ contracts         │   │
       │  └───────────────────────┘   │
       │                              │
       │  ┌───────────────────────┐   │
       │  │   Realtime            │   │
       │  │  ├─ Subscriptions     │   │
       │  │  ├─ Presence          │   │
       │  │  └─ Broadcasts        │   │
       │  └───────────────────────┘   │
       └──────────────┬───────────────┘
                      │
       ┌──────────────▼───────────────┐
       │  INTEGRACIONES EXTERNAS      │
       │  ├─ Google Calendar API      │
       │  ├─ SendGrid (Email)         │
       │  └─ Twilio (SMS/WhatsApp)    │
       └──────────────────────────────┘
```

### Patrón de Arquitectura
- **Arquitectura SPA (Single Page Application)** con React
- **Patrón BaaS (Backend as a Service)** utilizando Supabase
- **Separación clara entre capas**: Presentación, Lógica de Negocio y Datos
- **Code Splitting** para optimización de carga
- **Lazy Loading** de componentes pesados

---

## 🗄️ BASE DE DATOS

### Estructura de Base de Datos PostgreSQL (Supabase)

#### Tablas Principales (40+ tablas en total)

##### 1. Módulo de Propiedades
```
properties                    - Propiedades inmobiliarias
├─ id (bigint)
├─ title, description
├─ property_type, operation_type
├─ price, area, bedrooms, bathrooms
├─ city, neighborhood, address
├─ latitude, longitude
├─ images (text[])
├─ videos (jsonb)
├─ amenities (jsonb)
├─ status (disponible, vendida, arrendada)
├─ property_code (auto-generado)
└─ created_at, updated_at

property_internal_notes       - Notas internas de propiedades
property_appointments         - Relación propiedades-citas
amenities                     - Catálogo de amenidades
price_history                 - Historial de precios
```

##### 2. Módulo de Clientes
```
clients                       - Información de clientes
├─ id (uuid)
├─ full_name, document_type, document_number
├─ phone, email, address, city
├─ client_type (tenant, landlord, buyer, seller)
├─ status (active, inactive, pending, blocked)
├─ monthly_income, occupation
├─ assigned_advisor_id
└─ created_at, updated_at

contracts                     - Contratos de clientes
├─ id (uuid)
├─ client_id → clients
├─ property_id → properties
├─ landlord_id → clients
├─ contract_type (rental, sale, management)
├─ start_date, end_date
├─ monthly_rent, deposit_amount
├─ status (active, expired, terminated)
└─ special_conditions (jsonb)

payments                      - Pagos de clientes
├─ id (uuid)
├─ contract_id → contracts
├─ client_id → clients
├─ payment_type (rent, deposit, administration)
├─ amount, amount_paid
├─ status (pending, paid, overdue)
├─ due_date, payment_date
└─ payment_method

client_documents              - Documentos de clientes
├─ id (uuid)
├─ client_id → clients
├─ document_type
├─ file_name, file_url, file_size
└─ uploaded_by → advisors

client_communications         - Historial de comunicaciones
├─ id (uuid)
├─ client_id → clients
├─ communication_type (call, email, whatsapp, meeting)
├─ subject, description, outcome
├─ status, follow_up_required
└─ communication_date

client_alerts                 - Alertas relacionadas a clientes
├─ id (uuid)
├─ client_id → clients
├─ alert_type (payment_due, contract_expiring, etc.)
├─ title, description
├─ priority (low, medium, high, urgent)
├─ status (active, resolved, dismissed)
└─ due_date

client_portal_credentials     - Credenciales del portal
├─ id (uuid)
├─ client_id → clients
├─ email (unique)
├─ password_hash
├─ must_change_password
├─ portal_access_enabled
└─ last_login

client_payment_config         - Configuración de pagos
├─ id (uuid)
├─ client_id → clients
├─ payment_day
├─ payment_concepts (jsonb)
└─ auto_generate_payments

client_references             - Referencias personales
├─ id (uuid)
├─ client_id → clients
├─ reference_type (personal, commercial)
├─ full_name, phone, email
└─ relationship

client_contract_info          - Info extendida del contrato
├─ id (uuid)
├─ client_id → clients
├─ contract_id → contracts
├─ deposit_info (jsonb)
├─ guarantor_info (jsonb)
└─ onboarding_checklist (jsonb)
```

##### 3. Módulo de Asesores
```
advisors                      - Asesores inmobiliarios
├─ id (uuid)
├─ name, email, phone
├─ photo_url
├─ specialization
├─ bio, experience
├─ is_active
├─ availability_schedule (jsonb)
└─ created_at, updated_at

advisor_availability          - Disponibilidad de asesores
├─ id (uuid)
├─ advisor_id → advisors
├─ day_of_week
├─ start_time, end_time
└─ is_available

availability_exceptions       - Excepciones de disponibilidad
├─ id (uuid)
├─ advisor_id → advisors
├─ exception_date
├─ reason
└─ is_available
```

##### 4. Módulo de Citas y Calendario
```
appointments                  - Citas del sistema
├─ id (uuid)
├─ title, description
├─ start_time, end_time, all_day
├─ client_id → clients
├─ advisor_id → advisors
├─ property_id → properties
├─ appointment_type (meeting, viewing, consultation)
├─ status (scheduled, confirmed, completed, cancelled)
├─ contact_name, contact_email, contact_phone
├─ google_event_id
├─ sync_status (synced, pending, failed)
└─ created_at, updated_at

calendar_settings             - Configuración del calendario
├─ id (uuid)
├─ advisor_id → advisors
├─ default_duration
├─ buffer_time
└─ working_hours (jsonb)
```

##### 5. Módulo de Consultas
```
service_inquiries             - Consultas de servicios
├─ id (uuid)
├─ service_name
├─ customer_name, email, phone
├─ message
├─ status (pending, contacted, closed)
├─ priority (low, normal, high)
├─ assigned_to → advisors
├─ response, resolution_notes
└─ created_at, updated_at
```

##### 6. Módulo de Analytics
```
analytics_property_views      - Vistas de propiedades
├─ id (uuid)
├─ property_id → properties
├─ user_id (nullable)
├─ session_id
├─ viewed_at
├─ source, referrer
└─ device_info (jsonb)

analytics_inquiries           - Analytics de consultas
├─ id (uuid)
├─ inquiry_id → service_inquiries
├─ inquiry_type
├─ source
└─ created_at

analytics_appointments        - Analytics de citas
├─ id (uuid)
├─ appointment_id → appointments
├─ appointment_type
├─ status
└─ created_at
```

##### 7. Módulo de Autenticación y Usuarios
```
system_users                  - Usuarios del sistema admin
├─ id (uuid)
├─ email (unique)
├─ password_hash
├─ full_name
├─ role (admin, advisor, client)
├─ status (active, inactive, suspended)
├─ phone, avatar_url
├─ last_login_at
├─ login_attempts
├─ preferences (jsonb)
└─ permissions (jsonb)

user_sessions                 - Sesiones de usuario
├─ id (uuid)
├─ user_id → system_users
├─ session_token
├─ expires_at
├─ ip_address
└─ is_active

access_logs                   - Logs de acceso
├─ id (uuid)
├─ user_id → system_users
├─ action (login, logout, failed_login)
├─ ip_address
└─ created_at

user_profiles                 - Perfiles de usuario
├─ id (uuid)
├─ email, full_name, role
├─ avatar_url
└─ created_at
```

##### 8. Módulo de Notificaciones y Alertas
```
admin_notifications           - Notificaciones para admins
├─ id (uuid)
├─ user_id → user_profiles
├─ notification_type
├─ title, message
├─ priority (low, normal, high, urgent)
├─ is_read, is_dismissed
├─ action_url
└─ created_at

admin_alerts                  - Alertas del sistema para admins
├─ id (uuid)
├─ user_id → user_profiles
├─ alert_type (new_appointment, payment_overdue, etc.)
├─ severity (low, medium, high)
├─ title, message
├─ entity_id, entity_type
├─ is_read, is_dismissed
└─ created_at

client_notifications          - Notificaciones para clientes
├─ id (uuid)
├─ client_id → clients
├─ notification_type
├─ title, message
├─ is_read
└─ created_at

push_subscriptions            - Suscripciones push
├─ id (uuid)
├─ user_id → user_profiles
├─ subscription (jsonb)
└─ created_at

automation_rules              - Reglas de automatización
├─ id (uuid)
├─ name, description
├─ rule_type (alert_generation, reminder, workflow)
├─ trigger_event
├─ conditions (jsonb)
├─ actions (jsonb)
├─ target_user_type (client, admin, both)
├─ is_active
└─ created_at

automation_schedules          - Tareas programadas
├─ id (uuid)
├─ rule_id → automation_rules
├─ scheduled_for
├─ status (pending, executed, failed)
├─ retry_count
└─ last_error

automation_logs               - Logs de automatización
├─ id (uuid)
├─ rule_id → automation_rules
├─ execution_status (success, failure)
├─ error_message
└─ executed_at
```

##### 9. Módulo de Auditoría
```
audit_logs                    - Logs de auditoría generales
├─ id (bigint)
├─ table_name
├─ record_id
├─ action (INSERT, UPDATE, DELETE)
├─ old_data (jsonb)
├─ new_data (jsonb)
├─ changed_by → auth.users
├─ user_email
└─ changed_at
```

##### 10. Módulo de Configuración
```
settings                      - Configuraciones del sistema
├─ id (serial)
├─ key (unique)
├─ value (jsonb)
└─ created_at, updated_at
```

### Relaciones Clave

```
┌─────────────┐
│  properties │────────┐
└─────────────┘        │
                       │
┌─────────────┐        │    ┌───────────────┐
│   clients   │────────┼───▶│  contracts    │
└─────────────┘        │    └───────────────┘
      │                │           │
      │                │           │
      ▼                ▼           ▼
┌─────────────┐   ┌──────────┐  ┌──────────┐
│  documents  │   │ property  │  │ payments │
└─────────────┘   │appointments│  └──────────┘
                  └──────────┘
                       │
                       ▼
                  ┌──────────────┐
                  │ appointments │
                  └──────────────┘
                       │
                       ▼
                  ┌──────────────┐
                  │   advisors   │
                  └──────────────┘
```

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS habilitadas:
- **Admins**: Acceso completo a todos los recursos
- **Advisors**: Acceso a sus clientes asignados y propiedades
- **Clients**: Acceso solo a sus propios datos en el portal

---

## 💻 FRONTEND

### Estructura de Directorios

```
src/
├── components/              # Componentes reutilizables
│   ├── Admin/              # Componentes del dashboard admin
│   ├── Auth/               # Componentes de autenticación
│   ├── Calendar/           # Componentes del calendario
│   ├── client-portal/      # Componentes del portal del cliente
│   ├── Home/               # Componentes de la página principal
│   ├── Layout/             # Layouts (Header, Footer, AdminLayout)
│   ├── Modals/             # Modales reutilizables
│   ├── Notifications/      # Sistema de notificaciones
│   ├── Properties/         # Componentes de propiedades
│   ├── Settings/           # Componentes de configuración
│   ├── UI/                 # Componentes UI genéricos
│   └── wizard/             # Wizard para nuevo cliente
│
├── pages/                  # Páginas principales (rutas)
│   ├── client-portal/      # Páginas del portal del cliente
│   ├── Home.tsx            # Página de inicio pública
│   ├── Properties.tsx      # Lista de propiedades
│   ├── PropertyDetail.tsx  # Detalle de propiedad
│   ├── Services.tsx        # Servicios
│   ├── Login.tsx           # Login
│   ├── AdminDashboard.tsx  # Dashboard administrativo
│   ├── AdminClients.tsx    # Gestión de clientes
│   ├── AdminProperties.tsx # Gestión de propiedades
│   ├── AdminAppointments.tsx # Gestión de citas
│   └── ...                 # Otras páginas admin
│
├── lib/                    # Capa de servicios y lógica
│   ├── supabase.ts         # Cliente de Supabase + funciones CRUD
│   ├── clientsApi.ts       # API para clientes
│   ├── paymentsApi.ts      # API para pagos
│   ├── analytics.ts        # Servicio de analytics
│   ├── emailService.ts     # Servicio de emails
│   ├── notificationService.ts # Servicio de notificaciones
│   ├── automation.ts       # Sistema de automatización
│   ├── calendarService.ts  # Servicio de calendario
│   ├── client-portal/      # Servicios del portal del cliente
│   └── schemas/            # Schemas de validación (Zod)
│
├── contexts/               # Context API de React
│   ├── AuthContext.tsx     # Contexto de autenticación
│   ├── NotificationContext.tsx # Contexto de notificaciones
│   ├── AdminBadgeContext.tsx   # Contador de notificaciones
│   └── AppStateContext.tsx     # Estado global de la app
│
├── store/                  # Zustand stores
│   └── modalStore.ts       # Estado de modales
│
├── hooks/                  # Custom hooks
│   ├── useAuth.ts          # Hook de autenticación
│   ├── useClients.ts       # Hook para clientes
│   └── ...
│
├── types/                  # Definiciones de tipos TypeScript
│   ├── index.ts            # Tipos principales
│   ├── client.ts           # Tipos de clientes
│   └── ...
│
├── utils/                  # Funciones utilitarias
│   ├── formatters.ts       # Formateadores
│   ├── validators.ts       # Validadores
│   └── ...
│
├── styles/                 # Estilos globales
│   └── keyframes.css       # Animaciones CSS
│
├── App.tsx                 # Componente raíz
├── main.tsx                # Punto de entrada
└── index.css               # Estilos base (Tailwind)
```

### Sistema de Rutas

```typescript
// Rutas Públicas
/                           # Página de inicio
/properties                 # Listado de propiedades
/property/:id               # Detalle de propiedad
/services                   # Servicios
/services/:serviceId        # Detalle de servicio
/advisors                   # Listado de asesores
/contact                    # Contacto
/faq                        # Preguntas frecuentes
/login                      # Login
/reset-password             # Recuperar contraseña

// Rutas Admin (Protegidas)
/admin                      # Dashboard admin
/admin/properties           # Gestión de propiedades
/admin/clients              # Gestión de clientes
/admin/advisors             # Gestión de asesores
/admin/appointments         # Gestión de citas
/admin/inquiries            # Gestión de consultas
/admin/alerts               # Alertas del sistema
/admin/reports              # Reportes
/admin/calendar             # Calendario
/admin/settings             # Configuraciones
/admin/profile              # Perfil del usuario
/admin/audit-logs           # Logs de auditoría

// Rutas Cliente (Protegidas)
/cliente                    # Dashboard del cliente
/cliente/pagos              # Pagos del cliente
/cliente/contratos          # Contratos del cliente
/cliente/propiedades        # Propiedades del cliente
/cliente/documentos         # Documentos del cliente
/cliente/extractos          # Extractos del cliente
/cliente/alertas            # Alertas del cliente
/cliente/perfil             # Perfil del cliente
/cliente/cambiar-password   # Cambiar contraseña
```

### Componentes Principales

#### 1. Header y Navigation
- **Header.tsx**: Navegación principal responsive
- **Footer.tsx**: Pie de página con información de contacto
- **AdminLayout.tsx**: Layout del dashboard admin con sidebar

#### 2. Gestión de Propiedades
- **PropertyCard**: Tarjeta de propiedad con imagen, detalles y acciones
- **PropertyFilters**: Filtros de búsqueda avanzados
- **PropertyGallery**: Galería de imágenes con lightbox
- **PropertyFormModal**: Formulario para crear/editar propiedades
- **CoverImageSelector**: Selector de imagen de portada
- **VideoPlayer**: Reproductor de videos de propiedades

#### 3. Gestión de Clientes
- **ClientWizard**: Wizard multi-paso para crear clientes
- **ClientDetailsEnhanced**: Vista detallada de cliente
- **ClientEditForm**: Formulario de edición de cliente
- **CreatePortalCredentialsModal**: Crear credenciales del portal

#### 4. Calendario y Citas
- **Calendar Component**: Calendario interactivo (React Big Calendar)
- **AppointmentModal**: Modal para agendar citas
- **AppointmentDetailsModal**: Detalles de una cita
- **AvailabilitySelector**: Selector de disponibilidad de asesores

#### 5. Dashboard y Analytics
- **DashboardStats**: Estadísticas principales
- **Charts**: Gráficas de analytics (Recharts)
- **RecentActivity**: Actividad reciente
- **AlertsBadge**: Contador de alertas

#### 6. Portal del Cliente
- **ClientLayout**: Layout del portal del cliente
- **ClientDashboard**: Dashboard con resumen de pagos y contratos
- **ClientPayments**: Vista de pagos del cliente
- **ClientContracts**: Vista de contratos
- **ClientDocuments**: Vista de documentos

#### 7. Notificaciones y Alertas
- **NotificationCenter**: Centro de notificaciones
- **AlertsPanel**: Panel de alertas
- **ToastNotifications**: Notificaciones toast (React Hot Toast)

### State Management

#### Zustand Store (modalStore.ts)
```typescript
// Estado global de modales
interface ModalStore {
  isOpen: boolean;
  modalType: string | null;
  modalData: any;
  openModal: (type, data) => void;
  closeModal: () => void;
}
```

#### Context API
1. **AuthContext**: Manejo de autenticación y sesión del usuario
2. **NotificationContext**: Sistema de notificaciones en tiempo real
3. **AdminBadgeContext**: Contador de notificaciones no leídas
4. **AppStateContext**: Estado global de la aplicación

---

## ⚙️ BACKEND Y SERVICIOS

### Supabase Client (lib/supabase.ts)

Cliente singleton de Supabase con funciones CRUD para todas las entidades:

#### Funciones Principales

##### Propiedades
```typescript
// CRUD de propiedades
getProperties(filters?) → Property[]
getPropertyById(id) → Property
createProperty(data) → Property
updateProperty(id, data) → Property
deleteProperty(id) → boolean
uploadPropertyImage(file) → string
deletePropertyImage(url) → boolean
```

##### Clientes
```typescript
// CRUD de clientes
getClients(filters?) → Client[]
getClientById(id) → Client
createClient(data) → Client
updateClient(id, data) → Client
deleteClient(id) → boolean
```

##### Citas
```typescript
// CRUD de citas
getAppointments(filters?) → Appointment[]
getAppointmentById(id) → Appointment
createAppointment(data) → Appointment
updateAppointment(id, data) → Appointment
deleteAppointment(id) → boolean
syncToGoogleCalendar(appointmentId) → boolean
```

##### Analytics
```typescript
// Tracking de analytics
trackPropertyView(propertyId, metadata) → void
getPropertyViewsCount(propertyId) → number
getAnalyticsSummary(dateRange) → AnalyticsSummary
```

### Servicios Especializados

#### 1. clientsApi.ts
```typescript
// Operaciones complejas de clientes
getClientsWithRelations() → ClientFull[]
getClientPaymentHistory(clientId) → Payment[]
getClientContracts(clientId) → Contract[]
getClientDocuments(clientId) → Document[]
getClientCommunications(clientId) → Communication[]
generateClientReport(clientId) → Report
```

#### 2. paymentsApi.ts
```typescript
// Gestión de pagos
createPayment(data) → Payment
updatePaymentStatus(id, status) → Payment
generatePaymentSchedule(contractId) → Payment[]
getOverduePayments() → Payment[]
generateReceipt(paymentId) → PDF
```

#### 3. emailService.ts
```typescript
// Envío de emails
sendWelcomeEmail(client, credentials) → void
sendPaymentReminder(client, payment) → void
sendAppointmentConfirmation(appointment) → void
sendPasswordReset(email, token) → void
```

#### 4. notificationService.ts
```typescript
// Notificaciones multi-canal
sendNotification(userId, notification) → void
sendPushNotification(userId, message) → void
sendSMS(phone, message) → void
sendWhatsApp(phone, message) → void
```

#### 5. automation.ts
```typescript
// Sistema de automatización
processAutomationRules() → void
generateAutomaticAlerts() → Alert[]
scheduleReminders() → void
executeWorkflows() → void
```

#### 6. calendarService.ts
```typescript
// Integración con Google Calendar
syncAppointment(appointment) → GoogleEvent
deleteGoogleEvent(eventId) → boolean
updateGoogleEvent(eventId, data) → GoogleEvent
getAdvisorAvailability(advisorId, date) → TimeSlot[]
```

#### 7. analytics.ts
```typescript
// Analytics avanzado
getDashboardStats() → DashboardStats
getPropertyAnalytics(propertyId) → PropertyAnalytics
getInquiriesAnalytics() → InquiryStats
getAppointmentsAnalytics() → AppointmentStats
generateReports(type, filters) → Report
```

---

## 🔄 FLUJO DE DATOS

### Flujo de Autenticación

```
┌─────────────┐
│   Usuario   │
│  ingresa    │
│ credenciales│
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  AuthContext        │
│  validateLogin()    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Supabase Auth      │
│  signInWithPassword │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Verificar rol      │
│  (system_users)     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Crear sesión       │
│  Guardar en Context │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Redirigir según    │
│  rol del usuario    │
│  (/admin o /cliente)│
└─────────────────────┘
```

### Flujo de Creación de Cliente

```
┌─────────────────────┐
│  Admin: Completa    │
│  ClientWizard       │
│  (5 pasos)          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Validación con     │
│  Zod Schema         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  clientsApi.ts      │
│  createClient()     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  Supabase - Transacción                 │
│  1. INSERT en clients                   │
│  2. INSERT en client_portal_credentials │
│  3. INSERT en client_payment_config     │
│  4. INSERT en client_contract_info      │
│  5. INSERT en client_references         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────┐
│  emailService       │
│  sendWelcomeEmail() │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  automation         │
│  createAlert()      │
│  (nuevo_cliente)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Notificación toast │
│  "Cliente creado"   │
└─────────────────────┘
```

### Flujo de Visualización de Propiedad

```
┌─────────────────────┐
│  Usuario visita     │
│  /property/:id      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  PropertyDetail.tsx │
│  useEffect()        │
└──────┬──────────────┘
       │
       ├──────────────────────┐
       │                      │
       ▼                      ▼
┌─────────────────┐   ┌──────────────────┐
│  getPropertyById│   │  trackPropertyView│
│  (supabase.ts)  │   │  (analytics.ts)  │
└──────┬──────────┘   └──────────────────┘
       │
       ▼
┌─────────────────────┐
│  Renderizar         │
│  - Galería          │
│  - Detalles         │
│  - Mapa             │
│  - Videos           │
│  - Formulario       │
└─────────────────────┘
```

### Flujo de Sistema de Pagos

```
┌─────────────────────┐
│  automation.ts      │
│  Cron Job diario    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Buscar pagos       │
│  próximos a vencer  │
│  (due_date - 7 días)│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Para cada pago:    │
│  - Crear alerta     │
│  - Enviar email     │
│  - Push notification│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Cliente ve alerta  │
│  en portal          │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Admin marca pago   │
│  como "paid"        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  - Resolver alerta  │
│  - Crear audit_log  │
│  - Notificar cliente│
└─────────────────────┘
```

---

## 📦 MÓDULOS DEL SISTEMA

### 1. Módulo de Propiedades

**Funcionalidades:**
- Listado con búsqueda y filtros avanzados
- CRUD completo de propiedades
- Galería de imágenes con selector de portada
- Videos de propiedades con thumbnails
- Geolocalización con mapas
- Amenidades configurables
- Códigos automáticos (ej: CA-001, AP-002)
- Estados (Disponible, Vendida, Arrendada)
- Tracking de vistas (analytics)
- Notas internas
- Exportación a Excel

**Componentes clave:**
- AdminProperties.tsx (4698 líneas - gestión completa)
- PropertyDetail.tsx (vista pública)
- PropertyCard.tsx
- PropertyFormModal.tsx

### 2. Módulo de Clientes

**Funcionalidades:**
- Wizard de 5 pasos para nuevo cliente
- Información personal y financiera
- Gestión de contratos
- Historial de pagos
- Documentos del cliente
- Comunicaciones y seguimiento
- Referencias personales/comerciales
- Portal del cliente con credenciales
- Alertas automáticas
- Exportación de datos

**Componentes clave:**
- AdminClients.tsx (2534 líneas - gestión completa)
- ClientWizard (5 pasos)
- ClientDetailsEnhanced.tsx
- Portal del cliente (carpeta client-portal/)

### 3. Módulo de Citas y Calendario

**Funcionalidades:**
- Calendario interactivo (React Big Calendar)
- Agendar citas con cliente, asesor y propiedad
- Sincronización con Google Calendar
- Disponibilidad de asesores
- Estados de citas (programada, confirmada, completada, cancelada)
- Recordatorios automáticos
- Vista por día/semana/mes
- Filtros por asesor y estado

**Componentes clave:**
- AdminAppointments.tsx (1435 líneas)
- AdminCalendar.tsx
- Calendar component (react-big-calendar)
- calendarService.ts

### 4. Módulo de Pagos

**Funcionalidades:**
- Configuración de conceptos de pago
- Generación automática de pagos recurrentes
- Estados (pendiente, pagado, vencido, parcial)
- Registro de pagos con método
- Alertas de pagos próximos a vencer
- Calendario de pagos
- Recibos en PDF
- Extractos para clientes

**Componentes clave:**
- ClientPayments.tsx (portal)
- paymentsApi.ts
- receiptsApi.ts
- paymentCalculations.ts

### 5. Módulo de Consultas

**Funcionalidades:**
- Formulario de contacto público
- Gestión de consultas (service_inquiries)
- Asignación a asesores
- Estados (pendiente, contactado, cerrado)
- Prioridades
- Notas de resolución
- Tracking en analytics

**Componentes clave:**
- AdminInquiries.tsx (1409 líneas)
- Contact.tsx (formulario público)

### 6. Módulo de Asesores

**Funcionalidades:**
- CRUD de asesores
- Foto de perfil
- Especialización y biografía
- Horarios de disponibilidad
- Excepciones de calendario
- Asignación de clientes
- Vista pública de asesores

**Componentes clave:**
- AdminAdvisors.tsx
- Advisors.tsx (página pública)
- AdvisorFormModal.tsx

### 7. Módulo de Notificaciones y Alertas

**Funcionalidades:**
- Notificaciones en tiempo real (Supabase Realtime)
- Alertas automáticas programadas
- Push notifications
- Emails transaccionales
- SMS y WhatsApp (configurado)
- Centro de notificaciones
- Badges con contadores
- Prioridades y severidades

**Componentes clave:**
- AdminAlerts.tsx
- NotificationCenter
- adminAlerts.ts
- adminNotifications.ts
- automation.ts

### 8. Módulo de Reportes y Analytics

**Funcionalidades:**
- Dashboard con estadísticas
- Gráficas interactivas (Recharts)
- Analytics de propiedades (vistas)
- Analytics de consultas
- Analytics de citas
- Reportes exportables
- Filtros por fecha

**Componentes clave:**
- AdminDashboard.tsx
- AdminReports.tsx
- analytics.ts
- analytics-expanded.ts

### 9. Portal del Cliente

**Funcionalidades:**
- Login independiente
- Dashboard personalizado
- Mis pagos (historial y pendientes)
- Mis contratos
- Mis propiedades
- Mis documentos
- Extractos descargables
- Alertas personales
- Cambio de contraseña
- Mi perfil

**Componentes clave:**
- ClientLayout.tsx
- ClientDashboard.tsx
- ClientPayments.tsx
- ClientContracts.tsx
- ClientProperties.tsx
- ClientDocuments.tsx
- ClientExtractos.tsx
- ClientAlerts.tsx

### 10. Módulo de Configuración

**Funcionalidades:**
- Información de la empresa
- Configuración de contacto
- Horarios de atención
- Redes sociales
- Configuración de emails
- Preferencias del sistema

**Componentes clave:**
- AdminSettings.tsx
- settings table (base de datos)

---

## 🔒 SEGURIDAD

### Row Level Security (RLS)

Todas las tablas implementan políticas RLS en Supabase:

```sql
-- Ejemplo de política RLS para clients
CREATE POLICY "Admins have full access" 
ON clients
FOR ALL
USING (EXISTS (
  SELECT 1 FROM system_users 
  WHERE id = auth.uid() 
  AND role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM system_users 
  WHERE id = auth.uid() 
  AND role = 'admin'
));

-- Política para clientes (solo ven sus propios datos)
CREATE POLICY "Clients can view own data" 
ON clients
FOR SELECT
USING (id = auth.uid());
```

### Autenticación

- **Sistema:** Supabase Auth + sistema custom de system_users
- **Tokens:** JWT tokens manejados por Supabase
- **Sesiones:** Tabla user_sessions con expiración
- **Passwords:** Hashing con bcryptjs
- **Recuperación:** Sistema de reset password con tokens

### Validación de Datos

- **Frontend:** Zod schemas para validación de formularios
- **Backend:** Constraints en base de datos (CHECK, UNIQUE, NOT NULL)
- **Sanitización:** Prevención de SQL injection (prepared statements de Supabase)

### Permisos

```typescript
// Roles del sistema
type UserRole = 'admin' | 'advisor' | 'client';

// Sistema de permisos
const permissions = {
  admin: ['all'], // Acceso total
  advisor: [
    'view_clients',
    'edit_clients',
    'view_properties',
    'edit_properties',
    'manage_appointments'
  ],
  client: [
    'view_own_data',
    'view_own_payments',
    'view_own_documents'
  ]
};
```

### Logs de Auditoría

Sistema completo de auditoría en tabla `audit_logs`:
- Todos los INSERT, UPDATE, DELETE
- Usuario que realizó la acción
- Valores anteriores y nuevos (JSONB)
- Timestamp
- IP address (en access_logs)

---

## 🚀 DESPLIEGUE Y EJECUCIÓN

### Variables de Entorno

```env
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxx

# Google Calendar (opcional)
VITE_GOOGLE_CLIENT_ID=xxxxx
VITE_GOOGLE_CLIENT_SECRET=xxxxx
VITE_GOOGLE_REDIRECT_URI=xxxxx

# SendGrid (opcional)
VITE_SENDGRID_API_KEY=xxxxx
VITE_FROM_EMAIL=noreply@example.com

# Twilio (opcional)
VITE_TWILIO_ACCOUNT_SID=xxxxx
VITE_TWILIO_AUTH_TOKEN=xxxxx
VITE_TWILIO_PHONE_NUMBER=xxxxx
```

### Scripts Disponibles

```json
{
  "dev": "vite",                    // Servidor de desarrollo
  "build": "vite build",            // Build para producción
  "preview": "vite preview",        // Preview del build
  "lint": "eslint .",               // Linting
  "lint:fix": "eslint . --fix",     // Fix automático
  "type-check": "tsc --noEmit"      // Verificación de tipos
}
```

### Desarrollo Local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env (copiar de .env.example)
cp .env.example .env

# 3. Iniciar servidor de desarrollo
npm run dev

# La aplicación estará en http://localhost:5173
```

### Build de Producción

```bash
# Build
npm run build

# El output estará en dist/
# Deploy a Vercel, Netlify, etc.
```

### Estructura del Build

```
dist/
├── index.html              # HTML principal
├── assets/
│   ├── index-[hash].js     # JavaScript bundle
│   ├── index-[hash].css    # CSS bundle
│   └── ...                 # Assets estáticos
└── ...
```

---

## 🔗 INTEGRACIONES

### 1. Google Calendar API

**Propósito:** Sincronización bidireccional de citas

**Flujo:**
```
Appointment creada en sistema
    ↓
calendarService.syncAppointment()
    ↓
POST a Google Calendar API
    ↓
Guardar google_event_id en DB
    ↓
Cambios en Google → Webhook → Actualizar DB
```

**Archivos:**
- `src/services/googleCalendar.ts`
- `src/services/googleCalendarService.ts`
- `supabase/functions/google-calendar/`

### 2. SendGrid (Email)

**Propósito:** Envío de emails transaccionales

**Tipos de emails:**
- Bienvenida a nuevo cliente
- Credenciales del portal
- Recordatorios de pago
- Confirmación de citas
- Reset de contraseña

**Archivos:**
- `src/lib/emailService.ts`
- `src/lib/email-templates.ts`

### 3. Twilio (SMS/WhatsApp)

**Propósito:** Notificaciones por SMS y WhatsApp

**Uso:**
- Recordatorios urgentes
- Confirmaciones de citas
- Alertas de pagos vencidos

**Archivos:**
- `src/services/notificationService.ts`

### 4. Vercel Speed Insights

**Propósito:** Monitoreo de performance

**Implementación:**
```typescript
import { SpeedInsights } from '@vercel/speed-insights/react';

<SpeedInsights />
```

---

## 📈 PERFORMANCE Y OPTIMIZACIONES

### Code Splitting

```typescript
// Lazy loading de páginas
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProperties = lazy(() => import('./pages/AdminProperties'));
// ... etc
```

### Optimizaciones Implementadas

1. **Singleton de Supabase client**: Evita múltiples instancias
2. **Paginación**: En listados grandes (propiedades, clientes)
3. **Imágenes optimizadas**: Supabase Storage con transformaciones
4. **Lazy loading de imágenes**: Carga diferida en galerías
5. **Memoización**: React.memo en componentes pesados
6. **Suspense boundaries**: Para code splitting

### Tamaño del Bundle

```
Actual bundle:
- Main bundle: ~539 KB
- Gzipped: ~164 KB

Recomendado:
- Implementar code splitting adicional
- Tree shaking de librerías no usadas
```

---

## 📝 FLUJO DE TRABAJO TÍPICO

### Caso de Uso: Cliente Nuevo

```
1. Admin navega a /admin/clients
2. Click en "Nuevo Cliente"
3. Se abre ClientWizard (modal)
   
   Paso 1: Información Personal
   - Nombre, documento, teléfono, email
   
   Paso 2: Información Financiera
   - Ingresos, ocupación, empresa
   
   Paso 3: Tipo de Cliente y Contrato
   - Tipo (inquilino, propietario, comprador, vendedor)
   - Selección de propiedad (si aplica)
   - Datos del contrato
   
   Paso 4: Configuración de Pagos
   - Día de pago
   - Conceptos (arriendo, administración, servicios)
   - Generar pagos automáticamente
   
   Paso 5: Referencias
   - Referencias personales
   - Referencias comerciales

4. Submit del formulario
   ↓
5. Validación con Zod schema
   ↓
6. clientsApi.createClient()
   ↓
7. Transacción en Supabase:
   - INSERT clients
   - INSERT client_portal_credentials (auto-generar password)
   - INSERT client_payment_config
   - INSERT client_contract_info
   - INSERT client_references
   - INSERT contract (si aplica)
   ↓
8. emailService.sendWelcomeEmail(client, credentials)
   ↓
9. automation.createAlert('new_client')
   ↓
10. Toast: "Cliente creado exitosamente"
    ↓
11. Tabla de clientes se actualiza (refetch)
```

### Caso de Uso: Cliente Visualiza su Portal

```
1. Cliente navega a /login
2. Ingresa email y contraseña
   ↓
3. AuthContext.validateLogin()
   ↓
4. Supabase Auth verifica credenciales
   ↓
5. Si password temporal → Redirigir a /cliente/cambiar-password
   Si no → Redirigir a /cliente
   ↓
6. ClientDashboard carga:
   - Resumen de pagos (pendientes, próximos)
   - Contratos activos
   - Alertas no leídas
   - Documentos recientes
   ↓
7. Cliente navega a /cliente/pagos
   ↓
8. ClientPayments carga:
   - Historial completo de pagos
   - Calendario de pagos
   - Filtros por estado
   ↓
9. Cliente ve notificación de pago próximo a vencer
   ↓
10. Admin marca pago como "pagado"
    ↓
11. Supabase Realtime actualiza vista del cliente
    ↓
12. Toast: "Pago registrado"
```

---

## 🎨 DISEÑO Y UX

### Sistema de Design

- **Framework CSS:** Tailwind CSS
- **Componentes base:** Custom components + shadcn/ui inspired
- **Iconos:** Lucide React
- **Animaciones:** Framer Motion
- **Responsive:** Mobile-first approach
- **Dark mode:** Implementado con clases de Tailwind

### Paleta de Colores

```css
/* Principales */
--primary: #3b82f6 (blue-500)
--secondary: #10b981 (green-500)
--accent: #f59e0b (amber-500)
--danger: #ef4444 (red-500)

/* Neutros */
--gray-50 a gray-900
```

### Breakpoints

```css
sm: 640px    /* Tablet */
md: 768px    /* Tablet grande */
lg: 1024px   /* Desktop */
xl: 1280px   /* Desktop grande */
2xl: 1536px  /* Desktop extra grande */
```

---

## 🔍 DEBUGGING Y LOGS

### Logs del Sistema

```typescript
// En desarrollo
console.log('🔍 Debug:', data);
console.log('✅ Éxito:', message);
console.log('⚠️ Advertencia:', warning);
console.log('❌ Error:', error);

// Logs estructurados
if (import.meta.env.DEV) {
  console.log('📊 Estado:', state);
}
```

### Herramientas de Debug

1. **React DevTools**: Inspección de componentes
2. **Network tab**: Requests a Supabase
3. **Console**: Logs del sistema
4. **Supabase Dashboard**: Logs de queries y errors

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Documentos Relevantes en el Proyecto

```
ANALISIS_COMPLETO_PORTAL_CLIENTES.md
ANALISIS_DASHBOARD_COMPLETO.md
ANALISIS_SISTEMA_CLIENTES_COMPLETO.md
CALENDARIO_SISTEMA_COMPLETO_DOCUMENTACION.md
CLIENTS_DATABASE_SCHEMA.md
DOCUMENTATION_ENHANCED_FEATURES.md
PROJECT_SPEC_AND_USER_MANUAL.md
README.md
SECURITY.md
```

---

## 🎯 PRÓXIMOS PASOS Y MEJORAS

### Optimizaciones Pendientes

1. **Testing**
   - Implementar tests unitarios (Jest)
   - Tests de integración (Cypress)
   - Tests E2E

2. **Performance**
   - Code splitting más agresivo
   - Lazy loading de imágenes mejorado
   - Service Worker para PWA

3. **Seguridad**
   - Actualizar dependencias con vulnerabilidades
   - Implementar rate limiting
   - 2FA para admins

4. **Features**
   - Chat en tiempo real
   - Notificaciones push web
   - App móvil (React Native)
   - Reportes más avanzados

---

## 📞 SOPORTE Y CONTACTO

Para preguntas o soporte técnico sobre este sistema, contactar al equipo de desarrollo.

---

**Documento generado:** Enero 6, 2026
**Versión del sistema:** 1.0.0
**Última actualización:** Diciembre 2025

---

## 🔄 CHANGELOG DEL SISTEMA

### Versión 1.0.0 (Actual)

#### Implementado
✅ Sistema completo de propiedades
✅ Gestión de clientes con wizard
✅ Portal del cliente
✅ Sistema de citas y calendario
✅ Integración con Google Calendar
✅ Sistema de pagos y alertas
✅ Analytics y reportes
✅ Sistema de notificaciones
✅ Automatización de procesos
✅ Logs de auditoría
✅ Gestión de asesores
✅ Responsive design completo
✅ Dark mode

#### En Progreso
🔄 Tests automatizados
🔄 PWA capabilities
🔄 Mejoras de performance

#### Pendiente
⏳ App móvil
⏳ Chat en tiempo real
⏳ Integración con sistemas contables
⏳ BI y reportes avanzados

---

