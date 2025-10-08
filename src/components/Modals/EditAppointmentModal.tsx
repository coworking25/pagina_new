import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Users,
  FileText,
  MessageSquare,
  Save,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import Modal from '../UI/Modal';
import { PropertyAppointment, Advisor, Property } from '../../types';
import { checkAdvisorAvailability } from '../../lib/supabase';

interface EditAppointmentModalProps {
  appointment: PropertyAppointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointmentData: Partial<PropertyAppointment>) => void;
  advisors: Advisor[];
  properties: Property[];
}

interface FormData {
  client_name: string;
  client_email: string;
  client_phone: string;
  property_id: number;
  advisor_id: string;
  appointment_date: string;
  appointment_type: 'visita' | 'consulta' | 'avaluo' | 'asesoria';
  visit_type: 'presencial' | 'virtual' | 'mixta';
  special_requests: string;
  contact_method: 'whatsapp' | 'phone' | 'email';
  marketing_consent: boolean;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onSave,
  advisors,
  properties
}) => {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_email: '',
    client_phone: '',
    property_id: 0,
    advisor_id: '',
    appointment_date: '',
    appointment_type: 'visita',
    visit_type: 'presencial',
    special_requests: '',
    contact_method: 'whatsapp',
    marketing_consent: false
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: ''
  });

  // Función para verificar disponibilidad del asesor
  const checkAvailability = async (advisorId: string, appointmentDate: string) => {
    if (!advisorId || !appointmentDate) {
      setAvailabilityStatus({ checking: false, available: null, message: '' });
      return;
    }

    setAvailabilityStatus({ checking: true, available: null, message: 'Verificando disponibilidad...' });

    try {
      const availability = await checkAdvisorAvailability(
        advisorId,
        appointmentDate,
        appointment?.id ? parseInt(appointment.id) : undefined // Excluir la cita actual al verificar
      );

      if (availability.available) {
        setAvailabilityStatus({
          checking: false,
          available: true,
          message: '✅ Horario disponible'
        });
      } else {
        const conflictDate = new Date(availability.conflictingAppointment.appointment_date);
        setAvailabilityStatus({
          checking: false,
          available: false,
          message: `❌ Horario ocupado - Cita existente: ${conflictDate.toLocaleDateString('es-CO')} ${conflictDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
        });
      }
    } catch (error) {
      console.error('Error verificando disponibilidad:', error);
      setAvailabilityStatus({
        checking: false,
        available: null,
        message: '⚠️ Error al verificar disponibilidad'
      });
    }
  };

  // Verificar disponibilidad cuando cambien fecha, hora o asesor
  useEffect(() => {
    if (formData.advisor_id && formData.appointment_date) {
      checkAvailability(formData.advisor_id, formData.appointment_date);
    } else {
      setAvailabilityStatus({ checking: false, available: null, message: '' });
    }
  }, [formData.advisor_id, formData.appointment_date]);

  useEffect(() => {
    if (appointment && isOpen) {
      setFormData({
        client_name: appointment.client_name,
        client_email: appointment.client_email,
        client_phone: appointment.client_phone || '',
        property_id: appointment.property_id,
        advisor_id: appointment.advisor_id,
        appointment_date: appointment.appointment_date,
        appointment_type: appointment.appointment_type,
        visit_type: appointment.visit_type,
        special_requests: appointment.special_requests || '',
        contact_method: appointment.contact_method,
        marketing_consent: appointment.marketing_consent
      });
      setErrors({});
    }
  }, [appointment, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.client_name.trim()) {
      newErrors.client_name = 'El nombre del cliente es requerido';
    }

    if (!formData.client_email.trim()) {
      newErrors.client_email = 'El email del cliente es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.client_email)) {
      newErrors.client_email = 'El email no tiene un formato válido';
    }

    if (!formData.appointment_date) {
      newErrors.appointment_date = 'La fecha de la cita es requerida';
    } else {
      const appointmentDate = new Date(formData.appointment_date);
      const now = new Date();
      if (appointmentDate < now) {
        newErrors.appointment_date = 'La fecha de la cita no puede ser en el pasado';
      }
    }

    // Validar disponibilidad del asesor
    if (availabilityStatus.available === false) {
      (newErrors as any).appointment_date = 'El asesor no está disponible en este horario. ' + availabilityStatus.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!appointment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Cita"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información del Cliente */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Información del Cliente</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.client_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Nombre del cliente"
              />
              {errors.client_name && (
                <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.client_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="cliente@email.com"
              />
              {errors.client_email && (
                <p className="text-red-500 text-xs mt-1">{errors.client_email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Detalles de la Cita */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Detalles de la Cita</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                  errors.appointment_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.appointment_date && (
                <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Cita
              </label>
              <select
                value={formData.appointment_type}
                onChange={(e) => handleInputChange('appointment_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="visita">Visita</option>
                <option value="consulta">Consulta</option>
                <option value="avaluo">Avalúo</option>
                <option value="asesoria">Asesoría</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modalidad
              </label>
              <select
                value={formData.visit_type}
                onChange={(e) => handleInputChange('visit_type', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>
          </div>
        </div>

        {/* Asesor y Propiedad */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Asesor y Propiedad</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asesor
              </label>
              <select
                value={formData.advisor_id}
                onChange={(e) => handleInputChange('advisor_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Seleccionar asesor</option>
                {advisors.map(advisor => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name}
                  </option>
                ))}
              </select>
              
              {/* Indicador de disponibilidad */}
              {formData.advisor_id && formData.appointment_date && (
                <div className="mt-2 flex items-center space-x-2">
                  {availabilityStatus.checking ? (
                    <>
                      <Clock className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-sm text-blue-600 dark:text-blue-400">
                        Verificando disponibilidad...
                      </span>
                    </>
                  ) : availabilityStatus.available ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600 dark:text-green-400">
                        Asesor disponible
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm text-red-600 dark:text-red-400">
                        {availabilityStatus.message || 'Asesor no disponible'}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Propiedad
              </label>
              <select
                value={formData.property_id}
                onChange={(e) => handleInputChange('property_id', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={0}>Seleccionar propiedad</option>
                {properties.map(property => (
                  <option key={property.id} value={property.id}>
                    {property.title} - {property.location}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Preferencias de Contacto */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferencias de Contacto</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Contacto
              </label>
              <select
                value={formData.contact_method}
                onChange={(e) => handleInputChange('contact_method', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Teléfono</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="marketing_consent"
                checked={formData.marketing_consent}
                onChange={(e) => handleInputChange('marketing_consent', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="marketing_consent" className="text-sm text-gray-700 dark:text-gray-300">
                Acepta recibir comunicaciones comerciales
              </label>
            </div>
          </div>
        </div>

        {/* Solicitudes Especiales */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Solicitudes Especiales</h3>
          </div>

          <textarea
            value={formData.special_requests}
            onChange={(e) => handleInputChange('special_requests', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Ingrese cualquier solicitud especial o requerimiento adicional..."
          />
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditAppointmentModal;