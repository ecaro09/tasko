import React from 'react';
import { useChat, ChatRoom } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatRoomListProps {
  onSelectRoom: (roomId: string) => void;
  activeRoomId: string | null;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onSelectRoom, activeRoomId }) => {
  const { chatRooms, loadingRooms, error } = useChat();
  const { user } = useAuth();

  if (loadingRooms) {
    return <div className="p-4 text-center text-gray-500">Loading chats...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!chatRooms || chatRooms.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
        <p>No active chats yet.</p>
        <p className="text-sm">Start a conversation with a tasker or client!</p>
      </div>
    );
  }

  const getOtherParticipantInfo = (room: ChatRoom) => {
    if (!user) return { name: "Unknown", avatar: undefined };
    const otherParticipantId = room.participants.find(pId => pId !== user.id);
    const otherParticipantName = room.participantNames.find(pName => !pName.includes(user.user_metadata?.first_name || '')); // Simple heuristic
    
    // Fallback to a more robust way if participantNames are ordered consistently
    const userIndex = room.participants.indexOf(user.id);
    let displayParticipantName = "Unknown User";
    let displayParticipantAvatar = undefined;

    if (otherParticipantId) {
      const otherIndex = room.participants.indexOf(otherParticipantId);
      if (room.participantNames && room.participantNames[otherIndex]) {
        displayParticipantName = room.participantNames[otherIndex];
      }
      // For avatar, we'd ideally fetch from profiles table, but for now, use a placeholder
      // or if we stored avatar_urls in participant_names array (less ideal)
    }

    return {
      name: displayParticipantName,
      avatar: undefined, // Placeholder, actual avatar fetching would be more complex
    };
  };

  return (
    <div className="space-y-2 p-4">
      {chatRooms.map((room) => {
        const { name: otherParticipantName, avatar: otherParticipantAvatar } = getOtherParticipantInfo(room);
        const lastMessageTime = room.lastMessageTimestamp ? new Date(room.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

        return (
          <Card
            key={room.id}
            className={cn(
              "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
              activeRoomId === room.id ? "bg-blue-50 dark:bg-blue-900/30 border-blue-500" : "bg-white dark:bg-gray-800"
            )}
            onClick={() => onSelectRoom(room.id)}
          >
            <CardContent className="flex items-center p-3">
              <Avatar className="w-10 h-10 mr-3">
                <AvatarImage src={otherParticipantAvatar} alt={otherParticipantName} />
                <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {otherParticipantName.charAt(0).toUpperCase() || <UserIcon size={16} />}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800 dark:text-gray-100">{otherParticipantName}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {room.lastMessage || "No messages yet."}
                </p>
              </div>
              {room.lastMessageTimestamp && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{lastMessageTime}</span>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ChatRoomList;