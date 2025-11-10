# 🛠️ SOLUCIÓN: Problema de Eliminación de Citas

## 🔍 **PROBLEMA IDENTIFICADO**
Las citas se eliminan de la base de datos, pero siguen apareciendo en el calendario y modal porque las **políticas RLS (Row Level Security)** están bloqueando las actualizaciones con la clave anónima.

## 🧪 **PRUEBAS REALIZADAS**
- ✅ Soft delete funciona con **service key**
- ❌ Soft delete **NO funciona** con **anon key** (RLS bloqueado)
- ✅ Los filtros `.is('deleted_at', null)` están correctos
- ✅ La función `deleteAppointment()` está bien implementada

## 🔧 **SOLUCIÓN RECOMENDADA**

### **Paso 1: Ejecutar SQL en Supabase**
Ve a tu proyecto de Supabase → SQL Editor y ejecuta este script:

```sql
-- Arreglar políticas RLS para property_appointments
CREATE POLICY "Allow update property_appointments" ON property_appointments
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Verificar que RLS esté habilitado
ALTER TABLE property_appointments ENABLE ROW LEVEL SECURITY;
```

### **Paso 2: Verificar el Arreglo**
Después de ejecutar el SQL, prueba eliminar una cita desde la aplicación.

## 📋 **ALTERNATIVAS**

### **Opción A: Política RLS más específica**
Si quieres más seguridad, usa una política basada en roles:

```sql
CREATE POLICY "Allow admin updates" ON property_appointments
FOR UPDATE 
USING (auth.role() = 'authenticated' OR auth.role() = 'anon')
WITH CHECK (true);
```

### **Opción B: Función RPC personalizada**
Crear una función stored procedure para manejar eliminaciones:

```sql
CREATE OR REPLACE FUNCTION delete_appointment_rpc(appointment_id uuid)
RETURNS void
SECURITY DEFINER
AS $$
BEGIN
  UPDATE property_appointments 
  SET deleted_at = NOW()
  WHERE id = appointment_id;
END;
$$ LANGUAGE plpgsql;
```

## 🎯 **RESULTADO ESPERADO**
Después del arreglo:
- ✅ Las citas se eliminan correctamente
- ✅ Desaparecen del calendario inmediatamente
- ✅ No aparecen en el modal de citas
- ✅ Los filtros funcionan correctamente

## 🚨 **IMPORTANTE**
Asegúrate de probar la funcionalidad después de aplicar los cambios RLS para confirmar que todo funciona correctamente.