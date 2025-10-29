/**
 * ScheduleAppointmentModalEnhanced
 * 
 * PROPÓSITO: Modal de citas MEJORADO para uso PÚBLICO (páginas de usuario final).
 * 
 * CARACTERÍSTICAS:
 * - Multi-paso (3 pasos): Detalles → Fecha/Hora → Confirmación
 * - Validación completa de formularios
 * - Mejor UX con animaciones y feedback visual
 * - Integración con WhatsApp
 * - Tracking de analytics
 * 
 * USAR ESTE MODAL CUANDO:
 * - Se llama desde Properties.tsx (página pública de propiedades)
 * - Se llama desde Advisors.tsx (página pública de asesores)
 * - Se llama desde GlobalModals.tsx (modales globales públicos)
 * - Se necesita una experiencia de usuario completa y profesional
 * 
 * NO USAR PARA:
 * - Dashboard administrativo interno
 * 
 * Para admin/interno, usar: ScheduleAppointmentModal.tsx
 */
import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Property, Advisor } from '../../types';
import Button from '../UI/Button';
import Calendar from '../UI/Calendar';
import { TimeSlotSelector } from '../Calendar/TimeSlotSelector';
import { savePropertyAppointment } from '../../lib/supabase';

interface ScheduleAppointmentModalProps {
  property: Property | null;
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
  specialRequests: string;
  contactMethod: string;
  marketingConsent: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  appointmentType?: string;
  preferredDate?: string;
  preferredTime?: string;
  visitType?: string;
}

// Componente reutilizable para campos de entrada con validación
const InputField = React.memo(({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = false,
  colSpan = 1,
  error,
  field
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: any;
  required?: boolean;
  colSpan?: number;
  error?: string;
  field: string;
}) => (
  <div className={colSpan === 2 ? 'md:col-span-2' : ''}>
    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <Icon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors text-sm ${
          error
            ? 'border-red-500 dark:border-red-400'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${field}-error` : undefined}
      />
    </div>
    {error && (
      <p id={`${field}-error`} className="mt-0.5 sm:mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
        {error}
      </p>
    )}
  </div>
));

const ScheduleAppointmentModalEnhanced: React.FC<ScheduleAppointmentModalProps> = ({
  property,
  advisor,
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const [formData, setFormData] = useState<AppointmentForm>({
    name: '',
    email: '',
    phone: '',
    appointmentType: '',
    preferredDate: '',
    preferredTime: '',
    visitType: '',
    specialRequests: '',
    contactMethod: 'whatsapp',
    marketingConsent: false
  });

  // 🎯 ACCESIBILIDAD: Cerrar modal con tecla ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        // Si hay cambios sin guardar, advertir al usuario
        if (hasUnsavedChanges && currentStep > 1) {
          const confirmClose = window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los cambios no guardados.');
          if (confirmClose) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, hasUnsavedChanges, currentStep, onClose]);

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

  // Funciones de validación
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Formato colombiano: +57 3XX XXX XXXX o variaciones
    const phoneRegex = /^(\+57|57)?[\s-]?[3][0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{4}$/;
    const cleanPhone = phone.replace(/[\s-()]/g, '');
    return phoneRegex.test(cleanPhone) || /^[0-9]{10}$/.test(cleanPhone);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 3 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name.trim());
  };

  const validateStep = (step: number): FormErrors => {
    const errors: FormErrors = {};
    
    if (step >= 1) {
      if (!validateName(formData.name)) {
        errors.name = 'Ingresa un nombre válido (mínimo 3 caracteres, solo letras)';
      }
      if (!validateEmail(formData.email)) {
        errors.email = 'Ingresa un correo electrónico válido';
      }
      if (!validatePhone(formData.phone)) {
        errors.phone = 'Ingresa un número de teléfono colombiano válido';
      }
      if (!formData.appointmentType) {
        errors.appointmentType = 'Selecciona un tipo de cita';
      }
    }
    
    if (step >= 2) {
      if (!formData.preferredDate) {
        errors.preferredDate = 'Selecciona una fecha';
      }
      if (!formData.preferredTime) {
        errors.preferredTime = 'Selecciona una hora';
      }
      if (!formData.visitType) {
        errors.visitType = 'Selecciona una modalidad de visita';
      }
    }
    
    return errors;
  };

  const updateFormData = (field: keyof AppointmentForm, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
    
    // Limpiar errores del campo específico cuando el usuario empiece a escribir
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }
  };

  const handleSubmit = async () => {
    // Validar todos los pasos antes de enviar
    const errors = validateStep(3);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessage('');

    try {
      // 🎯 PASO 1: Preparar datos para WhatsApp PRIMERO (si aplica)
      let whatsappOpened = false;
      
      if (formData.contactMethod === 'whatsapp') {
        const message = formatWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

        console.log('📱 Abriendo WhatsApp ANTES de guardar en BD (iOS/Safari compatible)');

        // 🎯 PASO 2: Abrir WhatsApp INMEDIATAMENTE (antes del await)
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
          whatsappOpened = true;
          
          setTimeout(() => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
          }, 1000);
        } else {
          // Otros navegadores: window.open
          const newWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
          whatsappOpened = !!newWindow;
        }
      }

      // 🎯 PASO 3: Guardar en base de datos (async - no bloquea la apertura)
      const appointmentData = {
        client_name: formData.name.trim(),
        client_email: formData.email.trim().toLowerCase(),
        client_phone: formData.phone.replace(/[\s-()]/g, ''),
        property_id: property?.id || null,
        advisor_id: advisor.id,
        appointment_date: combineDateAndTime(formData.preferredDate, formData.preferredTime),
        appointment_type: formData.appointmentType,
        visit_type: formData.visitType,
        attendees: 1,
        special_requests: formData.specialRequests.trim() || undefined,
        contact_method: formData.contactMethod,
        marketing_consent: formData.marketingConsent
      };
      
      await savePropertyAppointment(appointmentData);
      console.log('✅ Cita guardada en BD correctamente');

      // 🎯 Fallback: Si WhatsApp no se abrió, intentar de nuevo
      if (formData.contactMethod === 'whatsapp' && !whatsappOpened) {
        console.log('⚠️ WhatsApp no se abrió, intentando fallback...');
        const message = formatWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        
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
      }
      
      setSubmissionStatus('success');
      setHasUnsavedChanges(false);
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error: any) {
      console.error('Error al guardar la cita:', error);
      setSubmissionStatus('error');
      
      // Manejo específico de errores
      if (error?.message?.includes('duplicate')) {
        setErrorMessage('Ya existe una cita programada para esta fecha y hora. Por favor selecciona otro horario.');
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        setErrorMessage('Error de conexión. Verifica tu internet e intenta nuevamente.');
      } else if (error?.message?.includes('validation')) {
        setErrorMessage('Los datos ingresados no son válidos. Por favor revísalos e intenta nuevamente.');
      } else {
        setErrorMessage('Hubo un problema al guardar tu cita. Por favor intenta nuevamente.');
      }
      
      // Intentar abrir WhatsApp de todas formas si hubo error (nunca redireccionar)
      if (formData.contactMethod === 'whatsapp') {
        const message = formatWhatsAppMessage();
        const encodedMessage = encodeURIComponent(message);
        const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
        
        console.log('⚠️ Error al guardar cita, pero abriendo WhatsApp de todas formas');
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const combineDateAndTime = (dateStr: string, timeStr: string): string => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    // JavaScript months are 0-based (0 = January, 11 = December)
    const dateObj = new Date(year, month - 1, day, hours, minutes);
    return dateObj.toISOString();
  };
  
  const formatWhatsAppMessage = () => {
    // Formatear fecha para WhatsApp
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

    const propertyInfo = property ? `
Me interesa agendar una cita para la siguiente propiedad:

🏠 *${property.title}*
${property.location ? `📍 ${property.location}\n` : ''}💰 ${property.price.toLocaleString('es-CO', { style: 'currency', currency: 'COP' })}
` : `
Me interesa agendar una cita de asesoría inmobiliaria.
`;

    return `¡Hola ${advisor.name}! 👋
${propertyInfo}
📋 *Datos del contacto:*
• Nombre: ${formData.name}
• Email: ${formData.email}
• Teléfono: ${formData.phone}

📅 *Detalles de la cita:*
• Tipo: ${appointmentTypeLabel}
• Modalidad: ${visitTypeLabel}
• Fecha preferida: ${formatDate(formData.preferredDate)}
• Hora preferida: ${formatTime(formData.preferredTime)}

${formData.specialRequests ? `💭 *Solicitudes especiales:*\n${formData.specialRequests}\n\n` : ''}

¡Espero tu confirmación! 😊`;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Manejo de cierre con confirmación si hay cambios no guardados
  const handleClose = () => {
    if (hasUnsavedChanges && currentStep > 1) {
      if (window.confirm('¿Estás seguro de que quieres cerrar? Se perderán los datos ingresados.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const canProceedFromStep1 = formData.name && formData.email && formData.phone && formData.appointmentType && Object.keys(validateStep(1)).length === 0;
  const canProceedFromStep2 = formData.preferredDate && formData.preferredTime && formData.visitType && Object.keys(validateStep(2)).length === 0;

  if (!isOpen) return null;

  // Estilos específicos responsivos para resolver el problema de los botones cortados
  const modalContainerStyle = {
    maxHeight: '95vh',
    minHeight: '50vh', // Reducido de 60vh
    display: 'flex',
    flexDirection: 'column' as const
  };
  
  // Ajuste AGRESIVO para móviles - garantizar espacio para botones
  const contentStyle = {
    flexGrow: 1,
    overflowY: 'auto' as const,
    // En móvil: MUCHO menos altura para garantizar que los botones sean visibles
    // En desktop: altura normal
    maxHeight: window.innerWidth < 640 
      ? 'calc(95vh - 350px)' // Móvil: 350px reservados para header + footer
      : 'calc(95vh - 200px)', // Desktop: espacio normal (200px)
    minHeight: '150px' // Reducido aún más
  };

  // Manejo de teclas para accesibilidad
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto"
        style={modalContainerStyle}
        role="document"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="modal-title" className="text-lg sm:text-2xl font-bold">Agendar Cita</h2>
              <p id="modal-description" className="text-blue-100 mt-1 text-sm sm:text-base">
                {submissionStatus === 'success' 
                  ? 'Cita agendada exitosamente' 
                  : `Paso ${currentStep} de 3${property ? ` - ${property.title}` : ' - Asesoría Inmobiliaria'}`}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Cerrar modal de agendar cita"
              title="Cerrar (ESC)"
              tabIndex={0}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4 flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  submissionStatus === 'success'
                    ? 'bg-green-400'
                    : step <= currentStep 
                      ? 'bg-white' 
                      : 'bg-white/30'
                }`}
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={3}
                aria-label={`Paso ${step} de 3`}
              />
            ))}
          </div>
        </div>

        {submissionStatus === 'success' ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Cita Agendada Exitosamente
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
              Hemos registrado tu cita para {formData.preferredDate} a las {formData.preferredTime}. 
              El asesor se pondrá en contacto contigo pronto para confirmar los detalles.
            </p>
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        ) : submissionStatus === 'error' ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Error al Agendar
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6 max-w-md">
              {errorMessage || 'Ocurrió un error inesperado. Por favor intenta nuevamente.'}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={() => setSubmissionStatus('idle')}>Intentar Nuevamente</Button>
            </div>
          </div>
        ) : (
          <>
            <div style={contentStyle}>
              {/* Step 1: Información Personal y Tipo de Cita */}
              {currentStep === 1 && (
                <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
                  {/* Información del Asesor - Compacta en móvil */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg sm:rounded-xl p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4">
                      <img
                        src={advisor.photo}
                        alt={advisor.name}
                        className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover object-center border-2 sm:border-3 border-white shadow-md mx-auto sm:mx-0 modal-advisor-image"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          console.error(`❌ Error cargando imagen del asesor ${advisor.name} en modal mejorado:`, advisor.photo);
                          target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=90';
                        }}
                        onLoad={() => {
                          console.log(`✅ Imagen del asesor ${advisor.name} cargada en modal mejorado:`, advisor.photo);
                        }}
                      />
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <h3 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white truncate">
                          {advisor.name}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-base font-medium truncate">
                          {advisor.specialty}
                        </p>
                        {/* Ocultar estrellas en móvil para ahorrar espacio */}
                        <div className="hidden sm:flex items-center justify-center sm:justify-start space-x-1 mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                i < advisor.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 ml-2">
                            {advisor.rating}/5 ({advisor.reviews} reseñas)
                          </span>
                        </div>
                        {/* Info compacta en móvil */}
                        <div className="flex flex-col sm:flex-row items-center space-y-0.5 sm:space-y-0 sm:space-x-4 mt-1 sm:mt-3 text-xs text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate text-xs">Lun-Vie: {advisor.availability?.weekdays || '9:00-18:00'}</span>
                          </div>
                          <div className="hidden sm:flex items-center space-x-1">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span className="truncate">{advisor.whatsapp}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Formulario Personal Compacto en Móvil */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    <InputField
                      key="name-field"
                      label="Nombre completo"
                      type="text"
                      field="name"
                      value={formData.name}
                      onChange={(value) => updateFormData('name', value)}
                      placeholder="Ingresa tu nombre completo"
                      icon={User}
                      required={true}
                      error={formErrors.name}
                    />

                    <InputField
                      key="email-field"
                      label="Correo electrónico"
                      type="email"
                      field="email"
                      value={formData.email}
                      onChange={(value) => updateFormData('email', value)}
                      placeholder="tu@email.com"
                      icon={Mail}
                      required={true}
                      error={formErrors.email}
                    />

                    <InputField
                      key="phone-field"
                      label="Número de teléfono"
                      type="tel"
                      field="phone"
                      value={formData.phone}
                      onChange={(value) => updateFormData('phone', value)}
                      placeholder="+57 300 123 4567"
                      icon={Phone}
                      required={true}
                      colSpan={2}
                      error={formErrors.phone}
                    />
                  </div>

                  {/* Tipo de Cita Compacto en Móvil */}
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-4">
                      ¿Qué tipo de cita necesitas? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-2 sm:gap-4">
                      {appointmentTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateFormData('appointmentType', type.id)}
                          className={`p-2.5 sm:p-6 rounded-lg sm:rounded-xl border-2 transition-all duration-200 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formData.appointmentType === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                          }`}
                          role="radio"
                          aria-checked={formData.appointmentType === type.id}
                          tabIndex={0}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <type.icon className={`w-4 h-4 sm:w-6 sm:h-6 mt-0.5 sm:mt-1 flex-shrink-0 ${
                              formData.appointmentType === type.id 
                                ? 'text-blue-600 dark:text-blue-400' 
                                : 'text-gray-400'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white text-xs sm:text-base">
                                {type.label}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {formErrors.appointmentType && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        {formErrors.appointmentType}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Fecha, Hora y Modalidad */}
              {currentStep === 2 && (
                <div className="p-4 sm:p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Calendario */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Selecciona la fecha
                      </h3>
                      <Calendar
                        selectedDate={formData.preferredDate}
                        onDateSelect={(date) => updateFormData('preferredDate', date)}
                        excludeSundays={true}
                        minDate={new Date()}
                      />
                      {formErrors.preferredDate && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                          {formErrors.preferredDate}
                        </p>
                      )}
                    </div>

                    {/* Horarios */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Selecciona la hora
                      </h3>
                      {formData.preferredDate ? (
                        <TimeSlotSelector
                          selectedDate={new Date(formData.preferredDate)}
                          advisorId={advisor.id}
                          selectedTime={formData.preferredTime}
                          onTimeSelect={(time: string) => updateFormData('preferredTime', time)}
                          onValidationChange={(isValid: boolean, message?: string) => {
                            if (!isValid && message) {
                              setFormErrors(prev => ({ ...prev, preferredTime: message }));
                            } else {
                              setFormErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors.preferredTime;
                                return newErrors;
                              });
                            }
                          }}
                        />
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
                          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">
                            Selecciona una fecha para ver horarios disponibles
                          </p>
                        </div>
                      )}
                      {formErrors.preferredTime && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                          {formErrors.preferredTime}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Modalidad de visita */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                      ¿Cómo prefieres la cita? <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visitTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => updateFormData('visitType', type.id)}
                          className={`p-4 sm:p-5 rounded-lg border-2 transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formData.visitType === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                          }`}
                          role="radio"
                          aria-checked={formData.visitType === type.id}
                          tabIndex={0}
                        >
                          <type.icon className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 ${
                            formData.visitType === type.id 
                              ? 'text-blue-600 dark:text-blue-400' 
                              : 'text-gray-400'
                          }`} />
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                            {type.label}
                          </h4>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {type.description}
                          </p>
                        </button>
                      ))}
                    </div>
                    {formErrors.visitType && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                        {formErrors.visitType}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Detalles Adicionales y Confirmación */}
              {currentStep === 3 && (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Resumen */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Resumen de tu cita
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Contacto:</span>
                        <span className="font-medium text-gray-900 dark:text-white break-all">{formData.name}</span>
                      </div>
                      {property && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 dark:text-gray-400">Propiedad:</span>
                          <span className="font-medium text-gray-900 dark:text-white break-words">{property.title}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Fecha y hora:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formData.preferredDate && new Date(formData.preferredDate).toLocaleDateString('es-CO')} - {formData.preferredTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-400">Modalidad:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {visitTypes.find(t => t.id === formData.visitType)?.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles adicionales */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Método de contacto preferido
                      </label>
                      <select
                        value={formData.contactMethod}
                        onChange={(e) => updateFormData('contactMethod', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="whatsapp">WhatsApp</option>
                        <option value="phone">Llamada telefónica</option>
                        <option value="email">Correo electrónico</option>
                      </select>
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
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      placeholder="¿Hay algo específico que te gustaría saber o alguna consideración especial?"
                      maxLength={500}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
                      {formData.specialRequests.length}/500
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="marketing"
                      checked={formData.marketingConsent}
                      onChange={(e) => updateFormData('marketingConsent', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-0.5"
                    />
                    <label htmlFor="marketing" className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      Acepto recibir información comercial sobre propiedades similares por WhatsApp, correo electrónico o teléfono.
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones mejorado - Optimizado para móviles */}
            <div className="p-3 sm:p-6 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 w-full rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center space-y-2 sm:space-y-0 sm:gap-3">
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleClose : prevStep}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-gray-500 rounded-lg font-medium text-sm sm:text-base text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] transition-colors"
                  aria-label={currentStep === 1 ? 'Cerrar modal' : 'Ir al paso anterior'}
                >
                  {currentStep === 1 ? 'Cancelar' : 'Anterior'}
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !canProceedFromStep1) ||
                      (currentStep === 2 && !canProceedFromStep2)
                    }
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent rounded-lg font-medium text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] transition-colors"
                    aria-label="Ir al siguiente paso"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(validateStep(3)).length > 0}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent rounded-lg font-medium text-sm sm:text-base text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] transition-colors"
                    aria-label="Confirmar y agendar cita"
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
                  </button>
                )}
              </div>
              
              {/* Indicador de paso en móvil */}
              <div className="sm:hidden mt-2 text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Paso {currentStep} de 3
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleAppointmentModalEnhanced;
