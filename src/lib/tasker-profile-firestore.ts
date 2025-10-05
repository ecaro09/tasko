import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';

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

export const fetchTaskerProfileByIdFirestore = async (id: string): Promise<TaskerProfile | null> => {
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

export const createOrUpdateTaskerProfileFirestore = async (
  data: Omit<TaskerProfile, 'userId' | 'displayName' | 'photoURL' | 'isTasker' | 'dateJoined'>,
  user: FirebaseUser
) => {
  try {
    const docRef = doc(db, 'taskerProfiles', user.uid);
    const profileData: TaskerProfile = {
      userId: user.uid,
      displayName: user.displayName || user.email || "Anonymous Tasker",
      photoURL: user.photoURL || undefined,
      isTasker: true,
      dateJoined: new Date().toISOString(),
      skills: data.skills, // Added missing property
      bio: data.bio,       // Added missing property
      hourlyRate: data.hourlyRate, // Added missing property
    };

    await setDoc(docRef, { ...profileData, ...data }, { merge: true }); // Use merge to update existing fields or create new doc
    toast.success("Tasker profile saved successfully!");
    return profileData;
  } catch (err: any) {
    console.error("Error saving tasker profile:", err);
    toast.error(`Failed to save tasker profile: ${err.message}`);
    throw err;
  }
};

export const fetchAllTaskerProfilesFirestore = async (): Promise<TaskerProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'taskerProfiles'));
    const profiles: TaskerProfile[] = querySnapshot.docs.map(doc => doc.data() as TaskerProfile);
    return profiles;
  } catch (err: any) {
    console.error("Error fetching all tasker profiles:", err);
    toast.error("Failed to load all tasker profiles.");
    throw err;
  }
};