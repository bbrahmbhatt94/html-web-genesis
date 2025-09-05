-- Update admin_list_reviews to also accept session token for consistency
CREATE OR REPLACE FUNCTION public.admin_list_reviews(
  p_status public.review_status DEFAULT NULL,
  session_token text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  customer_name text,
  customer_email text,
  rating integer,
  review_text text,
  status public.review_status,
  created_at timestamptz,
  approved_at timestamptz
) AS $$
BEGIN
  -- Check authentication via session token or context
  IF session_token IS NOT NULL THEN
    -- Direct session token validation
    IF NOT EXISTS (
      SELECT 1 
      FROM public.admin_sessions s
      JOIN public.admin_users u ON s.admin_id = u.id
      WHERE s.session_token = session_token
        AND s.expires_at > now()
        AND u.role IN ('admin', 'super_admin')
    ) THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  ELSE
    -- Fall back to context-based authentication
    IF NOT public.is_authenticated_admin() THEN
      RAISE EXCEPTION 'Not authorized';
    END IF;
  END IF;

  RETURN QUERY
  SELECT r.id, r.customer_name, r.customer_email, r.rating, r.review_text, r.status, r.created_at, r.approved_at
  FROM public.reviews r
  WHERE (p_status IS NULL OR r.status = p_status)
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;