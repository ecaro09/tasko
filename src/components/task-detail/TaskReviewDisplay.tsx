import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from 'lucide-react';
import { Task } from '@/hooks/use-tasks';

interface TaskReviewDisplayProps {
  task: Task;
}

const TaskReviewDisplay: React.FC<TaskReviewDisplayProps> = ({ task }) => {
  if (!task.review) return null;

  return (
    <Card className="mt-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
      <CardHeader>
        <CardTitle className="text-green-700 dark:text-green-300 flex items-center gap-2">
          <Star size={24} fill="currentColor" className="text-green-500" /> Task Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-2">
          <span className="text-xl font-bold text-green-600">{task.review.rating}</span>
          <Star size={20} fill="currentColor" className="text-green-500 ml-1" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">({task.review.reviewerName})</span>
        </div>
        <p className="text-gray-700 dark:text-gray-300 italic">"{task.review.comment}"</p>
      </CardContent>
    </Card>
  );
};

export default TaskReviewDisplay;