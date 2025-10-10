import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Grid } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { Property } from '../types';
import { getProperties, getAdvisorById } from '../lib/supabase';
import { diagnosticImageUrls, testMultipleUrls } from '../lib/diagnostics';
import { advisors } from '../data/advisors';
import PropertyCard from '../components/Properties/PropertyCard';
import PropertyFilters from '../components/Properties/PropertyFilters';
import PropertyDetailsModal from '../components/Modals/PropertyDetailsModal';
import ContactModal from '../components/Modals/ContactModal';
import ScheduleAppointmentModalEnhanced from '../components/Modals/ScheduleAppointmentModalEnhanced';
import Button from '../components/UI/Button';

interface FilterState {
  search: string;
  zone: string;
  neighborhood: string;
  type: string;
  transactionType: string;
  status: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  featured: boolean;
}

const Properties: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState(advisors[0]);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesPerPage = 15; // 15 propiedades por página

  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get('search') || '',
    zone: searchParams.get('zone') || '',
    neighborhood: searchParams.get('neighborhood') || '',
    type: searchParams.get('type') || '',
    transactionType: searchParams.get('transaction') || '',
    status: '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: '',
    bathrooms: '',
    featured: false,
  });

  useEffect(() => {
    loadProperties();
    
    // Ejecutar diagnóstico en desarrollo
    if (import.meta.env.DEV) {
      diagnosticImageUrls();
      
      // Probar algunas URLs del bucket correcto
      const testUrls = [
        'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/CA-001/CA-001-(1).jpeg',
        'https://gfczfjpyyyyvteyrvhgt.supabase.co/storage/v1/object/public/property-images/CA-004/CA-004-(1).jpeg'
      ];
      testMultipleUrls(testUrls);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [properties, filters]);

  const loadProperties = async () => {
    try {
      console.log('🔄 Iniciando carga de propiedades...');
      setLoading(true);
      
      // true = Solo propiedades disponibles para la página pública (rent, sale, available)
      const data = await getProperties(true);
      console.log('📊 Total propiedades recibidas:', data?.length || 0);
      
      if (!data || data.length === 0) {
        console.warn('⚠️ No se recibieron propiedades de la base de datos');
        setProperties([]);
        return;
      }
      
      // Log de muestra para ver qué datos están llegando
      console.log('🔍 Muestra de datos de la primera propiedad:', {
        id: data[0].id,
        title: data[0].title,
        images: data[0].images,
        price: data[0].price,
        type: data[0].type,
        status: data[0].status
      });

      // Validar y mapear propiedades
      const mapped = (data || []).map((property: any, index: number) => {
        try {
          // Validación de campos requeridos
          if (!property.id || !property.title) {
            console.warn(`⚠️ Propiedad ${index} tiene campos faltantes:`, property);
            return null;
          }

          let images: string[] = [];
          
          // El campo correcto es 'images', no 'imágenes'
          if (Array.isArray(property.images)) {
            // Si es un array de objetos con url, extraer las URLs
            if (property.images.length > 0 && typeof property.images[0] === 'object' && property.images[0] !== null) {
              images = property.images
                .map((img: any) => {
                  if (typeof img === 'object' && img.url) {
                    return img.url;
                  }
                  return null;
                })
                .filter(Boolean);
            } else {
              // Si ya es un array de strings
              images = property.images.filter((url: any) => typeof url === 'string' && url.length > 0);
            }
          } else if (typeof property.images === 'string') {
            // Si es un string JSON, parsearlo
            try {
              const parsed = JSON.parse(property.images);
              if (Array.isArray(parsed)) {
                images = parsed.filter((url: any) => typeof url === 'string' && url.length > 0);
              }
            } catch (e) {
              console.warn(`⚠️ Error parseando imágenes de propiedad ${property.id}:`, e);
            }
          }
          
          // Validar que las URLs de imágenes sean válidas
          images = images.filter(url => {
            try {
              new URL(url);
              return true;
            } catch {
              console.warn(`⚠️ URL de imagen inválida en propiedad ${property.id}:`, url);
              return false;
            }
          });

          // Asignar asesor aleatorio si no tiene uno asignado
          let advisor_id = property.advisor_id;
          if (!advisor_id && advisors.length > 0) {
            advisor_id = advisors[Math.floor(Math.random() * advisors.length)].id;
          }
          
          // Validar y formatear precio
          const price = typeof property.price === 'number' ? property.price : parseFloat(property.price) || 0;
          
          return {
            ...property,
            images,
            advisor_id,
            price,
            bedrooms: parseInt(property.bedrooms) || 0,
            bathrooms: parseInt(property.bathrooms) || 0,
            featured: Boolean(property.featured)
          };
        } catch (error) {
          console.error(`❌ Error procesando propiedad ${index}:`, error, property);
          return null;
        }
      }).filter(Boolean); // Remover propiedades nulas

      console.log(`✅ Propiedades procesadas exitosamente: ${mapped.length} de ${data.length}`);
      setProperties(mapped);
      
    } catch (error) {
      console.error('❌ Error loading properties:', error);
      
      // Mostrar mensaje de error más específico
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      
      // En caso de error, mantener propiedades vacías
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    try {
      console.log('🔍 Aplicando filtros:', {
        totalProperties: properties.length,
        activeFilters: Object.entries(filters).filter(([key, value]) => {
          if (key === 'search') return value !== '';
          if (key === 'featured') return value === true;
          return value !== '';
        }),
        currentFilters: filters
      });

      if (!Array.isArray(properties)) {
        console.warn('⚠️ Properties no es un array válido:', properties);
        setFilteredProperties([]);
        return;
      }

      let filtered = [...properties];

      // Search filter - buscar en título, ubicación, tipo y código
      if (filters.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        filtered = filtered.filter(property => {
          if (!property) return false;
          
          const title = property.title?.toLowerCase() || '';
          const location = property.location?.toLowerCase() || '';
          const type = property.type?.toLowerCase() || '';
          const code = property.code?.toLowerCase() || '';
          
          return title.includes(searchLower) || 
                 location.includes(searchLower) || 
                 type.includes(searchLower) ||
                 code.includes(searchLower);
        });
      }

      // Zone filter
      if (filters.zone && filters.zone.trim()) {
        filtered = filtered.filter(property =>
          property && property.location && property.location.toLowerCase().includes(filters.zone.toLowerCase())
        );
      }      // Neighborhood filter
      if (filters.neighborhood && filters.neighborhood.trim()) {
        filtered = filtered.filter(property => 
          property && property.location && property.location.toLowerCase().includes(filters.neighborhood.toLowerCase())
        );
      }

      // Type filter
      if (filters.type && filters.type.trim()) {
        filtered = filtered.filter(property => 
          property && property.type && property.type === filters.type
        );
      }

      // Transaction Type filter
      if (filters.transactionType && filters.transactionType.trim()) {
        filtered = filtered.filter(property => 
          property && property.status && 
          ((filters.transactionType === 'Arriendo' && property.status === 'rent') ||
           (filters.transactionType === 'Venta' && property.status === 'sale'))
        );
      }

      // Status filter
      if (filters.status && filters.status.trim()) {
        filtered = filtered.filter(property => 
          property && property.status && property.status === filters.status
        );
      }

      // Price filters - validar que sean números válidos
      if (filters.minPrice && filters.minPrice.trim()) {
        const minPrice = parseFloat(filters.minPrice);
        if (!isNaN(minPrice)) {
          filtered = filtered.filter(property => 
            property && typeof property.price === 'number' && property.price >= minPrice
          );
        }
      }
      
      if (filters.maxPrice && filters.maxPrice.trim()) {
        const maxPrice = parseFloat(filters.maxPrice);
        if (!isNaN(maxPrice)) {
          filtered = filtered.filter(property => 
            property && typeof property.price === 'number' && property.price <= maxPrice
          );
        }
      }

      // Bedrooms filter - validar que sea número válido
      if (filters.bedrooms && filters.bedrooms.trim()) {
        const bedrooms = parseInt(filters.bedrooms);
        if (!isNaN(bedrooms)) {
          filtered = filtered.filter(property => 
            property && typeof property.bedrooms === 'number' && property.bedrooms >= bedrooms
          );
        }
      }

      // Bathrooms filter - validar que sea número válido
      if (filters.bathrooms && filters.bathrooms.trim()) {
        const bathrooms = parseInt(filters.bathrooms);
        if (!isNaN(bathrooms)) {
          filtered = filtered.filter(property => 
            property && typeof property.bathrooms === 'number' && property.bathrooms >= bathrooms
          );
        }
      }

      // Featured filter
      if (filters.featured) {
        filtered = filtered.filter(property => 
          property && property.featured === true
        );
      }

      console.log('✅ Filtros aplicados exitosamente:', {
        originalCount: properties.length,
        filteredCount: filtered.length,
        sampleFiltered: filtered.slice(0, 3).map(p => ({ 
          id: p.id, 
          title: p.title, 
          price: p.price,
          type: p.type,
          status: p.status
        }))
      });

      setFilteredProperties(filtered);
      setCurrentPage(1); // Resetear a la página 1 cuando cambian los filtros
      
    } catch (error) {
      console.error('❌ Error aplicando filtros:', error);
      // En caso de error, mostrar todas las propiedades
      setFilteredProperties(properties);
    }
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      zone: '',
      neighborhood: '',
      type: '',
      transactionType: '',
      status: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      featured: false,
    });
  };

  const handleViewDetails = (property: Property) => {
    setSelectedProperty(property);
    setIsDetailsModalOpen(true);
  };

  const handleContact = async (property: Property) => {
    // Obtener el asesor asignado a la propiedad
    if (property.advisor_id) {
      try {
        // 🎯 PASO 1: Obtener asesor
        const advisor = await getAdvisorById(property.advisor_id);
        
        if (advisor && advisor.whatsapp) {
          // 🎯 PASO 2: Crear mensaje personalizado para WhatsApp
          const message = `Hola, estoy interesado en la propiedad *${property.title}* (${property.code || `ID: ${property.id}`}) ubicada en ${property.location || 'ubicación no especificada'}. ¿Podrías darme más información?`;
          const encodedMessage = encodeURIComponent(message);
          const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
          const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

          console.log('📱 Abriendo WhatsApp en nueva ventana/app');

          // 🎯 PASO 3: Abrir WhatsApp SIEMPRE en nueva ventana (nunca en la misma página)
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

          if (isIOS || isSafari) {
            // iOS/Safari: usar link temporal con target _blank
            const link = document.createElement('a');
            link.href = whatsappUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            // Desktop/Android: window.open en nueva pestaña
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          }
          
          return;
        }
      } catch (error) {
        console.error('Error al obtener asesor:', error);
      }
    }
    
    // Si no tiene asesor o hubo un error, abrir el modal de contacto como fallback
    console.log('No se pudo redirigir a WhatsApp, abriendo modal de contacto');
    setSelectedProperty(property);
    setIsContactModalOpen(true);
  };

  const handleSchedule = async (property: Property) => {
    setSelectedProperty(property);
    
    // Si la propiedad tiene un asesor asignado, obtenerlo
    if (property.advisor_id) {
      try {
        const advisor = await getAdvisorById(property.advisor_id);
        if (advisor) {
          setSelectedAdvisor(advisor);
        }
      } catch (error) {
        console.error('Error al obtener asesor:', error);
      }
    } else {
      // Asignar un asesor aleatorio
      setSelectedAdvisor(advisors[Math.floor(Math.random() * advisors.length)]);
    }
    
    setIsScheduleModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Nuestras Propiedades
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Encuentra la propiedad perfecta para ti
            </p>
          </motion.div>

          {/* Filters */}
          <PropertyFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={clearFilters}
          />

          {/* View Toggle - Removed: Solo mostramos vista de lista */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredProperties.length} propiedades encontradas
              </span>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl h-96 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {(() => {
                  // Calcular índices de paginación
                  const indexOfLastProperty = currentPage * propertiesPerPage;
                  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
                  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);

                  return currentProperties.map((property, index) => (
                    <motion.div
                      key={property.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <PropertyCard
                        property={property}
                        onViewDetails={handleViewDetails}
                        onContact={handleContact}
                        onSchedule={handleSchedule}
                        showAdminActions={false}
                      />
                    </motion.div>
                  ));
                })()}
              </motion.div>

              {/* Controles de Paginación */}
              {filteredProperties.length > propertiesPerPage && (
                <div className="mt-12 flex flex-col items-center gap-6">
                  {/* Información de página */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Mostrando {Math.min((currentPage - 1) * propertiesPerPage + 1, filteredProperties.length)} - {Math.min(currentPage * propertiesPerPage, filteredProperties.length)} de {filteredProperties.length} propiedades
                  </div>

                  {/* Botones de paginación */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform ${
                        currentPage === 1
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'text-white hover:scale-105 hover:shadow-lg active:scale-95'
                      }`}
                      style={currentPage !== 1 ? { backgroundColor: '#40534C' } : {}}
                    >
                      Anterior
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {(() => {
                        const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
                        const pageNumbers = [];
                        const maxPagesToShow = 5;

                        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
                        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

                        if (endPage - startPage < maxPagesToShow - 1) {
                          startPage = Math.max(1, endPage - maxPagesToShow + 1);
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pageNumbers.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform ${
                                currentPage === i
                                  ? 'text-white scale-110 shadow-lg'
                                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 hover:scale-105 active:scale-95'
                              }`}
                              style={currentPage === i ? { backgroundColor: '#40534C' } : {}}
                            >
                              {i}
                            </button>
                          );
                        }

                        return pageNumbers;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredProperties.length / propertiesPerPage)))}
                      disabled={currentPage >= Math.ceil(filteredProperties.length / propertiesPerPage)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform ${
                        currentPage >= Math.ceil(filteredProperties.length / propertiesPerPage)
                          ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'text-white hover:scale-105 hover:shadow-lg active:scale-95'
                      }`}
                      style={currentPage < Math.ceil(filteredProperties.length / propertiesPerPage) ? { backgroundColor: '#40534C' } : {}}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && filteredProperties.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Grid className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No se encontraron propiedades
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Intenta ajustar tus filtros de búsqueda
              </p>
              <Button onClick={clearFilters} variant="primary">
                Limpiar Filtros
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modales */}
      {selectedProperty && selectedAdvisor && (
        <ScheduleAppointmentModalEnhanced
          property={selectedProperty}
          advisor={selectedAdvisor}
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
        />
      )}

      {/* Modals */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedProperty(null);
        }}
      />

      <ContactModal
        property={selectedProperty}
        isOpen={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setSelectedProperty(null);
        }}
      />
    </>
  );
};

export default Properties;