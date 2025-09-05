
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/types/admin";
import { sanitizeInput, validateEmail } from "@/utils/inputValidation";

// Update the admin authentication service to handle rate limiting responses
export const loginAdmin = async (email: string, password: string): Promise<{ user: AdminUser; sessionToken: string } | null> => {
  try {
    // Input validation and sanitization
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      throw new Error('Invalid email format');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Use secure admin login edge function
    const { data, error } = await supabase.functions.invoke('admin-login', {
      body: {
        email: sanitizedEmail,
        password: password
      }
    });

    if (error) {
      console.error('Admin login error:', error);
      
      // Handle rate limiting specifically
      if (error.message?.includes('429') || error.message?.includes('Too many')) {
        throw new Error('Too many login attempts. Please try again later.');
      }
      
      throw new Error('Login failed');
    }

    if (!data.success) {
      const errorMessage = data.error || 'Invalid credentials';
      
      // Handle rate limiting from response
      if (data.blocked_until) {
        const blockedUntil = new Date(data.blocked_until);
        const timeRemaining = Math.ceil((blockedUntil.getTime() - Date.now()) / (1000 * 60));
        throw new Error(`Account temporarily locked. Try again in ${timeRemaining} minutes.`);
      }
      
      throw new Error(errorMessage);
    }

    return {
      user: data.user,
      sessionToken: data.sessionToken
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return null;
  }
};

// Check if user is admin
export const isAdmin = (user: AdminUser | null): boolean => {
  return user?.role === 'admin' || user?.role === 'super_admin';
};
