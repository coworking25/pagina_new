# 🎯 ACLARACIÓN: ADVISORS vs ADMINS

**Fecha:** 20 de Octubre, 2025

---

## ❌ **MI ERROR:**

Confundí dos conceptos diferentes:

### **ADVISORS (Asesores)** ≠ **ADMINS (Administradores)**

```
┌─────────────────────────────────────────────────────────────┐
│  ADVISORS                    vs       ADMINS                │
├─────────────────────────────────────────────────────────────┤
│  👔 Asesores de propiedades          🔐 Admin del sistema   │
│  📌 Aparecen en las propiedades      🖥️ Acceso al dashboard │
│  👤 Juan, María, Pedro, etc.         👤 diegoadmin@gmail.com│
│  📊 Tabla: advisors                  📊 Tabla: ¿users? TBD   │
│  🏢 Visible al público               🔒 Solo backend/admin   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔍 **SISTEMA REAL DE AUTENTICACIÓN:**

### **1. Supabase Auth (auth.users)**
- Tabla built-in de Supabase
- Contiene: email, password (encriptada), metadata
- Usuarios: `diegoadmin@gmail.com`, `admincoworkin@inmobiliaria.com`

### **2. Funciones RPC:**
```sql
-- Funciones que verifican si tienes acceso
is_admin()   → ¿Eres administrador del sistema?
is_advisor() → ¿Eres asesor de propiedades?
```

### **3. Tabla de Perfiles (TBD - Por descubrir)**
Podría ser:
- `users`
- `profiles`
- `admin_users`
- O los permisos están solo en `auth.users.raw_user_meta_data`

---

## 🎯 **LO QUE NECESITAMOS DESCUBRIR:**

Ejecutando `DIAGNOSTICO_SISTEMA_ADMINS_REAL.sql` sabremos:

1. **¿Cómo funcionan `is_admin()` e `is_advisor()`?**
   - ¿Qué tabla consultan?
   - ¿Qué campo verifican?

2. **¿Dónde está tu usuario `diegoadmin@gmail.com`?**
   - En `auth.users` ✅ (seguro)
   - ¿En otra tabla también?

3. **¿Cómo se marca un usuario como "admin"?**
   - ¿Campo `role` en `auth.users.raw_user_meta_data`?
   - ¿Registro en tabla `users` con `role='admin'`?
   - ¿Otro método?

4. **¿Por qué `admincoworkin@inmobiliaria.com` no funciona?**
   - ¿No existe en `auth.users`?
   - ¿Existe pero sin rol de admin?
   - ¿Contraseña incorrecta?

---

## 📝 **TUS REQUISITOS:**

1. ✅ **Eliminar:** `admincoworkin@inmobiliaria.com` (no funciona)
2. ✅ **Mantener:** `diegoadmin@gmail.com` (admin principal)
3. ✅ **Agregar:** Tu usuario actual como admin 2
4. ✅ **Implementar:** Panel para que Diego pueda:
   - Crear nuevos admins
   - Cambiar contraseñas
   - Activar/desactivar admins
   - Gestionar permisos

---

## 🚀 **SIGUIENTE PASO:**

**EJECUTA:**
```sql
-- Archivo: DIAGNOSTICO_SISTEMA_ADMINS_REAL.sql
```

**Esto revelará:**
- La tabla correcta de admins
- Cómo agregar/eliminar admins
- La estructura real del sistema

**Comparte los resultados** y entonces podré crear el script correcto para:
1. Eliminar el admin no funcional
2. Agregar tu usuario como admin
3. Crear el panel de gestión de admins para Diego

---

## 💡 **APRENDIZAJE:**

```typescript
// ❌ INCORRECTO (lo que pensé)
"advisors" = Admins del sistema

// ✅ CORRECTO (realidad)
"advisors" = Asesores de propiedades (Juan, María, Pedro)
"???" = Admins del sistema (diegoadmin@gmail.com)

// Las políticas RLS estaban verificando advisors
// Por eso no funcionaba el DELETE
```

---

**ESTADO:** ⏳ **Esperando diagnóstico del sistema real**  
**ARCHIVO:** `DIAGNOSTICO_SISTEMA_ADMINS_REAL.sql`  
**ACCIÓN:** Ejecutar y compartir resultados
