
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import AdminLayout from '@/components/admin/AdminLayout';

interface BehaviorEvent {
  id: string;
  event_type: string;
  event_data: any;
  page_url: string;
  created_at: string;
  session_id: string;
}

const AdminBehavior = () => {
  const [events, setEvents] = useState<BehaviorEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBehaviorData = async () => {
      try {
        const { data, error } = await supabase
          .from('analytics_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        setEvents(data || []);
      } catch (error) {
        console.error('Error fetching behavior data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBehaviorData();

    // Set up real-time subscription
    const subscription = supabase
      .channel('behavior-events')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'analytics_events'
      }, (payload) => {
        setEvents(prev => [payload.new as BehaviorEvent, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const formatEventData = (eventData: any) => {
    if (!eventData || typeof eventData !== 'object') return '-';
    return Object.entries(eventData)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#ffd700] mb-2">User Behavior Analytics</h1>
          <p className="text-gray-300">Track user interactions and behavior patterns</p>
        </div>

        <Card className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
          <CardHeader>
            <CardTitle className="text-[#ffd700]">Recent User Events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-gray-300">Loading behavior data...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[rgba(255,215,0,0.2)]">
                      <TableHead className="text-gray-300">Event Type</TableHead>
                      <TableHead className="text-gray-300">Page</TableHead>
                      <TableHead className="text-gray-300">Event Data</TableHead>
                      <TableHead className="text-gray-300">Time</TableHead>
                      <TableHead className="text-gray-300">Session</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="border-[rgba(255,215,0,0.1)] hover:bg-[#1a1a1a]">
                        <TableCell className="text-white font-medium">
                          {event.event_type.replace('_', ' ').toUpperCase()}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {new URL(event.page_url).pathname}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {formatEventData(event.event_data)}
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {new Date(event.created_at).toLocaleTimeString()}
                        </TableCell>
                        <TableCell className="text-gray-300 font-mono text-xs">
                          {event.session_id.slice(-8)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBehavior;
