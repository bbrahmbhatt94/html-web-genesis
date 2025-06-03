
import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getAdminSession, clearAdminSession, isAdmin, cleanupExpiredSessions } from '@/utils/admin';
import type { AdminUser } from '@/types/admin';
import { BarChart3, Users, Video, TrendingUp, Activity, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const adminUser = await getAdminSession();
        if (!adminUser || !isAdmin(adminUser)) {
          navigate('/admin/login');
        } else {
          setUser(adminUser);
          // Cleanup expired sessions periodically
          cleanupExpiredSessions();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Check auth status every 5 minutes
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await clearAdminSession();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if session cleanup fails
      navigate('/admin/login');
    }
  };

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/behavior', label: 'User Behavior', icon: Users },
    { path: '/admin/videos', label: 'Video Analytics', icon: Video },
    { path: '/admin/conversions', label: 'Conversions', icon: TrendingUp },
    { path: '/admin/performance', label: 'Performance', icon: Activity },
    { path: '/admin/live', label: 'Live Monitoring', icon: Activity },
  ];

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] text-white">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#2d2d2d] border-r border-[rgba(255,215,0,0.2)] min-h-screen">
          <div className="p-6">
            <h1 className="text-xl font-bold text-[#ffd700] mb-6">
              LuxeVision Admin
            </h1>
            
            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-[#ffd700] text-[#1a1a1a]' 
                        : 'text-gray-300 hover:bg-[#1a1a1a] hover:text-[#ffd700]'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-8 pt-8 border-t border-[rgba(255,215,0,0.2)]">
              <div className="text-sm text-gray-400 mb-4">
                <p>Logged in as:</p>
                <p className="text-[#ffd700] font-medium break-all">{user.email}</p>
                <p className="text-xs capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="w-full border-[rgba(255,215,0,0.2)] text-gray-300 hover:bg-[#1a1a1a] hover:text-[#ffd700]"
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
