-- Fix search path security warnings for all functions
-- Set search_path to empty for all existing functions to prevent SQL injection

-- Fix authenticate_admin function
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
SET search_path = ''
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

-- Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin(user_email text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = user_email AND role IN ('admin', 'super_admin')
  );
$$;

-- Fix is_authenticated_admin function
CREATE OR REPLACE FUNCTION public.is_authenticated_admin()
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = current_setting('app.current_admin_id', true)::uuid
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Fix cleanup_expired_admin_sessions function
CREATE OR REPLACE FUNCTION public.cleanup_expired_admin_sessions()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  DELETE FROM public.admin_sessions 
  WHERE expires_at < now();
$$;

-- Fix cleanup_expired_downloads function
CREATE OR REPLACE FUNCTION public.cleanup_expired_downloads()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  UPDATE public.download_links 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
$$;

-- Fix get_review_stats function
CREATE OR REPLACE FUNCTION public.get_review_stats()
RETURNS TABLE(total_reviews bigint, average_rating numeric, rating_breakdown jsonb)
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 1) as average_rating,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_breakdown
  FROM public.reviews 
  WHERE status = 'approved';
$$;