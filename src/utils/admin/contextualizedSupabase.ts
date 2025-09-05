import { supabase } from "@/integrations/supabase/client";

// Simplified admin authentication - use session tokens directly with functions
export const createAdminSupabaseClient = () => {
  // Return the regular supabase client - authentication will be handled 
  // by passing session tokens to secure functions
  return supabase;
};

// Get current session token for admin operations
export const getCurrentSessionToken = (): string | null => {
  try {
    const stored = sessionStorage.getItem('admin_session_secure');
    if (!stored) {
      return null;
    }

    // Deobfuscate to get session data
    const reversed = stored.split('').reverse().join('');
    const deobfuscated = atob(reversed);
    const sessionData = JSON.parse(deobfuscated);

    return sessionData.sessionToken;
  } catch (error) {
    console.error('Error getting session token:', error);
    return null;
  }
};

// Helper function to make admin calls with session token
export const withAdminContext = async <T>(
  operation: (sessionToken: string) => Promise<T>
): Promise<T | null> => {
  const sessionToken = getCurrentSessionToken();
  if (!sessionToken) {
    throw new Error('Not authenticated as admin');
  }
  
  return await operation(sessionToken);
};