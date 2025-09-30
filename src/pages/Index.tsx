import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster, toast } from "sonner"; // Using sonner for toasts
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus } from 'lucide-react'; // Import Plus icon
import SplashScreen from '@/components/SplashScreen';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import { usePWA } from '@/hooks/use-pwa';
import LoginModal from '@/components/LoginModal';
import SignupModal from '@/components/SignupModal';
import PostTaskModal from '@/components/PostTaskModal';

// Placeholder for task data - will be replaced with Firebase later
const sampleTasks = [
  {
    id: "1",
    title: "Furniture Assembly Needed",
    category: "assembly",
    description: "Need help assembling IKEA bed and wardrobe. All parts are available.",
    location: "Quezon City, Metro Manila",
    budget: 800,
    posterName: "Maria Santos",
    posterAvatar: "https://randomuser.me/api/portraits/women/32.jpg",
    datePosted: "2023-06-15",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581093458791-8a6b5d174d6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "2",
    title: "Apartment Cleaning",
    category: "cleaning",
    description: "General cleaning for 2-bedroom apartment. Includes sweeping, mopping, and bathroom cleaning.",
    location: "Makati City, Metro Manila",
    budget: 1200,
    posterName: "Juan Dela Cruz",
    posterAvatar: "https://randomuser.me/api/portraits/men/54.jpg",
    datePosted: "2023-06-14",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
  {
    id: "3",
    title: "Help with Moving",
    category: "moving",
    description: "Need assistance moving furniture from 2nd floor to ground floor. No heavy lifting required.",
    location: "Mandaluyong City, Metro Manila",
    budget: 1500,
    posterName: "Ana Reyes",
    posterAvatar: "https://randomuser.me/api/portraits/women/65.jpg",
    datePosted: "2023-06-13",
    status: "open",
    imageUrl: "https://images.unsplash.com/photo-1541976590-713941681591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
  },
];

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting'
  };
  return names[category] || 'Task';
};

const Index = () => {
  const { isOnline, showInstallPrompt, installApp, closeInstallPrompt, showSplashScreen } = usePWA();

  // Placeholder state for UI, Firebase integration will come later
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [tasks, setTasks] = React.useState(sampleTasks); // Using sample tasks for now

  const [showLoginModal, setShowLoginModal] = React.useState(false);
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showPostTaskModal, setShowPostTaskModal] = React.useState(false);

  const handleSignIn = () => {
    setShowLoginModal(true);
  };

  const handleSignUp = () => { // Added handleSignUp function
    setShowSignupModal(true);
  };

  const handleLogin = (email: string, password: string) => {
    console.log("Attempting login with:", email, password);
    // Placeholder for Firebase auth logic
    setIsAuthenticated(true);
    setShowLoginModal(false);
    toast.success("Logged in successfully!");
  };

  const handleSignOut = () => {
    console.log("Sign Out clicked (Firebase auth not yet active)");
    // Placeholder for Firebase auth logic
    setIsAuthenticated(false);
    setTasks(sampleTasks); // Reset tasks on logout (or clear if user-specific)
    toast.info("Logged out.");
  };

  const handleSignup = (name: string, email: string, phone: string, password: string, userType: string) => {
    console.log("Attempting signup with:", name, email, phone, userType);
    // Placeholder for Firebase auth logic
    setIsAuthenticated(true);
    setShowSignupModal(false);
    toast.success("Account created successfully!");
  };

  const handlePostTask = (newTask: { title: string; category: string; description: string; location: string; budget: number }) => {
    if (!isAuthenticated) {
      toast.error("Please log in to post a task.");
      setShowPostTaskModal(false);
      setShowLoginModal(true);
      return;
    }
    console.log("Posting new task:", newTask);
    // Placeholder for Firebase task posting logic
    const newTaskId = String(tasks.length + 1);
    const taskWithDefaults = {
      ...newTask,
      id: newTaskId,
      posterName: "Current User", // Replace with actual user name from auth
      posterAvatar: "https://randomuser.me/api/portraits/lego/1.jpg", // Replace with actual user avatar
      datePosted: new Date().toISOString().split('T')[0],
      status: "open",
      imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80" // Default image
    };
    setTasks((prevTasks) => [taskWithDefaults, ...prevTasks]);
    setShowPostTaskModal(false);
    toast.success("Task posted successfully!");
  };

  const handleViewTaskDetails = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast.info(`Viewing details for: ${task.title}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {showSplashScreen && <SplashScreen />}
      <OfflineIndicator isVisible={!isOnline} />

      <Header
        isAuthenticated={isAuthenticated}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onSignUp={handleSignUp} // Pass handleSignUp to Header
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
            {tasks.length > 0 ? (
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
            ) : (
              <p className="col-span-full text-center text-gray-500 italic py-8">No tasks found. Try a different search or category.</p>
            )}
          </div>
        </section>

        <HowItWorksSection />
      </main>
      <AppFooter />
      <MadeWithDyad />
      <Toaster /> {/* Add Toaster for sonner notifications */}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onShowSignup={() => { setShowLoginModal(false); setShowSignupModal(true); }}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignup}
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