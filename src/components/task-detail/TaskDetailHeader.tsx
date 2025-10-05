import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_TASK_IMAGE_URL } from '@/utils/image-placeholders';
import { cn } from '@/lib/utils';
import { Task } from '@/hooks/use-tasks';

interface TaskDetailHeaderProps {
  task: Task;
}

const TaskDetailHeader: React.FC<TaskDetailHeaderProps> = ({ task }) => {
  const isTaskOpen = task.status === 'open';
  const isTaskAssigned = task.status === 'assigned';
  const isTaskInProgress = task.status === 'in_progress';
  const isTaskCompleted = task.status === 'completed';
  const isTaskCancelled = task.status === 'cancelled';

  return (
    <CardHeader className="relative p-0">
      <img
        src={task.imageUrl || DEFAULT_TASK_IMAGE_URL}
        alt={task.title}
        className="w-full h-64 object-cover rounded-t-lg"
        onError={(e) => {
          e.currentTarget.src = DEFAULT_TASK_IMAGE_URL;
          e.currentTarget.onerror = null;
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent rounded-t-lg flex items-end p-6">
        <CardTitle className="text-white text-4xl font-bold">{task.title}</CardTitle>
      </div>
      <Badge className={cn(
        "absolute top-4 right-4 px-4 py-2 text-base font-semibold",
        isTaskOpen && 'bg-blue-600 text-white',
        isTaskAssigned && 'bg-yellow-600 text-white',
        isTaskInProgress && 'bg-orange-600 text-white',
        isTaskCompleted && 'bg-green-600 text-white',
        isTaskCancelled && 'bg-gray-600 text-white'
      )}>
        {task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('_', ' ')}
      </Badge>
    </CardHeader>
  );
};

export default TaskDetailHeader;