import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDocs,
  updateDoc,
  limit,
  DocumentData,
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth'; // Corrected import path

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string; // ISO string
}

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of user display names
  participantAvatars: (string | undefined)[]; // Array of user avatars
  taskRefId?: string; // Optional: ID of the task this chat is related to
  lastMessage?: string;
  lastMessageTimestamp?: string; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: Message[];
  selectedChatRoomId: string | null;
  loading: boolean;
  error: string | null;
  createOrGetChatRoom: (
    participantIds: string[],
    participantNames: string[],
    participantAvatars: (string | undefined)[],
    taskRefId?: string,
  ) => Promise<string | null>;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  selectChatRoom: (chatRoomId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch chat rooms for the current user
  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setChatRooms([]);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedChatRooms: ChatRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          participantAvatars: data.participantAvatars,
          taskRefId: data.taskRefId,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      setChatRooms(fetchedChatRooms);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching chat rooms:", err);
      setError("Failed to fetch chat rooms.");
      setLoading(false);
      toast.error("Failed to load chat rooms.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid]);

  // Fetch messages for the selected chat room
  useEffect(() => {
    if (!selectedChatRoomId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'chatRooms', selectedChatRoomId, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(50), // Limit to last 50 messages for performance
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          chatRoomId: selectedChatRoomId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          content: data.content,
          timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
        };
      });
      setMessages(fetchedMessages);
    }, (err) => {
      console.error("Error fetching messages:", err);
      toast.error("Failed to load messages.");
    });

    return () => unsubscribe();
  }, [selectedChatRoomId]);

  const createOrGetChatRoom = useCallback(async (
    participantIds: string[],
    participantNames: string[],
    participantAvatars: (string | undefined)[],
    taskRefId?: string,
  ): Promise<string | null> => {
    if (!isAuthenticated || !user?.uid) {
      toast.error("You must be logged in to create a chat room.");
      return null;
    }

    // Ensure current user is part of the participants
    if (!participantIds.includes(user.uid)) {
      participantIds.push(user.uid);
      participantNames.push(user.displayName || 'Anonymous');
      participantAvatars.push(user.photoURL || undefined);
    }

    // Sort participants to ensure consistent query for existing chat rooms
    const sortedParticipantIds = [...participantIds].sort();

    try {
      // Check if a chat room with these participants (and optional taskRefId) already exists
      const q = query(
        collection(db, 'chatRooms'),
        where('participants', '==', sortedParticipantIds),
        ...(taskRefId ? [where('taskRefId', '==', taskRefId)] : []),
        limit(1)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const existingRoomId = querySnapshot.docs[0].id;
        toast.info("Existing chat room found.");
        return existingRoomId;
      }

      // If not, create a new chat room
      const newRoomRef = await addDoc(collection(db, 'chatRooms'), {
        participants: sortedParticipantIds,
        participantNames,
        participantAvatars,
        taskRefId: taskRefId || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success("New chat room created!");
      return newRoomRef.id;
    } catch (err: any) {
      console.error("Error creating or getting chat room:", err);
      toast.error(`Failed to create or get chat room: ${err.message}`);
      return null;
    }
  }, [isAuthenticated, user?.uid, user?.displayName, user?.photoURL]);

  const sendMessage = useCallback(async (chatRoomId: string, content: string) => {
    if (!isAuthenticated || !user?.uid) {
      toast.error("You must be logged in to send a message.");
      return;
    }
    if (!content.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }

    try {
      const messagesCollectionRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messagesCollectionRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || null,
        content,
        timestamp: serverTimestamp(),
      });

      // Update the last message and timestamp on the chat room document
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessage: content,
        lastMessageTimestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
    }
  }, [isAuthenticated, user?.uid, user?.displayName, user?.photoURL]);

  const selectChatRoom = useCallback((chatRoomId: string | null) => {
    setSelectedChatRoomId(chatRoomId);
  }, []);

  const value = {
    chatRooms,
    messages,
    selectedChatRoomId,
    loading: loading || authLoading,
    error,
    createOrGetChatRoom,
    sendMessage,
    selectChatRoom,
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