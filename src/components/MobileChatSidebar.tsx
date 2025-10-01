"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import ChatRoomsList from './ChatRoomsList';
import UserSearchAndChat from './UserSearchAndChat';
// Removed ResizableHandle, ResizablePanel, ResizablePanelGroup as they are not ideal for mobile sheets

const MobileChatSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRoomSelect = () => {
    setIsOpen(false); // Close the sheet when a chat room is selected
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden fixed top-20 left-4 z-50">
          <Menu className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col w-full sm:max-w-sm p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Chats & Users</SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Directly embedding components for mobile */}
          <Card className="h-1/2 border-none shadow-none flex flex-col">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xl">Your Chats</CardTitle>
            </CardHeader>
            <div className="flex-1 overflow-hidden">
              <ChatRoomsList onRoomSelect={handleRoomSelect} />
            </div>
          </Card>
          <div className="h-2 w-full bg-gray-100 dark:bg-gray-800" /> {/* Simple separator */}
          <Card className="h-1/2 border-none shadow-none flex flex-col">
            <UserSearchAndChat />
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileChatSidebar;