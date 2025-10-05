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
    setLoading(true);
    setError(null);

    const tasksCollectionRef = collection(db, 'tasks');
    const q = query(tasksCollectionRef, orderBy('datePosted', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        
        // Handle datePosted which can be a Firebase Timestamp or a string (from seeded data)
        let datePostedDate: Date;
        if (data.datePosted instanceof Timestamp) {
          datePostedDate = data.datePosted.toDate();
        } else if (typeof data.datePosted === 'string') {
          datePostedDate = new Date(data.datePosted);
        } else {
          datePostedDate = new Date(); // Fallback to current date if unexpected type
        }

        return {
          id: doc.id,
          title: data.title,
          category: data.category,
          description: data.description,
          location: data.location,
          budget: data.budget,
          posterId: data.posterId,
          posterName: data.posterName,
          posterAvatar: data.posterAvatar || "https://randomuser.me/api/portraits/lego/1.jpg",
          datePosted: datePostedDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
          status: data.status || 'open',
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Default image if none provided
          assignedTaskerId: data.assignedTaskerId || undefined, // Include assignedTaskerId
          assignedOfferId: data.assignedOfferId || undefined, // Include assignedOfferId
          rating: data.rating || undefined, // Include rating
          review: data.review || undefined, // Include review
        };
      });
      setAllTasks(fetchedTasks);
      setLoading(false);

      // Only seed if no tasks are present after initial fetch
      if (fetchedTasks.length === 0) {
        seedInitialTasks();
      }
    }, (err) => {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks.");
      setLoading(false);
      toast.error("Failed to load tasks.");
    });

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