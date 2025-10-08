import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePersistedState } from '../hooks/usePersistedState';
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
  Sparkles,
  Film
} from 'lucide-react';
import { createProperty, updateProperty, deleteProperty, deletePropertyImage, getAdvisorById, getAdvisors, getPropertyStats, getPropertyActivity, bulkUploadPropertyImages, generatePropertyCode, getActiveTenantsForProperties, updatePropertyStatus, supabase, getProperties, bulkUploadPropertyVideos, deletePropertyVideo } from '../lib/supabase';
import { Property, Advisor, PropertyVideo } from '../types';
import Modal from '../components/UI/Modal';
import FloatingCard from '../components/UI/FloatingCard';
import ScheduleAppointmentModal from '../components/Modals/ScheduleAppointmentModal';
import ContactModal from '../components/Modals/ContactModal';
import { CoverImageSelector } from '../components/CoverImageSelector';
import VideoPlayer from '../components/VideoPlayer';

function AdminProperties() {
  console.log('🔍 AdminProperties: Iniciando componente');

  const location = useLocation();

  // Estados para propiedades (sin paginación - mostrar todas)
  const [properties, setProperties] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]); // Todas las propiedades sin filtrar
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState(false); // Nuevo filtro para destacadas

  console.log('🔍 AdminProperties: Estados inicializados');
  
  // Estados para modales y ventanas flotantes
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeMediaTab, setActiveMediaTab] = useState<'images' | 'videos'>('images');
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
  
  // Estados para formularios con persistencia en localStorage
  const initialFormData = {
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
    videos: [] as PropertyVideo[],
    cover_image: '',
    cover_video: '',
    featured: false
  };

  const {
    state: formData,
    setState: setFormData,
    clearPersistedState: clearFormDraft,
    hasDraft: hasFormDraft,
    lastSaved: formLastSaved
  } = usePersistedState({
    key: 'admin-property-form-draft',
    initialValue: initialFormData,
    expirationTime: 24 * 60 * 60 * 1000 // 24 horas
  });

  const {
    state: previewImages,
    setState: setPreviewImages,
    clearPersistedState: clearImagesDraft
  } = usePersistedState({
    key: 'admin-property-images-draft',
    initialValue: [] as string[],
    expirationTime: 24 * 60 * 60 * 1000
  });

  const {
    state: selectedAmenities,
    setState: setSelectedAmenities,
    clearPersistedState: clearAmenitiesDraft
  } = usePersistedState({
    key: 'admin-property-amenities-draft',
    initialValue: [] as string[],
    expirationTime: 24 * 60 * 60 * 1000
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para manejo de imágenes
  const [uploadingImages, setUploadingImages] = useState(false);
  const [useWatermark, setUseWatermark] = useState(true); // Estado para marca de agua
  
  // Estados para manejo de videos
  const [selectedVideos, setSelectedVideos] = useState<File[]>([]);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  
  // Estado para mostrar/ocultar alerta de borrador
  const [showDraftAlert, setShowDraftAlert] = useState(false);

  // NO verificamos automáticamente al montar - solo cuando se abre el modal
  // El borrador se restaura automáticamente por usePersistedState
  
  // Estados para amenidades predefinidas

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

  // Aplicar filtros localmente cuando cambian los criterios de búsqueda
  useEffect(() => {
    if (allProperties.length === 0) return;

    console.log('🔍 Aplicando filtros locales...');
    let filtered = [...allProperties];

    // Filtro por búsqueda
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(p => 
        p.title?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower) ||
        p.code?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por destacadas
    if (featuredFilter) {
      filtered = filtered.filter(p => p.featured === true);
    }

    // Filtro por estado
    if (statusFilter && statusFilter !== 'all') {
      if (statusFilter === 'inactive') {
        filtered = filtered.filter(p => 
          p.status === 'maintenance' || p.status === 'pending' || p.status === 'reserved'
        );
      } else {
        filtered = filtered.filter(p => p.status === statusFilter);
      }
    }

    // Filtro por tipo
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === typeFilter);
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      const aVal = a[sortBy as keyof Property];
      const bVal = b[sortBy as keyof Property];

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    console.log(`✅ Propiedades filtradas: ${filtered.length} de ${allProperties.length} totales`);
    setProperties(filtered);
  }, [search, statusFilter, typeFilter, sortBy, sortOrder, allProperties, featuredFilter]);

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
    console.log('🔄 AdminProperties: Cargando TODAS las propiedades (sin límite)');
    setIsLoading(true);

    try {
      // Cargar TODAS las propiedades sin límite de paginación
      const allPropsData = await getProperties(false); // false = traer todas, no solo disponibles
      
      console.log(`✅ Total de propiedades cargadas: ${allPropsData.length}`);
      
      setAllProperties(allPropsData);
      setProperties(allPropsData);

      // Cargar inquilinos activos para estas propiedades
      try {
        const ids = allPropsData.map((p: any) => p.id);
        const tenants = await getActiveTenantsForProperties(ids);
        setTenantMap(tenants);
      } catch (tErr) {
        console.warn('⚠️ No se pudieron cargar inquilinos activos:', tErr);
      }

    } catch (error) {
      console.error('❌ Error cargando propiedades:', error);
      setProperties([]);
      setAllProperties([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProperties = async () => {
    console.log('🔄 AdminProperties: Refrescando TODAS las propiedades');
    await loadProperties();
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
      await refreshProperties();
      const refreshedTenants = await getActiveTenantsForProperties(properties.map((p: any) => p.id));
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

  // Funciones para manejar clics en las tarjetas de estadísticas
  const handleQuickFilter = (filterType: 'all' | 'sale' | 'rent' | 'featured') => {
    // Limpiar otros filtros
    setSearch('');
    setTypeFilter('all');
    
    switch (filterType) {
      case 'all':
        // Mostrar todas las propiedades
        setStatusFilter('all');
        setFeaturedFilter(false);
        console.log('📊 Mostrando todas las propiedades');
        break;
      
      case 'sale':
        // Filtrar solo propiedades en venta
        setStatusFilter('sale');
        setFeaturedFilter(false);
        console.log('🏷️ Filtrando propiedades en venta');
        break;
      
      case 'rent':
        // Filtrar solo propiedades en arriendo
        setStatusFilter('rent');
        setFeaturedFilter(false);
        console.log('🏠 Filtrando propiedades en arriendo');
        break;
      
      case 'featured':
        // Para destacadas, filtrar por featured=true
        setStatusFilter('all');
        setFeaturedFilter(true);
        console.log('⭐ Filtrando propiedades destacadas');
        break;
    }
  };

  // Función para limpiar el formulario y borradores
  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedAmenities([]);
    setCustomAmenities([]);
    setNewCustomAmenity('');
    setPreviewImages([]);
    
    // Limpiar borradores de localStorage
    clearFormDraft();
    clearImagesDraft();
    clearAmenitiesDraft();
    
    console.log('🧹 Formulario y borradores limpiados');
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
        },
        useWatermark // Pasar el estado de marca de agua
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
        },
        useWatermark // Pasar el estado de marca de agua
      );

      // Crear nuevo array de imágenes combinando las existentes con las nuevas
      const newImages = [...selectedProperty.images, ...uploadedUrls];

      // Actualizar la propiedad usando updateProperty
      await updateProperty(selectedProperty.id, { images: newImages });

      // Refrescar datos desde el servidor
      await refreshProperties();

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

  // ==========================================
  // FUNCIONES PARA MANEJO DE VIDEOS
  // ==========================================

  // Función para seleccionar videos
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validVideos = files.filter(file => {
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024;
    });
    
    if (validVideos.length !== files.length) {
      alert('Algunos archivos no son válidos. Solo MP4, WebM y MOV hasta 100MB.');
    }
    
    setSelectedVideos(prev => [...prev, ...validVideos]);
  };

  // Función para subir videos
  const handleUploadVideos = async () => {
    if (selectedVideos.length === 0) return;
    
    let propertyCode = formData.code;
    if (!propertyCode) {
      propertyCode = await generatePropertyCode();
      setFormData(prev => ({ ...prev, code: propertyCode }));
      console.log(`🏷️ Código generado automáticamente: ${propertyCode}`);
    }
    
    setUploadingVideos(true);
    try {
      const uploadedVideos = await bulkUploadPropertyVideos(
        selectedVideos,
        propertyCode,
        (current, total) => {
          const progress = (current / total) * 100;
          setVideoUploadProgress(progress);
        }
      );
      
      // Actualizar formData
      setFormData(prev => ({
        ...prev,
        videos: [...(prev.videos || []), ...uploadedVideos]
      }));
      
      setSelectedVideos([]);
      showNotification(`✅ ${uploadedVideos.length} videos subidos exitosamente`, 'success');
      
    } catch (error) {
      console.error('Error subiendo videos:', error);
      showNotification('Error al subir videos', 'error');
    } finally {
      setUploadingVideos(false);
      setVideoUploadProgress(0);
    }
  };

  // Función para eliminar video
  const handleRemoveVideo = async (videoUrl: string, index: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    try {
      console.log('🗑️ Eliminando video:', videoUrl);
      
      // Eliminar del storage
      await deletePropertyVideo(videoUrl);
      
      // Actualizar estado local
      const newVideos = (formData.videos || []).filter((_, i) => i !== index);
      
      setFormData(prev => ({
        ...prev,
        videos: newVideos
      }));

      // Si estamos editando una propiedad existente, actualizar en BD
      if (selectedProperty) {
        console.log('💾 Actualizando videos en BD...');
        await updateProperty(selectedProperty.id, { videos: newVideos });
        
        // Actualizar selectedProperty también
        setSelectedProperty({
          ...selectedProperty,
          videos: newVideos
        });
        
        // Refrescar lista de propiedades
        await refreshProperties();
      }
      
      showNotification('✅ Video eliminado exitosamente', 'success');
    } catch (error) {
      console.error('❌ Error eliminando video:', error);
      showNotification('Error al eliminar el video', 'error');
    }
  };

  // Función para subir nuevos videos en el modal de edición
  const handleEditVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !selectedProperty) return;

    const validVideos = files.filter(file => {
      const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
      return validTypes.includes(file.type) && file.size <= 100 * 1024 * 1024;
    });

    if (validVideos.length === 0) {
      showNotification('No hay videos válidos para subir', 'error');
      return;
    }

    setUploadingVideos(true);
    try {
      console.log('📤 Subiendo', validVideos.length, 'videos...');
      
      const uploadedVideos = await bulkUploadPropertyVideos(
        validVideos,
        selectedProperty.code || '',
        (current, total) => {
          const progress = (current / total) * 100;
          setVideoUploadProgress(progress);
          console.log(`📊 Progreso: ${progress.toFixed(0)}%`);
        }
      );

      console.log('✅ Videos subidos:', uploadedVideos);

      const newVideos = [...(selectedProperty.videos || []), ...uploadedVideos];

      console.log('💾 Actualizando propiedad en BD...');
      await updateProperty(selectedProperty.id, { videos: newVideos });
      
      console.log('🔄 Refrescando propiedades...');
      await refreshProperties();
      
      // Actualizar selectedProperty con los nuevos videos
      setSelectedProperty({
        ...selectedProperty,
        videos: newVideos
      });

      console.log('✅ Todo completado exitosamente');
      showNotification(`✅ ${uploadedVideos.length} videos agregados exitosamente`, 'success');
      
      // Limpiar el input
      e.target.value = '';
      
    } catch (error) {
      console.error('❌ Error subiendo videos:', error);
      showNotification('Error al subir los videos', 'error');
    } finally {
      setUploadingVideos(false);
      setVideoUploadProgress(0);
    }
  };

  // ==========================================
  // FIN FUNCIONES DE VIDEOS
  // ==========================================


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
      videos: property.videos || [],
      cover_image: property.cover_image || '',
      cover_video: property.cover_video || '',
      featured: property.featured || false
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

  const handleAddProperty = async () => {
    setSelectedProperty(null);
    
    // Verificar si hay un borrador guardado
    const hasDraft = hasFormDraft() && formData.title;
    
    if (hasDraft) {
      // Si hay borrador, solo mostrar el modal (con alerta de restauración)
      setShowDraftAlert(true);
      setShowAddModal(true);
      console.log('📝 Abriendo modal con borrador existente');
    } else {
      // Si no hay borrador, limpiar y abrir
      resetForm();
      
      // 🔢 GENERAR CÓDIGO AUTOMÁTICAMENTE
      try {
        const autoCode = await generatePropertyCode();
        setFormData(prev => ({ ...prev, code: autoCode }));
        console.log('🔢 Código generado automáticamente:', autoCode);
      } catch (error) {
        console.error('❌ Error generando código:', error);
        alert('Error al generar código de propiedad. Por favor, recargue la página.');
      }
      
      setShowAddModal(true);
      console.log('🆕 Abriendo modal con formulario nuevo');
    }
  };

  // Función para cerrar modal sin perder el borrador
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setShowDraftAlert(false);
    // NO limpiamos el formulario - el borrador se mantiene en localStorage
    console.log('💾 Modal cerrado - borrador guardado en localStorage');
  };

  // Función para crear nueva propiedad
  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // ✅ VALIDACIÓN: Asesor obligatorio
    if (!formData.advisor_id || formData.advisor_id.trim() === '') {
      showNotification('⚠️ Debe asignar un asesor a la propiedad', 'error');
      setIsSubmitting(false);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Generar código si no existe
      let propertyCode = formData.code;
      if (!propertyCode) {
        propertyCode = await generatePropertyCode();
      }
      
      // La imagen de portada es la primera del array o la seleccionada manualmente
      const coverImage = formData.cover_image || previewImages[0] || '';
      
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
        images: previewImages, // Usar imágenes de preview (ya ordenadas con portada primero)
        cover_image: coverImage, // ✅ Imagen de portada explícita (columna ya existe en Supabase)
        featured: false,
        advisor_id: formData.advisor_id || undefined
      };
      
      console.log('📤 Creando propiedad con portada:', coverImage);
      
      await createProperty(propertyData);
      await refreshProperties();
      setShowAddModal(false);
      resetForm(); // Esto limpiará los borradores también
      
      console.log('✅ Propiedad creada exitosamente con imagen de portada');
      showNotification('✅ Propiedad creada exitosamente', 'success');
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
    
    // ✅ VALIDACIÓN: Asesor obligatorio
    if (!formData.advisor_id || formData.advisor_id.trim() === '') {
      showNotification('⚠️ Debe asignar un asesor a la propiedad', 'error');
      setIsSubmitting(false);
      return;
    }
    
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
        advisor_id: formData.advisor_id || undefined,
        featured: formData.featured || false // Incluir estado destacado
      };
      
      await updateProperty(selectedProperty.id, propertyData);
      await refreshProperties();
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

  // Función para alternar el estado destacado de una propiedad
  const handleToggleFeatured = async (property: Property) => {
    try {
      const newFeaturedState = !property.featured;
      
      await updateProperty(property.id, {
        ...property,
        featured: newFeaturedState
      });
      
      await refreshProperties();
      
      const message = newFeaturedState 
        ? '⭐ Propiedad marcada como destacada' 
        : '✅ Propiedad desmarcada como destacada';
      
      showNotification(message, 'success');
      console.log(`✅ Estado destacado actualizado: ${newFeaturedState}`);
    } catch (error: any) {
      console.error('❌ Error actualizando estado destacado:', error);
      showNotification('Error al actualizar el estado destacado', 'error');
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    console.log('🗑️ ELIMINANDO PROPIEDAD:', propertyId);
    alert(`Eliminando propiedad con ID: ${propertyId}`);
    if (window.confirm('¿Estás seguro de que quieres eliminar esta propiedad?')) {
      try {
        console.log('🗑️ Eliminando propiedad:', propertyId);
        await deleteProperty(propertyId);
        
        // Refrescar datos desde el servidor
        await refreshProperties();
        
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

  if (isLoading) {
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
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFilter('all')}
          className="cursor-pointer"
        >
          <FloatingCard glowEffect className={`p-6 transition-all duration-200 ${
            statusFilter === 'all' && !featuredFilter 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : ''
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Propiedades</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{allProperties.length}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {properties.length !== allProperties.length 
                    ? `Mostrando ${properties.length} filtradas` 
                    : 'Todas las propiedades'}
                </p>
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
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFilter('sale')}
          className="cursor-pointer"
        >
          <FloatingCard glowEffect className={`p-6 transition-all duration-200 ${
            statusFilter === 'sale' && !featuredFilter 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : ''
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Venta</p>
                <p className="text-3xl font-bold text-blue-600">
                  {allProperties.filter(p => p.status === 'sale').length}
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
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFilter('rent')}
          className="cursor-pointer"
        >
          <FloatingCard glowEffect className={`p-6 transition-all duration-200 ${
            statusFilter === 'rent' && !featuredFilter 
              ? 'ring-2 ring-green-500 shadow-lg' 
              : ''
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Arriendo</p>
                <p className="text-3xl font-bold text-green-600">
                  {allProperties.filter(p => p.status === 'rent').length}
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
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickFilter('featured')}
          className="cursor-pointer"
        >
          <FloatingCard glowEffect className={`p-6 transition-all duration-200 ${
            featuredFilter 
              ? 'ring-2 ring-purple-500 shadow-lg' 
              : ''
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Destacadas</p>
                <p className="text-3xl font-bold text-purple-600">
                  {allProperties.filter(p => p.featured).length}
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
                placeholder="🔍 Buscar por código, título o ubicación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                <option value="apartaestudio">Apartaestudio</option>
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
        {properties.map((property, index) => (
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
                    {property.type === 'apartaestudio' && 'Apartaestudio'}
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
                        handleToggleFeatured(property);
                      }}
                      className={`p-2 rounded-lg transition-all duration-200 hover:shadow-md ${
                        property.featured
                          ? 'text-purple-600 bg-purple-100 dark:bg-purple-900/30'
                          : 'text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600'
                      }`}
                      title={property.featured ? 'Quitar destacado' : 'Marcar como destacada'}
                    >
                      <Star className={`w-5 h-5 ${property.featured ? 'fill-purple-600' : ''}`} />
                    </motion.button>
                    
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

      {properties.length === 0 && !isLoading && (
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

      {/* Información de resultados */}
      {properties.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Mostrando {properties.length} de {allProperties.length} propiedades totales
        </div>
      )}

      {/* Modales */}
      
      {/* Modal para agregar nueva propiedad */}
      <Modal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        title="Nueva Propiedad"
        size="full"
      >
        <form onSubmit={handleCreateProperty} className="p-6 max-h-[80vh] overflow-y-auto">
          {/* Alerta de borrador guardado */}
          {showDraftAlert && formData.title && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      📝 Borrador Restaurado
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Se ha restaurado un borrador guardado automáticamente.
                      {formLastSaved && (
                        <span className="block text-xs text-blue-600 dark:text-blue-400 mt-1">
                          Último guardado: {formLastSaved.toLocaleString()}
                        </span>
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setShowDraftAlert(false);
                      }}
                      className="mt-2 text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 underline"
                    >
                      Descartar borrador y empezar de nuevo
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDraftAlert(false)}
                  className="flex-shrink-0 ml-3 text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Indicador de auto-guardado */}
          {formData.title && formLastSaved && (
            <div className="mb-4 flex items-center justify-end text-xs text-gray-500 dark:text-gray-400">
              <Check className="w-3 h-3 mr-1 text-green-500" />
              <span>Borrador guardado automáticamente</span>
            </div>
          )}

          {/* Sección 1: Información Básica */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Home className="w-5 h-5 mr-2 text-blue-600" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Código de Propiedad (Auto-generado, Solo Lectura) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔢 Código de Propiedad
                  <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs rounded-full">
                    Auto-generado
                  </span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white cursor-not-allowed font-mono"
                  placeholder="Generando código..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  ✅ El código se genera automáticamente y no puede editarse
                </p>
              </div>

              {/* Título de la Propiedad */}
              <div>
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
                  <option value="apartaestudio">🏠 Apartaestudio</option>
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
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
                  Obligatorio
                </span>
              </label>
              <select
                name="advisor_id"
                value={formData.advisor_id}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
              >
                <option value="">⚠️ Seleccionar asesor (obligatorio)</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} - {advisor.specialty}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                ⚠️ Debe asignar un asesor antes de guardar la propiedad
              </p>
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
            
            {/* Checkbox para marca de agua */}
            <div className="mb-4 flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <input
                type="checkbox"
                id="use-watermark"
                checked={useWatermark}
                onChange={(e) => setUseWatermark(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="use-watermark" className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                <span className="text-lg">🎨</span>
                Agregar marca de agua automáticamente a las imágenes
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                  useWatermark 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {useWatermark ? 'ACTIVADO' : 'DESACTIVADO'}
                </span>
              </label>
            </div>
            
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

          {/* Sección 4.5: Videos de la Propiedad */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-purple-600" />
              Videos de la Propiedad
            </h3>

            {/* Área de carga de videos */}
            <div className="mb-6">
              <div className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  id="video-upload"
                  multiple
                  accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                  onChange={handleVideoSelect}
                  className="hidden"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-purple-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Arrastra videos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Formatos soportados: MP4, WebM, MOV, AVI (máximo 100MB por video)
                  </p>
                </label>
              </div>
            </div>

            {/* Videos seleccionados para subir */}
            {selectedVideos.length > 0 && (
              <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-3 font-medium">
                  {selectedVideos.length} video(s) seleccionado(s) - Tamaño total: {(selectedVideos.reduce((acc, v) => acc + v.size, 0) / 1024 / 1024).toFixed(2)} MB
                </p>
                <div className="space-y-2 mb-3">
                  {selectedVideos.map((video, index) => (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{video.name}</span>
                      <span className="text-xs text-gray-500 ml-2">{(video.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUploadVideos}
                  disabled={uploadingVideos}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploadingVideos ? `Subiendo... ${videoUploadProgress.toFixed(0)}%` : 'Subir Videos'}
                </button>
              </div>
            )}

            {/* Grid de videos existentes */}
            {formData.videos && formData.videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.videos.map((video, index) => (
                  <div key={index} className="relative group">
                    <VideoPlayer
                      src={video.url}
                      thumbnail={video.thumbnail}
                      title={video.title}
                      className="h-48 rounded-lg overflow-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveVideo(video.url, index)}
                      className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {video.duration && (
                      <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!formData.videos || formData.videos.length === 0 && selectedVideos.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No hay videos agregados</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Los videos son opcionales pero ayudan a mostrar mejor la propiedad</p>
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
          {previewImages.length > 0 && (
            <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <CoverImageSelector
                images={previewImages}
                currentCoverImage={formData.cover_image || previewImages[0]}
                onSelectCover={(imageUrl) => {
                  console.log('🖼️ Seleccionando imagen de portada:', imageUrl);
                  
                  // Actualizar el formData con la nueva portada
                  setFormData(prev => ({ ...prev, cover_image: imageUrl }));
                  
                  // Reorganizar previewImages para que la seleccionada sea la primera
                  const newImagesOrder = [imageUrl, ...previewImages.filter(img => img !== imageUrl)];
                  setPreviewImages(newImagesOrder);
                  
                  console.log('✅ Imagen de portada actualizada en el formulario');
                }}
                propertyCode={formData.code}
              />
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || uploadingImages}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
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
              {/* Galería de Imágenes y Videos - Columna Principal */}
              <div className="lg:col-span-2">
                <div className="mb-6">
                  {/* Tabs para Fotos y Videos */}
                  <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setActiveMediaTab('images')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                        activeMediaTab === 'images'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                      <span>Fotos ({selectedProperty.images?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => setActiveMediaTab('videos')}
                      className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                        activeMediaTab === 'videos'
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Film className="w-4 h-4" />
                      <span>Videos ({selectedProperty.videos?.length || 0})</span>
                    </button>
                  </div>

                  {/* Contenido de Tab de Imágenes */}
                  {activeMediaTab === 'images' && (
                    <>
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
                    </>
                  )}

                  {/* Contenido de Tab de Videos */}
                  {activeMediaTab === 'videos' && (
                    <div className="space-y-4">
                      {selectedProperty.videos && selectedProperty.videos.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedProperty.videos.map((video, index) => (
                            <div key={index} className="space-y-2">
                              <VideoPlayer
                                src={video.url}
                                thumbnail={video.thumbnail}
                                className="w-full rounded-lg"
                              />
                              {video.duration && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Duración: {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, '0')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl flex flex-col items-center justify-center">
                          <Film className="w-16 h-16 text-gray-400 mb-2" />
                          <span className="text-gray-500">No hay videos disponibles</span>
                        </div>
                      )}
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
                <option value="apartaestudio">Apartaestudio</option>
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

            {/* Propiedad Destacada */}
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-700">
              <input
                type="checkbox"
                id="featured-edit"
                name="featured"
                checked={formData.featured || false}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="featured-edit" className="flex items-center cursor-pointer">
                <Star className="w-5 h-5 text-purple-600 mr-2" />
                <div>
                  <span className="block text-sm font-medium text-gray-900 dark:text-white">
                    Marcar como Destacada
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-gray-400">
                    Aparecerá en la sección Premium
                  </span>
                </div>
              </label>
            </div>

            {/* Asesor Asignado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                👨‍💼 Asesor Asignado
                <span className="text-red-500 ml-1">*</span>
                <span className="ml-2 px-2 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 text-xs rounded-full">
                  Obligatorio
                </span>
              </label>
              <select
                name="advisor_id"
                value={formData.advisor_id}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">⚠️ Seleccionar asesor (obligatorio)</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name} - {advisor.specialty}
                  </option>
                ))}
              </select>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                ⚠️ Debe asignar un asesor antes de guardar los cambios
              </p>
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
                    document.getElementById('edit-image-upload')?.click();
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

                            // Refrescar datos desde el servidor
                            await refreshProperties();

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

          {/* Sección para Videos */}
          {selectedProperty && (
            <div className="mt-6 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-purple-600" />
                  Videos de la Propiedad ({selectedProperty.videos?.length || 0})
                </h3>
                <label className="cursor-pointer px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Agregar Videos
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
                    multiple
                    onChange={handleEditVideoUpload}
                    className="hidden"
                    disabled={uploadingVideos}
                  />
                </label>
              </div>

              {/* Grid de videos existentes */}
              {selectedProperty.videos && selectedProperty.videos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedProperty.videos.map((video, index) => (
                    <div key={index} className="relative group">
                      <VideoPlayer
                        src={video.url}
                        thumbnail={video.thumbnail}
                        title={video.title}
                        className="h-48 rounded-lg overflow-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(video.url, index)}
                        className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {video.duration && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {uploadingVideos && (
                <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    <span className="ml-2 text-purple-600">Subiendo videos... {videoUploadProgress.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {!selectedProperty.videos || selectedProperty.videos.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-xl bg-purple-50/30 dark:bg-purple-900/10">
                  <Camera className="h-12 w-12 text-purple-400 mx-auto mb-3" />
                  <p className="text-purple-600 dark:text-purple-400 font-medium">
                    No hay videos agregados aún
                  </p>
                  <p className="text-sm text-purple-500 dark:text-purple-500 mt-1">
                    Usa el botón "Agregar Videos" para subir videos de la propiedad
                  </p>
                </div>
              )}

              <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  💡 <strong>Formatos permitidos:</strong> MP4, WebM, MOV, AVI (máximo 100MB por video)
                </p>
              </div>
            </div>
          )}

          {/* Selector de Imagen de Portada */}
          {selectedProperty && selectedProperty.images && selectedProperty.images.length > 0 && (
            <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <CoverImageSelector
                images={selectedProperty.images}
                currentCoverImage={selectedProperty.cover_image || selectedProperty.images[0]} // Usar cover_image si existe
                onSelectCover={async (imageUrl) => {
                  try {
                    setIsSubmitting(true);
                    console.log('🖼️ Actualizando imagen de portada a:', imageUrl);

                    // Crear un nuevo array con la imagen seleccionada como primera
                    const newImages = [imageUrl, ...selectedProperty.images.filter(img => img !== imageUrl)];
                    console.log('📋 Nuevo orden de imágenes:', newImages);

                    // ✅ Actualizar en la base de datos (columna cover_image ya existe)
                    await updateProperty(selectedProperty.id, { 
                      images: newImages,
                      cover_image: imageUrl // ✅ Actualizar cover_image explícitamente
                    });

                    // Actualizar el estado local inmediatamente
                    setSelectedProperty({
                      ...selectedProperty,
                      images: newImages,
                      cover_image: imageUrl // ✅ Actualizar también en estado local
                    });

                    // Refrescar todos los datos desde el servidor
                    await refreshProperties();

                    console.log('✅ Imagen de portada actualizada exitosamente');
                    showNotification('✅ Imagen de portada actualizada. La imagen seleccionada ahora es la primera.', 'success');
                  } catch (error) {
                    console.error('❌ Error actualizando imagen de portada:', error);
                    showNotification('❌ Error al actualizar la imagen de portada', 'error');
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
