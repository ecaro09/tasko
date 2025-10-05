import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useOffers } from '@/hooks/use-offers';
import { useTaskerProfile } from '@/hooks/use-tasker-profile'; // To check if user is NOT a tasker
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign, User, MessageSquare, CheckCircle, XCircle, Edit, Trash2, Plus } from 'lucide-react';
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
import { Offer } from '@/lib/offer-firestore';

const ClientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, deleteTask } = useTasks();
  const { offers, loading: offersLoading, acceptOffer, rejectOffer } = useOffers();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile(); // Check if user is a tasker
  const { openEditTaskModal, openPostTaskModal } = useModal();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  const isLoading = authLoading || tasksLoading || offersLoading || taskerProfileLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading client dashboard...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your client dashboard.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If the user is a tasker, they should use the tasker dashboard, not this one.
  // This is a client-specific dashboard.
  if (isTasker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Wrong Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You are registered as a tasker. Please use the Tasker Dashboard.</p>
            <Button onClick={() => navigate('/tasker-dashboard')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Tasker Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userPostedTasks = tasks.filter(task => task.posterId === user.uid);

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTask(taskToDelete);
        toast.success("Task and associated offers deleted successfully!");
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
      const roomId = await acceptOffer(offerId, taskId);
      if (roomId) {
        navigate('/chat'); // Navigate to the chat page after accepting the offer
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

  const handleEditTask = (task: typeof userPostedTasks[0]) => {
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
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Client Dashboard</h1>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}

        {userPostedTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't posted any tasks yet.</p>
            <Button onClick={openPostTaskModal} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Plus size={20} /> Post a New Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPostedTasks.map((task) => {
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
                        onClick={() => navigate(`/my-tasks`)} // Redirect to MyTasksPage to mark as complete
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
                        {task.status === 'open' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditTask(task)}
                            className="border-blue-600 text-blue-600 hover:bg-blue-100"
                          >
                            <Edit size={20} />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(task.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 size={20} />
                        </Button>
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
                                        <MessageSquare size={12} className="shrink-0" /> <span className="line-clamp-1">{offer.message}</span>
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
              This action cannot be undone. This will permanently delete your task and all associated offers.
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

export default ClientDashboardPage;