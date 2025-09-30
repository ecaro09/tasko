import React from 'react';
import Header from "@/components/Header";
import TaskList from "@/components/TaskList";
import NotesSection from "@/components/NotesSection";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useFirestoreData } from '@/hooks/use-firestore-data';

const Index = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { data: tasks, addItem: addTask, loading: tasksLoading } = useFirestoreData<{ id: string; text: string; createdAt: any; userId: string }>('tasks', user?.uid);
  const { data: notes, addItem: addNote, loading: notesLoading } = useFirestoreData<{ id: string; text: string; createdAt: any; userId: string }>('notes', user?.uid);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto p-4 flex-grow">
        <h2 className="text-3xl font-bold text-center mb-8">
          {isAuthenticated ? `Welcome, ${user?.displayName || user?.email}!` : "Sign in to get started"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TaskList
            tasks={tasks}
            onAddTask={addTask}
            isAuthenticated={isAuthenticated}
            loading={authLoading || tasksLoading}
          />
          <NotesSection
            notes={notes}
            onAddNote={addNote}
            isAuthenticated={isAuthenticated}
            loading={authLoading || notesLoading}
          />
          <ImageGallery />
        </div>
      </main>
      <footer className="text-center p-4 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 mt-8">
        <p>&copy; 2025 DYAD Full Duplicate</p>
      </footer>
      <MadeWithDyad />
      <Toaster />
    </div>
  );
};

export default Index;