"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { Search, MessageSquarePlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock user data for demonstration purposes
const MOCK_USERS = [
  { id: 'user123', name: 'Alice Smith', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?img=1' },
  { id: 'user456', name: 'Bob Johnson', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?img=2' },
  { id: 'user789', name: 'Charlie Brown', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?img=3' },
  { id: 'user101', name: 'Diana Prince', email: 'diana@example.com', avatar: 'https://i.pravatar.cc/150?img=4' },
  { id: 'user102', name: 'Eve Adams', email: 'eve@example.com', avatar: 'https://i.pravatar.cc/150?img=5' },
];

const UserSearchAndChat: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [foundUsers, setFoundUsers] = useState<typeof MOCK_USERS>([]);
  const { createChatRoom } = useChat();
  const { user } = useAuth();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = MOCK_USERS.filter(
        (mockUser) =>
          mockUser.id !== user?.uid && // Don't show current user in search results
          (mockUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mockUser.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFoundUsers(filtered);
    } else {
      setFoundUsers([]);
    }
  };

  const handleCreateChat = async (otherUserId: string, otherUserName: string, otherUserAvatar: string | null) => {
    await createChatRoom(otherUserId, otherUserName, otherUserAvatar);
    setSearchTerm(''); // Clear search after creating chat
    setFoundUsers([]);
  };

  return (
    <Card className="w-full flex-shrink-0 h-[calc(100vh-150px)]">
      <CardHeader>
        <CardTitle className="text-xl">Find New Chats</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search size={20} />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-380px)]">
          {foundUsers.length === 0 && searchTerm.trim() ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
          ) : foundUsers.length === 0 && !searchTerm.trim() ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Search for users to start a new chat.</p>
          ) : (
            <div className="space-y-2">
              {foundUsers.map((foundUser) => (
                <div key={foundUser.id} className="flex items-center justify-between p-2 border rounded-md bg-gray-50 dark:bg-gray-700">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={foundUser.avatar || undefined} alt={foundUser.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                        {foundUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{foundUser.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{foundUser.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleCreateChat(foundUser.id, foundUser.name, foundUser.avatar)}
                  >
                    <MessageSquarePlus size={16} className="mr-2" /> Start Chat
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserSearchAndChat;