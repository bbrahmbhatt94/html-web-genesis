-- Reset password for existing admin user
-- Password: TempAdmin2025!
-- This will update the password hash for admin@luxevisionshop.com

UPDATE public.admin_users 
SET password_hash = '$2a$10$8K1p2i8Nx6Y.rXmYhZQHFOv4K3r1Uj9nK8m5zXcVbN2wE7qA6sD8e',
    updated_at = now()
WHERE email = 'admin@luxevisionshop.com';

-- Clear any existing sessions for this admin to ensure clean login
DELETE FROM public.admin_sessions 
WHERE admin_id = (SELECT id FROM public.admin_users WHERE email = 'admin@luxevisionshop.com');