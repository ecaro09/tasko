import React from 'react';
import { Home, ListTodo, User, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MobileNav = () => {
  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: ListTodo, label: 'My Tasks', path: '/my-tasks' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t md:hidden z-50">
      <div className="flex justify-around py-2">
        {navItems.map((item) => (
          <Button key={item.label} variant="ghost" className="flex flex-col items-center text-xs h-auto py-1" asChild>
            <Link to={item.path}>
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;