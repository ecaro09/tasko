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
  getDocs,
  limit,
  DocumentData,
  updateDoc, // Added updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of user display names
  participantAvatars: (string | undefined)[]; // Array of user avatars
  lastMessage?: string;
  lastMessageTimestamp?: string;
  taskId?: string; // Optional: link to a specific task
  dateCreated: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: Message[];
  loadingChats: boolean;
  loadingMessages: boolean;
  error: string | null;
  getOrCreateChat: (
    otherUserId: string,
    otherUserName: string,
    otherUserAvatar?: string,
    taskId?: string,
  ) => Promise<ChatRoom | null>;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  selectChat: (chatId: string) => void;
  selectedChatId: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms for the current user
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setChatRooms([]);
      setLoadingChats(false);
      return;
    }

    setLoadingChats(true);
    setError(null);

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChats: ChatRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          participantAvatars: data.participantAvatars,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          taskId: data.taskId,
          dateCreated: data.dateCreated?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      setChatRooms(fetchedChats);
      setLoadingChats(false);
    }, (err) => {
      console.error("Error fetching chat rooms:", err);
      setError("Failed to load chat rooms.");
      setLoadingChats(false);
      toast.error("Failed to load chat rooms.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user]);

  // Fetch messages for the selected chat
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    const q = query(
      collection(db, 'chats', selectedChatId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50), // Limit to last 50 messages for performance
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          chatId: selectedChatId,
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
  }, [selectedChatId]);

  const getOrCreateChat = async (
    otherUserId: string,
    otherUserName: string,
    otherUserAvatar?: string,
    taskId?: string,
  ): Promise<ChatRoom | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to start a chat.");
      return null;
    }

    const currentUserId = user.uid;
    const currentUserName = user.displayName || user.email || "You";
    const currentUserAvatar = user.photoURL || undefined;

    // Check if a chat already exists between these two users for this task (if taskId is provided)
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUserId),
      where('participants', 'array-contains', otherUserId),
      where('taskId', '==', taskId || null), // Match taskId or null if not provided
    );

    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const existingChat = querySnapshot.docs[0].data() as DocumentData;
        const chatRoom: ChatRoom = {
          id: querySnapshot.docs[0].id,
          participants: existingChat.participants,
          participantNames: existingChat.participantNames,
          participantAvatars: existingChat.participantAvatars,
          lastMessage: existingChat.lastMessage,
          lastMessageTimestamp: existingChat.lastMessageTimestamp?.toDate().toISOString(),
          taskId: existingChat.taskId,
          dateCreated: existingChat.dateCreated?.toDate().toISOString(),
        };
        setSelectedChatId(chatRoom.id);
        return chatRoom;
      }

      // If no chat exists, create a new one
      const newChatData = {
        participants: [currentUserId, otherUserId].sort(), // Keep consistent order
        participantNames: [currentUserName, otherUserName].sort(),
        participantAvatars: [currentUserAvatar, otherUserAvatar].sort(),
        dateCreated: serverTimestamp(),
        lastMessage: "Chat started.",
        lastMessageTimestamp: serverTimestamp(),
        taskId: taskId || null,
      };
      const docRef = await addDoc(collection(db, 'chats'), newChatData);
      toast.success("New chat started!");
      const newChatRoom: ChatRoom = {
        id: docRef.id,
        participants: newChatData.participants,
        participantNames: newChatData.participantNames,
        participantAvatars: newChatData.participantAvatars,
        lastMessage: newChatData.lastMessage,
        lastMessageTimestamp: new Date().toISOString(),
        taskId: newChatData.taskId || undefined,
        dateCreated: new Date().toISOString(),
      };
      setSelectedChatId(newChatRoom.id);
      return newChatRoom;
    } catch (err: any) {
      console.error("Error getting or creating chat:", err);
      toast.error(`Failed to start chat: ${err.message}`);
      setError(`Failed to start chat: ${err.message}`);
      return null;
    }
  };

  const sendMessage = async (chatId: string, text: string) => {
    if (!isAuthenticated || !user || !chatId || !text.trim()) {
      toast.error("Cannot send empty message or not logged in.");
      return;
    }

    try {
      const chatRef = doc(db, 'chats', chatId);
      await addDoc(collection(chatRef, 'messages'), {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous",
        senderAvatar: user.photoURL || undefined,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      // Update last message in chat room
      await updateDoc(chatRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      setError(`Failed to send message: ${err.message}`);
    }
  };

  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const value = {
    chatRooms,
    messages,
    loadingChats: loadingChats || authLoading,
    loadingMessages,
    error,
    getOrCreateChat,
    sendMessage,
    selectChat,
    selectedChatId,
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