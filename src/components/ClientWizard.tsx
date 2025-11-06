// ============================================
// WIZARD MULTI-PASO PARA NUEVO CLIENTE
// ============================================
// Este componente reemplazará el modal actual de "Nuevo Cliente"
// con un formulario de 6 pasos profesional y fácil de usar

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, FileText, Key, Home, CheckCircle,
  ChevronRight, ChevronLeft, X, Save, RotateCcw
} from 'lucide-react';
import Step1BasicInfo from './wizard/Step1BasicInfo';
import Step2FinancialInfo from './wizard/Step2FinancialInfo';
import Step3Documents from './wizard/Step3Documents';
import Step4Credentials from './wizard/Step4Credentials';
import Step5Properties from './wizard/Step5Properties';
import Step6Review from './wizard/Step6Review';

// Tipos
interface WizardStep {
  id: number;
  title: string;
  icon: any;
  description: string;
}

export interface ClientWizardData {
  // Paso 1: Información Básica
  full_name: string;
  document_type: 'cedula' | 'pasaporte' | 'nit';
  document_number: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  client_type: 'tenant' | 'landlord' | 'buyer' | 'seller' | 'interested';
  status: 'active' | 'inactive' | 'suspended';
  client_status?: 'active' | 'inactive' | 'suspended'; // Alias para compatibilidad
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Paso 2: Información Financiera
  monthly_income: string;
  occupation: string;
  company_name: string;
  
  // Configuración de Pagos - Campos directos para compatibilidad
  preferred_payment_method?: string;
  billing_day?: number;
  payment_due_days?: number;
  payment_concepts?: {
    arriendo?: { enabled: boolean; amount: number };
    administracion?: { enabled: boolean; amount: number };
    servicios_publicos?: { enabled: boolean; amount: number; services: string[] };
    otros?: { enabled: boolean; amount: number; description: string };
  };
  personal_references?: Array<{ name: string; phone: string; relationship: string }>;
  commercial_references?: Array<{ company_name: string; contact_person: string; phone: string }>;
  
  // Configuración de Pagos (estructura anidada original)
  payment_config: {
    preferred_payment_method: 'transferencia' | 'efectivo' | 'tarjeta' | 'cheque';
    bank_name: string;
    account_type: 'ahorros' | 'corriente';
    account_number: string;
    billing_day: number;
    payment_due_days: number;
    send_reminders: boolean;
    reminder_days_before: number;
    
    // Conceptos de pago
    concepts: {
      arriendo: { enabled: boolean; amount: string };
      administracion: { enabled: boolean; amount: string };
      servicios_publicos: { enabled: boolean; types: string[]; amount: string };
      otros: { enabled: boolean; description: string; amount: string };
    };
  };
  
  // Referencias
  references: {
    personal: Array<{
      name: string;
      phone: string;
      relationship: string;
    }>;
    commercial: Array<{
      company_name: string;
      contact_person: string;
      phone: string;
    }>;
  };
  
  // Paso 3: Documentos y Contratos - Campos directos para compatibilidad
  contract_type?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  contract_duration_months?: number;
  deposit_amount?: number;
  deposit_paid?: boolean;
  guarantor_required?: boolean;
  guarantor_name?: string;
  guarantor_document?: string;
  guarantor_phone?: string;
  
  // Paso 3: Documentos y Contratos (estructura anidada original)
  contract_info: {
    contract_type: 'arriendo' | 'coworking' | 'oficina_privada' | 'otro';
    start_date: string;
    end_date: string;
    contract_duration_months: number;
    deposit_amount: string;
    deposit_paid: boolean;
    
    // Fiador
    guarantor_required: boolean;
    guarantor_name: string;
    guarantor_document: string;
    guarantor_phone: string;
  };
  
  documents: {
    cedula_frente: File | null;
    cedula_reverso: File | null;
    certificado_laboral: File | null;
    contrato_firmado: File | null;
    otros: File[];
  };
  
  // Paso 4: Portal
  portal_credentials: {
    email: string;
    password: string;
    send_welcome_email: boolean;
    portal_access_enabled: boolean;
  };
  
  // Paso 5: Propiedades
  assigned_property_ids: string[];
  
  // Notas generales
  notes: string;
}

interface ClientWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientWizardData) => Promise<void>;
  properties: any[];
  loadingProperties: boolean;
}

export default function ClientWizard({
  isOpen,
  onClose,
  onSubmit,
  properties,
  loadingProperties
}: ClientWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState<ClientWizardData>({
    // Paso 1
    full_name: '',
    document_type: 'cedula',
    document_number: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    client_type: 'tenant',
    status: 'active',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    
    // Paso 2
    monthly_income: '',
    occupation: '',
    company_name: '',
    payment_config: {
      preferred_payment_method: 'transferencia',
      bank_name: '',
      account_type: 'ahorros',
      account_number: '',
      billing_day: 1,
      payment_due_days: 5,
      send_reminders: true,
      reminder_days_before: 3,
      concepts: {
        arriendo: { enabled: false, amount: '' },
        administracion: { enabled: false, amount: '' },
        servicios_publicos: { enabled: false, types: [], amount: '' },
        otros: { enabled: false, description: '', amount: '' }
      }
    },
    references: {
      personal: [],
      commercial: []
    },
    
    // Paso 3
    contract_info: {
      contract_type: 'arriendo',
      start_date: '',
      end_date: '',
      contract_duration_months: 12,
      deposit_amount: '',
      deposit_paid: false,
      guarantor_required: false,
      guarantor_name: '',
      guarantor_document: '',
      guarantor_phone: ''
    },
    documents: {
      cedula_frente: null,
      cedula_reverso: null,
      certificado_laboral: null,
      contrato_firmado: null,
      otros: []
    },
    
    // Paso 4
    portal_credentials: {
      email: '',
      password: '',
      send_welcome_email: true,
      portal_access_enabled: true
    },
    
    // Paso 5
    assigned_property_ids: [],
    
    notes: ''
  });

  // ============================================
  // PERSISTENCIA DE DATOS (localStorage)
  // ============================================
  
  const STORAGE_KEY = 'client_wizard_draft';
  const STORAGE_STEP_KEY = 'client_wizard_step';
  const COMMON_VALUES_KEY = 'client_wizard_common';

  // Cargar datos guardados al abrir el wizard
  useEffect(() => {
    if (isOpen) {
      try {
        // Cargar borrador guardado
        const savedDraft = localStorage.getItem(STORAGE_KEY);
        const savedStep = localStorage.getItem(STORAGE_STEP_KEY);
        
        if (savedDraft) {
          const parsedData = JSON.parse(savedDraft);
          // Solo restaurar si hay datos significativos
          if (parsedData.full_name || parsedData.document_number) {
            console.log('📥 Restaurando borrador guardado');
            setFormData(parsedData);
            
            // Restaurar el paso donde estaba
            if (savedStep) {
              setCurrentStep(parseInt(savedStep));
            }
          }
        }
      } catch (error) {
        console.error('Error cargando borrador:', error);
      }
    }
  }, [isOpen]);

  // Guardar automáticamente cada vez que cambia formData
  useEffect(() => {
    if (isOpen && formData.full_name) {
      // Solo guardar si hay datos reales
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        localStorage.setItem(STORAGE_STEP_KEY, currentStep.toString());
        console.log('💾 Borrador guardado automáticamente');
      } catch (error) {
        console.error('Error guardando borrador:', error);
      }
    }
  }, [formData, currentStep, isOpen]);

  // Limpiar borrador después de envío exitoso
  const clearDraft = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STORAGE_STEP_KEY);
      console.log('🗑️ Borrador eliminado');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
    }
  };

  // Función para restaurar borrador manualmente
  const restoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsedData = JSON.parse(savedDraft);
        setFormData(parsedData);
        alert('✅ Borrador restaurado correctamente');
      } else {
        alert('ℹ️ No hay ningún borrador guardado');
      }
    } catch (error) {
      console.error('Error restaurando borrador:', error);
      alert('❌ Error al restaurar el borrador');
    }
  };

  // Función para limpiar borrador manualmente
  const manualClearDraft = () => {
    if (confirm('¿Estás seguro de que deseas eliminar el borrador guardado?')) {
      clearDraft();
      // Resetear formulario
      setFormData({
        full_name: '',
        document_type: 'cedula',
        document_number: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        client_type: 'tenant',
        status: 'active',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        monthly_income: '',
        occupation: '',
        company_name: '',
        payment_config: {
          preferred_payment_method: 'transferencia',
          bank_name: '',
          account_type: 'ahorros',
          account_number: '',
          billing_day: 1,
          payment_due_days: 5,
          send_reminders: true,
          reminder_days_before: 3,
          concepts: {
            arriendo: { enabled: false, amount: '' },
            administracion: { enabled: false, amount: '' },
            servicios_publicos: { enabled: false, types: [], amount: '' },
            otros: { enabled: false, description: '', amount: '' }
          }
        },
        references: {
          personal: [],
          commercial: []
        },
        contract_info: {
          contract_type: 'arriendo',
          start_date: '',
          end_date: '',
          contract_duration_months: 12,
          deposit_amount: '',
          deposit_paid: false,
          guarantor_required: false,
          guarantor_name: '',
          guarantor_document: '',
          guarantor_phone: ''
        },
        documents: {
          cedula_frente: null,
          cedula_reverso: null,
          certificado_laboral: null,
          contrato_firmado: null,
          otros: []
        },
        portal_credentials: {
          email: '',
          password: '',
          send_welcome_email: true,
          portal_access_enabled: true
        },
        assigned_property_ids: [],
        notes: ''
      });
      setCurrentStep(1);
      alert('🗑️ Borrador eliminado y formulario reiniciado');
    }
  };

  // Determinar si debe mostrar el paso de credenciales
  const shouldShowCredentials = () => {
    return formData.client_type === 'landlord';
  };

  // Definición de pasos (dinámico según tipo de cliente)
  const allSteps: WizardStep[] = [
    {
      id: 1,
      title: 'Información Básica',
      icon: User,
      description: 'Datos personales y de contacto'
    },
    {
      id: 2,
      title: 'Información Financiera',
      icon: Briefcase,
      description: 'Ingresos, pagos y referencias'
    },
    {
      id: 3,
      title: 'Documentos y Contratos',
      icon: FileText,
      description: 'Subir documentos y detalles del contrato'
    },
    {
      id: 4,
      title: 'Acceso al Portal',
      icon: Key,
      description: 'Credenciales de inicio de sesión'
    },
    {
      id: 5,
      title: 'Propiedades Asignadas',
      icon: Home,
      description: 'Seleccionar propiedades del cliente'
    },
    {
      id: 6,
      title: 'Revisión',
      icon: CheckCircle,
      description: 'Revisar y confirmar toda la información'
    }
  ];

  // Filtrar pasos según tipo de cliente
  const steps = shouldShowCredentials() 
    ? allSteps // Mostrar todos los pasos para landlord
    : allSteps.filter(step => step.id !== 4); // Omitir paso 4 para otros tipos

  // Validación por paso
  const validateStep = (step: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    switch (step) {
      case 1: // Información Básica
        if (!formData.full_name.trim()) errors.push('El nombre completo es requerido');
        if (!formData.document_number.trim()) errors.push('El número de documento es requerido');
        if (!formData.phone.trim()) errors.push('El teléfono es requerido');
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.push('El email no es válido');
        }
        break;
        
      case 2: { // Información Financiera
        // Validar conceptos de pago habilitados
        const { concepts } = formData.payment_config;
        if (concepts.arriendo.enabled && !concepts.arriendo.amount) {
          errors.push('Debes especificar el monto del arriendo');
        }
        if (concepts.administracion.enabled && !concepts.administracion.amount) {
          errors.push('Debes especificar el monto de administración');
        }
        if (concepts.servicios_publicos.enabled && !concepts.servicios_publicos.amount) {
          errors.push('Debes especificar el monto de servicios públicos');
        }
        if (concepts.otros.enabled && !concepts.otros.amount) {
          errors.push('Debes especificar el monto de otros conceptos');
        }
        break;
      }
        
      case 3: { // Documentos y Contratos
        if (formData.contract_info.start_date && formData.contract_info.end_date) {
          const start = new Date(formData.contract_info.start_date);
          const end = new Date(formData.contract_info.end_date);
          if (end <= start) {
            errors.push('La fecha de fin debe ser posterior a la fecha de inicio');
          }
        }
        if (formData.contract_info.guarantor_required) {
          if (!formData.contract_info.guarantor_name) errors.push('El nombre del fiador es requerido');
          if (!formData.contract_info.guarantor_document) errors.push('El documento del fiador es requerido');
        }
        break;
      }
        
      case 4: { // Portal - SOLO para landlord
        // Solo validar credenciales si es propietario
        if (!shouldShowCredentials()) {
          // Si NO es landlord, este paso no aplica, no validar nada
          break;
        }
        
        const email = formData.portal_credentials.email || formData.email;
        if (!email) {
          errors.push('El email es requerido para crear las credenciales');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push('El email no es válido');
        }
        if (!formData.portal_credentials.password) {
          errors.push('La contraseña es requerida');
        } else if (formData.portal_credentials.password.length < 8) {
          errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        break;
      }
        
      case 5: // Propiedades
        // No hay validaciones obligatorias, las propiedades son opcionales
        break;
        
      case 6: // Revisión
        // Ya validamos todo en los pasos anteriores
        break;
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  };

  // Navegación
  const handleNext = () => {
    const validation = validateStep(currentStep);
    if (!validation.valid) {
      alert(`⚠️ Errores en el formulario:\n\n${validation.errors.join('\n')}`);
      return;
    }
    
    // Auto-llenar email del portal si está vacío (solo para landlord)
    if (currentStep === 3 && formData.email && !formData.portal_credentials.email && shouldShowCredentials()) {
      setFormData(prev => ({
        ...prev,
        portal_credentials: {
          ...prev.portal_credentials,
          email: prev.email
        }
      }));
    }
    
    // Saltar el paso 4 si NO es landlord
    if (currentStep === 3 && !shouldShowCredentials()) {
      setCurrentStep(5); // Ir directamente a propiedades
    } else if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      // Saltar el paso 4 hacia atrás si NO es landlord
      if (currentStep === 5 && !shouldShowCredentials()) {
        setCurrentStep(3); // Volver a documentos
      } else {
        setCurrentStep(prev => prev - 1);
      }
    }
  };

  const handleSubmit = async () => {
    // Validar todos los pasos (excepto paso 4 si NO es landlord)
    const stepsToValidate = shouldShowCredentials() 
      ? [1, 2, 3, 4, 5] // Validar todos los pasos para landlord
      : [1, 2, 3, 5]; // Omitir paso 4 para otros tipos
    
    for (const step of stepsToValidate) {
      const validation = validateStep(step);
      if (!validation.valid) {
        alert(`⚠️ Errores en el paso ${step}:\n\n${validation.errors.join('\n')}`);
        setCurrentStep(step);
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      
      // ✅ Limpiar borrador después de envío exitoso
      clearDraft();
      
      onClose();
      // Resetear formulario
      setCurrentStep(1);
    } catch (error) {
      console.error('Error creando cliente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar datos del formulario
  const updateFormData = (data: Partial<ClientWizardData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // Renderizar contenido del paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} onChange={updateFormData} />;
      
      case 2:
        return <Step2FinancialInfo formData={formData} onChange={updateFormData} />;
      
      case 3:
        return <Step3Documents formData={formData} onChange={updateFormData} />;
      
      case 4:
        // Solo mostrar credenciales si es landlord
        if (!shouldShowCredentials()) {
          return null; // No debería llegar aquí por la navegación, pero por seguridad
        }
        return <Step4Credentials formData={formData} onChange={updateFormData} />;
      
      case 5:
        return <Step5Properties 
          formData={formData} 
          onChange={updateFormData} 
          properties={properties}
          loadingProperties={loadingProperties}
        />;
      
      case 6:
        return <Step6Review formData={formData} onEdit={setCurrentStep} />;
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Crear Nuevo Cliente
              </h2>
              
              {/* Botones de Guardar/Restaurar Borrador */}
              <div className="flex gap-2">
                <button
                  onClick={restoreDraft}
                  className="text-sm px-3 py-1.5 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1.5"
                  title="Restaurar borrador guardado"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar
                </button>
                <button
                  onClick={manualClearDraft}
                  className="text-sm px-3 py-1.5 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1.5"
                  title="Limpiar borrador"
                >
                  <X className="w-3.5 h-3.5" />
                  Limpiar
                </button>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Cerrar (se guardará automáticamente)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Indicador de Autoguardado */}
          {formData.full_name && (
            <div className="mb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
              <Save className="w-3.5 h-3.5 animate-pulse" />
              <span>Guardado automáticamente</span>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex-1">
                    <div className="flex items-center">
                      {index > 0 && (
                        <div className={`flex-1 h-1 -ml-2 ${
                          isCompleted ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                      <div className={`flex flex-col items-center ${index === 0 ? '' : '-ml-2'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900'
                            : isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs mt-2 text-center hidden md:block ${
                          isActive ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Body - Contenido del paso actual */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Contenido según el paso actual */}
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer - Navegación */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Paso {currentStep} de {steps.length}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
              )}
              
              {currentStep < 6 ? (
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Crear Cliente
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
