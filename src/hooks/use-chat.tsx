import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  DocumentData,
  getDocs,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile'; // To get tasker display names

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of user display names
  participantAvatars: { [userId: string]: string | undefined }; // New: Map of userId to avatar URL
  lastMessage?: string;
  lastMessageTimestamp?: string;
  unreadCount?: { [userId: string]: number };
  createdAt: string;
  updatedAt: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  loadingConversations: boolean;
  loadingMessages: boolean;
  error: string | null;
  fetchMessages: (conversationId: string) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startNewConversation: (
    participantIds: string[],
    participantNames: string[],
    participantAvatars: { [userId: string]: string | undefined }, // New: Pass avatars
    initialMessageText?: string
  ) => Promise<string>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { taskerProfile, loading: taskerProfileLoading } = useTaskerProfile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  // Fetch conversations for the current user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConversations([]);
      setLoadingConversations(false);
      return;
    }

    setLoadingConversations(true);
    setError(null);

    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedConversations: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          participantAvatars: data.participantAvatars || {}, // Read participantAvatars
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          unreadCount: data.unreadCount || {},
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
        };
      });
      setConversations(fetchedConversations);
      setLoadingConversations(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations.");
      setLoadingConversations(false);
      toast.error("Failed to load conversations.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Fetch messages for the currently selected conversation
  useEffect(() => {
    if (!currentConversationId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    const q = query(
      collection(db, 'conversations', currentConversationId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString(),
        };
      });
      setMessages(fetchedMessages);
      setLoadingMessages(false);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages.");
      setLoadingMessages(false);
      toast.error("Failed to load messages.");
    });

    return () => unsubscribe();
  }, [currentConversationId]);

  const fetchMessages = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!isAuthenticated || !user || !text.trim()) {
      toast.error("You must be logged in and provide a message.");
      return;
    }

    try {
      const messageRef = collection(db, 'conversations', conversationId, 'messages');
      await addDoc(messageRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous",
        senderAvatar: user.photoURL || undefined, // Use current user's photoURL
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      const conversationData = conversationSnap.data() as Conversation;

      const updatedUnreadCount = { ...conversationData.unreadCount };
      conversationData.participants.forEach(participantId => {
        if (participantId !== user.uid) {
          updatedUnreadCount[participantId] = (updatedUnreadCount[participantId] || 0) + 1;
        }
      });

      await updateDoc(conversationRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
        unreadCount: updatedUnreadCount,
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const startNewConversation = async (
    participantIds: string[],
    participantNames: string[],
    participantAvatars: { [userId: string]: string | undefined }, // New parameter
    initialMessageText?: string
  ): Promise<string> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to start a conversation.");
      throw new Error("User not authenticated.");
    }

    const allParticipantIds = [...new Set([...participantIds, user.uid])].sort(); // Ensure current user is included and unique
    const allParticipantNames = [...new Set([...participantNames, user.displayName || user.email || "Anonymous"])];
    const allParticipantAvatars = { ...participantAvatars, [user.uid]: user.photoURL || undefined }; // Include current user's avatar

    // Check for existing conversation with the exact same participants
    const q = query(
      collection(db, 'conversations'),
      where('participants', '==', allParticipantIds)
    );
    const existingConversations = await getDocs(q);

    if (!existingConversations.empty) {
      const existingConversationId = existingConversations.docs[0].id;
      toast.info("Conversation already exists.");
      if (initialMessageText) {
        await sendMessage(existingConversationId, initialMessageText);
      }
      return existingConversationId;
    }

    try {
      const newConversationRef = await addDoc(collection(db, 'conversations'), {
        participants: allParticipantIds,
        participantNames: allParticipantNames,
        participantAvatars: allParticipantAvatars, // Store participant avatars
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: initialMessageText || "Conversation started.",
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: allParticipantIds.reduce((acc, id) => ({ ...acc, [id]: 0 }), {}),
      });

      if (initialMessageText) {
        await addDoc(collection(db, 'conversations', newConversationRef.id, 'messages'), {
          senderId: user.uid,
          senderName: user.displayName || user.email || "Anonymous",
          senderAvatar: user.photoURL || undefined,
          text: initialMessageText,
          timestamp: serverTimestamp(),
        });
      }

      toast.success("Conversation started!");
      return newConversationRef.id;
    } catch (err: any) {
      console.error("Error starting new conversation:", err);
      toast.error(`Failed to start conversation: ${err.message}`);
      throw err;
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!isAuthenticated || !user) return;

    try {
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      const conversationData = conversationSnap.data() as Conversation;

      if (conversationData && conversationData.unreadCount && conversationData.unreadCount[user.uid] > 0) {
        await updateDoc(conversationRef, {
          [`unreadCount.${user.uid}`]: 0,
        });
      }
    } catch (err) {
      console.error("Error marking conversation as read:", err);
    }
  };

  const value = {
    conversations,
    messages,
    loadingConversations: loadingConversations || authLoading,
    loadingMessages,
    error,
    fetchMessages,
    sendMessage,
    startNewConversation,
    markConversationAsRead,
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