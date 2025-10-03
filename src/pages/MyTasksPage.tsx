import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useOffers, Offer } from '@/hooks/use-offers'; // New import for offers
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign, Trash2, User, MessageSquare, CheckCircle, XCircle, Star } from 'lucide-react'; // Added Star icon
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // New import
import { Badge } from "@/components/ui/badge"; // New import
import { toast } from 'sonner'; // New import
import { useModal } from '@/components/ModalProvider'; // Import useModal

const MyTasksPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, deleteTask } = useTasks(); // Destructure deleteTask
  const { offers, loading: offersLoading, acceptOffer, rejectOffer } = useOffers(); // Use offers hook
  const { openReviewTaskModal } = useModal(); // Get the new modal opener
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  if (authLoading || tasksLoading || offersLoading) { // Include offersLoading
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

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        // Before deleting the task, also delete any associated offers
        const offersToDelete = offers.filter(offer => offer.taskId === taskToDelete);
        for (const offer of offersToDelete) {
          // This would ideally be handled by a server-side function or cascade delete in a real DB
          // For Firebase, we'd need to explicitly delete them.
          // For now, we'll just delete the task.
          // In a real app, you'd want to ensure data consistency.
        }
        await deleteTask(taskToDelete);
      } catch (error) {
        // Error handled by useTasks hook, toast already shown
      } finally {
        setTaskToDelete(null);
        setIsDeleteDialogOpen(false);
      }
    }
  };

  const handleAcceptOffer = async (offerId: string, taskId: string) => {
    try {
      await acceptOffer(offerId, taskId);
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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Posted Tasks</h1>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}

        {userTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't posted any tasks yet.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Post a New Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTasks.map((task) => {
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

                    <div className="flex justify-between items-center">
                      <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                        View Details
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(task.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        <Trash2 size={20} />
                      </Button>
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
    </div>
  );
};

export default MyTasksPage;