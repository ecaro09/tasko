"use client";

import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import ChatRoomsList from './ChatRoomsList';
import UserSearchAndChat from './UserSearchAndChat';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';

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
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={60} minSize={30}>
              <Card className="h-full border-none shadow-none">
                <CardHeader className="p-4 pb-0">
                  <CardTitle className="text-xl">Your Chats</CardTitle>
                </CardHeader>
                <ChatRoomsList onRoomSelect={handleRoomSelect} />
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={20}>
              <UserSearchAndChat />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileChatSidebar;