import { useEffect } from 'react';
import { useAdminBadges } from '../contexts/AdminBadgeContext';

/**
 * Hook para marcar una sección como visitada y limpiar badges
 * @param section - La sección que se está visitando
 */
export function useMarkAsVisited(section: 'appointments' | 'clients' | 'inquiries') {
  const { resetBadge, refreshBadges } = useAdminBadges();

  useEffect(() => {
    // Marcar como visitado después de 2 segundos (tiempo para que el usuario vea el contenido)
    const timeout = setTimeout(() => {
      console.log(`📍 Marcando sección '${section}' como visitada`);
      resetBadge(section);
    }, 2000);

    // Refrescar badges cuando se cambia de sección
    refreshBadges();

    return () => clearTimeout(timeout);
  }, [section, resetBadge, refreshBadges]);
}

/**
 * Hook para decrementar badge cuando se procesa un elemento
 * @param section - La sección donde se procesó el elemento
 */
export function useDecrementBadge() {
  const { decrementBadge } = useAdminBadges();

  const markAsProcessed = (section: 'appointments' | 'clients' | 'inquiries') => {
    console.log(`✅ Procesando elemento en '${section}'`);
    decrementBadge(section);
  };

  return { markAsProcessed };
}

/**
 * Hook para incrementar badge cuando se agrega un nuevo elemento
 * @param section - La sección donde se agregó el elemento
 */
export function useIncrementBadge() {
  const { incrementBadge } = useAdminBadges();

  const markAsNew = (section: 'appointments' | 'clients' | 'inquiries') => {
    console.log(`🆕 Nuevo elemento en '${section}'`);
    incrementBadge(section);
  };

  return { markAsNew };
}
