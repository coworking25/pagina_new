// Paso 6: Revisión y Confirmación Final
import { 
  User, Building2, FileText, Key, Home, Edit2, 
  CheckCircle, AlertCircle, DollarSign, MapPin, 
  Phone, Mail, Briefcase, Users, CreditCard,
  Calendar, Shield, Package
} from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Step6Props {
  formData: ClientWizardData;
  onEdit: (step: number) => void;
}

export default function Step6Review({ formData, onEdit }: Step6Props) {
  // Calcular total de pagos mensuales
  const calculateMonthlyTotal = () => {
    let total = 0;
    if (formData.payment_concepts?.arriendo?.enabled) {
      total += formData.payment_concepts.arriendo.amount || 0;
    }
    if (formData.payment_concepts?.administracion?.enabled) {
      total += formData.payment_concepts.administracion.amount || 0;
    }
    if (formData.payment_concepts?.servicios_publicos?.enabled) {
      total += formData.payment_concepts.servicios_publicos.amount || 0;
    }
    if (formData.payment_concepts?.otros?.enabled) {
      total += formData.payment_concepts.otros.amount || 0;
    }
    return total;
  };

  const monthlyTotal = calculateMonthlyTotal();

  // Verificar si hay campos incompletos
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!formData.full_name) missing.push('Nombre completo');
    if (!formData.document_number) missing.push('Número de documento');
    if (!formData.phone) missing.push('Teléfono');
    if (!formData.email) missing.push('Email');
    if (!formData.portal_credentials?.password) missing.push('Contraseña del portal');
    return missing;
  };

  const missingFields = getMissingFields();
  const isComplete = missingFields.length === 0;

  return (
    <div className="space-y-6">
      {/* Título */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Revisión Final
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Verifica que toda la información sea correcta antes de crear el cliente
        </p>
      </div>

      {/* Alerta de campos faltantes */}
      {!isComplete && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Campos Requeridos Faltantes
              </p>
              <ul className="text-xs text-red-700 dark:text-red-300 mt-2 space-y-1">
                {missingFields.map((field, index) => (
                  <li key={index}>• {field}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de éxito */}
      {isComplete && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ¡Información Completa!
              </p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                Todos los campos requeridos están completos. Puedes proceder a crear el cliente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 1: INFORMACIÓN BÁSICA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-white" />
            <h4 className="text-lg font-semibold text-white">Información Básica</h4>
          </div>
          <button
            type="button"
            onClick={() => onEdit(1)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de Cliente</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize flex items-center gap-2">
                {formData.client_type === 'landlord' ? (
                  <>
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Propietario
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-green-600" />
                    Arrendatario
                  </>
                )}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</p>
              <p className="font-medium text-gray-900 dark:text-white capitalize">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  (formData.client_status || formData.status) === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  (formData.client_status || formData.status) === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {(formData.client_status || formData.status) === 'active' ? 'Activo' :
                   (formData.client_status || formData.status) === 'inactive' ? 'Inactivo' : 'Suspendido'}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre Completo</p>
              <p className="font-medium text-gray-900 dark:text-white">{formData.full_name || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Documento</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {formData.document_type} {formData.document_number || '-'}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Teléfono
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{formData.phone || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Email
              </p>
              <p className="font-medium text-gray-900 dark:text-white break-all">{formData.email || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Dirección
              </p>
              <p className="font-medium text-gray-900 dark:text-white">{formData.address || '-'}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ciudad</p>
              <p className="font-medium text-gray-900 dark:text-white">{formData.city || '-'}</p>
            </div>
          </div>

          {/* Contacto de Emergencia */}
          {(formData.emergency_contact_name || formData.emergency_contact_phone) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Contacto de Emergencia
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.emergency_contact_name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.emergency_contact_phone || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 2: INFORMACIÓN FINANCIERA */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-white" />
            <h4 className="text-lg font-semibold text-white">Información Financiera</h4>
          </div>
          <button
            type="button"
            onClick={() => onEdit(2)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Información Profesional */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Información Profesional
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingresos Mensuales</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.monthly_income ? `$${formData.monthly_income.toLocaleString()}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ocupación</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.occupation || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Empresa</p>
                <p className="font-medium text-gray-900 dark:text-white">{formData.company_name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Configuración de Pagos */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Configuración de Pagos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Método de Pago</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {formData.preferred_payment_method || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Día de Facturación</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.billing_day ? `Día ${formData.billing_day}` : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Días para Pagar</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.payment_due_days ? `${formData.payment_due_days} días` : '-'}
                </p>
              </div>
            </div>

            {/* Conceptos de Pago */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Conceptos de Pago:</p>
              <div className="space-y-2">
                {formData.payment_concepts?.arriendo?.enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">• Arriendo</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${formData.payment_concepts.arriendo.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {formData.payment_concepts?.administracion?.enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">• Administración</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${formData.payment_concepts.administracion.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {formData.payment_concepts?.servicios_publicos?.enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      • Servicios Públicos
                      {formData.payment_concepts.servicios_publicos.services && 
                       formData.payment_concepts.servicios_publicos.services.length > 0 && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({formData.payment_concepts.servicios_publicos.services.join(', ')})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${formData.payment_concepts.servicios_publicos.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {formData.payment_concepts?.otros?.enabled && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      • Otros
                      {formData.payment_concepts.otros.description && (
                        <span className="text-xs text-gray-500 ml-1">
                          ({formData.payment_concepts.otros.description})
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${formData.payment_concepts.otros.amount?.toLocaleString() || 0}
                    </span>
                  </div>
                )}
                {monthlyTotal > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-300 dark:border-gray-600">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Total Mensual</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${monthlyTotal.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Referencias */}
          {((formData.personal_references && formData.personal_references.length > 0) || 
            (formData.commercial_references && formData.commercial_references.length > 0)) && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Referencias
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.personal_references && formData.personal_references.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Personales</p>
                    <div className="space-y-2">
                      {formData.personal_references.map((ref, index) => (
                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                          <p className="font-medium text-gray-900 dark:text-white">{ref.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{ref.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {formData.commercial_references && formData.commercial_references.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Comerciales</p>
                    <div className="space-y-2">
                      {formData.commercial_references.map((ref, index) => (
                        <div key={index} className="text-sm bg-gray-50 dark:bg-gray-900/50 rounded p-2">
                          <p className="font-medium text-gray-900 dark:text-white">{ref.company_name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {ref.contact_person} - {ref.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: DOCUMENTOS Y CONTRATOS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-white" />
            <h4 className="text-lg font-semibold text-white">Documentos y Contratos</h4>
          </div>
          <button
            type="button"
            onClick={() => onEdit(3)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {/* Información del Contrato */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Información del Contrato
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tipo de Contrato</p>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {formData.contract_type || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha Inicio</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.contract_start_date || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fecha Fin</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.contract_end_date || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Duración</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.contract_duration_months ? `${formData.contract_duration_months} meses` : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Depósito */}
          {formData.deposit_amount && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Depósito
              </p>
              <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <span className="text-sm text-gray-700 dark:text-gray-300">Monto del Depósito</span>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ${formData.deposit_amount.toLocaleString()}
                  </span>
                  {formData.deposit_paid && (
                    <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full">
                      ✓ Pagado
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fiador */}
          {formData.guarantor_required && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Información del Fiador
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nombre</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.guarantor_name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Documento</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.guarantor_document || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.guarantor_phone || '-'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Documentos Subidos */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Documentos
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['cedula_frente', 'cedula_reverso', 'certificado_laboral', 'contrato_firmado'].map((docType) => {
                const doc = formData.documents?.[docType as keyof typeof formData.documents];
                const labels = {
                  cedula_frente: 'Cédula Frente',
                  cedula_reverso: 'Cédula Reverso',
                  certificado_laboral: 'Cert. Laboral',
                  contrato_firmado: 'Contrato'
                };
                
                return (
                  <div
                    key={docType}
                    className={`p-3 rounded-lg border-2 ${
                      doc
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {doc ? (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {labels[docType as keyof typeof labels]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: CREDENCIALES DEL PORTAL */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Key className="w-6 h-6 text-white" />
            <h4 className="text-lg font-semibold text-white">Credenciales del Portal</h4>
          </div>
          <button
            type="button"
            onClick={() => onEdit(4)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Email de Acceso</p>
              <p className="font-medium text-gray-900 dark:text-white break-all">
                {formData.portal_credentials?.email || formData.email || '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Contraseña</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white">
                {formData.portal_credentials?.password ? '••••••••••••' : '-'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {formData.portal_credentials?.send_welcome_email && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                <Mail className="w-3 h-3 mr-1" />
                Enviar email de bienvenida
              </span>
            )}
            {formData.portal_credentials?.portal_access_enabled && (
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Acceso habilitado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: PROPIEDADES ASIGNADAS */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-white" />
            <h4 className="text-lg font-semibold text-white">
              Propiedades Asignadas ({(formData.assigned_property_ids || []).length})
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEdit(5)}
            className="flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Editar
          </button>
        </div>
        
        <div className="p-6">
          {formData.assigned_property_ids && formData.assigned_property_ids.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.assigned_property_ids.map((propertyId: string, index: number) => (
                <div
                  key={propertyId}
                  className="inline-flex items-center px-3 py-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
                >
                  <Home className="w-4 h-4 text-orange-600 mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Propiedad {index + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No hay propiedades asignadas
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Nota Final */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
              Antes de Continuar
            </p>
            <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Verifica que todos los datos sean correctos</li>
              <li>• Los campos marcados con asterisco (*) son obligatorios</li>
              <li>• Puedes editar cualquier sección haciendo clic en el botón "Editar"</li>
              <li>• Una vez creado, podrás modificar la información desde el panel de administración</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
