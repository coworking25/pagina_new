import { useEffect, useState } from 'react';

/**
 * Hook personalizado para debouncing de valores
 * Útil para búsquedas y filtros que no deben ejecutarse en cada tecla
 * 
 * @param value - Valor a hacer debounce
 * @param delay - Tiempo de espera en ms (default: 500ms)
 * @returns Valor con debounce aplicado
 * 
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // Esta búsqueda solo se ejecuta 300ms después de que el usuario deja de escribir
 *   fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Establecer timeout para actualizar el valor después del delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timeout si el valor cambia antes de que se cumpla el delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
