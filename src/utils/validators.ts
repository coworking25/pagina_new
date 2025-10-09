/**
 * Utilidades de Validación
 * 
 * Funciones reutilizables para validar datos en formularios
 */

/**
 * Valida un email
 * @example isValidEmail("test@example.com") → true
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Valida un teléfono colombiano
 * Acepta formatos: 3001234567, 300 123 4567, +57 300 123 4567, etc.
 * @example isValidPhone("3001234567") → true
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(\+?57\s?)?[3][0-9]{9}$/;
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  return phoneRegex.test(cleanPhone);
};

/**
 * Valida un nombre (solo letras, espacios y tildes)
 * @example isValidName("Juan Pérez") → true
 */
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
  return nameRegex.test(name.trim());
};

/**
 * Valida una URL
 * @example isValidUrl("https://example.com") → true
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida que un string no esté vacío
 * @example isNotEmpty("  ") → false
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida longitud mínima
 * @example hasMinLength("password", 8) → true
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Valida longitud máxima
 * @example hasMaxLength("texto", 10) → true
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Valida que un número esté en un rango
 * @example isInRange(5, 1, 10) → true
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Valida que un valor sea numérico
 * @example isNumeric("123") → true
 */
export const isNumeric = (value: string): boolean => {
  return !isNaN(Number(value)) && isFinite(Number(value));
};

/**
 * Valida una contraseña fuerte
 * Debe tener al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
 * @example isStrongPassword("Password123") → true
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return minLength && hasUpperCase && hasLowerCase && hasNumber;
};

/**
 * Valida una fecha en formato YYYY-MM-DD
 * @example isValidDate("2025-10-09") → true
 */
export const isValidDate = (dateString: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Valida que una fecha sea futura
 * @example isFutureDate("2026-01-01") → true
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * Valida que una fecha sea pasada
 * @example isPastDate("2024-01-01") → true
 */
export const isPastDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
};

/**
 * Sanitiza un string removiendo caracteres especiales
 * @example sanitizeString("<script>alert('xss')</script>") → "scriptalert('xss')/script"
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/[<>]/g, '');
};

/**
 * Valida formato de código postal colombiano (5-6 dígitos)
 * @example isValidPostalCode("110111") → true
 */
export const isValidPostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^\d{5,6}$/;
  return postalCodeRegex.test(postalCode);
};

/**
 * Valida NIT colombiano (formato básico)
 * @example isValidNIT("900123456-7") → true
 */
export const isValidNIT = (nit: string): boolean => {
  const nitRegex = /^\d{9}-\d$/;
  return nitRegex.test(nit);
};

/**
 * Valida cédula colombiana (7-10 dígitos)
 * @example isValidCedula("1234567890") → true
 */
export const isValidCedula = (cedula: string): boolean => {
  const cedulaRegex = /^\d{7,10}$/;
  return cedulaRegex.test(cedula.replace(/[\s.-]/g, ''));
};

/**
 * Objeto con todos los validadores para fácil importación
 */
export const validators = {
  email: isValidEmail,
  phone: isValidPhone,
  name: isValidName,
  url: isValidUrl,
  notEmpty: isNotEmpty,
  minLength: hasMinLength,
  maxLength: hasMaxLength,
  inRange: isInRange,
  numeric: isNumeric,
  strongPassword: isStrongPassword,
  date: isValidDate,
  futureDate: isFutureDate,
  pastDate: isPastDate,
  postalCode: isValidPostalCode,
  nit: isValidNIT,
  cedula: isValidCedula,
};
