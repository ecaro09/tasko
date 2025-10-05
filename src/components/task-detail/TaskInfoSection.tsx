import React from 'react';
import { MapPin, Tag, DollarSign, Calendar } from 'lucide-react';
import { Task } from '@/hooks/use-tasks';

interface TaskInfoSectionProps {
  task: Task;
}

const TaskInfoSection: React.FC<TaskInfoSectionProps> = ({ task }) => {
  return (
    <>
      <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg leading-relaxed">{task.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <MapPin size={20} className="mr-3 text-green-600" />
          <span className="font-medium">Location:</span> {task.location}
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Tag size={20} className="mr-3 text-green-600" />
          <span className="font-medium">Category:</span> {task.category}
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign size={20} className="mr-3 text-green-600" />
          <span className="font-medium">Budget:</span> ₱{task.budget.toLocaleString()}
        </div>
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <Calendar size={20} className="mr-3 text-green-600" />
          <span className="font-medium">Due Date:</span> {new Date(task.dueDate).toLocaleDateString()}
        </div>
      </div>
    </>
  );
};

export default TaskInfoSection;