import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs } from 'firebase/firestore'; // Only getDocs needed for initial fetch of all profiles
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
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Removed profile: authProfile
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
    const loadProfiles = async () => {
      setLoading(true);
      setError(null);

      // Fetch current user's tasker profile
      if (isAuthenticated && user) {
        try {
          const profile = await fetchTaskerProfileByIdFirestore(user.uid);
          setTaskerProfile(profile);
          setIsTasker(!!profile);
        } catch (err) {
          // Error handled by fetchTaskerProfileByIdFirestore
        }
      } else {
        setTaskerProfile(null);
        setIsTasker(false);
      }

      // Fetch all tasker profiles
      try {
        const profiles = await fetchAllTaskerProfilesFirestore();
        setAllTaskerProfiles(profiles);
      } catch (err) {
        // Error handled by fetchAllTaskerProfilesFirestore
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

      // Re-fetch all profiles to update the list
      const profiles = await fetchAllTaskerProfilesFirestore();
      setAllTaskerProfiles(profiles);
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