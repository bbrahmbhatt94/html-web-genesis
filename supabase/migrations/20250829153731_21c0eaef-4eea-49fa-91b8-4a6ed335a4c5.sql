-- Remove the insecure public access policy
DROP POLICY IF EXISTS "Allow login queries for admin authentication" ON public.admin_users;

-- Create a secure authentication function that bypasses RLS
CREATE OR REPLACE FUNCTION public.authenticate_admin(input_email text)
RETURNS TABLE(
  id uuid,
  email text,
  password_hash text,
  role admin_role,
  last_login timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    au.id,
    au.email,
    au.password_hash,
    au.role,
    au.last_login
  FROM public.admin_users au
  WHERE au.email = lower(trim(input_email));
$$;