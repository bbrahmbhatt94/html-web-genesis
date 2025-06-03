
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser, AdminSession } from "@/types/admin";

// Generate secure session token
export const generateSessionToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Create admin session
export const createAdminSession = async (adminId: string): Promise<AdminSession | null> => {
  try {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
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

// Cleanup expired sessions (can be called periodically)
export const cleanupExpiredSessions = async () => {
  try {
    await supabase.rpc('cleanup_expired_admin_sessions');
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};
