import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  DocumentData,
  Timestamp, // Import Timestamp type
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import {
  Task, // Import Task interface
  addTaskFirestore,
  editTaskFirestore,
  deleteTaskFirestore,
  completeTaskWithReviewFirestore,
  saveTasksToCache, // New import
  loadTasksFromCache, // New import
  fetchTasksFirestore, // New import
} from '@/lib/task-firestore'; // Import new utility functions
import { seedInitialTasks } from '@/lib/seed-tasks'; // Import seed function from new location

interface UseTasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (newTask: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review'> & { imageUrl?: string }) => Promise<void>; // Updated addTask signature
  editTask: (taskId: string, updatedTask: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTaskWithReview: (taskId: string, rating: number, review: string) => Promise<void>;
}

const TasksContext = createContext<UseTasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [allTasks, setAllTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Attempt to load tasks from cache first
    const cachedTasks = loadTasksFromCache();
    if (cachedTasks.length > 0) {
      setAllTasks(cachedTasks);
      setLoading(false); // Set loading to false as we have data
      console.log("Tasks loaded from cache.");
    } else {
      setLoading(true); // Keep loading true if no cache data
    }

    setError(null);

    // 2. Set up real-time Firestore listener
    const unsubscribe = fetchTasksFirestore(
      (fetchedTasks) => {
        setAllTasks(fetchedTasks);
        setLoading(false);
        // The fetchTasksFirestore function already saves to cache
        // Only seed if no tasks are present after initial fetch AND Firestore is empty
        if (fetchedTasks.length === 0) {
          seedInitialTasks();
        }
      },
      (errorMessage) => {
        setError(errorMessage);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount

  const addTask = async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review'> & { imageUrl?: string }) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to post a task.");
      return;
    }
    await addTaskFirestore(newTaskData, user);
  };

  const editTask = async (taskId: string, updatedTask: Partial<Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted'>>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to edit a task.");
      return;
    }
    await editTaskFirestore(taskId, updatedTask, user);
  };

  const deleteTask = async (taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to delete a task.");
      return;
    }
    await deleteTaskFirestore(taskId, user);
  };

  const completeTaskWithReview = async (taskId: string, rating: number, review: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to complete and review a task.");
      return;
    }
    await completeTaskWithReviewFirestore(taskId, rating, review, user);
  };

  const value = {
    tasks: allTasks,
    loading,
    error,
    addTask,
    editTask,
    deleteTask,
    completeTaskWithReview,
  };

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};