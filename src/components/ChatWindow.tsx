import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const ChatWindow: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { conversations, getMessagesForConversation, sendMessage, markConversationAsRead, loading: chatLoading, error: chatError } = useChat(); // Destructure markConversationAsRead
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find(conv => conv.id === conversationId);
  const messages = conversationId ? getMessagesForConversation(conversationId) : [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (conversationId && isAuthenticated && user) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, isAuthenticated, user, markConversationAsRead]); // Mark as read when conversationId changes or user logs in

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-8 text-red-500">Please log in to view chats.</div>
    );
  }

  if (chatLoading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading chat...</div>;
  }

  if (chatError) {
    return <div className="text-center py-8 text-red-500">Error loading chat: {chatError}</div>;
  }

  if (!conversation) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Conversation not found.
        <Button onClick={() => navigate('/chat')} variant="link" className="block mx-auto mt-4">Go to Chat List</Button>
      </div>
    );
  }

  const otherParticipant = conversation.participants.find(p => p !== user.uid);
  const otherParticipantName = conversation.participantNames[conversation.participants.indexOf(otherParticipant || '')] || 'Unknown User';

  const handleSendMessage = async () => {
    if (messageText.trim() && conversationId) {
      await sendMessage(conversationId, messageText);
      setMessageText('');
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] max-w-3xl mx-auto shadow-lg">
      <CardHeader className="flex flex-row items-center gap-4 p-4 border-b dark:border-gray-700">
        <Button variant="ghost" size="icon" onClick={() => navigate('/chat')} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
          <ArrowLeft size={20} />
        </Button>
        <Avatar className="w-10 h-10 border-2 border-green-500">
          {/* In a real app, you'd fetch the other participant's avatar */}
          <AvatarImage src={`https://i.pravatar.cc/150?u=${otherParticipant}`} alt={otherParticipantName} />
          <AvatarFallback className="bg-green-200 text-green-800 text-md font-semibold">
            {otherParticipantName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">{otherParticipantName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              msg.senderId === user.uid ? "justify-end" : "justify-start"
            )}
          >
            {msg.senderId !== user.uid && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.senderAvatar || `https://i.pravatar.cc/150?u=${msg.senderId}`} alt={msg.senderName} />
                <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                  {msg.senderName.charAt(0).toUpperCase()}
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
              <p className="text-sm">{msg.text}</p>
              <span className="block text-right text-xs mt-1 opacity-80">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.senderId === user.uid && (
              <Avatar className="w-8 h-8">
                <AvatarImage src={msg.senderAvatar || user.photoURL || undefined} alt={msg.senderName} />
                <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                  {msg.senderName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
            disabled={chatLoading}
          />
          <Button onClick={handleSendMessage} disabled={chatLoading || !messageText.trim()} className="bg-green-600 hover:bg-green-700 text-white">
            <Send size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatWindow;