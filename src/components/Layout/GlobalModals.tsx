import React from 'react';
import { useModalStore } from '../../store/modalStore';
import PropertyDetailsModal from '../Modals/PropertyDetailsModal';
import ScheduleAppointmentModalEnhanced from '../Modals/ScheduleAppointmentModalEnhanced';
import ServiceInquiryModal from '../Modals/ServiceInquiryModal';

const GlobalModals: React.FC = () => {
  const {
    isPropertyModalOpen,
    isClientModalOpen,
    isAppointmentModalOpen,
    isAdvisorModalOpen,
    isServiceInquiryModalOpen,
    selectedProperty,
    closePropertyModal,
    closeClientModal,
    closeAppointmentModal,
    closeAdvisorModal,
    closeServiceInquiryModal,
    selectedService,
  } = useModalStore();

  return (
    <>
      {/* Property Modal */}
      {isPropertyModalOpen && (
        <PropertyDetailsModal
          property={selectedProperty}
          isOpen={isPropertyModalOpen}
          onClose={closePropertyModal}
        />
      )}

      {/* Appointment Modal */}
      {isAppointmentModalOpen && (
        <ScheduleAppointmentModalEnhanced
          isOpen={isAppointmentModalOpen}
          onClose={closeAppointmentModal}
          property={selectedProperty || {
            id: 1,
            title: 'Nueva Cita',
            price: 0,
            location: 'Por definir'
          }}
          advisor={{
            id: '1',
            name: 'Asesor Principal',
            email: 'asesor@inmobiliaria.com',
            phone: '+57 300 000 0000',
            photo: '/default-avatar.jpg',
            specialty: 'Ventas Residenciales',
            whatsapp: '+57 300 000 0000',
            rating: 4.8,
            reviews: 25
          }}
        />
      )}

      <ServiceInquiryModal
        service={selectedService}
        isOpen={isServiceInquiryModalOpen}
        onClose={closeServiceInquiryModal}
      />

      {/* TODO: Crear estos modales cuando estén listos */}
      {/* Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Nuevo Cliente</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Modal de cliente en desarrollo...
            </p>
            <button
              onClick={closeClientModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Advisor Modal */}
      {isAdvisorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Nuevo Asesor</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Modal de asesor en desarrollo...
            </p>
            <button
              onClick={closeAdvisorModal}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GlobalModals;
