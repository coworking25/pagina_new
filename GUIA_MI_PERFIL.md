# 👤 MI PERFIL - GUÍA RÁPIDA

## ✅ **IMPLEMENTADO**

Se ha creado una página completa "Mi Perfil" donde puedes:

✅ **Cambiar tu email**
✅ **Actualizar nombre completo**
✅ **Modificar teléfono**
✅ **Cambiar departamento y cargo**
✅ **Cambiar contraseña**
✅ **Ver información de tu cuenta**

---

## 🎯 **CÓMO ACCEDER**

### **Opción 1: Desde el menú lateral**
1. Ve a cualquier página del dashboard admin
2. En el menú izquierdo, busca **"Mi Perfil"** (ícono de usuario)
3. Click en "Mi Perfil"

### **Opción 2: Desde tu nombre**
1. En la parte inferior del menú lateral
2. Click en tu **nombre/email**
3. Te llevará directo al perfil

### **Opción 3: URL directa**
```
http://localhost:5173/admin/profile
```

---

## 📧 **CÓMO CAMBIAR TU EMAIL**

### **Paso a paso:**

1. **Ve a Mi Perfil** (cualquiera de las 3 opciones de arriba)

2. **Click en "Editar"** (botón superior derecho)

3. **Cambia el email** en el campo "Correo Electrónico"

4. **Click en "Guardar Cambios"**

5. **⚠️ IMPORTANTE:** 
   - Recibirás un email de confirmación en el **NUEVO email**
   - Debes hacer click en el link del email para confirmar el cambio
   - Mientras tanto, puedes seguir usando tu email actual

6. **Una vez confirmado:**
   - Haz logout
   - Haz login con el **nuevo email**
   - ¡Listo! 🎉

---

## 🔒 **CAMBIAR CONTRASEÑA**

1. Ve a **Mi Perfil**
2. En la sección "Seguridad"
3. Click en **"Cambiar Contraseña"**
4. Ingresa:
   - Nueva contraseña (mínimo 6 caracteres)
   - Confirmar nueva contraseña
5. Click en **"Cambiar Contraseña"**
6. ¡Listo! El cambio es inmediato

**Requisitos de contraseña:**
- Mínimo 6 caracteres
- Al menos 1 mayúscula (A-Z)
- Al menos 1 minúscula (a-z)
- Al menos 1 número (0-9)

---

## 📝 **CAMPOS QUE PUEDES EDITAR**

### **Información Personal:**
- ✅ **Nombre Completo**
- ✅ **Email** (requiere confirmación)
- ✅ **Teléfono**
- ✅ **Departamento**
- ✅ **Cargo**

### **Seguridad:**
- ✅ **Contraseña**

### **Información de Solo Lectura:**
- 👁️ Rol (admin/advisor)
- 👁️ Estado (activo/inactivo)
- 👁️ Fecha de creación
- 👁️ Último acceso

---

## ⚠️ **IMPORTANTE AL CAMBIAR EMAIL**

### **Proceso de confirmación:**

1. **Supabase enviará un email automáticamente** al nuevo correo
2. El asunto será: **"Confirm email change"**
3. **Tienes 24 horas** para confirmar el cambio
4. Si no confirmas, el email NO se cambiará

### **Durante el proceso:**

- ✅ Tu sesión actual sigue activa
- ✅ Puedes seguir usando el dashboard
- ✅ Puedes hacer login con el email VIEJO hasta que confirmes
- ⚠️ NO podrás hacer login con el nuevo email hasta confirmar

### **Después de confirmar:**

- ✅ El email NUEVO es el único válido
- ✅ El email VIEJO ya no funciona
- ✅ Usa el nuevo email para login

---

## 🐛 **TROUBLESHOOTING**

### **"No me llega el email de confirmación"**

1. **Revisa spam/correo no deseado**
2. **Espera 2-3 minutos** (puede tardar)
3. **Verifica que el nuevo email esté bien escrito**
4. Si después de 5 minutos no llega:
   - Ve a Supabase Dashboard
   - Authentication → Users
   - Tu usuario → "Email Confirmed" → márcar como true

### **"El email cambió pero no puedo hacer login"**

- Asegúrate de confirmar el email primero
- Revisa que estés usando el email correcto
- Intenta recuperar contraseña con el nuevo email

### **"Quiero cancelar el cambio de email"**

- Si aún no has confirmado:
  - Simplemente ignora el email
  - Después de 24 horas expirará
  - Tu email original seguirá activo

- Si ya confirmaste:
  - Ve a Mi Perfil
  - Cambia el email de nuevo al original
  - Confirma el nuevo cambio

---

## 💡 **TIPS**

- 🔔 **Mantén tu email actualizado** para recibir notificaciones
- 🔒 **Cambia tu contraseña regularmente** (cada 3 meses)
- 📱 **Agrega un teléfono** para recuperación de cuenta
- ✏️ **Completa tu perfil** con departamento y cargo

---

## 🎨 **CARACTERÍSTICAS**

### **Diseño:**
- ✅ Responsive (móvil y desktop)
- ✅ Dark mode compatible
- ✅ Animaciones suaves
- ✅ Feedback visual

### **Seguridad:**
- ✅ Confirmación de email obligatoria
- ✅ Validación de contraseña fuerte
- ✅ Sesión protegida
- ✅ Cambios auditados

### **UX:**
- ✅ Edición en el mismo lugar
- ✅ Mensajes de éxito/error claros
- ✅ Botones deshabilitados durante guardado
- ✅ Confirmación visual de requisitos

---

## 📍 **UBICACIÓN EN EL MENÚ**

El ítem "Mi Perfil" está ubicado entre:
- **Reportes** (arriba)
- **Configuración** (abajo)

---

## 🔗 **ENLACES RELACIONADOS**

- **Mi Perfil:** `/admin/profile`
- **Configuración del Sistema:** `/admin/settings`
- **Dashboard:** `/admin/dashboard`

---

**¡Tu perfil está listo para personalizar! 🎉**

Solo inicia sesión en el dashboard y ve a "Mi Perfil" para comenzar.
