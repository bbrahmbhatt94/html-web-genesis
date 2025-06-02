
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';
import { BarChart3, Users, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalSessions: number;
  todaySessions: number;
  totalConversions: number;
  conversionRate: number;
  totalRevenue: number;
  avgSessionDuration: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSessions: 0,
    todaySessions: 0,
    totalConversions: 0,
    conversionRate: 0,
    totalRevenue: 0,
    avgSessionDuration: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        // Get total sessions
        const { count: totalSessions } = await supabase
          .from('analytics_sessions')
          .select('*', { count: 'exact', head: true });

        // Get today's sessions
        const today = new Date().toISOString().split('T')[0];
        const { count: todaySessions } = await supabase
          .from('analytics_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('start_time', today);

        // Get conversions
        const { data: conversions } = await supabase
          .from('analytics_sessions')
          .select('converted, conversion_value')
          .eq('converted', true);

        const totalConversions = conversions?.length || 0;
        const totalRevenue = conversions?.reduce((sum, c) => sum + (c.conversion_value || 0), 0) || 0;
        const conversionRate = totalSessions ? (totalConversions / totalSessions) * 100 : 0;

        // Get average session duration
        const { data: sessions } = await supabase
          .from('analytics_sessions')
          .select('total_time_spent')
          .not('total_time_spent', 'is', null);

        const avgSessionDuration = sessions?.length 
          ? sessions.reduce((sum, s) => sum + (s.total_time_spent || 0), 0) / sessions.length
          : 0;

        setStats({
          totalSessions: totalSessions || 0,
          todaySessions: todaySessions || 0,
          totalConversions,
          conversionRate,
          totalRevenue,
          avgSessionDuration: Math.round(avgSessionDuration)
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const statCards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions.toLocaleString(),
      icon: Users,
      description: `${stats.todaySessions} today`
    },
    {
      title: "Conversions",
      value: stats.totalConversions.toString(),
      icon: TrendingUp,
      description: `${stats.conversionRate.toFixed(1)}% conversion rate`
    },
    {
      title: "Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "Total revenue"
    },
    {
      title: "Avg. Session",
      value: `${Math.floor(stats.avgSessionDuration / 60)}m ${stats.avgSessionDuration % 60}s`,
      icon: BarChart3,
      description: "Average duration"
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#ffd700] mb-2">Dashboard</h1>
          <p className="text-gray-300">Overview of your website analytics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{card.title}</p>
                      <p className="text-2xl font-bold text-white">{card.value}</p>
                      <p className="text-xs text-gray-400 mt-1">{card.description}</p>
                    </div>
                    <Icon className="h-8 w-8 text-[#ffd700]" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#ffd700]">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300">
              <p>Real-time analytics tracking is now active!</p>
              <p className="text-sm text-gray-400 mt-2">
                Use the navigation menu to explore detailed analytics for user behavior, video engagement, conversions, and performance metrics.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
