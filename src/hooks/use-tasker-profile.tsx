import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, onSnapshot, query } from 'firebase/firestore'; // Only getDocs needed for initial fetch of all profiles
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useSupabaseProfile } from './use-supabase-profile'; // New import
import {
  TaskerProfile,
  fetchTaskerProfileByIdFirestore,
  createOrUpdateTaskerProfileFirestore,
  fetchAllTaskerProfilesFirestore,
} from '@/lib/tasker-profile-firestore'; // Import new utility functions
import { seedInitialTaskerProfiles } from '@/lib/seed-tasker-profiles'; // Import seed function from new location
import { loadTaskerProfilesFromCache, saveTaskerProfilesToCache } from '@/lib/tasker-profile-local-cache'; // Import caching utilities

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
  const { profile: supabaseProfile, updateProfile: updateSupabaseProfile } = useSupabaseProfile(); // Use useSupabaseProfile
  const [taskerProfile, setTaskerProfile] = React.useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = React.useState<TaskerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isTasker, setIsTasker] = React.useState(false);

  // Expose the utility function directly
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    return fetchTaskerProfileByIdFirestore(id);
  };

  React.useEffect(() => {
    // Load from cache immediately
    const cachedProfiles = loadTaskerProfilesFromCache();
    if (cachedProfiles.length > 0) {
      setAllTaskerProfiles(cachedProfiles);
      setLoading(false);
      console.log("Tasker profiles loaded from cache.");
    } else {
      setLoading(true); // Only show loading if cache is empty
    }

    setError(null);

    const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
    const q = query(taskerProfilesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProfiles: TaskerProfile[] = snapshot.docs.map(doc => doc.data() as TaskerProfile);
      setAllTaskerProfiles(fetchedProfiles);
      saveTaskerProfilesToCache(fetchedProfiles); // Update cache with fresh data
      setLoading(false);

      // Only seed if no tasker profiles are present after initial fetch
      if (fetchedProfiles.length === 0) {
        seedInitialTaskerProfiles();
      }
    }, (err) => {
      console.error("Error fetching all tasker profiles:", err);
      setError("Failed to fetch all tasker profiles.");
      setLoading(false);
      toast.error("Failed to load all tasker profiles.");
    });

    return () => unsubscribe();
  }, []); // Empty dependency array to run once on mount

  React.useEffect(() => {
    const loadCurrentUserTaskerProfile = async () => {
      if (isAuthenticated && user) {
        setLoading(true);
        try {
          const profile = await fetchTaskerProfileByIdFirestore(user.uid);
          setTaskerProfile(profile);
          setIsTasker(!!profile);
        } catch (err) {
          // Error handled by fetchTaskerProfileByIdFirestore
        } finally {
          setLoading(false);
        }
      } else {
        setTaskerProfile(null);
        setIsTasker(false);
        setLoading(false);
      }
    };

    loadCurrentUserTaskerProfile();
  }, [isAuthenticated, user]); // Re-run when auth state changes

  const createOrUpdateTaskerProfile = async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => {
    if (!isAuthenticated || !user) {
      toast.error("You must be logged in to manage a tasker profile.");
      return;
    }

    setLoading(true);
    try {
      const updatedProfile = await createOrUpdateTaskerProfileFirestore(data, user);
      setTaskerProfile(updatedProfile);
      setIsTasker(true);

      // Also update the user's role in Supabase to 'tasker' using useSupabaseProfile
      await updateSupabaseProfile(
        user.uid,
        user.displayName?.split(' ')[0] || null,
        user.displayName?.split(' ').slice(1).join(' ') || null,
        supabaseProfile?.phone || null, // Use phone from supabaseProfile
        user.photoURL || null,
        'tasker' // Set role to 'tasker'
      );

      // The onSnapshot listener will update allTaskerProfiles, no need to manually re-fetch
    } catch (err) {
      // Error handled by createOrUpdateTaskerProfileFirestore
    } finally {
      setLoading(false);
    }
  };

  const value = {
    taskerProfile,
    allTaskerProfiles,
    loading: loading || authLoading, // Consider auth loading as well
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