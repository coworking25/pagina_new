import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que hace scroll al inicio de la página cuando cambia la ruta
 * Excepto cuando es un hash link (como #services)
 */
const ScrollToTopOnRouteChange: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Si hay un hash (como #services), no hacer scroll automático
    // porque probablemente queremos ir a una sección específica
    if (!hash) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // Instantáneo para que sea inmediato al cambiar de página
      });
    }
  }, [pathname, hash]);

  return null;
};

export default ScrollToTopOnRouteChange;
