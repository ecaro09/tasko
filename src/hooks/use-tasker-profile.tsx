import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => Promise<void>;
  isTasker: boolean;
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTasker, setIsTasker] = useState(false);

  useEffect(() => {
    const fetchTaskerProfile = async () => {
      if (authLoading) return;

      if (isAuthenticated && user) {
        setLoading(true);
        setError(null);
        try {
          const docRef = doc(db, 'taskerProfiles', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data() as TaskerProfile;
            setTaskerProfile(data);
            setIsTasker(true);
          } else {
            setTaskerProfile(null);
            setIsTasker(false);
          }
        } catch (err: any) {
          console.error("Error fetching tasker profile:", err);
          setError("Failed to load tasker profile.");
          toast.error("Failed to load tasker profile.");
        } finally {
          setLoading(false);
        }
      } else {
        setTaskerProfile(null);
        setIsTasker(false);
        setLoading(false);
      }
    };

    fetchTaskerProfile();
  }, [isAuthenticated, user, authLoading]);

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
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
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