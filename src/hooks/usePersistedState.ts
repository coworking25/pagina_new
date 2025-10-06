import { useState, useEffect, useCallback } from 'react';

interface PersistedStateOptions<T> {
  key: string;
  initialValue: T;
  expirationTime?: number; // en milisegundos (por defecto 24 horas)
}

interface StoredData<T> {
  value: T;
  timestamp: number;
}

/**
 * Hook personalizado para persistir estado en localStorage
 * Auto-guarda y restaura el estado incluso cuando cambias de pestaña
 */
export function usePersistedState<T>({
  key,
  initialValue,
  expirationTime = 24 * 60 * 60 * 1000, // 24 horas por defecto
}: PersistedStateOptions<T>) {
  const [state, setState] = useState<T>(() => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return initialValue;

      const parsed: StoredData<T> = JSON.parse(storedData);
      
      // Verificar si los datos no han expirado
      const isExpired = Date.now() - parsed.timestamp > expirationTime;
      if (isExpired) {
        localStorage.removeItem(key);
        return initialValue;
      }

      console.log(`✅ Estado restaurado desde localStorage: ${key}`);
      return parsed.value;
    } catch (error) {
      console.error('Error al restaurar estado desde localStorage:', error);
      return initialValue;
    }
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Guardar en localStorage cada vez que cambia el estado
  useEffect(() => {
    try {
      const dataToStore: StoredData<T> = {
        value: state,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(dataToStore));
      setLastSaved(new Date());
      console.log(`💾 Estado guardado en localStorage: ${key}`);
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
    }
  }, [state, key]);

  // Función para limpiar el estado persistido
  const clearPersistedState = useCallback(() => {
    localStorage.removeItem(key);
    setState(initialValue);
    setLastSaved(null);
    console.log(`🗑️ Estado limpiado: ${key}`);
  }, [key, initialValue]);

  // Función para verificar si hay un borrador guardado
  const hasDraft = useCallback(() => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) return false;

      const parsed: StoredData<T> = JSON.parse(storedData);
      const isExpired = Date.now() - parsed.timestamp > expirationTime;
      
      return !isExpired;
    } catch {
      return false;
    }
  }, [key, expirationTime]);

  return {
    state,
    setState,
    clearPersistedState,
    hasDraft,
    lastSaved,
  };
}
