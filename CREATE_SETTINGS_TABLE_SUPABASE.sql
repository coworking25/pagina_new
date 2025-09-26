-- =====================================================
-- TABLA DE CONFIGURACIONES DEL SISTEMA - EJECUTAR EN SUPABASE
-- Copiar y pegar este script en el SQL Editor de Supabase
-- =====================================================

-- Crear tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- Insertar configuraciones por defecto
INSERT INTO settings (key, value) VALUES
('company_info', '{
    "companyName": "Coworking Inmobiliario",
    "companyDescription": "Expertos en bienes raíces con más de 10 años de experiencia. Te acompañamos en cada paso hacia tu nuevo hogar con servicios integrales de arriendos, ventas, avalúos y asesorías especializadas.",
    "companyLogo": "",
    "websiteUrl": "https://coworkinginmobiliario.com/"
}'::jsonb),
('contact_info', '{
    "contactEmail": "inmobiliariocoworking5@gmail.com",
    "contactPhone": "+57 314 886 0404",
    "contactWhatsapp": "+57 314 886 0404",
    "officeAddress": "Carrera 41 #38 Sur - 43, Edificio Emporio Local 306, 5C97+F6 Envigado, Antioquia",
    "officeHours": "Lun - Vie: 9:00 AM - 5:00 PM, Sáb - Dom sin atención al cliente"
}'::jsonb),
('social_media', '{
    "facebook": "#",
    "instagram": "https://www.instagram.com/coworking_inmobiliario?igsh=c3VnM29jN3oydmhj&utm_source=qr",
    "twitter": "#",
    "linkedin": "#"
}'::jsonb),
('theme', '{
    "primaryColor": "#00D4FF",
    "secondaryColor": "#39FF14",
    "darkMode": false
}'::jsonb),
('notifications', '{
    "emailNotifications": true,
    "pushNotifications": true,
    "smsNotifications": false
}'::jsonb),
('database', '{
    "backupFrequency": "daily",
    "lastBackup": "2024-01-15 10:30:00"
}'::jsonb),
('security', '{
    "twoFactorAuth": false,
    "sessionTimeout": 30,
    "passwordPolicy": "medium"
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verificar que se creó correctamente
SELECT * FROM settings;