"use client";

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/ChatInterface';
import UserSearchAndChat from '@/components/UserSearchAndChat';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import ChatRoomsList from '@/components/ChatRoomsList'; // Import the new ChatRoomsList
import MobileChatSidebar from '@/components/MobileChatSidebar'; // Import the new MobileChatSidebar
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatPage: React.FC = () => {
  const {
    chatRooms,
    selectedChatRoomId,
    selectChatRoom,
    loading: chatLoading,
    error: chatError,
  } = useChat();
  const { isAuthenticated, loading: authLoading } = useAuth(); // Only need isAuthenticated for conditional rendering
  const isMobile = useIsMobile(); // Use the hook to detect mobile

  const loading = chatLoading || authLoading;

  useEffect(() => {
    // Automatically select the first chat room if none is selected and rooms exist
    if (!selectedChatRoomId && chatRooms.length > 0) {
      selectChatRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedChatRoomId, selectChatRoom]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header /> {/* Header now manages its own auth state */}
        <main className="container mx-auto p-4 text-center">
          <p className="text-red-500">Please sign in to view your chats.</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header /> {/* Header now manages its own auth state */}
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error loading chats: {chatError}</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  const currentChatRoom = chatRooms.find(room => room.id === selectedChatRoomId);
  const otherParticipantName = currentChatRoom
    ? currentChatRoom.participantNames[currentChatRoom.participants.findIndex(pId => pId !== currentChatRoom.participants[0])] || 'Unknown User' // Simplified to avoid direct user?.uid access here
    : 'Select a Chat';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header /> {/* Header now manages its own auth state */}
      <main className="flex-1 container mx-auto p-4 pt-8 flex gap-4">
        {isMobile ? (
          <MobileChatSidebar />
        ) : (
          <ResizablePanelGroup direction="vertical" className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 h-[calc(100vh-150px)]">
            <ResizablePanel defaultSize={60} minSize={30}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-xl">Your Chats</CardTitle>
                </CardHeader>
                <ChatRoomsList />
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <UserSearchAndChat />
            </ResizablePanel>
          </ResizablePanelGroup>
        )}

        <div className="flex-1 h-[calc(100vh-150px)]">
          {selectedChatRoomId ? (
            <ChatInterface chatRoomId={selectedChatRoomId} otherParticipantName={otherParticipantName} />
          ) : (
            <Card className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <CardContent>Select a chat or find a new user to start messaging.</CardContent>
            </Card>
          )}
        </div>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default ChatPage;