import React from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner"; // Using sonner for toasts
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { useFirestoreData } from '@/hooks/use-firestore-data'; // Import useFirestoreData
import { Loader2 } from 'lucide-react'; // Import Loader2 for spinner

const Index = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser } = useAuth();
  const {
    tasks,
    notes,
    addTask,
    addNote,
    loadingTasks,
    loadingNotes,
    error,
  } = useFirestoreData();

  const handleAddTask = (task: string) => {
    addTask(task);
  };

  const handleAddNote = (note: string) => {
    addNote(note);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={signInWithGoogle}
        onSignOut={signOutUser}
      />
      <main className="container mx-auto p-4">
        {loadingTasks || loadingNotes ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading your data...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">
            <p>Error: {error}</p>
            <p>Please ensure your Firebase configuration is correct and you are signed in.</p>
          </div>
        ) : (
          <>
            <TaskList
              tasks={tasks.map(item => item.content)} // Pass only content for now
              onAddTask={handleAddTask}
              isAuthenticated={isAuthenticated}
            />
            <NotesSection
              notes={notes.map(item => item.content)} // Pass only content for now
              onAddNote={handleAddNote}
              isAuthenticated={isAuthenticated}
            />
          </>
        )}
        <ImageGallery />
      </main>
      <footer className="text-center p-4 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
        <p>&copy; 2025 DYAD Full Duplicate</p>
      </footer>
      <MadeWithDyad />
      <Toaster /> {/* Add Toaster for sonner notifications */}
    </div>
  );
};

export default Index;