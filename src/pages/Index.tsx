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
  const { isAuthenticated } = useAuth(); // Only need isAuthenticated for conditional rendering
  const {
    tasks,
    notes,
    addTask,
    addNote,
    deleteTask, // Destructure deleteTask
    deleteNote, // Destructure deleteNote
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
      <Header /> {/* Header now manages its own auth state */}
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
              tasks={tasks} // Pass full task objects
              onAddTask={handleAddTask}
              onDeleteTask={deleteTask} // Pass deleteTask function
              isAuthenticated={isAuthenticated}
            />
            <NotesSection
              notes={notes} // Pass full note objects
              onAddNote={handleAddNote}
              onDeleteNote={deleteNote} // Pass deleteNote function
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