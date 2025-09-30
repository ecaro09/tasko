import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ListTodo, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  onProfileClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ onProfileClick }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/#categories', icon: LayoutGrid, label: 'Services' },
    { path: '/#tasks', icon: ListTodo, label: 'Tasks' },
    { path: '/my-tasks', icon: User, label: 'Profile' }, // This will be handled by onProfileClick
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/' && !location.hash
            : location.pathname === item.path || location.hash === item.path.substring(1);

          if (item.label === 'Profile') {
            return (
              <button
                key={item.label}
                onClick={onProfileClick}
                className={cn(
                  "flex flex-col items-center text-xs font-medium px-2 py-1 rounded-md transition-colors",
                  isActive ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-gray-700" : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
                )}
              >
                <item.icon size={20} className="mb-1" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={cn(
                "flex flex-col items-center text-xs font-medium px-2 py-1 rounded-md transition-colors",
                isActive ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-gray-700" : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
              )}
            >
              <item.icon size={20} className="mb-1" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;