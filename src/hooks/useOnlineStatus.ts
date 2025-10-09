import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar estado de conexión online/offline
 * Útil para mostrar notificaciones o deshabilitar funcionalidades
 * 
 * @returns boolean - true si está online, false si está offline
 * 
 * @example
 * const isOnline = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <div>Sin conexión a internet</div>;
 * }
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Conexión restaurada');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.warn('⚠️ Sin conexión a internet');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
