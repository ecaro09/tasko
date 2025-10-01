"use client";

import React from 'react';
import Header from "@/components/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import UserProfileCard from '@/components/UserProfileCard';
import TaskerProfileForm from '@/components/TaskerProfileForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ProfilePage: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { isTasker, loading: taskerProfileLoading } = useTaskerProfile();

  const loading = authLoading || taskerProfileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Your Profile</h1>

        {isAuthenticated ? (
          <>
            <UserProfileCard />

            {!isTasker && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Become a Tasker</CardTitle>
                  <CardDescription>
                    Register as a tasker to start making offers on tasks and earning money.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => { /* Logic to scroll to form or open modal if form is separate */ }}>
                    Create Tasker Profile
                  </Button>
                </CardContent>
              </Card>
            )}

            <TaskerProfileForm />
          </>
        ) : (
          <Card className="text-center p-8">
            <CardTitle className="mb-4">Sign In to View Your Profile</CardTitle>
            <Button onClick={signInWithGoogle}>Sign In with Google</Button>
          </Card>
        )}
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default ProfilePage;