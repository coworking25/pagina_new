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
    "companyName": "INMOBILIARIA NEXUS",
    "companyDescription": "Tu mejor opción en bienes raíces",
    "companyLogo": "",
    "websiteUrl": "https://inmobiliarianexus.com"
}'::jsonb),
('contact_info', '{
    "contactEmail": "info@inmobiliarianexus.com",
    "contactPhone": "+57 (315) 234-5678",
    "contactWhatsapp": "+57 315 234 5678",
    "officeAddress": "Cra. 13 #85-32, Oficina 501, Bogotá, Colombia",
    "officeHours": "Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 9:00 AM - 4:00 PM"
}'::jsonb),
('social_media', '{
    "facebook": "https://facebook.com/inmobiliarianexus",
    "instagram": "https://instagram.com/inmobiliarianexus",
    "twitter": "https://twitter.com/inmobiliarianexus",
    "linkedin": "https://linkedin.com/company/inmobiliarianexus"
}'::jsonb),
('theme', '{
    "primaryColor": "#3b82f6",
    "secondaryColor": "#1e40af",
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