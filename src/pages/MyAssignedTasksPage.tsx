import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTasks, Task } from '@/hooks/use-tasks';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useChat } from '@/hooks/use-chat';
import { useModal } from '@/components/ModalProvider';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Tag, DollarSign, MessageSquare, CheckCircle, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DEFAULT_TASK_IMAGE_URL, DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';

const MyAssignedTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile: currentUserProfile } = useSupabaseProfile();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { createChatRoom } = useChat();
  const { openReviewTaskModal } = useModal(); // To allow tasker to mark as complete (client side)

  const isLoading = authLoading || taskerProfileLoading || tasksLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your assigned tasks...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your assigned tasks.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTasker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Not a Tasker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be registered as a tasker to view assigned tasks.</p>
            <Button onClick={() => navigate('/features-earnings')} className="bg-green-600 hover:bg-green-700 text-white">
              Become a Tasker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedTasks = tasks.filter(task => task.assignedTaskerId === user.id);

  const handleChatWithClient = async (clientId: string) => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to start a chat.");
      return;
    }
    if (user.id === clientId) {
      toast.info("You cannot chat with yourself.");
      navigate('/chat');
      return;
    }

    try {
      const roomId = await createChatRoom(clientId);
      if (roomId) {
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  const handleMarkAsComplete = (task: Task) => {
    // As per current design, only the client (poster) can mark a task as complete and leave a review.
    // This button will inform the tasker about this and suggest contacting the client.
    toast.info("Only the client can mark a task as complete and leave a review. Please coordinate with the client to finalize the task.");
    // Optionally, navigate to chat with client
    handleChatWithClient(task.posterId);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Assigned Tasks</h1>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}

        {assignedTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't been assigned any tasks yet.</p>
            <Button onClick={() => navigate('/browse-taskers')} className="bg-green-600 hover:bg-green-700 text-white">
              Browse Tasks to Offer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignedTasks.map((task) => (
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
                  <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    task.status === 'assigned' ? 'bg-yellow-600 text-white' :
                    'bg-green-600 text-white'
                  }`}>
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
                  <div className="flex items-center gap-2 mb-4">
                    <img 
                      src={task.posterAvatar || DEFAULT_AVATAR_URL} 
                      alt={task.posterName} 
                      className="w-8 h-8 rounded-full object-cover border-2 border-gray-300" 
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300">Client: {task.posterName}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white w-full">
                      View Task Details
                    </Button>
                    {task.status === 'assigned' && (
                      <Button
                        onClick={() => handleChatWithClient(task.posterId)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 w-full"
                      >
                        <MessageSquare size={20} /> Chat with Client
                      </Button>
                    )}
                    {task.status === 'assigned' && (
                      <Button
                        onClick={() => handleMarkAsComplete(task)}
                        className="bg-gray-600 hover:bg-gray-700 text-white flex items-center justify-center gap-2 w-full"
                      >
                        <CheckCircle size={20} /> Mark as Complete (Client Review)
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <Badge className="bg-green-500 text-white text-center py-2 text-base flex items-center justify-center gap-2">
                        <CheckCircle size={20} /> Task Completed!
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAssignedTasksPage;