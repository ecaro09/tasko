import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Send, UserPlus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat, ChatRoom, ChatMessage } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    chatRooms,
    messages,
    loadingRooms,
    loadingMessages,
    error,
    sendMessage,
    createChatRoom,
    fetchMessagesForRoom,
  } = useChat();
  const isMobile = useIsMobile();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedRoomId) {
      fetchMessagesForRoom(selectedRoomId);
    }
  }, [selectedRoomId, fetchMessagesForRoom]);

  useEffect(() => {
    // Scroll to bottom of messages when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (authLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading authentication...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your chats.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSendMessage = async () => {
    if (!selectedRoomId || !newMessage.trim()) {
      toast.error("Please select a chat and type a message.");
      return;
    }
    try {
      await sendMessage(selectedRoomId, newMessage);
      setNewMessage('');
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  const handleCreateNewChat = async () => {
    // This is a placeholder. In a real app, you'd open a modal to select participants.
    toast.info("Creating new chat is coming soon! For now, chats are created when an offer is accepted.");
    // Example: await createChatRoom([user.uid, 'otherUserId'], [user.displayName || 'You', 'Other User']);
  };

  const getOtherParticipantName = (room: ChatRoom) => {
    const otherParticipants = room.participantNames.filter(name => name !== (user?.displayName || user?.email));
    return otherParticipants.length > 0 ? otherParticipants.join(', ') : 'Unknown User';
  };

  const getOtherParticipantAvatar = (room: ChatRoom) => {
    const otherParticipantId = room.participants.find(id => id !== user?.uid);
    // In a real app, you'd fetch the avatar URL for `otherParticipantId` from user profiles
    // For now, we'll use a generic one or the current user's if no other is found.
    return `https://api.dicebear.com/7.x/initials/svg?seed=${otherParticipantId || 'user'}`;
  };

  const selectedRoom = chatRooms.find(room => room.id === selectedRoomId);

  const ChatRoomsList: React.FC = () => (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <MessageSquare size={24} className="text-[hsl(var(--primary-color))]" /> Chats
        </CardTitle>
        <Button variant="outline" size="icon" onClick={handleCreateNewChat} className="text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
          <UserPlus size={20} />
        </Button>
      </CardHeader>
      <ScrollArea className="flex-1 p-2">
        {loadingRooms ? (
          <p className="text-center text-gray-500 italic py-4">Loading chat rooms...</p>
        ) : chatRooms.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No chat rooms yet. Start a task or make an offer!</p>
        ) : (
          chatRooms.map((room) => (
            <div
              key={room.id}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg cursor-pointer mb-2 transition-colors",
                selectedRoomId === room.id ? "bg-[rgba(0,168,45,0.1)] border border-[hsl(var(--primary-color))]" : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
              onClick={() => setSelectedRoomId(room.id)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={getOtherParticipantAvatar(room)} alt={getOtherParticipantName(room)} />
                <AvatarFallback className="bg-gray-200 text-gray-800">
                  {getOtherParticipantName(room).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{getOtherParticipantName(room)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {room.lastMessage || "No messages yet."}
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
    </Card>
  );

  const MessageView: React.FC = () => (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedRoomId(null)} className="text-[hsl(var(--text-dark))] dark:text-gray-100">
              <ArrowLeft size={20} />
            </Button>
          )}
          <Avatar className="w-10 h-10">
            <AvatarImage src={selectedRoom ? getOtherParticipantAvatar(selectedRoom) : undefined} alt={selectedRoom ? getOtherParticipantName(selectedRoom) : "Chat"} />
            <AvatarFallback className="bg-gray-200 text-gray-800">
              {selectedRoom ? getOtherParticipantName(selectedRoom).charAt(0).toUpperCase() : <MessageSquare size={20} />}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
            {selectedRoom ? getOtherParticipantName(selectedRoom) : "Select a Chat"}
          </CardTitle>
        </div>
        {/* Add options like call, view profile etc. here */}
      </CardHeader>
      <ScrollArea className="flex-1 p-4">
        {loadingMessages ? (
          <p className="text-center text-gray-500 italic py-4">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 italic py-4">No messages yet. Start the conversation!</p>
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
                  <AvatarFallback className="bg-gray-200 text-gray-800 text-xs">
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
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={!selectedRoomId}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!selectedRoomId || !newMessage.trim()} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
            <Send size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto h-[calc(100vh-160px)] max-w-5xl flex flex-col md:flex-row gap-4">
        {isMobile ? (
          selectedRoomId ? (
            <MessageView />
          ) : (
            <ChatRoomsList />
          )
        ) : (
          <>
            <div className="w-1/3">
              <ChatRoomsList />
            </div>
            <div className="w-2/3">
              {selectedRoomId ? (
                <MessageView />
              ) : (
                <Card className="h-full flex items-center justify-center text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg">Select a chat to start messaging.</p>
                </Card>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;