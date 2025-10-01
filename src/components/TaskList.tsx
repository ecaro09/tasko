import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasks } from '@/hooks/use-tasks';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import TaskCard from './TaskCard'; // Import the new TaskCard component

interface TaskListProps {
  // No longer needs tasks, onAddTask, isAuthenticated props as it will use useTasks hook
}

const TaskList: React.FC<TaskListProps> = () => {
  const { tasks, loading, error, addTask } = useTasks();
  const { isAuthenticated } = useAuth(); // Get isAuthenticated from useAuth
  const [taskInput, setTaskInput] = React.useState('');

  const handleAddTask = () => {
    // This functionality will be replaced by a proper task creation form later
    // For now, we'll keep a placeholder or remove it if not directly used.
    // As per the prompt, the focus is on displaying demo tasks.
    if (taskInput.trim() && isAuthenticated) {
      // Placeholder for adding a task, actual implementation will be more complex
      console.log("Add Task clicked (Firebase firestore not yet active):", taskInput);
      // addTask(taskInput, "Description placeholder", "Category placeholder", 1000, "Location placeholder", "https://via.placeholder.com/400x200");
      setTaskInput('');
    }
  };

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
        {/* The input and button for adding tasks are removed as they are not part of the current task display flow */}
      </CardContent>
    </Card>
  );
};

export default TaskList;