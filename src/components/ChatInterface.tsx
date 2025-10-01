"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useChat, Message } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Loader2 } from 'lucide-react'; // Import Loader2 for spinner
import { cn } from '@/lib/utils';
import { CardHeader, CardTitle, Card } from '@/components/ui/card';

interface ChatInterfaceProps {
  chatRoomId: string;
  otherParticipantName: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatRoomId, otherParticipantName }) => {
  const { messages, sendMessage, loading: chatLoading } = useChat();
  const { user, isAuthenticated } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false); // New state for sending message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(msg => msg.chatRoomId === chatRoomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [filteredMessages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && chatRoomId && isAuthenticated && user && !isSendingMessage) {
      setIsSendingMessage(true);
      try {
        await sendMessage(chatRoomId, newMessage);
        setNewMessage('');
      } catch (error) {
        console.error("Error sending message from UI:", error);
        // Toast is handled in use-chat hook, no need to duplicate here.
      } finally {
        setIsSendingMessage(false);
      }
    }
  };

  if (chatLoading) {
    return <div className="p-4 text-center text-gray-500">Loading messages...</div>;
  }

  if (!isAuthenticated) {
    return <div className="p-4 text-center text-red-500">You must be logged in to view chat.</div>;
  }

  return (
    <Card className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
        <CardTitle className="text-xl font-semibold">{otherParticipantName}</CardTitle>
      </CardHeader>
      <ScrollArea className="flex-1 p-4 space-y-4 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex items-end gap-3",
                message.senderId === user?.uid ? "justify-end" : "justify-start"
              )}
            >
              {message.senderId !== user?.uid && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                  <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {message.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "flex flex-col p-3 rounded-lg max-w-[70%]",
                  message.senderId === user?.uid
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                )}
              >
                {message.senderId !== user?.uid && (
                  <span className="text-xs font-semibold mb-1">
                    {message.senderName}
                  </span>
                )}
                <p className="text-sm">{message.content}</p>
                <span className={cn(
                  "text-[0.65rem] mt-1",
                  message.senderId === user?.uid ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
                )}>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {message.senderId === user?.uid && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                  <AvatarFallback className="bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                    {message.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </ScrollArea>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1"
          disabled={!isAuthenticated || chatLoading || isSendingMessage}
        />
        <Button onClick={handleSendMessage} disabled={!isAuthenticated || chatLoading || isSendingMessage}>
          {isSendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={20} />}
        </Button>
      </div>
    </Card>
  );
};

export default ChatInterface;