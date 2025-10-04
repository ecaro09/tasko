CREATE TABLE public.offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tasker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tasker_name TEXT NOT NULL,
  tasker_avatar TEXT,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  offer_amount NUMERIC NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  date_created TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_updated TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Offers are viewable by participants." ON public.offers
FOR SELECT USING (auth.uid() = tasker_id OR auth.uid() = client_id);

CREATE POLICY "Taskers can create offers." ON public.offers
FOR INSERT WITH CHECK (auth.uid() = tasker_id);

CREATE POLICY "Taskers can update their own offers." ON public.offers
FOR UPDATE USING (auth.uid() = tasker_id);

CREATE POLICY "Clients can update offers on their tasks." ON public.offers
FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "Taskers can delete their own offers." ON public.offers
FOR DELETE USING (auth.uid() = tasker_id);