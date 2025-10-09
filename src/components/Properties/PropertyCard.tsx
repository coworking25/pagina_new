import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Star, Heart, Eye, MessageCircle, Calendar, MoreVertical, Edit, Trash2, Building } from 'lucide-react';
import { Property } from '../../types';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Dropdown, { DropdownItem, DropdownDivider } from '../UI/Dropdown';
import { getPublicImageUrl, updatePropertyStatus } from '../../lib/supabase';
import { likeProperty, unlikeProperty, hasLikedProperty, getPropertyLikesCount } from '../../lib/analytics';

interface PropertyCardProps {
  property: Property;
  onViewDetails: (property: Property) => void;
  onContact: (property: Property) => void;
  onSchedule: (property: Property) => void;
  onEdit?: (property: Property) => void;
  onDelete?: (property: Property) => void;
  showAdminActions?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onViewDetails,
  onContact,
  onSchedule,
  onEdit,
  onDelete,
  showAdminActions = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoadingLike, setIsLoadingLike] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(property.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Cargar estado de like y conteo al montar
  useEffect(() => {
    loadLikeStatus();
    loadLikesCount();
  }, [property.id]);

  // Función para cargar estado de like del usuario
  const loadLikeStatus = async () => {
    const liked = await hasLikedProperty(String(property.id));
    setIsFavorite(liked);
  };

  // Función para cargar conteo de likes
  const loadLikesCount = async () => {
    const count = await getPropertyLikesCount(String(property.id));
    setLikesCount(count);
  };

  // Función para manejar click en el corazón
  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isLoadingLike) return;
    
    setIsLoadingLike(true);
    
    try {
      if (isFavorite) {
        // Quitar like
        const success = await unlikeProperty(String(property.id));
        if (success) {
          setIsFavorite(false);
          setLikesCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Dar like
        const success = await likeProperty(String(property.id));
        if (success) {
          setIsFavorite(true);
          setLikesCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error al actualizar like:', error);
    } finally {
      setIsLoadingLike(false);
    }
  };

  // Función para abrir el modal de detalles
  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(property);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    // Ignorar clicks en botones y elementos interactivos
    if (target.closest('button') || target.closest('.action-buttons')) {
      return;
    }
    
    onViewDetails(property);
  };

  // Función para actualizar el estado de la propiedad
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdatingStatus(true);
    try {
      await updatePropertyStatus(property.id, newStatus);
      setCurrentStatus(newStatus as Property['status']);
      console.log(`✅ Estado de propiedad ${property.id} actualizado a: ${newStatus}`);
    } catch (error) {
      console.error('❌ Error al actualizar el estado:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sale': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rent': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sold': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'rented': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'reserved': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'maintenance': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'pending': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'sale': return 'En Venta';
      case 'rent': return 'En Arriendo';
      case 'sold': return 'Vendido';
      case 'rented': return 'Arrendado';
      case 'reserved': return 'Reservado';
      case 'maintenance': return 'Mantenimiento';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div onClick={handleCardClick}>
      <Card className="overflow-hidden group cursor-pointer">
        {/* Image Section - Clicable */}
        <div 
          className="relative h-48 overflow-hidden cursor-pointer"
          onClick={handleImageClick}
        >
        <motion.img
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          src={publicImageUrls[currentImageIndex] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay con efecto hover */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
            <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Ver detalles</span>
              {publicImageUrls.length > 1 && (
                <div className="text-xs mt-1">
                  +{publicImageUrls.length - 1} fotos más
                </div>
              )}
            </div>
          </div>
        </div>

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
        <div className={`absolute bottom-3 left-3 ${publicImageUrls.length > 1 ? 'bottom-12' : 'bottom-3'}`}>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(currentStatus)} ${isUpdatingStatus ? 'opacity-50' : ''}`}>
            {isUpdatingStatus ? 'Actualizando...' : getStatusText(currentStatus)}
          </span>
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleLikeClick}
          disabled={isLoadingLike}
          className="absolute bottom-3 right-3 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              isFavorite ? 'text-green-600 fill-current' : 'text-gray-600 dark:text-gray-400'
            }`} 
          />
          {likesCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {likesCount}
            </span>
          )}
        </button>

        {/* Admin Actions Dropdown */}
        {showAdminActions && (
          <div className="absolute top-3 right-3">
            <Dropdown
              trigger={
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </motion.button>
              }
              align="right"
              dropdownClassName="w-48"
            >
              <DropdownItem
                onClick={() => onViewDetails(property)}
                icon={<Eye className="w-4 h-4" />}
              >
                Ver Detalles
              </DropdownItem>
              {onEdit && (
                <DropdownItem
                  onClick={() => onEdit(property)}
                  icon={<Edit className="w-4 h-4" />}
                >
                  Editar
                </DropdownItem>
              )}
              <DropdownDivider />
              <DropdownItem
                onClick={() => {}}
                className="font-semibold text-gray-900 dark:text-white"
                disabled
              >
                Cambiar Estado
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('available')}
                className={currentStatus === 'available' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                🟢 Disponible
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('sale')}
                className={currentStatus === 'sale' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                💰 En Venta
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('rent')}
                className={currentStatus === 'rent' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                🏠 En Arriendo
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('sold')}
                className={currentStatus === 'sold' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                ✅ Vendido
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('rented')}
                className={currentStatus === 'rented' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                🔒 Arrendado
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('reserved')}
                className={currentStatus === 'reserved' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                📅 Reservado
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('maintenance')}
                className={currentStatus === 'maintenance' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                🔧 Mantenimiento
              </DropdownItem>
              <DropdownItem
                onClick={() => handleStatusChange('pending')}
                className={currentStatus === 'pending' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''}
              >
                ⏳ Pendiente
              </DropdownItem>
              <DropdownDivider />
              {onDelete && (
                <DropdownItem
                  onClick={() => onDelete(property)}
                  icon={<Trash2 className="w-4 h-4" />}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Eliminar
                </DropdownItem>
              )}
            </Dropdown>
          </div>
        )}

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
          <h3 
            className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            onClick={handleImageClick}
          >
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
          {currentStatus === 'rent' && (
            <span className="text-gray-500 dark:text-gray-400 text-sm ml-1">/mes</span>
          )}
        </div>

        {/* Property Details */}
        <div className="flex items-center justify-between mb-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <Building className="w-4 h-4" />
            <span className="capitalize">
              {property.type === 'apartment' ? 'Apartamento' :
               property.type === 'apartaestudio' ? 'Apartaestudio' :
               property.type === 'house' ? 'Casa' :
               property.type === 'office' ? 'Oficina' :
               property.type === 'commercial' ? 'Local' :
               property.type || 'Propiedad'}
            </span>
          </div>
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
        <div 
          className="grid grid-cols-3 gap-2" 
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            icon={Eye}
            onClick={() => onViewDetails(property)}
            className="text-xs hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
          >
            Ver
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={MessageCircle}
            onClick={() => onContact(property)}
            className="text-xs hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
          >
            Contacto
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Calendar}
            onClick={() => onSchedule(property)}
            className="text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 border-0 glow-green hover:scale-105 hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
          >
            Cita
          </Button>
        </div>
      </div>
    </Card>
    </div>
  );
};

// 🚀 Memoizar componente para evitar re-renders innecesarios
export default React.memo(PropertyCard, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian estas propiedades críticas
  return (
    prevProps.property.id === nextProps.property.id &&
    prevProps.property.status === nextProps.property.status &&
    prevProps.property.featured === nextProps.property.featured &&
    prevProps.showAdminActions === nextProps.showAdminActions
  );
});