import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, LayoutDashboard, ListTodo, Briefcase, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useTasks } from '@/hooks/use-tasks'; // Import useTasks
import { useOffers } from '@/hooks/use-offers'; // Import useOffers

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { tasks, loading: tasksLoading } = useTasks(); // Fetch all tasks
  const { offers, loading: offersLoading } = useOffers(); // Fetch all offers

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

  // Filter tasks posted by the current user
  const userPostedTasks = tasks.filter(task => task.posterId === user.uid);
  const openPostedTasksCount = userPostedTasks.filter(task => task.status === 'open').length;
  const assignedPostedTasksCount = userPostedTasks.filter(task => task.status === 'assigned').length;

  // Filter offers made by the current user (if they are a tasker)
  const userMadeOffers = offers.filter(offer => offer.taskerId === user.uid);
  const pendingOffersCount = userMadeOffers.filter(offer => offer.status === 'pending').length;
  const acceptedOffersCount = userMadeOffers.filter(offer => offer.status === 'accepted').length;

  // Filter offers received for tasks posted by the current user (client side)
  const offersReceivedForUserTasks = offers.filter(offer => userPostedTasks.some(task => task.id === offer.taskId));
  const pendingOffersReceivedCount = offersReceivedForUserTasks.filter(offer => offer.status === 'pending').length;


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
      </div>
    </div>
  );
};

export default DashboardPage;