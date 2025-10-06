import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, onSnapshot, DocumentData } from 'firebase/firestore'; // Added onSnapshot for real-time updates
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useSupabaseProfile } from './use-supabase-profile';
import { db } from '@/lib/firebase'; // Import db
import {
  TaskerProfile,
  fetchTaskerProfileByIdFirestore,
  createOrUpdateTaskerProfileFirestore,
  fetchAllTaskerProfilesFirestore,
} from '@/lib/tasker-profile-firestore';
import { seedInitialTaskerProfiles } from '@/lib/seed-tasker-profiles';
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
  const { profile: supabaseProfile, updateProfile: updateSupabaseProfile } = useSupabaseProfile();
  const [taskerProfile, setTaskerProfile] = React.useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = React.useState<TaskerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isTasker, setIsTasker] = React.useState(false);

  // Expose the utility function directly
  const fetchTaskerProfileById = React.useCallback(async (id: string): Promise<TaskerProfile | null> => {
    return fetchTaskerProfileByIdFirestore(id);
  }, []);

  React.useEffect(() => {
    // Load from cache immediately
    const cachedAllTaskerProfiles = loadTaskerProfilesFromCache();
    if (cachedAllTaskerProfiles.length > 0) {
      setAllTaskerProfiles(cachedAllTaskerProfiles);
      setLoading(false);
      console.log("All tasker profiles loaded from cache.");
    } else {
      setLoading(true); // Only show loading if cache is empty
    }

    setError(null);

    const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
    const q = query(taskerProfilesCollectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProfiles: TaskerProfile[] = snapshot.docs.map((doc) => {
        const data = doc.data() as DocumentData;
        return {
          userId: data.userId,
          displayName: data.displayName,
          photoURL: data.photoURL,
          skills: data.skills,
          bio: data.bio,
          hourlyRate: data.hourlyRate,
          isTasker: data.isTasker,
          dateJoined: data.dateJoined,
        };
      });
      setAllTaskerProfiles(fetchedProfiles);
      saveTaskerProfilesToCache(fetchedProfiles); // Update cache with fresh data

      // Also update the current user's tasker profile if it matches
      if (isAuthenticated && user) {
        const currentUserTaskerProfile = fetchedProfiles.find(p => p.userId === user.uid);
        setTaskerProfile(currentUserTaskerProfile || null);
        setIsTasker(!!currentUserTaskerProfile);
      }

      setLoading(false);

      // Only seed if no tasker profiles are present after initial fetch
      if (fetchedProfiles.length === 0) {
        seedInitialTaskerProfiles();
      }
    }, (err) => {
      console.error("Error fetching tasker profiles:", err);
      setError("Failed to fetch tasker profiles.");
      setLoading(false);
      toast.error("Failed to load tasker profiles.");
    });

    return () => unsubscribe();
  }, [isAuthenticated, user, authLoading]); // Re-run when auth state changes

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

      // The onSnapshot listener will automatically update allTaskerProfiles and taskerProfile state
      // No need to manually re-fetch all profiles here.
    } catch (err) {
      // Error handled by createOrUpdateTaskerProfileFirestore
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