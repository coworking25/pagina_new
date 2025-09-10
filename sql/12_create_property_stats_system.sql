-- Tabla para estadísticas de propiedades
CREATE TABLE IF NOT EXISTS property_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  appointments INTEGER DEFAULT 0,
  last_viewed TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id)
);

-- Tabla para tracking de actividad
CREATE TABLE IF NOT EXISTS property_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'view', 'inquiry', 'appointment', 'edit', 'status_change'
  user_info JSONB, -- información del usuario/visitante
  details JSONB, -- detalles específicos de la actividad
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Función para incrementar vistas
CREATE OR REPLACE FUNCTION increment_property_views(prop_id INTEGER, user_info JSONB DEFAULT '{}')
RETURNS VOID AS $$
BEGIN
  -- Actualizar o insertar estadísticas
  INSERT INTO property_stats (property_id, views, last_viewed)
  VALUES (prop_id, 1, NOW())
  ON CONFLICT (property_id)
  DO UPDATE SET 
    views = property_stats.views + 1,
    last_viewed = NOW(),
    updated_at = NOW();
    
  -- Registrar actividad
  INSERT INTO property_activity (property_id, activity_type, user_info)
  VALUES (prop_id, 'view', user_info);
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar consultas
CREATE OR REPLACE FUNCTION increment_property_inquiries(prop_id INTEGER, inquiry_details JSONB DEFAULT '{}')
RETURNS VOID AS $$
BEGIN
  -- Actualizar estadísticas
  INSERT INTO property_stats (property_id, inquiries)
  VALUES (prop_id, 1)
  ON CONFLICT (property_id)
  DO UPDATE SET 
    inquiries = property_stats.inquiries + 1,
    updated_at = NOW();
    
  -- Registrar actividad
  INSERT INTO property_activity (property_id, activity_type, details)
  VALUES (prop_id, 'inquiry', inquiry_details);
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar citas
CREATE OR REPLACE FUNCTION increment_property_appointments(prop_id INTEGER, appointment_details JSONB DEFAULT '{}')
RETURNS VOID AS $$
BEGIN
  -- Actualizar estadísticas
  INSERT INTO property_stats (property_id, appointments)
  VALUES (prop_id, 1)
  ON CONFLICT (property_id)
  DO UPDATE SET 
    appointments = property_stats.appointments + 1,
    updated_at = NOW();
    
  -- Registrar actividad
  INSERT INTO property_activity (property_id, activity_type, details)
  VALUES (prop_id, 'appointment', appointment_details);
END;
$$ LANGUAGE plpgsql;

-- Habilitar RLS
ALTER TABLE property_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_activity ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para property_stats
CREATE POLICY "property_stats_select_policy" ON property_stats
  FOR SELECT USING (true);

CREATE POLICY "property_stats_insert_policy" ON property_stats
  FOR INSERT WITH CHECK (true);

CREATE POLICY "property_stats_update_policy" ON property_stats
  FOR UPDATE USING (true);

-- Políticas RLS para property_activity
CREATE POLICY "property_activity_select_policy" ON property_activity
  FOR SELECT USING (true);

CREATE POLICY "property_activity_insert_policy" ON property_activity
  FOR INSERT WITH CHECK (true);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_property_stats_property_id ON property_stats(property_id);
CREATE INDEX IF NOT EXISTS idx_property_activity_property_id ON property_activity(property_id);
CREATE INDEX IF NOT EXISTS idx_property_activity_type ON property_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_property_activity_created_at ON property_activity(created_at DESC);
