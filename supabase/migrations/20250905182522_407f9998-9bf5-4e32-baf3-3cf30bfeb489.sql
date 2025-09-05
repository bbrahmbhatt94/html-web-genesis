-- CRITICAL SECURITY FIX: Step 1 - Drop all dependent policies first

-- Drop all policies that depend on is_authenticated_admin()
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can update admin users" ON public.admin_users;
DROP POLICY IF EXISTS "Admins can view analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Admins can view analytics sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Admins can view performance data" ON public.analytics_performance;

-- Now we can safely drop and recreate the function
DROP FUNCTION IF EXISTS public.is_authenticated_admin();

-- Create secure session-based admin authentication function
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  -- Check if there's a valid admin session token in current context
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_sessions s
    JOIN public.admin_users u ON s.admin_id = u.id
    WHERE s.session_token = current_setting('app.admin_session_token', true)
      AND s.expires_at > now()
      AND u.role IN ('admin', 'super_admin')
  );
$$;