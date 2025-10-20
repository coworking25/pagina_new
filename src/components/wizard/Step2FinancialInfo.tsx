// Paso 2: Información Financiera y Configuración de Pagos
import { useState } from 'react';
import { 
  DollarSign, Briefcase, Building, CreditCard, Calendar,
  Plus, Trash2, User, Phone, Mail, CheckSquare, Square
} from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Step2Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

const serviciosPublicosOptions = [
  { value: 'agua', label: 'Agua' },
  { value: 'luz', label: 'Luz' },
  { value: 'gas', label: 'Gas' },
  { value: 'internet', label: 'Internet' },
  { value: 'aseo', label: 'Aseo' }
];

export default function Step2FinancialInfo({ formData, onChange }: Step2Props) {
  const [showPersonalRefForm, setShowPersonalRefForm] = useState(false);
  const [showCommercialRefForm, setShowCommercialRefForm] = useState(false);

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const handlePaymentConfigChange = (field: string, value: any) => {
    onChange({
      payment_config: {
        ...formData.payment_config,
        [field]: value
      }
    });
  };

  const handleConceptChange = (concept: 'arriendo' | 'administracion' | 'servicios_publicos' | 'otros', field: string, value: any) => {
    onChange({
      payment_config: {
        ...formData.payment_config,
        concepts: {
          ...formData.payment_config.concepts,
          [concept]: {
            ...formData.payment_config.concepts[concept],
            [field]: value
          }
        }
      }
    });
  };

  const toggleServicioPublico = (servicio: string) => {
    const currentTypes = formData.payment_config.concepts.servicios_publicos.types || [];
    const newTypes = currentTypes.includes(servicio)
      ? currentTypes.filter(s => s !== servicio)
      : [...currentTypes, servicio];
    
    handleConceptChange('servicios_publicos', 'types', newTypes);
  };

  const addPersonalReference = () => {
    setShowPersonalRefForm(true);
  };

  const addCommercialReference = () => {
    setShowCommercialRefForm(true);
  };

  const savePersonalReference = (ref: any) => {
    onChange({
      references: {
        ...formData.references,
        personal: [...formData.references.personal, ref]
      }
    });
    setShowPersonalRefForm(false);
  };

  const saveCommercialReference = (ref: any) => {
    onChange({
      references: {
        ...formData.references,
        commercial: [...formData.references.commercial, ref]
      }
    });
    setShowCommercialRefForm(false);
  };

  const removePersonalReference = (index: number) => {
    const newRefs = formData.references.personal.filter((_, i) => i !== index);
    onChange({
      references: {
        ...formData.references,
        personal: newRefs
      }
    });
  };

  const removeCommercialReference = (index: number) => {
    const newRefs = formData.references.commercial.filter((_, i) => i !== index);
    onChange({
      references: {
        ...formData.references,
        commercial: newRefs
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Información Financiera y Configuración de Pagos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Define los ingresos, ocupación y configura los conceptos de pago del cliente
        </p>
      </div>

      {/* Sección 1: Información Profesional */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Información Profesional
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingresos Mensuales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ingresos Mensuales
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.monthly_income}
                onChange={(e) => handleChange('monthly_income', e.target.value)}
                placeholder="3000000"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Solo números, sin puntos ni comas
            </p>
          </div>

          {/* Ocupación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ocupación
            </label>
            <input
              type="text"
              value={formData.occupation}
              onChange={(e) => handleChange('occupation', e.target.value)}
              placeholder="Ingeniero de Software"
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Empresa */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Empresa
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="Acme Corporation"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sección 2: Configuración de Pagos */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600" />
          Configuración de Pagos
        </h4>

        {/* Método de Pago y Configuración */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Método de Pago Preferido
            </label>
            <select
              value={formData.payment_config.preferred_payment_method}
              onChange={(e) => handlePaymentConfigChange('preferred_payment_method', e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Día de Facturación
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.payment_config.billing_day}
                onChange={(e) => handlePaymentConfigChange('billing_day', parseInt(e.target.value))}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Días para Pagar
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={formData.payment_config.payment_due_days}
              onChange={(e) => handlePaymentConfigChange('payment_due_days', parseInt(e.target.value))}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conceptos de Pago */}
        <div className="space-y-4">
          <h5 className="font-semibold text-gray-900 dark:text-white">Conceptos de Pago</h5>

          {/* Arriendo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.payment_config.concepts.arriendo.enabled}
                  onChange={(e) => handleConceptChange('arriendo', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">💰 Arriendo</span>
              </label>
            </div>
            {formData.payment_config.concepts.arriendo.enabled && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Monto Mensual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.payment_config.concepts.arriendo.amount}
                    onChange={(e) => handleConceptChange('arriendo', 'amount', e.target.value)}
                    placeholder="1500000"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Administración */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.payment_config.concepts.administracion.enabled}
                  onChange={(e) => handleConceptChange('administracion', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">🏢 Administración</span>
              </label>
            </div>
            {formData.payment_config.concepts.administracion.enabled && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Monto Mensual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={formData.payment_config.concepts.administracion.amount}
                    onChange={(e) => handleConceptChange('administracion', 'amount', e.target.value)}
                    placeholder="150000"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Servicios Públicos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.payment_config.concepts.servicios_publicos.enabled}
                  onChange={(e) => handleConceptChange('servicios_publicos', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">⚡ Servicios Públicos</span>
              </label>
            </div>
            {formData.payment_config.concepts.servicios_publicos.enabled && (
              <div className="space-y-3">
                {/* Selección de servicios */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Selecciona los servicios incluidos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {serviciosPublicosOptions.map(servicio => (
                      <button
                        key={servicio.value}
                        type="button"
                        onClick={() => toggleServicioPublico(servicio.value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                          formData.payment_config.concepts.servicios_publicos.types?.includes(servicio.value)
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-600 text-blue-700 dark:text-blue-300'
                            : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {formData.payment_config.concepts.servicios_publicos.types?.includes(servicio.value) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                        {servicio.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Monto Mensual Estimado
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.payment_config.concepts.servicios_publicos.amount}
                      onChange={(e) => handleConceptChange('servicios_publicos', 'amount', e.target.value)}
                      placeholder="200000"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Otros */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.payment_config.concepts.otros.enabled}
                  onChange={(e) => handleConceptChange('otros', 'enabled', e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="font-medium text-gray-900 dark:text-white">📝 Otros Conceptos</span>
              </label>
            </div>
            {formData.payment_config.concepts.otros.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={formData.payment_config.concepts.otros.description}
                    onChange={(e) => handleConceptChange('otros', 'description', e.target.value)}
                    placeholder="Ej: Parqueadero, Mantenimiento especial, etc."
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Monto Mensual
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.payment_config.concepts.otros.amount}
                      onChange={(e) => handleConceptChange('otros', 'amount', e.target.value)}
                      placeholder="100000"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resumen de Total */}
        <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Total Mensual:</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${(() => {
                const arriendo = formData.payment_config.concepts.arriendo.enabled 
                  ? Number(formData.payment_config.concepts.arriendo.amount) || 0 
                  : 0;
                const admin = formData.payment_config.concepts.administracion.enabled 
                  ? Number(formData.payment_config.concepts.administracion.amount) || 0 
                  : 0;
                const servicios = formData.payment_config.concepts.servicios_publicos.enabled 
                  ? Number(formData.payment_config.concepts.servicios_publicos.amount) || 0 
                  : 0;
                const otros = formData.payment_config.concepts.otros.enabled 
                  ? Number(formData.payment_config.concepts.otros.amount) || 0 
                  : 0;
                return (arriendo + admin + servicios + otros).toLocaleString();
              })()}
            </span>
          </div>
        </div>
      </div>

      {/* Sección 3: Referencias (Opcional) */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Referencias (Opcional)
        </h4>

        {/* Referencias Personales */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 dark:text-white">Referencias Personales</h5>
            <button
              type="button"
              onClick={addPersonalReference}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          
          {formData.references.personal.length > 0 ? (
            <div className="space-y-2">
              {formData.references.personal.map((ref, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ref.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ref.phone} • {ref.relationship}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePersonalReference(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay referencias personales agregadas</p>
          )}
        </div>

        {/* Referencias Comerciales */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-gray-900 dark:text-white">Referencias Comerciales</h5>
            <button
              type="button"
              onClick={addCommercialReference}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          
          {formData.references.commercial.length > 0 ? (
            <div className="space-y-2">
              {formData.references.commercial.map((ref, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ref.company_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{ref.contact_person} • {ref.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCommercialReference(index)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No hay referencias comerciales agregadas</p>
          )}
        </div>
      </div>

      {/* Modales para agregar referencias (simplificados por ahora) */}
      {showPersonalRefForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Agregar Referencia Personal</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                id="personal-ref-name"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                id="personal-ref-phone"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Relación (Ej: Amigo, Familiar)"
                id="personal-ref-relationship"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const name = (document.getElementById('personal-ref-name') as HTMLInputElement).value;
                    const phone = (document.getElementById('personal-ref-phone') as HTMLInputElement).value;
                    const relationship = (document.getElementById('personal-ref-relationship') as HTMLInputElement).value;
                    if (name && phone) {
                      savePersonalReference({ name, phone, relationship });
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowPersonalRefForm(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCommercialRefForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold mb-4">Agregar Referencia Comercial</h4>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre de la empresa"
                id="commercial-ref-company"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Persona de contacto"
                id="commercial-ref-contact"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                id="commercial-ref-phone"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const company_name = (document.getElementById('commercial-ref-company') as HTMLInputElement).value;
                    const contact_person = (document.getElementById('commercial-ref-contact') as HTMLInputElement).value;
                    const phone = (document.getElementById('commercial-ref-phone') as HTMLInputElement).value;
                    if (company_name && phone) {
                      saveCommercialReference({ company_name, contact_person, phone });
                    }
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={() => setShowCommercialRefForm(false)}
                  className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
