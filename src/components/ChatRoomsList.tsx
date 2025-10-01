"use client";

import React from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatRoomsListProps {
  onRoomSelect?: () => void; // Optional callback for mobile to close sheet on select
}

const ChatRoomsList: React.FC<ChatRoomsListProps> = ({ onRoomSelect }) => {
  const { chatRooms, selectedChatRoomId, selectChatRoom } = useChat();
  const { user } = useAuth();

  const handleSelectRoom = (roomId: string) => {
    selectChatRoom(roomId);
    onRoomSelect?.(); // Call the optional callback
  };

  return (
    <CardContent className="p-0">
      <ScrollArea className="h-full">
        {chatRooms.length === 0 ? (
          <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No chat rooms yet.</p>
        ) : (
          chatRooms.map((room) => {
            const otherParticipantIndex = room.participants.findIndex(
              (pId) => pId !== user?.uid,
            );
            const roomOtherParticipantName =
              otherParticipantIndex !== -1
                ? room.participantNames[otherParticipantIndex]
                : 'Unknown User';
            const otherParticipantAvatar =
              otherParticipantIndex !== -1
                ? room.participantAvatars[otherParticipantIndex]
                : undefined;

            return (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room.id)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                  selectedChatRoomId === room.id && "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipantAvatar || undefined} alt={roomOtherParticipantName} />
                  <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {roomOtherParticipantName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{roomOtherParticipantName}</p>
                  {room.lastMessage && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {room.lastMessage}
                    </p>
                  )}
                </div>
                {room.lastMessageTimestamp && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(room.lastMessageTimestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })
        )}
      </ScrollArea>
    </CardContent>
  );
};

export default ChatRoomsList;