import React, { useEffect } from 'react';
import Hero from '../components/Home/Hero';
import CompanyPresentation from '../components/Home/CompanyPresentation';
import FeaturedProperties from '../components/Home/FeaturedProperties';
import Services from '../components/Home/Services';
import FloatingNewsBubbles from '../components/FloatingNewsBubbles';

const Home: React.FC = () => {
  useEffect(() => {
    console.log('🏠 Página Home cargada');
    
    // Verificar que los componentes estén disponibles
    const components = {
      Hero: Boolean(Hero),
      CompanyPresentation: Boolean(CompanyPresentation),
      FeaturedProperties: Boolean(FeaturedProperties),
      Services: Boolean(Services)
    };
    
    console.log('📦 Componentes de Home:', components);
    
    // Verificar si hay errores en el DOM
    const checkForErrors = () => {
      const errorElements = document.querySelectorAll('[data-error]');
      if (errorElements.length > 0) {
        console.warn('⚠️ Elementos con errores detectados en Home:', errorElements);
      }
    };
    
    // Verificar errores después de que se renderice
    setTimeout(checkForErrors, 1000);
    
    return () => {
      console.log('🏠 Página Home desmontada');
    };
  }, []);

  try {
    return (
      <div className="min-h-screen relative">
        {/* Burbujas flotantes de noticias - Desktop */}
        <div className="hidden lg:block fixed bottom-24 right-6 z-[999]">
          <FloatingNewsBubbles maxBubbles={8} />
        </div>

        {/* Noticias móvil/tablet - Botón flotante */}
        <div className="lg:hidden fixed top-24 right-4 z-[999]">
          <FloatingNewsBubbles maxBubbles={6} className="mobile-news" />
        </div>
        
        <Hero />
        <CompanyPresentation />
        <FeaturedProperties />
        <div id="services-section">
          <Services />
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ Error crítico en página Home:', error);
    
    // Render de fallback en caso de error crítico
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error al cargar la página
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Ha ocurrido un error inesperado. Por favor, recarga la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Recargar Página
          </button>
        </div>
      </div>
    );
  }
};

export default Home;