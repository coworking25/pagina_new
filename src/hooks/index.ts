/**
 * Custom Hooks - Índice central de exports
 * 
 * Hooks personalizados para optimización de performance y utilidades
 */

export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useOnlineStatus } from './useOnlineStatus';
export { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop, 
  useIsTouchDevice,
  breakpoints 
} from './useMediaQuery';
export { 
  useIntersectionObserver, 
  useLazyLoad, 
  useScrollAnimation 
} from './useIntersectionObserver';
export { useClickOutside } from './useClickOutside';
export { 
  useKeyPress, 
  useKeyCombo, 
  useEscapeKey, 
  useEnterKey, 
  useArrowKeys 
} from './useKeyPress';
export { usePrevious } from './usePrevious';
