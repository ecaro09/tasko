import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, ListTodo, Briefcase, DollarSign, MapPin, Tag, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useTasks, Task } from '@/hooks/use-tasks';
import { useOffers, Offer } from '@/hooks/use-offers';
import { getTaskImageUrl } from '@/utils/task-images'; // Import utility for task images
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { tasks, loading: tasksLoading, deleteTask } = useTasks();
  const { offers, loading: offersLoading, acceptOffer, rejectOffer, withdrawOffer } = useOffers();

  const isLoading = authLoading || taskerProfileLoading || tasksLoading || offersLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading dashboard...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view your dashboard.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter tasks posted by the current user, sorted by date
  const userPostedTasks = tasks
    .filter(task => task.posterId === user.uid)
    .sort((a, b) => new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime());

  const openPostedTasksCount = userPostedTasks.filter(task => task.status === 'open').length;
  const assignedPostedTasksCount = userPostedTasks.filter(task => task.status === 'assigned').length;

  // Filter offers made by the current user (if they are a tasker), sorted by date
  const userMadeOffers = offers
    .filter(offer => offer.taskerId === user.uid)
    .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime());

  const pendingOffersCount = userMadeOffers.filter(offer => offer.status === 'pending').length;
  const acceptedOffersCount = userMadeOffers.filter(offer => offer.status === 'accepted').length;

  // Filter offers received for tasks posted by the current user (client side)
  const offersReceivedForUserTasks = offers.filter(offer => userPostedTasks.some(task => task.id === offer.taskId));
  const pendingOffersReceivedCount = offersReceivedForUserTasks.filter(offer => offer.status === 'pending').length;

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

  const handleWithdrawOffer = async (offerId: string) => {
    try {
      await withdrawOffer(offerId);
    } catch (error) {
      // Error handled by useOffers hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <LayoutDashboard size={36} /> Your Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Client Overview Card */}
          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Client Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                As a client, you can manage the tasks you've posted and review offers from taskers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center bg-green-50 dark:bg-green-900">
                  <p className="text-4xl font-bold text-green-600 dark:text-green-200">{userPostedTasks.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Posted Tasks</p>
                </Card>
                <Card className="p-4 text-center bg-blue-50 dark:bg-blue-900">
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-200">{pendingOffersReceivedCount}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Pending Offers</p>
                </Card>
              </div>
              <Link to="/my-tasks">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6 flex items-center justify-center gap-2">
                  <ListTodo size={20} /> View My Posted Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Tasker Overview Card */}
          <Card className="shadow-lg p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tasker Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {isTasker ? (
                <>
                  <p className="text-gray-700 dark:text-gray-300">
                    As a tasker, you can manage your profile and track the offers you've made.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <Card className="p-4 text-center bg-yellow-50 dark:bg-yellow-900">
                      <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-200">{pendingOffersCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Pending Offers</p>
                    </Card>
                    <Card className="p-4 text-center bg-purple-50 dark:bg-purple-900">
                      <p className="text-4xl font-bold text-purple-600 dark:text-purple-200">{acceptedOffersCount}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Accepted Offers</p>
                    </Card>
                  </div>
                  <Link to="/my-offers">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6 flex items-center justify-center gap-2">
                      <Briefcase size={20} /> View My Offers
                    </Button>
                  </Link>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white text-lg py-6 mt-2">
                      Edit Tasker Profile
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-gray-700 dark:text-gray-300">
                    Become a tasker to start earning by completing tasks!
                  </p>
                  <Link to="/features-earnings">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white text-lg py-6">
                      Become a Tasker
                    </Button>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Posted Tasks Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
            <ListTodo size={28} /> Recent Posted Tasks
          </h2>
          {userPostedTasks.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center">You haven't posted any tasks yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userPostedTasks.slice(0, 4).map((task) => { // Show up to 4 recent tasks
                const offersForTask = offers.filter(offer => offer.taskId === task.id);
                return (
                  <Card key={task.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                        <Badge className={`text-xs ${
                          task.status === 'open' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200' :
                          task.status === 'assigned' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                          'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200'
                        }`}>
                          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center text-sm mb-1">
                        <MapPin size={14} className="mr-1" /> {task.location}
                      </p>
                      <p className="text-lg font-bold text-green-600 mb-3">₱{task.budget.toLocaleString()}</p>
                      <div className="flex justify-between items-center">
                        <Link to={`/tasks/${task.id}`}>
                          <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                            View Details
                          </Button>
                        </Link>
                        {offersForTask.length > 0 && task.status === 'open' && (
                          <span className="text-sm text-blue-600 dark:text-blue-400">{offersForTask.filter(o => o.status === 'pending').length} pending offers</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
          {userPostedTasks.length > 4 && (
            <div className="text-center mt-6">
              <Link to="/my-tasks">
                <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  View All Posted Tasks
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* Recent Offers Made Section (for Taskers) */}
        {isTasker && (
          <section>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Briefcase size={28} /> Recent Offers Made
            </h2>
            {userMadeOffers.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400 text-center">You haven't made any offers yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMadeOffers.slice(0, 4).map((offer) => { // Show up to 4 recent offers
                  const task = tasks.find(t => t.id === offer.taskId);
                  if (!task) return null;

                  return (
                    <Card key={offer.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{task.title}</h3>
                          {getOfferStatusBadge(offer.status)}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 flex items-center text-sm mb-1">
                          <MessageSquare size={14} className="mr-1" /> {offer.message}
                        </p>
                        <p className="text-lg font-bold text-blue-600 mb-3">₱{offer.offerAmount.toLocaleString()}</p>
                        <div className="flex justify-between items-center">
                          <Link to={`/tasks/${task.id}`}>
                            <Button variant="outline" size="sm" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                              View Task
                            </Button>
                          </Link>
                          {offer.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-400 text-gray-700 hover:bg-gray-100"
                              onClick={() => handleWithdrawOffer(offer.id)}
                            >
                              <Clock size={14} className="mr-1" /> Withdraw
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            {userMadeOffers.length > 4 && (
              <div className="text-center mt-6">
                <Link to="/my-offers">
                  <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white">
                    View All My Offers
                  </Button>
                </Link>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;