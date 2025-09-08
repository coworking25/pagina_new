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
  FileText,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle
} from 'lucide-react';
import { getProperties, createProperty, updateProperty, deleteProperty, uploadPropertyImage, deletePropertyImage, getAdvisorById } from '../lib/supabase';
import { Property, Advisor } from '../types';
import Modal from '../components/UI/Modal';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/UI/Dropdown';
import FloatingCard from '../components/UI/FloatingCard';
import ScheduleAppointmentModal from '../components/Modals/ScheduleAppointmentModal';
import ContactModal from '../components/Modals/ContactModal';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Estados para asesores
  const [currentAdvisor, setCurrentAdvisor] = useState<Advisor | null>(null);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);
  
  // Estados para modales de contacto y citas
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
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
    advisor_id: '',
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
      
      // Verificar advisor_id en cada propiedad
      propertiesData.forEach((property, index) => {
        console.log(`🏠 Propiedad ${index + 1}: "${property.title}" - advisor_id: ${property.advisor_id || 'SIN ASESOR'}`);
      });
      
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
      advisor_id: '',
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
  const handleViewProperty = async (property: Property) => {
    console.log('🔍 Abriendo detalles de propiedad:', property);
    console.log('📋 advisor_id encontrado:', property.advisor_id);
    
    setSelectedProperty(property);
    setCurrentImageIndex(0); // Reiniciar al primer índice
    setShowDetailsModal(true);
    
    // Cargar información del asesor si tiene advisor_id
    if (property.advisor_id) {
      setLoadingAdvisor(true);
      setCurrentAdvisor(null); // Limpiar asesor anterior
      console.log('👥 Cargando asesor con ID:', property.advisor_id);
      try {
        const advisor = await getAdvisorById(property.advisor_id);
        console.log('✅ Asesor cargado:', advisor);
        setCurrentAdvisor(advisor);
      } catch (error) {
        console.error('❌ Error cargando asesor:', error);
        setCurrentAdvisor(null);
      } finally {
        setLoadingAdvisor(false);
      }
    } else {
      console.log('❌ No hay advisor_id en esta propiedad');
      setCurrentAdvisor(null);
      setLoadingAdvisor(false);
    }
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
      advisor_id: property.advisor_id || '',
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
            <FloatingCard hover glowEffect elevation="high" className="overflow-hidden group">
              {/* Property Image - Clicable */}
              <div 
                className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 cursor-pointer"
                onClick={() => handleViewProperty(property)}
              >
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay con efecto hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                    <div className="bg-black bg-opacity-50 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium">Ver detalles</span>
                      {property.images && property.images.length > 1 && (
                        <div className="text-xs mt-1">
                          +{property.images.length - 1} fotos más
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Badge de imágenes */}
                {property.images && property.images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-lg text-sm">
                    📸 {property.images.length}
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
                  <div className={`absolute top-4 ${property.images && property.images.length > 1 ? 'right-20' : 'right-4'}`}>
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
                        onClick={(e) => e.stopPropagation()}
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
                <h3 
                  className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  onClick={() => handleViewProperty(property)}
                >
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
        size="full"
      >
        {selectedProperty && (
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Galería de Imágenes - Columna Principal */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {/* Imagen Principal */}
                  <div className="relative h-96 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 overflow-hidden">
                    {selectedProperty.images && selectedProperty.images.length > 0 ? (
                      <>
                        <img
                          src={selectedProperty.images[currentImageIndex]}
                          alt={selectedProperty.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Navegación de Imágenes */}
                        {selectedProperty.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => 
                                  prev === 0 ? selectedProperty.images.length - 1 : prev - 1
                                );
                              }}
                              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => 
                                  prev === selectedProperty.images.length - 1 ? 0 : prev + 1
                                );
                              }}
                              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </>
                        )}

                        {/* Contador de Imágenes */}
                        <div className="absolute top-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-lg text-sm">
                          {currentImageIndex + 1} / {selectedProperty.images.length}
                        </div>

                        {/* Badge de Estado */}
                        <div className="absolute top-4 left-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(selectedProperty.status)}`}>
                            {selectedProperty.status === 'sale' && 'En Venta'}
                            {selectedProperty.status === 'rent' && 'En Arriendo'}
                            {selectedProperty.status === 'sold' && 'Vendido'}
                            {selectedProperty.status === 'rented' && 'Arrendado'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                        <span className="ml-2 text-gray-500">Sin imágenes disponibles</span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {selectedProperty.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                            index === currentImageIndex 
                              ? 'border-blue-500 ring-2 ring-blue-200' 
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`${selectedProperty.title} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Información Detallada */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Información de la Propiedad
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                      <Bed className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Habitaciones</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedProperty.bedrooms}</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                      <Bath className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Baños</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedProperty.bathrooms}</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                      <Square className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Área</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{selectedProperty.area}m²</p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg">
                      <Home className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400 block">Tipo</span>
                      <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{selectedProperty.type}</p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                      Ubicación
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-3 rounded-lg">
                      {selectedProperty.location || 'Ubicación no disponible'}
                    </p>
                  </div>

                  {/* Precio */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                      Precio
                    </h4>
                    <p className="text-3xl font-bold text-green-600 bg-white dark:bg-gray-700 p-3 rounded-lg">
                      {formatPrice(selectedProperty.price)}
                    </p>
                  </div>

                  {/* Amenidades */}
                  {selectedProperty.amenities && selectedProperty.amenities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                        Amenidades
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {selectedProperty.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center bg-white dark:bg-gray-700 p-2 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{amenity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Descripción */}
                  {selectedProperty.description && (
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-indigo-600" />
                        Descripción
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-4 rounded-lg leading-relaxed">
                        {selectedProperty.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar de Acciones */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg sticky top-6">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Acciones Disponibles
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Agendar Cita */}
                    <button 
                      onClick={() => {
                        console.log('🗓️ Clicked Agendar Cita button');
                        console.log('Current Advisor:', currentAdvisor);
                        console.log('Selected Property:', selectedProperty);
                        setShowAppointmentModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Calendar className="h-5 w-5" />
                      <span>Agendar Cita</span>
                    </button>
                    
                    {/* Contactar Asesor */}
                    <button 
                      onClick={() => {
                        console.log('📞 Clicked Contactar Asesor button');
                        console.log('Current Advisor:', currentAdvisor);
                        console.log('Selected Property:', selectedProperty);
                        setShowContactModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Contactar Asesor</span>
                    </button>
                    
                    {/* WhatsApp Directo */}
                    <button 
                      onClick={() => {
                        const phone = currentAdvisor?.whatsapp || '573148860404';
                        const message = `Consulta sobre la propiedad: ${selectedProperty.title}`;
                        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                      }}
                      className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>WhatsApp</span>
                    </button>
                    
                    {/* Editar Propiedad */}
                    <button 
                      onClick={() => {
                        setShowDetailsModal(false);
                        handleEditProperty(selectedProperty);
                      }}
                      className="w-full flex items-center justify-center space-x-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                      <span>Editar Propiedad</span>
                    </button>
                  </div>

                  {/* Información del Asesor */}
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Asesor Asignado</h4>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      {loadingAdvisor ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
                          <div>
                            <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32 animate-pulse"></div>
                          </div>
                        </div>
                      ) : currentAdvisor ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center overflow-hidden">
                            {currentAdvisor.photo ? (
                              <img 
                                src={currentAdvisor.photo} 
                                alt={currentAdvisor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log('❌ Error cargando foto del asesor:', currentAdvisor.photo);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Users className="w-6 h-6 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{currentAdvisor.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{currentAdvisor.specialty}</p>
                            <p className="text-sm text-blue-600">{currentAdvisor.phone}</p>
                            {currentAdvisor.experience_years && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {currentAdvisor.experience_years} años de experiencia
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => window.open(`tel:${currentAdvisor.phone}`, '_self')}
                              className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-full transition-colors"
                              title="Llamar"
                            >
                              <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </button>
                            {currentAdvisor.whatsapp && (
                              <button
                                onClick={() => window.open(`https://wa.me/${currentAdvisor.whatsapp}`, '_blank')}
                                className="flex items-center justify-center w-8 h-8 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 rounded-full transition-colors"
                                title="WhatsApp"
                              >
                                <MessageCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-500 dark:text-gray-400">Sin asesor asignado</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">No hay asesor asignado a esta propiedad</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estadísticas de la Propiedad */}
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Estadísticas</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Vistas</span>
                        <span className="font-medium text-gray-900 dark:text-white">24</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Consultas</span>
                        <span className="font-medium text-gray-900 dark:text-white">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Citas</span>
                        <span className="font-medium text-gray-900 dark:text-white">3</span>
                      </div>
                    </div>
                  </div>
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

      {/* Modal para Agendar Cita */}
      {selectedProperty && currentAdvisor && (
        <ScheduleAppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          property={selectedProperty}
          advisor={currentAdvisor}
        />
      )}

      {/* Modal para Contactar Asesor */}
      {selectedProperty && (
        <ContactModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          property={selectedProperty}
        />
      )}
    </div>
  );
}

export default AdminProperties;
