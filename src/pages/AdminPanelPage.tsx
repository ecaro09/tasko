import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, List, Users, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from '@/hooks/use-tasks';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useAuth } from '@/hooks/use-auth'; // For user list

const AdminPanelPage: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { allTaskerProfiles, loading: taskersLoading, error: taskersError } = useTaskerProfile();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // Basic check for admin role (this would be more robust in a real app)
  // For now, let's assume a specific user ID or email is admin
  const isAdmin = isAuthenticated && user?.email === 'admin@example.com'; // Replace with actual admin logic

  if (authLoading || tasksLoading || taskersLoading) {
    return <div className="container mx-auto p-4 text-center pt-[80px]">Loading admin data...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 pt-[60px] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400 mb-6">You do not have administrative privileges to view this page.</p>
            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700 text-white">
              Go to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4 max-w-5xl">
        <Button onClick={() => navigate(-1)} variant="outline" className="mb-6 border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
          <ArrowLeft size={20} className="mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-green-600 mb-8 text-center flex items-center justify-center gap-3">
          <ShieldCheck size={36} /> Admin Dashboard
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
          🔒 Admin Monitoring Only. Manage tasks, users, and view analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tasks List */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <List size={24} /> All Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {tasksError && <p className="text-red-500 text-sm">Error: {tasksError}</p>}
              {tasksLoading ? (
                <p className="text-gray-500">Loading tasks...</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto">
                  {tasks.length === 0 ? (
                    <li>No tasks found.</li>
                  ) : (
                    tasks.map(task => (
                      <li key={task.id} className="truncate">
                        <span className="font-medium">{task.title}</span> (Budget: ₱{task.budget.toLocaleString()}) - Status: {task.status}
                      </li>
                    ))
                  )}
                </ul>
              )}
              <Button variant="link" className="p-0 h-auto mt-3 text-green-600 hover:text-green-700" onClick={() => navigate('/')}>
                View All Tasks
              </Button>
            </CardContent>
          </Card>

          {/* Taskers List */}
          <Card className="shadow-lg">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Users size={24} /> All Taskers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {taskersError && <p className="text-red-500 text-sm">Error: {taskersError}</p>}
              {taskersLoading ? (
                <p className="text-gray-500">Loading taskers...</p>
              ) : (
                <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 max-h-60 overflow-y-auto">
                  {allTaskerProfiles.length === 0 ? (
                    <li>No taskers found.</li>
                  ) : (
                    allTaskerProfiles.map(tasker => (
                      <li key={tasker.userId} className="truncate">
                        <span className="font-medium">{tasker.displayName}</span> (Rate: ₱{tasker.hourlyRate.toLocaleString()}/hr) - Verified: {tasker.isVerifiedTasker ? 'Yes' : 'No'}
                      </li>
                    ))
                  )}
                </ul>
              )}
              <Button variant="link" className="p-0 h-auto mt-3 text-green-600 hover:text-green-700" onClick={() => navigate('/browse-taskers')}>
                View All Taskers
              </Button>
            </CardContent>
          </Card>

          {/* Analytics Chart Placeholder */}
          <Card className="shadow-lg col-span-full lg:col-span-1">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <BarChart size={24} /> Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="bg-gray-50 dark:bg-gray-700 h-48 flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 italic">
                Chart data coming soon...
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                This section will display key metrics and insights.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPanelPage;