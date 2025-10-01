import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { useChat } from '@/hooks/use-chat';
import { useTaskerProfile } from '@/hooks/use-tasker-profile'; // To fetch tasker details
import { toast } from 'sonner';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { recipientId } = useParams<{ recipientId: string }>();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { messages, loading: chatLoading, error: chatError, sendMessage, getConversationId } = useChat();
  const { fetchTaskerProfileById } = useTaskerProfile(); // To get recipient's display name
  const [newMessageText, setNewMessageText] = useState('');
  const [recipientDisplayName, setRecipientDisplayName] = useState('Loading...');
  const [recipientAvatar, setRecipientAvatar] = useState<string | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversationId = user && recipientId ? getConversationId(user.uid, recipientId) : undefined;

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      toast.error("Please log in to access chat.");
      navigate('/profile'); // Redirect to profile/login if not authenticated
      return;
    }

    const loadRecipientDetails = async () => {
      if (recipientId) {
        if (recipientId === 'support-team') {
          setRecipientDisplayName('Support Team');
          setRecipientAvatar('https://randomuser.me/api/portraits/lego/5.jpg'); // Generic support avatar
        } else {
          const tasker = await fetchTaskerProfileById(recipientId);
          if (tasker) {
            setRecipientDisplayName(tasker.displayName);
            setRecipientAvatar(tasker.photoURL);
          } else {
            // Fallback if recipient is not a tasker (e.g., another client)
            // In a full app, you'd fetch from a general user profiles collection
            setRecipientDisplayName('Unknown User');
            setRecipientAvatar(undefined);
          }
        }
      } else {
        setRecipientDisplayName('Select a Chat');
        setRecipientAvatar(undefined);
      }
    };

    loadRecipientDetails();
  }, [recipientId, fetchTaskerProfileById, isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessageText.trim() === '') return;
    if (!user || !conversationId || !recipientId) {
      toast.error("Cannot send message. User or conversation not identified.");
      return;
    }

    try {
      await sendMessage(conversationId, recipientId, newMessageText);
      setNewMessageText('');
    } catch (error) {
      // Error handled by useChat hook
    }
  };

  const filteredMessages = messages.filter(msg => msg.conversationId === conversationId);

  if (authLoading || chatLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading chat...</div>;
  }

  if (chatError) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {chatError}</div>;
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] flex flex-col">
      <div className="container mx-auto px-4 flex-grow flex flex-col max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate(-1)} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
            <ArrowLeft size={20} className="mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold text-green-600 text-center flex-grow">Chat</h1>
          <div className="w-10"></div> {/* Spacer to balance the back button */}
        </div>

        <Card className="flex-grow flex flex-col shadow-lg rounded-lg overflow-hidden">
          <CardContent className="flex-grow p-4 flex flex-col">
            <div className="flex items-center gap-3 border-b pb-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={recipientAvatar} alt={recipientDisplayName} />
                <AvatarFallback>{recipientDisplayName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{recipientDisplayName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Online</p> {/* Placeholder for online status */}
              </div>
            </div>

            <ScrollArea className="flex-grow pr-4 mb-4">
              <div className="space-y-4">
                {filteredMessages.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 italic">No messages yet. Start the conversation!</p>
                ) : (
                  filteredMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          msg.senderId === user.uid
                            ? 'bg-green-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        <span className={`text-xs mt-1 block ${msg.senderId === user.uid ? 'text-green-100' : 'text-gray-500 dark:text-gray-300'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-auto">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-grow"
                disabled={!conversationId}
              />
              <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 text-white" disabled={!conversationId || newMessageText.trim() === ''}>
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