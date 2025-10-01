import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, limit, QueryDocumentSnapshot, DocumentData, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'; // Added doc, getDoc, setDoc, updateDoc
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string
  recipientId: string; // Added recipientId to ChatMessage
}

// New interface for ChatRoom document
export interface ChatRoomDoc {
  id: string; // Same as conversationId
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of display names
  lastMessage?: string;
  lastMessageTimestamp?: string;
  taskId?: string; // Optional: link to a task
  dateCreated: string;
}

interface ChatContextType {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  sendMessage: (conversationId: string, recipientId: string, text: string) => Promise<void>;
  getConversationId: (userId1: string, userId2: string) => string;
  createChatRoom: (participantIds: string[], participantNames: string[], taskId?: string) => Promise<string>; // Added createChatRoom
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to generate a consistent conversation ID between two users
  const getConversationId = (userId1: string, userId2: string): string => {
    const sortedIds = [userId1, userId2].sort();
    return sortedIds.join('_');
  };

  // Function to create or get a chat room
  const createChatRoom = async (participantIds: string[], participantNames: string[], taskId?: string): Promise<string> => {
    if (participantIds.length !== 2) {
      toast.error("Chat room must have exactly two participants.");
      throw new Error("Invalid participant count.");
    }

    const conversationId = getConversationId(participantIds[0], participantIds[1]);
    const chatRoomRef = doc(db, 'chatRooms', conversationId);

    try {
      const chatRoomSnap = await getDoc(chatRoomRef);

      if (!chatRoomSnap.exists()) {
        // Create new chat room
        const newChatRoom: Omit<ChatRoomDoc, 'dateCreated'> & { dateCreated: any } = { // Use any for serverTimestamp
          id: conversationId,
          participants: participantIds,
          participantNames: participantNames,
          taskId: taskId,
          dateCreated: serverTimestamp(),
        };
        await setDoc(chatRoomRef, newChatRoom);
        toast.success("New chat room created!");
      }
      return conversationId;
    } catch (err: any) {
      console.error("Error creating/getting chat room:", err);
      toast.error(`Failed to create/get chat room: ${err.message}`);
      throw err;
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Listen to all messages where the current user is either sender or recipient
    // This is a simplified approach. For a large app, you'd listen to specific chatRooms.
    const messagesCollectionRef = collection(db, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
          recipientId: data.recipientId, // Include recipientId
        };
      }).filter(msg => msg.senderId === user.uid || msg.recipientId === user.uid); // Filter messages relevant to current user
      setMessages(fetchedMessages);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages.");
      setLoading(false);
      toast.error("Failed to load chat messages.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  const sendMessage = async (conversationId: string, recipientId: string, text: string) => {
    if (!isAuthenticated || !user || !text.trim()) {
      toast.error("You must be logged in and provide a message to send.");
      return;
    }

    try {
      await addDoc(collection(db, 'messages'), {
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous User",
        senderAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
        recipientId: recipientId,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      // Optionally update the lastMessage in the chatRoom document
      const chatRoomRef = doc(db, 'chatRooms', conversationId);
      await updateDoc(chatRoomRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });

    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const value = {
    messages,
    loading,
    error,
    sendMessage,
    getConversationId,
    createChatRoom, // Added to context value
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