# 🏦 Guía Completa del Sistema de Calculadora de Hipoteca

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Componente Principal](#componente-principal)
4. [Integración en Modal](#integración-en-modal)
5. [Fórmulas y Cálculos](#fórmulas-y-cálculos)
6. [Personalización](#personalización)

---

## 📝 Descripción General

La **Calculadora de Hipoteca** es un componente interactivo que permite a los usuarios simular el financiamiento de una propiedad. Calcula:

- 💰 **Pago mensual**
- 📊 **Pago total** (capital + intereses)
- 📈 **Total de intereses** a pagar

### Ubicación en la Aplicación

Se encuentra en el **Modal de Detalles de Propiedad**, accesible desde:
- Tarjetas de propiedades en el catálogo
- Propiedades destacadas en el home
- Búsqueda de propiedades

---

## 🏗️ Arquitectura del Sistema

### Estructura de Archivos

```
src/
├── components/
│   ├── UI/
│   │   └── MortgageCalculator.tsx    ← Componente de calculadora
│   └── Modals/
│       └── PropertyDetailsModal.tsx   ← Modal que contiene la calculadora
```

### Flujo de Datos

```
PropertyDetailsModal
    ↓
    Pasa el precio de la propiedad como prop
    ↓
MortgageCalculator (recibe propertyPrice)
    ↓
    Calcula valores basados en inputs del usuario
    ↓
    Muestra resultados en tiempo real
```

---

## 🎯 Componente Principal: MortgageCalculator

### Ubicación
`src/components/UI/MortgageCalculator.tsx`

### Props

```typescript
interface MortgageCalculatorProps {
  propertyPrice: number;  // Precio de la propiedad (se pasa automáticamente)
}
```

### Estados Internos

```typescript
const [downPayment, setDownPayment] = useState(propertyPrice * 0.3);  // Cuota inicial (30% por defecto)
const [interestRate, setInterestRate] = useState(12.5);               // Tasa de interés anual (12.5% por defecto)
const [loanTerm, setLoanTerm] = useState(15);                         // Plazo en años (15 años por defecto)
const [monthlyPayment, setMonthlyPayment] = useState(0);              // Pago mensual calculado
const [totalPayment, setTotalPayment] = useState(0);                  // Pago total calculado
const [totalInterest, setTotalInterest] = useState(0);                // Intereses totales calculados
```

### Controles Interactivos

#### 1. **Cuota Inicial**
```tsx
<div>
  <label>Cuota Inicial ({downPaymentPercentage.toFixed(1)}%)</label>
  
  {/* Input numérico */}
  <input
    type="number"
    value={downPayment}
    onChange={(e) => setDownPayment(Number(e.target.value))}
  />
  
  {/* Slider para ajuste visual */}
  <input
    type="range"
    min={propertyPrice * 0.1}   // Mínimo 10%
    max={propertyPrice * 0.5}   // Máximo 50%
    value={downPayment}
    onChange={(e) => setDownPayment(Number(e.target.value))}
  />
</div>
```

#### 2. **Tasa de Interés**
```tsx
<input
  type="number"
  step="0.1"                    // Incrementos de 0.1%
  value={interestRate}
  onChange={(e) => setInterestRate(Number(e.target.value))}
/>
```

#### 3. **Plazo del Préstamo**
```tsx
<select
  value={loanTerm}
  onChange={(e) => setLoanTerm(Number(e.target.value))}
>
  <option value={5}>5 años</option>
  <option value={10}>10 años</option>
  <option value={15}>15 años</option>
  <option value={20}>20 años</option>
  <option value={25}>25 años</option>
  <option value={30}>30 años</option>
</select>
```

---

## 📐 Fórmulas y Cálculos

### Función Principal: `calculateMortgage()`

```typescript
const calculateMortgage = () => {
  // 1. Calcular el monto del préstamo (capital)
  const principal = propertyPrice - downPayment;
  
  // 2. Convertir tasa anual a tasa mensual
  const monthlyRate = interestRate / 100 / 12;
  
  // 3. Calcular número total de pagos
  const numberOfPayments = loanTerm * 12;
  
  // 4. Validar que los valores sean válidos
  if (principal <= 0 || monthlyRate <= 0 || numberOfPayments <= 0) {
    setMonthlyPayment(0);
    setTotalPayment(0);
    setTotalInterest(0);
    return;
  }
  
  // 5. Fórmula de pago mensual (Amortización francesa)
  const monthlyPaymentCalc = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  // 6. Calcular totales
  const totalPaymentCalc = monthlyPaymentCalc * numberOfPayments;
  const totalInterestCalc = totalPaymentCalc - principal;
  
  // 7. Actualizar estados
  setMonthlyPayment(monthlyPaymentCalc);
  setTotalPayment(totalPaymentCalc);
  setTotalInterest(totalInterestCalc);
};
```

### Desglose de la Fórmula

La fórmula utilizada es la **Amortización Francesa** (cuotas fijas):

```
           P × r × (1 + r)^n
M = ─────────────────────────
           (1 + r)^n - 1

Donde:
M = Pago mensual
P = Principal (monto del préstamo)
r = Tasa de interés mensual (tasa anual / 12 / 100)
n = Número de pagos (años × 12)
```

### Ejemplo Práctico

```javascript
// Propiedad de $300,000,000 COP
propertyPrice = 300000000

// Cuota inicial 30%
downPayment = 90000000

// Tasa 12.5% anual
interestRate = 12.5

// Plazo 15 años
loanTerm = 15

// Cálculos:
principal = 300000000 - 90000000 = 210,000,000
monthlyRate = 12.5 / 100 / 12 = 0.0104167
numberOfPayments = 15 × 12 = 180

monthlyPayment = 210,000,000 × (0.0104167 × (1.0104167)^180) / ((1.0104167)^180 - 1)
              ≈ $2,602,158 COP/mes

totalPayment = 2,602,158 × 180 ≈ $468,388,440
totalInterest = 468,388,440 - 210,000,000 = $258,388,440
```

---

## 🔄 Recálculo Automático

El componente usa `useEffect` para recalcular automáticamente cuando cambia cualquier valor:

```typescript
useEffect(() => {
  calculateMortgage();
}, [downPayment, interestRate, loanTerm, propertyPrice]);
```

**Triggers de recálculo:**
- ✅ Usuario cambia cuota inicial
- ✅ Usuario ajusta tasa de interés
- ✅ Usuario selecciona otro plazo
- ✅ Cambia la propiedad (precio diferente)

---

## 💅 Formateo de Moneda

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,  // Sin decimales
  }).format(amount);
};
```

**Ejemplo de salida:**
```
$300.000.000  (Trescientos millones de pesos)
```

---

## 🎨 Integración en PropertyDetailsModal

### Pestañas del Modal

```typescript
const tabs = [
  { id: 'overview', label: 'Descripción', icon: MapPin },
  { id: 'mortgage', label: 'Calculadora', icon: TrendingUp },
];
```

### Estado de Pestaña Activa

```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'mortgage'>('overview');
```

### Renderizado Condicional

```typescript
{activeTab === 'mortgage' && (
  <MortgageCalculator propertyPrice={property.price} />
)}
```

### Navegación entre Pestañas

```tsx
<div className="flex space-x-4 border-b">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`
        px-4 py-2 font-medium
        ${activeTab === tab.id 
          ? 'border-b-2 border-green-600 text-green-600' 
          : 'text-gray-600'
        }
      `}
    >
      <tab.icon className="w-5 h-5 inline mr-2" />
      {tab.label}
    </button>
  ))}
</div>
```

---

## 🎨 Diseño Visual

### Esquema de Colores

```typescript
// Pago mensual (principal)
className="text-green-600 dark:text-green-400"

// Pago total
className="text-gray-900 dark:text-white"

// Total intereses (negativo)
className="text-red-600 dark:text-red-400"
```

### Iconos Utilizados

- 💰 `Calculator` - Header de la calculadora
- 💵 `DollarSign` - Cuota inicial
- 📊 `Percent` - Tasa de interés
- 📅 `Calendar` - Plazo del préstamo

---

## ⚙️ Personalización

### 1. Cambiar Valores por Defecto

```typescript
// En MortgageCalculator.tsx, líneas 9-11

const [downPayment, setDownPayment] = useState(propertyPrice * 0.3);  // Cambiar 0.3 a 0.2 para 20%
const [interestRate, setInterestRate] = useState(12.5);              // Cambiar a tasa deseada
const [loanTerm, setLoanTerm] = useState(15);                        // Cambiar plazo por defecto
```

### 2. Agregar Más Plazos

```typescript
// Agregar nuevas opciones al select
<option value={35}>35 años</option>
<option value={40}>40 años</option>
```

### 3. Cambiar Rangos de Cuota Inicial

```typescript
// Líneas 84-85
min={propertyPrice * 0.1}  // Cambiar mínimo
max={propertyPrice * 0.5}  // Cambiar máximo
```

### 4. Agregar Gastos Adicionales

```typescript
// Ejemplo: Agregar seguro y cuotas administrativas

const [insurance, setInsurance] = useState(0);
const [adminFee, setAdminFee] = useState(0);

// En calculateMortgage:
const monthlyPaymentWithExtras = monthlyPaymentCalc + insurance + adminFee;
```

### 5. Mostrar Gráficos (Opcional)

```typescript
// Instalar: npm install recharts

import { PieChart, Pie, Cell } from 'recharts';

const data = [
  { name: 'Principal', value: principal },
  { name: 'Intereses', value: totalInterest },
];

<PieChart width={200} height={200}>
  <Pie data={data} dataKey="value" />
</PieChart>
```

---

## 🔍 Debugging y Validación

### Logs de Debug

```typescript
// Agregar en calculateMortgage:
console.log('🔍 Debug Calculadora:', {
  propertyPrice,
  downPayment,
  principal,
  monthlyRate,
  numberOfPayments,
  monthlyPayment: monthlyPaymentCalc,
});
```

### Validaciones Adicionales

```typescript
// Validar que la cuota inicial no sea mayor al precio
if (downPayment > propertyPrice) {
  setDownPayment(propertyPrice * 0.5);
  alert('La cuota inicial no puede ser mayor al precio de la propiedad');
}

// Validar tasa de interés razonable
if (interestRate > 30 || interestRate < 1) {
  alert('La tasa de interés debe estar entre 1% y 30%');
}
```

---

## 📱 Responsividad

El componente es completamente **responsive** usando clases de Tailwind:

```typescript
// Desktop: texto grande, padding generoso
className="text-lg font-semibold p-6"

// Mobile: texto más pequeño, padding reducido
className="text-base sm:text-lg font-semibold p-3 sm:p-6"
```

---

## 🚀 Mejoras Futuras

### Ideas de Expansión

1. **Tabla de Amortización**
   - Mostrar desglose mes a mes
   - Capital vs intereses por período

2. **Comparador de Escenarios**
   - Guardar y comparar múltiples simulaciones
   - Mostrar diferencias lado a lado

3. **Exportar Resultados**
   - PDF con resumen
   - Email con cotización

4. **Integración con Bancos**
   - Tasas de interés en tiempo real
   - Links a solicitudes de crédito

5. **Calculadora de Capacidad de Pago**
   - Basada en ingresos del usuario
   - Recomendaciones personalizadas

---

## 📚 Recursos Adicionales

### Fórmulas Financieras
- [Amortización Francesa](https://es.wikipedia.org/wiki/Sistema_de_amortizaci%C3%B3n_franc%C3%A9s)
- [Calculadora de Hipoteca](https://www.calculadorahipoteca.org/)

### Documentación
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

---

## ✅ Checklist de Implementación

- [x] Componente MortgageCalculator creado
- [x] Integrado en PropertyDetailsModal
- [x] Fórmulas matemáticas correctas
- [x] Formateo de moneda colombiana
- [x] Diseño responsive
- [x] Recálculo automático en tiempo real
- [x] Slider interactivo para cuota inicial
- [x] Validaciones básicas
- [x] Dark mode compatible
- [x] Iconos y UX intuitiva

---

**Última actualización:** Octubre 7, 2025  
**Versión:** 1.0.0  
**Autor:** Sistema de Coworking Inmobiliario
