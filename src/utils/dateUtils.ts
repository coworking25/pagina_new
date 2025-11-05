/**
 * 🗓️ Utilidades de Manejo de Fechas
 * 
 * Soluciona problemas de zona horaria al trabajar con datetime-local inputs
 * y calendarios. Evita conversiones UTC innecesarias que causan desfases de días.
 */

/**
 * Convierte un string datetime-local a Date preservando la zona horaria local
 * @param dateTimeLocalString Formato: "2025-11-11T19:15" o "2025-11-11T19:15:00"
 * @returns Date object en zona horaria local
 * @throws Error si el string está vacío o es inválido
 * 
 * @example
 * parseLocalDateTime("2025-11-11T19:15")
 * // Returns: Mon Nov 11 2025 19:15:00 GMT-0500 (Colombia)
 */
export function parseLocalDateTime(dateTimeLocalString: string): Date {
  if (!dateTimeLocalString || typeof dateTimeLocalString !== 'string') {
    throw new Error('dateTimeLocalString must be a non-empty string');
  }

  // Eliminar milisegundos y zona horaria si existen
  const cleanString = dateTimeLocalString.split('.')[0].split('Z')[0].split('+')[0].split('-').slice(0, 3).join('-');
  
  // Parsear manualmente para evitar conversiones UTC
  // Formato esperado: "YYYY-MM-DDTHH:mm" o "YYYY-MM-DDTHH:mm:ss"
  const [datePart, timePart] = cleanString.split('T');
  
  if (!datePart || !timePart) {
    throw new Error(`Invalid datetime format: ${dateTimeLocalString}. Expected: YYYY-MM-DDTHH:mm`);
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const timeComponents = timePart.split(':').map(Number);
  const [hours, minutes, seconds = 0] = timeComponents;

  // Validar componentes
  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes)) {
    throw new Error(`Invalid datetime components in: ${dateTimeLocalString}`);
  }

  // Crear Date en zona horaria local (month es 0-indexed)
  return new Date(year, month - 1, day, hours, minutes, seconds, 0);
}

/**
 * Convierte un Date a formato ISO pero preservando la hora local
 * (Sin conversión a UTC)
 * @param date Date object
 * @returns String en formato ISO pero con hora local: "YYYY-MM-DDTHH:mm:ss"
 * 
 * @example
 * const date = new Date(2025, 10, 11, 19, 15, 0);
 * toLocalISOString(date)
 * // Returns: "2025-11-11T19:15:00"
 */
export function toLocalISOString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Formatea una fecha para datetime-local input
 * @param date Date object, ISO string, o string en formato local
 * @returns String en formato "YYYY-MM-DDTHH:mm"
 * 
 * @example
 * formatForDateTimeLocal(new Date(2025, 10, 11, 19, 15))
 * // Returns: "2025-11-11T19:15"
 */
export function formatForDateTimeLocal(date: Date | string): string {
  let d: Date;
  
  if (typeof date === 'string') {
    // Intentar parsear como local primero
    try {
      d = parseLocalDateTime(date);
    } catch {
      // Fallback a Date constructor (puede tener conversión UTC)
      d = new Date(date);
    }
  } else {
    d = date;
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Agrega horas a una fecha sin modificar el objeto original
 * @param date Fecha base
 * @param hours Horas a agregar (puede ser negativo)
 * @returns Nueva fecha con las horas agregadas
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Agrega días a una fecha sin modificar el objeto original
 * @param date Fecha base
 * @param days Días a agregar (puede ser negativo)
 * @returns Nueva fecha con los días agregados
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Verifica si dos fechas son del mismo día (ignorando hora)
 * @param date1 Primera fecha
 * @param date2 Segunda fecha
 * @returns true si son el mismo día
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Obtiene el inicio del día (00:00:00)
 * @param date Fecha base
 * @returns Nueva fecha al inicio del día
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Obtiene el fin del día (23:59:59)
 * @param date Fecha base
 * @returns Nueva fecha al fin del día
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Formatea una fecha para mostrar en español
 * @param date Fecha a formatear
 * @param includeTime Si incluir la hora
 * @returns String formateado
 */
export function formatDateSpanish(date: Date | string, includeTime: boolean = true): string {
  const d = typeof date === 'string' ? parseLocalDateTime(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };

  return d.toLocaleDateString('es-CO', options);
}
