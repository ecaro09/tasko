import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ListTodo, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const BottomNavigationBar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Services', icon: LayoutGrid, path: '#categories' },
    { name: 'Tasks', icon: ListTodo, path: '#tasks' },
    { name: 'Profile', icon: User, path: '/profile' }, // Placeholder path for profile
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 md:hidden">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={cn(
              "flex flex-col items-center text-xs font-medium px-2 py-1 rounded-md transition-colors",
              (location.pathname === item.path || (item.path.startsWith('#') && location.hash === item.path))
                ? "text-green-600 bg-green-50"
                : "text-gray-600 hover:text-green-600 hover:bg-gray-50"
            )}
          >
            <item.icon size={20} className="mb-1" />
            <span>{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigationBar;