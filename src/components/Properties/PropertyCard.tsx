import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Star, Heart, Eye, MessageCircle, Calendar } from 'lucide-react';
import { Property } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { getPublicImageUrl } from '../../lib/supabase';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onContact: (property: Property) => void;
  onSchedule: (property: Property) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onContact,
  onSchedule,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Procesar imágenes del campo 'images' que viene como array de objetos con url
  let imageUrls: string[] = [];
  if (Array.isArray(property.images)) {
    // Si es un array de objetos, extrae el campo 'url'
    if (property.images.length > 0 && typeof property.images[0] === 'object' && property.images[0] !== null) {
      imageUrls = property.images.map((img: any) => img.url);
    } else {
      // Si ya es un array de strings
      imageUrls = property.images;
    }
  }

  // Si las imágenes son rutas internas de Supabase Storage, conviértelas a URLs públicas
  const publicImageUrls = imageUrls
    .filter((url) => typeof url === 'string' && url.length > 0)
    .map((url) => {
      if (url.startsWith('http')) return url;
      return getPublicImageUrl(url);
    });

  // Debug específico para ver las URLs finales
  if (property.id && publicImageUrls.length > 0) {
    console.log(`🖼️ ${property.title}:`, {
      rawImages: property.images,
      extractedUrls: imageUrls,
      publicUrls: publicImageUrls,
      firstImageWillLoad: publicImageUrls[0]
    });
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sale': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'rented': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sale': return 'En Venta';
      case 'rent': return 'En Arriendo';
      case 'sold': return 'Vendido';
      case 'rented': return 'Arrendado';
      default: return status;
    }
  };

  return (
    <Card className="overflow-hidden group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={publicImageUrls[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Featured Badge */}
        {property.featured && (
          <div className="absolute top-3 left-3">
            <div className="relative">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Star className="w-3 h-3 fill-current" />
                <span>Destacado</span>
              </div>
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-30 animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(property.status)}`}>
            {getStatusText(property.status)}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-600 dark:text-gray-400'
            }`} 
          />
        </button>

        {/* Image Navigation */}
        {publicImageUrls.length > 1 && (
          <div className="absolute bottom-3 left-3 flex space-x-1">
            {publicImageUrls.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex 
                    ? 'bg-white' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title and Location */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {property.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-sm">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{property.location}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatPrice(property.price)}
          </span>
          {property.status === 'rent' && (
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/mes</span>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="w-4 h-4" />
            <span>{property.area}m²</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => onViewDetails(property)}
            className="text-xs"
          >
            Ver
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={MessageCircle}
            onClick={() => onContact(property)}
            className="text-xs"
          >
            Contacto
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => onSchedule(property)}
            className="text-xs"
          >
            Cita
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PropertyCard;