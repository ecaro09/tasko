import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useModal } from './ModalProvider';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // New import
import { User as UserIcon } from 'lucide-react'; // New import
import MobileNav from './MobileNav'; // Import the new MobileNav component

interface HeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignOut }) => {
  const { openLoginModal, openSignupModal } = useModal();
  const { user } = useAuth(); // Get user object from useAuth

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center pt-[var(--safe-area-top)]">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <MobileNav onSignOut={onSignOut} />
          </div>
          <h1 className="text-2xl text-[hsl(var(--primary-color))] font-bold">Tasko</h1>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Home</Link>
          <a href="#categories" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Services</a>
          {isAuthenticated && (
            <Link to="/my-tasks" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">My Tasks</Link>
          )}
          <a href="#how-it-works" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">How It Works</a>
          <Link to="/features-earnings" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Become a Tasker</Link>
          {isAuthenticated && ( // New: Profile link for authenticated users
            <Link to="/profile" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Profile</Link>
          )}
        </nav>
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center"> {/* New: Clickable Avatar for profile */}
                <Avatar className="w-8 h-8 border-2 border-[hsl(var(--primary-color))]">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || user?.email || "User"} />
                  <AvatarFallback className="bg-[hsl(var(--primary-color))] text-white text-sm font-semibold">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button onClick={onSignOut} variant="outline" className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white hidden md:inline-flex">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={openLoginModal} variant="outline" className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white hidden md:inline-flex">
                Login
              </Button>
              <Button onClick={openSignupModal} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] hidden md:inline-flex">
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