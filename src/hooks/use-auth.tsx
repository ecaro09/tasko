import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase'; // This auth could be null now
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  updateProfile,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { toast } from 'sonner';

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  signupWithEmailPassword: (email: string, password: string) => Promise<void>;
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
    if (!auth) { // Handle case where Firebase auth failed to initialize
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      console.error("Firebase Auth is not initialized. Check your Firebase configuration.");
      toast.error("Authentication services are unavailable. Please check Firebase configuration.");
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    });
    return () => unsubscribe();
  }, []);

  // All auth functions need to check if 'auth' is available
  const signInWithGoogle = async () => {
    if (!auth) {
      toast.error("Authentication services are not available.");
      throw new Error("Auth not initialized.");
    }
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      toast.error(`Failed to sign in with Google: ${error.message}`);
      throw error;
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    if (!auth) {
      toast.error("Authentication services are not available.");
      throw new Error("Auth not initialized.");
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Error logging in with email/password:", error);
      toast.error(`Failed to log in: ${error.message}`);
      throw error;
    }
  };

  const signupWithEmailPassword = async (email: string, password: string) => {
    if (!auth) {
      toast.error("Authentication services are not available.");
      throw new Error("Auth not initialized.");
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully!");
    } catch (error: any) {
      console.error("Error signing up with email/password:", error);
      toast.error(`Failed to sign up: ${error.message}`);
      throw error;
    }
  };

  const logout = async () => {
    if (!auth) {
      toast.error("Authentication services are not available.");
      throw new Error("Auth not initialized.");
    }
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
    if (!auth || !authState.user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    try {
      await updateProfile(authState.user, { displayName, photoURL });
      setAuthState(prev => ({
        ...prev,
        user: auth.currentUser,
      }));
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  const value = { ...authState, signInWithGoogle, loginWithEmailPassword, signupWithEmailPassword, logout, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};