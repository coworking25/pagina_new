import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Clock
} from 'lucide-react';
import Button from '../UI/Button';
import { createServiceInquiry } from '../../lib/supabase';

interface Service {
  icon: any;
  title: string;
  description: string;
  color: string;
  features: string[];
  estimatedTime: string;
  priceRange: string;
  whatsappQuestions: string[];
}

interface ServiceInquiryModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const ServiceInquiryModal: React.FC<ServiceInquiryModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    urgency: 'normal',
    budget: '',
    details: '',
    preferredContact: 'whatsapp',
    specificNeeds: [] as string[]
  });

  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<{question: string, answer: string}[]>([]);

  const advisorPhone = '+57 314 886 04 04';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionToggle = (question: string) => {
    const isSelected = questionsAndAnswers.some(qa => qa.question === question);
    if (isSelected) {
      setQuestionsAndAnswers(prev => prev.filter(qa => qa.question !== question));
    } else {
      setQuestionsAndAnswers(prev => [...prev, { question, answer: '' }]);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setQuestionsAndAnswers(prev =>
      prev.map(qa =>
        qa.question === question ? { ...qa, answer } : qa
      )
    );
  };

  const generateWhatsAppMessage = (consultaId?: string) => {
    const urgencyText = {
      urgent: '🔴 Es urgente - Necesito respuesta hoy',
      normal: '🟡 Normal - En los próximos días',
      flexible: '🟢 Flexible - Cuando tengan tiempo'
    };

    const contactMethod = {
      whatsapp: '📱 WhatsApp',
      phone: '📞 Llamada telefónica',
      email: '📧 Correo electrónico'
    };

    // Fecha y hora actual
    const now = new Date();
    const formattedDate = now.toLocaleDateString('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
    const formattedTime = now.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Construir mensaje mejorado
    let message = `🏠 *CONSULTA SOBRE ${service?.title?.toUpperCase()}*\n\n`;

    // ID de referencia si existe
    if (consultaId) {
      message += `� *Referencia:* #${consultaId.substring(0, 8).toUpperCase()}\n`;
    }
    message += `📅 ${formattedDate}, ${formattedTime}\n\n`;

    message += `─────────────────────\n`;
    message += `👤 *DATOS DEL CLIENTE*\n\n`;
    message += `👋 Nombre: *${formData.name}*\n`;
    message += `📱 Teléfono: ${formData.phone}\n`;
    
    if (formData.email) {
      message += `📧 Email: ${formData.email}\n`;
    }
    
    message += `💬 Contacto preferido: ${contactMethod[formData.preferredContact as keyof typeof contactMethod]}\n\n`;

    message += `─────────────────────\n`;
    message += `📋 *DETALLES DEL SERVICIO*\n\n`;
    message += `🏷️ Servicio: ${service?.title}\n`;
    message += `⏱️ Tiempo estimado: ${service?.estimatedTime}\n`;
    message += `💵 Rango de precios: ${service?.priceRange}\n\n`;

    if (formData.details) {
      message += `📝 *Detalles de la consulta:*\n${formData.details}\n\n`;
    }

    // Preguntas y respuestas con contador
    if (questionsAndAnswers.length > 0) {
      const answeredQuestions = questionsAndAnswers.filter(qa => qa.answer.trim()).length;
      message += `─────────────────────\n`;
      message += `❓ *PREGUNTAS ESPECÍFICAS* (${answeredQuestions}/${questionsAndAnswers.length} respondidas)\n\n`;
      
      questionsAndAnswers.forEach(qa => {
        message += `• *${qa.question}*\n`;
        if (qa.answer.trim()) {
          message += `  ↳ ${qa.answer}\n\n`;
        } else {
          message += `  ↳ (Sin respuesta específica)\n\n`;
        }
      });
    }

    // Presupuesto destacado
    if (formData.budget) {
      message += `─────────────────────\n`;
      message += `💰 *PRESUPUESTO DISPONIBLE*\n`;
      message += `   ${formData.budget}\n\n`;
    }

    // Urgencia
    message += `─────────────────────\n`;
    message += `⏰ *Urgencia:* ${urgencyText[formData.urgency as keyof typeof urgencyText]}\n\n`;

    // Footer con llamado a la acción
    message += `─────────────────────\n`;
    message += `🎯 *PRÓXIMO PASO:*\n`;
    message += `Esperando su pronta respuesta para coordinar los detalles y agendar una cita.\n\n`;
    message += `✨ Consulta generada desde coworkinginmobiliario.com\n`;
    message += `🕐 ${formattedDate}, ${formattedTime}`;

    return message;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Mapear el título del servicio al tipo específico para la BD
      const serviceTypeMap: { [key: string]: string } = {
        'Arrendamientos': 'arrendamientos',
        'Ventas': 'ventas',
        'Avalúos': 'avaluos',
        'Asesorías Contables': 'asesorias-contables',
        'Remodelación': 'remodelacion',
        'Reparación': 'reparacion',
        'Construcción': 'construccion'
      };

      const serviceType = serviceTypeMap[service?.title || ''] || 'arrendamientos';

      // Primero guardar en la base de datos
      const inquiryData = {
        client_name: formData.name,
        client_email: formData.email || undefined,
        client_phone: formData.phone,
        service_type: serviceType as 'arrendamientos' | 'ventas' | 'avaluos' | 'asesorias-contables' | 'remodelacion' | 'reparacion' | 'construccion',
        urgency: formData.urgency as 'urgent' | 'normal' | 'flexible',
        budget: formData.budget || undefined,
        details: formData.details,
        selected_questions: questionsAndAnswers,
        status: 'pending' as const,
        source: 'website' as const
      };

      console.log('💾 Guardando consulta en base de datos:', inquiryData);
      const result = await createServiceInquiry(inquiryData);

      if (!result) {
        throw new Error('No se pudo guardar la consulta en la base de datos');
      }

      console.log('✅ Consulta guardada en BD:', result);

      // Generar y enviar mensaje de WhatsApp con ID de consulta
      const message = generateWhatsAppMessage(result.id);
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${advisorPhone.replace(/\s+/g, '')}?text=${encodedMessage}`;

      console.log('📱 Abriendo WhatsApp con URL:', whatsappUrl);
      window.open(whatsappUrl, '_blank');

      alert('✅ ¡Consulta enviada exitosamente! Se ha guardado en la base de datos y abierto WhatsApp.');

      onClose();
      setStep(1);
      setFormData({
        name: '',
        email: '',
        phone: '',
        urgency: 'normal',
        budget: '',
        details: '',
        preferredContact: 'whatsapp',
        specificNeeds: []
      });
      setQuestionsAndAnswers([]);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Hubo un problema al enviar la consulta. Por favor intenta de nuevo.');
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="space-y-6"
    >
      {/* Service Info */}
      <div className="text-center">
        <div className={`w-16 h-16 bg-gradient-to-r ${service?.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          {service?.icon && <service.icon className="w-8 h-8 text-white" />}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {service?.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          {service?.description}
        </p>
      </div>

      {/* Service Details */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Tiempo Estimado</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{service?.estimatedTime}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Rango de Precios</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{service?.priceRange}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Características:</h4>
          <ul className="space-y-1">
            {service?.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div className="flex justify-end">
        <Button
          onClick={() => setStep(2)}
          icon={ArrowRight}
          iconPosition="right"
          className="px-8"
        >
          Comenzar Consulta
        </Button>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Cuéntanos sobre tu proyecto
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Completa la información para que podamos atenderte mejor
        </p>
      </div>

      {/* Personal Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Tu nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="+57 300 123 4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correo Electrónico
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            placeholder="tu@email.com"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Urgencia
            </label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="urgent">Es urgente - Necesito respuesta hoy</option>
              <option value="normal">Normal - En los próximos días</option>
              <option value="flexible">Flexible - Cuando tengan tiempo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Presupuesto aproximado
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ej: $5,000,000 - $10,000,000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Detalles adicionales
          </label>
          <textarea
            name="details"
            value={formData.details}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            placeholder="Cuéntanos más detalles sobre tu proyecto..."
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(1)}
        >
          Atrás
        </Button>
        <Button
          onClick={() => setStep(3)}
          icon={ArrowRight}
          iconPosition="right"
          disabled={!formData.name || !formData.phone}
        >
          Siguiente
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <form onSubmit={handleSubmit}>
      <motion.div
        initial={{ x: 300 }}
        animate={{ x: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Preguntas específicas
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Selecciona las preguntas que más te interesan para un mejor asesoramiento
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {service?.whatsappQuestions.map((question, index) => {
            const isSelected = questionsAndAnswers.some(qa => qa.question === question);
            const currentAnswer = questionsAndAnswers.find(qa => qa.question === question)?.answer || '';

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border-2 rounded-lg transition-all duration-200 ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => handleQuestionToggle(question)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {question}
                    </span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}>
                      {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3"
                    >
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Tu respuesta..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(2)}
          >
            Atrás
          </Button>
          <Button
            type="submit"
            icon={MessageCircle}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Enviar por WhatsApp
          </Button>
        </div>
      </motion.div>
    </form>
  );

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 300 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 300 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Consulta de Servicio
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div
                    className={`w-12 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
            <span>Información del Servicio</span>
            <span>Datos Personales</span>
            <span>Preguntas Específicas</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ServiceInquiryModal;