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
  assignedTaskerId?: string; // New field for the assigned tasker's ID
  assignedOfferId?: string; // New field for the accepted offer's ID
  rating?: number; // New field for task rating
  review?: string; // New field for task review
}

interface UseTasksContextType {
  tasks: Task[]; // This will now be all tasks
  loading: boolean;
  error: string | null;
  addTask: (newTask: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>; // Added deleteTask
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

  // Function to seed initial tasks
  const seedInitialTasks = async () => {
    const tasksCollectionRef = collection(db, 'tasks');
    const snapshot = await getDocs(tasksCollectionRef);

    if (snapshot.empty) {
      console.log("Database is empty, seeding initial tasks...");
      const initialTasks = [
        {
          title: "Tubero for leaky sink – ₱500",
          category: "repairs",
          description: "Need a plumber to fix a leaky sink in the kitchen. Small job, but needs to be done quickly.",
          location: "Quezon City, Metro Manila",
          budget: 500,
          posterId: "seed-client-1",
          posterName: "Aling Nena",
          posterAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "General Cleaning for Apartment – ₱800",
          category: "cleaning",
          description: "Thorough cleaning for a 2-bedroom apartment. Includes kitchen, bathroom, living room, and bedrooms.",
          location: "Makati City, Metro Manila",
          budget: 800,
          posterId: "seed-client-2",
          posterName: "Mang Tonyo",
          posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Delivery Service for Documents – ₱200",
          category: "delivery",
          description: "Urgent document delivery from Pasig to Taguig. Must be reliable and fast.",
          location: "Pasig City, Metro Manila",
          budget: 200,
          posterId: "seed-client-3",
          posterName: "Liza Soberano",
          posterAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Electrician for outlet repair – ₱1,200",
          category: "repairs",
          description: "Need an electrician to fix a faulty electrical outlet in the living room. Safety first!",
          location: "Mandaluyong City, Metro Manila",
          budget: 1200,
          posterId: "seed-client-4",
          posterName: "Daniel Padilla",
          posterAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Aircon Cleaning – ₱1,000",
          category: "cleaning",
          description: "Cleaning for one split-type air conditioner unit. Needs to be done this weekend.",
          location: "Quezon City, Metro Manila",
          budget: 1000,
          posterId: "seed-client-5",
          posterName: "Kathryn Bernardo",
          posterAvatar: "https://randomuser.me/api/portraits/women/6.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Carpentry for custom shelf – ₱1,500",
          category: "assembly",
          description: "Build a small custom wooden shelf for books. Materials provided.",
          location: "Pasig City, Metro Manila",
          budget: 1500,
          posterId: "seed-client-6",
          posterName: "Alden Richards",
          posterAvatar: "https://randomuser.me/api/portraits/men/8.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Appliance Repair (Washing Machine) – ₱1,300",
          category: "repairs",
          description: "Washing machine not spinning. Need a technician to diagnose and repair.",
          location: "Taguig City, Metro Manila",
          budget: 1300,
          posterId: "seed-client-7",
          posterName: "Maine Mendoza",
          posterAvatar: "https://randomuser.me/api/portraits/women/10.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Painting Job for Bedroom – ₱2,000",
          category: "painting",
          description: "Paint one bedroom (approx. 10sqm). White paint, walls only. Paint provided.",
          location: "Cebu City",
          budget: 2000,
          posterId: "seed-client-8",
          posterName: "Coco Martin",
          posterAvatar: "https://randomuser.me/api/portraits/men/12.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Laptop Fix (Screen Replacement) – ₱700",
          category: "repairs",
          description: "Broken laptop screen. Need someone experienced in laptop repairs.",
          location: "Davao City",
          budget: 700,
          posterId: "seed-client-9",
          posterName: "Angel Locsin",
          posterAvatar: "https://randomuser.me/api/portraits/women/14.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Plumbing Emergency (Clogged Toilet) – ₱600",
          category: "repairs",
          description: "Clogged toilet, urgent repair needed. Available immediately.",
          location: "Muntinlupa City, Metro Manila",
          budget: 600,
          posterId: "seed-client-10",
          posterName: "Vice Ganda",
          posterAvatar: "https://randomuser.me/api/portraits/men/16.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "House Helper for Weekly Chores – ₱900",
          category: "cleaning",
          description: "Looking for a house helper for weekly cleaning and light chores. 4 hours per session.",
          location: "Pasay City, Metro Manila",
          budget: 900,
          posterId: "seed-client-1",
          posterName: "Aling Nena",
          posterAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Tutor for Math (Grade 6) – ₱500",
          category: "other", // Assuming 'other' for tutoring
          description: "Need a math tutor for a Grade 6 student. Focus on algebra basics. Online or in-person.",
          location: "Remote (Philippines)",
          budget: 500,
          posterId: "seed-client-2",
          posterName: "Mang Tonyo",
          posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1504711432028-ee2611f5817a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Grocery Delivery from SM – ₱250",
          category: "delivery",
          description: "Deliver groceries from SM Supermarket to my home. List will be provided.",
          location: "Quezon City, Metro Manila",
          budget: 250,
          posterId: "seed-client-3",
          posterName: "Liza Soberano",
          posterAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Office Cleaning (Small Office) – ₱1,800",
          category: "cleaning",
          description: "Deep cleaning for a small office space. Includes vacuuming, dusting, and sanitizing.",
          location: "Ortigas Center, Pasig City",
          budget: 1800,
          posterId: "seed-client-4",
          posterName: "Daniel Padilla",
          posterAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        {
          title: "Motorcycle Mechanic for Tune-up – ₱1,100",
          category: "repairs",
          description: "Motorcycle tune-up and oil change. Can bring to mechanic's shop or home service.",
          location: "Caloocan City, Metro Manila",
          budget: 1100,
          posterId: "seed-client-5",
          posterName: "Kathryn Bernardo",
          posterAvatar: "https://randomuser.me/api/portraits/women/6.jpg",
          datePosted: serverTimestamp(),
          status: "open",
          imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        },
        // Example of an assigned task
        {
          title: "Install new ceiling fan",
          category: "assembly",
          description: "Need help installing a new ceiling fan in the living room. Electrical knowledge required.",
          location: "Mandaluyong City, Metro Manila",
          budget: 750,
          posterId: "seed-client-6",
          posterName: "Alden Richards",
          posterAvatar: "https://randomuser.me/api/portraits/men/8.jpg",
          datePosted: serverTimestamp(),
          status: "assigned",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-1", // Assigned to a dummy tasker
          assignedOfferId: "dummy-offer-1",
        },
        // Example of a completed task with rating and review
        {
          title: "Repair broken cabinet door",
          category: "repairs",
          description: "Cabinet door hinge is broken, needs to be replaced and re-aligned.",
          location: "Pasig City, Metro Manila",
          budget: 400,
          posterId: "seed-client-7",
          posterName: "Maine Mendoza",
          posterAvatar: "https://randomuser.me/api/portraits/women/10.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-2", // Assigned to a dummy tasker
          assignedOfferId: "dummy-offer-2",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Solid si Kuya! Mabilis gumawa, sulit bayad. Highly recommended!",
        },
        {
          title: "Deep Clean Kitchen",
          category: "cleaning",
          description: "Thorough deep cleaning of kitchen including oven, fridge, and cabinets.",
          location: "Taguig City, Metro Manila",
          budget: 1500,
          posterId: "seed-client-8",
          posterName: "Coco Martin",
          posterAvatar: "https://randomuser.me/api/portraits/men/12.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-2",
          assignedOfferId: "dummy-offer-3",
          rating: 4,
          review: "⭐⭐⭐⭐ Magaling maglinis, medyo matagal lang dumating. Pero overall, satisfied!",
        },
        {
          title: "Assemble IKEA Bookshelf",
          category: "assembly",
          description: "Need help assembling a large IKEA bookshelf. All tools provided.",
          location: "Quezon City, Metro Manila",
          budget: 800,
          posterId: "seed-client-9",
          posterName: "Angel Locsin",
          posterAvatar: "https://randomuser.me/api/portraits/women/14.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-1",
          assignedOfferId: "dummy-offer-4",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Ang bilis at ang galing mag-assemble! Walang problema. Salamat!",
        },
        {
          title: "Dog Walking (Daily for a week)",
          category: "other",
          description: "Need someone to walk my golden retriever daily for one week, 30 mins each walk.",
          location: "Mandaluyong City, Metro Manila",
          budget: 1000,
          posterId: "seed-client-10",
          posterName: "Vice Ganda",
          posterAvatar: "https://randomuser.me/api/portraits/men/16.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1599669454699-248893623440?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-10",
          assignedOfferId: "dummy-offer-5",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Super bait sa aso ko! Very reliable. Will book again!",
        },
        {
          title: "Fix Leaky Faucet in Bathroom",
          category: "repairs",
          description: "Bathroom faucet is constantly dripping. Need a quick fix.",
          location: "Pasig City, Metro Manila",
          budget: 400,
          posterId: "seed-client-1",
          posterName: "Aling Nena",
          posterAvatar: "https://randomuser.me/api/portraits/women/68.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-1",
          assignedOfferId: "dummy-offer-6",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Mabilis at maayos ang paggawa. Salamat po!",
        },
        {
          title: "Install Wall-Mounted TV",
          category: "assembly",
          description: "Need help mounting a 55-inch TV on a concrete wall. Bracket provided.",
          location: "Makati City, Metro Manila",
          budget: 700,
          posterId: "seed-client-2",
          posterName: "Mang Tonyo",
          posterAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-7",
          assignedOfferId: "dummy-offer-7",
          rating: 4,
          review: "⭐⭐⭐⭐ Okay ang service, medyo late lang ng 15 mins. Pero maganda ang pagkakabit.",
        },
        {
          title: "Personal Shopper for Clothes",
          category: "other",
          description: "Need a personal shopper to help pick out clothes for an event. 3 hours.",
          location: "BGC, Taguig City",
          budget: 1200,
          posterId: "seed-client-3",
          posterName: "Liza Soberano",
          posterAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-6",
          assignedOfferId: "dummy-offer-8",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Super galing pumili! Ang daming magagandang options. Thank you!",
        },
        {
          title: "Car Wash (Home Service)",
          category: "cleaning",
          description: "Full exterior and interior car wash for a sedan. Home service needed.",
          location: "Paranaque City, Metro Manila",
          budget: 600,
          posterId: "seed-client-4",
          posterName: "Daniel Padilla",
          posterAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1581578731548-c646952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-2",
          assignedOfferId: "dummy-offer-9",
          rating: 4,
          review: "⭐⭐⭐⭐ Malinis ang kotse ko, pero medyo matagal matapos. Still good!",
        },
        {
          title: "Repair Broken Window Pane",
          category: "repairs",
          description: "Small window pane is cracked, needs replacement. Glass will be provided.",
          location: "Quezon City, Metro Manila",
          budget: 700,
          posterId: "seed-client-5",
          posterName: "Kathryn Bernardo",
          posterAvatar: "https://randomuser.me/api/portraits/women/6.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-1",
          assignedOfferId: "dummy-offer-10",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Very professional at mabilis mag-ayos. Safe na ulit ang bahay!",
        },
        {
          title: "Move Small Furniture",
          category: "moving",
          description: "Move a small sofa and a coffee table from 1st floor to 2nd floor. Within the same house.",
          location: "Pasig City, Metro Manila",
          budget: 500,
          posterId: "seed-client-6",
          posterName: "Alden Richards",
          posterAvatar: "https://randomuser.me/api/portraits/men/8.jpg",
          datePosted: serverTimestamp(),
          status: "completed",
          imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
          assignedTaskerId: "seed-tasker-9",
          assignedOfferId: "dummy-offer-11",
          rating: 5,
          review: "⭐⭐⭐⭐⭐ Malakas at maingat sa gamit. Salamat sa tulong!",
        },
      ];

      for (const task of initialTasks) {
        await addDoc(tasksCollectionRef, task);
      }
      toast.info("Initial demo tasks added!");
    }
  };

  React.useEffect(() => {
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

  const addTask = async (newTaskData: Omit<Task, 'id' | 'posterId' | 'posterName' | 'posterAvatar' | 'datePosted' | 'status' | 'assignedTaskerId' | 'assignedOfferId' | 'rating' | 'review'>) => {
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