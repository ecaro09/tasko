import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User as UserIcon } from 'lucide-react';
import { useChat, Message } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card"; // Added import for Card

interface ChatRoomProps {
  chatRoomId: string;
  otherParticipantName: string;
  otherParticipantAvatar?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ chatRoomId, otherParticipantName, otherParticipantAvatar }) => {
  const { user, isAuthenticated } = useAuth();
  const { messages, loadingMessages, error, sendMessage, getMessagesForChatRoom } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to view chat messages.");
      return;
    }

    const unsubscribe = getMessagesForChatRoom(chatRoomId);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [chatRoomId, isAuthenticated, user, getMessagesForChatRoom]);

  useEffect(() => {
    // Scroll to bottom when messages load or new message arrives
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.error("Message cannot be empty.");
      return;
    }
    if (!isAuthenticated || !user) {
      toast.error("Please log in to send messages.");
      return;
    }

    try {
      await sendMessage(chatRoomId, newMessage);
      setNewMessage('');
    } catch (err) {
      // Error handled by useChat hook, toast already shown
    }
  };

  if (loadingMessages) {
    return <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">Loading messages...</div>;
  }

  if (error) {
    return <div className="flex-grow flex items-center justify-center text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  return (
    <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
      <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <Avatar className="w-10 h-10 mr-3">
          <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
          <AvatarFallback className="bg-blue-200 text-blue-800 text-md font-semibold">
            {otherParticipantName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{otherParticipantName}</h2>
      </div>

      <ScrollArea className="flex-grow p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <MessageSquare size={48} className="mx-auto mb-4" />
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  isMyMessage ? "justify-end" : "justify-start"
                )}
              >
                {!isMyMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.senderAvatar || otherParticipantAvatar || undefined} alt={msg.senderName} />
                    <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg shadow-sm",
                    isMyMessage
                      ? "bg-green-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{msg.text}</p>
                  <span className={cn("block text-xs mt-1", isMyMessage ? "text-green-100" : "text-gray-500 dark:text-gray-300")}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {isMyMessage && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={msg.senderAvatar || user?.photoURL || undefined} alt={msg.senderName} />
                    <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                      {msg.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} /> {/* Scroll anchor */}
      </ScrollArea>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
          className="flex-grow"
          disabled={!isAuthenticated || !user}
        />
        <Button onClick={handleSendMessage} disabled={!isAuthenticated || !user || !newMessage.trim()} className="bg-green-600 hover:bg-green-700 text-white">
          <Send size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default ChatRoom;