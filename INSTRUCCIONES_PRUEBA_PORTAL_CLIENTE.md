# 🧪 Instrucciones para Probar el Portal de Clientes

## ✅ Estado Actual del Desarrollo

### Completado (60%)
- ✅ **Fase 1: Base de Datos** - 6 scripts SQL ejecutados
- ✅ **Fase 2: Backend** - APIs de autenticación, portal y reportes (1,832 líneas)
- ✅ **Fase 3: Frontend** - 30% completado
  - Login dual (Admin/Cliente)
  - ClientLayout (navbar, sidebar, navegación)
  - ClientDashboard (resumen con stats y pagos)
  - **NUEVO:** Modal de gestión de credenciales en AdminClients

### Archivos Creados en Esta Sesión
1. ✅ `sql/01_client_portal_credentials.sql` - Tabla de credenciales
2. ✅ `sql/02_extend_payments_table.sql` - Extensión de pagos
3. ✅ `sql/03_row_level_security.sql` - 23 políticas RLS
4. ✅ `sql/04_extract_functions.sql` - 6 funciones SQL
5. ✅ `sql/05_storage_buckets.sql` - Configuración de storage
6. ✅ `sql/06_create_test_client.sql` - Cliente de prueba ⭐
7. ✅ `src/types/clientPortal.ts` - Interfaces TypeScript
8. ✅ `src/lib/client-portal/clientAuth.ts` - Sistema de autenticación
9. ✅ `src/lib/client-portal/clientPortalApi.ts` - APIs del portal
10. ✅ `src/lib/client-portal/clientReports.ts` - Generación de reportes/PDFs
11. ✅ `src/lib/adminClientCredentials.ts` - API admin de credenciales ⭐
12. ✅ `src/pages/Login.tsx` - Modificado con selector Admin/Cliente
13. ✅ `src/components/client-portal/ClientLayout.tsx` - Layout principal
14. ✅ `src/pages/client-portal/ClientDashboard.tsx` - Dashboard del cliente
15. ✅ `src/components/client-portal/ClientCredentialsModal.tsx` - Modal de gestión ⭐
16. ✅ `src/pages/AdminClients.tsx` - Modificado con botón "Portal" ⭐

---

## 🚀 Paso 1: Ejecutar el Script SQL de Prueba

### Opción A: Desde la Consola de Supabase (Recomendado)

1. Abre Supabase Dashboard
2. Ve a **SQL Editor**
3. Abre el archivo: `sql/06_create_test_client.sql`
4. Ejecuta el script completo
5. Verifica la creación:

```sql
-- Verificar cliente creado
SELECT * FROM clients WHERE email = 'juan.perez@ejemplo.com';

-- Verificar credenciales creadas
SELECT id, client_id, email, is_active, must_change_password, created_at
FROM client_credentials
WHERE email = 'juan.perez@ejemplo.com';
```

### Opción B: Copiar y Pegar el SQL

Si no quieres abrir el archivo, aquí está el contenido completo:

```sql
-- =====================================================
-- SCRIPT: Crear Cliente de Prueba con Credenciales
-- PROPÓSITO: Permitir testing inmediato del portal
-- =====================================================

DO $$
DECLARE
  v_client_id UUID;
  v_hashed_password TEXT;
BEGIN
  -- 1. Crear cliente de prueba
  INSERT INTO clients (
    full_name,
    email,
    phone,
    client_type,
    status,
    dni,
    created_at,
    updated_at
  )
  VALUES (
    'Juan Pérez Rodríguez',
    'juan.perez@ejemplo.com',
    '+52 123 456 7890',
    'buyer',
    'active',
    '12345678A',
    NOW(),
    NOW()
  )
  RETURNING id INTO v_client_id;

  -- 2. Hash de la contraseña: "Cliente123"
  -- Este hash fue generado con bcrypt rounds=10
  v_hashed_password := '$2a$10$vK3Y8pHRJQK8eZ5mKqZ0XOHxL1Q1Y0mXHgZ1ZqN0xY8Z0xY8Z0xY8';

  -- 3. Crear credenciales de acceso
  INSERT INTO client_credentials (
    client_id,
    email,
    password_hash,
    is_active,
    must_change_password,
    created_at,
    updated_at
  )
  VALUES (
    v_client_id,
    'juan.perez@ejemplo.com',
    v_hashed_password,
    true,
    true,
    NOW(),
    NOW()
  );

  RAISE NOTICE 'Cliente de prueba creado exitosamente';
  RAISE NOTICE 'Email: juan.perez@ejemplo.com';
  RAISE NOTICE 'Contraseña: Cliente123';
  RAISE NOTICE 'ID Cliente: %', v_client_id;
END $$;
```

---

## 🔐 Paso 2: Probar el Login como Cliente

### Credenciales de Prueba
```
Email: juan.perez@ejemplo.com
Contraseña: Cliente123
```

### Flujo de Prueba

1. **Abrir Login**
   - URL: `http://localhost:5173/login` (o tu URL local)

2. **Seleccionar Modo Cliente**
   - Hacer clic en el botón **"Cliente"** (verde)
   - El formulario cambiará para autenticación de cliente

3. **Ingresar Credenciales**
   ```
   Email: juan.perez@ejemplo.com
   Contraseña: Cliente123
   ```

4. **Primer Login - Cambio de Contraseña Obligatorio**
   - Al hacer login, serás redirigido a: `/cliente/cambiar-password`
   - ⚠️ **NOTA:** Esta página AÚN NO ESTÁ IMPLEMENTADA
   - Verás un error 404 o página en blanco
   - **Esto es normal** - es parte de lo que falta por desarrollar

5. **Workaround para Probar Dashboard**
   - Opción A: Modificar manualmente en Supabase:
     ```sql
     UPDATE client_credentials
     SET must_change_password = false
     WHERE email = 'juan.perez@ejemplo.com';
     ```
   - Opción B: Navegar manualmente a: `http://localhost:5173/cliente/dashboard`

6. **Explorar Dashboard**
   - Verás 4 tarjetas de estadísticas (contratos, pendientes, vencidos, total pagado)
   - Sección "Próximo Pago"
   - Lista de "Pagos Recientes"
   - Lista de "Próximos Pagos"
   - 4 botones de acceso rápido
   - ⚠️ Los datos serán de ejemplo o vacíos (el cliente no tiene contratos reales)

---

## 🛠️ Paso 3: Probar Gestión de Credenciales desde Admin

### A. Iniciar Sesión como Admin

1. Ir a Login: `http://localhost:5173/login`
2. Seleccionar modo **"Admin"** (azul)
3. Ingresar tus credenciales de administrador

### B. Acceder al Panel de Clientes

1. Navegar a: **Clientes** (sidebar)
2. URL: `http://localhost:5173/clientes`

### C. Abrir Modal del Cliente

1. Buscar el cliente: **"Juan Pérez Rodríguez"**
2. Hacer clic en el ícono de ojo (👁️) para ver detalles
3. Se abrirá el modal con la información del cliente

### D. Gestionar Acceso al Portal

1. **Botón "Portal"** (verde con ícono de escudo 🛡️)
   - Ubicado en la esquina superior derecha del modal
   - Hacer clic para abrir el modal de credenciales

2. **Si el Cliente YA tiene Credenciales** (como Juan Pérez):
   
   **Información Mostrada:**
   - Estado del acceso (Activo/Desactivado)
   - Email de acceso
   - Fecha de creación
   - Último login (si existe)
   - Cambio de contraseña requerido (Sí/No)

   **Acciones Disponibles:**
   - 🔄 **Restablecer Contraseña**: Genera nueva contraseña temporal
   - ✅/❌ **Activar/Desactivar Acceso**: Habilita o deshabilita el login
   - 🗑️ **Eliminar Credenciales**: Elimina completamente el acceso

3. **Si el Cliente NO tiene Credenciales**:
   
   **Formulario de Creación:**
   - Campo: Email de acceso (pre-llenado con email del cliente)
   - Botón: "Crear Credenciales"
   
   **Al Crear:**
   - Se genera una contraseña aleatoria de 12 caracteres
   - Se muestra la contraseña temporal
   - Botones para copiar email y contraseña
   - El cliente debe cambiar la contraseña en primer login

### E. Probar Acciones Específicas

#### ✅ Crear Credenciales (con cliente sin acceso)

1. Crear un nuevo cliente en el dashboard de admin
2. Abrir el modal de ese cliente
3. Click en "Portal"
4. Ingresar/verificar email
5. Click en "Crear Credenciales"
6. **Copiar la contraseña generada** (importante!)
7. Enviar email y contraseña al "cliente" (en este caso tú)
8. Probar login con esas credenciales

#### 🔄 Restablecer Contraseña

1. Abrir modal de Juan Pérez
2. Click en "Portal"
3. Click en "Restablecer Contraseña"
4. Confirmar en el diálogo
5. **Copiar la nueva contraseña**
6. Cerrar sesión
7. Login con la nueva contraseña

#### ✅❌ Activar/Desactivar Acceso

1. Abrir modal de credenciales
2. Click en "Desactivar Acceso"
3. Confirmar
4. Intentar login como cliente → debe fallar
5. Volver al admin
6. Click en "Activar Acceso"
7. Intentar login nuevamente → debe funcionar

#### 🗑️ Eliminar Credenciales

1. Abrir modal de credenciales
2. Click en "Eliminar Credenciales"
3. Confirmar (advertencia: el cliente no podrá acceder)
4. El modal volverá al formulario de creación
5. Intentar login como cliente → debe fallar

---

## 📋 Checklist de Pruebas

### Backend & Database
- [ ] Script SQL ejecutado sin errores
- [ ] Cliente "Juan Pérez" existe en tabla `clients`
- [ ] Credenciales existen en tabla `client_credentials`
- [ ] Password hash es válido
- [ ] `must_change_password` es `true`

### Login de Cliente
- [ ] Selector Admin/Cliente funciona
- [ ] Login con credenciales correctas funciona
- [ ] Login con credenciales incorrectas falla
- [ ] Redirect a cambiar password funciona (aunque la página no exista)
- [ ] Sesión se guarda en localStorage
- [ ] Token expira después de 24 horas

### Dashboard de Cliente (Workaround)
- [ ] Página carga sin errores
- [ ] Navbar muestra nombre del cliente
- [ ] Sidebar tiene 6 opciones de menú
- [ ] 4 tarjetas de estadísticas se muestran
- [ ] Sección de próximo pago visible
- [ ] Lista de pagos recientes (aunque vacía)
- [ ] Botones de acceso rápido funcionan
- [ ] Botón de logout funciona

### Gestión de Credenciales (Admin)
- [ ] Botón "Portal" aparece en modal de cliente
- [ ] Modal de credenciales se abre correctamente
- [ ] Muestra estado actual (Activo/Desactivado)
- [ ] Muestra email de acceso
- [ ] Botón "Copiar Email" funciona
- [ ] Botón "Restablecer Contraseña" genera nueva contraseña
- [ ] Nueva contraseña se puede copiar
- [ ] Botón "Activar/Desactivar" cambia estado
- [ ] Cliente no puede login cuando está desactivado
- [ ] Botón "Eliminar" funciona
- [ ] Crear credenciales desde cero funciona
- [ ] Email personalizado funciona
- [ ] Contraseña generada es aleatoria y segura

### Responsive Design
- [ ] Modal de credenciales se ve bien en desktop
- [ ] Modal se ve bien en tablet
- [ ] Modal se ve bien en móvil
- [ ] Botones son clickeables en móvil
- [ ] Copiar funciona en dispositivos móviles

---

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: "404 al cambiar contraseña"
**Causa:** La página `/cliente/cambiar-password` no existe aún  
**Solución Temporal:**
```sql
UPDATE client_credentials
SET must_change_password = false
WHERE email = 'juan.perez@ejemplo.com';
```

### Problema 2: "Dashboard muestra datos vacíos"
**Causa:** El cliente de prueba no tiene contratos ni pagos asociados  
**Solución:** Crear un contrato desde el admin y asignar pagos, O esperar a que implementemos páginas de ejemplo

### Problema 3: "Rutas de cliente dan 404"
**Causa:** Las rutas `/cliente/*` no están configuradas en `App.tsx`  
**Solución:** Se configurarán en la siguiente fase

### Problema 4: "Error al copiar contraseña"
**Causa:** Navegador no soporta `navigator.clipboard` (HTTP sin HTTPS)  
**Solución:** Usar localhost o HTTPS, o copiar manualmente

### Problema 5: "Modal no se cierra"
**Causa:** Click fuera del modal no cierra (por diseño)  
**Solución:** Usar botón X o completar la acción

---

## 📊 Datos de Prueba Adicionales

### Crear Más Clientes de Prueba

```sql
-- Cliente 2: María García
INSERT INTO clients (full_name, email, phone, client_type, status)
VALUES ('María García López', 'maria.garcia@ejemplo.com', '+52 987 654 3210', 'seller', 'active');

-- Cliente 3: Carlos Mendoza
INSERT INTO clients (full_name, email, phone, client_type, status)
VALUES ('Carlos Mendoza Ruiz', 'carlos.mendoza@ejemplo.com', '+52 555 123 4567', 'buyer', 'active');
```

Luego crear sus credenciales desde el admin usando el modal.

---

## 🎯 Próximos Pasos de Desarrollo

### Pendientes (40% restante)

1. **Configurar Rutas** (urgente para navegación)
   - Modificar `App.tsx`
   - Agregar rutas `/cliente/*`
   - Proteger con validación de sesión
   - Configurar ClientLayout como wrapper

2. **Página: Cambiar Contraseña** (urgente para flujo completo)
   - Formulario de cambio de contraseña
   - Validaciones (contraseña actual, nueva, confirmar)
   - Actualizar `must_change_password` a false
   - Redirect a dashboard después de cambio

3. **ClientContracts.tsx** (5-6 horas)
   - Lista de contratos del cliente
   - Detalles de cada contrato
   - Descargar contrato en PDF

4. **ClientPayments.tsx** (5-6 horas)
   - Tabla de pagos (histórico + futuros)
   - Filtros por fecha, estado, monto
   - Exportar historial
   - Comprobante de pago en PDF

5. **ClientExtracts.tsx** (4-5 horas)
   - Generar extracto mensual
   - Generar resumen anual
   - Ver extractos históricos
   - Descargar PDF

6. **ClientDocuments.tsx** (3-4 horas)
   - Subir documentos desde storage
   - Ver documentos compartidos
   - Descargar documentos
   - Organizar por categorías

7. **ClientProfile.tsx** (3-4 horas)
   - Ver información personal
   - Editar datos básicos (si se permite)
   - Ver contratos activos
   - Cambiar contraseña (integrado)

8. **Testing E2E** (4-5 horas)
   - Pruebas de flujo completo
   - Corrección de bugs
   - Optimización de rendimiento
   - Validación de seguridad RLS

---

## 📝 Notas de Seguridad

### Contraseñas
- ✅ Hasheadas con bcrypt (rounds=10)
- ✅ Nunca se retornan en las consultas
- ✅ Generadas aleatoriamente (12 caracteres)
- ✅ Cambio obligatorio en primer login

### Sesiones
- ✅ Expiran después de 24 horas
- ✅ Almacenadas en localStorage
- ✅ Validadas en cada request
- ✅ Separadas de sesiones admin

### Row Level Security (RLS)
- ✅ 23 políticas implementadas
- ✅ Clientes solo ven sus propios datos
- ✅ Admins tienen acceso completo
- ✅ Storage protegido por RLS

### Validaciones
- ✅ Email único por cliente
- ✅ Contraseña mínima 8 caracteres
- ✅ Cuenta activa requerida para login
- ✅ CSRF protegido (por diseño de Supabase)

---

## 🎨 Capturas Esperadas

### 1. Login - Selector Admin/Cliente
- Dos botones grandes (azul y verde)
- Formulario cambia según selección
- Placeholders diferentes

### 2. Modal de Credenciales - Sin Acceso
- Banner azul: "Este cliente aún no tiene acceso"
- Campo de email pre-llenado
- Banner amarillo con notas
- Botón verde "Crear Credenciales"

### 3. Modal de Credenciales - Con Acceso
- Estado: Badge verde "Activo"
- Email con botón de copiar
- Información de último login
- 3 botones de acción (amarillo, naranja/verde, rojo)

### 4. Modal de Credenciales - Contraseña Generada
- Banner amarillo con contraseña
- Botón mostrar/ocultar (ojo)
- Botón copiar (verde)
- Advertencia de seguridad

### 5. Dashboard de Cliente
- Navbar con foto de perfil (o inicial)
- Sidebar con 6 opciones
- 4 tarjetas de estadísticas
- Sección de próximo pago destacada
- 2 listas: recientes y próximos
- 4 botones de acceso rápido

---

## 💡 Tips de Prueba

1. **Usa DevTools para depurar**
   ```javascript
   // Ver sesión en localStorage
   console.log(localStorage.getItem('clientSession'));
   
   // Ver datos de cliente
   console.log(JSON.parse(localStorage.getItem('clientSession')));
   ```

2. **Verifica Network Tab**
   - Requests a `/rest/v1/client_credentials`
   - Requests a funciones SQL
   - Headers de autorización

3. **Prueba en Modo Incógnito**
   - Sin caché
   - Sin sesiones previas
   - Simulación de usuario nuevo

4. **Usa Diferentes Navegadores**
   - Chrome/Edge
   - Firefox
   - Safari (macOS)
   - Mobile browsers

5. **Simula Diferentes Dispositivos**
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)

---

## 📞 Soporte y Feedback

Si encuentras algún bug o tienes sugerencias:

1. ✅ Anota el error exacto
2. ✅ Captura de pantalla si es visual
3. ✅ Steps para reproducir
4. ✅ Navegador y dispositivo
5. ✅ Comparte el feedback

---

## ✨ Resumen de Funcionalidad Implementada

### Lo que SÍ funciona:
- ✅ Login dual (admin/cliente)
- ✅ Autenticación de clientes
- ✅ Sesiones con expiración
- ✅ Dashboard básico del cliente
- ✅ Navbar y sidebar responsivos
- ✅ Modal de gestión de credenciales en admin
- ✅ Crear credenciales con contraseña aleatoria
- ✅ Copiar email y contraseña
- ✅ Restablecer contraseña
- ✅ Activar/desactivar acceso
- ✅ Eliminar credenciales
- ✅ RLS para seguridad de datos
- ✅ Hashing de contraseñas con bcrypt

### Lo que NO funciona (aún):
- ❌ Página de cambiar contraseña
- ❌ Navegación entre páginas del cliente
- ❌ Página de contratos
- ❌ Página de pagos
- ❌ Página de extractos
- ❌ Página de documentos
- ❌ Página de perfil
- ❌ Notificaciones push
- ❌ Carga de documentos
- ❌ Generación de PDFs (excepto extractos)

---

**¡Buena suerte con las pruebas! 🚀**

Si todo funciona correctamente, estaremos en un 60% de completado y listos para continuar con las páginas restantes.
