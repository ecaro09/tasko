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
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Tasko" className="h-10" />
          <h1 className="text-2xl text-green-600 font-bold">Tasko</h1>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-gray-800 font-semibold px-4 py-2 rounded-md transition-all hover:bg-green-600 hover:text-white">Home</Link>
          <a href="#categories" className="text-gray-800 font-semibold px-4 py-2 rounded-md transition-all hover:bg-green-600 hover:text-white">Services</a>
          <a href="#tasks" className="text-gray-800 font-semibold px-4 py-2 rounded-md transition-all hover:bg-green-600 hover:text-white">Tasks</a>
          <a href="#how-it-works" className="text-gray-800 font-semibold px-4 py-2 rounded-md transition-all hover:bg-green-600 hover:text-white">How It Works</a>
          <a href="#become-tasker" className="text-gray-800 font-semibold px-4 py-2 rounded-md transition-all hover:bg-green-600 hover:text-white">Become a Tasker</a>
        </nav>
        <div className="flex gap-4 items-center">
          {!isAuthenticated ? (
            <>
              <Button variant="outline" onClick={onSignIn} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                Login
              </Button>
              <Button onClick={onSignOut} className="bg-green-600 text-white hover:bg-green-700">
                Sign Up
              </Button>
            </>
          ) : (
            <Button onClick={onSignOut} className="bg-green-600 text-white hover:bg-green-700">
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;