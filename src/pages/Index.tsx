import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import { usePWA } from '@/hooks/use-pwa';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';
import PostTaskModal from '@/components/PostTaskModal';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    other: 'Other'
  };
  return names[category] || 'Task';
};

const Index = () => {
  const { isOnline, showInstallPrompt, installApp, closeInstallPrompt, showSplashScreen } = usePWA();
  const { user, isAuthenticated, loading: authLoading, signIn, signUp, logOut } = useAuth();
  const { tasks, loading: tasksLoading, error: tasksError, addTask } = useTasks();
  const navigate = useNavigate(); // Initialize useNavigate

  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showPostTaskModal, setShowPostTaskModal] = React.useState(false);

  const handleSignInClick = () => {
    setShowLoginModal(true);
  };

  const handleSignUpClick = () => {
    setShowSignupModal(true);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      setShowLoginModal(false);
    } catch (error) {
      // Error handled by useAuth and sonner toast
    }
  };

  const handleSignOut = async () => {
    await logOut();
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
      setShowLoginModal(true);
      return;
    }
    try {
      await addTask(newTaskData);
      setShowPostTaskModal(false);
    } catch (error) {
      // Error handled by useTasks and sonner toast
    }
  };

  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`); // Navigate to the new TaskDetailPage
  };

  if (authLoading || tasksLoading) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {showSplashScreen && <SplashScreen />}
      <OfflineIndicator isVisible={!isOnline} />

      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignInClick}
        onSignOut={handleSignOut}
        onSignUp={handleSignUpClick}
      />
      <HeroSection />
      <main className="container mx-auto p-4">
        <CategoriesSection />

        {/* Tasks Section */}
        <section id="tasks" className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-green-600">📋 Available Tasks Near You</h2>
            <Button onClick={() => setShowPostTaskModal(true)} className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
              <Plus size={20} /> Post a Task
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}
            {!tasksLoading && tasks.length === 0 && !tasksError ? (
              <p className="col-span-full text-center text-gray-500 italic py-8">No tasks found. Be the first to post one!</p>
            ) : (
              tasks.map((task) => (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {getCategoryName(task.category)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-gray-600 flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-2xl font-bold text-green-600 mb-4">₱{task.budget.toLocaleString()}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-medium">{task.posterName}</span>
                      </div>
                      <Button variant="outline" onClick={() => handleViewTaskDetails(task.id)} className="border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </section>

        <HowItWorksSection />
      </main>
      <AppFooter />
      <MadeWithDyad />
      <Toaster />

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

      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={installApp}
        onClose={closeInstallPrompt}
      />
    </div>
  );
};

export default Index;