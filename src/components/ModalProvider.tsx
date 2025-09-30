import React from 'react';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import PostTaskModal from './PostTaskModal';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { toast } from 'sonner';

interface ModalContextType {
  openLoginModal: () => void;
  openSignupModal: () => void;
  openPostTaskModal: () => void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, signIn, signUp } = useAuth();
  const { addTask } = useTasks();

  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showPostTaskModal, setShowPostTaskModal] = React.useState(false);

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowLoginModal(false);
    } catch (error) {
      // Error handled by useAuth and sonner toast
    }
  };

  const handleSignupSubmit = async (name: string, email: string, phone: string, password: string, userType: string) => {
    try {
      await signUp(email, password);
      // In a real app, you'd also save name, phone, userType to Firestore here
      console.log("User signed up:", { name, email, phone, userType });
      setShowSignupModal(false);
    } catch (error) {
      // Error handled by useAuth and sonner toast
    }
  };

  const handlePostTask = async (newTaskData: { title: string; category: string; description: string; location: string; budget: number }) => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      setShowPostTaskModal(false);
      setShowLoginModal(true); // Prompt login if not authenticated
      return;
    }
    try {
      await addTask(newTaskData);
      setShowPostTaskModal(false);
    } catch (error) {
      // Error handled by useTasks and sonner toast
    }
  };

  const openLoginModal = () => setShowLoginModal(true);
  const openSignupModal = () => setShowSignupModal(true);
  const openPostTaskModal = () => setShowPostTaskModal(true);

  const value = {
    openLoginModal,
    openSignupModal,
    openPostTaskModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLoginSubmit}
        onShowSignup={() => { setShowLoginModal(false); setShowSignupModal(true); }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignupSubmit}
        onShowLogin={() => { setShowSignupModal(false); setShowLoginModal(true); }}
      />
      <PostTaskModal
        isOpen={showPostTaskModal}
        onClose={() => setShowPostTaskModal(false)}
        onPostTask={handlePostTask}
      />
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = React.useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};