import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Square, Star, Calendar, MessageCircle, Heart, Share2, Play, TrendingUp, Phone, Mail, Edit, Trash2, Building, Camera, Film } from 'lucide-react';
import { Property, Advisor } from '../../types';
import { getAdvisorById } from '../../lib/supabase';
import { trackPropertyView } from '../../lib/analytics';
import Button from '../UI/Button';
import ImageGallery from '../UI/ImageGallery';
import MortgageCalculator from '../UI/MortgageCalculator';
import ContactFormModal from './ContactFormModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
import VideoPlayer from '../VideoPlayer';
import { getPublicImageUrl } from '../../lib/supabase';

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  showAdminActions?: boolean;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  showAdminActions = false,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'mortgage'>('overview');
  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'videos'>('images');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Estados para el asesor
  const [currentAdvisor, setCurrentAdvisor] = useState<Advisor | null>(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);
  
  // Tracking: Registrar tiempo de inicio de visualización
  const viewStartTime = useRef<number>(Date.now());

  // Cargar asesor cuando se abre el modal o cambia la propiedad
  useEffect(() => {
    if (property && property.advisor_id && isOpen) {
      setLoadingAdvisor(true);
      console.log('👥 Cargando asesor con ID:', property.advisor_id);
      
      getAdvisorById(property.advisor_id)
        .then(advisor => {
          console.log('✅ Asesor cargado:', advisor);
          setCurrentAdvisor(advisor);
        })
        .catch(error => {
          console.error('❌ Error cargando asesor:', error);
          setCurrentAdvisor(null);
        })
        .finally(() => {
          setLoadingAdvisor(false);
        });
    } else {
      setCurrentAdvisor(null);
      setLoadingAdvisor(false);
    }
  }, [property, isOpen]);

  // Tracking: Registrar vista de propiedad
  useEffect(() => {
    if (property && isOpen) {
      viewStartTime.current = Date.now();
      
      // Cleanup: Enviar duración cuando se cierre el modal
      return () => {
        const duration = Math.floor((Date.now() - viewStartTime.current) / 1000);
        trackPropertyView(String(property.id), duration).catch(console.error);
      };
    }
  }, [property, isOpen]);

  if (!property) return null;

  // Normalizar imágenes: extraer URLs del campo 'images'
  let imageUrls: string[] = [];
  if (Array.isArray(property.images)) {
    if (property.images.length > 0 && typeof property.images[0] === 'object' && property.images[0] !== null) {
      imageUrls = property.images.map((img: any) => img.url);
    } else {
      imageUrls = property.images;
    }
  }

  // Convertir a URLs públicas
  const publicImageUrls = imageUrls
    .filter((url) => typeof url === 'string' && url.length > 0)
    .map((url) => {
      if (url.startsWith('http')) return url;
      return getPublicImageUrl(url);
    });

  // Si no hay imágenes, usar una por defecto
  if (publicImageUrls.length === 0) {
    publicImageUrls.push('https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg');
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Mira esta propiedad: ${property.title} en ${property.location}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Descripción', icon: MapPin },
    { id: 'mortgage', label: 'Calculadora', icon: TrendingUp },
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              />

              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden mx-2 sm:mx-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    {property.featured && (
                      <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold flex-shrink-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                        <span className="hidden sm:inline">Destacado</span>
                      </div>
                    )}
                    <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {property.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    {property.virtual_tour_url && (
                      <button
                        onClick={() => window.open(property.virtual_tour_url, '_blank')}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Tour Virtual 360°"
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="hidden sm:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Share2 className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-80px)] sm:max-h-[calc(95vh-100px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 p-3 sm:p-6">
                    {/* Left Column - Images and Videos Gallery */}
                    <div className="space-y-4 sm:space-y-6">
                      
                      {/* Tabs para Fotos y Videos */}
                      <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                        {/* Tabs Headers */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setActiveMediaTab('images')}
                            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center text-sm sm:text-base ${
                              activeMediaTab === 'images'
                                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Camera className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Fotos ({publicImageUrls.length})
                          </button>
                          <button
                            onClick={() => setActiveMediaTab('videos')}
                            className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center text-sm sm:text-base ${
                              activeMediaTab === 'videos'
                                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            <Film className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                            Videos ({property.videos?.length || 0})
                          </button>
                        </div>

                        {/* Tab Content - Imágenes */}
                        {activeMediaTab === 'images' && (
                          <div className="p-2">
                            <ImageGallery
                              images={publicImageUrls}
                              title={property.title}
                              currentIndex={currentImageIndex}
                              onImageChange={setCurrentImageIndex}
                            />
                          </div>
                        )}

                        {/* Tab Content - Videos */}
                        {activeMediaTab === 'videos' && (
                          <div className="p-4">
                            {property.videos && property.videos.length > 0 ? (
                              <div className="grid grid-cols-1 gap-4">
                                {property.videos.map((video, index) => (
                                  <div key={index} className="relative">
                                    <VideoPlayer
                                      src={video.url}
                                      thumbnail={video.thumbnail}
                                      title={video.title}
                                      className="h-64 sm:h-80 rounded-lg overflow-hidden"
                                    />
                                    {video.duration && (
                                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        Duración: {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-12">
                                <Film className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 dark:text-gray-400">
                                  No hay videos disponibles para esta propiedad
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Advisor Card - Optimizado para móvil */}
                      {loadingAdvisor ? (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Cargando Asesor...
                          </h4>
                          <div className="flex items-center space-x-3 sm:space-x-4">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                              <div className="h-4 sm:h-5 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                              <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ) : currentAdvisor ? (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-green-200 dark:border-green-800">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">
                            Tu Asesor Inmobiliario
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                            <img
                              src={currentAdvisor.photo}
                              alt={currentAdvisor.name}
                              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover flex-shrink-0 mx-auto sm:mx-0 border-2 border-white dark:border-gray-700 shadow-md"
                            />
                            <div className="flex-1 min-w-0 text-center sm:text-left">
                              <h5 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg truncate">
                                {currentAdvisor.name}
                              </h5>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
                                {currentAdvisor.specialty}
                              </p>
                              
                              {/* Contact Info - Optimizado para móvil */}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                <a 
                                  href={`tel:${currentAdvisor.phone}`}
                                  className="flex items-center justify-center sm:justify-start gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                                >
                                  <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate">{currentAdvisor.phone}</span>
                                </a>
                                <a 
                                  href={`mailto:${currentAdvisor.email}`}
                                  className="flex items-center justify-center sm:justify-start gap-1 hover:text-green-600 dark:hover:text-green-400 transition-colors truncate"
                                >
                                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                  <span className="truncate text-xs">{currentAdvisor.email}</span>
                                </a>
                              </div>
                              
                              {currentAdvisor.experience_years && (
                                <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 font-medium">
                                  {currentAdvisor.experience_years} años de experiencia
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : property.advisor_id ? (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-red-200 dark:border-red-800">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Asesor No Disponible
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            No se pudo cargar la información del asesor asignado.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-yellow-200 dark:border-yellow-800">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Sin Asesor Asignado
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            Esta propiedad no tiene un asesor específico asignado.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons - Optimizado para móvil */}
                      {currentAdvisor && !showAdminActions && (
                        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                          <Button
                            variant="primary"
                            onClick={() => setIsContactModalOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700 text-sm sm:text-base py-2.5 sm:py-3"
                            icon={MessageCircle}
                          >
                            Contactar Asesor
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="w-full text-sm sm:text-base py-2.5 sm:py-3"
                            icon={Calendar}
                          >
                            Agendar Cita
                          </Button>
                        </div>
                      )}

                      {/* Admin Action Buttons */}
                      {showAdminActions && (
                        <div className="mt-4 space-y-3">
                          {onEdit && (
                            <Button
                              variant="primary"
                              onClick={() => onEdit(property)}
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              icon={Edit}
                            >
                              Editar Propiedad
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="outline"
                              onClick={() => onDelete(property)}
                              className="w-full text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                              icon={Trash2}
                            >
                              Eliminar Propiedad
                            </Button>
                          )}
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                              Acciones administrativas
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Column - Property Info - Optimizado para móvil */}
                    <div className="space-y-4 sm:space-y-6">
                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2 text-sm sm:text-base">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{property.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                          <Building className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                          <span className="capitalize">
                            {property.type === 'apartment' ? 'Apartamento' :
                             property.type === 'apartaestudio' ? 'Apartaestudio' :
                             property.type === 'house' ? 'Casa' :
                             property.type === 'office' ? 'Oficina' :
                             property.type === 'commercial' ? 'Local Comercial' :
                             property.type || 'Propiedad'}
                          </span>
                        </div>
                        <div className="mb-4">
                          <span className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(property.price)}
                          </span>
                          {property.status === 'rent' && (
                            <span className="text-sm sm:text-base text-gray-500 dark:text-gray-400 ml-2">/mes</span>
                          )}
                        </div>

                        {/* Property Details - Optimizado para móvil */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-center">
                            <Bed className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Habitaciones</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{property.bedrooms}</p>
                          </div>
                          <div className="text-center">
                            <Bath className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Baños</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{property.bathrooms}</p>
                          </div>
                          <div className="text-center">
                            <Square className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Área</p>
                            <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{property.area}m²</p>
                          </div>
                        </div>
                      </div>

                      {/* Tabs - Optimizado para móvil */}
                      <div>
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden sm:inline">{tab.label}</span>
                              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>

                        {/* Tab Content - Optimizado para móvil */}
                        <div className="mt-4 sm:mt-6">
                          {activeTab === 'overview' && (
                            <div className="space-y-4 sm:space-y-6">
                              {/* Description */}
                              {property.description && (
                                <div>
                                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                    Descripción
                                  </h4>
                                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {property.description}
                                  </p>
                                </div>
                              )}

                              {/* Amenities */}
                              {property.amenities && property.amenities.length > 0 && (
                                <div>
                                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
                                    Amenidades
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {property.amenities.map((amenity, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                        <span className="truncate">{amenity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {activeTab === 'mortgage' && (
                            <MortgageCalculator propertyPrice={property.price} />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Contact Form Modal */}
      {currentAdvisor && (
        <ContactFormModal
          property={property}
          advisor={currentAdvisor}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}

      {/* Schedule Appointment Modal */}
      {currentAdvisor && (
        <ScheduleAppointmentModal
          property={property}
          advisor={currentAdvisor}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}
    </>
  );
};

export default PropertyDetailsModal;
