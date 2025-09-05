-- Update secure admin functions to accept session token as parameter
-- This allows direct authentication without complex session context

-- Update admin_list_users to accept session token parameter
CREATE OR REPLACE FUNCTION public.admin_list_users(session_token text DEFAULT NULL)
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
  -- Return data if session token is valid and belongs to admin
  SELECT u.id, u.email, u.role, u.last_login, u.created_at, u.updated_at
  FROM public.admin_users u
  JOIN public.admin_sessions s ON s.admin_id = u.id
  WHERE s.session_token = session_token
    AND s.expires_at > now()
    AND u.role IN ('admin', 'super_admin')
  
  UNION
  
  -- Also allow if session token is set in context (for backward compatibility)
  SELECT u.id, u.email, u.role, u.last_login, u.created_at, u.updated_at
  FROM public.admin_users u
  WHERE session_token IS NULL 
    AND public.is_admin_via_session() = true
  ORDER BY created_at DESC;
$$;

-- Update is_admin_via_session to work better
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