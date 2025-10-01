import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { Task } from '@/hooks/use-tasks'; // Import the Task interface

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Link to={`/tasks/${task.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader className="p-0 relative">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-40 object-cover rounded-t-lg"
            loading="lazy"
          />
          {task.isDemo && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white">Sample Task</Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-lg font-semibold mb-2 line-clamp-2">{task.title}</CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-3">
            {task.description}
          </CardDescription>
          <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <p className="flex items-center gap-1">
              <MapPin size={16} className="text-gray-500 dark:text-gray-400" /> {task.location}
            </p>
            <p className="flex items-center gap-1">
              <Calendar size={16} className="text-gray-500 dark:text-gray-400" /> {new Date(task.datePosted).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="flex items-center gap-1 text-lg font-bold text-green-600">
            <DollarSign size={18} /> {task.budget.toLocaleString()}
          </div>
          <Badge variant="secondary">{task.category}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default TaskCard;