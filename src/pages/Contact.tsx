import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es requerido'),
  phone: yup
    .string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .matches(/^[\d\s\-\+\(\)]+$/, 'Formato de teléfono inválido')
    .required('El teléfono es requerido'),
  subject: yup
    .string()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede exceder 200 caracteres')
    .required('El asunto es requerido'),
  message: yup
    .string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje no puede exceder 1000 caracteres')
    .required('El mensaje es requerido'),
});

type FormData = yup.InferType<typeof schema>;

const Contact: React.FC = () => {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState<string>('');

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
      console.log('📧 Enviando mensaje de contacto:', data);
      setSubmitStatus('idle');
      setSubmitMessage('');

      // Simular envío exitoso (sin guardar en BD por ahora)
      console.log('✅ Mensaje enviado exitosamente (simulado)');
      setSubmitStatus('success');
      setSubmitMessage('¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo en las próximas 24 horas.');
      reset();
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('❌ Error enviando mensaje:', error);
      setSubmitStatus('error');
      
      // Mostrar mensaje de error más específico
      if (error instanceof Error) {
        setSubmitMessage(`Error al enviar el mensaje: ${error.message}. Por favor intenta de nuevo.`);
      } else {
        setSubmitMessage('Error al enviar el mensaje. Por favor verifica tu conexión e intenta de nuevo.');
      }
      
      // Limpiar mensaje de error después de 8 segundos
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 8000);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Ubicación',
      details: ['Carrera 41 #38 Sur - 43', 'Edificio Emporio Local 306', '5C97+F6 Envigado, Antioquia'],
      color: 'from-blue-500 to-blue-600',
      action: () => window.open('https://www.google.com/maps/place/Coworking+Inmobiliario/@6.168695,-75.586939,15z/data=!4m6!3m5!1s0x8e46830032e68b5f:0xe291342f9e551bda!8m2!3d6.1686946!4d-75.5869393!16s%2Fg%2F11vrft7m55?hl=es&entry=ttu&g_ep=EgoyMDI1MDkzMC4wIKXMDSoASAFQAw%3D%3D', '_blank'),
      actionLabel: 'Ver en Google Maps'
    },
    {
      icon: Phone,
      title: 'Teléfono',
      details: ['+57 314 886 0404', '604 202 63 83'],
      color: 'from-green-500 to-green-600',
      action: () => window.open('tel:+573148860404'),
      actionLabel: 'Llamar ahora'
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['inmobiliariocoworking5@gmail.com'],
      color: 'from-purple-500 to-purple-600',
      action: () => window.open('mailto:inmobiliariocoworking5@gmail.com'),
      actionLabel: 'Enviar correo'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['WhatsApp disponible', '+57 314 886 0404'],
      color: 'from-emerald-500 to-emerald-600',
      action: () => window.open('https://wa.me/573148860404?text=Hola, me gustaría obtener información sobre sus servicios', '_blank'),
      actionLabel: 'Abrir WhatsApp'
    },
    {
      icon: Clock,
      title: 'Horarios',
      details: ['Lun - Vie: 9:00 AM - 5:00 PM', 'Sáb - Dom sin atención al cliente'],
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Contáctanos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Estamos aquí para ayudarte a encontrar la propiedad perfecta o resolver cualquier duda que tengas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Envíanos un Mensaje
              </h2>

              {/* Quick Contact Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <Button
                  variant="primary"
                  icon={MessageCircle}
                  onClick={() => window.open('https://wa.me/573148860404?text=Hola, me gustaría obtener información sobre sus servicios', '_blank')}
                  className="w-full"
                >
                  WhatsApp Directo
                </Button>
                <Button
                  variant="outline"
                  icon={Phone}
                  onClick={() => window.open('tel:+573148860404')}
                  className="w-full"
                >
                  Llamar Ahora
                </Button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                    O completa el formulario
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Submit Status Message */}
                {submitMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-center space-x-3 ${
                      submitStatus === 'success' 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}
                  >
                    {submitStatus === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      submitStatus === 'success' 
                        ? 'text-green-800 dark:text-green-200' 
                        : 'text-red-800 dark:text-red-200'
                    }`}>
                      {submitMessage}
                    </span>
                  </motion.div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nombre Completo *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                      Teléfono *
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
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
                    Asunto *
                  </label>
                  <select
                    {...register('subject')}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Selecciona un asunto</option>
                    <option value="Busco propiedad en arriendo">Busco propiedad en arriendo</option>
                    <option value="Busco propiedad en venta">Busco propiedad en venta</option>
                    <option value="Quiero vender mi propiedad">Quiero vender mi propiedad</option>
                    <option value="Quiero arrendar mi propiedad">Quiero arrendar mi propiedad</option>
                    <option value="Solicitar avalúo">Solicitar avalúo</option>
                    <option value="Asesoría contable">Asesoría contable</option>
                    <option value="Servicios de construcción">Servicios de construcción</option>
                    <option value="Otro">Otro</option>
                  </select>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-200"
                    placeholder="Cuéntanos en detalle qué necesitas..."
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
                  size="lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </Card>
          </div>

          {/* Contact Info Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className={`absolute inset-0 bg-gradient-to-r ${info.color} rounded-xl blur-md opacity-30`}></div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                          {info.title}
                        </h3>
                        {info.details.map((detail, detailIndex) => (
                          <p key={detailIndex} className="text-sm text-gray-600 dark:text-gray-400">
                            {detail}
                          </p>
                        ))}
                        {info.action && (
                          <button
                            onClick={info.action}
                            className={`mt-3 inline-flex items-center text-sm font-medium bg-gradient-to-r ${info.color} text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95`}
                          >
                            {info.actionLabel}
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}

            {/* Map */}
            <Card className="p-0 overflow-hidden">
              <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.3!2d-75.5869393!3d6.1686946!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e46830032e68b5f%3A0xe291342f9e551bda!2sCoworking%20Inmobiliario!5e0!3m2!1ses!2sco!4v1725531234567!5m2!1ses!2sco"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                  title="Ubicación exacta: 6.1686946, -75.5869393"
                />
                {/* Enlace para abrir el mapa completo */}
                <div className="absolute bottom-2 right-2">
                  <button
                    onClick={() => window.open('https://www.google.com/maps/place/Coworking+Inmobiliario/@6.1686946,-75.5895142,17z/data=!3m1!4b1!4m6!3m5!1s0x8e46830032e68b5f:0xe291342f9e551bda!8m2!3d6.1686946!4d-75.5869393!16s%2Fg%2F11vrft7m55?entry=ttu&g_ep=EgoyMDI1MDkyMy4wIKXMDSoASAFQAw%3D%3D', '_blank')}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-md text-xs font-medium shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
                    title="Abrir en Google Maps"
                  >
                    📍 Ver en Maps
                  </button>
                </div>
                {/* Coordenadas exactas */}
                <div className="absolute top-2 left-2">
                  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-2 py-1 rounded text-xs font-mono border border-gray-200 dark:border-gray-600">
                    6.1686946, -75.5869393
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;