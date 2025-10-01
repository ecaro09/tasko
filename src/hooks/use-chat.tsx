import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { toast } from 'sonner';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  participants: string[]; // User IDs of participants
  participantNames: string[]; // Display names of participants
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount?: number;
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
    // Mock data loading
    setLoading(true);
    setError(null);

    if (isAuthenticated && user) {
      // Simulate fetching conversations for the current user
      const mockConversations: Conversation[] = [
        {
          id: 'conv1',
          participants: [user.uid, 'tasker1'],
          participantNames: [user.displayName || 'You', 'John Doe'],
          lastMessage: 'Hi, I can help with your cleaning task!',
          lastMessageTimestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          unreadCount: 1,
        },
        {
          id: 'conv2',
          participants: [user.uid, 'tasker2'],
          participantNames: [user.displayName || 'You', 'Jane Smith'],
          lastMessage: 'Okay, I will be there by 2 PM.',
          lastMessageTimestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        },
      ];

      // Simulate fetching messages for these conversations
      const mockMessages: Message[] = [
        {
          id: 'msg1-1', conversationId: 'conv1', senderId: 'tasker1', senderName: 'John Doe',
          text: 'Hi, I can help with your cleaning task!', timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'msg1-2', conversationId: 'conv1', senderId: user.uid, senderName: user.displayName || 'You',
          text: 'Great! What is your rate?', timestamp: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: 'msg2-1', conversationId: 'conv2', senderId: user.uid, senderName: user.displayName || 'You',
          text: 'Are you available for the assembly task tomorrow?', timestamp: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'msg2-2', conversationId: 'conv2', senderId: 'tasker2', senderName: 'Jane Smith',
          text: 'Yes, I am. Okay, I will be there by 2 PM.', timestamp: new Date(Date.now() - 7000000).toISOString(),
        },
      ];

      setConversations(mockConversations);
      setAllMessages(mockMessages);
    } else {
      setConversations([]);
      setAllMessages([]);
    }

    setLoading(false);
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

    setLoading(true);
    try {
      const newMessage: Message = {
        id: `mock-msg-${Date.now()}`,
        conversationId,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || undefined,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      setAllMessages(prev => [...prev, newMessage]);
      // Update last message in conversation
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: text.trim(), lastMessageTimestamp: newMessage.timestamp }
          : conv
      ));
      toast.success("Message sent!");
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      // Simulate checking for existing conversation
      const existingConv = conversations.find(conv =>
        conv.participants.length === participantIds.length + 1 &&
        conv.participants.every(p => [...participantIds, user.uid].includes(p))
      );

      if (existingConv) {
        toast.info("Conversation already exists. Redirecting...");
        return existingConv.id;
      }

      const newConversationId = `mock-conv-${Date.now()}`;
      const newConversation: Conversation = {
        id: newConversationId,
        participants: [...participantIds, user.uid],
        participantNames: [...participantNames, user.displayName || 'You'],
        lastMessage: initialMessage.trim(),
        lastMessageTimestamp: new Date().toISOString(),
        unreadCount: 0,
      };

      const firstMessage: Message = {
        id: `mock-msg-${Date.now()}-initial`,
        conversationId: newConversationId,
        senderId: user.uid,
        senderName: user.displayName || 'You',
        senderAvatar: user.photoURL || undefined,
        text: initialMessage.trim(),
        timestamp: new Date().toISOString(),
      };

      setConversations(prev => [...prev, newConversation]);
      setAllMessages(prev => [...prev, firstMessage]);
      toast.success("New conversation started!");
      return newConversationId;
    } catch (err: any) {
      console.error("Error starting new conversation:", err);
      toast.error(`Failed to start conversation: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    conversations,
    messages: allMessages, // Expose all messages for filtering
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