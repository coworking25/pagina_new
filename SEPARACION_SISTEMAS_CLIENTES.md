# 📋 SISTEMA UNIFICADO DE CLIENTES CON DIFERENCIACIÓN DE ACCESO

## 🎯 Estructura Implementada

### **UN SOLO FORMULARIO - DIFERENCIACIÓN POR TIPO**

El sistema usa **ClientWizard** para todos los tipos de cliente, pero la diferencia está en el **tipo seleccionado**:

---

### **TIPO 1: Propietario (landlord)** 🏠 - PRINCIPAL
**Con acceso al portal/dashboard**

#### Características:
- ✅ **Tienen acceso al dashboard** completo
- ✅ Se crean credenciales en `client_portal_credentials`
- ✅ Pueden ver sus propiedades
- ✅ Pueden ver contratos y pagos
- ✅ Login al portal de propietarios
- 🔑 **Este es el tipo PRINCIPAL** - Para dueños de propiedades

#### Visual en el wizard:
- Color: **Verde** 🟢
- Icono: **Home** (casa) 🏠
- Badge: "Con portal �"
- Alerta especial: "Este cliente tendrá acceso al portal/dashboard"

---

### **TIPOS 2-5: Clientes CRM** 👥 - SECUNDARIOS
**SIN acceso al portal**

| Tipo | Descripción | Icono | Color | Acceso Portal |
|------|-------------|-------|-------|---------------|
| `tenant` | Inquilino - Busca rentar | 👤 User | Azul | ❌ NO |
| `buyer` | Comprador potencial | 🛒 ShoppingCart | Morado | ❌ NO |
| `seller` | Vendedor de propiedad | 📄 FileText | Naranja | ❌ NO |
| `interested` | Interesado - Evaluando | 👁️ Eye | Amarillo | ❌ NO |

#### Características:
- ❌ **NO tienen acceso al dashboard**
- ❌ NO tienen credenciales de portal
- ✅ Solo para gestión interna del equipo
- ✅ Seguimiento CRM

---

## � Cómo Funciona el Wizard

## 🔧 Cómo Funciona el Wizard

### **Paso 1: Selección de Tipo**

El wizard muestra **5 botones**:

1. **Propietario** (Verde con 🔑) - Al seleccionar:
   - Muestra alerta: "Este cliente tendrá acceso al portal/dashboard"
   - El sistema creará credenciales automáticamente
   - Tendrá acceso completo al dashboard

2. **Inquilino** (Azul) - Al seleccionar:
   - Sin alerta especial
   - NO se crean credenciales
   - Solo registro CRM

3. **Comprador** (Morado) - CRM interno
4. **Vendedor** (Naranja) - CRM interno  
5. **Interesado** (Amarillo) - CRM interno

### **Paso 2-6: Información Adicional**
- Igual para todos los tipos
- Documentos, información financiera, etc.

### **Al Finalizar:**

**Si es `landlord`:**
```
1. Se crea registro en tabla `clients` (client_type = 'landlord')
2. Se crean credenciales en `client_portal_credentials`
3. Se genera email/password
4. El propietario puede hacer login al portal
```

**Si es otro tipo:**
```
1. Se crea registro en tabla `clients` (client_type = 'tenant'|'buyer'|'seller'|'interested')
2. NO se crean credenciales
3. Solo queda registrado para CRM interno
```

---

## 📊 Dashboard AdminClients

### **Estadísticas Mostradas:**

1. **Total** - Todos los clientes
2. **Propietarios** 🏠 (verde) - Con acceso portal
3. **Inquilinos** 👤 (azul) - Sin acceso
4. **Compradores** 🛒 (morado) - Sin acceso
5. **Vendedores** 📄 (naranja) - Sin acceso
6. **Interesados** 👁️ (amarillo) - Sin acceso
7. **Activos** ✅
8. **Inactivos** ❌

### **Filtros:**
- Todos los tipos
- Propietarios
- Inquilinos
- Compradores
- Vendedores
- Interesados

---

## 🔧 Archivos Modificados

### 1. **src/types/clients.ts**
```typescript
// Propietarios con portal (PRINCIPAL)
export type LandlordClientType = 'landlord';

// Clientes CRM sin portal (SECUNDARIOS)
export type CRMClientType = 'tenant' | 'buyer' | 'seller' | 'interested';

// Tipo general
export type ClientType = LandlordClientType | CRMClientType;
```

### 2. **src/components/ClientWizard.tsx**
- ✅ Interface acepta: `landlord`, `tenant`, `buyer`, `seller`, `interested`
- ✅ Lógica para crear credenciales si `client_type === 'landlord'`

### 3. **src/components/wizard/Step1BasicInfo.tsx**
- ✅ **5 botones** de selección
- ✅ **Propietario destacado** en verde con 🔑
- ✅ Alerta especial cuando se selecciona landlord
- ✅ Los demás tipos sin alerta

### 4. **src/pages/AdminClients.tsx**
- ✅ Estadísticas con **6 cards**:
  - Propietarios
  - Inquilinos
  - Compradores
  - Vendedores
  - Interesados
  - Activos/Inactivos
- ✅ Filtro con todos los 5 tipos

### 5. **fix_client_types.sql**
- ✅ Migra `renter` → `tenant`
- ✅ Migra `owner` → `landlord`
- ✅ Valida integridad

---

## ✅ Resultado Final

### **Un solo wizard, dos flujos:**

**FLUJO PROPIETARIO (landlord):**
```
ClientWizard → Selecciona "Propietario" → 
Completa 6 pasos → 
Sistema crea:
  - Registro en clients (client_type = 'landlord')
  - Credenciales en client_portal_credentials
  - Email de bienvenida con acceso al portal
→ Propietario puede hacer login
```

**FLUJO CRM (tenant/buyer/seller/interested):**
```
ClientWizard → Selecciona tipo CRM →
Completa 6 pasos →
Sistema crea:
  - Registro en clients (client_type = 'tenant' etc)
  - NO credenciales
  - Solo registro interno
→ Cliente NO puede hacer login (es solo contacto)
```

---

## 🚨 Importante

### **Sistema Unificado pero Diferenciado:**
- ✅ **Un solo formulario** (ClientWizard)
- ✅ **5 tipos de cliente** disponibles
- ✅ **Propietario** = tipo principal (con portal)
- ✅ **Otros 4** = tipos CRM (sin portal)
- ✅ La diferencia está en el **tipo seleccionado**, no en el formulario

### **Ventajas:**
- ✅ Menos código duplicado
- ✅ Interfaz consistente
- ✅ Fácil de mantener
- ✅ Clara diferenciación visual (propietario en verde con 🔑)

---

## 📝 Próximos Pasos (Opcional - Futuro)

Si en el futuro los **inquilinos** también necesitan portal:
1. Solo agregar alerta similar para tipo "tenant"
2. Modificar lógica de creación de credenciales
3. Crear `tenant_portal_credentials`
4. Dashboard separado para inquilinos

Por ahora: **Solo propietarios (landlord) tienen portal** ✅
