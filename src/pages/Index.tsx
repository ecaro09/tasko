import React from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner"; // Using sonner for toasts
import { useAuth } from '@/hooks/use-auth'; // Import useAuth
import { useTasks } from '@/hooks/use-tasks'; // Import useTasks
import { toast } from 'sonner'; // Import toast for notifications

const Index = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser } = useAuth();
  const { tasks, addTask, loading: tasksLoading } = useTasks(); // Use tasks and addTask from useTasks hook

  // Placeholder state for notes
  const [notes, setNotes] = React.useState<string[]>([]);

  // This function will be called by TaskList when a user tries to add a task
  const handleAddTaskFromInput = async (title: string) => {
    if (!isAuthenticated) {
      toast.error("You must be logged in to post a task.");
      return;
    }
    if (!title.trim()) {
      toast.error("Task title cannot be empty.");
      return;
    }
    try {
      // For now, we'll use placeholder values for other task properties
      // In a real scenario, you'd have a form to gather these details.
      await addTask(
        title,
        "A general description for " + title,
        "General", // Default category
        1000, // Default budget
        "Metro Manila", // Default location
        "https://via.placeholder.com/400x200?text=New+Task" // Default image
      );
    } catch (error) {
      console.error("Error adding task from input:", error);
      toast.error("Failed to add task. Please try again.");
    }
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
        onSignIn={signInWithGoogle} // Use actual signInWithGoogle from useAuth
        onSignOut={signOutUser}    // Use actual signOutUser from useAuth
      />
      <main className="container mx-auto p-4">
        <TaskList
          tasks={tasks} // Now correctly typed as Task[]
          onAddTask={handleAddTaskFromInput} // Use the new wrapper function
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
      <Toaster /> {/* Add Toaster for sonner notifications */}
    </div>
  );
};

export default Index;