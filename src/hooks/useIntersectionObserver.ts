import { useEffect, useRef, useState } from 'react';

/**
 * Opciones para el IntersectionObserver
 */
interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

/**
 * Hook para detectar cuando un elemento es visible en el viewport
 * Útil para lazy loading de imágenes, animaciones al scroll, infinite scroll, etc.
 * 
 * @param options - Opciones del IntersectionObserver
 * @returns ref y estado de visibilidad
 * 
 * @example
 * const { ref, isIntersecting } = useIntersectionObserver();
 * 
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <Image src="..." />}
 *   </div>
 * );
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLDivElement>(
  options: UseIntersectionObserverOptions = {}
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const [isIntersecting, setIsIntersecting] = useState(false);
  const elementRef = useRef<T>(null);
  const frozen = useRef(false);

  useEffect(() => {
    const element = elementRef.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || !element) {
      return;
    }

    // Si ya fue visible y está congelado, no hacer nada
    if (frozen.current) {
      return;
    }

    const observerCallback: IntersectionObserverCallback = ([entry]) => {
      const isElementIntersecting = entry.isIntersecting;
      setEntry(entry);
      setIsIntersecting(isElementIntersecting);

      // Congelar una vez visible si la opción está activada
      if (isElementIntersecting && freezeOnceVisible) {
        frozen.current = true;
        observer.disconnect();
        console.log('🎯 Elemento visible (congelado):', element);
      } else if (isElementIntersecting) {
        console.log('👁️ Elemento visible:', element);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold,
      root,
      rootMargin,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible]);

  return {
    ref: elementRef,
    entry,
    isIntersecting,
    isVisible: isIntersecting,
  };
}

/**
 * Hook simplificado para lazy loading
 * Se activa cuando el elemento está a 100px de ser visible
 * 
 * @example
 * const { ref, isVisible } = useLazyLoad();
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */
export function useLazyLoad<T extends HTMLElement = HTMLDivElement>() {
  return useIntersectionObserver<T>({
    rootMargin: '100px',
    freezeOnceVisible: true,
  });
}

/**
 * Hook para animaciones al hacer scroll
 * Se activa cuando el 50% del elemento es visible
 * 
 * @example
 * const { ref, isVisible } = useScrollAnimation();
 * 
 * return (
 *   <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
 *     Contenido
 *   </div>
 * );
 */
export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>() {
  return useIntersectionObserver<T>({
    threshold: 0.5,
    freezeOnceVisible: true,
  });
}
