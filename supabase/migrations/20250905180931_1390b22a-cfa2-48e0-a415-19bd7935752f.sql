-- Secure emails in reviews: hide from public; allow admins via RPC

-- 1) Column-level protection: revoke email selection from public roles
REVOKE SELECT (customer_email) ON TABLE public.reviews FROM anon;
REVOKE SELECT (customer_email) ON TABLE public.reviews FROM authenticated;

-- 2) Admin-only RPC to fetch reviews including emails
DROP FUNCTION IF EXISTS public.admin_list_reviews(p_status public.review_status);
CREATE OR REPLACE FUNCTION public.admin_list_reviews(p_status public.review_status DEFAULT NULL)
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
  IF NOT public.is_authenticated_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  RETURN QUERY
  SELECT r.id, r.customer_name, r.customer_email, r.rating, r.review_text, r.status, r.created_at, r.approved_at
  FROM public.reviews r
  WHERE (p_status IS NULL OR r.status = p_status)
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- 3) Allow clients to call the RPC; RLS and function guard enforce admin-only access
GRANT EXECUTE ON FUNCTION public.admin_list_reviews(public.review_status) TO anon, authenticated;