import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, Mail, Clock } from 'lucide-react';
import Button from '../UI/Button';

interface WhatsAppContactProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle?: string;
  userQuestion?: string;
}

const WhatsAppContact: React.FC<WhatsAppContactProps> = ({
  isOpen,
  onClose,
  documentTitle,
  userQuestion
}) => {
  const advisorInfo = {
    name: 'Santiago Sánchez',
    phone: '+57 300 123 4567',
    email: 'santiago.sanchez@inmobiliaria.com',
    photo: '/advisors/santiago.jpg',
    availability: 'Lun-Vie: 8:00 AM - 6:00 PM'
  };

  const handleWhatsAppContact = () => {
    let message = `¡Hola ${advisorInfo.name}! 👋\n\n`;
    message += `Tengo una consulta sobre documentación inmobiliaria.\n\n`;
    
    if (documentTitle) {
      message += `📄 *Documento específico:* ${documentTitle}\n\n`;
    }
    
    if (userQuestion) {
      message += `❓ *Mi pregunta:* ${userQuestion}\n\n`;
    }
    
    message += `¿Podrías ayudarme con esta consulta?\n\n`;
    message += `¡Gracias! 😊`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${advisorInfo.phone.replace(/\s+/g, '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const handlePhoneCall = () => {
    window.location.href = `tel:${advisorInfo.phone}`;
  };

  const handleEmailContact = () => {
    const subject = documentTitle 
      ? `Consulta sobre ${documentTitle}` 
      : 'Consulta sobre documentación inmobiliaria';
    
    let body = `Hola ${advisorInfo.name},\n\n`;
    body += `Tengo una consulta sobre documentación inmobiliaria.\n\n`;
    
    if (documentTitle) {
      body += `Documento: ${documentTitle}\n\n`;
    }
    
    if (userQuestion) {
      body += `Mi pregunta: ${userQuestion}\n\n`;
    }
    
    body += `¿Podrías ayudarme?\n\nGracias.`;

    window.location.href = `mailto:${advisorInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <img
              src={advisorInfo.photo}
              alt={advisorInfo.name}
              className="w-16 h-16 rounded-full object-cover border-4 border-white/20"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(advisorInfo.name)}&background=4ade80&color=fff&size=64`;
              }}
            />
            <div>
              <h3 className="text-xl font-bold">{advisorInfo.name}</h3>
              <p className="text-green-100">Asesor Inmobiliario</p>
              <div className="flex items-center space-x-1 mt-1 text-green-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{advisorInfo.availability}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              ¿Necesitas ayuda?
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Nuestro asesor especializado está disponible para resolver tus dudas sobre documentación
            </p>
          </div>

          {documentTitle && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Consulta sobre:</strong> {documentTitle}
              </p>
            </div>
          )}

          {/* Contact Options */}
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleWhatsAppContact}
            >
              <MessageSquare className="w-5 h-5 mr-3" />
              Contactar por WhatsApp
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handlePhoneCall}
            >
              <Phone className="w-5 h-5 mr-3" />
              Llamar Ahora
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={handleEmailContact}
            >
              <Mail className="w-5 h-5 mr-3" />
              Enviar Email
            </Button>
          </div>

          {/* Additional Info */}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 dark:text-white mb-2">
              Información de contacto
            </h5>
            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{advisorInfo.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{advisorInfo.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default WhatsAppContact;
