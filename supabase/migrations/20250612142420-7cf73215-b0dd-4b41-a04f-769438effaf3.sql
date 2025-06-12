
-- Create enum for review status
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  status review_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by_admin_id UUID REFERENCES public.admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_status ON public.reviews(status);
CREATE INDEX idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX idx_reviews_approved_rating ON public.reviews(status, rating) WHERE status = 'approved';

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policy for public to insert reviews (they start as pending)
CREATE POLICY "Anyone can submit reviews" 
  ON public.reviews 
  FOR INSERT 
  WITH CHECK (status = 'pending');

-- Create policy for public to view only approved reviews
CREATE POLICY "Anyone can view approved reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (status = 'approved');

-- Create policy for admins to view all reviews
CREATE POLICY "Admins can view all reviews" 
  ON public.reviews 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = current_setting('app.current_admin_id', true)::uuid
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create policy for admins to update reviews (approve/reject)
CREATE POLICY "Admins can update reviews" 
  ON public.reviews 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE id = current_setting('app.current_admin_id', true)::uuid
      AND role IN ('admin', 'super_admin')
    )
  );

-- Create function to get review statistics
CREATE OR REPLACE FUNCTION public.get_review_stats()
RETURNS TABLE(
  total_reviews BIGINT,
  average_rating NUMERIC,
  rating_breakdown JSONB
)
LANGUAGE SQL
STABLE
AS $$
  SELECT 
    COUNT(*) as total_reviews,
    ROUND(AVG(rating), 1) as average_rating,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE rating = 5),
      '4', COUNT(*) FILTER (WHERE rating = 4),
      '3', COUNT(*) FILTER (WHERE rating = 3),
      '2', COUNT(*) FILTER (WHERE rating = 2),
      '1', COUNT(*) FILTER (WHERE rating = 1)
    ) as rating_breakdown
  FROM public.reviews 
  WHERE status = 'approved';
$$;
