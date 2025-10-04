import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useChat, ChatRoom } from '@/hooks/use-chat';
import ChatRoomList from '@/components/ChatRoomList';
import ChatWindow from '@/components/ChatWindow';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile'; // Import the useIsMobile hook

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { chatRooms, loadingRooms, error: chatError } = useChat();
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  const isMobile = useIsMobile();

  // Set the first room as active by default if available
  React.useEffect(() => {
    if (!activeRoomId && chatRooms.length > 0) {
      setActiveRoomId(chatRooms[0].id);
    }
  }, [chatRooms, activeRoomId]);

  const currentRoom = activeRoomId ? chatRooms.find(room => room.id === activeRoomId) : null;

  if (authLoading || loadingRooms) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading chat...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your chats.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col">
      <div className="container mx-auto px-4 flex-1 flex flex-col">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white self-start">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Your Chats</h1>

        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chat Room List - Always visible on desktop, conditionally visible on mobile */}
          {(!isMobile || (isMobile && !activeRoomId)) && (
            <Card className="md:col-span-1 shadow-lg flex flex-col">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">Conversations</CardTitle>
              </CardHeader>
              <div className="flex-1 overflow-y-auto">
                <ChatRoomList onSelectRoom={setActiveRoomId} activeRoomId={activeRoomId} />
              </div>
            </Card>
          )}

          {/* Chat Window - Always visible on desktop, conditionally visible on mobile */}
          {(!isMobile || (isMobile && activeRoomId)) && (
            <Card className="md:col-span-2 shadow-lg flex flex-col">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {currentRoom ? (
                    currentRoom.participantNames.filter(name => name !== (isAuthenticated && user ? `${user.user_metadata?.first_name} ${user.user_metadata?.last_name}` : user?.email)).join(', ') || 'Chat'
                  ) : (
                    'Select a Chat'
                  )}
                </CardTitle>
                {isMobile && activeRoomId && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveRoomId(null)} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <ArrowLeft size={20} className="mr-1" /> Back to Chats
                  </Button>
                )}
              </CardHeader>
              <ChatWindow roomId={activeRoomId || ''} currentRoom={currentRoom} />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;