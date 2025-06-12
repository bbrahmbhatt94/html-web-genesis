
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ReviewSubmissionForm = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    rating: 0,
    reviewText: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName || !formData.customerEmail || !formData.reviewText || formData.rating === 0) {
      toast({
        title: "Please fill in all fields",
        description: "All fields including rating are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          rating: formData.rating,
          review_text: formData.reviewText,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Review submitted successfully!",
        description: "Your review is being reviewed and will appear on the site once approved.",
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        rating: 0,
        reviewText: ''
      });
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error submitting review",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold text-[#ffd700]">
          Share Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <Input
                id="customerName"
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] text-white"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-colors"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredRating || formData.rating)
                        ? 'fill-[#ffd700] text-[#ffd700]'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="reviewText" className="block text-sm font-medium text-gray-300 mb-2">
              Your Review
            </label>
            <Textarea
              id="reviewText"
              value={formData.reviewText}
              onChange={(e) => setFormData(prev => ({ ...prev, reviewText: e.target.value }))}
              className="bg-[#2d2d2d] border-[rgba(255,215,0,0.2)] text-white min-h-[120px]"
              placeholder="Share your experience with LuxeVision..."
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#ffd700] to-[#ffed4e] text-black font-semibold py-3 rounded-lg hover:shadow-lg transition-all duration-300"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
