
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { loginAdmin, storeAdminSession } from '@/utils/adminAuth';
import { useToast } from '@/hooks/use-toast';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await loginAdmin(email, password);
      if (user) {
        storeAdminSession(user);
        toast({
          title: "Login successful",
          description: "Welcome to the admin dashboard",
        });
        navigate('/admin/dashboard');
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
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
                className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-[#1a1a1a] font-bold"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <p className="text-sm text-gray-400 mt-4 text-center">
            Demo credentials: admin@luxevisionshop.com / admin123
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
