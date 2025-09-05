# 📅 Actualización de Horarios y WhatsApp - Asesores

## ✅ **Cambios Realizados**

### 📞 **Números de WhatsApp Actualizados**
- **Santiago Sánchez**: `+57 302 584 56 30` (WhatsApp: `573025845630`)
- **Andrés Metrio**: `+57 302 810 80 90` (WhatsApp: `573028108090`)

### ⏰ **Horarios de Atención Unificados**
- **Lunes a Viernes**: `9:00 AM - 5:00 PM`
- **Sábados**: `No disponible`
- **Domingos**: `No disponible`
- **Festivos**: `No disponible`

## 📝 **Archivos Actualizados**

### **1. Base de Datos SQL**
```sql
📁 sql/03_create_advisors_table.sql
├── WhatsApp Santiago: 573025845630
├── WhatsApp Andrés: 573028108090
├── Horarios weekdays: "9:00 AM - 5:00 PM"
└── Horarios weekends: "No disponible"
```

### **2. Datos de Fallback**
```typescript
📁 src/data/advisors.ts
├── Teléfonos actualizados
├── WhatsApp actualizados
├── Horarios unificados
└── Mensaje: "No laboramos sábados, domingos ni festivos"
```

### **3. API Functions**
```typescript
📁 src/lib/supabase.ts
├── Datos por defecto actualizados
├── Horarios corregidos
└── Números de contacto actualizados
```

## 🎯 **Información Actualizada**

### **Santiago Sánchez**
```json
{
  "name": "Santiago Sánchez",
  "phone": "+57 302 584 56 30",
  "whatsapp": "573025845630",
  "availability": {
    "weekdays": "9:00 AM - 5:00 PM",
    "weekends": "No disponible"
  },
  "availability_hours": "Lun-Vie: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)"
}
```

### **Andrés Metrio**
```json
{
  "name": "Andrés Metrio", 
  "phone": "+57 302 810 80 90",
  "whatsapp": "573028108090",
  "availability": {
    "weekdays": "9:00 AM - 5:00 PM",
    "weekends": "No disponible"
  },
  "availability_hours": "Lun-Vie: 9:00 AM - 5:00 PM (No laboramos sábados, domingos ni festivos)"
}
```

## 🚀 **Próximo Paso: Ejecutar en Supabase**

### **1. Script SQL Listo**
El archivo `sql/03_create_advisors_table.sql` está actualizado y listo para ejecutar en Supabase SQL Editor.

### **2. Comando a Ejecutar**
```sql
-- Copiar y pegar todo el contenido del archivo:
-- sql/03_create_advisors_table.sql

-- Esto creará:
✅ Tabla advisors con todos los campos
✅ Datos de Santiago Sánchez con info correcta
✅ Datos de Andrés Metrio con info correcta
✅ Políticas de seguridad (RLS)
✅ Índices para mejor rendimiento
```

### **3. Verificación Post-Ejecución**
- Verificar que la tabla se creó correctamente
- Confirmar que los 2 asesores están insertados
- Probar la página `/advisors` en la aplicación
- Verificar que los números de WhatsApp funcionan

## 📱 **Impacto en la Aplicación**

### **Página de Asesores (`/advisors`)**
- ✅ Mostrará horarios: "Lun-Vie: 9:00 AM - 5:00 PM"
- ✅ Fin de semana: "No disponible"
- ✅ Botones WhatsApp con números correctos
- ✅ Información consistente en toda la app

### **Modal de Citas**
- ✅ Horarios de disponibilidad actualizados
- ✅ Información del asesor correcta
- ✅ WhatsApp con números reales

### **Cards de Propiedades**
- ✅ Datos del asesor actualizados
- ✅ Contacto directo funcional

## ⚠️ **Importante**
Una vez ejecutado el SQL en Supabase, la aplicación obtendrá automáticamente los datos actualizados de la base de datos. Los datos de fallback también están actualizados por si hay problemas de conexión.

¡Todo listo para ejecutar en Supabase! 🎉
