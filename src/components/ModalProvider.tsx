import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTasks, Task } from '@/hooks/use-tasks'; // Import Task interface
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PostTaskModal from './PostTaskModal';
import TaskerRegistrationModal from './TaskerRegistrationModal';
import MakeOfferModal from './MakeOfferModal'; // Import new modal

interface ModalContextType {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openPostTaskModal: () => void;
  openTaskerRegistrationModal: () => void;
  openMakeOfferModal: (task: Task) => void; // New function
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const [isPostTaskModalOpen, setIsPostTaskModalOpen] = React.useState(false);
  const [isTaskerRegistrationModalOpen, setIsTaskerRegistrationModalOpen] = React.useState(false);
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = React.useState(false); // New state
  const [selectedTaskForOffer, setSelectedTaskForOffer] = React.useState<Task | null>(null); // State to hold the task for the offer modal

  const { isAuthenticated } = useAuth();

  const openLoginModal = () => {
    closeAllModals();
    setIsLoginModalOpen(true);
  };
  const openSignupModal = () => {
    closeAllModals();
    setIsSignupModalOpen(true);
  };
  const openPostTaskModal = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setIsPostTaskModalOpen(true);
  };

  const openTaskerRegistrationModal = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to register as a tasker.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setIsTaskerRegistrationModalOpen(true);
  };

  const openMakeOfferModal = (task: Task) => { // New function
    if (!isAuthenticated) {
      toast.error("Please log in to make an offer.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setSelectedTaskForOffer(task);
    setIsMakeOfferModalOpen(true);
  };

  const closeAllModals = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    setIsPostTaskModalOpen(false);
    setIsTaskerRegistrationModalOpen(false);
    setIsMakeOfferModalOpen(false); // Close new modal
    setSelectedTaskForOffer(null); // Clear selected task
  };

  const value = {
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
    openTaskerRegistrationModal,
    openMakeOfferModal, // Add to context value
    closeAllModals,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeAllModals} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeAllModals} />
      <PostTaskModal isOpen={isPostTaskModalOpen} onClose={closeAllModals} />
      <TaskerRegistrationModal isOpen={isTaskerRegistrationModalOpen} onClose={closeAllModals} />
      <MakeOfferModal isOpen={isMakeOfferModalOpen} onClose={closeAllModals} task={selectedTaskForOffer} /> {/* Render new modal */}
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