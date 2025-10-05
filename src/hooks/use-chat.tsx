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
  or,
  limit,
  doc, // Import doc
  updateDoc, // Import updateDoc
  getDocs, // Import getDocs
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client
import { fetchUserProfileSupabase, UserProfile } from '@/lib/user-profile-supabase'; // Import UserProfile interface

export interface ChatMessage {
  id: string;
  roomId: string;
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
  participantAvatars?: (string | null)[]; // Array of participant avatar URLs
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: ChatMessage[];
  loadingRooms: boolean;
  loadingMessages: boolean;
  error: string | null;
  sendMessage: (roomId: string, text: string) => Promise<void>;
  createChatRoom: (participantIds: string[], participantNames: string[]) => Promise<string | null>;
  fetchMessagesForRoom: (roomId: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { taskerProfile, loading: taskerProfileLoading } = useTaskerProfile();
  const [chatRooms, setChatRooms] = React.useState<ChatRoom[]>([]);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentRoomId, setCurrentRoomId] = React.useState<string | null>(null);

  // Fetch chat rooms for the current user
  React.useEffect(() => {
    if (!isAuthenticated || !user || authLoading) {
      setChatRooms([]);
      setLoadingRooms(false);
      return;
    }

    setLoadingRooms(true);
    setError(null);

    const roomsCollectionRef = collection(db, 'chatRooms');
    const q = query(
      roomsCollectionRef,
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => { // Make callback async
      const fetchedRooms: ChatRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString(),
          // participantAvatars will be populated below
        };
      });

      // Collect all unique participant UIDs from all rooms
      const allParticipantIds = new Set<string>();
      fetchedRooms.forEach(room => {
        room.participants.forEach(id => allParticipantIds.add(id));
      });

      // Fetch all unique profiles from Supabase
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, avatar_url')
        .in('id', Array.from(allParticipantIds));

      if (profilesError) {
        console.error("Error fetching participant profiles from Supabase:", profilesError);
        toast.error("Failed to load participant avatars.");
      }

      const profileMap = new Map<string, string | null>();
      profilesData?.forEach(p => profileMap.set(p.id, p.avatar_url));

      // Map avatars back to rooms
      const roomsWithAvatars = fetchedRooms.map(room => ({
        ...room,
        participantAvatars: room.participants.map(id => profileMap.get(id) || null),
      }));

      setChatRooms(roomsWithAvatars);
      setLoadingRooms(false);
    }, (err) => {
      console.error("Error fetching chat rooms:", err);
      setError("Failed to fetch chat rooms.");
      setLoadingRooms(false);
      toast.error("Failed to load chat rooms.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user, authLoading]);

  // Fetch messages for the currently selected chat room
  React.useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError(null);

    const messagesCollectionRef = collection(db, 'chatRooms', currentRoomId, 'messages');
    const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          roomId: currentRoomId,
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
      setError("Failed to fetch messages.");
      setLoadingMessages(false);
      toast.error("Failed to load messages.");
    });

    return () => unsubscribe();
  }, [currentRoomId]);

  const fetchMessagesForRoom = (roomId: string) => {
    setCurrentRoomId(roomId);
  };

  const sendMessage = async (roomId: string, text: string) => {
    if (!isAuthenticated || !user || !text.trim()) {
      toast.error("You must be logged in and provide a message.");
      return;
    }

    try {
      const messagesCollectionRef = collection(db, 'chatRooms', roomId, 'messages');
      await addDoc(messagesCollectionRef, {
        senderId: user.uid,
        senderName: user.displayName || user.email || "Anonymous",
        senderAvatar: user.photoURL || undefined,
        text: text.trim(),
        timestamp: serverTimestamp(),
      });

      // Update last message in chat room
      const roomRef = doc(collection(db, 'chatRooms'), roomId); // Fixed: Use doc function
      await updateDoc(roomRef, { // Fixed: Use updateDoc function
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
      });

    } catch (err: any) {
      console.error("Error sending message:", err);
      toast.error(`Failed to send message: ${err.message}`);
      throw err;
    }
  };

  const createChatRoom = async (participantIds: string[], participantNames: string[]): Promise<string | null> => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a chat room.");
      return null;
    }
    if (!participantIds.includes(user.uid)) {
      participantIds.push(user.uid);
      participantNames.push(user.displayName || user.email || "Anonymous");
    }
    participantIds.sort(); // Ensure consistent order for querying

    try {
      const roomsCollectionRef = collection(db, 'chatRooms');
      // Check if a room with these participants already exists
      const existingRoomQuery = query(
        roomsCollectionRef,
        where('participants', '==', participantIds),
        limit(1)
      );
      const existingRoomSnapshot = await getDocs(existingRoomQuery); // Fixed: getDocs is now imported

      if (!existingRoomSnapshot.empty) {
        const existingRoomId = existingRoomSnapshot.docs[0].id;
        toast.info("Chat room already exists.");
        return existingRoomId;
      }

      const newRoomRef = await addDoc(roomsCollectionRef, {
        participants: participantIds,
        participantNames: participantNames,
        createdAt: serverTimestamp(),
        lastMessage: "New chat started.",
        lastMessageTimestamp: serverTimestamp(),
      });
      toast.success("Chat room created!");
      return newRoomRef.id;
    } catch (err: any) {
      console.error("Error creating chat room:", err);
      toast.error(`Failed to create chat room: ${err.message}`);
      throw err;
    }
  };

  const value = {
    chatRooms,
    messages,
    loadingRooms: loadingRooms || authLoading,
    loadingMessages,
    error,
    sendMessage,
    createChatRoom,
    fetchMessagesForRoom,
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