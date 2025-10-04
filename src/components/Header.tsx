import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useModal } from './ModalProvider';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User as UserIcon, Plus, Briefcase, LayoutList } from 'lucide-react'; // New import for LayoutList icon
import { useTaskerProfile } from '@/hooks/use-tasker-profile';

interface HeaderProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated, onSignOut }) => {
  const { openLoginModal, openSignupModal, openPostTaskModal } = useModal();
  const { user } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile(); // Use isTasker from hook

  return (
    <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center pt-[var(--safe-area-top)]">
      <div className="container mx-auto px-4 flex justify-between items-center w-full">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl text-[hsl(var(--primary-color))] font-bold">Tasko</h1>
        </div>
        <nav className="hidden md:flex gap-8">
          <Link to="/" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Home</Link>
          <a href="#categories" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Services</a>
          {isAuthenticated && !taskerProfileLoading && !isTasker && ( // Conditional link for clients
            <Link to="/client-dashboard" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">My Dashboard</Link>
          )}
          {isAuthenticated && !taskerProfileLoading && isTasker && ( // Conditional link for taskers
            <Link to="/tasker-dashboard" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Tasker Dashboard</Link>
          )}
          <a href="#how-it-works" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">How It Works</a>
          <Link to="/features-earnings" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Become a Tasker</Link>
          {isAuthenticated && (
            <Link to="/profile" className="text-[hsl(var(--text-dark))] hover:text-[hsl(var(--primary-color))] font-semibold transition-colors p-2 rounded-md text-sm">Profile</Link>
          )}
        </nav>
        <div className="flex gap-3 items-center">
          {isAuthenticated ? (
            <>
              <Button onClick={openPostTaskModal} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] flex items-center gap-1 px-3 py-2 h-auto text-sm">
                <Plus size={16} /> Post Task
              </Button>
              <Link to="/profile" className="flex items-center">
                <Avatar className="w-8 h-8 border-2 border-[hsl(var(--primary-color))]">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || user?.email || "User"} />
                  <AvatarFallback className="bg-[hsl(var(--primary-color))] text-white text-sm font-semibold">
                    {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon size={16} />}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button onClick={onSignOut} variant="outline" className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={openLoginModal} variant="outline" className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
                Login
              </Button>
              <Button onClick={openSignupModal} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))]">
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