import React, { useEffect, useState } from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
        // In a real app, you'd fetch user-specific tasks and notes here
        console.log("User signed in:", user.displayName || user.email);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
        setTasks([]); // Clear tasks on logout
        setNotes([]); // Clear notes on logout
        console.log("User signed out.");
      }
    });

    return () => unsubscribe();
  }, []);

  // Placeholder functions for now, actual Firebase logic will be added later
  const handleSignIn = () => {
    // This will be handled by the Header component's Google Sign-In
  };

  const handleSignOut = () => {
    // This will be handled by the Header component's Sign-Out
  };

  const handleAddTask = (task: string) => {
    // This will be replaced with Firebase firestore logic
    console.log("Add Task clicked (Firebase firestore not yet active):", task);
    setTasks((prev) => [...prev, task]);
  };

  const handleAddNote = (note: string) => {
    // This will be replaced with Firebase firestore logic
    console.log("Add Note clicked (Firebase firestore not yet active):", note);
    setNotes((prev) => [...prev, note]);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header
        isAuthenticated={isAuthenticated}
        userDisplayName={currentUser?.displayName || currentUser?.email || null}
        onSignIn={handleSignIn} // These are now mostly for triggering state updates in Index
        onSignOut={handleSignOut} // The actual auth logic is in Header
      />
      <main className="container mx-auto p-4">
        <TaskList
          tasks={tasks}
          onAddTask={handleAddTask}
          isAuthenticated={isAuthenticated}
        />
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
      <Toaster />
    </div>
  );
};

export default Index;