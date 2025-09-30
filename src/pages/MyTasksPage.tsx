import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import AppFooter from '@/components/AppFooter';
import { MadeWithDyad } from '@/components/made-with-dyad';
import SplashScreen from '@/components/SplashScreen';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useModal } from '@/components/ModalProvider';

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

const MyTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading, logOut } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { openPostTaskModal } = useModal();

  const handleSignOut = async () => {
    await logOut();
    navigate('/'); // Redirect to home after logout
  };

  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  if (authLoading || tasksLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated || !user) {
    // Redirect to home or show a message if not authenticated
    React.useEffect(() => {
      if (!isAuthenticated && !authLoading) {
        navigate('/');
      }
    }, [isAuthenticated, authLoading, navigate]);
    return <SplashScreen />; // Show splash screen while redirecting
  }

  // Ensure tasks is an array before filtering
  const safeTasks = tasks || [];
  const userTasks = safeTasks.filter(task => task.posterId === user.uid);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className="flex-grow container mx-auto p-4 pt-[80px]"> {/* Added padding-top for fixed header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold text-green-600">My Posted Tasks</h2>
          <Button onClick={openPostTaskModal} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
            <Plus size={20} /> Post a New Task
          </Button>
        </div>

        {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}
        {!tasksLoading && userTasks.length === 0 && !tasksError ? (
          <p className="text-center text-gray-500 italic py-8">You haven't posted any tasks yet. Why not post one?</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTasks.map((task) => (
              <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-40 overflow-hidden relative">
                  <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {getCategoryName(task.category)}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                  <p className="text-gray-600 flex items-center mb-2">
                    <MapPin size={16} className="mr-2" /> {task.location}
                  </p>
                  <p className="text-2xl font-bold text-green-600 mb-4">₱{task.budget.toLocaleString()}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover" />
                      <span className="font-medium">{task.posterName}</span>
                    </div>
                    <Button variant="outline" onClick={() => handleViewTaskDetails(task.id)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <AppFooter />
      <MadeWithDyad />
    </div>
  );
};

export default MyTasksPage;