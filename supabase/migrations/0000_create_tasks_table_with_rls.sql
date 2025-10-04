CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  budget NUMERIC NOT NULL,
  poster_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  poster_name TEXT NOT NULL,
  poster_avatar TEXT,
  date_posted TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'open' NOT NULL,
  image_url TEXT,
  assigned_tasker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_offer_id UUID, -- Will reference offers table
  rating NUMERIC,
  review TEXT,
  date_updated TIMESTAMP WITH TIME ZONE,
  date_completed TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tasks are viewable by everyone." ON public.tasks
FOR SELECT USING (true);

CREATE POLICY "Users can create their own tasks." ON public.tasks
FOR INSERT WITH CHECK (auth.uid() = poster_id);

CREATE POLICY "Users can update their own tasks." ON public.tasks
FOR UPDATE USING (auth.uid() = poster_id);

CREATE POLICY "Users can delete their own tasks." ON public.tasks
FOR DELETE USING (auth.uid() = poster_id);