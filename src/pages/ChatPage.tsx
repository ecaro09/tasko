import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, ArrowLeft, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const TASK_SUPPORT_CHAT_ID = "tasko-support-chat"; // Must match the ID used in use-chat.tsx

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { messages, loadingMessages, errorMessages, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages load or new message arrives
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      toast.info("Message cannot be empty.");
      return;
    }
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to send messages.");
      return;
    }

    try {
      await sendMessage(TASK_SUPPORT_CHAT_ID, newMessage);
      setNewMessage('');
    } catch (error) {
      // Error handled by useChat hook, toast already shown
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (authLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-6">
            <MessageSquare size={64} className="text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to use the chat feature.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex flex-col max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white self-start">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Tasko Support Chat</h1>

        <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
          <CardContent className="flex-grow p-4 flex flex-col">
            <ScrollArea className="flex-grow h-[calc(100vh-350px)] md:h-[calc(100vh-300px)] pr-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500 italic py-8">Loading messages...</div>
              ) : errorMessages ? (
                <div className="text-center text-red-500 italic py-8">Error: {errorMessages}</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500 italic py-8">No messages yet. Start the conversation!</div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-3",
                        msg.senderId === user.uid ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.senderId !== user.uid && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.senderAvatar || undefined} alt={msg.senderName} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg shadow-sm",
                          msg.senderId === user.uid
                            ? "bg-green-600 text-white rounded-br-none"
                            : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                        )}
                      >
                        <p className="font-semibold text-sm mb-1">
                          {msg.senderId === user.uid ? "You" : msg.senderName}
                        </p>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs opacity-75 mt-1 text-right">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {msg.senderId === user.uid && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.senderAvatar || undefined} alt={msg.senderName} />
                          <AvatarFallback className="bg-green-200 text-green-800 text-sm">
                            {msg.senderName ? msg.senderName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
            <div className="flex items-center gap-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-grow"
                disabled={loadingMessages || !isAuthenticated}
              />
              <Button onClick={handleSendMessage} disabled={loadingMessages || !isAuthenticated || !newMessage.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                <Send size={20} />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;