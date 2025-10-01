import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser, updateProfile } from 'firebase/auth';
import { toast } from 'sonner'; // Using sonner for toasts

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  fetchUserPhotoURL: (uid: string) => Promise<string | undefined>; // Added fetchUserPhotoURL
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error(`Failed to sign in: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Failed to log out: ${error.message}`);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!authState.user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    try {
      await updateProfile(authState.user, { displayName, photoURL });
      // Force a re-fetch of the user to update the state with new profile info
      setAuthState(prev => ({
        ...prev,
        user: auth.currentUser, // auth.currentUser will have the updated info
      }));
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      throw error; // Re-throw to allow calling component to handle loading state
    }
  };

  // New function to fetch user photo URL by UID
  const fetchUserPhotoURL = async (uid: string): Promise<string | undefined> => {
    try {
      // Firebase Auth doesn't directly expose a way to get another user's photoURL by UID
      // without admin SDK or a custom backend.
      // For a client-side app, we'd typically store this in Firestore (e.g., in a 'users' collection)
      // or rely on the photoURL being part of the conversation document.
      // For now, we'll return undefined, and rely on the conversation document to store it.
      // If we had a 'users' collection, we'd do:
      // const userDoc = await getDoc(doc(db, 'users', uid));
      // return userDoc.data()?.photoURL;
      return undefined; // Placeholder, will be handled by conversation document
    } catch (error) {
      console.error("Error fetching user photo URL:", error);
      return undefined;
    }
  };

  const value = { ...authState, signInWithGoogle, logout, updateUserProfile, fetchUserPhotoURL };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};