import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  signOut,
  User as FirebaseUser,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup, // Import signInWithPopup
} from 'firebase/auth';
import { toast } from 'sonner'; // Using sonner for toasts

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signupWithEmailPassword: (email: string, password: string) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>; // Add Google Sign-In function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    });
    return () => unsubscribe();
  }, []);

  const signupWithEmailPassword = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success("Account created successfully! You are now logged in.");
    } catch (error: any) {
      console.error("Auth error caught during signup:", error); // Added console log
      let errorMessage = "Failed to create account.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message) { // Catch any other error messages
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const loginWithEmailPassword = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully!");
    } catch (error: any) {
      console.error("Auth error caught during login:", error); // Added console log
      let errorMessage = "Failed to log in.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.message) { // Catch any other error messages
        errorMessage = error.message;
      }
      toast.error(errorMessage);
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Logged in with Google successfully!");
    } catch (error: any) {
      console.error("Auth error caught during Google sign-in:", error);
      let errorMessage = "Failed to sign in with Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in popup closed.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = { ...authState, signupWithEmailPassword, loginWithEmailPassword, logout, updateUserProfile, signInWithGoogle };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};