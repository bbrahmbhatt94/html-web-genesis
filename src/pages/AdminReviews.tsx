
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Check, X, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminLayout from '@/components/admin/AdminLayout';

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at: string | null;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error fetching reviews",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReviewStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(reviewId));
    
    try {
      const updateData: any = { status };
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: `Review ${status}`,
        description: `The review has been ${status} successfully.`,
      });

      // Refresh the reviews list
      fetchReviews();
    } catch (error) {
      console.error('Error updating review:', error);
      toast({
        title: "Error updating review",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-[#ffd700] text-[#ffd700]' : 'text-gray-400'}
          />
        ))}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500"><Clock size={12} className="mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-500 border-green-500"><Check size={12} className="mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500"><X size={12} className="mr-1" />Rejected</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = reviews.filter(r => r.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-[#ffd700]">Review Management</h1>
          <div className="text-sm text-gray-400">
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
            <Button
              key={filterOption}
              variant={filter === filterOption ? "default" : "outline"}
              onClick={() => setFilter(filterOption)}
              className={filter === filterOption ? "bg-[#ffd700] text-black" : "border-[rgba(255,215,0,0.2)] text-gray-300"}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-16 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 text-lg">No reviews found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {reviews.map((review) => (
              <Card key={review.id} className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-white flex items-center space-x-3">
                      <span>{review.customer_name}</span>
                      {renderStars(review.rating)}
                      {getStatusBadge(review.status)}
                    </CardTitle>
                    <span className="text-sm text-gray-400">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Email:</p>
                      <p className="text-gray-300">{review.customer_email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Review:</p>
                      <p className="text-gray-300 leading-relaxed">"{review.review_text}"</p>
                    </div>
                    
                    {review.status === 'pending' && (
                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={() => updateReviewStatus(review.id, 'approved')}
                          disabled={processingIds.has(review.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} className="mr-2" />
                          {processingIds.has(review.id) ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => updateReviewStatus(review.id, 'rejected')}
                          disabled={processingIds.has(review.id)}
                          variant="destructive"
                        >
                          <X size={16} className="mr-2" />
                          {processingIds.has(review.id) ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                    
                    {review.approved_at && (
                      <p className="text-xs text-gray-500">
                        Approved on: {formatDate(review.approved_at)}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminReviews;
