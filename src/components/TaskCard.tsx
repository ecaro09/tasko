import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { Task } from '@/hooks/use-tasks'; // Import the Task interface

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
        <Badge className={`absolute top-2 right-2 ${task.status === 'open' ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
          {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
        </Badge>
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-bold truncate">{task.title}</CardTitle>
        <CardDescription className="flex items-center text-gray-600 dark:text-gray-400">
          <MapPin className="mr-1 h-4 w-4" /> {task.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-lg font-semibold text-green-600 flex items-center mb-2">
          <DollarSign className="mr-1 h-5 w-5" /> ₱{task.budget.toLocaleString()}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-300 line-clamp-2">{task.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Calendar className="mr-1 h-4 w-4" /> {new Date(task.datePosted).toLocaleDateString()}
        </div>
        <Link to={`/tasks/${task.id}`}>
          <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default TaskCard;