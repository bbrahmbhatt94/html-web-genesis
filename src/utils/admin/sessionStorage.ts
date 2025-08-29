
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

// Get and validate admin session using secure edge function
export const getAdminSession = async (): Promise<AdminUser | null> => {
  try {
    const stored = localStorage.getItem('admin_session');
    if (!stored) return null;

    const sessionData: StoredSessionData = JSON.parse(stored);
    
    // Check if session is expired locally
    if (Date.now() > sessionData.expiresAt) {
      clearAdminSession();
      return null;
    }

    // Validate session with secure edge function
    const { data, error } = await supabase.functions.invoke('admin-validate-session', {
      body: {
        sessionToken: sessionData.sessionToken
      }
    });

    if (error || !data.valid) {
      clearAdminSession();
      return null;
    }

    // Update stored session with fresh data
    const updatedSessionData: StoredSessionData = {
      ...sessionData,
      user: data.user
    };
    localStorage.setItem('admin_session', JSON.stringify(updatedSessionData));

    return data.user;
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
