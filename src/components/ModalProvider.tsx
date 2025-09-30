import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PostTaskModal from './PostTaskModal';

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

  const { isAuthenticated } = useAuth();

  const openLoginModal = () => {
    closeAllModals(); // Ensure other modals are closed
    setIsLoginModalOpen(true);
  };
  const openSignupModal = () => {
    closeAllModals(); // Ensure other modals are closed
    setIsSignupModalOpen(true);
  };
  const openPostTaskModal = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      openLoginModal(); // Open login modal if not authenticated
      return;
    }
    closeAllModals(); // Ensure other modals are closed
    setIsPostTaskModalOpen(true);
  };
  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    setIsPostTaskModalOpen(false);
  };

  const value = {
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeAllModals} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeAllModals} />
      <PostTaskModal isOpen={isPostTaskModalOpen} onClose={closeAllModals} />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};