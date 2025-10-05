import React from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from 'lucide-react';
import { DEFAULT_AVATAR_URL } from '@/utils/image-placeholders';
import { Task } from '@/hooks/use-tasks';

interface TaskUserCardsProps {
  task: Task;
  isTaskPoster: boolean;
  isAuthenticated: boolean;
  currentUserId: string | undefined;
  onChatWithUser: (userId: string) => void;
}

const TaskUserCards: React.FC<TaskUserCardsProps> = ({
  task,
  isTaskPoster,
  isAuthenticated,
  currentUserId,
  onChatWithUser,
}) => {
  return (
    <>
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <img
          src={task.posterAvatar || DEFAULT_AVATAR_URL}
          alt={task.posterName}
          className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
          onError={(e) => {
            e.currentTarget.src = DEFAULT_AVATAR_URL;
            e.currentTarget.onerror = null;
          }}
        />
        <div>
          <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Posted by: {task.posterName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
        </div>
        {!isTaskPoster && isAuthenticated && (
          <Button
            onClick={() => onChatWithUser(task.posterId)}
            className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <MessageSquare size={20} /> Chat with Client
          </Button>
        )}
      </div>

      {task.assignedTaskerId && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <img
            src={task.assignedTaskerAvatar || DEFAULT_AVATAR_URL}
            alt={task.assignedTaskerName}
            className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR_URL;
              e.currentTarget.onerror = null;
            }}
          />
          <div>
            <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">Assigned Tasker: {task.assignedTaskerName}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tasker</p>
          </div>
          {isAuthenticated && currentUserId !== task.assignedTaskerId && (
            <Button
              onClick={() => onChatWithUser(task.assignedTaskerId)}
              className="ml-auto bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <MessageSquare size={20} /> Chat with Tasker
            </Button>
          )}
        </div>
      )}
    </>
  );
};

export default TaskUserCards;