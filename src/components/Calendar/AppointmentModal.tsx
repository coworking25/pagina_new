import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Phone, FileText, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

import { calendarService, Appointment, CreateAppointmentData } from '../../lib/calendarService';
import { getClients } from '../../lib/clientsApi';
import { supabase } from '../../lib/supabase';
import { Client } from '../../types/clients';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Modal from '../UI/Modal';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment?: Appointment | null;
  selectedDate?: Date;
  advisorId?: string;
  onSave?: (appointment: Appointment) => void;
}

interface Advisor {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Property {
  id: string;
  title: string;
  code: string;
  location: string;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  selectedDate,
  advisorId,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);

  const [formData, setFormData] = useState<CreateAppointmentData & {
    status?: Appointment['status'];
    follow_up_notes?: string;
    internal_notes?: string;
  }>({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    all_day: false,
    client_id: '',
    advisor_id: advisorId || '',
    property_id: '',
    location: '',
    appointment_type: 'meeting',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    notes: '',
    internal_notes: '',
    follow_up_required: false,
    follow_up_notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      initializeForm();
    }
  }, [isOpen, appointment, selectedDate, advisorId]);

  const loadInitialData = async () => {
    try {
      // Cargar clientes
      const clientsData = await getClients();
      setClients(clientsData);

      // Cargar asesores
      const { data: advisorsData } = await supabase
        .from('advisors')
        .select('id, name, email, phone')
        .order('name');
      setAdvisors(advisorsData || []);

      // Cargar propiedades
      const { data: propertiesData } = await supabase
        .from('properties')
        .select('id, title, code, location')
        .order('title');
      setProperties(propertiesData || []);

    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const initializeForm = () => {
    if (appointment) {
      // Editando cita existente
      setFormData({
        title: appointment.title,
        description: appointment.description || '',
        start_time: format(new Date(appointment.start_time), "yyyy-MM-dd'T'HH:mm"),
        end_time: format(new Date(appointment.end_time), "yyyy-MM-dd'T'HH:mm"),
        all_day: appointment.all_day,
        client_id: appointment.client_id || '',
        advisor_id: appointment.advisor_id || '',
        property_id: appointment.property_id || '',
        location: appointment.location || '',
        appointment_type: appointment.appointment_type,
        contact_name: appointment.contact_name || '',
        contact_email: appointment.contact_email || '',
        contact_phone: appointment.contact_phone || '',
        notes: appointment.notes || '',
        internal_notes: appointment.internal_notes || '',
        follow_up_required: appointment.follow_up_required,
        follow_up_notes: appointment.follow_up_notes || '',
      });
    } else {
      // Nueva cita
      const startDate = selectedDate || new Date();
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1); // Duración por defecto de 1 hora

      setFormData({
        title: '',
        description: '',
        start_time: format(startDate, "yyyy-MM-dd'T'HH:mm"),
        end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        all_day: false,
        client_id: '',
        advisor_id: advisorId || '',
        property_id: '',
        location: '',
        appointment_type: 'meeting',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        notes: '',
        internal_notes: '',
        follow_up_required: false,
        follow_up_notes: '',
      });
    }
    setErrors({});
  };

  // Auto-llenar información de contacto cuando se selecciona un cliente
  useEffect(() => {
    if (formData.client_id) {
      const selectedClient = clients.find(c => c.id === formData.client_id);
      if (selectedClient) {
        setFormData(prev => ({
          ...prev,
          contact_name: selectedClient.full_name,
          contact_email: selectedClient.email || '',
          contact_phone: selectedClient.phone || '',
        }));
      }
    }
  }, [formData.client_id, clients]);

  // Auto-llenar ubicación cuando se selecciona una propiedad
  useEffect(() => {
    if (formData.property_id) {
      const selectedProperty = properties.find(p => p.id === formData.property_id);
      if (selectedProperty) {
        setFormData(prev => ({
          ...prev,
          location: selectedProperty.location,
          title: prev.title || `Visita - ${selectedProperty.title}`,
        }));
      }
    }
  }, [formData.property_id, properties]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'La fecha y hora de inicio son obligatorias';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'La fecha y hora de fin son obligatorias';
    }

    if (formData.start_time && formData.end_time) {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);

      if (end <= start) {
        newErrors.end_time = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }

    if (formData.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'El email no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      let savedAppointment: Appointment;

      if (appointment) {
        // Actualizar cita existente
        savedAppointment = await calendarService.updateAppointment(appointment.id, formData);
      } else {
        // Crear nueva cita
        savedAppointment = await calendarService.createAppointment(formData);
      }

      if (onSave) {
        onSave(savedAppointment);
      }

      onClose();
    } catch (error: any) {
      console.error('Error guardando cita:', error);
      setErrors({ general: error.message || 'Error al guardar la cita' });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {appointment ? 'Editar Cita' : 'Nueva Cita'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información Básica
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Título de la cita"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Tipo de cita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cita
                </label>
                <select
                  value={formData.appointment_type}
                  onChange={(e) => updateFormData('appointment_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="meeting">Reunión</option>
                  <option value="viewing">Visita a propiedad</option>
                  <option value="consultation">Consulta</option>
                  <option value="valuation">Avalúo</option>
                  <option value="follow_up">Seguimiento</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Todo el día */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="all_day"
                  checked={formData.all_day}
                  onChange={(e) => updateFormData('all_day', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="all_day" className="ml-2 text-sm text-gray-700">
                  Todo el día
                </label>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateFormData('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada de la cita"
              />
            </div>
          </Card>

          {/* Fecha y Hora */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Fecha y Hora
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fecha y hora de inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inicio *
                </label>
                <input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => updateFormData('start_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.start_time && <p className="text-red-500 text-xs mt-1">{errors.start_time}</p>}
              </div>

              {/* Fecha y hora de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fin *
                </label>
                <input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => updateFormData('end_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.end_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.end_time && <p className="text-red-500 text-xs mt-1">{errors.end_time}</p>}
              </div>
            </div>
          </Card>

          {/* Participantes */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Participantes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={formData.client_id}
                  onChange={(e) => updateFormData('client_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Asesor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asesor
                </label>
                <select
                  value={formData.advisor_id}
                  onChange={(e) => updateFormData('advisor_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar asesor...</option>
                  {advisors.map(advisor => (
                    <option key={advisor.id} value={advisor.id}>
                      {advisor.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Propiedad */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Propiedad
                </label>
                <select
                  value={formData.property_id}
                  onChange={(e) => updateFormData('property_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar propiedad...</option>
                  {properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title} - {property.location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Información de Contacto */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Información de Contacto
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre de contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de Contacto
                </label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => updateFormData('contact_name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre completo"
                />
              </div>

              {/* Email de contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => updateFormData('contact_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.contact_email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@ejemplo.com"
                />
                {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email}</p>}
              </div>

              {/* Teléfono de contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => updateFormData('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+57 300 123 4567"
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dirección o lugar de la cita"
                />
              </div>
            </div>
          </Card>

          {/* Notas y Seguimiento */}
          <Card className="p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Notas y Seguimiento
            </h3>

            <div className="space-y-4">
              {/* Notas públicas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (visibles para el cliente)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateFormData('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas que serán visibles para el cliente"
                />
              </div>

              {/* Notas internas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas (solo administradores)
                </label>
                <textarea
                  value={formData.internal_notes}
                  onChange={(e) => updateFormData('internal_notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas privadas solo para el equipo interno"
                />
              </div>

              {/* Seguimiento */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="follow_up_required"
                  checked={formData.follow_up_required}
                  onChange={(e) => updateFormData('follow_up_required', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="follow_up_required" className="ml-2 text-sm text-gray-700">
                  Requiere seguimiento posterior
                </label>
              </div>

              {formData.follow_up_required && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas de Seguimiento
                  </label>
                  <textarea
                    value={formData.follow_up_notes}
                    onChange={(e) => updateFormData('follow_up_notes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalles del seguimiento requerido"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Error general */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {appointment ? 'Actualizar Cita' : 'Crear Cita'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};