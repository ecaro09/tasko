import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard'; // Import the new TaskCard component
import { Task } from '@/hooks/use-tasks'; // Import Task interface

interface TaskListProps {
  tasks: Task[]; // Use the Task interface
  onAddTask: (task: string) => void;
  isAuthenticated: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, isAuthenticated }) => {
  const [taskInput, setTaskInput] = React.useState('');

  const handleAddTask = () => {
    if (taskInput.trim() && isAuthenticated) {
      // For now, onAddTask only takes a string.
      // In a real scenario, you'd likely open a modal for full task details.
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Available Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <p className="text-gray-500 col-span-full text-center">No tasks available. Sign in to add tasks.</p>
          )}
        </div>
        <div className="flex space-x-2 mt-4">
          <Input
            type="text"
            placeholder="Add a new task (e.g., 'Fix a leaky faucet')"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={!isAuthenticated}
          />
          <Button onClick={handleAddTask} disabled={!isAuthenticated}>
            Add Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;