import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
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
  rating?: number; // Added rating
  location?: string; // Added location
  verified?: boolean; // Added verified status
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  allTaskerProfiles: TaskerProfile[];
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating' | 'location' | 'verified'>) => Promise<void>;
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

  // Function to fetch a single tasker profile by ID (can be used outside the hook context)
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    try {
      const docRef = doc(db, 'taskerProfiles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as TaskerProfile;
        // Ensure dateJoined is a string
        if (data.dateJoined && typeof data.dateJoined !== 'string') {
          data.dateJoined = (data.dateJoined as any).toDate().toISOString();
        }
        return data;
      }
      return null;
    } catch (err: any) {
      console.error("Error fetching tasker profile by ID:", err);
      toast.error(`Failed to load tasker profile: ${err.message}`);
      return null;
    }
  };

  // Function to seed initial tasker profiles
  const seedInitialTaskerProfiles = async () => {
    const taskerProfilesCollectionRef = collection(db, 'taskerProfiles');
    const snapshot = await getDocs(taskerProfilesCollectionRef);

    if (snapshot.empty) {
      console.log("Tasker profiles collection is empty, seeding initial tasker profiles...");
      const initialTaskers = [
        {
          taskerId: "U001",
          name: "Juan Dela Cruz",
          skills: ["Plumbing", "Electrical Repair"],
          rating: 4.8,
          location: "Makati",
          verified: true,
          photoURL: "https://randomuser.me/api/portraits/men/10.jpg",
          bio: "Experienced plumber and electrician ready to fix your home issues.",
          hourlyRate: 350,
        },
        {
          taskerId: "U002",
          name: "Maria Santos",
          skills: ["Cleaning", "Housekeeping"],
          rating: 4.7,
          location: "Quezon City",
          verified: true,
          photoURL: "https://randomuser.me/api/portraits/women/11.jpg",
          bio: "Dedicated and thorough cleaner for homes and offices.",
          hourlyRate: 250,
        },
        {
          taskerId: "U003",
          name: "Jose Ramirez",
          skills: ["Carpentry", "Furniture Assembly"],
          rating: 4.6,
          location: "Pasig",
          verified: false,
          photoURL: "https://randomuser.me/api/portraits/men/12.jpg",
          bio: "Skilled carpenter for custom furniture and repairs.",
          hourlyRate: 400,
        },
        {
          taskerId: "U004",
          name: "Anna Cruz",
          skills: ["Appliance Repair", "Aircon Cleaning"],
          rating: 4.9,
          location: "Taguig",
          verified: true,
          photoURL: "https://randomuser.me/api/portraits/women/13.jpg",
          bio: "Expert in appliance repair and aircon maintenance.",
          hourlyRate: 300,
        },
        {
          taskerId: "U005",
          name: "Mark Villanueva",
          skills: ["Painting", "Renovation"],
          rating: 4.5,
          location: "Mandaluyong",
          verified: false,
          photoURL: "https://randomuser.me/api/portraits/men/14.jpg",
          bio: "Professional painter and renovator for your home improvement projects.",
          hourlyRate: 450,
        },
      ];

      for (const tasker of initialTaskers) {
        const docRef = doc(db, 'taskerProfiles', tasker.taskerId);
        await setDoc(docRef, {
          userId: tasker.taskerId,
          displayName: tasker.name,
          photoURL: tasker.photoURL,
          skills: tasker.skills,
          bio: tasker.bio,
          hourlyRate: tasker.hourlyRate,
          isTasker: true, // All seeded profiles are taskers
          dateJoined: serverTimestamp(), // Use server timestamp for consistency
          rating: tasker.rating,
          location: tasker.location,
          verified: tasker.verified,
        });
      }
      toast.info("Initial tasker profiles added!");
    }
  };

  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      setError(null);

      // Seed initial tasker profiles if the collection is empty
      await seedInitialTaskerProfiles();

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
        const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as TaskerProfile;
          // Ensure dateJoined is a string
          if (data.dateJoined && typeof data.dateJoined !== 'string') {
            data.dateJoined = (data.dateJoined as any).toDate().toISOString();
          }
          return data;
        });
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
  }, [isAuthenticated, user, authLoading]); // Re-run when auth state changes

  const createOrUpdateTaskerProfile = async (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined' | 'rating' | 'location' | 'verified'>) => {
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
        dateJoined: new Date().toISOString(), // Use current date for new/updated profiles
        ...data,
      };

      await setDoc(docRef, profileData, { merge: true }); // Use merge to update existing fields or create new doc
      setTaskerProfile(profileData);
      setIsTasker(true);
      toast.success("Tasker profile saved successfully!");
      // Re-fetch all profiles to update the list
      const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
      const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as TaskerProfile;
        if (data.dateJoined && typeof data.dateJoined !== 'string') {
          data.dateJoined = (data.dateJoined as any).toDate().toISOString();
        }
        return data;
      });
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