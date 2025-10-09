import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Send, Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { Property } from '../../types';
import Button from '../UI/Button';
import Modal from '../UI/Modal';
import { CONTACT_INFO } from '../../constants/contact';

interface ContactModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

const schema = yup.object({
  name: yup.string().required('El nombre es requerido'),
  email: yup.string().email('Email inválido').required('El email es requerido'),
  phone: yup.string().required('El teléfono es requerido'),
  message: yup.string().required('El mensaje es requerido'),
});

type FormData = yup.InferType<typeof schema>;

const ContactModal: React.FC<ContactModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Por ahora, solo mostrar el mensaje de éxito
      // En el futuro se puede crear una tabla 'contacts' en Supabase
      console.log('Contact form data:', {
        ...data,
        property_id: property?.id,
        created_at: new Date().toISOString(),
      });

      // Show success message
      alert('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.');
      reset();
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
    }
  };

  const whatsappMessage = property 
    ? `Hola, estoy interesado en la propiedad: ${property.title} ubicada en ${property.location}. Me gustaría obtener más información.`
    : 'Hola, me gustaría obtener información sobre sus propiedades disponibles.';

  const whatsappUrl = `https://wa.me/573148860404?text=${encodeURIComponent(whatsappMessage)}`;

  const handleWhatsAppClick = () => {
    console.log('📱 Abriendo WhatsApp (iOS/Safari compatible)');
    
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

  const handlePhoneClick = () => {
    window.open('tel:+573148860404', '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={property ? `Contacto - ${property.title}` : 'Contacto'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Property Summary */}
        {property && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <img
                src={property.images[0] || 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg'}
                alt={property.title}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {property.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {property.location}
                </p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                  }).format(property.price)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="primary"
            icon={MessageCircle}
            onClick={handleWhatsAppClick}
            className="w-full"
          >
            WhatsApp Directo
          </Button>
          <Button
            variant="outline"
            icon={Phone}
            onClick={handlePhoneClick}
            className="w-full"
          >
            Llamar Ahora
          </Button>
        </div>

        {/* Office Location */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Nuestra Oficina
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {CONTACT_INFO.address.street}<br />
                {CONTACT_INFO.address.building}<br />
                {CONTACT_INFO.address.plusCode}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(CONTACT_INFO.urls.maps, '_blank')}
                className="text-xs"
              >
                Ver en Google Maps
              </Button>
            </div>
          </div>
        </div>

        {/* Business Hours */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                Horarios de Atención
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {CONTACT_INFO.schedule.weekdays}<br />
                {CONTACT_INFO.schedule.weekend}
              </p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              O envía un mensaje
            </span>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tu nombre completo"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                {...register('phone')}
                type="tel"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Tu número de teléfono"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mensaje
            </label>
            <textarea
              {...register('message')}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Cuéntanos qué tipo de propiedad buscas o cualquier pregunta que tengas..."
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.message.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            icon={Send}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default ContactModal;