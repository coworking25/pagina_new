-- Migration: 2025-09-15 - Add DB constraints, unique partial index, and transactional RPCs for contracts and relations
-- Path: db/migrations/2025_09_15_create_contract_transactional.sql
-- UP: apply migration
BEGIN;

-- 1) Normalize properties.status NULL -> 'available'
UPDATE public.properties
SET status = 'available'
WHERE status IS NULL;

-- 1b) Detect distinct status values (for info):
-- SELECT status, count(*) FROM public.properties GROUP BY status ORDER BY count DESC;

-- 1c) Normalize common non-canonical values to the canonical set
-- Map common variants (case-insensitive) to canonical statuses
UPDATE public.properties
SET status = 'rented'
WHERE lower(trim(status)) IN ('occupied','ocupada','ocupado','ocupado(a)','arrendada','arrendado','alquilada','alquilado');

-- Map 'rent' and common english/spanish variants to 'rent' (available for rent)
UPDATE public.properties
SET status = 'rent'
WHERE lower(trim(status)) IN ('rent','renta','rental','alquiler','for rent');

UPDATE public.properties
SET status = 'sold'
WHERE lower(trim(status)) IN ('vendida','vendido','vendido(a)','venta','sold');

-- Map 'sale' and common english/spanish variants to 'sale' (available for sale)
UPDATE public.properties
SET status = 'sale'
WHERE lower(trim(status)) IN ('sale','venta','for sale');

UPDATE public.properties
SET status = 'reserved'
WHERE lower(trim(status)) IN ('reservada','reservado','booked','reserved');

UPDATE public.properties
SET status = 'maintenance'
WHERE lower(trim(status)) IN ('mantenimiento','maintenance','in_repair');

UPDATE public.properties
SET status = 'pending'
WHERE lower(trim(status)) IN ('pending','pendiente','en_revision');

-- 1d) Fallback: any remaining unknown status -> 'available'
UPDATE public.properties
SET status = 'available'
WHERE lower(trim(coalesce(status,''))) NOT IN ('available','rented','sold','reserved','maintenance','pending');

-- 2) Add check constraint for properties.status (adjust allowed statuses as needed)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.check_constraints cc ON cc.constraint_name = tc.constraint_name
    WHERE tc.table_schema = 'public' AND tc.table_name = 'properties' AND cc.constraint_name = 'properties_status_check'
  ) THEN
    ALTER TABLE public.properties
      ADD CONSTRAINT properties_status_check
      CHECK (status IN ('available','sale','rent','rented','sold','reserved','maintenance','pending'));
  END IF;
END$$;

-- 3) Create unique partial index to prevent multiple active tenants per property
CREATE UNIQUE INDEX IF NOT EXISTS uq_property_single_active_tenant
ON public.client_property_relations (property_id)
WHERE relation_type = 'tenant' AND status = 'active';

-- 4) Add an index to speed up tenant lookups (if not exists)
CREATE INDEX IF NOT EXISTS idx_relations_tenant_property ON public.client_property_relations (property_id) WHERE relation_type = 'tenant';

-- 5) Create transactional RPC: create_contract_transactional
-- Adjust the INSERT into contracts to match your contracts table columns
CREATE OR REPLACE FUNCTION public.create_contract_transactional(
  p_client_id uuid,
  p_property_id bigint,
  p_start_date date,
  p_end_date date,
  p_monthly_rent numeric,
  p_created_by uuid DEFAULT NULL
)
RETURNS TABLE(contract_id uuid, relation_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prop_status text;
  v_contract_id uuid;
  v_relation_id uuid;
BEGIN
  -- Lock the property row
  SELECT status INTO v_prop_status
  FROM public.properties
  WHERE id = p_property_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Property % not found', p_property_id;
  END IF;

  IF v_prop_status IN ('rented','sold') THEN
    RAISE EXCEPTION 'Property % is not available (status=%)', p_property_id, v_prop_status;
  END IF;

  -- Insert contract (adjust fields according to your contracts schema)
  INSERT INTO public.contracts (client_id, property_id, start_date, end_date, monthly_rent, status, created_at)
  VALUES (p_client_id, p_property_id, p_start_date, p_end_date, p_monthly_rent, 'active', now())
  RETURNING id INTO v_contract_id;

  -- Upsert relation
  INSERT INTO public.client_property_relations (
    client_id, property_id, relation_type, contract_id, status, created_at, updated_at
  ) VALUES (
    p_client_id, p_property_id, 'tenant', v_contract_id, 'active', now(), now()
  )
  ON CONFLICT (client_id, property_id, relation_type)
  DO UPDATE SET contract_id = EXCLUDED.contract_id,
                status = EXCLUDED.status,
                updated_at = now()
  RETURNING id INTO v_relation_id;

  -- Update property status
  UPDATE public.properties
  SET status = 'rented'
  WHERE id = p_property_id;

  -- Call monthly payments generator RPC if exists (ignore error if not present)
  BEGIN
    PERFORM public.generate_monthly_payments(v_contract_id);
  EXCEPTION WHEN undefined_function THEN
    -- If generate_monthly_payments does not exist, ignore
    RAISE NOTICE 'generate_monthly_payments RPC not found; skipping payment generation';
  END;

  contract_id := v_contract_id;
  relation_id := v_relation_id;
  RETURN NEXT;
END;
$$;

-- 6) Create release function: release_property_and_close_contract
CREATE OR REPLACE FUNCTION public.release_property_and_close_contract(
  p_contract_id uuid,
  p_closed_by uuid DEFAULT NULL,
  p_reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_property_id bigint;
BEGIN
  -- Lock contract row and get property
  SELECT property_id INTO v_property_id
  FROM public.contracts
  WHERE id = p_contract_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Contract % not found', p_contract_id;
  END IF;

  -- Mark contract as completed/terminated
  UPDATE public.contracts
  SET status = 'completed', updated_at = now()
  WHERE id = p_contract_id;

  -- Update relation(s) linked to this contract
  UPDATE public.client_property_relations
  SET status = 'completed', updated_at = now()
  WHERE contract_id = p_contract_id;

  -- If no other active tenant exists for this property, set it to available
  IF NOT EXISTS (
    SELECT 1 FROM public.client_property_relations
    WHERE property_id = v_property_id
      AND relation_type = 'tenant'
      AND status = 'active'
  ) THEN
    UPDATE public.properties
    SET status = 'available'
    WHERE id = v_property_id;
  END IF;
END;
$$;

COMMIT;

-- DOWN: rollback migration (drop functions/indices/constraints)
-- WARNING: Only run DOWN if you are sure. This will drop constraints and functions.
-- Use your migration system to handle up/down safely.

-- To rollback manually, you can run the following statements (careful):
-- BEGIN;
-- DROP FUNCTION IF EXISTS public.release_property_and_close_contract(uuid, uuid, text);
-- DROP FUNCTION IF EXISTS public.create_contract_transactional(uuid, bigint, date, date, numeric, uuid);
-- DROP INDEX IF EXISTS uq_property_single_active_tenant;
-- ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
-- COMMIT;
