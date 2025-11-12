# 🎨 GUÍA VISUAL: Configuración de Administración en Formulario de Propiedades

## 📸 Vista General del Formulario

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                          📝 NUEVA PROPIEDAD                                ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  📋 SECCIÓN 1: Información Básica                                          ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │ Título:          [Casa moderna en zona exclusiva_______________]  │    ║
║  │                                                                    │    ║
║  │ Tipo:            [ 🏠 Solo Arriendo ▼ ]                           │    ║
║  │                                                                    │    ║
║  │ Precio Arriendo: [1,500,000_______] COP                          │    ║
║  │                                                                    │    ║
║  │ Ubicación:       [Zona Norte, Bogotá___________________________]  │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    ║
║  ┃  💰 Configuración de Administración                              ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  Configure cómo se manejarán los pagos de administración         ┃    ║
║  ┃  para esta propiedad                                             ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  👤 ¿Quién paga la administración?                               ┃    ║
║  ┃  [ 🏠 Inquilino (arriba del arriendo) ▼ ]                        ┃    ║
║  ┃  Determina quién asume el costo de administración                ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  📋 Método de pago de administración                             ┃    ║
║  ┃  [ 🔀 Pago separado del arriendo ▼ ]                            ┃    ║
║  ┃  Cómo se cobra la administración al inquilino                    ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  🏢 Comisión inmobiliaria (%)                                    ┃    ║
║  ┃  [10_______] %                                                    ┃    ║
║  ┃  Porcentaje que cobra la inmobiliaria sobre el arriendo          ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  💵 Comisión fija (COP)                                          ┃    ║
║  ┃  [100,000_______] COP (opcional)                                 ┃    ║
║  ┃  Monto fijo adicional (se suma al porcentaje)                    ┃    ║
║  ┃                                                                   ┃    ║
║  ┃  ┌─────────────────────────────────────────────────────────┐    ┃    ║
║  ┃  │ 📊 Vista previa del desglose de pagos                   │    ┃    ║
║  ┃  ├─────────────────────────────────────────────────────────┤    ┃    ║
║  ┃  │ Arriendo base:              $1,500,000                  │    ┃    ║
║  ┃  │ Comisión inmobiliaria (10%):  $150,000                  │    ┃    ║
║  ┃  │ Comisión fija:                 $100,000                  │    ┃    ║
║  ┃  ├─────────────────────────────────────────────────────────┤    ┃    ║
║  ┃  │ Total a pagar:              $1,250,000                  │    ┃    ║
║  ┃  └─────────────────────────────────────────────────────────┘    ┃    ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    ║
║                                                                            ║
║  📋 SECCIÓN 2: Características                                             ║
║  ┌──────────────────────────────────────────────────────────────────┐    ║
║  │ Habitaciones: [3__] │ Baños: [2.5__] │ Área: [120__] m²         │    ║
║  └──────────────────────────────────────────────────────────────────┘    ║
║                                                                            ║
║  [Cancelar]                                    [✅ Crear Propiedad]       ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

## 🎯 Opciones del Selector "¿Quién paga?"

```
┌─────────────────────────────────────────────────┐
│ 👤 ¿Quién paga la administración?              │
├─────────────────────────────────────────────────┤
│ > 🏠 Inquilino (arriba del arriendo)           │  ← Seleccionado
│   👨‍💼 Propietario (se descuenta del pago)       │
│   🤝 Compartido (ambos pagan parte)            │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Vista cuando se selecciona "Compartido"

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  💰 Configuración de Administración                              ┃
┃                                                                   ┃
┃  👤 ¿Quién paga la administración?                               ┃
┃  [ 🤝 Compartido (ambos pagan parte) ▼ ]                        ┃
┃                                                                   ┃
┃  📋 Método de pago de administración                             ┃
┃  [ ✅ Incluida en el precio de arriendo ▼ ]                     ┃
┃                                                                   ┃
┃  📊 % que paga el propietario                                    ┃
┃  [50_______] %                                                    ┃
┃  El inquilino pagará el porcentaje restante                      ┃
┃                                                                   ┃
┃  🏢 Comisión inmobiliaria (%)                                    ┃
┃  [10_______] %                                                    ┃
┃                                                                   ┃
┃  💵 Comisión fija (COP)                                          ┃
┃  [50,000_______] COP                                             ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**Nota:** El campo "% que paga el propietario" solo aparece cuando se selecciona "Compartido".

---

## 🏷️ Colores y Estilos

### Paleta de Colores

| Elemento | Color | Descripción |
|----------|-------|-------------|
| Fondo de sección | `from-blue-50 to-indigo-50` | Degradado azul claro |
| Borde | `border-blue-200` | Azul medio |
| Título | `text-gray-900` | Negro suave |
| Descripción | `text-gray-600` | Gris medio |
| Input | `bg-white` | Blanco |
| Input (dark) | `bg-gray-800` | Gris oscuro |
| Preview fondo | `bg-white` | Blanco |
| Preview borde | `border-gray-200` | Gris claro |
| Texto comisión | `text-blue-600` | Azul vibrante |
| Total | `text-green-600` | Verde |

### Iconos Utilizados

```
💰 - Dinero/Precio
👤 - Usuario/Persona
📋 - Documento/Lista
📊 - Gráfica/Estadística
🏢 - Edificio/Empresa
💵 - Billete
🏠 - Casa/Inquilino
👨‍💼 - Propietario
🤝 - Acuerdo/Compartido
✅ - Incluido
🔀 - Separado
```

---

## 📱 Diseño Responsive

### Desktop (md: y superior)
- Grid de 2 columnas para los inputs
- Sección de vista previa ocupa ancho completo

### Mobile (< md:)
- Una columna para todos los inputs
- Vista previa se ajusta al ancho de pantalla
- Padding reducido

---

## 🎨 Estados Visuales

### **Estado Normal**
```
┌─────────────────────────────┐
│ 🏢 Comisión inmobiliaria (%)│
│ [10__________________]      │
│ Porcentaje que cobra...    │
└─────────────────────────────┘
```

### **Estado Focus**
```
┌─────────────────────────────┐
│ 🏢 Comisión inmobiliaria (%)│
│ [10__________________] ← 🔵 │  (ring-2 ring-blue-500)
│ Porcentaje que cobra...    │
└─────────────────────────────┘
```

### **Estado Dark Mode**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃ 🏢 Comisión inmobiliaria (%)┃  (bg-gray-800, text-white)
┃ [10__________________]     ┃  
┃ Porcentaje que cobra...    ┃  (text-gray-400)
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## 🔢 Cálculos de la Vista Previa

### Fórmula para calcular el total:

```javascript
const rent = Number(formData.rent_price);
const commissionPct = Number(formData.agency_commission_percentage || 0);
const commissionFixed = Number(formData.agency_commission_fixed || 0);

const commissionAmount = rent * commissionPct / 100;
const total = rent - commissionAmount - commissionFixed;
```

### Ejemplo de cálculo:

```
Arriendo:           $1,500,000
Comisión % (10%):     $150,000   (1,500,000 * 0.10)
Comisión fija:        $100,000   (valor fijo)
─────────────────────────────────
Total:             $1,250,000   (1,500,000 - 150,000 - 100,000)
```

---

## 📐 Dimensiones y Espaciado

```
┌─────────────────────────────────────────────────────────┐
│  [padding: 24px (p-6)]                                  │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  [Título - mb-4]                                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  [Descripción - mb-6]                                   │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  [Grid con gap-6]                               │    │
│  │  ┌──────────────┐  ┌──────────────┐            │    │
│  │  │  Campo 1     │  │  Campo 2     │            │    │
│  │  │  [py-3 px-4] │  │  [py-3 px-4] │            │    │
│  │  └──────────────┘  └──────────────┘            │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  [Vista previa - mt-6, p-4]                     │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚦 Condicionales de Renderizado

### 1. Mostrar sección completa
```typescript
{(formData.availability_type === 'rent' || formData.availability_type === 'both') && (
  <SectionConfiguracionAdministracion />
)}
```

### 2. Mostrar campo "% Propietario"
```typescript
{formData.admin_paid_by === 'split' && (
  <CampoProcentajePropietario />
)}
```

### 3. Mostrar vista previa
```typescript
{formData.rent_price && Number(formData.rent_price) > 0 && (
  <VistaPreviewDesglose />
)}
```

---

## 📋 Checklist de Implementación Visual

- [x] Fondo degradado con colores corporativos
- [x] Iconos descriptivos en cada campo
- [x] Tooltips/descripciones debajo de inputs
- [x] Vista previa dinámica con formateo de moneda
- [x] Condicionales para campos específicos (% split)
- [x] Responsive design (grid 2 columnas → 1 columna)
- [x] Dark mode compatible
- [x] Bordes redondeados (rounded-xl)
- [x] Espaciado consistente
- [x] Focus states con ring-2 ring-blue-500

---

**Última actualización:** ${new Date().toLocaleDateString('es-CO')}
