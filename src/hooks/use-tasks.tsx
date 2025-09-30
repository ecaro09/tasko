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
  posterId: string; // This property is required
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

// Sample Task Data (for initial load if Firestore is empty or for demonstration)
const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Furniture Assembly Needed",
    category: "assembly",
    description: "Need help assembling IKEA bed and wardrobe. All parts are available.",
    location: "Quezon City, Metro Manila",
    budget: 800,
    posterId: "sample-poster-1", // Added posterId
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
    posterId: "sample-poster-2", // Added posterId
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
    posterId: "sample-poster-3", // Added posterId
    posterName: "Ana Reyes",
    posterAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    datePosted: "2023-06-13",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
  },
  // New marketing-focused tasks
  {
    id: "4",
    title: "Delicious Pinoy Food Delivery",
    category: "delivery",
    description: "Craving authentic Filipino dishes? Get your favorite adobo, sinigang, or lechon delivered fresh to your door by a reliable Pinoy tasker!",
    location: "Taguig City, Metro Manila",
    budget: 300,
    posterId: "sample-poster-4", // Added posterId
    posterName: "Aling Nena",
    posterAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    datePosted: "2023-06-16",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1563612116625-30123f730e5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Food delivery image
  },
  {
    id: "5",
    title: "Home Garden Maintenance by a Pinay Expert",
    category: "repairs", // Using repairs for general home services, could be 'other'
    description: "Need a green thumb for your garden? A skilled Pinay gardener is ready to help with planting, pruning, and general upkeep to make your home beautiful.",
    location: "Cebu City, Cebu",
    budget: 1000,
    posterId: "sample-poster-5", // Added posterId
    posterName: "Mang Tonyo",
    posterAvatar: "https://randomuser.me/api/portraits/men/77.jpg",
    datePosted: "2023-06-16",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1518568779000-729784601159?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", // Gardening image
  },
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
      // If Firestore has no tasks, use sample tasks. Otherwise, use fetched tasks.
      setAllTasks(fetchedTasks.length > 0 ? fetchedTasks : sampleTasks);
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