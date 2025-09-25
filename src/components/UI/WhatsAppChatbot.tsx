import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { CONTACT_INFO } from '../../constants/contact';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  options?: string[];
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

const faqs: FAQ[] = [
  {
    id: '1',
    question: '¿Qué tipos de propiedades manejan?',
    answer: 'Manejamos apartamentos, casas, oficinas, locales comerciales y bodegas. Tenemos una amplia variedad de opciones desde $1.000.000 hasta $15.000.000 mensuales para satisfacer diferentes necesidades y presupuestos.',
    keywords: ['propiedades', 'tipos', 'apartamentos', 'casas', 'oficinas', 'locales', 'que tienen', 'arriendo', 'alquiler']
  },
  {
    id: '2',
    question: '¿Cuáles son los rangos de precios?',
    answer: '📊 Nuestros rangos de precios son:\n• Apartamentos: $1.000.000 - $8.000.000\n• Casas: $2.000.000 - $15.000.000\n• Oficinas: $1.500.000 - $12.000.000\n• Locales comerciales: $1.200.000 - $10.000.000\n• Bodegas: $1.000.000 - $6.000.000',
    keywords: ['precios', 'canon', 'valor', 'arriendo', 'alquiler', 'cuanto cuesta', 'presupuesto', 'precio']
  },
  {
    id: '3',
    question: '¿Cuál es el proceso de arriendo?',
    answer: 'El proceso es: 1) Búsqueda personalizada, 2) Visitas programadas, 3) Estudio de referencias, 4) Elaboración del contrato, 5) Firma y entrega. Todo en 5-10 días hábiles una vez aprobado.',
    keywords: ['proceso', 'arriendo', 'pasos', 'trámites', 'contrato', 'como arrendar', 'que necesito']
  },
  {
    id: '4',
    question: '¿Hacen avalúos de propiedades?',
    answer: 'Sí, contamos con avaluadores certificados FEDELONJAS. El avalúo cuesta $180.000 y lo realizamos en 3-5 días hábiles para determinar el valor comercial real.',
    keywords: ['avalúo', 'valoración', 'precio', 'valor', 'tasación', 'cuanto vale', 'avaluar']
  },
  {
    id: '5',
    question: '¿Qué zonas cubren?',
    answer: 'Cubrimos toda el área metropolitana: Laureles, Poblado, Envigado, Sabaneta, La Estrella, Itagüí, Bello y municipios cercanos. Nos especializamos en zonas premium y estratos 4, 5 y 6.',
    keywords: ['zonas', 'ubicación', 'dónde', 'sectores', 'barrios', 'laureles', 'poblado', 'envigado', 'donde trabajan']
  },
  {
    id: '6',
    question: '¿Qué documentos necesito para arrendar?',
    answer: 'Para arrendar necesitas: Cédula, certificado de ingresos (últimos 3 meses), extractos bancarios, carta laboral, referencias comerciales y codeudor con documentos similares.',
    keywords: ['documentos', 'papeles', 'requisitos', 'que necesito', 'cedula', 'ingresos', 'arrendar']
  },
  {
    id: '7',
    question: '¿Cuáles son sus comisiones?',
    answer: 'Para arriendos cobramos 1 mes de canon como comisión. Incluye toda la gestión legal, elaboración del contrato, verificación de referencias y entrega del inmueble.',
    keywords: ['comisiones', 'precio', 'costo', 'honorarios', 'cuanto cobran', 'tarifas', 'fees']
  },
  {
    id: '8',
    question: '¿Qué servicios adicionales ofrecen?',
    answer: '🏢 Ofrecemos servicios completos:\n• Avalúos profesionales ($180.000)\n• Asesorías contables ($200.000-$1.500.000)\n• Remodelación y diseño interior\n• Estudios de títulos\n• Administración de propiedades\n• Consultoría jurídica inmobiliaria',
    keywords: ['servicios', 'avaluos', 'contables', 'remodelacion', 'administracion', 'juridica', 'que hacen', 'otros servicios']
  },
  {
    id: '9',
    question: '¿Puedo ver las propiedades disponibles?',
    answer: 'Por supuesto! Tenemos un catálogo actualizado en nuestra página web. Te puedo mostrar propiedades según tu presupuesto y preferencias de arriendo.',
    keywords: ['ver propiedades', 'catálogo', 'disponibles', 'mostrar', 'enseñar', 'propiedades', 'fotos']
  },
  {
    id: '10',
    question: '¿Ofrecen asesoría contable?',
    answer: 'Sí, tenemos servicios contables especializados: declaración de renta, optimización tributaria, consultoría legal, constitución de empresas inmobiliarias. Precios desde $200.000.',
    keywords: ['contable', 'tributaria', 'renta', 'impuestos', 'optimización', 'asesoría', 'contabilidad']
  },
  {
    id: '11',
    question: '¿Realizan remodelaciones?',
    answer: 'Sí, ofrecemos servicios de remodelación y diseño interior. Transformamos espacios con proyectos personalizados, desde baños y cocinas hasta remodelaciones completas.',
    keywords: ['remodelacion', 'diseño', 'reforma', 'construccion', 'remodelar', 'arreglos']
  },
  {
    id: '12',
    question: '¿Qué incluye la administración de propiedades?',
    answer: 'Administramos tu propiedad integral: cobro de cánones, mantenimiento, atención a inquilinos, reportes mensuales, gestión de contratos y renovaciones. Comisión del 8% del canon.',
    keywords: ['administracion', 'manejo', 'gestion', 'cobro', 'mantenimiento', 'inquilinos', 'administrar']
  },
  {
    id: '13',
    question: '¿Cuánto tiempo toma conseguir una propiedad?',
    answer: 'Dependiendo de tus requerimientos, entre 3-15 días. Propiedades populares (apartamentos en Laureles/Poblado) se consiguen rápido, propiedades exclusivas pueden tomar más tiempo.',
    keywords: ['tiempo', 'conseguir', 'cuánto', 'demora', 'plazo', 'cuanto se demora', 'rapidez']
  },
  {
    id: '14',
    question: '¿Qué garantías necesito?',
    answer: 'Puedes elegir entre: codeudor con finca raíz, póliza de arrendamiento, depósito (equivalente a 3-6 meses), o combinación de estas opciones según la propiedad.',
    keywords: ['garantias', 'codeudor', 'poliza', 'deposito', 'fianza', 'aval', 'respaldo']
  },
  {
    id: '15',
    question: '¿Manejan propiedades amobladas?',
    answer: 'Sí, tenemos apartamentos y casas completamente amoblados, semi-amoblados y sin amoblar. Las propiedades amobladas tienen un incremento del 20-30% sobre el canon base.',
    keywords: ['amobladas', 'muebles', 'equipadas', 'semi-amobladas', 'sin amoblar', 'furnished']
  },
  {
    id: '16',
    question: '¿Cómo puedo agendar una cita?',
    answer: '📅 Para agendar una cita puedes elegir el tipo que necesitas. Nuestros asesores te atenderán de manera personalizada según tus requerimientos específicos.',
    keywords: ['agendar', 'cita', 'reunion', 'visita', 'appointment', 'horario', 'cuando', 'ver']
  }
];

const WhatsAppChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Mensaje de bienvenida
      const welcomeMessage: Message = {
        id: '1',
        text: '¡Hola! 👋 Soy tu asistente inmobiliario virtual. Puedo ayudarte con:\n\n🏠 Información de propiedades\n💰 Precios y rangos disponibles\n📍 Ubicaciones disponibles\n🔧 Servicios adicionales (avalúos, asesorías, remodelación)\n📋 Procesos inmobiliarios\n\n¿En qué te puedo ayudar hoy?',
        isBot: true,
        timestamp: new Date(),
        options: [
          '¿Qué propiedades tienen?',
          'Rangos de precios',
          '¿Qué servicios ofrecen?',
          'Hablar con un asesor'
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findFAQResponse = (text: string): FAQ | null => {
    const lowerText = text.toLowerCase();
    
    // Buscar coincidencias exactas primero
    const exactMatch = faqs.find(faq => 
      faq.keywords.some(keyword => lowerText.includes(keyword.toLowerCase()))
    );
    
    if (exactMatch) return exactMatch;
    
    // Buscar coincidencias parciales
    const partialMatch = faqs.find(faq => {
      const words = lowerText.split(' ');
      return words.some(word => 
        faq.keywords.some(keyword => 
          keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase())
        )
      );
    });
    
    return partialMatch || null;
  };

  const handlePropertyRequest = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('apartament')) {
      return {
        text: '🏢 Tenemos excelentes apartamentos desde $1.000.000 hasta $8.000.000. Ubicados en Laureles, Poblado y Envigado. Opciones amobladas y sin amoblar.',
        options: ['Ver apartamentos', 'Filtrar por precio', 'Hablar con un asesor']
      };
    } else if (lowerText.includes('casa')) {
      return {
        text: '🏠 Contamos con casas desde $2.000.000 hasta $15.000.000 en sectores como Envigado, Sabaneta y La Estrella. Con jardín y parqueadero.',
        options: ['Ver casas', 'Casas con piscina', 'Hablar con un asesor']
      };
    } else if (lowerText.includes('oficina')) {
      return {
        text: '🏢 Oficinas desde $1.500.000 hasta $12.000.000 en sectores empresariales. Excelente ubicación comercial y facilidades de parqueo.',
        options: ['Ver oficinas', 'Oficinas amobladas', 'Hablar con un asesor']
      };
    } else if (lowerText.includes('local')) {
      return {
        text: '🏪 Locales comerciales desde $1.200.000 hasta $10.000.000 en zonas de alto flujo. Perfectos para tu negocio.',
        options: ['Ver locales', 'Locales esquineros', 'Hablar con un asesor']
      };
    } else {
      return {
        text: '🏘️ Tenemos más de 50 propiedades disponibles: apartamentos, casas, oficinas y locales comerciales. Amplio portafolio desde $1.000.000 hasta $15.000.000.',
        options: ['Ver todas las propiedades', 'Filtrar por presupuesto', 'Hablar con un asesor']
      };
    }
  };

  const addMessage = (text: string, isBot: boolean, options?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
      options
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    // Agregar mensaje del usuario
    addMessage(inputText, false);

    // Procesar respuesta del bot
    setTimeout(() => {
      handleBotResponse(inputText);
    }, 500);

    setInputText('');
  };

  const handleOptionClick = (option: string) => {
    addMessage(option, false);
    setTimeout(() => {
      handleSpecialOptions(option);
    }, 500);
  };

  const handleSpecialOptions = (option: string) => {
    switch(option) {
      case 'Ver apartamentos':
      case 'Ver todas las propiedades':
      case 'Ver propiedades':
        window.open(`${window.location.origin}/properties`, '_blank');
        addMessage(
          '🔗 Te he abierto nuestra página de propiedades en una nueva pestaña. Allí podrás ver todas las opciones disponibles con fotos, precios y detalles.',
          true,
          ['¿Otra pregunta?', 'Agendar visita', 'Hablar con un asesor']
        );
        break;
      
      case 'Ver casas':
        window.open(`${window.location.origin}/properties?tipo=casa`, '_blank');
        addMessage(
          '🏠 Te he abierto el catálogo de casas. Encontrarás opciones desde $2.000.000 hasta $15.000.000 en excelentes ubicaciones.',
          true,
          ['¿Otra pregunta?', 'Información de garantías', 'Hablar con un asesor']
        );
        break;

      case 'Ver oficinas':
        window.open(`${window.location.origin}/properties?tipo=oficina`, '_blank');
        addMessage(
          '🏢 Catálogo de oficinas abierto. Perfectas para empresas y profesionales independientes.',
          true,
          ['¿Otra pregunta?', 'Costos adicionales', 'Hablar con un asesor']
        );
        break;

      case 'Ver locales':
        window.open(`${window.location.origin}/properties?tipo=local`, '_blank');
        addMessage(
          '🏪 Catálogo de locales comerciales abierto. Excelentes ubicaciones para tu negocio.',
          true,
          ['¿Otra pregunta?', 'Avalúo comercial', 'Hablar con un asesor']
        );
        break;

      case '$1M - $3M':
        addMessage(
          '💡 En ese rango tenemos apartamentos en Laureles y casas en La Estrella. Excelentes opciones con buena ubicación.',
          true,
          ['Ver propiedades en este rango', 'Garantías disponibles', 'Hablar con un asesor']
        );
        break;

      case '$3M - $6M':
        addMessage(
          '💡 Perfecto rango! Tenemos apartamentos en Poblado y casas en Envigado con muy buena ubicación y amenidades.',
          true,
          ['Ver propiedades en este rango', 'Documentos necesarios', 'Hablar con un asesor']
        );
        break;

      case '$6M - $10M':
        addMessage(
          '💡 En este rango premium tenemos casas amplias y oficinas ejecutivas en las mejores zonas de la ciudad.',
          true,
          ['Ver propiedades premium', 'Proceso especializado', 'Hablar con un asesor']
        );
        break;

      case 'Más de $10M':
        addMessage(
          '💎 Para propiedades de lujo contamos con casas exclusivas y oficinas corporativas. Atención personalizada.',
          true,
          ['Ver propiedades de lujo', 'Asesoría VIP', 'Hablar con un asesor']
        );
        break;

      case 'Avalúos':
        addMessage(
          '💼 Ofrecemos avalúos certificados FEDELONJAS por $180.000. Se realizan en 3-5 días hábiles. ¿Para qué necesitas el avalúo?',
          true,
          ['Para arriendo', 'Para crédito', 'Para seguro', 'Solicitar avalúo']
        );
        break;

      case 'Asesoría contable':
        addMessage(
          '📊 Servicios contables especializados: declaración de renta, optimización tributaria, consultoría legal. Precios desde $200.000.',
          true,
          ['Declaración de renta', 'Optimización tributaria', 'Consulta legal', 'Solicitar asesoría']
        );
        break;

      case 'Remodelación':
        addMessage(
          '🔨 Transformamos espacios con proyectos personalizados: cocinas, baños, remodelaciones completas. Cotización sin costo.',
          true,
          ['Cotización gratis', 'Ver proyectos', 'Diseño interior', 'Hablar con un asesor']
        );
        break;

      case 'Administración':
        addMessage(
          '🏢 Administramos tu propiedad: cobro de cánones, mantenimiento, atención inquilinos. Comisión 8% del canon.',
          true,
          ['Más información', 'Contratar servicio', 'Reportes mensuales', 'Hablar con un asesor']
        );
        break;

      case '🏠 Visita a propiedades':
        addMessage(
          '🏠 ¡Perfecto! Te conectaré con nuestro asesor para programar visitas a las propiedades que te interesen. Él coordinará horarios y te acompañará personalmente.',
          true,
          ['Contactar para visitas']
        );
        break;

      case '💼 Asesoría general':
        addMessage(
          '💼 Excelente elección. Nuestro asesor te brindará consultoría completa sobre el mercado inmobiliario, opciones disponibles y te guiará en todo el proceso.',
          true,
          ['Agendar asesoría']
        );
        break;

      case '📊 Consulta de servicios':
        addMessage(
          '📊 Te conectaré con nuestro asesor para que te explique en detalle todos nuestros servicios: avalúos, asesorías contables, remodelación y administración.',
          true,
          ['Consultar servicios']
        );
        break;

      case '📞 Contactar al asesor ahora':
      case 'Contactar para visitas':
      case 'Agendar asesoría':
      case 'Consultar servicios':
      case 'Agendar visita':
        handleContactAdvisor();
        break;

      case 'Contactar a Jaider':
        handleContactAdvisor();
        break;

      default:
        handleBotResponse(option);
        break;
    }
  };

  const handleBotResponse = (userText: string) => {
    const lowerText = userText.toLowerCase();

    // Respuestas de saludo
    if (lowerText.includes('hola') || lowerText.includes('buenos') || lowerText.includes('buenas')) {
      addMessage(
        '¡Hola! 😊 ¿En qué puedo ayudarte hoy? Puedo resolver dudas sobre propiedades, precios, servicios inmobiliarios y más.',
        true,
        ['¿Qué propiedades tienen?', '¿Qué servicios ofrecen?', 'Ver propiedades', 'Hablar con un asesor']
      );
      return;
    }

    // Respuestas sobre propiedades específicas
    if (lowerText.includes('propiedad') || lowerText.includes('inmueble') || lowerText.includes('apartament') || 
        lowerText.includes('casa') || lowerText.includes('oficina') || lowerText.includes('local')) {
      const propertyResponse = handlePropertyRequest(userText);
      addMessage(propertyResponse.text, true, propertyResponse.options);
      return;
    }

    // Respuestas sobre precios y presupuesto
    if (lowerText.includes('precio') || lowerText.includes('cuesta') || lowerText.includes('valor') || 
        lowerText.includes('presupuesto') || lowerText.includes('canon') || lowerText.includes('rango')) {
      addMessage(
        '💰 Nuestros rangos de precios son:\n📊 Apartamentos: $1.000.000 - $8.000.000\n🏠 Casas: $2.000.000 - $15.000.000\n🏢 Oficinas: $1.500.000 - $12.000.000\n🏪 Locales: $1.200.000 - $10.000.000\n\n¿Qué rango te interesa?',
        true,
        ['$1M - $3M', '$3M - $6M', '$6M - $10M', 'Más de $10M', 'Hablar con un asesor']
      );
      return;
    }

    // Respuestas sobre servicios
    if (lowerText.includes('servicio') || lowerText.includes('avaluo') || lowerText.includes('contable') || 
        lowerText.includes('remodelacion') || lowerText.includes('administracion') || lowerText.includes('que hacen')) {
      addMessage(
        '🔧 Ofrecemos servicios integrales:\n\n💼 Avalúos profesionales ($180.000)\n📊 Asesorías contables ($200k-$1.5M)\n🔨 Remodelación y diseño\n🏢 Administración de propiedades\n⚖️ Consultoría jurídica\n📋 Estudios de títulos\n\n¿Cuál te interesa?',
        true,
        ['Avalúos', 'Asesoría contable', 'Remodelación', 'Administración', 'Hablar con un asesor']
      );
      return;
    }

    // Respuestas sobre ubicaciones
    if (lowerText.includes('ubicación') || lowerText.includes('zona') || lowerText.includes('barrio') || 
        lowerText.includes('laureles') || lowerText.includes('poblado') || lowerText.includes('envigado')) {
      addMessage(
        '📍 Trabajamos en las mejores zonas: Laureles, Poblado, Envigado, Sabaneta, La Estrella e Itagüí. ¿Hay alguna zona de tu preferencia?',
        true,
        ['Laureles', 'Poblado', 'Envigado', 'Sabaneta', 'Ver todas las zonas', 'Hablar con un asesor']
      );
      return;
    }

    // Respuestas sobre contacto/asesor
    if (lowerText.includes('asesor') || lowerText.includes('humano') || lowerText.includes('hablar') || 
        lowerText.includes('contacto') || lowerText.includes('llamar')) {
      addMessage(
        '👨‍💼 ¡Perfecto! Te voy a conectar con Jaider, nuestro asesor principal. Él te dará atención personalizada y resolverá todas tus dudas específicas.',
        true,
        ['Contactar a Jaider']
      );
      return;
    }

    // Respuestas sobre agendar citas
    if (lowerText.includes('agendar') || lowerText.includes('cita') || lowerText.includes('reunion') || 
        lowerText.includes('visita') || lowerText.includes('appointment') || lowerText.includes('ver propiedad')) {
      addMessage(
        '📅 ¡Excelente! ¿Qué tipo de cita necesitas? Te ayudo a conectarte con nuestro asesor para coordinar según tus necesidades:',
        true,
        [
          '🏠 Visita a propiedades',
          '💼 Asesoría general',
          '📊 Consulta de servicios',
          '📞 Contactar al asesor ahora'
        ]
      );
      return;
    }

    // Buscar en FAQs
    const faqResponse = findFAQResponse(userText);
    
    if (faqResponse) {
      const contextualOptions = getContextualOptions(faqResponse.id);
      addMessage(faqResponse.answer, true, contextualOptions);
    } else {
      // Respuesta cuando no encuentra coincidencia
      addMessage(
        '🤔 No encontré una respuesta específica para esa pregunta. Te puedo ayudar con información sobre propiedades, precios, servicios inmobiliarios, zonas y más. ¿O prefieres hablar directamente con un asesor?',
        true,
        [
          '¿Qué propiedades tienen?',
          'Rangos de precios',
          '¿Qué servicios ofrecen?',
          'Hablar con un asesor'
        ]
      );
    }
  };

  const getContextualOptions = (faqId: string): string[] => {
    switch(faqId) {
      case '1': // Tipos de propiedades
        return ['Ver apartamentos', 'Ver casas', 'Ver oficinas', 'Hablar con un asesor'];
      case '2': // Rangos de precios
        return ['$1M - $3M', '$3M - $6M', '$6M - $10M', 'Hablar con un asesor'];
      case '3': // Proceso
        return ['Documentos necesarios', 'Garantías', 'Tiempos', 'Hablar con un asesor'];
      case '5': // Zonas
        return ['Ver propiedades en Laureles', 'Ver propiedades en Poblado', 'Todas las zonas', 'Hablar con un asesor'];
      case '8': // Servicios adicionales
        return ['Avalúos', 'Asesoría contable', 'Remodelación', 'Administración'];
      case '9': // Ver propiedades
        return ['Ver todas las propiedades', 'Filtrar por precio', 'Filtrar por zona', 'Hablar con un asesor'];
      case '10': // Asesoría contable
        return ['Declaración de renta', 'Optimización tributaria', 'Consulta legal', 'Solicitar asesoría'];
      case '11': // Remodelación
        return ['Cotización gratis', 'Ver proyectos', 'Diseño interior', 'Hablar con un asesor'];
      case '12': // Administración
        return ['Más información', 'Contratar servicio', 'Reportes mensuales', 'Hablar con un asesor'];
      case '16': // Agendar cita
        return ['🏠 Visita a propiedades', '💼 Asesoría general', '📊 Consulta de servicios', '📞 Contactar al asesor ahora'];
      default:
        return ['¿Otra pregunta?', 'Ver propiedades', 'Hablar con un asesor'];
    }
  };

  const handleContactAdvisor = () => {
    const message = encodeURIComponent(
      '¡Hola Jaider! Vengo del chatbot de la página web y me gustaría recibir asesoría personalizada sobre sus servicios inmobiliarios. Me interesa agendar una cita para conocer más sobre las opciones disponibles.'
    );
    window.open(`https://wa.me/${CONTACT_INFO.phones.whatsapp}?text=${message}`, '_blank');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-full p-4 shadow-2xl transition-all duration-300 hover:shadow-green-500/50 glow-green hover:scale-105 group"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse-slow"></div>
          <div className="relative z-10">
            {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
          </div>
          {/* Indicador de mensajes no leídos */}
          {!isOpen && (
            <motion.div
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 3, type: "spring" }}
            >
              ?
            </motion.div>
          )}
        </motion.button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.3 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col border border-gray-200"
          >
            {/* Header */}
            <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <Bot className="text-green-500" size={20} />
              </div>
              <div>
                <h3 className="font-semibold">Asistente Inmobiliario</h3>
                <p className="text-xs opacity-90">En línea</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chatbot-messages">
              {messages.map((message) => (
                <div key={message.id}>
                  <div
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs rounded-lg p-3 ${
                        message.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-500 text-white'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.isBot && (
                          <Bot size={16} className="text-green-500 mt-1 flex-shrink-0" />
                        )}
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  {message.options && (
                    <div className="mt-2 space-y-1">
                      {message.options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (option === 'Contactar a Jaider') {
                              handleContactAdvisor();
                            } else {
                              handleOptionClick(option);
                            }
                          }}
                          className="block w-full text-left text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg p-2 transition-colors"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-2 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default WhatsAppChatbot;
