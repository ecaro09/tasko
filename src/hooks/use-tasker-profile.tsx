import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';
import { useSupabaseProfile } from './use-supabase-profile'; // Import useSupabaseProfile

export interface TaskerProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  skills: string[];
  bio: string;
  hourlyRate: number;
  isTasker: boolean;
  dateJoined: string;
  rating: number; // New field
  reviewCount: number; // New field
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  allTaskerProfiles: TaskerProfile[];
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating' | 'reviewCount'>) => Promise<void>;
  isTasker: boolean;
  fetchTaskerProfileById: (id: string) => Promise<TaskerProfile | null>;
  updateTaskerRating: (taskerId: string, newRating: number) => Promise<void>; // New function to update rating
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { profile: userProfile, updateProfile: updateSupabaseUserProfile } = useSupabaseProfile(); // Use useSupabaseProfile
  const [taskerProfile, setTaskerProfile] = React.useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = React.useState<TaskerProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isTasker, setIsTasker] = React.useState(false);

  const mapSupabaseProfileToTaskerProfile = (data: any): TaskerProfile => ({
    userId: data.user_id,
    displayName: data.display_name,
    photoURL: data.photo_url || undefined,
    skills: data.skills || [],
    bio: data.bio || '',
    hourlyRate: data.hourly_rate || 0,
    isTasker: data.is_tasker,
    dateJoined: new Date(data.date_joined).toISOString(),
    rating: data.rating || 0,
    reviewCount: data.review_count || 0,
  });

  const fetchTaskerProfileById = useCallback(async (id: string): Promise<TaskerProfile | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('tasker_profiles')
        .select('*')
        .eq('user_id', id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        throw fetchError;
      }

      if (data) {
        return mapSupabaseProfileToTaskerProfile(data);
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching tasker profile by ID:", err);
      toast.error(`Failed to load tasker profile: ${err.message}`);
      return null;
    }
  }, []);

  const fetchAllTaskerProfiles = useCallback(async () => {
    try {
      const { data, error: fetchAllError } = await supabase
        .from('tasker_profiles')
        .select('*');

      if (fetchAllError) throw fetchAllError;

      const profiles: TaskerProfile[] = data.map(mapSupabaseProfileToTaskerProfile);
      setAllTaskerProfiles(profiles);
    } catch (err: any) {
      console.error("Error fetching all tasker profiles:", err);
      setError("Failed to load all tasker profiles.");
      toast.error("Failed to load all tasker profiles.");
    }
  }, []);

  React.useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      setError(null);

      if (isAuthenticated && user) {
        try {
          const profile = await fetchTaskerProfileById(user.id);
          setTaskerProfile(profile);
          setIsTasker(!!profile);
        } catch (err) {
          // Error handled by fetchTaskerProfileById
        }
      } else {
        setTaskerProfile(null);
        setIsTasker(false);
      }

      await fetchAllTaskerProfiles(); // Fetch all profiles
      setLoading(false);
    };

    loadProfiles();
  }, [isAuthenticated, user, authLoading, fetchTaskerProfileById, fetchAllTaskerProfiles]);

  const createOrUpdateTaskerProfile = useCallback(async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating' | 'reviewCount'>) => {
    if (!isAuthenticated || !user || !userProfile) {
      toast.error("You must be logged in to manage a tasker profile.");
      return;
    }

    setLoading(true);
    try {
      const { data: existingProfile } = await supabase
        .from('tasker_profiles')
        .select('rating, review_count')
        .eq('user_id', user.id)
        .single();

      const currentRating = existingProfile?.rating || 0;
      const currentReviewCount = existingProfile?.review_count || 0;

      const { data: updatedData, error: upsertError } = await supabase
        .from('tasker_profiles')
        .upsert({
          user_id: user.id,
          display_name: userProfile.first_name && userProfile.last_name // Use userProfile for display name
            ? `${userProfile.first_name} ${userProfile.last_name}`
            : user.email || "Anonymous Tasker",
          photo_url: userProfile.avatar_url || undefined, // Use userProfile for avatar URL
          is_tasker: true,
          date_joined: new Date().toISOString(), // Only set on initial creation, upsert will merge
          skills: data.skills,
          bio: data.bio,
          hourly_rate: data.hourlyRate,
          rating: currentRating, // Keep existing rating/reviewCount on update
          review_count: currentReviewCount,
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (upsertError) throw upsertError;
      if (updatedData) {
        setTaskerProfile(mapSupabaseProfileToTaskerProfile(updatedData));
        setIsTasker(true);
        toast.success("Tasker profile saved successfully!");
        
        // Also update the public.profiles table to reflect tasker status
        await updateSupabaseUserProfile(
          user.id,
          { // Pass as partial object
            role: 'tasker', // Set role to 'tasker'
            is_verified_tasker: true // Set is_verified_tasker to true
          }
        );

        // Re-fetch all profiles to update the list
        await fetchAllTaskerProfiles();
      }
    } catch (err: any) {
      console.error("Error saving tasker profile:", err);
      setError(`Failed to save tasker profile: ${err.message}`);
      toast.error(`Failed to save tasker profile: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, userProfile, updateSupabaseUserProfile, fetchAllTaskerProfiles]);

  const updateTaskerRating = useCallback(async (taskerId: string, newRating: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('tasker_profiles')
        .select('rating, review_count')
        .eq('user_id', taskerId)
        .single();

      if (fetchError) throw fetchError;

      const currentRatingSum = (existingProfile.rating || 0) * (existingProfile.review_count || 0);
      const newReviewCount = (existingProfile.review_count || 0) + 1;
      const newAverageRating = (currentRatingSum + newRating) / newReviewCount;

      const { error: updateError } = await supabase
        .from('tasker_profiles')
        .update({
          rating: newAverageRating,
          review_count: newReviewCount,
        })
        .eq('user_id', taskerId);

      if (updateError) throw updateError;
      toast.success("Tasker rating updated!");

      // Re-fetch all profiles to update the list
      await fetchAllTaskerProfiles();

      // If the updated tasker is the current user, update their profile state
      if (user?.id === taskerId) {
        const updatedCurrentUserProfile = await fetchTaskerProfileById(taskerId);
        setTaskerProfile(updatedCurrentUserProfile);
      }

    } catch (err: any) {
      console.error("Error updating tasker rating:", err);
      setError(`Failed to update tasker rating: ${err.message}`);
      toast.error(`Failed to update tasker rating: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchTaskerProfileById, fetchAllTaskerProfiles]);

  const value = React.useMemo(() => ({
    taskerProfile,
    allTaskerProfiles,
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
    fetchTaskerProfileById,
    updateTaskerRating,
  }), [
    taskerProfile,
    allTaskerProfiles,
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
    fetchTaskerProfileById,
    updateTaskerRating,
  ]);

  return <TaskerProfileContext.Provider value={value}>{children}</TaskerProfileContext.Provider>;
};

export const useTaskerProfile = () => {
  const context = useContext(TaskerProfileContext);
  if (context === undefined) {
    throw new Error('useTaskerProfile must be used within a TaskerProfileProvider');
  }
  return context;
};