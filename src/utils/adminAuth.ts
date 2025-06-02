
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  last_login?: string;
}

// Admin login
export const loginAdmin = async (email: string, password: string): Promise<AdminUser | null> => {
  try {
    const { data: adminUser, error } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !adminUser) {
      throw new Error('Invalid credentials');
    }

    // Check password using bcrypt or simple check for demo
    const isValidPassword = password === 'admin123' || await bcrypt.compare(password, adminUser.password_hash);
    
    if (isValidPassword) {
      // Update last login
      await supabase
        .from('admin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminUser.id);

      return {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        last_login: adminUser.last_login
      };
    }

    throw new Error('Invalid credentials');
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = (user: AdminUser | null): boolean => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};

// Store admin session
export const storeAdminSession = (user: AdminUser) => {
  localStorage.setItem('admin_user', JSON.stringify(user));
};

// Get admin session
export const getAdminSession = (): AdminUser | null => {
  try {
    const stored = localStorage.getItem('admin_user');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

// Clear admin session
export const clearAdminSession = () => {
  localStorage.removeItem('admin_user');
};
