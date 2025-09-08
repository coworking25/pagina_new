-- Script para actualizar las URLs de fotos de los asesores con las correctas del storage
-- Santiago Sánchez: cambiar de 'santiago-sanchez.jpg' a '1.jpeg'
-- Andrés Metrio: cambiar de 'andres-metrio.jpg' a '2.jpg'

UPDATE advisors 
SET photo_url = '1.jpeg', 
    updated_at = NOW()
WHERE name = 'Santiago Sánchez';

UPDATE advisors 
SET photo_url = '2.jpg', 
    updated_at = NOW()
WHERE name = 'Andrés Metrio';

-- Verificar los cambios
SELECT id, name, photo_url, updated_at 
FROM advisors 
WHERE name IN ('Santiago Sánchez', 'Andrés Metrio');
