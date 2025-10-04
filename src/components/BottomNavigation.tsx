import React from 'react';
import { Home, LayoutGrid, ListTodo, User, MessageSquare } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useModal } from './ModalProvider';

interface BottomNavigationProps {
  // onProfileClick: () => void; // No longer needed as we'll handle navigation directly
}

const BottomNavigation: React.FC<BottomNavigationProps> = React.memo(() => {
  const { isAuthenticated } = useAuth();
  const { openLoginModal } = useModal();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/profile'); // Navigate to the new ProfilePage
    } else {
      openLoginModal(); // Open login modal if not authenticated
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden pb-[var(--safe-area-bottom)]">
      <div className="flex justify-around py-2">
        <NavLink
          to="/"
          className={({ isActive }) => cn(
            "flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200",
            isActive ? "text-[hsl(var(--primary-color))] bg-[rgba(0,168,45,0.1)]" : "text-[hsl(var(--text-light))] hover:text-[hsl(var(--primary-color))] hover:bg-gray-50"
          )}
        >
          <Home size={20} className="mb-1" />
          <span>Home</span>
        </NavLink>
        <a
          href="#categories"
          className="flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 text-[hsl(var(--text-light))] hover:text-[hsl(var(--primary-color))] hover:bg-gray-50"
        >
          <LayoutGrid size={20} className="mb-1" />
          <span>Services</span>
        </a>
        <NavLink
          to="/my-tasks"
          className={({ isActive }) => cn(
            "flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200",
            isActive ? "text-[hsl(var(--primary-color))] bg-[rgba(0,168,45,0.1)]" : "text-[hsl(var(--text-light))] hover:text-[hsl(var(--primary-color))] hover:bg-gray-50"
          )}
        >
          <ListTodo size={20} className="mb-1" />
          <span>My Tasks</span>
        </NavLink>
        {/* New NavLink for Chat */}
        <NavLink
          to="/chat"
          className={({ isActive }) => cn(
            "flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200",
            isActive ? "text-[hsl(var(--primary-color))] bg-[rgba(0,168,45,0.1)]" : "text-[hsl(var(--text-light))] hover:text-[hsl(var(--primary-color))] hover:bg-gray-50"
          )}
        >
          <MessageSquare size={20} className="mb-1" />
          <span>Chat</span>
        </NavLink>
        <button
          onClick={handleProfileClick}
          className="flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 text-[hsl(var(--text-light))] hover:text-[hsl(var(--primary-color))] hover:bg-gray-50"
        >
          <User size={20} className="mb-1" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
});

export default BottomNavigation;