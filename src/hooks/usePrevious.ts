import { useRef, useEffect } from 'react';

/**
 * Hook para acceder al valor anterior de una variable
 * Útil para comparar valores actuales con anteriores
 * 
 * @param value - Valor actual
 * @returns Valor anterior
 * 
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * console.log(`De ${prevCount} a ${count}`);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
