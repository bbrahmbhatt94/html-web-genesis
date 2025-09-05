-- Add rate limiting for admin login attempts
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  email text,
  attempt_count integer DEFAULT 1,
  first_attempt timestamptz DEFAULT now(),
  last_attempt timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_login_attempts
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can manage login attempts (for edge functions)
CREATE POLICY "Service role can manage login attempts" 
ON public.admin_login_attempts FOR ALL 
USING (current_setting('role') = 'service_role');

-- Function to check and record login attempts
CREATE OR REPLACE FUNCTION public.check_login_rate_limit(
  p_ip_address inet,
  p_email text DEFAULT NULL,
  p_max_attempts integer DEFAULT 5,
  p_window_minutes integer DEFAULT 15,
  p_block_minutes integer DEFAULT 60
)
RETURNS TABLE (
  allowed boolean,
  attempts_remaining integer,
  blocked_until timestamptz
) AS $$
DECLARE
  v_attempt_record public.admin_login_attempts%ROWTYPE;
  v_window_start timestamptz := now() - interval '1 minute' * p_window_minutes;
  v_current_attempts integer := 0;
  v_block_until timestamptz;
BEGIN
  -- Get existing record for this IP
  SELECT * INTO v_attempt_record
  FROM public.admin_login_attempts
  WHERE ip_address = p_ip_address
    AND (p_email IS NULL OR email = p_email)
  ORDER BY last_attempt DESC
  LIMIT 1;

  -- Check if currently blocked
  IF v_attempt_record.blocked_until IS NOT NULL AND v_attempt_record.blocked_until > now() THEN
    RETURN QUERY SELECT false, 0, v_attempt_record.blocked_until;
    RETURN;
  END IF;

  -- Count recent attempts in window
  IF v_attempt_record.id IS NOT NULL AND v_attempt_record.first_attempt > v_window_start THEN
    v_current_attempts := v_attempt_record.attempt_count;
  ELSE
    v_current_attempts := 0;
  END IF;

  -- Check if limit exceeded
  IF v_current_attempts >= p_max_attempts THEN
    v_block_until := now() + interval '1 minute' * p_block_minutes;
    
    -- Update or insert block record
    INSERT INTO public.admin_login_attempts (ip_address, email, attempt_count, first_attempt, last_attempt, blocked_until)
    VALUES (p_ip_address, p_email, v_current_attempts + 1, COALESCE(v_attempt_record.first_attempt, now()), now(), v_block_until)
    ON CONFLICT (ip_address) DO UPDATE SET
      attempt_count = admin_login_attempts.attempt_count + 1,
      last_attempt = now(),
      blocked_until = v_block_until;
    
    RETURN QUERY SELECT false, 0, v_block_until;
    RETURN;
  END IF;

  -- Record attempt and allow
  IF v_current_attempts = 0 THEN
    -- First attempt in window
    INSERT INTO public.admin_login_attempts (ip_address, email, attempt_count, first_attempt, last_attempt)
    VALUES (p_ip_address, p_email, 1, now(), now())
    ON CONFLICT (ip_address) DO UPDATE SET
      attempt_count = 1,
      first_attempt = now(),
      last_attempt = now(),
      blocked_until = NULL;
  ELSE
    -- Increment existing attempt
    UPDATE public.admin_login_attempts
    SET attempt_count = attempt_count + 1,
        last_attempt = now()
    WHERE ip_address = p_ip_address;
  END IF;

  RETURN QUERY SELECT true, (p_max_attempts - v_current_attempts - 1), NULL::timestamptz;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to reset login attempts on successful login
CREATE OR REPLACE FUNCTION public.reset_login_attempts(p_ip_address inet, p_email text DEFAULT NULL)
RETURNS void AS $$
BEGIN
  DELETE FROM public.admin_login_attempts 
  WHERE ip_address = p_ip_address 
    AND (p_email IS NULL OR email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Improve download token security: use cryptographically secure tokens
ALTER TABLE public.download_links 
ALTER COLUMN download_token SET DEFAULT encode(gen_random_bytes(32), 'hex');