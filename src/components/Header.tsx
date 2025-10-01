"use client";

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth'; // Import useAuth hook

const Header: React.FC = () => {
  const { user, isAuthenticated, signInWithGoogle, signOutUser } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="https://via.placeholder.com/150x50?text=DYAD+Logo" alt="DYAD Logo" className="h-10" />
          <h1 className="text-2xl font-bold hidden sm:block">DYAD Full Duplicate</h1>
        </Link>
      </div>

      <nav className="flex items-center gap-4 mx-auto">
        <Link to="/" className="text-white hover:text-blue-200 transition-colors">Home</Link>
        <Link to="/chat" className="text-white hover:text-blue-200 transition-colors">Chat</Link>
        <Link to="/privacy" className="text-white hover:text-blue-200 transition-colors">Privacy</Link>
      </nav>

      <div className="flex items-center gap-2">
        {!isAuthenticated ? (
          <Button onClick={signInWithGoogle} className="bg-white text-blue-600 hover:bg-gray-100">
            Sign In
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                  <AvatarFallback className="bg-blue-700 text-white">
                    {user?.displayName?.charAt(0).toUpperCase() || <UserIcon className="h-5 w-5" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOutUser} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default Header;