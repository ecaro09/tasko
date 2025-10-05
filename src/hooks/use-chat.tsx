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
  getDoc, // <--- ADDED: Import getDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useTaskerProfile } from './use-tasker-profile';
import { supabase } from '@/integrations/supabase/client'; // Import supabase client for presence

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
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
  typingUsers?: string[]; // New field for typing indicator
  status: 'active' | 'closed'; // New: Status of the chat room
  onlineStatus?: Record<string, boolean>; // New: Online status of participants
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
  sendTypingStatus: (roomId: string, isTyping: boolean) => void; // New function
  updateChatRoomStatus: (roomId: string, status: ChatRoom['status']) => Promise<void>; // New function
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
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null); // For debouncing typing status
  const [onlineStatuses, setOnlineStatuses] = React.useState<Record<string, boolean>>({}); // New state for online statuses

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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRooms: ChatRoom[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          participants: data.participants,
          participantNames: data.participantNames,
          lastMessage: data.lastMessage,
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString(),
          typingUsers: data.typingUsers || [], // Include typingUsers
          status: data.status || 'active', // New: Include status, default to 'active'
        };
      });
      setChatRooms(fetchedRooms);
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

  // Subscribe to Supabase presence for participants in the selected room
  React.useEffect(() => {
    if (!selectedRoom || !isAuthenticated || !user) {
      setOnlineStatuses({});
      return;
    }

    const participantIds = selectedRoom.participants;
    const channel = supabase.channel(`room_presence_${selectedRoom.id}`);

    const subscription = channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const newOnlineStatuses: Record<string, boolean> = {};
        participantIds.forEach(pId => {
          newOnlineStatuses[pId] = newState[pId] && newState[pId].length > 0;
        });
        setOnlineStatuses(newOnlineStatuses);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.uid, online_at: new Date().toISOString() });
        }
      });

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [selectedRoom, isAuthenticated, user]);

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

      // Update last message in chat room and clear typing status
      const roomRef = doc(collection(db, 'chatRooms'), roomId);
      await updateDoc(roomRef, {
        lastMessage: text.trim(),
        lastMessageTimestamp: serverTimestamp(),
        typingUsers: chatRooms.find(room => room.id === roomId)?.typingUsers?.filter(uid => uid !== user.uid) || [],
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
      const existingRoomSnapshot = await getDocs(existingRoomQuery);

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
        typingUsers: [], // Initialize typingUsers
        status: 'active', // New: Initialize status as 'active'
      });
      toast.success("Chat room created!");
      return newRoomRef.id;
    } catch (err: any) {
      console.error("Error creating chat room:", err);
      toast.error(`Failed to create chat room: ${err.message}`);
      throw err;
    }
  };

  const sendTypingStatus = React.useCallback((roomId: string, isTyping: boolean) => {
    if (!user || !roomId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const updateTypingStatus = async () => {
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnap = await getDoc(roomRef);
      if (roomSnap.exists()) {
        const currentTypingUsers = (roomSnap.data()?.typingUsers || []) as string[];
        let newTypingUsers = [...currentTypingUsers];

        if (isTyping && !newTypingUsers.includes(user.uid)) {
          newTypingUsers.push(user.uid);
        } else if (!isTyping && newTypingUsers.includes(user.uid)) {
          newTypingUsers = newTypingUsers.filter(uid => uid !== user.uid);
        }

        if (newTypingUsers.length !== currentTypingUsers.length || newTypingUsers.some((uid, i) => uid !== currentTypingUsers[i])) {
          await updateDoc(roomRef, { typingUsers: newTypingUsers });
        }
      }
    };

    if (isTyping) {
      updateTypingStatus(); // Send typing status immediately
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStatus(roomId, false); // Stop typing after a delay
      }, 3000); // 3 seconds debounce
    } else {
      updateTypingStatus(); // Send not typing status
    }
  }, [user]);

  const updateChatRoomStatus = async (roomId: string, status: ChatRoom['status']) => {
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      await updateDoc(roomRef, { status: status, dateUpdated: serverTimestamp() });
      toast.success(`Chat room status updated to ${status}.`);
    } catch (err: any) {
      console.error("Error updating chat room status:", err);
      toast.error(`Failed to update chat room status: ${err.message}`);
      throw err;
    }
  };

  const chatRoomsWithOnlineStatus = React.useMemo(() => {
    return chatRooms.map(room => ({
      ...room,
      onlineStatus: onlineStatuses,
    }));
  }, [chatRooms, onlineStatuses]);

  const value = {
    chatRooms: chatRoomsWithOnlineStatus,
    messages,
    loadingRooms: loadingRooms || authLoading,
    loadingMessages,
    error,
    sendMessage,
    createChatRoom,
    fetchMessagesForRoom,
    sendTypingStatus,
    updateChatRoomStatus, // New: Expose updateChatRoomStatus
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