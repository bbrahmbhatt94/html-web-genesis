-- SECURITY FIXES: Comprehensive security improvements

-- 1. Fix authenticate_admin function to NOT return password hash
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

-- 2. Create secure password verification function
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

-- 3. Fix RLS policies on orders table - remove overly permissive policies
DROP POLICY IF EXISTS "Edge functions can manage orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- Create secure policies for orders
CREATE POLICY "Service role can manage orders" ON public.orders
  FOR ALL
  USING (current_setting('role') = 'service_role');

CREATE POLICY "Users can view their own orders by email" ON public.orders
  FOR SELECT
  USING (user_email = (auth.jwt() ->> 'email'));

-- 4. Fix RLS policies on download_links table
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

-- 5. Create secure admin login function that handles authentication server-side
CREATE OR REPLACE FUNCTION public.secure_admin_login(
  input_email text,
  input_password_hash text
)
RETURNS TABLE(
  success boolean,
  user_data jsonb,
  session_token text,
  error_message text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  admin_record record;
  new_session_token text;
  session_expires_at timestamptz;
BEGIN
  -- Input validation
  IF input_email IS NULL OR input_password_hash IS NULL THEN
    RETURN QUERY SELECT false, null::jsonb, null::text, 'Invalid input parameters';
    RETURN;
  END IF;

  -- Get admin user
  SELECT id, email, password_hash, role, last_login
  INTO admin_record
  FROM public.admin_users
  WHERE email = lower(trim(input_email));

  -- Check if user exists and password matches
  IF admin_record.id IS NULL OR admin_record.password_hash != input_password_hash THEN
    RETURN QUERY SELECT false, null::jsonb, null::text, 'Invalid credentials';
    RETURN;
  END IF;

  -- Generate secure session token
  new_session_token := encode(gen_random_bytes(32), 'hex');
  session_expires_at := now() + interval '24 hours';

  -- Create session record
  INSERT INTO public.admin_sessions (
    admin_id,
    session_token,
    expires_at,
    ip_address,
    user_agent
  ) VALUES (
    admin_record.id,
    new_session_token,
    session_expires_at,
    null, -- Will be set by edge function
    null  -- Will be set by edge function
  );

  -- Update last login
  UPDATE public.admin_users 
  SET last_login = now() 
  WHERE id = admin_record.id;

  -- Return success with user data (NO PASSWORD HASH!)
  RETURN QUERY SELECT 
    true,
    jsonb_build_object(
      'id', admin_record.id,
      'email', admin_record.email,
      'role', admin_record.role,
      'last_login', admin_record.last_login
    ),
    new_session_token,
    null::text;
END;
$$;

-- 6. Create function to validate admin session tokens
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

-- 7. Make Product Files bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'Product Files';