import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useChat, Conversation, Message } from '@/hooks/use-chat';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Send, MessageSquare, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { conversationId: routeConversationId } = useParams<{ conversationId?: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    conversations,
    messages,
    loadingConversations,
    loadingMessages,
    error,
    fetchMessages,
    sendMessage,
    markConversationAsRead,
  } = useChat();

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle initial conversation selection from URL or first conversation
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error("Please log in to view your chats.");
      navigate('/');
      return;
    }

    if (conversations.length > 0 && !selectedConversation) {
      if (routeConversationId) {
        const convoFromRoute = conversations.find(c => c.id === routeConversationId);
        if (convoFromRoute) {
          setSelectedConversation(convoFromRoute);
          fetchMessages(convoFromRoute.id);
          markConversationAsRead(convoFromRoute.id);
        } else {
          // If route ID doesn't exist, default to the first conversation
          setSelectedConversation(conversations[0]);
          fetchMessages(conversations[0].id);
          markConversationAsRead(conversations[0].id);
          navigate(`/chat/${conversations[0].id}`, { replace: true });
        }
      } else {
        // No route ID, default to the first conversation
        setSelectedConversation(conversations[0]);
        fetchMessages(conversations[0].id);
        markConversationAsRead(conversations[0].id);
        navigate(`/chat/${conversations[0].id}`, { replace: true });
      }
    } else if (conversations.length === 0 && !loadingConversations && !authLoading) {
      setSelectedConversation(null); // No conversations available
    }
  }, [conversations, routeConversationId, isAuthenticated, authLoading, selectedConversation, fetchMessages, markConversationAsRead, navigate]);

  // Update messages when selected conversation changes
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
      navigate(`/chat/${selectedConversation.id}`, { replace: true });
    }
  }, [selectedConversation, fetchMessages, markConversationAsRead, navigate]);

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleConversationSelect = (convo: Conversation) => {
    setSelectedConversation(convo);
    setNewMessage(''); // Clear message input when switching conversations
  };

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await sendMessage(selectedConversation.id, newMessage);
      setNewMessage('');
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user) return null;
    const otherParticipantId = conversation.participants.find(id => id !== user.uid);
    if (!otherParticipantId) return null;

    const otherParticipantName = conversation.participantNames.find(name => name !== (user.displayName || user.email || "Anonymous"));
    const otherParticipantAvatar = conversation.participantAvatars[otherParticipantId];

    return {
      id: otherParticipantId,
      name: otherParticipantName || 'Unknown',
      avatar: otherParticipantAvatar,
    };
  };

  if (authLoading || loadingConversations) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px]">Loading chats...</div>;
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

  const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col md:flex-row pt-[60px] pb-[var(--safe-area-bottom)] md:pb-0">
      {/* Conversation List (Sidebar) */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-xl font-bold text-[hsl(var(--primary-color))] flex-grow text-center md:text-left">Chats</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !loadingConversations ? (
            <p className="text-center text-gray-500 dark:text-gray-400 p-4">No conversations yet.</p>
          ) : (
            conversations.map((convo) => {
              const other = getOtherParticipant(convo);
              const unreadCount = convo.unreadCount?.[user.uid] || 0;
              return (
                <div
                  key={convo.id}
                  className={cn(
                    "flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                    selectedConversation?.id === convo.id && "bg-gray-100 dark:bg-gray-700"
                  )}
                  onClick={() => handleConversationSelect(convo)}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={other?.avatar || undefined} alt={other?.name} />
                    <AvatarFallback className="bg-blue-200 text-blue-800">
                      {other?.name ? other.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{other?.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{convo.lastMessage || "No messages yet."}</p>
                  </div>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
        {selectedConversation && otherParticipant ? (
          <>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)} className="md:hidden">
                <ArrowLeft size={20} />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarImage src={otherParticipant.avatar || undefined} alt={otherParticipant.name} />
                <AvatarFallback className="bg-blue-200 text-blue-800">
                  {otherParticipant.name ? otherParticipant.name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{otherParticipant.name}</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Loading messages...</p>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">Start a conversation!</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex items-end gap-2",
                      message.senderId === user?.uid ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.senderId !== user?.uid && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                        <AvatarFallback className="bg-gray-200 text-gray-800 text-xs">
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        "max-w-[70%] p-3 rounded-lg",
                        message.senderId === user?.uid
                          ? "bg-[hsl(var(--primary-color))] text-white rounded-br-none"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none"
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <span className="text-xs opacity-75 mt-1 block text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {message.senderId === user?.uid && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={message.senderAvatar || undefined} alt={message.senderName} />
                        <AvatarFallback className="bg-green-200 text-green-800 text-xs">
                          {message.senderName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
                disabled={loadingMessages}
              />
              <Button onClick={handleSendMessage} disabled={loadingMessages || !newMessage.trim()} className="bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white">
                <Send size={20} />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <MessageSquare size={64} className="text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Select a conversation</h3>
            <p className="text-gray-600 dark:text-gray-400">Choose a chat from the sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;