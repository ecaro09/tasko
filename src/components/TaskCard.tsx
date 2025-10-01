import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Calendar } from 'lucide-react';
import { Task } from '@/hooks/use-tasks';

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  return (
    <Link to={`/tasks/${task.id}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <div className="relative">
          <img
            src={task.imageUrl}
            alt={task.title}
            className="w-full h-40 object-cover rounded-t-lg"
            loading="lazy"
          />
          {task.isDemo && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white">Sample Task</Badge>
          )}
        </div>
        <CardHeader className="flex-grow">
          <CardTitle className="text-xl font-semibold mb-2">{task.title}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400 line-clamp-2">
            {task.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center text-gray-700 dark:text-gray-300 mb-2">
            <DollarSign size={16} className="mr-1" />
            <span className="font-bold text-lg">₱{task.budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
            <MapPin size={14} className="mr-1" />
            <span>{task.location}</span>
          </div>
          <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
            <Calendar size={14} className="mr-1" />
            <span>{new Date(task.datePosted).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TaskCard;