import { Message } from './chat-firestore';

const CHAT_MESSAGES_CACHE_PREFIX = 'chat_messages_cache_';

export const saveChatMessagesToCache = (roomId: string, messages: Message[]) => {
  try {
    localStorage.setItem(`${CHAT_MESSAGES_CACHE_PREFIX}${roomId}`, JSON.stringify(messages));
  } catch (error) {
    console.error(`Error saving chat messages for room ${roomId} to local storage:`, error);
  }
};

export const loadChatMessagesFromCache = (roomId: string): Message[] => {
  try {
    const cachedMessages = localStorage.getItem(`${CHAT_MESSAGES_CACHE_PREFIX}${roomId}`);
    return cachedMessages ? JSON.parse(cachedMessages) : [];
  } catch (error) {
    console.error(`Error loading chat messages for room ${roomId} from local storage:`, error);
    return [];
  }
};

export const clearChatMessagesCache = (roomId: string) => {
  try {
    localStorage.removeItem(`${CHAT_MESSAGES_CACHE_PREFIX}${roomId}`);
  } catch (error) {
    console.error(`Error clearing chat messages cache for room ${roomId} from local storage:`, error);
  }
};

export const clearAllChatCaches = () => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CHAT_MESSAGES_CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error("Error clearing all chat caches from local storage:", error);
  }
};