import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface TaskerProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  skills: string[];
  bio: string;
  hourlyRate: number;
  isTasker: boolean;
  dateJoined: string;
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  allTaskerProfiles: TaskerProfile[]; // Added to store all tasker profiles
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => Promise<void>;
  isTasker: boolean;
  fetchTaskerProfileById: (id: string) => Promise<TaskerProfile | null>; // Added for fetching specific tasker
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [taskerProfile, setTaskerProfile] = React.useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = React.useState<TaskerProfile[]>([]); // New state for all taskers
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isTasker, setIsTasker] = React.useState(false);

  // Function to seed initial tasker profiles
  const seedInitialTaskerProfiles = async () => {
    const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
    const snapshot = await getDocs(taskerProfilesCollectionRef);

    if (snapshot.empty) {
      console.log("Tasker profiles collection is empty, seeding initial tasker profiles...");
      const initialTaskers: TaskerProfile[] = [
        {
          userId: "seed-tasker-1",
          displayName: "Juan Handyman",
          photoURL: "https://randomuser.me/api/portraits/men/21.jpg",
          skills: ["Plumbing", "Electrical", "Carpentry", "Assembly Services"],
          bio: "Experienced handyman with 10+ years in home repairs and installations. Mabilis at maaasahan!",
          hourlyRate: 350,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-2",
          displayName: "Maria Cleaner",
          photoURL: "https://randomuser.me/api/portraits/women/22.jpg",
          skills: ["Home Cleaning", "Office Cleaning", "Deep Cleaning"],
          bio: "Dedicated cleaner providing top-notch cleaning services for homes and offices. Malinis at maayos ang trabaho!",
          hourlyRate: 250,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-3",
          displayName: "Pedro Deliver",
          photoURL: "https://randomuser.me/api/portraits/men/23.jpg",
          skills: ["Delivery", "Errands", "Grocery Shopping"],
          bio: "Fast and reliable delivery service for documents, packages, and groceries. On-time palagi!",
          hourlyRate: 180,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-4",
          displayName: "Elena Painter",
          photoURL: "https://randomuser.me/api/portraits/women/24.jpg",
          skills: ["Painting Services", "Wall Repair"],
          bio: "Professional painter for residential and commercial spaces. Quality finish guaranteed!",
          hourlyRate: 300,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-5",
          displayName: "Ramon Tech",
          photoURL: "https://randomuser.me/api/portraits/men/25.jpg",
          skills: ["Laptop Fix", "Appliance Repair", "Electronics Setup"],
          bio: "Tech-savvy individual offering repair services for laptops and home appliances. Expert sa gadgets!",
          hourlyRate: 400,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-6",
          displayName: "Sofia Tutor",
          photoURL: "https://randomuser.me/api/portraits/women/26.jpg",
          skills: ["Tutoring (Math)", "Tutoring (English)", "Online Teaching"],
          bio: "Patient and effective tutor for students of all ages. Helping you achieve academic success!",
          hourlyRate: 280,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-7",
          displayName: "Carlo Carpenter",
          photoURL: "https://randomuser.me/api/portraits/men/27.jpg",
          skills: ["Carpentry", "Furniture Assembly", "Woodwork"],
          bio: "Skilled carpenter for custom furniture and repairs. Gawaing kahoy, ako bahala!",
          hourlyRate: 380,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-8",
          displayName: "Anna Gardener",
          photoURL: "https://randomuser.me/api/portraits/women/28.jpg",
          skills: ["Gardening", "Landscaping", "Plant Care"],
          bio: "Passionate gardener ready to transform your outdoor space. Green thumb, happy plants!",
          hourlyRate: 220,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-9",
          displayName: "Mark Mover",
          photoURL: "https://randomuser.me/api/portraits/men/29.jpg",
          skills: ["Moving", "Hauling", "Packing"],
          bio: "Efficient and careful mover for your relocation needs. Walang hassle sa paglipat!",
          hourlyRate: 450,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
        {
          userId: "seed-tasker-10",
          displayName: "Grace Pet Sitter",
          photoURL: "https://randomuser.me/api/portraits/women/30.jpg",
          skills: ["Pet Sitting", "Dog Walking", "Pet Care"],
          bio: "Loving and responsible pet sitter for your furry friends. Alaga ang pets mo sa akin!",
          hourlyRate: 200,
          isTasker: true,
          dateJoined: new Date().toISOString(),
        },
      ];

      for (const tasker of initialTaskers) {
        await setDoc(doc(taskerProfilesCollectionRef, tasker.userId), tasker);
      }
      toast.info("Initial demo tasker profiles added!");
    }
  };

  // Function to fetch a single tasker profile by ID (can be used outside the hook context)
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    try {
      const docRef = doc(db, 'taskerProfiles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as TaskerProfile;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching tasker profile by ID:", err);
      toast.error(`Failed to load tasker profile: ${err.message}`);
      return null;
    }
  };

  React.useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      setError(null);

      // Fetch current user's tasker profile
      if (isAuthenticated && user) {
        try {
          const profile = await fetchTaskerProfileById(user.uid);
          setTaskerProfile(profile);
          setIsTasker(!!profile);
        } catch (err) {
          // Error handled by fetchTaskerProfileById
        }
      } else {
        setTaskerProfile(null);
        setIsTasker(false);
      }

      // Fetch all tasker profiles
      try {
        const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
        const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => doc.data() as TaskerProfile);
        setAllTaskerProfiles(profiles);
      } catch (err: any) {
        console.error("Error fetching all tasker profiles:", err);
        setError("Failed to load all tasker profiles.");
        toast.error("Failed to load all tasker profiles.");
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
    seedInitialTaskerProfiles(); // Call seed function here
  }, [isAuthenticated, user, authLoading]); // Re-run when auth state changes

  const createOrUpdateTaskerProfile = async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to manage a tasker profile.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'taskerProfiles', user.uid);
      const profileData: TaskerProfile = {
        userId: user.uid,
        displayName: user.displayName || user.email || "Anonymous Tasker",
        photoURL: user.photoURL || undefined,
        isTasker: true,
        dateJoined: new Date().toISOString(),
        ...data,
      };

      await setDoc(docRef, profileData, { merge: true }); // Use merge to update existing fields or create new doc
      setTaskerProfile(profileData);
      setIsTasker(true);
      toast.success("Tasker profile saved successfully!");
      // Re-fetch all profiles to update the list
      const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
      const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => doc.data() as TaskerProfile);
      setAllTaskerProfiles(profiles);
    } catch (err: any) {
      console.error("Error saving tasker profile:", err);
      setError(`Failed to save tasker profile: ${err.message}`);
      toast.error(`Failed to save tasker profile: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    taskerProfile,
    allTaskerProfiles, // Expose all tasker profiles
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
    fetchTaskerProfileById, // Expose the utility function
  };

  return <TaskerProfileContext.Provider value={value}>{children}</TaskerProfileContext.Provider>;
};

export const useTaskerProfile = () => {
  const context = useContext(TaskerProfileContext);
  if (context === undefined) {
    throw new Error('useTaskerProfile must be used within a TaskerProfileProvider');
  }
  return context;
};