import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, DollarSign, Briefcase, Calendar, MessageSquare, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { useChat } from '@/hooks/use-chat'; // Import useChat
import { useSupabaseProfile } from '@/hooks/use-supabase-profile'; // Import useSupabaseProfile
import { toast } from 'sonner';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders'; // Import default avatar URL
import { cn } from '@/lib/utils'; // Import cn for conditional class names

const TaskerProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchTaskerProfileById, loading: globalLoading } = useTaskerProfile();
  const { user, isAuthenticated } = useAuth(); // Get current user info
  const { profile: currentUserProfile } = useSupabaseProfile(); // Get current user's Supabase profile
  const { createChatRoom } = useChat(); // Get chat functions

  const [tasker, setTasker] = React.useState<TaskerProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadTasker = async () => {
      if (!id) {
        setError("Tasker ID is missing.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      const fetchedTasker = await fetchTaskerProfileById(id);
      if (fetchedTasker) {
        setTasker(fetchedTasker);
      } else {
        setError("Tasker not found.");
      }
      setLoading(false);
    };

    loadTasker();
  }, [id, fetchTaskerProfileById]);

  const handleChatWithTasker = async () => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to start a chat.");
      return;
    }
    if (!tasker) {
      toast.error("Tasker profile not loaded.");
      return;
    }
    if (user.id === tasker.userId) {
      toast.info("You cannot chat with yourself.");
      navigate('/chat'); // Navigate to chat page
      return;
    }

    try {
      const roomId = await createChatRoom(tasker.userId); // Use simplified createChatRoom
      if (roomId) {
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  if (loading || globalLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading tasker profile...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {error}</div>;
  }

  if (!tasker) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Tasker profile not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-3xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back to Taskers
        </Button>

        <Card className="shadow-lg p-6">
          <CardContent className="flex flex-col items-center text-center p-0">
            <Avatar className="w-32 h-32 mb-4 border-4 border-green-500">
              <AvatarImage 
                src={tasker.photoURL || DEFAULT_AVATAR_URL} 
                alt={tasker.displayName} 
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_AVATAR_URL;
                  e.currentTarget.onerror = null;
                }}
              />
              <AvatarFallback className="bg-green-200 text-green-800 text-5xl font-semibold">
                {tasker.displayName ? tasker.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{tasker.displayName}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-4">
              <Mail size={18} /> {tasker.userId} {/* Using userId as a placeholder for email/contact */}
            </p>

            {/* Rating and Review Count */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={24}
                    className={cn(
                      "transition-colors",
                      i < Math.round(tasker.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                {tasker.rating.toFixed(1)}
              </span>
              <span className="text-gray-600 dark:text-gray-400">
                ({tasker.reviewCount} reviews)
              </span>
            </div>

            <CardDescription className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-prose">
              {tasker.bio}
            </CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-semibold">Hourly Rate:</span> ₱{tasker.hourlyRate.toLocaleString()}/hr
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <Calendar size={20} className="text-green-600" />
                <span className="font-semibold">Joined:</span> {new Date(tasker.dateJoined).toLocaleDateString()}
              </div>
            </div>

            <div className="w-full mb-6">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-center md:justify-start gap-2">
                <Briefcase size={20} /> Skills
              </h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {tasker.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {isAuthenticated && user?.id !== tasker.userId && (
              <Button
                onClick={handleChatWithTasker}
                className="mt-6 bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <MessageSquare size={20} /> Chat with Tasker
              </Button>
            )}
            {!isAuthenticated && (
              <p className="text-sm text-gray-500 mt-4">Log in to chat with this tasker.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskerProfileViewPage;