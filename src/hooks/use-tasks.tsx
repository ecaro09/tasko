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
} from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth'; // Corrected import for useAuth

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
}

interface UseTasksContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  addTask: (newTask: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status'>) => Promise<void>;
  filteredTasks: Task[];
}

const TasksContext = createContext<UseTasksContextType | undefined>(undefined);

interface TasksProviderProps {
  children: ReactNode;
  searchTerm?: string;
  selectedCategory?: string;
}

// Sample Task Data (used as a fallback if Firestore is empty)
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Furniture Assembly Needed",
    category: "assembly",
    description: "Need help assembling IKEA bed and wardrobe. All parts are available.",
    location: "Quezon City, Metro Manila",
    budget: 800,
    posterId: "sample-user-1",
    posterName: "Maria Santos",
    posterAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    datePosted: "2023-06-15",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "2",
    title: "Apartment Cleaning",
    category: "cleaning",
    description: "General cleaning for 2-bedroom apartment. Includes sweeping, mopping, and bathroom cleaning.",
    location: "Makati City, Metro Manila",
    budget: 1200,
    posterId: "sample-user-2",
    posterName: "Juan Dela Cruz",
    posterAvatar: "https://randomuser.me/api/portraits/men/54.jpg",
    datePosted: "2023-06-14",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "3",
    title: "Help with Moving",
    category: "moving",
    description: "Need assistance moving furniture from 2nd floor to ground floor.",
    location: "Mandaluyong City, Metro Manila",
    budget: 1500,
    posterId: "sample-user-3",
    posterName: "Ana Reyes",
    posterAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    datePosted: "2023-06-13",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "4",
    title: "Marketing Campaign for Pinoy & Pinay Taskers/Customers",
    category: "other",
    description: "Seeking creative ideas and execution for a marketing campaign specifically targeting Filipino taskers and customers to grow our community. Must understand local culture and trends.",
    location: "Philippines (Remote)",
    budget: 5000,
    posterId: "tasko-admin",
    posterName: "Tasko Admin",
    posterAvatar: "https://randomuser.me/api/portraits/lego/9.jpg",
    datePosted: "2023-06-16",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1557804506-669a67965da0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Placeholder for marketing
  }
];

export const TasksProvider: React.FC<TasksProviderProps> = ({ children, searchTerm = '', selectedCategory = 'all' }) => {
  const { user, isAuthenticated } = useAuth();
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        };
      });
      // If no tasks are fetched from Firestore, use sample tasks
      if (fetchedTasks.length === 0) {
        setAllTasks(sampleTasks);
      } else {
        setAllTasks(fetchedTasks);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tasks:", err);
      setError("Failed to fetch tasks.");
      setLoading(false);
      toast.error("Failed to load tasks.");
      // Fallback to sample tasks on error
      setAllTasks(sampleTasks);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let currentFilteredTasks = allTasks;

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

    setFilteredTasks(currentFilteredTasks);
  }, [allTasks, searchTerm, selectedCategory]);


  const addTask = async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status'>) => {
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
      });
      toast.success("Task posted successfully!");
    } catch (err: any) {
      console.error("Error adding task:", err);
      toast.error(`Failed to post task: ${err.message}`);
      throw err;
    }
  };

  const value = {
    tasks: allTasks,
    filteredTasks,
    loading,
    error,
    addTask,
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