# ⚠️ ERROR - Supabase Connection Closed

**Fecha:** 20 de Octubre, 2025  
**Error:** `ERR_CONNECTION_CLOSED` al intentar acceder a Supabase  
**Endpoint:** `GET https://gfczfjpyyyyvteyrvhgt.supabase.co/rest/v1/property_appointments`

---

## 📋 DESCRIPCIÓN DEL ERROR

Después de solucionar el error de encoding BOM, la aplicación ahora muestra un error de conexión:

```
AdminBadgeContext.tsx:121 
GET https://gfczfjpyyyyvteyrvhgt.supabase.co/rest/v1/property_appointments?select=*&deleted_at=is.null&order=created_at.desc 
net::ERR_CONNECTION_CLOSED

❌ Error al obtener todas las citas: 
{message: 'TypeError: Failed to fetch', details: 'TypeError: Failed to fetch...', hint: '', code: ''}
```

---

## 🔍 POSIBLES CAUSAS

### 1️⃣ **Proyecto Supabase Pausado** (Más Probable)
Supabase pausa proyectos gratuitos después de 1 semana de inactividad.

**Solución:**
1. Ve a https://supabase.com/dashboard
2. Busca el proyecto `gfczfjpyyyyvteyrvhgt`
3. Click en "Resume Project" / "Reanudar Proyecto"
4. Espera 2-3 minutos a que se reactive

---

### 2️⃣ **Problema de Red/Firewall**
Tu red o firewall puede estar bloqueando la conexión a Supabase.

**Verificar:**
```powershell
# Test de conectividad
Test-NetConnection -ComputerName gfczfjpyyyyvteyrvhgt.supabase.co -Port 443
```

**Solución temporal:**
- Desactiva temporalmente el antivirus/firewall
- Prueba con otra red WiFi
- Usa un VPN si es necesario

---

### 3️⃣ **Credenciales Incorrectas o Expiradas**
Las API keys pueden haber expirado.

**Verificar en `.env`:**
```env
VITE_SUPABASE_URL=https://gfczfjpyyyyvteyrvhgt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Solución:**
1. Ve a Supabase Dashboard → Settings → API
2. Copia nuevamente las API keys
3. Actualiza el archivo `.env`
4. Reinicia el servidor de desarrollo

---

### 4️⃣ **Too Many Requests (Rate Limiting)**
El `setInterval` cada 30 segundos puede estar sobrecargando la API.

**Ubicación del problema:**
```tsx
// AdminBadgeContext.tsx:121
useEffect(() => {
  const interval = setInterval(refreshBadges, 30000); // ⚠️ Cada 30 segundos
  return () => clearInterval(interval);
}, []);
```

**Solución temporal:**
Aumentar el intervalo a 60 segundos o más:
```tsx
const interval = setInterval(refreshBadges, 60000); // 60 segundos
```

---

## ✅ SOLUCIONES PASO A PASO

### **SOLUCIÓN #1: Reactivar Proyecto Supabase** (Recomendada)

1. **Ir al Dashboard:**
   - Abre https://supabase.com/dashboard/projects
   - Inicia sesión si es necesario

2. **Localizar proyecto:**
   - Busca el proyecto con URL `gfczfjpyyyyvteyrvhgt.supabase.co`
   - Si está pausado, verá un banner "Project Paused"

3. **Reactivar:**
   - Click en "Restore Project" / "Resume Project"
   - Espera 2-3 minutos a que se active

4. **Verificar:**
   - Ve a Settings → API
   - Verifica que las URLs funcionen

---

### **SOLUCIÓN #2: Reducir Frecuencia de Polling**

Si el proyecto está activo pero sigue fallando:

```tsx
// src/contexts/AdminBadgeContext.tsx
useEffect(() => {
  // Cambiar de 30000 (30s) a 120000 (2min)
  const interval = setInterval(refreshBadges, 120000);
  return () => clearInterval(interval);
}, []);
```

---

### **SOLUCIÓN #3: Agregar Manejo de Errores Robusto**

Mejorar el código para que no falle silenciosamente:

```tsx
// src/contexts/AdminBadgeContext.tsx
const refreshBadges = async () => {
  try {
    // ... código existente ...
  } catch (error) {
    console.warn('⚠️ No se pudieron actualizar los badges:', error);
    // NO lanzar error, simplemente continuar
    // La app seguirá funcionando aunque no se actualicen los badges
  }
};
```

---

### **SOLUCIÓN #4: Modo Offline/Fallback**

Agregar un estado de fallback cuando Supabase no responde:

```tsx
const [isOnline, setIsOnline] = useState(true);

const refreshBadges = async () => {
  try {
    const appointments = await getAllPropertyAppointments();
    setIsOnline(true); // ✅ Conexión restaurada
    // ... resto del código
  } catch (error) {
    setIsOnline(false); // ❌ Sin conexión
    console.warn('Modo offline - badges no actualizados');
    return; // Salir sin fallar
  }
};
```

---

## 🛠️ COMANDOS PARA DEBUGGING

### **1. Verificar conectividad a Supabase:**
```powershell
Test-NetConnection -ComputerName gfczfjpyyyyvteyrvhgt.supabase.co -Port 443
```

### **2. Verificar variables de entorno:**
```powershell
Get-Content .env
```

### **3. Test manual de API:**
```powershell
$headers = @{
    "apikey" = "TU_ANON_KEY_AQUI"
    "Authorization" = "Bearer TU_ANON_KEY_AQUI"
}
Invoke-RestMethod -Uri "https://gfczfjpyyyyvteyrvhgt.supabase.co/rest/v1/property_appointments?select=*&limit=1" -Headers $headers
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

- [ ] **Proyecto Supabase activo** (no pausado)
- [ ] **Conexión a internet estable**
- [ ] **Firewall/antivirus no bloqueando**
- [ ] **API keys correctas en `.env`**
- [ ] **Servidor de desarrollo reiniciado** después de cambios en `.env`
- [ ] **Intervalo de polling razonable** (60-120 segundos)
- [ ] **Manejo de errores implementado**

---

## 🎯 ACCIÓN INMEDIATA RECOMENDADA

**Paso 1:** Ve a https://supabase.com/dashboard y verifica si el proyecto está pausado

**Paso 2:** Si está pausado, reactívalo

**Paso 3:** Mientras esperas, reduce la frecuencia del polling:

```tsx
// Cambiar línea 121 en AdminBadgeContext.tsx
const interval = setInterval(refreshBadges, 120000); // De 30s a 2min
```

**Paso 4:** Agrega manejo de errores para que la app no falle:

```tsx
const refreshBadges = async () => {
  try {
    // ... código existente ...
  } catch (error) {
    console.warn('⚠️ Badges no actualizados:', error.message);
    // Continuar sin fallar
  }
};
```

---

## ⚡ SOLUCIÓN RÁPIDA (Temporal)

Si necesitas que la app funcione YA mientras investigas:

**Comentar el setInterval temporalmente:**

```tsx
// src/contexts/AdminBadgeContext.tsx línea 121
useEffect(() => {
  // TEMPORALMENTE DESACTIVADO - descomentar cuando Supabase esté activo
  // const interval = setInterval(refreshBadges, 30000);
  // return () => clearInterval(interval);
}, []);
```

Esto hará que:
- ✅ La app cargue sin errores
- ❌ Los badges NO se actualicen automáticamente
- ✅ Los badges se actualicen en la carga inicial

---

## 📚 REFERENCIAS

- [Supabase Project Pausing](https://supabase.com/docs/guides/platform/going-into-prod#project-pausing)
- [Supabase Connection Issues](https://github.com/supabase/supabase/discussions?discussions_q=connection+closed)
- [React Polling Best Practices](https://www.joshwcomeau.com/react/polling/)

---

**✅ PRÓXIMOS PASOS**

1. Verifica el estado del proyecto en Supabase Dashboard
2. Implementa una de las soluciones arriba
3. Una vez resuelto, continuar con **Problema #4: Wizard no guarda datos completos**

---

**Generado por:** GitHub Copilot  
**Fecha:** 20 de Octubre, 2025
