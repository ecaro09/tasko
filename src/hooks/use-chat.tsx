import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  limit,
  where,
  or,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string
}

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user UIDs
  lastMessage?: string;
  lastMessageTimestamp?: string;
  // Add other chat room metadata as needed
}

interface UseChatContextType {
  messages: Message[];
  loadingMessages: boolean;
  errorMessages: string | null;
  sendMessage: (chatRoomId: string, text: string) => Promise<void>;
  // For now, we'll focus on a single chat room.
  // Later, we can add functions for fetching chat rooms, selecting active chat, etc.
}

const ChatContext = createContext<UseChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string | null>(null);

  // For simplicity, let's define a fixed chat room ID for "Tasko Support"
  // In a real app, chat rooms would be dynamically created/fetched.
  const TASK_SUPPORT_CHAT_ID = "tasko-support-chat"; // Example fixed chat room ID

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setMessages([]);
      setLoadingMessages(false);
      return;
    }

    setLoadingMessages(true);
    setErrorMessages(null);

    // Query for messages in the specific chat room
    const messagesCollectionRef = collection(db, 'chatRooms', TASK_SUPPORT_CHAT_ID, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(50)); // Fetch last 50 messages

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setErrorMessages("Failed to fetch messages.");
      setLoadingMessages(false);
      toast.error("Failed to load chat messages.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]); // Re-run when auth state changes

  const sendMessage = async (chatRoomId: string, text: string) => {
    if (!isAuthenticated || !user || !text.trim()) {
      toast.error("You must be logged in and provide a message to send.");
      return;
    }

    try {
      await addDoc(collection(db, 'chatRooms', chatRoomId, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous User",
        senderAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
        text: text.trim(),
        timestamp: serverTimestamp(),
      });
      // No toast.success here to avoid spamming for every message sent
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const value = {
    messages,
    loadingMessages,
    errorMessages,
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