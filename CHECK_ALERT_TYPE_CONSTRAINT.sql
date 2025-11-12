-- Ver constraint de alert_type
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'client_alerts'
  AND con.conname LIKE '%alert_type%';
