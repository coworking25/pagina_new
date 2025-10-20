// Paso 1: Información Básica del Cliente
import { User, Phone, Mail, MapPin, FileText, AlertTriangle } from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Step1Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

export default function Step1BasicInfo({ formData, onChange }: Step1Props) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Información Básica del Cliente
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Ingresa los datos personales y de contacto del cliente
        </p>
      </div>

      {/* Tipo de Cliente */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Tipo de Cliente *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleChange('client_type', 'tenant')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.client_type === 'tenant'
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <User className={`w-8 h-8 ${
                formData.client_type === 'tenant' ? 'text-blue-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="text-center">
              <div className={`font-medium ${
                formData.client_type === 'tenant' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Inquilino
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Arrienda o usa espacios
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleChange('client_type', 'landlord')}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.client_type === 'landlord'
                ? 'border-green-600 bg-green-50 dark:bg-green-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-400'
            }`}
          >
            <div className="flex items-center justify-center mb-2">
              <FileText className={`w-8 h-8 ${
                formData.client_type === 'landlord' ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div className="text-center">
              <div className={`font-medium ${
                formData.client_type === 'landlord' ? 'text-green-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Propietario
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Dueño de propiedades
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Grid de 2 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre Completo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre Completo *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Ej: Juan Diego Restrepo Bayer"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tipo de Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Documento *
          </label>
          <select
            value={formData.document_type}
            onChange={(e) => handleChange('document_type', e.target.value)}
            className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="cedula">Cédula de Ciudadanía</option>
            <option value="pasaporte">Pasaporte</option>
            <option value="nit">NIT</option>
          </select>
        </div>

        {/* Número de Documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Documento *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.document_number}
              onChange={(e) => handleChange('document_number', e.target.value)}
              placeholder="1234567890"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Teléfono *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="300 123 4567"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ciudad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Ciudad
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Medellín"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Dirección
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Calle 10 # 45-67, Apartamento 301"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Contacto de Emergencia
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.emergency_contact_name}
              onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
              placeholder="Nombre del contacto"
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Teléfono Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                placeholder="300 123 4567"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Estado del Cliente
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
          className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="suspended">Suspendido</option>
        </select>
      </div>

      {/* Nota de campos requeridos */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
        <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Los campos marcados con * son obligatorios
        </p>
      </div>
    </div>
  );
}
