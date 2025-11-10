import React from 'react';
import {
  Calendar,
  User,
  Phone,
  Mail,
  Home,
  MapPin,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Clock
} from 'lucide-react';
import Modal from '../UI/Modal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getAppointmentTypeText } from '../../utils/translations';

interface CalendarAppointmentDetailsModalProps {
  appointment: any | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CalendarAppointmentDetailsModal: React.FC<CalendarAppointmentDetailsModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!appointment) return null;

  const isFromWeb = appointment.source === 'property_appointment';

  const handleWhatsAppClient = () => {
    if (!appointment.contact_phone) return;

    const message = `Hola ${appointment.contact_name || 'Cliente'}, recordatorio de tu cita: ${appointment.title} el ${formatDateTime(appointment.start)}`;
    const cleanPhone = appointment.contact_phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Abriendo WhatsApp para cliente');
    
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS || isSafari) {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleWhatsAppAdvisor = () => {
    if (!appointment.advisor_phone) return;

    const message = `Hola ${appointment.advisor_name || 'Asesor'}, recordatorio de cita: ${appointment.title} con ${appointment.contact_name || 'cliente'} el ${formatDateTime(appointment.start)}`;
    const cleanPhone = appointment.advisor_phone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('📱 Abriendo WhatsApp para asesor');
    
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS || isSafari) {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleEmailClient = () => {
    if (!appointment.contact_email) return;

    const subject = `Confirmación de cita - ${appointment.title}`;
    const body = `Hola ${appointment.contact_name || 'Cliente'},\n\nTu cita está programada para:\n\nFecha: ${formatDateTime(appointment.start)}\nTipo: ${getAppointmentTypeText(appointment.appointment_type)}\n\nSaludos,\nEquipo de Inmobiliaria`;

    const mailtoLink = `mailto:${appointment.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'confirmed': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'completed': return <CheckCircle className="w-6 h-6 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-6 h-6 text-red-500" />;
      case 'no_show': return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'rescheduled': return <AlertCircle className="w-6 h-6 text-purple-500" />;
      default: return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'no_show': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'confirmed': return 'Confirmado';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      case 'no_show': return 'No Asistió';
      case 'rescheduled': return 'Reagendado';
      default: return status;
    }
  };

  const formatDateTime = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: es });
  };

  const getDuration = () => {
    const diff = appointment.end.getTime() - appointment.start.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} minutos`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours} hora${hours > 1 ? 's' : ''}`;
  };

  const modalTitle = isFromWeb 
    ? "Detalles de la Cita 🌐 (Desde Web)"
    : "Detalles de la Cita";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header con estado y título */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(appointment.status || 'pending')}
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(appointment.status || 'pending')}`}>
                {getStatusLabel(appointment.status || 'pending')}
              </span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {appointment.title}
            </h2>
            {appointment.appointment_type && (
              <p className="text-gray-600 dark:text-gray-400">
                {getAppointmentTypeText(appointment.appointment_type)}
              </p>
            )}
          </div>
        </div>

        {/* Fecha y hora */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Fecha y Hora</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Inicio</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatDateTime(appointment.start)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Fin</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatTime(appointment.end)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Duración</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {getDuration()}
            </p>
            {appointment.all_day && (
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                📅 Todo el día
              </p>
            )}
          </div>
        </div>

        {/* Información del cliente */}
        {(appointment.contact_name || appointment.contact_email || appointment.contact_phone) && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Cliente</h3>
              </div>
              <div className="flex gap-2">
                {appointment.contact_email && (
                  <button
                    onClick={handleEmailClient}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors text-sm"
                    title="Enviar email"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </button>
                )}
                {appointment.contact_phone && (
                  <button
                    onClick={handleWhatsAppClient}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors text-sm"
                    title="Contactar por WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {appointment.contact_name && (
                <p className="font-medium text-gray-900 dark:text-white text-lg">
                  {appointment.contact_name}
                </p>
              )}
              {appointment.contact_email && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{appointment.contact_email}</span>
                </div>
              )}
              {appointment.contact_phone && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span>{appointment.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del asesor */}
        {appointment.advisor_name && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-white">Asesor Asignado</h3>
              </div>
              {appointment.advisor_phone && (
                <button
                  onClick={handleWhatsAppAdvisor}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 transition-colors text-sm"
                  title="Contactar asesor por WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Contactar</span>
                </button>
              )}
            </div>
            <p className="font-medium text-gray-900 dark:text-white text-lg">
              {appointment.advisor_name}
            </p>
          </div>
        )}

        {/* Propiedad */}
        {appointment.property_title && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Home className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Propiedad</h3>
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {appointment.property_title}
            </p>
            {appointment.property_id && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ID: {appointment.property_id}
              </p>
            )}
          </div>
        )}

        {/* Ubicación */}
        {appointment.location && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <MapPin className="w-5 h-5 text-red-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Ubicación</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {appointment.location}
            </p>
          </div>
        )}

        {/* Notas */}
        {appointment.notes && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notas</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {appointment.notes}
            </p>
          </div>
        )}

        {/* Notas internas (solo visible para admin) */}
        {appointment.internal_notes && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FileText className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notas Internas</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
              {appointment.internal_notes}
            </p>
          </div>
        )}

        {/* Seguimiento */}
        {appointment.follow_up_required && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Requiere Seguimiento</h3>
            </div>
            {appointment.follow_up_notes && (
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">
                {appointment.follow_up_notes}
              </p>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Editar</span>
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
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

export default CalendarAppointmentDetailsModal;
