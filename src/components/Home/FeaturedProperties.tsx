import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Property } from '../../types';
import { getFeaturedProperties, isAdmin, getAdvisorById } from '../../lib/supabase';
import { advisors } from '../../data/advisors';
import PropertyCard from '../Properties/PropertyCard';
import Button from '../UI/Button';
import PropertyDetailsModal from '../Modals/PropertyDetailsModal';
import ContactModal from '../Modals/ContactModal';

const FeaturedProperties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);

  useEffect(() => {
    loadFeaturedProperties();
    setIsUserAdmin(isAdmin());
  }, []);

  const loadFeaturedProperties = async () => {
    try {
      setLoading(true);
      console.log('🏠 Cargando propiedades destacadas...');
      
      const data = await getFeaturedProperties();
      
      if (data && data.length > 0) {
        console.log('✅ Propiedades destacadas cargadas:', data.length);
        setProperties(data);
      } else {
        console.log('📭 No hay propiedades destacadas, usando datos de ejemplo');
        // Mock data if no properties in database
        const mockProperties: Property[] = [
          {
            id: 1,
            title: 'Apartamento Moderno en El Poblado',
            location: 'El Poblado, Medellín',
            price: 450000000,
            bedrooms: 3,
            bathrooms: 2,
            area: 120,
            type: 'apartment',
            status: 'sale',
            images: [
              'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg',
              'https://images.pexels.com/photos/2029667/pexels-photo-2029667.jpeg'
            ],
            amenities: ['Piscina', 'Gimnasio', 'Parqueadero', 'Balcón'],
            featured: true,
            description: 'Hermoso apartamento con vista panorámica de la ciudad.',
            latitude: 6.2077,
            longitude: -75.5636,
            advisor_id: advisors[0].id
          },
          {
            id: 2,
            title: 'Casa Familiar en Envigado',
            location: 'Envigado, Antioquia',
            price: 2500000,
            bedrooms: 4,
            bathrooms: 3,
            area: 180,
            type: 'house',
            status: 'rent',
            images: [
              'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
              'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg'
            ],
            amenities: ['Jardín', 'Garaje', 'Terraza', 'Zona BBQ'],
            featured: true,
            description: 'Amplia casa familiar en zona residencial exclusiva.',
            latitude: 6.1629,
            longitude: -75.5890,
            advisor_id: advisors[1].id
          },
          {
            id: 3,
            title: 'Oficina Ejecutiva Centro',
            location: 'Centro, Medellín',
            price: 350000000,
            bedrooms: 0,
            bathrooms: 2,
            area: 85,
            type: 'office',
            status: 'sale',
            images: [
              'https://images.pexels.com/photos/2883049/pexels-photo-2883049.jpeg'
            ],
            amenities: ['Aire acondicionado', 'Recepción', 'Sala de juntas'],
            featured: true,
            description: 'Oficina moderna en el corazón financiero de la ciudad.',
            latitude: 6.2518,
            longitude: -75.5636,
            advisor_id: advisors[0].id
          }
        ];
        
        setProperties(mockProperties);
      }
    } catch (error) {
      console.error('❌ Error cargando propiedades destacadas:', error);
      
      // En caso de error, mostrar datos mock para evitar página en blanco
      const fallbackProperties: Property[] = [
        {
          id: 999,
          title: 'Apartamento Moderno en El Poblado',
          location: 'El Poblado, Medellín',
          price: 450000000,
          bedrooms: 3,
          bathrooms: 2,
          area: 120,
          type: 'apartment',
          status: 'sale',
          images: [
            'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg'
          ],
          amenities: ['Piscina', 'Gimnasio', 'Parqueadero'],
          featured: true,
          description: 'Hermoso apartamento con vista panorámica.',
          latitude: 6.2077,
          longitude: -75.5636,
          advisor_id: advisors[0]?.id || 'advisor-1'
        }
      ];
      setProperties(fallbackProperties);
    } finally {
      setLoading(false);
    }
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

          console.log('📱 Abriendo WhatsApp desde FeaturedProperties (iOS/Safari compatible)');

          // 🎯 PASO 3: Abrir WhatsApp con método compatible iOS/Safari
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
          const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

          if (isIOS || isSafari) {
            // iOS/Safari: usar link directo (más confiable)
            const link = document.createElement('a');
            link.href = whatsappUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            
            setTimeout(() => {
              if (document.body.contains(link)) {
                document.body.removeChild(link);
              }
            }, 1000);
          } else {
            // Otros navegadores: window.open
            const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
            
            // Fallback si popup bloqueado
            if (!newWindow) {
              window.location.href = whatsappUrl;
            }
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

  const handleSchedule = (property: Property) => {
    // For now, redirect to contact with the property
    handleContact(property);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96 animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.h2 
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Propiedades Destacadas
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Descubre las mejores oportunidades inmobiliarias seleccionadas especialmente para ti
            </motion.p>
          </motion.div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {properties.slice(0, 6).map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="cursor-pointer"
              >
                <PropertyCard
                  property={property}
                  onViewDetails={handleViewDetails}
                  onContact={handleContact}
                  onSchedule={handleSchedule}
                  showAdminActions={isUserAdmin}
                />
              </motion.div>
            ))}
          </div>

          {/* View All CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => navigate('/properties')}
                variant="primary"
                icon={Eye}
                iconPosition="right"
                size="lg"
              >
                Ver Todas las Propiedades
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

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

export default FeaturedProperties;