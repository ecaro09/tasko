import React from 'react';
import { useAuth } from '@/hooks/use-auth'; // Corrected import for useAuth
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyTasksPage: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const navigate = useNavigate();

  if (authLoading || tasksLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading your tasks...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto p-4 text-center pt-[80px]">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600 mb-6">Please log in to view your tasks.</p>
        <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
          Go to Home
        </Button>
      </div>
    );
  }

  const userTasks = tasks.filter(task => task.posterId === user.uid);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">My Posted Tasks</h1>

        {tasksError && <p className="text-center text-red-500 italic mb-8">Error loading tasks: {tasksError}</p>}

        {userTasks.length === 0 && !tasksLoading && !tasksError ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">You haven't posted any tasks yet.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Post a New Task
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userTasks.map((task) => (
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
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => navigate(`/tasks/${task.id}`)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                      View Details
                    </Button>
                    {/* Add more actions like Edit/Delete/Mark Complete based on task status */}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasksPage;