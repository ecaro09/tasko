import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowLeft, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: number;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'other', text: "Hi! I'm interested in your house cleaning task. Can you tell me more about the scope?", timestamp: "10:00 AM" },
    { id: 2, sender: 'me', text: "Sure! It's a 2-bedroom apartment, mostly general cleaning, kitchen, and bathroom. Looking for someone this weekend.", timestamp: "10:05 AM" },
    { id: 3, sender: 'other', text: "Great! I'm available Saturday morning. My rate is ₱1200 for a 2-bedroom. Does that work for you?", timestamp: "10:10 AM" },
    { id: 4, sender: 'me', text: "That sounds good. Let's confirm the details.", timestamp: "10:15 AM" },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const newMsg: Message = {
        id: messages.length + 1,
        sender: 'me',
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

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
                <AvatarImage src="https://randomuser.me/api/portraits/men/75.jpg" alt="Tasker Name" />
                <AvatarFallback>TS</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">Tasker John Doe</p>
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