import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Tag, DollarSign, User, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useOffers } from '@/hooks/use-offers';
import { useModal } from '@/components/ModalProvider';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from '@/components/ui/badge';

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { offers, getOffersForTask, acceptOffer, rejectOffer, withdrawOffer, loading: offersLoading } = useOffers();
  const { openMakeOfferModal } = useModal();

  const task = tasks.find(t => t.id === id);
  const taskOffers = getOffersForTask(id || '');

  const loading = tasksLoading || authLoading || taskerProfileLoading || offersLoading;
  const error = tasksError;

  if (loading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading task details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500 pt-[80px]">Error: {error}</div>;
  }

  if (!task) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Task not found.</div>;
  }

  const isTaskPoster = isAuthenticated && user?.uid === task.posterId;
  const canMakeOffer = isAuthenticated && isTasker && !isTaskPoster && !task.isDemo; // Cannot make offers on demo tasks

  const handleMakeOfferClick = () => {
    if (task && !task.isDemo) {
      openMakeOfferModal(task);
    } else if (task.isDemo) {
      toast.info("You cannot make offers on sample tasks.");
    }
  };

  const handleAcceptOffer = async (offerId: string) => {
    if (!task) return;
    if (task.isDemo) {
      toast.info("Cannot accept offers on sample tasks.");
      return;
    }
    await acceptOffer(offerId, task.id);
  };

  const handleRejectOffer = async (offerId: string) => {
    if (task?.isDemo) {
      toast.info("Cannot reject offers on sample tasks.");
      return;
    }
    await rejectOffer(offerId);
  };

  const handleWithdrawOffer = async (offerId: string) => {
    if (task?.isDemo) {
      toast.info("Cannot withdraw offers on sample tasks.");
      return;
    }
    await withdrawOffer(offerId);
  };

  const getOfferStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Withdrawn</Badge>;
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
            {task.isDemo && (
              <Badge className="absolute top-4 left-4 bg-blue-500 text-white text-base px-3 py-1">Sample Task</Badge>
            )}
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
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Log in to make an offer.</p>
                )}
                {isAuthenticated && !isTasker && !isTaskPoster && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Register as a tasker to make an offer.</p>
                )}
                {isAuthenticated && isTasker && task.isDemo && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Offers cannot be made on sample tasks.</p>
                )}
              </div>
            </div>

            {/* Offers & Discussion Section */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <MessageSquare size={20} /> Offers & Discussion ({taskOffers.length})
              </h3>
              {taskOffers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No offers yet. Be the first to make one!</p>
              ) : (
                <div className="space-y-4">
                  {taskOffers.map((offer) => (
                    <Card key={offer.id} className="p-4 shadow-sm">
                      <CardContent className="p-0 flex items-start gap-4">
                        <Avatar className="w-12 h-12 border-2 border-gray-200">
                          <AvatarImage src={offer.taskerAvatar || undefined} alt={offer.taskerName} />
                          <AvatarFallback className="bg-gray-200 text-gray-800">
                            {offer.taskerName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{offer.taskerName}</h4>
                            {getOfferStatusBadge(offer.status)}
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mb-2">{offer.message}</p>
                          <p className="text-xl font-bold text-green-600 mb-2">Offer: ₱{offer.offerAmount.toLocaleString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Posted: {new Date(offer.dateCreated).toLocaleDateString()}
                            {offer.dateUpdated && ` (Updated: ${new Date(offer.dateUpdated).toLocaleDateString()})`}
                          </p>

                          {isTaskPoster && offer.status === 'pending' && !task.isDemo && (
                            <div className="flex gap-2 mt-3">
                              <Button onClick={() => handleAcceptOffer(offer.id)} className="bg-green-600 hover:bg-green-700 text-white text-sm">
                                Accept Offer
                              </Button>
                              <Button variant="outline" onClick={() => handleRejectOffer(offer.id)} className="border-red-600 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 text-sm">
                                Reject
                              </Button>
                            </div>
                          )}
                          {isAuthenticated && user?.uid === offer.taskerId && offer.status === 'pending' && !task.isDemo && (
                            <div className="flex gap-2 mt-3">
                              <Button variant="outline" onClick={() => handleWithdrawOffer(offer.id)} className="border-gray-600 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">
                                Withdraw Offer
                              </Button>
                            </div>
                          )}
                          {task.isDemo && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Actions are disabled for sample tasks.</p>
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