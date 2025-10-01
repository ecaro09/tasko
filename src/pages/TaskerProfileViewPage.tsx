import React from 'react';
import { useParams } from 'react-router-dom';

const TaskerProfileViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 pt-[80px]">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Tasker Profile: {id}</h1>
        <p className="text-center text-gray-600 dark:text-gray-300">
          This page will display a specific tasker's profile.
        </p>
      </div>
    </div>
  );
};

export default TaskerProfileViewPage;