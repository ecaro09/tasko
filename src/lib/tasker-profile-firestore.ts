import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { toast } from 'sonner';
import { User as FirebaseUser } from 'firebase/auth';
import { saveTaskerProfilesToCache, loadTaskerProfilesFromCache } from './tasker-profile-local-cache'; // Import caching utilities

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
  // Try to load from cache first
  const cachedProfiles = loadTaskerProfilesFromCache();
  const cachedProfile = cachedProfiles.find(profile => profile.userId === id);
  if (cachedProfile) {
    console.log(`Loaded tasker profile ${id} from cache.`);
    return cachedProfile;
  }

  try {
    const docRef = doc(db, 'taskerProfiles', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profile = docSnap.data() as TaskerProfile;
      // Update cache with this single profile
      saveTaskerProfilesToCache([...cachedProfiles.filter(p => p.userId !== id), profile]);
      return profile;
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
      ...data,
    };

    await setDoc(docRef, profileData, { merge: true }); // Use merge to update existing fields or create new doc
    toast.success("Tasker profile saved successfully!");

    // Optimistically update local cache
    const currentProfiles = loadTaskerProfilesFromCache();
    const updatedProfiles = currentProfiles.filter(p => p.userId !== user.uid);
    saveTaskerProfilesToCache([...updatedProfiles, profileData]);

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
    saveTaskerProfilesToCache(profiles); // Update cache with all fetched profiles
    return profiles;
  } catch (err: any) {
    console.error("Error fetching all tasker profiles:", err);
    toast.error("Failed to load all tasker profiles.");
    throw err;
  }
};