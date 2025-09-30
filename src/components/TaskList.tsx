import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskListProps {
  tasks: string[];
  onAddTask: (task: string) => void;
  isAuthenticated: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, isAuthenticated }) => {
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
            tasks.map((task, index) => (
              <li key={index} className="bg-gray-100 p-2 rounded-md text-gray-800">
                {task}
              </li>
            ))
          ) : (
            <li className="text-gray-500">No tasks yet. Sign in to add tasks.</li>
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