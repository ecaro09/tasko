import React, { useEffect, useRef } from 'react';
import { useChat, ChatMessage } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, User as UserIcon, ArrowLeft } from 'lucide-react'; // Imported ArrowLeft
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Imported CardHeader
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/lib/utils';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';

interface ChatMessageViewProps {
  roomId: string;
  onBack: () => void;
}

const ChatMessageView: React.FC<ChatMessageViewProps> = ({ roomId, onBack }) => {
  const { user } = useAuth();
  const { messages, loadingMessages, error, getMessagesForRoom, sendMessage, chatRooms } = useChat();
  const { fetchProfile } = useSupabaseProfile();
  const [newMessage, setNewMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [participantProfiles, setParticipantProfiles] = React.useState<Record<string, { name: string; avatar: string | null }>>({});

  const currentRoom = chatRooms.find(room => room.id === roomId);

  React.useEffect(() => {
    if (roomId) {
      getMessagesForRoom(roomId);
    }
  }, [roomId, getMessagesForRoom]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  React.useEffect(() => {
    const loadParticipantProfiles = async () => {
      if (currentRoom) {
        const profiles: Record<string, { name: string; avatar: string | null }> = {};
        for (const participantId of currentRoom.participants) {
          const profile = await fetchProfile(participantId);
          profiles[participantId] = {
            name: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.id || "Unknown User",
            avatar: profile?.avatar_url || DEFAULT_AVATAR_URL,
          };
        }
        setParticipantProfiles(profiles);
      }
    };
    loadParticipantProfiles();
  }, [currentRoom, fetchProfile]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && user) {
      await sendMessage(roomId, newMessage.trim());
      setNewMessage('');
    }
  };

  if (loadingMessages) {
    return <div className="p-4 text-center text-gray-500 dark:text-gray-400">Loading messages...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500 dark:text-red-400">Error: {error}</div>;
  }

  const getParticipantName = (senderId: string) => {
    if (senderId === user?.id) return "You";
    return participantProfiles[senderId]?.name || "Unknown User";
  };

  const getParticipantAvatar = (senderId: string) => {
    if (senderId === user?.id) return user?.user_metadata?.avatar_url || DEFAULT_AVATAR_URL;
    return participantProfiles[senderId]?.avatar || DEFAULT_AVATAR_URL;
  };

  const otherParticipant = currentRoom?.participants.find(pId => pId !== user?.id);
  const chatTitle = otherParticipant ? participantProfiles[otherParticipant]?.name : "Chat";

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b dark:border-gray-700">
        <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
          <ArrowLeft size={20} />
        </Button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex-1 text-center lg:text-left">
          {chatTitle}
        </h2>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-end gap-3",
                  message.senderId === user?.id ? "justify-end" : "justify-start"
                )}
              >
                {message.senderId !== user?.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={getParticipantAvatar(message.senderId)} 
                      alt={getParticipantName(message.senderId)} 
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <AvatarFallback className="bg-gray-200 text-gray-600">
                      {getParticipantName(message.senderId).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] p-3 rounded-lg shadow-sm",
                    message.senderId === user?.id
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                  <span className="block text-xs opacity-75 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.senderId === user?.id && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={getParticipantAvatar(message.senderId)} 
                      alt={getParticipantName(message.senderId)} 
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <AvatarFallback className="bg-blue-200 text-blue-800">
                      {getParticipantName(message.senderId).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>
      <div className="p-4 border-t dark:border-gray-700 flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
          <Send size={20} />
        </Button>
      </div>
    </Card>
  );
};

export default ChatMessageView;