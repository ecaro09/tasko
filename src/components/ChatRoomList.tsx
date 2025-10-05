import React from 'react';
import { useChat, ChatRoom } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';

interface ChatRoomListProps {
  onSelectRoom: (roomId: string) => void;
  selectedRoomId: string | null;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onSelectRoom, selectedRoomId }) => {
  const { chatRooms, loadingRooms, error } = useChat();
  const { user } = useAuth();

  if (loadingRooms) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <MessageSquare size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-600" />
        <p>No active chats. Start a conversation with a tasker or client!</p>
      </div>
    );
  }

  const getOtherParticipantInfo = (room: ChatRoom) => {
    if (!user) return { name: "Unknown", avatar: DEFAULT_AVATAR_URL };

    const otherParticipantIndex = room.participants.findIndex(pId => pId !== user.id);
    const otherParticipantName = room.participantNames[otherParticipantIndex] || "Unknown User";
    const otherParticipantAvatar = room.participantAvatars?.[otherParticipantIndex] || DEFAULT_AVATAR_URL;

    return { name: otherParticipantName, avatar: otherParticipantAvatar };
  };

  return (
    <div className="space-y-2">
      {chatRooms.map(room => {
        const { name: otherParticipantName, avatar: otherParticipantAvatar } = getOtherParticipantInfo(room);
        return (
          <Card
            key={room.id}
            className={cn(
              "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
              selectedRoomId === room.id ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" : "bg-white dark:bg-gray-800"
            )}
            onClick={() => onSelectRoom(room.id)}
          >
            <CardContent className="flex items-center p-4">
              <Avatar className="w-12 h-12 border-2 border-gray-300 dark:border-gray-600">
                <AvatarImage 
                  src={otherParticipantAvatar} 
                  alt={otherParticipantName} 
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_AVATAR_URL;
                    e.currentTarget.onerror = null;
                  }}
                />
                <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {otherParticipantName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 flex-1">
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{otherParticipantName}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {room.lastMessage || "No messages yet."}
                </p>
              </div>
              {room.lastMessageTimestamp && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {new Date(room.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChatRoomList;