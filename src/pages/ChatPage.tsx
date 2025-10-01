"use client";

import React, { useEffect } from 'react';
import { useChat } from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import ChatInterface from '@/components/ChatInterface'; // Import ChatInterface

const ChatPage: React.FC = () => {
  const {
    chatRooms,
    selectedChatRoomId,
    selectChatRoom,
    loading: chatLoading,
    error: chatError,
  } = useChat();
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();

  const loading = chatLoading || authLoading;

  useEffect(() => {
    // Automatically select the first chat room if none is selected and rooms exist
    if (!selectedChatRoomId && chatRooms.length > 0) {
      selectChatRoom(chatRooms[0].id);
    }
  }, [chatRooms, selectedChatRoomId, selectChatRoom]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center">
          <p className="text-red-500">Please sign in to view your chats.</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error loading chats: {chatError}</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8 flex flex-col md:flex-row gap-4">
        {/* Chat Rooms Sidebar */}
        <Card className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 h-[calc(100vh-150px)]">
          <CardHeader>
            <CardTitle className="text-xl">Your Chats</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-250px)]">
              {chatRooms.length === 0 ? (
                <p className="p-4 text-gray-500 dark:text-gray-400 text-center">No chat rooms yet.</p>
              ) : (
                chatRooms.map((room) => {
                  // Determine the other participant's info
                  const otherParticipantIndex = room.participants.findIndex(
                    (pId) => pId !== user?.uid,
                  );
                  const otherParticipantName =
                    otherParticipantIndex !== -1
                      ? room.participantNames[otherParticipantIndex]
                      : 'Unknown User';
                  const otherParticipantAvatar =
                    otherParticipantIndex !== -1
                      ? room.participantAvatars[otherParticipantIndex]
                      : undefined;

                  return (
                    <div
                      key={room.id}
                      onClick={() => selectChatRoom(room.id)}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700",
                        selectedChatRoomId === room.id && "bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-600"
                      )}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={otherParticipantAvatar || undefined} alt={otherParticipantName} />
                        <AvatarFallback className="bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {otherParticipantName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{otherParticipantName}</p>
                        {room.lastMessage && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {room.lastMessage}
                          </p>
                        )}
                      </div>
                      {room.lastMessageTimestamp && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(room.lastMessageTimestamp).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="flex-1 h-[calc(100vh-150px)]">
          {selectedChatRoomId ? (
            <ChatInterface chatRoomId={selectedChatRoomId} />
          ) : (
            <Card className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
              <CardContent>Select a chat to start messaging.</CardContent>
            </Card>
          )}
        </div>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default ChatPage;