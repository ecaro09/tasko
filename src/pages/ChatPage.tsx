import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ArrowLeft, Send, User as UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat, ChatRoom, ChatMessage } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { chatRooms, messages, loadingRooms, loadingMessages, error, sendMessage, fetchMessagesForRoom } = useChat();
  const [selectedRoom, setSelectedRoom] = React.useState<ChatRoom | null>(null);
  const [messageInput, setMessageInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [showRoomsList, setShowRoomsList] = React.useState(true); // For mobile view

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Automatically select the first room if available and no room is selected
  useEffect(() => {
    if (!selectedRoom && chatRooms.length > 0) {
      setSelectedRoom(chatRooms[0]);
      fetchMessagesForRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedRoom, fetchMessagesForRoom]);

  const handleRoomSelect = (room: ChatRoom) => {
    setSelectedRoom(room);
    fetchMessagesForRoom(room.id);
    if (isMobile) {
      setShowRoomsList(false); // Hide room list on mobile after selecting a room
    }
  };

  const handleSendMessage = async () => {
    if (selectedRoom && messageInput.trim()) {
      await sendMessage(selectedRoom.id, messageInput);
      setMessageInput('');
    }
  };

  const getParticipantName = (room: ChatRoom) => {
    if (!user) return "Unknown";
    const otherParticipants = room.participantNames.filter(name => name !== (user.displayName || user.email));
    return otherParticipants.length > 0 ? otherParticipants.join(', ') : "Self Chat";
  };

  const getParticipantAvatar = (room: ChatRoom) => {
    if (!user) return undefined;
    const otherParticipantIds = room.participants.filter(id => id !== user.uid);
    // For simplicity, we'll just use a generic avatar or the first other participant's avatar if available
    // In a real app, you'd fetch the avatar URL for the other participant(s)
    return undefined; // Placeholder
  };

  if (authLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <div className="w-full max-w-md text-center shadow-lg bg-white dark:bg-gray-800 p-8 rounded-lg">
          <h1 className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your chats.</p>
          <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col md:flex-row w-full">
      <div className="container mx-auto px-4 flex flex-grow">
        <div className="flex w-full h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Chat Rooms List (Sidebar) */}
          <div className={cn(
            "w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col",
            isMobile && !showRoomsList && "hidden"
          )}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[hsl(var(--primary-color))]">Chats</h2>
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
                <ArrowLeft size={20} />
              </Button>
            </div>
            <ScrollArea className="flex-grow">
              {loadingRooms ? (
                <p className="p-4 text-gray-500 dark:text-gray-400">Loading chat rooms...</p>
              ) : chatRooms.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-gray-400">No chat rooms yet.</p>
              ) : (
                chatRooms.map(room => (
                  <div
                    key={room.id}
                    className={cn(
                      "flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                      selectedRoom?.id === room.id && "bg-gray-100 dark:bg-gray-700 border-l-4 border-[hsl(var(--primary-color))]"
                    )}
                    onClick={() => handleRoomSelect(room)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getParticipantAvatar(room)} alt={getParticipantName(room)} />
                      <AvatarFallback className="bg-blue-200 text-blue-800">
                        {getParticipantName(room).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{getParticipantName(room)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {room.lastMessage || "Start a conversation"}
                      </p>
                    </div>
                    {room.lastMessageTimestamp && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(room.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Message Area */}
          <div className={cn(
            "flex flex-col w-full md:w-2/3",
            isMobile && showRoomsList && "hidden"
          )}>
            {selectedRoom ? (
              <>
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                  {isMobile && (
                    <Button variant="ghost" size="icon" onClick={() => setShowRoomsList(true)}>
                      <ArrowLeft size={20} />
                    </Button>
                  )}
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={getParticipantAvatar(selectedRoom)} alt={getParticipantName(selectedRoom)} />
                    <AvatarFallback className="bg-blue-200 text-blue-800">
                      {getParticipantName(selectedRoom).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{getParticipantName(selectedRoom)}</h3>
                </div>
                <ScrollArea className="flex-grow p-4 space-y-4">
                  {loadingMessages ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-center text-gray-500 dark:text-gray-400">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex items-end gap-2",
                          message.senderId === user.uid ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.senderId !== user.uid && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                            <AvatarFallback className="bg-gray-200 text-gray-700 text-sm">
                              {message.senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            "max-w-[70%] p-3 rounded-lg",
                            message.senderId === user.uid
                              ? "bg-[hsl(var(--primary-color))] text-white rounded-br-none"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                          )}
                        >
                          <p className="text-sm">{message.text}</p>
                          <span className="text-xs opacity-75 mt-1 block">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {message.senderId === user.uid && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                            <AvatarFallback className="bg-green-200 text-green-800 text-sm">
                              {message.senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-grow"
                    disabled={loadingMessages}
                  />
                  <Button onClick={handleSendMessage} disabled={loadingMessages || !messageInput.trim()} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
                    <Send size={20} />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow text-center p-4">
                <MessageSquare size={64} className="text-gray-400 mb-4" />
                <p className="text-xl text-gray-600 dark:text-gray-400">Select a chat to start messaging</p>
                {isMobile && (
                  <Button onClick={() => setShowRoomsList(true)} className="mt-4 bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
                    View Chats
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;