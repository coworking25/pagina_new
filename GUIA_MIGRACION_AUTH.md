# 🔐 GUÍA DE MIGRACIÓN A SUPABASE AUTH

## Fecha: 2 de Octubre, 2025

---

## 📋 RESUMEN DE LA MIGRACIÓN

Se ha migrado el sistema de autenticación de **credenciales hardcodeadas** a **Supabase Auth con Row Level Security (RLS)**. Esto proporciona:

✅ **Seguridad mejorada:** No más passwords en código  
✅ **RLS en todas las tablas:** Control de acceso a nivel de base de datos  
✅ **Gestión de usuarios:** Sistema profesional de usuarios  
✅ **Roles y permisos:** Admin, Advisor, User  
✅ **Auditoría:** Logs de autenticación  
✅ **Escalabilidad:** Preparado para crecimiento  

---

## 🚀 PASOS PARA COMPLETAR LA MIGRACIÓN

### **PASO 1: Ejecutar SQL en Supabase**

1. Ir a Supabase Dashboard: https://supabase.com/dashboard
2. Seleccionar tu proyecto
3. Ir a **SQL Editor**
4. Abrir el archivo `MIGRATION_AUTH_TO_SUPABASE.sql`
5. Copiar TODO el contenido
6. Pegarlo en el SQL Editor
7. Hacer clic en **RUN**

**Resultado esperado:**
```
✅ Migración completada exitosamente
📋 Tablas creadas: user_profiles, auth_logs
🔐 RLS habilitado en todas las tablas principales
🔧 Funciones auxiliares creadas
👥 Políticas de seguridad aplicadas
```

---

### **PASO 2: Crear Usuario Admin**

#### **Opción A: Desde Supabase Dashboard (RECOMENDADO)**

1. Ir a **Authentication** > **Users**
2. Hacer clic en **Add user** > **Create new user**
3. Llenar los campos:
   ```
   Email: admincoworkin@inmobiliaria.com
   Password: TU_NUEVA_CONTRASEÑA_SEGURA
   Auto Confirm User: ✅ (activar)
   ```
4. Hacer clic en **Create user**

5. Ahora editar el perfil del usuario:
   - Ir a **SQL Editor**
   - Ejecutar:
   ```sql
   UPDATE public.user_profiles
   SET role = 'admin',
       full_name = 'Admin Coworkin',
       is_active = true
   WHERE email = 'admincoworkin@inmobiliaria.com';
   ```

#### **Opción B: Con SQL**

```sql
-- Esto NO funcionará en versiones recientes de Supabase
-- Usar la opción A desde el Dashboard
```

---

### **PASO 3: Verificar Variables de Entorno**

Asegúrate de tener en tu archivo `.env`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

---

### **PASO 4: Probar la Autenticación**

1. Reiniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

2. Ir a http://localhost:5173/login

3. Intentar login con:
   ```
   Email: admincoworkin@inmobiliaria.com
   Password: LA_CONTRASEÑA_QUE_CREASTE
   ```

4. Verificar que:
   - ✅ Login exitoso
   - ✅ Redirige a /admin/dashboard
   - ✅ Se muestra información del usuario
   - ✅ Todas las funciones admin funcionan

---

## 🔧 FUNCIONALIDADES AGREGADAS

### **1. AuthContext (Contexto Global de Autenticación)**

Ahora puedes usar el hook `useAuth()` en cualquier componente:

```typescript
import { useAuth } from '../contexts/AuthContext';

function MiComponente() {
  const { 
    user,           // Usuario actual
    isLoading,      // Estado de carga
    isAuthenticated,// ¿Está autenticado?
    isAdmin,        // ¿Es admin?
    isAdvisor,      // ¿Es asesor?
    login,          // Función de login
    logout,         // Función de logout
    updateProfile,  // Actualizar perfil
    changePassword  // Cambiar contraseña
  } = useAuth();

  return (
    <div>
      {user && <p>Hola, {user.full_name}!</p>}
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### **2. Funciones de Autenticación Mejoradas**

```typescript
// Login
await loginUser(email, password);

// Logout
await logoutUser();

// Verificar si está autenticado
const isAuth = await isAuthenticated();

// Obtener usuario actual
const user = await getCurrentUser();

// Verificar si es admin
const admin = await isAdmin();

// Verificar si es asesor
const advisor = await isAdvisor();

// Registrar nuevo usuario (solo admins)
await registerUser({
  email: 'nuevo@inmobiliaria.com',
  password: 'password123',
  full_name: 'Nuevo Usuario',
  role: 'advisor', // 'admin' | 'advisor' | 'user'
  phone: '+57 300 123 4567',
  department: 'Ventas',
  position: 'Asesor Senior'
});

// Cambiar contraseña
await changePassword('nuevaContraseña123');

// Solicitar reseteo de contraseña
await requestPasswordReset('usuario@email.com');

// Actualizar perfil
await updateUserProfile({
  full_name: 'Nombre Actualizado',
  phone: '+57 300 999 8888',
  avatar_url: 'https://...'
});
```

### **3. Escuchar Cambios de Autenticación**

```typescript
import { onAuthStateChange } from '../lib/supabase';

// En un useEffect
useEffect(() => {
  const { data: { subscription } } = onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    // event puede ser: 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED', etc.
  });

  return () => subscription?.unsubscribe();
}, []);
```

---

## 🔒 ROW LEVEL SECURITY (RLS)

### **Políticas Implementadas**

#### **user_profiles**
- ✅ Los usuarios pueden ver su propio perfil
- ✅ Los usuarios pueden actualizar su propio perfil
- ✅ Los admins pueden ver todos los perfiles
- ✅ Los admins pueden actualizar cualquier perfil
- ✅ Los admins pueden crear perfiles

#### **properties**
- ✅ Todos pueden ver propiedades
- ✅ Solo admins y asesores pueden crear propiedades
- ✅ Solo admins y asesores pueden actualizar propiedades
- ✅ Solo admins pueden eliminar propiedades

#### **property_appointments**
- ✅ Usuarios ven sus propias citas
- ✅ Admins y asesores ven todas las citas
- ✅ Todos pueden crear citas
- ✅ Solo admins y asesores pueden actualizar citas
- ✅ Solo admins pueden eliminar citas

#### **advisors**
- ✅ Todos pueden ver asesores
- ✅ Solo admins pueden crear asesores
- ✅ Asesores pueden actualizar su propio perfil
- ✅ Admins pueden actualizar cualquier asesor
- ✅ Solo admins pueden eliminar asesores

#### **service_inquiries**
- ✅ Admins y asesores ven todas las consultas
- ✅ Todos pueden crear consultas
- ✅ Solo admins y asesores pueden actualizar consultas
- ✅ Solo admins pueden eliminar consultas

#### **clients**
- ✅ Solo admins y asesores pueden ver clientes
- ✅ Solo admins y asesores pueden crear clientes
- ✅ Solo admins y asesores pueden actualizar clientes
- ✅ Solo admins pueden eliminar clientes

---

## 📊 TABLA: user_profiles

### **Estructura**

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,              -- UUID del usuario en auth.users
  email TEXT UNIQUE NOT NULL,       -- Email del usuario
  full_name TEXT,                   -- Nombre completo
  role TEXT NOT NULL,               -- 'admin', 'advisor', 'user'
  phone TEXT,                       -- Teléfono
  avatar_url TEXT,                  -- URL del avatar
  department TEXT,                  -- Departamento
  position TEXT,                    -- Cargo
  is_active BOOLEAN DEFAULT true,   -- ¿Está activo?
  last_login_at TIMESTAMP,          -- Último login
  created_at TIMESTAMP,             -- Fecha de creación
  updated_at TIMESTAMP,             -- Fecha de actualización
  metadata JSONB                    -- Metadatos adicionales
);
```

### **Roles Disponibles**

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador | Acceso completo a todo |
| `advisor` | Asesor inmobiliario | Gestión de propiedades, citas, clientes |
| `user` | Usuario normal | Solo lectura |

---

## 📝 TABLA: auth_logs

### **Estructura**

```sql
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY,
  user_id UUID,                     -- ID del usuario
  action TEXT NOT NULL,             -- 'login', 'logout', 'failed_login', etc.
  ip_address INET,                  -- IP del usuario
  user_agent TEXT,                  -- Navegador/dispositivo
  metadata JSONB,                   -- Datos adicionales
  created_at TIMESTAMP              -- Fecha del evento
);
```

### **Acciones Registradas**

- `login` - Login exitoso
- `logout` - Logout
- `failed_login` - Intento de login fallido
- `password_reset` - Cambio de contraseña
- `email_change` - Cambio de email

---

## 🛠️ FUNCIONES AUXILIARES DE SUPABASE

### **is_admin()**
Verifica si el usuario actual es admin.

```sql
SELECT public.is_admin();
-- Retorna: true/false
```

### **is_advisor()**
Verifica si el usuario actual es admin o asesor.

```sql
SELECT public.is_advisor();
-- Retorna: true/false
```

### **get_current_user_profile()**
Obtiene el perfil completo del usuario actual.

```sql
SELECT * FROM public.get_current_user_profile();
```

### **update_last_login()**
Actualiza la fecha del último login.

```sql
SELECT public.update_last_login();
```

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

### **URGENTE (Esta semana):**

1. ✅ **Ejecutar SQL de migración en Supabase**
2. ✅ **Crear usuario admin**
3. ✅ **Probar login y funcionalidades**
4. ⏳ **Crear usuarios para todo el equipo**
5. ⏳ **Configurar emails de Supabase Auth** (para reseteo de contraseña)

### **IMPORTANTE (Próximas 2 semanas):**

6. ⏳ **Implementar página de reseteo de contraseña**
7. ⏳ **Implementar página de perfil de usuario**
8. ⏳ **Agregar upload de avatar**
9. ⏳ **Testing exhaustivo de permisos**
10. ⏳ **Documentar usuarios del sistema**

### **MEJORAS FUTURAS:**

11. ⏳ **Autenticación con Google/Microsoft**
12. ⏳ **Two-Factor Authentication (2FA)**
13. ⏳ **Logs de auditoría mejorados**
14. ⏳ **Dashboard de actividad de usuarios**
15. ⏳ **Sesiones concurrentes limitadas**

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### **Problema: "Invalid login credentials"**

**Causa:** Usuario no existe o contraseña incorrecta

**Solución:**
1. Verificar que el usuario existe en Supabase Dashboard
2. Verificar que `Auto Confirm User` está activado
3. Verificar que el email y password son correctos
4. Revisar que el perfil existe en `user_profiles`

### **Problema: "User has no profile"**

**Causa:** El perfil no se creó automáticamente

**Solución:**
```sql
-- Crear perfil manualmente
INSERT INTO public.user_profiles (id, email, full_name, role)
SELECT 
  id, 
  email, 
  email, 
  'admin'
FROM auth.users
WHERE email = 'tu@email.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles WHERE id = auth.users.id
);
```

### **Problema: "RLS policy violation"**

**Causa:** El usuario no tiene permisos para la acción

**Solución:**
1. Verificar el rol del usuario:
   ```sql
   SELECT role FROM public.user_profiles WHERE email = 'tu@email.com';
   ```
2. Actualizar rol si es necesario:
   ```sql
   UPDATE public.user_profiles 
   SET role = 'admin' 
   WHERE email = 'tu@email.com';
   ```

### **Problema: "Session expired"**

**Causa:** La sesión caducó

**Solución:**
- El sistema refresca automáticamente el token
- Si persiste, hacer logout y volver a entrar

---

## 🔐 SEGURIDAD

### **Buenas Prácticas Implementadas:**

✅ **Passwords hasheados** - Supabase usa bcrypt  
✅ **Tokens JWT** - Autenticación segura  
✅ **RLS** - Control de acceso a nivel de BD  
✅ **HTTPS** - Comunicación encriptada  
✅ **Logging** - Auditoría de accesos  
✅ **Rate limiting** - Protección contra ataques  

### **Recomendaciones Adicionales:**

- 🔒 **Habilitar 2FA** (próximamente)
- 🔒 **Configurar políticas de contraseñas fuertes**
- 🔒 **Revisar logs de auth_logs regularmente**
- 🔒 **Revocar sesiones sospechosas**
- 🔒 **Backup regular de datos de usuarios**

---

## 📚 RECURSOS

### **Documentación Oficial:**

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)

### **Archivos del Proyecto:**

- `MIGRATION_AUTH_TO_SUPABASE.sql` - SQL de migración
- `src/lib/supabase.ts` - Funciones de autenticación
- `src/contexts/AuthContext.tsx` - Contexto global
- `src/pages/Login.tsx` - Página de login
- `src/components/ProtectedRoute.tsx` - Protección de rutas

---

## ✅ CHECKLIST DE MIGRACIÓN

- [ ] SQL ejecutado en Supabase
- [ ] Usuario admin creado
- [ ] Login funciona correctamente
- [ ] Dashboard admin accesible
- [ ] Todas las páginas admin funcionan
- [ ] RLS políticas verificadas
- [ ] Logout funciona
- [ ] Permisos probados
- [ ] Logs de auth funcionando
- [ ] Documentación actualizada

---

## 💬 SOPORTE

Si encuentras problemas durante la migración:

1. Revisar esta guía completamente
2. Revisar logs en consola del navegador
3. Revisar logs en Supabase Dashboard
4. Verificar variables de entorno
5. Contactar al equipo de desarrollo

---

**Última actualización:** 2 de Octubre, 2025  
**Versión:** 1.0  
**Estado:** ✅ Migración completada en código, pendiente ejecutar en Supabase

