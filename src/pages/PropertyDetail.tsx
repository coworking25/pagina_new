import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Share2,
  Calendar,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize
} from 'lucide-react';
import { Property } from '../types';
import { getProperties } from '../lib/supabase';

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const properties = await getProperties();
      console.log('🔍 Buscando propiedad con ID:', id);
      console.log('📋 Propiedades disponibles:', properties.map(p => ({ id: p.id, title: p.title })));
      
      // Intentar buscar por ID como string y como número
      const foundProperty = properties.find(p => 
        p.id === id || 
        p.id.toString() === id ||
        (typeof p.id === 'number' && p.id === parseInt(id))
      );
      
      if (!foundProperty) {
        console.error('❌ Propiedad no encontrada con ID:', id);
        setError('Propiedad no encontrada');
        return;
      }
      
      console.log('✅ Propiedad encontrada:', foundProperty);
      setProperty(foundProperty);
    } catch (err) {
      setError('Error al cargar la propiedad');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: `Mira esta propiedad: ${property?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sale': return 'bg-green-500';
      case 'rent': return 'bg-blue-500';
      case 'sold': return 'bg-red-500';
      case 'rented': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sale': return 'En Venta';
      case 'rent': return 'En Arriendo';
      case 'sold': return 'Vendida';
      case 'rented': return 'Arrendada';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Propiedad no encontrada'}
          </h1>
          <button
            onClick={() => navigate('/properties')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Propiedades
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-2 rounded-full transition-colors ${
                  isFavorite 
                    ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400' 
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Galería de Imágenes */}
      <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden">
        {property.images && property.images.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={property.images[currentImageIndex]}
              alt={property.title}
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">Sin imágenes disponibles</span>
          </div>
        )}

        {/* Navegación de Imágenes */}
        {property.images && property.images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicadores de Imagen */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {property.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white scale-110' 
                    : 'bg-white bg-opacity-50 hover:bg-opacity-80'
                }`}
              />
            ))}
          </div>
        )}

        {/* Botón Ver Todas las Fotos */}
        {property.images && property.images.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsGalleryOpen(true);
            }}
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg hover:bg-opacity-70 transition-all flex items-center space-x-2"
          >
            <Maximize className="h-4 w-4" />
            <span>Ver todas ({property.images.length})</span>
          </button>
        )}

        {/* Badge de Estado */}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getStatusColor(property.status)}`}>
            {getStatusText(property.status)}
          </span>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {property.title}
              </h1>
              
              <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{property.location}</span>
              </div>

              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                {formatPrice(property.price)}
              </div>

              {/* Características */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <Bed className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{property.bedrooms} Habitaciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Bath className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{property.bathrooms} Baños</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Square className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-900 dark:text-white">{property.area} m²</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 dark:text-white capitalize">{property.type}</span>
                </div>
              </div>

              {/* Descripción */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Amenidades */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    Amenidades
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-400">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar de Contacto */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                ¿Interesado en esta propiedad?
              </h3>
              
              <div className="space-y-4">
                <button
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => alert('Funcionalidad de agendar visita próximamente')}
                >
                  <Calendar className="h-5 w-5" />
                  <span>Agendar Visita</span>
                </button>
                
                <button
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => window.open(`tel:+573148860404`, '_self')}
                >
                  <Phone className="h-5 w-5" />
                  <span>Llamar Ahora</span>
                </button>
                
                <button
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => window.open(`https://wa.me/573148860404?text=Hola, estoy interesado en la propiedad: ${property.title}`, '_blank')}
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Contáctanos para más información sobre esta propiedad
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Galería Completa */}
      <AnimatePresence>
        {isGalleryOpen && property.images && property.images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              <button
                onClick={() => setIsGalleryOpen(false)}
                className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-all z-10"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="relative w-full h-full flex items-center justify-center">
                <img
                  src={property.images[currentImageIndex]}
                  alt={property.title}
                  className="max-w-full max-h-full object-contain"
                />

                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                    >
                      <ChevronLeft className="h-8 w-8" />
                    </button>
                    
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all"
                    >
                      <ChevronRight className="h-8 w-8" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-full overflow-x-auto px-4">
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-white' 
                        : 'border-transparent opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyDetail;
