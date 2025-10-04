import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks/use-auth';
import { useTasks, Task } from '@/hooks/use-tasks';
import { toast } from 'sonner';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PostTaskModal from './PostTaskModal';
import TaskerRegistrationModal from './TaskerRegistrationModal';
import MakeOfferModal from './MakeOfferModal';
import EditTaskModal from './EditTaskModal';
import ReviewTaskModal from './ReviewTaskModal';

interface ModalContextType {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openPostTaskModal: () => void;
  openTaskerRegistrationModal: () => void;
  openMakeOfferModal: (task: Task) => void;
  openEditTaskModal: (task: Task) => void;
  openReviewTaskModal: (task: Task) => void;
  closeAllModals: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = React.useState(false);
  const [isPostTaskModalOpen, setIsPostTaskModalOpen] = React.useState(false);
  const [isTaskerRegistrationModalOpen, setIsTaskerRegistrationModalOpen] = React.useState(false);
  const [isMakeOfferModalOpen, setIsMakeOfferModalOpen] = React.useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = React.useState(false);
  const [isReviewTaskModalOpen, setIsReviewTaskModalOpen] = React.useState(false);

  const [selectedTaskForOffer, setSelectedTaskForOffer] = React.useState<Task | null>(null);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = React.useState<Task | null>(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = React.useState<Task | null>(null);

  const { isAuthenticated } = useAuth();

  const closeAllModals = useCallback(() => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(false);
    setIsPostTaskModalOpen(false);
    setIsTaskerRegistrationModalOpen(false);
    setIsMakeOfferModalOpen(false);
    setIsEditTaskModalOpen(false);
    setIsReviewTaskModalOpen(false);
    setSelectedTaskForOffer(null);
    setSelectedTaskForEdit(null);
    setSelectedTaskForReview(null);
  }, []);

  const openLoginModal = useCallback(() => {
    if (isAuthenticated) {
      toast.info("You are already logged in.");
      return;
    }
    closeAllModals();
    setIsLoginModalOpen(true);
  }, [isAuthenticated, closeAllModals]);

  const openSignupModal = useCallback(() => {
    if (isAuthenticated) {
      toast.info("You are already logged in.");
      return;
    }
    closeAllModals();
    setIsSignupModalOpen(true);
  }, [isAuthenticated, closeAllModals]);

  const openPostTaskModal = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setIsPostTaskModalOpen(true);
  }, [isAuthenticated, openLoginModal, closeAllModals]);

  const openTaskerRegistrationModal = useCallback(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to register as a tasker.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setIsTaskerRegistrationModalOpen(true);
  }, [isAuthenticated, openLoginModal, closeAllModals]);

  const openMakeOfferModal = useCallback((task: Task) => {
    if (!isAuthenticated) {
      toast.error("Please log in to make an offer.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setSelectedTaskForOffer(task);
    setIsMakeOfferModalOpen(true);
  }, [isAuthenticated, openLoginModal, closeAllModals]);

  const openEditTaskModal = useCallback((task: Task) => {
    if (!isAuthenticated) {
      toast.error("Please log in to edit a task.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setSelectedTaskForEdit(task);
    setIsEditTaskModalOpen(true);
  }, [isAuthenticated, openLoginModal, closeAllModals]);

  const openReviewTaskModal = useCallback((task: Task) => {
    if (!isAuthenticated) {
      toast.error("Please log in to review a task.");
      openLoginModal();
      return;
    }
    closeAllModals();
    setSelectedTaskForReview(task);
    setIsReviewTaskModalOpen(true);
  }, [isAuthenticated, openLoginModal, closeAllModals]);

  const value = React.useMemo(() => ({
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
    openTaskerRegistrationModal,
    openMakeOfferModal,
    openEditTaskModal,
    openReviewTaskModal,
    closeAllModals,
  }), [
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
    openTaskerRegistrationModal,
    openMakeOfferModal,
    openEditTaskModal,
    openReviewTaskModal,
    closeAllModals,
  ]);

  return (
    <ModalContext.Provider value={value}>
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeAllModals} onSwitchToSignup={openSignupModal} />
      <SignupModal isOpen={isSignupModalOpen} onClose={closeAllModals} onSwitchToLogin={openLoginModal} />
      <PostTaskModal isOpen={isPostTaskModalOpen} onClose={closeAllModals} />
      <TaskerRegistrationModal isOpen={isTaskerRegistrationModalOpen} onClose={closeAllModals} />
      <MakeOfferModal isOpen={isMakeOfferModalOpen} onClose={closeAllModals} task={selectedTaskForOffer} />
      <EditTaskModal isOpen={isEditTaskModalOpen} onClose={closeAllModals} task={selectedTaskForEdit} />
      <ReviewTaskModal isOpen={isReviewTaskModalOpen} onClose={closeAllModals} task={selectedTaskForReview} />
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