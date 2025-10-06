# 🔧 Corrección del Sistema de Tracking de Vistas

## ❌ Problema Identificado

El contador de visitas no estaba registrando las vistas de propiedades en la base de datos.

### **Causa Raíz**
Las funciones de tracking estaban enviando el `property_id` como **STRING**, pero la base de datos espera **BIGINT** (número entero).

```typescript
// ❌ ANTES (Incorrecto)
await supabase.from('property_views').insert({
  property_id: propertyId,  // String "123"
  // ...
});

// ✅ DESPUÉS (Correcto)
await supabase.from('property_views').insert({
  property_id: parseInt(propertyId),  // Number 123
  // ...
});
```

---

## ✅ Soluciones Implementadas

### **Archivo Modificado**: `src/lib/analytics.ts`

Se agregó `parseInt()` en todas las funciones que interactúan con `property_id`:

#### **1. trackPropertyView() - Registro de Vistas**

**Antes**:
```typescript
await supabase.from('property_views').insert({
  property_id: propertyId,
  session_id: sessionId,
  view_duration: viewDuration,
  // ...
});
```

**Después** ✅:
```typescript
const { error } = await supabase.from('property_views').insert({
  property_id: parseInt(propertyId),  // 🔧 Conversión a número
  session_id: sessionId,
  view_duration: viewDuration,
  referrer: getReferrer(),
  device_type: getDeviceType(),
  created_at: new Date().toISOString()
});

if (error) {
  console.error('❌ Error al registrar vista:', error);
  throw error;
}

console.log('✅ Vista de propiedad registrada:', propertyId);
```

**Mejoras adicionales**:
- ✅ Manejo de errores mejorado
- ✅ Log con ID de propiedad para debugging
- ✅ Validación de error antes de continuar

---

#### **2. trackPropertyContact() - Registro de Contactos**

**Antes**:
```typescript
await supabase.from('property_contacts').insert({
  property_id: propertyId,
  contact_type: contactType,
  // ...
});
```

**Después** ✅:
```typescript
const { error } = await supabase.from('property_contacts').insert({
  property_id: parseInt(propertyId),  // 🔧 Conversión a número
  contact_type: contactType,
  session_id: sessionId,
  ...contactData,
  created_at: new Date().toISOString()
});

if (error) {
  console.error('❌ Error al registrar contacto:', error);
  throw error;
}

console.log('✅ Contacto registrado exitosamente:', propertyId, contactType);
```

---

#### **3. likeProperty() - Dar Like**

**Antes**:
```typescript
const { error } = await supabase
  .from('property_likes')
  .insert({
    property_id: propertyId,
    // ...
  });
```

**Después** ✅:
```typescript
const { error } = await supabase
  .from('property_likes')
  .insert({
    property_id: parseInt(propertyId),  // 🔧 Conversión a número
    session_id: sessionId,
    created_at: new Date().toISOString()
  });

if (error) {
  if (error.code === '23505') {
    console.log('✅ Usuario ya dio like a esta propiedad');
    return false;
  }
  console.error('❌ Error al dar like:', error);  // 🔧 Log mejorado
  throw error;
}

console.log('✅ Like registrado exitosamente:', propertyId);  // 🔧 Log con ID
```

---

#### **4. unlikeProperty() - Quitar Like**

**Antes**:
```typescript
const { error } = await supabase
  .from('property_likes')
  .delete()
  .eq('property_id', propertyId)
  .eq('session_id', sessionId);
```

**Después** ✅:
```typescript
const { error } = await supabase
  .from('property_likes')
  .delete()
  .eq('property_id', parseInt(propertyId))  // 🔧 Conversión a número
  .eq('session_id', sessionId);

if (error) {
  console.error('❌ Error al quitar like:', error);
  throw error;
}

console.log('✅ Like eliminado exitosamente:', propertyId);
```

---

#### **5. hasLikedProperty() - Verificar Like**

**Antes**:
```typescript
const { data, error } = await supabase
  .from('property_likes')
  .select('id')
  .eq('property_id', propertyId)
  .eq('session_id', sessionId)
  .single();
```

**Después** ✅:
```typescript
const { data, error } = await supabase
  .from('property_likes')
  .select('id')
  .eq('property_id', parseInt(propertyId))  // 🔧 Conversión a número
  .eq('session_id', sessionId)
  .single();

if (error && error.code !== 'PGRST116') {
  console.error('❌ Error al verificar like:', error);  // 🔧 Log mejorado
  throw error;
}
```

---

#### **6. getUserLikes() - Obtener Likes del Usuario**

**Antes**:
```typescript
return data?.map(like => like.property_id) || [];
```

**Después** ✅:
```typescript
return data?.map(like => String(like.property_id)) || [];  // 🔧 Convertir a string para compatibilidad
```

**Razón**: El frontend espera strings, pero la BD devuelve números.

---

#### **7. getPropertyLikesCount() - Contar Likes**

**Antes**:
```typescript
const { count, error } = await supabase
  .from('property_likes')
  .select('*', { count: 'exact', head: true })
  .eq('property_id', propertyId);
```

**Después** ✅:
```typescript
const { count, error } = await supabase
  .from('property_likes')
  .select('*', { count: 'exact', head: true })
  .eq('property_id', parseInt(propertyId));  // 🔧 Conversión a número
```

---

## 🔍 Funciones Afectadas

### **Resumen de Cambios**

| Función | Cambio | Estado |
|---------|--------|--------|
| `likeProperty()` | `parseInt(propertyId)` en insert | ✅ |
| `unlikeProperty()` | `parseInt(propertyId)` en delete | ✅ |
| `hasLikedProperty()` | `parseInt(propertyId)` en query | ✅ |
| `getUserLikes()` | `String(property_id)` en map | ✅ |
| `getPropertyLikesCount()` | `parseInt(propertyId)` en query | ✅ |
| `trackPropertyView()` | `parseInt(propertyId)` en insert | ✅ |
| `trackPropertyContact()` | `parseInt(propertyId)` en insert | ✅ |

**Total**: 7 funciones corregidas

---

## 🧪 Pruebas de Funcionamiento

### **Test 1: Verificar Tracking de Vistas**

1. **Abrir consola del navegador** (F12)
2. **Ir a** `/properties`
3. **Click** en cualquier propiedad
4. **Esperar** 5-10 segundos
5. **Cerrar** el modal
6. **Verificar en consola**:
   ```
   ✅ Vista de propiedad registrada: 123
   ```

7. **Ir a Supabase** → Tabla `property_views`
8. **Verificar** que hay una nueva fila con:
   - `property_id`: número (ej: 123)
   - `view_duration`: segundos (ej: 10)
   - `session_id`: tu session ID
   - `device_type`: desktop/mobile/tablet
   - `referrer`: direct o url

---

### **Test 2: Verificar Tracking de Likes**

1. **Abrir consola del navegador**
2. **Ir a** `/properties`
3. **Click** en el corazón verde de una propiedad
4. **Verificar en consola**:
   ```
   ✅ Like registrado exitosamente: 123
   ```

5. **Ir a Supabase** → Tabla `property_likes`
6. **Verificar** nueva fila:
   - `property_id`: número
   - `session_id`: tu session ID

7. **Click nuevamente** en el corazón (quitar like)
8. **Verificar en consola**:
   ```
   ✅ Like eliminado exitosamente: 123
   ```

---

### **Test 3: Verificar Tracking de Contactos**

1. **Abrir modal de propiedad**
2. **Click** "Contactar Asesor"
3. **Llenar formulario**:
   - Nombre: Juan Test
   - Email: test@test.com
   - Teléfono: 3001234567
   - Mensaje: Prueba
4. **Click** "Enviar por WhatsApp"
5. **Verificar en consola**:
   ```
   ✅ Contacto registrado exitosamente: 123 whatsapp
   ```

6. **Ir a Supabase** → Tabla `property_contacts`
7. **Verificar** nueva fila:
   - `property_id`: número
   - `contact_type`: 'whatsapp'
   - `name`: Juan Test
   - `email`: test@test.com

---

### **Test 4: Verificar Dashboard de Reportes**

1. **Login como admin**
2. **Ir al Dashboard**
3. **Click** "Ver Reportes"
4. **Verificar que muestre**:
   - Total Likes (contador actualizado)
   - Total Vistas (debe incrementar)
   - Total Contactos
   - Gráfica con datos reales

5. **Pestaña "Propiedades Populares"**:
   - Debe mostrar ranking actualizado
   - Scores calculados correctamente

6. **Pestaña "Actividad Reciente"**:
   - Debe mostrar las vistas que hiciste
   - Debe mostrar los likes
   - Debe mostrar los contactos

---

## 🐛 Debugging

### **Si no aparecen vistas en la consola**

1. **Abrir DevTools** → Console
2. **Buscar errores rojos**
3. **Verificar**:
   - ¿Hay error de tipo de dato?
   - ¿Hay error de permisos RLS?
   - ¿Session ID está generado?

### **Verificar Session ID**

```javascript
// En consola del navegador
localStorage.getItem('analytics_session_id')
```

Debe devolver algo como: `"session_1234567890_abc123xyz"`

### **Si Session ID es null**

```javascript
// Crear manualmente
localStorage.setItem('analytics_session_id', `session_${Date.now()}_test`)
```

### **Verificar que las tablas existen en Supabase**

1. **Ir a Supabase** → SQL Editor
2. **Ejecutar**:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('property_views', 'property_likes', 'property_contacts');
```

Debe devolver 3 filas.

### **Verificar permisos RLS**

```sql
-- Verificar que las políticas existen
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('property_views', 'property_likes', 'property_contacts');
```

Debe mostrar:
- `Anyone can insert views`
- `Anyone can insert likes`
- `Anyone can insert contacts`

---

## 📊 Consultas SQL Útiles

### **Ver últimas vistas**
```sql
SELECT * FROM property_views 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Contar vistas por propiedad**
```sql
SELECT property_id, COUNT(*) as total_vistas
FROM property_views
GROUP BY property_id
ORDER BY total_vistas DESC;
```

### **Ver últimos contactos**
```sql
SELECT * FROM property_contacts 
ORDER BY created_at DESC 
LIMIT 10;
```

### **Ver estadísticas completas**
```sql
SELECT * FROM property_stats
ORDER BY popularity_score DESC;
```

---

## ✅ Checklist de Verificación

- ✅ Código compilado sin errores
- ✅ Funciones con `parseInt()` implementado
- ✅ Logs de debugging agregados
- ✅ Manejo de errores mejorado
- ✅ Compatibilidad string/number manejada
- ⏳ **Pendiente**: Probar en desarrollo
- ⏳ **Pendiente**: Verificar datos en Supabase
- ⏳ **Pendiente**: Confirmar gráficas actualizadas

---

## 🚀 Próximos Pasos

1. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Abrir en navegador**: http://localhost:5175

3. **Realizar pruebas**:
   - Ver 3-5 propiedades diferentes
   - Dar like a 2-3 propiedades
   - Contactar por WhatsApp
   - Agendar 1 cita

4. **Verificar en Supabase**:
   - Tabla `property_views` debe tener registros
   - Tabla `property_likes` debe tener registros
   - Tabla `property_contacts` debe tener registros

5. **Verificar Dashboard**:
   - Abrir modal de reportes
   - Verificar que las gráficas muestren datos
   - Verificar contador de vistas actualizado

---

## 📝 Notas Técnicas

### **¿Por qué parseInt()?**

La base de datos tiene `property_id` como **BIGINT** (número entero de 64 bits), pero JavaScript/TypeScript maneja los IDs como strings en muchos lugares. La conversión es necesaria para compatibilidad.

### **¿Por qué String() en getUserLikes()?**

El frontend espera arrays de strings, pero Supabase devuelve números. La conversión mantiene la compatibilidad sin romper el código existente.

### **¿Es seguro parseInt()?**

Sí, porque:
1. Los IDs siempre son números en la BD
2. Si el string no es numérico, `parseInt()` devuelve `NaN` y la query falla (esperado)
3. El manejo de errores captura cualquier problema

---

## ✅ Estado Final

**Compilación**: ✅ Exitosa
```bash
✓ 3224 modules transformed
dist/index-DULSZFUn.js: 1,948.29 kB │ gzip: 534.85 kB
✓ built in 12.06s
```

**Funciones Corregidas**: 7/7 ✅

**Listo para Pruebas**: ✅

---

**Fecha de corrección**: 2024-10-06  
**Archivo modificado**: `src/lib/analytics.ts`  
**Líneas modificadas**: ~50 líneas  
**Estado**: ✅ LISTO PARA PROBAR
