
import { supabase } from "@/integrations/supabase/client";
import bcrypt from 'bcryptjs';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  last_login?: string;
}

export interface AdminSession {
  id: string;
  admin_id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  last_accessed: string;
}

// Generate secure session token
const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create admin session
const createAdminSession = async (adminId: string): Promise<AdminSession | null> => {
  try {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Set admin context for RLS
    await supabase.rpc('set_config', {
      setting_name: 'app.current_admin_id',
      setting_value: adminId
    });

    const { data, error } = await supabase
      .from('admin_sessions')
      .insert({
        admin_id: adminId,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: null, // Can be enhanced to capture real IP
        user_agent: navigator.userAgent
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating admin session:', error);
    return null;
  }
};

// Validate admin session
export const validateAdminSession = async (sessionToken: string): Promise<AdminUser | null> => {
  try {
    const { data: session, error } = await supabase
      .from('admin_sessions')
      .select(`
        *,
        admin_users (
          id,
          email,
          role,
          last_login
        )
      `)
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) return null;

    // Update last accessed time
    await supabase
      .from('admin_sessions')
      .update({ last_accessed: new Date().toISOString() })
      .eq('id', session.id);

    const adminUser = session.admin_users as any;
    return {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      last_login: adminUser.last_login
    };
  } catch (error) {
    console.error('Error validating admin session:', error);
    return null;
  }
};

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
      .from('admin_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
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

// Store admin session securely
export const storeAdminSession = (user: AdminUser, sessionToken: string) => {
  const sessionData = {
    user,
    sessionToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  localStorage.setItem('admin_session', JSON.stringify(sessionData));
};

// Get and validate admin session
export const getAdminSession = async (): Promise<AdminUser | null> => {
  try {
    const stored = localStorage.getItem('admin_session');
    if (!stored) return null;

    const sessionData = JSON.parse(stored);
    
    // Check if session is expired
    if (Date.now() > sessionData.expiresAt) {
      clearAdminSession();
      return null;
    }

    // Validate session with database
    const user = await validateAdminSession(sessionData.sessionToken);
    if (!user) {
      clearAdminSession();
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error getting admin session:', error);
    clearAdminSession();
    return null;
  }
};

// Clear admin session
export const clearAdminSession = async () => {
  try {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      const sessionData = JSON.parse(stored);
      
      // Invalidate session in database
      await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_token', sessionData.sessionToken);
    }
  } catch (error) {
    console.error('Error clearing session from database:', error);
  } finally {
    localStorage.removeItem('admin_session');
  }
};

// Cleanup expired sessions (can be called periodically)
export const cleanupExpiredSessions = async () => {
  try {
    await supabase.rpc('cleanup_expired_admin_sessions');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};
