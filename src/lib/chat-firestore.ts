import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  doc,
  getDoc,
  setDoc,
  where,
  getDocs, // Added getDocs
  updateDoc, // Added updateDoc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { saveChatMessagesToCache, loadChatMessagesFromCache } from './chat-local-cache'; // Import caching utilities

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
}

export interface ChatRoom {
  id: string;
  participants: string[]; // Array of user UIDs
  participantNames: string[]; // Array of user display names
  lastMessage?: string;
  lastMessageTimestamp?: string;
  createdAt: string;
}

export const createChatRoomFirestore = async (
  participantIds: string[],
  participantNames: string[]
): Promise<string> => {
  try {
    // Check if a chat room with these participants already exists
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains-any', participantIds)
    );
    const querySnapshot = await getDocs(q);

    let existingRoomId: string | null = null;
    querySnapshot.forEach(doc => {
      const room = doc.data() as ChatRoom;
      // Check if all participants match (order-independent)
      if (room.participants.length === participantIds.length &&
          room.participants.every(p => participantIds.includes(p))) {
        existingRoomId = doc.id;
      }
    });

    if (existingRoomId) {
      toast.info("Chat room already exists.");
      return existingRoomId;
    }

    const docRef = await addDoc(collection(db, 'chatRooms'), {
      participants: participantIds,
      participantNames: participantNames,
      createdAt: serverTimestamp(),
    });
    toast.success("Chat room created!");
    return docRef.id;
  } catch (err: any) {
    console.error("Error creating chat room:", err);
    toast.error(`Failed to create chat room: ${err.message}`);
    throw err;
  }
};

export const addMessageFirestore = async (
  roomId: string,
  messageContent: string,
  user: FirebaseUser
) => {
  try {
    const messagesCollectionRef = collection(db, 'chatRooms', roomId, 'messages');
    const docRef = await addDoc(messagesCollectionRef, {
      senderId: user.uid,
      senderName: user.displayName || user.email || "Anonymous",
      senderAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/3.jpg",
      content: messageContent,
      timestamp: serverTimestamp(),
    });

    // Update the last message in the chat room
    const chatRoomRef = doc(db, 'chatRooms', roomId);
    await updateDoc(chatRoomRef, {
      lastMessage: messageContent,
      lastMessageTimestamp: serverTimestamp(),
    });

    // Optimistically update local cache
    const newMessage: Message = {
      id: docRef.id,
      senderId: user.uid,
      senderName: user.displayName || user.email || "Anonymous",
      senderAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/3.jpg",
      content: messageContent,
      timestamp: new Date().toISOString(), // Use current date for optimistic update
    };
    const currentMessages = loadChatMessagesFromCache(roomId);
    saveChatMessagesToCache(roomId, [...currentMessages, newMessage]); // Corrected call

  } catch (err: any) {
    console.error("Error sending message:", err);
    toast.error(`Failed to send message: ${err.message}`);
    throw err;
  }
};

export const subscribeToChatMessages = (
  roomId: string,
  callback: (messages: Message[]) => void,
  onError: (error: string) => void
) => {
  const messagesCollectionRef = collection(db, 'chatRooms', roomId, 'messages');
  const q = query(messagesCollectionRef, orderBy('timestamp', 'asc'));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const fetchedMessages: Message[] = snapshot.docs.map((doc) => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        senderId: data.senderId,
        senderName: data.senderName,
        senderAvatar: data.senderAvatar,
        content: data.content,
        timestamp: data.timestamp?.toDate().toISOString() || new Date().toISOString(),
      };
    });
    saveChatMessagesToCache(roomId, fetchedMessages); // Update cache with fresh data
    callback(fetchedMessages);
  }, (err) => {
    console.error("Error fetching chat messages:", err);
    onError("Failed to fetch chat messages.");
  });

  return unsubscribe;
};

export const fetchChatRoomsForUserFirestore = async (userId: string): Promise<ChatRoom[]> => {
  try {
    const q = query(
      collection(db, 'chatRooms'),
      where('participants', 'array-contains', userId),
      orderBy('lastMessageTimestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const chatRooms: ChatRoom[] = querySnapshot.docs.map(doc => {
      const data = doc.data() as DocumentData;
      return {
        id: doc.id,
        participants: data.participants,
        participantNames: data.participantNames,
        lastMessage: data.lastMessage || undefined,
        lastMessageTimestamp: data.lastMessageTimestamp?.toDate().toISOString() || undefined,
        createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
      };
    });
    return chatRooms;
  } catch (err: any) {
    console.error("Error fetching chat rooms for user:", err);
    toast.error(`Failed to load chat rooms: ${err.message}`);
    throw err;
  }
};