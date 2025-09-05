import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Home, 
  DollarSign, 
  FileText, 
  Calculator, 
  Hammer, 
  Wrench, 
  Building,
  ArrowRight 
} from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';
import ServiceInquiryModal from '../Modals/ServiceInquiryModal';
import ServiceStats from './ServiceStats';
import ServiceTestimonials from './ServiceTestimonials';
import ServiceProcess from './ServiceProcess';

const Services: React.FC = () => {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      icon: Home,
      title: 'Arrendamientos',
      description: 'Encuentra el hogar perfecto para ti con nuestro amplio portafolio de propiedades en arriendo.',
      color: 'from-blue-500 to-blue-600',
      features: ['Propiedades verificadas', 'Proceso ágil', 'Soporte 24/7'],
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
      icon: DollarSign,
      title: 'Ventas',
      description: 'Compra o vende tu propiedad con la asesoría de nuestros expertos en el mercado inmobiliario.',
      color: 'from-green-500 to-green-600',
      features: ['Avalúo gratuito', 'Marketing digital', 'Negociación experta'],
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
      icon: FileText,
      title: 'Avalúos',
      description: 'Obtén el valor real de tu propiedad con nuestros avalúos técnicos certificados.',
      color: 'from-purple-500 to-purple-600',
      features: ['Certificación oficial', 'Metodología técnica', 'Entrega rápida'],
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
      icon: Calculator,
      title: 'Asesorías Contables',
      description: 'Servicios contables y tributarios especializados para el sector inmobiliario.',
      color: 'from-orange-500 to-orange-600',
      features: ['Declaración de renta', 'Optimización tributaria', 'Consultoría legal'],
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
    },
    {
      icon: Hammer,
      title: 'Remodelación',
      description: 'Transforma tu espacio con nuestros servicios de remodelación y diseño interior.',
      color: 'from-red-500 to-red-600',
      features: ['Diseño personalizado', 'Materiales de calidad', 'Garantía extendida'],
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
      icon: Wrench,
      title: 'Reparación',
      description: 'Mantenimiento y reparaciones para mantener tu propiedad en perfecto estado.',
      color: 'from-indigo-500 to-indigo-600',
      features: ['Servicio 24/7', 'Técnicos certificados', 'Presupuesto sin costo'],
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
      icon: Building,
      title: 'Construcción',
      description: 'Proyectos de construcción desde cero con los más altos estándares de calidad.',
      color: 'from-teal-500 to-teal-600',
      features: ['Licencias incluidas', 'Supervisión técnica', 'Entrega garantizada'],
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
  ];

  const openServiceModal = (service: any) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Ofrecemos una gama completa de servicios inmobiliarios para satisfacer todas tus necesidades
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full group cursor-pointer" hover>
                  {/* Icon */}
                  <div className="relative mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-r ${service.color} rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-auto">
                    <Button
                      variant="ghost"
                      icon={ArrowRight}
                      iconPosition="right"
                      className="w-full group-hover:text-green-600 dark:group-hover:text-green-400"
                      onClick={() => openServiceModal(service)}
                    >
                      Más Información
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Service Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <ServiceStats />
        </motion.div>

        {/* Service Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <ServiceTestimonials />
        </motion.div>

        {/* Service Process */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <ServiceProcess />
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              ¿Necesitas ayuda personalizada?
            </h3>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Nuestros asesores expertos están listos para ayudarte a encontrar la solución perfecta para tus necesidades inmobiliarias.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/advisors'}
                className="w-full sm:w-auto"
              >
                Conocer Nuestros Asesores
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/contact'}
                className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10"
              >
                Contactar Ahora
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Service Inquiry Modal */}
        <ServiceInquiryModal
          service={selectedService}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </div>
    </section>
  );
};

export default Services;