import React from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { showSuccess, showError } from '@/utils/toast';

interface AuthState {
  user: FirebaseUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAuth() {
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showSuccess("Signed in successfully!");
    } catch (error: any) {
      console.error("Error signing in with Google:", error);
      showError(`Failed to sign in: ${error.message}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      showSuccess("Logged out successfully!");
    } catch (error: any) {
      console.error("Error signing out:", error);
      showError(`Failed to log out: ${error.message}`);
    }
  };

  return { ...authState, signInWithGoogle, logout };
}