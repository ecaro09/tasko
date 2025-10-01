"use client";

import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash } from 'lucide-react'; // Import Trash icon

interface FirestoreDataItem {
  id: string;
  content: string;
  createdAt: number;
}

interface TaskListProps {
  tasks: FirestoreDataItem[]; // Now passing full item objects
  onAddTask: (task: string) => void;
  onDeleteTask: (id: string) => void; // New prop for deleting tasks
  isAuthenticated: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onDeleteTask, isAuthenticated }) => {
  const [taskInput, setTaskInput] = React.useState('');

  const handleAddTask = () => {
    if (taskInput.trim() && isAuthenticated) {
      onAddTask(taskInput);
      setTaskInput('');
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Task List</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="mb-4 space-y-2">
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <li key={task.id} className="flex items-center justify-between bg-gray-100 p-2 rounded-md text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                <span>{task.content}</span>
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteTask(task.id)}
                    className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </li>
            ))
          ) : (
            <li className="text-gray-500 dark:text-gray-400">No tasks yet. Sign in to add tasks.</li>
          )}
        </ul>
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Add a new task"
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