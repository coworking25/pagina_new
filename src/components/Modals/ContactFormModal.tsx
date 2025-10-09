import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Phone, Mail, Calendar, Clock, Send, User, MapPin } from 'lucide-react';
import { Property, Advisor, ContactForm } from '../../types';
import { trackPropertyContact } from '../../lib/analytics';
import Button from '../UI/Button';
import { CONTACT_INFO } from '../../constants/contact';

interface ContactFormModalProps {
  property: Property;
  advisor: Advisor;
  isOpen: boolean;
  onClose: () => void;
}

const ContactFormModal: React.FC<ContactFormModalProps> = ({
  property,
  advisor,
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    message: '',
    inquiry_type: 'info',
    preferred_contact_time: '',
    property_id: String(property.id),
    advisor_id: advisor.id,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  }>({});

  // 🎯 FUNCIONES DE VALIDACIÓN
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Acepta formatos: 3001234567, 300 123 4567, 300-123-4567, +57 300 123 4567
    const phoneRegex = /^(\+?57\s?)?[3][0-9]{9}$/;
    const cleanPhone = phone.replace(/[\s\-]/g, '');
    return phoneRegex.test(cleanPhone);
  };

  const validateName = (name: string): boolean => {
    // Solo letras, espacios y tildes
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    return nameRegex.test(name.trim());
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (!validateName(formData.name)) {
      newErrors.name = 'El nombre solo puede contener letras y espacios';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Por favor ingresa un email válido (ejemplo@correo.com)';
    }

    // Validar teléfono
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Por favor ingresa un teléfono colombiano válido (300 123 4567)';
    }

    // Validar mensaje
    if (formData.message && formData.message.length > 500) {
      newErrors.message = 'El mensaje no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error del campo cuando el usuario escribe
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const generateWhatsAppMessage = () => {
    const inquiryTypeMessages: Record<string, string> = {
      rent: 'arriendo',
      buy: 'compra',
      sell: 'venta',
      visit: 'agendar una visita',
      info: 'información'
    };

    const baseMessage = `¡Hola ${advisor.name}! 🏠

Me interesa la propiedad: *${property.title}*
📍 Ubicación: ${property.location}
💰 Precio: ${new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(property.price)}

*Datos de contacto:*
👤 Nombre: ${formData.name}
📧 Email: ${formData.email}
📱 Teléfono: ${formData.phone}

*Tipo de consulta:* ${inquiryTypeMessages[formData.inquiry_type] || 'información'}
${formData.preferred_contact_time ? `*Horario preferido:* ${formData.preferred_contact_time}` : ''}

${formData.message ? `*Mensaje adicional:*\n${formData.message}` : ''}

¡Espero tu respuesta! 😊`;

    return encodeURIComponent(baseMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🎯 Validar formulario
    if (!validateForm()) {
      console.log('❌ Formulario con errores de validación');
      return;
    }

    setIsSubmitting(true);

    try {
      // 🎯 PASO 1: Generar mensaje de WhatsApp PRIMERO
      const whatsappMessage = generateWhatsAppMessage();
      const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;

      console.log('📱 Abriendo WhatsApp ANTES del tracking (iOS/Safari compatible)');

      // 🎯 PASO 2: Abrir WhatsApp INMEDIATAMENTE (antes del await)
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      let whatsappOpened = false;

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

      // 🎯 PASO 3: Registrar tracking (async - no bloquea la apertura)
      await trackPropertyContact(
        String(property.id),
        'whatsapp',
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      );
      
      console.log('✅ Tracking registrado correctamente');

      // 🎯 Fallback: Si WhatsApp no se abrió, intentar de nuevo
      if (!whatsappOpened) {
        console.log('⚠️ WhatsApp no se abrió, intentando fallback...');
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
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
      
      // Intentar abrir WhatsApp de todas formas en nueva ventana (nunca redireccionar)
      const whatsappMessage = generateWhatsAppMessage();
      const cleanPhone = advisor.whatsapp.replace(/[\s\-\+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${whatsappMessage}`;
      
      console.log('⚠️ Error en tracking, pero abriendo WhatsApp de todas formas');
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-6 h-6" />
                <h3 className="text-xl font-semibold">Contactar Asesor</h3>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Información del Asesor - Optimizado para Móviles */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              {/* Layout responsivo: columna en móvil, fila en desktop */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-3 sm:space-y-0">
                {/* Foto del asesor */}
                <img
                  src={advisor.photo}
                  alt={advisor.name}
                  className="w-20 h-20 sm:w-16 sm:h-16 rounded-full object-cover mx-auto sm:mx-0 flex-shrink-0"
                />
                
                {/* Información del asesor */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {advisor.name}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {advisor.specialty}
                  </p>
                  
                  {/* Teléfono y Email - Stack en móvil, lado a lado en desktop */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{advisor.phone}</span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start space-x-1">
                      <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{advisor.email}</span>
                    </div>
                  </div>
                  
                  {/* Horarios disponibles */}
                  {advisor.availability_hours && (
                    <div className="flex items-center justify-center sm:justify-start space-x-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 pt-1">
                      <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="text-center sm:text-left">{advisor.availability_hours}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la Propiedad - Optimizado para Móviles */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h5 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                Propiedad de Interés
              </h5>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 line-clamp-2">{property.title}</p>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">{property.location}</p>
              <p className="text-base sm:text-lg font-semibold text-green-600 dark:text-green-400 mt-2">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(property.price)}
              </p>
            </div>

            {/* Información de Contacto de la Oficina - Optimizado para Móviles */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
              <h5 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3">
                Información de Contacto
              </h5>
              <div className="space-y-3">
                {/* Ubicación */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {CONTACT_INFO.address.street}<br />
                      {CONTACT_INFO.address.building}<br />
                      <span className="text-xs">{CONTACT_INFO.address.plusCode}</span>
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(CONTACT_INFO.urls.maps, '_blank')}
                      className="mt-2 text-xs w-full sm:w-auto"
                    >
                      Ver en Google Maps
                    </Button>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {CONTACT_INFO.schedule.weekdays}<br />
                      {CONTACT_INFO.schedule.weekend}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario - Optimizado para Móviles */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {/* Datos Personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.name 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                        errors.phone 
                          ? 'border-red-500 dark:border-red-400' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${
                      errors.email 
                        ? 'border-red-500 dark:border-red-400' 
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="tu@email.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Tipo de Consulta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Consulta
                </label>
                <select
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="info">Solicitar información</option>
                  <option value="visit">Agendar visita</option>
                  <option value="rent">Interés en arriendo</option>
                  <option value="buy">Interés en compra</option>
                </select>
              </div>

              {/* Horario Preferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horario Preferido de Contacto
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="preferred_contact_time"
                    value={formData.preferred_contact_time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Ej: Mañanas entre 9-11 AM"
                  />
                </div>
              </div>

              {/* Mensaje */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje Adicional
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                  placeholder="Cuéntanos más detalles sobre tu consulta..."
                />
              </div>

              {/* Botón de Envío */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  icon={Send}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar por WhatsApp'}
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  Se abrirá WhatsApp con tu mensaje pre-generado
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactFormModal;
