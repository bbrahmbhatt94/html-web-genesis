-- CRITICAL SECURITY FIX: Completely lock down admin_users table password hashes

-- 1) First, revoke ALL access to password_hash column from everyone
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM PUBLIC;
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM anon;
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM authenticated;
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM service_role;

-- 2) Create secure session-based admin authentication function
CREATE OR REPLACE FUNCTION public.is_admin_via_session(session_token text DEFAULT NULL)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_sessions s
    JOIN public.admin_users u ON s.admin_id = u.id
    WHERE s.session_token = COALESCE(session_token, current_setting('app.admin_session_token', true))
      AND s.expires_at > now()
      AND u.role IN ('admin', 'super_admin')
  );
$$;

-- 3) Create secure function to get current admin ID from session
CREATE OR REPLACE FUNCTION public.get_current_admin_id(session_token text DEFAULT NULL)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = ''
AS $$
  SELECT s.admin_id
  FROM public.admin_sessions s
  JOIN public.admin_users u ON s.admin_id = u.id
  WHERE s.session_token = COALESCE(session_token, current_setting('app.admin_session_token', true))
    AND s.expires_at > now()
    AND u.role IN ('admin', 'super_admin')
  LIMIT 1;
$$;

-- 4) Create admin-safe view of admin_users WITHOUT password hashes
CREATE OR REPLACE VIEW public.admin_users_safe AS
SELECT 
  id,
  email,
  role,
  last_login,
  created_at,
  updated_at,
  -- password_hash is completely excluded
  'REDACTED' as password_status
FROM public.admin_users;

-- 5) Secure admin management function (no password hash exposure)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  role admin_role,
  last_login timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  password_status text
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Only allow if called by authenticated admin
  SELECT u.id, u.email, u.role, u.last_login, u.created_at, u.updated_at, 'SET' as password_status
  FROM public.admin_users u
  WHERE public.is_admin_via_session() = true
  ORDER BY u.created_at DESC;
$$;

-- 6) Replace the broken is_authenticated_admin function with session-based version
DROP FUNCTION IF EXISTS public.is_authenticated_admin();
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Use session-based authentication instead of non-existent app.current_admin_id
  SELECT public.is_admin_via_session();
$$;

-- 7) Update admin_users RLS policies to be more restrictive
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;

-- Create new restrictive policies that prevent any direct access to admin_users
CREATE POLICY "Block all direct access to admin_users" 
ON public.admin_users FOR ALL
USING (false)
WITH CHECK (false);

-- 8) Create secure admin update function (for role changes, etc.)
CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_user_id uuid,
  new_email text DEFAULT NULL,
  new_role admin_role DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only allow if called by authenticated admin
  IF NOT public.is_admin_via_session() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update allowed fields (NOT password_hash)
  UPDATE public.admin_users 
  SET 
    email = COALESCE(new_email, email),
    role = COALESCE(new_role, role),
    updated_at = now()
  WHERE id = target_user_id;

  RETURN FOUND;
END;
$$;

-- 9) Grant execute permissions for admin functions
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, admin_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_via_session(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_admin_id(text) TO anon, authenticated;