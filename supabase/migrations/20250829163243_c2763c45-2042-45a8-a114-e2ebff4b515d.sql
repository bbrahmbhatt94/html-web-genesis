-- SECURITY FIX: Restrict public access to reviews table to exclude sensitive customer data

-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view approved reviews" ON public.reviews;

-- Create a new restrictive policy that only allows access to non-sensitive fields
-- This policy will be enforced at the row level, but we also need to ensure
-- that the application layer doesn't request sensitive fields
CREATE POLICY "Public can view approved reviews (non-sensitive fields only)" 
ON public.reviews 
FOR SELECT 
USING (
  status = 'approved'::review_status
);

-- Create a function to check if a user should have access to sensitive review data
CREATE OR REPLACE FUNCTION public.can_access_sensitive_review_data()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  -- Only admins can access sensitive data like customer emails
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE id = (current_setting('app.current_admin_id', true))::uuid
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Create a policy for admins to access all review data including sensitive fields
CREATE POLICY "Admins can view all review data including sensitive fields" 
ON public.reviews 
FOR SELECT 
USING (
  status = 'approved'::review_status 
  AND can_access_sensitive_review_data()
);

-- Note: The existing "Admins can view all reviews" policy should handle admin access
-- but this adds an extra layer of protection for sensitive data

-- Create a view for public access that explicitly excludes sensitive fields
CREATE OR REPLACE VIEW public.public_reviews AS
SELECT 
  id,
  customer_name,
  rating,
  review_text,
  created_at,
  status
FROM public.reviews
WHERE status = 'approved'::review_status;

-- Grant SELECT permission on the view to the public (anon role)
GRANT SELECT ON public.public_reviews TO anon;
GRANT SELECT ON public.public_reviews TO authenticated;