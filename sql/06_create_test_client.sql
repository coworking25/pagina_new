-- ============================================
-- SCRIPT DE PRUEBA: CREAR CLIENTE CON CREDENCIALES
-- ============================================

-- PASO 1: Crear un cliente de prueba
-- (Si ya tienes clientes en la BD, puedes saltar este paso)

INSERT INTO clients (
  id,
  full_name,
  document_type,
  document_number,
  phone,
  email,
  client_type,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Juan Diego Restrepo Bayer',
  'cedula',
  '1128462685',
  '+57 302 824 04 88',
  'diegorpo9608@gmail.com',
  'tenant',
  'active',
  NOW(),
  NOW()
)
ON CONFLICT (document_type, document_number) DO NOTHING
RETURNING id, full_name, email;

-- PASO 2: Crear credenciales para el cliente
-- Nota: La contraseña es "Cliente123" hasheada con bcrypt

-- Primero, obtener el ID del cliente
DO $$
DECLARE
  v_client_id UUID;
BEGIN
  -- Buscar el cliente por email
  SELECT id INTO v_client_id
  FROM clients
  WHERE email = 'diegorpo9608@gmail.com';

  -- Si existe el cliente, crear sus credenciales
  IF v_client_id IS NOT NULL THEN
    INSERT INTO client_credentials (
      id,
      client_id,
      email,
      password_hash,
      is_active,
      must_change_password,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_client_id,
      'diegorpo9608@gmail.com',
      '$2a$10$xQJ6YZKqXqF5hN3c7.LMXeYXGVFZ0qH5jK8hN3vW5xF7gN2eH1vKy', -- Cliente123
      true,
      true, -- Debe cambiar contraseña en el primer login
      NOW(),
      NOW()
    )
    ON CONFLICT (client_id) DO UPDATE SET
      email = EXCLUDED.email,
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW();

    RAISE NOTICE 'Credenciales creadas para cliente: %', v_client_id;
  ELSE
    RAISE NOTICE 'Cliente no encontrado con email: diegorpo9608@gmail.com';
  END IF;
END $$;

-- PASO 3: Verificar que se creó correctamente
SELECT 
  c.id,
  c.full_name,
  c.email,
  cc.email as credential_email,
  cc.is_active,
  cc.must_change_password,
  cc.created_at
FROM clients c
INNER JOIN client_credentials cc ON c.id = cc.client_id
WHERE c.email = 'diegorpo9608@gmail.com';

-- ============================================
-- DATOS DE PRUEBA PARA LOGIN:
-- ============================================
-- Email: diegorpo9608@gmail.com
-- Contraseña: Cliente123
-- 
-- Nota: El cliente deberá cambiar su contraseña
-- en el primer login (must_change_password = true)
-- ============================================
