import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, LayoutGrid, ListTodo, User, Briefcase, Settings as SettingsIcon, MessageSquare, DollarSign, Info, BookText, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useModal } from './ModalProvider';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { cn } from '@/lib/utils';

interface MobileNavProps {
  onSignOut: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onSignOut }) => {
  const { isAuthenticated, user } = useAuth();
  const { openLoginModal, openSignupModal, openTaskerRegistrationModal } = useModal();
  const { isTasker } = useTaskerProfile();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLinkClick = () => {
    setIsOpen(false); // Close the sheet when a link is clicked
  };

  const handleAuthAction = (action: 'login' | 'signup') => {
    setIsOpen(false);
    if (action === 'login') {
      openLoginModal();
    } else {
      openSignupModal();
    }
  };

  const handleBecomeTaskerClick = () => {
    setIsOpen(false);
    if (isAuthenticated) {
      openTaskerRegistrationModal();
    } else {
      openLoginModal(); // Prompt login if not authenticated
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu size={24} />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] sm:w-[320px] flex flex-col">
        <SheetHeader className="text-left px-4 pt-4">
          <SheetTitle className="text-3xl font-bold text-[hsl(var(--primary-color))]">Tasko</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-2 p-4 flex-1">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
              isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
            )}
            onClick={handleLinkClick}
          >
            <Home size={20} /> Home
          </NavLink>
          <a
            href="#categories"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-[hsl(var(--text-dark))] dark:text-gray-100"
            onClick={handleLinkClick}
          >
            <LayoutGrid size={20} /> Services
          </a>
          {isAuthenticated && (
            <>
              <NavLink
                to="/my-tasks"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                )}
                onClick={handleLinkClick}
              >
                <ListTodo size={20} /> My Posted Tasks
              </NavLink>
              {isTasker && (
                <NavLink
                  to="/my-offers"
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                    isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                  )}
                  onClick={handleLinkClick}
                >
                  <Briefcase size={20} /> My Offers
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                )}
                onClick={handleLinkClick}
              >
                <User size={20} /> Profile
              </NavLink>
              <NavLink
                to="/dashboard"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                )}
                onClick={handleLinkClick}
              >
                <DollarSign size={20} /> Dashboard
              </NavLink>
              <NavLink
                to="/chat"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                )}
                onClick={handleLinkClick}
              >
                <MessageSquare size={20} /> Chat
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
                  isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
                )}
                onClick={handleLinkClick}
              >
                <SettingsIcon size={20} /> Settings
              </NavLink>
            </>
          )}
          <Link
            to="/features-earnings"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-[hsl(var(--text-dark))] dark:text-gray-100"
            onClick={handleLinkClick}
          >
            <Briefcase size={20} /> Become a Tasker
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-[hsl(var(--text-dark))] dark:text-gray-100"
            onClick={handleLinkClick}
          >
            <Info size={20} /> How It Works
          </a>
          <NavLink
            to="/faq"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
              isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
            )}
            onClick={handleLinkClick}
          >
            <BookText size={20} /> FAQ
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-lg font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-700",
              isActive ? "bg-[rgba(0,168,45,0.1)] text-[hsl(var(--primary-color))]" : "text-[hsl(var(--text-dark))] dark:text-gray-100"
            )}
            onClick={handleLinkClick}
          >
            <Mail size={20} /> Contact Us
          </NavLink>
        </nav>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {isAuthenticated ? (
            <Button onClick={onSignOut} className="w-full bg-red-600 hover:bg-red-700 text-white text-lg py-3">
              Sign Out
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Button onClick={() => handleAuthAction('login')} className="w-full bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] text-lg py-3">
                Login
              </Button>
              <Button onClick={() => handleAuthAction('signup')} variant="outline" className="w-full border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white text-lg py-3">
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;