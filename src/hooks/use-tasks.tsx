import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  getDocs,
  deleteDoc, // Import deleteDoc
  doc, // Import doc
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface Task {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  budget: number;
  posterId: string;
  posterName: string;
  posterAvatar: string;
  datePosted: string;
  status: 'open' | 'assigned' | 'completed';
  imageUrl?: string;
  assignedTaskerId?: string; // New field for assigned tasker's ID
  assignedOfferId?: string; // New field for the accepted offer's ID
}

interface UseTasksContextType {
  tasks: Task[]; // This will now be all tasks
  loading: boolean;
  error: string | null;
  addTask: (newTask: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>; // Added deleteTask
}

const TasksContext = createContext<UseTasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
}

export const TasksProvider: React.FC<TasksProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]
);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to seed initial tasks
  const seedInitialTasks = async () => {
    const tasksCollectionRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksCollectionRef);

    if (snapshot.empty) {
      console.log("Database is empty, seeding initial marketing tasks...");
      const initialTasks = [
        {
          title: "Social Media Manager for Local Business",
          category: "marketing",
          description: "Looking for a Pinoy/Pinay social media expert to manage our Facebook and Instagram pages. Must be familiar with local trends and audience engagement. Experience with Canva is a plus!",
          location: "Metro Manila",
          budget: 5000,
          posterId: "seed-user-1",
          posterName: "Maria Santos",
          posterAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965da0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Flyer Distribution for Sari-Sari Store",
          category: "marketing",
          description: "Need help distributing flyers for our new sari-sari store opening in Cebu. Must be reliable and know the local neighborhoods well. Target areas: Lapu-Lapu City, Mandaue City.",
          location: "Cebu City",
          budget: 1200,
          posterId: "seed-user-2",
          posterName: "Juan Dela Cruz",
          posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Online Content Creator for Pinoy Food Blog",
          category: "marketing",
          description: "Seeking a creative Pinay content creator to produce engaging short videos and articles for our Filipino food blog. Knowledge of popular Filipino dishes and food styling is a must!",
          location: "Remote (Philippines)",
          budget: 3500,
          posterId: "seed-user-3",
          posterName: "Aling Nena",
          posterAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1504711432028-ee2611f5817a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
      ];

      for (const task of initialTasks) {
        await addDoc(tasksCollectionRef, task);
      }
      toast.info("Initial marketing tasks added!");
    }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);

    const tasksCollectionRef = collection(db, 'tasks');
    const q = query(tasksCollectionRef, orderBy('datePosted', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
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
          datePosted: data.datePosted?.toDate().toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
          status: data.status || 'open',
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Default image if none provided
          assignedTaskerId: data.assignedTaskerId || undefined, // Map new field
          assignedOfferId: data.assignedOfferId || undefined, // Map new field
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

  const addTask = async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId'>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to post a task.");
      return;
    }

    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTaskData,
        posterId: user.uid,
        posterName: user.displayName || user.email || "Anonymous User",
        posterAvatar: user.photoURL || "https://randomuser.me/api/portraits/lego/1.jpg",
        datePosted: serverTimestamp(),
        status: 'open',
        imageUrl: newTaskData.imageUrl || "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Default image if none provided
      });
      toast.success("Task posted successfully!");
    } catch (err: any) {
      console.error("Error adding task:", err);
      toast.error(`Failed to post task: ${err.message}`);
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to delete a task.");
      return;
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
      toast.success("Task deleted successfully!");
    } catch (err: any) {
      console.error("Error deleting task:", err);
      toast.error(`Failed to delete task: ${err.message}`);
      throw err;
    }
  };

  const value = {
    tasks: allTasks, // Expose all tasks
    loading,
    error,
    addTask,
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