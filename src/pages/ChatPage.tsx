import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChat, ChatRoom as ChatRoomType } from '@/hooks/use-chat'; // Import ChatRoomType (now exported)
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile'; // Import useTaskerProfile
import ChatRoom from '@/components/ChatRoom'; // Import the new ChatRoom component
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { chatRoomId } = useParams<{ chatRoomId?: string }>(); // Get chatRoomId from URL
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { chatRooms, loadingChatRooms, error } = useChat(); // Now correctly destructured
  const { fetchTaskerProfileById } = useTaskerProfile(); // Use this to fetch other participant's details

  // State to store fetched participant details for the chat list
  const [participantDetails, setParticipantDetails] = useState<{ [key: string]: { name: string; avatar?: string } }>({});

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to access chat.");
      navigate('/profile'); // Redirect to profile/login if not authenticated
      return;
    }

    // Fetch details for all other participants in chat rooms
    const fetchAllParticipantDetails = async () => {
      const newDetails: { [key: string]: { name: string; avatar?: string } } = {};
      for (const room of chatRooms) {
        const otherParticipantId = room.participants.find(pId => pId !== user.uid);
        if (otherParticipantId && !newDetails[otherParticipantId]) {
          // Try to fetch as a tasker profile
          const taskerProfile = await fetchTaskerProfileById(otherParticipantId);
          if (taskerProfile) {
            newDetails[otherParticipantId] = {
              name: taskerProfile.displayName,
              avatar: taskerProfile.photoURL,
            };
          } else {
            // Fallback if not a tasker (e.g., another client).
            // In a real app, you'd have a general user profile fetch here.
            const otherParticipantIndex = room.participants.indexOf(otherParticipantId);
            newDetails[otherParticipantId] = {
              name: room.participantNames[otherParticipantIndex] || "Unknown User",
              avatar: undefined, // Default avatar if not found
            };
          }
        }
      }
      setParticipantDetails(newDetails);
    };

    if (chatRooms.length > 0) {
      fetchAllParticipantDetails();
    }
  }, [chatRooms, user, isAuthenticated, fetchTaskerProfileById, navigate]);

  if (authLoading || loadingChatRooms) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading chats...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your chats.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentChatRoom = chatRoomId ? chatRooms.find(room => room.id === chatRoomId) : null;

  // Determine the other participant's info for the ChatRoom component and header
  const getOtherParticipantInfo = (room: ChatRoomType) => {
    if (!user) return { id: "unknown", name: "Unknown", avatar: undefined };

    const otherParticipantId = room.participants.find(pId => pId !== user.uid);
    if (!otherParticipantId) return { id: "unknown", name: "Unknown", avatar: undefined };

    // Use fetched details if available
    if (participantDetails[otherParticipantId]) {
      return { id: otherParticipantId, ...participantDetails[otherParticipantId] };
    }

    // Fallback to participantNames if details not yet fetched or not a tasker
    const otherParticipantIndex = room.participants.indexOf(otherParticipantId);
    return {
      id: otherParticipantId,
      name: room.participantNames[otherParticipantIndex] || "Unknown User",
      avatar: undefined,
    };
  };

  const otherParticipantInfoForCurrentChat = currentChatRoom ? getOtherParticipantInfo(currentChatRoom) : { id: "unknown", name: "Select a Chat", avatar: undefined };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex flex-col max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          {chatRoomId ? (
            <Button onClick={() => navigate('/chat')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              <ArrowLeft size={20} className="mr-2" /> Back to Chats
            </Button>
          ) : (
            <div className="w-10"></div> 
          )}
          <h1 className="text-3xl font-bold text-green-600 text-center flex-grow">
            {chatRoomId ? otherParticipantInfoForCurrentChat.name : "My Chats"}
          </h1>
          <div className="w-10"></div> {/* Spacer to balance the back button */}
        </div>

        {chatRoomId && currentChatRoom ? (
          <ChatRoom
            chatRoomId={chatRoomId}
            otherParticipantId={otherParticipantInfoForCurrentChat.id} // Pass otherParticipantId
            otherParticipantName={otherParticipantInfoForCurrentChat.name}
            otherParticipantAvatar={otherParticipantInfoForCurrentChat.avatar}
            currentUserAvatar={user.photoURL || undefined} // Pass current user's avatar
          />
        ) : (
          <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
            <CardContent className="flex-grow p-4">
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Your Conversations</h2>
              {chatRooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <MessageSquare size={48} className="mx-auto mb-4" />
                  <p>No active conversations yet.</p>
                  <p className="text-sm mt-2">Start a chat from a task detail page or a tasker's profile.</p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-250px)]"> {/* Adjust height as needed */}
                  <div className="space-y-3">
                    {chatRooms.map((room) => {
                      const otherParticipantInfoForList = getOtherParticipantInfo(room);

                      return (
                        <div
                          key={room.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onClick={() => navigate(`/chat/${room.id}`)}
                        >
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={otherParticipantInfoForList.avatar || undefined} alt={otherParticipantInfoForList.name} />
                            <AvatarFallback className="bg-blue-200 text-blue-800 text-lg font-semibold">
                              {otherParticipantInfoForList.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-grow">
                            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{otherParticipantInfoForList.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{room.lastMessage}</p>
                          </div>
                          {room.lastMessageTimestamp && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(room.lastMessageTimestamp).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      );
                    })}
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