"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { db, auth } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  where,
  getDocs,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { showSuccess, showError } from '@/utils/toast'; // Import toast utilities

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string | null;
  content: string;
  timestamp: number; // Unix timestamp
}

export interface ChatRoom {
  id: string;
  participants: string[]; // UIDs of participants
  participantNames: string[]; // Display names of participants
  participantAvatars: (string | null)[]; // Avatars of participants
  lastMessage: string | null;
  lastMessageTimestamp: number | null;
  createdAt: number;
}

interface ChatContextType {
  chatRooms: ChatRoom[];
  messages: Message[];
  selectedChatRoomId: string | null;
  selectChatRoom: (chatRoomId: string) => void;
  sendMessage: (chatRoomId: string, content: string) => Promise<void>;
  createChatRoom: (otherUserId: string, otherUserName: string, otherUserAvatar: string | null) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setChatRooms([]);
      setMessages([]);
      setSelectedChatRoomId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(chatRoomsRef, where('participants', 'array-contains', user.uid), orderBy('lastMessageTimestamp', 'desc'));

    const unsubscribeChatRooms = onSnapshot(
      q,
      (snapshot) => {
        const rooms: ChatRoom[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            participants: data.participants,
            participantNames: data.participantNames,
            participantAvatars: data.participantAvatars,
            lastMessage: data.lastMessage || null,
            lastMessageTimestamp: data.lastMessageTimestamp?.toMillis() || null,
            createdAt: data.createdAt?.toMillis() || Date.now(),
          };
        });
        setChatRooms(rooms);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching chat rooms:", err);
        setError("Failed to load chat rooms.");
        setLoading(false);
      }
    );

    return () => unsubscribeChatRooms();
  }, [user]);

  useEffect(() => {
    if (!selectedChatRoomId) {
      setMessages([]);
      return;
    }

    const messagesRef = collection(db, 'chatRooms', selectedChatRoomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribeMessages = onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            chatRoomId: selectedChatRoomId,
            senderId: data.senderId,
            senderName: data.senderName,
            senderAvatar: data.senderAvatar || null,
            content: data.content,
            timestamp: data.timestamp?.toMillis() || Date.now(),
          };
        });
        setMessages(msgs);
      },
      (err) => {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages.");
      }
    );

    return () => unsubscribeMessages();
  }, [selectedChatRoomId]);

  const selectChatRoom = useCallback((chatRoomId: string) => {
    setSelectedChatRoomId(chatRoomId);
  }, []);

  const sendMessage = useCallback(async (chatRoomId: string, content: string) => {
    if (!user) {
      showError("You must be logged in to send messages.");
      return;
    }
    try {
      const messageRef = collection(db, 'chatRooms', chatRoomId, 'messages');
      await addDoc(messageRef, {
        senderId: user.uid,
        senderName: user.displayName || 'Anonymous',
        senderAvatar: user.photoURL || null,
        content,
        timestamp: serverTimestamp(),
      });

      // Update last message in chat room
      const chatRoomRef = doc(db, 'chatRooms', chatRoomId);
      await updateDoc(chatRoomRef, {
        lastMessage: content,
        lastMessageTimestamp: serverTimestamp(),
      });
      showSuccess("Message sent!"); // Success toast
    } catch (err) {
      console.error("Error sending message:", err);
      showError("Failed to send message."); // Error toast
    }
  }, [user]);

  const createChatRoom = useCallback(async (otherUserId: string, otherUserName: string, otherUserAvatar: string | null) => {
    if (!user) {
      showError("You must be logged in to create chat rooms.");
      return null;
    }

    // Check if a chat room already exists between these two users
    const q1 = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', user.uid),
      where('participants', 'array-contains', otherUserId)
    );
    const existingRoomsSnapshot = await getDocs(q1);

    if (!existingRoomsSnapshot.empty) {
      const existingRoomId = existingRoomsSnapshot.docs[0].id;
      showSuccess("Chat room already exists!");
      return existingRoomId;
    }

    try {
      const newChatRoomRef = await addDoc(collection(db, 'chatRooms'), {
        participants: [user.uid, otherUserId],
        participantNames: [user.displayName || 'Anonymous', otherUserName],
        participantAvatars: [user.photoURL || null, otherUserAvatar],
        lastMessage: null,
        lastMessageTimestamp: null,
        createdAt: serverTimestamp(),
      });
      showSuccess("Chat room created!");
      return newChatRoomRef.id;
    } catch (err) {
      console.error("Error creating chat room:", err);
      showError("Failed to create chat room.");
      return null;
    }
  }, [user]);

  const value = React.useMemo(
    () => ({
      chatRooms,
      messages,
      selectedChatRoomId,
      selectChatRoom,
      sendMessage,
      createChatRoom,
      loading,
      error,
    }),
    [chatRooms, messages, selectedChatRoomId, selectChatRoom, sendMessage, createChatRoom, loading, error]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = React.useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};