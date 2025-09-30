import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, DollarSign, User, Tag } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import AppFooter from '@/components/AppFooter';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

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

const TaskDetails: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { isAuthenticated, signIn, signUp, logOut } = useAuth(); // Destructure auth functions

  const task = tasks.find(t => t.id === taskId);

  const handleSignIn = () => {
    // This would typically open a login modal or redirect to a login page
    toast.info("Please log in to offer help.");
    // For now, we'll just log it. In a full app, you'd trigger the LoginModal.
    console.log("User needs to sign in to offer help.");
  };

  const handleOfferHelp = () => {
    if (!isAuthenticated) {
      handleSignIn();
      return;
    }
    toast.success("Your offer to help has been sent!");
    // In a real app, this would involve updating the task in Firestore
    console.log(`User ${isAuthenticated ? 'logged in' : 'not logged in'} offered to help with task ${taskId}`);
  };

  if (tasksLoading) {
    return <SplashScreen />;
  }

  if (tasksError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <p className="text-red-500 text-lg">Error loading tasks: {tasksError}</p>
        <Link to="/" className="mt-4 text-green-600 hover:underline">Back to Home</Link>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <h1 className="text-4xl font-bold mb-4">Task Not Found</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">The task you are looking for does not exist.</p>
        <Link to="/" className="text-green-600 hover:underline">Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={() => toast.info("Please use the login modal on the home page.")} // Placeholder
        onSignOut={logOut}
        onSignUp={() => toast.info("Please use the signup modal on the home page.")} // Placeholder
      />
      <main className="container mx-auto p-4 flex-grow mt-[80px]">
        <div className="max-w-4xl mx-auto">
          <Button asChild variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
            <Link to="/">← Back to Tasks</Link>
          </Button>

          <Card className="shadow-lg">
            <CardHeader className="p-0">
              <img src={task.imageUrl} alt={task.title} className="w-full h-64 object-cover rounded-t-lg" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-green-700 dark:text-green-400">{task.title}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-300 flex items-center mt-2">
                    <Tag size={18} className="mr-2 text-green-500" /> {getCategoryName(task.category)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-extrabold text-green-600">₱{task.budget.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Budget</p>
                </div>
              </div>

              <p className="text-lg text-gray-700 dark:text-gray-200 mb-6 leading-relaxed">
                {task.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                  <MapPin size={20} className="mr-3 text-green-500" />
                  <strong>Location:</strong> {task.location}
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                  <Calendar size={20} className="mr-3 text-green-500" />
                  <strong>Posted On:</strong> {task.datePosted}
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                  <User size={20} className="mr-3 text-green-500" />
                  <strong>Posted By:</strong> {task.posterName}
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-200">
                  <DollarSign size={20} className="mr-3 text-green-500" />
                  <strong>Status:</strong> <span className={`font-semibold ${task.status === 'open' ? 'text-blue-500' : task.status === 'assigned' ? 'text-yellow-600' : 'text-green-500'}`}>{task.status.charAt(0).toUpperCase() + task.status.slice(1)}</span>
                </div>
              </div>

              <div className="mt-8 text-center">
                <Button onClick={handleOfferHelp} className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-3 rounded-full shadow-md">
                  Offer to Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
};

export default TaskDetails;