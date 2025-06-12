
import { ReviewSubmissionForm } from '@/components/reviews/ReviewSubmissionForm';
import { ReviewsDisplay } from '@/components/reviews/ReviewsDisplay';
import { ReviewStats } from '@/components/reviews/ReviewStats';

export const ReviewsSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d]">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join thousands of satisfied customers who have transformed their content with LuxeVision's premium video collection.
          </p>
        </div>

        {/* Review Stats */}
        <div className="mb-16 max-w-md mx-auto">
          <ReviewStats />
        </div>

        {/* Reviews Display */}
        <div className="mb-16">
          <ReviewsDisplay />
        </div>

        {/* Review Submission Form */}
        <div className="mb-8">
          <ReviewSubmissionForm />
        </div>
      </div>
    </section>
  );
};
