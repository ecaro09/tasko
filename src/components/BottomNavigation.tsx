import React from 'react';
import { Home, LayoutGrid, ListTodo, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onProfileClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onProfileClick }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around py-2">
        <NavLink
          to="/"
          className={({ isActive }) => cn(
            "flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200",
            isActive ? "text-green-600 bg-green-50" : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
          )}
        >
          <Home size={20} className="mb-1" />
          <span>Home</span>
        </NavLink>
        <a
          href="#categories"
          className="flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 text-gray-600 hover:text-green-600 hover:bg-gray-50"
        >
          <LayoutGrid size={20} className="mb-1" />
          <span>Services</span>
        </a>
        <a
          href="#tasks"
          className="flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 text-gray-600 hover:text-green-600 hover:bg-gray-50"
        >
          <ListTodo size={20} className="mb-1" />
          <span>Tasks</span>
        </a>
        <button
          onClick={onProfileClick}
          className="flex flex-col items-center text-xs font-medium p-2 rounded-md transition-colors duration-200 text-gray-600 hover:text-green-600 hover:bg-gray-50"
        >
          <User size={20} className="mb-1" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;