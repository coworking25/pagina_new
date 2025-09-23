import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
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
  MessageCircle,
  Home as HomeIcon,
  Building,
  Gamepad2,
  Baby,
  Building2,
  ArrowUp,
  Flame,
  Droplets,
  Tv,
  WashingMachine,
  Refrigerator,
  ChefHat,
  Sofa,
  Coffee,
  Activity,
  TreePine,
  Flower,
  Fence,
  Users as UsersIcon,
  Music,
  Volume2,
  Cctv,
  Lock,
  Lightbulb,
  Thermometer,
  Fan,
  Shirt,
  Dog,
  Heart,
  Briefcase,
  School,
  CrossIcon,
  Bus,
  Train,
  Plane,
  ShoppingBag,
  Mountain,
  Sparkles
} from 'lucide-react';
import { getProperties, createProperty, updateProperty, deleteProperty, deletePropertyImage, getAdvisorById, getAdvisors, getPropertyStats, getPropertyActivity, bulkUploadPropertyImages, generatePropertyCode, getActiveTenantsForProperties, updatePropertyStatus, supabase } from '../lib/supabase';
import { Property, Advisor } from '../types';
import Modal from '../components/UI/Modal';
import FloatingCard from '../components/UI/FloatingCard';
import ScheduleAppointmentModal from '../components/Modals/ScheduleAppointmentModal';
import ContactModal from '../components/Modals/ContactModal';
import { CoverImageSelector } from '../components/CoverImageSelector';

function AdminProperties() {
  console.log('🔍 AdminProperties: Iniciando componente');
  
  const location = useLocation();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  
  console.log('🔍 AdminProperties: Estados inicializados');
  
  // Estados para modales y ventanas flotantes
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [tenantMap, setTenantMap] = useState<Record<string, { id: string; full_name: string }>>({});
  
  // Estados para asesores
  const [currentAdvisor, setCurrentAdvisor] = useState<Advisor | null>(null);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loadingAdvisor, setLoadingAdvisor] = useState(false);
  
  // Estados para estadísticas y actividades
  const [propertyStats, setPropertyStats] = useState({
    views: 0,
    inquiries: 0,
    appointments: 0
  });
  const [propertyActivities, setPropertyActivities] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Estados para modales de contacto y citas
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  
  // Estados para formularios
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    price: '',
    location: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    type: 'house',
    status: 'sale',
    advisor_id: '',
    images: [] as string[],
    cover_image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para manejo de imágenes
  const [uploadingImages, setUploadingImages] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  
  // Estados para amenidades predefinidas
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  // Lista de amenidades predefinidas con iconos
  const amenitiesList = [
    // Conectividad y Tecnología
    { id: 'wifi', name: 'WiFi', icon: Wifi, category: 'Tecnología' },
    { id: 'cable_tv', name: 'TV por cable', icon: Tv, category: 'Tecnología' },
    { id: 'internet_fiber', name: 'Internet fibra óptica', icon: Zap, category: 'Tecnología' },
    
    // Estacionamiento y Transporte
    { id: 'parking', name: 'Estacionamiento', icon: Car, category: 'Estacionamiento' },
    { id: 'covered_parking', name: 'Parqueadero cubierto', icon: Building, category: 'Estacionamiento' },
    { id: 'visitor_parking', name: 'Parqueadero visitantes', icon: Users, category: 'Estacionamiento' },
    { id: 'garage', name: 'Garaje privado', icon: HomeIcon, category: 'Estacionamiento' },
    
    // Seguridad
    { id: 'security', name: 'Seguridad 24h', icon: Shield, category: 'Seguridad' },
    { id: 'cctv', name: 'Cámaras de seguridad', icon: Cctv, category: 'Seguridad' },
    { id: 'access_control', name: 'Control de acceso', icon: Lock, category: 'Seguridad' },
    { id: 'doorman', name: 'Portería', icon: UsersIcon, category: 'Seguridad' },
    
    // Recreación y Deportes
    { id: 'gym', name: 'Gimnasio', icon: Dumbbell, category: 'Recreación' },
    { id: 'pool', name: 'Piscina', icon: Waves, category: 'Recreación' },
    { id: 'kids_pool', name: 'Piscina para niños', icon: Baby, category: 'Recreación' },
    { id: 'tennis_court', name: 'Cancha de tenis', icon: Activity, category: 'Recreación' },
    { id: 'soccer_field', name: 'Cancha de fútbol', icon: Gamepad2, category: 'Recreación' },
    { id: 'basketball_court', name: 'Cancha de baloncesto', icon: Activity, category: 'Recreación' },
    { id: 'playground', name: 'Zona de juegos infantiles', icon: Baby, category: 'Recreación' },
    { id: 'kids_area', name: 'Área para niños', icon: Baby, category: 'Recreación' },
    { id: 'game_room', name: 'Salón de juegos', icon: Gamepad2, category: 'Recreación' },
    { id: 'party_room', name: 'Salón de fiestas', icon: Music, category: 'Recreación' },
    { id: 'bbq_area', name: 'Zona de asados', icon: Flame, category: 'Recreación' },
    
    // Zonas Verdes y Exteriores
    { id: 'garden', name: 'Jardín', icon: Trees, category: 'Zonas Verdes' },
    { id: 'green_areas', name: 'Zonas verdes', icon: TreePine, category: 'Zonas Verdes' },
    { id: 'terrace', name: 'Terraza', icon: Building2, category: 'Zonas Verdes' },
    { id: 'balcony', name: 'Balcón', icon: Sun, category: 'Zonas Verdes' },
    { id: 'roof_garden', name: 'Jardín en azotea', icon: Flower, category: 'Zonas Verdes' },
    { id: 'patio', name: 'Patio', icon: Fence, category: 'Zonas Verdes' },
    
    // Servicios del Edificio
    { id: 'elevator', name: 'Ascensor', icon: ArrowUp, category: 'Servicios' },
    { id: 'laundry', name: 'Lavandería', icon: WashingMachine, category: 'Servicios' },
    { id: 'cleaning', name: 'Servicio de limpieza', icon: Sparkles, category: 'Servicios' },
    { id: 'maintenance', name: 'Mantenimiento', icon: Briefcase, category: 'Servicios' },
    { id: 'concierge', name: 'Conserjería', icon: Users, category: 'Servicios' },
    
    // Electrodomésticos y Cocina
    { id: 'furnished', name: 'Amoblado', icon: Sofa, category: 'Mobiliario' },
    { id: 'kitchen_equipped', name: 'Cocina equipada', icon: ChefHat, category: 'Mobiliario' },
    { id: 'refrigerator', name: 'Nevera', icon: Refrigerator, category: 'Mobiliario' },
    { id: 'washer', name: 'Lavadora', icon: WashingMachine, category: 'Mobiliario' },
    { id: 'dryer', name: 'Secadora', icon: Shirt, category: 'Mobiliario' },
    { id: 'dishwasher', name: 'Lavavajillas', icon: Droplets, category: 'Mobiliario' },
    
    // Clima y Confort
    { id: 'aircon', name: 'Aire acondicionado', icon: Wind, category: 'Clima' },
    { id: 'heating', name: 'Calefacción', icon: Thermometer, category: 'Clima' },
    { id: 'ceiling_fan', name: 'Ventilador de techo', icon: Fan, category: 'Clima' },
    { id: 'natural_light', name: 'Iluminación natural', icon: Lightbulb, category: 'Clima' },
    
    // Servicios Públicos
    { id: 'electricity', name: 'Electricidad incluida', icon: Zap, category: 'Servicios Públicos' },
    { id: 'water', name: 'Agua incluida', icon: Droplets, category: 'Servicios Públicos' },
    { id: 'gas', name: 'Gas incluido', icon: Flame, category: 'Servicios Públicos' },
    { id: 'administration', name: 'Administración incluida', icon: FileText, category: 'Servicios Públicos' },
    
    // Mascotas
    { id: 'pet_friendly', name: 'Acepta mascotas', icon: Dog, category: 'Mascotas' },
    { id: 'dog_area', name: 'Área para perros', icon: Dog, category: 'Mascotas' },
    { id: 'pet_grooming', name: 'Guardería de mascotas', icon: Heart, category: 'Mascotas' },
    
    // Ubicación y Cercanías
    { id: 'supermarket', name: 'Supermercado cercano', icon: ShoppingCart, category: 'Cercanías' },
    { id: 'shopping_center', name: 'Centro comercial', icon: ShoppingBag, category: 'Cercanías' },
    { id: 'schools', name: 'Colegios cercanos', icon: GraduationCap, category: 'Cercanías' },
    { id: 'universities', name: 'Universidades', icon: School, category: 'Cercanías' },
    { id: 'hospitals', name: 'Hospitales cercanos', icon: CrossIcon, category: 'Cercanías' },
    { id: 'restaurants', name: 'Restaurantes', icon: Utensils, category: 'Cercanías' },
    { id: 'cafes', name: 'Cafeterías', icon: Coffee, category: 'Cercanías' },
    { id: 'public_transport', name: 'Transporte público', icon: Bus, category: 'Cercanías' },
    { id: 'metro', name: 'Metro cercano', icon: Train, category: 'Cercanías' },
    { id: 'airport', name: 'Aeropuerto cercano', icon: Plane, category: 'Cercanías' },
    
    // Vistas y Características Especiales
    { id: 'city_view', name: 'Vista a la ciudad', icon: Building2, category: 'Vistas' },
    { id: 'mountain_view', name: 'Vista a las montañas', icon: Mountain, category: 'Vistas' },
    { id: 'park_view', name: 'Vista al parque', icon: Trees, category: 'Vistas' },
    { id: 'quiet_area', name: 'Zona tranquila', icon: Volume2, category: 'Características' },
    { id: 'new_construction', name: 'Construcción nueva', icon: Sparkles, category: 'Características' },
    { id: 'luxury_finishes', name: 'Acabados de lujo', icon: Star, category: 'Características' }
  ];

  // Estado para amenidades personalizadas
  const [customAmenities, setCustomAmenities] = useState<string[]>([]);
  const [newCustomAmenity, setNewCustomAmenity] = useState('');

  useEffect(() => {
    console.log('🔍 AdminProperties: useEffect ejecutándose');
    try {
      loadProperties();
      loadAdvisors();
    } catch (error) {
      console.error('❌ Error en useEffect:', error);
    }
  }, []);

  // Detectar si viene de una alerta y aplicar filtros automáticamente
  useEffect(() => {
    const state = location.state as any;
    if (state && state.filter === 'inactive' && state.highlightId) {
      // Aplicar filtro de propiedades inactivas
      setStatusFilter('inactive');
      
      // Si tenemos un ID específico, podríamos resaltarlo (en futuras implementaciones)
      console.log('🚨 Viniendo de alerta de propiedad inactiva:', state.highlightId);
    }
  }, [location.state]);

  const loadAdvisors = async () => {
    try {
      console.log('👨‍💼 Cargando asesores...');
      const advisorsData = await getAdvisors();
      setAdvisors(advisorsData);
      console.log('✅ Asesores cargados:', advisorsData.length);
    } catch (error) {
      console.error('❌ Error cargando asesores:', error);
      setAdvisors([]);
    }
  };

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
      // Cargar inquilinos activos para estas propiedades
      try {
        const ids = propertiesData.map((p: any) => p.id);
        const tenants = await getActiveTenantsForProperties(ids);
        setTenantMap(tenants);
      } catch (tErr) {
        console.warn('⚠️ No se pudieron cargar inquilinos activos:', tErr);
      }
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error cargando propiedades:', error);
      setProperties([]);
      setLoading(false);
    }
  };

  const handleReleaseProperty = async (propertyId: number) => {
    if (!window.confirm('¿Confirmas liberar esta propiedad y cerrar el contrato asociado?')) return;
    try {
      // Find active contract for this property (if any)
      const { data: contracts, error: cErr } = await supabase
        .from('contracts')
        .select('*')
        .eq('property_id', propertyId)
        .eq('status', 'active')
        .limit(1)
        .single();

      if (cErr && cErr.code !== 'PGRST116') {
        console.warn('⚠️ Error buscando contrato activo:', cErr);
      }

      if (contracts && contracts.id) {
        // Call RPC to release
        try {
          const { error: rpcErr } = await supabase.rpc('release_property_and_close_contract', { p_contract_id: contracts.id });
          if (rpcErr) throw rpcErr;
        } catch (rpcErr) {
          console.warn('⚠️ RPC release failed, falling back to status update', rpcErr);
          await updatePropertyStatus(propertyId, 'available', 'Liberado manualmente desde UI');
        }
      } else {
        // No active contract found — just set status to available
        await updatePropertyStatus(propertyId, 'available', 'Liberado manualmente desde UI');
      }

      // Refresh properties and tenantMap
      const refreshed = await getProperties();
      setProperties(refreshed);
      const refreshedTenants = await getActiveTenantsForProperties(refreshed.map((p: any) => p.id));
      setTenantMap(refreshedTenants);

      alert('Propiedad liberada correctamente');
    } catch (err) {
      console.error('❌ Error liberando propiedad:', err);
      alert('Error liberando propiedad: ' + (err as any).message);
    }
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
      code: '',
      title: '',
      description: '',
      price: '',
      location: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      type: 'house',
      status: 'sale',
      advisor_id: '',
      images: [],
      cover_image: ''
    });
    setSelectedAmenities([]);
    setCustomAmenities([]);
    setNewCustomAmenity('');
    setPreviewImages([]);
  };

  // Función para manejar subida de imágenes (mejorada con código)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar que hay un código de propiedad
    let propertyCode = formData.code;
    if (!propertyCode) {
      // Generar código automáticamente si no existe
      propertyCode = await generatePropertyCode();
      setFormData(prev => ({ ...prev, code: propertyCode }));
      console.log(`🏷️ Código generado automáticamente: ${propertyCode}`);
    }
    
    setUploadingImages(true);
    try {
      console.log(`📤 Subiendo ${files.length} imágenes para ${propertyCode}...`);
      
      const uploadedUrls = await bulkUploadPropertyImages(
        Array.from(files), 
        propertyCode,
        (current, total) => {
          console.log(`📊 Progreso: ${current}/${total}`);
        }
      );
      
      // Agregar URLs a las imágenes del formulario
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
      
      // Agregar a preview
      setPreviewImages(prev => [...prev, ...uploadedUrls]);
      
      console.log(`✅ ${uploadedUrls.length} imágenes subidas exitosamente`);
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

  // Función para subir nuevas imágenes en el modal de edición
  const handleEditImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !selectedProperty) return;

    setUploadingImages(true);
    try {
  console.log(`📤 Subiendo ${files.length} nuevas imágenes para ${selectedProperty.code || ''}...`);

      const uploadedUrls = await bulkUploadPropertyImages(
        Array.from(files),
        selectedProperty.code || '',
        (current, total) => {
          console.log(`📊 Progreso: ${current}/${total}`);
        }
      );

      // Crear nuevo array de imágenes combinando las existentes con las nuevas
      const newImages = [...selectedProperty.images, ...uploadedUrls];

      // Actualizar la propiedad usando updateProperty
      await updateProperty(selectedProperty.id, { images: newImages });

      // Actualizar el estado local
      setProperties(prev => prev.map(p =>
        p.id === selectedProperty.id
          ? { ...p, images: newImages }
          : p
      ));

      // Actualizar selectedProperty
      setSelectedProperty(prev => prev ? {
        ...prev,
        images: newImages
      } : null);

      console.log(`✅ ${uploadedUrls.length} imágenes agregadas exitosamente`);
      showNotification(`${uploadedUrls.length} imágenes agregadas exitosamente`, 'success');
    } catch (error) {
      console.error('❌ Error subiendo imágenes:', error);
      showNotification('Error al subir las imágenes', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  // Función para manejar selección de amenidades
  const toggleAmenity = (amenityName: string) => {
    setSelectedAmenities(prev => {
      const newSelected = prev.includes(amenityName)
        ? prev.filter(a => a !== amenityName)
        : [...prev, amenityName];
      
      console.log('🏷️ Amenidades seleccionadas:', newSelected);
      return newSelected;
    });
  };

  // Función para agregar amenidad personalizada
  const addCustomAmenity = () => {
    if (newCustomAmenity.trim() && !selectedAmenities.includes(newCustomAmenity.trim())) {
      const customAmenity = newCustomAmenity.trim();
      setSelectedAmenities(prev => [...prev, customAmenity]);
      setCustomAmenities(prev => [...prev, customAmenity]);
      setNewCustomAmenity('');
      console.log('✅ Amenidad personalizada agregada:', customAmenity);
    }
  };

  // Función para remover amenidad personalizada
  const removeCustomAmenity = (amenityName: string) => {
    setSelectedAmenities(prev => prev.filter(a => a !== amenityName));
    setCustomAmenities(prev => prev.filter(a => a !== amenityName));
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
    
    // Cargar estadísticas de la propiedad
    setLoadingStats(true);
    try {
      const stats = await getPropertyStats(property.id);
      setPropertyStats({
        views: stats?.views || 0,
        inquiries: stats?.inquiries || 0,
        appointments: stats?.appointments || 0
      });

      // Cargar actividades recientes de la propiedad
      const activities = await getPropertyActivity(property.id);
      setPropertyActivities(activities || []);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
      setPropertyStats({ views: 0, inquiries: 0, appointments: 0 });
      setPropertyActivities([]);
    } finally {
      setLoadingStats(false);
    }
    
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
    console.log('🖍️ EDITANDO PROPIEDAD:', property.title);
    alert(`Editando propiedad: ${property.title}`);
    setSelectedProperty(property);
    // Llenar el formulario con los datos de la propiedad
    setFormData({
      code: property.code || '',
      title: property.title || '',
      description: property.description || '',
      price: property.price?.toString() || '',
      location: property.location || '',
      bedrooms: property.bedrooms?.toString() || '',
      bathrooms: property.bathrooms?.toString() || '',
      area: property.area?.toString() || '',
      type: property.type || 'house',
      status: property.status || 'sale',
      advisor_id: property.advisor_id || '',
      images: property.images || [],
      cover_image: property.cover_image || ''
    });
    
    // Cargar amenidades seleccionadas
    const propertyAmenities = property.amenities || [];
    setSelectedAmenities(propertyAmenities);
    
    // Separar amenidades predefinidas de personalizadas
    const predefinedAmenityNames = amenitiesList.map(a => a.name);
    const customAmenitiesFromProperty = propertyAmenities.filter(
      amenity => !predefinedAmenityNames.includes(amenity)
    );
    setCustomAmenities(customAmenitiesFromProperty);
    
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
      // Generar código si no existe
      let propertyCode = formData.code;
      if (!propertyCode) {
        propertyCode = await generatePropertyCode();
      }
      
      const propertyData = {
        code: propertyCode,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        type: formData.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: normalizeStatus(formData.status),
        amenities: selectedAmenities, // Usar amenidades seleccionadas
        images: previewImages, // Usar imágenes de preview
        featured: false,
        advisor_id: formData.advisor_id || undefined
      };
      
      const newProperty = await createProperty(propertyData);
      setProperties(prev => [newProperty, ...prev]);
      setShowAddModal(false);
      resetForm();
      
      console.log('✅ Propiedad creada exitosamente');
      showNotification('Propiedad creada exitosamente', 'success');
    } catch (error: any) {
      console.error('❌ Error creando propiedad:', error);
      const errorMessage = error.message || 'Error al crear la propiedad. Por favor, inténtalo de nuevo.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para actualizar propiedad
  const normalizeStatus = (s: string | undefined): Property['status'] => {
    if (!s) return 'available';
    const v = String(s).toLowerCase().trim();
  if (v === 'sale') return 'sale';
  if (v === 'rent') return 'rent';
    if (v === 'sold') return 'sold';
    if (v === 'rented') return 'rented';
    if (v === 'reserved') return 'reserved';
    if (v === 'maintenance') return 'maintenance';
    if (v === 'pending') return 'pending';
    // default fallback
    return 'available';
  };

  const handleUpdateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !selectedProperty) return;
    
    setIsSubmitting(true);
    try {
      const propertyData = {
        code: formData.code,
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        location: formData.location,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        type: formData.type as 'apartment' | 'house' | 'office' | 'commercial',
        status: normalizeStatus(formData.status),
        amenities: selectedAmenities, // Usar amenidades seleccionadas
        images: selectedProperty.images, // Usar imágenes actuales de la propiedad (con orden de portada)
        advisor_id: formData.advisor_id || undefined
      };
      
      const updatedProperty = await updateProperty(selectedProperty.id, propertyData);
      setProperties(prev => prev.map(p => p.id === selectedProperty.id ? updatedProperty : p));
      setShowEditModal(false);
      setSelectedProperty(null);
      resetForm();
      
      console.log('✅ Propiedad actualizada exitosamente');
      showNotification('Propiedad actualizada exitosamente', 'success');
    } catch (error: any) {
      console.error('❌ Error actualizando propiedad:', error);
      const errorMessage = error.message || 'Error al actualizar la propiedad. Por favor, inténtalo de nuevo.';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    console.log('🗑️ ELIMINANDO PROPIEDAD:', propertyId);
    alert(`Eliminando propiedad con ID: ${propertyId}`);
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        console.log('🗑️ Eliminando propiedad:', propertyId);
        await deleteProperty(propertyId);
        
        // Actualizar la lista local
        setProperties(prev => prev.filter(p => p.id !== propertyId));
        
        console.log('✅ Propiedad eliminada exitosamente');
        // Usar una notificación más elegante en lugar de alert
        showNotification('Propiedad eliminada exitosamente', 'success');
      } catch (error: any) {
        console.error('❌ Error eliminando propiedad:', error);
        const errorMessage = error.message || 'Error al eliminar la propiedad. Por favor, inténtalo de nuevo.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  // Función para mostrar notificaciones elegantes
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    // Por ahora usamos alert, pero podríamos implementar un sistema de notificaciones más elegante
    if (type === 'error') {
      alert(`❌ ${message}`);
    } else if (type === 'success') {
      alert(`✅ ${message}`);
    } else {
      alert(`ℹ️ ${message}`);
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
                <option value="available">Disponible</option>
                <option value="sale">En Venta</option>
                <option value="rent">En Arriendo</option>
                <option value="sold">Vendido</option>
                <option value="rented">Arrendado</option>
                <option value="reserved">Reservado</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="pending">Pendiente</option>
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
                    {property.status === 'available' && 'Disponible'}
                    {property.status === 'sale' && 'En Venta'}
                    {property.status === 'rent' && 'En Arriendo'}
                    {property.status === 'sold' && 'Vendido'}
                    {property.status === 'rented' && 'Arrendado'}
                    {property.status === 'reserved' && 'Reservado'}
                    {property.status === 'maintenance' && 'Mantenimiento'}
                    {property.status === 'pending' && 'Pendiente'}
                  </span>
                </div>

                {/* Tenant info if rented */}
                {property.status === 'rented' && tenantMap[String(property.id)] && (
                  <div className="absolute top-14 left-4 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded-md">
                    Inquilino: {tenantMap[String(property.id)]?.full_name || 'N/A'}
                  </div>
                )}

                {/* Featured Badge */}
                {property.featured && (
                  <div className="absolute top-4 right-4">
                    <div className="p-2 bg-yellow-500 rounded-full shadow-lg">
                      <Star className="w-4 h-4 text-white fill-current" />
                    </div>
                  </div>
                )}
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
                  
                  {/* Action Icons - Elegantes y funcionales */}
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewProperty(property);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProperty(property);
                      }}
                      className="p-2 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Editar propiedad"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProperty(property.id);
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200 hover:shadow-md"
                      title="Eliminar propiedad"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>

                    {property.status === 'rented' && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => { e.stopPropagation(); handleReleaseProperty(property.id); }}
                        className="p-2 text-teal-600 hover:bg-teal-100 dark:hover:bg-teal-900/20 rounded-lg transition-all duration-200 hover:shadow-md"
                        title="Liberar propiedad"
                      >
                        <ArrowUp className="w-5 h-5" />
                      </motion.button>
                    )}
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
              {/* Código de Propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏷️ Código de Propiedad
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ej: CA-001 (se genera automáticamente)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Se genera automáticamente si está vacío
                </p>
              </div>

              {/* Código de la Propiedad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏷️ Código de la Propiedad
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="Ej: CA-001 (se genera automáticamente si se deja vacío)"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Si no especificas un código, se generará automáticamente al subir imágenes
                </p>
              </div>

              {/* Título de la Propiedad */}
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
                  { value: 'available', label: '🟢 Disponible', color: 'green' },
                  { value: 'sale', label: '💰 En Venta', color: 'blue' },
                  { value: 'rent', label: '🏠 En Arriendo', color: 'green' },
                  { value: 'sold', label: '✅ Vendido', color: 'gray' },
                  { value: 'rented', label: '🔒 Arrendado', color: 'purple' },
                  { value: 'reserved', label: '📅 Reservado', color: 'yellow' },
                  { value: 'maintenance', label: '🔧 Mantenimiento', color: 'orange' },
                  { value: 'pending', label: '⏳ Pendiente', color: 'red' }
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

            {/* Asesor Asignado */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                👨‍💼 Asesor Asignado
              </label>
              <select
                name="advisor_id"
                value={formData.advisor_id}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">Seleccionar asesor (opcional)</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} - {advisor.specialty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección 3: Amenidades */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-500" />
              Amenidades
            </h3>
            
            {/* Amenidades Seleccionadas */}
            {selectedAmenities.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">Amenidades Seleccionadas ({selectedAmenities.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((amenity, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => toggleAmenity(amenity)}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Amenidades por Categorías */}
            {Object.entries(
              amenitiesList.reduce((acc, amenity) => {
                const category = amenity.category || 'Otros';
                if (!acc[category]) acc[category] = [];
                acc[category].push(amenity);
                return acc;
              }, {} as Record<string, typeof amenitiesList>)
            ).map(([category, amenities]) => (
              <div key={category} className="mb-6">
                <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 px-2 border-l-4 border-blue-500">
                  {category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {amenities.map((amenity, index) => (
                    <div
                      key={`${category}-${index}`}
                      onClick={() => toggleAmenity(amenity.name)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                        selectedAmenities.includes(amenity.name)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <amenity.icon className={`w-6 h-6 mb-2 ${
                          selectedAmenities.includes(amenity.name)
                            ? 'text-blue-600'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} />
                        <span className={`text-xs font-medium leading-tight ${
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
            ))}

            {/* Amenidades Personalizadas */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Amenidad Personalizada
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCustomAmenity}
                  onChange={(e) => setNewCustomAmenity(e.target.value)}
                  placeholder="Ej: Zona BBQ, Salón comunal, etc."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
                />
                <button
                  type="button"
                  onClick={addCustomAmenity}
                  disabled={!newCustomAmenity.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {/* Amenidades Personalizadas Agregadas */}
              {customAmenities.length > 0 && (
                <div className="mt-4">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenidades Personalizadas:</h5>
                  <div className="flex flex-wrap gap-2">
                    {customAmenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeCustomAmenity(amenity)}
                          className="ml-2 text-green-600 hover:text-green-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
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

          {/* Selector de Imagen de Portada - Solo si hay imágenes */}
          {/* TEMPORALMENTE COMENTADO PARA DIAGNÓSTICO */}
          {/* {previewImages.length > 0 && (
            <div className="mb-8">
              <CoverImageSelector
                images={previewImages}
                currentCoverImage={formData.cover_image}
                onSelectCover={(imageUrl) => {
                  setFormData(prev => ({ ...prev, cover_image: imageUrl }));
                }}
                propertyCode={formData.code}
              />
            </div>
          )} */}

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
                            {selectedProperty.status === 'available' && 'Disponible'}
                            {selectedProperty.status === 'sale' && 'En Venta'}
                            {selectedProperty.status === 'rent' && 'En Arriendo'}
                            {selectedProperty.status === 'sold' && 'Vendido'}
                            {selectedProperty.status === 'rented' && 'Arrendado'}
                            {selectedProperty.status === 'reserved' && 'Reservado'}
                            {selectedProperty.status === 'maintenance' && 'Mantenimiento'}
                            {selectedProperty.status === 'pending' && 'Pendiente'}
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
                    {loadingStats ? (
                      <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Vistas</span>
                          <span className="font-medium text-gray-900 dark:text-white">{propertyStats.views}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Consultas</span>
                          <span className="font-medium text-gray-900 dark:text-white">{propertyStats.inquiries}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Citas</span>
                          <span className="font-medium text-gray-900 dark:text-white">{propertyStats.appointments}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actividades Recientes */}
                  {propertyActivities.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Actividades Recientes</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {propertyActivities.slice(0, 5).map((activity, index) => (
                          <div key={index} className="flex justify-between items-start text-sm">
                            <div className="flex-1">
                              <span className="text-gray-600 dark:text-gray-400">
                                {activity.activity_type === 'created' && '📝 Propiedad creada'}
                                {activity.activity_type === 'updated' && '✏️ Propiedad actualizada'}
                                {activity.activity_type === 'deleted' && '🗑️ Propiedad eliminada'}
                                {activity.activity_type === 'status_changed' && '🔄 Estado cambiado'}
                                {activity.activity_type === 'viewed' && '👁️ Vista registrada'}
                                {activity.activity_type === 'inquiry' && '💬 Consulta recibida'}
                                {activity.activity_type === 'appointment' && '📅 Cita programada'}
                              </span>
                              <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                {new Date(activity.created_at).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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
                <option value="available">Disponible</option>
                <option value="sale">En Venta</option>
                <option value="rent">En Arriendo</option>
                <option value="sold">Vendido</option>
                <option value="rented">Arrendado</option>
                <option value="reserved">Reservado</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>

            {/* Asesor Asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                👨‍💼 Asesor Asignado
              </label>
              <select
                name="advisor_id"
                value={formData.advisor_id}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Sin asesor asignado</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} - {advisor.specialty}
                  </option>
                ))}
              </select>
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

            {/* Amenidades - Modal de Edición */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Amenidades
              </h3>
              
              {/* Amenidades Seleccionadas */}
              {selectedAmenities.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">Seleccionadas ({selectedAmenities.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenidades por Categorías - Compacto para modal */}
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(
                  amenitiesList.reduce((acc, amenity) => {
                    const category = amenity.category || 'Otros';
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(amenity);
                    return acc;
                  }, {} as Record<string, typeof amenitiesList>)
                ).map(([category, amenities]) => (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 px-1 border-l-2 border-blue-500">
                      {category}
                    </h4>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {amenities.map((amenity, index) => (
                        <div
                          key={`${category}-${index}`}
                          onClick={() => toggleAmenity(amenity.name)}
                          className={`p-2 border rounded-md cursor-pointer transition-all duration-200 ${
                            selectedAmenities.includes(amenity.name)
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <amenity.icon className={`w-4 h-4 mb-1 ${
                              selectedAmenities.includes(amenity.name)
                                ? 'text-blue-600'
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                            <span className={`text-xs font-medium leading-tight ${
                              selectedAmenities.includes(amenity.name)
                                ? 'text-blue-900 dark:text-blue-100'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {amenity.name}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Amenidades Personalizadas - Modal */}
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2 flex items-center">
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Personalizada
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCustomAmenity}
                    onChange={(e) => setNewCustomAmenity(e.target.value)}
                    placeholder="Nueva amenidad..."
                    className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addCustomAmenity()}
                  />
                  <button
                    type="button"
                    onClick={addCustomAmenity}
                    disabled={!newCustomAmenity.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Gestión de Imágenes Existentes */}
          {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Imágenes Actuales ({selectedProperty.images.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    // Aquí podríamos abrir un modal para subir nuevas imágenes
                    // Por ahora, solo mostramos las existentes
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Más
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedProperty.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400"><span>Imagen no disponible</span></div>';
                          }
                        }}
                      />
                    </div>

                    {/* Indicadores */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-md font-medium flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        Portada
                      </div>
                    )}

                    {/* Número de imagen */}
                    <div className="absolute top-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      #{index + 1}
                    </div>

                    {/* Botón de eliminar */}
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`¿Estás seguro de que quieres eliminar esta imagen?`)) {
                          try {
                            setIsSubmitting(true);

                            // Eliminar imagen usando la función deletePropertyImage
                            await deletePropertyImage(imageUrl);

                            // Actualizar el estado local
                            const newImages = selectedProperty.images.filter(img => img !== imageUrl);
                            setProperties(prev => prev.map(p =>
                              p.id === selectedProperty.id
                                ? { ...p, images: newImages }
                                : p
                            ));

                            // Actualizar selectedProperty
                            setSelectedProperty(prev => prev ? {
                              ...prev,
                              images: newImages
                            } : null);

                            showNotification('Imagen eliminada exitosamente', 'success');
                          } catch (error) {
                            console.error('Error eliminando imagen:', error);
                            showNotification('Error al eliminar la imagen', 'error');
                          } finally {
                            setIsSubmitting(false);
                          }
                        }
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Overlay al hacer hover */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 rounded-lg" />
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 <strong>Consejo:</strong> La primera imagen es la portada. Puedes cambiarla usando el selector abajo.
                  Para eliminar una imagen, pasa el mouse sobre ella y haz clic en el botón rojo.
                </p>
              </div>
            </div>
          )}

          {/* Sección para Agregar Nuevas Imágenes */}
          {selectedProperty && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-green-600" />
                Agregar Nuevas Imágenes
              </h3>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleEditImageUpload}
                  className="hidden"
                  id="edit-image-upload"
                  disabled={uploadingImages}
                />
                <label
                  htmlFor="edit-image-upload"
                  className="cursor-pointer block"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {uploadingImages ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí o haz clic para seleccionar'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Formatos soportados: JPG, PNG, WebP (máximo 5MB por imagen)
                  </p>
                </label>

                {uploadingImages && (
                  <div className="mt-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-blue-600">Subiendo imágenes...</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-700 dark:text-green-300">
                  💡 <strong>Nota:</strong> Las nuevas imágenes se agregarán al final de la lista.
                  Puedes reorganizarlas usando el selector de imagen de portada abajo.
                </p>
              </div>
            </div>
          )}

          {/* Selector de Imagen de Portada */}
          {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
            <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <CoverImageSelector
                images={selectedProperty.images}
                currentCoverImage={selectedProperty.cover_image}
                onSelectCover={async (imageUrl) => {
                  try {
                    setIsSubmitting(true);

                    // Crear un nuevo array con la imagen seleccionada como primera
                    const newImages = [imageUrl, ...selectedProperty.images.filter(img => img !== imageUrl)];

                    // Actualizar usando updateProperty con el nuevo array de imágenes
                    await updateProperty(selectedProperty.id, { images: newImages });

                    // Actualizar la propiedad en el estado local
                    setProperties(prev => prev.map(p =>
                      p.id === selectedProperty.id
                        ? { ...p, images: newImages, cover_image: imageUrl }
                        : p
                    ));

                    // Actualizar selectedProperty
                    setSelectedProperty(prev => prev ? {
                      ...prev,
                      images: newImages,
                      cover_image: imageUrl
                    } : null);

                    // IMPORTANTE: Actualizar también previewImages para mantener sincronización
                    setPreviewImages(newImages);

                    showNotification('Imagen de portada actualizada exitosamente. La imagen seleccionada ahora es la primera en la lista.', 'success');
                  } catch (error) {
                    console.error('Error actualizando imagen de portada:', error);
                    showNotification('Error al actualizar la imagen de portada', 'error');
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                propertyCode={selectedProperty?.code || ''}
              />
            </div>
          )}

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
