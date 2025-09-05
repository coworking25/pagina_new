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
import { createServiceInquiry, markInquiryAsWhatsAppSent } from '../../lib/supabase';
import type { ServiceInquiry, QuestionAnswer } from '../../types';

interface Service {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
  features: string[];
  whatsappQuestions: string[];
  estimatedTime?: string;
  priceRange?: string;
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

  const [questionsAndAnswers, setQuestionsAndAnswers] = useState<QuestionAnswer[]>([]);

  const advisorPhone = '+57 302 824 04 88';

  if (!service) return null;

  const Icon = service.icon;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionToggle = (question: string) => {
    setQuestionsAndAnswers(prev => {
      const exists = prev.find(qa => qa.question === question);
      if (exists) {
        return prev.filter(qa => qa.question !== question);
      } else {
        return [...prev, { question, answer: '' }];
      }
    });
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setQuestionsAndAnswers(prev =>
      prev.map(qa =>
        qa.question === question ? { ...qa, answer } : qa
      )
    );
  };

  const generateWhatsAppMessage = () => {
    const urgencyText = {
      urgent: 'Es urgente',
      normal: 'No es urgente',
      flexible: 'Tengo flexibilidad de tiempo'
    };

    let message = `🏠 *Consulta sobre ${service.title}*\n\n`;
    message += `👋 Hola, mi nombre es *${formData.name}*\n\n`;
    
    if (formData.details) {
      message += `📝 *Detalles de mi consulta:*\n${formData.details}\n\n`;
    }

    if (questionsAndAnswers.length > 0) {
      message += `❓ *Preguntas y respuestas específicas:*\n`;
      questionsAndAnswers.forEach(qa => {
        message += `• *${qa.question}*\n`;
        if (qa.answer.trim()) {
          message += `  ↳ ${qa.answer}\n`;
        } else {
          message += `  ↳ (Sin respuesta específica)\n`;
        }
      });
      message += '\n';
    }

    if (formData.budget) {
      message += `💰 *Presupuesto aproximado:* ${formData.budget}\n`;
    }

    message += `⏰ *Urgencia:* ${urgencyText[formData.urgency as keyof typeof urgencyText]}\n`;
    message += `📞 *Teléfono:* ${formData.phone}\n`;
    message += `📧 *Email:* ${formData.email}\n\n`;
    message += `Espero tu respuesta. ¡Gracias!`;

    return encodeURIComponent(message);
  };

  const sendToWhatsApp = async () => {
    try {
      console.log('🚀 Iniciando proceso de envío...');
      console.log('📝 Datos del formulario:', formData);
      console.log('🎯 Servicio seleccionado:', service.title);
      console.log('❓ Preguntas y respuestas:', questionsAndAnswers);
      
      // Mapear el nombre del servicio al tipo correcto
      const serviceTypeMap: Record<string, string> = {
        'Arrendamientos': 'arrendamientos',
        'Ventas': 'ventas',
        'Avalúos': 'avaluos',
        'Asesorías Contables': 'asesorias-contables',
        'Remodelación': 'remodelacion',
        'Reparación': 'reparacion',
        'Construcción': 'construccion'
      };
      
      const serviceType = serviceTypeMap[service.title] || service.title.toLowerCase();
      console.log('🔄 Tipo de servicio mapeado:', serviceType);

      // Crear el registro en la base de datos
      const inquiryData: Omit<ServiceInquiry, 'id' | 'created_at' | 'updated_at'> = {
        client_name: formData.name,
        client_email: formData.email || undefined,
        client_phone: formData.phone,
        service_type: serviceType as any,
        urgency: formData.urgency as 'urgent' | 'normal' | 'flexible',
        budget: formData.budget || undefined,
        details: formData.details || undefined,
        selected_questions: questionsAndAnswers.map(qa => qa.question),
        questions_and_answers: questionsAndAnswers,
        status: 'pending',
        source: 'website',
        whatsapp_sent: true
      };

      console.log('📊 Datos a enviar a Supabase:', inquiryData);

      const createdInquiry = await createServiceInquiry(inquiryData);
      console.log('✅ Respuesta de Supabase:', createdInquiry);
      
      if (createdInquiry) {
        console.log('✅ Consulta guardada exitosamente, ID:', createdInquiry.id);
        
        // Marcar como enviado por WhatsApp (no crítico si falla)
        try {
          const markResult = await markInquiryAsWhatsAppSent(createdInquiry.id!);
          console.log('📱 Marcado como enviado por WhatsApp:', markResult);
        } catch (markError) {
          console.warn('⚠️ No se pudo marcar como enviado por WhatsApp, pero no es crítico:', markError);
        }
        
        // Generar y enviar mensaje de WhatsApp
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${advisorPhone.replace(/[\s+()-]/g, '')}?text=${message}`;
        console.log('📱 Abriendo WhatsApp con URL:', whatsappUrl);
        window.open(whatsappUrl, '_blank');
        
        alert('✅ Consulta enviada exitosamente! Se ha guardado en nuestra base de datos y se abrió WhatsApp.');
      } else {
        console.error('❌ Error: No se pudo guardar la consulta');
        alert('❌ Hubo un problema al guardar la consulta, pero se enviará por WhatsApp.');
        
        // Aún así, enviar por WhatsApp
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/${advisorPhone.replace(/[\s+()-]/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error completo en sendToWhatsApp:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('❌ Mensaje de error:', errorMessage);
      
      alert('❌ Error al procesar la consulta: ' + errorMessage + '. Se enviará solo por WhatsApp.');
      
      // En caso de error, al menos enviar por WhatsApp
      const message = generateWhatsAppMessage();
      const whatsappUrl = `https://wa.me/${advisorPhone.replace(/[\s+()-]/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      onClose();
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      className="space-y-6"
    >
      {/* Service Header */}
      <div className={`bg-gradient-to-r ${service.color} rounded-xl p-6 text-white`}>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{service.title}</h3>
            <p className="text-white/90">{service.description}</p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {service.features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </motion.div>
        ))}
      </div>

      {/* Service Info */}
      {(service.estimatedTime || service.priceRange) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {service.estimatedTime && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-300">Tiempo estimado</span>
              </div>
              <p className="text-blue-700 dark:text-blue-400 mt-1">{service.estimatedTime}</p>
            </div>
          )}
          {service.priceRange && (
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900 dark:text-green-300">Rango de precios</span>
              </div>
              <p className="text-green-700 dark:text-green-400 mt-1">{service.priceRange}</p>
            </div>
          )}
        </div>
      )}

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
          Con esta información podremos asesorarte mejor
        </p>
      </div>

      {/* Personal Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre completo *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
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
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Project Details */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Describe tu proyecto o necesidad
        </label>
        <textarea
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          placeholder="Cuéntanos más detalles sobre lo que necesitas..."
        />
      </div>

      {/* Urgency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          ¿Qué tan urgente es tu consulta?
        </label>
        <select
          name="urgency"
          value={formData.urgency}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        >
          <option value="urgent">Es urgente - Necesito respuesta hoy</option>
          <option value="normal">Normal - En los próximos días</option>
          <option value="flexible">Flexible - Cuando tengas tiempo</option>
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Presupuesto aproximado (opcional)
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
          Responde las preguntas que más te interesan para un mejor asesoramiento
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {service.whatsappQuestions.map((question, index) => {
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
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{question}</span>
                </div>
              </div>
              
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 pb-4"
                >
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => handleAnswerChange(question, e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Vista previa del mensaje:
        </h4>
        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line max-h-40 overflow-y-auto">
          {decodeURIComponent(generateWhatsAppMessage()).substring(0, 300)}...
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => setStep(2)}
        >
          Atrás
        </Button>
        <Button 
          onClick={sendToWhatsApp}
          icon={MessageCircle}
          iconPosition="right"
          className="bg-green-600 hover:bg-green-700"
        >
          Enviar por WhatsApp
        </Button>
      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
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
                <div className="flex space-x-1">
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`w-3 h-3 rounded-full ${
                        step >= stepNumber ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">Paso {step} de 3</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ServiceInquiryModal;
