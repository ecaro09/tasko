CREATE TABLE public.tasker_profiles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  photo_url TEXT,
  skills TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
  bio TEXT,
  hourly_rate NUMERIC DEFAULT 0 NOT NULL,
  is_tasker BOOLEAN DEFAULT FALSE NOT NULL,
  date_joined TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tasker_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasker profiles are viewable by everyone." ON public.tasker_profiles
FOR SELECT USING (true);

CREATE POLICY "Users can create their own tasker profile." ON public.tasker_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasker profile." ON public.tasker_profiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasker profile." ON public.tasker_profiles
FOR DELETE USING (auth.uid() = user_id);