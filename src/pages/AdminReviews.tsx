import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { withAdminContext } from '@/utils/admin/contextualizedSupabase';
import { Star, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Review {
  id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  review_text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
}

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const result = await withAdminContext(async (sessionToken) => {
        const filterParam = filter === 'all' ? null : filter;
        return await supabase.rpc('admin_list_reviews', {
          p_status: filterParam,
          session_token: sessionToken
        });
      });

      if (result?.error) {
        console.error('Error fetching reviews:', result.error);
        toast({
          title: "Error fetching reviews",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      setReviews(result?.data || []);
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
      const result = await withAdminContext(async (sessionToken) => {
        return await supabase.rpc('admin_update_review_status', {
          p_review_id: reviewId,
          p_status: status,
          session_token: sessionToken
        });
      });

      if (result?.error) {
        console.error('Error updating review status:', result.error);
        toast({
          title: "Error updating review",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: `Review ${status}`,
        description: `The review has been ${status} successfully.`,
      });

      fetchReviews();
    } catch (error) {
      console.error('Error updating review status:', error);
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

  const bulkUpdateReviews = async (status: 'approved' | 'rejected') => {
    if (selectedReviews.size === 0) return;
    
    setBulkProcessing(true);
    
    try {
      const result = await withAdminContext(async (sessionToken) => {
        return await supabase.rpc('admin_bulk_update_review_status', {
          p_review_ids: Array.from(selectedReviews),
          p_status: status,
          session_token: sessionToken
        });
      });

      if (result?.error) {
        console.error('Error bulk updating reviews:', result.error);
        toast({
          title: "Error updating reviews",
          description: "Please try again later.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: `Reviews ${status}`,
        description: `${selectedReviews.size} reviews ${status} successfully.`,
      });

      setSelectedReviews(new Set());
      fetchReviews();
    } catch (error) {
      console.error('Error bulk updating reviews:', error);
      toast({
        title: "Error updating reviews",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const toggleSelectReview = (reviewId: string) => {
    setSelectedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedReviews.size === sortedReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(sortedReviews.map(r => r.id)));
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'rating_high':
        return b.rating - a.rating;
      case 'rating_low':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

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
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle size={12} className="mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-500 border-red-500"><XCircle size={12} className="mr-1" />Rejected</Badge>;
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#ffd700]">Review Management</h1>
          <div className="text-sm text-gray-400">
            {pendingCount > 0 && (
              <span className="bg-yellow-500 text-black px-2 py-1 rounded-full text-xs font-medium">
                {pendingCount} pending review{pendingCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
              <Button
                key={filterOption}
                variant={filter === filterOption ? 'default' : 'outline'}
                onClick={() => setFilter(filterOption)}
                className={filter === filterOption ? "bg-[#ffd700] text-black" : "border-[rgba(255,215,0,0.2)] text-gray-300"}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)} ({reviews.filter(r => filterOption === 'all' || r.status === filterOption).length})
              </Button>
            ))}
          </div>
          
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-48 bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] text-gray-300">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="rating_high">Highest Rating</SelectItem>
              <SelectItem value="rating_low">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedReviews.size > 0 && (
          <div className="flex items-center gap-4 p-4 bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] border rounded-lg">
            <span className="text-sm font-medium text-gray-300">{selectedReviews.size} selected</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => bulkUpdateReviews('approved')}
                disabled={bulkProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkUpdateReviews('rejected')}
                disabled={bulkProcessing}
              >
                {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reject All
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedReviews(new Set())}
                className="border-[rgba(255,215,0,0.2)] text-gray-300"
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

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
        ) : sortedReviews.length === 0 ? (
          <Card className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
            <CardContent className="p-12 text-center">
              <p className="text-gray-400 text-lg">No reviews found for the selected filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Select All Checkbox */}
            {sortedReviews.length > 0 && (
              <div className="flex items-center gap-2 p-2">
                <Checkbox
                  checked={selectedReviews.size === sortedReviews.length && sortedReviews.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-400">Select All</span>
              </div>
            )}
            
            {sortedReviews.map((review, index) => (
              <Card key={review.id} className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)]">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedReviews.has(review.id)}
                      onCheckedChange={() => toggleSelectReview(review.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-lg text-white flex items-center space-x-3">
                          <span>#{index + 1} - {review.customer_name}</span>
                          {renderStars(review.rating)}
                          {getStatusBadge(review.status)}
                        </CardTitle>
                        <span className="text-sm text-gray-400">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{review.customer_email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Review:</p>
                      <p className="text-gray-300 leading-relaxed bg-gray-800/50 p-3 rounded-md">"{review.review_text}"</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        {review.approved_at && (
                          <p className="text-xs text-gray-500">
                            Approved on: {formatDate(review.approved_at)}
                          </p>
                        )}
                      </div>
                      
                      {review.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateReviewStatus(review.id, 'approved')}
                            disabled={processingIds.has(review.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            {processingIds.has(review.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateReviewStatus(review.id, 'rejected')}
                            disabled={processingIds.has(review.id)}
                          >
                            {processingIds.has(review.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
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