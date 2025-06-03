
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { loginAdmin, storeAdminSession } from '@/utils/adminAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Basic rate limiting
  const maxAttempts = 5;
  const isRateLimited = attempts >= maxAttempts;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRateLimited) {
      toast({
        title: "Too many attempts",
        description: "Please refresh the page and try again",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginAdmin(email, password);
      if (result) {
        storeAdminSession(result.user, result.sessionToken);
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        navigate('/admin/dashboard');
      } else {
        setAttempts(prev => prev + 1);
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      setAttempts(prev => prev + 1);
      toast({
        title: "Login error",
        description: "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] flex items-center justify-center px-4">
      <Card className="w-full max-w-md bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-[#ffd700]">
            Admin Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
                className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading || isRateLimited}
                className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || isRateLimited}
              className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] font-bold"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>
          
          {isRateLimited && (
            <p className="text-sm text-red-400 mt-4 text-center">
              Too many failed attempts. Please refresh the page to try again.
            </p>
          )}
          
          {attempts > 0 && attempts < maxAttempts && (
            <p className="text-sm text-yellow-400 mt-4 text-center">
              {maxAttempts - attempts} attempts remaining
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
