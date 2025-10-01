import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, doc, updateDoc, deleteDoc, DocumentData } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { DEMO_TASKS } from '@/utils/demo-tasks'; // Import demo tasks

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  location: string;
  imageUrl: string;
  posterId: string;
  posterName: string;
  posterAvatar?: string;
  datePosted: string; // ISO string
  status: 'open' | 'assigned' | 'completed' | 'cancelled';
  assignedTaskerId?: string;
  assignedOfferId?: string;
  isDemo?: boolean; // Added to distinguish demo tasks
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (
    title: string,
    description: string,
    category: string,
    budget: number,
    location: string,
    imageUrl: string,
  ) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status'], assignedTaskerId?: string, assignedOfferId?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, 'tasks'), orderBy('datePosted', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          category: data.category,
          budget: data.budget,
          location: data.location,
          imageUrl: data.imageUrl,
          posterId: data.posterId,
          posterName: data.posterName,
          posterAvatar: data.posterAvatar,
          datePosted: data.datePosted?.toDate().toISOString() || new Date().toISOString(),
          status: data.status || 'open',
          assignedTaskerId: data.assignedTaskerId,
          assignedOfferId: data.assignedOfferId,
          isDemo: false, // Real tasks are not demo
        };
      });

      if (fetchedTasks.length === 0) {
        // If no real tasks, show demo tasks
        setTasks(DEMO_TASKS.map(task => ({ ...task, isDemo: true })));
      } else {
        // Otherwise, show real tasks
        setTasks(fetchedTasks);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks.");
      setLoading(false);
      toast.error("Failed to load tasks.");
      // Fallback to demo tasks on error if no real tasks loaded
      if (tasks.length === 0) {
        setTasks(DEMO_TASKS.map(task => ({ ...task, isDemo: true })));
      }
    });

    return () => unsubscribe();
  }, []); // Removed tasks from dependency array to prevent infinite loop

  const addTask = async (
    title: string,
    description: string,
    category: string,
    budget: number,
    location: string,
    imageUrl: string,
  ) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to post a task.");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        title,
        description,
        category,
        budget,
        location,
        imageUrl,
        posterId: user.uid,
        posterName: user.displayName || 'Anonymous',
        posterAvatar: user.photoURL || null,
        datePosted: serverTimestamp(),
        status: 'open',
      });
      toast.success("Task posted successfully!");
    } catch (err: any) {
      console.error("Error adding task:", err);
      toast.error(`Failed to post task: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: Task['status'], assignedTaskerId?: string, assignedOfferId?: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to update a task.");
      return;
    }
    // Prevent updating demo tasks
    if (tasks.find(t => t.id === taskId)?.isDemo) {
      toast.error("Cannot update demo tasks.");
      return;
    }

    setLoading(true);
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status,
        assignedTaskerId: assignedTaskerId || null,
        assignedOfferId: assignedOfferId || null,
      });
      toast.success("Task status updated!");
    } catch (err: any) {
      console.error("Error updating task status:", err);
      toast.error(`Failed to update task status: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to delete a task.");
      return;
    }
    // Prevent deleting demo tasks
    if (tasks.find(t => t.id === taskId)?.isDemo) {
      toast.error("Cannot delete demo tasks.");
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(`Failed to delete task: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    tasks,
    loading,
    error,
    addTask,
    updateTaskStatus,
    deleteTask,
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