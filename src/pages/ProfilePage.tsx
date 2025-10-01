"use client";

import React from 'react';
import Header from "@/components/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import UserProfileCard from '@/components/UserProfileCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useModal } from '@/components/ModalProvider'; // Import useModal
import { MapPin, DollarSign, Briefcase } from 'lucide-react'; // Import icons
import { Badge } from '@/components/ui/badge'; // Import Badge component

const ProfilePage: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { taskerProfile, isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { openTaskerProfileFormModal } = useModal(); // Use the modal context

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

            {isTasker ? (
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Your Tasker Profile</CardTitle>
                  <Button onClick={() => openTaskerProfileFormModal(taskerProfile)} variant="outline">
                    Edit Profile
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <p className="text-gray-700 dark:text-gray-300">{taskerProfile?.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {taskerProfile?.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <p className="flex items-center gap-2"><DollarSign size={18} /> <strong>Hourly Rate:</strong> ₱{taskerProfile?.hourlyRate.toLocaleString()}</p>
                    <p className="flex items-center gap-2"><MapPin size={18} /> <strong>Location:</strong> {taskerProfile?.location}</p>
                    <p className="flex items-center gap-2"><Briefcase size={18} /> <strong>Registered:</strong> {taskerProfile?.dateRegistered ? new Date(taskerProfile.dateRegistered).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Become a Tasker</CardTitle>
                  <CardDescription>
                    Register as a tasker to start making offers on tasks and earning money.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => openTaskerProfileFormModal()}>
                    Create Tasker Profile
                  </Button>
                </CardContent>
              </Card>
            )}
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