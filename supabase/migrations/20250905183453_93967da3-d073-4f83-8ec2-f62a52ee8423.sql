-- Create secure function to update review status
CREATE OR REPLACE FUNCTION public.admin_update_review_status(
  p_review_id uuid,
  p_status review_status,
  session_token text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_admin_id uuid;
BEGIN
  -- Validate admin session
  IF session_token IS NOT NULL THEN
    SELECT au.id INTO v_admin_id
    FROM public.admin_sessions s
    JOIN public.admin_users au ON s.admin_id = au.id
    WHERE s.session_token = session_token
      AND s.expires_at > now()
      AND au.role IN ('admin', 'super_admin');
      
    IF v_admin_id IS NULL THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  ELSE
    IF NOT public.is_authenticated_admin() THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
    
    -- Get admin ID from context
    v_admin_id := (current_setting('app.current_admin_id', true))::uuid;
  END IF;

  -- Update review status
  UPDATE public.reviews 
  SET 
    status = p_status,
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
    approved_by_admin_id = CASE WHEN p_status = 'approved' THEN v_admin_id ELSE NULL END,
    updated_at = now()
  WHERE id = p_review_id;
  
  RETURN FOUND;
END;
$function$;

-- Create bulk update function
CREATE OR REPLACE FUNCTION public.admin_bulk_update_review_status(
  p_review_ids uuid[],
  p_status review_status,
  session_token text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_admin_id uuid;
  v_updated_count integer := 0;
BEGIN
  -- Validate admin session
  IF session_token IS NOT NULL THEN
    SELECT au.id INTO v_admin_id
    FROM public.admin_sessions s
    JOIN public.admin_users au ON s.admin_id = au.id
    WHERE s.session_token = session_token
      AND s.expires_at > now()
      AND au.role IN ('admin', 'super_admin');
      
    IF v_admin_id IS NULL THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  ELSE
    IF NOT public.is_authenticated_admin() THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
    
    -- Get admin ID from context
    v_admin_id := (current_setting('app.current_admin_id', true))::uuid;
  END IF;

  -- Update review statuses
  UPDATE public.reviews 
  SET 
    status = p_status,
    approved_at = CASE WHEN p_status = 'approved' THEN now() ELSE NULL END,
    approved_by_admin_id = CASE WHEN p_status = 'approved' THEN v_admin_id ELSE NULL END,
    updated_at = now()
  WHERE id = ANY(p_review_ids);
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  RETURN v_updated_count;
END;
$function$;