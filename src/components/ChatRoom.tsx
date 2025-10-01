import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, User as UserIcon } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

interface ChatRoomProps {
  chatRoomId: string;
  otherParticipantId: string; // ADDED PROP
  otherParticipantName: string;
  otherParticipantAvatar?: string;
  currentUserAvatar?: string; // New prop for current user's avatar
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId, otherParticipantId, otherParticipantName, otherParticipantAvatar, currentUserAvatar }) => { // Destructure new prop
  const { user } = useAuth();
  const { messages, loadingMessages, sendMessage, getMessagesForChatRoom } = useChat(); // Now correctly destructured
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = getMessagesForChatRoom(chatRoomId);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [chatRoomId, getMessagesForChatRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessageText.trim() && user) {
      await sendMessage(chatRoomId, otherParticipantId, newMessageText); // Pass otherParticipantId
      setNewMessageText('');
    }
  };

  if (loadingMessages) {
    return (
      <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
        <CardContent className="flex-grow p-4 flex flex-col items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
      <CardContent className="flex-grow p-4 flex flex-col">
        <div className="flex items-center gap-3 border-b pb-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
            <AvatarFallback className="bg-blue-200 text-blue-800">
              {otherParticipantName ? otherParticipantName.charAt(0).toUpperCase() : <UserIcon size={16} />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{otherParticipantName}</p>
            {/* <p className="text-sm text-gray-500 dark:text-gray-400">Online</p> */}
          </div>
        </div>

        <ScrollArea className="flex-grow pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  msg.senderId === user?.uid ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.senderId !== user?.uid && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
                    <AvatarFallback className="bg-gray-300 text-gray-700 text-sm">
                      {otherParticipantName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg",
                    msg.senderId === user?.uid
                      ? 'bg-green-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none'
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className={cn(
                    "text-xs mt-1 block",
                    msg.senderId === user?.uid ? 'text-green-100' : 'text-gray-500 dark:text-gray-300'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {msg.senderId === user?.uid && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={currentUserAvatar || undefined} alt={user?.displayName || "You"} />
                    <AvatarFallback className="bg-green-200 text-green-800 text-sm">
                      {user?.displayName?.charAt(0).toUpperCase() || <UserIcon size={14} />}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex gap-2 mt-auto">
          <Input
            type="text"
            placeholder="Type your message..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
            className="flex-grow"
            disabled={!user}
          />
          <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 text-white" disabled={!user || !newMessageText.trim()}>
            <Send size={20} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;