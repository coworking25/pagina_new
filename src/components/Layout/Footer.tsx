import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">CI</span>
                </div>
                <div className="absolute inset-0 bg-green-400 rounded-lg blur-md opacity-30 animate-pulse"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold">Coworking Inmobiliario</h3>
                <p className="text-sm text-gray-400">La luz te guía a casa</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Expertos en bienes raíces con más de 10 años de experiencia. 
              Te acompañamos en cada paso hacia tu nuevo hogar.
            </p>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Servicios</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/properties?type=rent" className="hover:text-green-400 transition-colors">Arrendamientos</Link></li>
              <li><Link to="/properties?type=sale" className="hover:text-green-400 transition-colors">Ventas</Link></li>
              <li><Link to="/services/appraisals" className="hover:text-green-400 transition-colors">Avalúos</Link></li>
              <li><Link to="/services/accounting" className="hover:text-green-400 transition-colors">Asesorías Contables</Link></li>
              <li><Link to="/services/construction" className="hover:text-green-400 transition-colors">Construcción</Link></li>
              <li><Link to="/services/renovation" className="hover:text-green-400 transition-colors">Remodelación</Link></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/advisors" className="hover:text-green-400 transition-colors">Nuestros Asesores</Link></li>
              <li><Link to="/documentation" className="hover:text-green-400 transition-colors">Documentación</Link></li>
              <li><Link to="/about" className="hover:text-green-400 transition-colors">Acerca de Nosotros</Link></li>
              <li><Link to="/privacy" className="hover:text-green-400 transition-colors">Política de Privacidad</Link></li>
              <li><Link to="/terms" className="hover:text-green-400 transition-colors">Términos y Condiciones</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-green-400" />
                <span>Medellín, Colombia</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-green-400" />
                <span>+57 300 123 4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-green-400" />
                <span>info@coworkinginmobiliario.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex space-x-4 mt-6">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors duration-200">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors duration-200">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-green-600 transition-colors duration-200">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Coworking Inmobiliario. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;