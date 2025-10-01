import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, MessageSquare, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat, Message, ChatRoom } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    chatRooms,
    messages,
    loadingChats,
    loadingMessages,
    error,
    sendMessage,
    selectChat,
    selectedChatId,
  } = useChat();

  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (authLoading || loadingChats) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[80px]">Loading chats...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your chats.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedChatId) {
      await sendMessage(selectedChatId, newMessage);
      setNewMessage('');
    }
  };

  const selectedChatRoom = chatRooms.find(chat => chat.id === selectedChatId);

  const getOtherParticipantInfo = (chatRoom: ChatRoom) => {
    const otherParticipantIndex = chatRoom.participants.findIndex(pId => pId !== user?.uid);
    if (otherParticipantIndex === -1) {
      // This case should ideally not happen for a 1-on-1 chat, but handle for safety
      return { name: "Unknown User", avatar: undefined };
    }
    return {
      name: chatRoom.participantNames[otherParticipantIndex],
      avatar: chatRoom.participantAvatars[otherParticipantIndex],
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col md:flex-row">
      <div className="container mx-auto px-4 flex flex-col md:flex-row gap-4 max-w-7xl">
        {/* Chat List (Sidebar) */}
        <Card className={cn(
          "w-full md:w-1/3 lg:w-1/4 flex-shrink-0 shadow-lg",
          selectedChatId ? "hidden md:flex flex-col" : "flex flex-col"
        )}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))]">Chats</h2>
            <Button onClick={() => navigate(-1)} variant="outline" size="icon" className="md:hidden">
              <ArrowLeft size={20} />
            </Button>
          </div>
          <ScrollArea className="flex-1 h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
            {chatRooms.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 p-4">No conversations yet.</p>
            ) : (
              chatRooms.map(chat => {
                const otherParticipant = getOtherParticipantInfo(chat);
                return (
                  <div
                    key={chat.id}
                    className={cn(
                      "flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                      selectedChatId === chat.id && "bg-green-50 dark:bg-green-900/20 border-l-4 border-[hsl(var(--primary-color))]"
                    )}
                    onClick={() => selectChat(chat.id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherParticipant.avatar || undefined} alt={otherParticipant.name} />
                      <AvatarFallback className="bg-green-200 text-green-800 text-sm font-semibold">
                        {otherParticipant.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{otherParticipant.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage || "No messages yet."}
                      </p>
                    </div>
                    {chat.lastMessageTimestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </ScrollArea>
        </Card>

        {/* Chat Window */}
        <Card className={cn(
          "w-full md:w-2/3 lg:w-3/4 flex flex-col shadow-lg",
          selectedChatId ? "flex" : "hidden md:flex flex-col"
        )}>
          {selectedChatId ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <Button onClick={() => selectChat(null)} variant="ghost" size="icon" className="md:hidden">
                  <ArrowLeft size={20} />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={getOtherParticipantInfo(selectedChatRoom!).avatar || undefined} alt={getOtherParticipantInfo(selectedChatRoom!).name} />
                  <AvatarFallback className="bg-green-200 text-green-800 text-sm font-semibold">
                    {getOtherParticipantInfo(selectedChatRoom!).name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getOtherParticipantInfo(selectedChatRoom!).name}</h3>
              </div>
              <ScrollArea className="flex-1 p-4 h-[calc(100vh-280px)] md:h-[calc(100vh-240px)]">
                {loadingMessages ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400">Say hello!</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex items-end gap-2 mb-4",
                        msg.senderId === user?.uid ? "justify-end" : "justify-start"
                      )}
                    >
                      {msg.senderId !== user?.uid && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.senderAvatar || undefined} alt={msg.senderName} />
                          <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                            {msg.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          "max-w-[70%] p-3 rounded-lg",
                          msg.senderId === user?.uid
                            ? "bg-[hsl(var(--primary-color))] text-white rounded-br-none"
                            : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                        )}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className="text-xs opacity-75 mt-1 block">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {msg.senderId === user?.uid && (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={msg.senderAvatar || undefined} alt={msg.senderName} />
                          <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                            {msg.senderName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <Input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  disabled={loadingMessages}
                />
                <Button type="submit" disabled={loadingMessages || !newMessage.trim()} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
                  <Send size={20} />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 p-4 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare size={64} className="mb-4" />
              <p className="text-lg">Select a chat to start messaging.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;