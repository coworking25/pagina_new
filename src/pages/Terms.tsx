import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Scale, AlertCircle, Shield, UserX, DollarSign, Home, CheckCircle, Mail, Phone } from 'lucide-react';
import Card from '../components/UI/Card';
import { CONTACT_INFO } from '../constants/contact';

const Terms: React.FC = () => {
  const sections = [
    {
      icon: FileText,
      title: '1. Aceptación de los Términos',
      content: [
        {
          subtitle: 'Acuerdo Vinculante',
          text: 'Al acceder y utilizar los servicios de Coworking Inmobiliario, ya sea a través de nuestro sitio web, aplicaciones móviles o cualquier otro medio, aceptas estar legalmente vinculado por estos Términos y Condiciones. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.'
        },
        {
          subtitle: 'Capacidad Legal',
          text: 'Al utilizar nuestros servicios, declaras que: tienes al menos 18 años de edad o la mayoría de edad en tu jurisdicción, tienes la capacidad legal para celebrar contratos vinculantes, y toda la información que proporcionas es verdadera, precisa y completa.'
        }
      ]
    },
    {
      icon: Home,
      title: '2. Servicios Inmobiliarios',
      content: [
        {
          subtitle: 'Alcance de Servicios',
          text: 'Coworking Inmobiliario ofrece servicios de intermediación inmobiliaria incluyendo: compra, venta y arrendamiento de propiedades; avalúos comerciales; asesoría en créditos hipotecarios; servicios de construcción y remodelación; desenglobes y trámites legales; y asesoría contable inmobiliaria.'
        },
        {
          subtitle: 'Rol de Intermediario',
          text: 'Actuamos como intermediarios entre compradores, vendedores, arrendadores y arrendatarios. No somos propietarios de las propiedades listadas (salvo que se indique explícitamente) y no garantizamos la disponibilidad, exactitud o condiciones de las propiedades mostradas.'
        },
        {
          subtitle: 'Verificación de Información',
          text: 'Aunque nos esforzamos por verificar la información de las propiedades, recomendamos que realices tu propia debida diligencia. La información proporcionada (precios, características, disponibilidad) puede cambiar sin previo aviso.'
        }
      ]
    },
    {
      icon: DollarSign,
      title: '3. Comisiones y Pagos',
      content: [
        {
          subtitle: 'Comisiones por Venta',
          text: 'Nuestra comisión por servicios de venta es generalmente del 3% al 5% del precio de venta, pagadera al cierre de la transacción. La comisión exacta se establece en el contrato de mandato específico. El pago se realiza solo cuando la transacción se completa exitosamente.'
        },
        {
          subtitle: 'Comisiones por Arrendamiento',
          text: 'Para servicios de arrendamiento, nuestra comisión es típicamente equivalente al 50% del primer mes de canon, pagadera por el arrendatario al momento de la firma del contrato. En algunos casos, esta comisión puede ser compartida o pagada por el propietario según acuerdo previo.'
        },
        {
          subtitle: 'Servicios Adicionales',
          text: 'Los servicios de avalúo, remodelación, construcción, desenglobes y asesoría contable tienen tarifas específicas que se cotizarán individualmente según el alcance del proyecto. Todas las cotizaciones son válidas por 30 días salvo que se indique lo contrario.'
        },
        {
          subtitle: 'Métodos de Pago',
          text: 'Aceptamos pagos mediante: transferencia bancaria, efectivo (hasta montos legales permitidos), tarjeta de crédito/débito (puede aplicar recargo), y cheques certificados. Todos los pagos deben realizarse en pesos colombianos (COP) salvo acuerdo específico.'
        }
      ]
    },
    {
      icon: Scale,
      title: '4. Obligaciones del Cliente',
      content: [
        {
          subtitle: 'Información Veraz',
          text: 'Te comprometes a proporcionar información verdadera, exacta, actual y completa sobre ti mismo y tus necesidades inmobiliarias. Cualquier información falsa puede resultar en la terminación de nuestros servicios sin reembolso.'
        },
        {
          subtitle: 'Documentación Requerida',
          text: 'Debes proporcionar toda la documentación solicitada de manera oportuna, incluyendo pero no limitado a: documentos de identidad, certificados de ingresos, referencias, documentos de propiedad, y cualquier otra información necesaria para completar las transacciones.'
        },
        {
          subtitle: 'Exclusividad',
          text: 'Si firmas un contrato de exclusividad para venta o arrendamiento de tu propiedad, te comprometes a no trabajar con otros intermediarios durante el período acordado. El incumplimiento puede resultar en el pago de comisión completa.'
        },
        {
          subtitle: 'Conducta Apropiada',
          text: 'Te comprometes a: tratar a nuestro personal y a otros clientes con respeto, cumplir con todas las citas programadas o cancelar con anticipación razonable, no utilizar nuestros servicios para fines fraudulentos o ilegales, y mantener la confidencialidad de información sensible compartida durante el proceso.'
        }
      ]
    },
    {
      icon: Shield,
      title: '5. Limitación de Responsabilidad',
      content: [
        {
          subtitle: 'Exclusión de Garantías',
          text: 'Nuestros servicios se proporcionan "tal cual" y "según disponibilidad". No garantizamos: que encontrarás la propiedad perfecta en un tiempo específico, que tu propiedad se venderá o arrendará en un período determinado, la obtención de créditos hipotecarios (depende de entidades financieras), o resultados específicos de inversión.'
        },
        {
          subtitle: 'Responsabilidad Limitada',
          text: 'Nuestra responsabilidad máxima se limita al monto de las comisiones efectivamente recibidas por el servicio específico. No somos responsables por: daños indirectos, incidentales o consecuentes; pérdida de ganancias o oportunidades; decisiones de inversión tomadas por clientes; o acciones de terceros (propietarios, arrendatarios, entidades financieras).'
        },
        {
          subtitle: 'Estado de Propiedades',
          text: 'No garantizamos el estado físico, legal o de titulación de las propiedades. Es responsabilidad del comprador/arrendatario realizar inspecciones, estudios de títulos y debida diligencia necesaria antes de completar cualquier transacción.'
        }
      ]
    },
    {
      icon: UserX,
      title: '6. Terminación del Servicio',
      content: [
        {
          subtitle: 'Terminación por el Cliente',
          text: 'Puedes terminar nuestros servicios en cualquier momento notificándonos por escrito. Sin embargo: en contratos de exclusividad, pueden aplicar penalidades según lo acordado; servicios ya prestados deben ser pagados; y comisiones devengadas antes de la terminación son exigibles.'
        },
        {
          subtitle: 'Terminación por Nuestra Parte',
          text: 'Podemos terminar o suspender nuestros servicios inmediatamente si: proporcionas información falsa o engañosa, incumples estos términos, realizas actividades fraudulentas o ilegales, tu comportamiento es abusivo hacia nuestro personal, o no pagas por servicios prestados.'
        },
        {
          subtitle: 'Efectos de la Terminación',
          text: 'Al terminar la relación: cesaremos los servicios activos, te entregaremos documentación bajo nuestra custodia, facturaremos servicios pendientes de pago, y mantendremos tu información según nuestra política de privacidad y requisitos legales.'
        }
      ]
    },
    {
      icon: AlertCircle,
      title: '7. Propiedad Intelectual',
      content: [
        {
          subtitle: 'Derechos de Contenido',
          text: 'Todo el contenido en nuestro sitio web y materiales de marketing (textos, imágenes, logos, diseños, software) es propiedad de Coworking Inmobiliario o se usa bajo licencia. No puedes copiar, modificar, distribuir o usar este contenido sin nuestro permiso expreso por escrito.'
        },
        {
          subtitle: 'Fotografías de Propiedades',
          text: 'Las fotografías y videos de propiedades que tomamos durante nuestros servicios pueden ser usadas con fines de marketing y promoción. Al contratar nuestros servicios, autorizas este uso salvo que nos notifiques lo contrario por escrito.'
        }
      ]
    },
    {
      icon: CheckCircle,
      title: '8. Resolución de Disputas',
      content: [
        {
          subtitle: 'Negociación Directa',
          text: 'En caso de cualquier disputa o reclamación, ambas partes acuerdan intentar primero resolverla mediante negociación directa de buena fe. Debes notificarnos por escrito cualquier reclamo dentro de los 30 días posteriores al evento que lo origina.'
        },
        {
          subtitle: 'Mediación y Arbitraje',
          text: 'Si la negociación directa falla, las partes acuerdan someter la disputa a mediación ante un centro de mediación reconocido en Colombia. Si la mediación no resuelve el conflicto, se someterá a arbitraje según las reglas de la Cámara de Comercio.'
        },
        {
          subtitle: 'Jurisdicción',
          text: 'Estos términos se rigen por las leyes de la República de Colombia. Para cualquier asunto no resuelto por mediación o arbitraje, las partes se someten a la jurisdicción de los tribunales de Envigado, Antioquia.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mb-6">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Última actualización: 8 de octubre de 2025
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-8">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Bienvenido a <span className="font-semibold text-gray-900 dark:text-white">Coworking Inmobiliario</span>. 
              Estos Términos y Condiciones establecen las reglas y regulaciones para el uso de nuestros servicios 
              inmobiliarios y plataforma digital.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Al acceder y utilizar nuestros servicios, aceptas cumplir con estos términos. Por favor, léelos 
              cuidadosamente antes de usar nuestros servicios. Si tienes alguna pregunta, no dudes en contactarnos.
            </p>
          </Card>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const SectionIcon = section.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <SectionIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {section.title}
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {item.subtitle}
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              9. Disposiciones Generales
            </h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Modificaciones
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones 
                  entrarán en vigor inmediatamente después de su publicación en nuestro sitio web. El uso continuado 
                  de nuestros servicios después de las modificaciones constituye tu aceptación de los nuevos términos.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Divisibilidad
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Si alguna disposición de estos términos se considera inválida o inaplicable, dicha disposición 
                  se eliminará o limitará en la medida mínima necesaria, y las disposiciones restantes continuarán 
                  en pleno vigor y efecto.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Renuncia
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ninguna renuncia a cualquier término de este acuerdo se considerará como una renuncia adicional 
                  o continua de dicho término o cualquier otro término, y nuestro fracaso en hacer valer cualquier 
                  derecho o disposición no constituirá una renuncia a dicho derecho o disposición.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Acuerdo Completo
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Estos Términos y Condiciones, junto con nuestra Política de Privacidad, constituyen el acuerdo 
                  completo entre tú y Coworking Inmobiliario con respecto al uso de nuestros servicios, y reemplazan 
                  todos los acuerdos, comunicaciones y propuestas anteriores o contemporáneas, ya sean orales o escritas.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <Card className="p-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <h2 className="text-2xl font-bold mb-4">
              ¿Preguntas sobre estos Términos?
            </h2>
            <p className="text-white/90 mb-6">
              Si tienes preguntas o inquietudes sobre estos Términos y Condiciones, contáctanos:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" />
                <div>
                  <p className="text-sm text-white/80">Email</p>
                  <a 
                    href={`mailto:${CONTACT_INFO.email.primary}`}
                    className="font-semibold hover:underline"
                  >
                    {CONTACT_INFO.email.primary}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5" />
                <div>
                  <p className="text-sm text-white/80">Teléfono</p>
                  <a 
                    href={`tel:${CONTACT_INFO.phones.primary.replace(/\s/g, '')}`}
                    className="font-semibold hover:underline"
                  >
                    {CONTACT_INFO.phones.primary}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-sm text-white/80">
                <strong>Razón Social:</strong> Coworking Inmobiliario<br />
                <strong>Dirección:</strong> {CONTACT_INFO.address.street}, {CONTACT_INFO.address.building}<br />
                {CONTACT_INFO.address.city}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Acceptance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Al utilizar nuestros servicios, confirmas que has leído, comprendido y aceptado estos 
            Términos y Condiciones y nuestra{' '}
            <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
              Política de Privacidad
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
