import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import { getFeaturedProperties } from '../../lib/supabase';

const SLIDES_TO_SHOW = 3; // Solo 3 propiedades visibles

// Tamaños más grandes para las tarjetas
const CARD_HEIGHT_MOBILE = '280px';
const CARD_HEIGHT_TABLET = '400px';
const CARD_HEIGHT_DESKTOP = '520px';

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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Carousel automático circular
  useEffect(() => {
    if (properties.length > SLIDES_TO_SHOW) {
      timerRef.current = setInterval(() => {
        setStartIndex((prev) =>
          prev + 1 >= properties.length ? 0 : prev + 1
        );
      }, 2000);
      return () => timerRef.current && clearInterval(timerRef.current);
    }
  }, [properties.length]);

  // Flechitas para navegación manual
  const handlePrev = () => {
    setStartIndex((prev) =>
      prev - 1 < 0 ? properties.length - SLIDES_TO_SHOW : prev - 1
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
  const visibleProperties = getVisibleCircular(properties, startIndex, SLIDES_TO_SHOW);

  return (
    <div className="w-full mt-8 relative flex items-center justify-center">
      {/* Flecha izquierda */}
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow hover:bg-gray-200 transition"
        onClick={handlePrev}
        aria-label="Anterior"
      >
        &#8592;
      </button>

      {/* Slides con espacio y tamaño grande */}
      <motion.div
        className="flex w-full gap-x-10 px-10 overflow-hidden"
        initial={{ x: 0 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {visibleProperties.map((property, idx) => {
          const imageUrl = property.cover_image || (property.images && property.images[0]);
          return (
            <motion.div
              key={property.id + '-' + idx}
              className="flex-1 rounded-2xl shadow-2xl overflow-hidden cursor-pointer bg-white relative"
              style={{
                maxWidth: '33%', // Más ancho, sólo 3 por fila
                minWidth: 0,
                height: cardHeight,
              }}
              onClick={() => navigate(`/property/${property.id}`)}
              whileHover={{ scale: 1.04 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <img
                src={imageUrl}
                alt={property.title}
                className="w-full h-full object-cover"
                style={{ height: '100%' }}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-property.jpg';
                }}
              />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                <h3 className="text-lg md:text-2xl font-bold mb-2">{property.title}</h3>
                <p className="text-sm md:text-base opacity-90">{property.location}</p>
                <p className="text-lg md:text-2xl font-semibold mt-2">
                  ${property.price.toLocaleString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Flecha derecha */}
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-3 shadow hover:bg-gray-200 transition"
        onClick={handleNext}
        aria-label="Siguiente"
      >
        &#8594;
      </button>
    </div>
  );
};

export default FeaturedPropertiesSlider;