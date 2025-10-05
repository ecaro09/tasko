import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ChatRoomList from '@/components/ChatRoomList';
import ChatMessageView from '@/components/ChatMessageView';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();

  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null);

  // Set selected room from URL param on initial load
  React.useEffect(() => {
    const roomIdFromUrl = searchParams.get('roomId');
    if (roomIdFromUrl) {
      setSelectedRoomId(roomIdFromUrl);
    }
  }, [searchParams]);

  // Update URL when selectedRoomId changes
  React.useEffect(() => {
    if (selectedRoomId) {
      navigate(`/chat?roomId=${selectedRoomId}`, { replace: true });
    } else {
      navigate('/chat', { replace: true });
    }
  }, [selectedRoomId, navigate]);

  if (authLoading) {
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
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to access chat.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBackToRooms = () => {
    setSelectedRoomId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] w-full">
      <div className="container mx-auto px-4 h-[calc(100vh-120px)] max-h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-4">
        {/* Chat Room List (Visible on desktop, or on mobile if no room is selected) */}
        <Card className={cn(
          "flex-shrink-0 lg:w-1/3 shadow-lg",
          isMobile && selectedRoomId ? "hidden" : "w-full"
        )}>
          <CardHeader className="border-b dark:border-gray-700">
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))] flex items-center gap-2">
              <MessageSquare size={24} /> Your Chats
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 overflow-y-auto h-[calc(100%-80px)]">
            <ChatRoomList onSelectRoom={setSelectedRoomId} selectedRoomId={selectedRoomId} />
          </CardContent>
        </Card>

        {/* Chat Message View (Visible on desktop, or on mobile if a room is selected) */}
        <Card className={cn(
          "flex-1 shadow-lg",
          isMobile && !selectedRoomId ? "hidden" : "w-full"
        )}>
          {selectedRoomId ? (
            <ChatMessageView roomId={selectedRoomId} onBack={handleBackToRooms} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg">Select a chat to start messaging.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;