import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Bed,
  Bath,
  Square,
  MapPin,
  Star,
  Image as ImageIcon,
  MoreVertical,
  Calendar,
  Users,
  TrendingUp
} from 'lucide-react';
import { getProperties } from '../lib/supabase';
import { Property } from '../types';
import Modal from '../components/UI/Modal';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/UI/Dropdown';
import FloatingCard from '../components/UI/FloatingCard';

function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  // Estados para modales y ventanas flotantes
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      console.log('🏠 Cargando propiedades desde Supabase...');
      
      const propertiesData = await getProperties();
      console.log('✅ Propiedades obtenidas:', propertiesData);
      
      setProperties(propertiesData);
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error cargando propiedades:', error);
      setProperties([]);
      setLoading(false);
    }
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (property.location || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
    const matchesType = typeFilter === 'all' || property.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  // Funciones para manejar modales
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowEditModal(true);
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        // Aquí iría la lógica para eliminar de Supabase
        console.log('Eliminando propiedad:', propertyId);
        setProperties(properties.filter(p => p.id !== propertyId));
      } catch (error) {
        console.error('Error eliminando propiedad:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gestión de Propiedades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Administra todas las propiedades del catálogo
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Propiedad
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FloatingCard glowEffect className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Propiedades</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{properties.length}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2.5% este mes</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Home className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FloatingCard glowEffect className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Venta</p>
                <p className="text-3xl font-bold text-blue-600">
                  {properties.filter(p => p.status === 'sale').length}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Disponibles</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <DollarSign className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <FloatingCard glowEffect className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Arriendo</p>
                <p className="text-3xl font-bold text-green-600">
                  {properties.filter(p => p.status === 'rent').length}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">Disponibles</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Home className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FloatingCard glowEffect className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Destacadas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {properties.filter(p => p.featured).length}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Premium</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Star className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </FloatingCard>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <FloatingCard className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="sale">En Venta</option>
                <option value="rent">En Arriendo</option>
                <option value="sold">Vendido</option>
                <option value="rented">Arrendado</option>
              </select>
            </div>

            {/* Type Filter */}
            <div className="relative">
              <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los tipos</option>
                <option value="apartment">Apartamento</option>
                <option value="house">Casa</option>
                <option value="office">Oficina</option>
                <option value="commercial">Local</option>
              </select>
            </div>
          </div>
        </FloatingCard>
      </motion.div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property, index) => (
          <motion.div
            key={property.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FloatingCard hover glowEffect elevation="high" className="overflow-hidden">
              {/* Property Image */}
              <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${getStatusColor(property.status)}`}>
                    {property.status === 'sale' && 'En Venta'}
                    {property.status === 'rent' && 'En Arriendo'}
                    {property.status === 'sold' && 'Vendido'}
                    {property.status === 'rented' && 'Arrendado'}
                  </span>
                </div>

                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="p-2 bg-yellow-500 rounded-full shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                )}

                {/* Actions Dropdown */}
                <div className="absolute bottom-4 right-4">
                  <Dropdown
                    trigger={
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </motion.button>
                    }
                    align="right"
                    dropdownClassName="w-48"
                  >
                    <DropdownItem
                      onClick={() => handleViewProperty(property)}
                      icon={<Eye className="w-4 h-4" />}
                    >
                      Ver Detalles
                    </DropdownItem>
                    <DropdownItem
                      onClick={() => handleEditProperty(property)}
                      icon={<Edit className="w-4 h-4" />}
                    >
                      Editar
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem
                      onClick={() => handleDeleteProperty(property.id)}
                      icon={<Trash2 className="w-4 h-4" />}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Eliminar
                    </DropdownItem>
                  </Dropdown>
                </div>
              </div>

              {/* Property Info */}
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {property.title}
                </h3>
                
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="text-sm truncate">{property.location || 'Ubicación no disponible'}</span>
                </div>

                <div className="text-2xl font-bold text-blue-600 mb-4">
                  {formatPrice(property.price)}
                </div>

                {/* Property Features */}
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      <span>{property.bedrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      <span>{property.bathrooms}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      <span>{property.area}m²</span>
                    </div>
                  </div>
                </div>

                {/* Property Type */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
                    {property.type === 'apartment' && 'Apartamento'}
                    {property.type === 'house' && 'Casa'}
                    {property.type === 'office' && 'Oficina'}
                    {property.type === 'commercial' && 'Local'}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewProperty(property)}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </FloatingCard>
          </motion.div>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay propiedades encontradas
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron propiedades que coincidan con los filtros aplicados.
          </p>
        </div>
      )}

      {/* Modales */}
      
      {/* Modal para agregar nueva propiedad */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nueva Propiedad"
        size="xl"
      >
        <div className="p-6">
          <div className="text-center py-12">
            <Plus className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Formulario de Nueva Propiedad
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Aquí iría el formulario para agregar una nueva propiedad
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedProperty?.title}
        size="xl"
      >
        {selectedProperty && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-xl mb-4">
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <img
                      src={selectedProperty.images[0]}
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedProperty.title}
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedProperty.location || 'Ubicación no disponible'}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                    <span className="text-2xl font-bold text-blue-600">
                      {formatPrice(selectedProperty.price)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 py-4">
                    <div className="text-center">
                      <Bed className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Habitaciones</span>
                      <p className="font-semibold">{selectedProperty.bedrooms}</p>
                    </div>
                    <div className="text-center">
                      <Bath className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Baños</span>
                      <p className="font-semibold">{selectedProperty.bathrooms}</p>
                    </div>
                    <div className="text-center">
                      <Square className="w-6 h-6 text-gray-500 mx-auto mb-1" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Área</span>
                      <p className="font-semibold">{selectedProperty.area}m²</p>
                    </div>
                  </div>
                  
                  {selectedProperty.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Descripción</h4>
                      <p className="text-gray-700 dark:text-gray-300">{selectedProperty.description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal para editar */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Propiedad"
        size="xl"
      >
        <div className="p-6">
          <div className="text-center py-12">
            <Edit className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Formulario de Edición
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Aquí iría el formulario para editar la propiedad: {selectedProperty?.title}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminProperties;
