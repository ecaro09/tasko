"use client";

import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useTaskerProfile, TaskerProfile } from '@/hooks/use-tasker-profile';
import TaskerCard from '@/components/TaskerCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const BrowseTaskersPage: React.FC = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { getAllTaskerProfiles, loading: taskerProfileHookLoading } = useTaskerProfile();
  const [allTaskers, setAllTaskers] = useState<TaskerProfile[]>([]);
  const [filteredTaskers, setFilteredTaskers] = useState<TaskerProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskers = async () => {
      setLoading(true);
      try {
        const taskers = await getAllTaskerProfiles();
        setAllTaskers(taskers);
        setFilteredTaskers(taskers);
      } catch (err: any) {
        setError(err.message || "Failed to load taskers.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskers();
  }, [getAllTaskerProfiles]);

  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const results = allTaskers.filter(tasker =>
      tasker.displayName.toLowerCase().includes(lowercasedSearchTerm) ||
      tasker.bio.toLowerCase().includes(lowercasedSearchTerm) ||
      tasker.location.toLowerCase().includes(lowercasedSearchTerm) ||
      tasker.skills.some(skill => skill.toLowerCase().includes(lowercasedSearchTerm))
    );
    setFilteredTaskers(results);
  }, [searchTerm, allTaskers]);

  if (loading || authLoading || taskerProfileHookLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading taskers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error loading taskers: {error}</p>
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
        <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-8">Browse Taskers</h1>

        <div className="relative mb-8 max-w-lg mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <Input
            type="text"
            placeholder="Search taskers by name, skill, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {filteredTaskers.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No taskers found matching your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaskers.map((tasker) => (
              <TaskerCard key={tasker.uid} tasker={tasker} />
            ))}
          </div>
        )}
      </main>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default BrowseTaskersPage;