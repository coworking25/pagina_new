import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Send, 
  X,
  Home,
  Video,
  Users,
  FileText,
  MessageSquare,
  ChevronDown,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Property, Advisor } from '../../types';
import Button from '../UI/Button';
import TimeSlotSelector from '../UI/TimeSlotSelector';
import { savePropertyAppointmentWithValidation, checkAdvisorAvailability } from '../../lib/supabase';

interface ScheduleAppointmentModalProps {
  property: Property;
  advisor: Advisor;
  isOpen: boolean;
  onClose: () => void;
}

interface AppointmentForm {
  name: string;
  email: string;
  phone: string;
  appointmentType: string;
  preferredDate: string;
  preferredTime: string;
  visitType: string;
  attendees: string;
  specialRequests: string;
  contactMethod: string;
  marketingConsent: boolean;
}

// Componente de calendario simple inline
const SimpleCalendar: React.FC<{
  selectedDate: string;
  onDateSelect: (date: string) => void;
}> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    const days = [];

    // Días del mes anterior
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false, isDisabled: true });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isDisabled = date < new Date() || date.getDay() === 0; // No domingos ni fechas pasadas
      days.push({ date, isCurrentMonth: true, isDisabled });
    }

    return days;
  };

  const days = getDaysInMonth();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          ←
        </button>
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          type="button"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = selectedDate === day.date.toISOString().split('T')[0];
          const isToday = day.date.toDateString() === new Date().toDateString();
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => !day.isDisabled && onDateSelect(day.date.toISOString().split('T')[0])}
              disabled={day.isDisabled}
              className={`
                p-2 text-sm rounded transition-colors
                ${day.isCurrentMonth 
                  ? day.isDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-900 dark:text-white hover:bg-blue-50'
                  : 'text-gray-300 cursor-not-allowed'
                }
                ${isSelected ? 'bg-blue-600 text-white' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 font-semibold' : ''}
              `}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ScheduleAppointmentModal: React.FC<ScheduleAppointmentModalProps> = ({
  property,
  advisor,
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [formData, setFormData] = useState<AppointmentForm>({
    name: '',
    email: '',
    phone: '',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    visitType: '',
    attendees: '1',
    specialRequests: '',
    contactMethod: 'whatsapp',
    marketingConsent: false
  });

  const appointmentTypes = [
    { id: 'visita', label: 'Visita a la propiedad', icon: Home, description: 'Recorrido por la propiedad' },
    { id: 'consulta', label: 'Consulta general', icon: MessageSquare, description: 'Preguntas sobre la propiedad' },
    { id: 'avaluo', label: 'Avalúo comercial', icon: FileText, description: 'Evaluación del valor' },
    { id: 'asesoria', label: 'Asesoría financiera', icon: MessageSquare, description: 'Opciones de financiamiento' }
  ];

  const visitTypes = [
    { id: 'presencial', label: 'Presencial', icon: Home, description: 'Visita en persona' },
    { id: 'virtual', label: 'Virtual', icon: Video, description: 'Tour virtual por videollamada' },
    { id: 'mixta', label: 'Mixta', icon: Users, description: 'Combinación de ambas' }
  ];

  const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  // Función para verificar disponibilidad del asesor
  const checkAvailability = async (date: string, time: string) => {
    if (!date || !time) return;

    setAvailabilityStatus({ checking: true, available: null, message: 'Verificando disponibilidad...' });

    try {
      const appointmentDateTime = new Date(`${date}T${time}:00`);
      const availability = await checkAdvisorAvailability(
        advisor.id,
        appointmentDateTime.toISOString()
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

  // Verificar disponibilidad cuando cambien fecha o hora
  useEffect(() => {
    if (formData.preferredDate && formData.preferredTime) {
      checkAvailability(formData.preferredDate, formData.preferredTime);
    } else {
      setAvailabilityStatus({ checking: false, available: null, message: '' });
    }
  }, [formData.preferredDate, formData.preferredTime]);

  const updateFormData = (field: keyof AppointmentForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validar que todos los campos requeridos estén completos
    if (!formData.name || !formData.email || !formData.preferredDate || !formData.preferredTime) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    // Validar disponibilidad antes de enviar
    if (availabilityStatus.available === false) {
      alert('El asesor no está disponible en el horario seleccionado. Por favor elige otro horario.');
      return;
    }

    if (availabilityStatus.available !== true) {
      alert('Verificando disponibilidad del asesor. Por favor espera.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Formatear la fecha y hora para la base de datos
      const appointmentDateTime = new Date(`${formData.preferredDate}T${formData.preferredTime}:00`);
      
      // Datos para guardar en la base de datos
      const appointmentData = {
        client_name: formData.name,
        client_email: formData.email,
        client_phone: formData.phone,
        property_id: property.id,
        advisor_id: advisor.id,
        appointment_date: appointmentDateTime.toISOString(),
        appointment_type: formData.appointmentType,
        visit_type: formData.visitType,
        attendees: parseInt(formData.attendees),
        special_requests: formData.specialRequests || undefined,
        contact_method: formData.contactMethod,
        marketing_consent: formData.marketingConsent
      };

      // Intentar guardar en la base de datos (usando versión simplificada)
      console.log('💾 Guardando cita en la base de datos...', appointmentData);
      
      // Usar la función con validación de disponibilidad
      const savedAppointment = await savePropertyAppointmentWithValidation(appointmentData);
      
      console.log('✅ Cita guardada exitosamente:', savedAppointment);

      // Formatear datos para WhatsApp
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-CO', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      };

      const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const period = hour24 < 12 ? 'AM' : 'PM';
        return `${hour12}:${minutes} ${period}`;
      };

      const appointmentTypeLabel = appointmentTypes.find(t => t.id === formData.appointmentType)?.label || formData.appointmentType;
      const visitTypeLabel = visitTypes.find(t => t.id === formData.visitType)?.label || formData.visitType;

      // Mensaje para WhatsApp con ID de la cita
      const message = `¡Hola ${advisor.name}! 👋

Me interesa agendar una cita para la siguiente propiedad:

🏠 *${property.title}*
📍 ${property.location}
💰 ${property.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}

📋 *Datos del contacto:*
• Nombre: ${formData.name}
• Email: ${formData.email}
• Teléfono: ${formData.phone}

📅 *Detalles de la cita:*
• Tipo: ${appointmentTypeLabel}
• Modalidad: ${visitTypeLabel}
• Fecha preferida: ${formatDate(formData.preferredDate)}
• Hora preferida: ${formatTime(formData.preferredTime)}
• Número de asistentes: ${formData.attendees}

${formData.specialRequests ? `💭 *Solicitudes especiales:*\n${formData.specialRequests}\n\n` : ''}

📝 *ID de la cita:* ${savedAppointment.id}

¡Espero tu confirmación! 😊`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${advisor.whatsapp}?text=${encodedMessage}`;

      // Abrir WhatsApp
      window.open(whatsappUrl, '_blank');
      
      // Mostrar mensaje de éxito
      alert('✅ Cita agendada exitosamente. Te hemos redirigido a WhatsApp para confirmar con el asesor.');
      
      setIsSubmitting(false);
      onClose();

    } catch (error) {
      console.error('❌ Error al agendar la cita:', error);
      
      let errorMessage = '❌ Error al agendar la cita. Por favor intenta nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('conexión') || error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = '🌐 Error de conexión. Verifica tu conexión a internet y vuelve a intentar.';
        } else if (error.message.includes('Variables de entorno')) {
          errorMessage = '⚙️ Error de configuración del sistema. Contacta al administrador.';
        } else if (error.message.includes('base de datos')) {
          errorMessage = '💾 Error en la base de datos. Inténtalo nuevamente en unos minutos.';
        }
      }
      
      alert(errorMessage);
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const canProceedFromStep1 = formData.name && formData.email && formData.phone && formData.appointmentType;
  const canProceedFromStep2 = formData.preferredDate && formData.preferredTime && formData.visitType;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Agendar Cita</h2>
              <p className="text-blue-100 mt-1">
                Paso {currentStep} de 3 - {property.title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  step <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          {/* Step 1: Información Personal y Tipo de Cita */}
          {currentStep === 1 && (
            <div className="p-6 space-y-6">
              {/* Información del Asesor */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={advisor.photo}
                    alt={advisor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.error(`❌ Error cargando imagen del asesor ${advisor.name} en modal:`, advisor.photo);
                      target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
                    }}
                    onLoad={() => {
                      console.log(`✅ Imagen del asesor ${advisor.name} cargada en modal:`, advisor.photo);
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {advisor.name}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
                      {advisor.specialty}
                    </p>
                    <div className="flex items-center space-x-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < advisor.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        {advisor.rating}/5 ({advisor.reviews} reseñas)
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Lun-Vie: {advisor.availability?.weekdays || '9:00-18:00'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Phone className="w-4 h-4" />
                        <span>{advisor.whatsapp}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormData('name', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Ingresa tu nombre completo"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Correo electrónico *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateFormData('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de Cita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  ¿Qué tipo de cita necesitas? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointmentTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateFormData('appointmentType', type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        formData.appointmentType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <type.icon className={`w-6 h-6 mt-1 ${
                          formData.appointmentType === type.id 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400'
                        }`} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {type.label}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Fecha, Hora y Modalidad */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Calendario */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Selecciona la fecha
                  </h3>
                  <SimpleCalendar
                    selectedDate={formData.preferredDate}
                    onDateSelect={(date) => updateFormData('preferredDate', date)}
                  />
                </div>

                {/* Horarios */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Selecciona la hora
                  </h3>
                  <TimeSlotSelector
                    selectedTime={formData.preferredTime}
                    onTimeSelect={(time) => updateFormData('preferredTime', time)}
                    disabled={!formData.preferredDate}
                    availableSlots={timeSlots}
                  />

                  {/* Indicador de disponibilidad */}
                  {formData.preferredDate && formData.preferredTime && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                      availabilityStatus.available === true
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : availabilityStatus.available === false
                        ? 'bg-red-50 border-red-200 text-red-800'
                        : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {availabilityStatus.checking ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        ) : availabilityStatus.available === true ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : availabilityStatus.available === false ? (
                          <XCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-blue-600" />
                        )}
                        <span className="text-sm font-medium">
                          {availabilityStatus.message}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modalidad de visita */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  ¿Cómo prefieres la cita? *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {visitTypes.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => updateFormData('visitType', type.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                        formData.visitType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      <type.icon className={`w-8 h-8 mx-auto mb-2 ${
                        formData.visitType === type.id 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : 'text-gray-400'
                      }`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {type.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Detalles Adicionales y Confirmación */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              {/* Resumen */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Resumen de tu cita
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Contacto:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formData.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Propiedad:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{property.title}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Fecha y hora:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formData.preferredDate && new Date(formData.preferredDate).toLocaleDateString('es-CO')} - {formData.preferredTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Modalidad:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {visitTypes.find(t => t.id === formData.visitType)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Número de asistentes
                  </label>
                  <div className="relative">
                    <select
                      value={formData.attendees}
                      onChange={(e) => updateFormData('attendees', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <option key={num} value={num}>{num} persona{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de contacto preferido
                  </label>
                  <div className="relative">
                    <select
                      value={formData.contactMethod}
                      onChange={(e) => updateFormData('contactMethod', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white appearance-none pr-10"
                    >
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Llamada telefónica</option>
                      <option value="email">Correo electrónico</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Solicitudes especiales (opcional)
                </label>
                <textarea
                  value={formData.specialRequests}
                  onChange={(e) => updateFormData('specialRequests', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="¿Hay algo específico que te gustaría saber o alguna consideración especial?"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="marketing"
                  checked={formData.marketingConsent}
                  onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="marketing" className="text-sm text-gray-700 dark:text-gray-300">
                  Acepto recibir información comercial sobre propiedades similares
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer con botones */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={currentStep === 1 ? onClose : prevStep}
              disabled={isSubmitting}
            >
              {currentStep === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={nextStep}
                disabled={
                  (currentStep === 1 && !canProceedFromStep1) ||
                  (currentStep === 2 && !canProceedFromStep2)
                }
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Procesando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-4 h-4" />
                    <span>Confirmar Cita</span>
                  </div>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScheduleAppointmentModal;
