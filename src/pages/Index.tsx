import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import BottomNavigation from '@/components/BottomNavigation';
import { usePWA, PWAPROVIDER_SPLASH_SCREEN_DELAY } from '@/hooks/use-pwa';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/components/ModalProvider';

const getCategoryName = (category: string) => {
  const names: { [key: string]: string } = {
    all: 'All Services',
    cleaning: 'Cleaning',
    moving: 'Moving',
    assembly: 'Assembly',
    repairs: 'Repairs',
    delivery: 'Delivery',
    mounting: 'Mounting',
    painting: 'Painting',
    marketing: 'Marketing', // Added marketing category
    other: 'Other'
  };
  return names[category] || 'Task';
};

const Index = () => {
  // All hooks must be called unconditionally at the top level
  const { isOnline, showInstallPrompt, installApp, closeInstallPrompt, showSplashScreen } = usePWA();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { openPostTaskModal, openLoginModal } = useModal();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks(); // This hook call must be here

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isSplashVisible, setIsSplashVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, PWAPROVIDER_SPLASH_SCREEN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  const handleSearchSubmit = () => {
    // Filtering is now handled by the local useMemo below
    console.log("Searching for:", searchTerm, "in category:", selectedCategory);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    // When category changes, clear search term to avoid conflicting filters
    setSearchTerm('');
  };

  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      navigate('/my-tasks');
    } else {
      openLoginModal();
    }
  };

  // Conditional rendering happens AFTER all hooks are called
  if (isSplashVisible) {
    return <SplashScreen />;
  }

  // Perform filtering locally in Index.tsx using React.useMemo for efficiency
  const filteredTasks = React.useMemo(() => {
    let currentFilteredTasks = tasks;

    if (selectedCategory && selectedCategory !== 'all') {
      currentFilteredTasks = currentFilteredTasks.filter(task => task.category === selectedCategory);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentFilteredTasks = currentFilteredTasks.filter(task =>
        task.title.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.description.toLowerCase().includes(lowerCaseSearchTerm) ||
        task.location.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentFilteredTasks;
  }, [tasks, searchTerm, selectedCategory]);


  return (
    <div className="min-h-screen bg-[hsl(var(--bg-light))] dark:bg-gray-900 text-[hsl(var(--text-dark))] dark:text-gray-100 pb-16 md:pb-0">
      <OfflineIndicator isVisible={!isOnline} />

      <Header
        isAuthenticated={isAuthenticated}
        onSignOut={handleSignOut}
      />
      <HeroSection
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
      />
      <main className="container mx-auto p-4 pt-[60px]">
        <CategoriesSection
          activeCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />

        {/* Tasks Section */}
        <section id="tasks" className="py-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-bold text-[hsl(var(--primary-color))]">📋 Available Tasks Near You</h2>
            <Button onClick={openPostTaskModal} className="bg-[hsl(var(--primary-color))] text-white hover:bg-[hsl(var(--primary-color))] flex items-center gap-2">
              <Plus size={20} /> Post a Task
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasksError && <p className="col-span-full text-center text-red-500 italic py-8">Error loading tasks: {tasksError}</p>}
            {tasksLoading && <p className="col-span-full text-center text-gray-500 italic py-8">Loading tasks...</p>}
            {!tasksLoading && (filteredTasks || []).length === 0 && !tasksError ? (
              <p className="col-span-full text-center text-gray-500 italic py-8">No tasks found. Be the first to post one!</p>
            ) : (
              (filteredTasks || []).map((task) => (
                <Card key={task.id} className="shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-[var(--border-radius)] overflow-hidden">
                  <div className="h-40 overflow-hidden relative">
                    <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-[hsl(var(--primary-color))] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {getCategoryName(task.category)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{task.title}</h3>
                    <p className="text-[hsl(var(--text-light))] flex items-center mb-2">
                      <MapPin size={16} className="mr-2" /> {task.location}
                    </p>
                    <p className="text-2xl font-bold text-[hsl(var(--primary-color))] mb-4">₱{task.budget.toLocaleString()}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={task.posterAvatar} alt={task.posterName} className="w-8 h-8 rounded-full object-cover border-2 border-[hsl(var(--border-color))]" />
                        <span className="font-medium">{task.posterName}</span>
                      </div>
                      <Button variant="outline" onClick={() => handleViewTaskDetails(task.id)} className="border-[hsl(var(--primary-color))] text-[hsl(var(--primary-color))] hover:bg-[hsl(var(--primary-color))] hover:text-white">
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

      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={installApp}
        onClose={closeInstallPrompt}
      />
      <BottomNavigation onProfileClick={handleProfileClick} />
    </div>
  );
};

export default Index;