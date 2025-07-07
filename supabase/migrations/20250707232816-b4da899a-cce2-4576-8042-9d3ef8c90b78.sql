-- Add RLS policy to allow login queries for admin authentication
-- This allows SELECT operations on admin_users during login process
CREATE POLICY "Allow login queries for admin authentication" 
ON public.admin_users 
FOR SELECT 
USING (true);