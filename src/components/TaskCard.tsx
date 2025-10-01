import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, DollarSign } from 'lucide-react';
import { Task } from '@/hooks/use-tasks';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Card className="w-full max-w-sm overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <div className="relative">
        <img
          src={task.imageUrl}
          alt={task.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {task.isDemo && (
          <Badge className="absolute top-2 left-2 bg-blue-500 text-white">Sample Task</Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold truncate">{task.title}</CardTitle>
        <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="mr-1 h-4 w-4" /> {task.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-lg font-semibold text-green-600 flex items-center">
          <DollarSign className="mr-1 h-5 w-5" /> ₱{task.budget.toLocaleString()}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="mr-1 h-3 w-3" /> {new Date(task.datePosted).toLocaleDateString()}
        </div>
        <Link to={`/tasks/${task.id}`}>
          <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;