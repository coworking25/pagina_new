import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Loader, AlertCircle } from 'lucide-react';

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImagesUploaded, 
  maxImages = 10,
  existingImages = []
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Validar archivos
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      return 'Formato no válido. Solo se permiten JPG, PNG y WebP';
    }

    if (file.size > maxSize) {
      return 'Archivo muy grande. Máximo 5MB por imagen';
    }

    return null;
  };

  // Subir archivos con progreso
  const uploadFiles = async (files: File[]) => {
    if (existingImages.length + files.length > maxImages) {
      setErrors([`Máximo ${maxImages} imágenes permitidas`]);
      return;
    }

    setUploading(true);
    setErrors([]);
    
    const uploadedUrls: string[] = [];
    const newErrors: string[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
        continue;
      }

      try {
        // Simular progreso de upload
        const fileId = `${file.name}-${Date.now()}`;
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        // Progreso simulado
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[fileId] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [fileId]: current + 10 };
          });
        }, 100);

        // Upload real
        const formData = new FormData();
        formData.append('file', file);

        // Aquí iría tu función de upload real
        // const url = await uploadPropertyImage(file);
        
        // Por ahora, simulamos un upload exitoso
        await new Promise(resolve => setTimeout(resolve, 1000));
        const url = `https://example.com/uploaded/${file.name}`;
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
        uploadedUrls.push(url);
        
        // Limpiar progreso después de un momento
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        }, 1000);

      } catch (error) {
        newErrors.push(`${file.name}: Error al subir`);
        console.error('Upload error:', error);
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (uploadedUrls.length > 0) {
      onImagesUploaded(uploadedUrls);
    }

    setUploading(false);
  };

  // Manejar drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    uploadFiles(files);
  }, []);

  // Manejar selección de archivos
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  return (
    <div className="space-y-4">
      {/* Zona de Upload */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploading ? (
            <Loader className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 mx-auto text-gray-400" />
          )}
          
          <div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {uploading ? 'Subiendo imágenes...' : 'Arrastra imágenes aquí'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              o haz clic para seleccionar archivos
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WebP • Máximo 5MB por imagen • Hasta {maxImages} imágenes
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progreso de Upload */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Subiendo archivos...
          </h4>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <div key={fileId} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{fileId.split('-')[0]}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Errores */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Errores al subir imágenes:
              </h4>
              <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Preview de imágenes existentes */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Imágenes actuales ({existingImages.length}/{maxImages})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {existingImages.map((url, index) => (
              <motion.div
                key={index}
                className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden group"
                whileHover={{ scale: 1.05 }}
              >
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    // Aquí iría la función para eliminar imagen
                    console.log('Eliminar imagen:', url);
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
