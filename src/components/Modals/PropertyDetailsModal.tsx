import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Square, Star, Calendar, MessageCircle, Heart, Share2, Play, TrendingUp, Phone, Mail, Edit, Trash2, Building } from 'lucide-react';
import { Property, Advisor } from '../../types';
import { getAdvisorById } from '../../lib/supabase';
import Button from '../UI/Button';
import ImageGallery from '../UI/ImageGallery';
import MortgageCalculator from '../UI/MortgageCalculator';
import ContactFormModal from './ContactFormModal';
import ScheduleAppointmentModal from './ScheduleAppointmentModal';
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
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Estados para el asesor
  const [currentAdvisor, setCurrentAdvisor] = useState<Advisor | null>(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);

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
                className="relative w-full max-w-6xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[95vh] overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    {property.featured && (
                      <div className="flex items-center space-x-1 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
                        <Star className="w-4 h-4 fill-current" />
                        <span>Destacado</span>
                      </div>
                    )}
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {property.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    {property.virtual_tour_url && (
                      <button
                        onClick={() => window.open(property.virtual_tour_url, '_blank')}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        title="Tour Virtual 360°"
                      >
                        <Play className="w-5 h-5 text-blue-500" />
                      </button>
                    )}
                    <button
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                    </button>
                    <button
                      onClick={handleShare}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <Share2 className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                    >
                      <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(95vh-80px)]">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                    {/* Left Column - Images and Gallery */}
                    <div className="space-y-6">
                      <ImageGallery
                        images={publicImageUrls}
                        title={property.title}
                        currentIndex={currentImageIndex}
                        onImageChange={setCurrentImageIndex}
                      />

                      {/* Advisor Card */}
                      {loadingAdvisor ? (
                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Cargando Asesor...
                          </h4>
                          <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                            <div className="flex-1">
                              <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded mb-2 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ) : currentAdvisor ? (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tu Asesor Inmobiliario
                          </h4>
                          <div className="flex items-center space-x-4">
                            <img
                              src={currentAdvisor.photo}
                              alt={currentAdvisor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {currentAdvisor.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {currentAdvisor.specialty}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{currentAdvisor.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{currentAdvisor.email}</span>
                                </div>
                              </div>
                              {currentAdvisor.experience_years && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  {currentAdvisor.experience_years} años de experiencia
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : property.advisor_id ? (
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Asesor No Disponible
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No se pudo cargar la información del asesor asignado.
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Sin Asesor Asignado
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Esta propiedad no tiene un asesor específico asignado.
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {currentAdvisor && !showAdminActions && (
                        <div className="mt-4 space-y-3">
                          <Button
                            variant="primary"
                            onClick={() => setIsContactModalOpen(true)}
                            className="w-full bg-green-600 hover:bg-green-700"
                            icon={MessageCircle}
                          >
                            Contactar Asesor
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsScheduleModalOpen(true)}
                            className="w-full"
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

                    {/* Right Column - Property Info */}
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{property.location}</span>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                          <Building className="w-4 h-4 mr-2" />
                          <span className="capitalize">
                            {property.type === 'apartment' ? 'Apartamento' :
                             property.type === 'house' ? 'Casa' :
                             property.type === 'office' ? 'Oficina' :
                             property.type === 'commercial' ? 'Local Comercial' :
                             property.type || 'Propiedad'}
                          </span>
                        </div>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatPrice(property.price)}
                          </span>
                          {property.status === 'rent' && (
                            <span className="text-gray-500 dark:text-gray-400 ml-2">/mes</span>
                          )}
                        </div>

                        {/* Property Details */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="text-center">
                            <Bed className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Habitaciones</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{property.bedrooms}</p>
                          </div>
                          <div className="text-center">
                            <Bath className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Baños</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{property.bathrooms}</p>
                          </div>
                          <div className="text-center">
                            <Square className="w-6 h-6 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">Área</p>
                            <p className="font-semibold text-gray-900 dark:text-white">{property.area}m²</p>
                          </div>
                        </div>
                      </div>

                      {/* Tabs */}
                      <div>
                        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          {tabs.map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                activeTab === tab.id
                                  ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm'
                                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                              }`}
                            >
                              <tab.icon className="w-4 h-4" />
                              <span>{tab.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* Tab Content */}
                        <div className="mt-6">
                          {activeTab === 'overview' && (
                            <div className="space-y-6">
                              {/* Description */}
                              {property.description && (
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Descripción
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {property.description}
                                  </p>
                                </div>
                              )}

                              {/* Amenities */}
                              {property.amenities && property.amenities.length > 0 && (
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                                    Amenidades
                                  </h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    {property.amenities.map((amenity, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>{amenity}</span>
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
