import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { MadeWithDyad } from '@/components/made-with-dyad';
import SplashScreen from '@/components/SplashScreen';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, CalendarDays, Tag, DollarSign, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import { useModal } from '@/components/ModalProvider'; // Import useModal

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    other: 'Other'
  };
  return names[category] || 'Task';
};

const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { isAuthenticated, loading: authLoading, logOut } = useAuth(); // Get logOut from useAuth
  const { openLoginModal } = useModal(); // Use openLoginModal from useModal

  const task = tasks.find(t => t.id === id);

  if (tasksLoading || authLoading) {
    return <SplashScreen />;
  }

  if (tasksError) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-900">
        <Header isAuthenticated={isAuthenticated} onSignOut={logOut} /> {/* Pass logOut */}
        <div className="flex-grow container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error loading task details.</h2>
          <p className="text-gray-600">{tasksError}</p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
            Back to Home
          </Button>
        </div>
        <AppFooter />
        <MadeWithDyad />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-gray-100 dark:bg-gray-900">
        <Header isAuthenticated={isAuthenticated} onSignOut={logOut} /> {/* Pass logOut */}
        <div className="flex-grow container mx-auto p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Task Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">The task you are looking for does not exist.</p>
          <Button onClick={() => navigate('/')} className="mt-4 bg-green-600 hover:bg-green-700 text-white">
            Back to Home
          </Button>
        </div>
        <AppFooter />
        <MadeWithDyad />
      </div>
    );
  }

  const handleOfferClick = () => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to make an offer.");
      openLoginModal(); // Open login modal if not authenticated
      return;
    }
    toast.info(`You are about to make an offer for "${task.title}"`);
    // Implement actual offer logic here
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header isAuthenticated={isAuthenticated} onSignOut={logOut} /> {/* Pass logOut */}
      <main className="flex-grow container mx-auto p-4 pt-[80px]"> {/* Added padding-top to account for fixed header */}
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          &larr; Back to Tasks
        </Button>

        <Card className="shadow-lg">
          <CardHeader className="relative p-0">
            <img src={task.imageUrl} alt={task.title} className="w-full h-64 object-cover rounded-t-lg" />
            <div className="absolute top-4 left-4 bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              {getCategoryName(task.category)}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-400 mb-4">{task.title}</h1>
            <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">{task.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin size={20} className="mr-3 text-green-500" />
                <span>Location: <span className="font-semibold">{task.location}</span></span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <DollarSign size={20} className="mr-3 text-green-500" />
                <span>Budget: <span className="font-semibold">₱{task.budget.toLocaleString()}</span></span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <CalendarDays size={20} className="mr-3 text-green-500" />
                <span>Posted: <span className="font-semibold">{task.datePosted}</span></span>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Tag size={20} className="mr-3 text-green-500" />
                <span>Status: <span className="font-semibold capitalize">{task.status}</span></span>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t pt-4 mt-4">
              <img src={task.posterAvatar} alt={task.posterName} className="w-12 h-12 rounded-full object-cover border-2 border-green-500" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Posted by</p>
                <p className="font-semibold text-lg">{task.posterName}</p>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button onClick={handleOfferClick} className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full">
                Make an Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <AppFooter />
      <MadeWithDyad />
    </div>
  );
};

export default TaskDetailPage;