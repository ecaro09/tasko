import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth'; // Corrected import for useAuth
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';

interface ModalContextType {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openPostTaskModal: () => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isPostTaskModalOpen, setIsPostTaskModalOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskLocation, setTaskLocation] = useState('');
  const [taskBudget, setTaskBudget] = useState('');
  const [taskCategory, setTaskCategory] = useState('');

  const { signInWithGoogle, logout, isAuthenticated } = useAuth();
  const { addTask } = useTasks();

  const openLoginModal = () => setIsLoginModalOpen(true);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const openPostTaskModal = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      setIsLoginModalOpen(true);
      return;
    }
    setIsPostTaskModalOpen(true);
  };
  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    setIsPostTaskModalOpen(false);
    // Clear form states
    setEmail('');
    setPassword('');
    setTaskTitle('');
    setTaskDescription('');
    setTaskLocation('');
    setTaskBudget('');
    setTaskCategory('');
  };

  const handleLogin = async () => {
    // In a real app, you'd have email/password login here.
    // For now, we'll just use Google Sign-In.
    await signInWithGoogle();
    closeAllModals();
  };

  const handleSignup = async () => {
    // In a real app, you'd have email/password signup here.
    // For now, we'll just use Google Sign-In.
    await signInWithGoogle();
    closeAllModals();
  };

  const handlePostTask = async () => {
    if (!taskTitle || !taskDescription || !taskLocation || !taskBudget || !taskCategory) {
      toast.error("Please fill in all task details.");
      return;
    }
    try {
      await addTask({
        title: taskTitle,
        description: taskDescription,
        location: taskLocation,
        budget: parseFloat(taskBudget),
        category: taskCategory,
      });
      closeAllModals();
    } catch (error) {
      // Error handled by useTasks hook
    }
  };

  const value = {
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};