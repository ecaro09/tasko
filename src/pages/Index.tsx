import React from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth'; // Import the new useAuth hook
import { useFirestoreData } from '@/hooks/use-firestore-data'; // Import the new useFirestoreData hook

const Index = () => {
  const { user, isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { tasks, notes, addTask, addNote, loading: firestoreLoading } = useFirestoreData(user);

  const loading = authLoading || firestoreLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />
      <main className="container mx-auto p-4">
        <TaskList
          tasks={tasks}
          onAddTask={addTask}
          isAuthenticated={isAuthenticated}
        />
        <NotesSection
          notes={notes}
          onAddNote={addNote}
          isAuthenticated={isAuthenticated}
        />
        <ImageGallery />
      </main>
      <footer className="text-center p-4 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 DYAD Full Duplicate</p>
      </footer>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default Index;