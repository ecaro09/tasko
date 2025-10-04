import React, { useRef, useEffect } from 'react';
import { useChat, ChatMessage, ChatRoom } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  roomId: string;
  currentRoom: ChatRoom | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ roomId, currentRoom }) => {
  const { messages, loadingMessages, error, getMessagesForRoom, sendMessage } = useChat();
  const { user } = useAuth();
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (roomId) {
      getMessagesForRoom(roomId);
    }
  }, [roomId, getMessagesForRoom]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getParticipantInfo = (senderId: string) => {
    if (!currentRoom || !user) return { name: "Unknown", avatar: undefined };
    
    const senderIndex = currentRoom.participants.indexOf(senderId);
    if (senderIndex !== -1) {
      const name = currentRoom.participantNames[senderIndex] || "Unknown User";
      const avatar = currentRoom.participantAvatars[senderIndex] || undefined;
      return { name, avatar };
    }
    return { name: "Unknown", avatar: undefined };
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      await sendMessage(roomId, newMessage);
      setNewMessage('');
    }
  };

  if (loadingMessages) {
    return <div className="flex-1 p-4 text-center text-gray-500">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex-1 p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (!currentRoom) {
    return <div className="flex-1 p-4 text-center text-gray-500">Select a chat to view messages.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-400" />
            <p>No messages in this chat yet.</p>
            <p className="text-sm">Say hello!</p>
          </div>
        ) : (
          messages.map((message) => {
            const { name: senderName, avatar: senderAvatar } = getParticipantInfo(message.senderId);
            const isCurrentUser = message.senderId === user?.id;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-2",
                  isCurrentUser ? "justify-end" : "justify-start"
                )}
              >
                {!isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={senderAvatar} alt={senderName} />
                    <AvatarFallback className="bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                      {senderName.charAt(0).toUpperCase() || <UserIcon size={14} />}
                    </AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    isCurrentUser
                      ? "bg-[hsl(var(--primary-color))] text-white rounded-br-none"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                  )}
                >
                  <CardContent className="p-0">
                    <p className="text-sm">{message.text}</p>
                    <span className={cn(
                      "block text-xs mt-1",
                      isCurrentUser ? "text-gray-200" : "text-gray-500 dark:text-gray-400"
                    )}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </CardContent>
                </Card>
                {isCurrentUser && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={senderAvatar} alt={senderName} />
                    <AvatarFallback className="bg-green-200 text-green-800 dark:bg-green-700 dark:text-green-200">
                      {senderName.charAt(0).toUpperCase() || <UserIcon size={14} />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1"
          disabled={!user}
        />
        <Button onClick={handleSendMessage} disabled={!user || !newMessage.trim()} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
          <Send size={20} />
        </Button>
      </div>
    </div>
  );
};

export default ChatWindow;