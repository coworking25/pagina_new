-- ===================================================================
-- FIX FINAL: Política de DELETE en clients
-- ===================================================================
-- Esta política usa una función obsoleta is_admin()
-- Vamos a actualizarla para usar la misma lógica que las demás
-- ===================================================================

-- Eliminar política vieja
DROP POLICY IF EXISTS "Admins can delete clients" ON clients;

-- La política "Admins have full access to clients" (FOR ALL) ya incluye DELETE
-- Así que esta política específica de DELETE ya no es necesaria

-- Si aún quisieras tenerla explícitamente, sería:
-- CREATE POLICY "Admins can delete clients" 
-- ON clients
-- FOR DELETE
-- USING (EXISTS (SELECT 1 FROM advisors WHERE id = auth.uid()));

-- Pero NO es necesaria porque "FOR ALL" ya cubre DELETE

-- ===================================================================
-- VERIFICACIÓN FINAL
-- ===================================================================

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN with_check IS NULL THEN 
      CASE 
        WHEN cmd IN ('SELECT', 'DELETE') THEN '✅ OK (no necesita WITH CHECK)'
        ELSE '❌ FALTA WITH CHECK'
      END
    ELSE '✅ WITH CHECK OK'
  END as status
FROM pg_policies 
WHERE tablename = 'clients'
AND policyname LIKE '%Admin%'
ORDER BY policyname;

-- ===================================================================
-- RESULTADO ESPERADO:
-- ===================================================================
-- Solo debería aparecer:
-- "Admins have full access to clients" | ALL | ✅ WITH CHECK OK
--
-- La política de DELETE duplicada habrá sido eliminada
-- ===================================================================
