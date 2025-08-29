-- SECURITY FIXES PART 1: Drop and recreate authenticate_admin function

-- Drop the existing function
DROP FUNCTION IF EXISTS public.authenticate_admin(text);

-- Recreate authenticate_admin function WITHOUT password_hash
CREATE OR REPLACE FUNCTION public.authenticate_admin(input_email text)
RETURNS TABLE(
  id uuid,
  email text,
  role admin_role,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    au.id,
    au.email,
    au.role,
    au.last_login
  FROM public.admin_users au
  WHERE au.email = lower(trim(input_email));
$$;

-- Create secure password verification function
CREATE OR REPLACE FUNCTION public.verify_admin_password(input_email text, input_password_hash text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE email = lower(trim(input_email)) 
    AND password_hash = input_password_hash
  );
$$;