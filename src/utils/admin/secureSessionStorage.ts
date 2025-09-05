import { supabase } from "@/integrations/supabase/client";
import type { AdminUser, StoredSessionData } from "@/types/admin";

// Secure session storage using sessionStorage with encryption-like obfuscation
// Note: This is still client-side storage but more secure than localStorage

const SESSION_KEY = 'admin_session_secure';
const ENCRYPTION_KEY = 'lovable_admin_secure_key_2024'; // In production, this should be dynamic

// Simple obfuscation (not real encryption, but better than plain text)
const obfuscate = (data: string): string => {
  const encoded = btoa(data);
  return encoded.split('').reverse().join('');
};

const deobfuscate = (data: string): string => {
  const reversed = data.split('').reverse().join('');
  return atob(reversed);
};

// Store admin session with enhanced security
export const storeAdminSession = (user: AdminUser, sessionToken: string) => {
  const sessionData: StoredSessionData = {
    user,
    sessionToken,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  
  try {
    const jsonData = JSON.stringify(sessionData);
    const obfuscatedData = obfuscate(jsonData);
    
    // Use sessionStorage instead of localStorage (cleared when tab closes)
    sessionStorage.setItem(SESSION_KEY, obfuscatedData);
    
    // Set additional security markers
    sessionStorage.setItem(SESSION_KEY + '_ts', Date.now().toString());
    sessionStorage.setItem(SESSION_KEY + '_fp', generateFingerprint());
  } catch (error) {
    console.error('Failed to store admin session:', error);
  }
};

// Get and validate admin session with enhanced security checks
export const getAdminSession = async (): Promise<AdminUser | null> => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    const timestamp = sessionStorage.getItem(SESSION_KEY + '_ts');
    const fingerprint = sessionStorage.getItem(SESSION_KEY + '_fp');
    
    if (!stored || !timestamp || !fingerprint) {
      return null;
    }

    // Validate fingerprint to detect session hijacking attempts
    if (fingerprint !== generateFingerprint()) {
      console.warn('Session fingerprint mismatch - clearing session');
      clearAdminSession();
      return null;
    }

    // Check if session was stored more than 24 hours ago
    const storeTime = parseInt(timestamp);
    if (Date.now() - storeTime > 24 * 60 * 60 * 1000) {
      clearAdminSession();
      return null;
    }

    const deobfuscatedData = deobfuscate(stored);
    const sessionData: StoredSessionData = JSON.parse(deobfuscatedData);
    
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

    if (error || !data?.valid) {
      clearAdminSession();
      return null;
    }

    // Update stored session with fresh data but keep same expiry
    const updatedSessionData: StoredSessionData = {
      ...sessionData,
      user: data.user
    };
    
    const jsonData = JSON.stringify(updatedSessionData);
    const obfuscatedData = obfuscate(jsonData);
    sessionStorage.setItem(SESSION_KEY, obfuscatedData);

    return data.user;
  } catch (error) {
    console.error('Error getting admin session:', error);
    clearAdminSession();
    return null;
  }
};

// Clear admin session with proper cleanup
export const clearAdminSession = async () => {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    
    if (stored) {
      try {
        const deobfuscatedData = deobfuscate(stored);
        const sessionData: StoredSessionData = JSON.parse(deobfuscatedData);
        
        // Invalidate session in database (fire and forget to avoid blocking logout)
        try {
          supabase
            .from('admin_sessions')
            .delete()
            .eq('session_token', sessionData.sessionToken);
          console.log('Session cleanup initiated');
        } catch (dbError) {
          console.error('Error invalidating session:', dbError);
        }
      } catch (error) {
        console.error('Error parsing stored session for cleanup:', error);
      }
    }
  } catch (error) {
    console.error('Error clearing session from database:', error);
  } finally {
    // Always clear local storage
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY + '_ts');
    sessionStorage.removeItem(SESSION_KEY + '_fp');
  }
};

// Generate a simple fingerprint for session validation
const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Admin fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};
