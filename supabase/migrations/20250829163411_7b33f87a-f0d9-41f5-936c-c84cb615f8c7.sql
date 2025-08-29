-- FIX SECURITY DEFINER VIEW ISSUE
-- Replace the SECURITY DEFINER view with a regular view

-- Drop the problematic view
DROP VIEW IF EXISTS public.public_reviews;

-- Recreate as a regular view (without SECURITY DEFINER)
CREATE VIEW public.public_reviews AS
SELECT 
  id,
  customer_name,
  rating,
  review_text,
  created_at,
  status
FROM public.reviews
WHERE status = 'approved'::review_status;

-- Grant SELECT permissions
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;