import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Square, Star, Calendar, MessageCircle, Heart, Share2, Play, TrendingUp, Phone, Mail } from 'lucide-react';
import { Property } from '../../types';
import { getAdvisorById, getRandomAdvisor } from '../../data/advisors';
import Button from '../UI/Button';
import ImageGallery from '../UI/ImageGallery';
import MortgageCalculator from '../UI/MortgageCalculator';
import PriceHistoryComponent from '../UI/PriceHistory';
import ContactFormModal from './ContactFormModal';
import { getPublicImageUrl } from '../../lib/supabase';

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onContact: (property: Property) => void;
  onSchedule: (property: Property) => void;
}

const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onContact,
  onSchedule,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'map' | 'mortgage' | 'history'>('overview');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  if (!property) return null;

  // Obtener asesor asignado o uno aleatorio
  const assignedAdvisor = property.advisor_id 
    ? getAdvisorById(property.advisor_id) 
    : getRandomAdvisor();

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

  const handleContactAdvisor = () => {
    setIsContactModalOpen(true);
  };

  const tabs = [
    { id: 'overview', label: 'Descripción', icon: MapPin },
    { id: 'map', label: 'Ubicación', icon: MapPin },
    { id: 'mortgage', label: 'Calculadora', icon: TrendingUp },
    { id: 'history', label: 'Historial', icon: TrendingUp },
  ];

  const MockNeighborhoodMap = () => (
    <div className="space-y-6">
      {/* Mapa */}
      <div className="bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden">
        <div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="w-12 h-12 mx-auto mb-2 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Vista del mapa interactivo</p>
            <button
              onClick={() => {
                const url = `https://www.google.com/maps/search/${encodeURIComponent(property.location)}`;
                window.open(url, '_blank');
              }}
              className="inline-flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <span>Ver en Google Maps</span>
            </button>
          </div>
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{property.location}</p>
          </div>
        </div>
      </div>

      {/* Información del Barrio */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          Información del Barrio
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Transporte</h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• TransMilenio cercano</li>
              <li>• Rutas de bus</li>
              <li>• Ciclorruta</li>
            </ul>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">Servicios</h5>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Centro comercial</li>
              <li>• Hospitales</li>
              <li>• Bancos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

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
                      {assignedAdvisor && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tu Asesor Inmobiliario
                          </h4>
                          <div className="flex items-center space-x-4">
                            <img
                              src={assignedAdvisor.photo}
                              alt={assignedAdvisor.name}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 dark:text-white">
                                {assignedAdvisor.name}
                              </h5>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {assignedAdvisor.specialty}
                              </p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{assignedAdvisor.phone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Mail className="w-4 h-4" />
                                  <span>{assignedAdvisor.email}</span>
                                </div>
                              </div>
                              {assignedAdvisor.experience_years && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                  {assignedAdvisor.experience_years} años de experiencia
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4">
                            <Button
                              variant="primary"
                              onClick={handleContactAdvisor}
                              className="w-full bg-green-600 hover:bg-green-700"
                              icon={MessageCircle}
                            >
                              Contactar por WhatsApp
                            </Button>
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

                          {activeTab === 'map' && <MockNeighborhoodMap />}

                          {activeTab === 'mortgage' && (
                            <MortgageCalculator propertyPrice={property.price} />
                          )}

                          {activeTab === 'history' && (
                            <PriceHistoryComponent
                              priceHistory={property.price_history}
                              currentPrice={property.price}
                              propertyType={property.status === 'sold' || property.status === 'rented' ? 'sale' : property.status}
                            />
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          variant="outline"
                          icon={MessageCircle}
                          onClick={() => onContact(property)}
                          className="w-full"
                        >
                          Más Info
                        </Button>
                        <Button
                          variant="primary"
                          icon={Calendar}
                          onClick={() => onSchedule(property)}
                          className="w-full"
                        >
                          Agendar Cita
                        </Button>
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
      {assignedAdvisor && (
        <ContactFormModal
          property={property}
          advisor={assignedAdvisor}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </>
  );
};

export default PropertyDetailsModal;
