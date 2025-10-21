// Paso 3: Documentos y Contratos
import { useState, useCallback } from 'react';
import { 
  FileText, Upload, Calendar, DollarSign, User, Phone,
  Mail, MapPin, CheckCircle, X, Eye, Download, AlertTriangle
} from 'lucide-react';
import type { ClientWizardData } from '../ClientWizard';

interface Step3Props {
  formData: ClientWizardData;
  onChange: (data: Partial<ClientWizardData>) => void;
}

const documentTypes = [
  { key: 'cedula_frente', label: 'Cédula (Frente)', required: true },
  { key: 'cedula_reverso', label: 'Cédula (Reverso)', required: true },
  { key: 'certificado_laboral', label: 'Certificado Laboral', required: false },
  { key: 'contrato_firmado', label: 'Contrato Firmado', required: false }
];

export default function Step3Documents({ formData, onChange }: Step3Props) {
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{ type: string; file: File } | null>(null);

  const handleContractChange = (field: string, value: any) => {
    onChange({
      contract_info: {
        ...formData.contract_info,
        [field]: value
      }
    });
  };

  const handleDocumentUpload = (docType: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG o PDF');
      return;
    }

    // Validar tamaño (máx 20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('El archivo no debe superar los 20MB');
      return;
    }

    onChange({
      documents: {
        ...formData.documents,
        [docType]: file
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragOver(docType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, docType: string) => {
    e.preventDefault();
    setDragOver(null);
    handleDocumentUpload(docType, e.dataTransfer.files);
  }, []);

  const removeDocument = (docType: string) => {
    onChange({
      documents: {
        ...formData.documents,
        [docType]: null
      }
    });
  };

  const getDocument = (docType: string): File | null => {
    return (formData.documents as any)[docType];
  };

  return (
    <div className="space-y-8">
      {/* Título */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Documentos y Contratos
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sube los documentos del cliente y configura la información del contrato
        </p>
      </div>

      {/* Sección 1: Información del Contrato */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Información del Contrato
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Contrato */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Contrato
            </label>
            <select
              value={formData.contract_info.contract_type}
              onChange={(e) => handleContractChange('contract_type', e.target.value)}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            >
              <option value="arriendo">Arriendo</option>
              <option value="coworking">Coworking</option>
              <option value="oficina_privada">Oficina Privada</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Inicio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.contract_info.start_date}
                onChange={(e) => handleContractChange('start_date', e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Fecha de Fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Fin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={formData.contract_info.end_date}
                onChange={(e) => handleContractChange('end_date', e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Duración en Meses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duración (meses)
            </label>
            <input
              type="number"
              min="1"
              max="120"
              value={formData.contract_info.contract_duration_months}
              onChange={(e) => handleContractChange('contract_duration_months', parseInt(e.target.value))}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Sección 2: Depósito */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Depósito
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monto del Depósito */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Monto del Depósito
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={formData.contract_info.deposit_amount}
                onChange={(e) => handleContractChange('deposit_amount', e.target.value)}
                placeholder="1500000"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Depósito Pagado */}
          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.contract_info.deposit_paid}
                onChange={(e) => handleContractChange('deposit_paid', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-white block">
                  Depósito Pagado
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Marca si ya recibiste el depósito
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Sección 3: Fiador/Garante */}
      <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Fiador/Garante
          </h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.contract_info.guarantor_required}
              onChange={(e) => handleContractChange('guarantor_required', e.target.checked)}
              className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Requiere Fiador
            </span>
          </label>
        </div>

        {formData.contract_info.guarantor_required && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Nombre del Fiador */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre Completo del Fiador *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.contract_info.guarantor_name}
                  onChange={(e) => handleContractChange('guarantor_name', e.target.value)}
                  placeholder="Nombre del fiador"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Documento del Fiador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Documento del Fiador *
              </label>
              <input
                type="text"
                value={formData.contract_info.guarantor_document}
                onChange={(e) => handleContractChange('guarantor_document', e.target.value)}
                placeholder="123456789"
                className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Teléfono del Fiador */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Teléfono del Fiador
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={formData.contract_info.guarantor_phone}
                  onChange={(e) => handleContractChange('guarantor_phone', e.target.value)}
                  placeholder="300 123 4567"
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección 4: Documentos Requeridos */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600" />
          Documentos Requeridos
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documentTypes.map((docType) => {
            const file = getDocument(docType.key);
            const isUploaded = file !== null;

            return (
              <div key={docType.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {docType.label}
                  {docType.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {!isUploaded ? (
                  // Zona de Drop
                  <div
                    onDragOver={(e) => handleDragOver(e, docType.key)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, docType.key)}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer ${
                      dragOver === docType.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 bg-white dark:bg-gray-700'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleDocumentUpload(docType.key, e.target.files)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Arrastra o haz clic
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        JPG, PNG o PDF (máx. 20MB)
                      </p>
                    </div>
                  </div>
                ) : (
                  // Archivo Subido
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(file.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc({ type: docType.label, file })}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 p-1"
                          title="Vista previa"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeDocument(docType.key)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 p-1"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Nota sobre documentos */}
        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Documentos Opcionales
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                Los documentos marcados con * son requeridos. Puedes subir los demás más tarde desde el perfil del cliente.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                {previewDoc.type} - {previewDoc.file.name}
              </h4>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100 dark:bg-gray-900">
              {previewDoc.file.type === 'application/pdf' ? (
                <div className="text-center py-20">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Vista previa de PDF no disponible
                  </p>
                  <a
                    href={URL.createObjectURL(previewDoc.file)}
                    download={previewDoc.file.name}
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </a>
                </div>
              ) : (
                <img
                  src={URL.createObjectURL(previewDoc.file)}
                  alt={previewDoc.type}
                  className="max-w-full h-auto mx-auto rounded-lg"
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <a
                href={URL.createObjectURL(previewDoc.file)}
                download={previewDoc.file.name}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Descargar
              </a>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
