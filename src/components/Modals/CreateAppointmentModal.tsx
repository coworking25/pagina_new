import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  Save
} from 'lucide-react';
import Modal from '../UI/Modal';
import { PropertyAppointment, Advisor, Property } from '../../types';

interface CreateAppointmentModalProps {
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
  attendees: number;
  special_requests: string;
  contact_method: 'whatsapp' | 'phone' | 'email';
  marketing_consent: boolean;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({
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
    attendees: 1,
    special_requests: '',
    contact_method: 'whatsapp',
    marketing_consent: false
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        property_id: 0,
        advisor_id: '',
        appointment_date: '',
        appointment_type: 'visita',
        visit_type: 'presencial',
        attendees: 1,
        special_requests: '',
        contact_method: 'whatsapp',
        marketing_consent: false
      });
      setErrors({});
    }
  }, [isOpen]); // Solo se ejecuta cuando isOpen cambia a true

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_name.trim()) newErrors.client_name = 'Nombre del cliente es requerido';
    if (!formData.client_email.trim()) newErrors.client_email = 'Email del cliente es requerido';
    if (!formData.property_id || formData.property_id === 0) newErrors.property_id = 'Debe seleccionar una propiedad';
    if (!formData.advisor_id) newErrors.advisor_id = 'Debe seleccionar un asesor';
    if (!formData.appointment_date) newErrors.appointment_date = 'Fecha y hora son requeridas';

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.client_email && !emailRegex.test(formData.client_email)) {
      newErrors.client_email = 'Email no válido';
    }

    // Validar fecha futura
    if (formData.appointment_date) {
      const appointmentDate = new Date(formData.appointment_date);
      const now = new Date();
      if (appointmentDate <= now) {
        newErrors.appointment_date = 'La fecha debe ser futura';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Convertir property_id a number como espera la interfaz
      const appointmentData = {
        ...formData,
        status: 'pending' as const
      };

      await onSave(appointmentData);
      onClose();
    } catch (error) {
      console.error('Error creando cita:', error);
      alert('Error al crear la cita. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Nueva Cita">
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
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.client_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ej: Juan Pérez"
              />
              {errors.client_name && (
                <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email del Cliente *
              </label>
              <input
                type="email"
                value={formData.client_email}
                onChange={(e) => handleInputChange('client_email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.client_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="cliente@email.com"
              />
              {errors.client_email && (
                <p className="text-red-500 text-xs mt-1">{errors.client_email}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Teléfono del Cliente
              </label>
              <input
                type="tel"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+57 300 123 4567"
              />
            </div>
          </div>
        </div>

        {/* Información de la Cita */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Información de la Cita</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Propiedad *
              </label>
              <select
                value={formData.property_id}
                onChange={(e) => handleInputChange('property_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.property_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar propiedad...</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.code || property.id} - {property.title}
                  </option>
                ))}
              </select>
              {errors.property_id && (
                <p className="text-red-500 text-xs mt-1">{errors.property_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Asesor *
              </label>
              <select
                value={formData.advisor_id}
                onChange={(e) => handleInputChange('advisor_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.advisor_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Seleccionar asesor...</option>
                {advisors.map((advisor) => (
                  <option key={advisor.id} value={advisor.id}>
                    {advisor.name}
                  </option>
                ))}
              </select>
              {errors.advisor_id && (
                <p className="text-red-500 text-xs mt-1">{errors.advisor_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Cita *
              </label>
              <select
                value={formData.appointment_type}
                onChange={(e) => handleInputChange('appointment_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="visita">Visita</option>
                <option value="consulta">Consulta</option>
                <option value="avaluo">Avalúo</option>
                <option value="asesoria">Asesoría</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tipo de Visita *
              </label>
              <select
                value={formData.visit_type}
                onChange={(e) => handleInputChange('visit_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="mixta">Mixta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.appointment_date}
                onChange={(e) => handleInputChange('appointment_date', e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.appointment_date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {errors.appointment_date && (
                <p className="text-red-500 text-xs mt-1">{errors.appointment_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Asistentes *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.attendees}
                onChange={(e) => handleInputChange('attendees', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Preferencias de Contacto */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Preferencias de Contacto</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Método de Contacto Preferido *
              </label>
              <select
                value={formData.contact_method}
                onChange={(e) => handleInputChange('contact_method', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="marketing_consent" className="text-sm text-gray-700 dark:text-gray-300">
                Acepta recibir información de marketing
              </label>
            </div>
          </div>
        </div>

        {/* Solicitudes Especiales */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Solicitudes Especiales</h3>
          </div>

          <div>
            <textarea
              value={formData.special_requests}
              onChange={(e) => handleInputChange('special_requests', e.target.value)}
              placeholder="Ingrese cualquier solicitud especial o requerimiento adicional..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Crear Cita</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateAppointmentModal;