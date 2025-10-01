import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  DocumentData,
  where,
  doc, // Added import
  updateDoc, // Added import
  getDocs, // Added import
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string
}

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of user display names
  lastMessage?: string;
  lastMessageTimestamp?: string;
  taskRef?: string; // Optional: reference to a task if the chat is task-specific
}

interface ChatContextType {
  messages: Message[];
  chatRooms: ChatRoom[];
  loadingMessages: boolean;
  loadingChatRooms: boolean;
  error: string | null;
  sendMessage: (chatRoomId: string, text: string) => Promise<void>;
  createChatRoom: (participantIds: string[], participantNames: string[], taskRef?: string) => Promise<string | null>;
  getChatRoomIdForParticipants: (participantIds: string[], taskRef?: string) => Promise<string | null>;
  getMessagesForChatRoom: (chatRoomId: string) => (() => void) | undefined; // Added to interface
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingChatRooms, setLoadingChatRooms] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms for the current user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setChatRooms([]);
      setLoadingChatRooms(false);
      return;
    }

    setLoadingChatRooms(true);
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChatRooms: ChatRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          taskRef: data.taskRef,
        };
      });
      setChatRooms(fetchedChatRooms);
      setLoadingChatRooms(false);
    }, (err) => {
      console.error("Error fetching chat rooms:", err);
      setError("Failed to fetch chat rooms.");
      setLoadingChatRooms(false);
      toast.error("Failed to load chat conversations.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Function to fetch messages for a specific chat room (called by ChatRoom component)
  const getMessagesForChatRoom = (chatRoomId: string) => {
    setLoadingMessages(true);
    const q = query(
      collection(db, `chatRooms/${chatRoomId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          chatRoomId: chatRoomId,
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
      console.error(`Error fetching messages for chat room ${chatRoomId}:`, err);
      setError("Failed to fetch messages.");
      setLoadingMessages(false);
      toast.error("Failed to load messages.");
    });

    return unsubscribe; // Return unsubscribe function for cleanup
  };

  const sendMessage = async (chatRoomId: string, text: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    if (!text.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      const messagesCollectionRef = collection(db, `chatRooms/${chatRoomId}/messages`);
      await addDoc(messagesCollectionRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous User",
        senderAvatar: user.photoURL || undefined,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      // Update the last message and timestamp on the chat room document
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
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

  const getChatRoomIdForParticipants = async (participantIds: string[], taskRef?: string): Promise<string | null> => {
    // Ensure participantIds are sorted for consistent querying
    const sortedParticipantIds = [...participantIds].sort();

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', '==', sortedParticipantIds),
      ...(taskRef ? [where('taskRef', '==', taskRef)] : []),
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  };

  const createChatRoom = async (participantIds: string[], participantNames: string[], taskRef?: string): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a chat room.");
      return null;
    }

    // Ensure participantIds are sorted for consistent creation
    const sortedParticipantIds = [...participantIds].sort();

    // Check if a chat room already exists for these participants (and task if specified)
    const existingChatRoomId = await getChatRoomIdForParticipants(sortedParticipantIds, taskRef);
    if (existingChatRoomId) {
      return existingChatRoomId;
    }

    try {
      const newChatRoomRef = await addDoc(collection(db, 'chatRooms'), {
        participants: sortedParticipantIds,
        participantNames: participantNames,
        lastMessage: "Chat started.",
        lastMessageTimestamp: serverTimestamp(),
        taskRef: taskRef || null,
      });
      toast.success("New chat started!");
      return newChatRoomRef.id;
    } catch (err: any) {
      console.error("Error creating chat room:", err);
      toast.error(`Failed to create chat room: ${err.message}`);
      return null;
    }
  };

  const value = {
    messages,
    chatRooms,
    loadingMessages,
    loadingChatRooms,
    error,
    sendMessage,
    createChatRoom,
    getChatRoomIdForParticipants,
    getMessagesForChatRoom, // Added to context value
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