import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TaskCard from './TaskCard'; // Import the new TaskCard component
import { Task } from '@/hooks/use-tasks'; // Import the Task interface

interface TaskListProps {
  tasks: Task[]; // Now expects an array of Task objects
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Available Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">No tasks available. Be the first to post one!</p>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;