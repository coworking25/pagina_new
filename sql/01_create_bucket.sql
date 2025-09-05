-- Crear nuevo bucket para imágenes de propiedades
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true);

-- Política para permitir lectura pública de todas las imágenes
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

-- Política para permitir inserción autenticada (opcional para admin)
CREATE POLICY "Authenticated Insert"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Política para permitir actualización autenticada (opcional para admin)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- Política para permitir eliminación autenticada (opcional para admin)
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');
