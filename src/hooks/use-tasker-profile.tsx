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
}

interface TaskerProfileContextType {
  taskerProfile: TaskerProfile | null;
  allTaskerProfiles: TaskerProfile[]; // Added to store all tasker profiles
  loading: boolean;
  error: string | null;
  createOrUpdateTaskerProfile: (data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>) => Promise<void>;
  isTasker: boolean;
  fetchTaskerProfileById: (id: string) => Promise<TaskerProfile | null>; // Added for fetching specific tasker
}

const TaskerProfileContext = createContext<TaskerProfileContextType | undefined>(undefined);

export const TaskerProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [taskerProfile, setTaskerProfile] = useState<TaskerProfile | null>(null);
  const [allTaskerProfiles, setAllTaskerProfiles] = useState<TaskerProfile[]>([]); // New state for all taskers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTasker, setIsTasker] = useState(false);

  // Function to fetch a single tasker profile by ID (can be used outside the hook context)
  const fetchTaskerProfileById = async (id: string): Promise<TaskerProfile | null> => {
    try {
      const docRef = doc(db, 'taskerProfiles', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as TaskerProfile;
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
          skills: ["Plumbing", "Electrical Repair", "Home Cleaning"],
          hourlyRate: 500,
          bio: "Experienced handyman specializing in plumbing and electrical repairs. Also offers general home cleaning services.",
          photoURL: "https://randomuser.me/api/portraits/men/75.jpg",
        },
        {
          taskerId: "U002",
          name: "Maria Santos",
          skills: ["Cleaning", "Housekeeping", "Laundry"],
          hourlyRate: 400,
          bio: "Dedicated and thorough cleaner with years of experience in residential housekeeping. Available for regular cleaning and deep cleans.",
          photoURL: "https://randomuser.me/api/portraits/women/76.jpg",
        },
        {
          taskerId: "U003",
          name: "Jose Ramirez",
          skills: ["Carpentry", "Furniture Assembly", "Minor Repairs"],
          hourlyRate: 450,
          bio: "Skilled carpenter and assembler. Can help with custom furniture, repairs, and flat-pack assembly.",
          photoURL: "https://randomuser.me/api/portraits/men/77.jpg",
        },
        {
          taskerId: "U004",
          name: "Anna Cruz",
          skills: ["Appliance Repair", "Aircon Cleaning", "Electrical"],
          hourlyRate: 600,
          bio: "Expert in appliance repair and air conditioning maintenance. Ensures your home appliances run smoothly.",
          photoURL: "https://randomuser.me/api/portraits/women/78.jpg",
        },
        {
          taskerId: "U005",
          name: "Mark Villanueva",
          skills: ["Painting", "Renovation", "Wall Repair"],
          hourlyRate: 550,
          bio: "Professional painter and renovator. Transforms spaces with quality finishes and attention to detail.",
          photoURL: "https://randomuser.me/api/portraits/men/79.jpg",
        }
      ];

      for (const tasker of initialTaskers) {
        const profileData: TaskerProfile = {
          userId: tasker.taskerId,
          displayName: tasker.name,
          photoURL: tasker.photoURL,
          skills: tasker.skills,
          bio: tasker.bio,
          hourlyRate: tasker.hourlyRate,
          isTasker: true,
          dateJoined: new Date().toISOString(), // Set current date for seeded profiles
        };
        await setDoc(doc(db, 'taskerProfiles', tasker.taskerId), profileData);
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
        const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => doc.data() as TaskerProfile);
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
      // Re-fetch all profiles to update the list
      const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
      const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => doc.data() as TaskerProfile);
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
    allTaskerProfiles, // Expose all tasker profiles
    loading,
    error,
    createOrUpdateTaskerProfile,
    isTasker,
    fetchTaskerProfileById, // Expose the utility function
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