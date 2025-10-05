import React from 'react';
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import AppFooter from "@/components/AppFooter";
import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Plus, Star, Award, Gift, User as UserIcon, DollarSign } from 'lucide-react';
import SplashScreen from '@/components/SplashScreen';
import InstallPrompt from '@/components/InstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import BottomNavigation from '@/components/BottomNavigation';
import OnboardingWalkthrough from '@/components/OnboardingWalkthrough';
import TaskFiltersSection from '@/components/TaskFiltersSection';
import FeaturedTasksSection from '@/components/FeaturedTasksSection';
import AvailableTasksSection from '@/components/AvailableTasksSection';
import TopTaskersSection from '@/components/TopTaskersSection'; // New import
import GamificationSection from '@/components/GamificationSection'; // New import
import ReferralPromoSection from '@/components/ReferralPromoSection'; // New import
import { usePWA } from '@/hooks/use-pwa';
import { useAuth } from '@/hooks/use-auth';
import { useTasks } from '@/hooks/use-tasks';
import { useTaskerProfile } from '@/hooks/use-tasker-profile';
import { useNavigate } from 'react-router-dom';
import { useModal } from '@/components/ModalProvider';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from '@/components/ui/skeleton';

const Index = () => {
  const { isOnline, showInstallPrompt, installApp, closeInstallPrompt, showSplashScreen } = usePWA();
  const { isAuthenticated, loading: authLoading, logout } = useAuth();
  const { openPostTaskModal, openLoginModal } = useModal();
  const navigate = useNavigate();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const { allTaskerProfiles, loading: taskerProfilesLoading } = useTaskerProfile();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [minBudget, setMinBudget] = React.useState('');
  const [maxBudget, setMaxBudget] = React.useState('');
  const [filterLocation, setFilterLocation] = React.useState('');
  const [showOnboarding, setShowOnboarding] = React.useState(false);

  React.useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenWalkthrough) {
      setShowOnboarding(true);
    }
  }, []);

  const handleSignOut = async () => {
    await logout();
  };

  const handleSearchSubmit = () => {
    console.log("Searching for:", searchTerm, "in category:", selectedCategory, "min budget:", minBudget, "max budget:", maxBudget, "location:", filterLocation);
    // In a real app, this would trigger a backend search or more complex client-side filtering
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSearchTerm('');
  };

  const handleViewTaskDetails = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setMinBudget('');
    setMaxBudget('');
    setFilterLocation('');
  };

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

    if (minBudget) {
      const min = parseFloat(minBudget);
      if (!isNaN(min)) {
        currentFilteredTasks = currentFilteredTasks.filter(task => task.budget >= min);
      }
    }

    if (maxBudget) {
      const max = parseFloat(maxBudget);
      if (!isNaN(max)) {
        currentFilteredTasks = currentFilteredTasks.filter(task => task.budget <= max);
      }
    }

    if (filterLocation) {
      const lowerCaseFilterLocation = filterLocation.toLowerCase();
      currentFilteredTasks = currentFilteredTasks.filter(task =>
        task.location.toLowerCase().includes(lowerCaseFilterLocation)
      );
    }

    return currentFilteredTasks;
  }, [tasks, searchTerm, selectedCategory, minBudget, maxBudget, filterLocation]);

  const featuredTasks = React.useMemo(() => {
    return tasks.filter(task => task.status === 'open').slice(0, 5);
  }, [tasks]);

  const topTaskers = React.useMemo(() => {
    return allTaskerProfiles.slice(0, 3);
  }, [allTaskerProfiles]);


  return (
    <div className="min-h-screen bg-[hsl(var(--bg-light))] dark:bg-gray-900 text-[hsl(var(--text-dark))] dark:text-gray-100 pb-16 md:pb-0">
      <div className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-500",
        showSplashScreen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}>
        <SplashScreen />
      </div>

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

        <TaskFiltersSection
          minBudget={minBudget}
          setMinBudget={setMinBudget}
          maxBudget={maxBudget}
          setMaxBudget={setMaxBudget}
          filterLocation={filterLocation}
          setFilterLocation={setFilterLocation}
          onApplyFilters={handleSearchSubmit}
          onResetFilters={handleResetFilters}
        />

        <FeaturedTasksSection
          tasks={featuredTasks}
          loading={tasksLoading}
          onViewTaskDetails={handleViewTaskDetails}
        />

        <AvailableTasksSection
          tasks={filteredTasks}
          loading={tasksLoading}
          error={tasksError}
          onViewTaskDetails={handleViewTaskDetails}
        />

        <TopTaskersSection
          taskers={topTaskers}
          loading={taskerProfilesLoading}
        />

        <GamificationSection />

        <ReferralPromoSection />

        <HowItWorksSection />
      </main>
      <AppFooter />
      <MadeWithDyad />

      <InstallPrompt
        isVisible={showInstallPrompt}
        onInstall={installApp}
        onClose={closeInstallPrompt}
      />
      <BottomNavigation />

      {showOnboarding && <OnboardingWalkthrough onClose={() => setShowOnboarding(false)} />}
    </div>
  );
};

export default Index;