import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { useAuth, EnhancedUser } from './use-auth'; // Import EnhancedUser
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

export interface TaskerProfile {
  userId: string;
  displayName: string;
  photoURL?: string;
  skills: string[];
  bio: string;
  hourlyRate: number;
  isTasker: boolean;
  dateJoined: string;
  contactNumber?: string; // New field
  rating?: number; // New field
  isVerifiedTasker?: boolean; // New field
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  allTaskerProfiles: TaskerProfile[];
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating'>) => Promise<void>;
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

  // Function to fetch a single tasker profile by ID
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    try {
      const docRef = doc(db, 'taskerProfiles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const taskerData = docSnap.data() as TaskerProfile;
        
        // Fetch additional profile data from Supabase
        const { data: supabaseProfile, error: supabaseError } = await supabase
          .from('profiles')
          .select('contact_number, rating, is_verified_tasker')
          .eq('id', id)
          .single();

        if (supabaseError && supabaseError.code !== 'PGRST116') {
          console.error("Error fetching Supabase profile for tasker:", supabaseError);
          // Don't throw, just log and continue with available data
        }

        return {
          ...taskerData,
          contactNumber: supabaseProfile?.contact_number || taskerData.contactNumber,
          rating: supabaseProfile?.rating || taskerData.rating,
          isVerifiedTasker: supabaseProfile?.is_verified_tasker || taskerData.isVerifiedTasker,
        };
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching tasker profile by ID:", err);
      toast.error(`Failed to load tasker profile: ${err.message}`);
      return null;
    }
  };

  useEffect(() => {
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
        const profiles: TaskerProfile[] = await Promise.all(querySnapshot.docs.map(async doc => {
          const taskerData = doc.data() as TaskerProfile;
          // Fetch additional profile data from Supabase for each tasker
          const { data: supabaseProfile, error: supabaseError } = await supabase
            .from('profiles')
            .select('contact_number, rating, is_verified_tasker')
            .eq('id', taskerData.userId)
            .single();

          if (supabaseError && supabaseError.code !== 'PGRST116') {
            console.error("Error fetching Supabase profile for all taskers:", supabaseError);
          }

          return {
            ...taskerData,
            contactNumber: supabaseProfile?.contact_number || taskerData.contactNumber,
            rating: supabaseProfile?.rating || taskerData.rating,
            isVerifiedTasker: supabaseProfile?.is_verified_tasker || taskerData.isVerifiedTasker,
          };
        }));
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

  const createOrUpdateTaskerProfile = async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating'>) => {
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
        rating: user.profile?.rating || 0, // Use existing rating from Supabase profile
        isVerifiedTasker: user.profile?.is_verified_tasker || false, // Use existing verified status
        ...data,
      };

      await setDoc(docRef, profileData, { merge: true }); // Use merge to update existing fields or create new doc
      setTaskerProfile(profileData);
      setIsTasker(true);
      toast.success("Tasker profile saved successfully!");
      
      // Re-fetch all profiles to update the list
      const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
      const profiles: TaskerProfile[] = await Promise.all(querySnapshot.docs.map(async doc => {
        const taskerData = doc.data() as TaskerProfile;
        const { data: supabaseProfile, error: supabaseError } = await supabase
          .from('profiles')
          .select('contact_number, rating, is_verified_tasker')
          .eq('id', taskerData.userId)
          .single();

        if (supabaseError && supabaseError.code !== 'PGRST116') {
          console.error("Error fetching Supabase profile for all taskers:", supabaseError);
        }

        return {
          ...taskerData,
          contactNumber: supabaseProfile?.contact_number || taskerData.contactNumber,
          rating: supabaseProfile?.rating || taskerData.rating,
          isVerifiedTasker: supabaseProfile?.is_verified_tasker || taskerData.isVerifiedTasker,
        };
      }));
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