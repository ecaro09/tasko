import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import {
  Message,
  ChatRoom,
  createChatRoomFirestore,
  addMessageFirestore,
  subscribeToChatMessages,
  fetchChatRoomsForUserFirestore,
} from '@/lib/chat-firestore';
import { loadChatMessagesFromCache, saveChatMessagesToCache, clearChatMessagesCache } from '@/lib/chat-local-cache'; // Import caching utilities

// Re-export ChatRoom and Message interfaces
export { ChatRoom, Message } from '@/lib/chat-firestore';

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: Message[];
  loadingRooms: boolean;
  loadingMessages: boolean;
  error: string | null;
  createChatRoom: (participantIds: string[], participantNames: string[]) => Promise<string | null>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  fetchMessagesForRoom: (roomId: string) => void; // Function to trigger message fetching/subscription
  clearCurrentRoomMessages: () => void; // Function to clear messages for the current room
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);

  // Effect to fetch chat rooms for the authenticated user
  React.useEffect(() => {
    if (isAuthenticated && user) {
      setLoadingRooms(true);
      setError(null);
      const fetchRooms = async () => {
        try {
          const fetchedRooms = await fetchChatRoomsForUserFirestore(user.uid);
          setChatRooms(fetchedRooms);
        } catch (err: any) {
          setError(err.message || "Failed to load chat rooms.");
          toast.error(`Failed to load chat rooms: ${err.message}`);
        } finally {
          setLoadingRooms(false);
        }
      };
      fetchRooms();
    } else {
      setChatRooms([]);
      setLoadingRooms(false);
    }
  }, [isAuthenticated, user]);

  // Effect to subscribe to messages for the active room
  React.useEffect(() => {
    if (activeRoomId) {
      setLoadingMessages(true);
      setError(null);

      // Load from cache immediately
      const cachedMessages = loadChatMessagesFromCache(activeRoomId);
      if (cachedMessages.length > 0) {
        setMessages(cachedMessages);
        setLoadingMessages(false);
        console.log(`Messages for room ${activeRoomId} loaded from cache.`);
      } else {
        setLoadingMessages(true); // Only show loading if cache is empty
      }

      const unsubscribe = subscribeToChatMessages(
        activeRoomId,
        (fetchedMessages) => {
          setMessages(fetchedMessages);
          setLoadingMessages(false);
        },
        (errMessage) => {
          setError(errMessage);
          setLoadingMessages(false);
          toast.error(errMessage);
        }
      );
      return () => {
        unsubscribe();
        setMessages([]); // Clear messages when leaving a room
        clearChatMessagesCache(activeRoomId); // Clear cache for the room when unsubscribing
      };
    } else {
      setMessages([]);
      setLoadingMessages(false);
    }
  }, [activeRoomId]);

  const createChatRoom = useCallback(async (participantIds: string[], participantNames: string[]): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a chat room.");
      return null;
    }
    try {
      const roomId = await createChatRoomFirestore(participantIds, participantNames);
      // Re-fetch chat rooms to update the list
      const fetchedRooms = await fetchChatRoomsForUserFirestore(user.uid);
      setChatRooms(fetchedRooms);
      return roomId;
    } catch (err) {
      // Error handled by createChatRoomFirestore
      return null;
    }
  }, [isAuthenticated, user]);

  const sendMessage = useCallback(async (roomId: string, content: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to send a message.");
      return;
    }
    if (!content.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    try {
      await addMessageFirestore(roomId, content, user);
      // The onSnapshot listener will update the messages state and cache
    } catch (err) {
      // Error handled by addMessageFirestore
    }
  }, [isAuthenticated, user]);

  const fetchMessagesForRoom = useCallback((roomId: string) => {
    setActiveRoomId(roomId);
  }, []);

  const clearCurrentRoomMessages = useCallback(() => {
    setMessages([]);
    setActiveRoomId(null);
  }, []);

  const value = {
    chatRooms,
    messages,
    loadingRooms,
    loadingMessages,
    error,
    createChatRoom,
    sendMessage,
    fetchMessagesForRoom,
    clearCurrentRoomMessages,
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