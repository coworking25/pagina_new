import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Search,
  Home,
  DollarSign,
  FileText,
  Briefcase,
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  CheckCircle,
  Clock,
  Shield,
  Users
} from 'lucide-react';
import Card from '../components/UI/Card';
import { CONTACT_INFO } from '../constants/contact';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'Todas', icon: HelpCircle },
    { id: 'arrendamiento', name: 'Arrendamiento', icon: Home },
    { id: 'venta', name: 'Compra/Venta', icon: DollarSign },
    { id: 'servicios', name: 'Servicios', icon: Briefcase },
    { id: 'legal', name: 'Legal', icon: FileText }
  ];

  const faqs: FAQItem[] = [
    // ARRENDAMIENTO
    {
      id: 'arr-1',
      category: 'arrendamiento',
      question: '¿Qué documentos necesito para arrendar una propiedad?',
      answer: 'Para arrendar una propiedad necesitas: 1) Cédula de ciudadanía o documento de identidad, 2) Certificado laboral o estados financieros (actividad independiente), 3) Últimas 3 declaraciones de renta o certificado de ingresos, 4) Referencias personales y comerciales, 5) Carta de aprobación de codeudor (si aplica). Nuestro equipo te ayudará a preparar toda la documentación necesaria.'
    },
    {
      id: 'arr-2',
      category: 'arrendamiento',
      question: '¿Cuánto tiempo tarda el proceso de arrendamiento?',
      answer: 'El proceso completo de arrendamiento puede tomar entre 1 y 3 días hábiles una vez entregada toda la documentación. Esto incluye: verificación de referencias (1 día), aprobación del propietario (1 día), y firma del contrato (1 día). En casos urgentes, podemos agilizar el proceso coordinando con todas las partes involucradas.'
    },
    {
      id: 'arr-3',
      category: 'arrendamiento',
      question: '¿Necesito codeudor para arrendar?',
      answer: 'Depende de varios factores como tus ingresos, historial crediticio y el valor del arriendo. Generalmente se requiere codeudor cuando: 1) El arriendo supera el 30% de tus ingresos, 2) Eres trabajador independiente sin respaldo financiero, 3) No tienes historial de arrendamientos previos. El codeudor debe tener ingresos que respalden 2 veces el valor del arriendo.'
    },
    {
      id: 'arr-4',
      category: 'arrendamiento',
      question: '¿Puedo tener mascotas en la propiedad arrendada?',
      answer: 'La política de mascotas varía según cada propiedad. Muchos propietarios permiten mascotas con condiciones específicas: 1) Pago de depósito adicional para mascotas, 2) Límite en el tamaño o número de mascotas, 3) Compromiso de mantener la propiedad en buen estado. Te ayudamos a encontrar propiedades pet-friendly que se ajusten a tus necesidades.'
    },
    {
      id: 'arr-5',
      category: 'arrendamiento',
      question: '¿Qué incluye el canon de arrendamiento?',
      answer: 'El canon de arrendamiento generalmente incluye solo el uso de la propiedad. Los servicios públicos (agua, luz, gas, internet) normalmente van por cuenta del arrendatario. Sin embargo, en algunos casos se incluye administración (edificios o conjuntos). Es importante verificar qué está incluido antes de firmar el contrato. Te asesoramos para entender todos los costos asociados.'
    },

    // COMPRA/VENTA
    {
      id: 'ven-1',
      category: 'venta',
      question: '¿Cuánto cuesta vender mi propiedad con ustedes?',
      answer: 'Nuestra comisión es competitiva y solo se cobra al cierre exitoso de la venta. El porcentaje varía según el valor de la propiedad, pero generalmente está entre 3% y 5% del precio de venta. Incluye: avalúo comercial gratuito, marketing digital completo, fotografía profesional, acompañamiento en visitas, negociación y trámites hasta la escrituración.'
    },
    {
      id: 'ven-2',
      category: 'venta',
      question: '¿Cuánto tiempo tarda en venderse una propiedad?',
      answer: 'El tiempo promedio de venta depende de varios factores: ubicación, precio, condiciones del mercado y estado de la propiedad. En promedio: propiedades bien ubicadas y con precio competitivo (30-60 días), propiedades en zonas premium (60-90 días), propiedades que requieren ajuste de precio o mejoras (90+ días). Nuestro equipo optimiza este tiempo con estrategias de marketing efectivas.'
    },
    {
      id: 'ven-3',
      category: 'venta',
      question: '¿Necesito hacer reparaciones antes de vender?',
      answer: 'No es obligatorio, pero pequeñas mejoras pueden aumentar significativamente el valor y acelerar la venta. Recomendamos: 1) Pintura fresca y limpieza profunda (ROI: 200%), 2) Reparaciones menores (grifería, enchufes, etc.), 3) Mejorar iluminación y presentación. Ofrecemos servicio de home staging y te asesoramos sobre qué mejoras valen la pena según tu presupuesto y el mercado.'
    },
    {
      id: 'ven-4',
      category: 'venta',
      question: '¿Qué es el avalúo y por qué es importante?',
      answer: 'El avalúo es una valoración técnica profesional que determina el precio real de tu propiedad. Es importante porque: 1) Te ayuda a fijar un precio competitivo, 2) Es requerido por bancos para créditos hipotecarios, 3) Evita sobrevalorar o subvalorar tu inmueble, 4) Acelera el proceso de venta. Ofrecemos avalúo gratuito al contratar nuestros servicios de venta.'
    },
    {
      id: 'ven-5',
      category: 'venta',
      question: '¿Puedo comprar sin cuota inicial?',
      answer: 'Aunque la mayoría de bancos requieren cuota inicial (20-30% del valor), existen alternativas: 1) Subsidios de vivienda del gobierno (hasta 30 SMLV), 2) Créditos constructores con cuota inicial reducida, 3) Leasing habitacional, 4) Programas especiales para primeros compradores. Te asesoramos para encontrar la mejor opción de financiación según tu perfil y capacidad de pago.'
    },

    // SERVICIOS
    {
      id: 'ser-1',
      category: 'servicios',
      question: '¿Qué incluye el servicio de remodelación?',
      answer: 'Nuestro servicio de remodelación es integral e incluye: 1) Diseño 3D previo, 2) Cotización detallada con cronograma, 3) Mano de obra calificada, 4) Materiales de primera calidad, 5) Gestión de permisos si se requieren, 6) Limpieza y entrega final, 7) Garantía de 2 años en acabados. Trabajamos desde remodelaciones pequeñas (baños, cocinas) hasta proyectos completos de vivienda.'
    },
    {
      id: 'ser-2',
      category: 'servicios',
      question: '¿Hacen avalúos para cualquier tipo de propiedad?',
      answer: 'Sí, realizamos avalúos certificados para todo tipo de propiedades: viviendas (casas, apartamentos), lotes urbanizables, locales comerciales, bodegas, edificios completos, propiedades rurales. Nuestros avalúos son válidos para: entidades financieras, procesos judiciales, sucesiones, negociaciones comerciales, declaraciones tributarias. Entrega en 3-5 días hábiles con informe técnico completo.'
    },
    {
      id: 'ser-3',
      category: 'servicios',
      question: '¿Ofrecen asesoría en créditos hipotecarios?',
      answer: 'Sí, ofrecemos asesoría completa sin costo adicional. Nuestro servicio incluye: 1) Análisis de tu perfil crediticio, 2) Comparación entre bancos y tasas, 3) Cálculo de capacidad de pago real, 4) Pre-aprobación de crédito, 5) Acompañamiento en radicación, 6) Seguimiento hasta el desembolso. Trabajamos con todos los bancos del país para ofrecerte las mejores opciones.'
    },
    {
      id: 'ser-4',
      category: 'servicios',
      question: '¿Qué es un desenglobe y cuándo lo necesito?',
      answer: 'El desenglobe es separar legalmente una propiedad grande en unidades independientes. Lo necesitas cuando: 1) Quieres vender por partes un lote grande, 2) Deseas crear apartamentos independientes de una casa, 3) Separar locales comerciales, 4) Herencias con múltiples herederos. El proceso incluye: trámites ante curaduría, actualización catastral, nuevas matrículas, escrituración. Tiempo: 30-60 días.'
    },
    {
      id: 'ser-5',
      category: 'servicios',
      question: '¿Atienden emergencias de reparación?',
      answer: 'Sí, nuestro servicio de reparaciones está disponible 24/7 para emergencias como: fugas de agua, fallas eléctricas, daños estructurales urgentes, problemas de seguridad. Para emergencias: llámanos directamente al +57 302 810 80 90. Tiempo de respuesta: 2-4 horas en Bogotá. Para reparaciones no urgentes, agenda una visita técnica gratuita y recibe cotización sin compromiso.'
    },

    // LEGAL Y PROCESOS
    {
      id: 'leg-1',
      category: 'legal',
      question: '¿Qué documentos necesito para vender mi propiedad?',
      answer: 'Para vender necesitas: 1) Escritura pública de la propiedad, 2) Certificado de tradición y libertad reciente (máximo 30 días), 3) Paz y salvo de impuesto predial, 4) Paz y salvo de administración (si aplica), 5) Cédula de ciudadanía, 6) Certificado de libertad de gravámenes. Si la propiedad está hipotecada, necesitas paz y salvo del banco. Te ayudamos a obtener todos los documentos.'
    },
    {
      id: 'leg-2',
      category: 'legal',
      question: '¿Cuánto cuesta la escrituración?',
      answer: 'Los costos de escrituración incluyen: 1) Derechos notariales (aprox. 0.3% del valor), 2) Registro en oficina de instrumentos públicos (0.5-1%), 3) Beneficencia (1-2% en algunas ciudades), 4) Retención en la fuente (1% si aplica). Total aproximado: 2-4% del valor de venta. Importante: estos costos normalmente los asume el comprador, pero son negociables.'
    },
    {
      id: 'leg-3',
      category: 'legal',
      question: '¿Qué es el certificado de tradición y libertad?',
      answer: 'Es el documento oficial que contiene toda la historia jurídica de una propiedad: propietario actual, hipotecas, embargos, limitaciones. Es fundamental porque: 1) Verifica la legalidad de la propiedad, 2) Muestra si tiene deudas o gravámenes, 3) Confirma que el vendedor es el dueño legítimo, 4) Es requisito para créditos hipotecarios. Debe estar vigente (máximo 30 días) al momento de la compra.'
    },
    {
      id: 'leg-4',
      category: 'legal',
      question: '¿Qué impuestos debo pagar al vender?',
      answer: 'Al vender una propiedad pagas: 1) Impuesto de ganancia ocasional (10% sobre la ganancia si vendes a mayor valor que el comprado), 2) Retención en la fuente (1% del valor de venta, descontable en declaración), 3) IVA (solo en propiedades nuevas, asumido por comprador). Importante: si es tu única vivienda y la habitas hace +2 años, puedes estar exento. Te asesoramos contablemente.'
    },
    {
      id: 'leg-5',
      category: 'legal',
      question: '¿Puedo cancelar un contrato de compraventa?',
      answer: 'Depende de la etapa: 1) Promesa de compraventa: sí, con penalidades (generalmente pierdes el anticipo), 2) Después de escrituración: no, salvo vicios ocultos graves, 3) Arras: sí, pagando el doble de las arras entregadas. Es fundamental leer bien las cláusulas antes de firmar. Recomendamos asesoría legal en todas las transacciones para proteger tus intereses.'
    },

    // GENERALES
    {
      id: 'gen-1',
      category: 'servicios',
      question: '¿Cobran por las visitas a propiedades?',
      answer: 'No, las visitas a propiedades son completamente gratuitas. Nuestro servicio incluye: coordinación de citas, acompañamiento de un asesor experto, transporte entre propiedades (si son varias el mismo día), información detallada de cada inmueble, asesoría sin compromiso. Solo pagamos comisión en caso de concretar un arriendo o compra.'
    },
    {
      id: 'gen-2',
      category: 'servicios',
      question: '¿Trabajan con propiedades en otras ciudades?',
      answer: 'Actualmente nos especializamos en Bogotá y municipios cercanos (Chía, Cajicá, La Calera, Soacha). Para otras ciudades, contamos con una red de aliados estratégicos que manejan los mismos estándares de calidad. Si buscas propiedad fuera de nuestra zona, te conectamos con asesores de confianza en otras regiones del país.'
    },
    {
      id: 'gen-3',
      category: 'servicios',
      question: '¿Puedo agendar una cita fuera del horario laboral?',
      answer: 'Sí, entendemos que muchos clientes trabajan en horarios tradicionales. Ofrecemos: 1) Visitas en horarios extendidos (hasta 7pm entre semana), 2) Citas los sábados y domingos, 3) Reuniones virtuales en el horario que prefieras, 4) Servicio de emergencias 24/7 para reparaciones. Contáctanos y coordinamos según tu disponibilidad.'
    },
    {
      id: 'gen-4',
      category: 'servicios',
      question: '¿Ofrecen garantía en sus servicios?',
      answer: 'Sí, todos nuestros servicios tienen garantía: 1) Remodelación: 2 años en acabados y mano de obra, 2) Construcción: 10 años garantía estructural, 3) Reparaciones: 6 meses en trabajos realizados, 4) Avalúos: Validez de 6 meses para entidades financieras. Además, brindamos soporte post-servicio para cualquier duda o ajuste necesario.'
    },
    {
      id: 'gen-5',
      category: 'arrendamiento',
      question: '¿Qué pasa si tengo problemas con el propietario/arrendatario?',
      answer: 'Actuamos como mediadores para resolver conflictos: 1) Problemas de pago: coordinamos planes de pago o soluciones, 2) Daños en la propiedad: gestionamos reparaciones y negociamos responsabilidades, 3) Incumplimiento de contrato: asesoría legal y acompañamiento, 4) Renovaciones o terminación anticipada: negociamos condiciones favorables. Nuestro objetivo es proteger a ambas partes.'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Preguntas Frecuentes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Encuentra respuestas rápidas a las preguntas más comunes sobre nuestros servicios inmobiliarios
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar pregunta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <CategoryIcon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </motion.div>

        {/* FAQs List */}
        <div className="max-w-4xl mx-auto space-y-4 mb-12">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    expandedId === faq.id ? 'ring-2 ring-green-500' : ''
                  }`}
                >
                  <div className="p-6" onClick={() => toggleFAQ(faq.id)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {faq.question}
                        </h3>
                        <AnimatePresence>
                          {expandedId === faq.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <p className="text-gray-600 dark:text-gray-400 mt-4 leading-relaxed">
                                {faq.answer}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      </motion.div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No se encontraron preguntas que coincidan con tu búsqueda.
              </p>
            </motion.div>
          )}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="p-8 md:p-12 text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-3xl font-bold mb-4">
                ¿No encontraste lo que buscabas?
              </h2>
              <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                Nuestro equipo de expertos está listo para resolver todas tus dudas de forma personalizada
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                <a
                  href={CONTACT_INFO.urls.whatsapp('Hola, tengo una pregunta que no encontré en las FAQ. ¿Podrían ayudarme?')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white text-green-600 px-6 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>

                <a
                  href={`tel:${CONTACT_INFO.phones.primary.replace(/\s/g, '')}`}
                  className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  <Phone className="w-5 h-5" />
                  Llamar Ahora
                </a>

                <a
                  href={`mailto:${CONTACT_INFO.email.primary}`}
                  className="flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white px-6 py-4 rounded-xl font-semibold hover:bg-white/20 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Enviar Email
                </a>
              </div>

              <div className="mt-8 pt-8 border-t border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Respuesta en menos de 2 horas</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>Atención personalizada</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span>Asesoría sin compromiso</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12"
        >
          <Card className="p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">98%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Satisfacción</p>
          </Card>
          <Card className="p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">1000+</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Clientes</p>
          </Card>
          <Card className="p-6 text-center">
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">&lt;2h</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tiempo Respuesta</p>
          </Card>
          <Card className="p-6 text-center">
            <Shield className="w-8 h-8 text-teal-600 mx-auto mb-3" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">24/7</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Disponibilidad</p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
