"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Briefcase, User } from 'lucide-react';
import { TaskerProfile } from '@/hooks/use-tasker-profile';

interface TaskerCardProps {
  tasker: TaskerProfile;
}

const TaskerCard: React.FC<TaskerCardProps> = ({ tasker }) => {
  return (
    <Link to={`/taskers/${tasker.uid}`} className="block h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 ease-in-out">
        <CardHeader className="flex flex-row items-center space-x-4 pb-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={tasker.photoURL || undefined} alt={tasker.displayName} />
            <AvatarFallback className="bg-blue-500 text-white text-xl">
              {tasker.displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl font-semibold">{tasker.displayName}</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">Tasker</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pt-0">
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mb-3">{tasker.bio}</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {tasker.skills.slice(0, 3).map((skill, index) => ( // Show up to 3 skills
              <Badge key={index} variant="secondary" className="px-3 py-1 text-xs">
                {skill}
              </Badge>
            ))}
            {tasker.skills.length > 3 && (
              <Badge variant="outline" className="px-3 py-1 text-xs">
                +{tasker.skills.length - 3} more
              </Badge>
            )}
          </div>
          <div className="space-y-1 text-gray-700 dark:text-gray-300 text-sm">
            <p className="flex items-center gap-1"><DollarSign size={16} /> <strong>Rate:</strong> ₱{tasker.hourlyRate.toLocaleString()}/hr</p>
            <p className="flex items-center gap-1"><MapPin size={16} /> <strong>Location:</strong> {tasker.location}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TaskerCard;