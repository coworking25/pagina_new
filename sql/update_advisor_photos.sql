-- Script para actualizar las fotos de los asesores con las imágenes existentes
-- Las imágenes están almacenadas en el bucket property-images/Asesores/

-- Actualizar foto de Santiago Sánchez
UPDATE advisors 
SET photo_url = '1.jpeg'
WHERE name = 'Santiago Sánchez';

-- Actualizar foto de Andrés Metrio  
UPDATE advisors 
SET photo_url = '2.jpg'
WHERE name = 'Andrés Metrio';

-- Verificar las actualizaciones
SELECT 
  name, 
  photo_url,
  specialty,
  experience_years
FROM advisors 
WHERE is_active = true
ORDER BY name;
