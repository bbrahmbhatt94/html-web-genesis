
// Input validation utilities for security
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
  }
  return { valid: true };
};

export const sanitizeAnalyticsData = (data: any): any => {
  if (typeof data !== 'object' || data === null) return {};
  
  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    } else if (typeof value === 'number' && !isNaN(value)) {
      sanitized[sanitizeInput(key)] = value;
    } else if (typeof value === 'boolean') {
      sanitized[sanitizeInput(key)] = value;
    }
  }
  return sanitized;
};
