import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, User as UserIcon, Frown } from 'lucide-react'; // Added Frown icon
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, ChatRoom as ChatRoomType } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import ChatRoom from '@/components/ChatRoom';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Define a type for chat room with resolved participant info
interface ChatRoomWithParticipantInfo extends ChatRoomType {
  otherParticipantId: string;
  otherParticipantName: string;
  otherParticipantAvatar?: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams<{ chatRoomId?: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { chatRooms, loadingChatRooms, error } = useChat();
  const { fetchTaskerProfileById } = useTaskerProfile();
  const [resolvedChatRooms, setResolvedChatRooms] = useState<ChatRoomWithParticipantInfo[]>([]);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error("Please log in to access chat.");
      navigate('/profile');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Resolve participant info for each chat room
  useEffect(() => {
    const resolveParticipants = async () => {
      if (!user || chatRooms.length === 0) {
        setResolvedChatRooms([]);
        return;
      }

      const resolved = await Promise.all(
        chatRooms.map(async (room) => {
          const otherParticipantId = room.participants.find(pId => pId !== user.uid);
          const otherParticipantIndex = room.participants.indexOf(otherParticipantId || '');
          const otherParticipantName = room.participantNames[otherParticipantIndex] || "Unknown User";
          let otherParticipantAvatar: string | undefined;

          if (otherParticipantId) {
            // Try to fetch tasker profile for avatar
            const taskerProfile = await fetchTaskerProfileById(otherParticipantId);
            otherParticipantAvatar = taskerProfile?.photoURL;
          }

          return {
            ...room,
            otherParticipantId: otherParticipantId || '',
            otherParticipantName,
            otherParticipantAvatar,
          };
        })
      );
      setResolvedChatRooms(resolved);
    };

    resolveParticipants();
  }, [chatRooms, user, fetchTaskerProfileById]);

  if (authLoading || loadingChatRooms) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading chats...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {error}</div>;
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  const currentChatRoomWithInfo = chatRoomId ? resolvedChatRooms.find(room => room.id === chatRoomId) : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col pb-[var(--safe-area-bottom)]">
      <div className="container mx-auto px-4 flex-grow flex flex-col max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          {chatRoomId ? (
            <Button onClick={() => navigate('/chat')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              <ArrowLeft size={20} className="mr-2" /> Back to Chats
            </Button>
          ) : (
            <div className="w-10"></div> // Spacer
          )}
          <h1 className="text-3xl font-bold text-green-600 text-center flex-grow">
            {chatRoomId ? currentChatRoomWithInfo?.otherParticipantName || "Chat" : "My Chats"}
          </h1>
          <div className="w-10"></div> {/* Spacer to balance the back button */}
        </div>

        {chatRoomId && !currentChatRoomWithInfo ? (
          <Card className="flex-grow flex flex-col items-center justify-center shadow-lg rounded-lg p-8 text-center">
            <Frown size={64} className="text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Chat Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The chat room you are looking for does not exist or you do not have access to it.
            </p>
            <Button onClick={() => navigate('/chat')} className="bg-green-600 hover:bg-green-700 text-white">
              View All Chats
            </Button>
          </Card>
        ) : chatRoomId && currentChatRoomWithInfo ? (
          <ChatRoom
            chatRoomId={chatRoomId}
            otherParticipantName={currentChatRoomWithInfo.otherParticipantName}
            otherParticipantAvatar={currentChatRoomWithInfo.otherParticipantAvatar}
          />
        ) : (
          <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden min-h-0">
            <CardContent className="flex-grow p-4 flex flex-col min-h-0">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Your Conversations</h2>
              {resolvedChatRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p>No active conversations yet.</p>
                  <p className="text-sm mt-2">Start a chat from a task detail page or a tasker's profile.</p>
                </div>
              ) : (
                <ScrollArea className="flex-grow">
                  <div className="space-y-3">
                    {resolvedChatRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => navigate(`/chat/${room.id}`)}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={room.otherParticipantAvatar || undefined} alt={room.otherParticipantName} />
                            <AvatarFallback className="bg-blue-200 text-blue-800 text-lg font-semibold">
                              {room.otherParticipantName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{room.otherParticipantName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{room.lastMessage}</p>
                          </div>
                          {room.lastMessageTimestamp && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(room.lastMessageTimestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;