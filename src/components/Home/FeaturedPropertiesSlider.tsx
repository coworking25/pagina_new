import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Property } from '../../types';
import { getFeaturedProperties } from '../../lib/supabase';

// Tamaños más grandes para las tarjetas
const CARD_HEIGHT_MOBILE = '380px';
const CARD_HEIGHT_TABLET = '420px';
const CARD_HEIGHT_DESKTOP = '520px';

// Responsive slides configuration
function useSlidesToShow() {
  const [slidesToShow, setSlidesToShow] = useState(3);
  
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setSlidesToShow(1); // Móvil: 1 propiedad
      } else if (window.innerWidth < 1024) {
        setSlidesToShow(2); // Tablet: 2 propiedades
      } else {
        setSlidesToShow(3); // Desktop: 3 propiedades
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return slidesToShow;
}

function useCardHeight() {
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_DESKTOP);
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setCardHeight(CARD_HEIGHT_MOBILE);
      else if (window.innerWidth < 1024) setCardHeight(CARD_HEIGHT_TABLET);
      else setCardHeight(CARD_HEIGHT_DESKTOP);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return cardHeight;
}

const FeaturedPropertiesSlider: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);

  const cardHeight = useCardHeight();
  const slidesToShow = useSlidesToShow();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeaturedProperties();
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true);
      const data = await getFeaturedProperties();
      if (data && data.length > 0) {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error loading featured properties:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carousel automático circular - pausa en móvil para mejor UX
  useEffect(() => {
    if (properties.length > slidesToShow && slidesToShow > 1) {
      timerRef.current = setInterval(() => {
        setStartIndex((prev) =>
          prev + 1 >= properties.length ? 0 : prev + 1
        );
      }, 3000); // 3 segundos en desktop
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [properties.length, slidesToShow]);

  // Touch/Swipe support para móvil
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      handleNext();
    }
    if (touchStart - touchEnd < -75) {
      // Swipe right
      handlePrev();
    }
  };

  // Flechitas para navegación manual
  const handlePrev = () => {
    setStartIndex((prev) =>
      prev - 1 < 0 ? properties.length - slidesToShow : prev - 1
    );
  };
  
  const handleNext = () => {
    setStartIndex((prev) =>
      prev + 1 >= properties.length ? 0 : prev + 1
    );
  };

  if (loading) {
    return (
      <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
    );
  }
  if (properties.length === 0) {
    return null;
  }

  // Generar las propiedades visibles de forma circular
  function getVisibleCircular(arr: Property[], start: number, count: number) {
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(arr[(start + i) % arr.length]);
    }
    return result;
  }
  const visibleProperties = getVisibleCircular(properties, startIndex, slidesToShow);

  return (
    <div className="w-full mt-8 relative">
      {/* Contenedor con soporte táctil para móvil */}
      <div
        ref={containerRef}
        className="relative flex items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Flecha izquierda - oculta en móvil */}
        <button
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 hidden sm:flex items-center justify-center"
          onClick={handlePrev}
          aria-label="Anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-white" />
        </button>

        {/* Slides con diseño responsive */}
        <motion.div
          className={`flex w-full overflow-hidden ${
            slidesToShow === 1 
              ? 'px-4' // Móvil: menos padding
              : slidesToShow === 2 
              ? 'gap-x-4 px-6' // Tablet: gap medio
              : 'gap-x-10 px-10' // Desktop: gap grande
          }`}
          initial={{ x: 0 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {visibleProperties.map((property, idx) => {
            const imageUrl = property.cover_image || (property.images && property.images[0]);
            
            // Calcular el ancho según dispositivo
            const cardWidthClass = 
              slidesToShow === 1 
                ? 'w-full' // Móvil: 100%
                : slidesToShow === 2 
                ? 'w-[48%]' // Tablet: 48% (2 columnas)
                : 'w-[32%]'; // Desktop: 32% (3 columnas)
            
            return (
              <motion.div
                key={property.id + '-' + idx}
                className={`${cardWidthClass} flex-shrink-0 rounded-2xl shadow-2xl overflow-hidden cursor-pointer bg-white dark:bg-gray-800 relative`}
                style={{
                  height: cardHeight,
                }}
                onClick={() => navigate(`/property/${property.id}`)}
                whileHover={{ scale: slidesToShow === 1 ? 1.02 : 1.04 }} // Menos zoom en móvil
                whileTap={{ scale: 0.98 }} // Feedback táctil
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <img
                  src={imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-property.jpg';
                  }}
                />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 sm:p-6 text-white">
                  <h3 className="text-base sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2 line-clamp-2">
                    {property.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-base opacity-90 line-clamp-1">
                    {property.location}
                  </p>
                  <p className="text-lg sm:text-xl md:text-2xl font-semibold mt-1 sm:mt-2 text-green-400">
                    ${property.price.toLocaleString()}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Flecha derecha - oculta en móvil */}
        <button
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2 sm:p-3 shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 hidden sm:flex items-center justify-center"
          onClick={handleNext}
          aria-label="Siguiente"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800 dark:text-white" />
        </button>
      </div>

      {/* Indicadores de puntos - SOLO EN MÓVIL */}
      {slidesToShow === 1 && properties.length > 1 && (
        <div className="flex justify-center gap-2 mt-6 sm:hidden">
          {properties.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setStartIndex(idx);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === startIndex % properties.length
                  ? 'w-8 bg-green-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label={`Ir a propiedad ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Indicador de swipe en móvil */}
      {slidesToShow === 1 && properties.length > 1 && (
        <div className="text-center mt-4 sm:hidden">
          <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
            ← Desliza para ver más propiedades →
          </p>
        </div>
      )}
    </div>
  );
};

export default FeaturedPropertiesSlider;  