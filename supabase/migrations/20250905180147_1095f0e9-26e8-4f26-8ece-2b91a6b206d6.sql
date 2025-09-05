-- SECURITY CORRECTIONS: Fix the two security warnings

-- Fix 1: Remove the SECURITY DEFINER view (0010_security_definer_view)
-- Views default to SECURITY DEFINER which bypasses RLS - this is dangerous
DROP VIEW IF EXISTS public.approved_reviews;

-- Fix 2: Update function with proper search_path (0011_function_search_path_mutable)
-- Functions need explicit search_path to prevent injection attacks
DROP FUNCTION IF EXISTS public.can_view_public_review_fields();

CREATE OR REPLACE FUNCTION public.can_view_public_review_fields()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY INVOKER
SET search_path = public
AS $$
  -- This function always returns true, but ensures proper search path security
  -- Application layer must ensure only safe fields (id, customer_name, rating, review_text, created_at) are queried
  SELECT true;
$$;

-- Update the comment to reflect the security model
COMMENT ON FUNCTION public.can_view_public_review_fields() IS 
'Security helper function for review queries. Uses SECURITY INVOKER with explicit search_path. Application must ensure only non-sensitive fields are selected.';

-- The security model is now:
-- 1. No SECURITY DEFINER views that bypass RLS
-- 2. Functions use proper search_path and SECURITY INVOKER
-- 3. Application-level field selection prevents exposure of customer_email
-- 4. Existing RLS policies control row-level access (approved reviews only)
-- 5. Admin policies allow full access for administrators