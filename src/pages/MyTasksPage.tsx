import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useModal } from '@/components/ModalProvider'; // Import useModal
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Tag, DollarSign, MessageSquare, CheckCircle, User, Clock, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useChat } from '@/hooks/use-chat';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { DEFAULT_TASK_IMAGE_URL, DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile: currentUserProfile } = useSupabaseProfile();
  const { tasks, loading: tasksLoading, error: tasksError, cancelTask } = useTasks();
  const { createChatRoom } = useChat();
  const { openReviewTaskModal } = useModal(); // Get openReviewTaskModal from useModal

  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [taskToCancel, setTaskToCancel] = React.useState<string | null>(null);

  const isLoading = authLoading || tasksLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your tasks...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your posted tasks.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const myPostedTasks = tasks.filter(task => task.posterId === user.id);

  const handleChatWithTasker = async (taskerId: string) => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to start a chat.");
      return;
    }
    if (user.id === taskerId) {
      toast.info("You cannot chat with yourself.");
      navigate('/chat');
      return;
    }

    try {
      const roomId = await createChatRoom(taskerId);
      if (roomId) {
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  const confirmCancelTask = (taskId: string) => {
    setTaskToCancel(taskId);
    setIsCancelDialogOpen(true);
  };

  const handleCancelTask = async () => {
    if (!taskToCancel) return;
    try {
      await cancelTask(taskToCancel);
      setIsCancelDialogOpen(false);
      setTaskToCancel(null);
    } catch (error) {
      // Error handled by useTasks hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Posted Tasks</h1>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}

        {myPostedTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't posted any tasks yet.</p>
            <Button onClick={() => navigate('/post-task')} className="bg-green-600 hover:bg-green-700 text-white">
              Post a New Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPostedTasks.map((task) => (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={task.imageUrl || DEFAULT_TASK_IMAGE_URL} 
                    alt={task.title} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_TASK_IMAGE_URL;
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <div className={cn(
                    "absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold",
                    task.status === 'open' && 'bg-blue-600 text-white',
                    task.status === 'assigned' && 'bg-yellow-600 text-white',
                    task.status === 'completed' && 'bg-green-600 text-white',
                    task.status === 'cancelled' && 'bg-gray-600 text-white'
                  )}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                  <p className="text-gray-600 flex items-center mb-2">
                    <MapPin size={16} className="mr-2" /> {task.location}
                  </p>
                  <p className="text-gray-600 flex items-center mb-2">
                    <Tag size={16} className="mr-2" /> {task.category}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mb-4">₱{task.budget.toLocaleString()}</p>
                  {task.assignedTaskerName && (
                    <div className="flex items-center gap-2 mb-4">
                      <img 
                        src={task.assignedTaskerAvatar || DEFAULT_AVATAR_URL} 
                        alt={task.assignedTaskerName} 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-300" 
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_AVATAR_URL;
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <span className="font-medium text-gray-700 dark:text-gray-300">Assigned: {task.assignedTaskerName}</span>
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white w-full">
                      View Task Details
                    </Button>
                    {task.status === 'assigned' && task.assignedTaskerId && (
                      <>
                        <Button
                          onClick={() => handleChatWithTasker(task.assignedTaskerId!)}
                          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full"
                        >
                          <MessageSquare size={20} /> Chat with Tasker
                        </Button>
                        <Button
                          onClick={() => openReviewTaskModal(task)} // Open review modal
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full"
                        >
                          <CheckCircle size={20} /> Mark as Complete & Review
                        </Button>
                      </>
                    )}
                    {task.status === 'open' && (
                      <Button
                        onClick={() => confirmCancelTask(task.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 w-full"
                      >
                        <Ban size={20} /> Cancel Task
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Badge className="bg-green-500 text-white text-center py-2 text-base flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> Task Completed!
                      </Badge>
                    )}
                    {task.status === 'cancelled' && (
                      <Badge className="bg-gray-500 text-white text-center py-2 text-base flex items-center justify-center gap-2">
                        <Ban size={20} /> Task Cancelled
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Task Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure you want to cancel this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will change the task status to 'cancelled' and unassign any accepted tasker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Task</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelTask} className="bg-red-600 hover:bg-red-700 text-white">
              Confirm Cancellation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTasksPage;