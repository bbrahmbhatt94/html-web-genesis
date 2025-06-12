
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStats {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    [key: string]: number;
  };
}

// Type guard to safely convert Json to rating breakdown
const isValidRatingBreakdown = (data: any): data is { [key: string]: number } => {
  if (!data || typeof data !== 'object') return false;
  
  // Check if all values are numbers
  for (const key in data) {
    if (typeof data[key] !== 'number') return false;
  }
  
  return true;
};

export const ReviewStats = () => {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviewStats();
  }, []);

  const fetchReviewStats = async () => {
    try {
      const { data, error } = await supabase.rpc('get_review_stats');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const rawStats = data[0];
        
        // Safely convert the rating_breakdown from Json to our expected type
        const rating_breakdown = isValidRatingBreakdown(rawStats.rating_breakdown) 
          ? rawStats.rating_breakdown 
          : {};
        
        setStats({
          total_reviews: rawStats.total_reviews || 0,
          average_rating: rawStats.average_rating || 0,
          rating_breakdown
        });
      }
    } catch (error) {
      console.error('Error fetching review stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={star <= Math.floor(rating) ? 'fill-[#ffd700] text-[#ffd700]' : 'text-gray-400'}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
        <CardContent className="p-6 text-center animate-pulse">
          <div className="h-8 bg-gray-700 rounded mb-2"></div>
          <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.total_reviews === 0) {
    return (
      <Card className="bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
        <CardContent className="p-6 text-center">
          <h3 className="text-2xl font-bold text-[#ffd700] mb-2">No Reviews Yet</h3>
          <p className="text-gray-400">Be the first to share your experience!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-2">
          {renderStars(stats.average_rating)}
          <span className="ml-2 text-2xl font-bold text-[#ffd700]">
            {stats.average_rating}
          </span>
        </div>
        <p className="text-gray-300 mb-4">
          Based on {stats.total_reviews} {stats.total_reviews === 1 ? 'review' : 'reviews'}
        </p>
        
        <div className="space-y-2 max-w-xs mx-auto">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.rating_breakdown[rating.toString()] || 0;
            const percentage = stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center text-sm">
                <span className="text-gray-400 w-8">{rating}★</span>
                <div className="flex-1 mx-2 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-[#ffd700] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-gray-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
