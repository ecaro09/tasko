CREATE TABLE public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants UUID[] NOT NULL,
  participant_names TEXT[] NOT NULL,
  last_message TEXT,
  last_message_timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat rooms are viewable by participants." ON public.chat_rooms
FOR SELECT USING (auth.uid() = ANY(participants));

CREATE POLICY "Participants can create chat rooms." ON public.chat_rooms
FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

CREATE POLICY "Participants can update chat rooms." ON public.chat_rooms
FOR UPDATE USING (auth.uid() = ANY(participants));

CREATE POLICY "Participants can delete chat rooms." ON public.chat_rooms
FOR DELETE USING (auth.uid() = ANY(participants));