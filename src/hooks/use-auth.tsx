import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  signOut,
  User as FirebaseUser,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendEmailVerification, // Import sendEmailVerification
} from 'firebase/auth';
import { toast } from 'sonner';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication'; // Import the Capacitor plugin
import { useSupabaseProfile } from './use-supabase-profile'; // New import

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signupWithEmailPassword: (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (firstName: string, lastName: string, phone: string, photoURL?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>; // Add sendVerificationEmail to context
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = React.useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });
  const supabaseProfileContext = useSupabaseProfile(); // Get context for Supabase profile

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setAuthState({
          user,
          isAuthenticated: true,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const sendVerificationEmail = async () => {
    if (!authState.user) {
      toast.error("No user logged in to send verification email.");
      return;
    }
    try {
      await sendEmailVerification(authState.user);
      toast.success("Verification email sent! Please check your inbox.");
      console.log(`[Auth Log] Verification email sent to ${authState.user.email} at ${new Date().toISOString()}`);
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast.error(`Failed to send verification email: ${error.message}`);
      console.log(`[Auth Log] Failed to send verification email to ${authState.user.email} at ${new Date().toISOString()} - Error: ${error.message}`);
      throw error;
    }
  };

  const signupWithEmailPassword = async (email: string, password: string, firstName?: string, lastName?: string, phone?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const displayName = `${firstName || ''} ${lastName || ''}`.trim();
      await updateProfile(userCredential.user, {
        displayName: displayName,
        photoURL: null, // Can be updated later
      });

      // Create initial Supabase profile entry
      if (userCredential.user && supabaseProfileContext) {
        await supabaseProfileContext.updateProfile(
          userCredential.user.uid,
          firstName || null,
          lastName || null,
          phone || null,
          null, // No avatar URL initially
          'user' // Default role
        );
      }

      // Send email verification after successful signup
      if (userCredential.user) {
        await sendEmailVerification(userCredential.user);
        toast.success("Account created successfully! A verification email has been sent to your inbox. Please verify your email to continue.");
        console.log(`[Auth Log] Signup successful (Email/Password) for user: ${email} at ${new Date().toISOString()}. Verification email sent.`);
      } else {
        toast.success("Account created successfully! You are now logged in.");
        console.log(`[Auth Log] Signup successful (Email/Password) for user: ${email} at ${new Date().toISOString()}`);
      }
    } catch (error: any) {
      console.error("Auth error caught during signup:", error);
      console.log(`[Auth Log] Signup failed (Email/Password) for user: ${email} at ${new Date().toISOString()} - Error: ${error.message}`);
      let errorMessage = "Failed to create account.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already in use.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.message) {
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
      console.log(`[Auth Log] Login successful (Email/Password) for user: ${email} at ${new Date().toISOString()}`);
    } catch (error: any) {
      console.error("Auth error caught during login:", error);
      console.log(`[Auth Log] Login failed (Email/Password) for user: ${email} at ${new Date().toISOString()} - Error: ${error.message}`);
      let errorMessage = "Failed to log in.";
      if (error.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = "No user found with this email.";
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      } else if (error.message) {
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
      console.log(`[Auth Log] Logout successful at ${new Date().toISOString()}`);
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Failed to log out: ${error.message}`);
      console.log(`[Auth Log] Logout failed at ${new Date().toISOString()} - Error: ${error.message}`);
    }
  };

  const updateUserProfile = async (firstName: string, lastName: string, phone: string, photoURL?: string) => {
    if (!authState.user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    try {
      const newDisplayName = `${firstName} ${lastName}`.trim();
      await updateProfile(authState.user, { displayName: newDisplayName, photoURL });

      // Also update Supabase profile
      if (supabaseProfileContext && authState.user) {
        await supabaseProfileContext.updateProfile(
          authState.user.uid,
          firstName,
          lastName,
          phone,
          photoURL || null,
          supabaseProfileContext.profile?.role || 'user' // Keep existing role or default to 'user'
        );
      }

      toast.success("Profile updated successfully!");
      console.log(`[Auth Log] Profile update successful for user: ${authState.user.uid} at ${new Date().toISOString()}`);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      console.log(`[Auth Log] Profile update failed for user: ${authState.user.uid} at ${new Date().toISOString()} - Error: ${error.message}`);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const result = await FirebaseAuthentication.signInWithGoogle();

      if (result.credential?.idToken && result.credential?.accessToken) {
        const credential = GoogleAuthProvider.credential(result.credential.idToken, result.credential.accessToken);
        await signInWithCredential(auth, credential);
        toast.success("Logged in with Google successfully!");
        console.log(`[Auth Log] Google sign-in successful for user: ${auth.currentUser?.email} at ${new Date().toISOString()}`);
      } else {
        throw new Error("Google sign-in did not return valid credentials.");
      }
    } catch (error: any) {
      console.error("Auth error caught during Google sign-in:", error);
      console.log(`[Auth Log] Login failed (Google) at ${new Date().toISOString()} - Error: ${error.message}`);
      let errorMessage = "Failed to sign in with Google.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in popup closed.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      setAuthState(prev => ({ ...prev, loading: false }));
      throw error;
    }
  };

  const value = { ...authState, signupWithEmailPassword, loginWithEmailPassword, logout, updateUserProfile, signInWithGoogle, sendVerificationEmail };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};