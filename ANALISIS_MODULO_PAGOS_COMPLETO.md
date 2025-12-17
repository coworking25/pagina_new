# 📊 MÓDULO DE GESTIÓN DE PAGOS - ANÁLISIS Y DISEÑO

## 🎯 OBJETIVO
Crear un sistema completo de control de pagos para clientes (propietarios e inquilinos) con:
- Calendario de pagos programados
- Control de retrasos (días/semanas/meses)
- Carga de comprobantes
- Dashboard de estado de pagos

---

## 📋 1. ESTRUCTURA DE DATOS

### 1.1 Tabla Principal: `client_payments` ✅ (Ya existe)
```sql
- id (UUID)
- client_id (FK a clients)
- payment_date (DATE)
- amount (DECIMAL)
- payment_method (VARCHAR)
- payment_status (VARCHAR)
- reference_number (VARCHAR)
- description (TEXT)
- created_at, updated_at
```

### 1.2 Nueva Tabla: `payment_receipts` (Comprobantes)
```sql
CREATE TABLE payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES client_payments(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  receipt_type VARCHAR(50), -- 'image', 'pdf', 'other'
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  uploaded_by UUID REFERENCES advisors(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verified_by UUID REFERENCES advisors(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.3 Nueva Tabla: `payment_schedules` (Programación de Pagos)
```sql
CREATE TABLE payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  payment_concept VARCHAR(100), -- 'arriendo', 'administracion', 'servicios'
  amount DECIMAL(15,2) NOT NULL,
  frequency VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'quarterly', 'annual'
  payment_day INTEGER DEFAULT 1, -- Día del mes (1-31)
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  auto_generate BOOLEAN DEFAULT true, -- Auto-generar pagos pendientes
  last_generated_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.4 Actualizar `client_payments` con nuevos campos
```sql
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS schedule_id UUID REFERENCES payment_schedules(id);
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS due_date DATE; -- Fecha límite de pago
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS days_overdue INTEGER DEFAULT 0; -- Días de retraso
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS late_fee DECIMAL(15,2) DEFAULT 0; -- Multa por mora
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS has_receipt BOOLEAN DEFAULT false;
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES advisors(id);
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;
ALTER TABLE client_payments ADD COLUMN IF NOT EXISTS notes TEXT;
```

---

## 🎨 2. DISEÑO DE INTERFAZ

### 2.1 Nueva Página: `AdminPayments.tsx`

**Estructura:**
```
📁 src/pages/
  └── AdminPayments.tsx (NUEVO)
  
📁 src/components/payments/
  ├── PaymentCalendar.tsx       (Calendario de pagos)
  ├── PaymentsList.tsx           (Lista de pagos)
  ├── PaymentStatusCard.tsx      (Tarjetas de resumen)
  ├── PaymentModal.tsx           (Modal para ver/editar pago)
  ├── ReceiptUploader.tsx        (Subir comprobantes)
  └── OverduePaymentsTable.tsx   (Tabla de morosos)
```

### 2.2 Layout de la Página Principal

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Gestión de Pagos                            [+ Nuevo]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │ 💰 Total│  │ ✅ Al día│  │ ⚠️ Mora │  │ 📅 Prox.│       │
│  │ $50.5M  │  │   45     │  │    12    │  │   23    │       │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘       │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [ 📅 Calendario ] [ 📋 Lista ] [ ⚠️ Morosos ] [ 📊 Reportes ]│
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  FILTROS:                                              │  │
│  │  [Cliente▼] [Tipo▼] [Estado▼] [Mes▼] [Buscar...]    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                 CALENDARIO / TABLA                   │    │
│  │                                                       │    │
│  │  [Contenido dinámico según vista seleccionada]      │    │
│  │                                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Modal de Pago Individual

```
┌────────────────────────────────────────────────────┐
│  💰 Pago #TRF-2024-001                    [X]      │
├────────────────────────────────────────────────────┤
│                                                     │
│  Cliente: Carlos Propietario                       │
│  Concepto: Administración - Diciembre 2024        │
│  Monto: $2,500,000                                 │
│  Fecha límite: 05/12/2024                          │
│  Estado: [🔴 Vencido - 12 días de retraso]        │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │  📎 COMPROBANTES                              │ │
│  │  ┌──────┐ ┌──────┐                           │ │
│  │  │ IMG  │ │ PDF  │ [+ Subir]                │ │
│  │  └──────┘ └──────┘                           │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  Método: Transferencia                             │
│  Referencia: [________________]                    │
│  Multa por mora: $125,000                          │
│                                                     │
│  Notas:                                            │
│  [___________________________________________]     │
│                                                     │
│  [❌ Rechazar]  [✅ Marcar como Pagado]           │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 🔧 3. FUNCIONALIDADES PRINCIPALES

### 3.1 Vista de Calendario 📅
**Características:**
- Calendario mensual con pagos programados
- Código de colores:
  - 🟢 Verde: Pagado
  - 🟡 Amarillo: Pendiente (próximo a vencer)
  - 🔴 Rojo: Vencido
  - ⚪ Gris: Programado futuro
- Click en día → Ver todos los pagos de ese día
- Navegación entre meses

**Tecnología:**
- `react-big-calendar` o `fullcalendar`
- Integración con `client_payments` y `payment_schedules`

### 3.2 Lista de Pagos 📋
**Características:**
- Tabla con paginación
- Columnas:
  - Cliente
  - Concepto
  - Monto
  - Fecha límite
  - Estado
  - Días de retraso
  - Acciones
- Filtros avanzados:
  - Por cliente
  - Por tipo de cliente (landlord/tenant)
  - Por estado (pending, completed, overdue)
  - Por rango de fechas
  - Por concepto de pago
- Ordenamiento por columnas
- Búsqueda en tiempo real

### 3.3 Control de Morosos ⚠️
**Características:**
- Tabla dedicada de pagos vencidos
- Agrupación por días de retraso:
  - 1-7 días (Advertencia)
  - 8-15 días (Crítico)
  - 16-30 días (Muy crítico)
  - 30+ días (Emergencia)
- Cálculo automático de multas
- Botones de acción rápida:
  - Enviar recordatorio por email
  - Llamar al cliente
  - Generar reporte
  - Marcar como pagado

### 3.4 Subida de Comprobantes 📎
**Características:**
- Drag & drop de archivos
- Soporte para:
  - Imágenes (JPG, PNG)
  - PDFs
  - Tamaño máximo: 5MB
- Preview de imágenes
- Múltiples comprobantes por pago
- Estados:
  - Pendiente de verificación
  - Verificado ✅
  - Rechazado ❌
- Almacenamiento en Supabase Storage

### 3.5 Automatización 🤖
**Características:**
- **Auto-generación de pagos:**
  - Basado en `payment_schedules`
  - Ejecutar cada noche (cron job o función programada)
  - Crear `client_payments` con status 'pending'
  
- **Cálculo automático de retrasos:**
  - Función que actualiza `days_overdue` diariamente
  - Calcula multas según configuración

- **Alertas automáticas:**
  - Email 3 días antes del vencimiento
  - Email el día del vencimiento
  - Email cada semana si está en mora

### 3.6 Dashboard y Estadísticas 📊
**Métricas:**
- Total recaudado en el mes
- Pagos pendientes
- Pagos en mora (cantidad y monto)
- Tasa de pago puntual
- Gráfico de tendencias (últimos 6 meses)
- Top 10 clientes con más retrasos

---

## 🗂️ 4. ESTRUCTURA DE ARCHIVOS

```
src/
├── pages/
│   └── AdminPayments.tsx                    # Página principal
│
├── components/
│   └── payments/
│       ├── PaymentCalendar.tsx              # Vista calendario
│       ├── PaymentsList.tsx                 # Vista lista
│       ├── OverduePaymentsTable.tsx         # Tabla de morosos
│       ├── PaymentModal.tsx                 # Modal de detalles
│       ├── ReceiptUploader.tsx              # Subir comprobantes
│       ├── PaymentStatusCard.tsx            # Cards de métricas
│       ├── PaymentFilters.tsx               # Filtros avanzados
│       └── PaymentDashboard.tsx             # Dashboard de estadísticas
│
├── services/
│   └── paymentsApi.ts                       # API calls
│       ├── getPayments()
│       ├── createPayment()
│       ├── updatePayment()
│       ├── deletePayment()
│       ├── uploadReceipt()
│       ├── verifyPayment()
│       ├── calculateOverdue()
│       └── getPaymentStats()
│
├── hooks/
│   └── usePayments.ts                       # Hook personalizado
│
└── types/
    └── payment.ts                           # TypeScript interfaces
```

---

## 🔐 5. POLÍTICAS RLS (Row Level Security)

```sql
-- payment_receipts
CREATE POLICY "Admins can view all receipts"
  ON payment_receipts FOR SELECT
  USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

CREATE POLICY "Admins can upload receipts"
  ON payment_receipts FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- payment_schedules
CREATE POLICY "Admins can manage schedules"
  ON payment_schedules FOR ALL
  USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- client_payments (actualizar existente)
CREATE POLICY "Clients can view their payments"
  ON client_payments FOR SELECT
  USING (
    client_id IN (
      SELECT id FROM clients WHERE id = (
        SELECT client_id FROM client_portal_credentials WHERE id = auth.uid()
      )
    )
  );
```

---

## 📱 6. INTEGRACIONES

### 6.1 Portal del Cliente
Los clientes podrán:
- Ver calendario de sus pagos
- Ver historial completo
- Subir comprobantes de pago
- Descargar recibos

### 6.2 Notificaciones
- Email automático con SendGrid
- Plantillas personalizadas:
  - Recordatorio de pago próximo
  - Pago vencido
  - Confirmación de pago recibido

### 6.3 Exportación
- Exportar a Excel/CSV
- Generar PDF de estado de cuenta
- Reportes mensuales automáticos

---

## 🚀 7. PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (1-2 días)
- [ ] Crear tabla `payment_receipts`
- [ ] Crear tabla `payment_schedules`
- [ ] Actualizar `client_payments` con nuevos campos
- [ ] Configurar RLS policies
- [ ] Crear funciones SQL para cálculos automáticos

### Fase 2: Backend/API (2-3 días)
- [ ] Crear `paymentsApi.ts` con todas las funciones
- [ ] Implementar lógica de auto-generación de pagos
- [ ] Implementar cálculo de retrasos y multas
- [ ] Configurar Supabase Storage para comprobantes

### Fase 3: Frontend - Core (3-4 días)
- [ ] Crear página `AdminPayments.tsx`
- [ ] Implementar dashboard con métricas
- [ ] Crear componente de filtros
- [ ] Implementar vista de lista con tabla

### Fase 4: Frontend - Avanzado (3-4 días)
- [ ] Implementar calendario de pagos
- [ ] Crear modal de detalles de pago
- [ ] Implementar subida de comprobantes
- [ ] Crear tabla de morosos

### Fase 5: Automatización (2-3 días)
- [ ] Función programada para auto-generar pagos
- [ ] Función para calcular retrasos diarios
- [ ] Sistema de alertas por email
- [ ] Integración con SendGrid

### Fase 6: Portal Cliente (2-3 días)
- [ ] Vista de pagos en portal del cliente
- [ ] Subida de comprobantes desde portal
- [ ] Calendario de pagos del cliente

### Fase 7: Testing y Refinamiento (2-3 días)
- [ ] Pruebas de funcionalidad
- [ ] Optimización de consultas
- [ ] Ajustes de UI/UX
- [ ] Documentación

**TIEMPO TOTAL ESTIMADO: 15-22 días**

---

## 💡 8. MEJORAS FUTURAS

1. **Integración con pasarelas de pago**
   - PSE
   - Tarjetas de crédito
   - Botón de pago directo

2. **Reportes avanzados**
   - Análisis predictivo de pagos
   - Proyección de ingresos
   - Identificación de patrones

3. **WhatsApp Business API**
   - Recordatorios por WhatsApp
   - Confirmaciones automáticas

4. **Reconciliación bancaria**
   - Importar extractos bancarios
   - Match automático con pagos

5. **Módulo de facturación**
   - Generar facturas electrónicas
   - Integración con DIAN

---

## 📋 9. CHECKLIST DE VALIDACIÓN

Antes de considerar el módulo completo, validar:
- [ ] Todos los pagos se muestran correctamente
- [ ] Los cálculos de retraso son precisos
- [ ] Las multas se calculan automáticamente
- [ ] Los comprobantes se suben sin errores
- [ ] El calendario muestra todos los pagos
- [ ] Los filtros funcionan correctamente
- [ ] Las notificaciones se envían a tiempo
- [ ] El portal del cliente muestra su información
- [ ] La exportación funciona para todos los formatos
- [ ] Las políticas RLS protegen correctamente los datos

---

## 🎯 10. CONSIDERACIONES FINALES

**Prioridades:**
1. **Alta**: Dashboard, lista de pagos, control de morosos
2. **Media**: Calendario, subida de comprobantes
3. **Baja**: Automatizaciones avanzadas, reportes complejos

**Riesgos:**
- Rendimiento con muchos registros → Usar paginación e índices
- Carga de archivos grandes → Limitar tamaño y optimizar
- Cálculos incorrectos → Validar lógica con casos de prueba

**Beneficios:**
- Control total de pagos en tiempo real
- Reducción de morosidad
- Automatización de tareas manuales
- Mejor experiencia para clientes
- Datos para toma de decisiones

---

¿Te gustaría que empecemos por alguna fase específica o prefieres que cree primero las tablas de base de datos?
