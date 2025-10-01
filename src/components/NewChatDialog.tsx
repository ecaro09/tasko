"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { showSuccess, showError } from '@/utils/toast';
import { v4 as uuidv4 } from 'uuid'; // For generating mock user IDs

const NewChatDialog: React.FC = () => {
  const { createChatRoom, selectChatRoom } = useChat();
  const { isAuthenticated } = useAuth();
  const [otherUserName, setOtherUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateChat = async () => {
    if (!isAuthenticated) {
      showError("You must be logged in to create a chat room.");
      return;
    }
    if (!otherUserName.trim()) {
      showError("Please enter a name for the other participant.");
      return;
    }

    setIsCreating(true);
    try {
      // For demonstration, generate a mock user ID and use a placeholder avatar
      const mockOtherUserId = uuidv4();
      const mockOtherUserAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserName}`;

      const newRoomId = await createChatRoom(mockOtherUserId, otherUserName, mockOtherUserAvatar);
      if (newRoomId) {
        setOtherUserName('');
        setIsOpen(false);
        selectChatRoom(newRoomId); // Automatically select the new chat room
      }
    } catch (error) {
      console.error("Error creating chat room from dialog:", error);
      showError("Failed to create chat room.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4">Start New Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Start a New Chat</DialogTitle>
          <DialogDescription>
            Enter the name of the person you want to chat with.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={otherUserName}
              onChange={(e) => setOtherUserName(e.target.value)}
              className="col-span-3"
              disabled={isCreating}
            />
          </div>
        </div>
        <Button onClick={handleCreateChat} disabled={isCreating}>
          {isCreating ? "Creating..." : "Create Chat"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default NewChatDialog;