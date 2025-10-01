"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from "@/components/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { MapPin, DollarSign, Briefcase, MessageCircle } from 'lucide-react';
import { useChat } from '@/hooks/use-chat';
import { toast } from 'sonner';

const TaskerProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // This is the tasker's UID
  const navigate = useNavigate();
  const { isAuthenticated, user, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { getAllTaskerProfiles, loading: taskerProfileHookLoading } = useTaskerProfile();
  const { createOrGetChatRoom, selectChatRoom } = useChat();

  const [tasker, setTasker] = useState<TaskerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasker = async () => {
      if (!id) {
        setError("Tasker ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const allTaskers = await getAllTaskerProfiles();
        const foundTasker = allTaskers.find(t => t.uid === id);
        if (foundTasker) {
          setTasker(foundTasker);
        } else {
          setError("Tasker not found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load tasker profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasker();
  }, [id, getAllTaskerProfiles]);

  const handleChatWithTasker = async () => {
    if (!isAuthenticated || !user || !tasker) {
      toast.error("You must be logged in to chat with a tasker.");
      return;
    }

    if (user.uid === tasker.uid) {
      toast.info("You cannot chat with yourself.");
      return;
    }

    try {
      const chatRoomId = await createOrGetChatRoom(
        [user.uid, tasker.uid],
        [user.displayName || 'You', tasker.displayName],
        [user.photoURL || undefined, tasker.photoURL || undefined]
      );

      if (chatRoomId) {
        selectChatRoom(chatRoomId);
        navigate('/chat');
      }
    } catch (err: any) {
      console.error("Error initiating chat:", err);
      toast.error(`Failed to initiate chat: ${err.message}`);
    }
  };

  if (loading || authLoading || taskerProfileHookLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading tasker profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error: {error}</p>
          <Button onClick={() => navigate('/browse-taskers')} className="mt-4">
            Back to Browse Taskers
          </Button>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  if (!tasker) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Tasker profile not found.</p>
          <Button onClick={() => navigate('/browse-taskers')} className="mt-4">
            Back to Browse Taskers
          </Button>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
          &larr; Back to Browse Taskers
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-col md:flex-row items-center gap-6 pb-4">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-blue-500">
              <AvatarImage src={tasker.photoURL || undefined} alt={tasker.displayName} />
              <AvatarFallback className="bg-blue-500 text-white text-4xl">
                {tasker.displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <CardTitle className="text-3xl font-bold mb-1">{tasker.displayName}</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 text-lg">Professional Tasker</CardDescription>
              <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-700 dark:text-gray-300">
                <MapPin size={20} /> {tasker.location}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">About Me</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tasker.bio}</p>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {tasker.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="px-4 py-2 text-base">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Rates & Availability</h3>
                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><DollarSign size={20} /> <strong>Hourly Rate:</strong> ₱{tasker.hourlyRate.toLocaleString()}/hr</p>
                  <p className="flex items-center gap-2"><Briefcase size={20} /> <strong>Member Since:</strong> {new Date(tasker.dateRegistered).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-col justify-end gap-4">
                {isAuthenticated && user?.uid !== tasker.uid ? (
                  <Button onClick={handleChatWithTasker} className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2">
                    <MessageCircle size={20} /> Chat with {tasker.displayName.split(' ')[0]}
                  </Button>
                ) : isAuthenticated && user?.uid === tasker.uid ? (
                  <Button onClick={() => navigate('/profile')} className="w-full bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2">
                    View Your Profile
                  </Button>
                ) : (
                  <Button onClick={signInWithGoogle} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2">
                    Sign In to Chat
                  </Button>
                )}
                {/* Placeholder for "View Posted Tasks" or "Hire Tasker" */}
                <Button variant="outline" className="w-full border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
                  View Posted Tasks (Coming Soon)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default TaskerProfileViewPage;