import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks, Task } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import { useOffers } from '@/hooks/use-offers';
import { useChat } from '@/hooks/use-chat';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// Import new modular components
import TaskDetailHeader from '@/components/task-detail/TaskDetailHeader';
import TaskInfoSection from '@/components/task-detail/TaskInfoSection';
import TaskUserCards from '@/components/task-detail/TaskUserCards';
import TaskReviewDisplay from '@/components/task-detail/TaskReviewDisplay';
import TaskerActionButtons from '@/components/task-detail/TaskerActionButtons';
import ClientActionButtons from '@/components/task-detail/ClientActionButtons';
import TaskOffersSection from '@/components/task-detail/TaskOffersSection';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile: currentUserProfile, loadingProfile } = useSupabaseProfile();
  const { tasks, isLoading: tasksLoading, error: tasksError, updateTaskStatus, deleteTask } = useTasks();
  const { offers, loading: offersLoading, addOffer, acceptOffer, rejectOffer, withdrawOffer } = useOffers();
  const { createChatRoom } = useChat();

  const [task, setTask] = useState<Task | null>(null); // Changed type from any to Task | null
  const [userOffer, setUserOffer] = useState<any>(null);
  const [isTaskPoster, setIsTaskPoster] = useState(false);
  const [isAssignedTasker, setIsAssignedTasker] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number[]>([0]);
  const [offerMessage, setOfferMessage] = useState('');
  const [reviewRating, setReviewRating] = useState<number[]>([5]);
  const [reviewComment, setReviewComment] = useState('');

  const isLoading = authLoading || tasksLoading || offersLoading || loadingProfile;

  useEffect(() => {
    if (tasks && tasks.length > 0 && id) { // Check if tasks is defined
      const foundTask = tasks.find(t => t.id === id);
      setTask(foundTask || null); // Ensure it's Task | null
      if (foundTask && user) {
        setIsTaskPoster(foundTask.posterId === user.id);
        setIsAssignedTasker(foundTask.assignedTaskerId === user.id);
      }
    }
  }, [tasks, id, user]);

  useEffect(() => {
    if (offers.length > 0 && id && user) {
      const foundOffer = offers.find(o => o.taskId === id && o.taskerId === user.id);
      setUserOffer(foundOffer);
      if (foundOffer) {
        setOfferAmount([foundOffer.offerAmount]);
        setOfferMessage(foundOffer.message);
      }
    }
  }, [offers, id, user]);

  const handleCreateOffer = async () => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to make an offer.");
      return;
    }
    if (!task) {
      toast.error("Task not found.");
      return;
    }
    if (user.id === task.posterId) {
      toast.error("You cannot make an offer on your own task.");
      return;
    }
    if (!currentUserProfile.is_verified_tasker) {
      toast.error("You must be registered as a tasker to make an offer. Please update your profile.");
      navigate('/profile');
      return;
    }

    try {
      await addOffer(
        task.id,
        task.posterId,
        offerAmount[0],
        offerMessage,
      );
      toast.success("Offer submitted successfully!");
      setOfferMessage('');
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleAcceptOffer = async (offerId: string, taskerId: string) => {
    if (!isAuthenticated || !user || !task || !isTaskPoster) {
      toast.error("You are not authorized to accept this offer.");
      return;
    }
    try {
      await acceptOffer(offerId, task.id);
      toast.success("Offer accepted and task assigned!");
      navigate(`/tasks/${task.id}`); // Refresh page to show updated status
    } catch (error) {
      // Error handled by useOffers/useTasks hooks
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!isAuthenticated || !user || !task || !isTaskPoster) {
      toast.error("You are not authorized to reject this offer.");
      return;
    }
    try {
      await rejectOffer(offerId);
      toast.success("Offer rejected.");
      navigate(`/tasks/${task.id}`); // Refresh page to show updated status
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleWithdrawOffer = async (offerId: string) => {
    if (!isAuthenticated || !user || !task) {
      toast.error("You are not authorized to withdraw this offer.");
      return;
    }
    try {
      await withdrawOffer(offerId);
      toast.success("Offer withdrawn.");
      navigate(`/tasks/${task.id}`); // Refresh page to show updated status
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleCancelTask = async () => {
    if (!isAuthenticated || !user || !task || !isTaskPoster) {
      toast.error("You are not authorized to cancel this task.");
      return;
    }
    try {
      await deleteTask(task.id);
      toast.success("Task cancelled successfully.");
      navigate('/my-tasks');
    } catch (error) {
      // Error handled by useTasks hook
    }
  };

  const handleChatWithUser = async (targetUserId: string) => {
    if (!isAuthenticated || !user || !currentUserProfile) {
      toast.error("You must be logged in to start a chat.");
      return;
    }
    if (user.id === targetUserId) {
      toast.info("You cannot chat with yourself.");
      navigate('/chat');
      return;
    }

    try {
      const roomId = await createChatRoom(targetUserId);
      if (roomId) {
        navigate(`/chat?roomId=${roomId}`);
      }
    } catch (err) {
      // Error handled by useChat hook
    }
  };

  const handleMarkInProgress = async () => {
    if (!isAuthenticated || !user || !task || !isAssignedTasker) {
      toast.error("You are not authorized to mark this task as in progress.");
      return;
    }
    try {
      await updateTaskStatus(task.id, 'in_progress');
      toast.success("Task marked as 'In Progress'!");
      navigate(`/tasks/${task.id}`); // Refresh page to show updated status
    } catch (error) {
      // Error handled by useTasks hook
    }
  };

  const handleMarkCompleteAndReview = async () => {
    if (!isAuthenticated || !user || !task || !isAssignedTasker) {
      toast.error("You are not authorized to mark this task as complete.");
      return;
    }
    try {
      await updateTaskStatus(task.id, 'completed', undefined, {
        rating: reviewRating[0],
        comment: reviewComment,
        reviewerId: user.id,
        reviewedUserId: task.posterId,
      });
      toast.success("Task marked as complete and review submitted!");
      navigate(`/tasks/${task.id}`); // Refresh page to show updated status
    } catch (error) {
      // Error handled by useTasks hook
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading task details...</div>;
  }

  if (tasksError) {
    return <div className="container mx-auto p-4 text-center pt-[80px] text-red-500">Error: {tasksError.message}</div>;
  }

  if (!task) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Task not found.</div>;
  }

  const isTaskOpen = task.status === 'open';
  const isTaskAssigned = task.status === 'assigned';
  const isTaskInProgress = task.status === 'in_progress';
  const isTaskCompleted = task.status === 'completed';
  const isTaskCancelled = task.status === 'cancelled';

  const canMakeOffer = isAuthenticated && !isTaskPoster && isTaskOpen && !userOffer && currentUserProfile?.is_verified_tasker;
  const canEditOffer = isAuthenticated && !isTaskPoster && isTaskOpen && userOffer && userOffer.status === 'pending' && currentUserProfile?.is_verified_tasker;
  const canDeleteOffer = isAuthenticated && !isTaskPoster && isTaskOpen && userOffer && userOffer.status === 'pending' && currentUserProfile?.is_verified_tasker;

  const canAcceptRejectOffers = isTaskPoster && isTaskOpen;
  const canCancelTask = isTaskPoster && (isTaskOpen || isTaskAssigned || isTaskInProgress);
  const canMarkInProgress = isAssignedTasker && isTaskAssigned;
  const canMarkCompleteAndReview = isAssignedTasker && isTaskInProgress;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>

        <Card className="shadow-lg">
          <TaskDetailHeader task={task} />
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <TaskInfoSection task={task} />
                <TaskUserCards
                  task={task}
                  isTaskPoster={isTaskPoster}
                  isAuthenticated={isAuthenticated}
                  currentUserId={user?.id}
                  onChatWithUser={handleChatWithUser}
                />
                {isTaskCompleted && <TaskReviewDisplay task={task} />}

                {/* Tasker Actions */}
                <TaskerActionButtons
                  canMarkInProgress={canMarkInProgress}
                  onMarkInProgress={handleMarkInProgress}
                  canMarkCompleteAndReview={canMarkCompleteAndReview}
                  reviewRating={reviewRating}
                  setReviewRating={setReviewRating}
                  reviewComment={reviewComment}
                  setReviewComment={setReviewComment}
                  onMarkCompleteAndReview={handleMarkCompleteAndReview}
                />

                {/* Client Actions */}
                <ClientActionButtons
                  canCancelTask={canCancelTask}
                  onCancelTask={handleCancelTask}
                />
              </div>

              {/* Offers Section */}
              <div className="lg:col-span-1">
                <TaskOffersSection
                  task={task}
                  offers={offers}
                  userOffer={userOffer}
                  canMakeOffer={canMakeOffer}
                  canEditOffer={canEditOffer}
                  canDeleteOffer={canDeleteOffer}
                  canAcceptRejectOffers={canAcceptRejectOffers}
                  offerAmount={offerAmount}
                  setOfferAmount={setOfferAmount}
                  offerMessage={offerMessage}
                  setOfferMessage={setOfferMessage}
                  onCreateOffer={handleCreateOffer}
                  onAcceptOffer={handleAcceptOffer}
                  onRejectOffer={handleRejectOffer}
                  onWithdrawOffer={handleWithdrawOffer}
                  onChatWithUser={handleChatWithUser}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailPage;