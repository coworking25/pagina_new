import React, { useState, useEffect } from 'react';
import { Property, Advisor } from '../types';
import ScheduleAppointmentModalEnhanced from '../components/Modals/ScheduleAppointmentModalEnhanced';
import Button from '../components/UI/Button';
import { Calendar } from 'lucide-react';
import { getProperties } from '../lib/supabase';
import { advisors } from '../data/advisors';

const TestAppointmentPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const propertiesData = await getProperties();
        setProperties(propertiesData);
        
        // Seleccionar la primera propiedad para pruebas
        if (propertiesData && propertiesData.length > 0) {
          setSelectedProperty(propertiesData[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  if (!selectedProperty) {
    return <div className="p-8 text-center">No se encontraron propiedades para probar.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Prueba de Modal de Agendamiento</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-3">Propiedad Seleccionada</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="aspect-video rounded-lg overflow-hidden">
            <img 
              src={selectedProperty.images[0] || "https://via.placeholder.com/300x200"} 
              alt={selectedProperty.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-lg font-medium">{selectedProperty.title}</h3>
            {selectedProperty.location && (
              <p className="text-gray-600 dark:text-gray-400">{selectedProperty.location}</p>
            )}
            <p className="text-green-600 dark:text-green-400 font-semibold">
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                minimumFractionDigits: 0,
              }).format(selectedProperty.price)}
            </p>
            <div className="flex space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>{selectedProperty.bedrooms} hab.</span>
              <span>{selectedProperty.bathrooms} baños</span>
              <span>{selectedProperty.area} m²</span>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={handleOpenModal}
                icon={Calendar}
              >
                Agendar Cita
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {selectedProperty && (
        <ScheduleAppointmentModalEnhanced
          property={selectedProperty}
          advisor={advisors[0]}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default TestAppointmentPage;
