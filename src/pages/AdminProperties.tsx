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
  TrendingUp,
  Upload,
  X,
  Check,
  Wifi,
  Car,
  Shield,
  Trees,
  Dumbbell,
  Waves,
  ShoppingCart,
  GraduationCap,
  Utensils,
  Zap,
  Wind,
  Sun,
  Camera,
  FileText
} from 'lucide-react';
import { getProperties, createProperty, updateProperty, deleteProperty, uploadPropertyImage, deletePropertyImage } from '../lib/supabase';
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
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'house',
    status: 'sale',
    amenities: '',
    images: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para manejo de imágenes
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Estados para amenidades predefinidas
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Lista de amenidades predefinidas con iconos
  const amenitiesList = [
    { id: 'wifi', name: 'WiFi', icon: Wifi },
    { id: 'parking', name: 'Estacionamiento', icon: Car },
    { id: 'security', name: 'Seguridad 24h', icon: Shield },
    { id: 'garden', name: 'Jardín', icon: Trees },
    { id: 'gym', name: 'Gimnasio', icon: Dumbbell },
    { id: 'pool', name: 'Piscina', icon: Waves },
    { id: 'supermarket', name: 'Supermercado cercano', icon: ShoppingCart },
    { id: 'schools', name: 'Colegios cercanos', icon: GraduationCap },
    { id: 'restaurants', name: 'Restaurantes', icon: Utensils },
    { id: 'electricity', name: 'Electricidad incluida', icon: Zap },
    { id: 'aircon', name: 'Aire acondicionado', icon: Wind },
    { id: 'balcony', name: 'Balcón', icon: Sun }
  ];

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

  // Función para limpiar el formulario
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      type: 'house',
      status: 'sale',
      amenities: '',
      images: []
    });
    setSelectedAmenities([]);
    setPreviewImages([]);
  };

  // Función para manejar subida de imágenes
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(file => uploadPropertyImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Agregar URLs a las imágenes del formulario
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      // Agregar a preview
      setPreviewImages(prev => [...prev, ...uploadedUrls]);
      
      console.log('✅ Imágenes subidas exitosamente');
    } catch (error) {
      console.error('❌ Error subiendo imágenes:', error);
      alert('Error al subir las imágenes. Por favor, inténtalo de nuevo.');
    } finally {
      setUploadingImages(false);
    }
  };

  // Función para eliminar imagen
  const handleRemoveImage = async (imageUrl: string, index: number) => {
    try {
      await deletePropertyImage(imageUrl);
      
      // Remover de formData
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      
      // Remover de preview
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
      
      console.log('✅ Imagen eliminada exitosamente');
    } catch (error) {
      console.error('❌ Error eliminando imagen:', error);
    }
  };

  // Función para manejar selección de amenidades
  const toggleAmenity = (amenityId: string) => {
    const amenityName = amenitiesList.find(a => a.id === amenityId)?.name || amenityId;
    
    setSelectedAmenities(prev => {
      const newSelected = prev.includes(amenityName)
        ? prev.filter(a => a !== amenityName)
        : [...prev, amenityName];
      
      // Actualizar formData
      setFormData(prevForm => ({
        ...prevForm,
        amenities: newSelected.join(', ')
      }));
      
      return newSelected;
    });
  };

  // Función para manejar cambios en el formulario
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funciones para manejar modales
  const handleViewProperty = (property: Property) => {
    setSelectedProperty(property);
    setShowDetailsModal(true);
  };

  const handleEditProperty = (property: Property) => {
    setSelectedProperty(property);
    // Llenar el formulario con los datos de la propiedad
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price?.toString() || '',
      location: property.location || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area: property.area?.toString() || '',
      type: property.type || 'house',
      status: property.status || 'sale',
      amenities: Array.isArray(property.amenities) ? property.amenities.join(', ') : '',
      images: property.images || []
    });
    
    // Cargar amenidades seleccionadas
    setSelectedAmenities(property.amenities || []);
    
    // Cargar imágenes para preview
    setPreviewImages(property.images || []);
    
    setShowEditModal(true);
  };

  const handleAddProperty = () => {
    resetForm();
    setSelectedProperty(null);
    setShowAddModal(true);
  };

  // Función para crear nueva propiedad
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        type: formData.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: formData.status as 'sale' | 'rent' | 'sold' | 'rented',
        amenities: selectedAmenities, // Usar amenidades seleccionadas
        images: previewImages, // Usar imágenes de preview
        featured: false
      };
      
      const newProperty = await createProperty(propertyData);
      setProperties(prev => [newProperty, ...prev]);
      setShowAddModal(false);
      resetForm();
      
      console.log('✅ Propiedad creada exitosamente');
      alert('Propiedad creada exitosamente');
    } catch (error) {
      console.error('❌ Error creando propiedad:', error);
      alert('Error al crear la propiedad. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para actualizar propiedad
  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProperty) return;
    
    setIsSubmitting(true);
    try {
      const propertyData = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        type: formData.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: formData.status as 'sale' | 'rent' | 'sold' | 'rented',
        amenities: formData.amenities.split(',').map(item => item.trim()).filter(item => item),
        images: formData.images
      };
      
      const updatedProperty = await updateProperty(selectedProperty.id, propertyData);
      setProperties(prev => prev.map(p => p.id === selectedProperty.id ? updatedProperty : p));
      setShowEditModal(false);
      setSelectedProperty(null);
      resetForm();
      
      console.log('✅ Propiedad actualizada exitosamente');
      alert('Propiedad actualizada exitosamente');
    } catch (error) {
      console.error('❌ Error actualizando propiedad:', error);
      alert('Error al actualizar la propiedad. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        console.log('🗑️ Eliminando propiedad:', propertyId);
        await deleteProperty(propertyId);
        
        // Actualizar la lista local
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        
        console.log('✅ Propiedad eliminada exitosamente');
        alert('Propiedad eliminada exitosamente');
      } catch (error) {
        console.error('❌ Error eliminando propiedad:', error);
        alert('Error al eliminar la propiedad. Por favor, inténtalo de nuevo.');
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
          onClick={handleAddProperty}
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
        size="full"
      >
        <form onSubmit={handleCreateProperty} className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Sección 1: Información Básica */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título de la Propiedad *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ej: Casa moderna en zona exclusiva con vista panorámica"
                />
              </div>

              {/* Precio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Precio *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Valor en COP"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Ubicación *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ej: Zona Norte, Bogotá, Colombia"
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Características */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Square className="w-5 h-5 mr-2 text-green-600" />
              Características
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Habitaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bed className="w-4 h-4 inline mr-1" />
                  Habitaciones *
                </label>
                <input
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              {/* Baños */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Bath className="w-4 h-4 inline mr-1" />
                  Baños *
                </label>
                <input
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleFormChange}
                  required
                  min="0"
                  step="0.5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              {/* Área */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Square className="w-4 h-4 inline mr-1" />
                  Área (m²) *
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area}
                  onChange={handleFormChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Propiedad *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                >
                  <option value="house">🏠 Casa</option>
                  <option value="apartment">🏢 Apartamento</option>
                  <option value="office">🏪 Oficina</option>
                  <option value="commercial">🏬 Comercial</option>
                </select>
              </div>
            </div>

            {/* Estado */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado de la Propiedad *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'sale', label: '🏷️ En Venta', color: 'blue' },
                  { value: 'rent', label: '🔑 En Alquiler', color: 'green' },
                  { value: 'sold', label: '✅ Vendida', color: 'gray' },
                  { value: 'rented', label: '🏠 Alquilada', color: 'gray' }
                ].map(status => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value={status.value}
                      checked={formData.status === status.value}
                      onChange={handleFormChange}
                      className="sr-only"
                    />
                    <div className={`flex-1 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.status === status.value
                        ? `border-${status.color}-500 bg-${status.color}-50 dark:bg-${status.color}-900/20`
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {status.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sección 3: Amenidades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Amenidades
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {amenitiesList.map((amenity, index) => (
                <div
                  key={index}
                  onClick={() => toggleAmenity(amenity.name)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                    selectedAmenities.includes(amenity.name)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <amenity.icon className={`w-8 h-8 mb-2 ${
                      selectedAmenities.includes(amenity.name)
                        ? 'text-blue-600'
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      selectedAmenities.includes(amenity.name)
                        ? 'text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {amenity.name}
                    </span>
                    {selectedAmenities.includes(amenity.name) && (
                      <Check className="w-4 h-4 text-blue-600 mt-1" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sección 4: Gestión de Imágenes */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-purple-600" />
              Imágenes de la Propiedad
            </h3>
            
            {/* Área de carga de imágenes */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Arrastra imágenes aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Formatos soportados: JPG, PNG, WebP (máximo 5MB por imagen)
                  </p>
                  {uploadingImages && (
                    <div className="mt-4">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-blue-600">Subiendo imágenes...</span>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Vista previa de imágenes */}
            {previewImages.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Imágenes seleccionadas ({previewImages.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(image, index)}
                        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {index === 0 && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md font-medium">
                          Principal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sección 5: Descripción */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Descripción Detallada
            </h3>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
              placeholder="Describe detalladamente las características especiales de la propiedad, su ubicación, beneficios únicos, y cualquier información relevante para los potenciales compradores o arrendatarios..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImages}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Propiedad
                </>
              )}
            </button>
          </div>
        </form>
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
        title={`Editar Propiedad: ${selectedProperty?.title}`}
        size="xl"
      >
        <form onSubmit={handleUpdateProperty} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ej: Casa moderna en zona exclusiva"
              />
            </div>

            {/* Precio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ubicación *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ej: Zona Norte, Bogotá"
              />
            </div>

            {/* Habitaciones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Habitaciones *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleFormChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Baños */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Baños *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleFormChange}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Área */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Área (m²) *
              </label>
              <input
                type="number"
                name="area"
                value={formData.area}
                onChange={handleFormChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="house">Casa</option>
                <option value="apartment">Apartamento</option>
                <option value="office">Oficina</option>
                <option value="commercial">Comercial</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="sale">En Venta</option>
                <option value="rent">En Alquiler</option>
                <option value="sold">Vendida</option>
                <option value="rented">Alquilada</option>
              </select>
            </div>

            {/* Amenidades */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amenidades
              </label>
              <input
                type="text"
                name="amenities"
                value={formData.amenities}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Ej: Piscina, Gimnasio, Seguridad 24h (separar con comas)"
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Descripción detallada de la propiedad..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Propiedad'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AdminProperties;
