import React from 'react';
import { Button } from "@/components/ui/button";
import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { showSuccess, showError } from '../utils/toast';

interface HeaderProps {
  isAuthenticated: boolean;
  userDisplayName: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, userDisplayName, onSignIn, onSignOut }) => {
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      showSuccess("Signed in successfully!");
      onSignIn(); // Call the parent's onSignIn to update state
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      showError(`Sign-in failed: ${error.message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showSuccess("Signed out successfully!");
      onSignOut(); // Call the parent's onSignOut to update state
    } catch (error: any) {
      console.error("Sign-Out Error:", error);
      showError(`Sign-out failed: ${error.message}`);
    }
  };

  return (
    <header className="bg-blue-600 text-white p-4 text-center flex flex-col sm:flex-row items-center justify-between">
      <div className="flex items-center mb-2 sm:mb-0">
        <img src="/logo.jpg" alt="Tasko Logo" className="h-12 inline-block align-middle" />
        <h1 className="text-3xl font-bold inline-block align-middle ml-4">Tasko Philippines</h1>
      </div>
      <div className="flex items-center space-x-2">
        {isAuthenticated && userDisplayName && (
          <span className="text-lg mr-2">Welcome, {userDisplayName}!</span>
        )}
        {!isAuthenticated ? (
          <Button onClick={handleGoogleSignIn} className="bg-white text-blue-600 hover:bg-gray-100">
            Sign In with Google
          </Button>
        ) : (
          <Button onClick={handleSignOut} className="bg-white text-blue-600 hover:bg-gray-100">
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;