import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth';
import TaskCard from './TaskCard';

const TaskList: React.FC = () => {
  const { tasks, loading, error } = useTasks();
  const { isAuthenticated } = useAuth(); // isAuthenticated is not directly used for display here, but kept for context if needed later.

  if (loading) {
    return (
      <Card className="mb-8">
        <CardHeader><CardTitle>Loading Tasks...</CardTitle></CardHeader>
        <CardContent><p>Fetching tasks from the server.</p></CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-8">
        <CardHeader><CardTitle>Error Loading Tasks</CardTitle></CardHeader>
        <CardContent><p className="text-red-500">{error}</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Available Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tasks available. Be the first to post one!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;