import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useOffers, Offer } from '@/hooks/use-offers'; // Import Offer interface
import { useModal } from '@/components/ModalProvider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, DollarSign, User, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { offers, loading: offersLoading, acceptOffer, rejectOffer, withdrawOffer } = useOffers();
  const { openMakeOfferModal } = useModal();

  const task = tasks.find(t => t.id === id);
  const taskOffers = offers.filter(offer => offer.taskId === id);

  const isLoading = tasksLoading || authLoading || taskerProfileLoading || offersLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading task details...</div>;
  }

  if (tasksError) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {tasksError}</div>;
  }

  if (!task) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Task not found.</div>;
  }

  const isTaskPoster = isAuthenticated && user?.uid === task.posterId;
  const canMakeOffer = isAuthenticated && isTasker && !isTaskPoster;

  const handleMakeOfferClick = () => {
    if (task) {
      openMakeOfferModal(task);
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!isTaskPoster) {
      toast.error("You are not authorized to accept offers for this task.");
      return;
    }
    try {
      await acceptOffer(offerId, task.id);
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    if (!isTaskPoster) {
      toast.error("You are not authorized to reject offers for this task.");
      return;
    }
    try {
      await rejectOffer(offerId);
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  const handleWithdrawOffer = async (offerId: string) => {
    const offer = taskOffers.find(o => o.id === offerId);
    if (!isAuthenticated || user?.uid !== offer?.taskerId) {
      toast.error("You are not authorized to withdraw this offer.");
      return;
    }
    try {
      await withdrawOffer(offerId);
    } catch (error) {
      // Error handled by useOffers hook
    }
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
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back to Tasks
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="relative p-0">
            <img src={task.imageUrl} alt={task.title} className="w-full h-64 object-cover rounded-t-lg" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white">
              <CardTitle className="text-3xl font-bold mb-1">{task.title}</CardTitle>
              <CardDescription className="text-gray-200 flex items-center gap-2">
                <MapPin size={18} /> {task.location}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Task Details</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{task.description}</p>

                <div className="space-y-2 text-gray-700 dark:text-gray-300">
                  <p className="flex items-center gap-2"><Tag size={18} /> <strong>Category:</strong> {task.category}</p>
                  <p className="flex items-center gap-2"><Calendar size={18} /> <strong>Posted:</strong> {new Date(task.datePosted).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2"><DollarSign size={18} /> <strong>Budget:</strong> ₱{task.budget.toLocaleString()}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Posted By</h3>
                <div className="flex items-center gap-4 mb-4">
                  <img src={task.posterAvatar} alt={task.posterName} className="w-16 h-16 rounded-full object-cover border-2 border-green-500" />
                  <div>
                    <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{task.posterName}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Task Poster</p>
                  </div>
                </div>
                {canMakeOffer && (
                  <Button onClick={handleMakeOfferClick} className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <User size={20} /> Make an Offer
                  </Button>
                )}
                {!isAuthenticated && (
                  <p className="text-sm text-gray-500 mt-2">Log in to make an offer.</p>
                )}
                {isAuthenticated && !isTasker && !isTaskPoster && (
                  <p className="text-sm text-gray-500 mt-2">Register as a tasker to make an offer.</p>
                )}
              </div>
            </div>

            {/* Offers Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Offers ({taskOffers.length})</h3>
              {taskOffers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No offers yet. Be the first to make one!</p>
              ) : (
                <div className="space-y-4">
                  {taskOffers.map(offer => (
                    <Card key={offer.id} className="p-4 shadow-sm">
                      <CardContent className="p-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 border-2 border-blue-500">
                            <AvatarImage src={offer.taskerAvatar || undefined} alt={offer.taskerName} />
                            <AvatarFallback className="bg-blue-200 text-blue-800 text-lg font-semibold">
                              {offer.taskerName ? offer.taskerName.charAt(0).toUpperCase() : <User size={20} />}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-lg text-gray-800 dark:text-gray-100">{offer.taskerName}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                              <MessageSquare size={14} /> {offer.message}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end sm:items-center gap-2">
                          <p className="text-2xl font-bold text-blue-600">₱{offer.offerAmount.toLocaleString()}</p>
                          {getOfferStatusBadge(offer.status)}
                          {isTaskPoster && offer.status === 'pending' && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAcceptOffer(offer.id)}
                              >
                                <CheckCircle size={16} className="mr-1" /> Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectOffer(offer.id)}
                              >
                                <XCircle size={16} className="mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                          {isAuthenticated && user?.uid === offer.taskerId && offer.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-gray-400 text-gray-700 hover:bg-gray-100 mt-2"
                              onClick={() => handleWithdrawOffer(offer.id)}
                            >
                              <Clock size={16} className="mr-1" /> Withdraw
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskDetailPage;