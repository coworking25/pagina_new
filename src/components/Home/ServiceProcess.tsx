import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle,
  Search,
  UserCheck,
  FileCheck,
  Key,
  CheckCircle2
} from 'lucide-react';

const ServiceProcess: React.FC = () => {
  const steps = [
    {
      icon: MessageCircle,
      title: 'Contacto Inicial',
      description: 'Nos cuentas tus necesidades a través de WhatsApp o nuestro formulario',
      color: 'from-blue-500 to-blue-600',
      time: '1 minuto'
    },
    {
      icon: Search,
      title: 'Análisis de Necesidades',
      description: 'Evaluamos tus requerimientos y te asignamos el asesor especializado',
      color: 'from-green-500 to-green-600',
      time: '2-4 horas'
    },
    {
      icon: UserCheck,
      title: 'Asesoría Personalizada',
      description: 'Nuestro experto te presenta las mejores opciones adaptadas a tu perfil',
      color: 'from-purple-500 to-purple-600',
      time: '1-2 días'
    },
    {
      icon: FileCheck,
      title: 'Propuesta Detallada',
      description: 'Recibes un plan detallado con costos, tiempos y especificaciones',
      color: 'from-orange-500 to-orange-600',
      time: '1-3 días'
    },
    {
      icon: Key,
      title: 'Ejecución del Servicio',
      description: 'Iniciamos el trabajo con seguimiento constante y comunicación fluida',
      color: 'from-red-500 to-red-600',
      time: 'Según servicio'
    },
    {
      icon: CheckCircle2,
      title: 'Entrega Satisfactoria',
      description: 'Completamos el servicio y te acompañamos en el proceso de cierre',
      color: 'from-indigo-500 to-indigo-600',
      time: 'Final'
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Nuestro Proceso de Trabajo
        </h3>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          Un proceso estructurado y transparente que garantiza resultados excepcionales
        </p>
      </motion.div>

      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-8 left-8 right-8 h-0.5 bg-gradient-to-r from-blue-500 via-green-500 via-purple-500 via-orange-500 via-red-500 to-indigo-500 hidden lg:block"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                {/* Step Number */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full flex items-center justify-center text-xs font-bold z-10">
                  {index + 1}
                </div>

                {/* Icon Container */}
                <div className="relative mb-6">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-16 h-16 mx-auto bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className={`absolute inset-0 mx-auto w-16 h-16 bg-gradient-to-r ${step.color} rounded-2xl blur-md opacity-30 transition-opacity duration-300`}></div>
                </div>

                {/* Time Badge */}
                <div className="inline-block bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-semibold text-gray-600 dark:text-gray-300 mb-3">
                  {step.time}
                </div>

                {/* Content */}
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        viewport={{ once: true }}
        className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700"
      >
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          ¿Listo para comenzar tu proyecto inmobiliario con nosotros?
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const message = encodeURIComponent(
              '¡Hola! Me interesa iniciar un proyecto inmobiliario con ustedes. ¿Podríamos agendar una cita para conocer más detalles?'
            );
            const whatsappUrl = `https://wa.me/573028240488?text=${message}`;
            
            // 🎯 iOS/Safari compatible
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

            if (isIOS || isSafari) {
              const link = document.createElement('a');
              link.href = whatsappUrl;
              link.target = '_blank';
              link.rel = 'noopener noreferrer';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              window.open(whatsappUrl, '_blank');
            }
          }}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 mx-auto"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Comenzar Ahora por WhatsApp</span>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default ServiceProcess;
