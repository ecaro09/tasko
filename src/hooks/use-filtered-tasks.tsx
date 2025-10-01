import React from 'react';
import { Task, useTasks } from './use-tasks';

interface UseFilteredTasksResult {
  filteredTasks: Task[];
  loading: boolean;
  error: string | null;
}

export const useFilteredTasks = (searchTerm: string, selectedCategory: string): UseFilteredTasksResult => {
  const { tasks, loading, error } = useTasks();

  const filteredTasks = React.useMemo(() => {
    let currentFilteredTasks = tasks;

    if (selectedCategory && selectedCategory !== 'all') {
      currentFilteredTasks = currentFilteredTasks.filter(task => task.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredTasks = currentFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.location.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentFilteredTasks;
  }, [tasks, searchTerm, selectedCategory]);

  return { filteredTasks, loading, error };
};