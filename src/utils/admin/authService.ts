
import { supabase } from "@/integrations/supabase/client";
import type { AdminUser } from "@/types/admin";
import { sanitizeInput, validateEmail } from "@/utils/inputValidation";

// Secure admin login using edge function
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
      throw new Error('Login failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Invalid credentials');
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
