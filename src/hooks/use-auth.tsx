import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser, updateProfile, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { toast } from 'sonner'; // Using sonner for toasts

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
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
      toast.success("Signed in successfully with Google!");
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error(`Failed to sign in with Google: ${error.message}`);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
        setAuthState(prev => ({
          ...prev,
          user: auth.currentUser,
          isAuthenticated: true,
        }));
        toast.success("Account created and signed in successfully!");
      }
    } catch (error: any) {
      console.error("Error signing up with email:", error);
      toast.error(`Failed to sign up: ${error.message}`);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in with email:", error);
      toast.error(`Failed to sign in: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Failed to log out: ${error.message}`);
      throw error;
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

  const value = { ...authState, signInWithGoogle, signUpWithEmail, signInWithEmail, logout, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};