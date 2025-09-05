import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  Check, 
  AlertCircle, 
  Trash2,
  Eye,
  Download
} from 'lucide-react';
import Button from '../UI/Button';

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

interface DocumentUploaderProps {
  checklistItemId: string;
  checklistItemTitle: string;
  onUploadComplete: (upload: DocumentUpload) => void;
  onUploadRemove: (uploadId: string) => void;
  existingUploads?: DocumentUpload[];
  accept?: string;
  maxSize?: number; // en MB
  multiple?: boolean;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  checklistItemId,
  checklistItemTitle,
  onUploadComplete,
  onUploadRemove,
  existingUploads = [],
  accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx',
  maxSize = 10,
  multiple = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<DocumentUpload[]>(existingUploads);

  const validateFile = (file: File): string | null => {
    // Validar tamaño
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo excede el tamaño máximo de ${maxSize}MB`;
    }

    // Validar tipo
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!acceptedTypes.includes(fileExtension)) {
      return `Tipo de archivo no permitido. Formatos aceptados: ${accept}`;
    }

    return null;
  };

  const simulateUpload = async (file: File, uploadId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setUploads(prev => prev.map(upload => 
          upload.id === uploadId 
            ? { ...upload, progress: Math.min(progress, 100) }
            : upload
        ));

        if (progress >= 100) {
          clearInterval(interval);
          
          // Simular éxito o error aleatoriamente (90% éxito)
          if (Math.random() > 0.1) {
            setUploads(prev => prev.map(upload => 
              upload.id === uploadId 
                ? { 
                    ...upload, 
                    status: 'success', 
                    progress: 100,
                    url: URL.createObjectURL(file),
                    uploadedAt: new Date()
                  }
                : upload
            ));
            resolve();
          } else {
            setUploads(prev => prev.map(upload => 
              upload.id === uploadId 
                ? { 
                    ...upload, 
                    status: 'error', 
                    errorMessage: 'Error de conexión. Inténtalo nuevamente.'
                  }
                : upload
            ));
            reject(new Error('Upload failed'));
          }
        }
      }, 200);
    });
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      alert('Solo se permite un archivo');
      return;
    }

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        alert(error);
        continue;
      }

      const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      const newUpload: DocumentUpload = {
        id: uploadId,
        file,
        status: 'uploading',
        progress: 0,
        checklistItemId
      };

      setUploads(prev => [...prev, newUpload]);

      try {
        await simulateUpload(file, uploadId);
        const completedUpload = uploads.find(u => u.id === uploadId);
        if (completedUpload) {
          onUploadComplete(completedUpload);
        }
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const removeUpload = (uploadId: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== uploadId));
    onUploadRemove(uploadId);
  };

  const retryUpload = async (uploadId: string) => {
    const upload = uploads.find(u => u.id === uploadId);
    if (!upload) return;

    setUploads(prev => prev.map(u => 
      u.id === uploadId 
        ? { ...u, status: 'uploading', progress: 0, errorMessage: undefined }
        : u
    ));

    try {
      await simulateUpload(upload.file, uploadId);
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Zona de upload */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id={`file-input-${checklistItemId}`}
        />
        
        <div className="space-y-3">
          <Upload className={`w-8 h-8 mx-auto ${
            isDragOver ? 'text-blue-500' : 'text-gray-400'
          }`} />
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isDragOver ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {accept.split(',').join(', ')} • Máximo {maxSize}MB {multiple ? '• Múltiples archivos' : '• Un archivo'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById(`file-input-${checklistItemId}`)?.click()}
          >
            Seleccionar Archivos
          </Button>
        </div>
      </div>

      {/* Lista de archivos subidos */}
      {uploads.length > 0 && (
        <div className="mt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Archivos para: {checklistItemTitle}
          </h4>
          
          {uploads.map((upload) => (
            <motion.div
              key={upload.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              {/* Icono de estado */}
              <div className="flex-shrink-0">
                {upload.status === 'uploading' && (
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
                {upload.status === 'success' && (
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                  </div>
                )}
                {upload.status === 'error' && (
                  <div className="w-6 h-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                )}
              </div>

              {/* Información del archivo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(upload.file.size)}
                      {upload.uploadedAt && (
                        <> • Subido {upload.uploadedAt.toLocaleTimeString()}</>
                      )}
                    </p>
                  </div>
                  
                  {upload.status === 'uploading' && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {Math.round(upload.progress)}%
                    </span>
                  )}
                </div>

                {/* Barra de progreso */}
                {upload.status === 'uploading' && (
                  <div className="mt-2 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
                      style={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}

                {/* Mensaje de error */}
                {upload.status === 'error' && upload.errorMessage && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {upload.errorMessage}
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center space-x-1">
                {upload.status === 'success' && upload.url && (
                  <>
                    <button
                      onClick={() => window.open(upload.url, '_blank')}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Ver archivo"
                    >
                      <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        const link = window.document.createElement('a');
                        link.href = upload.url!;
                        link.download = upload.file.name;
                        link.click();
                      }}
                      className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Descargar archivo"
                    >
                      <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                  </>
                )}
                
                {upload.status === 'error' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => retryUpload(upload.id)}
                  >
                    Reintentar
                  </Button>
                )}
                
                <button
                  onClick={() => removeUpload(upload.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                  title="Eliminar archivo"
                >
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUploader;
