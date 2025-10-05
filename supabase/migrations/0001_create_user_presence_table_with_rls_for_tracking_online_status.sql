-- Create user_presence table
CREATE TABLE public.user_presence (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  is_online BOOLEAN DEFAULT FALSE,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see everyone's online status
CREATE POLICY "Public read access to user presence" ON public.user_presence 
FOR SELECT USING (true);

-- Policy: Users can update their own online status
CREATE POLICY "Users can update their own presence" ON public.user_presence 
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policy: Users can insert their own presence record (on first login)
CREATE POLICY "Users can insert their own presence" ON public.user_presence 
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own presence record (on logout, if desired)
CREATE POLICY "Users can delete their own presence" ON public.user_presence 
FOR DELETE TO authenticated USING (auth.uid() = user_id);