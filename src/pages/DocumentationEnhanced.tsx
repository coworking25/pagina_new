import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Download, 
  CheckCircle, 
  Circle, 
  User, 
  Home, 
  Clock,
  Eye,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Calendar,
  Target,
  CheckCheck,
  Upload,
  Trash2,
  Edit,
  Phone
} from 'lucide-react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import DocumentViewerModal from '../components/Modals/DocumentViewerModal';
import DocumentUploader from '../components/UI/DocumentUploader';
import { DocumentGenerator } from '../lib/documentGenerator';

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  hasUpload?: boolean;
  tooltip?: string;
  estimatedTime?: string;
}

interface DocumentItem {
  title: string;
  description: string;
  type: string;
  size: string;
  url: string;
  category: 'contracts' | 'forms' | 'guides';
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'documentos' | 'proceso';
}

interface DocumentUpload {
  id: string;
  file: File;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  checklistItemId: string;
  url?: string;
  uploadedAt?: Date;
  errorMessage?: string;
}

interface ProcessStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  completed: boolean;
  estimatedDays: number;
}

const DocumentationEnhanced: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'owner' | 'tenant'>('tenant');
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [userUploads, setUserUploads] = useState<DocumentUpload[]>([]);
  const [showProgress, setShowProgress] = useState(true);
  const [activeView, setActiveView] = useState<'checklist' | 'documents' | 'upload' | 'faq' | 'timeline'>('checklist');

  const [tenantChecklist, setTenantChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Cédula de Ciudadanía',
      description: 'Original y copia de la cédula del arrendatario',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'Documento de identidad válido y legible',
      estimatedTime: '1 día'
    },
    {
      id: '2',
      title: 'Certificado de Ingresos',
      description: 'Certificado laboral con salario o declaración de renta',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'Debe mostrar ingresos de los últimos 3 meses',
      estimatedTime: '3-5 días'
    },
    {
      id: '3',
      title: 'Referencias Comerciales',
      description: 'Mínimo 2 referencias comerciales verificables',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'Contactos de bancos, proveedores o empresas',
      estimatedTime: '2-3 días'
    },
    {
      id: '4',
      title: 'Codeudor',
      description: 'Documentos del codeudor (cédula, ingresos, referencias)',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'El codeudor debe cumplir requisitos de ingresos similares',
      estimatedTime: '5-7 días'
    },
    {
      id: '5',
      title: 'Póliza de Arrendamiento',
      description: 'Póliza que cubra cánones y daños',
      required: true,
      completed: false,
      tooltip: 'Cobertura mínima por valor de 12 meses de arriendo',
      estimatedTime: '1-2 días'
    },
    {
      id: '6',
      title: 'Depósito de Garantía',
      description: 'Equivalente a 1 mes de arriendo',
      required: true,
      completed: false,
      tooltip: 'Se devuelve al finalizar el contrato sin novedades',
      estimatedTime: '1 día'
    }
  ]);

  const [ownerChecklist, setOwnerChecklist] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Escritura de la Propiedad',
      description: 'Documento que acredite la propiedad del inmueble',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'Escritura registrada en notaría',
      estimatedTime: '1 día'
    },
    {
      id: '2',
      title: 'Certificado de Tradición',
      description: 'Documento expedido por la oficina de registro',
      required: true,
      completed: false,
      hasUpload: true,
      tooltip: 'No mayor a 30 días de expedición',
      estimatedTime: '1-2 días'
    },
    {
      id: '3',
      title: 'Paz y Salvo de Administración',
      description: 'Certificado de estar al día con cuotas de administración',
      required: true,
      completed: false,
      hasUpload: true,
      estimatedTime: '1 día'
    },
    {
      id: '4',
      title: 'Recibo de Servicios',
      description: 'Últimos recibos de servicios públicos',
      required: true,
      completed: false,
      hasUpload: true,
      estimatedTime: '1 día'
    },
    {
      id: '5',
      title: 'Cédula del Propietario',
      description: 'Documento de identidad del propietario',
      required: true,
      completed: false,
      hasUpload: true,
      estimatedTime: '1 día'
    },
    {
      id: '6',
      title: 'Autorización Cónyuge',
      description: 'Si está casado, autorización del cónyuge',
      required: false,
      completed: false,
      hasUpload: true,
      estimatedTime: '1 día'
    }
  ]);

  const processSteps: ProcessStep[] = [
    {
      id: 'documents',
      title: 'Recopilar Documentos',
      description: 'Reúne todos los documentos necesarios según tu checklist',
      icon: FileText,
      completed: false,
      estimatedDays: 7
    },
    {
      id: 'review',
      title: 'Revisión de Documentos',
      description: 'Nuestro equipo revisa y valida la documentación',
      icon: Eye,
      completed: false,
      estimatedDays: 3
    },
    {
      id: 'contract',
      title: 'Elaboración de Contrato',
      description: 'Se prepara el contrato con las condiciones acordadas',
      icon: Edit,
      completed: false,
      estimatedDays: 2
    },
    {
      id: 'signature',
      title: 'Firma del Contrato',
      description: 'Firma presencial o digital del contrato',
      icon: CheckCheck,
      completed: false,
      estimatedDays: 1
    },
    {
      id: 'delivery',
      title: 'Entrega de Llaves',
      description: 'Entrega formal del inmueble con inventario',
      icon: Home,
      completed: false,
      estimatedDays: 1
    }
  ];

  // Persistir estado en localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('documentationState');
    if (savedData) {
      const { tenantChecklist: savedTenant, ownerChecklist: savedOwner, userUploads: savedUploads } = JSON.parse(savedData);
      if (savedTenant) setTenantChecklist(savedTenant);
      if (savedOwner) setOwnerChecklist(savedOwner);
      if (savedUploads) setUserUploads(savedUploads);
    }
  }, []);

  useEffect(() => {
    const stateToSave = {
      tenantChecklist,
      ownerChecklist,
      userUploads
    };
    localStorage.setItem('documentationState', JSON.stringify(stateToSave));
  }, [tenantChecklist, ownerChecklist, userUploads]);

  const documents: DocumentItem[] = [
    {
      title: 'Contrato de Arrendamiento',
      description: 'Modelo de contrato estándar actualizado',
      type: 'PDF',
      size: '245 KB',
      url: '/documents/contrato-arrendamiento.pdf',
      category: 'contracts'
    },
    {
      title: 'Manual de Convivencia',
      description: 'Normas y reglamentos del inmueble',
      type: 'PDF',
      size: '180 KB',
      url: '/documents/manual-convivencia.pdf',
      category: 'guides'
    },
    {
      title: 'Inventario de Entrega',
      description: 'Formato para inventario detallado',
      type: 'PDF',
      size: '120 KB',
      url: '/documents/inventario-entrega.pdf',
      category: 'forms'
    },
    {
      title: 'Formato de Solicitud',
      description: 'Solicitud de arrendamiento',
      type: 'PDF',
      size: '95 KB',
      url: '/documents/formato-solicitud.pdf',
      category: 'forms'
    },
    {
      title: 'Guía del Propietario',
      description: 'Manual completo para propietarios',
      type: 'PDF',
      size: '380 KB',
      url: '/documents/guia-propietario.pdf',
      category: 'guides'
    },
    {
      title: 'Formulario de Referencias',
      description: 'Formato para verificación de referencias',
      type: 'PDF',
      size: '85 KB',
      url: '/documents/referencias.pdf',
      category: 'forms'
    }
  ];

  const faqItems: FAQItem[] = [
    {
      question: '¿Qué documentos son obligatorios para arrendar?',
      answer: 'Los documentos obligatorios incluyen: cédula de ciudadanía, certificado de ingresos, referencias comerciales, documentos del codeudor, póliza de arrendamiento y depósito de garantía.',
      category: 'documentos'
    },
    {
      question: '¿Cuánto tiempo toma el proceso de aprobación?',
      answer: 'El proceso completo toma entre 7-15 días hábiles, dependiendo de la rapidez en la entrega de documentos y la verificación de referencias.',
      category: 'proceso'
    },
    {
      question: '¿Puedo subir documentos digitalmente?',
      answer: 'Sí, nuestra plataforma permite subir documentos en formato PDF, JPG o PNG. Los documentos originales se pueden presentar al momento de la firma.',
      category: 'documentos'
    },
    {
      question: '¿Qué pasa si no tengo codeudor?',
      answer: 'Sin codeudor puedes optar por una póliza de arrendamiento con mayor cobertura o realizar un depósito de garantía adicional.',
      category: 'general'
    },
    {
      question: '¿Los documentos tienen fecha de vencimiento?',
      answer: 'Sí, documentos como certificados de ingresos y referencias no deben tener más de 30 días de expedición.',
      category: 'documentos'
    }
  ];

  const toggleChecklistItem = (id: string, type: 'owner' | 'tenant') => {
    if (type === 'tenant') {
      setTenantChecklist(prev =>
        prev.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    } else {
      setOwnerChecklist(prev =>
        prev.map(item =>
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      );
    }
  };

  const getProgress = (checklist: ChecklistItem[]) => {
    const completed = checklist.filter(item => item.completed).length;
    return Math.round((completed / checklist.length) * 100);
  };

  const getTotalEstimatedTime = (checklist: ChecklistItem[]) => {
    const incomplete = checklist.filter(item => !item.completed && item.estimatedTime);
    const maxDays = Math.max(...incomplete.map(item => {
      const time = item.estimatedTime || '1 día';
      const days = parseInt(time.split('-')[1] || time.split(' ')[0]);
      return isNaN(days) ? 1 : days;
    }));
    return isNaN(maxDays) ? 0 : maxDays;
  };

  const handleDocumentView = (document: DocumentItem) => {
    setSelectedDocument(document);
    setIsViewerOpen(true);
  };

  const handleDocumentDownload = async (document: DocumentItem) => {
    try {
      // Mapear el documento a una plantilla válida
      let templateType: 'purchase_contract' | 'rental_contract' | 'lease_agreement' | 'property_guide' | 'financing_form' | 'inspection_checklist';
      
      switch (document.title.toLowerCase()) {
        case 'contrato de compraventa':
          templateType = 'purchase_contract';
          break;
        case 'contrato de arrendamiento':
          templateType = 'rental_contract';
          break;
        case 'acuerdo de arrendamiento':
          templateType = 'lease_agreement';
          break;
        case 'guía de propiedades':
          templateType = 'property_guide';
          break;
        case 'formulario de financiación':
          templateType = 'financing_form';
          break;
        case 'checklist de inspección':
          templateType = 'inspection_checklist';
          break;
        default:
          templateType = 'property_guide';
      }

      // Obtener la plantilla del documento
      const template = DocumentGenerator.getTemplate(templateType, {
        clientName: 'Cliente',
        date: new Date().toLocaleDateString('es-CO'),
        propertyAddress: 'Dirección de la propiedad',
        amount: '$0'
      });

      // Usar el método downloadDocument para descargar directamente
      DocumentGenerator.downloadDocument(template);
      
    } catch (error) {
      console.error('Error al generar el documento:', error);
      alert(`❌ Error al descargar el documento: ${document.title}`);
    }
  };

  const handleUploadComplete = (upload: DocumentUpload) => {
    setUserUploads(prev => {
      const existing = prev.find(u => u.id === upload.id);
      if (existing) {
        return prev.map(u => u.id === upload.id ? upload : u);
      }
      return [...prev, upload];
    });
  };

  const handleUploadRemove = (uploadId: string) => {
    setUserUploads(prev => prev.filter(upload => upload.id !== uploadId));
  };

  const currentChecklist = activeTab === 'tenant' ? tenantChecklist : ownerChecklist;
  const progress = getProgress(currentChecklist);
  const estimatedTime = getTotalEstimatedTime(currentChecklist);

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<string, DocumentItem[]>);

  const categoryLabels = {
    contracts: 'Contratos',
    forms: 'Formularios',
    guides: 'Guías y Manuales'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con navegación mejorada */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Centro de Documentación
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Gestiona todos tus documentos inmobiliarios de forma fácil y segura
          </p>

          {/* Navegación por pestañas */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {[
              { id: 'checklist', label: 'Lista de Verificación', icon: CheckCircle },
              { id: 'documents', label: 'Documentos', icon: FileText },
              { id: 'upload', label: 'Subir Archivos', icon: Upload },
              { id: 'timeline', label: 'Proceso', icon: Calendar },
              { id: 'faq', label: 'Preguntas Frecuentes', icon: HelpCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeView === id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Vista de Lista de Verificación */}
        {activeView === 'checklist' && (
          <div className="space-y-8">
            {/* Selector de tipo de usuario */}
            <div className="flex justify-center">
              <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('tenant')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'tenant'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Arrendatario</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('owner')}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                      activeTab === 'owner'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Home className="w-5 h-5" />
                    <span>Propietario</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard de progreso mejorado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - progress / 100)}`}
                      className="text-blue-600 transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {progress}%
                    </span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Progreso Total
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentChecklist.filter(item => item.completed).length} de {currentChecklist.length} completados
                </p>
              </Card>

              <Card className="p-6 text-center">
                <Target className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Tiempo Estimado
                </h3>
                <p className="text-2xl font-bold text-orange-500 mb-1">
                  {estimatedTime} días
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Para completar pendientes
                </p>
              </Card>

              <Card className="p-6 text-center">
                <BarChart3 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Estado del Proceso
                </h3>
                <p className="text-lg font-semibold mb-1">
                  {progress === 100 ? (
                    <span className="text-green-600">Completado</span>
                  ) : progress >= 75 ? (
                    <span className="text-blue-600">Casi listo</span>
                  ) : progress >= 50 ? (
                    <span className="text-yellow-600">En progreso</span>
                  ) : (
                    <span className="text-red-600">Iniciando</span>
                  )}
                </p>
              </Card>
            </div>

            {/* Lista de verificación mejorada */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {activeTab === 'tenant' ? 'Requisitos para Arrendatarios' : 'Requisitos para Propietarios'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowProgress(!showProgress)}
                >
                  {showProgress ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="space-y-4">
                {currentChecklist.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`group p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      item.completed
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                    onClick={() => toggleChecklistItem(item.id, activeTab)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {item.completed ? (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <Circle className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                              {item.title}
                              {item.required && <span className="text-red-500 ml-1">*</span>}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {item.description}
                            </p>
                            
                            {/* Información adicional */}
                            <div className="flex flex-wrap items-center gap-4 text-xs">
                              {item.estimatedTime && (
                                <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                                  <Clock className="w-3 h-3" />
                                  <span>{item.estimatedTime}</span>
                                </div>
                              )}
                              
                              {item.tooltip && (
                                <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400" title={item.tooltip}>
                                  <HelpCircle className="w-3 h-3" />
                                  <span>Ayuda</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {item.hasUpload && (
                            <div className="flex-shrink-0 ml-4">
                              <div className="flex items-center space-x-2">
                                {userUploads.filter(upload => upload.checklistItemId === item.id).length > 0 && (
                                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                                    <CheckCircle className="w-4 h-4" />
                                    <span className="text-xs">
                                      {userUploads.filter(upload => upload.checklistItemId === item.id).length} archivo(s)
                                    </span>
                                  </div>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setActiveView('upload')}
                                >
                                  <Upload className="w-3 h-3 mr-1" />
                                  Subir
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Vista de Documentos */}
        {activeView === 'documents' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Documentos Disponibles
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Descarga los documentos necesarios para tu proceso inmobiliario
              </p>
            </div>

            {Object.entries(groupedDocuments).map(([category, docs]) => (
              <Card key={category} className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {docs.map((document, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <FileText className="w-8 h-8 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                            {document.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            {document.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {document.type} • {document.size}
                            </span>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDocumentView(document)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDocumentDownload(document)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Vista de Subida de Archivos */}
        {activeView === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Subir Documentos
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sube tus documentos de forma segura para acelerar el proceso
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Lista de elementos del checklist que permiten upload */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Documentos Requeridos
                </h3>
                
                <div className="space-y-4">
                  {currentChecklist
                    .filter(item => item.hasUpload)
                    .map(item => (
                      <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.title}
                          </h4>
                          <div className="flex items-center space-x-2">
                            {item.completed && (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            )}
                            {userUploads.filter(upload => upload.checklistItemId === item.id).length > 0 && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">
                                {userUploads.filter(upload => upload.checklistItemId === item.id).length} archivo(s)
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <DocumentUploader
                          checklistItemId={item.id}
                          checklistItemTitle={item.title}
                          onUploadComplete={handleUploadComplete}
                          onUploadRemove={handleUploadRemove}
                          existingUploads={userUploads.filter(upload => upload.checklistItemId === item.id)}
                        />
                      </div>
                    ))}
                </div>
              </Card>

              {/* Resumen de archivos subidos */}
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Archivos Subidos
                </h3>
                
                {userUploads.length > 0 ? (
                  <div className="space-y-3">
                    {userUploads.map(upload => (
                      <div key={upload.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {upload.file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {currentChecklist.find(item => item.id === upload.checklistItemId)?.title}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {upload.status === 'success' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUploadRemove(upload.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No has subido ningún archivo aún
                    </p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        )}

        {/* Vista de Timeline del Proceso */}
        {activeView === 'timeline' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Proceso Inmobiliario
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sigue el progreso de tu proceso paso a paso
              </p>
            </div>

            <Card className="p-8">
              <div className="space-y-8">
                {processSteps.map((step, index) => (
                  <div key={step.id} className="flex items-start space-x-6">
                    {/* Línea vertical */}
                    <div className="flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : index === 0 
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                      }`}>
                        <step.icon className="w-6 h-6" />
                      </div>
                      {index < processSteps.length - 1 && (
                        <div className={`w-0.5 h-16 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>

                    {/* Contenido del paso */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {step.estimatedDays} día(s)
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {step.description}
                      </p>
                      
                      {step.completed && (
                        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Completado</span>
                        </div>
                      )}
                      
                      {!step.completed && index === 0 && (
                        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">En progreso</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Resumen del timeline */}
              <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Tiempo Total Estimado
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {processSteps.reduce((total, step) => total + step.estimatedDays, 0)} días
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Pasos Completados
                    </h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {processSteps.filter(step => step.completed).length} / {processSteps.length}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Progreso General
                    </h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {Math.round((processSteps.filter(step => step.completed).length / processSteps.length) * 100)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Vista de FAQ */}
        {activeView === 'faq' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Encuentra respuestas a las preguntas más comunes
              </p>
            </div>

            <Card className="p-6">
              <div className="space-y-4">
                {faqItems.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.question ? null : faq.question)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <span className="font-medium text-gray-900 dark:text-white">
                        {faq.question}
                      </span>
                      {expandedFAQ === faq.question ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {expandedFAQ === faq.question && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="px-6 pb-4"
                        >
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Contacto para más ayuda */}
              <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    ¿No encuentras lo que buscas?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Nuestro equipo está aquí para ayudarte con cualquier duda
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button variant="primary">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat en Vivo
                    </Button>
                    <Button variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Llamar Asesor
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Modal de visor de documentos */}
        {selectedDocument && (
          <DocumentViewerModal
            isOpen={isViewerOpen}
            onClose={() => {
              setIsViewerOpen(false);
              setSelectedDocument(null);
            }}
            document={selectedDocument}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentationEnhanced;
