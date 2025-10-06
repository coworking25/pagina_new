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
    property_id: property.id,
    advisor_id: advisor.id,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateWhatsAppMessage = () => {
    const inquiryTypeMessages = {
      rent: 'arriendo',
      buy: 'compra',
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

*Tipo de consulta:* ${inquiryTypeMessages[formData.inquiry_type]}
${formData.preferred_contact_time ? `*Horario preferido:* ${formData.preferred_contact_time}` : ''}

${formData.message ? `*Mensaje adicional:*\n${formData.message}` : ''}

¡Espero tu respuesta! 😊`;

    return encodeURIComponent(baseMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      // Registrar tracking de contacto
      await trackPropertyContact(
        String(property.id),
        'whatsapp',
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          inquiry_type: formData.inquiry_type
        }
      );
      
      // Aquí puedes agregar la lógica para guardar en la base de datos
      console.log('Form data:', formData);
      
      // Generar mensaje de WhatsApp y abrir
      const whatsappMessage = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${advisor.whatsapp}?text=${whatsappMessage}`;
      
      window.open(whatsappUrl, '_blank');
      
      // Cerrar modal después de un breve delay
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 1000);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
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

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Información del Asesor */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-4">
                <img
                  src={advisor.photo}
                  alt={advisor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {advisor.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    {advisor.specialty}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{advisor.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{advisor.email}</span>
                    </div>
                  </div>
                  {advisor.availability_hours && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <Clock className="w-4 h-4" />
                      <span>{advisor.availability_hours}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la Propiedad */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">
                Propiedad de Interés
              </h5>
              <p className="text-gray-700 dark:text-gray-300">{property.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{property.location}</p>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400 mt-1">
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  minimumFractionDigits: 0,
                }).format(property.price)}
              </p>
            </div>

            {/* Información de Contacto de la Oficina */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                Información de Contacto
              </h5>
              <div className="space-y-3">
                {/* Ubicación */}
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {CONTACT_INFO.address.street}<br />
                      {CONTACT_INFO.address.building}<br />
                      {CONTACT_INFO.address.plusCode}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(CONTACT_INFO.urls.maps, '_blank')}
                      className="mt-2 text-xs"
                    >
                      Ver en Google Maps
                    </Button>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start space-x-3">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {CONTACT_INFO.schedule.weekdays}<br />
                      {CONTACT_INFO.schedule.weekend}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Tu nombre completo"
                    />
                  </div>
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="tu@email.com"
                  />
                </div>
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
