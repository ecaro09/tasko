import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Mail, DollarSign, Briefcase, Calendar, Star, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth'; // New import
import { useChat } from '@/hooks/use-chat'; // New import
import { toast } from 'sonner'; // New import

const TaskerProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchTaskerProfileById, loading: globalLoading } = useTaskerProfile();
  const { tasks, loading: tasksLoading } = useTasks();
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Get current user info
  const { createChatRoom } = useChat(); // Get chat room creation function

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

  const taskerReviews = React.useMemo(() => {
    if (!tasker || tasksLoading) return [];
    return tasks.filter(
      (task) => task.status === 'completed' && task.assignedTaskerId === tasker.userId && task.review && task.rating
    );
  }, [tasker, tasks, tasksLoading]);

  const averageRating = React.useMemo(() => {
    if (taskerReviews.length === 0) return 0;
    const totalRating = taskerReviews.reduce((sum, task) => sum + (task.rating || 0), 0);
    return (totalRating / taskerReviews.length).toFixed(1);
  }, [taskerReviews]);

  const isCurrentUserTasker = isAuthenticated && user?.uid === tasker?.userId;

  const handleContactTasker = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to contact this tasker.");
      return;
    }
    if (!tasker) {
      toast.error("Tasker information is missing.");
      return;
    }
    if (isCurrentUserTasker) {
      toast.info("You are viewing your own profile.");
      return;
    }

    try {
      const roomId = await createChatRoom(
        [user.uid, tasker.userId],
        [user.displayName || user.email || "You", tasker.displayName]
      );
      if (roomId) {
        navigate('/chat'); // Navigate to the chat page
      }
    } catch (error) {
      console.error("Failed to create or navigate to chat room:", error);
      toast.error("Failed to start chat with tasker.");
    }
  };

  if (loading || globalLoading || tasksLoading || authLoading) {
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
              <AvatarImage src={tasker.photoURL || undefined} alt={tasker.displayName} />
              <AvatarFallback className="bg-green-200 text-green-800 text-5xl font-semibold">
                {tasker.displayName ? tasker.displayName.charAt(0).toUpperCase() : <UserIcon size={48} />}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">{tasker.displayName}</h1>
            <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2 mb-4">
              <Mail size={18} /> {tasker.userId} {/* Using userId as a placeholder for email/contact */}
            </p>

            <CardDescription className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-prose">
              {tasker.bio}
            </CardDescription>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <DollarSign size={20} className="text-green-600" />
                <span className="font-semibold">Hourly Rate:</span> ₱{tasker.hourlyRate.toLocaleString()}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <Calendar size={20} className="text-green-600" />
                <span className="font-semibold">Joined:</span> {new Date(tasker.dateJoined).toLocaleDateString()}
              </div>
            </div>

            {taskerReviews.length > 0 && (
              <div className="w-full mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center justify-center md:justify-start gap-2">
                  <Star size={20} /> Average Rating: {averageRating} ({taskerReviews.length} reviews)
                </h3>
                <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                  {[...Array(5)].map((_, i) => {
                    const starClassName = i < Math.round(parseFloat(averageRating as string))
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300 dark:text-gray-600";
                    return (
                      <Star
                        key={i}
                        size={24}
                        className={cn(
                          "transition-colors",
                          starClassName
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            )}

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

            {taskerReviews.length > 0 && (
              <div className="w-full mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4 text-center md:text-left">Client Reviews</h3>
                <div className="space-y-4">
                  {taskerReviews.map((task, index) => (
                    <Card key={index} className="p-4 shadow-sm">
                      <CardContent className="p-0">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < task.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                          ))}
                          <span className="font-semibold ml-1">{task.rating}/5</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 italic mb-2">"{task.review}"</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          - {task.posterName} for "{task.title}"
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleContactTasker}
              disabled={!isAuthenticated || isCurrentUserTasker}
              className={cn(
                "mt-6 text-lg px-8 py-4 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2",
                !isAuthenticated || isCurrentUserTasker
                  ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <MessageSquare size={24} />
              {isCurrentUserTasker
                ? "This is your profile"
                : isAuthenticated
                  ? "Contact Tasker"
                  : "Login to Contact Tasker"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskerProfileViewPage;