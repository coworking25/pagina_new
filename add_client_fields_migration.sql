-- Migración para agregar campos adicionales a la tabla clients
-- Fecha: 15 de septiembre de 2025

-- Agregar campos demográficos
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS gender character varying(20),
ADD COLUMN IF NOT EXISTS marital_status character varying(20);

-- Agregar campos de contacto y preferencias
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS preferred_contact_method character varying(20) DEFAULT 'phone';

-- Agregar campos financieros adicionales
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS budget_range character varying(20);

-- Agregar campos de marketing y seguimiento
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS referral_source character varying(50),
ADD COLUMN IF NOT EXISTS property_requirements text;

-- Agregar restricciones de validación para los nuevos campos
ALTER TABLE public.clients
ADD CONSTRAINT clients_gender_check CHECK (gender IN ('masculino', 'femenino', 'otro')),
ADD CONSTRAINT clients_marital_status_check CHECK (marital_status IN ('soltero', 'casado', 'union_libre', 'divorciado', 'viudo')),
ADD CONSTRAINT clients_preferred_contact_check CHECK (preferred_contact_method IN ('phone', 'email', 'whatsapp', 'sms')),
ADD CONSTRAINT clients_budget_range_check CHECK (budget_range IN ('1-3', '3-5', '5-10', '10-20', '20+'));

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_clients_birth_date ON clients(birth_date);
CREATE INDEX IF NOT EXISTS idx_clients_gender ON clients(gender);
CREATE INDEX IF NOT EXISTS idx_clients_referral_source ON clients(referral_source);

-- Actualizar el campo updated_at cuando se modifiquen estos campos
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_clients_updated_at ON clients;
CREATE TRIGGER trigger_update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_clients_updated_at();

-- Comentarios para documentación
COMMENT ON COLUMN clients.birth_date IS 'Fecha de nacimiento del cliente';
COMMENT ON COLUMN clients.gender IS 'Género del cliente (masculino, femenino, otro)';
COMMENT ON COLUMN clients.marital_status IS 'Estado civil del cliente';
COMMENT ON COLUMN clients.preferred_contact_method IS 'Método de contacto preferido (phone, email, whatsapp, sms)';
COMMENT ON COLUMN clients.budget_range IS 'Rango de presupuesto del cliente en millones de COP';
COMMENT ON COLUMN clients.referral_source IS 'Fuente de referencia del cliente';
COMMENT ON COLUMN clients.property_requirements IS 'Requisitos específicos de propiedad que busca el cliente';