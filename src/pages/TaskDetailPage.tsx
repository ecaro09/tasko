import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import { useOffers } from '@/hooks/use-offers';
import { useChat } from '@/hooks/use-chat';
import { useSupabaseProfile } from '@/hooks/use-supabase-profile';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Tag, DollarSign, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { DEFAULT_TASK_IMAGE_URL, DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import { cn } from '@/lib/utils';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile: currentUserProfile, loadingProfile } = useSupabaseProfile();
  const { tasks, loading: tasksLoading, error: tasksError, updateTaskStatus, deleteTask } = useTasks();
  const { offers, loading: offersLoading, addOffer, acceptOffer, rejectOffer, withdrawOffer } = useOffers(); // Updated function names
  const { createChatRoom } = useChat();

  const [task, setTask] = useState<any>(null);
  const [userOffer, setUserOffer] = useState<any>(null);
  const [isTaskPoster, setIsTaskPoster] = useState(false);
  const [isAssignedTasker, setIsAssignedTasker] = useState(false);
  const [offerAmount, setOfferAmount] = useState<number[]>([0]);
  const [offerMessage, setOfferMessage] = useState('');
  const [reviewRating, setReviewRating] = useState<number[]>([5]);
  const [reviewComment, setReviewComment] = useState('');

  const isLoading = authLoading || tasksLoading || offersLoading || loadingProfile;

  useEffect(() => {
    if (tasks.length > 0 && id) {
      const foundTask = tasks.find(t => t.id === id);
      setTask(foundTask);
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
    if (!currentUserProfile.is_verified_tasker) { // Fixed property name
      toast.error("You must be registered as a tasker to make an offer. Please update your profile.");
      navigate('/profile');
      return;
    }

    try {
      await addOffer( // Changed createOffer to addOffer
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
      await acceptOffer(offerId, task.id); // Changed updateOfferStatus to acceptOffer
      // updateTaskStatus is already called inside acceptOffer in useOffers
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
      await rejectOffer(offerId); // Changed updateOfferStatus to rejectOffer
      toast.success("Offer rejected.");
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
    return <div className="container mx-auto p-4 text-center pt-[80px] text-red-500">Error: {tasksError}</div>;
  }

  if (!task) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Task not found.</div>;
  }

  const isTaskOpen = task.status === 'open';
  const isTaskAssigned = task.status === 'assigned';
  const isTaskInProgress = task.status === 'in_progress';
  const isTaskCompleted = task.status === 'completed';
  const isTaskCancelled = task.status === 'cancelled';

  const canMakeOffer = isAuthenticated && !isTaskPoster && isTaskOpen && !userOffer && currentUserProfile?.is_verified_tasker; // Fixed property name
  const canEditOffer = isAuthenticated && !isTaskPoster && isTaskOpen && userOffer && userOffer.status === 'pending' && currentUserProfile?.is_verified_tasker; // Fixed property name
  const canDeleteOffer = isAuthenticated && !isTaskPoster && isTaskOpen && userOffer && userOffer.status === 'pending' && currentUserProfile?.is_verified_tasker; // Fixed property name

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
          <CardHeader className="relative p-0">
            <img
              src={task.imageUrl || DEFAULT_TASK_IMAGE_URL}
              alt={task.title}
              className="w-full h-64 object-cover rounded-t-lg"
              onError={(e) => {
                e.currentTarget.src = DEFAULT_TASK_IMAGE_URL;
                e.currentTarget.onerror = null;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-lg flex items-end p-6">
              <CardTitle className="text-white text-4xl font-bold">{task.title}</CardTitle>
            </div>
            <Badge className={cn(
              "absolute top-4 right-4 px-4 py-2 text-base font-semibold",
              isTaskOpen && 'bg-blue-600 text-white',
              isTaskAssigned && 'bg-yellow-600 text-white',
              isTaskInProgress && 'bg-orange-600 text-white',
              isTaskCompleted && 'bg-green-600 text-white',
              isTaskCancelled && 'bg-gray-600 text-white'
            )}>
              {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
            </Badge>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{task.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <MapPin size={20} className="mr-3 text-green-600" />
                    <span className="font-medium">Location:</span> {task.location}
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Tag size={20} className="mr-3 text-green-600" />
                    <span className="font-medium">Category:</span> {task.category}
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <DollarSign size={20} className="mr-3 text-green-600" />
                    <span className="font-medium">Budget:</span> ₱{task.budget.toLocaleString()}
                  </div>
                  <div className="flex items-center text-gray-700 dark:text-gray-300">
                    <Calendar size={20} className="mr-3 text-green-600" />
                    <span className="font-medium">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <img
                    src={task.posterAvatar || DEFAULT_AVATAR_URL}
                    alt={task.posterName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                      e.currentTarget.onerror = null;
                    }}
                  />
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Posted by: {task.posterName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                  </div>
                  {!isTaskPoster && isAuthenticated && (
                    <Button
                      onClick={() => handleChatWithUser(task.posterId)}
                      className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <MessageSquare size={20} /> Chat with Client
                    </Button>
                  )}
                </div>

                {task.assignedTaskerId && (
                  <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <img
                      src={task.assignedTaskerAvatar || DEFAULT_AVATAR_URL}
                      alt={task.assignedTaskerName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_AVATAR_URL;
                        e.currentTarget.onerror = null;
                      }}
                    />
                    <div>
                      <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Assigned Tasker: {task.assignedTaskerName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Tasker</p>
                    </div>
                    {isAuthenticated && user?.id !== task.assignedTaskerId && (
                      <Button
                        onClick={() => handleChatWithUser(task.assignedTaskerId)}
                        className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                      >
                        <MessageSquare size={20} /> Chat with Tasker
                      </Button>
                    )}
                  </div>
                )}

                {isTaskCompleted && task.review && (
                  <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CardHeader>
                      <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
                        <Star size={24} fill="currentColor" className="text-green-500" /> Task Review
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center mb-2">
                        <span className="text-xl font-bold text-green-600">{task.review.rating}</span>
                        <Star size={20} fill="currentColor" className="text-green-500 ml-1" />
                        <span className="ml-2 text-gray-600 dark:text-gray-400">({task.review.reviewerName})</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 italic">"{task.review.comment}"</p>
                    </CardContent>
                  </Card>
                )}

                {/* Tasker Actions */}
                {canMarkInProgress && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-6">
                        <Clock size={20} className="mr-2" /> Mark as In Progress
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Task as In Progress?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark this task as "In Progress"? This indicates you have started working on the task.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkInProgress} className="bg-orange-600 hover:bg-orange-700">
                          Confirm In Progress
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {canMarkCompleteAndReview && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-6">
                        <CheckCircle size={20} className="mr-2" /> Mark as Complete & Review
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Mark Task as Complete & Review</AlertDialogTitle>
                        <AlertDialogDescription>
                          Please provide a rating and an optional comment for the client.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="rating" className="text-right">
                            Rating: {reviewRating[0]} Stars
                          </Label>
                          <Slider
                            id="rating"
                            min={1}
                            max={5}
                            step={1}
                            value={reviewRating}
                            onValueChange={setReviewRating}
                            className="w-full"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor="comment" className="text-right">
                            Comment (Optional)
                          </Label>
                          <Textarea
                            id="comment"
                            placeholder="Share your experience with the client..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleMarkCompleteAndReview} className="bg-green-600 hover:bg-green-700">
                          Submit Review & Complete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                {/* Client Actions */}
                {canCancelTask && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full mt-4">
                        <XCircle size={20} className="mr-2" /> Cancel Task
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently cancel your task and notify any assigned tasker.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelTask} className="bg-red-600 hover:bg-red-700">
                          Yes, cancel task
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              {/* Offers Section */}
              <div className="lg:col-span-1">
                <Card className="bg-white dark:bg-gray-800 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-green-600">Offers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isTaskOpen && canMakeOffer && (
                      <div className="mb-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <h4 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">Make an Offer</h4>
                        <div className="mb-3">
                          <Label htmlFor="offer-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Your Offer Amount: ₱{offerAmount[0].toLocaleString()}
                          </Label>
                          <Slider
                            id="offer-amount"
                            min={100}
                            max={task.budget * 2}
                            step={50}
                            value={offerAmount}
                            onValueChange={setOfferAmount}
                            className="w-full"
                          />
                        </div>
                        <div className="mb-4">
                          <Label htmlFor="offer-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Message to Client
                          </Label>
                          <Textarea
                            id="offer-message"
                            placeholder="Tell the client why you're the best fit for this task..."
                            value={offerMessage}
                            onChange={(e) => setOfferMessage(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <Button onClick={handleCreateOffer} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          Submit Offer
                        </Button>
                      </div>
                    )}

                    {isTaskOpen && userOffer && userOffer.status === 'pending' && (canEditOffer || canDeleteOffer) && (
                      <div className="mb-6 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                        <h4 className="text-lg font-semibold mb-3 text-yellow-700 dark:text-yellow-300">Your Pending Offer</h4>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          <span className="font-semibold">Amount:</span> ₱{userOffer.offerAmount.toLocaleString()}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          <span className="font-semibold">Message:</span> {userOffer.message}
                        </p>
                        <div className="flex gap-2">
                          {canEditOffer && (
                            <Button
                              onClick={() => toast.info("Editing offers is not yet implemented.")}
                              variant="outline"
                              className="flex-1 border-yellow-600 text-yellow-600 hover:bg-yellow-600 hover:text-white"
                            >
                              Edit Offer
                            </Button>
                          )}
                          {canDeleteOffer && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="flex-1">
                                  Delete Offer
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure you want to delete your offer?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Your offer will be permanently removed.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => withdrawOffer(userOffer.id)} className="bg-red-600 hover:bg-red-700">
                                    Yes, delete offer
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </div>
                    )}

                    {isTaskOpen && offers.filter(o => o.taskId === id && o.status === 'pending').length === 0 && !canMakeOffer && !userOffer && (
                      <p className="text-center text-gray-500 dark:text-gray-400 italic">No offers yet.</p>
                    )}

                    {isTaskOpen && canAcceptRejectOffers && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Pending Offers ({offers.filter(o => o.taskId === id && o.status === 'pending').length})</h4>
                        {offers.filter(o => o.taskId === id && o.status === 'pending').length > 0 ? (
                          <div className="space-y-4">
                            {offers.filter(o => o.taskId === id && o.status === 'pending').map(offer => (
                              <Card key={offer.id} className="p-4 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                  <img
                                    src={offer.taskerAvatar || DEFAULT_AVATAR_URL}
                                    alt={offer.taskerName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                                    onError={(e) => {
                                      e.currentTarget.src = DEFAULT_AVATAR_URL;
                                      e.currentTarget.onerror = null;
                                    }}
                                  />
                                  <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{offer.taskerName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Offer: ₱{offer.offerAmount.toLocaleString()}</p>
                                  </div>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3 italic">"{offer.message}"</p>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleAcceptOffer(offer.id, offer.taskerId)}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectOffer(offer.id)}
                                    variant="outline"
                                    className="flex-1 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                                  >
                                    Reject
                                  </Button>
                                </div>
                                <Button
                                  onClick={() => handleChatWithUser(offer.taskerId)}
                                  className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 mt-2"
                                >
                                  <MessageSquare size={20} /> Chat with Tasker
                                </Button>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 italic">No pending offers.</p>
                        )}
                      </div>
                    )}

                    {isTaskAssigned && (
                      <div className="mt-6 p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-center">
                        <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">Task Assigned!</p>
                        <p className="text-gray-700 dark:text-gray-300">Waiting for tasker to mark as "In Progress".</p>
                      </div>
                    )}

                    {isTaskInProgress && (
                      <div className="mt-6 p-4 border rounded-lg bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-center">
                        <p className="text-lg font-semibold text-orange-700 dark:text-orange-300">Task In Progress!</p>
                        <p className="text-gray-700 dark:text-gray-300">Tasker is currently working on this task.</p>
                      </div>
                    )}

                    {isTaskCompleted && (
                      <div className="mt-6 p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-center">
                        <p className="text-lg font-semibold text-green-700 dark:text-green-300">Task Completed!</p>
                        <p className="text-gray-700 dark:text-gray-300">This task has been successfully completed.</p>
                      </div>
                    )}

                    {isTaskCancelled && (
                      <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800 text-center">
                        <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Task Cancelled</p>
                        <p className="text-gray-700 dark:text-gray-300">This task was cancelled by the client.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailPage;