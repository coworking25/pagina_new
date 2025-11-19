import { useState, useEffect, useCallback, useRef } from 'react';

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
  const stateRef = useRef<T>(initialValue);
  const [trigger, setTrigger] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const state = stateRef.current;

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    const nextState = typeof newState === 'function' ? (newState as (prev: T) => T)(stateRef.current) : newState;
    stateRef.current = nextState;
    setTrigger(prev => prev + 1);
  }, []);

  // Cargar desde localStorage al montar el componente
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(key);
      if (!storedData) {
        console.log(`ℹ️ usePersistedState: No hay datos almacenados para ${key}`);
        return;
      }

      const parsed: StoredData<T> = JSON.parse(storedData);
      
      // Verificar si los datos no han expirado
      const isExpired = Date.now() - parsed.timestamp > expirationTime;
      if (isExpired) {
        localStorage.removeItem(key);
        console.log(`⏰ usePersistedState: Datos expirados para ${key}, eliminados`);
        return;
      }

      console.log(`✅ usePersistedState: Estado restaurado desde localStorage: ${key}`, parsed.value);
      setState(parsed.value);
    } catch (error) {
      console.error('❌ usePersistedState: Error al restaurar estado desde localStorage:', error);
    }
  }, [key, expirationTime, setState]);

  // Guardar en localStorage cada vez que cambia el estado
  useEffect(() => {
    try {
      const dataToStore: StoredData<T> = {
        value: state,
        timestamp: Date.now(),
      };
      const jsonString = JSON.stringify(dataToStore);
      console.log(`💾 usePersistedState: Guardando estado en localStorage: ${key}, tamaño: ${jsonString.length} caracteres`, state);
      localStorage.setItem(key, jsonString);
      setLastSaved(new Date());
    } catch (error) {
      console.error('❌ usePersistedState: Error al guardar en localStorage:', error);
    }
  }, [state, key]);

  // Función para limpiar el estado persistido
  const clearPersistedState = useCallback(() => {
    localStorage.removeItem(key);
    setState(initialValue);
    setLastSaved(null);
    console.log(`🗑️ Estado limpiado: ${key}`);
  }, [key, initialValue, setState]);

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
