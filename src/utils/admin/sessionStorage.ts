
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser, StoredSessionData } from "@/types/admin";
import { validateAdminSession } from "./sessionManager";

// Store admin session securely
export const storeAdminSession = (user: AdminUser, sessionToken: string) => {
  const sessionData: StoredSessionData = {
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

    const sessionData: StoredSessionData = JSON.parse(stored);
    
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
      const sessionData: StoredSessionData = JSON.parse(stored);
      
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
