-- =============================================
-- Execute no SQL Editor do Supabase
-- =============================================

-- 1. Adiciona coluna is_admin na tabela caregivers
ALTER TABLE caregivers
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Torna você administrador
--    (execute APÓS criar sua conta e ir em Configurações para se cadastrar como cuidadora)
UPDATE caregivers
  SET is_admin = true
  WHERE email = 'origemblox@gmail.com';

-- Para conferir:
SELECT name, email, is_admin FROM caregivers ORDER BY name;
