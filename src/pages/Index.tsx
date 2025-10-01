import React from 'react';
import Header from "@/components/Header";
import ImageGallery from "@/components/ImageGallery";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import TaskList from '@/components/TaskList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useModal } from '@/components/ModalProvider'; // Import useModal

const Index = () => {
  const { isAuthenticated, signInWithGoogle, signOutUser, loading: authLoading } = useAuth();
  const { loading: tasksLoading, error: tasksError } = useTasks();
  const { openCreateTaskModal } = useModal(); // Use the new hook

  const loading = authLoading || tasksLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex items-center justify-center">
        <p>Loading application...</p>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 pt-[80px]">
        <Header isAuthenticated={isAuthenticated} onSignIn={signInWithGoogle} onSignOut={signOutUser} />
        <main className="container mx-auto p-4 text-center text-red-500">
          <p>Error loading tasks: {tasksError}</p>
        </main>
        <MadeWithDyad />
        <Toaster />
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
      <main className="container mx-auto p-4 pt-8">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">Available Tasks</h2>
        
        {isAuthenticated && (
          <div className="flex justify-center mb-8">
            <Button onClick={openCreateTaskModal} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <PlusCircle size={20} /> Post a New Task
            </Button>
          </div>
        )}

        <TaskList />
        <ImageGallery />
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