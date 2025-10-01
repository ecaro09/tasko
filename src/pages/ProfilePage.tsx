"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import Header from '@/components/Header';
import { MadeWithDyad } from '@/components/made-with-dyad';
import { Toaster } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner'; // Using sonner toast directly

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const {
    taskerProfile,
    isTasker,
    loading: taskerProfileLoading,
    createTaskerProfile,
    updateTaskerProfile,
  } = useTaskerProfile();

  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (taskerProfile) {
      setBio(taskerProfile.bio);
      setSkills(taskerProfile.skills.join(', '));
      setHourlyRate(taskerProfile.hourlyRate.toString());
      setLocation(taskerProfile.location);
    } else {
      // Reset form if no tasker profile exists
      setBio('');
      setSkills('');
      setHourlyRate('');
      setLocation('');
    }
  }, [taskerProfile]);

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

  const handleCreateOrUpdateTaskerProfile = async () => {
    if (!bio.trim() || !skills.trim() || !hourlyRate.trim() || !location.trim()) {
      toast.error("Please fill in all tasker profile fields.");
      return;
    }

    const parsedHourlyRate = parseFloat(hourlyRate);
    if (isNaN(parsedHourlyRate) || parsedHourlyRate <= 0) {
      toast.error("Please enter a valid hourly rate.");
      return;
    }

    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s.length > 0);

    try {
      if (isTasker) {
        await updateTaskerProfile({
          bio,
          skills: skillsArray,
          hourlyRate: parsedHourlyRate,
          location,
        });
      } else {
        await createTaskerProfile(bio, skillsArray, parsedHourlyRate, location);
      }
    } catch (error) {
      console.error("Error saving tasker profile:", error);
      toast.error("Failed to save tasker profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
      <main className="flex-1 container mx-auto p-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Your Profile</h1>

        {/* User Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Personal Information</CardTitle>
            <CardDescription>Your basic account details.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
              <AvatarFallback className="text-3xl bg-blue-200 text-blue-800 dark:bg-blue-700 dark:text-blue-200">
                {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">{user?.displayName || 'Anonymous User'}</p>
              <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tasker Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{isTasker ? 'Your Tasker Profile' : 'Become a Tasker'}</CardTitle>
            <CardDescription>
              {isTasker
                ? 'Manage your public tasker profile details.'
                : 'Create a tasker profile to start making offers on tasks.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your services..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Cleaning, Delivery, Plumbing"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="hourlyRate">Hourly Rate (₱)</Label>
              <Input
                id="hourlyRate"
                type="number"
                placeholder="e.g., 350"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="location">Service Location</Label>
              <Input
                id="location"
                placeholder="e.g., Metro Manila, Cebu City"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateOrUpdateTaskerProfile} disabled={loading}>
              {loading ? 'Saving...' : (isTasker ? 'Update Tasker Profile' : 'Create Tasker Profile')}
            </Button>
          </CardContent>
        </Card>
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default ProfilePage;