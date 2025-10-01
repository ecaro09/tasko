import React from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner"; // Using sonner for toasts
import { useAuth } from '@/hooks/use-auth'; // Import useAuth

const Index = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser } = useAuth(); // Use useAuth hook

  // Placeholder state for NotesSection, Firebase integration will come later
  const [notes, setNotes] = React.useState<string[]>([]);

  const handleAddNote = (note: string) => {
    // This will be replaced with Firebase firestore logic
    console.log("Add Note clicked (Firebase firestore not yet active):", note);
    setNotes((prev) => [...prev, note]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={signInWithGoogle} // Use signInWithGoogle from useAuth
        onSignOut={signOutUser}   // Use signOutUser from useAuth
      />
      <main className="container mx-auto p-4">
        <TaskList /> {/* TaskList now manages its own data */}
        <NotesSection
          notes={notes}
          onAddNote={handleAddNote}
          isAuthenticated={isAuthenticated}
        />
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