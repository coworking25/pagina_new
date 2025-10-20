-- 1. Encontrar el ID correcto de Juan Diego
SELECT id, full_name, email, client_type 
FROM clients 
WHERE email = 'diegorpo9608@gmail.com';

-- 2. Ver todos los contratos existentes
SELECT id, contract_number, landlord_id, client_id, status, monthly_rent
FROM contracts
WHERE contract_number IN ('CONT-2024-001', 'CONT-2023-045', 'CONT-2024-015')
ORDER BY contract_number;

-- 3. Ver todos los pagos existentes
SELECT p.id, p.amount, p.status, p.due_date, c.contract_number
FROM payments p
LEFT JOIN contracts c ON c.id = p.contract_id
WHERE c.contract_number IN ('CONT-2024-001', 'CONT-2023-045', 'CONT-2024-015')
ORDER BY p.due_date;

-- 4. ACTUALIZAR contratos para asignar a Juan Diego (EJECUTAR DESPUÉS DE VER RESULTADOS ANTERIORES)
-- Reemplaza 'EL_ID_DE_JUAN_DIEGO' con el ID real obtenido del primer query
/*
UPDATE contracts
SET landlord_id = 'EL_ID_DE_JUAN_DIEGO'
WHERE contract_number IN ('CONT-2024-001', 'CONT-2023-045', 'CONT-2024-015');
*/
