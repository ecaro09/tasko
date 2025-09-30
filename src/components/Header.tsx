import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface HeaderProps {
  isAuthenticated: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignIn, onSignOut }) => {
  return (
    <header className="pwa-header bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl text-green-600 font-bold">Tasko</h1>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">Home</Link>
          <a href="#categories" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">Services</a>
          <a href="#tasks" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">Tasks</a>
          <a href="#how-it-works" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">How It Works</a>
          <a href="#become-tasker" className="text-gray-700 hover:text-green-600 font-semibold transition-colors">Become a Tasker</a>
        </nav>
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <Button onClick={onSignOut} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
              Sign Out
            </Button>
          ) : (
            <>
              <Button onClick={onSignIn} variant="outline" className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                Login
              </Button>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;