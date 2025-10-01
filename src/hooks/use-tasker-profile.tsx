import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, onSnapshot, query, DocumentData } from 'firebase/firestore';
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
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = useState<TaskerProfile[]>([]); // New state for all taskers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTasker, setIsTasker] = useState(false);

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

  useEffect(() => {
    setLoading(true);
    setError(null);

    let unsubscribeUser: (() => void) | undefined;
    let unsubscribeAllTaskers: (() => void) | undefined;

    // Listen for current user's tasker profile
    if (isAuthenticated && user) {
      const userProfileRef = doc(db, 'taskerProfiles', user.uid);
      unsubscribeUser = onSnapshot(userProfileRef, (docSnap) => {
        if (docSnap.exists()) {
          const profileData = docSnap.data() as TaskerProfile;
          setTaskerProfile(profileData);
          setIsTasker(true);
        } else {
          setTaskerProfile(null);
          setIsTasker(false);
        }
        // Only set loading to false for user profile after initial fetch
        // The overall loading will be managed by both listeners
      }, (err) => {
        console.error("Error fetching user tasker profile:", err);
        setError("Failed to load your tasker profile.");
        toast.error("Failed to load your tasker profile.");
      });
    } else {
      setTaskerProfile(null);
      setIsTasker(false);
    }

    // Listen for all tasker profiles
    const allTaskersCollectionRef = collection(db, 'taskerProfiles');
    const q = query(allTaskersCollectionRef);
    unsubscribeAllTaskers = onSnapshot(q, (snapshot) => {
      const profiles: TaskerProfile[] = snapshot.docs.map(doc => doc.data() as TaskerProfile);
      setAllTaskerProfiles(profiles);
      setLoading(false); // Set overall loading to false once all taskers are fetched
    }, (err) => {
      console.error("Error fetching all tasker profiles:", err);
      setError("Failed to load all tasker profiles.");
      setLoading(false);
      toast.error("Failed to load all tasker profiles.");
    });

    return () => {
      unsubscribeUser && unsubscribeUser();
      unsubscribeAllTaskers && unsubscribeAllTaskers();
    };
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
        dateJoined: new Date().toISOString(), // This will be updated if it's an existing profile
        ...data,
      };

      await setDoc(docRef, profileData, { merge: true }); // Use merge to update existing fields or create new doc
      // The onSnapshot listener will automatically update the state
      toast.success("Tasker profile saved successfully!");
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
    loading: loading || authLoading, // Consider auth loading as well
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