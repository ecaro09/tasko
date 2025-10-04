CREATE TABLE public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat messages are viewable by room participants." ON public.chat_messages
FOR SELECT USING (EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND auth.uid() = ANY(participants)));

CREATE POLICY "Participants can send messages." ON public.chat_messages
FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND auth.uid() = ANY(participants)));

CREATE POLICY "Participants can update their own messages." ON public.chat_messages
FOR UPDATE USING (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND auth.uid() = ANY(participants)));

CREATE POLICY "Participants can delete their own messages." ON public.chat_messages
FOR DELETE USING (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = room_id AND auth.uid() = ANY(participants)));