import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  DollarSign,
  FileText,
  Calculator,
  Hammer,
  Wrench,
  Building,
  CreditCard,
  Scissors,
  ArrowLeft,
  Check,
  Clock,
  DollarSign as PriceIcon,
  MessageCircle,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import ServiceInquiryModal from '../components/Modals/ServiceInquiryModal';
import MortgageCalculator from '../components/UI/MortgageCalculator';

interface Service {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  features: string[];
  estimatedTime: string;
  priceRange: string;
  whatsappQuestions: string[];
  detailedDescription: string;
  benefits: string[];
  process: string[];
}

const ServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const services: Service[] = [
    {
      id: 'arrendamientos',
      icon: Home,
      title: 'Arrendamientos',
      description: 'Encuentra el hogar perfecto para ti con nuestro amplio portafolio de propiedades en arriendo.',
      detailedDescription: 'Nuestro servicio de arrendamientos te ofrece acceso a un portafolio exclusivo de propiedades verificadas, con procesos ágiles y seguros. Contamos con asesoría personalizada para encontrar el inmueble que se ajuste perfectamente a tus necesidades y presupuesto.',
      color: 'from-purple-500 to-purple-600',
      features: ['Propiedades verificadas', 'Proceso ágil', 'Soporte 24/7', 'Contratos seguros', 'Sin comisiones ocultas'],
      benefits: [
        'Acceso a propiedades exclusivas no publicadas',
        'Acompañamiento en todo el proceso de arrendamiento',
        'Asesoría legal gratuita',
        'Gestión de documentos y trámites',
        'Soporte post-arriendo'
      ],
      process: [
        'Análisis de tus necesidades y presupuesto',
        'Búsqueda de propiedades que cumplan tus requisitos',
        'Agendamiento y acompañamiento en visitas',
        'Negociación de condiciones y precio',
        'Revisión y firma de contrato',
        'Entrega de la propiedad'
      ],
      estimatedTime: '1-3 días hábiles',
      priceRange: 'Sin costo inicial',
      whatsappQuestions: [
        '¿Qué tipo de propiedad buscas? (casa, apartamento, local comercial)',
        '¿En qué zona te interesa vivir?',
        '¿Cuál es tu presupuesto mensual para arriendo?',
        '¿Cuándo necesitas mudarte?',
        '¿Cuántas habitaciones necesitas?',
        '¿Tienes mascotas?',
        '¿Necesitas parqueadero?',
        '¿Prefieres propiedad amoblada o sin amoblar?'
      ]
    },
    {
      id: 'ventas',
      icon: DollarSign,
      title: 'Ventas',
      description: 'Compra o vende tu propiedad con la asesoría de nuestros expertos en el mercado inmobiliario.',
      detailedDescription: 'Facilitamos la compra y venta de propiedades con un servicio integral que incluye avalúo gratuito, marketing digital especializado, y negociación experta. Nuestro equipo te acompaña desde la valoración hasta el cierre del negocio.',
      color: 'from-teal-500 to-teal-600',
      features: ['Avalúo gratuito', 'Marketing digital', 'Negociación experta', 'Asesoría legal', 'Financiación'],
      benefits: [
        'Avalúo comercial sin costo',
        'Estrategia de marketing personalizada',
        'Exposición en múltiples plataformas',
        'Base de datos de compradores calificados',
        'Asesoría financiera y legal incluida'
      ],
      process: [
        'Valuación profesional de la propiedad',
        'Diseño de estrategia de venta/compra',
        'Publicación y promoción del inmueble',
        'Filtrado y calificación de interesados',
        'Negociación y cierre del negocio',
        'Acompañamiento en escrituración'
      ],
      estimatedTime: '30-90 días',
      priceRange: 'Comisión competitiva',
      whatsappQuestions: [
        '¿Quieres comprar o vender una propiedad?',
        '¿Qué tipo de propiedad te interesa?',
        '¿En qué zona estás buscando?',
        '¿Cuál es tu presupuesto o precio esperado?',
        '¿Es tu primera compra/venta?',
        '¿Necesitas asesoría en financiación?',
        '¿Tienes alguna propiedad para dar en parte de pago?',
        '¿Cuándo planeas realizar la operación?'
      ]
    },
    {
      id: 'avaluos',
      icon: FileText,
      title: 'Avalúos',
      description: 'Obtén el valor real de tu propiedad con nuestros avalúos técnicos certificados.',
      detailedDescription: 'Realizamos avalúos técnicos certificados con metodología profesional reconocida. Nuestros avalúos son válidos para entidades financieras, procesos judiciales, sucesiones y negociaciones comerciales.',
      color: 'from-teal-500 to-teal-600',
      features: ['Certificación oficial', 'Metodología técnica', 'Entrega rápida', 'Válido para bancos', 'Inspección completa'],
      benefits: [
        'Avalúo certificado y reconocido',
        'Metodología avalada por entidades financieras',
        'Informe técnico detallado',
        'Fotografías y evidencia documental',
        'Soporte y aclaraciones incluidas'
      ],
      process: [
        'Solicitud y cotización del avalúo',
        'Agendamiento de inspección técnica',
        'Visita y levantamiento de información',
        'Análisis de mercado y comparables',
        'Elaboración del informe técnico',
        'Entrega del avalúo certificado'
      ],
      estimatedTime: '3-5 días hábiles',
      priceRange: '$150,000 - $500,000',
      whatsappQuestions: [
        '¿Para qué necesitas el avalúo? (venta, crédito, sucesión, etc.)',
        '¿Qué tipo de propiedad es? (casa, apartamento, lote, etc.)',
        '¿Cuál es la dirección exacta de la propiedad?',
        '¿Cuántos metros cuadrados tiene aproximadamente?',
        '¿La propiedad está ocupada o desocupada?',
        '¿Tienes escrituras de la propiedad?',
        '¿Hay urgencia en la entrega del avalúo?',
        '¿Necesitas el avalúo para una entidad específica?'
      ]
    },
    {
      id: 'hipotecas',
      icon: CreditCard,
      title: 'Hipotecas',
      description: 'Es un préstamo para comprar, mejorar o construir vivienda, dejando el inmueble como garantía. Se paga en cuotas mensuales durante un plazo acordado.',
      detailedDescription: 'Te ayudamos a obtener el mejor crédito hipotecario comparando opciones de diferentes entidades financieras. Incluye pre-aprobación, análisis de capacidad de pago, y acompañamiento en todo el proceso de financiación.',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Pre-aprobación rápida', 'Comparación de tasas', 'Acompañamiento completo', 'Sin costos adicionales', 'Mejora de score'],
      benefits: [
        'Permite adquirir vivienda sin pagar todo de contado',
        'Ayuda a construir patrimonio',
        'Ofrece plazos y condiciones flexibles',
        'Es una inversión segura',
        'Mejora tu perfil crediticio'
      ],
      process: [
        'Análisis de perfil crediticio',
        'Evaluación de capacidad de pago',
        'Comparación de opciones bancarias',
        'Solicitud y radicación de crédito',
        'Gestión de aprobación',
        'Desembolso y cierre del crédito'
      ],
      estimatedTime: '7-15 días hábiles',
      priceRange: 'Sin costo adicional',
      whatsappQuestions: [
        '¿Cuál es el valor de la propiedad que quieres comprar?',
        '¿Cuánto tienes ahorrado para la cuota inicial?',
        '¿Cuál es tu ingreso mensual?',
        '¿Tienes codeudor o aval?',
        '¿Has revisado tu historial crediticio?',
        '¿Qué plazo de financiación prefieres?',
        '¿Necesitas asesoría para mejorar tu score crediticio?',
        '¿Quieres comparar opciones de diferentes bancos?'
      ]
    },
    {
      id: 'desenglobes',
      icon: Scissors,
      title: 'Desenglobes',
      description: 'Servicios de subdivisión y desenglobe de propiedades para optimizar tu inversión inmobiliaria.',
      detailedDescription: 'Gestionamos el proceso completo de desenglobe de propiedades, desde la tramitología hasta el registro notarial. Ideal para maximizar el valor de tu inversión inmobiliaria mediante la subdivisión legal de terrenos o inmuebles.',
      color: 'from-purple-500 to-purple-600',
      features: ['Tramitología completa', 'Planos actualizados', 'Registro en notarías', 'Asesoría urbanística', 'Gestión integral'],
      benefits: [
        'Maximización del valor de tu propiedad',
        'Gestión completa de trámites legales',
        'Actualización catastral incluida',
        'Asesoría en normativa urbanística',
        'Acompañamiento notarial'
      ],
      process: [
        'Estudio de viabilidad del desenglobe',
        'Elaboración de planos arquitectónicos',
        'Trámites ante curaduría urbana',
        'Actualización catastral',
        'Registro de nuevas matrículas',
        'Entrega de escrituras independientes'
      ],
      estimatedTime: '30-60 días hábiles',
      priceRange: '$5,000,000 - $15,000,000',
      whatsappQuestions: [
        '¿Qué tipo de propiedad quieres desenglobar?',
        '¿Dónde está ubicada la propiedad?',
        '¿Cuántas unidades quieres crear?',
        '¿Tienes planos arquitectónicos actualizados?',
        '¿La propiedad está inscrita en el registro?',
        '¿Necesitas asesoría legal para el proceso?',
        '¿Quieres vender las unidades por separado?',
        '¿Tienes restricciones urbanísticas?'
      ]
    },
    {
      id: 'remodelacion',
      icon: Hammer,
      title: 'Remodelación',
      description: 'Transforma tu espacio con nuestros servicios de remodelación y diseño interior.',
      detailedDescription: 'Ofrecemos servicios completos de remodelación con diseño personalizado, materiales de primera calidad y garantía extendida. Desde cocinas y baños hasta remodelaciones completas de vivienda o local comercial.',
      color: 'from-teal-500 to-teal-600',
      features: ['Diseño personalizado', 'Materiales de calidad', 'Garantía extendida', 'Cronograma definido', 'Presupuesto cerrado'],
      benefits: [
        'Diseño 3D previo a la obra',
        'Selección de materiales premium',
        'Mano de obra calificada',
        'Garantía de 2 años',
        'Limpieza y entrega impecable'
      ],
      process: [
        'Consulta inicial y toma de medidas',
        'Diseño 3D y cotización detallada',
        'Selección de materiales y acabados',
        'Inicio de obra y demolición',
        'Construcción y acabados',
        'Limpieza final y entrega'
      ],
      estimatedTime: '15-60 días',
      priceRange: '$2,000,000 - $50,000,000',
      whatsappQuestions: [
        '¿Qué espacios quieres remodelar? (cocina, baño, sala, etc.)',
        '¿Cuál es el tamaño aproximado del área a remodelar?',
        '¿Tienes un diseño específico en mente?',
        '¿Cuál es tu presupuesto aproximado?',
        '¿Cuándo te gustaría iniciar la remodelación?',
        '¿Necesitas incluir plomería o electricidad?',
        '¿Prefieres materiales específicos?',
        '¿La propiedad está habitada durante la remodelación?'
      ]
    },
    {
      id: 'reparacion',
      icon: Wrench,
      title: 'Reparación',
      description: 'Mantenimiento y reparaciones para mantener tu propiedad en perfecto estado.',
      detailedDescription: 'Servicio de reparaciones y mantenimiento con técnicos certificados disponibles 24/7. Atendemos emergencias y trabajos programados de plomería, electricidad, pintura, y más.',
      color: 'from-teal-500 to-teal-600',
      features: ['Servicio 24/7', 'Técnicos certificados', 'Presupuesto sin costo', 'Garantía en trabajos', 'Respuesta rápida'],
      benefits: [
        'Atención de emergencias 24/7',
        'Personal técnico calificado',
        'Diagnóstico y presupuesto gratuito',
        'Garantía en todas las reparaciones',
        'Repuestos originales'
      ],
      process: [
        'Solicitud de servicio',
        'Diagnóstico técnico gratuito',
        'Cotización y aprobación',
        'Ejecución de la reparación',
        'Pruebas y verificación',
        'Garantía y seguimiento'
      ],
      estimatedTime: '1-7 días',
      priceRange: '$100,000 - $2,000,000',
      whatsappQuestions: [
        '¿Qué tipo de reparación necesitas?',
        '¿Es una emergencia o puede esperar?',
        '¿Dónde está ubicada la propiedad?',
        '¿Cuándo podrías recibir la visita técnica?',
        '¿Tienes fotos del problema o daño?',
        '¿Necesitas reparación eléctrica, plomería o estructural?',
        '¿Es una reparación menor o mayor?',
        '¿Tienes seguros que cubran la reparación?'
      ]
    },
    {
      id: 'construccion',
      icon: Building,
      title: 'Construcción',
      description: 'Proyectos de construcción desde cero con los más altos estándares de calidad.',
      detailedDescription: 'Desarrollamos proyectos de construcción llave en mano, desde viviendas unifamiliares hasta edificios comerciales. Incluye licencias, supervisión técnica y garantía estructural.',
      color: 'from-purple-500 to-purple-600',
      features: ['Licencias incluidas', 'Supervisión técnica', 'Entrega garantizada', 'Cronograma detallado', 'Materiales certificados'],
      benefits: [
        'Gestión completa de licencias y permisos',
        'Supervisión de ingeniero residente',
        'Garantía estructural de 10 años',
        'Cronograma de obra con hitos',
        'Acabados de primera calidad'
      ],
      process: [
        'Estudio de suelo y viabilidad',
        'Diseño arquitectónico y estructural',
        'Tramitación de licencias',
        'Construcción de obra negra',
        'Acabados y detalles',
        'Entrega con garantía'
      ],
      estimatedTime: '6-18 meses',
      priceRange: '$80,000,000 - $500,000,000',
      whatsappQuestions: [
        '¿Qué tipo de construcción planeas? (casa, edificio, local)',
        '¿Ya tienes el lote o terreno?',
        '¿Cuántos metros cuadrados quieres construir?',
        '¿Tienes planos arquitectónicos?',
        '¿Cuál es tu presupuesto total para la construcción?',
        '¿Cuándo te gustaría iniciar la construcción?',
        '¿Necesitas ayuda con licencias y permisos?',
        '¿Tienes especificaciones técnicas específicas?'
      ]
    },
    {
      id: 'asesorias-contables',
      icon: Calculator,
      title: 'Asesorías Contables',
      description: 'Servicios contables y tributarios especializados para el sector inmobiliario.',
      detailedDescription: 'Asesoría contable y tributaria especializada en el sector inmobiliario. Incluye declaración de renta, optimización tributaria, y consultoría legal para personas naturales y jurídicas con inversiones en finca raíz.',
      color: 'from-purple-500 to-purple-600',
      features: ['Declaración de renta', 'Optimización tributaria', 'Consultoría legal', 'Revisión fiscal', 'Asesoría personalizada'],
      benefits: [
        'Ahorro en impuestos mediante estrategias legales',
        'Cumplimiento normativo garantizado',
        'Revisión de obligaciones fiscales',
        'Asesoría en constitución de empresas',
        'Soporte en auditorías'
      ],
      process: [
        'Diagnóstico de situación tributaria',
        'Análisis de optimización fiscal',
        'Elaboración de declaraciones',
        'Presentación ante DIAN',
        'Seguimiento y respuestas',
        'Asesoría continua'
      ],
      estimatedTime: '5-15 días hábiles',
      priceRange: '$200,000 - $1,500,000',
      whatsappQuestions: [
        '¿Qué tipo de asesoría contable necesitas?',
        '¿Eres persona natural o jurídica?',
        '¿Tienes propiedades en arriendo?',
        '¿Has vendido alguna propiedad este año?',
        '¿Necesitas ayuda con la declaración de renta?',
        '¿Tienes dudas sobre impuestos inmobiliarios?',
        '¿Manejas inversiones en finca raíz?',
        '¿Necesitas constitución de empresa inmobiliaria?'
      ]
    }
  ];

  useEffect(() => {
    const service = services.find(s => s.id === serviceId);
    setSelectedService(service || null);
  }, [serviceId]);

  if (!selectedService) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Servicio no encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            El servicio que buscas no existe o ha sido movido.
          </p>
          <Button onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    );
  }

  const ServiceIcon = selectedService.icon;

  const handleContactClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver</span>
        </motion.button>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden mb-12"
        >
          <div className={`bg-gradient-to-r ${selectedService.color} p-8 md:p-12`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <ServiceIcon className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {selectedService.title}
                </h1>
                <p className="text-white/90 mt-2 text-lg">
                  {selectedService.description}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Estimated Time */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo Estimado</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedService.estimatedTime}
                  </p>
                </div>
              </div>

              {/* Price Range */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <PriceIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Rango de Precio</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedService.priceRange}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center">
                <Button
                  variant="primary"
                  onClick={handleContactClick}
                  className="w-full"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Solicitar Información
                </Button>
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
              {selectedService.detailedDescription}
            </p>
          </div>
        </motion.div>

        {/* Calculator for Hipotecas */}
        {selectedService.id === 'hipotecas' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Calculadora de Hipoteca
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Calcula tu cuota mensual aproximada
                  </p>
                </div>
              </div>
              <MortgageCalculator />
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Features & Benefits */}
          <div className="lg:col-span-2 space-y-8">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Características Principales
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedService.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Beneficios del Servicio
                </h2>
                <ul className="space-y-3">
                  {selectedService.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>

            {/* Process */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Proceso Paso a Paso
                </h2>
                <div className="space-y-4">
                  {selectedService.process.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${selectedService.color} flex items-center justify-center text-white font-bold text-sm`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700 dark:text-gray-300">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - CTA & Contact */}
          <div className="space-y-8">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-24"
            >
              <Card className={`p-8 bg-gradient-to-br ${selectedService.color} text-white`}>
                <div className="text-center mb-6">
                  <ServiceIcon className="w-16 h-16 mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">¿Listo para comenzar?</h3>
                  <p className="text-white/90">
                    Obtén una cotización personalizada sin compromiso
                  </p>
                </div>

                <div className="space-y-4">
                  <Button
                    variant="secondary"
                    onClick={handleContactClick}
                    className="w-full bg-white text-gray-900 hover:bg-gray-100"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Solicitar Cotización
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/contact')}
                    className="w-full border-white text-white hover:bg-white/10"
                  >
                    <Mail className="w-5 h-5 mr-2" />
                    Enviar Mensaje
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => navigate('/advisors')}
                    className="w-full border-white text-white hover:bg-white/10"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Agendar Cita
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-sm text-white/80 text-center">
                    ¿Tienes preguntas? Contáctanos directamente
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Phone className="w-4 h-4" />
                    <a href="tel:+573028108090" className="text-sm font-medium hover:underline">
                      +57 302 810 80 90
                    </a>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Service Inquiry Modal */}
      <ServiceInquiryModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default ServiceDetail;
