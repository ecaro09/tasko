import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { fetchUserProfileSupabase, createOrUpdateUserProfileSupabase, UserProfile } from '@/lib/user-profile-supabase';
import { toast } from 'sonner';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface SupabaseProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  error: string | null;
  updateProfile: (
    userId: string,
    firstName: string | null,
    lastName: string | null,
    phone: string | null,
    avatarUrl: string | null,
    role: string,
    rating: number,
    isVerifiedTasker: boolean
  ) => Promise<void>;
  fetchProfile: (userId: string) => Promise<UserProfile | null>; // Function to fetch any user's profile
}

const SupabaseProfileContext = createContext<SupabaseProfileContextType | undefined>(undefined);

interface SupabaseProfileProviderProps {
  children: ReactNode;
}

export const SupabaseProfileProvider: React.FC<SupabaseProfileProviderProps> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth(); // Use useAuth to get the current user
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Function to fetch a specific user's profile (can be used internally or exposed)
  const fetchProfile = async (userId: string): Promise<UserProfile | null> => {
    try {
      const fetchedProfile = await fetchUserProfileSupabase(userId);
      return fetchedProfile;
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message);
      return null;
    }
  };

  React.useEffect(() => {
    const loadProfile = async () => {
      setLoadingProfile(true);
      setError(null);

      if (isAuthenticated && user) {
        try {
          const fetchedProfile = await fetchProfile(user.id);
          if (fetchedProfile) {
            setProfile(fetchedProfile);
          } else {
            // If no profile exists in public.profiles, create a basic one
            const newProfile = await createOrUpdateUserProfileSupabase(
              user.id,
              user.user_metadata?.first_name as string || null,
              user.user_metadata?.last_name as string || null,
              user.user_metadata?.phone as string || null,
              user.user_metadata?.avatar_url as string || null,
              'user', // Default role
              0,      // Default rating
              false   // Default is_verified_tasker
            );
            setProfile(newProfile);
            toast.success("New user profile created in Supabase!");
          }
        } catch (err: any) {
          console.error("Error loading or creating profile:", err);
          setError(err.message);
          toast.error(`Failed to load or create profile: ${err.message}`);
        }
      } else {
        setProfile(null);
      }
      setLoadingProfile(false);
    };

    if (!authLoading) { // Only load profile once auth state is known
      loadProfile();
    }
  }, [isAuthenticated, user, authLoading]); // Re-run when auth state changes

  const updateProfile = async (
    userId: string,
    firstName: string | null,
    lastName: string | null,
    phone: string | null,
    avatarUrl: string | null,
    role: string,
    rating: number,
    isVerifiedTasker: boolean
  ) => {
    setLoadingProfile(true);
    setError(null);
    try {
      const updated = await createOrUpdateUserProfileSupabase(
        userId,
        firstName,
        lastName,
        phone,
        avatarUrl,
        role,
        rating,
        isVerifiedTasker
      );
      if (updated) {
        setProfile(updated);
        toast.success("Profile updated successfully!");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.message);
      toast.error(`Failed to update profile: ${err.message}`);
      throw err;
    } finally {
      setLoadingProfile(false);
    }
  };

  const value = {
    profile,
    loadingProfile,
    error,
    updateProfile,
    fetchProfile,
  };

  return <SupabaseProfileContext.Provider value={value}>{children}</SupabaseProfileContext.Provider>;
};

export const useSupabaseProfile = () => {
  const context = useContext(SupabaseProfileContext);
  if (context === undefined) {
    throw new Error('useSupabaseProfile must be used within a SupabaseProfileProvider');
  }
  return context;
};