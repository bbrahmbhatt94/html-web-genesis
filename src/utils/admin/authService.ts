
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';
import type { AdminUser } from "@/types/admin";
import { createAdminSession } from "./sessionManager";

// Admin login with secure session
export const loginAdmin = async (email: string, password: string): Promise<{ user: AdminUser; sessionToken: string } | null> => {
  try {
    // Input validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Rate limiting could be added here in production
    
    const { data: adminUser, error } = await supabase
      .rpc('authenticate_admin', { 
        input_email: email.toLowerCase().trim() 
      })
      .single();

    if (error || !adminUser) {
      throw new Error('Invalid credentials');
    }

    // Remove the hardcoded password bypass - only use bcrypt
    const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
    
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Create secure session
    const session = await createAdminSession(adminUser.id);
    if (!session) {
      throw new Error('Failed to create session');
    }

    // Update last login
    await supabase
      .from('admin_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', adminUser.id);

    const user: AdminUser = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      last_login: adminUser.last_login
    };

    return { user, sessionToken: session.session_token };
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = (user: AdminUser | null): boolean => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};
