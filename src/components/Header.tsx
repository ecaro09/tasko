import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom'; // Import Link for navigation

interface HeaderProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <header className="bg-blue-600 text-white p-4 text-center shadow-md">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <img src="https://via.placeholder.com/150x50?text=DYAD+Logo" alt="DYAD Logo" className="h-12 inline-block align-middle" />
          <h1 className="text-3xl font-bold inline-block align-middle ml-4">DYAD Full Duplicate</h1>
        </div>
        <nav className="flex items-center space-x-4 mb-4 md:mb-0">
          <Link to="/" className="text-white hover:text-blue-200 transition-colors">Home</Link>
          <Link to="/chat" className="text-white hover:text-blue-200 transition-colors">Chat</Link>
          <Link to="/privacy" className="text-white hover:text-blue-200 transition-colors">Privacy Policy</Link>
        </nav>
        <div className="mt-2 md:mt-0">
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
      </div>
    </header>
  );
};

export default Header;