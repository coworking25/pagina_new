# FASE 1 - BASE DE DATOS: Módulo de Gestión de Pagos
## Scripts SQL Creados - Diciembre 17, 2025

---

## 📝 RESUMEN DE SCRIPTS

### 1. CREATE_PAYMENT_SCHEDULES_TABLE.sql
**Descripción:** Tabla principal para calendario de pagos programados

**Características:**
- ✅ Tabla `payment_schedules` con 20+ columnas
- ✅ `property_id` tipo `BIGINT` (compatible con properties.id)
- ✅ Soporte para pagos recurrentes (mensual, trimestral, anual)
- ✅ Estados: pending, paid, partial, overdue, cancelled
- ✅ Pagos parciales con cálculo automático de remaining_amount
- ✅ Relación con recibos de pago (receipt_id)
- ✅ 7 índices optimizados para búsquedas
- ✅ 2 triggers: updated_at y actualización automática a overdue
- ✅ 5 políticas RLS usando `advisors` (admins, asesores, clientes)
- ✅ Función para marcar pagos vencidos diariamente

**Campos Importantes:**
- `status`: Estado del pago
- `paid_amount` / `remaining_amount`: Control de pagos parciales
- `is_recurring`: Generación automática de pagos
- `parent_schedule_id`: Referencia al pago original

---

### 2. CREATE_PAYMENT_RECEIPTS_TABLE.sql
**Descripción:** Almacenamiento de recibos de pago con verificación

**Características:**
- ✅ Tabla `payment_receipts` con información de archivos
- ✅ Integración con Supabase Storage
- ✅ Estados: pending, verified, rejected
- ✅ Workflow de verificación por asesores
- ✅ 6 índices para búsquedas eficientes
- ✅ 3 triggers: updated_at, actualización de schedule, limpieza de archivos
- ✅ 7 políticas RLS (admins, asesores, clientes)
- ✅ Sincronización automática con payment_schedules al verificar

**Características Especiales:**
- **Verificación de recibos:** Los asesores aprueban/rechazan
- **Actualización automática:** Al verificar, actualiza el pago programado
- **Reversión:** Si se rechaza, revierte los cambios
- **Control de archivos:** Metadata completa (tamaño, tipo, ruta)

---

### 3. UPDATE_CLIENT_PAYMENTS_TABLE.sql
**Descripción:** Actualización de tabla existente para compatibilidad

**Características:**
- ✅ Agrega 9 columnas nuevas de forma segura (con IF NOT EXISTS)
- ✅ 3 índices adicionales
- ✅ Función de sincronización con payment_schedules (opcional)
- ✅ Migración de datos existentes
- ✅ Reporte de resumen automático

**Columnas Agregadas:**
- `paid_amount`: Monto pagado
- `remaining_amount`: Monto pendiente (calculado)
- `payment_date`: Fecha de pago real
- `payment_method`: Método de pago
- `receipt_id`: Referencia a recibo
- `status`: Estado del pago
- `notes`: Notas adicionales
- `created_by` / `updated_by`: Auditoría

---

## 🚀 ORDEN DE EJECUCIÓN

### IMPORTANTE: Debe ejecutar los scripts en este orden específico

```sql
-- 1. PRIMERO: Crear payment_schedules (sin FK a payment_receipts)
-- Ejecutar: CREATE_PAYMENT_SCHEDULES_TABLE.sql
-- ✅ YA ESTÁ CORREGIDO - property_id es BIGINT

-- 2. SEGUNDO: Crear payment_receipts
-- Ejecutar: CREATE_PAYMENT_RECEIPTS_TABLE.sql

-- 3. TERCERO: Agregar FK receipt_id a payment_schedules
-- Ejecutar: ADD_PAYMENT_SCHEDULES_RECEIPT_FK.sql

-- 4. CUARTO: Actualizar client_payments
-- Ejecutar: UPDATE_CLIENT_PAYMENTS_TABLE.sql
```

---

## ⚠️ CORRECCIONES APLICADAS

### 1. Tipo de Datos Corregido: properties.id es BIGINT

**Problema Original:**
```
ERROR: 42804: foreign key constraint "payment_schedules_property_id_fkey" 
cannot be implemented
DETAIL: Key columns "property_id" and "id" are of incompatible types: uuid and bigint.
```

**Solución Aplicada:**
- ✅ `payment_schedules.property_id` cambiado de `UUID` a `BIGINT`
- ✅ Ahora coincide con `properties.id` que es `BIGINT`

### 2. Políticas RLS Corregidas: system_users → advisors

**Problema Original:**
```
ERROR: 42P01: relation "system_users" does not exist
```

**Solución Aplicada:**
- ✅ Todas las políticas RLS ahora usan `advisors` en lugar de `system_users`
- ✅ Verificación: `EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid())`
- ✅ Agregado `WITH CHECK` a todas las políticas `FOR ALL`
- ✅ Compatible con el sistema actual de permisos

### 3. FK Circular Resuelta

**Problema:**
- `payment_schedules.receipt_id` → `payment_receipts.id`
- `payment_receipts.schedule_id` → `payment_schedules.id`
- No se puede crear una tabla antes que la otra con FKs mutuos

**Solución Aplicada:**
1. ✅ `CREATE_PAYMENT_SCHEDULES_TABLE.sql` crea la columna `receipt_id UUID` sin FK
2. ✅ `CREATE_PAYMENT_RECEIPTS_TABLE.sql` crea la tabla con FK a `payment_schedules`
3. ✅ `ADD_PAYMENT_SCHEDULES_RECEIPT_FK.sql` agrega el FK después

**No es necesario modificar nada - los scripts ya están corregidos**

---

## 📊 ESTRUCTURA DE TABLAS CREADA

```
┌─────────────────────┐
│ payment_schedules   │ ← Calendario de pagos programados
│ - id (PK)           │
│ - client_id (FK)    │
│ - property_id (FK)  │
│ - receipt_id (FK)   │ ─┐
│ - amount            │  │
│ - paid_amount       │  │
│ - remaining_amount  │  │
│ - status            │  │
│ - due_date          │  │
│ - is_recurring      │  │
└─────────────────────┘  │
                          │
┌─────────────────────┐  │
│ payment_receipts    │ ← Recibos cargados
│ - id (PK)           │ ◄┘
│ - client_id (FK)    │
│ - schedule_id (FK)  │ ──┐
│ - file_path         │   │
│ - payment_amount    │   │
│ - status            │   │ (Referencia circular)
│ - verified_by (FK)  │   │
└─────────────────────┘ ◄─┘

┌─────────────────────┐
│ client_payments     │ ← Tabla existente actualizada
│ - id (PK)           │
│ - client_id (FK)    │
│ - receipt_id (FK)   │
│ - paid_amount       │ (nuevo)
│ - remaining_amount  │ (nuevo)
│ - status            │ (nuevo)
└─────────────────────┘
```

---

## 🔒 SEGURIDAD Y PERMISOS (RLS)

### Políticas Implementadas:

**Administradores:**
- ✅ Acceso total a todas las tablas

**Asesores:**
- ✅ Ver/editar pagos de sus clientes asignados
- ✅ Crear nuevos pagos programados
- ✅ Verificar/rechazar recibos
- ✅ Cargar recibos en nombre del cliente

**Clientes (Portal):**
- ✅ Ver solo sus propios pagos
- ✅ Cargar sus propios recibos
- ❌ No pueden modificar pagos programados
- ❌ No pueden verificar sus propios recibos

---

## ⚡ FUNCIONALIDADES AUTOMÁTICAS

### 1. Actualización de Estado a "Vencido"
```sql
-- Función que debe ejecutarse diariamente (cron job)
SELECT update_overdue_payment_schedules();
```

**Configurar en Supabase:**
```sql
SELECT cron.schedule(
  'update-overdue-payments',
  '0 1 * * *', -- Todos los días a la 1 AM
  'SELECT update_overdue_payment_schedules()'
);
```

### 2. Sincronización Automática al Verificar Recibos
Cuando un asesor verifica un recibo:
- ✅ Actualiza `payment_schedules.paid_amount`
- ✅ Cambia `status` a 'paid', 'partial' o 'pending'
- ✅ Registra `payment_date` y `payment_method`
- ✅ Vincula `receipt_id`

Si se rechaza:
- ✅ Revierte el `paid_amount`
- ✅ Recalcula el `status`

---

## 📈 ÍNDICES DE RENDIMIENTO

**Total de índices creados:** 16

### payment_schedules (7 índices):
1. `idx_payment_schedules_client_id` - Búsquedas por cliente
2. `idx_payment_schedules_property_id` - Búsquedas por propiedad
3. `idx_payment_schedules_due_date` - Ordenamiento por fecha
4. `idx_payment_schedules_pending` - Filtro de pendientes
5. `idx_payment_schedules_overdue` - Filtro de vencidos
6. `idx_payment_schedules_calendar` - Vista de calendario
7. `idx_payment_schedules_recurring` - Pagos recurrentes

### payment_receipts (6 índices):
1. `idx_payment_receipts_client_id` - Búsquedas por cliente
2. `idx_payment_receipts_schedule_id` - Relación con pagos
3. `idx_payment_receipts_payment_date` - Ordenamiento por fecha
4. `idx_payment_receipts_pending` - Pendientes de verificación
5. `idx_payment_receipts_uploaded_at` - Recientes
6. `idx_payment_receipts_client_history` - Historial completo

### client_payments (3 índices):
1. `idx_client_payments_status` - Filtro por estado
2. `idx_client_payments_overdue` - Vencidos
3. `idx_client_payments_receipt_id` - Relación con recibos

---

## 🧪 VALIDACIÓN POST-INSTALACIÓN

Ejecutar después de instalar todos los scripts:

```sql
-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('payment_schedules', 'payment_receipts');

-- 2. Verificar columnas de client_payments
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'client_payments' 
AND column_name IN ('paid_amount', 'remaining_amount', 'status', 'receipt_id');

-- 3. Verificar índices
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('payment_schedules', 'payment_receipts', 'client_payments')
ORDER BY tablename, indexname;

-- 4. Verificar políticas RLS
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('payment_schedules', 'payment_receipts')
ORDER BY tablename;

-- 5. Verificar triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table IN ('payment_schedules', 'payment_receipts')
ORDER BY event_object_table;
```

---

## 📝 PRÓXIMOS PASOS

Después de ejecutar estos scripts, continuar con:

- **Fase 2:** Crear API y funciones TypeScript
- **Fase 3:** Crear componentes React (AdminPayments.tsx)
- **Fase 4:** Implementar calendario y características avanzadas
- **Fase 5:** Configurar automatizaciones (emails, cron jobs)

---

## 🆘 TROUBLESHOOTING

### Error: "relation payment_receipts does not exist"
**Causa:** Intentó crear payment_schedules antes que payment_receipts
**Solución:** Siga el orden correcto (ver sección CORRECCIÓN DE FK CIRCULAR)

### Error: "deadlock detected"
**Causa:** Hay consultas activas bloqueando la tabla
**Solución:** 
```sql
-- Verificar bloqueos
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Terminar sesiones bloqueadas (con precaución)
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'active' AND pid <> pg_backend_pid();
```

### Error: "column already exists"
**Causa:** Ejecutó UPDATE_CLIENT_PAYMENTS_TABLE.sql dos veces
**Solución:** Los scripts son idempotentes (seguros de re-ejecutar)

---

## ✅ CHECKLIST DE INSTALACIÓN

- [ ] 1. Ejecutar CREATE_PAYMENT_SCHEDULES_TABLE.sql ✅ (ya corregido)
- [ ] 2. Ejecutar CREATE_PAYMENT_RECEIPTS_TABLE.sql ✅ (ya corregido)
- [ ] 3. Ejecutar ADD_PAYMENT_SCHEDULES_RECEIPT_FK.sql (agrega FK receipt_id)
- [ ] 4. Ejecutar UPDATE_CLIENT_PAYMENTS_TABLE.sql
- [ ] 5. Verificar con queries de validación (ver sección abajo)
- [ ] 6. Configurar cron job para pagos vencidos
- [ ] 7. Probar políticas RLS con diferentes roles
- [ ] 8. Ejecutar INSERT_CLIENTE_PROPIETARIO_COMPLETO_V2.sql (datos de prueba)

---

**Estado:** ✅ Scripts creados y listos para ejecutar
**Estimación:** 30-45 minutos de instalación y validación
**Próxima fase:** API y funciones TypeScript (2-3 días)
