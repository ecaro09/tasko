import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, User as UserIcon } from 'lucide-react';
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
  const { userId } = useParams<{ userId?: string }>(); // Changed from chatRoomId to userId
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { chatRooms, loadingChatRooms, error, createChatRoom, getChatRoomIdForParticipants } = useChat();
  const { fetchTaskerProfileById } = useTaskerProfile();
  const [resolvedChatRooms, setResolvedChatRooms] = useState<ChatRoomWithParticipantInfo[]>([]);
  const [activeChatRoomId, setActiveChatRoomId] = useState<string | null>(null);
  const [activeOtherParticipantInfo, setActiveOtherParticipantInfo] = useState<{ name: string; avatar?: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error("Please log in to access chat.");
      navigate('/profile');
      return;
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Effect to handle dynamic chat room selection/creation based on userId param
  useEffect(() => {
    const handleChatInitiation = async () => {
      if (!user || !isAuthenticated || !userId) {
        setActiveChatRoomId(null);
        setActiveOtherParticipantInfo(null);
        return;
      }

      // Prevent chatting with self
      if (user.uid === userId) {
        toast.info("You cannot chat with yourself.");
        navigate('/chat'); // Redirect to general chat list
        return;
      }

      // Try to find or create a chat room
      const participantIds = [user.uid, userId].sort();
      let chatRoomIdToUse = await getChatRoomIdForParticipants(participantIds);

      let otherParticipantName = "Unknown User";
      let otherParticipantAvatar: string | undefined;

      // Fetch other participant's profile for display name and avatar
      const otherUserProfile = await fetchTaskerProfileById(userId); // Assuming tasker profiles store display names/avatars
      if (otherUserProfile) {
        otherParticipantName = otherUserProfile.displayName;
        otherParticipantAvatar = otherUserProfile.photoURL;
      } else {
        // Fallback if not a tasker, try to get from auth user if available (less likely for other users)
        // For now, we'll rely on tasker profiles or default to "Unknown User"
      }

      if (!chatRoomIdToUse) {
        // If no existing chat room, create one
        chatRoomIdToUse = await createChatRoom(participantIds, [user.displayName || "You", otherParticipantName]);
      }

      setActiveChatRoomId(chatRoomIdToUse);
      setActiveOtherParticipantInfo({ name: otherParticipantName, avatar: otherParticipantAvatar });
    };

    handleChatInitiation();
  }, [userId, user, isAuthenticated, createChatRoom, getChatRoomIdForParticipants, fetchTaskerProfileById, navigate]);


  // Resolve participant info for each chat room in the list view
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex flex-col max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          {userId ? ( // If userId is present, show back button to chat list
            <Button onClick={() => navigate('/chat')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              <ArrowLeft size={20} className="mr-2" /> Back to Chats
            </Button>
          ) : (
            <div className="w-10"></div> // Spacer for list view
          )}
          <h1 className="text-3xl font-bold text-green-600 text-center flex-grow">
            {userId ? activeOtherParticipantInfo?.name || "Chat" : "My Chats"}
          </h1>
          <div className="w-10"></div> {/* Spacer to balance the back button */}
        </div>

        {userId && activeChatRoomId && activeOtherParticipantInfo ? (
          <ChatRoom
            chatRoomId={activeChatRoomId}
            otherParticipantName={activeOtherParticipantInfo.name}
            otherParticipantAvatar={activeOtherParticipantInfo.avatar}
          />
        ) : (
          <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
            <CardContent className="flex-grow p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Your Conversations</h2>
              {resolvedChatRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p>No active conversations yet.</p>
                  <p className="text-sm mt-2">Start a chat from a task detail page or a tasker's profile.</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
                  <div className="space-y-3">
                    {resolvedChatRooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => navigate(`/chat/${room.otherParticipantId}`)} // Navigate to chat with other participant's ID
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