import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useTasks } from '@/hooks/use-tasks';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Tag, DollarSign, User, Star, Briefcase, Calendar } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';

const TaskerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { taskerProfile, isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { tasks, loading: tasksLoading } = useTasks();

  const isLoading = authLoading || taskerProfileLoading || tasksLoading;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading tasker dashboard...</div>;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to view the tasker dashboard.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isTasker || !taskerProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--primary-color))]">Not a Tasker</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You need to be registered as a tasker to access this dashboard.</p>
            <Button onClick={() => navigate('/features-earnings')} className="bg-green-600 hover:bg-green-700 text-white">
              Become a Tasker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const assignedTasks = tasks.filter(task => task.assignedTaskerId === user.uid);
  const completedTasksWithReviews = assignedTasks.filter(task => task.status === 'completed' && task.rating && task.review);

  const averageRating = completedTasksWithReviews.length > 0
    ? (completedTasksWithReviews.reduce((sum, task) => sum + (task.rating || 0), 0) / completedTasksWithReviews.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px] px-4">
      <div className="container mx-auto max-w-5xl">
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center">Tasker Dashboard</h1>

        {/* Tasker Overview Card */}
        <Card className="shadow-lg p-6 mb-8">
          <CardContent className="flex flex-col md:flex-row items-center md:items-start gap-6 p-0">
            <Avatar className="w-24 h-24 border-4 border-green-500">
              <AvatarImage src={taskerProfile.photoURL || undefined} alt={taskerProfile.displayName} />
              <AvatarFallback className="bg-green-200 text-green-800 text-3xl font-semibold">
                {taskerProfile.displayName ? taskerProfile.displayName.charAt(0).toUpperCase() : <User size={48} />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{taskerProfile.displayName}</h2>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-2">
                <Briefcase size={18} /> Tasker since {new Date(taskerProfile.dateJoined).toLocaleDateString()}
              </p>
              <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2 mb-2">
                <DollarSign size={18} /> Hourly Rate: ₱{taskerProfile.hourlyRate.toLocaleString()}
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-800 dark:text-gray-100">
                <Star size={18} className="text-yellow-500" />
                <span className="font-semibold">Average Rating: {averageRating}</span>
                {completedTasksWithReviews.length > 0 && (
                  <span className="text-sm text-gray-500">({completedTasksWithReviews.length} reviews)</span>
                )}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {taskerProfile.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 px-3 py-1 rounded-full">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <Button onClick={() => navigate('/profile')} variant="outline" className="mt-4 md:mt-0 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              View My Public Profile
            </Button>
          </CardContent>
        </Card>

        {/* Assigned Tasks Section */}
        <section className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center md:text-left">My Assigned Tasks</h2>
          {assignedTasks.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No tasks currently assigned to you.</p>
              <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
                Browse Open Tasks
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignedTasks.map(task => (
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
                      <Link to={`/tasks/${task.id}`}>
                        <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                          View Task Details
                        </Button>
                      </Link>
                      {/* Taskers cannot mark as complete, only clients can review and complete */}
                      {task.status === 'assigned' && (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200">
                          Awaiting Client Completion
                        </Badge>
                      )}
                      {task.status === 'completed' && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200">
                          Completed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Client Reviews Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center md:text-left">Client Reviews</h2>
          {completedTasksWithReviews.length === 0 ? (
            <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <p className="text-gray-600 dark:text-gray-400 text-lg">No reviews yet. Complete more tasks to get feedback!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedTasksWithReviews.map((task, index) => (
                <Card key={index} className="p-4 shadow-sm">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={i < task.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"} />
                      ))}
                      <span className="font-semibold ml-1">{task.rating}/5</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 italic mb-2">"{task.review}"</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      - {task.posterName} for "{task.title}"
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TaskerDashboardPage;