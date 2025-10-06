/**
 * Utilidad para agregar marca de agua a imágenes
 * Procesa imágenes del lado del cliente antes de subirlas a Supabase
 */

interface WatermarkOptions {
  opacity?: number;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  scale?: number; // Escala de la marca de agua (0.1 = 10% del tamaño de la imagen)
  margin?: number; // Margen desde los bordes
}

/**
 * Carga una imagen desde una URL y devuelve un HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Convierte un File a HTMLImageElement
 */
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte un canvas a File
 */
function canvasToFile(canvas: HTMLCanvasElement, fileName: string, mimeType: string = 'image/jpeg', quality: number = 0.9): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Error al convertir canvas a blob'));
          return;
        }
        const file = new File([blob], fileName, { type: mimeType });
        resolve(file);
      },
      mimeType,
      quality
    );
  });
}

/**
 * Calcula la posición de la marca de agua según la opción seleccionada
 */
function calculateWatermarkPosition(
  canvasWidth: number,
  canvasHeight: number,
  watermarkWidth: number,
  watermarkHeight: number,
  position: string,
  margin: number
): { x: number; y: number } {
  switch (position) {
    case 'bottom-right':
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: canvasHeight - watermarkHeight - margin
      };
    case 'bottom-left':
      return {
        x: margin,
        y: canvasHeight - watermarkHeight - margin
      };
    case 'top-right':
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: margin
      };
    case 'top-left':
      return {
        x: margin,
        y: margin
      };
    case 'center':
      return {
        x: (canvasWidth - watermarkWidth) / 2,
        y: (canvasHeight - watermarkHeight) / 2
      };
    default:
      return {
        x: canvasWidth - watermarkWidth - margin,
        y: canvasHeight - watermarkHeight - margin
      };
  }
}

/**
 * Agrega marca de agua a una imagen
 * @param imageFile - Archivo de imagen original
 * @param watermarkUrl - URL de la marca de agua (por defecto: /marcaDeAgua.png)
 * @param options - Opciones de personalización
 * @returns Nuevo archivo con marca de agua aplicada
 */
export async function addWatermarkToImage(
  imageFile: File,
  watermarkUrl: string = '/marcaDeAgua.png',
  options: WatermarkOptions = {}
): Promise<File> {
  try {
    console.log('🎨 Agregando marca de agua a:', imageFile.name);

    // Opciones por defecto
    const {
      opacity = 0.7,
      position = 'bottom-right',
      scale = 0.15, // 15% del ancho de la imagen
      margin = 20
    } = options;

    // Cargar imagen original
    const originalImage = await fileToImage(imageFile);
    console.log(`📐 Imagen original: ${originalImage.width}x${originalImage.height}`);

    // Cargar marca de agua
    const watermarkImage = await loadImage(watermarkUrl);
    console.log(`💧 Marca de agua cargada: ${watermarkImage.width}x${watermarkImage.height}`);

    // Crear canvas con el tamaño de la imagen original
    const canvas = document.createElement('canvas');
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    // Dibujar imagen original
    ctx.drawImage(originalImage, 0, 0);

    // Calcular tamaño de la marca de agua (proporcional a la imagen)
    const watermarkWidth = originalImage.width * scale;
    const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;

    // Calcular posición
    const { x, y } = calculateWatermarkPosition(
      canvas.width,
      canvas.height,
      watermarkWidth,
      watermarkHeight,
      position,
      margin
    );

    // Aplicar opacidad y dibujar marca de agua
    ctx.globalAlpha = opacity;
    ctx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
    ctx.globalAlpha = 1.0;

    console.log(`✅ Marca de agua aplicada en posición: ${position} (${x}, ${y})`);

    // Determinar formato de salida basado en el archivo original
    const mimeType = imageFile.type || 'image/jpeg';
    const quality = mimeType === 'image/png' ? 1.0 : 0.92;

    // Convertir canvas a archivo
    const watermarkedFile = await canvasToFile(
      canvas,
      imageFile.name,
      mimeType,
      quality
    );

    console.log(`💾 Archivo con marca de agua creado: ${watermarkedFile.size} bytes`);
    
    return watermarkedFile;

  } catch (error) {
    console.error('❌ Error agregando marca de agua:', error);
    // En caso de error, devolver imagen original
    console.warn('⚠️ Devolviendo imagen original sin marca de agua');
    return imageFile;
  }
}

/**
 * Procesa múltiples imágenes agregando marca de agua a todas
 * @param files - Array de archivos de imagen
 * @param watermarkUrl - URL de la marca de agua
 * @param options - Opciones de personalización
 * @param onProgress - Callback para reportar progreso
 * @returns Array de archivos con marca de agua
 */
export async function addWatermarkToMultipleImages(
  files: File[],
  watermarkUrl: string = '/marcaDeAgua.png',
  options: WatermarkOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  console.log(`🎨 Procesando ${files.length} imágenes con marca de agua...`);
  
  const watermarkedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const watermarkedFile = await addWatermarkToImage(files[i], watermarkUrl, options);
      watermarkedFiles.push(watermarkedFile);
      
      if (onProgress) {
        onProgress(i + 1, files.length);
      }

      console.log(`✅ Procesada imagen ${i + 1}/${files.length}: ${files[i].name}`);
    } catch (error) {
      console.error(`❌ Error procesando imagen ${i + 1}:`, error);
      // Agregar imagen original si falla
      watermarkedFiles.push(files[i]);
    }
  }

  console.log(`🎉 ${watermarkedFiles.length} imágenes procesadas con marca de agua`);
  return watermarkedFiles;
}

/**
 * Previsualiza una imagen con marca de agua en un elemento img
 * @param imageFile - Archivo de imagen
 * @param watermarkUrl - URL de la marca de agua
 * @param targetElement - Elemento img donde mostrar la preview
 * @param options - Opciones de personalización
 */
export async function previewImageWithWatermark(
  imageFile: File,
  watermarkUrl: string = '/marcaDeAgua.png',
  targetElement: HTMLImageElement,
  options: WatermarkOptions = {}
): Promise<void> {
  try {
    const watermarkedFile = await addWatermarkToImage(imageFile, watermarkUrl, options);
    const previewUrl = URL.createObjectURL(watermarkedFile);
    targetElement.src = previewUrl;
    
    // Limpiar URL cuando se desmonte
    targetElement.onload = () => URL.revokeObjectURL(previewUrl);
  } catch (error) {
    console.error('Error generando preview con marca de agua:', error);
  }
}
