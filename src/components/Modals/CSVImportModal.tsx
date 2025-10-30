import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Loader2,
  Info
} from 'lucide-react';
import {
  parseCSVProperties,
  bulkCreateProperties,
  generatePropertyCSVTemplate,
  CSVImportResult,
  PropertyCSVData
} from '../../lib/supabase';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (result: CSVImportResult) => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const [step, setStep] = useState<'upload' | 'validating' | 'importing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<PropertyCSVData[]>([]);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetModal = () => {
    setStep('upload');
    setSelectedFile(null);
    setCsvData([]);
    setImportResult(null);
    setValidationErrors([]);
    setIsProcessing(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationErrors(['Solo se permiten archivos CSV']);
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setValidationErrors(['El archivo no puede ser mayor a 10MB']);
      return;
    }

    setSelectedFile(file);
    setValidationErrors([]);
    setStep('validating');
    setIsProcessing(true);

    try {
      const text = await file.text();
      const parsedData = parseCSVProperties(text);
      setCsvData(parsedData);

      // Validar datos básicos
      const errors: string[] = [];
      if (parsedData.length === 0) {
        errors.push('El archivo CSV no contiene datos válidos');
      }
      if (parsedData.length > 1000) {
        errors.push('No se pueden importar más de 1000 propiedades a la vez');
      }

      setValidationErrors(errors);
    } catch (error) {
      setValidationErrors([error instanceof Error ? error.message : 'Error al procesar el archivo']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (csvData.length === 0) return;

    setStep('importing');
    setIsProcessing(true);

    try {
      const result = await bulkCreateProperties(
        csvData,
        (current, total) => {
          // Progress callback - could be used for progress bar
          console.log(`Importando ${current}/${total}...`);
        }
      );

      setImportResult(result);
      setStep('results');

      if (onImportComplete) {
        onImportComplete(result);
      }
    } catch (error) {
      setImportResult({
        success: false,
        totalRows: csvData.length,
        successfulImports: 0,
        failedImports: csvData.length,
        errors: [{
          row: 0,
          errors: [error instanceof Error ? error.message : 'Error desconocido durante la importación']
        }],
        createdProperties: []
      });
      setStep('results');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = generatePropertyCSVTemplate();
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_propiedades.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Importar Propiedades CSV
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sube un archivo CSV para importar múltiples propiedades
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {step === 'upload' && (
              <UploadStep
                onFileSelect={handleFileSelect}
                onDownloadTemplate={downloadTemplate}
                fileInputRef={fileInputRef}
              />
            )}

            {step === 'validating' && (
              <ValidatingStep
                selectedFile={selectedFile}
                validationErrors={validationErrors}
                csvData={csvData}
                isProcessing={isProcessing}
                onBack={() => setStep('upload')}
                onContinue={handleImport}
              />
            )}

            {step === 'importing' && (
              <ImportingStep
                totalRows={csvData.length}
                isProcessing={isProcessing}
              />
            )}

            {step === 'results' && (
              <ResultsStep
                result={importResult}
                onClose={handleClose}
                onNewImport={resetModal}
              />
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ==================== UPLOAD STEP ====================
const UploadStep: React.FC<{
  onFileSelect: (file: File) => void;
  onDownloadTemplate: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}> = ({ onFileSelect, onDownloadTemplate, fileInputRef }) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Instrucciones de Importación
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• El archivo debe estar en formato CSV con codificación UTF-8</li>
              <li>• Los campos requeridos son: title, availability_type, bedrooms, bathrooms, area, type</li>
              <li>• Máximo 1000 propiedades por archivo</li>
              <li>• Tamaño máximo del archivo: 10MB</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Template Download */}
      <div className="flex justify-center">
        <button
          onClick={onDownloadTemplate}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Descargar Plantilla CSV</span>
        </button>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Arrastra y suelta tu archivo CSV aquí
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          O haz clic para seleccionar un archivo
        </p>
        <button className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
          Seleccionar Archivo
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
};

// ==================== VALIDATING STEP ====================
const ValidatingStep: React.FC<{
  selectedFile: File | null;
  validationErrors: string[];
  csvData: PropertyCSVData[];
  isProcessing: boolean;
  onBack: () => void;
  onContinue: () => void;
}> = ({ selectedFile, validationErrors, csvData, isProcessing, onBack, onContinue }) => {
  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <div className="flex items-center space-x-3 mb-3">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <span className="font-medium text-gray-900 dark:text-white">
            {selectedFile?.name}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({(selectedFile?.size || 0 / 1024).toFixed(1)} KB)
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {csvData.length} propiedades encontradas en el archivo
        </p>
      </div>

      {/* Processing */}
      {isProcessing && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-gray-600 dark:text-gray-400">
              Procesando archivo...
            </span>
          </div>
        </div>
      )}

      {/* Validation Results */}
      {!isProcessing && (
        <>
          {validationErrors.length > 0 ? (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                    Errores de Validación
                  </h3>
                  <ul className="text-sm text-red-800 dark:text-red-200 space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                    Archivo Válido
                  </h3>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Se encontraron {csvData.length} propiedades válidas para importar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              Volver
            </button>
            <button
              onClick={onContinue}
              disabled={validationErrors.length > 0}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Importar Propiedades
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ==================== IMPORTING STEP ====================
const ImportingStep: React.FC<{
  totalRows: number;
  isProcessing: boolean;
}> = ({ totalRows, isProcessing }) => {
  return (
    <div className="text-center py-12">
      <div className="mb-6">
        <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Importando Propiedades
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Procesando {totalRows} propiedades... Esto puede tomar unos minutos.
        </p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 max-w-md mx-auto">
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="animate-pulse">●</div>
          <div className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</div>
          <div className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          No cierres esta ventana mientras se procesa la importación
        </p>
      </div>
    </div>
  );
};

// ==================== RESULTS STEP ====================
const ResultsStep: React.FC<{
  result: CSVImportResult | null;
  onClose: () => void;
  onNewImport: () => void;
}> = ({ result, onClose, onNewImport }) => {
  if (!result) return null;

  const successRate = result.totalRows > 0 ? (result.successfulImports / result.totalRows) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className={`rounded-xl p-6 border ${
        result.success
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-start space-x-3">
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
          )}
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${
              result.success
                ? 'text-green-900 dark:text-green-100'
                : 'text-red-900 dark:text-red-100'
            }`}>
              {result.success ? 'Importación Exitosa' : 'Importación con Errores'}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Total</p>
                <p className="font-semibold text-gray-900 dark:text-white">{result.totalRows}</p>
              </div>
              <div>
                <p className="text-green-600 dark:text-green-400">Exitosas</p>
                <p className="font-semibold text-green-600 dark:text-green-400">{result.successfulImports}</p>
              </div>
              <div>
                <p className="text-red-600 dark:text-red-400">Fallidas</p>
                <p className="font-semibold text-red-600 dark:text-red-400">{result.failedImports}</p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {successRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 max-h-60 overflow-y-auto">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                Errores Encontrados
              </h4>
              <div className="space-y-2">
                {result.errors.map((error, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-red-800 dark:text-red-200">
                      Fila {error.row}: {error.errors.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {result.success && result.successfulImports > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                ¡Importación Completada!
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Las {result.successfulImports} propiedades se han importado correctamente y están disponibles en el sistema.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onNewImport}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
        >
          Importar Otro Archivo
        </button>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default CSVImportModal;