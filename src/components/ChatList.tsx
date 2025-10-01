import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, User as UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const ChatList: React.FC = () => {
  const { conversations, loading, error } = useChat();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-8 text-gray-600 dark:text-gray-400">Loading conversations...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading conversations: {error}</div>;
  }

  const getOtherParticipant = (conversation: any) => {
    if (!user) return null;
    const otherParticipantId = conversation.participants.find((p: string) => p !== user.uid);
    const otherParticipantName = conversation.participantNames[conversation.participants.indexOf(otherParticipantId)];
    return { id: otherParticipantId, name: otherParticipantName };
  };

  return (
    <div className="space-y-4">
      {conversations.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <MessageSquare size={48} className="text-green-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">No conversations yet.</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">Start a chat from a tasker's profile or a task detail page.</p>
        </div>
      ) : (
        conversations.map((conv) => {
          const otherParticipant = getOtherParticipant(conv);
          const lastMessageTime = new Date(conv.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const currentUserUnreadCount = user && conv.unreadCount ? conv.unreadCount[user.uid] || 0 : 0;


          return (
            <Card
              key={conv.id}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 shadow-sm"
              onClick={() => navigate(`/chat/${conv.id}`)}
            >
              <CardContent className="p-4 flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-green-500">
                  {/* In a real app, you'd fetch the other participant's avatar */}
                  <AvatarImage src={`https://i.pravatar.cc/150?u=${otherParticipant?.id}`} alt={otherParticipant?.name} />
                  <AvatarFallback className="bg-green-200 text-green-800 text-lg font-semibold">
                    {otherParticipant?.name ? otherParticipant.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{otherParticipant?.name || 'Unknown User'}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{lastMessageTime}</span>
                  </div>
                  <p className={cn("text-sm text-gray-600 dark:text-gray-300 truncate", currentUserUnreadCount > 0 && "font-bold text-gray-800 dark:text-gray-100")}>
                    {conv.lastMessage}
                  </p>
                </div>
                {currentUserUnreadCount > 0 && (
                  <Badge className="bg-green-500 text-white rounded-full px-2 py-1 text-xs font-bold">
                    {currentUserUnreadCount}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
};

export default ChatList;