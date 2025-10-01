import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { toast } from 'sonner';

interface Message {
  id: number;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { taskId, otherUserId } = useParams<{ taskId: string; otherUserId: string }>();
  const { tasks, loading: tasksLoading } = useTasks();
  const { user: currentUser, isAuthenticated, loading: authLoading } = useAuth();
  const { fetchTaskerProfileById, loading: taskerProfileLoading } = useTaskerProfile();

  const [chatPartnerName, setChatPartnerName] = useState('Loading...');
  const [chatPartnerAvatar, setChatPartnerAvatar] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(true);

  useEffect(() => {
    const loadChatContext = async () => {
      setLoadingChat(true);
      if (!isAuthenticated || !currentUser) {
        toast.error("You must be logged in to view chats.");
        navigate('/login'); // Redirect to login if not authenticated
        return;
      }

      if (!taskId || !otherUserId) {
        toast.error("Chat context (task or other user) is missing.");
        navigate(-1); // Go back if context is missing
        return;
      }

      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        toast.error("Task not found for this chat.");
        navigate(-1);
        return;
      }

      let partnerDisplayName = "Unknown User";
      let partnerPhotoURL: string | undefined = undefined;

      // Determine if the other user is the task poster or a tasker
      if (task.posterId === otherUserId) {
        // Chatting with the task poster
        partnerDisplayName = task.posterName;
        partnerPhotoURL = task.posterAvatar;
      } else {
        // Chatting with a tasker
        const partnerProfile = await fetchTaskerProfileById(otherUserId);
        if (partnerProfile) {
          partnerDisplayName = partnerProfile.displayName;
          partnerPhotoURL = partnerProfile.photoURL;
        } else {
          toast.error("Chat partner profile not found.");
          navigate(-1);
          return;
        }
      }

      setChatPartnerName(partnerDisplayName);
      setChatPartnerAvatar(partnerPhotoURL);

      // Generate initial dummy messages based on task context
      const initialDummyMessages: Message[] = [
        { id: 1, sender: 'other', text: `Hi! I'm interested in your task: "${task.title}". Can you tell me more?`, timestamp: "10:00 AM" },
        { id: 2, sender: 'me', text: `Sure! For "${task.title}", it's about ${task.description}. My budget is ₱${task.budget.toLocaleString()}.`, timestamp: "10:05 AM" },
        { id: 3, sender: 'other', text: `Okay, I can do that for ₱${(task.budget * 0.9).toLocaleString()}. I'm available on ${new Date(task.datePosted).toLocaleDateString()}.`, timestamp: "10:10 AM" },
        { id: 4, sender: 'me', text: "That sounds good. Let's confirm the details.", timestamp: "10:15 AM" },
      ];
      setMessages(initialDummyMessages);
      setLoadingChat(false);
    };

    if (!tasksLoading && !authLoading && !taskerProfileLoading) {
      loadChatContext();
    }
  }, [taskId, otherUserId, tasks, currentUser, isAuthenticated, tasksLoading, authLoading, taskerProfileLoading, fetchTaskerProfileById, navigate]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: 'me',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prevMessages) => [...prevMessages, newMsg]);
      setNewMessage('');
    }
  };

  if (loadingChat || tasksLoading || authLoading || taskerProfileLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading chat...</div>;
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
                <AvatarImage src={chatPartnerAvatar} alt={chatPartnerName} />
                <AvatarFallback>{chatPartnerName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{chatPartnerName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
              </div>
            </div>

            <ScrollArea className="flex-grow pr-4 mb-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        msg.sender === 'me'
                          ? 'bg-green-600 text-white rounded-br-none'
                          : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-100 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <span className={`text-xs mt-1 block ${msg.sender === 'me' ? 'text-green-100' : 'text-gray-500 dark:text-gray-300'}`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-auto">
              <Input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage();
                  }
                }}
                className="flex-grow"
              />
              <Button onClick={handleSendMessage} className="bg-green-600 hover:bg-green-700 text-white">
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