-- Create verification_requests table
CREATE TABLE public.verification_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  admin_notes TEXT,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own verification requests
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Policy: Users can create their own verification requests
CREATE POLICY "Users can create their own verification requests" ON public.verification_requests
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pending verification requests (e.g., to cancel)
CREATE POLICY "Users can update their own pending verification requests" ON public.verification_requests
FOR UPDATE TO authenticated USING (auth.uid() = user_id AND status = 'pending');

-- Policy: Users can delete their own pending verification requests
CREATE POLICY "Users can delete their own pending verification requests" ON public.verification_requests
FOR DELETE TO authenticated USING (auth.uid() = user_id AND status = 'pending');