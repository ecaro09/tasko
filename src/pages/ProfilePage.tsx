"use client";

import React from 'react';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useModal } from '@/components/ModalProvider';
import { User, Mail, MapPin, DollarSign, Briefcase, CalendarDays, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { taskerProfile, isTasker, loading: taskerProfileLoading } = useTaskerProfile();
  const { openTaskerProfileFormModal } = useModal();

  const loading = authLoading || taskerProfileLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center">
          <p className="text-red-500">Please sign in to view your profile.</p>
        </main>
        <MadeWithDyad />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Your Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information Card */}
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center gap-4 pb-4">
              <Avatar className="h-20 w-20 border-2 border-blue-500">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
                <AvatarFallback className="bg-blue-200 text-blue-800 text-2xl">
                  {user?.displayName?.charAt(0).toUpperCase() || <User size={32} />}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user?.displayName || 'Anonymous User'}</CardTitle>
                <CardDescription className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                  <Mail size={16} /> {user?.email}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-gray-100">Account Details</h3>
              <div className="space-y-2 text-gray-700 dark:text-gray-300">
                <p className="flex items-center gap-2">
                  <User size={18} /> <strong>User ID:</strong> {user?.uid}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays size={18} /> <strong>Member Since:</strong> {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tasker Profile Card */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Briefcase size={24} /> Tasker Profile
              </CardTitle>
              <CardDescription>
                {isTasker ? 'Your professional details as a tasker.' : 'Become a tasker to offer your services and earn!'}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {isTasker && taskerProfile ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-1">Bio</h3>
                    <p className="text-gray-700 dark:text-gray-300">{taskerProfile.bio}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100 mb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {taskerProfile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <DollarSign size={18} /> <strong>Hourly Rate:</strong> ₱{taskerProfile.hourlyRate.toLocaleString()}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <MapPin size={18} /> <strong>Location:</strong> {taskerProfile.location}
                  </p>
                  <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <CheckCircle size={18} className={taskerProfile.isVerified ? 'text-green-500' : 'text-yellow-500'} />
                    <strong>Status:</strong> {taskerProfile.isVerified ? 'Verified' : 'Pending Verification'}
                  </p>
                  <Button onClick={() => openTaskerProfileFormModal(taskerProfile)} className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-4">
                    Edit Tasker Profile
                  </Button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">You don't have a tasker profile yet.</p>
                  <Button onClick={() => openTaskerProfileFormModal(null)} className="bg-green-600 hover:bg-green-700 text-white">
                    Become a Tasker
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default ProfilePage;