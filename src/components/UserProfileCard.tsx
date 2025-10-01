"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/hooks/use-auth';
import { User } from 'lucide-react';

const UserProfileCard: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Please sign in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User Avatar"} />
          <AvatarFallback className="bg-blue-500 text-white text-2xl">
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={32} />}
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-2xl">{user.displayName || "Anonymous User"}</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          This is your basic user profile information.
        </p>
      </CardContent>
    </Card>
  );
};

export default UserProfileCard;