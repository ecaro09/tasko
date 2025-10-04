import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user_ids
  participantNames: string[]; // Array of display names
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  text: string;
  timestamp: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: ChatMessage[];
  loadingRooms: boolean;
  loadingMessages: boolean;
  error: string | null;
  createChatRoom: (participantIds: string[], participantNames: string[]) => Promise<string | null>;
  getMessagesForRoom: (roomId: string) => Promise<void>;
  sendMessage: (roomId: string, text: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);

  // Fetch chat rooms for the current user
  React.useEffect(() => {
    if (!isAuthenticated || !user) {
      setChatRooms([]);
      setLoadingRooms(false);
      return;
    }

    setLoadingRooms(true);
    setError(null);

    const fetchChatRooms = async () => {
      const { data, error: fetchError } = await supabase
        .from('chat_rooms')
        .select('*')
        .contains('participants', [user.id])
        .order('last_message_timestamp', { ascending: false });

      if (fetchError) {
        console.error("Error fetching chat rooms:", fetchError);
        setError("Failed to load chat rooms.");
        toast.error("Failed to load chat rooms.");
        setLoadingRooms(false);
        return;
      }

      const fetchedRooms: ChatRoom[] = data.map((item: any) => ({
        id: item.id,
        participants: item.participants,
        participantNames: item.participant_names,
        lastMessage: item.last_message || undefined,
        lastMessageTimestamp: item.last_message_timestamp ? new Date(item.last_message_timestamp).toISOString() : undefined,
        createdAt: new Date(item.created_at).toISOString(),
      }));
      setChatRooms(fetchedRooms);
      setLoadingRooms(false);
    };

    fetchChatRooms();

    // Set up real-time subscription for chat rooms
    const subscription = supabase
      .channel('public:chat_rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_rooms' }, payload => {
        console.log('Chat room change received!', payload);
        // Only re-fetch if the current user is a participant in the changed room
        if (payload.new?.participants?.includes(user.id) || payload.old?.participants?.includes(user.id)) {
          fetchChatRooms();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isAuthenticated, user, authLoading]);

  // Fetch messages for the active chat room
  React.useEffect(() => {
    if (!activeRoomId || !isAuthenticated || !user) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    const fetchMessages = async () => {
      const { data, error: fetchError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', activeRoomId)
        .order('timestamp', { ascending: true });

      if (fetchError) {
        console.error("Error fetching messages:", fetchError);
        setError("Failed to load messages.");
        toast.error("Failed to load messages.");
        setLoadingMessages(false);
        return;
      }

      const fetchedMessages: ChatMessage[] = data.map((item: any) => ({
        id: item.id,
        roomId: item.room_id,
        senderId: item.sender_id,
        text: item.text,
        timestamp: new Date(item.timestamp).toISOString(),
      }));
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    };

    fetchMessages();

    // Set up real-time subscription for chat messages in the active room
    const subscription = supabase
      .channel(`public:chat_messages:room_id=eq.${activeRoomId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${activeRoomId}` }, payload => {
        console.log('Chat message change received!', payload);
        fetchMessages(); // Re-fetch messages for the active room
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [activeRoomId, isAuthenticated, user]);

  const createChatRoom = async (participantIds: string[], participantNames: string[]): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a chat room.");
      return null;
    }

    // Check if a room already exists between these participants
    const { data: existingRooms, error: checkError } = await supabase
      .from('chat_rooms')
      .select('id, participants')
      .contains('participants', participantIds)
      .limit(1);

    if (checkError) {
      console.error("Error checking for existing chat rooms:", checkError);
      toast.error("Failed to check for existing chat rooms.");
      return null;
    }

    if (existingRooms && existingRooms.length > 0) {
      // Found an existing room, return its ID
      toast.info("Chat room already exists.");
      return existingRooms[0].id;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('chat_rooms')
        .insert({
          participants: participantIds,
          participant_names: participantNames,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      toast.success("Chat room created!");
      return data.id;
    } catch (err: any) {
      console.error("Error creating chat room:", err);
      toast.error(`Failed to create chat room: ${err.message}`);
      throw err;
    }
  };

  const getMessagesForRoom = async (roomId: string) => {
    setActiveRoomId(roomId); // Set active room to trigger message fetching
  };

  const sendMessage = async (roomId: string, text: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to send a message.");
      return;
    }
    if (!text.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          text: text,
        });

      if (insertError) throw insertError;

      // Update last message in chat room
      await supabase
        .from('chat_rooms')
        .update({
          last_message: text,
          last_message_timestamp: new Date().toISOString(),
        })
        .eq('id', roomId);

    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const value = {
    chatRooms,
    messages,
    loadingRooms,
    loadingMessages,
    error,
    createChatRoom,
    getMessagesForRoom,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};