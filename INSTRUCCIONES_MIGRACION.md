# 🚀 GUÍA DE EJECUCIÓN: MIGRACIÓN DE PAGOS Y ADMINISTRACIÓN

## ⚠️ IMPORTANTE: Cómo ejecutar esta migración

La migración SQL **NO se puede ejecutar** directamente desde JavaScript/TypeScript porque requiere permisos de administrador de base de datos. El `anon_key` de Supabase no tiene estos permisos por seguridad.

## ✅ MÉTODO RECOMENDADO: Supabase SQL Editor

### Paso 1: Acceder al SQL Editor
1. Abre tu navegador
2. Ve a: https://gfczfjpyyyyvteyrvhgt.supabase.co/project/_/sql
3. Inicia sesión si es necesario

### Paso 2: Copiar el SQL
Tienes 3 opciones:

**Opción A - Desde Windows:**
```powershell
# Copiar al portapapeles
type "ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql" | clip
```

**Opción B - Manualmente:**
1. Abre el archivo `ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql`
2. Selecciona todo (Ctrl+A)
3. Copia (Ctrl+C)

**Opción C - Con VS Code:**
1. Abre `ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql`
2. Clic derecho → Copy All

### Paso 3: Ejecutar en Supabase
1. En el SQL Editor, haz clic en "New Query"
2. Pega el SQL copiado (Ctrl+V)
3. Haz clic en el botón **"Run"** (o presiona Ctrl+Enter)
4. Espera a que se ejecute (puede tomar 5-10 segundos)

### Paso 4: Verificar Resultados
Deberías ver en la consola:
```
✅ Migración completada exitosamente
Columnas agregadas a contracts: 6 de 6
Columnas agregadas a payments: 7 de 7
```

---

## 🔍 ¿Qué hace esta migración?

### En la tabla `contracts`:
- ✅ `admin_included_in_rent` - ¿Admin incluida en arriendo?
- ✅ `admin_paid_by` - ¿Quién paga? (tenant/landlord/split)
- ✅ `admin_payment_method` - Método de pago (direct/deducted)
- ✅ `admin_landlord_percentage` - % que paga propietario
- ✅ `agency_commission_percentage` - Comisión agencia (%)
- ✅ `agency_commission_fixed` - Comisión agencia (fija)

### En la tabla `payments`:
- ✅ `gross_amount` - Monto bruto recibido
- ✅ `admin_deduction` - Descuento por admin
- ✅ `agency_commission` - Comisión agencia
- ✅ `net_amount` - Monto neto al propietario
- ✅ `payment_direction` - incoming/outgoing
- ✅ `related_payment_id` - Vincula pagos relacionados
- ✅ `recipient_type` - A quién se paga

### Funciones Creadas:
- 🔧 `calculate_payment_breakdown()` - Calcula desgloses automáticamente
- 🔧 `register_tenant_payment()` - Registra pagos completos
- 📊 Vista `payment_breakdown_report` - Para reportes

---

## 🔧 ALTERNATIVA: Ejecutar con psql (si tienes acceso)

Si tienes acceso directo a PostgreSQL:

```bash
# Desde terminal
psql -h gfczfjpyyyyvteyrvhgt.supabase.co -U postgres -d postgres -f ADD_PAYMENT_ADMINISTRATION_COLUMNS.sql
```

---

## ✅ Verificación Post-Migración

Una vez ejecutada la migración, verifica desde JavaScript:

```typescript
// Puedes ejecutar esto en la consola del navegador
const { data, error } = await supabase
  .from('contracts')
  .select('admin_included_in_rent, admin_paid_by')
  .limit(1);

console.log('✅ Nuevos campos disponibles:', data);
```

---

## 🆘 Solución de Problemas

### Error: "column already exists"
✅ **Solución:** La migración usa `ADD COLUMN IF NOT EXISTS`, así que es seguro ejecutarla múltiples veces.

### Error: "permission denied"
❌ **Causa:** No tienes permisos suficientes
✅ **Solución:** Usa el SQL Editor de Supabase Dashboard (método recomendado)

### Error: "function already exists"
✅ **Solución:** La migración usa `CREATE OR REPLACE FUNCTION`, así que sobrescribirá la versión anterior.

### No veo los nuevos campos
1. Verifica que viste el mensaje de éxito
2. Actualiza la página del SQL Editor
3. Ejecuta una consulta simple para verificar:
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'contracts' 
   AND column_name LIKE 'admin%';
   ```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:
1. Copia el mensaje de error completo
2. Verifica que estás en el SQL Editor correcto
3. Asegúrate de haber copiado todo el SQL (desde el principio hasta `COMMIT;`)

---

## ⏭️ Siguiente Paso

Una vez completada la migración, continúa con:
- ✅ Crear función TypeScript `calculatePaymentBreakdown()`
- ✅ Actualizar formulario de propiedades
- ✅ Crear formulario de registro de pagos

**¿Listo para continuar?** 🚀
