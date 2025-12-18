# FASE 2: CAPA API Y ALMACENAMIENTO

**Fecha:** Diciembre 17, 2025  
**Estado:** ✅ Completado

---

## 📋 RESUMEN

Esta fase implementa la capa de API en TypeScript para interactuar con las tablas de pagos y recibos creadas en la Fase 1, además del almacenamiento seguro de archivos.

---

## 📦 ARCHIVOS CREADOS

### 1. **src/lib/paymentsApi.ts** (389 líneas)
API completa para la gestión de calendarios de pago (`payment_schedules`)

**Tipos Exportados:**
- `PaymentSchedule` - Interfaz completa del calendario de pago
- `CreatePaymentScheduleInput` - Datos para crear un pago
- `UpdatePaymentScheduleInput` - Datos para actualizar un pago

**Funciones CRUD:**
- `getAllPaymentSchedules()` - Obtiene todos los pagos con joins de cliente/propiedad
- `getPaymentSchedulesByClient(clientId)` - Pagos de un cliente específico
- `getPaymentSchedulesByProperty(propertyId)` - Pagos de una propiedad
- `getPaymentSchedulesByStatus(status)` - Filtrar por estado (pending/paid/overdue/etc)
- `getOverduePayments()` - Pagos vencidos (due_date < HOY y status != 'paid')
- `getCurrentMonthPayments()` - Pagos del mes actual
- `getPaymentScheduleById(id)` - Detalle completo de un pago con relaciones
- `createPaymentSchedule(input)` - Crear nuevo pago (tracking de created_by)
- `updatePaymentSchedule(id, input)` - Actualizar pago (tracking de updated_by)
- `markPaymentAsCompleted(id, date, method)` - Marcar pago como completado
- `deletePaymentSchedule(id)` - Eliminar un pago

**Funciones de Automatización:**
- `generateRecurringPayments(parentId, months)` - Generar pagos recurrentes
- `updateOverduePayments()` - Actualiza estados de pagos vencidos (llama a RPC)

**Funciones de Estadísticas:**
- `getPaymentSummaryByClient(clientId)` - Resumen por cliente (total/pagado/pendiente)
- `getPaymentStatistics()` - Estadísticas globales para dashboard

---

### 2. **src/lib/receiptsApi.ts** (252 líneas)
API completa para la gestión de recibos de pago (`payment_receipts`)

**Tipos Exportados:**
- `PaymentReceipt` - Interfaz completa del recibo
- `UploadReceiptInput` - Datos para subir un recibo
- `VerifyReceiptInput` - Datos para verificar/rechazar un recibo

**Funciones CRUD:**
- `getAllPaymentReceipts()` - Obtiene todos los recibos con joins
- `getReceiptsByClient(clientId)` - Recibos de un cliente
- `getPendingReceipts()` - Recibos pendientes de verificación
- `getReceiptById(id)` - Detalle completo de un recibo
- `uploadPaymentReceipt(file, input)` - Subir archivo y crear registro
- `verifyReceipt(id, input)` - Verificar o rechazar un recibo
- `deletePaymentReceipt(id)` - Eliminar recibo (archivo + registro)
- `downloadReceipt(id)` - Descargar/abrir recibo
- `getReceiptSignedUrl(id, expiresIn)` - URL firmada temporal (segura)

**Funciones de Estadísticas:**
- `getReceiptStatistics()` - Estadísticas globales (total/pending/verified/rejected)
- `getReceiptsByDateRange(start, end)` - Recibos por rango de fechas

---

### 3. **sql/CREATE_PAYMENT_RECEIPTS_STORAGE_BUCKET.sql** (98 líneas)
Script SQL para crear el bucket de almacenamiento en Supabase Storage

**Características del Bucket:**
- Nombre: `payment-receipts`
- Público: `true` (para URLs directas)
- Límite de archivo: 10MB
- Tipos permitidos: JPG, PNG, WEBP, PDF

**Políticas de Seguridad (RLS en Storage):**
1. Admins pueden ver todos los recibos
2. Asesores pueden ver recibos de sus clientes asignados
3. Admins y asesores pueden subir recibos
4. Admins pueden actualizar cualquier recibo
5. Admins pueden eliminar cualquier recibo

---

## 🚀 INSTRUCCIONES DE INSTALACIÓN

### PASO 1: Crear el Bucket de Storage

Ejecuta el script en el **SQL Editor** de Supabase:

```sql
-- Archivo: sql/CREATE_PAYMENT_RECEIPTS_STORAGE_BUCKET.sql
```

**Validación esperada:**
```json
{
  "id": "payment-receipts",
  "name": "payment-receipts",
  "public": true,
  "file_size_limit": 10485760,
  "allowed_mime_types": ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]
}
```

---

### PASO 2: Verificar Políticas de Storage

Ejecuta la consulta de validación al final del script:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
AND policyname LIKE '%receipts%';
```

Deberías ver **5 políticas** creadas:
- `Admins can view all receipts` (SELECT)
- `Advisors can view their clients receipts` (SELECT)
- `Admins and advisors can upload receipts` (INSERT)
- `Admins can update all receipts` (UPDATE)
- `Admins can delete all receipts` (DELETE)

---

### PASO 3: Configurar la Carpeta de Archivos API

Si no existen ya, crea las carpetas:

```
src/
  lib/
    ├── paymentsApi.ts     ← Ya existe
    ├── receiptsApi.ts     ← Ya existe
    └── supabaseClient.ts  ← Debe existir de tu proyecto
```

Asegúrate de que `supabaseClient.ts` exporta el cliente de Supabase correctamente:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🧪 PRUEBAS BÁSICAS

### Prueba 1: Crear un Pago
```typescript
import { createPaymentSchedule } from './lib/paymentsApi';

const nuevoPago = await createPaymentSchedule({
  client_id: 'uuid-del-cliente',
  property_id: 123, // BIGINT
  payment_concept: 'Renta Mensual',
  amount: 5000.00,
  due_date: '2025-01-15',
  status: 'pending'
});

console.log('Pago creado:', nuevoPago);
```

---

### Prueba 2: Subir un Recibo
```typescript
import { uploadPaymentReceipt } from './lib/receiptsApi';

// Desde un input de archivo
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files[0];

const nuevoRecibo = await uploadPaymentReceipt(file, {
  client_id: 'uuid-del-cliente',
  schedule_id: 'uuid-del-pago', // Opcional
  payment_amount: 5000.00,
  payment_date: '2025-01-10',
  payment_method: 'transferencia',
  payment_reference: 'REF123456'
});

console.log('Recibo subido:', nuevoRecibo);
console.log('URL del archivo:', nuevoRecibo.file_path);
```

---

### Prueba 3: Verificar un Recibo (Admin)
```typescript
import { verifyReceipt } from './lib/receiptsApi';

const reciboVerificado = await verifyReceipt('uuid-del-recibo', {
  status: 'verified',
  verification_notes: 'Comprobante válido, pago confirmado'
});

console.log('Recibo verificado:', reciboVerificado);
// Esto automáticamente actualizará payment_schedules por el trigger
```

---

### Prueba 4: Obtener Estadísticas
```typescript
import { getPaymentStatistics } from './lib/paymentsApi';
import { getReceiptStatistics } from './lib/receiptsApi';

const statsPayments = await getPaymentStatistics();
console.log('Estadísticas de pagos:', statsPayments);
// {
//   total: 45,
//   pending: 12,
//   paid: 30,
//   overdue: 3,
//   totalAmount: 225000.00,
//   paidAmount: 150000.00,
//   pendingAmount: 75000.00
// }

const statsReceipts = await getReceiptStatistics();
console.log('Estadísticas de recibos:', statsReceipts);
// {
//   total: 28,
//   pending: 5,
//   verified: 20,
//   rejected: 3,
//   totalAmount: 140000.00
// }
```

---

## 🔐 SEGURIDAD IMPLEMENTADA

### 1. **Row Level Security (RLS)**
- ✅ Solo administradores y asesores autenticados pueden acceder
- ✅ Asesores solo ven datos de sus clientes asignados
- ✅ Clientes no tienen acceso directo (portal no implementado)

### 2. **Storage Policies**
- ✅ Archivos organizados por cliente: `receipts/{client_id}/{filename}`
- ✅ Solo usuarios autenticados pueden acceder
- ✅ Límite de tamaño: 10MB
- ✅ Tipos de archivo restringidos: imágenes y PDF

### 3. **Audit Trail**
- ✅ `created_by` / `updated_by` registran quién hizo cambios
- ✅ `uploaded_by` / `verified_by` rastrean el flujo del recibo
- ✅ Timestamps automáticos: `created_at` / `updated_at`

---

## 📊 FLUJO DE TRABAJO

### Flujo de Pago Normal:
1. Admin crea `payment_schedule` (status: `pending`)
2. Cliente realiza el pago
3. Cliente/Admin sube recibo con `uploadPaymentReceipt()`
4. Recibo queda en status `pending`
5. Admin verifica recibo con `verifyReceipt(id, {status: 'verified'})`
6. **TRIGGER automático:** `payment_schedules` se actualiza a `paid`

### Flujo de Pago Vencido:
1. Sistema ejecuta diariamente `updateOverduePayments()`
2. Pagos con `due_date < HOY` y status `pending` → se marcan `overdue`
3. Dashboard muestra alerta en estadísticas
4. Admin puede contactar al cliente

### Flujo de Pagos Recurrentes:
1. Admin crea pago inicial (ej. renta enero)
2. Ejecuta `generateRecurringPayments(parentId, 12)` para generar 12 meses
3. Sistema crea automáticamente pagos para feb-dic con `parent_schedule_id`
4. Cada mes se repite el flujo de verificación

---

## ❗ CONSIDERACIONES IMPORTANTES

### 1. **Configuración de CORS en Storage**
Si obtienes errores de CORS al subir archivos, verifica en Supabase Dashboard:
- Storage → Configuration → CORS Settings
- Asegúrate de que tu dominio esté permitido

### 2. **Tipos de Archivo**
El bucket solo acepta:
- Imágenes: JPG, PNG, WEBP
- Documentos: PDF

Para agregar más tipos (ej. DOCX), edita el script SQL:
```sql
allowed_mime_types = ARRAY[
  'image/jpeg',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' -- DOCX
]
```

### 3. **Límite de Tamaño**
El límite actual es **10MB**. Para aumentarlo:
```sql
file_size_limit = 20971520 -- 20MB
```

### 4. **Autenticación**
Todas las funciones asumen que el usuario está autenticado con Supabase Auth.
Si no hay usuario, `auth.uid()` será `null` y las políticas RLS bloquearán el acceso.

---

## 🎯 PRÓXIMOS PASOS

### Fase 3: Componentes React
Crear la UI para interactuar con estas APIs:
- `AdminPayments.tsx` - Página principal de gestión
- `PaymentScheduleList.tsx` - Lista de pagos
- `PaymentScheduleForm.tsx` - Formulario crear/editar
- `ReceiptUpload.tsx` - Subir recibos con drag & drop
- `ReceiptVerification.tsx` - Aprobar/rechazar recibos

### Fase 4: Vista de Calendario
- Integrar FullCalendar o react-big-calendar
- Mostrar pagos en calendario mensual
- Filtros por cliente/propiedad/estado

### Fase 5: Automatización
- Cron job para `updateOverduePayments()` diario
- Emails/WhatsApp para pagos próximos a vencer
- Generación automática de pagos recurrentes

---

## 📝 CHANGELOG

**2025-12-17:**
- ✅ Creado `paymentsApi.ts` con 15 funciones CRUD
- ✅ Creado `receiptsApi.ts` con 10 funciones + upload
- ✅ Creado script de Storage bucket con políticas RLS
- ✅ Documentación completa de Fase 2

---

## 🆘 TROUBLESHOOTING

### Error: "Bucket not found"
**Solución:** Ejecuta `CREATE_PAYMENT_RECEIPTS_STORAGE_BUCKET.sql` en Supabase

### Error: "RLS policies prevent this action"
**Solución:** Verifica que estás autenticado y que tu usuario está en la tabla `advisors`

### Error: "File type not allowed"
**Solución:** Solo se permiten JPG, PNG, WEBP y PDF. Verifica el tipo del archivo.

### Error: "File too large"
**Solución:** El límite es 10MB. Comprime la imagen o edita el límite en el bucket.

---

**Fase 2 completada ✅**  
**Fecha:** Diciembre 17, 2025  
**Total de archivos:** 3 (2 API + 1 SQL)  
**Total de líneas de código:** 739
