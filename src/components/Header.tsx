import React from 'react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <header className="bg-blue-600 text-white p-4 text-center">
      <img src="https://via.placeholder.com/150x50?text=DYAD+Logo" alt="DYAD Logo" className="h-12 inline-block align-middle" />
      <h1 className="text-3xl font-bold inline-block align-middle ml-4">DYAD Full Duplicate</h1>
      <div className="mt-2">
        {!isAuthenticated ? (
          <Button onClick={onSignIn} className="bg-white text-blue-600 hover:bg-gray-100">
            Sign In with Google
          </Button>
        ) : (
          <Button onClick={onSignOut} className="bg-white text-blue-600 hover:bg-gray-100">
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;