import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, UserCheck, Database, Bell, FileText, Mail, Phone } from 'lucide-react';
import Card from '../components/UI/Card';
import { CONTACT_INFO } from '../constants/contact';

const Privacy: React.FC = () => {
  const sections = [
    {
      icon: FileText,
      title: '1. Información que Recopilamos',
      content: [
        {
          subtitle: 'Información Personal',
          text: 'Recopilamos información que nos proporcionas directamente, incluyendo: nombre completo, documento de identidad, dirección de correo electrónico, número de teléfono, dirección de residencia, información financiera (para análisis de crédito), información laboral (para validación de ingresos), y cualquier otra información que decidas compartir con nosotros.'
        },
        {
          subtitle: 'Información de Propiedades',
          text: 'Cuando buscas propiedades o listas una propiedad con nosotros, recopilamos información sobre tus preferencias, historial de búsquedas, propiedades visitadas, y detalles de las propiedades que posees o deseas comprar/arrendar.'
        },
        {
          subtitle: 'Información Técnica',
          text: 'Recopilamos automáticamente cierta información cuando visitas nuestro sitio web, incluyendo: dirección IP, tipo de navegador, sistema operativo, páginas visitadas, tiempo de permanencia, y cookies para mejorar tu experiencia.'
        }
      ]
    },
    {
      icon: Database,
      title: '2. Cómo Usamos tu Información',
      content: [
        {
          subtitle: 'Prestación de Servicios',
          text: 'Utilizamos tu información para: conectarte con propiedades que se ajusten a tus necesidades, procesar solicitudes de arrendamiento o compra, coordinar visitas a propiedades, facilitar comunicación con propietarios y asesores, y gestionar tu cuenta y preferencias.'
        },
        {
          subtitle: 'Mejora de Servicios',
          text: 'Analizamos los datos para: personalizar tu experiencia en nuestra plataforma, mejorar nuestros servicios y funcionalidades, desarrollar nuevas características, entender tendencias del mercado inmobiliario, y optimizar nuestras operaciones.'
        },
        {
          subtitle: 'Comunicaciones',
          text: 'Podemos usar tu información para: enviarte actualizaciones sobre propiedades de tu interés, notificarte sobre cambios en nuestros servicios, compartir contenido educativo sobre el mercado inmobiliario, enviarte newsletters (con tu consentimiento), y responder a tus consultas.'
        },
        {
          subtitle: 'Cumplimiento Legal',
          text: 'Procesamos datos para: cumplir con obligaciones legales y regulatorias, prevenir fraude y actividades ilícitas, verificar identidad según la ley, responder a solicitudes legales, y proteger nuestros derechos y los de nuestros usuarios.'
        }
      ]
    },
    {
      icon: Lock,
      title: '3. Protección de tu Información',
      content: [
        {
          subtitle: 'Medidas de Seguridad',
          text: 'Implementamos medidas técnicas y organizativas para proteger tu información: encriptación SSL/TLS para datos en tránsito, almacenamiento seguro en servidores protegidos, acceso restringido solo a personal autorizado, auditorías de seguridad regulares, y protocolos de respuesta ante incidentes.'
        },
        {
          subtitle: 'Retención de Datos',
          text: 'Conservamos tu información personal solo durante el tiempo necesario para cumplir con los fines descritos en esta política, salvo que la ley requiera o permita un período de retención más largo. Datos de transacciones se conservan según requisitos legales tributarios y comerciales (generalmente 5-10 años).'
        },
        {
          subtitle: 'Transferencias de Datos',
          text: 'Tus datos pueden ser transferidos a terceros de confianza que nos ayudan a operar nuestro negocio (procesadores de pago, servicios de hosting, herramientas de marketing), siempre bajo acuerdos de confidencialidad y cumplimiento de normativas de protección de datos.'
        }
      ]
    },
    {
      icon: UserCheck,
      title: '4. Tus Derechos',
      content: [
        {
          subtitle: 'Acceso y Corrección',
          text: 'Tienes derecho a: acceder a tu información personal que tenemos, solicitar corrección de datos inexactos o incompletos, actualizar tus preferencias de comunicación, y obtener una copia de tus datos en formato estructurado.'
        },
        {
          subtitle: 'Eliminación y Oposición',
          text: 'Puedes: solicitar la eliminación de tus datos personales (sujeto a obligaciones legales), oponerte al procesamiento de tus datos para ciertos fines, retirar tu consentimiento en cualquier momento, y solicitar la limitación del procesamiento en circunstancias específicas.'
        },
        {
          subtitle: 'Portabilidad',
          text: 'Tienes derecho a recibir tus datos personales en un formato estructurado, de uso común y lectura mecánica, y transmitir estos datos a otro responsable del tratamiento cuando sea técnicamente posible.'
        }
      ]
    },
    {
      icon: Eye,
      title: '5. Cookies y Tecnologías Similares',
      content: [
        {
          subtitle: 'Uso de Cookies',
          text: 'Utilizamos cookies para: recordar tus preferencias y configuraciones, analizar cómo usas nuestro sitio, personalizar contenido y anuncios, y mejorar la seguridad. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar algunas funcionalidades.'
        },
        {
          subtitle: 'Tipos de Cookies',
          text: 'Cookies esenciales (necesarias para el funcionamiento del sitio), cookies de rendimiento (analizan cómo usas el sitio), cookies funcionales (recuerdan tus elecciones), y cookies de marketing (personalizan anuncios según tus intereses).'
        }
      ]
    },
    {
      icon: Bell,
      title: '6. Compartir Información',
      content: [
        {
          subtitle: 'Con Quién Compartimos',
          text: 'Compartimos tu información solo cuando es necesario: con propietarios o arrendatarios (para facilitar transacciones), con asesores inmobiliarios asignados, con entidades financieras (para tramitar créditos con tu autorización), con proveedores de servicios (bajo acuerdos de confidencialidad), y con autoridades (cuando lo requiera la ley).'
        },
        {
          subtitle: 'No Vendemos tu Información',
          text: 'Nunca vendemos, alquilamos o comercializamos tu información personal a terceros para sus propios fines de marketing sin tu consentimiento explícito.'
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Política de Privacidad
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
              En <span className="font-semibold text-gray-900 dark:text-white">Coworking Inmobiliario</span>, 
              respetamos y protegemos la privacidad de nuestros clientes y usuarios. Esta Política de Privacidad 
              describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas 
              nuestros servicios inmobiliarios y visitas nuestro sitio web.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Al utilizar nuestros servicios, aceptas las prácticas descritas en esta política. Si no estás de 
              acuerdo con algún aspecto de esta política, por favor no uses nuestros servicios.
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
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <SectionIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              7. Privacidad de Menores
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente 
              información personal de menores. Si eres padre o tutor y crees que tu hijo nos ha proporcionado 
              información personal, contáctanos para que podamos eliminarla.
            </p>
          </Card>
        </motion.div>

        {/* Changes to Policy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8"
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              8. Cambios a esta Política
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Podemos actualizar esta Política de Privacidad periódicamente para reflejar cambios en nuestras 
              prácticas o por razones legales, operativas o regulatorias. Te notificaremos sobre cambios 
              significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de 
              "última actualización".
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Te recomendamos revisar esta política periódicamente para estar informado sobre cómo protegemos 
              tu información.
            </p>
          </Card>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8"
        >
          <Card className="p-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <h2 className="text-2xl font-bold mb-4">
              ¿Preguntas sobre tu Privacidad?
            </h2>
            <p className="text-white/90 mb-6">
              Si tienes preguntas, inquietudes o deseas ejercer tus derechos de privacidad, contáctanos:
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
                <strong>Responsable del Tratamiento de Datos:</strong> Coworking Inmobiliario<br />
                <strong>Dirección:</strong> {CONTACT_INFO.address.street}, {CONTACT_INFO.address.building}<br />
                {CONTACT_INFO.address.city}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Consent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Al continuar usando nuestros servicios, confirmas que has leído, comprendido y aceptado 
            esta Política de Privacidad y nuestros{' '}
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Términos y Condiciones
            </a>
            .
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
