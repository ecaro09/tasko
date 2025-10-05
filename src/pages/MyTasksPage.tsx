import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useOffers } from '@/hooks/use-offers';
import { Offer } from '@/lib/offer-firestore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign, Trash2, User, MessageSquare, CheckCircle, XCircle, Star, Edit, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { useModal } from '@/components/ModalProvider';
import { cn } from '@/lib/utils'; // Import cn for conditional class names

const MyTasksPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, deleteTask, cancelTask } = useTasks();
  const { offers, loading: offersLoading, acceptOffer, rejectOffer } = useOffers();
  const { openReviewTaskModal, openEditTaskModal } = useModal();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = React.useState(false);
  const [taskToCancel, setTaskToCancel] = React.useState<string | null>(null);
  const [activeFilter, setActiveFilter] = React.useState<'all' | 'open' | 'assigned' | 'completed' | 'cancelled'>('all'); // New state for filter

  if (authLoading || tasksLoading || offersLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your tasks and offers...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your tasks.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userTasks = tasks.filter(task => task.posterId === user.uid);

  const filteredTasks = React.useMemo(() => {
    if (activeFilter === 'all') {
      return userTasks;
    }
    return userTasks.filter(task => task.status === activeFilter);
  }, [userTasks, activeFilter]);

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
      } catch (error) {
        // Error handled by useTasks hook, toast already shown
      } finally {
        setTaskToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleCancelClick = (taskId: string) => {
    setTaskToCancel(taskId);
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (taskToCancel) {
      try {
        await cancelTask(taskToCancel);
      } catch (error) {
        // Error handled by useTasks hook
      } finally {
        setTaskToCancel(null);
        setIsCancelDialogOpen(false);
      }
    }
  };

  const handleAcceptOffer = async (offerId: string, taskId: string) => {
    try {
      const roomId = await acceptOffer(offerId, taskId);
      if (roomId) {
        navigate('/chat');
      }
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      await rejectOffer(offerId);
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleReviewTask = (task: typeof userTasks[0]) => {
    openReviewTaskModal(task);
  };

  const handleEditTask = (task: typeof userTasks[0]) => {
    openEditTaskModal(task);
  };

  const getOfferStatusBadge = (status: Offer['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">Withdrawn</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Posted Tasks</h1>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('all')}
            className={cn(activeFilter === 'all' ? 'bg-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] text-white' : 'border-gray-400 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700')}
          >
            All Tasks ({userTasks.length})
          </Button>
          <Button
            variant={activeFilter === 'open' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('open')}
            className={cn(activeFilter === 'open' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-blue-400 text-blue-600 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-700')}
          >
            Open ({userTasks.filter(t => t.status === 'open').length})
          </Button>
          <Button
            variant={activeFilter === 'assigned' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('assigned')}
            className={cn(activeFilter === 'assigned' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'border-yellow-400 text-yellow-600 hover:bg-yellow-100 dark:text-yellow-300 dark:hover:bg-yellow-700')}
          >
            Assigned ({userTasks.filter(t => t.status === 'assigned').length})
          </Button>
          <Button
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('completed')}
            className={cn(activeFilter === 'completed' ? 'bg-green-600 hover:bg-green-700 text-white' : 'border-green-400 text-green-600 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-700')}
          >
            Completed ({userTasks.filter(t => t.status === 'completed').length})
          </Button>
          <Button
            variant={activeFilter === 'cancelled' ? 'default' : 'outline'}
            onClick={() => setActiveFilter('cancelled')}
            className={cn(activeFilter === 'cancelled' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'border-purple-400 text-purple-600 hover:bg-purple-100 dark:text-purple-300 dark:hover:bg-purple-700')}
          >
            Cancelled ({userTasks.filter(t => t.status === 'cancelled').length})
          </Button>
        </div>

        {filteredTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No tasks found with status "{activeFilter}".</p>
            {activeFilter === 'all' && (
              <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
                Post a New Task
              </Button>
            )}
            {activeFilter !== 'all' && (
              <Button onClick={() => setActiveFilter('all')} className="bg-green-600 hover:bg-green-700 text-white">
                View All Tasks
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => {
              const offersForTask = offers.filter(offer => offer.taskId === task.id);
              const assignedOffer = offersForTask.find(offer => offer.status === 'accepted');
              const assignedTaskerName = assignedOffer?.taskerName;

              return (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === 'open' ? 'bg-blue-600 text-white' :
                      task.status === 'assigned' ? 'bg-yellow-600 text-white' :
                      task.status === 'completed' ? 'bg-green-600 text-white' :
                      'bg-gray-600 text-white'
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

                    {task.status === 'assigned' && assignedTaskerName && (
                      <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                        <User size={18} />
                        <span>Assigned to: <span className="font-semibold">{assignedTaskerName}</span></span>
                      </div>
                    )}

                    {task.status === 'completed' && task.rating && task.review ? (
                      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900 rounded-md text-green-800 dark:text-green-200">
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={16} className={i < task.rating! ? "fill-green-600 text-green-600" : "text-gray-400"} />
                          ))}
                          <span className="font-semibold ml-1">{task.rating}/5</span>
                        </div>
                        <p className="text-sm italic">"{task.review}"</p>
                      </div>
                    ) : task.status === 'assigned' && (
                      <Button
                        onClick={() => handleReviewTask(task)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 mb-4"
                      >
                        <CheckCircle size={20} /> Mark as Complete & Review
                      </Button>
                    )}

                    <div className="flex justify-between items-center mt-4">
                      <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                        View Details
                      </Button>
                      <div className="flex gap-2">
                        {(task.status === 'open' || task.status === 'assigned') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="border-blue-600 text-blue-600 hover:bg-blue-100"
                          >
                            <Edit size={20} />
                          </Button>
                        )}
                        {(task.status === 'open' || task.status === 'assigned') && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleCancelClick(task.id)}
                            className="border-red-600 text-red-600 hover:bg-red-100"
                          >
                            <Ban size={20} />
                          </Button>
                        )}
                        {task.status !== 'cancelled' && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteClick(task.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <Trash2 size={20} />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Offers for this task */}
                    {task.status === 'open' && (
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">Offers ({offersForTask.length})</h4>
                        {offersForTask.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No offers yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {offersForTask.map(offer => (
                              <Card key={offer.id} className="p-3 shadow-sm">
                                <CardContent className="p-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-10 h-10 border-2 border-blue-500">
                                      <AvatarImage src={offer.taskerAvatar || undefined} alt={offer.taskerName} />
                                      <AvatarFallback className="bg-blue-200 text-blue-800 text-md font-semibold">
                                        {offer.taskerName ? offer.taskerName.charAt(0).toUpperCase() : <User size={16} />}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-semibold text-md text-gray-800 dark:text-gray-100">{offer.taskerName}</p>
                                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                        <MessageSquare size={12} /> {offer.message}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end sm:items-center gap-1">
                                    <p className="text-xl font-bold text-blue-600">₱{offer.offerAmount.toLocaleString()}</p>
                                    {getOfferStatusBadge(offer.status)}
                                    {offer.status === 'pending' && (
                                      <div className="flex gap-1 mt-1">
                                        <Button
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700 text-white h-7 px-3 text-xs"
                                          onClick={() => handleAcceptOffer(offer.id, task.id)}
                                        >
                                          <CheckCircle size={14} className="mr-1" /> Accept
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="h-7 px-3 text-xs"
                                          onClick={() => handleRejectOffer(offer.id)}
                                        >
                                          <XCircle size={14} className="mr-1" /> Reject
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will mark the task as cancelled. If the task is assigned, the assignment will be revoked. All pending offers will be rejected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep task</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700 text-white">
              Yes, cancel task
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyTasksPage;