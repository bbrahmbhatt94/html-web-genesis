-- CRITICAL SECURITY FIX: Step 2 - Lock down password hashes and create secure policies

-- 1) Revoke ALL access to password_hash column from everyone (critical!)
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM PUBLIC;
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM anon;
REVOKE SELECT (password_hash) ON TABLE public.admin_users FROM authenticated;

-- 2) Create additional secure session-based functions
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

-- 3) Create secure admin management function (NO password hash exposure)
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE(
  id uuid,
  email text,
  role admin_role,
  last_login timestamptz,
  created_at timestamptz,
  updated_at timestamptz
) 
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Only return data if called by authenticated admin
  SELECT u.id, u.email, u.role, u.last_login, u.created_at, u.updated_at
  FROM public.admin_users u
  WHERE public.is_admin_via_session() = true
  ORDER BY u.created_at DESC;
$$;

-- 4) Create completely restrictive RLS policy for admin_users table
CREATE POLICY "Block all direct access to admin_users" 
ON public.admin_users FOR ALL
USING (false)
WITH CHECK (false);

-- 5) Recreate analytics policies to work with fixed authentication
CREATE POLICY "Admins can view analytics events" 
ON public.analytics_events FOR SELECT 
USING (public.is_authenticated_admin());

CREATE POLICY "Admins can view analytics sessions" 
ON public.analytics_sessions FOR SELECT 
USING (public.is_authenticated_admin());

CREATE POLICY "Admins can view performance data" 
ON public.analytics_performance FOR SELECT 
USING (public.is_authenticated_admin());

-- 6) Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_via_session(text) TO anon, authenticated;