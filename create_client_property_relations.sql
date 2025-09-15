-- Tabla para relaciones entre clientes y propiedades
-- Fecha: 15 de septiembre de 2025

CREATE TABLE IF NOT EXISTS public.client_property_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id bigint NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  relation_type character varying(20) NOT NULL,
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  status character varying(20) DEFAULT 'active',
  notes text,

  -- Campos específicos por tipo de relación
  pending_contract_status character varying(30),
  interest_level character varying(10),
  move_in_date date,
  lease_start_date date,
  lease_end_date date,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  -- Restricciones
  CONSTRAINT client_property_relations_type_check CHECK (relation_type IN ('owner', 'tenant', 'interested', 'pending_contract')),
  CONSTRAINT client_property_relations_status_check CHECK (status IN ('active', 'pending', 'completed', 'cancelled', 'expired')),
  CONSTRAINT client_property_relations_pending_status_check CHECK (pending_contract_status IN ('documents_pending', 'approval_pending', 'payment_pending', 'ready_to_sign')),
  CONSTRAINT client_property_relations_interest_check CHECK (interest_level IN ('low', 'medium', 'high')),

  -- Índices únicos para evitar duplicados
  UNIQUE(client_id, property_id, relation_type)
);

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_client_property_relations_client ON client_property_relations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_property_relations_property ON client_property_relations(property_id);
CREATE INDEX IF NOT EXISTS idx_client_property_relations_type ON client_property_relations(relation_type);
CREATE INDEX IF NOT EXISTS idx_client_property_relations_status ON client_property_relations(status);
CREATE INDEX IF NOT EXISTS idx_client_property_relations_contract ON client_property_relations(contract_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_client_property_relations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_update_client_property_relations_updated_at ON client_property_relations;
CREATE TRIGGER trigger_update_client_property_relations_updated_at
    BEFORE UPDATE ON client_property_relations
    FOR EACH ROW
    EXECUTE FUNCTION update_client_property_relations_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE client_property_relations IS 'Relaciones entre clientes y propiedades (propietario, inquilino, interesado, contrato pendiente)';
COMMENT ON COLUMN client_property_relations.relation_type IS 'Tipo de relación: owner, tenant, interested, pending_contract';
COMMENT ON COLUMN client_property_relations.pending_contract_status IS 'Estado del contrato pendiente: documents_pending, approval_pending, payment_pending, ready_to_sign';
COMMENT ON COLUMN client_property_relations.interest_level IS 'Nivel de interés: low, medium, high';
COMMENT ON COLUMN client_property_relations.move_in_date IS 'Fecha de mudanza para inquilinos';
COMMENT ON COLUMN client_property_relations.lease_start_date IS 'Fecha de inicio del contrato';
COMMENT ON COLUMN client_property_relations.lease_end_date IS 'Fecha de fin del contrato';

-- Función para obtener resumen de propiedades por cliente
CREATE OR REPLACE FUNCTION get_client_property_summary(client_uuid uuid)
RETURNS TABLE (
  owned_properties bigint,
  rented_properties bigint,
  interested_properties bigint,
  pending_contracts bigint,
  active_contracts bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE relation_type = 'owner' AND status = 'active') as owned_properties,
    COUNT(*) FILTER (WHERE relation_type = 'tenant' AND status = 'active') as rented_properties,
    COUNT(*) FILTER (WHERE relation_type = 'interested' AND status = 'active') as interested_properties,
    COUNT(*) FILTER (WHERE relation_type = 'pending_contract' AND status = 'pending') as pending_contracts,
    (SELECT COUNT(*) FROM contracts WHERE client_id = client_uuid AND status = 'active') as active_contracts
  FROM client_property_relations
  WHERE client_id = client_uuid;
END;
$$ LANGUAGE plpgsql;