import React from 'react';
import { Menu, Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const Header = () => {
  const { user, userData } = useAuth();

  return (
    <header className="flex items-center justify-between h-16 px-4 border-b bg-background">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-6 w-6" />
      </Button>
      <div className="flex-1 text-lg font-semibold md:ml-4">
        {/* You can add a dynamic title here based on the current route */}
        Dashboard
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-6 w-6" />
        </Button>
        <Avatar>
          <AvatarImage src={userData?.avatarUrl || user?.photoURL || `https://ui-avatars.com/api/?name=${userData?.name || user?.displayName || 'User'}`} alt={userData?.name || user?.displayName || 'User'} />
          <AvatarFallback>
            <UserCircle className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;