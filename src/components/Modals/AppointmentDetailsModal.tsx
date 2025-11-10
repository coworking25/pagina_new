import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  Video,
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Modal from '../UI/Modal';
import { PropertyAppointment, Advisor, Property } from '../../types';
import { getProperties, getAdvisors } from '../../lib/supabase';
import { getAppointmentTypeText, getVisitTypeText, getContactMethodText } from '../../utils/translations';

interface AppointmentDetailsModalProps {
  appointment: PropertyAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled') => void;
  onSendConfirmation?: () => void;
  advisors?: Advisor[];
  properties?: Property[];
  isLoadingAdditionalData?: boolean;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onSendConfirmation,
  advisors: initialAdvisors = [],
  properties: initialProperties = [],
  isLoadingAdditionalData = false
}) => {
  const [localAdvisors, setLocalAdvisors] = useState<Advisor[]>(initialAdvisors);
  const [localProperties, setLocalProperties] = useState<Property[]>(initialProperties);
  const [localLoading, setLocalLoading] = useState(false);

  // Cargar datos adicionales si no están disponibles
  useEffect(() => {
    if (isOpen && appointment) {
      const loadAdditionalData = async () => {
        // Si ya tenemos datos, no cargar
        if (localAdvisors.length > 0 && localProperties.length > 0) return;

        setLocalLoading(true);
        try {
          console.log('🔄 Cargando datos adicionales en modal...');
          const [advisorsData, propertiesData] = await Promise.all([
            localAdvisors.length === 0 ? getAdvisors() : Promise.resolve(localAdvisors),
            localProperties.length === 0 ? getProperties() : Promise.resolve(localProperties)
          ]);

          if (localAdvisors.length === 0) setLocalAdvisors(advisorsData || []);
          if (localProperties.length === 0) setLocalProperties(propertiesData || []);

          console.log('✅ Datos cargados en modal:', {
            advisors: advisorsData?.length || localAdvisors.length,
            properties: propertiesData?.length || localProperties.length
          });
        } catch (error) {
          console.error('❌ Error cargando datos en modal:', error);
        } finally {
          setLocalLoading(false);
        }
      };

      loadAdditionalData();
    }
  }, [isOpen, appointment, localAdvisors.length, localProperties.length]);

  if (!appointment) return null;

  // Usar datos locales si están disponibles, sino los iniciales
  const advisors = localAdvisors.length > 0 ? localAdvisors : initialAdvisors;
  const properties = localProperties.length > 0 ? localProperties : initialProperties;
  const isLoading = isLoadingAdditionalData || localLoading;

  // Buscar asesor y propiedad por ID
  const advisor = advisors.find(a => a.id === appointment.advisor_id);
  const property = properties.find(p => {
    const appointmentPropertyId = String(appointment.property_id || '');
    const propertyId = String(p.id || '');
    const match = propertyId === appointmentPropertyId;
    return match;
  });

  console.log('🔍 AppointmentDetailsModal - Buscando datos:', {
    appointmentId: appointment.id,
    propertyId: appointment.property_id,
    propertyIdType: typeof appointment.property_id,
    advisorId: appointment.advisor_id,
    propertiesCount: properties.length,
    advisorsCount: advisors.length,
    isLoading: isLoading,
    propertyFound: !!property,
    advisorFound: !!advisor,
    property: property ? { id: property.id, title: property.title } : null,
    advisor: advisor ? { id: advisor.id, name: advisor.name } : null
  });

  const handleEmailContact = () => {
    const subject = `Cita programada - ${getAppointmentTypeText(appointment.appointment_type)}`;
    const body = `Hola ${appointment.client_name},

Tu cita está programada para el ${formatDate(appointment.appointment_date)}.

Tipo de cita: ${getAppointmentTypeText(appointment.appointment_type)}
Tipo de visita: ${getVisitTypeText(appointment.visit_type)}
Número de asistentes: ${appointment.attendees}

Saludos,
Equipo de Inmobiliaria`;

    const mailtoLink = `mailto:${appointment.client_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const handleWhatsAppContact = () => {
    if (!appointment.client_phone) return;

    const message = `Hola ${appointment.client_name}, tu cita está confirmada para el ${formatDate(appointment.appointment_date)}. Tipo: ${getAppointmentTypeText(appointment.appointment_type)} - ${getVisitTypeText(appointment.visit_type)}.`;
    const cleanPhone = appointment.client_phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Abriendo WhatsApp desde AppointmentDetailsModal (iOS/Safari compatible)');
    
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
  };

  const handlePhoneCall = () => {
    if (!appointment.client_phone) return;
    window.open(`tel:${appointment.client_phone}`, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'no_show': return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'rescheduled': return <AlertCircle className="w-6 h-6 text-purple-500" />;
      default: return <AlertCircle className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getVisitTypeIcon = (visitType: string) => {
    switch (visitType) {
      case 'virtual': return <Video className="w-5 h-5" />;
      case 'mixta': return <Users className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Cita"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con estado */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(appointment.status || 'pending')}
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status || 'pending')}`}>
              {appointment.status === 'pending' && 'Pendiente'}
              {appointment.status === 'confirmed' && 'Confirmado'}
              {appointment.status === 'completed' && 'Completado'}
              {appointment.status === 'cancelled' && 'Cancelado'}
              {appointment.status === 'no_show' && 'No Asistió'}
              {appointment.status === 'rescheduled' && 'Reprogramado'}
            </span>
          </div>

          {onStatusChange && (
            <div className="flex flex-wrap gap-2">
              {appointment.status === 'pending' && (
                <button
                  onClick={() => onStatusChange('confirmed')}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
              )}
              {appointment.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => onStatusChange('completed')}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Completar
                  </button>
                  <button
                    onClick={() => onStatusChange('no_show')}
                    className="px-3 py-1 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    No Asistió
                  </button>
                </>
              )}
              {appointment.status !== 'completed' && appointment.status !== 'cancelled' && appointment.status !== 'no_show' && (
                <>
                  <button
                    onClick={() => onStatusChange('rescheduled')}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Reprogramar
                  </button>
                  <button
                    onClick={() => onStatusChange('cancelled')}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Información de la cita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fecha y hora */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Fecha y Hora</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {formatDate(appointment.appointment_date)}
            </p>
          </div>

          {/* Tipo de cita */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              {getVisitTypeIcon(appointment.visit_type)}
              <h3 className="font-semibold text-gray-900 dark:text-white">Tipo de Cita</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {getAppointmentTypeText(appointment.appointment_type)} - {getVisitTypeText(appointment.visit_type)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {appointment.attendees} {appointment.attendees === 1 ? 'persona' : 'personas'}
            </p>
          </div>
        </div>

        {/* Información del cliente */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Información del Cliente</h3>
            </div>
            <div className="flex space-x-2">
              {appointment.client_email && (
                <button
                  onClick={handleEmailContact}
                  className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors text-sm"
                  title="Enviar email"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </button>
              )}
              {appointment.client_phone && (
                <>
                  <button
                    onClick={handleWhatsAppContact}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors text-sm"
                    title="Contactar por WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handlePhoneCall}
                    className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 transition-colors text-sm"
                    title="Llamar por teléfono"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Llamar</span>
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{appointment.client_name}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{appointment.client_email}</span>
              </div>
              {appointment.client_phone && (
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">{appointment.client_phone}</span>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  Contacto: {getContactMethodText(appointment.contact_method)}
                </span>
              </div>
              {appointment.marketing_consent && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ✓ Aceptó recibir comunicaciones comerciales
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Solicitudes especiales */}
        {appointment.special_requests && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Solicitudes Especiales</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {appointment.special_requests}
            </p>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Información Adicional</h3>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Propiedad:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="text-blue-600 dark:text-blue-400">Cargando datos de propiedades...</span>
                ) : properties.length === 0 ? (
                  <span className="text-yellow-600 dark:text-yellow-400">Datos de propiedades no disponibles</span>
                ) : property ? (
                  `${property.code || property.id} - ${property.title}`
                ) : (
                  <span className="text-red-600 dark:text-red-400">Propiedad no encontrada (ID: {appointment.property_id})</span>
                )}
              </p>
            </div>

            <div>
              <span className="text-gray-500 dark:text-gray-400">Asesor:</span>
              <p className="font-medium text-gray-900 dark:text-white">
                {isLoading ? (
                  <span className="text-blue-600 dark:text-blue-400">Cargando datos de asesores...</span>
                ) : advisors.length === 0 ? (
                  <span className="text-yellow-600 dark:text-yellow-400">Datos de asesores no disponibles</span>
                ) : advisor ? (
                  advisor.name
                ) : (
                  <span className="text-red-600 dark:text-red-400">Asesor no encontrado (ID: {appointment.advisor_id})</span>
                )}
              </p>
            </div>

            {appointment.created_at && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Creada:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(appointment.created_at).toLocaleDateString('es-CO')}
                </p>
              </div>
            )}

            {appointment.updated_at && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Actualizada:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(appointment.updated_at).toLocaleDateString('es-CO')}
                </p>
              </div>
            )}

            {appointment.actual_attendees && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Asistentes reales:</span>
                <p className="font-medium text-gray-900 dark:text-white">{appointment.actual_attendees}</p>
              </div>
            )}

            {appointment.appointment_duration && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Duración:</span>
                <p className="font-medium text-gray-900 dark:text-white">{appointment.appointment_duration} min</p>
              </div>
            )}

            {appointment.appointment_rating && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Calificación:</span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {'⭐'.repeat(appointment.appointment_rating)} ({appointment.appointment_rating}/5)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notas de seguimiento */}
        {appointment.follow_up_notes && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notas de Seguimiento</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {appointment.follow_up_notes}
            </p>
          </div>
        )}

        {/* Feedback del cliente */}
        {appointment.client_feedback && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Feedback del Cliente</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {appointment.client_feedback}
            </p>
          </div>
        )}

        {/* Razón de cancelación */}
        {appointment.cancellation_reason && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Razón de Cancelación</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {appointment.cancellation_reason}
            </p>
          </div>
        )}

        {/* Fecha de reprogramación */}
        {appointment.rescheduled_date && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Nueva Fecha Programada</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {formatDate(appointment.rescheduled_date)}
            </p>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Botón de enviar confirmación por WhatsApp */}
          {onSendConfirmation && appointment.client_phone && (
            <button
              onClick={onSendConfirmation}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              title="Enviar confirmación por WhatsApp al cliente"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar Confirmación</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Editar Cita
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar Cita
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentDetailsModal;