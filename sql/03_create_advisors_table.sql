-- Crear tabla de asesores inmobiliarios
CREATE TABLE IF NOT EXISTS advisors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  specialty VARCHAR(200) NOT NULL,
  bio TEXT,
  experience_years INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0,
  photo_url TEXT,
  availability_weekdays VARCHAR(50) DEFAULT '9:00 AM - 5:00 PM',
  availability_weekends VARCHAR(50) DEFAULT 'No disponible',
  calendar_link TEXT,
  commission_rate DECIMAL(4,2) DEFAULT 3.00,
  license_number VARCHAR(50),
  languages TEXT[] DEFAULT ARRAY['Español'],
  areas_of_expertise TEXT[] DEFAULT ARRAY['Residencial'],
  education TEXT,
  certifications TEXT[],
  social_media JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  joined_date DATE DEFAULT CURRENT_DATE,
  total_sales INTEGER DEFAULT 0,
  total_sales_value DECIMAL(15,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_advisors_email ON advisors(email);
CREATE INDEX IF NOT EXISTS idx_advisors_specialty ON advisors(specialty);
CREATE INDEX IF NOT EXISTS idx_advisors_rating ON advisors(rating);
CREATE INDEX IF NOT EXISTS idx_advisors_active ON advisors(is_active);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para updated_at
CREATE TRIGGER update_advisors_updated_at 
    BEFORE UPDATE ON advisors 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar datos de los asesores existentes
INSERT INTO advisors (
  name, 
  email, 
  phone, 
  whatsapp, 
  specialty, 
  bio, 
  experience_years, 
  rating, 
  reviews_count,
  photo_url,
  availability_weekdays,
  availability_weekends,
  commission_rate,
  license_number,
  languages,
  areas_of_expertise,
  education,
  certifications,
  social_media,
  total_sales,
  total_sales_value
) VALUES 
(
  'Santiago Sánchez',
  'santiago.sanchez@inmobiliaria.com',
  '+57 302 584 56 30',
  '573025845630',
  'Propiedades Residenciales y Apartamentos',
  'Especialista en propiedades residenciales con más de 8 años de experiencia en el mercado inmobiliario. Experto en apartamentos y casas familiares con un enfoque personalizado para cada cliente.',
  8,
  4.8,
  127,
  'santiago-sanchez.jpg',
  '9:00 AM - 5:00 PM',
  'No disponible',
  3.5,
  'LIC-2016-SS-001',
  ARRAY['Español']
  
),
(
  'Andrés Metrio',
  'andres.metrio@inmobiliaria.com',
  '+57 302 810 80 90',
  '573028108090',
  'Propiedades Comerciales y Oficinas',
  'Experto en propiedades comerciales e inversiones inmobiliarias con 6 años de experiencia. Especializado en oficinas, locales comerciales y proyectos de inversión.',
  6,
  4.6,
  94,
  'andres-metrio.jpg',
  '9:00 AM - 5:00 PM',
  'No disponible',
  4.0,
  'LIC-2018-AM-002',
  ARRAY['Español']
  
);

-- Crear política de seguridad (Row Level Security)
ALTER TABLE advisors ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública
CREATE POLICY "Advisors are viewable by everyone" ON advisors
  FOR SELECT USING (is_active = true);

-- Política para inserción/actualización (solo usuarios autenticados)
CREATE POLICY "Advisors can be managed by authenticated users" ON advisors
  FOR ALL USING (auth.role() = 'authenticated');

-- Comentarios en la tabla
COMMENT ON TABLE advisors IS 'Tabla de asesores inmobiliarios con información completa';
COMMENT ON COLUMN advisors.rating IS 'Calificación promedio del asesor (0.0 - 5.0)';
COMMENT ON COLUMN advisors.commission_rate IS 'Tasa de comisión del asesor (%)';
COMMENT ON COLUMN advisors.total_sales_value IS 'Valor total de ventas en pesos colombianos';
