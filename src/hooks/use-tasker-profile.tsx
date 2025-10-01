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
  allTaskerProfiles: TaskerProfile[];
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => Promise<void>;
  isTasker: boolean;
  fetchTaskerProfileById: (id: string) => Promise<TaskerProfile | null>;
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = useState<TaskerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTasker, setIsTasker] = useState(false);

  // Function to fetch a single tasker profile by ID (can be used outside the hook context)
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    if (!db) {
      toast.error("Database not initialized. Cannot fetch tasker profile.");
      throw new Error("Database not initialized.");
    }
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

  useEffect(() => {
    if (!db) {
      setError("Database not initialized. Cannot load tasker profiles.");
      setLoading(false);
      toast.error("Database services are unavailable. Please check Firebase configuration.");
      return;
    }

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
  }, [isAuthenticated, user, authLoading]);

  const createOrUpdateTaskerProfile = async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => {
    if (!db) {
      toast.error("Database not initialized. Cannot save tasker profile.");
      throw new Error("Database not initialized.");
    }
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

      await setDoc(docRef, profileData, { merge: true });
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
    allTaskerProfiles,
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
    fetchTaskerProfileById,
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