import React, { useEffect, ReactNode, createContext, useContext } from 'react';
import { useAuth } from './use-auth';

interface ChatSessionContextType {
  isChatSessionInitialized: boolean;
}

const ChatSessionContext = createContext<ChatSessionContextType | undefined>(undefined);

export const ChatSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isChatSessionInitialized, setIsChatSessionInitialized] = React.useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user && !isChatSessionInitialized) {
      // Simulate logging into a chat system
      console.log(`[Chat Log] Chat session initialized for user: ${user.uid} (${user.email}) at ${new Date().toISOString()}`);
      setIsChatSessionInitialized(true);
    } else if (!isAuthenticated && isChatSessionInitialized) {
      // Reset chat session state if user logs out
      console.log(`[Chat Log] Chat session ended for previous user at ${new Date().toISOString()}`);
      setIsChatSessionInitialized(false);
    }
  }, [isAuthenticated, user, authLoading, isChatSessionInitialized]);

  const value = {
    isChatSessionInitialized,
  };

  return <ChatSessionContext.Provider value={value}>{children}</ChatSessionContext.Provider>;
};

export const useChatSession = () => {
  const context = useContext(ChatSessionContext);
  if (context === undefined) {
    throw new Error('useChatSession must be used within a ChatSessionProvider');
  }
  return context;
};