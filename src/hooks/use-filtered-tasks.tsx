import React from 'react';
import { useTasks, Task } from './use-tasks';

// Helper function to get display name for categories
const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    all: 'All Services',
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    painting: 'Painting',
    marketing: 'Marketing',
    other: 'Other'
  };
  return names[category] || 'Task';
};

export const useFilteredTasks = (searchTerm: string, selectedCategory: string) => {
  const { tasks } = useTasks();

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
        task.location.toLowerCase().includes(lowerCaseSearchTerm) ||
        getCategoryName(task.category).toLowerCase().includes(lowerCaseSearchTerm) // Also search by category name
      );
    }
    return currentFilteredTasks;
  }, [tasks, searchTerm, selectedCategory]);

  return { filteredTasks };
};