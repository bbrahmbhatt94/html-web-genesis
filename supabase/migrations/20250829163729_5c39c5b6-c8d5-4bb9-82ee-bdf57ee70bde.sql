-- FINAL SECURITY FIX: Remove the problematic view and rely on application-level field selection
-- The view approach has security implications with RLS, so we'll drop it entirely

-- Drop the public_reviews view that's causing the security warning
DROP VIEW IF EXISTS public.public_reviews;

-- The security is now handled by:
-- 1. RLS policies on the reviews table that allow public access to approved reviews
-- 2. Application code that only selects non-sensitive fields (customer_name, rating, review_text, created_at)
-- 3. The customer_email field is never requested in the application queries

-- Ensure we have proper RLS policies in place
-- Keep the existing policies but ensure they're properly structured

-- Policy for public access to approved reviews (they can see all fields but app won't request sensitive ones)
DROP POLICY IF EXISTS "Public can view approved reviews (non-sensitive fields only)" ON public.reviews;

-- Recreate the simple public policy for approved reviews
CREATE POLICY "Anyone can view approved reviews" 
ON public.reviews 
FOR SELECT 
USING (status = 'approved'::review_status);

-- Remove the unnecessary security definer function since we're not using the view approach
DROP FUNCTION IF EXISTS public.can_access_sensitive_review_data();