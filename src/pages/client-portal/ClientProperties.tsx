import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, FileText, Calendar, DollarSign, MapPin, Bed, Bath, Square, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getClientProperties } from '../../lib/client-portal/clientPortalApi';
import type { ClientProperty } from '../../types/clientPortal';

const ClientProperties: React.FC = () => {
  const [properties, setProperties] = useState<ClientProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getClientProperties();
      setProperties(data);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError('Error al cargar las propiedades. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'active': 'Activo',
      'pending': 'Pendiente',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getRelationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'owner': 'Propietario',
      'tenant': 'Arrendatario',
      'interested': 'Interesado',
      'pending_contract': 'Contrato Pendiente'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Error al cargar
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={loadProperties}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
          Mis Propiedades
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Gestiona tus contratos y propiedades asignadas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 sm:p-3 rounded-lg">
              <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Propiedades</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-green-100 dark:bg-green-900/30 p-2 sm:p-3 rounded-lg">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Contratos Activos</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {properties.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-4 sm:p-5 lg:p-6 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 sm:p-3 rounded-lg">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Contratos Pendientes</p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                {properties.filter(p => p.status === 'pending').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Properties List */}
      <div className="space-y-3 sm:space-y-4">
        {properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No tienes propiedades asignadas</p>
            <p className="text-sm text-gray-500 mt-2">
              Las propiedades asignadas aparecerán aquí
            </p>
          </div>
        ) : (
          properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col md:flex-row">
                {/* Property Image */}
                <div className="w-full md:w-40 lg:w-48 h-32 sm:h-40 md:h-48 bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {property.property.cover_image ? (
                    <img
                      src={property.property.cover_image}
                      alt={property.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Property Info */}
                <div className="flex-1 p-4 sm:p-5 lg:p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3 sm:mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white mb-2 truncate">
                        {property.property.title || 'Sin título'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{property.property.code}</span>
                        <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">•</span>
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                          {getStatusLabel(property.status)}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-400 hidden sm:inline">•</span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {getRelationTypeLabel(property.relation_type)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{property.property.location || 'Sin ubicación'}</span>
                    </div>
                    {property.property.bedrooms && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Bed className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{property.property.bedrooms} hab</span>
                      </div>
                    )}
                    {property.property.bathrooms && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Bath className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{property.property.bathrooms} baños</span>
                      </div>
                    )}
                    {property.property.area && (
                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span>{property.property.area} m²</span>
                      </div>
                    )}
                  </div>

                  {/* Price and Dates */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex items-center gap-2 sm:gap-4">
                      {property.property.price && (
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                            ${property.property.price.toLocaleString('es-CO')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      Asignada el {format(new Date(property.created_at), 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientProperties;