import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  signOut,
  User as FirebaseUser,
  updateProfile,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client'; // Import Supabase client

// Extend FirebaseUser to include profile data from Supabase
interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  contact_number?: string;
  avatar_url?: string;
  rating?: number;
  is_verified_tasker?: boolean;
}

export interface EnhancedUser extends FirebaseUser {
  profile?: UserProfile;
}

interface AuthState {
  user: EnhancedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  signupWithEmailPassword: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  loginWithEmailPassword: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string, contactNumber?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<UserProfile | undefined> => {
    if (!firebaseUser) return undefined;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', firebaseUser.uid)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error fetching user profile from Supabase:", error);
        toast.error("Failed to load user profile.");
        return undefined;
      }
      return data as UserProfile;
    } catch (err) {
      console.error("Unexpected error fetching user profile:", err);
      toast.error("Failed to load user profile due to an unexpected error.");
      return undefined;
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await fetchUserProfile(firebaseUser);
        const enhancedUser: EnhancedUser = { ...firebaseUser, profile };
        setAuthState({
          user: enhancedUser,
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

  const signupWithEmailPassword = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Update Firebase profile with display name (if provided)
      await updateProfile(firebaseUser, {
        displayName: `${firstName || ''} ${lastName || ''}`.trim() || email,
      });

      // Supabase trigger will handle initial profile creation, but we can update it here if needed
      // For now, the trigger handles first_name, last_name, avatar_url from raw_user_meta_data
      // We'll rely on the trigger for initial profile creation.

      toast.success("Account created successfully! You are now logged in.");
    } catch (error: any) {
      console.error("Auth error caught during signup:", error);
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
    } catch (error: any) {
      console.error("Auth error caught during login:", error);
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
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast.error(`Failed to log out: ${error.message}`);
    }
  };

  const updateUserProfile = async (displayName: string, photoURL?: string, contactNumber?: string) => {
    if (!authState.user) {
      toast.error("You must be logged in to update your profile.");
      return;
    }
    try {
      // Update Firebase Auth profile
      await updateProfile(authState.user, { displayName, photoURL });

      // Update Supabase profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: authState.user.uid,
          first_name: displayName.split(' ')[0],
          last_name: displayName.split(' ').slice(1).join(' '),
          avatar_url: photoURL,
          contact_number: contactNumber,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) {
        console.error("Error updating Supabase profile:", error);
        toast.error(`Failed to update profile: ${error.message}`);
        throw error;
      }

      // Force a re-fetch of the user to update the state with new profile info
      const updatedFirebaseUser = auth.currentUser;
      if (updatedFirebaseUser) {
        const updatedProfile = await fetchUserProfile(updatedFirebaseUser);
        setAuthState(prev => ({
          ...prev,
          user: { ...updatedFirebaseUser, profile: updatedProfile },
        }));
      }
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(`Failed to update profile: ${error.message}`);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Check if profile exists in Supabase, if not, create it
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', firebaseUser.uid)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
        console.error("Error checking existing profile:", fetchError);
        toast.error("Failed to check user profile during Google sign-in.");
        throw fetchError;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: firebaseUser.uid,
            first_name: firebaseUser.displayName?.split(' ')[0] || null,
            last_name: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
            avatar_url: firebaseUser.photoURL,
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          console.error("Error creating Supabase profile for Google user:", insertError);
          toast.error(`Failed to create profile for Google user: ${insertError.message}`);
          throw insertError;
        }
      }

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