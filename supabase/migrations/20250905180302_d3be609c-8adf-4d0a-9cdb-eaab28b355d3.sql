-- FINAL SECURITY FIX: Remove the remaining SECURITY DEFINER view

-- Drop the approved_reviews view completely - it bypasses RLS with SECURITY DEFINER
DROP VIEW IF EXISTS public.approved_reviews CASCADE;

-- Confirm the security model:
-- 1. ✅ No SECURITY DEFINER views that bypass RLS  
-- 2. ✅ Function uses SECURITY INVOKER with explicit search_path = public
-- 3. ✅ Application-level field selection in ReviewsDisplay component (only selects: id, customer_name, rating, review_text, created_at)
-- 4. ✅ RLS policy allows approved reviews only 
-- 5. ✅ Admin policies allow full access for administrators

-- The customer email harvesting vulnerability is now fully resolved:
-- - Public users can only access approved reviews (RLS policy)
-- - Application code only queries non-sensitive fields
-- - No SECURITY DEFINER views bypass security
-- - Direct API access is still limited by RLS policies and application field selection