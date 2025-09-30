import React from 'react';
import { Button } from "@/components/ui/button";

interface HeaderProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <header className="bg-white text-gray-900 p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center">
        <img src="/tasko-logo.jpg" alt="Tasko Logo" className="h-12 mr-4" />
        <h1 className="text-3xl font-bold text-green-600">Tasko</h1>
      </div>
      <div className="flex items-center space-x-2">
        {!isAuthenticated ? (
          <Button onClick={onSignIn} className="bg-green-600 text-white hover:bg-green-700">
            Sign In with Google
          </Button>
        ) : (
          <Button onClick={onSignOut} className="bg-red-600 text-white hover:bg-red-700">
            Logout
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;