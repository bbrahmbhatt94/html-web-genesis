
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { sanitizeInput, validateEmail } from '@/utils/inputValidation';
import { rateLimiter } from '@/utils/security/rateLimiter';
import { storeAdminSession } from '@/utils/admin';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const stored = localStorage.getItem('admin_session');
      if (stored) {
        try {
          const sessionData = JSON.parse(stored);
          if (Date.now() < sessionData.expiresAt) {
            setIsAuthenticated(true);
          }
        } catch (error) {
          localStorage.removeItem('admin_session');
        }
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail) || !password) {
      setError('Please enter a valid email and password');
      return;
    }

    // Rate limiting check
    if (rateLimiter.isRateLimited(sanitizedEmail)) {
      const timeUntilReset = Math.ceil(rateLimiter.getTimeUntilReset(sanitizedEmail) / 60000);
      setError(`Too many failed attempts. Please try again in ${timeUntilReset} minutes.`);
      return;
    }

    setIsLoading(true);

    try {
      // Use secure admin login edge function
      const { data, error: loginError } = await supabase.functions.invoke('admin-login', {
        body: {
          email: sanitizedEmail,
          password: password
        }
      });

      if (loginError || !data.success) {
        // Record failed attempt
        rateLimiter.recordAttempt(sanitizedEmail);
        const remaining = rateLimiter.getRemainingAttempts(sanitizedEmail);
        setError(data?.error || 'Invalid credentials');
        
        if (remaining <= 2 && remaining > 0) {
          setError(`${data?.error || 'Invalid credentials'}. ${remaining} attempts remaining.`);
        }
        return;
      }

      // Store session securely
      storeAdminSession(data.user, data.sessionToken);
      setIsAuthenticated(true);

    } catch (error) {
      console.error('Login error:', error);
      rateLimiter.recordAttempt(sanitizedEmail);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#ffd700]">Admin Login</CardTitle>
          <CardDescription className="text-gray-300">
            Secure admin authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={isLoading}
                className="bg-[#1a1a1a] border-gray-600 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
                className="bg-[#1a1a1a] border-gray-600 text-white"
              />
            </div>

            {error && (
              <Alert className="border-red-500 bg-red-500/10">
                <AlertDescription className="text-red-400">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] font-bold"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-4 text-sm text-gray-400 text-center">
            <p>Secure admin authentication system</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
