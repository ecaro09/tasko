import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';
import {
  UserProfile,
  fetchUserProfileSupabase,
  createOrUpdateUserProfileSupabase,
} from '@/lib/user-profile-supabase'; // Import Supabase profile utilities

interface SupabaseProfileContextType {
  profile: UserProfile | null;
  loadingProfile: boolean;
  errorProfile: string | null;
  fetchProfile: (userId: string) => Promise<UserProfile | null>;
  updateProfile: (
    userId: string,
    firstName: string | null,
    lastName: string | null,
    phone: string | null,
    avatarUrl: string | null,
    role: string
  ) => Promise<UserProfile | null>;
}

const SupabaseProfileContext = createContext<SupabaseProfileContextType | undefined>(undefined);

export const SupabaseProfileProvider: React.FC<{ children: ReactNode; firebaseUser: FirebaseUser | null }> = ({ children, firebaseUser }) => {
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);
  const [errorProfile, setErrorProfile] = React.useState<string | null>(null);

  const fetchProfile = React.useCallback(async (userId: string) => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const fetchedProfile = await fetchUserProfileSupabase(userId);
      setProfile(fetchedProfile);
      return fetchedProfile;
    } catch (err: any) {
      setErrorProfile(err.message || "Failed to fetch Supabase profile.");
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  const updateProfile = React.useCallback(async (
    userId: string,
    firstName: string | null,
    lastName: string | null,
    phone: string | null,
    avatarUrl: string | null,
    role: string
  ) => {
    setLoadingProfile(true);
    setErrorProfile(null);
    try {
      const updatedProfile = await createOrUpdateUserProfileSupabase(
        userId,
        firstName,
        lastName,
        phone,
        avatarUrl,
        role
      );
      setProfile(updatedProfile);
      toast.success("Supabase profile updated successfully!");
      return updatedProfile;
    } catch (err: any) {
      setErrorProfile(err.message || "Failed to update Supabase profile.");
      toast.error(`Failed to update Supabase profile: ${err.message}`);
      return null;
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  React.useEffect(() => {
    if (firebaseUser) {
      fetchProfile(firebaseUser.uid);
    } else {
      setProfile(null);
      setLoadingProfile(false);
    }
  }, [firebaseUser, fetchProfile]);

  const value = {
    profile,
    loadingProfile,
    errorProfile,
    fetchProfile,
    updateProfile,
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