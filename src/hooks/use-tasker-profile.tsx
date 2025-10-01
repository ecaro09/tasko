import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp, DocumentData, updateDoc, collection, query, getDocs } from 'firebase/firestore'; // Added collection, query, getDocs
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export interface TaskerProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  location: string;
  isVerified: boolean;
  dateRegistered: string; // ISO string
  dateUpdated?: string; // ISO string
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  isTasker: boolean;
  loading: boolean;
  error: string | null;
  createTaskerProfile: (
    bio: string,
    skills: string[],
    hourlyRate: number,
    location: string,
  ) => Promise<void>;
  updateTaskerProfile: (
    updates: Partial<Omit<TaskerProfile, 'uid' | 'displayName' | 'photoURL' | 'dateRegistered'>>,
  ) => Promise<void>;
  getAllTaskerProfiles: () => Promise<TaskerProfile[]>; // New function to get all taskers
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user?.uid) {
      setTaskerProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const docRef = doc(db, 'taskerProfiles', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as DocumentData;
        setTaskerProfile({
          uid: user.uid,
          displayName: data.displayName || user.displayName || 'Anonymous',
          photoURL: data.photoURL || user.photoURL || undefined,
          bio: data.bio,
          skills: data.skills,
          hourlyRate: data.hourlyRate,
          location: data.location,
          isVerified: data.isVerified || false,
          dateRegistered: data.dateRegistered?.toDate().toISOString() || new Date().toISOString(),
          dateUpdated: data.dateUpdated?.toDate().toISOString(),
        });
      } else {
        setTaskerProfile(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error fetching tasker profile:", err);
      setError("Failed to fetch tasker profile.");
      setLoading(false);
      toast.error("Failed to load tasker profile.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user?.uid, user?.displayName, user?.photoURL]);

  const createTaskerProfile = async (
    bio: string,
    skills: string[],
    hourlyRate: number,
    location: string,
  ) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to create a tasker profile.");
      return;
    }
    if (taskerProfile) {
      toast.info("You already have a tasker profile.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'taskerProfiles', user.uid);
      await setDoc(docRef, {
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        bio,
        skills,
        hourlyRate,
        location,
        isVerified: false,
        dateRegistered: serverTimestamp(),
        dateUpdated: serverTimestamp(),
      });
      toast.success("Tasker profile created successfully!");
    } catch (err: any) {
      console.error("Error creating tasker profile:", err);
      toast.error(`Failed to create tasker profile: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateTaskerProfile = async (
    updates: Partial<Omit<TaskerProfile, 'uid' | 'displayName' | 'photoURL' | 'dateRegistered'>>,
  ) => {
    if (!isAuthenticated || !user || !taskerProfile) {
      toast.error("You must be logged in and have a tasker profile to update it.");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, 'taskerProfiles', user.uid);
      await updateDoc(docRef, {
        ...updates,
        dateUpdated: serverTimestamp(),
      });
      toast.success("Tasker profile updated successfully!");
    } catch (err: any) {
      console.error("Error updating tasker profile:", err);
      toast.error(`Failed to update tasker profile: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAllTaskerProfiles = async (): Promise<TaskerProfile[]> => {
    try {
      const q = query(collection(db, 'taskerProfiles'));
      const querySnapshot = await getDocs(q);
      const allTaskers: TaskerProfile[] = querySnapshot.docs.map(docSnap => {
        const data = docSnap.data() as DocumentData;
        return {
          uid: docSnap.id,
          displayName: data.displayName || 'Anonymous',
          photoURL: data.photoURL || undefined,
          bio: data.bio,
          skills: data.skills,
          hourlyRate: data.hourlyRate,
          location: data.location,
          isVerified: data.isVerified || false,
          dateRegistered: data.dateRegistered?.toDate().toISOString() || new Date().toISOString(),
          dateUpdated: data.dateUpdated?.toDate().toISOString(),
        };
      });
      return allTaskers;
    } catch (err: any) {
      console.error("Error fetching all tasker profiles:", err);
      toast.error(`Failed to fetch all tasker profiles: ${err.message}`);
      return [];
    }
  };

  const value = {
    taskerProfile,
    isTasker: !!taskerProfile,
    loading: loading || authLoading,
    error,
    createTaskerProfile,
    updateTaskerProfile,
    getAllTaskerProfiles,
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