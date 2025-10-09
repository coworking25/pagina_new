/**
 * Utilidades de Formateo - Números, Monedas y Fechas
 * 
 * Funciones optimizadas con memoización para formateo consistente
 */

// Cache de formateadores para evitar recrearlos constantemente
const formatters = {
  currency: new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }),
  
  number: new Intl.NumberFormat('es-CO'),
  
  compactNumber: new Intl.NumberFormat('es-CO', {
    notation: 'compact',
    compactDisplay: 'short',
  }),
  
  date: new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  
  shortDate: new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }),
  
  time: new Intl.DateTimeFormat('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  }),
  
  dateTime: new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }),
};

/**
 * Formatea un número como moneda colombiana (COP)
 * @example formatCurrency(1500000) → "$1.500.000"
 */
export const formatCurrency = (amount: number): string => {
  return formatters.currency.format(amount);
};

/**
 * Formatea un número con separadores de miles
 * @example formatNumber(1500000) → "1.500.000"
 */
export const formatNumber = (value: number): string => {
  return formatters.number.format(value);
};

/**
 * Formatea un número en notación compacta
 * @example formatCompactNumber(1500000) → "1,5 M"
 */
export const formatCompactNumber = (value: number): string => {
  return formatters.compactNumber.format(value);
};

/**
 * Formatea una fecha en formato largo
 * @example formatDate(new Date()) → "9 de octubre de 2025"
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatters.date.format(dateObj);
};

/**
 * Formatea una fecha en formato corto
 * @example formatShortDate(new Date()) → "9 oct 2025"
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatters.shortDate.format(dateObj);
};

/**
 * Formatea solo la hora
 * @example formatTime(new Date()) → "14:30"
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatters.time.format(dateObj);
};

/**
 * Formatea fecha y hora juntos
 * @example formatDateTime(new Date()) → "9 oct 2025, 14:30"
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatters.dateTime.format(dateObj);
};

/**
 * Formatea una fecha relativa (hace X tiempo)
 * @example formatRelativeDate(yesterday) → "hace 1 día"
 */
export const formatRelativeDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  if (diffInSeconds < 60) {
    return 'hace unos segundos';
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInMonths < 12) {
    return `hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
  } else {
    return `hace ${diffInYears} año${diffInYears > 1 ? 's' : ''}`;
  }
};

/**
 * Formatea un área en metros cuadrados
 * @example formatArea(120) → "120 m²"
 */
export const formatArea = (area: number): string => {
  return `${formatNumber(area)} m²`;
};

/**
 * Formatea un porcentaje
 * @example formatPercentage(0.15) → "15%"
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Trunca un texto agregando puntos suspensivos
 * @example truncateText("Texto muy largo...", 10) → "Texto muy..."
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de cada palabra
 * @example capitalizeWords("hola mundo") → "Hola Mundo"
 */
export const capitalizeWords = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formatea un número de teléfono colombiano
 * @example formatPhoneNumber("3001234567") → "+57 300 123 4567"
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }
  
  return phone;
};
