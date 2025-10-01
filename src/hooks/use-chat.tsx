import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase'; // Import Firebase db
import { collection, addDoc, query, where, onSnapshot, serverTimestamp, orderBy, doc, getDocs } from 'firebase/firestore';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs of participants
  participantNames: string[]; // Display names of participants
  lastMessage: string;
  lastMessageTimestamp: string; // ISO string
  unreadCount?: { [key: string]: number }; // Object to store unread count per participant
}

interface ChatContextType {
  conversations: Conversation[];
  messages: Message[];
  loading: boolean;
  error: string | null;
  getMessagesForConversation: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  startNewConversation: (participantIds: string[], participantNames: string[], initialMessage: string) => Promise<string>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setConversations([]);
      setAllMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const conversationsCollectionRef = collection(db, 'conversations');
    const qConversations = query(
      conversationsCollectionRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribeConversations = onSnapshot(qConversations, (snapshot) => {
      const fetchedConversations: Conversation[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString() || new Date().toISOString(),
          unreadCount: data.unreadCount || {},
        };
      });
      setConversations(fetchedConversations);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching conversations:", err);
      setError("Failed to fetch conversations.");
      setLoading(false);
      toast.error("Failed to load conversations.");
    });

    const messagesCollectionRef = collection(db, 'messages');
    const qMessages = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(qMessages, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          conversationId: data.conversationId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      setAllMessages(fetchedMessages);
    }, (err) => {
      console.error("Error fetching messages:", err);
      setError("Failed to fetch messages.");
      toast.error("Failed to load messages.");
    });

    return () => {
      unsubscribeConversations();
      unsubscribeMessages();
    };
  }, [isAuthenticated, user]);

  const getMessagesForConversation = (conversationId: string): Message[] => {
    return allMessages.filter(msg => msg.conversationId === conversationId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  const sendMessage = async (conversationId: string, text: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to send messages.");
      return;
    }
    if (!text.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      const messagesCollectionRef = collection(db, 'messages');
      await addDoc(messagesCollectionRef, {
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || undefined,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      // Update last message and unread count in conversation
      const conversationRef = doc(db, 'conversations', conversationId);
      const currentConversation = conversations.find(conv => conv.id === conversationId);

      if (currentConversation) {
        const newUnreadCount = { ...currentConversation.unreadCount };
        currentConversation.participants.forEach(pId => {
          if (pId !== user.uid) {
            newUnreadCount[pId] = (newUnreadCount[pId] || 0) + 1;
          } else {
            newUnreadCount[pId] = 0; // Reset sender's unread count
          }
        });

        await addDoc(collection(db, 'conversations'), {
          ...currentConversation,
          lastMessage: text.trim(),
          lastMessageTimestamp: serverTimestamp(),
          unreadCount: newUnreadCount,
        });
      }

      toast.success("Message sent!");
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const startNewConversation = async (participantIds: string[], participantNames: string[], initialMessage: string): Promise<string> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to start a conversation.");
      throw new Error("Not authenticated.");
    }
    if (participantIds.length < 1 || !initialMessage.trim()) {
      toast.error("Invalid participants or empty message.");
      throw new Error("Invalid input.");
    }

    try {
      const allParticipants = [...participantIds, user.uid].sort(); // Sort to ensure consistent order
      const allParticipantNames = [...participantNames, user.displayName || 'You'];

      // Check for existing conversation
      const conversationsCollectionRef = collection(db, 'conversations');
      const q = query(conversationsCollectionRef, where('participants', '==', allParticipants));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingConvId = querySnapshot.docs[0].id;
        toast.info("Conversation already exists. Redirecting...");
        return existingConvId;
      }

      // Create new conversation
      const newConversationData = {
        participants: allParticipants,
        participantNames: allParticipantNames,
        lastMessage: initialMessage.trim(),
        lastMessageTimestamp: serverTimestamp(),
        unreadCount: allParticipants.reduce((acc, pId) => ({ ...acc, [pId]: pId === user.uid ? 0 : 1 }), {}),
      };
      const convDocRef = await addDoc(conversationsCollectionRef, newConversationData);
      const newConversationId = convDocRef.id;

      // Add initial message
      const messagesCollectionRef = collection(db, 'messages');
      await addDoc(messagesCollectionRef, {
        conversationId: newConversationId,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || undefined,
        text: initialMessage.trim(),
        timestamp: serverTimestamp(),
      });

      toast.success("New conversation started!");
      return newConversationId;
    } catch (err: any) {
      console.error("Error starting new conversation:", err);
      toast.error(`Failed to start conversation: ${err.message}`);
      throw err;
    }
  };

  const value = {
    conversations,
    messages: allMessages,
    loading,
    error,
    getMessagesForConversation,
    sendMessage,
    startNewConversation,
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