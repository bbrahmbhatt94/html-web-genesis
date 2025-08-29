-- SECURITY FIXES PART 2: Fix RLS policies and add secure functions

-- Fix RLS policies on orders table - remove overly permissive policies
DROP POLICY IF EXISTS "Edge functions can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create secure policies for orders
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Users can view their own orders by email" ON public.orders
  FOR SELECT
  USING (user_email = (auth.jwt() ->> 'email'));

-- Fix RLS policies on download_links table
DROP POLICY IF EXISTS "Edge functions can manage download links" ON public.download_links;
DROP POLICY IF EXISTS "Users can access their download links" ON public.download_links;

-- Create secure policies for download_links
CREATE POLICY "Service role can manage download links" ON public.download_links
  FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Users can access valid download tokens" ON public.download_links
  FOR SELECT
  USING (
    is_active = true 
    AND expires_at > now() 
    AND download_count < max_downloads
  );

-- Create function to validate admin session tokens
CREATE OR REPLACE FUNCTION public.validate_admin_session_token(token text)
RETURNS TABLE(
  valid boolean,
  admin_data jsonb,
  session_id uuid
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT 
    CASE WHEN s.id IS NOT NULL THEN true ELSE false END,
    CASE WHEN s.id IS NOT NULL THEN
      jsonb_build_object(
        'id', au.id,
        'email', au.email,
        'role', au.role,
        'last_login', au.last_login
      )
    ELSE null::jsonb END,
    s.id
  FROM public.admin_sessions s
  JOIN public.admin_users au ON s.admin_id = au.id
  WHERE s.session_token = token 
    AND s.expires_at > now()
  LIMIT 1;
$$;