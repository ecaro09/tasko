import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Task {
  id: string;
  text: string;
  createdAt: any; // Firebase Timestamp
  userId: string;
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (task: { text: string }) => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, isAuthenticated, loading }) => {
  const [taskInput, setTaskInput] = React.useState('');

  const handleAddTask = () => {
    if (taskInput.trim() && isAuthenticated) {
      onAddTask({ text: taskInput });
      setTaskInput('');
    }
  };

  return (
    <Card className="mb-8 shadow-lg">
      <CardHeader>
        <CardTitle>Task List</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-gray-500">Loading tasks...</p>
        ) : (
          <ul className="mb-4 space-y-2">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <li key={task.id} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md text-gray-800 dark:text-gray-200 flex justify-between items-center">
                  <span>{task.text}</span>
                  {/* Add more task details or actions here if needed */}
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400">No tasks yet. Sign in to add tasks.</li>
            )}
          </ul>
        )}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add a new task"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            disabled={!isAuthenticated || loading}
            className="flex-grow"
          />
          <Button onClick={handleAddTask} disabled={!isAuthenticated || loading || !taskInput.trim()}>
            Add Task
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskList;