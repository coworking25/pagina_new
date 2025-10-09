import { useEffect, useRef } from 'react';

/**
 * Hook para detectar clicks fuera de un elemento
 * Útil para cerrar modales, dropdowns, tooltips, etc.
 * 
 * @param handler - Función a ejecutar cuando se hace click fuera
 * @param listenWhen - Condición para activar el listener (ej: modal abierto)
 * 
 * @example
 * const ref = useClickOutside<HTMLDivElement>(() => {
 *   setIsOpen(false);
 * }, isOpen);
 * 
 * return (
 *   <div ref={ref} className="modal">
 *     Contenido del modal
 *   </div>
 * );
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  listenWhen: boolean = true
) {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);

  // Mantener handler actualizado sin recrear el effect
  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!listenWhen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      const target = event.target as Node;

      // Verificar si el click fue fuera del elemento
      if (element && !element.contains(target)) {
        console.log('🖱️ Click fuera detectado');
        handlerRef.current(event);
      }
    };

    // Agregar listeners con un pequeño delay para evitar
    // que se cierre inmediatamente al abrir
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [listenWhen]);

  return ref;
}
